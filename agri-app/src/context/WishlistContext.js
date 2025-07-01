import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import customFetch from '../utils/axios';
import Toast from 'react-native-toast-message';
export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState(new Set()); // Store as a Set for quick lookups

    // Fetch wishlist from API or AsyncStorage on load
    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const response = await customFetch("products/wishlistid");
                setWishlist(new Set(response.data));
            } catch (error) {
                console.error('Error loading wishlist:', error);
            }
        };
        fetchWishlist();
    }, []);

    // Save wishlist to AsyncStorage when it changes
    useEffect(() => {
        AsyncStorage.setItem('wishlist', JSON.stringify([...wishlist]));
    }, [wishlist]);

    // Toggle Wishlist with API Sync
    const toggleWishlist = async (productId) => {
        const newWishlist = new Set(wishlist);
        const isWishlisted = newWishlist.has(productId);

        try {
            if (isWishlisted) {
                await customFetch.post('/products/removewishlist', {
                    productId
                }),
                    newWishlist.delete(productId);
                Toast.show({
                    type: 'error',
                    text1: 'Removed from Wishlist',
                    text2: 'This product has been removed from your wishlist.',
                });
            } else {
                await customFetch.post('/products/addwishlist', {
                    productId
                }),
                    newWishlist.add(productId);
                Toast.show({
                    type: 'success',
                    text1: 'Added to Wishlist ❤️',
                    text2: 'You can view it anytime in your wishlist.',
                });
            }
            setWishlist(newWishlist);
            await AsyncStorage.setItem('wishlist', JSON.stringify([...newWishlist]));
        } catch (error) {
            console.error('Error updating wishlist:', error);
        }
    };

    return (
        <WishlistContext.Provider value={{ wishlist, toggleWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};
