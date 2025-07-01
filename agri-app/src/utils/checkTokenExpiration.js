import jwtDecode from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const checkTokenExpiration = async () => {
    const token = await AsyncStorage.getItem("jwtToken");
    if (!token) return false; // No token, user needs to log in

    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000; // Convert to seconds
        if (decoded.exp < currentTime) {
            return false; // Token expired
        }
        return true; // Token valid
    } catch (error) {
        return false; // Invalid token
    }
};

export default checkTokenExpiration;
