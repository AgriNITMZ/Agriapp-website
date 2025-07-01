import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const TopBar = ({ navigation, title = "", showBackButton = true }) => {
    return (
        <View style={styles.topBar}>
            {/* Back Button */}
            {showBackButton && (
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color="#333" />
                </TouchableOpacity>
            )}

            {/* Centered Title */}
            <Text style={styles.sectionTitle}>
                {title}
            </Text>
        </View>
    );
};

export default TopBar;

const styles = StyleSheet.create({
    topBar: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center', // Center content horizontally
        paddingVertical: 10,
        backgroundColor: '#FFFFFF',
        elevation: 4, // Shadow for Android
        shadowColor: '#000', // Shadow for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    backButton: {
        position: 'absolute',
        left: 10,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
});
