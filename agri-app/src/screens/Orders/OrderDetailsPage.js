import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    Image,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    Alert,
    Linking,
} from 'react-native';
import { format } from 'date-fns';
import customFetch from '../../utils/axios';
import Ionicons from '@expo/vector-icons/Ionicons';
import ShipmentTrackingButton from '../../components/ShipmentTrackingButton';

const OrderDetailsPage = ({ route, navigation }) => {
    const { orderId } = route.params;
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrderDetails();
    }, []);

    const fetchOrderDetails = async () => {
        try {
            const response = await customFetch.get(`/order/${orderId}`);
            setOrder(response.data.order);
        } catch (error) {
            console.error('Error fetching order details:', error);
            Alert.alert('Error', 'Failed to load order details');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return format(new Date(dateString), 'EEE, MMM dd, yyyy');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered':
                return '#388E3C';
            case 'Shipped':
                return '#1976D2';
            case 'Processing':
                return '#F57C00';
            case 'Cancelled':
                return '#D32F2F';
            default:
                return '#7B1FA2';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Delivered':
                return 'checkmark-circle';
            case 'Shipped':
                return 'airplane';
            case 'Processing':
                return 'time';
            case 'Cancelled':
                return 'close-circle';
            default:
                return 'ellipse';
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <StatusBar barStyle="light-content" backgroundColor="#2874F0" />
                <ActivityIndicator size="large" color="#2874F0" />
                <Text style={styles.loadingText}>Loading order details...</Text>
            </SafeAreaView>
        );
    }

    if (!order) {
        return null;
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#2874F0" />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Order Details</Text>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Status Card */}
                <View style={[styles.statusCard, { backgroundColor: getStatusColor(order.orderStatus) }]}>
                    <View style={styles.statusIconContainer}>
                        <Ionicons name={getStatusIcon(order.orderStatus)} size={48} color="#FFFFFF" />
                    </View>
                    <Text style={styles.statusTitle}>{order.orderStatus}</Text>
                    <Text style={styles.statusSubtitle}>
                        {order.orderStatus === 'Delivered' ? 'Your order has been delivered' :
                         order.orderStatus === 'Shipped' ? 'Your order is on the way' :
                         order.orderStatus === 'Processing' ? 'Your order is being prepared' :
                         order.orderStatus === 'Cancelled' ? 'Your order has been cancelled' :
                         'Your order has been placed'}
                    </Text>
                </View>

                {/* Order Info Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="receipt" size={20} color="#2874F0" />
                        <Text style={styles.cardTitle}>Order Information</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Order ID</Text>
                        <Text style={styles.infoValue}>#{order._id.slice(-12).toUpperCase()}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Order Date</Text>
                        <Text style={styles.infoValue}>{formatDate(order.createdAt)}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Payment Method</Text>
                        <View style={styles.paymentBadge}>
                            <Ionicons 
                                name={order.paymentMethod === 'cod' ? 'cash' : 'card'} 
                                size={14} 
                                color="#2874F0" 
                            />
                            <Text style={styles.paymentText}>{order.paymentMethod.toUpperCase()}</Text>
                        </View>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Payment Status</Text>
                        <Text style={[styles.paymentStatusText, {
                            color: order.paymentStatus === 'Completed' ? '#388E3C' :
                                   order.paymentStatus === 'Failed' ? '#D32F2F' : '#F57C00'
                        }]}>
                            {order.paymentStatus}
                        </Text>
                    </View>
                </View>

                {/* Products Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="cube" size={20} color="#2874F0" />
                        <Text style={styles.cardTitle}>Items ({order.items.length})</Text>
                    </View>
                    {order.items.map((item, index) => (
                        <View key={index} style={styles.productItem}>
                            <Image
                                source={{ uri: item.product?.thumbnail || item.product?.image }}
                                style={styles.productImage}
                                defaultSource={require('../../assets/images/placeholder/product.png')}
                            />
                            <View style={styles.productInfo}>
                                <Text style={styles.productName} numberOfLines={2}>
                                    {item.product?.name || 'Product'}
                                </Text>
                                <Text style={styles.productSize}>Size: {item.size}</Text>
                                <View style={styles.productPriceRow}>
                                    <Text style={styles.productPrice}>₹{item.selectedDiscountedPrice}</Text>
                                    {item.selectedprice !== item.selectedDiscountedPrice && (
                                        <Text style={styles.productOriginalPrice}>₹{item.selectedprice}</Text>
                                    )}
                                    <Text style={styles.productQuantity}>Qty: {item.quantity}</Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Shipping Address Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="location" size={20} color="#2874F0" />
                        <Text style={styles.cardTitle}>Delivery Address</Text>
                    </View>
                    <View style={styles.addressBox}>
                        <Text style={styles.addressName}>{order.shippingAddress.Name}</Text>
                        <Text style={styles.addressText}>
                            {order.shippingAddress.streetAddress}
                        </Text>
                        <Text style={styles.addressText}>
                            {order.shippingAddress.city}, {order.shippingAddress.state}
                        </Text>
                        <Text style={styles.addressText}>
                            PIN: {order.shippingAddress.zipcode}
                        </Text>
                        <View style={styles.phoneRow}>
                            <Ionicons name="call" size={16} color="#2874F0" />
                            <Text style={styles.phoneText}>{order.shippingAddress.mobile}</Text>
                        </View>
                    </View>
                </View>

                {/* Price Details Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="pricetag" size={20} color="#2874F0" />
                        <Text style={styles.cardTitle}>Price Details</Text>
                    </View>
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Price ({order.items.length} item{order.items.length > 1 ? 's' : ''})</Text>
                        <Text style={styles.priceValue}>₹{order.totalAmount}</Text>
                    </View>
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Delivery Charges</Text>
                        <Text style={styles.priceFree}>FREE</Text>
                    </View>
                    <View style={styles.priceDivider} />
                    <View style={styles.priceRow}>
                        <Text style={styles.totalLabel}>Total Amount</Text>
                        <Text style={styles.totalValue}>₹{order.totalAmount}</Text>
                    </View>
                </View>

                {/* Tracking Button */}
                {order.shiprocketOrderId && (
                    <View style={styles.trackingContainer}>
                        <ShipmentTrackingButton
                            orderId={order._id}
                            navigation={navigation}
                            hasShipment={order.shiprocketOrderId}
                        />
                    </View>
                )}

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    {order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Delivered' && (
                        <TouchableOpacity 
                            style={styles.cancelButton}
                            onPress={() => Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?')}
                        >
                            <Ionicons name="close-circle-outline" size={20} color="#D32F2F" />
                            <Text style={styles.cancelButtonText}>Cancel Order</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity 
                        style={styles.helpButton}
                        onPress={() => Alert.alert('Help', 'Contact support for assistance')}
                    >
                        <Ionicons name="help-circle-outline" size={20} color="#2874F0" />
                        <Text style={styles.helpButtonText}>Need Help?</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 24 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F1F3F6',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#F1F3F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#878787',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: '#2874F0',
        elevation: 4,
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    scrollView: {
        flex: 1,
    },
    statusCard: {
        padding: 32,
        alignItems: 'center',
        marginBottom: 12,
    },
    statusIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    statusTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    statusSubtitle: {
        fontSize: 15,
        color: '#FFFFFF',
        opacity: 0.9,
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#FFFFFF',
        marginBottom: 12,
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#212121',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    infoLabel: {
        fontSize: 14,
        color: '#878787',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#212121',
    },
    paymentBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 4,
        gap: 4,
    },
    paymentText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#2874F0',
    },
    paymentStatusText: {
        fontSize: 14,
        fontWeight: '600',
    },
    productItem: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 6,
        backgroundColor: '#F1F3F6',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    productInfo: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    productName: {
        fontSize: 15,
        fontWeight: '500',
        color: '#212121',
        lineHeight: 20,
        marginBottom: 4,
    },
    productSize: {
        fontSize: 13,
        color: '#878787',
        marginBottom: 6,
    },
    productPriceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: '#212121',
    },
    productOriginalPrice: {
        fontSize: 14,
        color: '#878787',
        textDecorationLine: 'line-through',
    },
    productQuantity: {
        fontSize: 13,
        color: '#878787',
        marginLeft: 'auto',
    },
    addressBox: {
        backgroundColor: '#FAFAFA',
        padding: 16,
        borderRadius: 6,
        borderLeftWidth: 3,
        borderLeftColor: '#2874F0',
    },
    addressName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#212121',
        marginBottom: 8,
    },
    addressText: {
        fontSize: 14,
        color: '#212121',
        lineHeight: 20,
        marginBottom: 4,
    },
    phoneRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        gap: 6,
    },
    phoneText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2874F0',
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    priceLabel: {
        fontSize: 14,
        color: '#212121',
    },
    priceValue: {
        fontSize: 14,
        color: '#212121',
    },
    priceFree: {
        fontSize: 14,
        fontWeight: '600',
        color: '#388E3C',
    },
    priceDivider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 8,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#212121',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#212121',
    },
    trackingContainer: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        marginBottom: 12,
    },
    actionButtons: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        marginBottom: 12,
        gap: 12,
    },
    cancelButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#D32F2F',
        gap: 8,
    },
    cancelButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#D32F2F',
    },
    helpButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#2874F0',
        gap: 8,
    },
    helpButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2874F0',
    },
});

export default OrderDetailsPage;
