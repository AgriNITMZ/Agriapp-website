import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import Toast from 'react-native-toast-message'

import Background from '../../components/auth/Background';
import Header from '../../components/auth/Header';
import TextInput from '../../components/auth/TextInput';
import BackButton from '../../components/auth/BackButton';
import Logo from '../../components/auth/Logo';
import customFetch from '../../utils/axios';
import { addUserToLocalStorage } from '../../utils/localStorage'

export default function VerifyEmailonRegister({ route, navigation }) {
    const { userData } = route.params;
    const [otp, setOtp] = useState('');
    const [isButtonEnabled, setIsButtonEnabled] = useState(false);
    const [resendTimer, setResendTimer] = useState(30);
    const resendTimerRef = useRef(null);

    // Enable button only when OTP length is 6
    useEffect(() => {
        setIsButtonEnabled(otp.length === 6);
    }, [otp]);

    // Countdown timer for OTP resend
    useEffect(() => {
        resendTimerRef.current = setInterval(() => {
            setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(resendTimerRef.current);
    }, []);

    // Handle OTP input change
    const handleOtpChange = (text) => {
        if (/^\d*$/.test(text) && text.length <= 6) {
            setOtp(text);
        }
    };

    // Handle OTP verification
    const handleContinue = async () => {
        if (otp.length !== 6) {
            Toast.show({ type: 'error', text1: 'Invalid OTP', text2: 'Please enter a 6-digit OTP.' });

            return;
        }
        try {
            userData.otp = otp;
            const response = await customFetch.post("auth/signup", userData);

            if (response.status === 200) {
                Toast.show({
                    type: 'success',
                    text1: 'Account Created Successfully!',
                    text2: 'Welcome to PreciAgri.',
                });

                const data = response?.data;
                const user = {
                    id: data.user?._id,
                    name: data.user?.Name,
                    email: data.user?.email,
                    accountType: data.user?.accountType,
                    token: data.token
                };

                await addUserToLocalStorage(user);
                navigation.replace('HomePage');
            }
        } catch (error) {
            Toast.show({ type: 'error', text1: error.response?.data?.message || 'Failed to verify OTP. Please try again.' });
        }
    };

    // Handle OTP resend
    const handleResend = async () => {
        try {
            await customFetch.post("/auth/sendotp", { email: userData.email });
            setOtp('');
            setResendTimer(30);
            Toast.show({ type: 'success', text1: 'OTP Resent', text2: 'A new OTP has been sent to your email.' });
        } catch (error) {
            Toast.show({ type: 'error', text1: err.response?.data?.message || 'Failed to resend OTP. Please try again.' });
        }
    };

    return (
        <Background>
            <BackButton goBack={navigation.goBack} />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    <Logo />
                    <Header>Verify Your Email</Header>
                    <Text style={styles.subtitle}>Enter the 6-digit code sent to your email.</Text>
                    <TextInput
                        label="Enter OTP"
                        value={otp}
                        onChangeText={handleOtpChange}
                        keyboardType="numeric"
                        maxLength={6}
                    />
                    <TouchableOpacity
                        style={[styles.button, isButtonEnabled ? styles.buttonEnabled : styles.buttonDisabled]}
                        onPress={handleContinue}
                        disabled={!isButtonEnabled}
                    >
                        <Text style={styles.buttonText}>Continue</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleResend} disabled={resendTimer > 0}>
                        <Text style={[styles.resendLink, resendTimer > 0 && styles.resendDisabled]}>
                            {resendTimer > 0 ? `Resend available in ${resendTimer}s` : 'Resend OTP'}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </Background>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        margin: 0,
        padding: 20,
        flexGrow: 1,
        alignItems: 'center',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        color: '#666',
        marginVertical: 10,
    },
    button: {
        height: 50,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        marginVertical: 20,
    },
    buttonText: {
        fontSize: 18,
        color: 'white',
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    buttonEnabled: {
        backgroundColor: 'green',
    },
    buttonDisabled: {
        backgroundColor: '#A9A9A9',
    },
    resendLink: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
        color: '#1E90FF',
    },
    resendDisabled: {
        color: '#A9A9A9',
    },
});
