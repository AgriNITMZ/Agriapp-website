// services/shiprocket.service.js
const axios = require('axios');

class ShiprocketService {
  constructor() {
    this.baseURL = process.env.SHIPROCKET_API_URL || 'https://apiv2.shiprocket.in/v1/external';
    this.email = process.env.SHIPROCKET_EMAIL;
    this.password = process.env.SHIPROCKET_PASSWORD;
    this.token = null;
    this.tokenExpiry = null;
  }

  /**
   * Authenticate with Shiprocket API and get token
   */
  async authenticate() {
    try {
      console.log('🔐 Attempting Shiprocket authentication...');
      console.log('📧 Email:', this.email);
      console.log('🔗 API URL:', `${this.baseURL}/auth/login`);
      
      const response = await axios.post(`${this.baseURL}/auth/login`, {
        email: this.email,
        password: this.password
      });

      if (response.data && response.data.token) {
        this.token = response.data.token;
        // Token typically expires in 10 days, set expiry to 9 days to be safe
        this.tokenExpiry = Date.now() + (9 * 24 * 60 * 60 * 1000);
        console.log('✅ Shiprocket authentication successful');
        return this.token;
      } else {
        console.error('❌ No token in response:', response.data);
        throw new Error('Failed to obtain Shiprocket token');
      }
    } catch (error) {
      console.error('❌ Shiprocket authentication failed:', error.message);
      if (error.response) {
        console.error('📋 Response status:', error.response.status);
        console.error('📋 Response data:', JSON.stringify(error.response.data, null, 2));
        console.error('📋 Response headers:', error.response.headers);
      }
      throw new Error(`Shiprocket authentication failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Check if token is valid and refresh if needed
   */
  async ensureAuthenticated() {
    if (!this.token || !this.tokenExpiry || Date.now() >= this.tokenExpiry) {
      console.log('🔄 Refreshing Shiprocket token...');
      await this.authenticate();
    }
    return this.token;
  }

  /**
   * Get headers with authentication token
   */
  async getHeaders() {
    await this.ensureAuthenticated();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    };
  }

  /**
   * Create order in Shiprocket
   * @param {Object} orderData - Order details
   */
  async createOrder(orderData) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.post(
        `${this.baseURL}/orders/create/adhoc`,
        orderData,
        { headers }
      );

      if (response.data) {
        // Check if response contains an error message (Shiprocket returns 200 even for errors)
        if (response.data.message && response.data.message.includes('Wrong Pickup location')) {
          console.error('❌ Shiprocket order creation failed - Wrong pickup location');
          
          // Extract available pickup locations from error response
          if (response.data.data?.data && Array.isArray(response.data.data.data)) {
            console.error('📍 Available Pickup Locations:');
            response.data.data.data.forEach((location, index) => {
              console.error(`   ${index + 1}. "${location.pickup_location || location.name || location}"`);
            });
          }
          
          throw new Error(response.data.message);
        }
        
        // Success case
        if (response.data.order_id) {
          console.log('✅ Shiprocket order created:', response.data.order_id);
          return response.data;
        } else {
          throw new Error('Invalid response from Shiprocket - no order_id');
        }
      } else {
        throw new Error('Invalid response from Shiprocket');
      }
    } catch (error) {
      console.error('❌ Shiprocket order creation failed:');
      console.error('Status:', error.response?.status);
      console.error('Data:', JSON.stringify(error.response?.data, null, 2));
      console.error('Message:', error.message);
      
      // If it's a pickup location error, show available locations
      if (error.response?.data?.data && Array.isArray(error.response.data.data)) {
        console.error('📍 Available Pickup Locations:');
        error.response.data.data.forEach((location, index) => {
          console.error(`   ${index + 1}. "${location.pickup_location || location.name || location}"`);
        });
        console.error('⚠️  Update pickup_location in controller to match one of the above!');
      }
      
      // Extract detailed error message
      const errorMessage = error.response?.data?.message || 
                          error.message;
      
      throw new Error(`Shiprocket order creation failed: ${errorMessage}`);
    }
  }

  /**
   * Cancel order/shipment in Shiprocket
   * @param {String} orderId - Shiprocket Order ID (not shipment ID) to cancel
   */
  async cancelOrder(orderId) {
    try {
      const headers = await this.getHeaders();
      console.log(`🔄 Cancelling Shiprocket order ID: ${orderId}`);
      
      const response = await axios.post(
        `${this.baseURL}/orders/cancel`,
        { ids: [orderId] },
        { headers }
      );

      if (response.data) {
        console.log('✅ Shiprocket order cancelled:', orderId);
        return response.data;
      } else {
        throw new Error('Invalid response from Shiprocket');
      }
    } catch (error) {
      console.error('❌ Shiprocket order cancellation failed:', error.response?.data || error.message);
      const errorMsg = error.response?.data?.message || error.message;
      throw new Error(`Order Id does not exist` === errorMsg ? 
        'Order Id does not exist. Make sure you are using the Shiprocket order_id, not shipment_id.' : 
        errorMsg
      );
    }
  }

  /**
   * Track shipment in Shiprocket
   * @param {String} shipmentId - Shipment ID to track
   */
  async trackOrder(shipmentId) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.get(
        `${this.baseURL}/courier/track/shipment/${shipmentId}`,
        { headers }
      );

      if (response.data) {
        console.log('✅ Shiprocket tracking fetched for:', shipmentId);
        return response.data;
      } else {
        throw new Error('Invalid response from Shiprocket');
      }
    } catch (error) {
      console.error('❌ Shiprocket tracking failed:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || 
        `Shiprocket tracking failed: ${error.message}`
      );
    }
  }

  /**
   * Get pickup locations from Shiprocket
   */
  async getPickupLocations() {
    try {
      const headers = await this.getHeaders();
      const response = await axios.get(
        `${this.baseURL}/settings/company/pickup`,
        { headers }
      );

      console.log('🔍 Raw pickup locations response:', JSON.stringify(response.data, null, 2));

      if (response.data) {
        // Try different possible response structures
        let locations = null;
        
        // Check if it's directly an array
        if (Array.isArray(response.data)) {
          locations = response.data;
        }
        // Check response.data.data.shipping_address (actual structure from Shiprocket)
        else if (response.data.data?.shipping_address && Array.isArray(response.data.data.shipping_address)) {
          locations = response.data.data.shipping_address;
        }
        // Check response.data.data.data (nested)
        else if (response.data.data?.data && Array.isArray(response.data.data.data)) {
          locations = response.data.data.data;
        }
        // Check response.data.data
        else if (response.data.data && Array.isArray(response.data.data)) {
          locations = response.data.data;
        }
        // Check response.data.shipping_address
        else if (response.data.shipping_address && Array.isArray(response.data.shipping_address)) {
          locations = response.data.shipping_address;
        }
        
        if (locations && Array.isArray(locations) && locations.length > 0) {
          console.log('✅ Fetched pickup locations count:', locations.length);
          console.log('📍 Pickup locations:', JSON.stringify(locations, null, 2));
          return locations;
        } else {
          console.warn('⚠️  No pickup locations found in response');
          console.warn('Response structure:', Object.keys(response.data));
          return [];
        }
      } else {
        throw new Error('Invalid response from Shiprocket');
      }
    } catch (error) {
      console.error('❌ Failed to fetch pickup locations:', error.response?.data || error.message);
      throw new Error(`Failed to fetch pickup locations: ${error.message}`);
    }
  }

  /**
   * Check serviceability for a pincode
   * @param {String} pincode - Pincode to check
   * @param {String} pickupPincode - Pickup location pincode
   * @param {Number} weight - Package weight in kg
   * @param {Number} cod - COD enabled (1) or not (0)
   */
  async checkServiceability(pincode, pickupPincode, weight = 1, cod = 1) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.get(
        `${this.baseURL}/courier/serviceability`,
        {
          headers,
          params: {
            pickup_postcode: pickupPincode,
            delivery_postcode: pincode,
            weight: weight,
            cod: cod
          }
        }
      );

      if (response.data) {
        console.log('✅ Shiprocket serviceability checked for:', pincode);
        return response.data;
      } else {
        throw new Error('Invalid response from Shiprocket');
      }
    } catch (error) {
      console.error('❌ Shiprocket serviceability check failed:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || 
        `Shiprocket serviceability check failed: ${error.message}`
      );
    }
  }
}

// Export singleton instance
const shiprocketService = new ShiprocketService();
module.exports = shiprocketService;
