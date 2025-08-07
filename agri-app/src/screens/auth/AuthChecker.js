import { useEffect, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import checkTokenExpiration from "../../utils/checkTokenExpiration";
import { removeUserFromLocalStorage, getUserFromLocalStorage } from "../../utils/localStorage";

const AuthChecker = () => {
    const navigation = useNavigation();
    const hasChecked = useRef(false); // Prevent multiple checks

    useEffect(() => {
        const verifyAuth = async () => {
            // Prevent multiple simultaneous auth checks
            if (hasChecked.current) return;
            hasChecked.current = true;

            try {
                // First check if user exists in storage
                const user = await getUserFromLocalStorage();
                if (!user || !user.token) {
                    console.log('No user or token found, redirecting to login');
                    navigation.replace("Login");
                    return;
                }

                // Then check if token is valid
                const isValid = await checkTokenExpiration();
                if (!isValid) {
                    console.log('Token invalid/expired, cleaning up and redirecting to login');
                    await removeUserFromLocalStorage();
                    navigation.replace("Login");
                } else {
                    console.log('Token is valid, user authenticated');
                }
            } catch (error) {
                console.error('Error during auth verification:', error);
                // On error, clean up and redirect to login
                await removeUserFromLocalStorage();
                navigation.replace("Login");
            }
        };

        // Add a small delay to ensure navigation is ready
        const timeoutId = setTimeout(verifyAuth, 100);
        
        return () => {
            clearTimeout(timeoutId);
        };
    }, [navigation]);

    return null; // No UI needed
};

export default AuthChecker;