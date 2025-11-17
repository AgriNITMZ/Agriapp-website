import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { Package, Truck, Eye, XCircle } from 'lucide-react-native';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { API_URL } from '@env';
import { getUserFromLocalStorage } from '../../utils/localStorage';

const ShiprocketOrdersScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const user = await getUserFromLocalStorage();
      if (!user || !user.token) {
        Toast.show({ type: 'error', text1: 'Please log in to view orders' });
        navigation.navigate('LoginScreen');
        return;
      }

      const response = await axios.get(`${API_URL}/shiprocket/orders`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      Toast.show({ type: 'error', text1: 'Failed to load orders' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      created: '#3b82f6',
      processing: '#eab308',
      shipped: '#a855f7',
      delivered: '#16a34a',
      cancelled: '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  const handleCancelOrder = async (shipmentId, orderId) => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            setCancellingOrderId(orderId);
            try {
              const user = await getUserFromLocalStorage();
              const response = await axios.post(
                `${API_URL}/shiprocket/cancel/${shipmentId}`,
                {},
                { headers: { Authorization: `Bearer ${user.token}` } }
              );

              if (response.data.success) {
                Toast.show({ type: 'success', text1: 'Order cancelled successfully' });
                setOrders(
                  orders.map((order) =>
                    order._id === orderId ? { ...order, status: 'cancelled' } : order
                  )
                );
              }
            } catch (error) {
              console.error('Error cancelling order:', error);
              Toast.show({
                type: 'error',
                text1: error.response?.data?.message || 'Failed to cancel order',
              });
            } finally {
              setCancellingOrderId(null);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Package size={64} color="#d1d5db" />
        <Text style={styles.emptyTitle}>No Orders Yet</Text>
        <Text style={styles.emptySubtitle}>You haven't placed any Shiprocket orders yet</Text>
        <TouchableOpacity
          style={styles.startShoppingButton}
          onPress={() => navigation.navigate('ShiprocketCheckout')}
        >
          <Text style={styles.startShoppingButtonText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Shiprocket Orders</Text>
        <Text style={styles.headerSubtitle}>Track and manage your orders</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {orders.map((order) => (
          <View key={order._id} style={styles.orderCard}>
            {/* Order Header */}
            <View style={styles.orderHeader}>
              <View>
                <Text style={styles.orderLabel}>Order ID</Text>
                <Text style={styles.orderValue} numberOfLines={1}>
                  {order._id}
                </Text>
              </View>
              <View style={styles.orderHeaderRight}>
                <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(order.status) + '20' },
                  ]}
                >
                  <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Order Items */}
            <View style={styles.orderItems}>
              {order.items?.slice(0, 2).map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <Image
                    source={{ uri: item.imageUrl || 'https://via.placeholder.com/50' }}
                    style={styles.itemImage}
                  />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                  </View>
                  <Text style={styles.itemPrice}>₹{item.price}</Text>
                </View>
              ))}
              {order.items?.length > 2 && (
                <Text style={styles.moreItems}>+{order.items.length - 2} more items</Text>
              )}
            </View>

            {/* Order Summary */}
            <View style={styles.orderSummary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal:</Text>
                <Text style={styles.summaryValue}>₹{order.subTotal}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping:</Text>
                <Text style={styles.summaryValue}>₹{order.shippingCost}</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalValue}>₹{order.totalAmount}</Text>
              </View>
            </View>

            {/* Shipment Info */}
            {order.shiprocket?.shipment_id && (
              <View style={styles.shipmentInfo}>
                <Truck size={16} color="#6b7280" />
                <Text style={styles.shipmentText}>
                  Shipment ID: {order.shiprocket.shipment_id}
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              {order.shiprocket?.shipment_id && (
                <TouchableOpacity
                  style={styles.trackButton}
                  onPress={() =>
                    navigation.navigate('ShiprocketTrack', {
                      shipmentId: order.shiprocket.shipment_id,
                    })
                  }
                >
                  <Eye size={16} color="#fff" />
                  <Text style={styles.trackButtonText}>Track</Text>
                </TouchableOpacity>
              )}

              {order.status !== 'delivered' && order.status !== 'cancelled' && (
                <TouchableOpacity
                  style={[
                    styles.cancelButton,
                    cancellingOrderId === order._id && styles.cancelButtonDisabled,
                  ]}
                  onPress={() => handleCancelOrder(order.shiprocket?.shipment_id, order._id)}
                  disabled={cancellingOrderId === order._id}
                >
                  {cancellingOrderId === order._id ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <XCircle size={16} color="#fff" />
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f9fafb',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  startShoppingButton: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  startShoppingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  orderCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  orderLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  orderValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    maxWidth: 180,
  },
  orderHeaderRight: {
    alignItems: 'flex-end',
  },
  orderDate: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderItems: {
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  itemQuantity: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
  },
  moreItems: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  orderSummary: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 14,
    color: '#111827',
  },
  totalRow: {
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  shipmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 12,
  },
  shipmentText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  trackButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#16a34a',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  trackButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#ef4444',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  cancelButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ShiprocketOrdersScreen;
