import axios from 'axios';
import { analyticsAPI } from '../api';

// Get stored token
const getToken = () => {
  const storedTokenData = JSON.parse(localStorage.getItem("token"));
  return storedTokenData && Date.now() < storedTokenData.expires ? storedTokenData.value : null;
};

// Create axios headers with auth
const createAuthHeaders = () => {
  const token = getToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

// Seller Analytics API calls
export const sellerAnalyticsAPI = {
  // Get seller overview analytics
  getOverview: async (params = {}) => {
    try {
      const response = await axios.get(analyticsAPI.seller.overview(), {
        ...createAuthHeaders(),
        params
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching seller overview:', error);
      throw error;
    }
  },

  // Get seller product performance
  getProductPerformance: async (params = {}) => {
    try {
      const response = await axios.get(analyticsAPI.seller.products(), {
        ...createAuthHeaders(),
        params
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching seller product performance:', error);
      throw error;
    }
  },

  // Get seller sales trends
  getSalesTrends: async (params = {}) => {
    try {
      const response = await axios.get(analyticsAPI.seller.salesTrends(), {
        ...createAuthHeaders(),
        params
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching seller sales trends:', error);
      throw error;
    }
  }
};

// Admin Analytics API calls
export const adminAnalyticsAPI = {
  // Get platform overview
  getPlatformOverview: async (params = {}) => {
    try {
      const response = await axios.get(analyticsAPI.admin.platformOverview(), {
        ...createAuthHeaders(),
        params
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching platform overview:', error);
      throw error;
    }
  },

  // Get user analytics
  getUserAnalytics: async (params = {}) => {
    try {
      const response = await axios.get(analyticsAPI.admin.userAnalytics(), {
        ...createAuthHeaders(),
        params
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      throw error;
    }
  },

  // Get product analytics
  getProductAnalytics: async (params = {}) => {
    try {
      const response = await axios.get(analyticsAPI.admin.productAnalytics(), {
        ...createAuthHeaders(),
        params
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching product analytics:', error);
      throw error;
    }
  },

  // Get revenue analytics
  getRevenueAnalytics: async (params = {}) => {
    try {
      const response = await axios.get(analyticsAPI.admin.revenueAnalytics(), {
        ...createAuthHeaders(),
        params
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
      throw error;
    }
  }
};

// Common analytics utilities
export const analyticsUtils = {
  // Format currency
  formatCurrency: (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  },

  // Format percentage
  formatPercentage: (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  },

  // Format number with commas
  formatNumber: (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  },

  // Get period options
  getPeriodOptions: () => [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' }
  ],

  // Get growth color class
  getGrowthColor: (value) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  },

  // Get growth icon
  getGrowthIcon: (value) => {
    if (value > 0) return '↗️';
    if (value < 0) return '↘️';
    return '➡️';
  }
};