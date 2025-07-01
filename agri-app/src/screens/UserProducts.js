import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator, Modal, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import CustomTopBar from '../components/topBar/CustomTopBar';
export default function UserProducts({ navigation }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const fetchProducts = async () => {
        try {
            // const token = await AsyncStorage.getItem('token');
            // const response = await axios.get('http://172.16.1.240:4000/api/users/my-products', {
            //     headers: { Authorization: `Bearer ${token}` },
            // });
            // setProducts(response.data.products);

        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to fetch products.');
        } finally {
            setLoading(false);
        }
    };

    const dummyDelete = (productId) => {
        Alert.alert('Confirm Delete', 'Are you sure you want to delete this product?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                onPress: () => {
                    setProducts((prevProducts) => prevProducts.filter((product) => product._id !== productId));
                    Alert.alert('Success', 'Product deleted.');
                },
            },
        ]);
    };

    const handleEdit = (product) => {
        navigation.navigate('EditPost', { productId: product._id });
    };

    const openProductDetails = (product) => {
        setSelectedProduct(product);
        setModalVisible(true);
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchProducts();
        }, [])
    );

    useEffect(() => {
        fetchProducts();
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
            </View>
        );
    }

    return (
        <><CustomTopBar navigation={navigation} title={"My Products"} />
            <View style={styles.container}>

                {products.length > 0 ? (
                    <FlatList
                        data={products}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item }) => (
                            <View style={styles.card}>
                                <Image source={{ uri: item.imagesUrl[0] }} style={styles.productImage} />
                                <View style={styles.cardContent}>
                                    <Text style={styles.productTitle}>{item.title}</Text>
                                    <View style={styles.buttonContainer}>
                                        <TouchableOpacity
                                            style={styles.sizeButton}
                                            onPress={() => openProductDetails(item)}
                                        >
                                            <Text style={styles.sizeButtonText}>View Details</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.iconButton}
                                            onPress={() => handleEdit(item)}
                                        >
                                            <MaterialIcons name="edit" size={24} color="#4CAF50" />
                                            <Text style={styles.iconText}>Edit</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.iconButton}
                                            onPress={() => dummyDelete(item._id)}
                                        >
                                            <Ionicons name="trash-outline" size={24} color="#f44336" />
                                            <Text style={styles.iconText}>Delete</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        )}
                    />
                ) : (
                    <Text style={styles.noProductsText}>You haven't posted any products yet.</Text>
                )}
                <Modal
                    visible={modalVisible}
                    animationType="slide"
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalHeading}>Product Details</Text>
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Ionicons name="close" size={28} color="#333" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView contentContainerStyle={styles.modalContent}>
                            {selectedProduct && (
                                <>
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        style={styles.imageContainer}
                                    >
                                        {selectedProduct.imagesUrl.map((url, index) => (
                                            <Image
                                                key={index}
                                                source={{ uri: url }}
                                                style={styles.modalImage}
                                            />
                                        ))}
                                    </ScrollView>
                                    <View style={styles.productInfo}>
                                        <Text style={styles.modalTitle}>{selectedProduct.title}</Text>
                                        <Text style={styles.modalBrand}>{selectedProduct.brand}</Text>
                                        <Text style={styles.modalDescription}>
                                            {selectedProduct.description}
                                        </Text>
                                    </View>
                                    <View style={styles.section}>
                                        <Text style={styles.sectionHeader}>Sizes Available</Text>
                                        {selectedProduct.sizes.map((size) => (
                                            <View key={size._id} style={styles.sizeDetail}>
                                                <Text style={styles.sizeText}>Name: {size.name}</Text>
                                                <Text style={styles.sizeText}>Price: ₹{size.price}</Text>
                                                <Text style={styles.sizeText}>
                                                    Discounted Price: ₹{size.discountedPrice}
                                                </Text>
                                                <Text style={styles.sizeText}>Quantity: {size.quantity}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </>
                            )}
                        </ScrollView>
                    </View>
                </Modal>


            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        backgroundColor: '#FFFFFF',
        elevation: 4,
    },
    backButton: {
        marginLeft: 10,
    },
    sectionTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 10,
        marginVertical: 10,
        marginHorizontal: 10,
        elevation: 3,
    },
    productImage: {
        width: 80,
        height: 100,
    },
    cardContent: {
        flex: 1,
        padding: 10,
    },
    productTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    sizeButton: {
        padding: 8,
        backgroundColor: '#4CAF50',
        borderRadius: 5,
    },
    sizeButtonText: {
        color: '#fff',
        fontSize: 12,
    },
    iconButton: {
        marginHorizontal: 5,
    },
    iconButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 15,
    },
    iconText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 5,
    },
    noProductsText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#666',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 15,
    },
    modalHeading: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    modalCloseButton: {
        padding: 10,
    },
    modalContent: {
        padding: 20,
    },
    imageContainer: {
        marginVertical: 20,
    },
    modalImage: {
        width: 220,
        height: 200,
        borderRadius: 10,
        marginRight: 5,
        // borderWidth: 1,
        // borderColor: '#4CAF50',
    },
    productInfo: {
        backgroundColor: '#e8f5e9',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#4CAF50',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    modalBrand: {
        fontSize: 16,
        fontWeight: '500',
        color: '#4CAF50',
        textAlign: 'center',
        marginVertical: 10,
    },
    modalDescription: {
        fontSize: 14,
        color: '#555',
        textAlign: 'center',
        marginBottom: 20,
    },
    section: {
        backgroundColor: '#e8f5e9',
        borderRadius: 10,
        padding: 15,
        borderWidth: 1,
        borderColor: '#4CAF50',
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginBottom: 10,
    },
    sizeDetail: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#c8e6c9',
        elevation: 2,
    },
    sizeText: {
        fontSize: 14,
        color: '#333',
        marginVertical: 2,
    },
});
