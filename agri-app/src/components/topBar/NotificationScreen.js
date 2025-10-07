// frontend/screens/NotificationScreen.js
import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import customFetch from '../../utils/axios';
import CustomTopBar from './CustomTopBar';
import { useFocusEffect } from '@react-navigation/native';
// import MyOrderPage from '../screens/Orders/MyOrdersPage';

const NotificationScreen = ({ navigation }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifications = async () => {
        try {
            const response = await customFetch.get('notifications');
            if (response.data.success) {
                setNotifications(response.data.notifications);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchNotifications();
            markAllAsRead();
        }, [])
    );

    const markAllAsRead = async () => {
        try {
            await customFetch.patch('notifications/mark-all-read');
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
    };

    const handleNotificationPress = async (notification) => {
        try {
            if (!notification.isRead) {
                await customFetch.patch(`notifications/${notification._id}/read`);
            }

            if (notification.orderId) {
                navigation.navigate('MyOrders');
            }
        } catch (error) {
            console.error('Error handling notification press:', error);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            await customFetch.delete(`notifications/${notificationId}`);
            setNotifications(prev => prev.filter(n => n._id !== notificationId));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'order_placed':
            case 'order_confirmed':
                return { name: 'checkmark-circle', color: '#4CAF50' };
            case 'order_shipped':
                return { name: 'airplane', color: '#2196F3' };
            case 'order_delivered':
                return { name: 'gift', color: '#4CAF50' };
            case 'order_cancelled':
                return { name: 'close-circle', color: '#f44336' };
            case 'payment_success':
                return { name: 'card', color: '#4CAF50' };
            case 'payment_failed':
                return { name: 'warning', color: '#f44336' };
            default:
                return { name: 'notifications', color: '#666' };
        }
    };

    const formatTime = (date) => {
        const now = new Date();
        const notifDate = new Date(date);
        const diffMs = now - notifDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return notifDate.toLocaleDateString();
    };

    const renderNotification = ({ item }) => {
        const icon = getNotificationIcon(item.type);

        return (
            <TouchableOpacity
                style={[
                    styles.notificationCard,
                    !item.isRead && styles.unreadNotification
                ]}
                onPress={() => handleNotificationPress(item)}
            >
                <View style={styles.iconContainer}>
                    <Ionicons name={icon.name} size={32} color={icon.color} />
                </View>

                <View style={styles.contentContainer}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.message}>{item.message}</Text>
                    <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
                </View>

                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteNotification(item._id)}
                >
                    <Ionicons name="trash-outline" size={20} color="#999" />
                </TouchableOpacity>

                {!item.isRead && <View style={styles.unreadDot} />}
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <CustomTopBar navigation={navigation} title="Notifications" />
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#4CAF50" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <CustomTopBar navigation={navigation} title="Notifications" />
            <View style={styles.container}>
                {notifications.length === 0 ? (
                    <View style={styles.centerContainer}>
                        <Ionicons name="notifications-off-outline" size={80} color="#ccc" />
                        <Text style={styles.emptyText}>No notifications yet</Text>
                        <Text style={styles.emptySubText}>
                            You'll see updates about your orders here
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={notifications}
                        renderItem={renderNotification}
                        keyExtractor={(item) => item._id}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={['#4CAF50']}
                            />
                        }
                        contentContainerStyle={styles.listContainer}
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    container: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    listContainer: {
        padding: 10,
    },
    notificationCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    unreadNotification: {
        backgroundColor: '#E8F5E9',
        borderLeftWidth: 4,
        borderLeftColor: '#4CAF50',
    },
    iconContainer: {
        marginRight: 12,
    },
    contentContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    message: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
        lineHeight: 20,
    },
    time: {
        fontSize: 12,
        color: '#999',
    },
    deleteButton: {
        padding: 8,
        marginLeft: 8,
    },
    unreadDot: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4CAF50',
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#999',
        marginTop: 16,
    },
    emptySubText: {
        fontSize: 14,
        color: '#bbb',
        marginTop: 8,
        textAlign: 'center',
    },
});

export default NotificationScreen;