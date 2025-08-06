import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRefreshProviders } from '../../context/AppProviders'; // ✅ ADDED

const LogoutScreen = ({ navigation }) => {
    const { refreshAll } = useRefreshProviders(); // ✅ ADDED

    useEffect(() => {
        const logout = async () => {
            try {
                console.log('Starting logout process...');
                
                // Clear the token from AsyncStorage
                await AsyncStorage.removeItem('user');
                console.log('User data cleared from storage');
                
                // ✅ ADDED: Refresh providers after logout to clear cart/wishlist
                await refreshAll();
                console.log('Providers refreshed');
                
                // Redirect to StartScreen after logout
                navigation.navigate('StartScreen');
            } catch (error) {
                console.error("Error during logout:", error);
                // Still navigate even if there's an error
                navigation.navigate('StartScreen');
            }
        };

        logout();
    }, [navigation, refreshAll]); // ✅ ADDED refreshAll to dependencies

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#0000ff" />
        </View>
    );
};

export default LogoutScreen;