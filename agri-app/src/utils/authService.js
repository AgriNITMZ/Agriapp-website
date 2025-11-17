import { getUserFromLocalStorage, removeUserFromLocalStorage } from './localStorage';
import checkTokenExpiration from './checkTokenExpiration';

/**
 * Check if user is authenticated with valid token
 * @returns {Promise<{isAuthenticated: boolean, user: object|null, accountType: string|null}>}
 */
export const checkAuthStatus = async () => {
    try {
        const user = await getUserFromLocalStorage();
        
        if (!user || !user.token) {
            return {
                isAuthenticated: false,
                user: null,
                accountType: null
            };
        }

        const isValidToken = await checkTokenExpiration();
        
        if (!isValidToken) {
            // Token expired, clean up
            await removeUserFromLocalStorage();
            return {
                isAuthenticated: false,
                user: null,
                accountType: null
            };
        }

        return {
            isAuthenticated: true,
            user: user,
            accountType: user.accountType
        };
    } catch (error) {
        console.error('Error checking auth status:', error);
        return {
            isAuthenticated: false,
            user: null,
            accountType: null
        };
    }
};

/**
 * Logout user and clear all data
 * @returns {Promise<boolean>}
 */
export const logoutUser = async () => {
    try {
        await removeUserFromLocalStorage();
        console.log('User logged out successfully');
        return true;
    } catch (error) {
        console.error('Error during logout:', error);
        return false;
    }
};

/**
 * Check if user is a seller
 * @returns {Promise<boolean>}
 */
export const isUserSeller = async () => {
    try {
        const user = await getUserFromLocalStorage();
        return user?.accountType === 'Seller';
    } catch (error) {
        console.error('Error checking user type:', error);
        return false;
    }
};

/**
 * Check if user is a buyer/regular user
 * @returns {Promise<boolean>}
 */
export const isUserBuyer = async () => {
    try {
        const user = await getUserFromLocalStorage();
        return user?.accountType === 'User' || user?.accountType === 'Buyer';
    } catch (error) {
        console.error('Error checking user type:', error);
        return false;
    }
};
