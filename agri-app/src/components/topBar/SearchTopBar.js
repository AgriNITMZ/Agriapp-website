import React, { useState, useContext } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { CartContext } from '../../context/CartContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SearchTopBar = ({ navigation, setSearch, inputRef }) => {
    const { cartSize } = useContext(CartContext);
    const [searchText, setSearchText] = useState('');
    const handleSearch = (text) => {
        setSearchText(text);
        setSearch(text); // Update category state in ShopPage
    };
    const handleDone = async () => {
        try {
            if (searchText.trim() !== "") {
                await AsyncStorage.setItem("lastSearch", searchText);
            }
        } catch (error) {
            console.error("Failed to save search text", error);
        }
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
                    ref={inputRef}
                    style={styles.searchInput}
                    placeholder="Search for items..."
                    value={searchText}
                    onChangeText={handleSearch}
                    onSubmitEditing={handleDone}
                    placeholderTextColor="#999"
                />
            </View>

            {/* Action Icons */}
            <View style={styles.icons}>
                <TouchableOpacity style={{ paddingHorizontal: 5 }} onPress={() => navigation.navigate('Wishlist')}>
                    <Ionicons name="heart" size={28} color="#333" />
                </TouchableOpacity>
                {/* Cart Icon with Badge */}
                <TouchableOpacity style={{ paddingHorizontal: 5 }} onPress={() => navigation.navigate('Cart')}>
                    <View>
                        <Ionicons name="cart" size={28} color="#333" />
                        {cartSize() > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{cartSize()}</Text>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default SearchTopBar;

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
    badge: {
        position: 'absolute',
        right: -3,
        top: -3,
        backgroundColor: 'red',
        borderRadius: 10,
        width: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#fff'
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
});
