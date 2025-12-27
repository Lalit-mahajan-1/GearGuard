import mongoose from 'mongoose';

const maintenanceRequestSchema = new mongoose.Schema({
    requestNumber: {
        type: String,
        unique: true
    },
    subject: {
        type: String,
        required: [true, 'Please add a subject']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    equipment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Equipment',
        required: true
    },
    type: {
        type: String,
        enum: ['Corrective', 'Preventive'],
        default: 'Corrective'
    },
    priority: {
        type: String,
        enum: ['Low', 'Normal', 'High', 'Critical'],
        default: 'Normal'
    },
    status: {
        type: String,
        enum: ['New', 'In Progress', 'Repaired', 'Scrapped', 'Cancelled'],
        default: 'New'
    },
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedTeam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MaintenanceTeam',
        required: true
    },
    assignedTechnician: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    scheduledDate: {
        type: Date
    },
    startDate: {
        type: Date
    },
    completionDate: {
        type: Date
    },
    duration: {
        type: Number, // In hours
        default: 0
    },
    notes: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: String,
        date: { type: Date, default: Date.now }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Pre-save hook to generate request number
maintenanceRequestSchema.pre('save', async function() {
    if (!this.requestNumber) {
        const count = await this.constructor.countDocuments();
        this.requestNumber = `REQ-${(count + 1).toString().padStart(5, '0')}`;
    }
});

const MaintenanceRequest = mongoose.model('MaintenanceRequest', maintenanceRequestSchema);
export default MaintenanceRequest;
