// topbar/useNotificationCount.js
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import customFetch from '../../utils/axios';

export const useNotificationCount = () => {
    const [notificationCount, setNotificationCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchNotificationCount = async () => {
        try {
            const response = await customFetch.get('notifications/unread-count');
            if (response.data.success) {
                setNotificationCount(response.data.count);
            }
        } catch (error) {
            console.error('Error fetching notification count:', error);
            setNotificationCount(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotificationCount();
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchNotificationCount();
        }, [])
    );

    return { 
        notificationCount, 
        loading, 
        refreshNotificationCount: fetchNotificationCount 
    };
};