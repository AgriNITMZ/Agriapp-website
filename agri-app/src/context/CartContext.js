import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import customFetch from '../utils/axios';
import Toast from 'react-native-toast-message';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState({
        _id: null,
        totalPrice: 0,
        totalDiscountedPrice: 0,
        items: [],
    });

    // Load cart from API and sync with AsyncStorage on app start
    useEffect(() => {
        const loadCart = async () => {
            try {
                const response = await customFetch.get('products/cartitemsapp');
                if (response.data.cart) {
                    setCart(response.data.cart);
                    await AsyncStorage.setItem('cart', JSON.stringify(response.data.cart));
                }
            } catch (error) {
                console.error('Error fetching cart:', error);
                // Toast.show({
                //     type: 'error',
                //     text1: 'Cart Sync Failed',
                //     text2: 'Could not load cart from server.',
                // });

                // Load from AsyncStorage if API call fails
                const savedCart = await AsyncStorage.getItem('cart');
                if (savedCart) {
                    setCart(JSON.parse(savedCart));
                }
            }
        };
        loadCart();
    }, []);

    //  Save cart to AsyncStorage whenever it changes
    useEffect(() => {
        AsyncStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    //  Add or update item in cart
    const addToCart = async (product, quantity, selectedSize, selectedSeller) => {
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

            const response = await customFetch.post('products/addtocartapp', {
                productId: product._id,
                quantity,
                selectedsize: selectedPriceSize.size,
                selectedPrice: selectedPriceSize.price,
                selecetedDiscountedPrice: selectedPriceSize.discountedPrice || selectedPriceSize.price,
                sellerId: selectedSeller.sellerId || selectedSeller._id,
            });

            if (response.data.cart) {
                setCart(response.data.cart);
                await AsyncStorage.setItem('cart', JSON.stringify(response.data.cart));
                Toast.show({
                    type: 'success',
                    text1: 'Item Added',
                    text2: `${product.name.slice(0, 25) + "..."} added to cart.`,
                });
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            Toast.show({
                type: 'error',
                text1: 'Failed to Add',
                text2: 'Could not add item to cart. Try again!',
            });
        }
    };

    //  Increase or decrease quantity (calls addToCart)
    const updateQuantity = async (item, newQuantity) => {
        console.log('Updating quantity for item:', item, 'to', newQuantity);
        const product = {
            _id: item.productId,
            name: item.productName,
            // Create a mock seller structure
            selectedSeller: {
                sellerId: item.sellerId, // Use the sellerId from the cart item
                _id: item.sellerId,
                price_size: {
                    0: { // Use index 0 as the selectedSize parameter
                        size: item.selectedsize,
                        price: item.selectedPrice,
                        discountedPrice: item.selecetedDiscountedPrice
                    }
                }
            }
        };

        try {

            const response = await customFetch.post('products/addtocartapp', {
                productId: item.productId,
                quantity: newQuantity,
                selectedsize: item.selectedsize,
                selectedPrice: item.selectedPrice,
                selecetedDiscountedPrice: item.selecetedDiscountedPrice,
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
                text2: 'Could not update quantity. Try again!',
            });
        }
    };

    //  Remove item from cart 
    const removeFromCart = async (itemId) => {
        try {
            await customFetch.delete(`products/removeitem/${itemId}`);
            // Filter out the removed item
            const updatedItems = cart.items.filter((item) => item._id !== itemId);

            // Recalculate the total price and total discounted price
            const newTotalPrice = updatedItems.reduce(
                (sum, item) => sum + (item.selectedPrice * item.quantity), 0
            );

            const newTotalDiscountedPrice = updatedItems.reduce(
                (sum, item) => sum + (item.selecetedDiscountedPrice * item.quantity), 0
            );

            // Update the cart with new items and recalculated totals
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
                text2: 'Could not remove item. Try again!',
            });
        }
    };

    //  Clear cart (both local and API)
    const clearCart = async () => {
        try {
            await customFetch.delete(`products/clearcart`);
            setCart({ _id: null, totalPrice: 0, totalDiscountedPrice: 0, items: [] });
            await AsyncStorage.removeItem('cart');

            // Toast.show({
            //     type: 'success',
            //     text1: 'Cart Cleared',
            //     text2: 'Your cart is now empty.',
            // });
        } catch (error) {
            console.error('Error clearing cart:', error);
            Toast.show({
                type: 'error',
                text1: 'Clear Failed',
                text2: 'Could not clear cart. Try again!',
            });
        }
    };

    // Check if product is already in cart
    const isProductInCart = (productId) => {
        return cart.items.some((item) => item.productId === productId);
    };

    // Get cart size (total number of items)
    const cartSize = () => {
        return cart.items.length;
    };

    return (
        <CartContext.Provider
            value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartSize, isProductInCart }}
        >
            {children}
        </CartContext.Provider>
    );
};
