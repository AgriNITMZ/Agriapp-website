import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Menu, Bell, Search } from 'lucide-react-native';

const SellerTopBar = ({ navigation, title, showSearch = false, onSearchPress }) => {
    return (
        <View style={styles.container}>
            <View style={styles.leftSection}>
                <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuButton}>
                    <Menu size={26} color="#333" />
                </TouchableOpacity>
                <View style={styles.logoContainer}>
                    <Text style={styles.appTitle}>
                        <Text style={styles.preciText}>Preci</Text>
                        <Text style={styles.agriText}>Agri</Text>
                    </Text>
                </View>
            </View>
            <View style={styles.rightSection}>
                {showSearch && (
                    <TouchableOpacity onPress={onSearchPress} style={styles.iconButton}>
                        <Search size={24} color="#333" />
                    </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => navigation.navigate('Notification')} style={styles.iconButton}>
                    <Bell size={24} color="#333" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 15,
        paddingVertical: 14,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    menuButton: {
        marginRight: 15,
        padding: 2,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    appTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        flexDirection: 'row',
    },
    preciText: {
        color: '#4A90E2',
        fontSize: 24,
        fontWeight: 'bold',
    },
    agriText: {
        color: '#4CAF50',
        fontSize: 24,
        fontWeight: 'bold',
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        marginLeft: 18,
        padding: 2,
    },
});

export default SellerTopBar;
