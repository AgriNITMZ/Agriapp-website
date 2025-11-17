const express = require('express');
const router = express.Router();
const { auth, isAdmin, isSeller } = require('../middleware/auth');

// Import analytics controllers
const {
    getSellerOverview,
    getSellerProductPerformance,
    getSellerSalesTrends,
    getAdminPlatformOverview,
    getAdminUserAnalytics,
    getAdminProductAnalytics,
    getAdminFinancialAnalytics,
    getSellerDashboardAnalytics // CHANGED FOR APP
    // exportData,
    // configureAlert,
    // getUserAlerts
} = require('../controller/Analytics');

// Seller Analytics Routes
router.get('/seller/overview', auth, isSeller, getSellerOverview);

router.get('/seller/products', auth, isSeller, getSellerProductPerformance);

router.get('/seller/sales-trends', auth, isSeller, getSellerSalesTrends);

// Helper function to check if user is seller or admin
const isSellerOrAdmin = (req, res, next) => {
    if (req.user.accountType === 'Seller' || req.user.accountType === 'Admin') {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Seller or Admin role required.'
        });
    }
};

// Admin Analytics Routes
router.get('/admin/platform-overview', auth, isAdmin, getAdminPlatformOverview);

router.get('/admin/user-analytics', auth, isAdmin, getAdminUserAnalytics);

router.get('/admin/product-analytics', auth, isAdmin, getAdminProductAnalytics);

router.get('/admin/revenue-analytics', auth, isAdmin, getAdminFinancialAnalytics);

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

// Cache management endpoints
router.post('/cache/invalidate', auth, (req, res) => {
    try {
        const { sellerId } = req.body;
        const { invalidateAnalyticsCache } = require('../controller/Analytics');
        
        invalidateAnalyticsCache(sellerId);
        
        res.status(200).json({
            success: true,
            message: `Analytics cache invalidated${sellerId ? ` for seller: ${sellerId}` : ' (all)'}`,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to invalidate cache',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Debug endpoint to test category lookup
router.get('/debug/categories', auth, isAdmin, async (req, res) => {
    try {
        const Product = require('../models/Product');
        const Category = require('../models/Category');
        
        // Get sample products with categories
        const products = await Product.find().limit(5);
        const categories = await Category.find().limit(10);
        
        // Test category lookup
        const testLookup = await Product.aggregate([
            { $limit: 5 },
            {
                $addFields: {
                    categoryObjectId: {
                        $cond: {
                            if: { $type: "$category" },
                            then: { $toObjectId: "$category" },
                            else: "$category"
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'categoryObjectId',
                    foreignField: '_id',
                    as: 'categoryDetails'
                }
            },
            {
                $project: {
                    name: '$name.en',
                    originalCategory: '$category',
                    categoryObjectId: 1,
                    categoryDetails: 1
                }
            }
        ]);
        
        res.status(200).json({
            success: true,
            data: {
                sampleProducts: products.map(p => ({ 
                    name: p.name.en, 
                    category: p.category,
                    categoryType: typeof p.category 
                })),
                sampleCategories: categories.map(c => ({ 
                    _id: c._id, 
                    name: c.name 
                })),
                lookupTest: testLookup
            }
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// CHANGED FOR APP - Seller Dashboard Route
router.get('/seller-dashboard', auth, isSellerOrAdmin, getSellerDashboardAnalytics);

module.exports = router;
