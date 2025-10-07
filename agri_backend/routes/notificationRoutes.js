const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
    createNotification,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications
} = require('../controller/NotificationController');

// Create notification (admin/system use)
router.post('/create', createNotification);

// Get user notifications
router.get('/user', auth, getUserNotifications);

// Mark notification as read
router.patch('/:notificationId/read', auth, markAsRead);

// Mark all notifications as read
router.patch('/mark-all-read', auth, markAllAsRead);

// Delete notification
router.delete('/:notificationId', auth, deleteNotification);

// Clear all notifications
router.delete('/clear-all', auth, clearAllNotifications);

module.exports = router;