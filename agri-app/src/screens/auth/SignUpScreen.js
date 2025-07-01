import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Text } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { Dropdown } from 'react-native-element-dropdown';
import Background from '../../components/auth/Background';
import Logo from '../../components/auth/Logo';
import Header from '../../components/auth/Header';
import Button from '../../components/auth/Button';
import TextInput from '../../components/auth/TextInput';
import BackButton from '../../components/auth/BackButton';
import { theme } from '../../core/theme';

import { nameValidator } from '../../helpers/nameValidator';
import { emailValidator } from '../../helpers/emailValidator';
import { passwordValidator } from '../../helpers/passwordValidator';
import { roleValidator } from '../../helpers/roleValidator';
import customFetch from '../../utils/axios';

const SignUpScreen = ({ navigation }) => {
  // State variables for form inputs and validation errors
  const [name, setName] = useState({ value: '', error: '' });
  const [email, setEmail] = useState({ value: '', error: '' });
  const [password, setPassword] = useState({ value: '', error: '' });
  const [confirmPassword, setConfirmPassword] = useState({ value: '', error: '' });
  const [role, setRole] = useState({ value: '', error: '' });
  const [loading, setLoading] = useState(false);

  const roleOptions = [
    { label: 'User', value: 'User' },
    { label: 'Seller', value: 'Seller' },
  ];

  // Function to handle SignUp button press
  const onSignUpPressed = async () => {
    setLoading(true);
    try {
      // Validate inputs
      const nameError = nameValidator(name.value);
      const emailError = emailValidator(email.value);
      const passwordError = passwordValidator(password.value);
      const confirmPasswordError = password.value !== confirmPassword.value ? 'Passwords do not match' : '';
      const roleError = roleValidator(role.value);

      if (emailError || passwordError || confirmPasswordError || nameError || roleError) {
        setName({ ...name, error: nameError });
        setEmail({ ...email, error: emailError });
        setPassword({ ...password, error: passwordError });
        setConfirmPassword({ ...confirmPassword, error: confirmPasswordError });
        setRole({ ...role, error: roleError });
        setLoading(false);
        return;
      }

      // Send OTP request
      await customFetch.post("/auth/sendotp", { email: email.value });
      Toast.show({ type: 'success', text1: 'OTP Sent Successfully..!', text2: 'Please check you email!' });
      navigation.navigate('VerifyEmailonRegister', {
        userData: {
          Name: name.value,
          email: email.value,
          password: password.value,
          confirmPassword: confirmPassword.value,
          accountType: role.value,
        },
      });
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Failed to send OTP' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Background>
      <BackButton goBack={navigation.goBack} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <Logo />
          <Header>Create Account</Header>

          {/* Role Dropdown */}
          <Dropdown
            style={role.error ? styles.dropdownError : styles.dropdown}
            placeholderStyle={role.error ? styles.placeholderStyleError : styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            data={roleOptions}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={'Select Your Role'}
            value={role.value}
            onChange={item => setRole({ value: item.value, error: '' })}
          />
          {role.error ? <Text style={styles.error}>{role.error}</Text> : null}

          {/* Input Fields */}
          <TextInput label="Name" value={name.value} onChangeText={text => setName({ value: text, error: '' })} error={!!name.error} errorText={name.error} />
          <TextInput label="Email" value={email.value} onChangeText={text => setEmail({ value: text, error: '' })} error={!!email.error} errorText={email.error} autoCapitalize="none" keyboardType="email-address" />
          <TextInput label="Password" value={password.value} onChangeText={text => setPassword({ value: text, error: '' })} error={!!password.error} errorText={password.error} secureTextEntry />
          <TextInput label="Confirm Password" value={confirmPassword.value} onChangeText={text => setConfirmPassword({ value: text, error: '' })} error={!!confirmPassword.error} errorText={confirmPassword.error} secureTextEntry />

          {/* Sign Up Button with Loading Indicator */}
          <Button mode="contained" onPress={onSignUpPressed} style={{ marginTop: 24 }}>
            {loading ? <ActivityIndicator color="white" /> : 'Send OTP'}
          </Button>

          {/* Login Navigation */}
          <View style={styles.row}>
            <Text>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.replace('LoginScreen')}>
              <Text style={styles.link}>Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Background>
  );
};

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, alignItems: 'center', justifyContent: 'space-evenly' },
  error: { fontSize: 13, color: theme.colors.error, paddingTop: 8, textAlign: 'left' },
  row: { flexDirection: 'row', marginTop: 4, paddingBottom: 10 },
  link: { fontWeight: 'bold', color: 'green' },
  dropdown: { minWidth: 300, height: 50, borderColor: 'grey', borderWidth: 1, borderRadius: 5, paddingHorizontal: 10 },
  dropdownError: { minWidth: 300, height: 50, borderColor: 'red', borderWidth: 1.3, borderRadius: 5, paddingHorizontal: 10 },
  placeholderStyle: { fontSize: 16 },
  placeholderStyleError: { fontSize: 16, color: theme.colors.error },
  selectedTextStyle: { fontSize: 16 },
  inputSearchStyle: { height: 40, fontSize: 16 },
});

export default SignUpScreen;
