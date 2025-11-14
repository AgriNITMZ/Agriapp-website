import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

// Seller Screens
import SellerDashboard from '../screens/Seller/SellerDashboard';
import SellerProducts from '../screens/Seller/SellerProducts';
import SellerOrders from '../screens/Seller/SellerOrders';
import SellerProfile from '../screens/Seller/SellerProfile';

// Shared Screens
import AddPost from '../screens/Posts/AddPost';
import EditPost from '../screens/Posts/EditPost';
import EditProfilePage from '../screens/profile/EditProfilePage';
import ChangePassword from '../screens/profile/ChangePassword';
import NotificationScreen from '../components/topBar/NotificationScreen';
import LogoutScreen from '../screens/auth/LogoutScreen';
import StartScreen from '../screens/auth/StartScreen';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const SellerStackNavigator = () => {
    return (
        <Stack.Navigator
            initialRouteName="SellerDashboard"
            screenOptions={{ headerShown: false }}
        >
            <Stack.Screen name="SellerDashboard" component={SellerDashboard} />
            <Stack.Screen name="SellerProducts" component={SellerProducts} />
            <Stack.Screen name="SellerOrders" component={SellerOrders} />
            <Stack.Screen name="SellerProfile" component={SellerProfile} />
            <Stack.Screen name="AddPost" component={AddPost} />
            <Stack.Screen name="EditPost" component={EditPost} />
            <Stack.Screen name="EditProfile" component={EditProfilePage} />
            <Stack.Screen name="ChangePassword" component={ChangePassword} />
            <Stack.Screen name="Notification" component={NotificationScreen} />
            <Stack.Screen name="StartScreen" component={StartScreen} />
        </Stack.Navigator>
    );
};

const SellerNavigator = () => {
    return (
        <Drawer.Navigator screenOptions={{ headerShown: false }}>
            <Drawer.Screen name="SellerHome" component={SellerStackNavigator} />
            <Drawer.Screen name="Dashboard" component={SellerDashboard} />
            <Drawer.Screen name="Products" component={SellerProducts} />
            <Drawer.Screen name="Orders" component={SellerOrders} />
            <Drawer.Screen name="Profile" component={SellerProfile} />
            <Drawer.Screen name="Logout" component={LogoutScreen} />
        </Drawer.Navigator>
    );
};

export default SellerNavigator;
