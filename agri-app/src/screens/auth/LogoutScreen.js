import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { CommonActions } from '@react-navigation/native';
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

                // Small delay to ensure storage is cleared
                await new Promise(resolve => setTimeout(resolve, 300));

                // Reset navigation to StartScreen - this will trigger App.js to re-evaluate auth
                navigation.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [{ name: 'StartScreen' }],
                    })
                );
                
                console.log('Navigation reset to StartScreen');
            } catch (error) {
                console.error("Error during logout:", error);
                
                Toast.show({
                    type: 'error',
                    text1: 'Logout Error',
                    text2: 'There was an issue logging out. Redirecting...',
                });

                // Force navigation even if there's an error
                try {
                    await new Promise(resolve => setTimeout(resolve, 500));
                    navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [{ name: 'StartScreen' }],
                        })
                    );
                } catch (navError) {
                    console.error("Navigation error:", navError);
                }
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
