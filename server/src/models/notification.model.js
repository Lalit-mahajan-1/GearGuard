import mongoose from 'mongoose';

const notificationSchema = mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Assignment', 'Update', 'Alert'],
        default: 'Update'
    },
    relatedRequest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MaintenanceRequest'
    },
    read: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
