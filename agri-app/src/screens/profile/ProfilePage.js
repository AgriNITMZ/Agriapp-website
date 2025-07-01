import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import CustomTopBar from '../../components/topBar/CustomTopBar';
import FooterNavigation from '../../components/FooterNavigation';
import customFetch from '../../utils/axios';

const profileIcon = require('../../assets/images/placeholder/user_icon.png');

export default function ProfilePage({ navigation }) {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [role, setRole] = useState('');
    const dicebearURL = "https:api.dicebear.com"
    // Fetch user profile data from the API
    const fetchProfileData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await customFetch.get('auth/getuserprofile');
            setProfileData(response.data.user);
            setRole(response.data.user.accountType);
        } catch (error) {
            setError("Failed to load profile. Please try again later.");
            console.error("Failed to fetch profile data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Refresh profile data when the page comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchProfileData();
        }, [])
    );

    // Display loading screen while fetching data
    if (loading) {
        return <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />;
    }

    // Display error message if API call fails
    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchProfileData}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <>
            <CustomTopBar navigation={navigation} title={"My Profile"} />
            <View style={styles.container}>
                {/* Profile Information Card */}
                <View style={styles.profileCard}>
                    <Image
                        source={profileData?.image.startsWith(dicebearURL) ? profileIcon : { uri: profileData.image }}
                        style={styles.profileImage}
                        resizeMode="cover"
                    />
                    <Text style={styles.profileName}>{profileData?.Name || "N/A"}</Text>
                    <Text style={styles.profileEmail}>{profileData?.email || "N/A"}</Text>
                    <Text style={styles.profileRole}>Account Type: {profileData?.accountType || "N/A"}</Text>
                </View>

                {/* Options List */}
                <ScrollView style={styles.optionsContainer}>
                    <ProfileOption icon="user-edit" label="Edit Profile" onPress={() => navigation.navigate('EditProfile', { profileData })} />
                    <ProfileOption icon="map-marker-alt" label="My Address" onPress={() => navigation.navigate('ShowAddress', { addresses: profileData?.addresses })} />
                    <ProfileOption icon="shopping-bag" label="My Orders" onPress={() => navigation.navigate('MyOrders')} />
                    {role === 'Seller' && <ProfileOption icon="store" label="My Products" onPress={() => navigation.navigate('UserProducts')} />}
                    {role === 'Seller' && <ProfileOption icon="clipboard-list" label="Orders Received" onPress={() => navigation.navigate('SellerOrder')} />}
                    <ProfileOption icon="shopping-cart" label="My Cart" onPress={() => navigation.navigate('Cart')} />
                    <ProfileOption icon="heart" label="My Wishlist" onPress={() => navigation.navigate('Wishlist')} />
                    <ProfileOption icon="lock" label="Change Password" onPress={() => navigation.navigate('ChangePassword', { email: profileData?.email })} />
                    <ProfileOption icon="sign-out-alt" label="Logout" onPress={() => navigation.navigate('Logout')} />
                </ScrollView>


                {/* Footer Navigation */}
                <FooterNavigation navigation={navigation} activePage={"Profile"} role={role} />
            </View>
        </>
    );
}

// Reusable component for profile options
const ProfileOption = ({ icon, label, onPress }) => (
    <TouchableOpacity style={styles.optionItem} onPress={onPress}>
        <FontAwesome5 name={icon} size={20} color="#777" />
        <Text style={styles.optionText}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F8F8',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        color: 'red',
    },
    retryButton: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#4CAF50',
        borderRadius: 5,
    },
    retryButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    profileCard: {
        alignItems: 'center',
        backgroundColor: '#FFF',
        margin: 10,
        padding: 10,
        borderRadius: 10,
        elevation: 3,
    },
    profileImage: {
        width: 90,
        height: 90,
        borderRadius: 45,
        marginBottom: 10,
    },
    profileName: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    profileEmail: {
        color: '#555',
        fontSize: 16,
    },
    profileRole: {
        color: '#555',
        fontSize: 14,
        marginVertical: 2,
    },
    optionsContainer: {
        paddingHorizontal: 15,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    optionText: {
        marginLeft: 15,
        fontSize: 16,
    },
});
