import AsyncStorage from '@react-native-async-storage/async-storage';

// Save user to AsyncStorage
export const addUserToLocalStorage = async (user) => {
    try {
        await AsyncStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
        console.error('Error saving user to storage:', error);
    }
};

// Remove user from AsyncStorage
export const removeUserFromLocalStorage = async () => {
    try {
        await AsyncStorage.removeItem('user');
    } catch (error) {
        console.error('Error removing user from storage:', error);
    }
};

// Get user from AsyncStorage
export const getUserFromLocalStorage = async () => {
    try {
        const result = await AsyncStorage.getItem('user');
        return result ? JSON.parse(result) : null;
    } catch (error) {
        console.error('Error retrieving user from storage:', error);
        return null;
    }
};
