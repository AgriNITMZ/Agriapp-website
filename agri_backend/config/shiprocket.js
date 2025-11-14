// Shiprocket Configuration (Demo/Sandbox Mode)
require('dotenv').config();

const shiprocketConfig = {
  // Demo/Sandbox credentials
  email: process.env.SHIPROCKET_EMAIL || 'demo@shiprocket.com',
  password: process.env.SHIPROCKET_PASSWORD || 'demo_password',
  
  // Shiprocket API endpoints
  baseURL: process.env.SHIPROCKET_BASE_URL || 'https://apiv2.shiprocket.in/v1/external',
  
  // Demo mode flag
  isDemoMode: process.env.SHIPROCKET_DEMO_MODE === 'true' || true,
  
  // Default pickup location (for demo)
  defaultPickupLocation: {
    pickup_location: 'Primary',
    name: 'Demo Warehouse',
    email: 'warehouse@demo.com',
    phone: '9999999999',
    address: 'Demo Address Line 1',
    address_2: 'Demo Address Line 2',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    pin_code: '400001'
  }
};

module.exports = shiprocketConfig;
