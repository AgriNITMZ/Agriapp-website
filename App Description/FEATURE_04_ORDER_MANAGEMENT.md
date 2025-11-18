# Feature Description: Order Management & Shiprocket Integration

## Feature Overview
This feature provides a comprehensive end-to-end order management system with integrated shipping logistics through Shiprocket API. It supports both Cash on Delivery (COD) and online payment methods via Razorpay, handles order lifecycle management, real-time notifications, and shipment tracking.

---

## Architecture Components

### Backend Components
1. **Models** (Data Layer)
2. **Controllers** (Business Logic Layer)
3. **Routes** (API Endpoints Layer)
4. **Services** (External Integration Layer)
5. **Configuration** (Setup & Credentials)

### Frontend Components (Mobile App)
1. **Screens** (UI Layer)
2. **Context** (State Management)
3. **Utils** (Helper Functions)

---

## Detailed Component Analysis

### 1. DATABASE MODELS

#### 1.1 Order Model (`agri_backend/models/Order.js`)
**Purpose**: Represents standard orders placed through the platform

**Schema Fields**:
- `userId` (ObjectId, ref: 'User', required): Links order to customer
- `items` (Array): Order line items containing:
  - `product` (ObjectId, ref: 'Product'): Product reference
  - `size` (String): Selected product size
  - `selectedprice` (Number): Original price
  - `selectedDiscountedPrice` (Number): Final price after discount
  - `quantity` (Number, min: 1): Quantity ordered
  - `sellerId` (ObjectId, ref: 'Seller'): Seller who fulfills this item
- `totalAmount` (Number, required): Total order value
- `paymentMethod` (String, enum: ['cod', 'online']): Payment type
- `paymentStatus` (String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending')
- `orderStatus` (String, enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending')
- `paymentId` (String): Razorpay payment ID
- `paymentLink` (String): Payment gateway link
- `paymentLinkId` (String): Payment link identifier
- `shippingAddress` (ObjectId, ref: 'Addresses', required): Delivery address
- `stockAdjusted` (Boolean, default: false): Flag for inventory management
- `shiprocketOrderId` (Number): Shiprocket order identifier
- `shiprocketShipmentId` (Number): Shiprocket shipment identifier
- `awbCode` (String): Air Waybill code for tracking
- `courierCompanyId` (Number): Courier service ID
- `courierName` (String): Courier service name
- `timestamps`: Auto-generated createdAt and updatedAt

**Middleware**:
- Pre-save hook: Updates `updatedAt` timestamp before saving


#### 1.2 ShiprocketOrder Model (`agri_backend/models/ShiprocketOrder.js`)
**Purpose**: Represents orders specifically processed through Shiprocket shipping service

**Schema Fields**:
- `user` (ObjectId, ref: 'Users', required): Customer reference
- `items` (Array): Product items with:
  - `productId` (String, required): Product identifier
  - `name` (String, required): Product name
  - `quantity` (Number, required, min: 1): Quantity
  - `price` (Number, required): Unit price
  - `imageUrl` (String): Product image URL
- `shippingAddress` (Object): Delivery details containing:
  - `name` (String, required): Recipient name
  - `mobile` (String, required): Contact number
  - `streetAddress` (String, required): Street address
  - `city` (String, required): City
  - `state` (String, required): State
  - `zipCode` (String, required): PIN code
- `paymentMethod` (String, enum: ['cod', 'online'], default: 'cod')
- `paymentInfo` (Object): Razorpay payment details:
  - `razorpay_order_id` (String)
  - `razorpay_payment_id` (String)
  - `razorpay_signature` (String)
- `subTotal` (Number, required): Items total
- `shippingCost` (Number, default: 0): Delivery charges
- `totalAmount` (Number, required): Grand total
- `shippingInfo` (Object): Shipping metadata:
  - `cost` (Number)
  - `estimatedDays` (String)
  - `courierName` (String)
- `shiprocket` (Object): Shiprocket API response data:
  - `order_id` (String): Shiprocket order ID
  - `shipment_id` (String): Shiprocket shipment ID
  - `status` (String): Shiprocket order status
  - `raw` (Mixed): Complete API response
- `status` (String, default: 'created', enum: ['created', 'processing', 'shipped', 'delivered', 'cancelled'])
- `timestamps`: Auto-generated createdAt and updatedAt

**Indexes**:
- Compound index on `user` and `createdAt` (descending) for efficient order history queries
- Index on `shiprocket.shipment_id` for fast tracking lookups

---

### 2. CONTROLLERS (Business Logic)

#### 2.1 Order Controller (`agri_backend/controller/Order.js`)

**Helper Function: `getPriceArray(product, sellerId)`**
- **Purpose**: Retrieves price array for a product based on seller
- **Parameters**: 
  - `product`: Product document
  - `sellerId`: Seller identifier (optional)
- **Logic**: 
  - If sellerId provided: Finds seller-specific pricing from `product.sellers` array
  - Otherwise: Returns default `product.price_size` array
- **Returns**: Price array or null


**Function: `createOrder(req, res)`**
- **Route**: POST `/api/order/createorder`
- **Authentication**: Required (JWT)
- **Purpose**: Creates a new order from cart or single product

**Request Body**:
- `productId` (optional): For direct product checkout
- `size` (optional): Product size for direct checkout
- `quantity` (optional): Quantity for direct checkout
- `addressId` (required): Delivery address ID
- `paymentMethod` (required): 'cod' or 'online'
- `paymentLinkId` (optional): Payment link identifier
- `paymentLink` (optional): Payment gateway URL
- `sellerId` (optional): Seller ID for direct checkout

**Processing Flow**:
1. **Extract user ID** from authenticated request
2. **Initialize variables**: orderItems array, totalAmount counter, cart reference
3. **Determine checkout type**:
   - **Single Product Checkout**:
     - Fetch product by `productId`
     - Validate product exists
     - Get price array using `getPriceArray(product, sellerId)`
     - Validate seller linkage
     - Find size details in price array
     - Validate stock availability
     - Add item to orderItems array
     - Calculate totalAmount
   - **Cart Checkout**:
     - Fetch cart for user with populated product details
     - Validate cart exists and has items
     - Iterate through cart items:
       - Validate product exists
       - Get seller-specific price array
       - Find size details
       - Validate stock availability
       - Add to orderItems array
       - Accumulate totalAmount
4. **Create order document** with:
   - userId, items, totalAmount, paymentMethod, shippingAddress
   - Set paymentStatus: 'Pending' for both COD and online
   - Set orderStatus: 'Processing' for COD, 'Pending' for online
   - Store payment IDs if provided
5. **Post-order processing for COD**:
   - Clear cart (set items to empty array, reset totals)
   - Create notification for user with order details
   - Extract unique seller IDs from order items
   - Create notifications for each seller with their order subset
6. **Analytics cache invalidation**:
   - Extract all seller IDs from order
   - Invalidate cache for each seller
   - Invalidate admin analytics cache
7. **Response**: Return success with order document

**Error Handling**:
- 404: Product not found, Seller not linked
- 400: Size unavailable, Insufficient stock, Empty cart
- 500: Internal server errors (caught by asyncHandler)


**Function: `getOrderById(req, res)`**
- **Route**: GET `/api/order/order/:orderId`
- **Authentication**: Required
- **Purpose**: Retrieves single order details
- **Processing**: 
  - Find order by ID
  - Populate product details in items array
  - Return order document
- **Error Handling**: 404 if order not found

**Function: `getOrderHistory(req, res)`**
- **Route**: GET `/api/order/orderhistory`
- **Authentication**: Required
- **Purpose**: Retrieves all orders for authenticated user
- **Processing**:
  - Find all orders where userId matches authenticated user
  - Populate product details in items
  - Populate shipping address with selected fields
  - Sort by createdAt descending (newest first)
- **Response**: Array of order documents

**Function: `getSellerOrderHistory(req, res)`**
- **Route**: POST `/api/order/seller/orders`
- **Authentication**: Required (Seller role)
- **Purpose**: Retrieves orders containing items from specific seller
- **Processing**:
  1. Extract sellerId from authenticated user
  2. Convert to MongoDB ObjectId
  3. Find orders with items matching sellerId
  4. Populate product details and user info (firstName, lastName, email)
  5. Sort by createdAt descending
  6. Filter each order's items to show only seller's items
  7. Convert to plain objects and filter items array
- **Response**: Filtered orders array with count

**Function: `updateOrderStatus(req, res)`**
- **Route**: PUT `/api/order/update-status/:orderId`
- **Authentication**: Required (Seller role)
- **Purpose**: Updates order status (seller action)

**Request Body**: `orderStatus` (String)

**Processing Flow**:
1. Extract orderId from params, orderStatus from body, sellerId from auth
2. Find order by ID with populated user details
3. **Validation checks**:
   - Order exists
   - Not a Shiprocket order (those are managed by Shiprocket API)
   - Seller has items in this order
   - Status is valid enum value
4. Store old status for comparison
5. Update order status and save
6. **Create user notification** based on status:
   - Processing: "Order is Being Processed"
   - Shipped: "Order Shipped"
   - Delivered: "Order Delivered"
   - Cancelled: "Order Cancelled" + restore stock
7. **Stock restoration** (if cancelled):
   - Iterate through order items
   - Fetch each product
   - Get price array for seller
   - Find size detail
   - Increment quantity by order quantity
   - Save product
8. **Invalidate analytics cache** for seller
9. **Socket.IO real-time updates**:
   - Emit to buyer's room: 'order-status-updated' event
   - Emit to seller's room: 'order-updated' event
10. **Response**: Success with updated order

**Error Handling**:
- 404: Order not found
- 403: Unauthorized (not seller's order, Shiprocket order)
- 400: Invalid status


**Function: `cancelOrder(req, res)`**
- **Route**: PUT `/api/order/cancel/:orderId`
- **Authentication**: Required (User)
- **Purpose**: Allows customer to cancel their order

**Processing Flow**:
1. Extract orderId from params, userId from auth
2. Find order by ID
3. **Validation checks**:
   - Order exists
   - Order belongs to requesting user
   - Order not already cancelled
   - Order not delivered
   - Order not shipped (requires support contact)
4. Update order status to 'Cancelled'
5. Update payment status to 'Failed' if online payment pending
6. **Restore product stock**:
   - Iterate through order items
   - Fetch product document
   - Get price array for seller
   - Find size detail
   - Add back order quantity to stock
   - Save product
7. **Invalidate analytics cache**
8. **Create notifications**:
   - Notify user of cancellation
   - Extract unique seller IDs
   - Notify each seller with their order subset details
9. **Response**: Success with updated order

**Error Handling**:
- 404: Order not found
- 403: Unauthorized (not user's order)
- 400: Cannot cancel (already cancelled, delivered, or shipped)

---

#### 2.2 Shiprocket Controller (`agri_backend/controller/Shiprocket.js`)

**Function: `createPaymentOrder(req, res)`**
- **Route**: POST `/api/shiprocket/payment/create-order`
- **Authentication**: Required
- **Purpose**: Creates Razorpay payment order for Shiprocket checkout

**Request Body**: `amount` (Number)

**Processing**:
1. Validate amount is positive
2. Create Razorpay order options:
   - amount: Convert to paise (multiply by 100)
   - currency: 'INR'
   - receipt: Unique identifier with timestamp
   - payment_capture: 1 (auto-capture)
3. Call Razorpay API to create order
4. Return order details to client

**Error Handling**: 400 for invalid amount, 500 for Razorpay errors


**Function: `verifyPayment(req, res)`**
- **Route**: POST `/api/shiprocket/payment/verify`
- **Authentication**: Required
- **Purpose**: Verifies Razorpay payment signature

**Request Body**:
- `razorpay_payment_id` (String)
- `razorpay_order_id` (String)
- `razorpay_signature` (String)

**Processing**:
1. Validate all parameters present
2. Create signature string: `order_id|payment_id`
3. Generate HMAC SHA256 hash using Razorpay secret
4. Compare generated signature with received signature
5. Return success/failure based on match

**Error Handling**: 400 for missing params or invalid signature

**Function: `createOrder(req, res)`**
- **Route**: POST `/api/shiprocket/create`
- **Authentication**: Required
- **Purpose**: Creates order with Shiprocket shipping integration

**Request Body**:
- `addressId` (String, required): Delivery address ID
- `paymentMethod` (String, required): 'cod' or 'online'
- `items` (Array, required): Order items
- `paymentInfo` (Object, optional): Razorpay payment details
- `shippingCost` (Number): Delivery charges
- `shippingInfo` (Object): Shipping metadata

**Processing Flow**:
1. **Validation**:
   - Check addressId, items array not empty
   - Validate payment method enum
   - For online payment, verify paymentInfo provided
2. **Fetch user details** from database
3. **Fetch and validate address**:
   - Retrieve address document
   - Verify belongs to user
   - Validate required fields:
     - Mobile: minimum 10 digits
     - ZIP code: exactly 6 digits
     - Name, street, city, state: non-empty
   - Return detailed validation errors if any fail
4. **Validate products and calculate subtotal**:
   - Iterate through items
   - Validate item structure (productId, name, quantity, price)
   - Fetch product from database
   - Build validatedItems array with image URLs
   - Accumulate subtotal
5. **Prepare shipping address**:
   - Split name into firstName and lastName
   - Format for Shiprocket API requirements
6. **Fetch pickup location dynamically**:
   - Call `shiprocketService.getPickupLocations()`
   - Extract first location's pickup_location field
   - Fallback to 'Primary' if fetch fails
7. **Calculate total amount**: subtotal + shippingCost
8. **Build Shiprocket order data**:
   - order_id: Unique identifier with timestamp
   - order_date: Current date in ISO format
   - pickup_location: Dynamically fetched
   - billing_customer_name, billing_last_name
   - billing_address, city, pincode, state, country
   - billing_email, billing_phone
   - shipping_is_billing: true
   - order_items: Mapped with name, sku, units, selling_price
   - payment_method: 'COD' or 'Prepaid'
   - sub_total, shipping_charges
   - Default dimensions: 10x10x10 cm, 0.5 kg weight
9. **Create Shiprocket order** via service
10. **Save to database**:
    - Create ShiprocketOrder document
    - Store all order details, shipping info, Shiprocket response
    - Set status to 'processing'
11. **Response**: Return order and Shiprocket data

**Error Handling**:
- 400: Missing fields, invalid payment method, address validation errors
- 404: User not found, address not found, product not found
- 403: Unauthorized address access
- 500: Shiprocket API errors


**Function: `getOrders(req, res)`**
- **Route**: GET `/api/shiprocket/orders`
- **Authentication**: Required
- **Purpose**: Retrieves all Shiprocket orders for user
- **Processing**:
  - Find all ShiprocketOrder documents for user
  - Sort by createdAt descending
  - Return as lean objects (plain JS objects)
- **Response**: Orders array

**Function: `trackShipment(req, res)`**
- **Route**: GET `/api/shiprocket/track/:shipmentId`
- **Authentication**: Required
- **Purpose**: Tracks shipment status via Shiprocket API

**Processing**:
1. Extract shipmentId from params
2. Verify order belongs to authenticated user
3. Call `shiprocketService.trackOrder(shipmentId)`
4. Return tracking data

**Error Handling**: 400 for missing ID, 404 for shipment not found

**Function: `checkServiceability(req, res)`**
- **Route**: POST `/api/shiprocket/check-serviceability`
- **Authentication**: Required
- **Purpose**: Checks if delivery available to pincode and calculates shipping cost

**Request Body**:
- `pincode` (String, required): Delivery pincode
- `weight` (Number, optional): Package weight (default 0.5 kg)
- `cod` (Boolean, optional): COD enabled
- `pickupPincode` (String, optional): Pickup location pincode

**Processing**:
1. Validate pincode provided
2. Set defaults: pickup pincode (110001), weight (0.5 kg), COD flag
3. Call `shiprocketService.checkServiceability()`
4. Extract available courier companies from response
5. If no couriers available: Return serviceable: false
6. Get best courier (first in list, usually lowest rate)
7. Return shipping details:
   - serviceable: true
   - shippingCost: Courier rate
   - estimatedDays: Delivery ETA
   - courierName: Courier service name
   - allCouriers: Array of all available options

**Error Handling**: 400 for missing pincode, 500 for API errors

**Function: `cancelShipment(req, res)`**
- **Route**: POST `/api/shiprocket/cancel/:shipmentId`
- **Authentication**: Required
- **Purpose**: Cancels Shiprocket shipment

**Processing**:
1. Extract shipmentId from params
2. Verify order belongs to user
3. Check order status (cannot cancel if delivered or already cancelled)
4. Extract Shiprocket order_id (not shipment_id)
5. Call `shiprocketService.cancelOrder(orderId)`
6. Update database order status to 'cancelled'
7. Update Shiprocket status to 'CANCELLED'
8. Use findOneAndUpdate with runValidators: false to bypass enum validation

**Error Handling**:
- 400: Missing ID, invalid status for cancellation
- 404: Shipment not found
- 500: Shiprocket API errors

---

### 3. SERVICES (External Integration)

#### 3.1 Shiprocket Service (`agri_backend/services/shiprocket.service.js`)

**Class: ShiprocketService**
- **Purpose**: Singleton service for Shiprocket API integration
- **Properties**:
  - `baseURL`: Shiprocket API endpoint
  - `email`: Shiprocket account email
  - `password`: Shiprocket account password
  - `token`: Authentication token (cached)
  - `tokenExpiry`: Token expiration timestamp


**Method: `authenticate()`**
- **Purpose**: Authenticates with Shiprocket and obtains access token
- **Processing**:
  1. Log authentication attempt
  2. POST to `/auth/login` with email and password
  3. Extract token from response
  4. Set token expiry to 9 days (token valid for 10 days)
  5. Cache token in instance
  6. Return token
- **Error Handling**: Logs detailed error info, throws descriptive error

**Method: `ensureAuthenticated()`**
- **Purpose**: Checks token validity and refreshes if needed
- **Processing**:
  - If no token or expired: Call authenticate()
  - Return valid token
- **Usage**: Called before every API request

**Method: `getHeaders()`**
- **Purpose**: Generates HTTP headers with authentication
- **Processing**:
  1. Ensure token is valid
  2. Return headers object with:
     - Content-Type: application/json
     - Authorization: Bearer {token}

**Method: `createOrder(orderData)`**
- **Purpose**: Creates order in Shiprocket system
- **Parameters**: orderData object with order details
- **Processing**:
  1. Get authenticated headers
  2. POST to `/orders/create/adhoc` with orderData
  3. Check response for errors (Shiprocket returns 200 even for errors)
  4. If "Wrong Pickup location" error:
     - Extract available pickup locations from error response
     - Log all available locations
     - Throw descriptive error
  5. Validate response contains order_id
  6. Return order creation response
- **Error Handling**: 
  - Logs status, data, message
  - Extracts and displays available pickup locations
  - Throws detailed error messages

**Method: `cancelOrder(orderId)`**
- **Purpose**: Cancels order in Shiprocket
- **Parameters**: orderId (Shiprocket order ID, not shipment ID)
- **Processing**:
  1. Get authenticated headers
  2. POST to `/orders/cancel` with ids array
  3. Validate response
  4. Return cancellation response
- **Error Handling**: 
  - Clarifies order_id vs shipment_id confusion
  - Throws descriptive errors

**Method: `trackOrder(shipmentId)`**
- **Purpose**: Retrieves shipment tracking information
- **Parameters**: shipmentId (Shiprocket shipment ID)
- **Processing**:
  1. Get authenticated headers
  2. GET from `/courier/track/shipment/{shipmentId}`
  3. Return tracking data
- **Error Handling**: Logs and throws errors with context

**Method: `getPickupLocations()`**
- **Purpose**: Fetches all configured pickup locations from Shiprocket
- **Processing**:
  1. Get authenticated headers
  2. GET from `/settings/company/pickup`
  3. Parse response structure (handles multiple possible formats):
     - Direct array
     - response.data.shipping_address (actual Shiprocket structure)
     - response.data.data.data (nested)
     - response.data.data
     - response.data.shipping_address
  4. Extract pickup_location field from first location
  5. Return locations array
- **Error Handling**: 
  - Logs raw response for debugging
  - Returns empty array if no locations found
  - Throws error with context

**Method: `checkServiceability(pincode, pickupPincode, weight, cod)`**
- **Purpose**: Checks delivery serviceability and gets courier rates
- **Parameters**:
  - pincode: Delivery pincode
  - pickupPincode: Pickup location pincode
  - weight: Package weight in kg (default 1)
  - cod: COD enabled flag (1 or 0, default 1)
- **Processing**:
  1. Get authenticated headers
  2. GET from `/courier/serviceability` with query params:
     - pickup_postcode
     - delivery_postcode
     - weight
     - cod
  3. Return serviceability data with available couriers
- **Error Handling**: Logs and throws errors

**Export**: Singleton instance of ShiprocketService

---

### 4. CONFIGURATION

#### 4.1 Shiprocket Config (`agri_backend/config/shiprocket.js`)
- **Purpose**: Centralized Shiprocket configuration
- **Fields**:
  - `email`: Shiprocket account email (from env or demo)
  - `password`: Shiprocket account password (from env or demo)
  - `baseURL`: API endpoint (default: production URL)
  - `isDemoMode`: Flag for demo/sandbox mode
  - `defaultPickupLocation`: Demo warehouse details with full address

---

### 5. ROUTES (API Endpoints)

#### 5.1 Order Routes (`agri_backend/routes/Order.js`)
```
POST   /api/order/createorder              - Create new order (auth)
GET    /api/order/order/:orderId           - Get order by ID (auth)
GET    /api/order/orderhistory             - Get user order history (auth)
GET    /api/order/seller/orders            - Get seller orders (auth, seller)
PUT    /api/order/update-status/:orderId   - Update order status (auth, seller)
PUT    /api/order/cancel/:orderId          - Cancel order (auth)
POST   /api/order/create-payment-app       - Create Razorpay order (auth)
POST   /api/order/verify-payment-app       - Verify payment (auth)
POST   /api/order/create-payment-link-before-order - Legacy payment link
POST   /api/order/payment-verify           - Legacy payment verify
POST   /api/order/payment/webhook          - Payment webhook handler
```

#### 5.2 Shiprocket Routes (`agri_backend/routes/Shiprocket.js`)
```
POST   /api/shiprocket/payment/create-order    - Create Razorpay order (auth)
POST   /api/shiprocket/payment/verify          - Verify payment (auth)
POST   /api/shiprocket/create                  - Create Shiprocket order (auth)
GET    /api/shiprocket/orders                  - Get user orders (auth)
GET    /api/shiprocket/track/:shipmentId       - Track shipment (auth)
POST   /api/shiprocket/cancel/:shipmentId      - Cancel shipment (auth)
POST   /api/shiprocket/check-serviceability    - Check delivery availability (auth)
```

---


## FRONTEND IMPLEMENTATION (Mobile App)

### 6. ORDER SUMMARY SCREEN

#### 6.1 OrderSummaryPage Component (`agri-app/src/screens/Orders/OrderSummaryPage.js`)

**Purpose**: Final checkout screen where users review order, select payment method, and place order

**Props (from navigation route.params)**:
- `cart`: Cart object with items and totals
- `selectedAddress`: Delivery address object

**State Management**:
- `isLoading`: Loading state for order creation
- `paymentMethod`: Selected payment method ('cod' or 'online')
- `orderError`: Error message display
- `showWebView`: Controls Razorpay WebView modal visibility
- `razorpayHTML`: HTML content for Razorpay checkout
- `currentOrderId`: Order ID for payment processing
- `currentOrderAmount`: Order total for payment
- `shippingCost`: Calculated shipping charges
- `shippingInfo`: Shipping metadata (courier, ETA)
- `loadingShipping`: Loading state for shipping calculation

**Context Usage**:
- `CartContext`: Provides `clearCart()` function

**useEffect Hook: Calculate Shipping**
- **Trigger**: Runs when selectedAddress or paymentMethod changes
- **Processing**:
  1. Validate address has zipCode
  2. Set loadingShipping to true
  3. POST to `/shiprocket/check-serviceability` with:
     - pincode: selectedAddress.zipCode
     - pickupPincode: '110001' (hardcoded)
     - weight: 0.5 kg
     - cod: 1 if COD, 0 if online
  4. If serviceable:
     - Set shippingCost from response
     - Set shippingInfo with cost, estimatedDays, courierName
  5. If not serviceable:
     - Set shippingCost to 0
     - Clear shippingInfo
  6. Set loadingShipping to false
- **Error Handling**: Logs error, sets shipping to 0

**Function: `createPaymentOrder(amount)`**
- **Purpose**: Creates Razorpay payment order via backend
- **Parameters**: amount (Number)
- **Processing**:
  1. Log amount
  2. POST to `/order/create-payment-app` with amount
  3. Validate response contains order object
  4. Return Razorpay order details
- **Error Handling**: Shows toast, throws error

**Function: `verifyPayment(paymentData, orderId)`**
- **Purpose**: Verifies payment signature with backend
- **Parameters**: 
  - paymentData: Razorpay response object
  - orderId: Backend order ID
- **Processing**:
  1. Merge paymentData with orderId
  2. POST to `/order/verify-payment-app`
  3. Check response success flag
  4. Return true/false
- **Error Handling**: Shows toast, returns false

**Function: `handleWebViewMessage(event)`**
- **Purpose**: Processes messages from Razorpay WebView
- **Parameters**: event from WebView
- **Processing**:
  1. Parse JSON message from WebView
  2. **If type === 'success'**:
     - Close WebView
     - Set loading true
     - Extract payment IDs and signature
     - Call verifyPayment()
     - If verified:
       - Show success toast
       - Clear cart
       - Navigate to OrderSuccess screen
     - If not verified:
       - Navigate to OrderFailed screen
  3. **If type === 'error'**:
     - Close WebView
     - Show error toast
     - Navigate to OrderFailed screen
  4. **If type === 'dismiss'**:
     - Close WebView
     - Show cancellation toast
- **Error Handling**: Catches parsing errors, shows toast


**Function: `initiateRazorpayPayment(orderId, orderTotalAmount)`**
- **Purpose**: Opens Razorpay checkout in WebView
- **Parameters**:
  - orderId: Backend order ID
  - orderTotalAmount: Total amount to charge
- **Processing**:
  1. Validate amount is not 0
  2. Create Razorpay payment order via `createPaymentOrder()`
  3. Validate payment order has ID
  4. Store orderId and amount in state
  5. Generate HTML with embedded Razorpay Checkout script:
     - Load Razorpay SDK from CDN
     - Configure options:
       - key: Razorpay test key
       - amount: In paise (multiply by 100)
       - currency: INR
       - name: "PreciAgri"
       - description: "Order Payment"
       - image: App logo URL
       - order_id: Razorpay order ID
       - prefill: Customer name and mobile
       - theme color: #4CAF50
       - handler: Success callback posts message to React Native
       - modal.ondismiss: Dismiss callback posts message
     - Error handler: Posts error message
     - Auto-open Razorpay modal on load
  6. Set HTML in state
  7. Show WebView modal
- **Error Handling**: 
  - Shows toast for errors
  - Navigates to OrderFailed screen

**Function: `handleCreateOrder()`**
- **Purpose**: Main order creation handler
- **Processing Flow**:
  1. Set loading true, clear errors
  2. **Validation**:
     - Check payment method selected
     - Validate cart has items
     - Validate address selected
     - For online payment: Verify payment info provided
  3. **Prepare order data**:
     - addressId: selectedAddress._id
     - paymentMethod
     - paymentLinkId: empty string
     - shippingCost
     - shippingInfo
  4. **Create order**:
     - POST to `/order/createorder` with orderData
     - Validate response success
  5. **Handle response by payment method**:
     - **COD**:
       - Show success toast
       - Clear cart
       - Navigate to OrderSuccess screen
     - **Online**:
       - Stop loading
       - Call initiateRazorpayPayment()
  6. **Error handling**:
     - Extract error message
     - Set orderError state
     - Show error toast
     - Navigate to OrderFailed screen
  7. Set loading false (only for COD)

**Sub-Components**:

**OrderItem Component**:
- Displays individual cart item
- Shows product image, name, size, price, quantity
- Highlights discounted price vs original price

**AddressCard Component**:
- Displays delivery address details
- Shows name, full address, mobile number

**PaymentMethodSelector Component**:
- Two buttons: "Cash on Delivery" and "Pay Online"
- Highlights selected method
- Calls onSelect callback on tap

**OrderSummaryDetails Component**:
- Shows order breakdown:
  - Total MRP
  - Discount amount
  - Shipping charges (with loading indicator)
  - Estimated delivery and courier name
  - Grand total
- Calculates discount as: totalPrice - totalDiscountedPrice
- Calculates grand total as: totalDiscountedPrice + shippingCost

**Main Render Structure**:
1. SafeAreaView with CustomTopBar
2. ScrollView containing:
   - AddressCard
   - OrderItems list
   - OrderSummaryDetails
   - PaymentMethodSelector
   - Error message (if any)
   - Bottom padding for fixed button
3. Fixed button container at bottom:
   - Shows loading indicator when processing
   - Button text: "Confirm Order" for COD, "Pay ₹{amount}" for online
   - Disabled when loading
4. Modal for Razorpay WebView:
   - Header with title and close button
   - WebView with Razorpay HTML
   - Handles messages from WebView
   - Can be dismissed by user

**Styling**:
- Clean white cards with elevation
- Green theme (#4CAF50) for primary actions
- Responsive layout with proper spacing
- Fixed bottom button for easy access
- Loading states with ActivityIndicator

---

## DATA FLOW DIAGRAMS

### Order Creation Flow (COD)
```
User (Mobile App)
    ↓ [Select items, address, COD]
OrderSummaryPage.handleCreateOrder()
    ↓ [POST /order/createorder]
Order.createOrder() Controller
    ↓ [Validate cart/product]
    ↓ [Check stock]
    ↓ [Create Order document]
    ↓ [Clear cart]
    ↓ [Create notifications]
    ↓ [Invalidate analytics cache]
Database (MongoDB)
    ↓ [Order saved]
Response to App
    ↓ [Success]
Navigate to OrderSuccess
    ↓
Clear Cart Context
```

### Order Creation Flow (Online Payment)
```
User (Mobile App)
    ↓ [Select items, address, Online]
OrderSummaryPage.handleCreateOrder()
    ↓ [POST /order/createorder]
Order.createOrder() Controller
    ↓ [Create Order with status: Pending]
Database
    ↓ [Order saved, cart NOT cleared]
Response to App
    ↓ [Order ID, Amount]
initiateRazorpayPayment()
    ↓ [POST /order/create-payment-app]
Payment.createPaymentOrder()
    ↓ [Create Razorpay order]
Razorpay API
    ↓ [Return order_id]
Open WebView with Razorpay Checkout
    ↓ [User completes payment]
Razorpay processes payment
    ↓ [Return payment_id, signature]
handleWebViewMessage()
    ↓ [POST /order/verify-payment-app]
Payment.verifyPayment()
    ↓ [Verify signature]
    ↓ [Update order status]
    ↓ [Clear cart]
Database
    ↓ [Order updated to Processing]
Navigate to OrderSuccess
    ↓
Clear Cart Context
```


### Shiprocket Order Flow
```
User (Mobile App)
    ↓ [Select Shiprocket checkout]
ShiprocketCheckoutPage
    ↓ [Calculate shipping]
    ↓ [POST /shiprocket/check-serviceability]
Shiprocket.checkServiceability()
    ↓ [Call Shiprocket API]
ShiprocketService.checkServiceability()
    ↓ [Authenticate, GET serviceability]
Shiprocket API
    ↓ [Return courier rates]
Display shipping cost to user
    ↓ [User confirms]
    ↓ [POST /shiprocket/create]
Shiprocket.createOrder()
    ↓ [Validate address (strict)]
    ↓ [Validate products]
    ↓ [Fetch pickup locations]
ShiprocketService.getPickupLocations()
    ↓ [GET /settings/company/pickup]
Shiprocket API
    ↓ [Return locations]
    ↓ [Use first location]
    ↓ [Build order data]
    ↓ [POST /orders/create/adhoc]
ShiprocketService.createOrder()
    ↓ [Authenticate, create order]
Shiprocket API
    ↓ [Return order_id, shipment_id]
Save ShiprocketOrder to Database
    ↓ [With Shiprocket IDs]
Response to App
    ↓ [Success]
Navigate to OrderSuccess
```

### Order Status Update Flow (Seller)
```
Seller (Mobile App)
    ↓ [Update order status]
    ↓ [PUT /order/update-status/:orderId]
Order.updateOrderStatus()
    ↓ [Validate seller owns items]
    ↓ [Check not Shiprocket order]
    ↓ [Update status]
    ↓ [Create user notification]
Notification.createNotification()
    ↓ [Save notification]
Database
    ↓ [If cancelled: restore stock]
Product.save()
    ↓ [Invalidate analytics cache]
Analytics.invalidateAnalyticsCache()
    ↓ [Emit Socket.IO events]
Socket.IO
    ↓ [Emit to buyer room]
    ↓ [Emit to seller room]
Real-time update to connected clients
```

### Order Cancellation Flow (User)
```
User (Mobile App)
    ↓ [Cancel order]
    ↓ [PUT /order/cancel/:orderId]
Order.cancelOrder()
    ↓ [Validate user owns order]
    ↓ [Check can cancel (not shipped/delivered)]
    ↓ [Update status to Cancelled]
    ↓ [Restore product stock]
Product.save()
    ↓ [Create notifications]
    ↓ [User notification]
    ↓ [Seller notifications]
Notification.createNotification()
    ↓ [Invalidate analytics]
Database
    ↓ [Order cancelled]
Response to App
    ↓ [Success]
Update UI
```

### Shipment Tracking Flow
```
User (Mobile App)
    ↓ [Track shipment]
    ↓ [GET /shiprocket/track/:shipmentId]
Shiprocket.trackShipment()
    ↓ [Verify user owns order]
    ↓ [Call service]
ShiprocketService.trackOrder()
    ↓ [Authenticate]
    ↓ [GET /courier/track/shipment/:id]
Shiprocket API
    ↓ [Return tracking events]
Response to App
    ↓ [Tracking timeline]
Display tracking UI
```

---

## KEY FEATURES & CAPABILITIES

### 1. Dual Order Systems
- **Standard Orders**: Traditional order management with manual fulfillment
- **Shiprocket Orders**: Automated shipping with courier integration
- Separate models and workflows for each system

### 2. Payment Integration
- **Razorpay Integration**: Secure online payments
- **COD Support**: Cash on delivery option
- **Payment Verification**: HMAC signature validation
- **WebView Checkout**: Seamless in-app payment experience

### 3. Multi-Seller Support
- Orders can contain items from multiple sellers
- Seller-specific pricing and inventory
- Seller-specific notifications
- Seller order filtering and management

### 4. Inventory Management
- Real-time stock validation during checkout
- Automatic stock deduction on order creation
- Stock restoration on order cancellation
- Size-based inventory tracking

### 5. Address Validation
- Strict validation for Shiprocket orders
- Mobile number format validation (10+ digits)
- PIN code validation (exactly 6 digits)
- Required field validation (name, street, city, state)

### 6. Shipping Cost Calculation
- Real-time shipping cost calculation via Shiprocket API
- Courier serviceability check
- Multiple courier options with rates
- Estimated delivery time display

### 7. Order Lifecycle Management
- Status tracking: Pending → Processing → Shipped → Delivered
- Cancellation support with business rules
- Status update restrictions (e.g., can't cancel shipped orders)
- Seller-initiated status updates

### 8. Notification System
- User notifications for order events
- Seller notifications for new orders
- Status change notifications
- Multi-seller notification distribution

### 9. Real-time Updates
- Socket.IO integration for live order updates
- Buyer room notifications
- Seller room notifications
- Multi-device synchronization

### 10. Analytics Integration
- Cache invalidation on order events
- Seller-specific analytics updates
- Admin analytics updates
- Real-time dashboard data

### 11. Error Handling
- Comprehensive validation at every step
- Detailed error messages
- Graceful fallbacks (e.g., pickup location)
- User-friendly error display

### 12. Security
- JWT authentication on all endpoints
- Role-based access control (user, seller)
- Order ownership verification
- Payment signature verification

---

## EXTERNAL DEPENDENCIES

### Backend
- **mongoose**: MongoDB ODM for data modeling
- **axios**: HTTP client for Shiprocket API calls
- **razorpay**: Payment gateway SDK
- **crypto**: Payment signature verification
- **socket.io**: Real-time communication

### Frontend (Mobile)
- **react-native-webview**: Razorpay checkout display
- **react-native-toast-message**: User notifications
- **axios**: API communication
- **@react-navigation**: Screen navigation
- **React Context API**: Cart state management

### External APIs
- **Shiprocket API**: Shipping and logistics
- **Razorpay API**: Payment processing

---

## ENVIRONMENT VARIABLES REQUIRED

```
# Shiprocket
SHIPROCKET_EMAIL=your_shiprocket_email
SHIPROCKET_PASSWORD=your_shiprocket_password
SHIPROCKET_API_URL=https://apiv2.shiprocket.in/v1/external

# Razorpay
RAZORPAY_KEY=your_razorpay_key_id
RAZORPAY_SECRET=your_razorpay_secret

# Database
DATABASE_URL=mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret
```

---

## BUSINESS RULES

1. **Order Creation**:
   - Cart must have items for cart checkout
   - Stock must be available for all items
   - Address must be selected
   - Payment method must be chosen

2. **COD Orders**:
   - Cart cleared immediately after order creation
   - Order status set to 'Processing'
   - Notifications sent immediately

3. **Online Payment Orders**:
   - Cart NOT cleared until payment verified
   - Order status remains 'Pending' until payment
   - Payment verification required before fulfillment

4. **Order Cancellation**:
   - Users can cancel: Pending, Processing orders
   - Users cannot cancel: Shipped, Delivered orders
   - Stock restored on cancellation
   - Sellers notified of cancellation

5. **Seller Order Management**:
   - Sellers can only update orders containing their items
   - Sellers cannot update Shiprocket orders (API-managed)
   - Status updates trigger notifications

6. **Shiprocket Orders**:
   - Strict address validation required
   - Pickup location dynamically fetched
   - Shipping cost calculated before order creation
   - Cannot be manually updated (API-managed)

7. **Stock Management**:
   - Stock checked at order creation
   - Stock deducted on order confirmation
   - Stock restored on cancellation
   - Size-specific inventory tracking

---

## TESTING CONSIDERATIONS

### Unit Tests Needed
- getPriceArray() helper function
- Payment signature verification
- Stock validation logic
- Address validation logic

### Integration Tests Needed
- Order creation flow (COD)
- Order creation flow (Online)
- Payment verification flow
- Shiprocket order creation
- Order cancellation
- Status updates

### API Tests Needed
- All endpoint responses
- Authentication requirements
- Error handling
- Validation rules

### End-to-End Tests Needed
- Complete checkout flow
- Payment success/failure scenarios
- Order tracking
- Cancellation workflows

---

## PERFORMANCE OPTIMIZATIONS

1. **Caching**:
   - Shiprocket token cached for 9 days
   - Analytics cache invalidation on order events

2. **Database Indexes**:
   - ShiprocketOrder: Compound index on user + createdAt
   - ShiprocketOrder: Index on shipment_id

3. **Lean Queries**:
   - Use .lean() for read-only operations
   - Reduces memory overhead

4. **Batch Operations**:
   - Bulk notification creation for multiple sellers
   - Single database save per order

---

## FUTURE ENHANCEMENTS

1. **Order Splitting**: Split orders by seller for independent fulfillment
2. **Partial Cancellation**: Allow cancelling individual items
3. **Return/Refund**: Add return and refund workflows
4. **Order Tracking**: Enhanced tracking with map view
5. **Delivery Slots**: Allow users to select delivery time slots
6. **Gift Options**: Add gift wrapping and messages
7. **Subscription Orders**: Recurring order support
8. **Bulk Orders**: Support for wholesale/bulk purchases
9. **Invoice Generation**: Automatic invoice creation
10. **Shipping Insurance**: Optional insurance for high-value orders

---

## CONCLUSION

This Order Management & Shiprocket Integration feature provides a robust, scalable solution for e-commerce order processing with integrated logistics. It handles complex scenarios including multi-seller orders, dual payment methods, real-time notifications, and automated shipping through Shiprocket API. The architecture is modular, well-documented, and follows best practices for error handling, validation, and security.
