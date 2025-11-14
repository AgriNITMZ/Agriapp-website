const User = require('../models/Users');
const Product = require('../models/Product');
const Order = require('../models/Order');
const mongoose = require('mongoose');
const {
    createDateRangeMatch,
    createSellerMatch,
    calculateGrowthPercentage,
    createDateGrouping,
    createLookupStage,
    createUnwindStage
} = require('../utils/aggregationHelpers');

// Utility function for date range filtering
const getDateRange = (period = '30d') => {
    const now = new Date();
    let startDate;

    switch (period) {
        case '7d':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case '30d':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        case '90d':
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
        case '1y':
            startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            break;
        default:
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return { startDate, endDate: now };
};

// Utility function for error handling
const handleError = (res, error, message = 'An error occurred') => {
    console.error('Analytics Error:', error);
    return res.status(500).json({
        success: false,
        message,
        error: error.message,
        timestamp: new Date().toISOString()
    });
};

// Utility function for success response
const sendSuccess = (res, data, message = 'Success') => {
    return res.status(200).json({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
    });
};

// Cache for storing frequently accessed data
const analyticsCache = new Map();
const CACHE_DURATION = 1 * 60 * 1000; // 1 minute for more real-time updates

// Utility function for cache management
const getCachedData = (key) => {
    const cached = analyticsCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }
    return null;
};

const setCachedData = (key, data) => {
    analyticsCache.set(key, {
        data,
        timestamp: Date.now()
    });
};

// Cache invalidation function
const invalidateAnalyticsCache = (sellerId = null) => {
    if (sellerId) {
        // Invalidate seller-specific cache
        const keysToDelete = [];
        for (const key of analyticsCache.keys()) {
            if (key.includes(`seller_`) && key.includes(sellerId)) {
                keysToDelete.push(key);
            }
        }
        keysToDelete.forEach(key => analyticsCache.delete(key));
    } else {
        // Invalidate all analytics cache
        analyticsCache.clear();
    }
    console.log(`🔄 Analytics cache invalidated${sellerId ? ` for seller: ${sellerId}` : ' (all)'}`);
};

// Seller Analytics Controllers

// Get seller overview analytics
const getSellerOverview = async (req, res) => {
    try {
        const sellerId = req.user.id;
        const { period = '30d', startDate: customStartDate, endDate: customEndDate } = req.query;

        // Create cache key
        const cacheKey = `seller_overview_${sellerId}_${period}_${customStartDate}_${customEndDate}`;
        const cachedData = getCachedData(cacheKey);

        if (cachedData) {
            return sendSuccess(res, cachedData, 'Seller overview data retrieved from cache');
        }

        // Get date range
        let dateRange;
        if (customStartDate && customEndDate) {
            dateRange = {
                startDate: new Date(customStartDate),
                endDate: new Date(customEndDate)
            };
        } else {
            dateRange = getDateRange(period);
        }

        // Get previous period for comparison
        const periodDuration = dateRange.endDate - dateRange.startDate;
        const previousPeriodStart = new Date(dateRange.startDate.getTime() - periodDuration);
        const previousPeriodEnd = dateRange.startDate;

        // Aggregation pipeline for current period
        const currentPeriodPipeline = [
            createSellerMatch(sellerId),
            createDateRangeMatch(dateRange.startDate, dateRange.endDate),
            {
                $unwind: '$items'
            },
            {
                $match: {
                    'items.sellerId': new mongoose.Types.ObjectId(sellerId)
                }
            },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: '$items.quantity' },
                    totalRevenue: { $sum: { $multiply: ['$items.selectedDiscountedPrice', '$items.quantity'] } },
                    totalOrders: { $addToSet: '$_id' },
                    averageOrderValue: { $avg: { $multiply: ['$items.selectedDiscountedPrice', '$items.quantity'] } }
                }
            },
            {
                $project: {
                    totalSales: 1,
                    totalRevenue: 1,
                    totalOrders: { $size: '$totalOrders' },
                    averageOrderValue: { $round: ['$averageOrderValue', 2] }
                }
            }
        ];

        // Aggregation pipeline for previous period
        const previousPeriodPipeline = [
            createSellerMatch(sellerId),
            createDateRangeMatch(previousPeriodStart, previousPeriodEnd),
            {
                $unwind: '$items'
            },
            {
                $match: {
                    'items.sellerId': new mongoose.Types.ObjectId(sellerId)
                }
            },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: '$items.quantity' },
                    totalRevenue: { $sum: { $multiply: ['$items.selectedDiscountedPrice', '$items.quantity'] } },
                    totalOrders: { $addToSet: '$_id' }
                }
            }
        ];

        // Execute aggregations
        const [currentPeriodResult, previousPeriodResult] = await Promise.all([
            Order.aggregate(currentPeriodPipeline),
            Order.aggregate(previousPeriodPipeline)
        ]);

        // Process results
        const current = currentPeriodResult[0] || {
            totalSales: 0,
            totalRevenue: 0,
            totalOrders: 0,
            averageOrderValue: 0
        };

        const previous = previousPeriodResult[0] || {
            totalSales: 0,
            totalRevenue: 0,
            totalOrders: 0
        };

        // Calculate growth percentages
        const salesGrowth = calculateGrowthPercentage(current.totalSales, previous.totalSales);
        const revenueGrowth = calculateGrowthPercentage(current.totalRevenue, previous.totalRevenue);
        const orderGrowth = calculateGrowthPercentage(current.totalOrders, previous.totalOrders);

        const result = {
            ...current,
            salesGrowth: Math.round(salesGrowth * 100) / 100,
            revenueGrowth: Math.round(revenueGrowth * 100) / 100,
            orderGrowth: Math.round(orderGrowth * 100) / 100,
            period: period,
            dateRange: {
                startDate: dateRange.startDate,
                endDate: dateRange.endDate
            }
        };

        // Cache the result
        setCachedData(cacheKey, result);

        return sendSuccess(res, result, 'Seller overview analytics retrieved successfully');

    } catch (error) {
        return handleError(res, error, 'Failed to retrieve seller overview analytics');
    }
};

// Get seller product performance analytics
const getSellerProductPerformance = async (req, res) => {
    try {
        const sellerId = req.user.id;
        const { period = '30d', limit = 10 } = req.query;

        const cacheKey = `seller_products_${sellerId}_${period}_${limit}`;
        const cachedData = getCachedData(cacheKey);

        if (cachedData) {
            return sendSuccess(res, cachedData, 'Seller product performance data retrieved from cache');
        }

        const dateRange = getDateRange(period);

        // Get top-selling products
        const topProductsPipeline = [
            createSellerMatch(sellerId),
            createDateRangeMatch(dateRange.startDate, dateRange.endDate),
            { $unwind: '$items' },
            {
                $match: {
                    'items.sellerId': new mongoose.Types.ObjectId(sellerId)
                }
            },
            {
                $group: {
                    _id: '$items.product',
                    totalQuantitySold: { $sum: '$items.quantity' },
                    totalRevenue: { $sum: { $multiply: ['$items.selectedDiscountedPrice', '$items.quantity'] } },
                    orderCount: { $sum: 1 },
                    averagePrice: { $avg: '$items.selectedDiscountedPrice' }
                }
            },
            createLookupStage('products', '_id', '_id', 'productDetails'),
            { $unwind: '$productDetails' },
            {
                $project: {
                    productId: '$_id',
                    productName: '$productDetails.name.en',
                    productImage: { $arrayElemAt: ['$productDetails.images', 0] },
                    totalQuantitySold: 1,
                    totalRevenue: { $round: ['$totalRevenue', 2] },
                    orderCount: 1,
                    averagePrice: { $round: ['$averagePrice', 2] },
                    category: '$productDetails.category'
                }
            },
            { $sort: { totalQuantitySold: -1 } },
            { $limit: parseInt(limit) }
        ];

        // Get low stock products (products with low quantity in any size)
        const lowStockPipeline = [
            {
                $match: {
                    'sellers.sellerId': new mongoose.Types.ObjectId(sellerId)
                }
            },
            { $unwind: '$sellers' },
            {
                $match: {
                    'sellers.sellerId': new mongoose.Types.ObjectId(sellerId)
                }
            },
            { $unwind: '$sellers.price_size' },
            {
                $match: {
                    'sellers.price_size.quantity': { $lt: 10 } // Low stock threshold
                }
            },
            {
                $group: {
                    _id: '$_id',
                    productName: { $first: '$name.en' },
                    productImage: { $first: { $arrayElemAt: ['$images', 0] } },
                    category: { $first: '$category' },
                    lowStockSizes: {
                        $push: {
                            size: '$sellers.price_size.size',
                            quantity: '$sellers.price_size.quantity',
                            price: '$sellers.price_size.price'
                        }
                    },
                    minQuantity: { $min: '$sellers.price_size.quantity' }
                }
            },
            { $sort: { minQuantity: 1 } },
            { $limit: parseInt(limit) }
        ];

        // Get product view statistics based on actual order data
        const productViewsPipeline = [
            createDateRangeMatch(dateRange.startDate, dateRange.endDate, 'createdAt'),
            { $unwind: '$items' },
            {
                $match: {
                    'items.sellerId': new mongoose.Types.ObjectId(sellerId)
                }
            },
            {
                $group: {
                    _id: '$items.product',
                    viewCount: { $sum: 1 }, // Count of times product was ordered (proxy for views)
                    totalQuantity: { $sum: '$items.quantity' },
                    lastOrdered: { $max: '$createdAt' }
                }
            },
            createLookupStage('products', '_id', '_id', 'productDetails'),
            { $unwind: '$productDetails' },
            {
                $project: {
                    productName: '$productDetails.name.en',
                    productImage: { $arrayElemAt: ['$productDetails.images', 0] },
                    category: '$productDetails.category',
                    views: '$viewCount', // Real view count based on orders
                    totalQuantity: 1,
                    lastOrdered: 1,
                    createdAt: '$productDetails.createdAt'
                }
            },
            { $sort: { views: -1 } },
            { $limit: parseInt(limit) }
        ];

        // Execute all aggregations
        const [topProducts, lowStockProducts, productViews] = await Promise.all([
            Order.aggregate(topProductsPipeline),
            Product.aggregate(lowStockPipeline),
            Order.aggregate(productViewsPipeline) // Changed from Product to Order
        ]);

        const result = {
            topProducts: topProducts || [],
            lowStockAlerts: lowStockProducts || [],
            productViews: productViews || [], // Real product views based on order data
            period,
            dateRange: {
                startDate: dateRange.startDate,
                endDate: dateRange.endDate
            }
        };

        setCachedData(cacheKey, result);

        return sendSuccess(res, result, 'Seller product performance analytics retrieved successfully');

    } catch (error) {
        return handleError(res, error, 'Failed to retrieve seller product performance analytics');
    }
};

// Get seller sales trends analytics
const getSellerSalesTrends = async (req, res) => {
    try {
        const sellerId = req.user.id;
        const { period = '30d', groupBy = 'daily' } = req.query;

        const cacheKey = `seller_trends_${sellerId}_${period}_${groupBy}`;
        const cachedData = getCachedData(cacheKey);

        if (cachedData) {
            return sendSuccess(res, cachedData, 'Seller sales trends data retrieved from cache');
        }

        const dateRange = getDateRange(period);

        // Create date grouping based on the groupBy parameter
        const dateGrouping = createDateGrouping(groupBy, 'createdAt');

        // Sales trends aggregation pipeline
        const salesTrendsPipeline = [
            createSellerMatch(sellerId),
            createDateRangeMatch(dateRange.startDate, dateRange.endDate),
            { $unwind: '$items' },
            {
                $match: {
                    'items.sellerId': new mongoose.Types.ObjectId(sellerId)
                }
            },
            {
                $group: {
                    _id: dateGrouping,
                    totalSales: { $sum: '$items.quantity' },
                    totalRevenue: { $sum: { $multiply: ['$items.selectedDiscountedPrice', '$items.quantity'] } },
                    orderCount: { $addToSet: '$_id' },
                    averageOrderValue: { $avg: { $multiply: ['$items.selectedDiscountedPrice', '$items.quantity'] } }
                }
            },
            {
                $project: {
                    _id: 1,
                    totalSales: 1,
                    totalRevenue: { $round: ['$totalRevenue', 2] },
                    orderCount: { $size: '$orderCount' },
                    averageOrderValue: { $round: ['$averageOrderValue', 2] },
                    date: {
                        $dateFromParts: {
                            year: '$_id.year',
                            month: { $ifNull: ['$_id.month', 1] },
                            day: { $ifNull: ['$_id.day', 1] }
                        }
                    }
                }
            },
            { $sort: { date: 1 } }
        ];

        // Revenue by category trends
        const categoryTrendsPipeline = [
            createSellerMatch(sellerId),
            createDateRangeMatch(dateRange.startDate, dateRange.endDate),
            { $unwind: '$items' },
            {
                $match: {
                    'items.sellerId': new mongoose.Types.ObjectId(sellerId)
                }
            },
            createLookupStage('products', 'items.product', '_id', 'productDetails'),
            { $unwind: '$productDetails' },
            // Lookup category details to get category name
            {
                $lookup: {
                    from: 'categories',
                    localField: 'productDetails.category',
                    foreignField: '_id',
                    as: 'categoryDetails'
                }
            },
            {
                $unwind: {
                    path: '$categoryDetails',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: {
                        category: '$productDetails.category',
                        categoryName: '$categoryDetails.name',
                        date: dateGrouping
                    },
                    revenue: { $sum: { $multiply: ['$items.selectedDiscountedPrice', '$items.quantity'] } },
                    quantity: { $sum: '$items.quantity' }
                }
            },
            {
                $group: {
                    _id: '$_id.category',
                    categoryName: { $first: '$_id.categoryName' },
                    totalRevenue: { $sum: '$revenue' },
                    totalQuantity: { $sum: '$quantity' },
                    trends: {
                        $push: {
                            date: {
                                $dateFromParts: {
                                    year: '$_id.date.year',
                                    month: { $ifNull: ['$_id.date.month', 1] },
                                    day: { $ifNull: ['$_id.date.day', 1] }
                                }
                            },
                            revenue: { $round: ['$revenue', 2] },
                            quantity: '$quantity'
                        }
                    }
                }
            },
            {
                $project: {
                    _id: { $ifNull: ['$categoryName', '$_id'] }, // Use category name if available
                    totalRevenue: 1,
                    totalQuantity: 1,
                    trends: 1
                }
            },
            { $sort: { totalRevenue: -1 } }
        ];

        // Execute aggregations
        const [salesTrends, categoryTrends] = await Promise.all([
            Order.aggregate(salesTrendsPipeline),
            Order.aggregate(categoryTrendsPipeline)
        ]);

        // Calculate growth trends
        const trendsWithGrowth = salesTrends.map((trend, index) => {
            if (index === 0) {
                return { ...trend, salesGrowth: 0, revenueGrowth: 0 };
            }

            const previousTrend = salesTrends[index - 1];
            const salesGrowth = calculateGrowthPercentage(trend.totalSales, previousTrend.totalSales);
            const revenueGrowth = calculateGrowthPercentage(trend.totalRevenue, previousTrend.totalRevenue);

            return {
                ...trend,
                salesGrowth: Math.round(salesGrowth * 100) / 100,
                revenueGrowth: Math.round(revenueGrowth * 100) / 100
            };
        });

        const result = {
            salesTrends: trendsWithGrowth,
            categoryTrends: categoryTrends.map(category => ({
                ...category,
                trends: category.trends.sort((a, b) => new Date(a.date) - new Date(b.date))
            })),
            period,
            groupBy,
            dateRange: {
                startDate: dateRange.startDate,
                endDate: dateRange.endDate
            }
        };

        setCachedData(cacheKey, result);

        return sendSuccess(res, result, 'Seller sales trends analytics retrieved successfully');

    } catch (error) {
        return handleError(res, error, 'Failed to retrieve seller sales trends analytics');
    }
};

// Admin Analytics Controllers

// Get admin platform overview analytics
const getAdminPlatformOverview = async (req, res) => {
    try {
        const { period = '30d', startDate: customStartDate, endDate: customEndDate } = req.query;

        const cacheKey = `admin_platform_overview_${period}_${customStartDate}_${customEndDate}`;
        const cachedData = getCachedData(cacheKey);

        if (cachedData) {
            return sendSuccess(res, cachedData, 'Admin platform overview data retrieved from cache');
        }

        // Get date range
        let dateRange;
        if (customStartDate && customEndDate) {
            dateRange = {
                startDate: new Date(customStartDate),
                endDate: new Date(customEndDate)
            };
        } else {
            dateRange = getDateRange(period);
        }

        // Get previous period for comparison
        const periodDuration = dateRange.endDate - dateRange.startDate;
        const previousPeriodStart = new Date(dateRange.startDate.getTime() - periodDuration);
        const previousPeriodEnd = dateRange.startDate;

        // Platform metrics aggregation
        const platformMetricsPipeline = [
            {
                $facet: {
                    // Total users count
                    totalUsers: [
                        { $match: {} },
                        { $count: "count" }
                    ],
                    // Active users (users with recent activity)
                    activeUsers: [
                        createDateRangeMatch(dateRange.startDate, dateRange.endDate, 'createdAt'),
                        { $count: "count" }
                    ],
                    // Users by account type
                    usersByType: [
                        {
                            $group: {
                                _id: '$accountType',
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    // User growth over time
                    userGrowth: [
                        createDateRangeMatch(dateRange.startDate, dateRange.endDate, 'createdAt'),
                        {
                            $group: {
                                _id: createDateGrouping('daily', 'createdAt'),
                                newUsers: { $sum: 1 }
                            }
                        },
                        {
                            $project: {
                                date: {
                                    $dateFromParts: {
                                        year: '$_id.year',
                                        month: '$_id.month',
                                        day: '$_id.day'
                                    }
                                },
                                newUsers: 1
                            }
                        },
                        { $sort: { date: 1 } }
                    ]
                }
            }
        ];

        // Product metrics aggregation
        const productMetricsPipeline = [
            {
                $facet: {
                    totalProducts: [
                        { $match: {} },
                        { $count: "count" }
                    ],
                    productsByCategory: [
                        // Add field to convert string category ID to ObjectId if needed
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
                        // Lookup category details
                        {
                            $lookup: {
                                from: 'categories',
                                localField: 'categoryObjectId',
                                foreignField: '_id',
                                as: 'categoryDetails'
                            }
                        },
                        {
                            $unwind: {
                                path: '$categoryDetails',
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            $group: {
                                _id: '$category',
                                categoryName: { $first: '$categoryDetails.name' },
                                count: { $sum: 1 },
                                avgRating: { $avg: '$avgRating' }
                            }
                        },
                        {
                            $project: {
                                category: { $ifNull: ['$categoryName', '$_id'] }, // Use category name if available
                                count: 1,
                                avgRating: 1
                            }
                        },
                        { $sort: { count: -1 } }
                    ],
                    recentProducts: [
                        createDateRangeMatch(dateRange.startDate, dateRange.endDate, 'createdAt'),
                        { $count: "count" }
                    ]
                }
            }
        ];

        // Revenue metrics aggregation
        const revenueMetricsPipeline = [
            {
                $facet: {
                    // Current period revenue
                    currentRevenue: [
                        createDateRangeMatch(dateRange.startDate, dateRange.endDate, 'createdAt'),
                        { $unwind: '$items' },
                        {
                            $group: {
                                _id: null,
                                totalRevenue: { $sum: { $multiply: ['$items.selectedDiscountedPrice', '$items.quantity'] } },
                                totalOrders: { $addToSet: '$_id' },
                                averageOrderValue: { $avg: { $multiply: ['$items.selectedDiscountedPrice', '$items.quantity'] } }
                            }
                        },
                        {
                            $project: {
                                totalRevenue: { $round: ['$totalRevenue', 2] },
                                totalOrders: { $size: '$totalOrders' },
                                averageOrderValue: { $round: ['$averageOrderValue', 2] }
                            }
                        }
                    ],
                    // Previous period revenue for comparison
                    previousRevenue: [
                        createDateRangeMatch(previousPeriodStart, previousPeriodEnd, 'createdAt'),
                        { $unwind: '$items' },
                        {
                            $group: {
                                _id: null,
                                totalRevenue: { $sum: { $multiply: ['$items.selectedDiscountedPrice', '$items.quantity'] } },
                                totalOrders: { $addToSet: '$_id' }
                            }
                        }
                    ],
                    // Revenue by payment method
                    revenueByPaymentMethod: [
                        createDateRangeMatch(dateRange.startDate, dateRange.endDate, 'createdAt'),
                        { $unwind: '$items' },
                        {
                            $group: {
                                _id: '$paymentMethod',
                                revenue: { $sum: { $multiply: ['$items.selectedDiscountedPrice', '$items.quantity'] } },
                                orderCount: { $addToSet: '$_id' }
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                revenue: { $round: ['$revenue', 2] },
                                orderCount: { $size: '$orderCount' }
                            }
                        }
                    ]
                }
            }
        ];

        // Execute all aggregations
        const [userMetrics, productMetrics, revenueMetrics] = await Promise.all([
            User.aggregate(platformMetricsPipeline),
            Product.aggregate(productMetricsPipeline),
            Order.aggregate(revenueMetricsPipeline)
        ]);

        // Process results
        const userStats = userMetrics[0];
        const productStats = productMetrics[0];
        const revenueStats = revenueMetrics[0];

        // Calculate growth percentages
        const currentRevenue = revenueStats.currentRevenue[0] || { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 };
        const previousRevenue = revenueStats.previousRevenue[0] || { totalRevenue: 0, totalOrders: 0 };

        const revenueGrowth = calculateGrowthPercentage(currentRevenue.totalRevenue, previousRevenue.totalRevenue);
        const orderGrowth = calculateGrowthPercentage(currentRevenue.totalOrders, previousRevenue.totalOrders);

        // Get seller count
        const sellerCount = userStats.usersByType.find(type => type._id === 'Seller')?.count || 0;
        const userCount = userStats.usersByType.find(type => type._id === 'User')?.count || 0;

        const result = {
            // Platform overview
            totalUsers: userStats.totalUsers[0]?.count || 0,
            activeUsers: userStats.activeUsers[0]?.count || 0,
            totalSellers: sellerCount,
            totalCustomers: userCount,
            totalProducts: productStats.totalProducts[0]?.count || 0,
            newProductsThisPeriod: productStats.recentProducts[0]?.count || 0,

            // Revenue metrics
            platformRevenue: currentRevenue.totalRevenue,
            totalOrders: currentRevenue.totalOrders,
            averageOrderValue: currentRevenue.averageOrderValue,
            revenueGrowth: Math.round(revenueGrowth * 100) / 100,
            orderGrowth: Math.round(orderGrowth * 100) / 100,

            // Detailed breakdowns
            userGrowth: userStats.userGrowth || [],
            categoryDistribution: productStats.productsByCategory || [],
            revenueByPaymentMethod: revenueStats.revenueByPaymentMethod || [],

            // Metadata
            period,
            dateRange: {
                startDate: dateRange.startDate,
                endDate: dateRange.endDate
            }
        };

        setCachedData(cacheKey, result);

        return sendSuccess(res, result, 'Admin platform overview analytics retrieved successfully');

    } catch (error) {
        return handleError(res, error, 'Failed to retrieve admin platform overview analytics');
    }
};

// Get admin user analytics
const getAdminUserAnalytics = async (req, res) => {
    try {
        const { period = '30d', startDate: customStartDate, endDate: customEndDate } = req.query;

        const cacheKey = `admin_user_analytics_${period}_${customStartDate}_${customEndDate}`;
        const cachedData = getCachedData(cacheKey);

        if (cachedData) {
            return sendSuccess(res, cachedData, 'Admin user analytics data retrieved from cache');
        }

        // Get date range
        let dateRange;
        if (customStartDate && customEndDate) {
            dateRange = {
                startDate: new Date(customStartDate),
                endDate: new Date(customEndDate)
            };
        } else {
            dateRange = getDateRange(period);
        }

        // User registration trends
        const registrationTrendsPipeline = [
            createDateRangeMatch(dateRange.startDate, dateRange.endDate, 'createdAt'),
            {
                $group: {
                    _id: {
                        date: createDateGrouping('daily', 'createdAt'),
                        accountType: '$accountType'
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: '$_id.date',
                    registrations: {
                        $push: {
                            accountType: '$_id.accountType',
                            count: '$count'
                        }
                    },
                    totalRegistrations: { $sum: '$count' }
                }
            },
            {
                $project: {
                    date: {
                        $dateFromParts: {
                            year: '$_id.year',
                            month: '$_id.month',
                            day: '$_id.day'
                        }
                    },
                    registrations: 1,
                    totalRegistrations: 1
                }
            },
            { $sort: { date: 1 } }
        ];

        // User activity patterns (based on order activity)
        const activityPatternsPipeline = [
            createDateRangeMatch(dateRange.startDate, dateRange.endDate, 'createdAt'),
            createLookupStage('users', 'userId', '_id', 'userDetails'),
            { $unwind: '$userDetails' },
            {
                $group: {
                    _id: {
                        userId: '$userId',
                        accountType: '$userDetails.accountType'
                    },
                    orderCount: { $sum: 1 },
                    totalSpent: {
                        $sum: {
                            $sum: {
                                $map: {
                                    input: '$items',
                                    as: 'item',
                                    in: { $multiply: ['$$item.selectedDiscountedPrice', '$$item.quantity'] }
                                }
                            }
                        }
                    },
                    lastActivity: { $max: '$createdAt' }
                }
            },
            {
                $group: {
                    _id: '$_id.accountType',
                    activeUsers: { $sum: 1 },
                    averageOrdersPerUser: { $avg: '$orderCount' },
                    averageSpentPerUser: { $avg: '$totalSpent' },
                    users: {
                        $push: {
                            userId: '$_id.userId',
                            orderCount: '$orderCount',
                            totalSpent: { $round: ['$totalSpent', 2] },
                            lastActivity: '$lastActivity'
                        }
                    }
                }
            }
        ];

        // User retention analysis
        const retentionAnalysisPipeline = [
            {
                $facet: {
                    // Users who registered in the period
                    newUsers: [
                        createDateRangeMatch(dateRange.startDate, dateRange.endDate, 'createdAt'),
                        {
                            $project: {
                                _id: 1,
                                createdAt: 1,
                                accountType: 1
                            }
                        }
                    ],
                    // Users who made orders (active users)
                    activeUsers: [
                        createDateRangeMatch(dateRange.startDate, dateRange.endDate, 'createdAt'),
                        {
                            $group: {
                                _id: '$userId',
                                orderCount: { $sum: 1 },
                                firstOrder: { $min: '$createdAt' },
                                lastOrder: { $max: '$createdAt' }
                            }
                        }
                    ]
                }
            }
        ];

        // Geographic distribution (if location data available)
        const geographicDistributionPipeline = [
            createLookupStage('addresses', '_id', 'userId', 'addresses'),
            { $unwind: { path: '$addresses', preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: {
                        state: '$addresses.state',
                        city: '$addresses.city'
                    },
                    userCount: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: '$_id.state',
                    totalUsers: { $sum: '$userCount' },
                    cities: {
                        $push: {
                            city: '$_id.city',
                            userCount: '$userCount'
                        }
                    }
                }
            },
            { $sort: { totalUsers: -1 } },
            { $limit: 10 }
        ];

        // Execute aggregations
        const [registrationTrends, activityPatterns, retentionData, geographicData] = await Promise.all([
            User.aggregate(registrationTrendsPipeline),
            Order.aggregate(activityPatternsPipeline),
            User.aggregate(retentionAnalysisPipeline),
            User.aggregate(geographicDistributionPipeline)
        ]);

        // Process retention data
        const retention = retentionData[0];
        const newUsersCount = retention.newUsers.length;
        const activeUsersCount = retention.activeUsers.length;
        const retentionRate = newUsersCount > 0 ? (activeUsersCount / newUsersCount) * 100 : 0;

        const result = {
            // Registration trends
            registrationTrends: registrationTrends || [],

            // Activity patterns
            activityPatterns: activityPatterns.map(pattern => ({
                ...pattern,
                averageOrdersPerUser: Math.round(pattern.averageOrdersPerUser * 100) / 100,
                averageSpentPerUser: Math.round(pattern.averageSpentPerUser * 100) / 100,
                // Don't include individual user data in response for privacy
                topUsers: pattern.users
                    .sort((a, b) => b.totalSpent - a.totalSpent)
                    .slice(0, 5)
                    .map(user => ({
                        orderCount: user.orderCount,
                        totalSpent: user.totalSpent,
                        lastActivity: user.lastActivity
                    }))
            })) || [],

            // Retention metrics
            retentionMetrics: {
                newUsers: newUsersCount,
                activeUsers: activeUsersCount,
                retentionRate: Math.round(retentionRate * 100) / 100
            },

            // Geographic distribution
            geographicDistribution: geographicData || [],

            // Summary statistics
            summary: {
                totalNewRegistrations: registrationTrends.reduce((sum, trend) => sum + trend.totalRegistrations, 0),
                averageDailyRegistrations: registrationTrends.length > 0
                    ? Math.round((registrationTrends.reduce((sum, trend) => sum + trend.totalRegistrations, 0) / registrationTrends.length) * 100) / 100
                    : 0
            },

            // Metadata
            period,
            dateRange: {
                startDate: dateRange.startDate,
                endDate: dateRange.endDate
            }
        };

        setCachedData(cacheKey, result);

        return sendSuccess(res, result, 'Admin user analytics retrieved successfully');

    } catch (error) {
        return handleError(res, error, 'Failed to retrieve admin user analytics');
    }
};

// Get admin product analytics
const getAdminProductAnalytics = async (req, res) => {
    try {
        const { period = '30d', startDate: customStartDate, endDate: customEndDate } = req.query;

        const cacheKey = `admin_product_analytics_${period}_${customStartDate}_${customEndDate}`;
        const cachedData = getCachedData(cacheKey);

        if (cachedData) {
            return sendSuccess(res, cachedData, 'Admin product analytics data retrieved from cache');
        }

        // Get date range
        let dateRange;
        if (customStartDate && customEndDate) {
            dateRange = {
                startDate: new Date(customStartDate),
                endDate: new Date(customEndDate)
            };
        } else {
            dateRange = getDateRange(period);
        }

        // Category-wise product distribution
        const categoryDistributionPipeline = [
            // Add field to convert string category ID to ObjectId if needed
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
            // First lookup to get category details
            {
                $lookup: {
                    from: 'categories',
                    localField: 'categoryObjectId',
                    foreignField: '_id',
                    as: 'categoryDetails'
                }
            },
            {
                $unwind: {
                    path: '$categoryDetails',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: '$category',
                    categoryName: { $first: '$categoryDetails.name' },
                    productCount: { $sum: 1 },
                    averageRating: { $avg: '$avgRating' },
                    totalRatings: { $sum: '$ratings.count' },
                    products: {
                        $push: {
                            id: '$_id',
                            name: '$name.en',
                            rating: '$avgRating',
                            createdAt: '$createdAt'
                        }
                    }
                }
            },
            {
                $project: {
                    category: { $ifNull: ['$categoryName', '$_id'] }, // Use category name if available, otherwise use ID
                    productCount: 1,
                    averageRating: { $round: ['$averageRating', 2] },
                    totalRatings: 1,
                    topProducts: {
                        $slice: [
                            {
                                $sortArray: {
                                    input: '$products',
                                    sortBy: { rating: -1 }
                                }
                            },
                            5
                        ]
                    }
                }
            },
            { $sort: { productCount: -1 } }
        ];

        // Most popular products (by orders)
        const popularProductsPipeline = [
            createDateRangeMatch(dateRange.startDate, dateRange.endDate, 'createdAt'),
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.product',
                    orderCount: { $sum: 1 },
                    totalQuantitySold: { $sum: '$items.quantity' },
                    totalRevenue: { $sum: { $multiply: ['$items.selectedDiscountedPrice', '$items.quantity'] } }
                }
            },
            createLookupStage('products', '_id', '_id', 'productDetails'),
            { $unwind: '$productDetails' },
            // Lookup category details for popular products
            {
                $lookup: {
                    from: 'categories',
                    localField: 'productDetails.category',
                    foreignField: '_id',
                    as: 'categoryDetails'
                }
            },
            {
                $unwind: {
                    path: '$categoryDetails',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    productId: '$_id',
                    productName: '$productDetails.name.en',
                    category: { $ifNull: ['$categoryDetails.name', '$productDetails.category'] },
                    orderCount: 1,
                    totalQuantitySold: 1,
                    totalRevenue: { $round: ['$totalRevenue', 2] },
                    averageRating: '$productDetails.avgRating',
                    image: { $arrayElemAt: ['$productDetails.images', 0] }
                }
            },
            { $sort: { totalQuantitySold: -1 } },
            { $limit: 20 }
        ];

        // Inventory status analysis
        const inventoryStatusPipeline = [
            { $unwind: '$sellers' },
            { $unwind: '$sellers.price_size' },
            // Add field to convert string category ID to ObjectId if needed
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
            // Lookup category details
            {
                $lookup: {
                    from: 'categories',
                    localField: 'categoryObjectId',
                    foreignField: '_id',
                    as: 'categoryDetails'
                }
            },
            {
                $unwind: {
                    path: '$categoryDetails',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: '$_id',
                    productName: { $first: '$name.en' },
                    category: { $first: '$category' },
                    categoryName: { $first: '$categoryDetails.name' },
                    totalStock: { $sum: '$sellers.price_size.quantity' },
                    averagePrice: { $avg: '$sellers.price_size.price' },
                    sellerCount: { $addToSet: '$sellers.sellerId' }
                }
            },
            {
                $project: {
                    productName: 1,
                    category: { $ifNull: ['$categoryName', '$category'] },
                    totalStock: 1,
                    averagePrice: { $round: ['$averagePrice', 2] },
                    sellerCount: { $size: '$sellerCount' },
                    stockStatus: {
                        $cond: {
                            if: { $lt: ['$totalStock', 10] },
                            then: 'Low Stock',
                            else: {
                                $cond: {
                                    if: { $lt: ['$totalStock', 50] },
                                    then: 'Medium Stock',
                                    else: 'High Stock'
                                }
                            }
                        }
                    }
                }
            },
            { $sort: { totalStock: 1 } }
        ];

        // Product performance trends
        const performanceTrendsPipeline = [
            createDateRangeMatch(dateRange.startDate, dateRange.endDate, 'createdAt'),
            { $unwind: '$items' },
            {
                $group: {
                    _id: {
                        date: createDateGrouping('daily', 'createdAt'),
                        product: '$items.product'
                    },
                    dailySales: { $sum: '$items.quantity' },
                    dailyRevenue: { $sum: { $multiply: ['$items.selectedDiscountedPrice', '$items.quantity'] } }
                }
            },
            {
                $group: {
                    _id: '$_id.date',
                    totalProducts: { $addToSet: '$_id.product' },
                    totalSales: { $sum: '$dailySales' },
                    totalRevenue: { $sum: '$dailyRevenue' }
                }
            },
            {
                $project: {
                    date: {
                        $dateFromParts: {
                            year: '$_id.year',
                            month: '$_id.month',
                            day: '$_id.day'
                        }
                    },
                    uniqueProductsSold: { $size: '$totalProducts' },
                    totalSales: 1,
                    totalRevenue: { $round: ['$totalRevenue', 2] }
                }
            },
            { $sort: { date: 1 } }
        ];

        // New products added in period
        const newProductsPipeline = [
            createDateRangeMatch(dateRange.startDate, dateRange.endDate, 'createdAt'),
            // Add field to convert string category ID to ObjectId if needed
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
            // Lookup category details
            {
                $lookup: {
                    from: 'categories',
                    localField: 'categoryObjectId',
                    foreignField: '_id',
                    as: 'categoryDetails'
                }
            },
            {
                $unwind: {
                    path: '$categoryDetails',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: {
                        date: createDateGrouping('daily', 'createdAt'),
                        category: '$category',
                        categoryName: '$categoryDetails.name'
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: '$_id.date',
                    newProducts: { $sum: '$count' },
                    categories: {
                        $push: {
                            category: { $ifNull: ['$_id.categoryName', '$_id.category'] },
                            count: '$count'
                        }
                    }
                }
            },
            {
                $project: {
                    date: {
                        $dateFromParts: {
                            year: '$_id.year',
                            month: '$_id.month',
                            day: '$_id.day'
                        }
                    },
                    newProducts: 1,
                    categories: 1
                }
            },
            { $sort: { date: 1 } }
        ];

        // Execute aggregations
        const [categoryDistribution, popularProducts, inventoryStatus, performanceTrends, newProducts] = await Promise.all([
            Product.aggregate(categoryDistributionPipeline),
            Order.aggregate(popularProductsPipeline),
            Product.aggregate(inventoryStatusPipeline),
            Order.aggregate(performanceTrendsPipeline),
            Product.aggregate(newProductsPipeline)
        ]);

        // Calculate summary statistics
        const totalProducts = inventoryStatus.length;
        const lowStockProducts = inventoryStatus.filter(p => p.stockStatus === 'Low Stock').length;
        const averageProductsPerCategory = categoryDistribution.length > 0
            ? Math.round((totalProducts / categoryDistribution.length) * 100) / 100
            : 0;

        const result = {
            // Category analysis
            categoryDistribution: categoryDistribution || [],

            // Popular products
            popularProducts: popularProducts || [],

            // Inventory insights
            inventoryStatus: {
                totalProducts,
                lowStockProducts,
                lowStockPercentage: totalProducts > 0 ? Math.round((lowStockProducts / totalProducts) * 100 * 100) / 100 : 0,
                stockDistribution: inventoryStatus.reduce((acc, product) => {
                    acc[product.stockStatus] = (acc[product.stockStatus] || 0) + 1;
                    return acc;
                }, {}),
                lowStockItems: inventoryStatus.filter(p => p.stockStatus === 'Low Stock').slice(0, 10)
            },

            // Performance trends
            performanceTrends: performanceTrends || [],

            // New product trends
            newProductTrends: newProducts || [],

            // Summary statistics
            summary: {
                totalCategories: categoryDistribution.length,
                averageProductsPerCategory,
                totalNewProducts: newProducts.reduce((sum, day) => sum + day.newProducts, 0),
                mostPopularCategory: categoryDistribution[0]?.category || 'N/A',
                averageRatingAcrossProducts: categoryDistribution.length > 0
                    ? Math.round((categoryDistribution.reduce((sum, cat) => sum + (cat.averageRating || 0), 0) / categoryDistribution.length) * 100) / 100
                    : 0
            },

            // Metadata
            period,
            dateRange: {
                startDate: dateRange.startDate,
                endDate: dateRange.endDate
            }
        };

        setCachedData(cacheKey, result);

        return sendSuccess(res, result, 'Admin product analytics retrieved successfully');

    } catch (error) {
        return handleError(res, error, 'Failed to retrieve admin product analytics');
    }
};

// Get admin financial analytics
const getAdminFinancialAnalytics = async (req, res) => {
    try {
        const { period = '30d', startDate: customStartDate, endDate: customEndDate } = req.query;

        const cacheKey = `admin_financial_analytics_${period}_${customStartDate}_${customEndDate}`;
        const cachedData = getCachedData(cacheKey);

        if (cachedData) {
            return sendSuccess(res, cachedData, 'Admin financial analytics data retrieved from cache');
        }

        // Get date range
        let dateRange;
        if (customStartDate && customEndDate) {
            dateRange = {
                startDate: new Date(customStartDate),
                endDate: new Date(customEndDate)
            };
        } else {
            dateRange = getDateRange(period);
        }

        // Get previous period for comparison
        const periodDuration = dateRange.endDate - dateRange.startDate;
        const previousPeriodStart = new Date(dateRange.startDate.getTime() - periodDuration);
        const previousPeriodEnd = dateRange.startDate;

        // Revenue trends over time
        const revenueTrendsPipeline = [
            createDateRangeMatch(dateRange.startDate, dateRange.endDate, 'createdAt'),
            { $unwind: '$items' },
            {
                $group: {
                    _id: createDateGrouping('daily', 'createdAt'),
                    dailyRevenue: { $sum: { $multiply: ['$items.selectedDiscountedPrice', '$items.quantity'] } },
                    dailyOrders: { $addToSet: '$_id' },
                    dailyItems: { $sum: '$items.quantity' }
                }
            },
            {
                $project: {
                    date: {
                        $dateFromParts: {
                            year: '$_id.year',
                            month: '$_id.month',
                            day: '$_id.day'
                        }
                    },
                    revenue: { $round: ['$dailyRevenue', 2] },
                    orders: { $size: '$dailyOrders' },
                    items: '$dailyItems'
                }
            },
            { $sort: { date: 1 } }
        ];

        // Commission earnings (assuming 5% platform commission)
        const commissionAnalysisPipeline = [
            createDateRangeMatch(dateRange.startDate, dateRange.endDate, 'createdAt'),
            { $unwind: '$items' },
            {
                $group: {
                    _id: {
                        date: createDateGrouping('daily', 'createdAt'),
                        seller: '$items.sellerId'
                    },
                    sellerRevenue: { $sum: { $multiply: ['$items.selectedDiscountedPrice', '$items.quantity'] } }
                }
            },
            {
                $group: {
                    _id: '$_id.date',
                    totalRevenue: { $sum: '$sellerRevenue' },
                    platformCommission: { $sum: { $multiply: ['$sellerRevenue', 0.05] } }, // 5% commission
                    uniqueSellers: { $addToSet: '$_id.seller' }
                }
            },
            {
                $project: {
                    date: {
                        $dateFromParts: {
                            year: '$_id.year',
                            month: '$_id.month',
                            day: '$_id.day'
                        }
                    },
                    totalRevenue: { $round: ['$totalRevenue', 2] },
                    platformCommission: { $round: ['$platformCommission', 2] },
                    activeSellers: { $size: '$uniqueSellers' }
                }
            },
            { $sort: { date: 1 } }
        ];

        // Payment method distribution
        const paymentMethodDistributionPipeline = [
            createDateRangeMatch(dateRange.startDate, dateRange.endDate, 'createdAt'),
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$paymentMethod',
                    revenue: { $sum: { $multiply: ['$items.selectedDiscountedPrice', '$items.quantity'] } },
                    orderCount: { $addToSet: '$_id' },
                    averageOrderValue: { $avg: { $multiply: ['$items.selectedDiscountedPrice', '$items.quantity'] } }
                }
            },
            {
                $project: {
                    paymentMethod: '$_id',
                    revenue: { $round: ['$revenue', 2] },
                    orderCount: { $size: '$orderCount' },
                    averageOrderValue: { $round: ['$averageOrderValue', 2] }
                }
            },
            { $sort: { revenue: -1 } }
        ];

        // Top revenue generating sellers
        const topSellersPipeline = [
            createDateRangeMatch(dateRange.startDate, dateRange.endDate, 'createdAt'),
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.sellerId',
                    totalRevenue: { $sum: { $multiply: ['$items.selectedDiscountedPrice', '$items.quantity'] } },
                    totalOrders: { $addToSet: '$_id' },
                    totalItems: { $sum: '$items.quantity' },
                    platformCommission: { $sum: { $multiply: [{ $multiply: ['$items.selectedDiscountedPrice', '$items.quantity'] }, 0.05] } }
                }
            },
            createLookupStage('users', '_id', '_id', 'sellerDetails'),
            { $unwind: '$sellerDetails' },
            {
                $project: {
                    sellerId: '$_id',
                    sellerName: '$sellerDetails.Name',
                    sellerEmail: '$sellerDetails.email',
                    totalRevenue: { $round: ['$totalRevenue', 2] },
                    totalOrders: { $size: '$totalOrders' },
                    totalItems: 1,
                    platformCommission: { $round: ['$platformCommission', 2] },
                    averageOrderValue: { $round: [{ $divide: ['$totalRevenue', { $size: '$totalOrders' }] }, 2] }
                }
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: 10 }
        ];

        // Financial summary for current and previous periods
        const financialSummaryPipeline = [
            {
                $facet: {
                    currentPeriod: [
                        createDateRangeMatch(dateRange.startDate, dateRange.endDate, 'createdAt'),
                        { $unwind: '$items' },
                        {
                            $group: {
                                _id: null,
                                totalRevenue: { $sum: { $multiply: ['$items.selectedDiscountedPrice', '$items.quantity'] } },
                                totalOrders: { $addToSet: '$_id' },
                                totalItems: { $sum: '$items.quantity' },
                                uniqueCustomers: { $addToSet: '$userId' },
                                uniqueSellers: { $addToSet: '$items.sellerId' }
                            }
                        }
                    ],
                    previousPeriod: [
                        createDateRangeMatch(previousPeriodStart, previousPeriodEnd, 'createdAt'),
                        { $unwind: '$items' },
                        {
                            $group: {
                                _id: null,
                                totalRevenue: { $sum: { $multiply: ['$items.selectedDiscountedPrice', '$items.quantity'] } },
                                totalOrders: { $addToSet: '$_id' },
                                totalItems: { $sum: '$items.quantity' }
                            }
                        }
                    ]
                }
            }
        ];

        // Execute aggregations
        const [revenueTrends, commissionAnalysis, paymentMethodDistribution, topSellers, financialSummary] = await Promise.all([
            Order.aggregate(revenueTrendsPipeline),
            Order.aggregate(commissionAnalysisPipeline),
            Order.aggregate(paymentMethodDistributionPipeline),
            Order.aggregate(topSellersPipeline),
            Order.aggregate(financialSummaryPipeline)
        ]);

        // Process financial summary
        const currentPeriod = financialSummary[0].currentPeriod[0] || {
            totalRevenue: 0, totalOrders: [], totalItems: 0, uniqueCustomers: [], uniqueSellers: []
        };
        const previousPeriod = financialSummary[0].previousPeriod[0] || {
            totalRevenue: 0, totalOrders: [], totalItems: 0
        };

        // Calculate growth metrics
        const revenueGrowth = calculateGrowthPercentage(currentPeriod.totalRevenue, previousPeriod.totalRevenue);
        const orderGrowth = calculateGrowthPercentage(currentPeriod.totalOrders.length, previousPeriod.totalOrders.length);

        // Calculate totals
        const totalCommission = commissionAnalysis.reduce((sum, day) => sum + day.platformCommission, 0);
        
        // Calculate actual days in the period for accurate daily average
        const totalDaysInPeriod = Math.ceil((dateRange.endDate - dateRange.startDate) / (1000 * 60 * 60 * 24));
        const totalRevenueInPeriod = revenueTrends.reduce((sum, day) => sum + day.revenue, 0);
        const averageDailyRevenue = totalDaysInPeriod > 0 
            ? totalRevenueInPeriod / totalDaysInPeriod 
            : 0;

        const result = {
            // Financial overview
            financialOverview: {
                totalRevenue: Math.round(currentPeriod.totalRevenue * 100) / 100,
                totalOrders: currentPeriod.totalOrders.length,
                totalItems: currentPeriod.totalItems,
                uniqueCustomers: currentPeriod.uniqueCustomers.length,
                uniqueSellers: currentPeriod.uniqueSellers.length,
                averageOrderValue: currentPeriod.totalOrders.length > 0
                    ? Math.round((currentPeriod.totalRevenue / currentPeriod.totalOrders.length) * 100) / 100
                    : 0,
                revenueGrowth: Math.round(revenueGrowth * 100) / 100,
                orderGrowth: Math.round(orderGrowth * 100) / 100
            },

            // Revenue trends
            revenueTrends: revenueTrends || [],

            // Commission analysis
            commissionAnalysis: {
                totalCommissionEarned: Math.round(totalCommission * 100) / 100,
                dailyCommissionTrends: commissionAnalysis || [],
                averageDailyCommission: commissionAnalysis.length > 0
                    ? Math.round((totalCommission / commissionAnalysis.length) * 100) / 100
                    : 0
            },

            // Payment insights
            paymentMethodDistribution: paymentMethodDistribution || [],

            // Top performers
            topSellers: topSellers || [],

            // Key metrics
            keyMetrics: {
                averageDailyRevenue: Math.round(averageDailyRevenue * 100) / 100,
                totalTransactionVolume: Math.round(currentPeriod.totalRevenue * 100) / 100,
                platformCommissionRate: 5, // 5%
                revenuePerCustomer: currentPeriod.uniqueCustomers.length > 0
                    ? Math.round((currentPeriod.totalRevenue / currentPeriod.uniqueCustomers.length) * 100) / 100
                    : 0,
                revenuePerSeller: currentPeriod.uniqueSellers.length > 0
                    ? Math.round((currentPeriod.totalRevenue / currentPeriod.uniqueSellers.length) * 100) / 100
                    : 0
            },

            // Metadata
            period,
            dateRange: {
                startDate: dateRange.startDate,
                endDate: dateRange.endDate
            }
        };

        setCachedData(cacheKey, result);

        return sendSuccess(res, result, 'Admin financial analytics retrieved successfully');

    } catch (error) {
        return handleError(res, error, 'Failed to retrieve admin financial analytics');
    }
};

// ============ CHANGED FOR APP - Seller Dashboard Analytics ============
// Simplified seller dashboard endpoint for mobile app
const getSellerDashboardAnalytics = async (req, res) => {
    try {
        const sellerId = req.user.id;

        // Get total products count
        const totalProducts = await Product.countDocuments({
            'sellers.sellerId': sellerId
        });

        // Get orders for this seller
        const orders = await Order.find({
            'items.sellerId': sellerId
        });

        // Calculate metrics
        let totalOrders = 0;
        let totalRevenue = 0;
        let pendingOrders = 0;

        orders.forEach(order => {
            const sellerItems = order.items.filter(item => 
                item.sellerId.toString() === sellerId
            );
            
            if (sellerItems.length > 0) {
                totalOrders++;
                sellerItems.forEach(item => {
                    totalRevenue += item.selectedDiscountedPrice * item.quantity;
                });
                
                if (order.orderStatus === 'Pending' || order.orderStatus === 'Processing') {
                    pendingOrders++;
                }
            }
        });

        // Get low stock products
        const products = await Product.find({
            'sellers.sellerId': sellerId
        });

        const lowStockProducts = [];
        products.forEach(product => {
            const sellerData = product.sellers.find(s => 
                s.sellerId.toString() === sellerId
            );
            
            if (sellerData) {
                sellerData.price_size.forEach(ps => {
                    if (ps.quantity < 10) {
                        lowStockProducts.push({
                            name: product.name,
                            size: ps.size,
                            stock: ps.quantity
                        });
                    }
                });
            }
        });

        // Get sales trend for last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentOrders = await Order.find({
            'items.sellerId': sellerId,
            createdAt: { $gte: sevenDaysAgo }
        }).sort({ createdAt: 1 });

        // Group by day
        const salesByDay = {};
        recentOrders.forEach(order => {
            const date = order.createdAt.toISOString().split('T')[0];
            if (!salesByDay[date]) {
                salesByDay[date] = 0;
            }
            
            order.items.forEach(item => {
                if (item.sellerId.toString() === sellerId) {
                    salesByDay[date] += item.selectedDiscountedPrice * item.quantity;
                }
            });
        });

        const salesTrend = Object.keys(salesByDay).map(date => ({
            label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: Math.round(salesByDay[date])
        }));

        res.status(200).json({
            success: true,
            data: {
                totalProducts,
                totalOrders,
                totalRevenue: Math.round(totalRevenue),
                pendingOrders,
                lowStockProducts: lowStockProducts.slice(0, 5),
                salesTrend
            }
        });

    } catch (error) {
        console.error('Error fetching seller dashboard analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard analytics',
            error: error.message
        });
    }
};

module.exports = {
    getDateRange,
    handleError,
    sendSuccess,
    getCachedData,
    setCachedData,
    invalidateAnalyticsCache,
    getSellerOverview,
    getSellerProductPerformance,
    getSellerSalesTrends,
    getAdminPlatformOverview,
    getAdminUserAnalytics,
    getAdminProductAnalytics,
    getAdminFinancialAnalytics,
    getSellerDashboardAnalytics // CHANGED FOR APP
};
