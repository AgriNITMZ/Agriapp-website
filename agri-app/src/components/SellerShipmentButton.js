import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Reusable Seller Shipment Management Button Component
 * 
 * Usage:
 * <SellerShipmentButton navigation={navigation} />
 */
const SellerShipmentButton = ({ navigation, style, variant = 'primary' }) => {
  const handlePress = () => {
    navigation.navigate('SellerShipments');
  };

  if (variant === 'icon') {
    return (
      <TouchableOpacity
        style={[styles.iconButton, style]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Ionicons name="cube" size={24} color="#4CAF50" />
      </TouchableOpacity>
    );
  }

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        style={[styles.compactButton, style]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Ionicons name="cube" size={18} color="#FFF" />
        <Text style={styles.compactButtonText}>Shipments</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Ionicons name="cube" size={24} color="#FFF" />
      <View style={styles.textContainer}>
        <Text style={styles.buttonText}>Manage Shipments</Text>
        <Text style={styles.buttonSubtext}>Track & manage your orders</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#FFF" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4
  },
  textContainer: {
    flex: 1,
    marginLeft: 16
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2
  },
  buttonSubtext: {
    color: '#E8F5E9',
    fontSize: 12,
    fontWeight: '400'
  },
  compactButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  compactButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  }
});

export default SellerShipmentButton;
