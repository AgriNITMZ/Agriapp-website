// backend/controller/Notification.js
const Notification = require('../models/Notification');
const { asyncHandler } = require('../utils/error');

// Helper function to create notification
exports.createNotification = async (userId, type, title, message, orderId = null, data = {}) => {
    try {
        const notification = await Notification.create({
            userId,
            type,
            title,
            message,
            orderId,
            data
        });
        console.log('✓ Notification created:', notification._id);
        return notification;
    } catch (error) {
        console.error('✗ Error creating notification:', error);
        return null;
    }
};

// GET all notifications for user
exports.getNotifications = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { unreadOnly } = req.query;

    const query = { userId };
    if (unreadOnly === 'true') {
        query.isRead = false;
    }

    const notifications = await Notification.find(query)
        .populate('orderId', 'totalAmount orderStatus paymentStatus items')
        .sort({ createdAt: -1 })
        .limit(50);

    res.status(200).json({
        success: true,
        notifications
    });
});

// GET unread notification count
exports.getUnreadCount = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const count = await Notification.countDocuments({
        userId,
        isRead: false
    });

    res.status(200).json({
        success: true,
        count
    });
});

// Mark notification as read
exports.markAsRead = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { isRead: true },
        { new: true }
    );

    if (!notification) {
        return res.status(404).json({
            success: false,
            message: 'Notification not found'
        });
    }

    res.status(200).json({
        success: true,
        notification
    });
});

// Mark all notifications as read
exports.markAllAsRead = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true }
    );

    res.status(200).json({
        success: true,
        message: 'All notifications marked as read'
    });
});

// Delete notification
exports.deleteNotification = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        userId
    });

    if (!notification) {
        return res.status(404).json({
            success: false,
            message: 'Notification not found'
        });
    }

    res.status(200).json({
        success: true,
        message: 'Notification deleted'
    });
});