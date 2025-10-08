// routes/notification.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const notificationController = require('../controller/Notification');

// Get all notifications for logged-in user
router.get('/', auth, notificationController.getNotifications);

// Get unread count
router.get('/unread-count', auth, notificationController.getUnreadCount);

// Mark notification as read
router.patch('/:notificationId/read', auth, notificationController.markAsRead);

// Mark all as read
router.patch('/mark-all-read', auth, notificationController.markAllAsRead);

// Delete notification
router.delete('/:notificationId', auth, notificationController.deleteNotification);

// Clear all notifications
router.delete('/clear-all', auth, notificationController.clearAllNotifications);

module.exports = router;