import MaintenanceRequest from '../models/maintenanceRequest.model.js';

// @desc    Get user activity history
// @route   GET /api/users/:id/history
// @access  Private
export const getUserHistory = async (req, res) => {
    // If Admin/Manager, can see anyone's history. If User/Tech, can only see own.
    if (req.user.role !== 'Admin' && req.user.role !== 'Manager' && req.user._id.toString() !== req.params.id) {
        res.status(403);
        throw new Error('Not authorized to view this history');
    }

    const requests = await MaintenanceRequest.find({
        $or: [
            { requestedBy: req.params.id },
            { assignedTechnician: req.params.id }
        ]
    })
    .populate('equipment', 'name')
    .sort({ createdAt: -1 });

    res.json(requests);
};
