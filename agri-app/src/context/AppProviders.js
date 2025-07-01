import React from 'react';
import { WishlistProvider } from './WishlistContext';
import { CartProvider } from './CartContext';

const AppProviders = ({ children }) => {
    return (
        <WishlistProvider>
            <CartProvider>
                {children}
            </CartProvider>
        </WishlistProvider>
    );
};

export default AppProviders;
