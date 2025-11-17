// Shiprocket Service - Demo/Sandbox Mode
const axios = require('axios');
const shiprocketConfig = require('../config/shiprocket');

class ShiprocketService {
  constructor() {
    this.token = null;
    this.tokenExpiry = null;
    this.baseURL = shiprocketConfig.baseURL;
    this.isDemoMode = shiprocketConfig.isDemoMode;
  }

  // Authenticate and get token
  async authenticate() {
    try {
      if (this.isDemoMode) {
        // In demo mode, return a mock token
        this.token = 'demo_token_' + Date.now();
        this.tokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        return this.token;
      }

      const response = await axios.post(`${this.baseURL}/auth/login`, {
        email: shiprocketConfig.email,
        password: shiprocketConfig.password
      });

      this.token = response.data.token;
      this.tokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
      return this.token;
    } catch (error) {
      console.error('Shiprocket authentication error:', error.message);
      throw new Error('Failed to authenticate with Shiprocket');
    }
  }

  // Get valid token
  async getToken() {
    if (!this.token || Date.now() >= this.tokenExpiry) {
      await this.authenticate();
    }
    return this.token;
  }

  // Create order in Shiprocket
  async createOrder(orderData) {
    try {
      if (this.isDemoMode) {
        // Return mock response in demo mode
        return {
          order_id: Math.floor(Math.random() * 1000000),
          shipment_id: Math.floor(Math.random() * 1000000),
          status: 'NEW',
          status_code: 1,
          onboarding_completed_now: 0,
          awb_code: null,
          courier_company_id: null,
          courier_name: null
        };
      }

      const token = await this.getToken();
      const response = await axios.post(
        `${this.baseURL}/orders/create/adhoc`,
        orderData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Shiprocket create order error:', error.response?.data || error.message);
      throw new Error('Failed to create order in Shiprocket');
    }
  }

  // Get courier serviceability
  async checkServiceability(pickupPincode, deliveryPincode, weight, cod = 0) {
    try {
      if (this.isDemoMode) {
        // Return mock courier options in demo mode
        return {
          data: {
            available_courier_companies: [
              {
                courier_company_id: 1,
                courier_name: 'Demo Express',
                rate: 50,
                estimated_delivery_days: '3-5',
                cod: cod ? 1 : 0
              },
              {
                courier_company_id: 2,
                courier_name: 'Demo Standard',
                rate: 35,
                estimated_delivery_days: '5-7',
                cod: cod ? 1 : 0
              }
            ]
          }
        };
      }

      const token = await this.getToken();
      const response = await axios.get(
        `${this.baseURL}/courier/serviceability`,
        {
          params: {
            pickup_postcode: pickupPincode,
            delivery_postcode: deliveryPincode,
            weight: weight,
            cod: cod
          },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Shiprocket serviceability error:', error.response?.data || error.message);
      throw new Error('Failed to check courier serviceability');
    }
  }

  // Generate AWB (Airway Bill)
  async generateAWB(shipmentId, courierId) {
    try {
      if (this.isDemoMode) {
        // Return mock AWB in demo mode
        return {
          awb_code: 'DEMO' + Math.random().toString(36).substring(2, 15).toUpperCase(),
          courier_company_id: courierId,
          courier_name: 'Demo Express',
          response: {
            data: {
              awb_code: 'DEMO' + Math.random().toString(36).substring(2, 15).toUpperCase()
            }
          }
        };
      }

      const token = await this.getToken();
      const response = await axios.post(
        `${this.baseURL}/courier/assign/awb`,
        {
          shipment_id: shipmentId,
          courier_id: courierId
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Shiprocket AWB generation error:', error.response?.data || error.message);
      throw new Error('Failed to generate AWB');
    }
  }

  // Track shipment
  async trackShipment(awbCode) {
    try {
      if (this.isDemoMode) {
        // Return mock tracking data in demo mode
        return {
          tracking_data: {
            track_status: 1,
            shipment_status: 6,
            shipment_track: [
              {
                id: 1,
                awb_code: awbCode,
                courier_company_id: 1,
                shipment_status: 6,
                shipment_status_label: 'Delivered',
                current_timestamp: new Date().toISOString(),
                pickup_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                delivered_date: new Date().toISOString(),
                destination: 'Demo City',
                consignee_name: 'Demo Customer',
                origin: 'Demo Warehouse'
              }
            ],
            shipment_track_activities: [
              {
                date: new Date().toISOString(),
                status: 'Delivered',
                activity: 'Shipment delivered successfully',
                location: 'Demo City',
                sr_status: 7,
                sr_status_label: 'DELIVERED'
              },
              {
                date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'Out for Delivery',
                activity: 'Shipment out for delivery',
                location: 'Demo City',
                sr_status: 6,
                sr_status_label: 'OUT FOR DELIVERY'
              },
              {
                date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'In Transit',
                activity: 'Shipment in transit',
                location: 'Demo Hub',
                sr_status: 5,
                sr_status_label: 'IN TRANSIT'
              },
              {
                date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'Picked Up',
                activity: 'Shipment picked up',
                location: 'Demo Warehouse',
                sr_status: 4,
                sr_status_label: 'PICKED UP'
              }
            ]
          }
        };
      }

      const token = await this.getToken();
      const response = await axios.get(
        `${this.baseURL}/courier/track/awb/${awbCode}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Shiprocket tracking error:', error.response?.data || error.message);
      throw new Error('Failed to track shipment');
    }
  }

  // Cancel shipment
  async cancelShipment(awbCodes) {
    try {
      if (this.isDemoMode) {
        // Return mock cancellation response
        return {
          message: 'Shipment cancelled successfully (Demo Mode)',
          awbs: awbCodes
        };
      }

      const token = await this.getToken();
      const response = await axios.post(
        `${this.baseURL}/orders/cancel/shipment/awbs`,
        { awbs: awbCodes },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Shiprocket cancel shipment error:', error.response?.data || error.message);
      throw new Error('Failed to cancel shipment');
    }
  }

  // Generate shipping label
  async generateLabel(shipmentIds) {
    try {
      if (this.isDemoMode) {
        // Return mock label URL
        return {
          label_url: 'https://demo-label-url.com/label.pdf',
          label_created: 1,
          response: 'Label generated successfully (Demo Mode)'
        };
      }

      const token = await this.getToken();
      const response = await axios.post(
        `${this.baseURL}/courier/generate/label`,
        { shipment_id: shipmentIds },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Shiprocket label generation error:', error.response?.data || error.message);
      throw new Error('Failed to generate shipping label');
    }
  }

  // Generate manifest
  async generateManifest(shipmentIds) {
    try {
      if (this.isDemoMode) {
        // Return mock manifest URL
        return {
          manifest_url: 'https://demo-manifest-url.com/manifest.pdf',
          status: 'success',
          message: 'Manifest generated successfully (Demo Mode)'
        };
      }

      const token = await this.getToken();
      const response = await axios.post(
        `${this.baseURL}/courier/generate/pickup`,
        { shipment_id: shipmentIds },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Shiprocket manifest generation error:', error.response?.data || error.message);
      throw new Error('Failed to generate manifest');
    }
  }
}

module.exports = new ShiprocketService();
