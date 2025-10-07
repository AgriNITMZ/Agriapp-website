import React, { useEffect, useRef } from 'react'; // ✅ useRef added
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRefreshProviders } from '../../context/AppProviders';

const LogoutScreen = ({ navigation }) => {
    const { refreshAll } = useRefreshProviders();

    const hasLoggedOut = useRef(false); // ✅ added to prevent loop

    useEffect(() => {
        const logout = async () => {
            if (hasLoggedOut.current) return; // ✅ prevent multiple executions
            hasLoggedOut.current = true; // ✅ set flag

            try {
                console.log('Starting logout process...');
                await AsyncStorage.removeItem('user');
                console.log('User data cleared from storage');

                await refreshAll();
                console.log('Providers refreshed');

                navigation.navigate('StartScreen');
            } catch (error) {
                console.error("Error during logout:", error);
                navigation.navigate('StartScreen');
            }
        };

        logout();
    }, [navigation, refreshAll]);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#0000ff" />
        </View>
    );
};

export default LogoutScreen;
