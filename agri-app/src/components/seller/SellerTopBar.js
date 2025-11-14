import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Menu, Bell } from 'lucide-react-native';

const SellerTopBar = ({ navigation, title }) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.openDrawer()}>
                <Menu size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.title}>{title || 'Seller Dashboard'}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Notification')}>
                <Bell size={24} color="#fff" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#4CAF50',
        paddingHorizontal: 15,
        paddingVertical: 15,
        elevation: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
});

export default SellerTopBar;
