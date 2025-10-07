const Notification = require('../models/Notification');
const User = require('../models/Users');
const { asyncHandler } = require('../utils/error');

// Create a new notification
exports.createNotification = asyncHandler(async (req, res) => {
    try {
        const { userId, type, title, message, orderId, actionUrl, metadata } = req.body;

        // Validate user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const notification = await Notification.create({
            userId,
            type,
            title,
            message,
            orderId,
            actionUrl,
            metadata
        });

        res.status(201).json({
            success: true,
            message: "Notification created successfully",
            notification
        });

    } catch (error) {
        console.error("Error creating notification:", error);
        res.status(500).json({
            success: false,
            message: "Error creating notification"
        });
    }
});

// Get all notifications for a user
exports.getUserNotifications = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20, type, read } = req.query;

        // Build filter
        const filter = { userId };
        if (type) filter.type = type;
        if (read !== undefined) filter.read = read === 'true';

        const notifications = await Notification.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('orderId', 'orderNumber status');

        const total = await Notification.countDocuments(filter);
        const unreadCount = await Notification.countDocuments({ userId, read: false });

        res.status(200).json({
            success: true,
            notifications,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalNotifications: total,
                unreadCount
            }
        });

    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching notifications"
        });
    }
});

// Mark notification as read
exports.markAsRead = asyncHandler(async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user.id;

        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, userId },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Notification marked as read",
            notification
        });

    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({
            success: false,
            message: "Error updating notification"
        });
    }
});

// Mark all notifications as read
exports.markAllAsRead = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;

        await Notification.updateMany(
            { userId, read: false },
            { read: true }
        );

        res.status(200).json({
            success: true,
            message: "All notifications marked as read"
        });

    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        res.status(500).json({
            success: false,
            message: "Error updating notifications"
        });
    }
});

// Delete notification
exports.deleteNotification = asyncHandler(async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user.id;

        const notification = await Notification.findOneAndDelete({
            _id: notificationId,
            userId
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Notification deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting notification:", error);
        res.status(500).json({
            success: false,
            message: "Error deleting notification"
        });
    }
});

// Clear all notifications for user
exports.clearAllNotifications = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;

        await Notification.deleteMany({ userId });

        res.status(200).json({
            success: true,
            message: "All notifications cleared successfully"
        });

    } catch (error) {
        console.error("Error clearing notifications:", error);
        res.status(500).json({
            success: false,
            message: "Error clearing notifications"
        });
    }
});

// Helper function to create payment notification
exports.createPaymentNotification = async (userId, orderId, amount) => {
    try {
        await Notification.create({
            userId,
            type: 'payment',
            title: 'Payment Successful',
            message: `Your payment of ₹${amount} has been processed successfully.`,
            orderId,
            actionUrl: '/product/profile/orders'
        });
    } catch (error) {
        console.error("Error creating payment notification:", error);
    }
};

// Helper function to create delivery notification
exports.createDeliveryNotification = async (userId, orderId, orderNumber) => {
    try {
        await Notification.create({
            userId,
            type: 'delivery',
            title: 'Order Delivered Successfully',
            message: `Your order #${orderNumber} has been delivered successfully. Thank you for shopping with us!`,
            orderId,
            actionUrl: '/product/profile/orders'
        });
    } catch (error) {
        console.error("Error creating delivery notification:", error);
    }
};

// Helper function to create order status notification
exports.createOrderStatusNotification = async (userId, orderId, orderNumber, status) => {
    try {
        let title, message;
        
        switch (status) {
            case 'confirmed':
                title = 'Order Confirmed';
                message = `Your order #${orderNumber} has been confirmed and is being processed.`;
                break;
            case 'shipped':
                title = 'Order Shipped';
                message = `Great news! Your order #${orderNumber} is on its way. Track your package for real-time updates.`;
                break;
            case 'delivered':
                title = 'Order Delivered';
                message = `Your order #${orderNumber} has been delivered successfully. Thank you for shopping with us!`;
                break;
            default:
                title = 'Order Update';
                message = `Your order #${orderNumber} status has been updated to ${status}.`;
        }

        await Notification.create({
            userId,
            type: 'order',
            title,
            message,
            orderId,
            actionUrl: '/product/profile/orders'
        });
    } catch (error) {
        console.error("Error creating order status notification:", error);
    }
};