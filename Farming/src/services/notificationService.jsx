import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Get token from localStorage
const getToken = () => {
    const storedTokenData = JSON.parse(localStorage.getItem("token"));
    if (storedTokenData && Date.now() < storedTokenData.expires) {
        return storedTokenData.value;
    }
    localStorage.removeItem("token");
    return null;
};

// Create axios instance with auth header
const createAuthHeaders = () => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const notificationService = {
    // Get all notifications for user
    getUserNotifications: async (params = {}) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/notifications/user`, {
                headers: createAuthHeaders(),
                params
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    },

    // Mark notification as read
    markAsRead: async (notificationId) => {
        try {
            const response = await axios.patch(
                `${API_BASE_URL}/notifications/${notificationId}/read`,
                {},
                { headers: createAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    },

    // Mark all notifications as read
    markAllAsRead: async () => {
        try {
            const response = await axios.patch(
                `${API_BASE_URL}/notifications/mark-all-read`,
                {},
                { headers: createAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    },

    // Delete notification
    deleteNotification: async (notificationId) => {
        try {
            const response = await axios.delete(
                `${API_BASE_URL}/notifications/${notificationId}`,
                { headers: createAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    },

    // Clear all notifications
    clearAllNotifications: async () => {
        try {
            const response = await axios.delete(
                `${API_BASE_URL}/notifications/clear-all`,
                { headers: createAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Error clearing notifications:', error);
            throw error;
        }
    },

    // Create notification (for system use)
    createNotification: async (notificationData) => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/notifications/create`,
                notificationData,
                { headers: createAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }
};

// Helper functions for creating specific types of notifications
export const createPaymentNotification = async (userId, orderId, amount) => {
    return await notificationService.createNotification({
        userId,
        type: 'payment',
        title: 'Payment Received',
        message: `We have received your payment of ₹${amount}. Your order is being processed.`,
        orderId,
        actionUrl: '/product/profile/orders'
    });
};

export const createDeliveryNotification = async (userId, orderId, orderNumber) => {
    return await notificationService.createNotification({
        userId,
        type: 'delivery',
        title: 'Order Delivered Successfully',
        message: `Your order #${orderNumber} has been delivered successfully. Thank you for shopping with us!`,
        orderId,
        actionUrl: '/product/profile/orders'
    });
};

export const createOrderStatusNotification = async (userId, orderId, orderNumber, status) => {
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

    return await notificationService.createNotification({
        userId,
        type: 'order',
        title,
        message,
        orderId,
        actionUrl: '/product/profile/orders'
    });
};