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
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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
    
    // Get product view statistics (mock data for now - would need view tracking)
    const productViewsPipeline = [
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
      {
        $project: {
          productName: '$name.en',
          productImage: { $arrayElemAt: ['$images', 0] },
          category: 1,
          // Mock view data - in real implementation, this would come from a views collection
          views: { $multiply: [{ $rand: {} }, 1000] },
          createdAt: 1
        }
      },
      { $sort: { views: -1 } },
      { $limit: parseInt(limit) }
    ];
    
    // Execute all aggregations
    const [topProducts, lowStockProducts, productViews] = await Promise.all([
      Order.aggregate(topProductsPipeline),
      Product.aggregate(lowStockPipeline),
      Product.aggregate(productViewsPipeline)
    ]);
    
    const result = {
      topProducts: topProducts || [],
      lowStockAlerts: lowStockProducts || [],
      productViews: productViews.map(product => ({
        ...product,
        views: Math.floor(product.views) // Round the mock views
      })) || [],
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
      {
        $group: {
          _id: {
            category: '$productDetails.category',
            date: dateGrouping
          },
          revenue: { $sum: { $multiply: ['$items.selectedDiscountedPrice', '$items.quantity'] } },
          quantity: { $sum: '$items.quantity' }
        }
      },
      {
        $group: {
          _id: '$_id.category',
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

module.exports = {
  getDateRange,
  handleError,
  sendSuccess,
  getCachedData,
  setCachedData,
  getSellerOverview,
  getSellerProductPerformance,
  getSellerSalesTrends
};