import MaintenanceRequest from '../models/maintenanceRequest.model.js';
import Equipment from '../models/equipment.model.js';
import mongoose from 'mongoose';

// @desc    Get all requests (Supports filtering)
// @route   GET /api/requests
// @access  Private
export const getRequests = async (req, res) => {
    const { status, equipment, type, assignedTechnician } = req.query;
    const query = {};

    if (status) query.status = status;
    if (equipment) query.equipment = equipment;
    if (type) query.type = type;
    if (assignedTechnician) query.assignedTechnician = assignedTechnician;

    // Technician visibility: assigned to them OR in their team
    if (req.user?.role === 'Technician') {
        const teamId = req.user.team;
        query.$or = [{ assignedTechnician: req.user._id }];
        if (teamId) query.$or.push({ assignedTeam: teamId });
    }

    const requests = await MaintenanceRequest.find(query)
        .populate('equipment', 'name serialNumber')
        .populate('assignedTeam', 'name')
        .populate('assignedTechnician', 'name avatar')
        .populate('requestedBy', 'name');
    
    res.json(requests);
};

// @desc    Get scheduled requests for calendar display
// @route   GET /api/requests/calendar/scheduled
// @access  Private
export const getScheduledRequests = async (req, res) => {
    const { start, end } = req.query;
    const query = { scheduledDate: { $ne: null } };

    // Optional date range filter
    if (start || end) {
        query.scheduledDate = {};
        if (start) query.scheduledDate.$gte = new Date(start);
        if (end) query.scheduledDate.$lte = new Date(end);
    }

    // Technician visibility: assigned to them OR in their team
    if (req.user?.role === 'Technician') {
        const teamId = req.user.team;
        query.$or = [{ assignedTechnician: req.user._id }];
        if (teamId) query.$or.push({ assignedTeam: teamId });
    }

    const requests = await MaintenanceRequest.find(query)
        .populate('equipment', 'name serialNumber')
        .populate('assignedTeam', 'name')
        .populate('assignedTechnician', 'name avatar')
        .populate('requestedBy', 'name');

    res.json(requests);
};

// @desc    Get single request
// @route   GET /api/requests/:id
// @access  Private
export const getRequestById = async (req, res) => {
    const request = await MaintenanceRequest.findById(req.params.id)
        .populate('equipment')
        .populate('assignedTeam')
        .populate('assignedTechnician')
        .populate('requestedBy')
        .populate('notes.user', 'name avatar');

    if (request) {
        res.json(request);
    } else {
        res.status(404);
        throw new Error('Request not found');
    }
};

// @desc    Create new request
// @route   POST /api/requests
// @access  Private
export const createRequest = async (req, res) => {
    const { subject, description, equipment, type, priority, scheduledDate } = req.body;

    // Auto-fill logic: Get Equipment to find Team
    const equipmentDoc = await Equipment.findById(equipment);
    if (!equipmentDoc) {
        res.status(404);
        throw new Error('Equipment not found');
    }

    // Prevent creating requests for scrapped equipment
    if (equipmentDoc.status === 'Scrapped' || equipmentDoc.isScrapped) {
        return res.status(400).json({ message: 'Cannot create request: equipment has been scrapped' });
    }

    const request = await MaintenanceRequest.create({
        subject,
        description,
        equipment,
        type,
        priority,
        scheduledDate,
        assignedTeam: equipmentDoc.maintenanceTeam, // Auto-assign team
        assignedTechnician: equipmentDoc.defaultTechnician, // Auto-assign default tech if valid
        requestedBy: req.user._id
    });

    res.status(201).json(request);
};

// @desc    Update request status or details
// @route   PUT /api/requests/:id
// @access  Private
export const updateRequest = async (req, res) => {
    const request = await MaintenanceRequest.findById(req.params.id);

    if (!request) {
        res.status(404);
        throw new Error('Request not found');
    }

    console.log(`[updateRequest] User role: ${req.user?.role}, Request ID: ${req.params.id}, New status: ${req.body.status}`);

    // Role-based restrictions
    if (req.user?.role === 'Technician') {
        const allowedFields = ['status', 'duration', 'assignedTechnician', 'scheduledDate'];
        const keys = Object.keys(req.body);
        // Technicians: self-assign only within same team
        if (req.body.assignedTechnician) {
            if (String(req.body.assignedTechnician) !== String(req.user._id)) {
                res.status(403);
                throw new Error('Technicians can only self-assign');
            }
            if (String(request.assignedTeam) !== String(req.user.team)) {
                res.status(403);
                throw new Error('Technician not in the assigned team');
            }
        }
        if (req.body.status) {
            const to = req.body.status;
            const from = request.status;
            const allowedMove = (from === 'New' && to === 'In Progress') || (from === 'In Progress' && to === 'Repaired');
            if (!allowedMove) {
                res.status(403);
                throw new Error('Invalid status transition for Technician');
            }
            // Duration required before marking as Repaired
            if (to === 'Repaired') {
                const duration = req.body.duration ?? request.duration;
                if (!duration || Number(duration) <= 0) {
                    res.status(400);
                    throw new Error('Duration must be provided before marking as Repaired');
                }
            }
        }
        // ensure only allowed fields are updated
        const sanitized = keys.reduce((acc, k) => {
            if (allowedFields.includes(k)) acc[k] = req.body[k];
            return acc;
        }, {});

        const updated = await MaintenanceRequest.findByIdAndUpdate(req.params.id, sanitized, { new: true, runValidators: true });
        return res.json(updated);
    }

    // Normalize 'Scrap' to 'Scrapped'
    if (req.body.status === 'Scrap') req.body.status = 'Scrapped';

    // Manager-only: handle scrap state changes
    if (req.body.status === 'Scrapped' && request.status !== 'Scrapped') {
        console.log(`[updateRequest] Scrap attempt - User role: ${req.user?.role}`);
        if (req.user?.role !== 'Manager' && req.user?.role !== 'Admin') {
            console.log(`[updateRequest] Scrap denied - only Manager/Admin can scrap, user is: ${req.user?.role}`);
            return res.status(403).json({ message: 'Only Managers and Admins can mark a request as Scrapped' });
        }
        
        try {
            const equipment = await Equipment.findById(request.equipment);
            if (!equipment) {
                return res.status(404).json({ message: 'Linked equipment not found' });
            }
            
            console.log(`[Scrap] Equipment found: ${equipment._id}, Current status: ${equipment.status}`);
            const scrapReason = req.body.scrapReason || (request.notes?.length ? request.notes[request.notes.length - 1].text : '') || `Scrapped via request ${request._id}`;
            
            console.log(`[Scrap] Updating equipment status to Scrapped...`);
            equipment.status = 'Scrapped';
            equipment.isScrapped = true;
            equipment.scrappedAt = new Date();
            equipment.scrapReason = scrapReason;
            equipment.scrappedBy = req.user._id;
            await equipment.save();

            console.log(`[Scrap] Updating request status to Scrapped...`);
            request.status = 'Scrapped';
            await request.save();

            return res.json(request);
        } catch (err) {
            return res.status(500).json({ message: 'Failed to scrap equipment', error: err?.message });
        }
    }

    // Handle UN-SCRAPPING or standard status changes
    if (request.status === 'Scrapped' && req.body.status && req.body.status !== 'Scrapped') {
        if (req.user?.role !== 'Manager') {
             return res.status(403).json({ message: 'Only Managers can un-scrap a request' });
        }
        // Un-scrap logic
        try {
            const equipment = await Equipment.findById(request.equipment);
             if (equipment) {
                equipment.status = 'Under Maintenance'; // Safest state when un-scrapping
                equipment.isScrapped = false;
                equipment.scrappedAt = null;
                equipment.scrapReason = null;
                equipment.scrappedBy = null;
                await equipment.save();
            }
            request.status = req.body.status;
            await request.save();
            return res.json(request);
        } catch(err) {
             return res.status(500).json({ message: 'Failed to un-scrap', error: err.message });
        }
    }

    if (req.body.status === 'Repaired' && request.status !== 'Repaired') {
        const equipment = await Equipment.findById(request.equipment);
        if (equipment) {
            equipment.status = 'Operational';
            await equipment.save();
        }
    }

    // Manager assignment: Allow assigning any technician, auto-update team if needed
    if (req.body.assignedTechnician) {
        const tech = await (await import('../models/user.model.js')).default.findById(req.body.assignedTechnician);
        if (!tech) {
            res.status(404);
            throw new Error('Technician not found');
        }
        
        // If tech is in a different team, update the request's team to match
        if (String(tech.team) !== String(request.assignedTeam)) {
            req.body.assignedTeam = tech.team;
        }

        // Sync to Equipment: Update the equipment's default/primary technician to the one currently assigned
        const equipment = await Equipment.findById(request.equipment);
        if (equipment) {
            equipment.defaultTechnician = req.body.assignedTechnician;
            await equipment.save();
        }

        // NOTIFICATION: Notify Technician of assignment
        if (String(req.body.assignedTechnician) !== String(request.assignedTechnician)) {
             const Notification = (await import('../models/notification.model.js')).default;
             await Notification.create({
                 recipient: req.body.assignedTechnician,
                 message: `You have been assigned a new request: ${request.subject}`,
                 type: 'Assignment',
                 relatedRequest: request._id
             });
        }
    }

    const updatedRequest = await MaintenanceRequest.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    // NOTIFICATION: Notify Manager of status update (by Technician)
    if (req.user.role === 'Technician' && req.body.status && req.body.status !== request.status) {
         // Find managers of the team
         const User = (await import('../models/user.model.js')).default;
         // Notify all managers (or specific team managers if strict)
         // For simplicity, notifying all Managers for now or those in same team logic can be added
         // Let's notify Admins and Managers
         const managers = await User.find({ role: { $in: ['Manager', 'Admin'] } });
         
         const Notification = (await import('../models/notification.model.js')).default;
         const notifications = managers.map(m => ({
             recipient: m._id,
             message: `Technician ${req.user.name} updated request "${request.subject}" to ${req.body.status}`,
             type: 'Update',
             relatedRequest: request._id
         }));
         
         if (notifications.length > 0) {
             await Notification.insertMany(notifications);
         }
    }

    res.json(updatedRequest);
};

// @desc    Hours worked per technician (Repaired requests)
// @route   GET /api/requests/analytics/hours
// @access  Private
export const getHoursWorkedByTechnician = async (req, res) => {
    const match = { status: 'Repaired' };
    if (req.user?.role === 'Technician') {
        match.assignedTechnician = req.user._id;
    }
    // Optional team filter for managers
    if (req.user?.role !== 'Technician' && req.query.team) {
        try { match.assignedTeam = new mongoose.Types.ObjectId(req.query.team); } catch {}
    }
    // Optional technician filter (manager)
    if (req.user?.role !== 'Technician' && req.query.technician) {
        try { match.assignedTechnician = new mongoose.Types.ObjectId(req.query.technician); } catch {}
    }
    // Optional date range filter based on completionDate
    if (req.query.start || req.query.end) {
        match.completionDate = {};
        if (req.query.start) match.completionDate.$gte = new Date(req.query.start);
        if (req.query.end) match.completionDate.$lte = new Date(req.query.end);
    }

    const results = await MaintenanceRequest.aggregate([
        { $match: match },
        { $group: { _id: '$assignedTechnician', hours: { $sum: { $ifNull: ['$duration', 0] } } } },
        { $match: { _id: { $ne: null } } },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: '$user' },
        { $project: { technicianId: '$_id', name: '$user.name', hours: 1 } }
    ]);

    res.json(results);
};

// @desc    Summary analytics: totals for repaired requests
// @route   GET /api/requests/analytics/summary
// @access  Private
export const getAnalyticsSummary = async (req, res) => {
    const match = { status: 'Repaired' };
    if (req.user?.role === 'Technician') {
        match.assignedTechnician = req.user._id;
    }
    if (req.user?.role !== 'Technician' && req.query.team) {
        try { match.assignedTeam = new mongoose.Types.ObjectId(req.query.team); } catch {}
    }
    if (req.user?.role !== 'Technician' && req.query.technician) {
        try { match.assignedTechnician = new mongoose.Types.ObjectId(req.query.technician); } catch {}
    }
    if (req.query.start || req.query.end) {
        match.completionDate = {};
        if (req.query.start) match.completionDate.$gte = new Date(req.query.start);
        if (req.query.end) match.completionDate.$lte = new Date(req.query.end);
    }

    const results = await MaintenanceRequest.aggregate([
        { $match: match },
        {
            $group: {
                _id: null,
                totalRequests: { $sum: 1 },
                totalHours: { $sum: { $ifNull: ['$duration', 0] } },
                avgHours: { $avg: { $ifNull: ['$duration', 0] } }
            }
        }
    ]);

    const summary = results[0] || { totalRequests: 0, totalHours: 0, avgHours: 0 };
    res.json(summary);
};

// @desc    Add note to request
// @route   POST /api/requests/:id/notes
// @access  Private
export const addNote = async (req, res) => {
    const request = await MaintenanceRequest.findById(req.params.id);

    if (request) {
        const note = {
            text: req.body.text,
            user: req.user._id
        };

        request.notes.push(note);
        await request.save();
        res.status(201).json(request.notes);
    } else {
        res.status(404);
        throw new Error('Request not found');
    }
};

// @desc    Delete request
// @route   DELETE /api/requests/:id
// @access  Private/Admin
export const deleteRequest = async (req, res) => {
    const request = await MaintenanceRequest.findById(req.params.id);

    if (request) {
        await request.deleteOne();
        res.json({ message: 'Request removed' });
    } else {
        res.status(404);
        throw new Error('Request not found');
    }
};
