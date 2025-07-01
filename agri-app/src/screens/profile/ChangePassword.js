import React, { useState } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import Background from '../../components/auth/Background';
import Header from '../../components/auth/Header';
import TextInput from '../../components/auth/TextInput';
import Button from '../../components/auth/Button';
import BackButton from '../../components/auth/BackButton';
import Logo from '../../components/auth/Logo';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ChangePassword({ route, navigation }) {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match.');
            return;
        }

        try {
            // Fetch token from AsyncStorage
            const token = await AsyncStorage.getItem('token');

            // Make the API request
            const response = await axios.post(
                'http://172.16.1.240:4000/api/users/change-password',
                {
                    oldPassword,
                    newPassword,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.status === 200) {
                Alert.alert('Success', 'Your password has been changed successfully.');

                // Decide whether to log out or keep logged in
                // KEEP LOGGED IN (Default Behavior):
                navigation.goBack();

                // LOG OUT (Optional - uncomment this to log out the user):
                // await AsyncStorage.removeItem('token');
                // navigation.reset({
                //     index: 0,
                //     routes: [{ name: 'LoginScreen' }],
                // });
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', error.response?.data?.message || 'Something went wrong.');
        }
    };

    return (
        <Background>
            <BackButton goBack={navigation.goBack} />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Logo />
                    <Header>Change Password</Header>
                    <Text style={styles.subtitle}>
                        Enter your current password and set a new one.
                    </Text>

                    <TextInput
                        label="Current Password"
                        secureTextEntry
                        value={oldPassword}
                        onChangeText={setOldPassword}
                    />

                    <TextInput
                        label="New Password"
                        secureTextEntry
                        value={newPassword}
                        onChangeText={setNewPassword}
                    />

                    <TextInput
                        label="Confirm New Password"
                        secureTextEntry
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />

                    <Button
                        mode="contained"
                        onPress={handleChangePassword}
                        style={styles.button}
                    >
                        Change Password
                    </Button>
                </ScrollView>
            </KeyboardAvoidingView>
        </Background>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        margin: 0,
        padding: 10,
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'space-evenly',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        color: '#666',
        marginBottom: 20,
    },
    button: {
        marginTop: 24,
    },
});