import Notification from '../models/notification.model.js';

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
    const notifications = await Notification.find({ recipient: req.user._id })
        .sort({ createdAt: -1 })
        .limit(20);
    res.json(notifications);
};

// @desc    Mark notifications as read
// @route   PUT /api/notifications/read
// @access  Private
export const markNotificationsRead = async (req, res) => {
    const { ids } = req.body;
    
    if (ids && ids.length > 0) {
        await Notification.updateMany(
            { _id: { $in: ids }, recipient: req.user._id },
            { $set: { read: true } }
        );
    } else {
        // Mark all as read
        await Notification.updateMany(
            { recipient: req.user._id, read: false },
            { $set: { read: true } }
        );
    }
    
    res.json({ message: 'Notifications marked as read' });
};
