import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { removeUserFromLocalStorage } from '../../utils/localStorage';
import Toast from 'react-native-toast-message';

const LogoutScreen = ({ navigation }) => {
    const hasLoggedOut = useRef(false);

    useEffect(() => {
        const logout = async () => {
            if (hasLoggedOut.current) return;
            hasLoggedOut.current = true;

            try {
                console.log('Starting logout process...');
                
                // Clear all user data from storage
                await removeUserFromLocalStorage();
                
                console.log('User data cleared from storage');

                // Show logout success message
                Toast.show({
                    type: 'success',
                    text1: 'Logged Out',
                    text2: 'You have been successfully logged out.',
                });

                // Wait for App.js to detect the auth change and handle navigation
                // The checkAuthInterval in App.js will detect the logout and update the UI
                console.log('Waiting for App.js to handle navigation...');
                
            } catch (error) {
                console.error("Error during logout:", error);
                
                Toast.show({
                    type: 'error',
                    text1: 'Logout Error',
                    text2: 'There was an issue logging out. Please try again.',
                });
            }
        };

        logout();
    }, [navigation]);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={{ marginTop: 20, fontSize: 16, color: '#666' }}>Logging out...</Text>
        </View>
    );
};

export default LogoutScreen;
