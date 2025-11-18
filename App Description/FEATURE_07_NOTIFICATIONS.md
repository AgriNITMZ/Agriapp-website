# Feature Description: Notifications

## Feature Overview
This feature provides a comprehensive in-app notification system that keeps users and sellers informed about important events such as order status changes, payment confirmations, and system updates. The system supports multiple notification types (order_placed, order_confirmed, order_shipped, order_delivered, order_cancelled, payment_success, payment_failed, promotion, system), automatic notification creation from various controllers (Order, Payment), read/unread status tracking, and notification management (mark as read, delete, clear all). The feature includes efficient database indexing for fast queries, order population for context, and helper functions for easy notification creation from any part of the application.

---

## Architecture Components

### Backend Components
1. **Models** (Data Layer)
   - Notification Model (`models/Notification.js`)

2. **Controllers** (Business Logic Layer)
   - Notification Controller (`controller/Notification.js`) - Main controller
   - NotificationController (`controller/NotificationController.js`) - Extended controller
   - Integration in Order Controller
   - Integration in Payment Controller

3. **Routes** (API Endpoints Layer)
   - Notification Routes (`routes/notification.js`)

4. **Helper Functions**
   - createNotification (used across controllers)
   - createPaymentNotification
   - createDeliveryNotification
   - createOrderStatusNotification

### Frontend Components (Mobile App)
1. **Navigation Integration**
   - Notification screen navigation
   - Badge count display (planned)

2. **Screens** (UI Layer)
   - Notification screen (to be implemented)
   - Notification list view
   - Notification detail view

---

## Detailed Component Analysis

### 1. DATABASE MODEL

#### 1.1 Notification Model (`agri_backend/models/Notification.js`)

**Purpose**: Stores all user notifications with type, status, and metadata

**Schema Fields**:

**userId** (ObjectId, required):
- Reference to User model
- Identifies notification recipient
- Indexed for fast user queries
- Used in all notification queries

**type** (String, required):
- Notification category/type
- Enum values:
  - `order_placed`: New order created
  - `order_confirmed`: Order confirmed by seller
  - `order_shipped`: Order shipped
  - `order_delivered`: Order delivered
  - `order_cancelled`: Order cancelled
  - `payment_success`: Payment successful
  - `payment_failed`: Payment failed
  - `promotion`: Promotional notification
  - `system`: System notification
- Used for filtering and categorization

**title** (String, required):
- Notification headline
- Trimmed automatically
- Displayed prominently in UI
- Short, descriptive text

**message** (String, required):
- Detailed notification content
- Trimmed automatically
- Main notification body
- Can include emojis and formatting

**isRead** (Boolean):
- Read/unread status
- Default: false (unread)
- Indexed for efficient queries
- Used for unread count and filtering

**orderId** (ObjectId, optional):
- Reference to Order model
- Links notification to specific order
- Populated in queries for context
- Null for non-order notifications

**actionUrl** (String, optional):
- Deep link or navigation path
- Used for notification tap action
- Example: '/product/profile/orders'
- Optional field

**metadata** (Mixed, optional):
- Additional data storage
- Flexible schema
- Can store any JSON data
- Default: empty object
- Examples:
  - Payment amount
  - Item count
  - Tracking number
  - Seller information

**timestamps** (Boolean):
- Automatic createdAt and updatedAt
- Managed by Mongoose
- Used for sorting (newest first)

---

**Indexes**:

**Single Field Indexes**:
- `userId`: Fast user-specific queries
- `isRead`: Fast unread filtering

**Compound Indexes**:
- `{ userId: 1, createdAt: -1 }`: User notifications sorted by date
- `{ userId: 1, isRead: 1 }`: User unread notifications

**Index Benefits**:
- Fast notification fetching
- Efficient unread count queries
- Optimized sorting
- Reduced query time

---

### 2. CONTROLLERS (Business Logic)

#### 2.1 Main Notification Controller (`agri_backend/controller/Notification.js`)

**Helper Function: `createNotification(userId, type, title, message, orderId, metadata)`**
- **Purpose**: Creates notification from any controller
- **Export**: Named export for use in other controllers
- **Authentication**: Not required (internal function)

**Parameters**:
- `userId` (String, required): Recipient user ID
- `type` (String, required): Notification type
- `title` (String, required): Notification title
- `message` (String, required): Notification message
- `orderId` (String, optional): Related order ID
- `metadata` (Object, optional): Additional data

**Processing Flow**:
1. **Create Notification**:
   - Build notification object
   - Call Notification.create()
   - Save to database
2. **Logging**:
   - Log success with notification ID
   - Log errors if creation fails
3. **Return**:
   - Return notification object on success
   - Return null on error

**Usage Example**:
```javascript
const { createNotification } = require('./Notification');

await createNotification(
  userId,
  'payment_success',
  'Payment Successful! 🎉',
  `Your payment of ₹${amount} was successful.`,
  orderId,
  { amount: 500, paymentId: 'pay_xxx' }
);
```

**Error Handling**:
- Try-catch block
- Console error logging
- Returns null on failure
- Non-blocking (doesn't throw)

---

**Function: `getNotifications(req, res)`**
- **Route**: GET `/api/v1/notifications`
- **Authentication**: Required
- **Purpose**: Fetches user's notifications with optional filtering

**Query Parameters**:
- `unreadOnly` (String, optional): 'true' to fetch only unread

**Processing Flow**:
1. **Extract User ID**:
   - Get userId from authenticated request
2. **Build Query**:
   - Base query: { userId }
   - If unreadOnly='true': Add { isRead: false }
3. **Fetch Notifications**:
   - Query Notification collection
   - Populate orderId with order details
   - Sort by createdAt descending
   - Limit to 50 notifications
4. **Response**:
   - Return notifications array

**Response**:
```json
{
  "success": true,
  "notifications": [
    {
      "_id": "notification_id",
      "userId": "user_id",
      "type": "payment_success",
      "title": "Payment Successful! 🎉",
      "message": "Your payment of ₹500 was successful.",
      "isRead": false,
      "orderId": {
        "_id": "order_id",
        "totalAmount": 500,
        "orderStatus": "Processing",
        "paymentStatus": "Completed",
        "items": [...],
        "orderNumber": "ORD-12345"
      },
      "metadata": {
        "amount": 500,
        "paymentId": "pay_xxx"
      },
      "createdAt": "2024-11-18T10:30:00.000Z"
    }
  ]
}
```

**Key Features**:
- Unread filtering
- Order population
- Sorted by date
- Limited results (50)

---

**Function: `getUnreadCount(req, res)`**
- **Route**: GET `/api/v1/notifications/unread-count`
- **Authentication**: Required
- **Purpose**: Returns count of unread notifications

**Processing Flow**:
1. **Extract User ID**:
   - Get userId from authenticated request
2. **Count Unread**:
   - Query: { userId, isRead: false }
   - Use countDocuments()
3. **Response**:
   - Return count

**Response**:
```json
{
  "success": true,
  "count": 5
}
```

**Use Cases**:
- Badge count on notification icon
- Unread indicator
- Dashboard statistics

---

**Function: `markAsRead(req, res)`**
- **Route**: PATCH `/api/v1/notifications/:notificationId/read`
- **Authentication**: Required
- **Purpose**: Marks single notification as read

**Parameters**:
- `notificationId` (URL param): Notification ID to mark

**Processing Flow**:
1. **Extract Data**:
   - Get userId from auth
   - Get notificationId from params
2. **Update Notification**:
   - Query: { _id: notificationId, userId }
   - Update: { isRead: true }
   - Return updated document
3. **Validation**:
   - Check notification exists
   - Return 404 if not found
4. **Response**:
   - Return updated notification

**Response**:
```json
{
  "success": true,
  "notification": {
    "_id": "notification_id",
    "isRead": true,
    ...
  }
}
```

**Security**:
- User can only mark their own notifications
- userId in query prevents unauthorized access

---

**Function: `markAllAsRead(req, res)`**
- **Route**: PATCH `/api/v1/notifications/mark-all-read`
- **Authentication**: Required
- **Purpose**: Marks all user's notifications as read

**Processing Flow**:
1. **Extract User ID**:
   - Get userId from authenticated request
2. **Update All**:
   - Query: { userId, isRead: false }
   - Update: { isRead: true }
   - Use updateMany()
3. **Response**:
   - Return success message

**Response**:
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

**Use Cases**:
- "Mark all as read" button
- Clear all unread indicators
- Bulk notification management

---

**Function: `deleteNotification(req, res)`**
- **Route**: DELETE `/api/v1/notifications/:notificationId`
- **Authentication**: Required
- **Purpose**: Deletes single notification

**Parameters**:
- `notificationId` (URL param): Notification ID to delete

**Processing Flow**:
1. **Extract Data**:
   - Get userId from auth
   - Get notificationId from params
2. **Delete Notification**:
   - Query: { _id: notificationId, userId }
   - Use findOneAndDelete()
3. **Validation**:
   - Check notification exists
   - Return 404 if not found
4. **Response**:
   - Return success message

**Response**:
```json
{
  "success": true,
  "message": "Notification deleted"
}
```

**Security**:
- User can only delete their own notifications
- userId in query prevents unauthorized deletion

---

**Function: `clearAllNotifications(req, res)`**
- **Route**: DELETE `/api/v1/notifications/clear-all`
- **Authentication**: Required
- **Purpose**: Deletes all user's notifications

**Processing Flow**:
1. **Extract User ID**:
   - Get userId from authenticated request
2. **Delete All**:
   - Query: { userId }
   - Use deleteMany()
3. **Response**:
   - Return success message

**Response**:
```json
{
  "success": true,
  "message": "All notifications cleared"
}
```

**Use Cases**:
- "Clear all" button
- Notification cleanup
- User preference

---

#### 2.2 Extended Notification Controller (`agri_backend/controller/NotificationController.js`)

**Note**: This appears to be an alternative/extended version with additional features

**Function: `createNotification(req, res)`**
- **Purpose**: API endpoint to create notification (admin/system use)
- **Authentication**: Required
- **Different from helper**: This is an HTTP endpoint

**Request Body**:
- `userId`: Recipient user ID
- `type`: Notification type
- `title`: Notification title
- `message`: Notification message
- `orderId`: Optional order ID
- `actionUrl`: Optional action URL
- `metadata`: Optional metadata

**Processing Flow**:
1. **Validate User**:
   - Check user exists in database
   - Return 404 if not found
2. **Create Notification**:
   - Build notification object
   - Save to database
3. **Response**:
   - Return created notification

**Use Cases**:
- Admin panel notification creation
- System-generated notifications
- Promotional notifications
- Manual notification sending

---

**Function: `getUserNotifications(req, res)`**
- **Purpose**: Advanced notification fetching with pagination
- **Authentication**: Required

**Query Parameters**:
- `page` (Number): Page number (default: 1)
- `limit` (Number): Items per page (default: 20)
- `type` (String): Filter by notification type
- `read` (String): Filter by read status ('true'/'false')

**Processing Flow**:
1. **Build Filter**:
   - Base: { userId }
   - Add type filter if provided
   - Add read filter if provided
2. **Fetch with Pagination**:
   - Calculate skip value
   - Apply limit
   - Sort by createdAt descending
   - Populate orderId
3. **Count Documents**:
   - Total notifications
   - Unread count
4. **Response**:
   - Notifications array
   - Pagination metadata

**Response**:
```json
{
  "success": true,
  "notifications": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalNotifications": 100,
    "unreadCount": 15
  }
}
```

**Key Features**:
- Pagination support
- Type filtering
- Read status filtering
- Unread count included
- Order population

---

**Helper Function: `createPaymentNotification(userId, orderId, amount)`**
- **Purpose**: Specialized payment notification creator
- **Internal use**: Called from Payment controller

**Processing Flow**:
1. **Build Notification**:
   - Type: 'payment'
   - Title: 'Payment Successful'
   - Message: Payment amount details
   - ActionUrl: Orders page
2. **Create**:
   - Save to database
3. **Error Handling**:
   - Catch and log errors
   - Non-blocking

---

**Helper Function: `createDeliveryNotification(userId, orderId, orderNumber)`**
- **Purpose**: Specialized delivery notification creator
- **Internal use**: Called from Order controller

**Processing Flow**:
1. **Build Notification**:
   - Type: 'delivery'
   - Title: 'Order Delivered Successfully'
   - Message: Order number and thank you
   - ActionUrl: Orders page
2. **Create**:
   - Save to database
3. **Error Handling**:
   - Catch and log errors
   - Non-blocking

---

**Helper Function: `createOrderStatusNotification(userId, orderId, orderNumber, status)`**
- **Purpose**: Dynamic order status notification creator
- **Internal use**: Called from Order controller

**Status Handling**:

**Confirmed**:
- Title: 'Order Confirmed'
- Message: Order being processed

**Shipped**:
- Title: 'Order Shipped'
- Message: Package on the way, track updates

**Delivered**:
- Title: 'Order Delivered'
- Message: Delivery confirmation, thank you

**Default**:
- Title: 'Order Update'
- Message: Generic status update

**Processing Flow**:
1. **Determine Message**:
   - Switch on status
   - Build appropriate title/message
2. **Create Notification**:
   - Type: 'order'
   - Save to database
3. **Error Handling**:
   - Catch and log errors
   - Non-blocking

---

### 3. NOTIFICATION INTEGRATION

#### 3.1 Order Controller Integration

**Location**: `agri_backend/controller/Order.js`

**Import**:
```javascript
const { createNotification } = require('./Notification');
```

**Order Placed (COD)**:
```javascript
await createNotification(
  userId,
  'order_placed',
  'Order Placed Successfully! 🎉',
  `Your order #${order._id.toString().slice(-8)} has been placed. Total: ₹${totalAmount}`,
  order._id,
  {
    orderNumber: order._id.toString().slice(-8),
    amount: totalAmount,
    itemCount: order.items.length
  }
);
```

**Seller Notification (New Order)**:
```javascript
await createNotification(
  sellerId,
  'order_placed',
  'New Order Received! 📦',
  `New order #${order._id.toString().slice(-8)} for ₹${sellerTotal}. ${sellerItems.length} items.`,
  order._id,
  {
    amount: sellerTotal,
    itemCount: sellerItems.length
  }
);
```

**Order Status Update**:
```javascript
await createNotification(
  order.userId,
  'order_status_updated',
  `Order ${orderStatus}`,
  `Your order #${order._id.toString().slice(-8)} is now ${orderStatus}.`,
  order._id,
  { newStatus: orderStatus }
);
```

**Order Cancelled**:
```javascript
await createNotification(
  order.userId,
  'order_cancelled',
  'Order Cancelled',
  `Your order #${order._id.toString().slice(-8)} has been cancelled.`,
  order._id,
  { reason: reason || 'User request' }
);
```

**Seller Notification (Order Cancelled)**:
```javascript
await createNotification(
  sellerId,
  'order_cancelled',
  'Order Cancelled',
  `Order #${order._id.toString().slice(-8)} (₹${sellerTotal}) has been cancelled.`,
  order._id,
  { amount: sellerTotal }
);
```

---

#### 3.2 Payment Controller Integration

**Location**: `agri_backend/controller/Payment.js`

**Import**:
```javascript
const { createNotification } = require('./Notification');
```

**Payment Success (User)**:
```javascript
await createNotification(
  order.userId,
  'payment_success',
  'Payment Successful! 🎉',
  `Your payment of ₹${order.totalAmount} was successful. Your order is being processed.`,
  order._id,
  {
    amount: order.totalAmount,
    paymentId: razorpay_payment_id
  }
);
```

**Payment Success (Seller)**:
```javascript
await createNotification(
  sellerId,
  'payment_success',
  'New Order - Payment Received! 💰',
  `Payment of ₹${sellerTotal} received for order #${order._id.toString().slice(-8)}. Start processing the order.`,
  order._id,
  {
    amount: sellerTotal,
    itemCount: sellerItems.length,
    paymentId: razorpay_payment_id
  }
);
```

**Payment Failed**:
```javascript
await createNotification(
  order.userId,
  'payment_failed',
  'Payment Failed ❌',
  `Your payment of ₹${order.totalAmount} was unsuccessful. Retry Now!`,
  order._id,
  {
    amount: order.totalAmount,
    paymentId: order.paymentId
  }
);
```

---

### 4. ROUTES

#### 4.1 Notification Routes (`agri_backend/routes/notification.js`)

**Route Configuration**:
```
GET    /api/v1/notifications                    - Get all notifications (auth)
GET    /api/v1/notifications/unread-count       - Get unread count (auth)
PATCH  /api/v1/notifications/:notificationId/read - Mark as read (auth)
PATCH  /api/v1/notifications/mark-all-read      - Mark all as read (auth)
DELETE /api/v1/notifications/:notificationId    - Delete notification (auth)
DELETE /api/v1/notifications/clear-all          - Clear all (auth)
```

**Middleware**:
- All routes require authentication (`auth` middleware)
- User ID extracted from JWT token
- Routes protected from unauthorized access

**Route Order**:
- Specific routes before parameterized routes
- `/unread-count` before `/:notificationId`
- `/mark-all-read` before `/:notificationId/read`
- `/clear-all` before `/:notificationId`

---

## DATA FLOW DIAGRAMS

### Create Notification Flow (Order Placed)
```
User (Mobile App)
    ↓ [Places order]
Order.createOrder()
    ↓ [Order created successfully]
    ↓ [Call createNotification()]
createNotification(userId, 'order_placed', title, message, orderId, metadata)
    ↓ [Build notification object]
Notification.create({
  userId,
  type: 'order_placed',
  title: 'Order Placed Successfully! 🎉',
  message: 'Your order #12345 has been placed...',
  orderId,
  metadata: { amount, itemCount }
})
    ↓ [Save to database]
Database
    ↓ [Notification saved]
Console Log
    ↓ ['✓ Notification created: notification_id']
Return notification object
    ↓ [Continue order processing]
Order Response
```

### Fetch Notifications Flow
```
User (Mobile App)
    ↓ [Opens notifications screen]
    ↓ [GET /notifications]
Notification.getNotifications()
    ↓ [Extract userId from auth token]
    ↓ [Build query: { userId }]
    ↓ [Check unreadOnly parameter]
if (unreadOnly === 'true')
    ↓ [Add to query: { isRead: false }]
Notification.find(query)
    ↓ [Populate orderId field]
    ↓ [Sort by createdAt: -1]
    ↓ [Limit to 50]
Database
    ↓ [Return notifications array]
Response to App
    ↓ [Display notifications list]
Show to User
```

### Mark as Read Flow
```
User (Mobile App)
    ↓ [Taps on notification]
    ↓ [PATCH /notifications/:notificationId/read]
Notification.markAsRead()
    ↓ [Extract userId from auth]
    ↓ [Extract notificationId from params]
Notification.findOneAndUpdate(
  { _id: notificationId, userId },
  { isRead: true },
  { new: true }
)
    ↓ [Update in database]
Database
    ↓ [Return updated notification]
if (notification)
    ↓ [Return success]
else
    ↓ [Return 404 error]
Response to App
    ↓ [Update UI - remove unread indicator]
Show Updated State
```

### Get Unread Count Flow
```
User (Mobile App)
    ↓ [App loads/refreshes]
    ↓ [GET /notifications/unread-count]
Notification.getUnreadCount()
    ↓ [Extract userId from auth]
Notification.countDocuments({
  userId,
  isRead: false
})
    ↓ [Count unread notifications]
Database
    ↓ [Return count]
Response to App
    ↓ [Update badge count]
Display Badge
    ↓ [Show number on notification icon]
```

### Mark All as Read Flow
```
User (Mobile App)
    ↓ [Taps "Mark all as read"]
    ↓ [PATCH /notifications/mark-all-read]
Notification.markAllAsRead()
    ↓ [Extract userId from auth]
Notification.updateMany(
  { userId, isRead: false },
  { isRead: true }
)
    ↓ [Update all unread notifications]
Database
    ↓ [Bulk update complete]
Response to App
    ↓ [Success message]
    ↓ [Refresh notification list]
    ↓ [Update badge count to 0]
Show Updated UI
```

### Delete Notification Flow
```
User (Mobile App)
    ↓ [Swipes to delete notification]
    ↓ [DELETE /notifications/:notificationId]
Notification.deleteNotification()
    ↓ [Extract userId from auth]
    ↓ [Extract notificationId from params]
Notification.findOneAndDelete({
  _id: notificationId,
  userId
})
    ↓ [Delete from database]
Database
    ↓ [Notification removed]
if (notification)
    ↓ [Return success]
else
    ↓ [Return 404 error]
Response to App
    ↓ [Remove from list]
    ↓ [Show success message]
Update UI
```

---

## KEY FEATURES & CAPABILITIES

### 1. Multiple Notification Types
- **Order Notifications**: placed, confirmed, shipped, delivered, cancelled
- **Payment Notifications**: success, failed
- **Promotional Notifications**: offers, discounts
- **System Notifications**: updates, announcements
- Extensible enum for new types

### 2. Automatic Notification Creation
- Triggered from Order controller
- Triggered from Payment controller
- Helper function for easy integration
- Non-blocking creation (doesn't fail parent operation)
- Consistent notification format

### 3. Read/Unread Tracking
- Boolean isRead field
- Default unread state
- Mark single as read
- Mark all as read
- Unread count API
- Indexed for performance

### 4. Order Context
- Link notifications to orders
- Populate order details
- Show order status
- Display order amount
- Track order items

### 5. Metadata Storage
- Flexible JSON storage
- Store payment IDs
- Store amounts
- Store item counts
- Store tracking numbers
- Extensible for future data

### 6. Notification Management
- Fetch all notifications
- Filter by read status
- Delete single notification
- Clear all notifications
- Pagination support (extended controller)
- Type filtering (extended controller)

### 7. User Isolation
- User-specific notifications
- Secure access control
- Cannot access other users' notifications
- userId in all queries
- JWT authentication required

### 8. Performance Optimization
- Database indexing
- Compound indexes
- Limited query results (50)
- Efficient sorting
- Optimized counting

### 9. Seller Notifications
- Separate notifications for sellers
- New order alerts
- Payment received alerts
- Order cancellation alerts
- Seller-specific amounts
- Item count tracking

### 10. Rich Notification Content
- Emoji support in titles
- Detailed messages
- Order numbers
- Amount formatting
- Action URLs for navigation
- Contextual information

---

## BUSINESS RULES

### Notification Creation
1. Notifications created automatically on events
2. User ID required for all notifications
3. Type must be from predefined enum
4. Title and message are required
5. Order ID optional (for order-related notifications)
6. Metadata optional (for additional context)
7. Creation failures logged but don't block operations

### Notification Access
1. Users can only access their own notifications
2. Authentication required for all operations
3. userId extracted from JWT token
4. No cross-user notification access
5. Sellers receive separate notifications

### Read Status
1. New notifications default to unread (isRead: false)
2. User can mark individual notifications as read
3. User can mark all notifications as read
4. Read status affects unread count
5. Read status used for filtering

### Notification Display
1. Sorted by creation date (newest first)
2. Limited to 50 notifications per request
3. Order details populated when available
4. Unread notifications highlighted
5. Pagination available (extended controller)

### Notification Deletion
1. Users can delete their own notifications
2. Users can clear all their notifications
3. Deletion is permanent
4. Cannot delete other users' notifications
5. Deleted notifications cannot be recovered

### Order Notifications
1. Created for both buyer and seller
2. Buyer gets order confirmation
3. Seller gets new order alert
4. Status updates sent to buyer
5. Cancellation notifies both parties
6. Different messages for buyer vs seller

### Payment Notifications
1. Success notification to buyer
2. Success notification to seller (with payment amount)
3. Failure notification to buyer only
4. Payment ID stored in metadata
5. Amount displayed in message

---

## SECURITY FEATURES

### 1. Authentication
- JWT authentication required for all routes
- User ID extracted from token
- No anonymous notification access
- Token validation on every request

### 2. Authorization
- Users can only access their own notifications
- userId in all database queries
- Prevents cross-user access
- Secure notification isolation

### 3. Input Validation
- Type enum validation
- Required field validation
- User existence validation (extended controller)
- Notification existence validation
- Parameter validation

### 4. Data Privacy
- No sensitive data in notifications
- Payment IDs stored (not card details)
- Order IDs for reference only
- User-specific data isolation
- Secure metadata storage

### 5. Error Handling
- Non-blocking notification creation
- Graceful error handling
- Error logging for debugging
- No sensitive data in error messages
- 404 for not found resources

---

## ERROR HANDLING

### Backend Errors

**Notification Creation Failures**:
- Logged to console
- Returns null (non-blocking)
- Parent operation continues
- No user-facing error
- Debugging information preserved

**Notification Not Found**:
- 404 status code
- "Notification not found" message
- Occurs on mark as read
- Occurs on delete
- User-friendly error

**User Not Found** (Extended Controller):
- 404 status code
- "User not found" message
- Validation before creation
- Prevents invalid notifications

**Database Errors**:
- 500 status code
- Generic error message
- Error logged to console
- No sensitive data exposed
- Graceful degradation

**Authentication Errors**:
- 401 status code
- "Unauthorized" message
- Missing or invalid token
- Handled by auth middleware

### Frontend Errors (Planned)

**Network Errors**:
- Retry mechanism
- Offline indicator
- Queue notifications
- Sync when online

**Loading States**:
- Skeleton screens
- Loading indicators
- Smooth transitions
- User feedback

**Empty States**:
- "No notifications" message
- Helpful illustrations
- Clear communication
- Encourage actions

---

## PERFORMANCE OPTIMIZATIONS

### 1. Database Indexing
- userId indexed for fast user queries
- isRead indexed for unread filtering
- Compound index (userId + createdAt) for sorted queries
- Compound index (userId + isRead) for unread queries
- Reduced query execution time

### 2. Query Optimization
- Limited results (50 notifications)
- Selective field population
- Efficient sorting at database level
- countDocuments for counts
- Optimized aggregation

### 3. Caching Opportunities
- Cache unread count
- Cache recent notifications
- Invalidate on new notification
- Reduce database load
- Faster response times

### 4. Pagination
- Limit results per page
- Skip calculation for pages
- Total count for UI
- Efficient data transfer
- Reduced memory usage

### 5. Non-Blocking Creation
- Async notification creation
- Doesn't block parent operations
- Error handling doesn't throw
- Improves response times
- Better user experience

---

## TESTING CONSIDERATIONS

### Unit Tests

**Notification Creation**:
- Test helper function
- Test with all parameters
- Test with optional parameters
- Test error handling
- Test return values

**Read Status Updates**:
- Test mark as read
- Test mark all as read
- Test unread count
- Test filtering by read status

**Notification Deletion**:
- Test single deletion
- Test clear all
- Test user isolation
- Test not found scenarios

**Query Building**:
- Test base query
- Test with filters
- Test with pagination
- Test sorting
- Test population

### Integration Tests

**Order Integration**:
- Test order placed notification
- Test order status update notification
- Test order cancellation notification
- Test seller notifications
- Test metadata storage

**Payment Integration**:
- Test payment success notification
- Test payment failure notification
- Test seller payment notification
- Test amount formatting
- Test payment ID storage

**API Endpoints**:
- Test GET /notifications
- Test GET /unread-count
- Test PATCH /mark-as-read
- Test DELETE /notification
- Test authentication

### E2E Tests

**Complete Notification Journey**:
- User places order
- Notification created
- User opens notifications
- Notification displayed
- User marks as read
- Unread count updates
- User deletes notification

**Multi-User Scenarios**:
- Buyer and seller notifications
- User isolation
- Concurrent notifications
- Read status independence

---

## FUTURE ENHANCEMENTS

1. **Push Notifications**: Firebase Cloud Messaging integration for real-time alerts

2. **Email Notifications**: Send email copies of important notifications

3. **SMS Notifications**: SMS alerts for critical events (order shipped, delivered)

4. **Notification Preferences**: User settings to control notification types

5. **Notification Grouping**: Group similar notifications (e.g., multiple orders)

6. **Rich Notifications**: Images, action buttons, expandable content

7. **Notification Scheduling**: Schedule notifications for future delivery

8. **Notification Templates**: Predefined templates for common notifications

9. **Notification Analytics**: Track open rates, click rates, engagement

10. **In-App Notification Center**: Dedicated notification screen with filters

11. **Notification Sounds**: Custom sounds for different notification types

12. **Notification Priority**: High/medium/low priority levels

13. **Notification Expiry**: Auto-delete old notifications after X days

14. **Notification Search**: Search within notifications

15. **Notification Categories**: Organize by category (orders, payments, promotions)

16. **Notification Actions**: Quick actions from notification (track order, retry payment)

17. **Notification Badges**: Visual badges for notification types

18. **Notification History**: Archive of all past notifications

19. **Notification Digest**: Daily/weekly summary emails

20. **Notification Localization**: Multi-language notification support

21. **Notification A/B Testing**: Test different notification messages

22. **Notification Delivery Status**: Track if notification was delivered/read

23. **Notification Retry**: Retry failed notification deliveries

24. **Notification Webhooks**: Webhook callbacks for notification events

25. **Notification API**: Public API for third-party integrations

26. **Notification Widgets**: Home screen widgets for quick access

27. **Notification Snooze**: Snooze notifications for later

28. **Notification Importance**: Mark notifications as important

29. **Notification Threads**: Thread related notifications together

30. **Notification Reactions**: Allow users to react to notifications

---

## FRONTEND IMPLEMENTATION (Planned)

### Notification Screen Components

**NotificationList Component**:
```javascript
// Planned implementation
const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);
  
  const fetchNotifications = async () => {
    const response = await axios.get('/notifications');
    setNotifications(response.data.notifications);
    setLoading(false);
  };
  
  const fetchUnreadCount = async () => {
    const response = await axios.get('/notifications/unread-count');
    setUnreadCount(response.data.count);
  };
  
  const markAsRead = async (notificationId) => {
    await axios.patch(`/notifications/${notificationId}/read`);
    fetchNotifications();
    fetchUnreadCount();
  };
  
  return (
    <View>
      {notifications.map(notification => (
        <NotificationCard 
          key={notification._id}
          notification={notification}
          onPress={() => markAsRead(notification._id)}
        />
      ))}
    </View>
  );
};
```

**NotificationCard Component**:
```javascript
// Planned implementation
const NotificationCard = ({ notification, onPress }) => {
  const getIcon = (type) => {
    switch(type) {
      case 'order_placed': return '📦';
      case 'order_shipped': return '🚚';
      case 'order_delivered': return '✅';
      case 'payment_success': return '💰';
      case 'payment_failed': return '❌';
      default: return '🔔';
    }
  };
  
  return (
    <TouchableOpacity 
      style={[
        styles.card,
        !notification.isRead && styles.unread
      ]}
      onPress={onPress}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{getIcon(notification.type)}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{notification.title}</Text>
        <Text style={styles.message}>{notification.message}</Text>
        <Text style={styles.time}>
          {formatTimeAgo(notification.createdAt)}
        </Text>
      </View>
      {!notification.isRead && (
        <View style={styles.unreadDot} />
      )}
    </TouchableOpacity>
  );
};
```

**Notification Badge**:
```javascript
// Planned implementation
const NotificationBadge = () => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);
  
  const fetchUnreadCount = async () => {
    const response = await axios.get('/notifications/unread-count');
    setCount(response.data.count);
  };
  
  return (
    <View style={styles.badgeContainer}>
      <Icon name="bell" size={24} />
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {count > 99 ? '99+' : count}
          </Text>
        </View>
      )}
    </View>
  );
};
```

---

## API ENDPOINTS SUMMARY

### Get Notifications
```
GET /api/v1/notifications
Authentication: Required
Query: {
  unreadOnly: 'true' | 'false' (optional)
}
Response: {
  success: Boolean,
  notifications: [NotificationObject]
}
```

### Get Unread Count
```
GET /api/v1/notifications/unread-count
Authentication: Required
Response: {
  success: Boolean,
  count: Number
}
```

### Mark as Read
```
PATCH /api/v1/notifications/:notificationId/read
Authentication: Required
Response: {
  success: Boolean,
  notification: NotificationObject
}
```

### Mark All as Read
```
PATCH /api/v1/notifications/mark-all-read
Authentication: Required
Response: {
  success: Boolean,
  message: String
}
```

### Delete Notification
```
DELETE /api/v1/notifications/:notificationId
Authentication: Required
Response: {
  success: Boolean,
  message: String
}
```

### Clear All Notifications
```
DELETE /api/v1/notifications/clear-all
Authentication: Required
Response: {
  success: Boolean,
  message: String
}
```

---

## DATABASE SCHEMA SUMMARY

### Notification Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required, indexed),
  type: String (enum, required),
  title: String (required, trimmed),
  message: String (required, trimmed),
  isRead: Boolean (default: false, indexed),
  orderId: ObjectId (ref: Order, optional),
  actionUrl: String (optional),
  metadata: Mixed (default: {}),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

// Indexes
{ userId: 1, createdAt: -1 }
{ userId: 1, isRead: 1 }
```

---

## NOTIFICATION TYPES REFERENCE

### Order Notifications
- **order_placed**: Order successfully created
- **order_confirmed**: Seller confirmed order
- **order_shipped**: Order dispatched for delivery
- **order_delivered**: Order delivered to customer
- **order_cancelled**: Order cancelled by user/seller

### Payment Notifications
- **payment_success**: Payment processed successfully
- **payment_failed**: Payment processing failed

### System Notifications
- **promotion**: Promotional offers and discounts
- **system**: System updates and announcements

---

## HELPER FUNCTIONS SUMMARY

### createNotification
```javascript
createNotification(userId, type, title, message, orderId, metadata)
// Returns: notification object or null
// Non-blocking, logs errors
```

### createPaymentNotification
```javascript
createPaymentNotification(userId, orderId, amount)
// Specialized for payment success
// Fixed title and message format
```

### createDeliveryNotification
```javascript
createDeliveryNotification(userId, orderId, orderNumber)
// Specialized for delivery confirmation
// Fixed title and message format
```

### createOrderStatusNotification
```javascript
createOrderStatusNotification(userId, orderId, orderNumber, status)
// Dynamic based on status
// Handles: confirmed, shipped, delivered
```

---

## INTEGRATION EXAMPLES

### Order Controller Integration
```javascript
// After order creation
const { createNotification } = require('./Notification');

await createNotification(
  userId,
  'order_placed',
  'Order Placed Successfully! 🎉',
  `Your order #${orderNumber} has been placed.`,
  order._id,
  { amount: totalAmount, itemCount: items.length }
);
```

### Payment Controller Integration
```javascript
// After payment verification
await createNotification(
  order.userId,
  'payment_success',
  'Payment Successful! 🎉',
  `Your payment of ₹${amount} was successful.`,
  order._id,
  { amount, paymentId }
);
```

### Custom Notification
```javascript
// From any controller
await createNotification(
  userId,
  'promotion',
  'Special Offer! 🎁',
  'Get 20% off on all products this weekend!',
  null,
  { discount: 20, validUntil: '2024-11-20' }
);
```

---

## STYLING GUIDELINES (Planned)

### Color Scheme
- Unread Background: #E3F2FD (Light Blue)
- Read Background: #FFFFFF (White)
- Primary: #4CAF50 (Green)
- Text: #333333 (Dark Gray)
- Secondary Text: #777777 (Medium Gray)
- Border: #E0E0E0 (Light Gray)

### Typography
- Title: 16px, Bold
- Message: 14px, Regular
- Time: 12px, Regular
- Badge: 10px, Bold

### Spacing
- Card Padding: 16px
- Card Margin: 8px
- Icon Size: 40px
- Badge Size: 20px

### Icons
- Order: 📦
- Shipped: 🚚
- Delivered: ✅
- Payment Success: 💰
- Payment Failed: ❌
- Promotion: 🎁
- System: 🔔

---

## CONCLUSION

The Notifications feature provides a comprehensive system for keeping users and sellers informed about important events in the application. It supports multiple notification types, automatic creation from various controllers, read/unread tracking, and efficient notification management. The system is designed with performance optimizations including database indexing, limited query results, and non-blocking notification creation.

**Key Strengths**:
- Automatic notification creation on events
- Multiple notification types for different scenarios
- Read/unread status tracking
- Order context with population
- Flexible metadata storage
- User isolation and security
- Seller-specific notifications
- Non-blocking creation (doesn't fail parent operations)
- Efficient database indexing
- Rich notification content with emojis

The system integrates seamlessly with Order and Payment controllers, creating notifications automatically when relevant events occur. The helper function approach makes it easy to add notifications to any part of the application. The feature supports both buyer and seller notifications with appropriate messaging for each role.

**Current Limitations**:
- No push notification support (in-app only)
- No email/SMS notifications
- No notification preferences
- No notification grouping
- Frontend implementation pending
- No notification scheduling
- No rich media support

These limitations present opportunities for future enhancements that would significantly improve the notification system's functionality and user engagement. The planned push notification integration would enable real-time alerts even when the app is closed, greatly enhancing the user experience.

---

**Documentation Version**: 1.0  
**Last Updated**: November 2024  
**Feature Status**: Backend Complete, Frontend Pending
