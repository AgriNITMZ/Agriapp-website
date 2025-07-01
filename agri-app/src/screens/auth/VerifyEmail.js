import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import axios from 'axios';
import Background from '../../components/auth/Background';
import Header from '../../components/auth/Header';
import TextInput from '../../components/auth/TextInput';
import BackButton from '../../components/auth/BackButton';
import Logo from '../../components/auth/Logo';
import { theme } from '../../core/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function VerifyEmailonForgotPassword({ route, navigation }) {
    const { email } = route.params;
    console.log(email);
    const [otp, setOtp] = useState('');
    const [isButtonEnabled, setIsButtonEnabled] = useState(false);
    const [resendTimer, setResendTimer] = useState(30);
    const resendTimerRef = useRef(null);

    useEffect(() => {
        setIsButtonEnabled(otp.length === 6);
    }, [otp]);

    useEffect(() => {
        resendTimerRef.current = setInterval(() => {
            setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(resendTimerRef.current);
    }, []);

    const handleOtpChange = (text) => {
        if (/^\d*$/.test(text) && text.length <= 6) {
            setOtp(text);
        }
    };

    const handleContinue = () => {
        if (otp.length === 6) {
            axios
                .post('http://172.16.1.240:4000/auth/verify-otp-forgot-password', { otp, email })
                .then((response) => {
                    if (response.status === 200) {
                        Alert.alert('OTP Verified Successfully');
                        navigation.replace('ResetForgotPassword', { email: email });
                    }
                })
                .catch((error) => {
                    Alert.alert('Error', error.message || 'Invalid OTP');
                });
        }
    };

    const handleResend = () => {
        console.log(email)
        axios
            .post('http://172.16.1.240:4000/auth/resend-otp-forgot-password', { email })
            .then(() => {
                setOtp('');
                setResendTimer(30);
                Alert.alert('OTP Resent', 'A new OTP has been sent to your email.');
            })
            .catch((error) => {
                Alert.alert('Error', error.response?.data?.message || error.message);
            });
    };

    return (
        <Background>
            <BackButton goBack={navigation.goBack} />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    <Logo />
                    <Header>Verify Your Email</Header>
                    <Text style={styles.subtitle}>Enter the 6-digit OTP sent to your email to reset your password.</Text>
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
        justifyContent: 'space-evenly',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        color: '#666',
        marginBottom: 20,
    },
    otpInput: {
        height: 50,
        borderColor: 'grey',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 15,
        fontSize: 18,
        backgroundColor: theme.colors.surface,
        width: '100%',
        textAlign: 'center',
        marginBottom: 10,
    },
    button: {
        height: 50,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        marginTop: 24,
    },
    buttonEnabled: {
        backgroundColor: 'green',
    },
    buttonDisabled: {
        backgroundColor: '#A9A9A9',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
    },
    resendLink: {
        textAlign: 'center',
        fontSize: 16,
        color: '#1E90FF',
        marginTop: 10,
    },
    resendDisabled: {
        color: '#A9A9A9',
    },
});
