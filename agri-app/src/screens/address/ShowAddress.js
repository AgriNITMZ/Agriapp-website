import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    Alert,
    RefreshControl
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import customFetch from '../../utils/axios';
import CustomTopBar from '../../components/topBar/CustomTopBar';

/**
 * Address item component that displays a single address
 * @param {Object} item - Address data
 * @param {Function} onEdit - Function to handle edit action
 * @param {Function} onDelete - Function to handle delete action
 */
const AddressItem = ({ item, onEdit, onDelete }) => {
    // Format the complete address for display
    const formattedAddress = `${item.streetAddress}, ${item.city}, ${item.state} - ${item.zipCode}`;

    // Format the name (combine firstName and lastName)
    const fullName = `${item.Name}`;

    return (
        <View style={styles.addressContainer}>
            <View style={styles.addressHeader}>
                <Text style={styles.nameText}>{fullName}</Text>
            </View>

            <Text style={styles.addressText}>{formattedAddress}</Text>
            <Text style={styles.phoneText}>Mobile: {item.mobile}</Text>

            <View style={styles.actionButtonsContainer}>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => onEdit(item)}
                >
                    <Ionicons name="create-outline" size={16} color="#fff" />
                    <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => onDelete(item._id)}
                >
                    <Ionicons name="trash-outline" size={16} color="#fff" />
                    <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

/**
 * EmptyAddressView component to display when no addresses are available
 * @param {Function} onAddNew - Function to navigate to add address screen
 */
const EmptyAddressView = ({ onAddNew }) => (
    <View style={styles.emptyContainer}>
        <Ionicons name="location-outline" size={60} color="#CCCCCC" />
        <Text style={styles.emptyTitle}>No Addresses Found</Text>
        <Text style={styles.emptyText}>
            You haven't added any delivery addresses yet.
        </Text>
        <TouchableOpacity style={styles.emptyAddButton} onPress={onAddNew}>
            <Text style={styles.emptyAddButtonText}>Add New Address</Text>
        </TouchableOpacity>
    </View>
);

/**
 * Main ShowAddressPage component
 * Displays all saved addresses with options to add, edit, and delete
 */
const ShowAddressPage = ({ navigation }) => {
    // State for addresses, loading, and refresh control
    const [addresses, setAddresses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    /**
     * Fetches all saved addresses from the API
     */
    const fetchAddresses = async () => {
        try {
            setError(null);
            const response = await customFetch.get('/auth/getaddress');
            if (response.status === 200) {
                setAddresses(response.data);
            }
        } catch (err) {
            console.error('Error fetching addresses:', err);
            setError('Failed to load addresses. Please try again later.');
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to load addresses. Pull down to retry.',
            });
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    /**
     * Handles deleting an address
     * @param {String} addressId - ID of the address to delete
     */
    const handleDeleteAddress = (addressId) => {
        // Show confirmation dialog before deleting
        Alert.alert(
            'Delete Address',
            'Are you sure you want to delete this address?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setIsLoading(true);
                            const response = await customFetch.delete(`/auth/deleteaddress/${addressId}`);

                            if (response.status === 200) {
                                // Remove the deleted address from state
                                setAddresses(prevAddresses =>
                                    prevAddresses.filter(addr => addr._id !== addressId)
                                );

                                Toast.show({
                                    type: 'success',
                                    text1: 'Address Deleted',
                                    text2: 'The address has been removed successfully.',
                                });
                            }
                        } catch (err) {
                            console.error('Error deleting address:', err);
                            Toast.show({
                                type: 'error',
                                text1: 'Delete Failed',
                                text2: err.response?.data?.message || 'Failed to delete address.',
                            });
                        } finally {
                            setIsLoading(false);
                        }
                    }
                }
            ]
        );
    };

    /**
     * Navigates to edit address screen with the selected address data
     * @param {Object} addressData - Address data to edit
     */
    const handleEditAddress = (addressData) => {
        console.log(addressData)
        navigation.navigate('EditAddress', { addressData });
    };

    /**
     * Navigates to add new address screen
     */
    const handleAddAddress = () => {
        navigation.navigate('AddAddress');
    };

    /**
     * Refresh control callback
     */
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchAddresses();
    }, []);

    // Fetch addresses when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            setIsLoading(true);
            fetchAddresses();

            return () => {
                // Clean up if needed
            };
        }, [])
    );

    // Initial fetch on component mount
    useEffect(() => {
        fetchAddresses();
    }, []);

    /**
     * Render loading spinner
     */
    if (isLoading && !refreshing) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <CustomTopBar navigation={navigation} title="My Addresses" />
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#4CAF50" />
                    <Text style={styles.loadingText}>Loading addresses...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <CustomTopBar navigation={navigation} title="My Addresses" />

            {addresses.length === 0 && !isLoading ? (
                <EmptyAddressView onAddNew={handleAddAddress} />
            ) : (
                <>
                    <FlatList
                        data={addresses}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={styles.listContainer}
                        renderItem={({ item }) => (
                            <AddressItem
                                item={item}
                                onEdit={handleEditAddress}
                                onDelete={handleDeleteAddress}
                            />
                        )}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={['#4CAF50']}
                                tintColor="#4CAF50"
                            />
                        }

                    />

                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={handleAddAddress}
                    >
                        <Ionicons name="add-circle-outline" size={20} color="#fff" />
                        <Text style={styles.addButtonText}>Add New Address</Text>
                    </TouchableOpacity>
                </>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F5F5F7',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    backButton: {
        padding: 6,
    },
    headerTitle: {
        color: '#333333',
        fontSize: 18,
        fontWeight: 'bold',
    },
    placeholderView: {
        width: 34, // Match backButton width for centering title
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: '#666666',
        fontSize: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666666',
        marginBottom: 12,
        marginTop: 8,
    },
    listContainer: {
        padding: 10,
        paddingBottom: 80, // Extra space for the add button
    },
    addressContainer: {
        backgroundColor: '#FFFFFF',
        padding: 12,
        borderRadius: 6,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
        borderWidth: 1,
        borderColor: '#EEEEEE',
    },
    addressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    nameText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333333',
    },
    addressText: {
        fontSize: 15,
        marginTop: 4,
        color: '#555555',
        lineHeight: 22,
    },
    phoneText: {
        fontSize: 15,
        marginTop: 6,
        color: '#666666',
        fontWeight: '500',
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        marginTop: 12,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: '#4CAF50',
        borderRadius: 6,
        marginRight: 12,
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: '#F44336',
        borderRadius: 6,
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        marginLeft: 6,
    },
    addButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        padding: 14,
        backgroundColor: '#4CAF50',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 5,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    // Empty state styles
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#555555',
        marginTop: 16,
    },
    emptyText: {
        fontSize: 16,
        color: '#888888',
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 24,
    },
    emptyAddButton: {
        flexDirection: 'row',
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    emptyAddButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ShowAddressPage;