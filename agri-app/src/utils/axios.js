import axios from 'axios';
import { getUserFromLocalStorage, removeUserFromLocalStorage } from './localStorage';
import checkTokenExpiration from './checkTokenExpiration';

const customFetch = axios.create({
    baseURL: 'http://192.168.0.103:4000/api/v1',
});

// Flag to prevent multiple simultaneous token cleanup operations
let isCleaningUp = false;

// Function to handle token cleanup - REMOVED navigation logic
const handleTokenCleanup = async () => {
    if (isCleaningUp) return;
    isCleaningUp = true;
    
    try {
        await removeUserFromLocalStorage();
        console.log('Token cleanup completed');
        
        // ❌ REMOVED: Navigation logic - this will be handled by the app's auth state
        // The app will automatically redirect when it detects no valid token
        
    } catch (error) {
        console.error('Error during token cleanup:', error);
    } finally {
        isCleaningUp = false;
    }
};

// Request Interceptor: Attach Authorization Token
customFetch.interceptors.request.use(
    async (config) => {
        try {
            // First check if we have a user in storage
            const user = await getUserFromLocalStorage();
            if (!user?.token) {
                // No token available, let the request proceed without auth
                return config;
            }

            // Check if token is still valid
            const isTokenValid = await checkTokenExpiration();
            if (!isTokenValid) {
                console.warn('Token expired, cleaning up...');
                await handleTokenCleanup();
                // Return a rejected promise to cancel this request
                return Promise.reject(new axios.Cancel('Token expired - user logged out'));
            }

            // Token is valid, attach it to the request
            config.headers['Authorization'] = `Bearer ${user.token}`;
            return config;
        } catch (error) {
            console.error('Error in request interceptor:', error);
            return Promise.reject(error);
        }
    },
    (error) => Promise.reject(error)
);

// Response Interceptor
customFetch.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Handle cancelled requests
        if (axios.isCancel(error)) {
            console.warn('Request cancelled:', error.message);
            return Promise.reject(error);
        }

        // Handle response errors
        if (error.response) {
            console.error('API Error:', error.response.status, error.response.data);
            
            // Handle 401 Unauthorized
            if (error.response.status === 401) {
                console.log('Unauthorized response - cleaning up token');
                await handleTokenCleanup();
            }
        } else if (error.request) {
            console.error('Network Error - No response received:', error.message);
        } else {
            console.error('Request Error:', error.message);
        }
        
        return Promise.reject(error);
    }
);

export default customFetch;