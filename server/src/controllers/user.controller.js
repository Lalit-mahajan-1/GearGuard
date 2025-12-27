import User from '../models/user.model.js';
import MaintenanceTeam from '../models/maintenanceTeam.model.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
    const users = await User.find().select('-password').populate('team', 'name');
    res.json(users);
};

// @desc    Create a user (Admin only)
// @route   POST /api/users
// @access  Private/Admin
export const createUser = async (req, res) => {
    const { name, email, password, role, team } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({
        name,
        email,
        password,
        role,
        team
    });

    if (user) {
        // If assigned to a team, update team members
        if (team) {
             await MaintenanceTeam.findByIdAndUpdate(team, {
                 $addToSet: { members: user._id }
             });
        }

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            team: user.team
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        // If team changed, handle relationship
        if (req.body.team && req.body.team !== user.team?.toString()) {
            // Remove from old team
            if (user.team) {
                await MaintenanceTeam.findByIdAndUpdate(user.team, {
                    $pull: { members: user._id }
                });
            }
            // Add to new team
            await MaintenanceTeam.findByIdAndUpdate(req.body.team, {
                $addToSet: { members: user._id }
            });
        }

        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.role = req.body.role || user.role;
        user.team = req.body.team || user.team;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            team: updatedUser.team
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        await user.deleteOne();
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};
