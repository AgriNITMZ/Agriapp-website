// topbar/useNotificationCount.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { AppState } from 'react-native';
import customFetch from '../../utils/axios';

export const useNotificationCount = () => {
    const [notificationCount, setNotificationCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const appState = useRef(AppState.currentState);
    const intervalRef = useRef(null);

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

    // Initial fetch
    useEffect(() => {
        fetchNotificationCount();
    }, []);

    // Refresh when screen is focused
    useFocusEffect(
        useCallback(() => {
            fetchNotificationCount();
        }, [])
    );

    // Poll for new notifications every 30 seconds when app is active
    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === 'active'
            ) {
                // App came to foreground, refresh immediately
                fetchNotificationCount();
            }
            appState.current = nextAppState;
        });

        // Start polling every 30 seconds for faster updates
        intervalRef.current = setInterval(() => {
            if (AppState.currentState === 'active') {
                fetchNotificationCount();
            }
        }, 60000); // 60 seconds

        return () => {
            subscription?.remove();
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    return { 
        notificationCount, 
        loading, 
        refreshNotificationCount: fetchNotificationCount 
    };
};