# Feature Description: Seller Features (Consolidated)

## Feature Overview
This feature consolidates all seller-specific functionality into a comprehensive seller management system, providing sellers with tools to manage their business on the PreciAgri platform. The system includes a dedicated seller dashboard with key metrics and analytics, product management (create, edit, delete, bulk upload), order management with status updates and filtering, sales analytics with charts and trends, low stock alerts and inventory monitoring, seller profile management, and a mobile-optimized interface with dedicated navigation. This feature empowers sellers to efficiently run their agricultural product business through an intuitive, data-driven interface.

---

## Architecture Components

### Backend Components (Referenced from Other Features)
1. **Authentication & Authorization**
   - Seller role in User model
   - isSeller middleware for route protection
   - JWT-based authentication

2. **Product Management**
   - Product CRUD operations
   - Seller-specific product queries
   - Bulk upload functionality
   - Multi-seller support

3. **Order Management**
   - Seller order queries
   - Order status updates
   - Seller-specific order filtering
   - Shiprocket integration

4. **Analytics**
   - Seller dashboard analytics endpoint
   - Sales trends calculation
   - Revenue tracking
   - Order statistics

5. **Notifications**
   - Seller-specific notifications
   - New order alerts
   - Payment notifications

### Frontend Components (Mobile App)
1. **Screens** (UI Layer)
   - SellerDashboard (`screens/Seller/SellerDashboard.js`)
   - SellerProducts (`screens/Seller/SellerProducts.js`)
   - SellerOrders (`screens/Seller/SellerOrders.js`)
   - SalesAnalytics (`screens/Seller/SalesAnalytics.js`)
   - SellerProfile (`screens/Seller/SellerProfile.js`)

2. **Components** (Reusable UI)
   - SellerTopBar (navigation header)
   - SellerFooterNavigation (bottom navigation)

---

## Detailed Component Analysis

### 1. SELLER DASHBOARD

#### 1.1 SellerDashboard Screen (`agri-app/src/screens/Seller/SellerDashboard.js`)

**Purpose**: Central hub for seller operations with key metrics and quick actions

**State Management**:
- `analytics`: Dashboard analytics data
- `loading`: Loading state
- `refreshing`: Pull-to-refresh state

**Data Fetching**:
```javascript
const fetchAnalytics = async () => {
    const response = await customFetch.get('/analytics/seller-dashboard');
    setAnalytics(response.data.data);
};
```

**API Endpoint**: GET `/api/v1/analytics/seller-dashboard`

**Analytics Data Structure**:
```javascript
{
  totalProducts: Number,
  totalOrders: Number,
  totalRevenue: Number,
  pendingOrders: Number,
  processingOrders: Number,
  shippedOrders: Number,
  deliveredOrders: Number,
  cancelledOrders: Number,
  lowStockProducts: [
    {
      name: String,
      size: String,
      stock: Number
    }
  ],
  salesTrend: [
    {
      label: String,  // "Nov 12"
      value: Number   // Revenue
    }
  ]
}
```

---

**Dashboard Sections**:

**1. Total Revenue Card**:
- Large prominent display
- Green color theme
- Dollar sign icon
- Current total revenue

**2. Quick Stats**:
- Total Products (navigates to SellerProducts)
- Total Orders (navigates to SellerOrders)
- Card-based layout
- Touch-enabled navigation

**3. Manage Orders Section**:
- Grid layout (3 columns, 2 rows)
- Order status breakdown:
  - Total Orders (blue)
  - Pending (orange)
  - Processing (green)
  - Shipped (purple)
  - Delivered (dark green)
  - Cancelled (red)
- Each status navigates to filtered order list
- Color-coded badges

**4. Low Stock Alert**:
- Only shown if low stock products exist
- Warning icon (red)
- List of products with low stock
- Shows product name, size, and quantity
- Navigates to low stock products view
- Orange background for visibility

**5. Sales Analytics Card**:
- Trending up icon
- "View detailed sales reports" subtitle
- Navigates to SalesAnalytics screen
- Chevron right indicator

---

**Key Features**:
- Pull-to-refresh functionality
- Loading state handling
- Touch-enabled navigation
- Color-coded status indicators
- Real-time data display
- Responsive card layout

---

#### 1.2 SalesAnalytics Screen (`agri-app/src/screens/Seller/SalesAnalytics.js`)

**Purpose**: Detailed sales analytics with charts and visualizations

**State Management**:
- `analytics`: Analytics data
- `loading`: Loading state
- `refreshing`: Pull-to-refresh state

**Data Fetching**: Same as dashboard (`/analytics/seller-dashboard`)

---

**Analytics Sections**:

**1. Revenue Summary Card**:
- Total revenue display
- Green background
- Dollar sign icon
- Large prominent text

**2. Sales Stats Cards**:
- **Completed Sales**: Number of delivered orders
- **Average Order Value**: Revenue / Delivered orders
- Side-by-side card layout
- Icon-based visual indicators

**3. Sales Trend Line Chart**:
- Last 7 days sales data
- Line chart with bezier curves
- Green color theme
- Data points with dots
- X-axis: Dates (e.g., "Nov 12")
- Y-axis: Revenue values

**4. Daily Sales Comparison Bar Chart**:
- Same 7-day data
- Bar chart visualization
- Blue color theme
- Values displayed on top of bars
- Easy comparison of daily performance

---

**Chart Configuration**:
```javascript
const chartData = {
    labels: analytics?.salesTrend?.map(item => item.label) || [],
    datasets: [{
        data: analytics?.salesTrend?.map(item => item.value) || [0]
    }]
};

// Chart styling
chartConfig={{
    backgroundColor: '#fff',
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    propsForDots: {
        r: '5',
        strokeWidth: '2',
        stroke: '#4CAF50'
    }
}}
```

**Libraries Used**:
- `react-native-chart-kit` for charts
- LineChart component
- BarChart component

---

### 2. SELLER PRODUCTS

#### 2.1 SellerProducts Screen (`agri-app/src/screens/Seller/SellerProducts.js`)

**Purpose**: Manage seller's product inventory

**State Management**:
- `products`: All seller products
- `filteredProducts`: Filtered product list
- `searchQuery`: Search input
- `loading`: Loading state
- `lowStockOnly`: Filter for low stock products

**Data Fetching**:
```javascript
const fetchProducts = async () => {
    const response = await customFetch.get('/products/sellerProductt');
    const allProducts = response.data.products;
    setProducts(allProducts);
    setFilteredProducts(allProducts);
};
```

**API Endpoint**: GET `/api/v1/products/sellerProductt`

---

**Key Features**:

**1. Search Functionality**:
- Real-time product search
- Searches product name
- Updates filtered list instantly

**2. Low Stock Filter**:
- Toggle to show only low stock products
- Filters products with quantity < 10
- Visual indicator when active

**3. Product List**:
- Card-based layout
- Product image
- Product name
- Price and stock information
- Edit and Delete actions

**4. Product Actions**:
- **Edit**: Navigate to edit product screen
- **Delete**: Remove product (with confirmation)
- Icon-based action buttons

**5. Empty State**:
- "No products found" message
- Encourages adding products
- Clear visual feedback

---

### 3. SELLER ORDERS

#### 3.1 SellerOrders Screen (`agri-app/src/screens/Seller/SellerOrders.js`)

**Purpose**: Manage and fulfill customer orders

**State Management**:
- `orders`: All seller orders
- `filteredOrders`: Filtered order list
- `selectedFilter`: Current status filter
- `loading`: Loading state
- `remarkDialogVisible`: Remark input dialog state

**Data Fetching**:
```javascript
const fetchOrders = async () => {
    const response = await customFetch.post('/order/seller/orders');
    setOrders(response.data.orders);
    setFilteredOrders(response.data.orders);
};
```

**API Endpoint**: POST `/api/v1/order/seller/orders`

---

**Key Features**:

**1. Status Filtering**:
- Filter buttons for each status
- All, Pending, Processing, Shipped, Delivered, Cancelled
- Color-coded filter buttons
- Updates filtered list instantly

**2. Order Cards**:
- Order number
- Customer information
- Order items list
- Total amount
- Order status badge
- Order date

**3. Status Update**:
- Update order status button
- Remark dialog for status changes
- Optional remark text
- Confirmation before update

**4. Order Details**:
- Expandable order items
- Product names and quantities
- Prices and totals
- Delivery address
- Payment information

**5. Status Update Dialog**:
```javascript
const updateOrderStatus = async (orderId, newStatus, remarkText = '') => {
    const payload = { orderStatus: newStatus };
    if (remarkText.trim()) {
        payload.remark = remarkText.trim();
    }
    await customFetch.put(`/order/update-status/${orderId}`, payload);
};
```

---

### 4. SELLER PROFILE

#### 4.1 SellerProfile Screen (`agri-app/src/screens/Seller/SellerProfile.js`)

**Purpose**: Seller account information and settings

**State Management**:
- `user`: User/seller data
- `loading`: Loading state

**Data Fetching**:
```javascript
const fetchUserData = async () => {
    const response = await customFetch.get('/user/me');
    setUser(response.data.user);
};
```

---

**Profile Sections**:

**1. Profile Header**:
- Profile picture
- Seller name
- Email address
- "Seller" badge
- Edit profile button

**2. Account Information**:
- Name
- Email
- Phone number
- Account type (Seller)

**3. Business Information** (if applicable):
- Shop name
- Business address
- GST number
- Bank details

**4. Quick Actions**:
- Edit Profile
- Change Password
- Notifications Settings
- Help & Support
- Logout

**5. Statistics**:
- Total products
- Total orders
- Total revenue
- Member since date

---

### 5. NAVIGATION COMPONENTS

#### 5.1 SellerTopBar Component

**Purpose**: Consistent top navigation bar for seller screens

**Props**:
- `navigation`: Navigation object
- `title`: Screen title
- `showSearch`: Optional search functionality

**Features**:
- Back button
- Screen title
- Search icon (optional)
- Consistent styling
- Green color theme

---

#### 5.2 SellerFooterNavigation Component

**Purpose**: Bottom tab navigation for seller screens

**Props**:
- `navigation`: Navigation object
- `activePage`: Current active page

**Navigation Tabs**:
1. **Dashboard**: Home icon, navigates to SellerDashboard
2. **Products**: Package icon, navigates to SellerProducts
3. **Orders**: Shopping cart icon, navigates to SellerOrders
4. **Profile**: User icon, navigates to SellerProfile

**Features**:
- Active tab highlighting
- Icon-based navigation
- Label text
- Touch feedback
- Fixed bottom position

---

## DATA FLOW DIAGRAMS

### Seller Dashboard Load Flow
```
Seller (Mobile App)
    ↓ [Opens app, navigates to Dashboard]
SellerDashboard Screen
    ↓ [useEffect triggered]
    ↓ [GET /analytics/seller-dashboard]
Analytics.getSellerDashboardAnalytics()
    ↓ [Extract sellerId from auth token]
    ↓ [Count total products]
Product.countDocuments({ 'sellers.sellerId': sellerId })
    ↓ [Fetch all orders]
Order.find({ 'items.sellerId': sellerId })
    ↓ [Calculate metrics]
    ↓ [Filter seller items]
    ↓ [Count by status]
    ↓ [Calculate total revenue]
    ↓ [Identify low stock products]
Product.find({ 'sellers.sellerId': sellerId })
    ↓ [Check quantity < 10]
    ↓ [Calculate 7-day sales trend]
    ↓ [Group by date]
Response
    ↓ [Return dashboard data]
Display Dashboard
    ↓ [Show revenue, stats, orders, alerts, trends]
```

### Order Status Update Flow
```
Seller
    ↓ [Taps "Update Status" on order]
SellerOrders Screen
    ↓ [Show status selection dialog]
Seller
    ↓ [Selects new status]
    ↓ [Optionally enters remark]
    ↓ [Confirms update]
updateOrderStatus()
    ↓ [PUT /order/update-status/:orderId]
    ↓ [Body: { orderStatus, remark }]
Order.updateOrderStatus()
    ↓ [Validate seller owns order items]
    ↓ [Update order status]
    ↓ [Add remark if provided]
    ↓ [Create notification for buyer]
Notification.createNotification()
    ↓ [Notify buyer of status change]
Database
    ↓ [Save updated order]
Response
    ↓ [Return success]
Refresh Orders List
    ↓ [Fetch updated orders]
Display Updated Status
```

### Product Management Flow
```
Seller
    ↓ [Opens SellerProducts screen]
fetchProducts()
    ↓ [GET /products/sellerProductt]
Product.getAllProductBySeller()
    ↓ [Find products with seller ID]
    ↓ [Return seller's products]
Display Products
    ↓ [Show product list]
Seller
    ↓ [Taps Edit on product]
Navigate to Edit Screen
    ↓ [Pre-fill product data]
Seller
    ↓ [Updates product details]
    ↓ [Saves changes]
    ↓ [PUT /products/editproduct/:productId]
Product.editProduct()
    ↓ [Validate seller owns product]
    ↓ [Update product]
Database
    ↓ [Save changes]
Response
    ↓ [Return updated product]
Refresh Product List
```

---

## KEY FEATURES & CAPABILITIES

### 1. Comprehensive Dashboard
- Real-time metrics display
- Revenue tracking
- Order statistics
- Product count
- Quick navigation to key sections

### 2. Sales Analytics
- 7-day sales trends
- Line and bar charts
- Revenue visualization
- Average order value calculation
- Completed sales tracking

### 3. Product Management
- View all products
- Search functionality
- Low stock filtering
- Edit product details
- Delete products
- Bulk upload support (backend)

### 4. Order Management
- View all orders
- Filter by status
- Update order status
- Add remarks to orders
- Order details view
- Customer information

### 5. Low Stock Alerts
- Automatic detection (< 10 units)
- Dashboard alerts
- Dedicated low stock view
- Product and size details
- Stock quantity display

### 6. Status Tracking
- Pending orders
- Processing orders
- Shipped orders
- Delivered orders
- Cancelled orders
- Color-coded indicators

### 7. Mobile Optimization
- Touch-friendly interface
- Pull-to-refresh
- Responsive cards
- Bottom navigation
- Smooth transitions

### 8. Visual Analytics
- Chart visualizations
- Trend analysis
- Performance metrics
- Color-coded data
- Easy-to-read graphs

### 9. Quick Actions
- One-tap navigation
- Status updates
- Product editing
- Order filtering
- Profile access

### 10. Real-Time Updates
- Refresh functionality
- Live data sync
- Instant status changes
- Notification integration

---

## BUSINESS RULES

### Dashboard Access
1. Only sellers can access seller dashboard
2. Authentication required
3. Seller role verified via middleware
4. Data filtered by seller ID

### Product Management
1. Sellers can only manage their own products
2. Product ownership verified on all operations
3. Low stock threshold: < 10 units
4. Search is case-insensitive
5. Bulk upload supported (backend)

### Order Management
1. Sellers see only orders containing their products
2. Can update status of orders with their items
3. Cannot modify other sellers' order items
4. Remarks optional but recommended
5. Status changes trigger buyer notifications

### Analytics Calculation
1. Revenue calculated from delivered orders
2. Sales trend shows last 7 days
3. Average order value: total revenue / delivered orders
4. Low stock products identified automatically
5. All metrics seller-specific

### Status Updates
1. Sellers can update order status
2. Valid status transitions enforced
3. Remarks can be added with updates
4. Buyer notified of status changes
5. Update history tracked

### Low Stock Alerts
1. Threshold: < 10 units
2. Checked per product size
3. Displayed on dashboard
4. Filterable in products list
5. Top 5 shown on dashboard

---

## SECURITY FEATURES

### 1. Authentication
- JWT token required
- Seller role verification
- Token validation on every request
- Secure session management

### 2. Authorization
- isSeller middleware on all routes
- Seller ID extracted from token
- Data filtered by seller ID
- Cannot access other sellers' data

### 3. Data Isolation
- Seller-specific queries
- Product ownership verification
- Order item filtering
- Revenue calculation per seller

### 4. Input Validation
- Status update validation
- Product data validation
- Order ID verification
- Remark sanitization

### 5. Error Handling
- Graceful error messages
- No sensitive data exposure
- Error logging
- User-friendly feedback

---

## PERFORMANCE OPTIMIZATIONS

### 1. Data Caching
- Analytics data cached (1 minute)
- Reduced database queries
- Faster dashboard load
- Cache invalidation on updates

### 2. Efficient Queries
- Indexed seller ID fields
- Optimized aggregations
- Limited result sets
- Selective field projection

### 3. Lazy Loading
- Products loaded on demand
- Orders paginated
- Images lazy loaded
- Smooth scrolling

### 4. Pull-to-Refresh
- Manual data refresh
- User-controlled updates
- Visual feedback
- Async operation

### 5. Chart Optimization
- Data pre-processed
- Limited data points (7 days)
- Efficient rendering
- Responsive sizing

---

## TESTING CONSIDERATIONS

### Unit Tests

**Dashboard Analytics**:
- Test metric calculations
- Test low stock detection
- Test sales trend grouping
- Test date formatting

**Product Management**:
- Test product filtering
- Test search functionality
- Test low stock filter
- Test product ownership

**Order Management**:
- Test order filtering
- Test status updates
- Test seller item filtering
- Test remark handling

### Integration Tests

**API Integration**:
- Test dashboard endpoint
- Test product queries
- Test order queries
- Test status updates

**Navigation**:
- Test screen transitions
- Test bottom navigation
- Test back navigation
- Test deep linking

### E2E Tests

**Complete Seller Journey**:
- Seller logs in
- Views dashboard
- Checks low stock alerts
- Updates order status
- Views sales analytics
- Manages products

**Order Fulfillment**:
- Seller receives order
- Views order details
- Updates to Processing
- Updates to Shipped
- Marks as Delivered
- Buyer receives notifications

---

## FUTURE ENHANCEMENTS

1. **Inventory Management**: Advanced stock tracking and reordering

2. **Bulk Operations**: Bulk status updates, bulk product edits

3. **Export Reports**: Export sales data to CSV/PDF

4. **Advanced Analytics**: Profit margins, product performance, customer insights

5. **Promotional Tools**: Create discounts, coupons, flash sales

6. **Customer Communication**: Direct messaging with buyers

7. **Shipping Integration**: Print shipping labels, track shipments

8. **Return Management**: Handle returns and refunds

9. **Product Variants**: Manage multiple variants per product

10. **Inventory Alerts**: Email/SMS for low stock

11. **Sales Forecasting**: Predict future sales trends

12. **Multi-Store Support**: Manage multiple store locations

13. **Staff Accounts**: Add staff with limited permissions

14. **Product Reviews Management**: Respond to reviews

15. **Automated Pricing**: Dynamic pricing based on demand

16. **Competitor Analysis**: Track competitor prices

17. **Marketing Tools**: Email campaigns, social media integration

18. **Financial Reports**: Profit/loss statements, tax reports

19. **Customer Segmentation**: Identify top customers

20. **Loyalty Programs**: Create seller-specific loyalty rewards

21. **Appointment Booking**: Schedule product pickups

22. **Video Products**: Add product demo videos

23. **AR Preview**: Augmented reality product preview

24. **Voice Commands**: Voice-controlled order management

25. **Offline Mode**: Manage orders without internet

---

## MOBILE APP SCREENS SUMMARY

### SellerDashboard
- **Purpose**: Overview of seller business
- **Key Metrics**: Revenue, products, orders
- **Features**: Quick stats, order management, low stock alerts
- **Navigation**: To products, orders, analytics

### SalesAnalytics
- **Purpose**: Detailed sales visualization
- **Charts**: Line chart, bar chart
- **Metrics**: Revenue, completed sales, average order value
- **Data**: Last 7 days trend

### SellerProducts
- **Purpose**: Product inventory management
- **Features**: Search, low stock filter, edit, delete
- **Actions**: Navigate to edit, delete product
- **Display**: Card-based product list

### SellerOrders
- **Purpose**: Order fulfillment
- **Features**: Status filtering, status updates, remarks
- **Filters**: All, Pending, Processing, Shipped, Delivered, Cancelled
- **Actions**: Update status, view details

### SellerProfile
- **Purpose**: Account management
- **Sections**: Profile info, business info, statistics
- **Actions**: Edit profile, change password, logout
- **Display**: User details, seller badge

---

## COMPONENT HIERARCHY

```
Seller App Structure
├── SellerTopBar (Header)
│   ├── Back Button
│   ├── Screen Title
│   └── Search Icon (optional)
├── Screen Content
│   ├── SellerDashboard
│   │   ├── Revenue Card
│   │   ├── Quick Stats
│   │   ├── Manage Orders
│   │   ├── Low Stock Alert
│   │   └── Analytics Link
│   ├── SalesAnalytics
│   │   ├── Revenue Summary
│   │   ├── Sales Stats
│   │   ├── Line Chart
│   │   └── Bar Chart
│   ├── SellerProducts
│   │   ├── Search Bar
│   │   ├── Low Stock Toggle
│   │   └── Product List
│   ├── SellerOrders
│   │   ├── Status Filters
│   │   ├── Order List
│   │   └── Status Update Dialog
│   └── SellerProfile
│       ├── Profile Header
│       ├── Account Info
│       ├── Business Info
│       └── Quick Actions
└── SellerFooterNavigation (Bottom Tabs)
    ├── Dashboard Tab
    ├── Products Tab
    ├── Orders Tab
    └── Profile Tab
```

---

## API ENDPOINTS USED

### Analytics
```
GET /api/v1/analytics/seller-dashboard
Auth: Required (Seller)
Response: Dashboard metrics and trends
```

### Products
```
GET /api/v1/products/sellerProductt
Auth: Required (Seller)
Response: Seller's products

PUT /api/v1/products/editproduct/:productId
Auth: Required (Seller)
Body: Product updates
Response: Updated product

DELETE /api/v1/products/product/delete/:productId
Auth: Required (Seller)
Response: Success message
```

### Orders
```
POST /api/v1/order/seller/orders
Auth: Required (Seller)
Response: Seller's orders

PUT /api/v1/order/update-status/:orderId
Auth: Required (Seller)
Body: { orderStatus, remark }
Response: Updated order
```

### User
```
GET /api/v1/user/me
Auth: Required
Response: User profile data
```

---

## STYLING GUIDELINES

### Color Scheme
- Primary Green: #4CAF50
- Secondary Blue: #2196F3
- Warning Orange: #FF9800
- Error Red: #F44336
- Purple: #9C27B0
- Dark Green: #388E3C
- Background: #f5f5f5
- Card Background: #fff

### Typography
- Title: 18px, Bold
- Subtitle: 16px, Bold
- Body: 14px, Regular
- Label: 12px, Regular
- Revenue: 36px, Bold
- Stat Value: 24px, Bold

### Spacing
- Card Margin: 15px
- Card Padding: 15px
- Section Spacing: 15px
- Grid Gap: 10px

### Components
- Card Elevation: 2-4
- Border Radius: 8-12px
- Icon Size: 20-40px
- Badge Size: 70x70px

---

## CONCLUSION

The Seller Features consolidate all seller-specific functionality into a comprehensive business management system. By providing a dedicated mobile interface with dashboard, analytics, product management, and order fulfillment tools, the platform empowers sellers to efficiently run their agricultural product business.

**Key Strengths**:
- Comprehensive dashboard with key metrics
- Visual sales analytics with charts
- Efficient product and order management
- Low stock alerts for inventory control
- Mobile-optimized interface
- Real-time data updates
- Color-coded status indicators
- Touch-friendly navigation
- Pull-to-refresh functionality
- Seller-specific data isolation

The system successfully provides sellers with all the tools they need to manage their business from a mobile device. The dashboard gives a quick overview of business health, while dedicated screens for products, orders, and analytics provide detailed management capabilities.

**Current Limitations**:
- No bulk operations
- No export functionality
- Limited analytics (7 days only)
- No promotional tools
- No customer communication
- No return management
- No staff accounts
- No offline mode
- Basic inventory management

These limitations present opportunities for future enhancements that would transform the seller interface into a complete business management platform with advanced features like bulk operations, detailed analytics, promotional tools, and customer relationship management.

---

**Documentation Version**: 1.0  
**Last Updated**: November 2024  
**Feature Status**: Production Ready
