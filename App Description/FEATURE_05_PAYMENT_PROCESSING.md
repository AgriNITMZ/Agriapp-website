# Feature Description: Payment Processing

## Feature Overview
This feature provides a comprehensive payment processing system integrated with Razorpay payment gateway, supporting both Cash on Delivery (COD) and online payment methods. The system handles payment order creation, payment verification using HMAC signature validation, webhook processing for real-time payment status updates, payment link generation for web checkout, and seamless mobile app integration. The feature ensures PCI compliance by handling sensitive payment data through Razorpay's secure infrastructure, includes automatic stock adjustment on successful payment, and provides comprehensive notification system for users and sellers.

---

## Architecture Components

### Backend Components
1. **Controllers** (Business Logic Layer)
   - Payment Controller (`controller/Payment.js`)
   - Order Controller (Payment-related methods)

2. **Configuration** (Setup Layer)
   - Razorpay Configuration (`config/razorpay.js`)

3. **Routes** (API Endpoints Layer)
   - Order Routes (`routes/Order.js`) - Payment endpoints

4. **Models** (Data Layer)
   - Order Model (Payment status tracking)
   - Cart Model (Cart clearing after payment)
   - Product Model (Stock adjustment)

5. **Utils** (Helper Services)
   - Crypto (Signature verification)
   - Notification Service (Payment notifications)

### Frontend Components (Mobile App)
1. **Screens** (UI Layer)
   - Order Summary Page (Payment integration)
   - Order Success/Failed Screens

2. **Components** (Payment UI)
   - WebView Payment Modal
   - Payment Method Selector

---

## Detailed Component Analysis

### 1. CONFIGURATION

#### 1.1 Razorpay Configuration (`agri_backend/config/razorpay.js`)
**Purpose**: Centralized Razorpay configuration and instance creation

**Configuration**:
- `key_id`: Razorpay Key ID from environment variables
- `key_secret`: Razorpay Key Secret from environment variables

**Export**: Configured Razorpay instance ready for API calls

**Environment Variables Required**:
```env
RAZORPAY_KEY=rzp_test_xxxxxxxxxx
RAZORPAY_SECRET=xxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxx
CORS_ORIGIN=https://your-frontend-domain.com
```

**Usage**: Imported by controllers for payment operations

---

### 2. CONTROLLERS (Business Logic)

#### 2.1 Payment Controller (`agri_backend/controller/Payment.js`)

**Function: `createPaymentLinkBeforeOrder(req, res)`**
- **Route**: POST `/api/v1/order/create-payment-link-before-order`
- **Authentication**: Required
- **Purpose**: Creates Razorpay payment link for web checkout (before order creation)

**Request Body**:
- `totalAmount` (Number, required): Payment amount in rupees
- `addressId` (String, required): Delivery address ID

**Processing Flow**:
1. **User & Address Validation**:
   - Extract userId from authenticated request
   - Fetch user details from database
   - Fetch address details using addressId
   - Validate user exists
2. **Payment Link Creation**:
   - Construct payment link payload:
     - amount: Amount in paise (multiply by 100)
     - currency: 'INR'
     - customer: User details (name, email, contact)
     - notify: SMS and email notifications enabled
     - reminder_enable: true
     - callback_url: Success redirect URL
     - callback_method: 'get'
     - notes: Store userId for reference
   - Call Razorpay Payment Links API
3. **Response**:
   - Return payment link ID and short URL
   - Short URL can be shared or opened in browser

**Response**:
```json
{
  "success": true,
  "data": {
    "paymentLinkId": "plink_xxxxxxxxxx",
    "payment_link_url": "https://rzp.io/i/xxxxxxxxxx"
  },
  "message": "Payment link created successfully"
}
```

**Error Handling**:
- 404: User not found
- 500: Razorpay API errors

**Key Features**:
- Customer notification via SMS and email
- Reminder system for unpaid links
- Callback URL integration
- Shareable payment links
- User context stored in notes

---

**Function: `createPaymentOrder(req, res)`**
- **Route**: POST `/api/v1/order/create-payment-app`
- **Authentication**: Required
- **Purpose**: Creates Razorpay payment order for mobile app checkout

**Request Body**:
- `amount` (Number, required): Payment amount in rupees

**Processing Flow**:
1. **Validation**:
   - Check amount is provided
   - Validate amount is positive number
   - Convert amount to paise (multiply by 100)
2. **Razorpay Order Creation**:
   - Create order options object:
     - amount: Amount in paise
     - currency: 'INR'
     - receipt: Unique receipt ID with timestamp
     - payment_capture: 1 (auto-capture payments)
   - Call Razorpay Orders API
3. **Response**:
   - Return complete Razorpay order object
   - Contains order_id for frontend integration

**Response**:
```json
{
  "success": true,
  "order": {
    "id": "order_xxxxxxxxxx",
    "entity": "order",
    "amount": 50000,
    "amount_paid": 0,
    "amount_due": 50000,
    "currency": "INR",
    "receipt": "receipt_1234567890",
    "status": "created",
    "created_at": 1234567890
  },
  "message": "Payment order created successfully"
}
```

**Error Handling**:
- 400: Amount not provided or invalid (≤ 0)
- 500: Razorpay API errors

**Key Features**:
- Auto-capture enabled (payment captured immediately)
- Unique receipt generation with timestamp
- Amount validation
- Currency standardization (INR)

---

**Function: `verifyPayment(req, res)`**
- **Route**: POST `/api/v1/order/verify-payment-app`
- **Authentication**: Required
- **Purpose**: Verifies Razorpay payment signature for security (supports both web and app flows)

**Request Body (App Flow)**:
- `razorpay_order_id` (String, required): Razorpay order ID
- `razorpay_payment_id` (String, required): Razorpay payment ID
- `razorpay_signature` (String, required): Razorpay signature
- `orderId` (String, required): Internal order ID

**Request Body (Web Flow)**:
- `razorpay_payment_link_id` (String, required): Razorpay payment link ID

**Processing Flow (App Flow)**:
1. **Extract Parameters**:
   - Get all required fields from request body
   - Validate all parameters are present
2. **Signature Verification**:
   - Create signature string: `order_id|payment_id`
   - Generate HMAC SHA256 hash using Razorpay secret
   - Compare generated signature with received signature
3. **Order Update** (if signature valid):
   - Find order by internal orderId
   - Update order with payment details:
     - paymentId: razorpay_payment_id
     - paymentStatus: 'Completed'
     - orderStatus: 'Processing'
   - Save order
4. **Cart Clearing**:
   - Find user's cart
   - Clear all items
   - Reset total prices
5. **Notifications**:
   - Send success notification to user
   - Send new order notifications to all sellers
6. **Response**:
   - Return success with payment ID

**Processing Flow (Web Flow)**:
1. **Find Order**:
   - Locate order by payment link ID
   - Validate order exists
2. **Check Existing Status**:
   - If already completed, return success
3. **Fetch Payment Status**:
   - Call Razorpay API to get payment link status
4. **Handle Status**:
   - If 'paid': Call `handleSuccessfulPayment()`
   - If 'cancelled/expired/failed': Call `handleFailedPayment()`
   - If pending: Return pending status

**Response** (Success):
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "paymentId": "pay_xxxxxxxxxx"
}
```

**Response** (Failure):
```json
{
  "success": false,
  "message": "Payment verification failed - Invalid signature"
}
```

**Error Handling**:
- 400: Missing parameters, signature verification failed
- 404: Order not found
- 500: Internal server error

**Security Features**:
- HMAC SHA256 signature verification
- Razorpay secret key validation
- Prevents payment tampering
- Ensures payment authenticity
- Dual verification (app signature + web status check)

---

**Function: `handleWebhook(req, res)`**
- **Route**: POST `/api/v1/order/payment/webhook`
- **Authentication**: Not required (webhook signature verification)
- **Purpose**: Handles Razorpay webhook notifications for real-time payment updates

**Request**: Razorpay webhook payload with signature header

**Processing Flow**:
1. **Webhook Signature Verification**:
   - Extract webhook signature from headers (`x-razorpay-signature`)
   - Generate HMAC SHA256 hash using webhook secret and raw body
   - Compare generated digest with received signature
   - Reject if signatures don't match
2. **Payload Validation**:
   - Validate payload structure
   - Check payment_link object exists
3. **Order Lookup**:
   - Find order by payment link ID
   - Return 404 if order not found
4. **Skip Processed Orders**:
   - If payment already completed or order cancelled, acknowledge and return
5. **Event Processing**:
   - Handle different payment link statuses:
     - **paid**: Call `handleSuccessfulPayment()`
     - **cancelled/expired/failed**: Call `handleFailedPayment()`
     - **other**: Update payment status only
6. **Response**:
   - Return 200 OK to acknowledge webhook

**Supported Events**:
- `paid`: Payment successful
- `cancelled`: Payment cancelled by user
- `expired`: Payment link expired
- `failed`: Payment failed

**Error Handling**:
- 400: Invalid webhook signature, invalid payload
- 404: Order not found
- 500: Processing errors

**Key Features**:
- Webhook signature verification for security
- Event-driven order updates
- Automatic status synchronization
- Reliable payment tracking
- Idempotent processing (skip already processed)

---

**Helper Function: `handleSuccessfulPayment(order)`**
- **Purpose**: Processes successful payment with stock adjustment and notifications

**Processing Flow**:
1. **Check Already Processed**:
   - If `stockAdjusted` flag is true, skip processing
2. **Start Database Transaction**:
   - Use Mongoose session for atomic operations
3. **Update Order Status**:
   - Set paymentStatus: 'Completed'
   - Set orderStatus: 'Processing'
4. **Stock Adjustment** (for each order item):
   - Fetch product from database
   - Determine price array (seller-specific or general)
   - Find size in price array
   - Validate sufficient stock available
   - Deduct ordered quantity from stock
   - Mark product as modified
   - Save product with session
5. **Mark Stock Adjusted**:
   - Set `stockAdjusted` flag to true
   - Save order with session
6. **Commit Transaction**:
   - If all operations succeed, commit
   - If any operation fails, rollback
7. **Clear Cart** (outside transaction):
   - Find user's cart
   - Clear all items
   - Reset total prices
8. **Send Notifications**:
   - User notification: Payment success message
   - Seller notifications: New order with payment received

**Error Handling**:
- Throws error if seller not linked to product
- Throws error if size not available
- Throws error if insufficient stock
- Transaction rollback on any error
- Session cleanup in finally block

**Key Features**:
- Atomic stock adjustment
- Transaction safety
- Seller-specific stock management
- Duplicate processing prevention
- Comprehensive notifications

---

**Helper Function: `handleFailedPayment(order, status)`**
- **Purpose**: Processes failed payment with order cancellation

**Processing Flow**:
1. **Update Order Status**:
   - Set paymentStatus: 'Failed'
   - Set orderStatus: 'Cancelled'
   - Set failureReason: Payment status message
2. **Save Order**:
   - Persist changes to database
3. **Send Notification**:
   - User notification: Payment failed with retry option

**Error Handling**:
- Catch and log errors
- Throw error for caller to handle

**Key Features**:
- Clear failure tracking
- User notification for retry
- Order cancellation
- Failure reason logging

---

### 3. ROUTES

#### 3.1 Payment Routes (`agri_backend/routes/Order.js`)

**Mobile App Payment Routes**:
```
POST   /api/v1/order/create-payment-app        - Create payment order (auth)
POST   /api/v1/order/verify-payment-app        - Verify payment (auth)
```

**Web Payment Routes**:
```
POST   /api/v1/order/create-payment-link-before-order - Create payment link (auth)
POST   /api/v1/order/payment-verify                    - Verify payment (auth)
```

**Webhook Routes**:
```
POST   /api/v1/order/payment/webhook           - Payment webhook (no auth, signature verified)
```

**Route Configuration**:
- All payment routes use `/api/v1/order` prefix
- Authentication middleware applied to user-facing routes
- Webhook route has no auth (uses signature verification)
- Seller routes protected with `isSeller` middleware

---

## FRONTEND IMPLEMENTATION (Mobile App)

### 4. PAYMENT INTEGRATION

#### 4.1 Order Summary Page Payment Integration

**Payment Method State**:
- `paymentMethod`: Selected payment method ('cod' or 'online')
- `showWebView`: Controls Razorpay WebView modal visibility
- `razorpayHTML`: HTML content for Razorpay checkout
- `currentOrderId`: Order ID for payment processing
- `currentOrderAmount`: Order total for payment

**Function: `createPaymentOrder(amount)`**
- **Purpose**: Creates Razorpay payment order via backend

**Parameters**:
- `amount` (Number): Payment amount in rupees

**Processing Flow**:
1. Validate amount is provided
2. POST to `/order/create-payment-app`
3. Send amount in request body
4. Extract Razorpay order details from response
5. Return order object

**Error Handling**:
- Show error toast on failure
- Throw error for caller

---

**Function: `verifyPayment(paymentData, orderId)`**
- **Purpose**: Verifies payment signature with backend

**Parameters**:
- `paymentData`: Razorpay response object
- `orderId`: Internal order ID

**Processing Flow**:
1. Merge paymentData with orderId
2. POST to `/order/verify-payment-app`
3. Check response success flag
4. Return true/false based on verification

**Verification Payload**:
```javascript
{
  razorpay_order_id: paymentData.razorpay_order_id,
  razorpay_payment_id: paymentData.razorpay_payment_id,
  razorpay_signature: paymentData.razorpay_signature,
  orderId: orderId
}
```

---

**Function: `initiateRazorpayPayment(orderId, orderTotalAmount)`**
- **Purpose**: Opens Razorpay checkout in WebView

**Parameters**:
- `orderId`: Internal order ID
- `orderTotalAmount`: Total amount to charge

**Processing Flow**:
1. Validate amount is not zero
2. Call `createPaymentOrder(orderTotalAmount)`
3. Get Razorpay order details
4. Store currentOrderId and currentOrderAmount
5. Generate Razorpay HTML with embedded checkout
6. Show WebView modal

**Razorpay HTML Template**:
```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
</head>
<body>
    <script>
        var options = {
            key: 'rzp_test_xxxxxxxxxx',
            amount: ${amount * 100},
            currency: 'INR',
            name: 'PreciAgri',
            description: 'Order Payment',
            order_id: '${razorpayOrderId}',
            prefill: {
                name: '${customerName}',
                contact: '${customerMobile}'
            },
            theme: { color: '#4CAF50' },
            handler: function(response) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'success',
                    data: response
                }));
            },
            modal: {
                ondismiss: function() {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'dismiss'
                    }));
                }
            }
        };
        
        var rzp = new Razorpay(options);
        rzp.on('payment.failed', function(response) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'error',
                data: response.error
            }));
        });
        
        rzp.open();
    </script>
</body>
</html>
```

---

**Function: `handleWebViewMessage(event)`**
- **Purpose**: Processes messages from Razorpay WebView

**Parameters**:
- `event`: WebView message event

**Processing Flow**:
1. Parse JSON message from event
2. Handle message types:
   - **Success**: Payment completed
   - **Error**: Payment failed
   - **Dismiss**: User cancelled

**Success Flow**:
```javascript
if (type === 'success') {
  setShowWebView(false);
  setIsLoading(true);
  
  const isVerified = await verifyPayment(data, currentOrderId);
  
  if (isVerified) {
    Toast.show({ type: 'success', text1: 'Payment Successful!' });
    clearCart();
    navigation.navigate('OrderSuccess', { orderId: currentOrderId });
  } else {
    navigation.navigate('OrderFailed', { orderId: currentOrderId });
  }
  
  setIsLoading(false);
}
```

**Error Flow**:
```javascript
if (type === 'error') {
  setShowWebView(false);
  Toast.show({ 
    type: 'error', 
    text1: 'Payment Failed', 
    text2: data.description 
  });
  navigation.navigate('OrderFailed', { orderId: currentOrderId });
}
```

**Dismiss Flow**:
```javascript
if (type === 'dismiss') {
  setShowWebView(false);
  Toast.show({ type: 'info', text1: 'Payment Cancelled' });
}
```

---

**Function: `handleCreateOrder()`** (Payment Integration)
- **Purpose**: Main order creation with payment handling

**Payment Processing Section**:
```javascript
if (paymentMethod === 'online') {
  // Create order first (status: Pending)
  const response = await axios.post('/order/createorder', orderData);
  
  if (response.data.success) {
    const { order } = response.data;
    setIsLoading(false);
    
    // Initiate payment
    await initiateRazorpayPayment(order._id, grandTotal);
  }
} else {
  // COD flow - order created with status: Processing
  const response = await axios.post('/order/createorder', orderData);
  
  if (response.data.success) {
    Toast.show({ type: 'success', text1: 'Order Placed Successfully!' });
    clearCart();
    navigation.navigate('OrderSuccess', { orderId: response.data.order._id });
  }
}
```

---

#### 4.2 Payment Method Selector Component

**Purpose**: UI component for selecting payment method

**Props**:
- `selectedMethod`: Currently selected method
- `onSelect`: Callback when method changes

**UI Structure**:
```javascript
<View style={styles.paymentMethodContainer}>
  <Text style={styles.sectionTitle}>Payment Method</Text>
  
  <TouchableOpacity 
    style={[styles.methodButton, selectedMethod === 'cod' && styles.selectedMethod]}
    onPress={() => onSelect('cod')}
  >
    <Icon name="money" size={24} />
    <Text>Cash on Delivery</Text>
  </TouchableOpacity>
  
  <TouchableOpacity 
    style={[styles.methodButton, selectedMethod === 'online' && styles.selectedMethod]}
    onPress={() => onSelect('online')}
  >
    <Icon name="credit-card" size={24} />
    <Text>Pay Online</Text>
  </TouchableOpacity>
</View>
```

---

#### 4.3 WebView Payment Modal

**Purpose**: Secure payment processing container

**Modal Structure**:
```javascript
<Modal
  visible={showWebView}
  animationType="slide"
  presentationStyle="pageSheet"
  onRequestClose={() => setShowWebView(false)}
>
  <SafeAreaView style={styles.modalContainer}>
    <View style={styles.modalHeader}>
      <Text style={styles.modalTitle}>Complete Payment</Text>
      <TouchableOpacity onPress={() => setShowWebView(false)}>
        <Icon name="x" size={24} />
      </TouchableOpacity>
    </View>
    
    <WebView
      source={{ html: razorpayHTML }}
      onMessage={handleWebViewMessage}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      startInLoadingState={true}
    />
  </SafeAreaView>
</Modal>
```

---

## DATA FLOW DIAGRAMS

### Online Payment Flow (Mobile App)
```
User (Mobile App)
    ↓ [Select "Pay Online", tap "Confirm Order"]
OrderSummaryPage.handleCreateOrder()
    ↓ [POST /order/createorder with paymentMethod: 'online']
Order.createOrder()
    ↓ [Create order with status: 'Pending', paymentStatus: 'Pending']
    ↓ [Do NOT clear cart yet]
Database
    ↓ [Save order]
Response to App
    ↓ [Order created, return order ID]
initiateRazorpayPayment()
    ↓ [POST /order/create-payment-app]
Payment.createPaymentOrder()
    ↓ [Create Razorpay order]
Razorpay API
    ↓ [Return order_id, amount, receipt]
Generate Razorpay HTML
    ↓ [Embed order_id, amount, customer details]
Show WebView Modal
    ↓ [Load Razorpay Checkout]
User Completes Payment
    ↓ [Razorpay processes payment]
Razorpay Response
    ↓ [payment_id, order_id, signature]
handleWebViewMessage()
    ↓ [POST /order/verify-payment-app]
Payment.verifyPayment()
    ↓ [Verify HMAC signature]
    ↓ [Update order: paymentStatus: 'Completed', orderStatus: 'Processing']
    ↓ [Clear cart]
    ↓ [Send notifications to user and sellers]
Database
    ↓ [Save updated order]
Response to App
    ↓ [Verification success]
Navigate to OrderSuccess
```

### COD Payment Flow
```
User (Mobile App)
    ↓ [Select "Cash on Delivery", tap "Confirm Order"]
OrderSummaryPage.handleCreateOrder()
    ↓ [POST /order/createorder with paymentMethod: 'cod']
Order.createOrder()
    ↓ [Create order with status: 'Processing']
    ↓ [Set paymentStatus: 'Pending']
    ↓ [Clear cart immediately]
    ↓ [Create notifications]
Database
    ↓ [Save order]
Response to App
    ↓ [Order created successfully]
Show Success Toast
    ↓ ["Order Placed Successfully!"]
Navigate to OrderSuccess
```

### Payment Verification Flow
```
Razorpay Payment Completion
    ↓ [Return payment_id, order_id, signature]
Mobile App
    ↓ [POST /order/verify-payment-app]
Payment.verifyPayment()
    ↓ [Extract payment details]
    ↓ [Create signature string: order_id|payment_id]
    ↓ [Generate HMAC SHA256 with Razorpay secret]
    ↓ [Compare signatures]
    ↓
If Signatures Match:
    ↓ [Find order by orderId]
    ↓ [Update paymentId, paymentStatus: 'Completed']
    ↓ [Update orderStatus: 'Processing']
    ↓ [Clear cart]
    ↓ [Send notifications]
    ↓ [Save order]
Database
    ↓ [Order updated]
Response
    ↓ [success: true]
Mobile App
    ↓ [Navigate to OrderSuccess]
    
If Signatures Don't Match:
    ↓ [Return success: false]
Mobile App
    ↓ [Navigate to OrderFailed]
```

### Webhook Processing Flow
```
Razorpay Webhook
    ↓ [POST /order/payment/webhook]
Payment.handleWebhook()
    ↓ [Verify webhook signature]
    ↓ [Parse event payload]
    ↓ [Find order by payment link ID]
    ↓
If payment_link.status === 'paid':
    ↓ [Call handleSuccessfulPayment()]
    ↓ [Start database transaction]
    ↓ [Update order status]
    ↓ [Adjust stock for each item]
    ↓ [Mark stockAdjusted = true]
    ↓ [Commit transaction]
    ↓ [Clear cart]
    ↓ [Send notifications]
    
If payment_link.status === 'cancelled/expired/failed':
    ↓ [Call handleFailedPayment()]
    ↓ [Update paymentStatus: 'Failed']
    ↓ [Update orderStatus: 'Cancelled']
    ↓ [Send failure notification]
    
Database
    ↓ [Save order updates]
Response
    ↓ [200 OK to Razorpay]
```

### Stock Adjustment Flow (Successful Payment)
```
handleSuccessfulPayment(order)
    ↓ [Check stockAdjusted flag]
    ↓ [Start Mongoose session]
    ↓ [Begin transaction]
    ↓
For Each Order Item:
    ↓ [Fetch product from database]
    ↓ [Determine price array (seller-specific or general)]
    ↓ [Find size in price array]
    ↓ [Validate sufficient stock]
    ↓ [Deduct quantity from stock]
    ↓ [Mark product as modified]
    ↓ [Save product with session]
    ↓
    ↓ [Set stockAdjusted = true]
    ↓ [Save order with session]
    ↓ [Commit transaction]
    ↓
Outside Transaction:
    ↓ [Clear user cart]
    ↓ [Send user notification]
    ↓ [Send seller notifications]
```

---

## KEY FEATURES & CAPABILITIES

### 1. Dual Payment Methods
- **Cash on Delivery (COD)**: Traditional payment method for users preferring cash
- **Online Payment**: Secure card/UPI/wallet payments via Razorpay
- Seamless switching between methods
- Method-specific order processing flows
- Different status handling for each method

### 2. Razorpay Integration
- Official Razorpay SDK integration
- PCI DSS compliant payment processing
- Multiple payment methods supported:
  - Credit/Debit Cards
  - UPI (Google Pay, PhonePe, Paytm)
  - Wallets (Paytm, PhonePe, Amazon Pay)
  - Net Banking
- Auto-capture payments (immediate settlement)
- Real-time payment status updates

### 3. WebView Payment Processing (Mobile App)
- Secure in-app payment experience
- No external browser redirection
- Custom HTML with Razorpay Checkout embedded
- Real-time communication with React Native via postMessage
- User-friendly payment interface
- Loading states and error handling

### 4. Payment Link Generation (Web)
- Shareable payment links for web checkout
- Customer notification via SMS and email
- Payment reminders for unpaid links
- Callback URL integration
- Link expiration handling

### 5. Payment Security
- HMAC SHA256 signature verification for all payments
- Razorpay secret key validation
- Webhook signature verification
- Secure payment data handling
- No sensitive data storage in database
- Only Razorpay IDs stored for reference

### 6. Order Status Management
- Different flows for COD vs Online payments
- **Pending** status for unpaid online orders
- **Processing** status for paid orders and COD orders
- **Failed** status for failed payments
- **Cancelled** status for cancelled payments
- Automatic status updates via webhooks

### 7. Stock Management Integration
- Automatic stock adjustment on successful payment
- Transaction-based stock deduction (atomic operations)
- Seller-specific stock management
- Size-based inventory tracking
- Stock validation before deduction
- Rollback on transaction failure

### 8. Notification System
- User notifications for payment success/failure
- Seller notifications for new paid orders
- Payment amount and order details included
- Retry prompts for failed payments
- Real-time notification delivery

### 9. Error Handling
- Payment failure handling with clear messages
- Network error recovery
- User cancellation handling
- Signature verification failures
- Graceful error messages
- Retry mechanisms

### 10. Webhook Support
- Real-time payment notifications from Razorpay
- Automatic order updates based on payment events
- Event-driven processing
- Reliable payment tracking
- Backup verification system
- Idempotent webhook processing

---

## BUSINESS RULES

### Payment Method Selection
1. User must select payment method before checkout
2. COD available for all orders (no restrictions)
3. Online payment available for all orders
4. Payment method affects order processing flow
5. Payment method stored in order for reference

### COD Orders
1. Order created with status 'Processing' immediately
2. Payment status set to 'Pending'
3. Cart cleared immediately after order creation
4. Notifications sent immediately
5. No payment verification required
6. Stock NOT adjusted until delivery confirmation

### Online Payment Orders
1. Order created with status 'Pending' initially
2. Payment status set to 'Pending'
3. Cart NOT cleared until payment verified
4. Payment verification required before processing
5. Order status updated to 'Processing' after successful payment
6. Stock adjusted immediately after payment verification

### Payment Verification
1. All online payments MUST be verified
2. HMAC signature verification mandatory for app payments
3. Payment link status check for web payments
4. Failed verification = failed order
5. Successful verification = order processing
6. Cart cleared only after successful verification

### Stock Adjustment
1. Stock adjusted only for paid online orders
2. Transaction-based adjustment (atomic)
3. Seller-specific stock deduction
4. Size-based inventory management
5. Stock validation before deduction
6. Rollback on any failure
7. `stockAdjusted` flag prevents duplicate processing

### Payment Security
1. No payment card data stored in database
2. Only Razorpay payment IDs stored for reference
3. Signature verification for all app payments
4. Webhook verification for reliability
5. Secure HTTPS communication only
6. Environment variables for sensitive keys

### Order Processing
1. COD orders processed immediately (no payment wait)
2. Online orders processed after payment verification
3. Failed payments keep order in pending state
4. Successful payments trigger fulfillment workflow
5. Payment status tracked throughout order lifecycle

### Webhook Processing
1. Webhook signature must be verified
2. Duplicate webhooks handled gracefully (idempotent)
3. Order status updated based on payment events
4. Stock adjusted on 'paid' event
5. Notifications sent on status changes
6. Failed webhooks logged for manual review

---

## SECURITY FEATURES

### 1. Payment Data Security
- No sensitive payment data stored in database
- PCI DSS compliance through Razorpay infrastructure
- Secure HTTPS communication for all API calls
- Token-based authentication for user requests
- Environment variables for API keys

### 2. Signature Verification
- HMAC SHA256 signature validation for app payments
- Razorpay secret key protection via environment variables
- Prevents payment tampering and fraud
- Ensures payment authenticity
- Signature mismatch = payment rejection

### 3. Webhook Security
- Webhook signature verification using webhook secret
- Event authenticity validation
- Secure endpoint protection
- Replay attack prevention
- Raw body preservation for signature verification

### 4. API Security
- JWT authentication required for user endpoints
- User role validation (user/seller)
- Request payload validation
- Error message sanitization
- Rate limiting (recommended)

### 5. Frontend Security
- WebView sandboxing for payment processing
- Secure message passing between WebView and React Native
- No payment data stored in app state
- Secure navigation flows
- Payment data cleared after processing

### 6. Transaction Security
- Database transactions for stock adjustment
- Atomic operations prevent partial updates
- Rollback on any failure
- Session management for consistency
- Duplicate processing prevention

---

## ERROR HANDLING

### Frontend Errors

**Payment Creation Failures**:
- Network connectivity issues
- Invalid amount errors
- Backend API failures
- User feedback via toast messages
- Retry options provided

**WebView Loading Errors**:
- HTML generation failures
- Razorpay script loading issues
- Loading state indicators
- Fallback error messages

**Payment Cancellation**:
- User dismisses payment modal
- Informative toast message
- Order remains in pending state
- User can retry payment

**Verification Failures**:
- Signature mismatch errors
- Network errors during verification
- Navigate to OrderFailed screen
- Display error details to user

### Backend Errors

**Razorpay API Failures**:
- Order creation failures
- Payment link creation failures
- API timeout handling
- Error logging for debugging
- User-friendly error messages

**Signature Verification Failures**:
- Invalid signature detection
- Tampered payment data
- Payment rejection
- Security logging
- User notification

**Order Not Found Errors**:
- Invalid order ID
- Deleted orders
- 404 response
- Error logging

**Database Connection Issues**:
- Connection timeout
- Transaction failures
- Rollback mechanisms
- Retry logic
- Error logging

**Webhook Processing Errors**:
- Invalid webhook signature
- Malformed payload
- Order lookup failures
- Stock adjustment errors
- Error logging for manual review

### User Experience

**Clear Error Messages**:
- User-friendly language
- Specific error descriptions
- Actionable guidance
- No technical jargon

**Retry Mechanisms**:
- Automatic retry for network errors
- Manual retry buttons
- Retry count limits
- Exponential backoff

**Fallback Options**:
- Alternative payment methods
- COD as fallback
- Contact support option
- Order recovery mechanisms

**Support Contact Information**:
- Help center links
- Support email/phone
- Chat support option
- FAQ references

**Graceful Degradation**:
- Partial functionality on errors
- Informative loading states
- Progress indicators
- Cancel options

### Error Recovery

**Network Error Recovery**:
- Automatic retry with exponential backoff
- Connection status monitoring
- Offline mode indicators
- Queue failed requests

**Payment Failure Recovery**:
- Retry payment option
- Change payment method
- Update payment details
- Contact support escalation

**Order Recovery**:
- Resume pending orders
- Retry payment for pending orders
- Cancel and recreate order
- Refund processing (if applicable)

**Stock Adjustment Failures**:
- Transaction rollback
- Order status revert
- Manual review queue
- Admin notification

---

## PERFORMANCE OPTIMIZATIONS

### 1. Payment Processing
- Async payment verification (non-blocking)
- Optimistic UI updates
- Minimal API calls
- Efficient error handling
- Response caching where appropriate

### 2. WebView Optimization
- Minimal HTML payload size
- Fast loading times
- Efficient message passing
- Memory management
- WebView cleanup on unmount

### 3. Database Operations
- Indexed payment fields (paymentId, paymentStatus)
- Efficient order queries
- Minimal data updates
- Transaction support for consistency
- Connection pooling

### 4. API Performance
- Response compression
- Minimal payload sizes
- Efficient routing
- Connection pooling
- Query optimization

### 5. Webhook Processing
- Async processing
- Queue-based handling (recommended)
- Idempotent operations
- Efficient database queries
- Background job processing

---

## TESTING CONSIDERATIONS

### Unit Tests

**Signature Verification Logic**:
- Test HMAC SHA256 generation
- Test signature comparison
- Test invalid signature handling
- Test missing parameters

**Payment Amount Calculations**:
- Test rupees to paise conversion
- Test amount validation
- Test negative amount handling
- Test zero amount handling

**Error Handling Functions**:
- Test error message generation
- Test error logging
- Test error response formatting
- Test exception handling

**Webhook Processing**:
- Test signature verification
- Test event parsing
- Test status handling
- Test duplicate processing

### Integration Tests

**Razorpay API Integration**:
- Test order creation
- Test payment link creation
- Test payment verification
- Test webhook handling
- Test API error responses

**Payment Flow End-to-End**:
- Test complete online payment flow
- Test COD order flow
- Test payment verification flow
- Test webhook processing flow

**Order Status Updates**:
- Test status transitions
- Test stock adjustment
- Test cart clearing
- Test notification sending

### E2E Tests

**Complete Payment Journey**:
- User selects online payment
- Order created with pending status
- Payment processed via Razorpay
- Payment verified successfully
- Order status updated
- Stock adjusted
- Cart cleared
- Notifications sent

**COD Order Flow**:
- User selects COD
- Order created with processing status
- Cart cleared immediately
- Notifications sent

**Payment Failure Scenarios**:
- Payment declined by bank
- Insufficient funds
- Network timeout
- User cancellation
- Order status handling

**User Cancellation Flows**:
- User dismisses payment modal
- Order remains pending
- Cart not cleared
- User can retry

### Security Tests

**Signature Verification**:
- Test valid signatures
- Test invalid signatures
- Test tampered data
- Test missing signatures

**Webhook Security**:
- Test valid webhook signatures
- Test invalid webhook signatures
- Test replay attacks
- Test malformed payloads

**Payment Data Handling**:
- Verify no sensitive data stored
- Test data encryption in transit
- Test secure API communication
- Test environment variable usage

**Authentication Flows**:
- Test JWT validation
- Test user role checks
- Test unauthorized access
- Test token expiration

---

## FUTURE ENHANCEMENTS

1. **Multiple Payment Gateways**: Support for Stripe, PayPal, Paytm for redundancy and choice

2. **Saved Payment Methods**: Store customer payment preferences securely for faster checkout

3. **Recurring Payments**: Subscription and recurring order support for regular purchases

4. **Payment Analytics**: Detailed payment success/failure analytics dashboard for business insights

5. **Dynamic Payment Methods**: Show/hide methods based on order value, location, or user history

6. **Payment Installments**: EMI and installment payment options for high-value orders

7. **International Payments**: Multi-currency support for global expansion

8. **Payment Reminders**: Automated payment reminder system for pending orders

9. **Refund Processing**: Automated refund handling with status tracking

10. **Payment Insights**: Customer payment behavior analytics for optimization

11. **Fraud Detection**: Advanced fraud prevention measures using ML

12. **Payment Optimization**: A/B testing for payment flows to improve conversion

13. **Mobile Wallets**: Enhanced wallet integration (Google Pay, Apple Pay)

14. **QR Code Payments**: QR-based payment options for offline-to-online

15. **Voice Payments**: Voice-activated payment processing for accessibility

16. **Split Payments**: Allow splitting payment across multiple methods

17. **Payment Scheduling**: Schedule payments for future dates

18. **Loyalty Points**: Integrate loyalty points as payment method

19. **Gift Cards**: Support for gift card payments

20. **Buy Now Pay Later**: Integration with BNPL providers (Simpl, LazyPay)

---

## ENVIRONMENT VARIABLES

```env
# Razorpay Configuration
RAZORPAY_KEY=rzp_test_xxxxxxxxxxxxxxxxxx
RAZORPAY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxx

# Frontend Configuration (Mobile App)
REACT_APP_RAZORPAY_KEY=rzp_test_xxxxxxxxxxxxxxxxxx

# Callback URLs
CORS_ORIGIN=https://your-frontend-domain.com
```

**Security Notes**:
- Never commit these values to version control
- Use different keys for test and production
- Rotate keys periodically
- Restrict API key permissions in Razorpay dashboard
- Use webhook secret for webhook verification

---

## CONCLUSION

The Payment Processing feature provides a secure, reliable, and user-friendly payment system integrated with Razorpay for the PreciAgri agricultural e-commerce platform. It supports both traditional COD and modern online payment methods, ensuring broad accessibility while maintaining high security standards.

**Key Strengths**:
- Dual payment method support (COD + Online)
- Secure WebView-based payment integration for mobile app
- Comprehensive signature verification for security
- Automatic stock adjustment with transaction safety
- Real-time webhook processing for payment updates
- Integrated notification system for users and sellers
- Robust error handling and recovery mechanisms
- Performance optimizations for fast checkout

The system is designed with comprehensive error handling, security measures, and performance optimizations to ensure reliable payment processing. The WebView-based payment integration provides a seamless in-app experience while leveraging Razorpay's secure infrastructure and PCI DSS compliance.

The feature supports the multi-seller marketplace model with seller-specific stock management and notifications, ensuring all stakeholders are informed of payment status in real-time. The transaction-based stock adjustment prevents overselling and maintains inventory accuracy.

---

**Documentation Version**: 1.0  
**Last Updated**: November 2024  
**Feature Status**: Production Ready
