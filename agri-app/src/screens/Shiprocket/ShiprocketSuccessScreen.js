import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import {
  CheckCircle,
  Package,
  Truck,
  CreditCard,
  Calendar,
  ArrowRight,
} from 'lucide-react-native';

const ShiprocketSuccessScreen = ({ navigation, route }) => {
  const { order, shiprocket } = route.params || {};

  if (!order) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No order information found</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('ShiprocketCheckout')}
          >
            <Text style={styles.buttonText}>Go to Checkout</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Success Header */}
        <View style={styles.successHeader}>
          <View style={styles.successIconContainer}>
            <CheckCircle size={48} color="#16a34a" />
          </View>
          <Text style={styles.successTitle}>Order Placed Successfully!</Text>
          <Text style={styles.successSubtitle}>
            Your order has been confirmed and will be shipped soon
          </Text>
        </View>

        {/* Order Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Details</Text>

          <View style={styles.detailRow}>
            <Package size={20} color="#6b7280" />
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Order ID</Text>
              <Text style={styles.detailValue}>{order._id}</Text>
            </View>
          </View>

          {shiprocket?.shipment_id && (
            <View style={styles.detailRow}>
              <Truck size={20} color="#6b7280" />
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Shipment ID</Text>
                <Text style={styles.detailValue}>{shiprocket.shipment_id}</Text>
              </View>
            </View>
          )}

          {shiprocket?.order_id && (
            <View style={styles.detailRow}>
              <Package size={20} color="#6b7280" />
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Shiprocket Order ID</Text>
                <Text style={styles.detailValue}>{shiprocket.order_id}</Text>
              </View>
            </View>
          )}

          <View style={styles.detailRow}>
            <CreditCard size={20} color="#6b7280" />
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Payment Method</Text>
              <Text style={styles.detailValue}>
                {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Calendar size={20} color="#6b7280" />
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Order Date</Text>
              <Text style={styles.detailValue}>{formatDate(order.createdAt)}</Text>
            </View>
          </View>

          {shiprocket?.estimated_delivery_date && (
            <View style={styles.detailRow}>
              <Calendar size={20} color="#16a34a" />
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Estimated Delivery</Text>
                <Text style={[styles.detailValue, styles.deliveryDate]}>
                  {formatDate(shiprocket.estimated_delivery_date)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {order.items?.map((item, index) => (
            <View key={index} style={styles.itemCard}>
              <Image
                source={{ uri: item.imageUrl || 'https://via.placeholder.com/80' }}
                style={styles.itemImage}
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
                <Text style={styles.itemPrice}>₹{item.price}</Text>
              </View>
              <Text style={styles.itemTotal}>₹{item.price * item.quantity}</Text>
            </View>
          ))}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{order.subTotal}</Text>
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.addressCard}>
            <Text style={styles.addressName}>{order.shippingAddress?.name}</Text>
            <Text style={styles.addressText}>{order.shippingAddress?.streetAddress}</Text>
            <Text style={styles.addressText}>
              {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
              {order.shippingAddress?.zipCode}
            </Text>
            <Text style={styles.addressText}>Phone: {order.shippingAddress?.mobile}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {shiprocket?.shipment_id && (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() =>
                navigation.navigate('ShiprocketTrack', { shipmentId: shiprocket.shipment_id })
              }
            >
              <Truck size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>Track Shipment</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('ShiprocketOrders')}
          >
            <Package size={20} color="#fff" />
            <Text style={styles.secondaryButtonText}>View All Orders</Text>
          </TouchableOpacity>
        </View>

        {/* Continue Shopping */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => navigation.navigate('HomePage')}
        >
          <Text style={styles.continueButtonText}>Continue Shopping</Text>
          <ArrowRight size={16} color="#16a34a" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  successHeader: {
    backgroundColor: '#fff',
    padding: 32,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailInfo: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  deliveryDate: {
    color: '#16a34a',
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8,
  },
  itemImage: {
    width: 60,
    height: 60,
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
    marginTop: 4,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  addressCard: {
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  actionButtons: {
    padding: 16,
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#16a34a',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    backgroundColor: '#6b7280',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  continueButtonText: {
    fontSize: 16,
    color: '#16a34a',
    fontWeight: '500',
  },
});

export default ShiprocketSuccessScreen;
