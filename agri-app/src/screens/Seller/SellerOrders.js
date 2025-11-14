import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Alert } from 'react-native';
import { Text, Card, Chip, Button, Menu, Portal, Dialog, TextInput } from 'react-native-paper';
import customFetch from '../../utils/axios';
import { Package, Clock, Truck, CheckCircle, XCircle } from 'lucide-react-native';
import SellerTopBar from '../../components/seller/SellerTopBar';
import SellerFooterNavigation from '../../components/seller/SellerFooterNavigation';

const SellerOrders = ({ navigation }) => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filterStatus, setFilterStatus] = useState('All');
    const [menuVisible, setMenuVisible] = useState(false);

    const fetchOrders = async () => {
        try {
            const response = await customFetch.post('/order/seller/orders');
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
                {/* Filter Menu */}
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
                                        <Chip
                                            icon={() => getStatusIcon(order.orderStatus)}
                                            style={[styles.statusChip, { backgroundColor: getStatusColor(order.orderStatus) + '20' }]}
                                            textStyle={{ color: getStatusColor(order.orderStatus) }}
                                        >
                                            {order.orderStatus}
                                        </Chip>
                                    </View>

                                    <Text style={styles.orderDate}>
                                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </Text>

                                    <View style={styles.divider} />

                                    {order.items.map((item, index) => (
                                        <View key={index} style={styles.orderItem}>
                                            <Text style={styles.itemName}>{item.product?.name || 'Product'}</Text>
                                            <Text style={styles.itemDetails}>
                                                Size: {item.size} | Qty: {item.quantity}
                                            </Text>
                                            <Text style={styles.itemPrice}>₹{item.selectedDiscountedPrice * item.quantity}</Text>
                                        </View>
                                    ))}

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
    orderItem: {
        marginBottom: 8,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    itemDetails: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginTop: 2,
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
