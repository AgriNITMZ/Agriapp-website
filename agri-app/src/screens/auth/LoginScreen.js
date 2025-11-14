import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { CommonActions } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import customFetch from '../../utils/axios';
import { addUserToLocalStorage } from '../../utils/localStorage';
import Background from '../../components/auth/Background';
import Logo from '../../components/auth/Logo';
import Header from '../../components/auth/Header';
import Button from '../../components/auth/Button';
import TextInput from '../../components/auth/TextInput';
import BackButton from '../../components/auth/BackButton';
import { theme } from '../../core/theme';
import { emailValidator } from '../../helpers/emailValidator';
import { passwordValidator } from '../../helpers/passwordValidator';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState({ value: '', error: '' });
  const [password, setPassword] = useState({ value: '', error: '' });

  // Handle login process
  const onLoginPressed = async () => {
    const emailError = emailValidator(email.value);
    const passwordError = passwordValidator(password.value);
    
    if (emailError || passwordError) {
      setEmail({ ...email, error: emailError });
      setPassword({ ...password, error: passwordError });
      return;
    }

    try {
      const response = await customFetch.post('/auth/login', {
        email: email.value,
        password: password.value,
      });

      if (response.status === 200) {
        const data = response.data;
        const user = {
          id: data.user._id,
          name: data.user.Name,
          email: data.user.email,
          accountType: data.user.accountType,
          token: data.token
        };

        console.log('Login successful for:', user.accountType);

        // Save user data to AsyncStorage
        await addUserToLocalStorage(user);

        Toast.show({
          type: 'success',
          text1: 'Login Successful',
          text2: `Welcome back${user.accountType === 'Seller' ? ' to your dashboard' : ''}!`,
        });

        // Wait a bit for storage to complete and App.js to detect the change
        // App.js will automatically switch to the correct navigator
        setTimeout(() => {
          // For sellers, just wait - App.js will switch to SellerNavigator
          // For buyers, navigate to HomePage
          if (user.accountType !== 'Seller') {
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'HomePage' }],
              })
            );
          }
          // For sellers, App.js interval will detect the change and switch navigators
        }, 800);
      }
    } catch (error) {
      console.error('Login error:', error);
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: error.response?.data?.message || 'Invalid email or password. Please try again.',
      });
    }
  };

  return (
    <Background>
      <BackButton goBack={navigation.goBack} />
      <Logo />
      <Header>Welcome Back</Header>
      <TextInput
        label="Email"
        returnKeyType="next"
        value={email.value}
        onChangeText={(text) => setEmail({ value: text, error: '' })}
        error={!!email.error}
        errorText={email.error}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        label="Password"
        returnKeyType="done"
        value={password.value}
        onChangeText={(text) => setPassword({ value: text, error: '' })}
        error={!!password.error}
        errorText={password.error}
        secureTextEntry
      />
      <View style={styles.forgotPassword}>
        <TouchableOpacity onPress={() => navigation.navigate('ResetPasswordScreen')}>
          <Text style={styles.forgot}>Forgot your password?</Text>
        </TouchableOpacity>
      </View>
      <Button mode="contained" onPress={onLoginPressed}>Login</Button>
      <View style={styles.row}>
        <Text>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.replace('SignUpScreen')}>
          <Text style={styles.link}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  forgotPassword: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    marginTop: 4,
  },
  forgot: {
    fontSize: 13,
    color: theme.colors.secondary,
  },
  link: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
});