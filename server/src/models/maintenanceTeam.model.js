import mongoose from 'mongoose';

const maintenanceTeamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a team name'],
        unique: true
    },
    description: {
        type: String
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    specialization: {
        type: String, // e.g., 'Mechanical', 'Electrical', 'IT'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const MaintenanceTeam = mongoose.model('MaintenanceTeam', maintenanceTeamSchema);
export default MaintenanceTeam;
