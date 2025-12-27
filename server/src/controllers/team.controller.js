import MaintenanceTeam from '../models/maintenanceTeam.model.js';

// @desc    Get all teams
// @route   GET /api/teams
// @access  Private
export const getTeams = async (req, res) => {
    const teams = await MaintenanceTeam.find().populate('members', 'name email avatar');
    res.json(teams);
};

// @desc    Create team
// @route   POST /api/teams
// @access  Private/Admin/Manager
export const createTeam = async (req, res) => {
    const team = await MaintenanceTeam.create(req.body);
    res.status(201).json(team);
};

// @desc    Update team
// @route   PUT /api/teams/:id
// @access  Private/Admin/Manager
export const updateTeam = async (req, res) => {
    const team = await MaintenanceTeam.findById(req.params.id);

    if (team) {
        const updatedTeam = await MaintenanceTeam.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        res.json(updatedTeam);
    } else {
        res.status(404);
        throw new Error('Team not found');
    }
};

// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Private/Admin
export const deleteTeam = async (req, res) => {
    const team = await MaintenanceTeam.findById(req.params.id);

    if (team) {
        await team.deleteOne();
        res.json({ message: 'Team removed' });
    } else {
        res.status(404);
        throw new Error('Team not found');
    }
};
