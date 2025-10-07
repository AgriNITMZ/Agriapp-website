const express = require('express');
const router = express.Router();
const { auth, isAdmin, isSeller } = require('../middleware/auth');

// Import analytics controllers
const { 
  getSellerOverview,
  getSellerProductPerformance,
  getSellerSalesTrends
  // getAdminPlatformOverview,
  // getAdminUserAnalytics,
  // getAdminProductAnalytics,
  // getAdminFinancialAnalytics,
  // exportData,
  // configureAlert,
  // getUserAlerts
} = require('../controller/Analytics');

// Seller Analytics Routes
router.get('/seller/overview', auth, isSeller, getSellerOverview);

router.get('/seller/products', auth, isSeller, getSellerProductPerformance);

router.get('/seller/sales-trends', auth, isSeller, getSellerSalesTrends);

// Admin Analytics Routes
router.get('/admin/platform-overview', auth, isAdmin, (req, res) => {
  res.status(501).json({ message: 'Admin platform overview endpoint - Coming soon' });
});

router.get('/admin/user-analytics', auth, isAdmin, (req, res) => {
  res.status(501).json({ message: 'Admin user analytics endpoint - Coming soon' });
});

router.get('/admin/product-analytics', auth, isAdmin, (req, res) => {
  res.status(501).json({ message: 'Admin product analytics endpoint - Coming soon' });
});

router.get('/admin/revenue-analytics', auth, isAdmin, (req, res) => {
  res.status(501).json({ message: 'Admin revenue analytics endpoint - Coming soon' });
});

// Common Routes
router.get('/export/:type', auth, (req, res) => {
  res.status(501).json({ message: 'Export functionality - Coming soon' });
});

router.post('/alerts/configure', auth, (req, res) => {
  res.status(501).json({ message: 'Alert configuration - Coming soon' });
});

router.get('/alerts/list', auth, (req, res) => {
  res.status(501).json({ message: 'Alert list - Coming soon' });
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Analytics service is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;