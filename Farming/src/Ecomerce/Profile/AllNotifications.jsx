import React, { useState, useEffect } from 'react';
import ProfileLayout from './Profile';
import { 
    Bell, 
    Package, 
    CreditCard, 
    Gift, 
    Star, 
    AlertCircle, 
    Check, 
    Trash2,
    Filter,
    MoreVertical,
    Eye,
    EyeOff
} from 'lucide-react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const AllNotifications = () => {
    const user = useSelector((state) => state.profile.user);
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState('all'); // all, unread, read, orders, promotions, system
    const [loading, setLoading] = useState(false);

    // Mock data for demonstration
    useEffect(() => {
        setNotifications([
            {
                id: '1',
                type: 'order',
                title: 'Order Delivered Successfully',
                message: 'Your order #ORD123456 has been delivered successfully. Thank you for shopping with us!',
                timestamp: '2024-03-15T10:30:00Z',
                read: false,
                icon: <Package className="w-5 h-5" />,
                color: 'text-green-600',
                bgColor: 'bg-green-100',
                actionUrl: '/product/profile/orders'
            },
            {
                id: '2',
                type: 'promotion',
                title: 'Special Offer: 20% Off Seeds',
                message: 'Limited time offer! Get 20% off on all organic seeds. Use code SEEDS20 at checkout.',
                timestamp: '2024-03-14T15:45:00Z',
                read: true,
                icon: <Gift className="w-5 h-5" />,
                color: 'text-purple-600',
                bgColor: 'bg-purple-100',
                actionUrl: '/product'
            },
            {
                id: '3',
                type: 'payment',
                title: 'Payment Successful',
                message: 'Your payment of ₹1,250 for order #ORD123455 has been processed successfully.',
                timestamp: '2024-03-13T09:15:00Z',
                read: false,
                icon: <CreditCard className="w-5 h-5" />,
                color: 'text-blue-600',
                bgColor: 'bg-blue-100',
                actionUrl: '/product/profile/orders'
            },
            {
                id: '4',
                type: 'review',
                title: 'Review Request',
                message: 'How was your experience with Organic Tomato Seeds? Share your review to help other customers.',
                timestamp: '2024-03-12T14:20:00Z',
                read: true,
                icon: <Star className="w-5 h-5" />,
                color: 'text-yellow-600',
                bgColor: 'bg-yellow-100',
                actionUrl: '/product/profile/reviews'
            },
            {
                id: '5',
                type: 'system',
                title: 'Account Security Update',
                message: 'Your account password was successfully updated. If this wasn\'t you, please contact support immediately.',
                timestamp: '2024-03-11T11:00:00Z',
                read: false,
                icon: <AlertCircle className="w-5 h-5" />,
                color: 'text-red-600',
                bgColor: 'bg-red-100',
                actionUrl: '/product/profile/information'
            },
            {
                id: '6',
                type: 'order',
                title: 'Order Shipped',
                message: 'Great news! Your order #ORD123454 is on its way. Track your package for real-time updates.',
                timestamp: '2024-03-10T16:30:00Z',
                read: true,
                icon: <Package className="w-5 h-5" />,
                color: 'text-blue-600',
                bgColor: 'bg-blue-100',
                actionUrl: '/product/profile/orders'
            }
        ]);
    }, []);

    const filteredNotifications = notifications.filter(notification => {
        switch (filter) {
            case 'unread':
                return !notification.read;
            case 'read':
                return notification.read;
            case 'orders':
                return notification.type === 'order';
            case 'promotions':
                return notification.type === 'promotion';
            case 'system':
                return notification.type === 'system' || notification.type === 'payment';
            default:
                return true;
        }
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleMarkAsRead = (notificationId) => {
        setNotifications(prev => 
            prev.map(notification => 
                notification.id === notificationId 
                    ? { ...notification, read: true }
                    : notification
            )
        );
    };

    const handleMarkAsUnread = (notificationId) => {
        setNotifications(prev => 
            prev.map(notification => 
                notification.id === notificationId 
                    ? { ...notification, read: false }
                    : notification
            )
        );
    };

    const handleDeleteNotification = (notificationId) => {
        if (window.confirm('Are you sure you want to delete this notification?')) {
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            toast.success('Notification deleted');
        }
    };

    const handleMarkAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        toast.success('All notifications marked as read');
    };

    const handleClearAll = () => {
        if (window.confirm('Are you sure you want to clear all notifications?')) {
            setNotifications([]);
            toast.success('All notifications cleared');
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        
        if (diffInHours < 1) {
            return 'Just now';
        } else if (diffInHours < 24) {
            return `${diffInHours}h ago`;
        } else if (diffInHours < 48) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString();
        }
    };

    const filterOptions = [
        { key: 'all', label: 'All', count: notifications.length },
        { key: 'unread', label: 'Unread', count: unreadCount },
        { key: 'read', label: 'Read', count: notifications.length - unreadCount },
        { key: 'orders', label: 'Orders', count: notifications.filter(n => n.type === 'order').length },
        { key: 'promotions', label: 'Promotions', count: notifications.filter(n => n.type === 'promotion').length },
        { key: 'system', label: 'System', count: notifications.filter(n => n.type === 'system' || n.type === 'payment').length }
    ];

    return (
        <ProfileLayout>
            <div className="max-w-6xl mx-auto">
                {/* Header - Fixed spacing to prevent overlap */}
                <div className="mb-8 pt-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                All Notifications
                            </h1>
                            <p className="text-gray-600">
                                Stay updated with your orders, promotions, and account activities
                            </p>
                        </div>
                        
                        {/* Actions */}
                        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-sm text-mizoram-600 hover:text-mizoram-700 font-medium"
                                >
                                    Mark all as read
                                </button>
                            )}
                            <button
                                onClick={handleClearAll}
                                className="text-sm text-red-600 hover:text-red-700 font-medium"
                            >
                                Clear all
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <div className="text-2xl font-bold text-mizoram-600">{notifications.length}</div>
                        <div className="text-sm text-gray-600">Total</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <div className="text-2xl font-bold text-orange-600">{unreadCount}</div>
                        <div className="text-sm text-gray-600">Unread</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <div className="text-2xl font-bold text-green-600">
                            {notifications.filter(n => n.type === 'order').length}
                        </div>
                        <div className="text-sm text-gray-600">Orders</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <div className="text-2xl font-bold text-purple-600">
                            {notifications.filter(n => n.type === 'promotion').length}
                        </div>
                        <div className="text-sm text-gray-600">Promotions</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6">
                    <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                        <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <div className="flex space-x-2">
                            {filterOptions.map((option) => (
                                <button
                                    key={option.key}
                                    onClick={() => setFilter(option.key)}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                                        filter === option.key
                                            ? 'bg-mizoram-100 text-mizoram-700 border border-mizoram-300'
                                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    <span>{option.label}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                                        filter === option.key
                                            ? 'bg-mizoram-200 text-mizoram-800'
                                            : 'bg-gray-200 text-gray-600'
                                    }`}>
                                        {option.count}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Notifications List */}
                {filteredNotifications.length > 0 ? (
                    <div className="space-y-4">
                        {filteredNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`bg-white rounded-2xl shadow-lg border transition-all duration-200 hover:shadow-xl ${
                                    notification.read 
                                        ? 'border-gray-200' 
                                        : 'border-mizoram-200 bg-mizoram-50/30'
                                }`}
                            >
                                <div className="p-6">
                                    <div className="flex items-start space-x-4">
                                        {/* Icon */}
                                        <div className={`p-3 rounded-full ${notification.bgColor} ${notification.color} flex-shrink-0`}>
                                            {notification.icon}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        <h3 className={`font-semibold ${
                                                            notification.read ? 'text-gray-900' : 'text-gray-900'
                                                        }`}>
                                                            {notification.title}
                                                        </h3>
                                                        {!notification.read && (
                                                            <div className="w-2 h-2 bg-mizoram-500 rounded-full"></div>
                                                        )}
                                                    </div>
                                                    <p className={`text-sm leading-relaxed ${
                                                        notification.read ? 'text-gray-600' : 'text-gray-700'
                                                    }`}>
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center justify-between mt-3">
                                                        <span className="text-xs text-gray-500">
                                                            {formatTimestamp(notification.timestamp)}
                                                        </span>
                                                        <div className="flex items-center space-x-2">
                                                            <button
                                                                onClick={() => notification.read 
                                                                    ? handleMarkAsUnread(notification.id)
                                                                    : handleMarkAsRead(notification.id)
                                                                }
                                                                className="text-xs text-mizoram-600 hover:text-mizoram-700 font-medium"
                                                            >
                                                                {notification.read ? 'Mark as unread' : 'Mark as read'}
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteNotification(notification.id)}
                                                                className="text-xs text-red-600 hover:text-red-700 font-medium"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Actions Menu */}
                                                <div className="flex items-center space-x-2 ml-4">
                                                    {notification.actionUrl && (
                                                        <button
                                                            onClick={() => window.location.href = notification.actionUrl}
                                                            className="text-sm text-mizoram-600 hover:text-mizoram-700 font-medium px-3 py-1 rounded-lg hover:bg-mizoram-50 transition-colors duration-200"
                                                        >
                                                            View
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Bell className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {filter === 'all' ? 'No notifications' : `No ${filter} notifications`}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {filter === 'all' 
                                ? 'You\'re all caught up! New notifications will appear here.'
                                : `You don't have any ${filter} notifications at the moment.`
                            }
                        </p>
                        {filter !== 'all' && (
                            <button
                                onClick={() => setFilter('all')}
                                className="text-mizoram-600 hover:text-mizoram-700 font-medium"
                            >
                                View all notifications
                            </button>
                        )}
                    </div>
                )}

                {/* Help Section */}
                <div className="mt-8 bg-blue-50 rounded-2xl p-6 border border-blue-200">
                    <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-semibold text-blue-900 mb-1">Notification Settings</h3>
                            <p className="text-sm text-blue-700 mb-2">
                                Manage your notification preferences to stay informed about what matters most to you.
                            </p>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• Order updates: shipping, delivery, and status changes</li>
                                <li>• Promotions: special offers, discounts, and new products</li>
                                <li>• Account: security updates and profile changes</li>
                                <li>• Reviews: requests to review purchased products</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </ProfileLayout>
    );
};

export default AllNotifications;
