import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    SafeAreaView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import Toast from 'react-native-toast-message';
import CustomTopBar from '../../components/topBar/CustomTopBar';
import customFetch from '../../utils/axios';

const SelectAddressPage = ({ navigation, route }) => {
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const cart = route.params?.cart || []; // Ensure cart is defined

    // Fetch addresses from API
    useEffect(() => {
        const fetchAddresses = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await customFetch.get('/auth/getaddress');
                setAddresses(response.data);
            } catch (error) {
                console.error('Error fetching addresses:', error);
                setError('Failed to load addresses. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        // Fetch addresses when screen is focused
        const unsubscribe = navigation.addListener('focus', fetchAddresses);
        return unsubscribe;
    }, [navigation]);

    // Select an address
    const handleSelectAddress = (address) => {
        setSelectedAddress(address);
    };

    // Proceed to order summary
    const handleContinue = () => {
        if (selectedAddress) {
            console.log(cart)
            console.log(selectedAddress)
            navigation.navigate('OrderSummary', { cart, selectedAddress });
        } else {
            Toast.show({
                type: 'error',
                text1: 'Please select an address',
            });
        }
    };

    // Show loading state
    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
            </View>
        );
    }

    // Show error message if fetching fails
    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.retryButton}>
                    <Text style={styles.retryButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <><CustomTopBar navigation={navigation} title="Select Delivery Address" />
            <SafeAreaView style={styles.safeArea}>
                {/* Address List */}
                <FlatList
                    data={addresses}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContainer}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.addressContainer,
                                selectedAddress?._id === item._id && styles.selectedAddress,
                            ]}
                            onPress={() => handleSelectAddress(item)}
                        >
                            <Text style={styles.nameText}>{item.Name}</Text>
                            <Text style={styles.addressText}>{item.streetAddress}</Text>
                            <Text style={styles.addressText}>{item.city}, {item.state} - {item.zipCode}</Text>
                            <Text style={styles.phoneText}>Mobile: {item.mobile}</Text>
                        </TouchableOpacity>
                    )}
                />

                {/* Buttons */}
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('AddAddress')}
                >
                    <Text style={styles.addButtonText}>+ Add New Address</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
                    <Text style={styles.continueButtonText}>Continue</Text>
                </TouchableOpacity>
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    listContainer: {
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    addressContainer: {
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    selectedAddress: {
        borderColor: '#4CAF50',
        borderWidth: 2,
    },
    nameText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    addressText: {
        fontSize: 14,
        color: '#555',
        marginVertical: 2,
    },
    phoneText: {
        fontSize: 14,
        color: '#777',
        marginTop: 4,
    },
    addButton: {
        margin: 16,
        padding: 12,
        backgroundColor: '#FFA726',
        borderRadius: 4,
        alignItems: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    continueButton: {
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 12,
        backgroundColor: '#4CAF50',
        borderRadius: 4,
        alignItems: 'center',
    },
    continueButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    errorText: {
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
        marginBottom: 10,
    },
    retryButton: {
        padding: 12,
        backgroundColor: '#FF5733',
        borderRadius: 4,
        alignItems: 'center',
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default SelectAddressPage;
