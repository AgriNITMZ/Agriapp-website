# PreciAgri Mobile App - Complete Project Documentation

## Project Overview

**PreciAgri** is a comprehensive agricultural e-commerce and information platform consisting of:
- **Backend API** (`agri_backend`): Node.js/Express REST API with MongoDB
- **Mobile App** (`agri-app`): React Native (Expo) mobile application
- **Web Platform** (`Farming`): React web application (NOT COVERED IN THIS DOCUMENTATION)

This documentation focuses exclusively on the **Mobile App** and its **Backend API**.

---

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Cloudinary
- **Payment Gateway**: Razorpay
- **Shipping**: Shiprocket API
- **Real-time**: Socket.IO
- **Email**: Nodemailer
- **AI/ML**: Google Gemini AI
- **Translation**: Google Cloud Translate
- **Web Scraping**: Cheerio
- **Cron Jobs**: node-cron

### Mobile App (Frontend)
- **Framework**: React Native (Expo)
- **Navigation**: React Navigation (Stack, Drawer)
- **State Management**: React Context API
- **HTTP Client**: Axios
- **UI Components**: React Native Paper, Native Base, React Native Elements
- **Payment**: React Native Razorpay, WebView
- **Icons**: Lucide React Native
- **Charts**: React Native Chart Kit
- **Forms**: React Native Elements
- **Storage**: AsyncStorage

---

## Feature Categories


### 1. AUTHENTICATION & USER MANAGEMENT
- **1.1** User Registration & OTP Verification
- **1.2** Login & JWT Authentication
- **1.3** Password Reset & Recovery
- **1.4** User Profile Management
- **1.5** Role-Based Access Control (User, Seller, Admin)
- **1.6** Address Management

### 2. PRODUCT MANAGEMENT
- **2.1** Product Catalog & Listing
- **2.2** Product Categories & Parent Categories
- **2.3** Product Search & Filtering
- **2.4** Product Details & Images
- **2.5** Multi-Seller Product Support
- **2.6** Seller Product Management
- **2.7** Bulk Product Upload

### 3. SHOPPING CART & WISHLIST
- **3.1** Add to Cart Functionality
- **3.2** Cart Management (View, Update, Remove)
- **3.3** Cart Segregation by Category
- **3.4** Wishlist Management
- **3.5** Cart Context & State Management

### 4. ORDER MANAGEMENT & SHIPPING
- **4.1** Order Creation (COD & Online Payment)
- **4.2** Order History & Tracking
- **4.3** Order Status Management
- **4.4** Order Cancellation
- **4.5** Shiprocket Integration
- **4.6** Shipment Tracking
- **4.7** Seller Order Management

### 5. PAYMENT PROCESSING
- **5.1** Razorpay Integration
- **5.2** Payment Order Creation
- **5.3** Payment Verification
- **5.4** COD (Cash on Delivery) Support
- **5.5** Payment Webhooks
- **5.6** WebView Payment Flow (Mobile)

### 6. RATINGS & REVIEWS
- **6.1** Product Rating System
- **6.2** Review Submission
- **6.3** Review Display & Aggregation

### 7. NOTIFICATIONS
- **7.1** In-App Notifications
- **7.2** Real-time Notifications (Socket.IO)
- **7.3** Notification Management
- **7.4** Order Status Notifications
- **7.5** Seller Notifications

### 8. ANALYTICS & REPORTING
- **8.1** Seller Dashboard Analytics
- **8.2** Sales Trends & Performance
- **8.3** Product Performance Metrics
- **8.4** Revenue Analytics
- **8.5** Admin Platform Overview
- **8.6** User Analytics
- **8.7** Cache Management

### 9. NEWS & SCHEMES
- **9.1** Agricultural News Feed
- **9.2** News Scraping & Cron Jobs
- **9.3** Government Schemes Information
- **9.4** News & Schemes Tab View

### 10. AI CHATBOT
- **10.1** Gemini AI Integration
- **10.2** Product Search via Chat
- **10.3** Product Recommendations
- **10.4** Cart Segregation via Chat
- **10.5** Farming Advice & Tips
- **10.6** Multi-language Support (Translation)
- **10.7** Conversation Context Management

### 11. SELLER FEATURES
- **11.1** Seller Dashboard
- **11.2** Seller Product Management
- **11.3** Seller Order Management
- **11.4** Sales Analytics
- **11.5** Seller Profile Management

### 12. ADDITIONAL SERVICES
- **12.1** Weather Information
- **12.2** Farming Tips
- **12.3** Loan Information
- **12.4** Sensor Integration (Placeholder)

### 13. GENERAL FEATURES
- **13.1** About Us
- **13.2** Contact Us
- **13.3** Onboarding Screens
- **13.4** Drawer Navigation
- **13.5** Footer Navigation

---

## Documentation Structure

Each feature is documented in a separate file with the following structure:

1. **Feature Overview**: High-level description
2. **Architecture Components**: Backend and frontend components involved
3. **Database Models**: Schema definitions with all fields
4. **Controllers**: Business logic with detailed function breakdowns
5. **Routes**: API endpoints with request/response formats
6. **Services**: External integrations and helper services
7. **Frontend Implementation**: Mobile app screens and components
8. **Data Flow Diagrams**: Visual representation of data movement
9. **Key Features & Capabilities**: Feature highlights
10. **Business Rules**: Validation and business logic rules
11. **Error Handling**: Error scenarios and handling strategies
12. **Testing Considerations**: Test cases and scenarios
13. **Performance Optimizations**: Caching and optimization strategies
14. **Future Enhancements**: Planned improvements

---

## Feature Documentation Files


### Core Features (Detailed Documentation)
1. `FEATURE_01_AUTHENTICATION_USER_MANAGEMENT.md` - Complete auth system
2. `FEATURE_02_PRODUCT_MANAGEMENT.md` - Product catalog and management
3. `FEATURE_03_CART_WISHLIST.md` - Shopping cart and wishlist
4. `FEATURE_04_ORDER_MANAGEMENT_SHIPPING.md` - Orders and Shiprocket (EXAMPLE ALREADY CREATED)
5. `FEATURE_05_PAYMENT_PROCESSING.md` - Razorpay integration
6. `FEATURE_06_RATINGS_REVIEWS.md` - Rating and review system
7. `FEATURE_07_NOTIFICATIONS.md` - Notification system
8. `FEATURE_08_ANALYTICS_REPORTING.md` - Analytics and dashboards
9. `FEATURE_09_NEWS_SCHEMES.md` - News and government schemes
10. `FEATURE_10_AI_CHATBOT.md` - Gemini AI chatbot
11. `FEATURE_11_SELLER_FEATURES.md` - Seller-specific functionality
12. `FEATURE_12_ADDITIONAL_SERVICES.md` - Weather, tips, loans, sensors

---

## Quick Reference

### API Base URL
```
Development: http://localhost:4000/api/v1
Production: [Your production URL]
```

### Main API Endpoints

#### Authentication
- `POST /auth/sendotp` - Send OTP
- `POST /auth/signup` - Register user
- `POST /auth/login` - Login
- `GET /auth/getuserbytoken` - Get current user
- `PUT /auth/updateProfile` - Update profile

#### Products
- `GET /products/getallproduct` - Get all products
- `GET /products/getproductbyId/:id` - Get product details
- `POST /products/createproduct` - Create product (Seller)
- `GET /products/searchproducts` - Search products
- `GET /products/filteredproducts` - Filter products

#### Cart
- `POST /products/addtocartapp` - Add to cart
- `GET /products/cartitemsapp` - Get cart items
- `DELETE /products/removeitem/:id` - Remove from cart
- `DELETE /products/clearcart` - Clear cart

#### Orders
- `POST /order/createorder` - Create order
- `GET /order/orderhistory` - Get user orders
- `GET /order/seller/orders` - Get seller orders
- `PUT /order/update-status/:id` - Update order status
- `PUT /order/cancel/:id` - Cancel order

#### Shiprocket
- `POST /shiprocket/create` - Create Shiprocket order
- `POST /shiprocket/check-serviceability` - Check shipping availability
- `GET /shiprocket/track/:shipmentId` - Track shipment

#### Notifications
- `GET /notifications` - Get notifications
- `GET /notifications/unread-count` - Get unread count
- `PATCH /notifications/:id/read` - Mark as read

#### Analytics
- `GET /analytics/seller-dashboard` - Seller dashboard data
- `GET /analytics/seller/overview` - Seller overview
- `GET /analytics/seller/sales-trends` - Sales trends

#### Chat
- `POST /appChat` - Chat with AI bot

#### News & Schemes
- `GET /news` - Get news articles
- `GET /scheme` - Get government schemes

---

## Environment Variables

### Required Backend Environment Variables
```env
# Server
PORT=4000

# Database
DATABASE_URL=mongodb://...

# JWT
JWT_SECRET=your_jwt_secret

# Cloudinary
CLOUD_NAME=your_cloud_name
API_KEY=your_api_key
API_SECRET=your_api_secret
FOLDER_NAME=your_folder

# Email
MAIL_HOST=smtp.gmail.com
MAIL_USER=your_email
MAIL_PASS=your_password

# Razorpay
RAZORPAY_KEY=your_key
RAZORPAY_SECRET=your_secret

# Shiprocket
SHIPROCKET_EMAIL=your_email
SHIPROCKET_PASSWORD=your_password
SHIPROCKET_API_URL=https://apiv2.shiprocket.in/v1/external

# Google Cloud
GCLOUD_PROJECT_ID=your_project_id
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json
GOOGLE_API_KEY=your_api_key

# CORS
CORS_ORIGIN=http://localhost:5173
```

---

## Database Collections

### Users & Authentication
- `users` - User accounts
- `otps` - OTP verification codes
- `profiles` - User profile details
- `addresses` - Delivery addresses

### Products & Catalog
- `products` - Product catalog
- `categories` - Product categories
- `parentcategories` - Parent category hierarchy
- `productadditionaldetails` - Additional product info

### Shopping
- `cartitems` - Shopping cart items
- `wishlists` - User wishlists
- `ratingandreviews` - Product ratings and reviews

### Orders & Payments
- `orders` - Standard orders
- `shiprocketorders` - Shiprocket orders

### Content
- `news` - News articles
- `schemes` - Government schemes
- `notifications` - User notifications

---

## User Roles

### User (Customer)
- Browse and search products
- Add to cart and wishlist
- Place orders
- Track orders
- Rate and review products
- Manage profile and addresses
- View news and schemes
- Chat with AI bot

### Seller
- All User permissions
- Create and manage products
- View and manage orders
- Access sales analytics
- Update order status
- Bulk upload products

### Admin
- All Seller permissions
- Manage categories
- View platform analytics
- Manage users
- System configuration

---

## Real-time Features (Socket.IO)

### Events
- `connection` - Client connects
- `disconnect` - Client disconnects
- `order-status-updated` - Order status changed (to buyer)
- `order-updated` - Order updated (to seller)

### Rooms
- `user-{userId}` - User-specific room
- `seller-{sellerId}` - Seller-specific room

---

## Security Features

1. **JWT Authentication**: Token-based auth with expiry
2. **Password Hashing**: bcrypt for password security
3. **Role-Based Access**: Middleware for role checking
4. **CORS Protection**: Configured allowed origins
5. **Input Validation**: Request validation
6. **Payment Verification**: Razorpay signature verification
7. **Order Ownership**: Verify user owns order before actions

---

## Performance Features

1. **Database Indexing**: Optimized queries
2. **Caching**: Analytics cache with invalidation
3. **Pagination**: For large datasets
4. **Lean Queries**: Reduced memory overhead
5. **Connection Pooling**: MongoDB connection management
6. **Image Optimization**: Cloudinary transformations

---

## External Integrations

1. **Cloudinary**: Image storage and CDN
2. **Razorpay**: Payment processing
3. **Shiprocket**: Shipping and logistics
4. **Google Gemini AI**: Chatbot intelligence
5. **Google Cloud Translate**: Multi-language support
6. **Nodemailer**: Email notifications
7. **Socket.IO**: Real-time updates

---

## Development Workflow

### Backend Setup
```bash
cd agri_backend
npm install
# Configure .env file
npm run dev
```

### Mobile App Setup
```bash
cd agri-app
npm install
npx expo start
```

### Testing
- Backend: Manual API testing (Postman/Thunder Client)
- Mobile: Expo Go app for testing

---

## Next Steps

1. Read individual feature documentation files for detailed implementation
2. Review data flow diagrams for understanding system architecture
3. Check business rules for validation logic
4. Review API endpoints for integration

---

## Documentation Maintenance

- **Last Updated**: [Current Date]
- **Version**: 1.0.0
- **Maintained By**: Development Team
- **Update Frequency**: As features are added/modified

---

## Contact & Support

For questions or clarifications about this documentation:
- Review the specific feature documentation file
- Check the code comments in the implementation
- Refer to external API documentation (Razorpay, Shiprocket, etc.)

---

**Note**: This documentation covers the mobile app implementation. Web platform features are not included.
