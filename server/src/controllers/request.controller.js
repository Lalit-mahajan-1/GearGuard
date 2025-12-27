import MaintenanceRequest from '../models/maintenanceRequest.model.js';
import Equipment from '../models/equipment.model.js';

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

    // Enforce technician visibility: only their assigned requests
    if (req.user?.role === 'Technician') {
        query.assignedTechnician = req.user._id;
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

// @desc    Get scheduled maintenance requests for calendar view
// @route   GET /api/requests/calendar/scheduled
// @access  Private
export const getScheduledRequests = async (req, res) => {
    const { role, userId } = req.query;
    const query = { scheduledDate: { $exists: true, $ne: null } };

    // Filter based on user role
    if (role === 'Technician' && userId) {
        query.assignedTechnician = userId;
    }

    const requests = await MaintenanceRequest.find(query)
        .populate('equipment', 'name serialNumber')
        .populate('assignedTeam', 'name')
        .populate('assignedTechnician', 'name avatar')
        .populate('requestedBy', 'name')
        .sort({ scheduledDate: 1 });

    res.json(requests);
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

    // Role-based restrictions
    if (req.user?.role === 'Technician') {
        const allowedFields = ['status', 'duration'];
        const keys = Object.keys(req.body);
        // technicians cannot assign/reassign tech or scrap
        if (req.body.assignedTechnician) {
            res.status(403);
            throw new Error('Technicians cannot reassign requests');
        }
        if (req.body.status) {
            const to = req.body.status;
            const from = request.status;
            const allowedMove = (from === 'New' && to === 'In Progress') || (from === 'In Progress' && to === 'Repaired');
            if (!allowedMove) {
                res.status(403);
                throw new Error('Invalid status transition for Technician');
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

    // Manager/Admin logic: Equipment auto updates on status changes
    if (req.body.status === 'Scrapped' && request.status !== 'Scrapped') {
        const equipment = await Equipment.findById(request.equipment);
        if (equipment) {
            equipment.status = 'Scrapped';
            await equipment.save();
        }
    }
    if (req.body.status === 'Repaired' && request.status !== 'Repaired') {
        const equipment = await Equipment.findById(request.equipment);
        if (equipment) {
            equipment.status = 'Operational';
            await equipment.save();
        }
    }

    const updatedRequest = await MaintenanceRequest.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    res.json(updatedRequest);
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
