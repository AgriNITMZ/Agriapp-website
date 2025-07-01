import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Provider } from 'react-native-paper';
import { StyleSheet, Platform, StatusBar } from 'react-native';
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
  LoanPage

} from './src/screens';
import AppNavigator from './AppNavigator';
import WeatherPage from './src/screens/Services/WeatherPage';
import ShowAddressPage from './src/screens/Address/ShowAddress';
import AddPost from './src/screens/Posts/AddPost';
import EditPost from './src/screens/Posts/EditPost';
import SelectAddressPage from './src/screens/Address/SelectAddressPage';
import OrderSummaryPage from './src/screens/Orders/OrderSummaryPage';
import SellerOrdersPage from './src/screens/Orders/SellerOrderPage';
import FarmingTipsPage from './src/screens/Services/FarmingTipsPage';
import AboutUs from './src/screens/General/AboutUs';
import ContactUs from './src/screens/General/ContactUs';
import OrderSuccessScreen from './src/screens/Orders/OrderSuccessScreen';
import OrderFailedScreen from './src/screens/Orders/OrderFailedScreen';
import OrderHistoryScreen from './src/screens/Orders/MyOrdersPage';
import AuthChecker from './src/screens/Auth/AuthChecker';
import customFetch from './src/utils/axios';
import SensorDropdownScreen from './src/screens/Sensor/Sensor';

// Keep splash screen visible until fonts are loaded
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
  console.log("isAuthenticated", isAuthenticated);
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
      <Stack.Screen name="Shop" component={ShopPage} />
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
      <Stack.Screen name="News" component={NewsAndSchemesTabView} options={{ title: 'News & Schemes' }} />
      <Stack.Screen name="ArticleDetail" component={ArticleDetail} options={{ headerShown: false }} />
      <Stack.Screen name="SelectAddress" component={SelectAddressPage} />
      <Stack.Screen name="OrderSummary" component={OrderSummaryPage} />
      <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
      <Stack.Screen name="OrderFailed" component={OrderFailedScreen} />
      <Stack.Screen name="MyOrders" component={OrderHistoryScreen} />
      <Stack.Screen name="SellerOrder" component={SellerOrdersPage} />
      <Stack.Screen name="FarmingTips" component={FarmingTipsPage} />
      <Stack.Screen name="Sensor" component={SensorDropdownScreen} />
    </Stack.Navigator>
  )
}
const App = () => {
  const Drawer = createDrawerNavigator();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleFontsLoaded = useCallback(async () => {
    await loadFonts();
    setFontsLoaded(true);
    await SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem('hasLaunched');
        if (hasLaunched === null) {
          setIsFirstLaunch(true);
          await AsyncStorage.setItem('hasLaunched', 'true');
        } else {
          setIsFirstLaunch(false);
        }

        const user = await AsyncStorage.getItem('user');
        if (user) {
          const resp = await customFetch.get("/auth/getuserbytoken")
          console.log(resp.status)
          if (resp.status === 200) {
            console.log("Logged innn..")
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking launch or authentication status', error);
      }
    };

    checkFirstLaunch();
  }, []);

  if (!fontsLoaded) {
    handleFontsLoaded();
    return null; // Prevent rendering until fonts are loaded
  }

  if (isFirstLaunch === null) {
    return null; // Add a loading spinner here if necessary
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <Provider theme={theme}>
          <AppProviders>
            <NavigationContainer>
              <AuthChecker />
              {isFirstLaunch ? (
                <AppNavigator
                  isFirstLaunch={isFirstLaunch}
                  setIsFirstLaunch={setIsFirstLaunch}
                  isAuthenticated={isAuthenticated}
                />
              ) : (<Drawer.Navigator screenOptions={{ headerShown: false }} >
                <Drawer.Screen name="Home" component={StackNav} initialParams={{ isAuthenticated }} />
                <Drawer.Screen name="Profile" component={ProfilePage} />
                <Drawer.Screen name="Wishlist" component={Wishlist} />
                <Drawer.Screen name="Cart" component={CartPage} />
                <Drawer.Screen name="About" component={AboutUs} />
                <Drawer.Screen name="Contact-Us" component={ContactUs} />
                <Drawer.Screen name="Logout" component={LogoutScreen} />
              </Drawer.Navigator>
              )}
              <Toast />
            </NavigationContainer>
          </AppProviders>
        </Provider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};
export default App;
