// DrawerNavigator.js
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import HomePage from './screens/HomePage'; // Your home screen
import Profile from './screens/Profile'; // Example profile screen

const Drawer = createDrawerNavigator(); // Create Drawer Navigator instance

const DrawerNavigator = () => {
    return (
        <NavigationContainer>
            <Drawer.Navigator
                initialRouteName="HomePage"
                screenOptions={{
                    drawerStyle: {
                        backgroundColor: '#f0f0f0',
                        width: 240,
                    },
                    headerShown: false, // Hide the header from the drawer screens
                }}
            >
                <Drawer.Screen name="Home" component={HomePage} />
                <Drawer.Screen name="Profile" component={Profile} />
            </Drawer.Navigator>
        </NavigationContainer>
    );
};

export default DrawerNavigator;
