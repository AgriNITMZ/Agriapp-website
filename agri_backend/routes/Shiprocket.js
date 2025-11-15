// routes/Shiprocket.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const shiprocketController = require('../controller/Shiprocket');

// Payment routes
router.post('/payment/create-order', auth, shiprocketController.createPaymentOrder);
router.post('/payment/verify', auth, shiprocketController.verifyPayment);

// Order routes
router.post('/create', auth, shiprocketController.createOrder);
router.get('/orders', auth, shiprocketController.getOrders);

// Tracking routes
router.get('/track/:shipmentId', auth, shiprocketController.trackShipment);
router.post('/cancel/:shipmentId', auth, shiprocketController.cancelShipment);

// Serviceability check
router.post('/check-serviceability', auth, shiprocketController.checkServiceability);

module.exports = router;
