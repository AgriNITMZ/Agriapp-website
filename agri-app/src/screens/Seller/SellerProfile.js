import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, Button, Divider } from 'react-native-paper';
import { CommonActions } from '@react-navigation/native';
import { User, Mail, Phone, MapPin, Edit2, LogOut, Lock, Bell, HelpCircle, Shield, ChevronRight } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
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
                        
                        Toast.show({
                            type: 'success',
                            text1: 'Logged Out',
                            text2: 'You have been successfully logged out.',
                        });
                        
                        // App.js will detect the auth change and handle navigation automatically
                        console.log('Logout completed, waiting for App.js to handle navigation...');
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
                    {/* Profile Header */}
                    <Card style={styles.profileCard}>
                        <Card.Content>
                            <View style={styles.profileHeader}>
                                <Image
                                    source={{ uri: user?.image || 'https://via.placeholder.com/100' }}
                                    style={styles.avatar}
                                />
                                <View style={styles.profileInfo}>
                                    <Text style={styles.name}>{user?.Name}</Text>
                                    <View style={styles.badgeContainer}>
                                        <View style={styles.badge}>
                                            <Text style={styles.badgeText}>Seller</Text>
                                        </View>
                                    </View>
                                </View>
                                <TouchableOpacity 
                                    style={styles.editIconButton}
                                    onPress={() => navigation.navigate('EditProfile')}
                                >
                                    <Edit2 size={20} color="#4CAF50" />
                                </TouchableOpacity>
                            </View>
                        </Card.Content>
                    </Card>

                    {/* Contact Information */}
                    <Card style={styles.sectionCard}>
                        <Card.Content>
                            <Text style={styles.sectionTitle}>Contact Information</Text>
                            <View style={styles.infoRow}>
                                <View style={styles.iconContainer}>
                                    <Mail size={20} color="#4CAF50" />
                                </View>
                                <View style={styles.infoContent}>
                                    <Text style={styles.infoLabel}>Email</Text>
                                    <Text style={styles.infoText}>{user?.email}</Text>
                                </View>
                            </View>
                            <Divider style={styles.divider} />
                            {user?.additionalDetails?.contactNo && (
                                <>
                                    <View style={styles.infoRow}>
                                        <View style={styles.iconContainer}>
                                            <Phone size={20} color="#4CAF50" />
                                        </View>
                                        <View style={styles.infoContent}>
                                            <Text style={styles.infoLabel}>Phone</Text>
                                            <Text style={styles.infoText}>{user.additionalDetails.contactNo}</Text>
                                        </View>
                                    </View>
                                    <Divider style={styles.divider} />
                                </>
                            )}
                            {user?.additionalDetails?.address && (
                                <View style={styles.infoRow}>
                                    <View style={styles.iconContainer}>
                                        <MapPin size={20} color="#4CAF50" />
                                    </View>
                                    <View style={styles.infoContent}>
                                        <Text style={styles.infoLabel}>Address</Text>
                                        <Text style={styles.infoText}>{user.additionalDetails.address}</Text>
                                    </View>
                                </View>
                            )}
                        </Card.Content>
                    </Card>

                    {/* Account Settings */}
                    <Card style={styles.sectionCard}>
                        <Card.Content>
                            <Text style={styles.sectionTitle}>Account Settings</Text>
                            
                            <TouchableOpacity 
                                style={styles.menuItem}
                                onPress={() => navigation.navigate('EditProfile')}
                            >
                                <View style={styles.menuLeft}>
                                    <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
                                        <User size={20} color="#2196F3" />
                                    </View>
                                    <Text style={styles.menuText}>Edit Profile</Text>
                                </View>
                                <ChevronRight size={20} color="#999" />
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={styles.menuItem}
                                onPress={() => navigation.navigate('ChangePassword')}
                            >
                                <View style={styles.menuLeft}>
                                    <View style={[styles.iconContainer, { backgroundColor: '#FFF3E0' }]}>
                                        <Lock size={20} color="#FF9800" />
                                    </View>
                                    <Text style={styles.menuText}>Change Password</Text>
                                </View>
                                <ChevronRight size={20} color="#999" />
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={styles.menuItem}
                                onPress={() => navigation.navigate('Notification')}
                            >
                                <View style={styles.menuLeft}>
                                    <View style={[styles.iconContainer, { backgroundColor: '#F3E5F5' }]}>
                                        <Bell size={20} color="#9C27B0" />
                                    </View>
                                    <Text style={styles.menuText}>Notifications</Text>
                                </View>
                                <ChevronRight size={20} color="#999" />
                            </TouchableOpacity>
                        </Card.Content>
                    </Card>

                    {/* Support & Help */}
                    <Card style={styles.sectionCard}>
                        <Card.Content>
                            <Text style={styles.sectionTitle}>Support & Help</Text>
                            
                            <TouchableOpacity style={styles.menuItem}>
                                <View style={styles.menuLeft}>
                                    <View style={[styles.iconContainer, { backgroundColor: '#E8F5E9' }]}>
                                        <HelpCircle size={20} color="#4CAF50" />
                                    </View>
                                    <Text style={styles.menuText}>Help Center</Text>
                                </View>
                                <ChevronRight size={20} color="#999" />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.menuItem}>
                                <View style={styles.menuLeft}>
                                    <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
                                        <Shield size={20} color="#2196F3" />
                                    </View>
                                    <Text style={styles.menuText}>Privacy Policy</Text>
                                </View>
                                <ChevronRight size={20} color="#999" />
                            </TouchableOpacity>
                        </Card.Content>
                    </Card>

                    {/* Logout Button */}
                    <TouchableOpacity 
                        style={styles.logoutButton}
                        onPress={handleLogout}
                    >
                        <LogOut size={20} color="#f44336" />
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>

                    <View style={{ height: 100 }} />
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
    profileCard: {
        margin: 15,
        marginTop: 15,
        elevation: 3,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: '#4CAF50',
    },
    profileInfo: {
        flex: 1,
        marginLeft: 15,
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    badgeContainer: {
        flexDirection: 'row',
    },
    badge: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        color: '#4CAF50',
        fontSize: 12,
        fontWeight: '600',
    },
    editIconButton: {
        padding: 8,
        backgroundColor: '#E8F5E9',
        borderRadius: 20,
    },
    sectionCard: {
        margin: 15,
        marginTop: 0,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 8,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoContent: {
        flex: 1,
        marginLeft: 15,
        justifyContent: 'center',
    },
    infoLabel: {
        fontSize: 12,
        color: '#999',
        marginBottom: 4,
    },
    infoText: {
        fontSize: 15,
        color: '#333',
    },
    divider: {
        marginVertical: 12,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuText: {
        fontSize: 15,
        color: '#333',
        marginLeft: 15,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        marginHorizontal: 15,
        marginTop: 0,
        padding: 16,
        borderRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#FFEBEE',
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#f44336',
        marginLeft: 10,
    },
});

export default SellerProfile;
