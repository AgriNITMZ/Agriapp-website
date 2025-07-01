import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FooterNavigation = ({ navigation, activePage }) => {
    const [role, setRole] = useState(null);

    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                // Retrieve user data from AsyncStorage
                const userData = await AsyncStorage.getItem('user');
                if (userData) {
                    const user = JSON.parse(userData); // Parse stored JSON string
                    if (user.accountType) {
                        setRole(user.accountType); // Set role if available
                    }
                }
            } catch (error) {
                console.error('Error fetching user role:', error);
            }
        };

        fetchUserRole(); // Fetch role when component mounts
    }, []);

    // Define common footer navigation items
    const footerItems = [
        { name: 'Home', icon: 'home', route: 'HomePage', params: {}, activeColor: '#4CAF50' },
        { name: 'Shop', icon: 'storefront', route: 'Shop', params: { category: '' }, activeColor: '#4CAF50' },
        { name: 'Category', icon: 'grid', route: 'Category', params: {}, activeColor: '#4CAF50' },
        { name: 'Profile', icon: 'person', route: 'Profile', params: {}, activeColor: '#4CAF50' },
    ];

    // Add "Sell" option for sellers dynamically
    if (role === 'Seller') {
        footerItems.splice(3, 0, {
            name: 'Sell',
            icon: 'cart',
            route: 'AddPost',
            params: {},
            activeColor: '#4CAF50',
        });
    }

    return (
        <View style={styles.footer}>
            {footerItems.map((item, index) => (
                <TouchableOpacity
                    key={index}
                    style={styles.footerItem}
                    onPress={() => navigation.navigate(item.route, item.params)}
                >
                    <Ionicons
                        name={item.icon}
                        size={28}
                        color={activePage === item.name ? item.activeColor : '#777'}
                    />
                    <Text style={[styles.footerText, activePage === item.name && styles.activeFooterText]}>
                        {item.name}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 10,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
    footerItem: {
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: '#777',
        marginTop: 4,
    },
    activeFooterText: {
        color: '#4CAF50',
        fontWeight: 'bold',
    },
});

export default FooterNavigation;
