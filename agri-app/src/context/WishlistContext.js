import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import customFetch from '../utils/axios';
import Toast from 'react-native-toast-message';
import { getUserFromLocalStorage } from '../utils/localStorage';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState(new Set()); // Store as a Set for quick lookups
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

    // Check authentication status first
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const user = await getUserFromLocalStorage();
                const authenticated = !!(user && user.token);
                setIsAuthenticated(authenticated);
                console.log('Wishlist Provider - Authentication status:', authenticated);
            } catch (error) {
                console.error('Error checking auth in WishlistProvider:', error);
                setIsAuthenticated(false);
            } finally {
                setHasCheckedAuth(true);
            }
        };
        checkAuth();
    }, []);

    // Fetch wishlist from API ONLY after authentication is verified
    useEffect(() => {
        if (!hasCheckedAuth) return; // Wait for auth check
        
        if (!isAuthenticated) {
            // User not authenticated, load from AsyncStorage only
            const loadLocalWishlist = async () => {
                try {
                    const savedWishlist = await AsyncStorage.getItem('wishlist');
                    if (savedWishlist) {
                        setWishlist(new Set(JSON.parse(savedWishlist)));
                    }
                } catch (error) {
                    console.error('Error loading local wishlist:', error);
                }
            };
            loadLocalWishlist();
            return;
        }

        // User is authenticated, fetch from API
        const fetchWishlist = async () => {
            try {
                const response = await customFetch("products/wishlistid");
                setWishlist(new Set(response.data));
            } catch (error) {
                console.error('Error loading wishlist:', error);
                
                // Load from AsyncStorage if API call fails
                const savedWishlist = await AsyncStorage.getItem('wishlist');
                if (savedWishlist) {
                    setWishlist(new Set(JSON.parse(savedWishlist)));
                }
            }
        };
        fetchWishlist();
    }, [isAuthenticated, hasCheckedAuth]);

    // Save wishlist to AsyncStorage when it changes
    useEffect(() => {
        if (hasCheckedAuth) {
            AsyncStorage.setItem('wishlist', JSON.stringify([...wishlist]));
        }
    }, [wishlist, hasCheckedAuth]);

    // Add method to refresh auth status (call this when user logs in/out)
    const refreshAuthStatus = async () => {
        try {
            const user = await getUserFromLocalStorage();
            const authenticated = !!(user && user.token);
            setIsAuthenticated(authenticated);
            
            if (!authenticated) {
                // Clear wishlist when user logs out
                setWishlist(new Set());
            }
        } catch (error) {
            console.error('Error refreshing auth status:', error);
            setIsAuthenticated(false);
        }
    };

    // Toggle Wishlist with API Sync
    const toggleWishlist = async (productId) => {
        if (!isAuthenticated) {
            Toast.show({
                type: 'error',
                text1: 'Login Required',
                text2: 'Please login to manage your wishlist.',
            });
            return;
        }

        const newWishlist = new Set(wishlist);
        const isWishlisted = newWishlist.has(productId);

        try {
            if (isWishlisted) {
                await customFetch.post('/products/removewishlist', {
                    productId
                });
                newWishlist.delete(productId);
                Toast.show({
                    type: 'error',
                    text1: 'Removed from Wishlist',
                    text2: 'This product has been removed from your wishlist.',
                });
            } else {
                await customFetch.post('/products/addwishlist', {
                    productId
                });
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
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Could not update wishlist. Please try again.',
            });
        }
    };

    return (
        <WishlistContext.Provider value={{ 
            wishlist, 
            toggleWishlist, 
            refreshAuthStatus,
            isAuthenticated 
        }}>
            {children}
        </WishlistContext.Provider>
    );
};