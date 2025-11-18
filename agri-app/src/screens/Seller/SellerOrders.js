import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Alert, Image, TouchableOpacity } from 'react-native';
import { Text, Card, Chip, Button, Menu, Portal, Dialog, TextInput } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import customFetch from '../../utils/axios';
import { Package, Clock, Truck, CheckCircle, XCircle, User, MapPin, Phone } from 'lucide-react-native';
import SellerTopBar from '../../components/seller/SellerTopBar';
import SellerFooterNavigation from '../../components/seller/SellerFooterNavigation';

const SellerOrders = ({ navigation, route }) => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filterStatus, setFilterStatus] = useState(route.params?.filter || 'All');
    const [menuVisible, setMenuVisible] = useState(false);
    const showFilterMenu = route.params?.filter === 'All' || !route.params?.filter;

    const fetchOrders = async () => {
        try {
            const response = await customFetch.post('/order/seller/orders');
            console.log('📦 Orders fetched:', response.data.orders.length);
            if (response.data.orders.length > 0) {
                const sampleOrder = response.data.orders[0];
                console.log('🔍 Sample Order ID:', sampleOrder._id);
                console.log('👤 User data:', sampleOrder.user || sampleOrder.userId);
                console.log('📍 Shipping Address:', sampleOrder.shippingAddress);
                console.log('📦 First Item:', sampleOrder.items[0]);
                console.log('🖼️ Product in first item:', sampleOrder.items[0]?.product);
            }
            setOrders(response.data.orders);
            setFilteredOrders(response.data.orders);
        } catch (error) {
            console.error('Error fetching orders:', error);
            Alert.alert('Error', 'Failed to fetch orders');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Refresh orders when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchOrders();
        }, [])
    );

    useEffect(() => {
        if (filterStatus === 'All') {
            setFilteredOrders(orders);
        } else {
            setFilteredOrders(orders.filter(order => order.orderStatus === filterStatus));
        }
    }, [filterStatus, orders]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    const [remarkDialog, setRemarkDialog] = useState({ visible: false, orderId: null, status: null });
    const [remark, setRemark] = useState('');

    const showRemarkDialog = (orderId, status) => {
        setRemarkDialog({ visible: true, orderId, status });
        setRemark('');
    };

    const hideRemarkDialog = () => {
        setRemarkDialog({ visible: false, orderId: null, status: null });
        setRemark('');
    };

    const updateOrderStatus = async (orderId, newStatus, remarkText = '') => {
        try {
            const payload = { orderStatus: newStatus };
            if (remarkText.trim()) {
                payload.remark = remarkText.trim();
            }
            await customFetch.put(`/order/update-status/${orderId}`, payload);
            Alert.alert('Success', 'Order status updated successfully');
            hideRemarkDialog();
            fetchOrders();
        } catch (error) {
            console.error('Error updating order status:', error);
            Alert.alert('Error', 'Failed to update order status');
        }
    };

    const handleStatusUpdate = (orderId, newStatus) => {
        // Show remark dialog for status updates
        showRemarkDialog(orderId, newStatus);
    };

    const handleCancelOrder = (orderId) => {
        Alert.alert(
            'Cancel Order',
            'Are you sure you want to cancel this order?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: () => showRemarkDialog(orderId, 'Cancelled')
                }
            ]
        );
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Pending':
                return <Clock size={16} color="#FF9800" />;
            case 'Processing':
                return <Package size={16} color="#2196F3" />;
            case 'Shipped':
                return <Truck size={16} color="#9C27B0" />;
            case 'Delivered':
                return <CheckCircle size={16} color="#4CAF50" />;
            case 'Cancelled':
                return <XCircle size={16} color="#f44336" />;
            default:
                return null;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending':
                return '#FF9800';
            case 'Processing':
                return '#2196F3';
            case 'Shipped':
                return '#9C27B0';
            case 'Delivered':
                return '#4CAF50';
            case 'Cancelled':
                return '#f44336';
            default:
                return '#666';
        }
    };

    const getStatusBgColor = (status) => {
        switch (status) {
            case 'Pending':
                return '#FFF3E0';
            case 'Processing':
                return '#E3F2FD';
            case 'Shipped':
                return '#F3E5F5';
            case 'Delivered':
                return '#E8F5E9';
            case 'Cancelled':
                return '#FFEBEE';
            default:
                return '#F5F5F5';
        }
    };

    const getNextStatus = (currentStatus) => {
        switch (currentStatus) {
            case 'Pending':
                return 'Processing';
            case 'Processing':
                return 'Shipped';
            case 'Shipped':
                return 'Delivered';
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading Orders...</Text>
            </View>
        );
    }

    return (
        <>
            <SellerTopBar navigation={navigation} title="Orders" />
            <View style={styles.container}>
                {/* Filter Menu - Only show for "All" orders */}
                {showFilterMenu && (
                    <View style={styles.filterContainer}>
                        <Menu
                            visible={menuVisible}
                            onDismiss={() => setMenuVisible(false)}
                            anchor={
                                <Button
                                    mode="outlined"
                                    onPress={() => setMenuVisible(true)}
                                    style={styles.filterButton}
                                >
                                    Filter: {filterStatus}
                                </Button>
                            }
                        >
                            {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(status => (
                                <Menu.Item
                                    key={status}
                                    onPress={() => {
                                        setFilterStatus(status);
                                        setMenuVisible(false);
                                    }}
                                    title={status}
                                />
                            ))}
                        </Menu>
                    </View>
                )}
                
                {/* Status Header - Show when filtered */}
                {!showFilterMenu && (
                    <View style={styles.statusHeader}>
                        <Text style={styles.statusHeaderText}>
                            {filterStatus} Orders ({filteredOrders.length})
                        </Text>
                    </View>
                )}

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    contentContainerStyle={styles.scrollContent}
                >
                    {filteredOrders.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Package size={64} color="#ccc" />
                            <Text style={styles.emptyText}>No orders found</Text>
                        </View>
                    ) : (
                        filteredOrders.map((order) => (
                            <Card key={order._id} style={styles.orderCard}>
                                <Card.Content>
                                    <View style={styles.orderHeader}>
                                        <Text style={styles.orderId}>Order #{order._id.slice(-8)}</Text>
                                        <View style={[
                                            styles.statusBadge, 
                                            { backgroundColor: getStatusBgColor(order.orderStatus) }
                                        ]}>
                                            {getStatusIcon(order.orderStatus)}
                                            <Text style={[
                                                styles.statusText,
                                                { color: getStatusColor(order.orderStatus) }
                                            ]}>
                                                {order.orderStatus}
                                            </Text>
                                        </View>
                                    </View>

                                    <Text style={styles.orderDate}>
                                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </Text>

                                    {/* Customer Details */}
                                    {(order.user || order.userId) && (
                                        <View style={styles.customerSection}>
                                            <View style={styles.customerHeader}>
                                                <User size={16} color="#4CAF50" />
                                                <Text style={styles.sectionTitle}>Customer Details</Text>
                                            </View>
                                            <Text style={styles.customerName}>
                                                {/* Try different field combinations */}
                                                {order.user?.Name || order.userId?.Name || 
                                                 `${order.user?.additionalDetails?.firstName || order.userId?.additionalDetails?.firstName || ''} ${order.user?.additionalDetails?.lastName || order.userId?.additionalDetails?.lastName || ''}`.trim() || 
                                                 'N/A'}
                                            </Text>
                                            {/* Show phone from additionalDetails or shippingAddress */}
                                            {(order.user?.additionalDetails?.contactNo || order.userId?.additionalDetails?.contactNo || order.shippingAddress?.mobile) && (
                                                <View style={styles.customerInfo}>
                                                    <Phone size={14} color="#666" />
                                                    <Text style={styles.customerText}>
                                                        {order.user?.additionalDetails?.contactNo || 
                                                         order.userId?.additionalDetails?.contactNo || 
                                                         order.shippingAddress?.mobile}
                                                    </Text>
                                                </View>
                                            )}
                                            {(order.user?.email || order.userId?.email) && (
                                                <Text style={styles.customerText}>
                                                    {order.user?.email || order.userId?.email}
                                                </Text>
                                            )}
                                        </View>
                                    )}

                                    {/* Shipping Address */}
                                    {order.shippingAddress && (
                                        <View style={styles.addressSection}>
                                            <View style={styles.addressHeader}>
                                                <MapPin size={16} color="#4CAF50" />
                                                <Text style={styles.sectionTitle}>Shipping Address</Text>
                                            </View>
                                            {(order.shippingAddress.Name || order.shippingAddress.name) && (
                                                <Text style={styles.addressText}>
                                                    {order.shippingAddress.Name || order.shippingAddress.name}
                                                </Text>
                                            )}
                                            {order.shippingAddress.streetAddress && (
                                                <Text style={styles.addressText}>
                                                    {order.shippingAddress.streetAddress}
                                                </Text>
                                            )}
                                            {(order.shippingAddress.city || order.shippingAddress.state || order.shippingAddress.zipCode || order.shippingAddress.pinCode) && (
                                                <Text style={styles.addressText}>
                                                    {order.shippingAddress.city}{order.shippingAddress.city && ', '}{order.shippingAddress.state} {order.shippingAddress.zipCode || order.shippingAddress.pinCode}
                                                </Text>
                                            )}
                                            {order.shippingAddress.mobile && (
                                                <Text style={styles.addressText}>
                                                    Phone: {order.shippingAddress.mobile}
                                                </Text>
                                            )}
                                        </View>
                                    )}

                                    <View style={styles.divider} />

                                    {/* Order Items with Images */}
                                    <Text style={styles.itemsHeader}>Order Items</Text>
                                    {order.items.map((item, index) => {
                                        // Get image URL - handle different formats
                                        let imageUrl = 'https://via.placeholder.com/80';
                                        if (item.product?.images && Array.isArray(item.product.images) && item.product.images.length > 0) {
                                            // If images is array of strings
                                            imageUrl = typeof item.product.images[0] === 'string' 
                                                ? item.product.images[0] 
                                                : item.product.images[0]?.url || imageUrl;
                                        } else if (item.product?.imageUrl) {
                                            imageUrl = item.product.imageUrl;
                                        }
                                        
                                        return (
                                            <View key={index} style={styles.orderItem}>
                                                <Image
                                                    source={{ uri: imageUrl }}
                                                    style={styles.productImage}
                                                    resizeMode="cover"
                                                    onError={() => console.log('Image load error:', imageUrl)}
                                                />
                                                <View style={styles.itemDetails}>
                                                    <Text style={styles.itemName} numberOfLines={2}>
                                                        {item.product?.name || 'Product'}
                                                    </Text>
                                                    <Text style={styles.itemSpecs}>
                                                        Size: {item.size}
                                                    </Text>
                                                    <Text style={styles.itemSpecs}>
                                                        Quantity: {item.quantity}
                                                    </Text>
                                                    <Text style={styles.itemPrice}>
                                                        ₹{item.selectedDiscountedPrice} × {item.quantity} = ₹{item.selectedDiscountedPrice * item.quantity}
                                                    </Text>
                                                </View>
                                            </View>
                                        );
                                    })}

                                    <View style={styles.divider} />

                                    <View style={styles.orderFooter}>
                                        <Text style={styles.totalLabel}>Total Amount:</Text>
                                        <Text style={styles.totalAmount}>₹{order.totalAmount}</Text>
                                    </View>

                                    <Text style={styles.paymentMethod}>
                                        Payment: {order.paymentMethod.toUpperCase()} | {order.paymentStatus}
                                    </Text>

                                    {/* Action Buttons */}
                                    <View style={styles.actionButtons}>
                                        {getNextStatus(order.orderStatus) && (
                                            <Button
                                                mode="contained"
                                                onPress={() => handleStatusUpdate(order._id, getNextStatus(order.orderStatus))}
                                                style={styles.updateButton}
                                            >
                                                Mark as {getNextStatus(order.orderStatus)}
                                            </Button>
                                        )}
                                        
                                        {order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Delivered' && (
                                            <Button
                                                mode="outlined"
                                                onPress={() => handleCancelOrder(order._id)}
                                                style={styles.cancelButton}
                                                textColor="#f44336"
                                            >
                                                Cancel Order
                                            </Button>
                                        )}
                                    </View>
                                </Card.Content>
                            </Card>
                        ))
                    )}
                </ScrollView>

                <SellerFooterNavigation navigation={navigation} activePage="Orders" />
            </View>

            {/* Remark Dialog */}
            <Portal>
                <Dialog visible={remarkDialog.visible} onDismiss={hideRemarkDialog}>
                    <Dialog.Title>
                        {remarkDialog.status === 'Cancelled' ? 'Cancel Order' : `Mark as ${remarkDialog.status}`}
                    </Dialog.Title>
                    <Dialog.Content>
                        <Text style={styles.dialogText}>
                            Add a remark (optional):
                        </Text>
                        <TextInput
                            mode="outlined"
                            placeholder="Enter remark (optional)"
                            value={remark}
                            onChangeText={setRemark}
                            multiline
                            numberOfLines={3}
                            style={styles.remarkInput}
                        />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={hideRemarkDialog}>Cancel</Button>
                        <Button 
                            onPress={() => updateOrderStatus(remarkDialog.orderId, remarkDialog.status, remark)}
                            mode="contained"
                        >
                            Confirm
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
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
    filterContainer: {
        padding: 15,
        backgroundColor: '#fff',
        elevation: 2,
    },
    filterButton: {
        borderColor: '#4CAF50',
    },
    statusHeader: {
        padding: 15,
        backgroundColor: '#fff',
        elevation: 2,
        borderBottomWidth: 2,
        borderBottomColor: '#4CAF50',
    },
    statusHeaderText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    scrollContent: {
        padding: 15,
        paddingBottom: 80,
    },
    orderCard: {
        marginBottom: 15,
        elevation: 2,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    orderId: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    statusChip: {
        height: 28,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 6,
    },
    statusText: {
        fontSize: 13,
        fontWeight: '600',
    },
    orderDate: {
        fontSize: 12,
        color: '#666',
        marginBottom: 12,
    },
    divider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 12,
    },
    customerSection: {
        backgroundColor: '#f0f9ff',
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
    },
    customerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 6,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
    },
    customerName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    customerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 2,
    },
    customerText: {
        fontSize: 13,
        color: '#666',
    },
    addressSection: {
        backgroundColor: '#fff8e1',
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
    },
    addressHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 6,
    },
    addressText: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
    itemsHeader: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    orderItem: {
        flexDirection: 'row',
        marginBottom: 12,
        backgroundColor: '#f9f9f9',
        padding: 10,
        borderRadius: 8,
        gap: 12,
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#e0e0e0',
    },
    itemDetails: {
        flex: 1,
        justifyContent: 'space-between',
    },
    itemName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    itemSpecs: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
    itemPrice: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginTop: 4,
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    totalLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    paymentMethod: {
        fontSize: 12,
        color: '#666',
        marginBottom: 12,
    },
    actionButtons: {
        marginTop: 12,
        gap: 8,
    },
    updateButton: {
        backgroundColor: '#4CAF50',
        marginBottom: 8,
    },
    cancelButton: {
        borderColor: '#f44336',
    },
    dialogText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    remarkInput: {
        marginTop: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 100,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        marginTop: 16,
    },
});

export default SellerOrders;
