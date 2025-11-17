import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api/v1';

const SellerShipmentScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [shipments, setShipments] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/shiprocket/seller/shipments`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setShipments(response.data.data);
    } catch (error) {
      console.error('Error fetching shipments:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to fetch shipments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchShipments();
  };

  const handleCreateShipment = async (orderId) => {
    try {
      setActionLoading(true);
      const token = await AsyncStorage.getItem('token');
      
      const response = await axios.post(
        `${API_URL}/shiprocket/create-shipment`,
        { orderId },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      Alert.alert('Success', 'Shipment created successfully');
      fetchShipments();
    } catch (error) {
      console.error('Error creating shipment:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create shipment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateAWB = async (orderId) => {
    try {
      setActionLoading(true);
      const token = await AsyncStorage.getItem('token');
      
      // For demo, using courier ID 1
      const response = await axios.post(
        `${API_URL}/shiprocket/generate-awb`,
        { orderId, courierId: 1 },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      Alert.alert('Success', 'AWB generated successfully');
      fetchShipments();
      setModalVisible(false);
    } catch (error) {
      console.error('Error generating AWB:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to generate AWB');
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateLabel = async (orderId) => {
    try {
      setActionLoading(true);
      const token = await AsyncStorage.getItem('token');
      
      const response = await axios.post(
        `${API_URL}/shiprocket/generate-label`,
        { orderId },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      Alert.alert('Success', `Label URL: ${response.data.data.labelUrl}`);
      setModalVisible(false);
    } catch (error) {
      console.error('Error generating label:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to generate label');
    } finally {
      setActionLoading(false);
    }
  };

  const openActionModal = (shipment) => {
    setSelectedOrder(shipment);
    setModalVisible(true);
  };

  const renderShipmentCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => openActionModal(item)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.orderId}>Order #{item.orderId.slice(-8)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.orderStatus) }]}>
          <Text style={styles.statusText}>{item.orderStatus}</Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        {item.awbCode && (
          <View style={styles.infoRow}>
            <Ionicons name="barcode" size={16} color="#666" />
            <Text style={styles.infoLabel}>AWB:</Text>
            <Text style={styles.infoValue}>{item.awbCode}</Text>
          </View>
        )}

        {item.courierName && (
          <View style={styles.infoRow}>
            <Ionicons name="car" size={16} color="#666" />
            <Text style={styles.infoLabel}>Courier:</Text>
            <Text style={styles.infoValue}>{item.courierName}</Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <Ionicons name="cash" size={16} color="#666" />
          <Text style={styles.infoLabel}>Amount:</Text>
          <Text style={styles.infoValue}>₹{item.totalAmount}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="calendar" size={16} color="#666" />
          <Text style={styles.infoLabel}>Date:</Text>
          <Text style={styles.infoValue}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>

        {item.shippingAddress && (
          <View style={styles.addressContainer}>
            <Ionicons name="location" size={16} color="#666" />
            <Text style={styles.addressText}>
              {item.shippingAddress.city}, {item.shippingAddress.state}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.tapText}>Tap for actions</Text>
        <Ionicons name="chevron-forward" size={20} color="#4CAF50" />
      </View>
    </TouchableOpacity>
  );

  const getStatusColor = (status) => {
    const colorMap = {
      'Pending': '#FF9800',
      'Processing': '#2196F3',
      'Shipped': '#9C27B0',
      'Delivered': '#4CAF50',
      'Cancelled': '#F44336'
    };
    return colorMap[status] || '#9E9E9E';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading shipments...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={shipments}
        renderItem={renderShipmentCard}
        keyExtractor={(item) => item.orderId}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>No shipments found</Text>
          </View>
        }
      />

      {/* Action Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Shipment Actions</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {selectedOrder && (
              <>
                <Text style={styles.modalOrderId}>
                  Order #{selectedOrder.orderId.slice(-8)}
                </Text>

                {!selectedOrder.shiprocketOrderId && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleCreateShipment(selectedOrder.orderId)}
                    disabled={actionLoading}
                  >
                    <Ionicons name="add-circle" size={24} color="#FFF" />
                    <Text style={styles.actionButtonText}>Create Shipment</Text>
                  </TouchableOpacity>
                )}

                {selectedOrder.shiprocketOrderId && !selectedOrder.awbCode && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleGenerateAWB(selectedOrder.orderId)}
                    disabled={actionLoading}
                  >
                    <Ionicons name="barcode" size={24} color="#FFF" />
                    <Text style={styles.actionButtonText}>Generate AWB</Text>
                  </TouchableOpacity>
                )}

                {selectedOrder.awbCode && (
                  <>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleGenerateLabel(selectedOrder.orderId)}
                      disabled={actionLoading}
                    >
                      <Ionicons name="document-text" size={24} color="#FFF" />
                      <Text style={styles.actionButtonText}>Generate Label</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.trackButton]}
                      onPress={() => {
                        setModalVisible(false);
                        navigation.navigate('TrackShipment', { orderId: selectedOrder.orderId });
                      }}
                    >
                      <Ionicons name="location" size={24} color="#FFF" />
                      <Text style={styles.actionButtonText}>Track Shipment</Text>
                    </TouchableOpacity>
                  </>
                )}

                {actionLoading && (
                  <ActivityIndicator size="small" color="#4CAF50" style={{ marginTop: 16 }} />
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
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
  listContainer: {
    padding: 16
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333'
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600'
  },
  cardContent: {
    marginBottom: 12
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    marginRight: 4
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333'
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#F9F9F9',
    borderRadius: 6
  },
  addressText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0'
  },
  tapText: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '600'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 300
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333'
  },
  modalOrderId: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center'
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12
  },
  trackButton: {
    backgroundColor: '#2196F3'
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12
  }
});

export default SellerShipmentScreen;
