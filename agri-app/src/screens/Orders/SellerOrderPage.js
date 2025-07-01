import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import CustomTopBar from '../../components/topBar/CustomTopBar';
const SellerOrdersPage = (navigation) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                // Retrieve the token from AsyncStorage
                const token = await AsyncStorage.getItem('token');
                if (!token) {
                    Alert.alert('Error', 'User is not authenticated!');
                    return;
                }

                const response = await axios.get('http://172.16.1.240:4000/api/seller/orders', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setOrders(response.data);
            } catch (error) {
                console.error(error);
                Alert.alert('Error', 'Failed to fetch orders. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const renderOrderItem = ({ item }) => (
        <View style={styles.orderCard}>
            <Text style={styles.orderId}>Order ID: {item._id}</Text>
            <Text style={styles.sectionTitle}>Shipping Address</Text>
            <View style={styles.shippingAddress}>
                <Text style={styles.addressText}>
                    {item.shippingAddress.firstName} {item.shippingAddress.lastName}
                </Text>
                <Text style={styles.addressText}>{item.shippingAddress.streetAddress}</Text>
                <Text style={styles.addressText}>
                    {item.shippingAddress.city}, {item.shippingAddress.state} - {item.shippingAddress.zipCode}
                </Text>
                <Text style={styles.addressText}>Mobile: {item.shippingAddress.mobile}</Text>
            </View>

            <Text style={styles.sectionTitle}>Ordered Items</Text>
            {item.orderItems.map((orderItem) => (
                <View key={orderItem._id} style={styles.productCard}>
                    <Image source={{ uri: orderItem.product.imagesUrl[0] }} style={styles.productImage} />
                    <View style={styles.productDetails}>
                        <Text style={styles.productTitle}>{orderItem.product.title}</Text>
                        <Text style={styles.productSize}>Size: {orderItem.size}</Text>
                        <Text style={styles.productQuantity}>Quantity: {orderItem.quantity}</Text>
                        <Text style={styles.productPrice}>
                            Price: ₹{orderItem.discountedPrice} <Text style={styles.originalPrice}>₹{orderItem.price}</Text>
                        </Text>
                    </View>
                </View>
            ))}
        </View>
    );

    return (
        <><CustomTopBar navigation={navigation} title={"Orders Received"} />
            <ScrollView style={styles.container}>
                {loading ? (
                    <ActivityIndicator size="large" color="#00f" />
                ) : orders.length > 0 ? (
                    <FlatList
                        data={orders}
                        renderItem={renderOrderItem}
                        keyExtractor={(item) => item._id}
                    />
                ) : (
                    <Text style={styles.noOrdersText}>No orders found.</Text>
                )}
            </ScrollView>
        </>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f9f9', padding: 10 },
    header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#333', textAlign: 'center' },
    orderCard: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, elevation: 2 },
    orderId: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#444' },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginVertical: 10, color: '#555' },
    shippingAddress: { backgroundColor: '#f1f1f1', padding: 10, borderRadius: 8 },
    addressText: { fontSize: 14, marginVertical: 2, color: '#555' },
    productCard: { flexDirection: 'row', backgroundColor: '#f9f9f9', marginVertical: 8, padding: 10, borderRadius: 8 },
    productImage: { width: 80, height: 80, borderRadius: 8 },
    productDetails: { flex: 1, marginLeft: 10 },
    productTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    productSize: { fontSize: 14, color: '#666' },
    productQuantity: { fontSize: 14, color: '#666' },
    productPrice: { fontSize: 14, color: '#333' },
    originalPrice: { textDecorationLine: 'line-through', color: '#999' },
    noOrdersText: { textAlign: 'center', fontSize: 16, color: '#777', marginTop: 20 },
});

export default SellerOrdersPage;
