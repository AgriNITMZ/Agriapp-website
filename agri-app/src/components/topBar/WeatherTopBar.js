import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Feather, MaterialIcons } from '@expo/vector-icons';
const WeatherTopBar = ({ navigation, city, setCity, fetchWeatherByCity, getLocation }) => {
    const [searchText, setSearchText] = useState('');
    const handleSearch = (text) => {
        setSearchText(text);
        setCategory(text); // Update category state in ShopPage
    };
    return (
        <View style={styles.topBar}>
            {/* Back Button */}
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={28} color="#333" />
            </TouchableOpacity>

            {/* Search Input Field */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#333" style={{ marginHorizontal: 5 }} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search for a city..."
                    placeholderTextColor="#A5D6A7"
                    value={city}
                    onChangeText={setCity}
                    onSubmitEditing={fetchWeatherByCity}
                />
            </View>
            {/* Location Button */}
            <TouchableOpacity style={styles.locationButton} onPress={getLocation}>
                <MaterialIcons name="my-location" size={24} color="#ffffff" />
                <Text style={styles.locationButtonText}>My Location</Text>
            </TouchableOpacity>
        </View>
    );
};

export default WeatherTopBar;

const styles = StyleSheet.create({
    topBar: {
        width: '100%', // Full width
        flexDirection: 'row', // Arrange items horizontally
        alignItems: 'center', // Align items vertically
        justifyContent: 'space-between', // Space between back button, search input, and icons
        padding: 5,
        backgroundColor: '#FFFFFF', // Set background color to white
        elevation: 4, // Shadow for Android
        shadowColor: '#000', // Shadow for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        marginBottom: 15, // Space below input field
    },
    searchContainer: {
        flex: 1, // Allow search input to take available space
        flexDirection: 'row', // Align search icon and input horizontally
        alignItems: 'center', // Center vertically
        backgroundColor: '#F0F0F0', // Light background for input field
        borderRadius: 8,
        paddingHorizontal: 5,
        marginHorizontal: 10, // Space around search field
    },
    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: '#4CAF50',
    },
    searchInput: {
        flex: 1, // Input field should take all remaining space
        height: 40,
        fontSize: 16,
        color: '#333', // Text color
    },
    icons: {
        flexDirection: 'row', // Arrange icons in a row
        alignItems: 'center', // Align icons vertically
    },
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2E7D32',
        borderRadius: 8,
        padding: 5,
        // marginBottom: 10,
        elevation: 3,
    },
    locationButtonText: {
        color: '#ffffff',
        fontSize: 16,
        marginLeft: 5,
    },
});
