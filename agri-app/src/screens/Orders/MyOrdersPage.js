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
    Modal,
    ScrollView,
} from 'react-native';
import { format } from 'date-fns';
import customFetch from '../../utils/axios';
import Ionicons from '@expo/vector-icons/Ionicons';
import ShipmentTrackingButton from '../../components/ShipmentTrackingButton';

const OrderHistoryScreen = ({ navigation }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [expandedOrder, setExpandedOrder] = useState(null);

    const fetchOrders = useCallback(async () => {
        try {
            setError(null);
            const response = await customFetch.get('/order/orderhistory');
            setOrders(response.data.orders);
            
            // Debug: Log order structure
            if (response.data.orders && response.data.orders.length > 0) {
                console.log('First Order:', JSON.stringify(response.data.orders[0], null, 2));
                console.log('First Item:', response.data.orders[0].items?.[0]);
                console.log('First Product:', response.data.orders[0].items?.[0]?.product);
            }
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

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);

    const openOrderDetails = (order) => {
        setSelectedOrder(order);
        setDetailsModalVisible(true);
    };

    const closeOrderDetails = () => {
        setDetailsModalVisible(false);
        setSelectedOrder(null);
    };

    const renderOrderItem = ({ item }) => {
        const firstItem = item.items && item.items.length > 0 ? item.items[0] : null;
        const firstProduct = firstItem?.product;
        const itemCount = item.items?.length || 0;

        // Get product image - try multiple possible fields
        const getProductImage = () => {
            if (!firstProduct) return null;
            return firstProduct.thumbnail || 
                   firstProduct.image || 
                   firstProduct.images?.[0] || 
                   (firstProduct.images && firstProduct.images.length > 0 ? firstProduct.images[0] : null);
        };

        const productImage = getProductImage();

        return (
            <TouchableOpacity
                style={styles.orderCard}
                onPress={() => openOrderDetails(item)}
                activeOpacity={0.7}
            >
                {/* Status Banner */}
                <View style={[styles.statusBanner, { backgroundColor: getStatusColor(item.orderStatus) }]}>
                    <Ionicons 
                        name={
                            item.orderStatus === 'Delivered' ? 'checkmark-circle' :
                            item.orderStatus === 'Shipped' ? 'airplane' :
                            item.orderStatus === 'Processing' ? 'time' :
                            item.orderStatus === 'Cancelled' ? 'close-circle' : 'ellipse'
                        } 
                        size={16} 
                        color="#FFF" 
                    />
                    <Text style={styles.statusBannerText}>{item.orderStatus}</Text>
                </View>

                {/* Product Preview */}
                <View style={styles.productPreview}>
                    {productImage ? (
                        <Image
                            source={{ uri: productImage }}
                            style={styles.productThumbnail}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={[styles.productThumbnail, styles.placeholderImage]}>
                            <Ionicons name="image-outline" size={32} color="#9CA3AF" />
                        </View>
                    )}
                    <View style={styles.productDetails}>
                        <Text style={styles.productTitle} numberOfLines={2}>
                            {firstProduct?.name || 'Product'}
                        </Text>
                        {itemCount > 1 && (
                            <View style={styles.moreItemsBadge}>
                                <Text style={styles.moreItemsText}>+{itemCount - 1} more item{itemCount > 2 ? 's' : ''}</Text>
                            </View>
                        )}
                        <Text style={styles.orderDateText}>
                            Ordered on {formatDate(item.createdAt)}
                        </Text>
                    </View>
                </View>

                {/* Order Info Row */}
                <View style={styles.orderInfoRow}>
                    <View style={styles.infoItem}>
                        <Ionicons name="pricetag" size={16} color="#666" />
                        <Text style={styles.infoLabel}>₹{item.totalAmount}</Text>
                    </View>
                    <View style={styles.infoDivider} />
                    <View style={styles.infoItem}>
                        <Ionicons name="cube" size={16} color="#666" />
                        <Text style={styles.infoLabel}>{itemCount} item{itemCount > 1 ? 's' : ''}</Text>
                    </View>
                    <View style={styles.infoDivider} />
                    <View style={styles.infoItem}>
                        <Ionicons 
                            name={item.paymentMethod === 'cod' ? 'cash' : 'card'} 
                            size={16} 
                            color="#666" 
                        />
                        <Text style={styles.infoLabel}>{item.paymentMethod.toUpperCase()}</Text>
                    </View>
                </View>

                {/* Action Button */}
                <View style={styles.viewDetailsButton}>
                    <Text style={styles.viewDetailsText}>View Details</Text>
                    <Ionicons name="chevron-forward" size={18} color="#4F46E5" />
                </View>
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

            {/* Order Details Modal */}
            <Modal
                visible={detailsModalVisible}
                animationType="slide"
                onRequestClose={closeOrderDetails}
            >
                {selectedOrder && (
                    <SafeAreaView style={styles.modalContainer}>
                        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
                        
                        {/* Modal Header */}
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={closeOrderDetails} style={styles.closeButton}>
                                <Ionicons name="arrow-back" size={24} color="#333" />
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>Order Details</Text>
                        </View>

                        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                            {/* Status Card */}
                            <View style={[styles.detailStatusCard, { backgroundColor: getStatusColor(selectedOrder.orderStatus) }]}>
                                <Ionicons 
                                    name={
                                        selectedOrder.orderStatus === 'Delivered' ? 'checkmark-circle' :
                                        selectedOrder.orderStatus === 'Shipped' ? 'airplane' :
                                        selectedOrder.orderStatus === 'Processing' ? 'time' :
                                        selectedOrder.orderStatus === 'Cancelled' ? 'close-circle' : 'ellipse'
                                    } 
                                    size={40} 
                                    color="#FFF" 
                                />
                                <Text style={styles.detailStatusText}>{selectedOrder.orderStatus}</Text>
                            </View>

                            {/* Order Info */}
                            <View style={styles.detailCard}>
                                <Text style={styles.detailCardTitle}>Order Information</Text>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Order ID</Text>
                                    <Text style={styles.detailValue}>#{selectedOrder._id.slice(-12).toUpperCase()}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Order Date</Text>
                                    <Text style={styles.detailValue}>{formatDate(selectedOrder.createdAt)}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Payment Method</Text>
                                    <Text style={styles.detailValue}>{selectedOrder.paymentMethod.toUpperCase()}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Payment Status</Text>
                                    <Text style={[styles.detailValue, {
                                        color: selectedOrder.paymentStatus === 'Completed' ? '#34D399' :
                                               selectedOrder.paymentStatus === 'Failed' ? '#EF4444' : '#F59E0B'
                                    }]}>
                                        {selectedOrder.paymentStatus}
                                    </Text>
                                </View>
                            </View>

                            {/* Products */}
                            <View style={styles.detailCard}>
                                <Text style={styles.detailCardTitle}>Items ({selectedOrder.items.length})</Text>
                                {selectedOrder.items.map((item, index) => {
                                    const product = item.product;
                                    const productImage = product?.thumbnail || 
                                                       product?.image || 
                                                       product?.images?.[0] || 
                                                       (product?.images && product.images.length > 0 ? product.images[0] : null);
                                    
                                    return (
                                        <View key={index} style={styles.detailProductItem}>
                                            {productImage ? (
                                                <Image
                                                    source={{ uri: productImage }}
                                                    style={styles.detailProductImage}
                                                    resizeMode="cover"
                                                />
                                            ) : (
                                                <View style={[styles.detailProductImage, styles.placeholderImage]}>
                                                    <Ionicons name="image-outline" size={28} color="#9CA3AF" />
                                                </View>
                                            )}
                                            <View style={styles.detailProductInfo}>
                                                <Text style={styles.detailProductName} numberOfLines={2}>
                                                    {product?.name || 'Product'}
                                                </Text>
                                                <Text style={styles.detailProductSize}>Size: {item.size}</Text>
                                                <View style={styles.detailProductPriceRow}>
                                                    <Text style={styles.detailProductPrice}>₹{item.selectedDiscountedPrice}</Text>
                                                    {item.selectedprice !== item.selectedDiscountedPrice && (
                                                        <Text style={styles.detailProductOriginalPrice}>₹{item.selectedprice}</Text>
                                                    )}
                                                    <Text style={styles.detailProductQuantity}>Qty: {item.quantity}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>

                            {/* Shipping Address */}
                            <View style={styles.detailCard}>
                                <Text style={styles.detailCardTitle}>Delivery Address</Text>
                                <View style={styles.addressBox}>
                                    <Text style={styles.addressName}>{selectedOrder.shippingAddress.Name}</Text>
                                    <Text style={styles.addressText}>{selectedOrder.shippingAddress.streetAddress}</Text>
                                    <Text style={styles.addressText}>
                                        {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}
                                    </Text>
                                    <Text style={styles.addressText}>PIN: {selectedOrder.shippingAddress.zipcode}</Text>
                                    <Text style={styles.addressPhone}>📱 {selectedOrder.shippingAddress.mobile}</Text>
                                </View>
                            </View>

                            {/* Price Details */}
                            <View style={styles.detailCard}>
                                <Text style={styles.detailCardTitle}>Price Details</Text>
                                <View style={styles.priceRow}>
                                    <Text style={styles.priceLabel}>Price ({selectedOrder.items.length} item{selectedOrder.items.length > 1 ? 's' : ''})</Text>
                                    <Text style={styles.priceValue}>₹{selectedOrder.totalAmount}</Text>
                                </View>
                                <View style={styles.priceRow}>
                                    <Text style={styles.priceLabel}>Delivery Charges</Text>
                                    <Text style={styles.priceFree}>FREE</Text>
                                </View>
                                <View style={styles.priceDivider} />
                                <View style={styles.priceRow}>
                                    <Text style={styles.totalLabel}>Total Amount</Text>
                                    <Text style={styles.totalValue}>₹{selectedOrder.totalAmount}</Text>
                                </View>
                            </View>

                            {/* Tracking Button */}
                            {selectedOrder.shiprocketOrderId && (
                                <View style={styles.trackingContainer}>
                                    <ShipmentTrackingButton
                                        orderId={selectedOrder._id}
                                        navigation={navigation}
                                        hasShipment={selectedOrder.shiprocketOrderId}
                                    />
                                </View>
                            )}

                            {/* Action Buttons */}
                            <View style={styles.actionButtons}>
                                {selectedOrder.orderStatus !== 'Cancelled' && selectedOrder.orderStatus !== 'Delivered' && (
                                    <TouchableOpacity 
                                        style={styles.cancelButton}
                                        onPress={() => Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?')}
                                    >
                                        <Text style={styles.cancelButtonText}>Cancel Order</Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity 
                                    style={styles.helpButton}
                                    onPress={() => Alert.alert('Help', 'Contact support for assistance')}
                                >
                                    <Text style={styles.helpButtonText}>Need Help?</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={{ height: 24 }} />
                        </ScrollView>
                    </SafeAreaView>
                )}
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    topBar: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        backgroundColor: '#FFFFFF',
        elevation: 4,
        shadowColor: '#000',
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
    listContainer: {
        padding: 12,
    },
    orderCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    statusBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        gap: 6,
    },
    statusBannerText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    productPreview: {
        flexDirection: 'row',
        padding: 16,
        paddingBottom: 12,
    },
    productThumbnail: {
        width: 70,
        height: 70,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },
    placeholderImage: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
    },
    productDetails: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    productTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111827',
        marginBottom: 4,
    },
    moreItemsBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginBottom: 4,
    },
    moreItemsText: {
        fontSize: 12,
        color: '#4F46E5',
        fontWeight: '500',
    },
    orderDateText: {
        fontSize: 13,
        color: '#6B7280',
    },
    orderInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#F9FAFB',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    infoItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    infoDivider: {
        width: 1,
        height: 20,
        backgroundColor: '#D1D5DB',
    },
    infoLabel: {
        fontSize: 13,
        color: '#374151',
        fontWeight: '500',
    },
    viewDetailsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        gap: 4,
    },
    viewDetailsText: {
        fontSize: 14,
        color: '#4F46E5',
        fontWeight: '600',
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
        backgroundColor: '#4F46E5',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
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
    },
    shopButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 16,
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        elevation: 2,
    },
    closeButton: {
        marginRight: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    modalContent: {
        flex: 1,
    },
    detailStatusCard: {
        padding: 24,
        alignItems: 'center',
        marginBottom: 12,
    },
    detailStatusText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        marginTop: 12,
        textTransform: 'uppercase',
    },
    detailCard: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        marginBottom: 12,
    },
    detailCardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    detailLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    detailProductItem: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    detailProductImage: {
        width: 70,
        height: 70,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },
    detailProductInfo: {
        flex: 1,
        marginLeft: 12,
    },
    detailProductName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111827',
        marginBottom: 4,
    },
    detailProductSize: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 6,
    },
    detailProductPriceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailProductPrice: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
    },
    detailProductOriginalPrice: {
        fontSize: 13,
        color: '#9CA3AF',
        textDecorationLine: 'line-through',
    },
    detailProductQuantity: {
        fontSize: 13,
        color: '#6B7280',
        marginLeft: 'auto',
    },
    addressBox: {
        backgroundColor: '#F9FAFB',
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#4F46E5',
    },
    addressName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    addressText: {
        fontSize: 13,
        color: '#4B5563',
        lineHeight: 18,
    },
    addressPhone: {
        fontSize: 13,
        color: '#4B5563',
        marginTop: 6,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    priceLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    priceValue: {
        fontSize: 14,
        color: '#111827',
    },
    priceFree: {
        fontSize: 14,
        fontWeight: '600',
        color: '#34D399',
    },
    priceDivider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 8,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
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
        backgroundColor: '#FEE2E2',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#DC2626',
    },
    helpButton: {
        backgroundColor: '#EEF2FF',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    helpButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#4F46E5',
    },
});

export default OrderHistoryScreen;