import { jwtDecode } from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";


const checkTokenExpiration = async () => {
    try {
        // Retrieve the user object (typically contains token and user info)
        const userData = await AsyncStorage.getItem("user");
        if (!userData) return false; // No user data found — user is likely not logged in

        // Parse the JSON string to extract the token
        const { token } = JSON.parse(userData);
        if (!token) return false; // Token field missing — treat as invalid

        // Decode the JWT token to get its payload, including expiration time (exp)
        const { exp } = jwtDecode(token);

        // Get the current Unix time in seconds
        const currentTime = Date.now() / 1000;

        // Add a buffer time to avoid using tokens that are about to expire
        const bufferTime = 60; // 60 seconds (1 minute)

        // If the token is already expired or will expire soon, return false
        if (exp < currentTime + bufferTime) {
            console.log("Token is expired or about to expire");
            return false;
        }

        // Token is still valid
        return true;
    } catch (err) {
        // Handle any unexpected errors gracefully
        console.error("Token check error:", err);
        return false; // If anything fails, treat the token as invalid
    }
};

export default checkTokenExpiration;
