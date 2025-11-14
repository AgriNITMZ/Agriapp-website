import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Provider } from 'react-native-paper';
import { StyleSheet, Platform, StatusBar, View, ActivityIndicator } from 'react-native'; // ✅ CHANGED: combined imports
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { theme } from './src/core/theme';
import Toast from 'react-native-toast-message';
import AppProviders from './src/context/AppProviders';

import {
  StartScreen,
  LoginScreen,
  SignUpScreen,
  ResetPasswordScreen,
  Dashboard,
  VerifyEmail,
  VerifyEmailonRegister,
  ChangePassword,
  HomePage,
  ShopPage,
  ProductDetailPage,
  Wishlist,
  CartPage,
  AddAddressPage,
  ProfilePage,
  ArticleDetail,
  NewsAndSchemesTabView,
  LogoutScreen,
  UserProducts,
  ResetForgotPassword,
  EditProfilePage,
  EditAddress,
  CategoryScreen,
  LoanPage,
  MarketplaceScreen
} from './src/screens';
import AppNavigator from './AppNavigator';
import SellerNavigator from './src/navigation/SellerNavigator';
import WeatherPage from './src/screens/services/WeatherPage';
import ShowAddressPage from './src/screens/address/ShowAddress';
import AddPost from './src/screens/Posts/AddPost';
import EditPost from './src/screens/Posts/EditPost';
import SelectAddressPage from './src/screens/address/SelectAddressPage';
import OrderSummaryPage from './src/screens/Orders/OrderSummaryPage';
import SellerOrdersPage from './src/screens/Orders/SellerOrderPage';
import FarmingTipsPage from './src/screens/services/FarmingTipsPage';
import AboutUs from './src/screens/General/AboutUs';
import ContactUs from './src/screens/General/ContactUs';
import OrderSuccessScreen from './src/screens/Orders/OrderSuccessScreen';
import OrderFailedScreen from './src/screens/Orders/OrderFailedScreen';
import OrderHistoryScreen from './src/screens/Orders/MyOrdersPage';
// import AuthChecker from './src/screens/auth/AuthChecker'; // ❌ REMOVED
import customFetch from './src/utils/axios';
import SensorDropdownScreen from './src/screens/Sensor/Sensor';
import {
  getUserFromLocalStorage,
  removeUserFromLocalStorage
} from './src/utils/localStorage';
import checkTokenExpiration from './src/utils/checkTokenExpiration';
import NotificationScreen from './src/components/topBar/NotificationScreen';
// Prevent auto-hide
SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

const loadFonts = async () => {
  await Font.loadAsync({
    'Lobster-Regular': require('./src/assets/fonts/Lobster-Regular.ttf'),
  });
};

const StackNav = ({ route }) => {
  const { isAuthenticated } = route.params;
  const Stack = createStackNavigator();

  return (
    <Stack.Navigator
      initialRouteName={isAuthenticated ? 'HomePage' : 'StartScreen'}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="StartScreen" component={StartScreen} />
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
      <Stack.Screen name="VerifyEmail" component={VerifyEmail} />
      <Stack.Screen name="VerifyEmailonRegister" component={VerifyEmailonRegister} />
      <Stack.Screen name="ChangePassword" component={ChangePassword} />
      <Stack.Screen name="ResetForgotPassword" component={ResetForgotPassword} />
      <Stack.Screen name="Category" component={CategoryScreen} />
      <Stack.Screen name="Dashboard" component={Dashboard} />
      <Stack.Screen name="HomePage" component={HomePage} />
      <Stack.Screen name="Shop" component={MarketplaceScreen} />
      <Stack.Screen name="Marketplace" component={MarketplaceScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailPage} />
      <Stack.Screen name="Wishlist" component={Wishlist} />
      <Stack.Screen name="Cart" component={CartPage} />
      <Stack.Screen name="Loan" component={LoanPage} />
      <Stack.Screen name="AddAddress" component={AddAddressPage} />
      <Stack.Screen name="ShowAddress" component={ShowAddressPage} />
      <Stack.Screen name="EditAddress" component={EditAddress} />
      <Stack.Screen name="Weather" component={WeatherPage} />
      <Stack.Screen name="Profile" component={ProfilePage} />
      <Stack.Screen name="EditProfile" component={EditProfilePage} />
      <Stack.Screen name="AddPost" component={AddPost} />
      <Stack.Screen name="EditPost" component={EditPost} />
      <Stack.Screen name="Logout" component={LogoutScreen} />
      <Stack.Screen name="UserProducts" component={UserProducts} />
      <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} />
      <Stack.Screen name="News" component={NewsAndSchemesTabView} />
      <Stack.Screen name="ArticleDetail" component={ArticleDetail} />
      <Stack.Screen name="SelectAddress" component={SelectAddressPage} />
      <Stack.Screen name="OrderSummary" component={OrderSummaryPage} />
      <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
      <Stack.Screen name="OrderFailed" component={OrderFailedScreen} />
      <Stack.Screen name="MyOrders" component={OrderHistoryScreen} />
      <Stack.Screen name="SellerOrder" component={SellerOrdersPage} />
      <Stack.Screen name="FarmingTips" component={FarmingTipsPage} />
      <Stack.Screen name="Sensor" component={SensorDropdownScreen} />
      <Stack.Screen 
          name="Notification" 
          component={NotificationScreen} 
          options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const App = () => {
  const Drawer = createDrawerNavigator();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [accountType, setAccountType] = useState(null); // Track account type

  const handleFontsLoaded = useCallback(async () => {
    await loadFonts();
    setFontsLoaded(true);
    await SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    handleFontsLoaded(); // ✅ CHANGED: moved into useEffect
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem('hasLaunched');
        if (hasLaunched === null) {
          setIsFirstLaunch(true);
          await AsyncStorage.setItem('hasLaunched', 'true');
        } else {
          setIsFirstLaunch(false);
        }

        const user = await getUserFromLocalStorage();
        if (user && user.token) {
          const isValidToken = await checkTokenExpiration();
          if (isValidToken) {
            console.log("User is authenticated with valid token");
            console.log("Account Type:", user.accountType);
            setIsAuthenticated(true);
            setAccountType(user.accountType);
          } else {
            console.log("Token expired, cleaning up");
            await removeUserFromLocalStorage();
            setIsAuthenticated(false);
            setAccountType(null);
          }
        } else {
          console.log("No user found");
          setIsAuthenticated(false);
          setAccountType(null);
        }
      } catch (error) {
        console.error('Error during app initialization:', error);
        await removeUserFromLocalStorage();
        setIsAuthenticated(false);
        setAccountType(null);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    initializeApp();

    // Listen for storage changes to re-check authentication
    const checkAuthInterval = setInterval(async () => {
      const user = await getUserFromLocalStorage();
      if (!user || !user.token) {
        // User logged out, update state
        if (isAuthenticated) {
          console.log("Auth state changed - user logged out");
          setIsAuthenticated(false);
          setAccountType(null);
        }
      } else {
        // User logged in or account type changed, update state
        const currentAccountType = user.accountType;
        if (!isAuthenticated || accountType !== currentAccountType) {
          console.log("Auth state changed - user logged in or account type changed");
          console.log("New account type:", currentAccountType);
          setIsAuthenticated(true);
          setAccountType(currentAccountType);
        }
      }
    }, 500); // Check every 500ms for faster response

    return () => clearInterval(checkAuthInterval);
  }, [isAuthenticated, accountType]);

  if (!fontsLoaded || isFirstLaunch === null || isCheckingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <Provider theme={theme}>
          <NavigationContainer>
            {isFirstLaunch ? (
              <AppNavigator
                isFirstLaunch={isFirstLaunch}
                setIsFirstLaunch={setIsFirstLaunch}
                isAuthenticated={isAuthenticated}
              />
            ) : accountType === 'Seller' ? (
              // Seller Navigation - No Cart/Wishlist providers
              <SellerNavigator />
            ) : (
              // Buyer Navigation - With Cart/Wishlist providers
              <AppProviders>
                <Drawer.Navigator screenOptions={{ headerShown: false }}>
                  <Drawer.Screen
                    name="Home"
                    component={StackNav}
                    initialParams={{ isAuthenticated }}
                  />
                  <Drawer.Screen name="Profile" component={ProfilePage} />
                  <Drawer.Screen name="Wishlist" component={Wishlist} />
                  <Drawer.Screen name="Cart" component={CartPage} />
                  <Drawer.Screen name="About" component={AboutUs} />
                  <Drawer.Screen name="Contact-Us" component={ContactUs} />
                  <Drawer.Screen name="Logout" component={LogoutScreen} />
                </Drawer.Navigator>
              </AppProviders>
            )}
            <Toast />
          </NavigationContainer>
        </Provider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default App;
