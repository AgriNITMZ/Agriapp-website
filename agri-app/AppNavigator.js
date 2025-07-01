import React from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import OnboardingScreen from './src/screens/Auth/OnBoradingScreen.js';
import HomeScreen from './src/screens/Home/Dashboard.js';
import LoginScreen from './src/screens/Auth/LoginScreen.js';
import RegisterScreen from './src/screens/Auth/SignUpScreen.js';
import AuthChecker from './src/screens/Auth/AuthChecker.js';

const Stack = createStackNavigator();

const AppNavigator = ({ isFirstLaunch, setIsFirstLaunch, isAuthenticated }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isFirstLaunch ? (
        <Stack.Screen name="Onboarding">
          {(props) => (
            <OnboardingScreen {...props} onDone={() => setIsFirstLaunch(false)} />
          )}
        </Stack.Screen>
      ) : isAuthenticated ? (
        <>
          <AuthChecker />
          <Stack.Screen name="Home" component={HomeScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;