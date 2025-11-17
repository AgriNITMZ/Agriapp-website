import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api/v1';

const TrackShipmentScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [trackingData, setTrackingData] = useState(null);
  const [shipmentDetails, setShipmentDetails] = useState(null);

  useEffect(() => {
    fetchTrackingData();
  }, []);

  const fetchTrackingData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      // Fetch shipment details
      const shipmentResponse = await axios.get(
        `${API_URL}/shiprocket/buyer/shipment/${orderId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setShipmentDetails(shipmentResponse.data.data);

      // Fetch tracking data if AWB exists
      if (shipmentResponse.data.data.awbCode) {
        const trackingResponse = await axios.get(
          `${API_URL}/shiprocket/track/${orderId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        setTrackingData(trackingResponse.data.data);
      }
    } catch (error) {
      console.error('Error fetching tracking data:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to fetch tracking data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTrackingData();
  };

  const getStatusIcon = (status) => {
    const statusMap = {
      'PICKED UP': 'checkmark-circle',
      'IN TRANSIT': 'airplane',
      'OUT FOR DELIVERY': 'car',
      'DELIVERED': 'checkmark-done-circle',
      'CANCELLED': 'close-circle'
    };
    return statusMap[status] || 'ellipse';
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'PICKED UP': '#FFA500',
      'IN TRANSIT': '#2196F3',
      'OUT FOR DELIVERY': '#FF9800',
      'DELIVERED': '#4CAF50',
      'CANCELLED': '#F44336'
    };
    return colorMap[status] || '#9E9E9E';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading tracking information...</Text>
      </View>
    );
  }

  if (!shipmentDetails) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#F44336" />
        <Text style={styles.errorText}>Shipment details not found</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchTrackingData}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Shipment Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Order ID</Text>
          <Text style={styles.headerValue}>#{orderId.slice(-8)}</Text>
        </View>
        
        {shipmentDetails.awbCode && (
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>AWB Code</Text>
            <Text style={styles.headerValue}>{shipmentDetails.awbCode}</Text>
          </View>
        )}
        
        {shipmentDetails.courierName && (
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Courier</Text>
            <Text style={styles.headerValue}>{shipmentDetails.courierName}</Text>
          </View>
        )}

        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{shipmentDetails.orderStatus}</Text>
        </View>
      </View>

      {/* Shipping Address */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shipping Address</Text>
        <View style={styles.addressCard}>
          <Text style={styles.addressName}>{shipmentDetails.shippingAddress.Name}</Text>
          <Text style={styles.addressText}>{shipmentDetails.shippingAddress.streetAddress}</Text>
          <Text style={styles.addressText}>
            {shipmentDetails.shippingAddress.city}, {shipmentDetails.shippingAddress.state}
          </Text>
          <Text style={styles.addressText}>{shipmentDetails.shippingAddress.zipcode}</Text>
          <Text style={styles.addressPhone}>📞 {shipmentDetails.shippingAddress.mobile}</Text>
        </View>
      </View>

      {/* Order Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Items</Text>
        {shipmentDetails.items.map((item, index) => (
          <View key={index} style={styles.itemCard}>
            <Text style={styles.itemName}>{item.product.name}</Text>
            <View style={styles.itemDetails}>
              <Text style={styles.itemText}>Size: {item.size}</Text>
              <Text style={styles.itemText}>Qty: {item.quantity}</Text>
              <Text style={styles.itemPrice}>₹{item.selectedDiscountedPrice}</Text>
            </View>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalAmount}>₹{shipmentDetails.totalAmount}</Text>
        </View>
      </View>

      {/* Tracking Timeline */}
      {trackingData && trackingData.shipment_track_activities && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tracking Timeline</Text>
          <View style={styles.timeline}>
            {trackingData.shipment_track_activities.map((activity, index) => (
              <View key={index} style={styles.timelineItem}>
                <View style={styles.timelineIconContainer}>
                  <Ionicons
                    name={getStatusIcon(activity.sr_status_label)}
                    size={24}
                    color={getStatusColor(activity.sr_status_label)}
                  />
                  {index < trackingData.shipment_track_activities.length - 1 && (
                    <View style={styles.timelineLine} />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineStatus}>{activity.status}</Text>
                  <Text style={styles.timelineActivity}>{activity.activity}</Text>
                  <Text style={styles.timelineLocation}>📍 {activity.location}</Text>
                  <Text style={styles.timelineDate}>
                    {new Date(activity.date).toLocaleString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {!trackingData && shipmentDetails.awbCode && (
        <View style={styles.noTrackingContainer}>
          <Ionicons name="information-circle" size={48} color="#2196F3" />
          <Text style={styles.noTrackingText}>
            Tracking information will be available once the shipment is picked up
          </Text>
        </View>
      )}

      {!shipmentDetails.awbCode && (
        <View style={styles.noTrackingContainer}>
          <Ionicons name="time" size={48} color="#FF9800" />
          <Text style={styles.noTrackingText}>
            Shipment is being prepared. Tracking will be available soon.
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: '#666',
    textAlign: 'center'
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600'
  },
  header: {
    backgroundColor: '#FFF',
    padding: 20,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  headerTitle: {
    fontSize: 14,
    color: '#666'
  },
  headerValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333'
  },
  statusBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 8
  },
  statusText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600'
  },
  section: {
    backgroundColor: '#FFF',
    padding: 20,
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16
  },
  addressCard: {
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50'
  },
  addressName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  addressPhone: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 8,
    fontWeight: '600'
  },
  itemCard: {
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  itemText: {
    fontSize: 14,
    color: '#666'
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4CAF50'
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0'
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333'
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4CAF50'
  },
  timeline: {
    paddingLeft: 8
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 24
  },
  timelineIconContainer: {
    alignItems: 'center',
    marginRight: 16
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 8
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 8
  },
  timelineStatus: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4
  },
  timelineActivity: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  timelineLocation: {
    fontSize: 13,
    color: '#2196F3',
    marginBottom: 4
  },
  timelineDate: {
    fontSize: 12,
    color: '#999'
  },
  noTrackingContainer: {
    backgroundColor: '#FFF',
    padding: 40,
    alignItems: 'center',
    marginBottom: 12
  },
  noTrackingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24
  }
});

export default TrackShipmentScreen;
