# Feature Description: Analytics & Reporting

## Feature Overview
This feature provides comprehensive analytics and reporting capabilities for both sellers and administrators, enabling data-driven decision making through detailed insights into sales performance, product trends, user behavior, and financial metrics. The system includes seller analytics (overview, product performance, sales trends), admin analytics (platform overview, user analytics, product analytics, financial analytics), real-time data aggregation using MongoDB pipelines, caching mechanism for performance optimization (1-minute cache duration), date range filtering with preset periods (7d, 30d, 90d, 1y) and custom ranges, growth percentage calculations comparing current vs previous periods, and a simplified mobile dashboard for sellers. The feature leverages advanced MongoDB aggregation pipelines, compound indexes, and efficient data processing to deliver fast, accurate analytics across the platform.

---

## Architecture Components

### Backend Components
1. **Controllers** (Business Logic Layer)
   - Analytics Controller (`controller/Analytics.js`)

2. **Routes** (API Endpoints Layer)
   - Analytics Routes (`routes/Analytics.js`)

3. **Utilities** (Helper Functions)
   - Aggregation Helpers (`utils/aggregationHelpers.js`)
   - Date range utilities
   - Cache management
   - Growth calculation

4. **Models** (Data Sources)
   - User Model (user analytics)
   - Product Model (product analytics)
   - Order Model (sales/revenue analytics)
   - Category Model (category analytics)
   - Address Model (geographic analytics)

### Frontend Components (Mobile App)
1. **Screens** (UI Layer)
   - Seller Dashboard (planned)
   - Analytics Charts (planned)

---

## Detailed Component Analysis

### 1. UTILITY FUNCTIONS

#### 1.1 Date Range Utilities

**Function: `getDateRange(period)`**
- **Purpose**: Converts period string to date range
- **Parameters**: period ('7d', '30d', '90d', '1y')
- **Returns**: { startDate, endDate }

**Period Mapping**:
- `'7d'`: Last 7 days
- `'30d'`: Last 30 days (default)
- `'90d'`: Last 90 days
- `'1y'`: Last 365 days

**Implementation**:
```javascript
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
```

---

#### 1.2 Response Utilities

**Function: `handleError(res, error, message)`**
- **Purpose**: Standardized error response
- **Parameters**:
  - res: Express response object
  - error: Error object
  - message: Custom error message
- **Response Format**:
```json
{
  "success": false,
  "message": "Error message",
  "error": "Error details",
  "timestamp": "2024-11-18T10:30:00.000Z"
}
```

**Function: `sendSuccess(res, data, message)`**
- **Purpose**: Standardized success response
- **Parameters**:
  - res: Express response object
  - data: Response data
  - message: Success message
- **Response Format**:
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... },
  "timestamp": "2024-11-18T10:30:00.000Z"
}
```

---

#### 1.3 Cache Management

**Cache Configuration**:
- Storage: In-memory Map
- Duration: 1 minute (60,000 ms)
- Purpose: Reduce database load for frequently accessed analytics

**Function: `getCachedData(key)`**
- **Purpose**: Retrieves cached data if valid
- **Returns**: Cached data or null

**Function: `setCachedData(key, data)`**
- **Purpose**: Stores data in cache with timestamp

**Function: `invalidateAnalyticsCache(sellerId)`**
- **Purpose**: Clears cache for seller or all analytics
- **Parameters**: sellerId (optional) - specific seller or all
- **Usage**: Called after order creation/update

**Cache Keys Format**:
- Seller overview: `seller_overview_{sellerId}_{period}_{customDates}`
- Seller products: `seller_products_{sellerId}_{period}_{limit}`
- Seller trends: `seller_trends_{sellerId}_{period}_{groupBy}`
- Admin platform: `admin_platform_overview_{period}_{customDates}`
- Admin users: `admin_user_analytics_{period}_{customDates}`
- Admin products: `admin_product_analytics_{period}_{customDates}`
- Admin financial: `admin_financial_analytics_{period}_{customDates}`

---

### 2. SELLER ANALYTICS CONTROLLERS

#### 2.1 Seller Overview Analytics

**Function: `getSellerOverview(req, res)`**
- **Route**: GET `/api/v1/analytics/seller/overview`
- **Authentication**: Required (Seller role)
- **Purpose**: Provides high-level seller performance metrics

**Query Parameters**:
- `period` (String, optional): '7d', '30d', '90d', '1y' (default: '30d')
- `startDate` (String, optional): Custom start date (ISO format)
- `endDate` (String, optional): Custom end date (ISO format)

**Processing Flow**:
1. **Extract Seller ID**: From authenticated request
2. **Check Cache**: Return cached data if available
3. **Determine Date Range**: Use period or custom dates
4. **Calculate Previous Period**: For growth comparison
5. **Current Period Aggregation**:
   - Match orders with seller items
   - Unwind items array
   - Filter by seller ID
   - Group and calculate:
     - Total sales (quantity)
     - Total revenue
     - Total orders (unique)
     - Average order value
6. **Previous Period Aggregation**: Same as current
7. **Calculate Growth**: Compare current vs previous
8. **Cache Result**: Store for 1 minute
9. **Return Response**: With metrics and growth percentages

**Aggregation Pipeline** (Current Period):
```javascript
[
  { $match: { 'items.sellerId': sellerId } },
  { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
  { $unwind: '$items' },
  { $match: { 'items.sellerId': sellerId } },
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
]
```

**Response**:
```json
{
  "success": true,
  "message": "Seller overview analytics retrieved successfully",
  "data": {
    "totalSales": 150,
    "totalRevenue": 45000,
    "totalOrders": 25,
    "averageOrderValue": 1800,
    "salesGrowth": 15.5,
    "revenueGrowth": 20.3,
    "orderGrowth": 12.0,
    "period": "30d",
    "dateRange": {
      "startDate": "2024-10-19T00:00:00.000Z",
      "endDate": "2024-11-18T23:59:59.999Z"
    }
  },
  "timestamp": "2024-11-18T10:30:00.000Z"
}
```

**Key Features**:
- Growth percentage calculations
- Previous period comparison
- Unique order counting
- Average order value
- Caching for performance

---

#### 2.2 Seller Product Performance Analytics

**Function: `getSellerProductPerformance(req, res)`**
- **Route**: GET `/api/v1/analytics/seller/products`
- **Authentication**: Required (Seller role)
- **Purpose**: Analyzes individual product performance for seller

**Query Parameters**:
- `period` (String, optional): '7d', '30d', '90d', '1y' (default: '30d')
- `limit` (Number, optional): Number of products to return (default: 10)

**Processing Flow**:
1. **Check Cache**: Return if available
2. **Top-Selling Products Aggregation**:
   - Match seller orders
   - Unwind items
   - Filter by seller ID
   - Group by product
   - Calculate: quantity sold, revenue, order count, average price
   - Lookup product details
   - Sort by quantity sold
   - Limit results
3. **Low Stock Products Aggregation**:
   - Match products with seller
   - Unwind sellers and price_size
   - Filter quantity < 10
   - Group by product
   - Sort by minimum quantity
4. **Product Views Aggregation**:
   - Based on order data (proxy for views)
   - Count order frequency per product
   - Lookup product details
5. **Return Combined Results**

**Response**:
```json
{
  "success": true,
  "data": {
    "topProducts": [
      {
        "productId": "prod_123",
        "productName": "Organic Fertilizer",
        "productImage": "image_url",
        "totalQuantitySold": 50,
        "totalRevenue": 15000,
        "orderCount": 20,
        "averagePrice": 300,
        "category": "Fertilizers"
      }
    ],
    "lowStockAlerts": [
      {
        "_id": "prod_456",
        "productName": "Seeds Pack",
        "productImage": "image_url",
        "category": "Seeds",
        "lowStockSizes": [
          { "size": "1kg", "quantity": 5, "price": 200 }
        ],
        "minQuantity": 5
      }
    ],
    "productViews": [
      {
        "productName": "Pesticide Spray",
        "productImage": "image_url",
        "category": "Pesticides",
        "views": 15,
        "totalQuantity": 30,
        "lastOrdered": "2024-11-18T10:00:00.000Z"
      }
    ],
    "period": "30d",
    "dateRange": { ... }
  }
}
```

**Key Features**:
- Top-selling products ranking
- Low stock alerts (< 10 units)
- Product view tracking
- Revenue per product
- Category breakdown

---

#### 2.3 Seller Sales Trends Analytics

**Function: `getSellerSalesTrends(req, res)`**
- **Route**: GET `/api/v1/analytics/seller/sales-trends`
- **Authentication**: Required (Seller role)
- **Purpose**: Tracks sales trends over time with category breakdown

**Query Parameters**:
- `period` (String, optional): '7d', '30d', '90d', '1y' (default: '30d')
- `groupBy` (String, optional): 'daily', 'weekly', 'monthly' (default: 'daily')

**Processing Flow**:
1. **Sales Trends Aggregation**:
   - Match seller orders in date range
   - Unwind items
   - Filter by seller ID
   - Group by date (daily/weekly/monthly)
   - Calculate: sales, revenue, order count, average order value
   - Sort by date
2. **Category Trends Aggregation**:
   - Match seller orders
   - Unwind items
   - Lookup product details
   - Lookup category details
   - Group by category and date
   - Calculate revenue and quantity per category
3. **Calculate Growth Trends**:
   - Compare each period with previous
   - Calculate sales growth %
   - Calculate revenue growth %
4. **Return Trends Data**

**Response**:
```json
{
  "success": true,
  "data": {
    "salesTrends": [
      {
        "_id": { "year": 2024, "month": 11, "day": 18 },
        "totalSales": 10,
        "totalRevenue": 3000,
        "orderCount": 5,
        "averageOrderValue": 600,
        "date": "2024-11-18T00:00:00.000Z",
        "salesGrowth": 5.2,
        "revenueGrowth": 8.5
      }
    ],
    "categoryTrends": [
      {
        "_id": "category_id",
        "categoryName": "Fertilizers",
        "totalRevenue": 25000,
        "totalQuantity": 100,
        "trends": [
          {
            "date": "2024-11-18T00:00:00.000Z",
            "revenue": 1500,
            "quantity": 5
          }
        ]
      }
    ],
    "period": "30d",
    "groupBy": "daily",
    "dateRange": { ... }
  }
}
```

**Key Features**:
- Time-series sales data
- Category-wise revenue breakdown
- Growth trend calculations
- Flexible date grouping
- Sorted chronologically

---

#### 2.4 Seller Dashboard Analytics (Mobile App)

**Function: `getSellerDashboardAnalytics(req, res)`**
- **Route**: GET `/api/v1/analytics/seller-dashboard`
- **Authentication**: Required (Seller or Admin role)
- **Purpose**: Simplified dashboard metrics for mobile app

**Processing Flow**:
1. **Count Total Products**: Products with seller ID
2. **Fetch All Orders**: Orders containing seller items
3. **Calculate Metrics**:
   - Total orders
   - Total revenue
   - Orders by status (pending, processing, shipped, delivered, cancelled)
4. **Identify Low Stock Products**: Quantity < 10
5. **Calculate 7-Day Sales Trend**:
   - Group orders by day
   - Calculate daily revenue
   - Format for chart display
6. **Return Dashboard Data**

**Response**:
```json
{
  "success": true,
  "data": {
    "totalProducts": 25,
    "totalOrders": 150,
    "totalRevenue": 45000,
    "pendingOrders": 5,
    "processingOrders": 10,
    "shippedOrders": 8,
    "deliveredOrders": 120,
    "cancelledOrders": 7,
    "lowStockProducts": [
      {
        "name": { "en": "Product Name" },
        "size": "1kg",
        "stock": 5
      }
    ],
    "salesTrend": [
      {
        "label": "Nov 12",
        "value": 3500
      },
      {
        "label": "Nov 13",
        "value": 4200
      }
    ]
  }
}
```

**Key Features**:
- Simplified metrics for mobile
- Order status breakdown
- Low stock alerts (top 5)
- 7-day sales trend chart data
- Fast response (no complex aggregations)

---

### 3. ADMIN ANALYTICS CONTROLLERS

#### 3.1 Admin Platform Overview Analytics

**Function: `getAdminPlatformOverview(req, res)`**
- **Route**: GET `/api/v1/analytics/admin/platform-overview`
- **Authentication**: Required (Admin role)
- **Purpose**: High-level platform metrics and KPIs

**Query Parameters**:
- `period` (String, optional): '7d', '30d', '90d', '1y' (default: '30d')
- `startDate` (String, optional): Custom start date
- `endDate` (String, optional): Custom end date

**Processing Flow**:
1. **User Metrics Aggregation**:
   - Total users count
   - Active users (recent activity)
   - Users by account type (User/Seller/Admin)
   - User growth over time (daily)
2. **Product Metrics Aggregation**:
   - Total products count
   - Products by category (with category names)
   - Recent products added
3. **Revenue Metrics Aggregation**:
   - Current period revenue
   - Previous period revenue (for comparison)
   - Revenue by payment method
4. **Calculate Growth Percentages**
5. **Return Comprehensive Overview**

**Response**:
```json
{
  "success": true,
  "data": {
    "totalUsers": 1500,
    "activeUsers": 450,
    "totalSellers": 50,
    "totalCustomers": 1400,
    "totalProducts": 500,
    "newProductsThisPeriod": 25,
    "platformRevenue": 250000,
    "totalOrders": 800,
    "averageOrderValue": 312.5,
    "revenueGrowth": 18.5,
    "orderGrowth": 15.2,
    "userGrowth": [
      {
        "date": "2024-11-18T00:00:00.000Z",
        "newUsers": 15
      }
    ],
    "categoryDistribution": [
      {
        "category": "Fertilizers",
        "count": 150,
        "avgRating": 4.5
      }
    ],
    "revenueByPaymentMethod": [
      {
        "_id": "online",
        "revenue": 180000,
        "orderCount": 600
      },
      {
        "_id": "cod",
        "revenue": 70000,
        "orderCount": 200
      }
    ],
    "period": "30d",
    "dateRange": { ... }
  }
}
```

**Key Features**:
- Platform-wide metrics
- User segmentation
- Product distribution
- Revenue breakdown
- Growth tracking

---

#### 3.2 Admin User Analytics

**Function: `getAdminUserAnalytics(req, res)`**
- **Route**: GET `/api/v1/analytics/admin/user-analytics`
- **Authentication**: Required (Admin role)
- **Purpose**: Detailed user behavior and demographics analysis

**Processing Flow**:
1. **Registration Trends**:
   - Daily registrations by account type
   - Total registrations per day
2. **Activity Patterns**:
   - Active users by account type
   - Average orders per user
   - Average spent per user
   - Top users by spending
3. **Retention Analysis**:
   - New users in period
   - Active users (made orders)
   - Retention rate calculation
4. **Geographic Distribution**:
   - Users by state
   - Users by city
   - Top 10 locations
5. **Summary Statistics**

**Response**:
```json
{
  "success": true,
  "data": {
    "registrationTrends": [
      {
        "date": "2024-11-18T00:00:00.000Z",
        "registrations": [
          { "accountType": "User", "count": 10 },
          { "accountType": "Seller", "count": 2 }
        ],
        "totalRegistrations": 12
      }
    ],
    "activityPatterns": [
      {
        "_id": "User",
        "activeUsers": 350,
        "averageOrdersPerUser": 2.5,
        "averageSpentPerUser": 1500,
        "topUsers": [
          {
            "orderCount": 15,
            "totalSpent": 25000,
            "lastActivity": "2024-11-18T10:00:00.000Z"
          }
        ]
      }
    ],
    "retentionMetrics": {
      "newUsers": 100,
      "activeUsers": 75,
      "retentionRate": 75.0
    },
    "geographicDistribution": [
      {
        "_id": "Mizoram",
        "totalUsers": 500,
        "cities": [
          { "city": "Aizawl", "userCount": 300 },
          { "city": "Lunglei", "userCount": 200 }
        ]
      }
    ],
    "summary": {
      "totalNewRegistrations": 100,
      "averageDailyRegistrations": 3.33
    },
    "period": "30d",
    "dateRange": { ... }
  }
}
```

**Key Features**:
- Registration tracking
- User activity analysis
- Retention metrics
- Geographic insights
- Top user identification

---

#### 3.3 Admin Product Analytics

**Function: `getAdminProductAnalytics(req, res)`**
- **Route**: GET `/api/v1/analytics/admin/product-analytics`
- **Authentication**: Required (Admin role)
- **Purpose**: Product performance and inventory analysis

**Processing Flow**:
1. **Category Distribution**:
   - Products per category (with category names)
   - Average rating per category
   - Total ratings per category
   - Top products per category
2. **Popular Products**:
   - Most ordered products
   - Total quantity sold
   - Total revenue per product
   - Order count per product
3. **Inventory Status**:
   - Total stock per product
   - Stock status (Low/Medium/High)
   - Seller count per product
   - Low stock alerts
4. **Performance Trends**:
   - Daily product sales
   - Daily revenue
   - Unique products sold per day
5. **New Product Trends**:
   - New products added per day
   - New products by category

**Response**:
```json
{
  "success": true,
  "data": {
    "categoryDistribution": [
      {
        "category": "Fertilizers",
        "productCount": 150,
        "averageRating": 4.5,
        "totalRatings": 500,
        "topProducts": [
          {
            "id": "prod_123",
            "name": "Organic Fertilizer",
            "rating": 4.8
          }
        ]
      }
    ],
    "popularProducts": [
      {
        "productId": "prod_123",
        "productName": "Organic Fertilizer",
        "category": "Fertilizers",
        "orderCount": 50,
        "totalQuantitySold": 200,
        "totalRevenue": 60000,
        "averageRating": 4.8,
        "image": "image_url"
      }
    ],
    "inventoryStatus": {
      "totalProducts": 500,
      "lowStockProducts": 25,
      "lowStockPercentage": 5.0,
      "stockDistribution": {
        "Low Stock": 25,
        "Medium Stock": 150,
        "High Stock": 325
      },
      "lowStockItems": [
        {
          "productName": "Seeds Pack",
          "category": "Seeds",
          "totalStock": 8,
          "averagePrice": 200,
          "sellerCount": 2,
          "stockStatus": "Low Stock"
        }
      ]
    },
    "performanceTrends": [
      {
        "date": "2024-11-18T00:00:00.000Z",
        "uniqueProductsSold": 45,
        "totalSales": 150,
        "totalRevenue": 45000
      }
    ],
    "newProductTrends": [
      {
        "date": "2024-11-18T00:00:00.000Z",
        "newProducts": 5,
        "categories": [
          { "category": "Fertilizers", "count": 3 },
          { "category": "Seeds", "count": 2 }
        ]
      }
    ],
    "summary": {
      "totalCategories": 10,
      "averageProductsPerCategory": 50,
      "totalNewProducts": 25,
      "mostPopularCategory": "Fertilizers",
      "averageRatingAcrossProducts": 4.3
    },
    "period": "30d",
    "dateRange": { ... }
  }
}
```

**Key Features**:
- Category-wise analysis
- Popular product ranking
- Inventory management insights
- Performance tracking
- New product monitoring

---

#### 3.4 Admin Financial Analytics

**Function: `getAdminFinancialAnalytics(req, res)`**
- **Route**: GET `/api/v1/analytics/admin/revenue-analytics`
- **Authentication**: Required (Admin role)
- **Purpose**: Comprehensive financial metrics and revenue analysis

**Processing Flow**:
1. **Revenue Trends**:
   - Daily revenue
   - Daily orders
   - Daily items sold
2. **Commission Analysis**:
   - Platform commission (5% of seller revenue)
   - Daily commission trends
   - Active sellers per day
3. **Payment Method Distribution**:
   - Revenue by payment method
   - Order count by payment method
   - Average order value by method
4. **Top Sellers**:
   - Revenue per seller
   - Orders per seller
   - Platform commission per seller
5. **Financial Summary**:
   - Current vs previous period comparison
   - Growth metrics
   - Key financial KPIs

**Response**:
```json
{
  "success": true,
  "data": {
    "financialOverview": {
      "totalRevenue": 250000,
      "totalOrders": 800,
      "totalItems": 2500,
      "uniqueCustomers": 450,
      "uniqueSellers": 50,
      "averageOrderValue": 312.5,
      "revenueGrowth": 18.5,
      "orderGrowth": 15.2
    },
    "revenueTrends": [
      {
        "date": "2024-11-18T00:00:00.000Z",
        "revenue": 8500,
        "orders": 28,
        "items": 85
      }
    ],
    "commissionAnalysis": {
      "totalCommissionEarned": 12500,
      "dailyCommissionTrends": [
        {
          "date": "2024-11-18T00:00:00.000Z",
          "totalRevenue": 8500,
          "platformCommission": 425,
          "activeSellers": 15
        }
      ],
      "averageDailyCommission": 416.67
    },
    "paymentMethodDistribution": [
      {
        "paymentMethod": "online",
        "revenue": 180000,
        "orderCount": 600,
        "averageOrderValue": 300
      },
      {
        "paymentMethod": "cod",
        "revenue": 70000,
        "orderCount": 200,
        "averageOrderValue": 350
      }
    ],
    "topSellers": [
      {
        "sellerId": "seller_123",
        "sellerName": "John's Farm",
        "sellerEmail": "john@example.com",
        "totalRevenue": 50000,
        "totalOrders": 150,
        "totalItems": 500,
        "platformCommission": 2500,
        "averageOrderValue": 333.33
      }
    ],
    "keyMetrics": {
      "averageDailyRevenue": 8333.33,
      "totalTransactionVolume": 250000,
      "platformCommissionRate": 5,
      "revenuePerCustomer": 555.56,
      "revenuePerSeller": 5000
    },
    "period": "30d",
    "dateRange": { ... }
  }
}
```

**Key Features**:
- Revenue tracking
- Commission calculations (5%)
- Payment method insights
- Seller performance ranking
- Financial KPIs

---

### 4. ROUTES

#### 4.1 Analytics Routes (`agri_backend/routes/Analytics.js`)

**Seller Analytics Routes**:
```
GET /api/v1/analytics/seller/overview           - Seller overview (auth, seller)
GET /api/v1/analytics/seller/products           - Product performance (auth, seller)
GET /api/v1/analytics/seller/sales-trends       - Sales trends (auth, seller)
GET /api/v1/analytics/seller-dashboard          - Mobile dashboard (auth, seller/admin)
```

**Admin Analytics Routes**:
```
GET /api/v1/analytics/admin/platform-overview   - Platform overview (auth, admin)
GET /api/v1/analytics/admin/user-analytics      - User analytics (auth, admin)
GET /api/v1/analytics/admin/product-analytics   - Product analytics (auth, admin)
GET /api/v1/analytics/admin/revenue-analytics   - Financial analytics (auth, admin)
```

**Utility Routes**:
```
GET  /api/v1/analytics/health                   - Health check (no auth)
POST /api/v1/analytics/cache/invalidate         - Invalidate cache (auth)
GET  /api/v1/analytics/debug/categories         - Debug categories (auth, admin)
```

**Planned Routes** (Not Implemented):
```
GET  /api/v1/analytics/export/:type             - Export data (501)
POST /api/v1/analytics/alerts/configure         - Configure alerts (501)
GET  /api/v1/analytics/alerts/list              - List alerts (501)
```

**Middleware**:
- `auth`: JWT authentication
- `isSeller`: Seller role check
- `isAdmin`: Admin role check
- `isSellerOrAdmin`: Custom middleware for seller or admin

---

## DATA FLOW DIAGRAMS

### Seller Overview Analytics Flow
```
Seller (Mobile/Web)
    ↓ [GET /analytics/seller/overview?period=30d]
Analytics.getSellerOverview()
    ↓ [Extract sellerId from auth token]
    ↓ [Check cache]
if (cached)
    ↓ [Return cached data]
else
    ↓ [Calculate date range]
    ↓ [Calculate previous period]
    ↓ [Build aggregation pipelines]
Current Period Pipeline
    ↓ [Match orders with seller items]
    ↓ [Unwind items array]
    ↓ [Filter by sellerId]
    ↓ [Group and calculate metrics]
Previous Period Pipeline
    ↓ [Same as current, different dates]
Execute Aggregations
    ↓ [Promise.all for parallel execution]
Database
    ↓ [Return aggregation results]
Calculate Growth
    ↓ [Compare current vs previous]
    ↓ [Calculate percentages]
Cache Result
    ↓ [Store for 1 minute]
Response
    ↓ [Return metrics with growth]
Display to Seller
```

### Admin Platform Overview Flow
```
Admin (Web Dashboard)
    ↓ [GET /analytics/admin/platform-overview?period=30d]
Analytics.getAdminPlatformOverview()
    ↓ [Check cache]
if (cached)
    ↓ [Return cached data]
else
    ↓ [Calculate date ranges]
User Metrics Pipeline
    ↓ [Total users, active users, user types, growth]
Product Metrics Pipeline
    ↓ [Total products, by category, recent products]
Revenue Metrics Pipeline
    ↓ [Current revenue, previous revenue, by payment method]
Execute All Pipelines
    ↓ [Promise.all([users, products, revenue])]
Database
    ↓ [Return all aggregation results]
Process Results
    ↓ [Extract metrics from each pipeline]
    ↓ [Calculate growth percentages]
    ↓ [Build comprehensive overview]
Cache Result
    ↓ [Store for 1 minute]
Response
    ↓ [Return platform metrics]
Display Dashboard
```

### Cache Invalidation Flow
```
Order Created/Updated
    ↓ [Order.createOrder() or Order.updateOrderStatus()]
    ↓ [Extract sellerId from order items]
invalidateAnalyticsCache(sellerId)
    ↓ [Find all cache keys for seller]
    ↓ [Delete matching keys]
Cache Cleared
    ↓ [Next request will fetch fresh data]
Console Log
    ↓ ['🔄 Analytics cache invalidated for seller: {sellerId}']
```

### Seller Dashboard (Mobile) Flow
```
Seller (Mobile App)
    ↓ [Opens dashboard screen]
    ↓ [GET /analytics/seller-dashboard]
Analytics.getSellerDashboardAnalytics()
    ↓ [Extract sellerId from auth]
Count Products
    ↓ [Product.countDocuments({ 'sellers.sellerId': sellerId })]
Fetch Orders
    ↓ [Order.find({ 'items.sellerId': sellerId })]
Calculate Metrics
    ↓ [Loop through orders]
    ↓ [Filter seller items]
    ↓ [Calculate revenue, count by status]
Identify Low Stock
    ↓ [Product.find({ 'sellers.sellerId': sellerId })]
    ↓ [Check quantity < 10]
Calculate 7-Day Trend
    ↓ [Filter orders from last 7 days]
    ↓ [Group by date]
    ↓ [Calculate daily revenue]
Response
    ↓ [Return dashboard metrics]
Display Dashboard
    ↓ [Show charts and stats]
```

---

## KEY FEATURES & CAPABILITIES

### 1. Comprehensive Analytics
- Seller-specific metrics
- Platform-wide admin analytics
- User behavior analysis
- Product performance tracking
- Financial insights

### 2. Time-Based Analysis
- Preset periods (7d, 30d, 90d, 1y)
- Custom date ranges
- Growth comparisons
- Trend analysis
- Historical data

### 3. Performance Optimization
- In-memory caching (1-minute duration)
- MongoDB aggregation pipelines
- Parallel query execution
- Indexed fields
- Efficient data processing

### 4. Growth Tracking
- Current vs previous period comparison
- Percentage growth calculations
- Trend identification
- Performance indicators
- KPI monitoring

### 5. Multi-Dimensional Analysis
- By seller
- By category
- By product
- By payment method
- By geographic location
- By time period

### 6. Real-Time Insights
- Fresh data on cache miss
- Automatic cache invalidation
- Up-to-date metrics
- Live dashboard updates

### 7. Seller Tools
- Product performance insights
- Low stock alerts
- Sales trends
- Revenue tracking
- Order status breakdown

### 8. Admin Tools
- Platform overview
- User analytics
- Product analytics
- Financial analytics
- Top performers identification

### 9. Mobile Optimization
- Simplified dashboard endpoint
- Fast response times
- Essential metrics only
- Chart-ready data format

### 10. Flexible Grouping
- Daily aggregation
- Weekly aggregation
- Monthly aggregation
- Custom periods

---

## BUSINESS RULES

### Data Access
1. Sellers can only access their own analytics
2. Admins can access all platform analytics
3. Authentication required for all analytics endpoints
4. Role-based access control enforced

### Date Ranges
1. Default period is 30 days
2. Custom date ranges supported
3. Previous period calculated automatically for comparison
4. Date ranges validated before processing

### Caching
1. Cache duration: 1 minute
2. Cache invalidated on order creation/update
3. Seller-specific cache invalidation
4. Cache keys include all query parameters

### Growth Calculations
1. Growth = ((current - previous) / previous) * 100
2. Handle division by zero (return 0)
3. Round to 2 decimal places
4. Negative growth indicates decline

### Commission
1. Platform commission rate: 5%
2. Applied to seller revenue
3. Calculated per transaction
4. Tracked in financial analytics

### Stock Alerts
1. Low stock threshold: < 10 units
2. Alerts per product size
3. Top 5 low stock items shown
4. Seller-specific alerts

### Aggregation
1. Use MongoDB aggregation pipelines
2. Unwind arrays for item-level analysis
3. Lookup related collections
4. Group and calculate metrics
5. Sort and limit results

---

## SECURITY FEATURES

### 1. Authentication
- JWT token required for all routes
- User ID extracted from token
- Token validation on every request

### 2. Authorization
- Role-based access control
- Seller routes: isSeller middleware
- Admin routes: isAdmin middleware
- Seller-specific data filtering

### 3. Data Privacy
- Sellers see only their data
- User PII protected in analytics
- Top users anonymized (no user IDs in response)
- Email addresses only for admin

### 4. Input Validation
- Period parameter validation
- Date range validation
- Limit parameter validation
- Seller ID validation

### 5. Error Handling
- No sensitive data in error messages
- Generic error responses
- Error logging for debugging
- Timestamp in all responses

---

## PERFORMANCE OPTIMIZATIONS

### 1. Caching Strategy
- In-memory Map for fast access
- 1-minute cache duration
- Selective cache invalidation
- Cache key includes all parameters

### 2. Database Optimization
- MongoDB aggregation pipelines
- Indexed fields (userId, sellerId, createdAt)
- Compound indexes
- Efficient queries

### 3. Parallel Execution
- Promise.all for multiple aggregations
- Concurrent pipeline execution
- Reduced total query time

### 4. Data Limiting
- Limit results (default: 10, max: 50)
- Pagination support (planned)
- Top N queries
- Selective field projection

### 5. Aggregation Efficiency
- Single-pass aggregations
- Minimal data transfer
- Server-side calculations
- Optimized grouping

### 6. Response Optimization
- Rounded numbers (2 decimal places)
- Minimal payload size
- Structured data format
- Timestamp for cache validation

---

## TESTING CONSIDERATIONS

### Unit Tests

**Utility Functions**:
- Test getDateRange() with all periods
- Test calculateGrowthPercentage() with various inputs
- Test cache get/set/invalidate functions
- Test date grouping functions
- Test error handling functions

**Growth Calculations**:
- Test positive growth
- Test negative growth
- Test zero previous value
- Test equal values (0% growth)
- Test rounding

**Cache Management**:
- Test cache hit
- Test cache miss
- Test cache expiration
- Test cache invalidation
- Test seller-specific invalidation

### Integration Tests

**Seller Analytics**:
- Test seller overview with real data
- Test product performance aggregation
- Test sales trends calculation
- Test dashboard metrics
- Test cache behavior

**Admin Analytics**:
- Test platform overview
- Test user analytics
- Test product analytics
- Test financial analytics
- Test all aggregation pipelines

**Date Ranges**:
- Test preset periods
- Test custom date ranges
- Test previous period calculation
- Test edge cases (same day, year boundary)

**Authorization**:
- Test seller accessing own data
- Test seller accessing other seller data (should fail)
- Test admin accessing all data
- Test unauthenticated access (should fail)

### E2E Tests

**Complete Analytics Journey**:
- Seller logs in
- Requests overview analytics
- Views product performance
- Checks sales trends
- Sees dashboard on mobile

**Admin Dashboard**:
- Admin logs in
- Views platform overview
- Analyzes user metrics
- Reviews product analytics
- Examines financial data

**Cache Behavior**:
- First request (cache miss)
- Second request (cache hit)
- Order created (cache invalidated)
- Third request (cache miss, fresh data)

### Performance Tests

**Load Testing**:
- Multiple concurrent requests
- Large date ranges
- Many products/orders
- Cache effectiveness
- Response time benchmarks

**Aggregation Performance**:
- Test with 1K orders
- Test with 10K orders
- Test with 100K orders
- Measure query execution time
- Identify bottlenecks

---

## FUTURE ENHANCEMENTS

1. **Real-Time Analytics**: WebSocket-based live updates for dashboard

2. **Advanced Filtering**: Filter by category, product, date range, payment method

3. **Export Functionality**: Export analytics data to CSV, Excel, PDF

4. **Custom Reports**: User-defined report templates and scheduling

5. **Predictive Analytics**: ML-based sales forecasting and trend prediction

6. **Comparative Analytics**: Compare multiple time periods side-by-side

7. **Cohort Analysis**: User cohort behavior tracking and retention analysis

8. **Funnel Analytics**: Conversion funnel tracking (view → cart → purchase)

9. **A/B Testing**: Built-in A/B testing framework for features

10. **Alert System**: Automated alerts for anomalies and thresholds

11. **Data Visualization**: Interactive charts and graphs (Chart.js, D3.js)

12. **Mobile Analytics**: App-specific analytics (screen views, user flow)

13. **Geographic Heatmaps**: Visual representation of user distribution

14. **Inventory Forecasting**: Predict stock requirements based on trends

15. **Customer Segmentation**: RFM analysis (Recency, Frequency, Monetary)

16. **Product Recommendations**: Analytics-driven product suggestions

17. **Seasonal Trends**: Identify seasonal patterns in sales

18. **Competitor Analysis**: Benchmark against industry standards

19. **ROI Tracking**: Marketing campaign ROI calculation

20. **Custom Dashboards**: User-configurable dashboard widgets

21. **Data Warehouse**: Separate analytics database for complex queries

22. **API Rate Limiting**: Prevent analytics API abuse

23. **Scheduled Reports**: Email reports on schedule (daily, weekly, monthly)

24. **Drill-Down Analysis**: Click-through to detailed data

25. **Multi-Currency Support**: Analytics in multiple currencies

26. **Tax Analytics**: Tax collection and reporting

27. **Refund Analytics**: Track refunds and returns

28. **Shipping Analytics**: Delivery time and cost analysis

29. **Customer Lifetime Value**: CLV calculation and tracking

30. **Churn Prediction**: Identify at-risk customers

---

## API ENDPOINTS SUMMARY

### Seller Analytics
```
GET /api/v1/analytics/seller/overview
Query: period, startDate, endDate
Auth: Required (Seller)
Response: Overview metrics with growth

GET /api/v1/analytics/seller/products
Query: period, limit
Auth: Required (Seller)
Response: Product performance data

GET /api/v1/analytics/seller/sales-trends
Query: period, groupBy
Auth: Required (Seller)
Response: Sales trends over time

GET /api/v1/analytics/seller-dashboard
Auth: Required (Seller/Admin)
Response: Simplified dashboard metrics
```

### Admin Analytics
```
GET /api/v1/analytics/admin/platform-overview
Query: period, startDate, endDate
Auth: Required (Admin)
Response: Platform-wide metrics

GET /api/v1/analytics/admin/user-analytics
Query: period, startDate, endDate
Auth: Required (Admin)
Response: User behavior analytics

GET /api/v1/analytics/admin/product-analytics
Query: period, startDate, endDate
Auth: Required (Admin)
Response: Product performance analytics

GET /api/v1/analytics/admin/revenue-analytics
Query: period, startDate, endDate
Auth: Required (Admin)
Response: Financial analytics
```

### Utility Endpoints
```
GET /api/v1/analytics/health
Auth: Not required
Response: Service health status

POST /api/v1/analytics/cache/invalidate
Body: { sellerId }
Auth: Required
Response: Cache invalidation confirmation
```

---

## AGGREGATION HELPERS SUMMARY

### Helper Functions (from utils/aggregationHelpers.js)

**createDateRangeMatch(startDate, endDate, field)**:
- Creates MongoDB match stage for date filtering
- Default field: 'createdAt'
- Returns: { $match: { [field]: { $gte: startDate, $lte: endDate } } }

**createSellerMatch(sellerId)**:
- Creates match stage for seller filtering
- Returns: { $match: { 'items.sellerId': ObjectId(sellerId) } }

**calculateGrowthPercentage(current, previous)**:
- Calculates percentage growth
- Handles division by zero
- Returns: ((current - previous) / previous) * 100

**createDateGrouping(groupBy, field)**:
- Creates date grouping for aggregation
- Supports: 'daily', 'weekly', 'monthly'
- Returns: { year, month, day } object

**createLookupStage(from, localField, foreignField, as)**:
- Creates MongoDB $lookup stage
- Joins collections
- Returns: { $lookup: { from, localField, foreignField, as } }

**createUnwindStage(path, preserveNullAndEmptyArrays)**:
- Creates MongoDB $unwind stage
- Optionally preserves null/empty arrays
- Returns: { $unwind: { path, preserveNullAndEmptyArrays } }

---

## CACHE MANAGEMENT

### Cache Structure
```javascript
const analyticsCache = new Map();
// Key: 'seller_overview_sellerId_period_dates'
// Value: { data: {...}, timestamp: 1234567890 }
```

### Cache Operations

**Set Cache**:
```javascript
setCachedData(key, data);
// Stores: { data, timestamp: Date.now() }
```

**Get Cache**:
```javascript
const data = getCachedData(key);
// Returns: data if valid, null if expired/missing
```

**Invalidate Cache**:
```javascript
invalidateAnalyticsCache(sellerId);
// Clears: All seller-specific cache or all cache
```

### Cache Invalidation Triggers
- Order created
- Order updated
- Order cancelled
- Payment completed
- Manual invalidation via API

---

## CONCLUSION

The Analytics & Reporting feature provides comprehensive data insights for both sellers and administrators, enabling informed business decisions through detailed metrics, trends, and performance indicators. The system leverages MongoDB's powerful aggregation framework, efficient caching strategies, and optimized queries to deliver fast, accurate analytics across the platform.

**Key Strengths**:
- Comprehensive seller and admin analytics
- Real-time data with 1-minute cache
- Growth tracking and trend analysis
- Multi-dimensional analysis capabilities
- Performance-optimized aggregation pipelines
- Role-based access control
- Flexible date range filtering
- Mobile-optimized dashboard endpoint
- Low stock alerts and inventory insights
- Financial metrics with commission tracking

The system is designed with scalability in mind, using MongoDB aggregation pipelines that can handle large datasets efficiently. The caching mechanism significantly reduces database load while ensuring data freshness through automatic cache invalidation on relevant events.

**Current Limitations**:
- No real-time updates (1-minute cache delay)
- Limited export functionality
- No custom report builder
- No predictive analytics
- No data visualization (charts generated client-side)
- No scheduled reports
- No alert system
- Frontend implementation pending

These limitations present opportunities for future enhancements that would significantly expand the analytics capabilities, including real-time dashboards, advanced forecasting, automated alerts, and comprehensive data export options.

The feature successfully provides actionable insights for sellers to optimize their product offerings and sales strategies, while giving administrators a complete view of platform health, user engagement, and financial performance.

---

**Documentation Version**: 1.0  
**Last Updated**: November 2024  
**Feature Status**: Backend Complete, Frontend Pending
