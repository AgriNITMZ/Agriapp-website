import React, { useContext, useEffect } from 'react';
import { WishlistProvider, WishlistContext } from './WishlistContext';
import { CartProvider, CartContext } from './CartContext';

// Helper component to refresh auth status when authentication changes
const AuthStatusUpdater = ({ children }) => {
    return children;
};

// Enhanced AppProviders with auth refresh capability
const AppProviders = ({ children, onAuthChange }) => {
    return (
        <WishlistProvider>
            <CartProvider>
                <AuthStatusUpdater>
                    {children}
                </AuthStatusUpdater>
            </CartProvider>
        </WishlistProvider>
    );
};

// Export a hook to refresh both providers' auth status
export const useRefreshProviders = () => {
    const cartContext = useContext(CartContext);
    const wishlistContext = useContext(WishlistContext);
    
    const refreshAll = async () => {
        if (cartContext?.refreshAuthStatus) {
            await cartContext.refreshAuthStatus();
        }
        if (wishlistContext?.refreshAuthStatus) {
            await wishlistContext.refreshAuthStatus();
        }
    };
    
    return { refreshAll };
};

export default AppProviders;