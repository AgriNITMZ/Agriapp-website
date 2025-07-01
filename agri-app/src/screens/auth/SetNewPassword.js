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

export default function ResetForgotPassword({ route, navigation }) {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleResetPassword = async () => {
        if (!newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill in both fields.');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
            return;
        }

        try {
            const response = await axios.post('http://172.16.1.240:4000/auth/reset-password', {
                email: route.params.email, // Assuming email is passed via route params
                newPassword,
                confirmPassword,
            });

            if (response.status === 200) {
                Alert.alert('Success', 'Your password has been reset.');
                navigation.navigate('LoginScreen'); // Redirect to login after successful reset
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
                <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    <Logo />
                    <Header>Reset Password</Header>
                    <Text style={styles.subtitle}>Enter your new password and confirm it below.</Text>

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
                        onPress={handleResetPassword}
                        style={styles.button}
                    >
                        Reset Password
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
