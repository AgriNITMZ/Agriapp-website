import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Home, Package, ShoppingCart, User } from 'lucide-react-native';

const SellerFooterNavigation = ({ navigation, activePage }) => {
    const navItems = [
        { name: 'Dashboard', icon: Home, route: 'SellerDashboard' },
        { name: 'Products', icon: Package, route: 'SellerProducts' },
        { name: 'Orders', icon: ShoppingCart, route: 'SellerOrders' },
        { name: 'Profile', icon: User, route: 'SellerProfile' },
    ];

    return (
        <View style={styles.container}>
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.name;
                return (
                    <TouchableOpacity
                        key={item.name}
                        style={styles.navItem}
                        onPress={() => navigation.navigate(item.route)}
                    >
                        <Icon
                            size={24}
                            color={isActive ? '#4CAF50' : '#666'}
                        />
                        <Text
                            style={[
                                styles.navText,
                                isActive && styles.activeNavText,
                            ]}
                        >
                            {item.name}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        elevation: 8,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    navText: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    activeNavText: {
        color: '#4CAF50',
        fontWeight: 'bold',
    },
});

export default SellerFooterNavigation;
