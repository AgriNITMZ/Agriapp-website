import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api/v1';

// Get auth token
const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Create shipment
export const createShipment = async (orderId) => {
  try {
    const token = await getAuthToken();
    const response = await axios.post(
      `${API_URL}/shiprocket/create-shipment`,
      { orderId },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Check serviceability
export const checkServiceability = async (deliveryPincode, weight = 1, cod = false) => {
  try {
    const response = await axios.post(
      `${API_URL}/shiprocket/check-serviceability`,
      {
        deliveryPincode,
        weight,
        cod: cod ? 1 : 0
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Generate AWB
export const generateAWB = async (orderId, courierId) => {
  try {
    const token = await getAuthToken();
    const response = await axios.post(
      `${API_URL}/shiprocket/generate-awb`,
      { orderId, courierId },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Track shipment
export const trackShipment = async (orderId) => {
  try {
    const token = await getAuthToken();
    const response = await axios.get(
      `${API_URL}/shiprocket/track/${orderId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Cancel shipment
export const cancelShipment = async (orderId) => {
  try {
    const token = await getAuthToken();
    const response = await axios.post(
      `${API_URL}/shiprocket/cancel-shipment`,
      { orderId },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Generate label
export const generateLabel = async (orderId) => {
  try {
    const token = await getAuthToken();
    const response = await axios.post(
      `${API_URL}/shiprocket/generate-label`,
      { orderId },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get seller shipments
export const getSellerShipments = async () => {
  try {
    const token = await getAuthToken();
    const response = await axios.get(
      `${API_URL}/shiprocket/seller/shipments`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get buyer shipment
export const getBuyerShipment = async (orderId) => {
  try {
    const token = await getAuthToken();
    const response = await axios.get(
      `${API_URL}/shiprocket/buyer/shipment/${orderId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default {
  createShipment,
  checkServiceability,
  generateAWB,
  trackShipment,
  cancelShipment,
  generateLabel,
  getSellerShipments,
  getBuyerShipment
};
