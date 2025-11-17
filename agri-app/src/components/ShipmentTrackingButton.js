import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Reusable Shipment Tracking Button Component
 * 
 * Usage:
 * <ShipmentTrackingButton 
 *   orderId={order._id}
 *   navigation={navigation}
 *   hasShipment={order.shiprocketOrderId}
 * />
 */
const ShipmentTrackingButton = ({ orderId, navigation, hasShipment = false, style }) => {
  const handlePress = () => {
    navigation.navigate('TrackShipment', { orderId });
  };

  if (!hasShipment) {
    return (
      <View style={[styles.disabledButton, style]}>
        <Ionicons name="time-outline" size={20} color="#999" />
        <Text style={styles.disabledText}>Shipment Pending</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Ionicons name="location" size={20} color="#FFF" />
      <Text style={styles.buttonText}>Track Shipment</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  buttonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8
  },
  disabledButton: {
    backgroundColor: '#F5F5F5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  disabledText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8
  }
});

export default ShipmentTrackingButton;
