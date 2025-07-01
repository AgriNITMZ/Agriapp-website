import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import checkTokenExpiration from "../../utils/checkTokenExpiration";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthChecker = () => {
    const navigation = useNavigation();

    useEffect(() => {
        const verifyAuth = async () => {
            const isValid = await checkTokenExpiration();
            if (!isValid) {
                await AsyncStorage.removeItem("jwtToken"); // Remove old token
                navigation.replace("Login"); // Navigate to login screen
            }
        };

        verifyAuth();
    }, [navigation]);

    return null; // No UI needed
};

export default AuthChecker;
