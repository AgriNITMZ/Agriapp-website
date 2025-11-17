import React, { useEffect } from 'react';
import Background from '../../components/auth/Background';
import Logo from '../../components/auth/Logo';
import Header from '../../components/auth/Header';
import Button from '../../components/auth/Button';
import Paragraph from '../../components/auth/Paragraph';
import { checkAuthStatus } from '../../utils/authService';

export default function StartScreen({ navigation }) {
  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const { isAuthenticated, accountType } = await checkAuthStatus();
      
      if (isAuthenticated) {
        console.log('User already authenticated, accountType:', accountType);
        // User is already logged in
        // For buyers, navigate to HomePage (available in this stack)
        // For sellers, App.js will handle routing to SellerNavigator
        if (accountType !== 'Seller') {
          // Only navigate for buyers - they're in the right navigation context
          navigation.replace('HomePage');
        }
        // For sellers, do nothing - App.js will render SellerNavigator
      }
    };

    checkAuth();
  }, [navigation]);

  return (
    <Background>
      <Logo />
      <Header>PRECIAGRI</Header>
      <Paragraph>
        Connect, trade, and grow—Log in or sign up now!
      </Paragraph>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('LoginScreen')}
      >
        Login
      </Button>
      <Button
        mode="outlined"
        onPress={() => navigation.navigate('SignUpScreen')}
      >
        Sign Up
      </Button>
    </Background>
  );
}
