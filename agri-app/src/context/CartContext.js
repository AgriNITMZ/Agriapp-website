import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import customFetch from '../utils/axios';
import Toast from 'react-native-toast-message';
import { getUserFromLocalStorage } from '../utils/localStorage';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState({
        _id: null,
        totalPrice: 0,
        totalDiscountedPrice: 0,
        items: [],
    });
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

    // Check authentication status first
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const user = await getUserFromLocalStorage();
                const authenticated = !!(user && user.token);
                setIsAuthenticated(authenticated);
                console.log('Cart Provider - Authentication status:', authenticated);
            } catch (error) {
                console.error('Error checking auth in CartProvider:', error);
                setIsAuthenticated(false);
            } finally {
                setHasCheckedAuth(true);
            }
        };
        checkAuth();
    }, []);

    // Load cart from API ONLY after authentication is verified
    useEffect(() => {
        if (!hasCheckedAuth) return;
        
        if (!isAuthenticated) {
            // User not authenticated, load from AsyncStorage only
            const loadLocalCart = async () => {
                try {
                    const savedCart = await AsyncStorage.getItem('cart');
                    if (savedCart) {
                        setCart(JSON.parse(savedCart));
                    }
                } catch (error) {
                    console.error('Error loading local cart:', error);
                }
            };
            loadLocalCart();
            return;
        }

        // User is authenticated, fetch from API
        const loadCart = async () => {
            try {
                console.log('Fetching cart from API...');
                const response = await customFetch.get('products/cartitemsapp');
                console.log('Cart API response:', response.data);
                
                if (response.data.cart) {
                    setCart(response.data.cart);
                    await AsyncStorage.setItem('cart', JSON.stringify(response.data.cart));
                    console.log('Cart loaded successfully:', response.data.cart.items.length, 'items');
                }
            } catch (error) {
                console.error('Error fetching cart:', error);
                
                // Load from AsyncStorage if API call fails
                const savedCart = await AsyncStorage.getItem('cart');
                if (savedCart) {
                    setCart(JSON.parse(savedCart));
                }
            }
        };
        loadCart();
    }, [isAuthenticated, hasCheckedAuth]);

    // Save cart to AsyncStorage whenever it changes
    useEffect(() => {
        if (hasCheckedAuth) {
            AsyncStorage.setItem('cart', JSON.stringify(cart));
        }
    }, [cart, hasCheckedAuth]);

    // Refresh auth status
    const refreshAuthStatus = async () => {
        try {
            const user = await getUserFromLocalStorage();
            const authenticated = !!(user && user.token);
            setIsAuthenticated(authenticated);
            
            if (!authenticated) {
                setCart({
                    _id: null,
                    totalPrice: 0,
                    totalDiscountedPrice: 0,
                    items: [],
                });
            } else {
                // Re-fetch cart when user logs in
                const response = await customFetch.get('products/cartitemsapp');
                if (response.data.cart) {
                    setCart(response.data.cart);
                }
            }
        } catch (error) {
            console.error('Error refreshing auth status:', error);
            setIsAuthenticated(false);
        }
    };

    // Add or update item in cart
    const addToCart = async (product, quantity, selectedSize, selectedSeller) => {
        if (!isAuthenticated) {
            Toast.show({
                type: 'error',
                text1: 'Login Required',
                text2: 'Please login to add items to cart.',
            });
            return;
        }

        try {
            const priceSize = selectedSeller?.price_size || product.price_size;

            if (!selectedSeller) {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Seller information not found.',
                });
                return;
            }

            if (!priceSize || !priceSize[selectedSize]) {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Size information not found.',
                });
                return;
            }

            const selectedPriceSize = priceSize[selectedSize];

            console.log('Adding to cart:', {
                productId: product._id,
                quantity,
                selectedsize: selectedPriceSize.size,
                selectedPrice: selectedPriceSize.price,
                selectedDiscountedPrice: selectedPriceSize.discountedPrice || selectedPriceSize.price,
                sellerId: selectedSeller.sellerId || selectedSeller._id,
            });

            const response = await customFetch.post('products/addtocartapp', {
                productId: product._id,
                quantity,
                selectedsize: selectedPriceSize.size,
                selectedPrice: selectedPriceSize.price,
                selectedDiscountedPrice: selectedPriceSize.discountedPrice || selectedPriceSize.price,
                sellerId: selectedSeller.sellerId || selectedSeller._id,
            });

            if (response.data.cart) {
                setCart(response.data.cart);
                await AsyncStorage.setItem('cart', JSON.stringify(response.data.cart));
                Toast.show({
                    type: 'success',
                    text1: 'Item Added',
                    text2: `${product.name.slice(0, 25)}... added to cart.`,
                });
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            Toast.show({
                type: 'error',
                text1: 'Failed to Add',
                text2: error.response?.data?.message || 'Could not add item to cart.',
            });
        }
    };

    // Update quantity
    const updateQuantity = async (item, newQuantity) => {
        if (!isAuthenticated) {
            Toast.show({
                type: 'error',
                text1: 'Login Required',
                text2: 'Please login to update cart.',
            });
            return;
        }

        console.log('Updating quantity for item:', item, 'to', newQuantity);

        try {
            const response = await customFetch.post('products/addtocartapp', {
                productId: item.productId,
                quantity: newQuantity,
                selectedsize: item.selectedsize,
                selectedPrice: item.selectedPrice,
                selectedDiscountedPrice: item.selectedDiscountedPrice,
                sellerId: item.sellerId,
            });
            
            if (response.data.cart) {
                setCart(response.data.cart);
                await AsyncStorage.setItem('cart', JSON.stringify(response.data.cart));
                Toast.show({
                    type: 'success',
                    text1: 'Cart Updated',
                    text2: `Quantity updated to ${newQuantity}.`,
                });
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
            Toast.show({
                type: 'error',
                text1: 'Update Failed',
                text2: error.response?.data?.message || 'Could not update quantity.',
            });
        }
    };

    // Remove item from cart
    const removeFromCart = async (itemId) => {
        if (!isAuthenticated) {
            Toast.show({
                type: 'error',
                text1: 'Login Required',
                text2: 'Please login to remove items.',
            });
            return;
        }

        try {
            await customFetch.delete(`products/removeitem/${itemId}`);
            
            // Update local state
            const updatedItems = cart.items.filter((item) => item._id !== itemId);
            const newTotalPrice = updatedItems.reduce(
                (sum, item) => sum + (item.selectedPrice * item.quantity), 0
            );
            const newTotalDiscountedPrice = updatedItems.reduce(
                (sum, item) => sum + (item.selectedDiscountedPrice * item.quantity), 0
            );

            const updatedCart = {
                ...cart,
                items: updatedItems,
                totalPrice: newTotalPrice,
                totalDiscountedPrice: newTotalDiscountedPrice
            };

            setCart(updatedCart);
            await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));

            Toast.show({
                type: 'success',
                text1: 'Item Removed',
                text2: 'Item successfully removed from cart.',
            });
        } catch (error) {
            console.error('Error removing item from cart:', error);
            Toast.show({
                type: 'error',
                text1: 'Remove Failed',
                text2: error.response?.data?.message || 'Could not remove item.',
            });
        }
    };

    // Clear cart
    const clearCart = async () => {
        try {
            if (isAuthenticated) {
                await customFetch.delete('products/clearcart');
            }
            setCart({ _id: null, totalPrice: 0, totalDiscountedPrice: 0, items: [] });
            await AsyncStorage.removeItem('cart');
            console.log('Cart cleared successfully');
        } catch (error) {
            console.error('Error clearing cart:', error);
            Toast.show({
                type: 'error',
                text1: 'Clear Failed',
                text2: error.response?.data?.message || 'Could not clear cart.',
            });
        }
    };

    // Check if product is in cart
    const isProductInCart = (productId) => {
        return cart.items.some((item) => item.productId === productId);
    };

    // Get cart size
    const cartSize = () => {
        return cart.items.length;
    };

    return (
        <CartContext.Provider
            value={{ 
                cart, 
                addToCart, 
                removeFromCart, 
                updateQuantity, 
                clearCart, 
                cartSize, 
                isProductInCart,
                refreshAuthStatus,
                isAuthenticated 
            }}
        >
            {children}
        </CartContext.Provider>
    );
};