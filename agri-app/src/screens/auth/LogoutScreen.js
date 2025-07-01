import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LogoutScreen = ({ navigation }) => {
    useEffect(() => {
        const logout = async () => {
            try {
                // Clear the token from AsyncStorage
                await AsyncStorage.removeItem('user');
                // Redirect to StartScreen after logout
                navigation.navigate('StartScreen');  // `replace` to remove LogoutScreen from stack
            } catch (error) {
                console.error("Error clearing token:", error);
            }
        };

        logout();
    }, []);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#0000ff" />
        </View>
    );
};

export default LogoutScreen;
