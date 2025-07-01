import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from 'react-native';
import { format } from 'date-fns';
import customFetch from '../../utils/axios';
import Ionicons from '@expo/vector-icons/Ionicons';

const OrderHistoryScreen = ({ navigation }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [expandedOrder, setExpandedOrder] = useState(null);

    const fetchOrders = useCallback(async () => {
        try {
            setError(null);
            const response = await customFetch.get('/order/orderhistoryapp');
            setOrders(response.data.orders);
            console.log(response.data.orders)
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to fetch orders');
            Alert.alert('Error', 'Something went wrong while fetching your orders.');
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchOrders();
    }, [fetchOrders]);

    const toggleOrderExpand = (orderId) => {
        if (expandedOrder === orderId) {
            setExpandedOrder(null);
        } else {
            setExpandedOrder(orderId);
        }
    };

    const formatDate = (dateString) => {
        return format(new Date(dateString), 'MMM dd, yyyy');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered':
                return '#34D399'; // green
            case 'Shipped':
                return '#60A5FA'; // blue
            case 'Processing':
                return '#F59E0B'; // yellow
            case 'Cancelled':
                return '#EF4444'; // red
            default:
                return '#A78BFA'; // purple for pending
        }
    };

    const getPaymentStatusIcon = (method) => {
        if (method === 'COD') {
            return '💵';
        } else {
            return '💳';
        }
    };

    const renderOrderItem = ({ item }) => {
        const isExpanded = expandedOrder === item._id;

        return (
            <TouchableOpacity
                style={[styles.orderCard, isExpanded && styles.expandedCard]}
                onPress={() => toggleOrderExpand(item._id)}
                activeOpacity={0.9}
            >
                <View style={styles.orderHeader}>
                    <View>
                        <Text style={styles.orderId}>Order #{item._id.slice(-8)}</Text>
                        <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
                    </View>
                    <View style={styles.statusContainer}>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.orderStatus) }]}>
                            <Text style={styles.statusText}>{item.orderStatus}</Text>
                        </View>
                        <Text style={styles.paymentMethod}>
                            {getPaymentStatusIcon(item.paymentMethod)} {item.paymentMethod}
                        </Text>
                    </View>
                </View>

                <View style={styles.divider} />

                {!isExpanded ? (
                    <View style={styles.previewContainer}>
                        <Image
                            source={{ uri: item.items[0].imageUrl }}
                            style={styles.previewImage}
                            defaultSource={require('../../assets/images/placeholder/product.png')}
                        />
                        <View style={styles.previewInfo}>
                            <Text style={styles.previewProduct} numberOfLines={1}>
                                {item.items[0].productName}
                            </Text>
                            <Text style={styles.previewSize}>
                                {item.items.length > 1 ? `+${item.items.length - 1} more items` : `Size: ${item.items[0].size}`}
                            </Text>
                        </View>
                        <View style={styles.previewAmount}>
                            <Text style={styles.totalAmount}>₹{item.totalAmount}</Text>
                            <Text style={styles.expandIndicator}>▼</Text>
                        </View>
                    </View>
                ) : (
                    <View style={styles.expandedContent}>
                        <FlatList
                            data={item.items}
                            keyExtractor={(product, index) => `${product.productId}-${index}`}
                            renderItem={({ item: product }) => (
                                <View style={styles.productItem}>
                                    <Image
                                        source={{ uri: product.imageUrl }}
                                        style={styles.productImage}
                                        defaultSource={require('../../assets/images/placeholder/product.png')}
                                    />
                                    <View style={styles.productInfo}>
                                        <Text style={styles.productName} numberOfLines={2}>{product.productName}</Text>
                                        <Text style={styles.productSize}>Size: {product.size}</Text>
                                        <View style={styles.priceContainer}>
                                            <Text style={styles.discountedPrice}>₹{product.discountedPrice}</Text>
                                            {product.price !== product.discountedPrice && (
                                                <Text style={styles.originalPrice}>₹{product.price}</Text>
                                            )}
                                            <Text style={styles.quantity}>Qty: {product.quantity}</Text>
                                        </View>
                                    </View>
                                </View>
                            )}
                            ItemSeparatorComponent={() => <View style={styles.itemDivider} />}
                            scrollEnabled={false}
                        />

                        <View style={styles.divider} />

                        <View style={styles.addressContainer}>
                            <Text style={styles.addressTitle}>Delivery Address</Text>
                            <Text style={styles.addressName}>{item.shippingAddress.Name}</Text>
                            <Text style={styles.addressText}>
                                {item.shippingAddress.streetAddress}, {item.shippingAddress.city}, {'\n'}
                                {item.shippingAddress.state} - {item.shippingAddress.zipCode}
                            </Text>
                            <Text style={styles.addressPhone}>📱 {item.shippingAddress.mobile}</Text>
                        </View>

                        <View style={styles.orderSummary}>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Payment Status</Text>
                                <Text style={[styles.summaryValue, {
                                    color: item.paymentStatus === 'Completed' ? '#34D399' :
                                        item.paymentStatus === 'Failed' ? '#EF4444' : '#A78BFA'
                                }]}>
                                    {item.paymentStatus}
                                </Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Total Amount</Text>
                                <Text style={styles.totalAmountLarge}>₹{item.totalAmount}</Text>
                            </View>
                        </View>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.trackButton}>
                                <Text style={styles.trackButtonText}>Track Order</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.supportButton}>
                                <Text style={styles.supportButtonText}>Help & Support</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.containerCenter}>
                <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
                <ActivityIndicator size="large" color="#4F46E5" />
                <Text style={styles.loadingText}>Loading your orders...</Text>
            </SafeAreaView>
        );
    }

    if (error && orders.length === 0) {
        return (
            <SafeAreaView style={styles.containerCenter}>
                <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
                <Text style={styles.errorTitle}>Oops!</Text>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchOrders}>
                    <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => navigation.navigate("HomePage")} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color="#333" />
                </TouchableOpacity>
                <Text style={styles.sectionTitle}>My Orders</Text>
            </View>

            {orders.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Image
                        source={require('../../assets/images/placeholder/empty-box.png')}
                        style={styles.emptyImage}
                    />
                    <Text style={styles.emptyTitle}>No Orders Yet</Text>
                    <Text style={styles.emptyText}>You haven't placed any orders yet. Start shopping to see your orders here.</Text>
                    <TouchableOpacity style={styles.shopButton} onPress={() => navigation.navigate("HomePage")}>
                        <Text style={styles.shopButtonText}>Start Shopping</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item._id}
                    renderItem={renderOrderItem}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#4F46E5']}
                            tintColor={'#4F46E5'}
                        />
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    topBar: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center', // Center content horizontally
        paddingVertical: 10,
        backgroundColor: '#FFFFFF',
        elevation: 4, // Shadow for Android
        shadowColor: '#000', // Shadow for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    backButton: {
        position: 'absolute',
        left: 10,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    containerCenter: {
        flex: 1,
        backgroundColor: '#F5F7FA',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    header: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
    },
    listContainer: {
        padding: 12,
    },
    orderCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    expandedCard: {
        shadowOpacity: 0.1,
        elevation: 5,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    orderId: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
    },
    orderDate: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 2,
    },
    statusContainer: {
        alignItems: 'flex-end',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginBottom: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    paymentMethod: {
        fontSize: 12,
        color: '#6B7280',
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 12,
    },
    previewContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    previewImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },
    previewInfo: {
        flex: 1,
        paddingHorizontal: 12,
    },
    previewProduct: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111827',
    },
    previewSize: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 2,
    },
    previewAmount: {
        alignItems: 'flex-end',
    },
    totalAmount: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
    },
    expandIndicator: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
    },
    expandedContent: {
        marginTop: 4,
    },
    productItem: {
        flexDirection: 'row',
        paddingVertical: 12,
    },
    itemDivider: {
        height: 1,
        backgroundColor: '#F3F4F6',
    },
    productImage: {
        width: 70,
        height: 70,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },
    productInfo: {
        flex: 1,
        marginLeft: 12,
    },
    productName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111827',
    },
    productSize: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 2,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    discountedPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    originalPrice: {
        fontSize: 13,
        color: '#9CA3AF',
        textDecorationLine: 'line-through',
        marginLeft: 6,
        marginRight: 8,
    },
    quantity: {
        fontSize: 13,
        color: '#6B7280',
        marginLeft: 'auto',
    },
    addressContainer: {
        padding: 12,
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        marginTop: 8,
    },
    addressTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 6,
    },
    addressName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111827',
    },
    addressText: {
        fontSize: 13,
        lineHeight: 18,
        color: '#4B5563',
        marginTop: 2,
    },
    addressPhone: {
        fontSize: 13,
        color: '#4B5563',
        marginTop: 6,
    },
    orderSummary: {
        marginTop: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '500',
    },
    totalAmountLarge: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    trackButton: {
        flex: 1,
        backgroundColor: '#1F2937',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginRight: 8,
    },
    trackButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
    supportButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginLeft: 8,
    },
    supportButtonText: {
        color: '#4B5563',
        fontWeight: '600',
        fontSize: 14,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6B7280',
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
    },
    errorText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#1F2937',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyImage: {
        width: 150,
        height: 150,
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 20,
    },
    shopButton: {
        backgroundColor: '#4F46E5',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
    },
    shopButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 16,
    },
});

export default OrderHistoryScreen;