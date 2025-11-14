import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, Button, TextInput } from 'react-native-paper';
import { CommonActions } from '@react-navigation/native';
import { User, Mail, Phone, MapPin, Edit2, LogOut } from 'lucide-react-native';
import customFetch from '../../utils/axios';
import { removeUserFromLocalStorage } from '../../utils/localStorage';
import SellerTopBar from '../../components/seller/SellerTopBar';
import SellerFooterNavigation from '../../components/seller/SellerFooterNavigation';

const SellerProfile = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const response = await customFetch.get('/auth/getuserprofile');
            setUser(response.data.user);
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await removeUserFromLocalStorage();
                        // Use CommonActions to reset navigation properly
                        navigation.dispatch(
                            CommonActions.reset({
                                index: 0,
                                routes: [{ name: 'StartScreen' }],
                            })
                        );
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading Profile...</Text>
            </View>
        );
    }

    return (
        <>
            <SellerTopBar navigation={navigation} title="Profile" />
            <View style={styles.container}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <Image
                            source={{ uri: user?.image || 'https://via.placeholder.com/100' }}
                            style={styles.avatar}
                        />
                        <Text style={styles.name}>{user?.Name}</Text>
                        <Text style={styles.accountType}>Seller Account</Text>
                    </View>

                    <Card style={styles.infoCard}>
                        <Card.Content>
                            <View style={styles.infoRow}>
                                <Mail size={20} color="#666" />
                                <Text style={styles.infoText}>{user?.email}</Text>
                            </View>
                            {user?.additionalDetails?.contactNo && (
                                <View style={styles.infoRow}>
                                    <Phone size={20} color="#666" />
                                    <Text style={styles.infoText}>{user.additionalDetails.contactNo}</Text>
                                </View>
                            )}
                        </Card.Content>
                    </Card>

                    <Button
                        mode="contained"
                        onPress={() => navigation.navigate('EditProfile')}
                        style={styles.editButton}
                        icon={() => <Edit2 size={18} color="#fff" />}
                    >
                        Edit Profile
                    </Button>

                    <Button
                        mode="outlined"
                        onPress={() => navigation.navigate('ChangePassword')}
                        style={styles.passwordButton}
                    >
                        Change Password
                    </Button>

                    <Button
                        mode="contained"
                        onPress={handleLogout}
                        style={styles.logoutButton}
                        icon={() => <LogOut size={18} color="#fff" />}
                        buttonColor="#f44336"
                    >
                        Logout
                    </Button>
                </ScrollView>
                <SellerFooterNavigation navigation={navigation} activePage="Profile" />
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        padding: 30,
        backgroundColor: '#fff',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 15,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    accountType: {
        fontSize: 14,
        color: '#4CAF50',
        marginTop: 5,
    },
    infoCard: {
        margin: 15,
        elevation: 2,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    infoText: {
        fontSize: 16,
        color: '#333',
        marginLeft: 15,
    },
    editButton: {
        margin: 15,
        backgroundColor: '#4CAF50',
    },
    passwordButton: {
        marginHorizontal: 15,
        marginBottom: 15,
        borderColor: '#4CAF50',
    },
    logoutButton: {
        marginHorizontal: 15,
        marginBottom: 100,
    },
});

export default SellerProfile;
