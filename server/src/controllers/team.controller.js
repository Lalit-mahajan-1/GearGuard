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

// @desc    Get members of the logged-in technician's team(s)
// @route   GET /api/teams/mine/members
// @access  Private (Technician)
export const getMyTeamMembers = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authorized' });
    }
    if (req.user.role === 'Manager' || req.user.role === 'Admin') {
        // Managers/Admins can optionally pass team id to inspect, else return all members across teams
        const teamId = req.query.team;
        if (teamId) {
            const team = await MaintenanceTeam.findById(teamId).populate('members', 'name role avatar');
            if (!team) {
                return res.status(404).json({ message: 'Team not found' });
            }
            return res.json(team.members);
        }
        const teams = await MaintenanceTeam.find().populate('members', 'name role avatar');
        const allMembers = Array.from(new Set(teams.flatMap(t => t.members.map(m => m._id.toString()))))
            .map(id => teams.flatMap(t => t.members).find(m => m._id.toString() === id));
        return res.json(allMembers);
    }

    // Technician: return members of their assigned team(s)
    const teams = await MaintenanceTeam.find({ members: req.user._id }).populate('members', 'name role avatar');
    const members = teams.length ? teams[0].members : [];
    return res.json(members);
};
