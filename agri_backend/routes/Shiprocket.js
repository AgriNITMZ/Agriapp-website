// Shiprocket Routes
const express = require('express');
const router = express.Router();
const { auth, isSeller } = require('../middleware/auth');
const {
  createShipment,
  checkServiceability,
  generateAWB,
  trackShipment,
  cancelShipment,
  generateLabel,
  getSellerShipments,
  getBuyerShipment
} = require('../controller/Shiprocket');

// Seller routes (require seller authentication)
router.post('/create-shipment', auth, isSeller, createShipment);
router.post('/generate-awb', auth, isSeller, generateAWB);
router.post('/cancel-shipment', auth, isSeller, cancelShipment);
router.post('/generate-label', auth, isSeller, generateLabel);
router.get('/seller/shipments', auth, isSeller, getSellerShipments);

// Common routes (buyer and seller)
router.get('/track/:orderId', auth, trackShipment);
router.get('/buyer/shipment/:orderId', auth, getBuyerShipment);

// Public route (can be used before order creation)
router.post('/check-serviceability', checkServiceability);

module.exports = router;
