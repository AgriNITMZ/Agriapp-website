# Feature Description: Shopping Cart & Wishlist

## Feature Overview
This feature provides a comprehensive shopping cart and wishlist management system with real-time synchronization between frontend and backend, persistent storage using AsyncStorage, multi-seller support, size-based product variants, quantity management, price calculations, and cart segregation by category. The system supports both authenticated and guest user experiences with seamless data migration upon login.

---

## Architecture Components

### Backend Components
1. **Models** (Data Layer)
   - Cart Item
   - Wishlist

2. **Controllers** (Business Logic Layer)
   - Add To Cart Controller
   - Wishlist Controller
   - Cart Service (Segregation)

3. **Routes** (API Endpoints Layer)
   - Product Routes (Cart & Wishlist endpoints)

### Frontend Components (Mobile App)
1. **Screens** (UI Layer)
   - Cart Page
   - Wishlist Screen

2. **Context** (State Management)
   - Cart Context
   - Wishlist Context

3. **Components** (Reusable UI)
   - Product Card Wishlist
   - Quantity Selector

---

## Detailed Component Analysis

### 1. DATABASE MODELS

#### 1.1 Cart Item Model (`agri_backend/models/CartItem.js`)
**Purpose**: Stores user's shopping cart with items and pricing

**Schema Fields**:
- `userId` (ObjectId, ref: 'User', required): Cart owner
- `items` (Array): Cart items with nested structure:
  - `product` (ObjectId, ref: 'Product', required): Product reference
  - `quantity` (Number, required, min: 1, default: 1): Item quantity
  - `selectedsize` (String, required): Selected size variant
  - `selectedPrice` (Number, required, default: 0): Original price
  - `selectedDiscountedPrice` (Number, required, default: 0): Discounted price
  - `sellerId` (ObjectId, ref: 'User', required): Seller reference
- `totalPrice` (Number, required, default: 0): Total original price
- `totalDiscountedPrice` (Number, required, default: 0): Total after discounts
- `updatedAt` (Date, default: Date.now): Last update timestamp

**Pre-save Middleware**:
- **Purpose**: Automatically calculates totals before saving
- **Processing**:
  1. Initialize total and totalDiscountedPrice to 0
  2. Iterate through all items in cart
  3. For each item:
     - Add (selectedDiscountedPrice × quantity) to totalDiscountedPrice
     - Add (selectedPrice × quantity) to total
  4. Set cart.totalPrice and cart.totalDiscountedPrice
  5. Update cart.updatedAt to current time
  6. Call next()

**Key Features**:
- Automatic price calculation
- Multi-seller support (each item has sellerId)
- Size-based variants
- Timestamp tracking


#### 1.2 Wishlist Model (`agri_backend/models/WishList.js`)
**Purpose**: Stores user's saved products for later

**Schema Fields**:
- `userId` (ObjectId, ref: 'User', required): Wishlist owner
- `items` (Array): Wishlist items:
  - `productId` (ObjectId, ref: 'Product', required): Product reference
  - `addedAt` (Date, default: Date.now): When product was added

**Key Features**:
- Simple product reference storage
- Timestamp for each addition
- No quantity or variant tracking (just product IDs)

---

### 2. CONTROLLERS (Business Logic)

#### 2.1 Add To Cart Controller (`agri_backend/controller/AddToCart.js`)

**Function: `addToProductToCart(req, res)`** (Legacy - Web)
- **Route**: POST `/api/v1/products/addtocart`
- **Authentication**: Required
- **Purpose**: Adds product to cart (web version)

**Request Body**:
- `productId` (String, required)
- `quantity` (Number, required)
- `selectedsize` (String, required)
- `selectedDiscountedPrice` (Number, required)
- `selectedPrice` (Number, required)
- `sellerId` (String, required)

**Processing Flow**:
1. **Validation**:
   - Check all required fields present
   - Find product by ID
   - Verify seller exists for this product
2. **Find or Create Cart**:
   - Find cart by userId
   - If not exists: Create new cart
3. **Check for Existing Item**:
   - Search for item with same: productId + selectedsize + sellerId
   - If found:
     - Increment quantity
     - Check against available stock
     - If exceeds stock: Set to max and return error
   - If not found:
     - Add as new item to cart
4. **Save Cart**:
   - Pre-save hook calculates totals
5. **Populate and Return**:
   - Populate product details (name, images)
   - Return cart with populated data

**Response**:
```json
{
  "message": "Item added/updated in cart successfully.",
  "cart": { /* populated cart */ }
}
```

**Error Handling**:
- 400: Missing fields, exceeds stock
- 404: Product not found, seller not found
- 500: Internal server error

---

**Function: `addProductToCartApp(req, res)`** (Mobile App)
- **Route**: POST `/api/v1/products/addtocartapp`
- **Authentication**: Required (User role)
- **Purpose**: Adds/updates product in cart (mobile version)

**Request Body**:
- `productId` (String, required)
- `quantity` (Number, required)
- `selectedsize` (String, required)
- `selectedDiscountedPrice` (Number, required)
- `selectedPrice` (Number, required)
- `sellerId` (String, required)

**Processing Flow**:
1. **Validation**:
   - Check required fields
   - Find product by ID
2. **Find or Create Cart**:
   - Find cart by userId
3. **Update or Add Item**:
   - Search for existing item (productId + size + sellerId)
   - If exists:
     - Update quantity (replace, not increment)
     - Update prices
   - If not exists:
     - Add new item to cart
4. **Save Cart**:
   - Pre-save hook calculates totals
5. **Format Response**:
   - Build formatted cart object
   - For each item:
     - Fetch product details (name, images)
     - Build item object with all details
   - Return formatted cart

**Response**:
```json
{
  "message": "Item added/updated in cart successfully.",
  "cart": {
    "_id": "...",
    "userId": "...",
    "totalPrice": 1500,
    "totalDiscountedPrice": 1200,
    "items": [
      {
        "_id": "...",
        "productId": "...",
        "productName": "Product Name",
        "productImage": "https://...",
        "quantity": 2,
        "selectedsize": "1kg",
        "selectedPrice": 500,
        "selectedDiscountedPrice": 400,
        "sellerId": "..."
      }
    ]
  }
}
```

**Error Handling**:
- 400: Missing fields
- 404: Product not found
- 500: Internal server error

**Key Differences from Web Version**:
- Replaces quantity instead of incrementing
- Returns formatted response with product details
- No stock validation (handled on frontend)

---

**Function: `getCartItems(req, res)`** (Legacy - Web)
- **Route**: GET `/api/v1/products/cartitems`
- **Authentication**: Required
- **Purpose**: Gets cart items (web version)

**Processing**:
1. Find cart by userId
2. Populate product details
3. Return cart

**Error Handling**:
- 404: Cart not found

---

**Function: `getCartItemsApp(req, res)`** (Mobile App)
- **Route**: GET `/api/v1/products/cartitemsapp`
- **Authentication**: Required (User role)
- **Purpose**: Gets cart items (mobile version)

**Processing Flow**:
1. Find cart by userId
2. **If Cart Not Found**:
   - Return empty cart structure (not 404)
   - Empty cart object with 0 totals
3. **Format Response**:
   - Build formatted cart
   - For each item:
     - Fetch product details
     - Build item object
   - Return formatted cart

**Response** (Empty Cart):
```json
{
  "message": "Cart is empty",
  "cart": {
    "_id": null,
    "userId": "...",
    "totalPrice": 0,
    "totalDiscountedPrice": 0,
    "items": []
  }
}
```

**Response** (With Items):
```json
{
  "message": "Cart retrieved successfully.",
  "cart": { /* formatted cart */ }
}
```

**Key Features**:
- Returns empty cart instead of 404
- Formatted response with product details
- Consistent structure for frontend

---

**Function: `removeCartItem(req, res)`**
- **Route**: DELETE `/api/v1/products/removeitem/:id`
- **Authentication**: Required
- **Purpose**: Removes item from cart

**Parameters**:
- `id` (URL param): Cart item ID

**Processing Flow**:
1. **Validation**:
   - Validate itemId is valid MongoDB ObjectId
2. Find cart by userId
3. **Find Item**:
   - Search for item by _id in cart.items
   - If not found: Return 404
4. **Remove Item**:
   - Splice item from array
5. **Save Cart**:
   - Pre-save hook recalculates totals
6. Return updated cart

**Response**:
```json
{
  "message": "Item removed from cart successfully.",
  "cart": { /* updated cart */ }
}
```

**Error Handling**:
- 400: Invalid item ID
- 404: Cart not found, item not found
- 500: Internal server error

---

**Function: `clearCart(req, res)`**
- **Route**: DELETE `/api/v1/products/clearcart`
- **Authentication**: Required (User role)
- **Purpose**: Clears all items from cart

**Processing Flow**:
1. Find cart by userId
2. If not found: Return 404
3. **Clear Cart**:
   - Set items to empty array
4. **Save Cart**:
   - Pre-save hook sets totals to 0
5. Return success with empty cart

**Response**:
```json
{
  "message": "Cart cleared successfully",
  "cart": {
    "_id": "...",
    "userId": "...",
    "totalPrice": 0,
    "totalDiscountedPrice": 0,
    "items": []
  }
}
```

**Error Handling**:
- 404: Cart not found
- 500: Internal server error

---

#### 2.2 Wishlist Controller (`agri_backend/controller/WishList.js`)

**Function: `addToWishList(req, res)`**
- **Route**: POST `/api/v1/products/addwishlist`
- **Authentication**: Required
- **Purpose**: Adds product to wishlist

**Request Body**:
- `productId` (String, required)

**Processing Flow**:
1. Extract userId from auth
2. Find wishlist by userId
3. **If Wishlist Not Found**:
   - Create new wishlist with empty items
4. **Check if Product Exists**:
   - Search items for productId
   - If exists: Do nothing (no duplicates)
5. **Add Product**:
   - Push productId to items array
   - addedAt auto-set by schema
6. Save wishlist
7. Return wishlist

**Response**: Wishlist object

**Error Handling**:
- 500: Internal server error

**Key Features**:
- Prevents duplicates
- Auto-creates wishlist if needed
- Timestamp tracking

---

**Function: `getWishList(req, res)`**
- **Route**: GET `/api/v1/products/wishlistid`
- **Authentication**: Required
- **Purpose**: Gets wishlist product IDs only

**Processing Flow**:
1. Find wishlist by userId
2. Populate items (select only _id)
3. Extract product IDs from items
4. Return array of product IDs

**Response**:
```json
["productId1", "productId2", "productId3"]
```

**Error Handling**:
- 500: Internal server error

**Key Features**:
- Returns only IDs (minimal data)
- Used for quick wishlist status checks

---

**Function: `getWishlistProducts(req, res)`**
- **Route**: GET `/api/v1/products/getdetailswishlist`
- **Authentication**: Required (User role)
- **Purpose**: Gets full product details for wishlist

**Processing Flow**:
1. Find wishlist by userId
2. If empty: Return empty array
3. Extract product IDs
4. Find products with IDs in array
5. Return products array

**Response**:
```json
{
  "products": [ /* full product objects */ ]
}
```

**Error Handling**:
- 500: Internal server error

---

**Function: `getWishlistProductsMinimal(req, res)`**
- **Route**: GET `/api/v1/products/getminimalwishlist`
- **Authentication**: Required (User role)
- **Purpose**: Gets minimal product details for wishlist

**Processing Flow**:
1. Find wishlist by userId
2. If empty: Return empty products array
3. Extract product IDs
4. **Aggregation Pipeline**:
   - Match products by IDs
   - Project only required fields:
     - _id
     - name
     - First price_size entry
     - First image
     - avgRating
5. Return minimal products array

**Response**:
```json
{
  "products": [
    {
      "_id": "...",
      "name": "Product Name",
      "price_size": { "price": 500, "discountedPrice": 400, "size": "1kg" },
      "images": "https://...",
      "avgRating": 4.5
    }
  ]
}
```

**Error Handling**:
- 500: Internal server error

**Key Features**:
- Optimized for list display
- Minimal data transfer
- Aggregation for performance

---

**Function: `removeFromWishlist(req, res)`**
- **Route**: POST `/api/v1/products/removewishlist`
- **Authentication**: Required
- **Purpose**: Removes product from wishlist

**Request Body**:
- `productId` (String, required)

**Processing Flow**:
1. Find wishlist by userId
2. If not found: Throw error
3. **Filter Items**:
   - Remove item with matching productId
4. Save wishlist
5. Return updated wishlist

**Response**: Updated wishlist object

**Error Handling**:
- 500: Internal server error (wishlist not found)

---

#### 2.3 Cart Service (`agri_backend/controller/cartService.js`)

**Function: `segregateProducts(items)`**
- **Purpose**: Groups cart items by category
- **Parameters**: items array (cart items)

**Processing Flow**:
1. Initialize grouped object:
   - seeds: []
   - pesticides: []
   - ppe: []
   - others: []
2. **Iterate Through Items**:
   - Get category (lowercase)
   - If contains "seed": Add to seeds
   - Else if contains "pesticide": Add to pesticides
   - Else if contains "ppe": Add to ppe
   - Else: Add to others
3. Return grouped object

**Response**:
```json
{
  "seeds": [ /* seed products */ ],
  "pesticides": [ /* pesticide products */ ],
  "ppe": [ /* PPE products */ ],
  "others": [ /* other products */ ]
}
```

**Usage**: Used by AI chatbot for cart organization

---

### 3. ROUTES

**Cart Routes** (in `/api/v1/products`):
```
POST   /addtocart              - Add to cart (web) (auth)
POST   /addtocartapp           - Add to cart (app) (auth, user)
GET    /cartitems              - Get cart (web) (auth)
GET    /cartitemsapp           - Get cart (app) (auth, user)
DELETE /removeitem/:id         - Remove item (auth)
DELETE /clearcart              - Clear cart (auth, user)
```

**Wishlist Routes** (in `/api/v1/products`):
```
POST   /addwishlist            - Add to wishlist (auth)
GET    /getdetailswishlist     - Get full wishlist (auth, user)
GET    /getminimalwishlist     - Get minimal wishlist (auth, user)
POST   /removewishlist         - Remove from wishlist (auth)
GET    /wishlistid             - Get wishlist IDs (auth)
```

---


## FRONTEND IMPLEMENTATION (Mobile App)

### 4. CONTEXT PROVIDERS

#### 4.1 Cart Context (`agri-app/src/context/CartContext.js`)

**Purpose**: Global cart state management with API synchronization

**State**:
- `cart`: Cart object with items and totals
- `isAuthenticated`: Authentication status
- `hasCheckedAuth`: Auth check completion flag

**useEffect Hook: Check Authentication**
**Trigger**: Component mount

**Processing**:
1. Get user from AsyncStorage
2. Check if user has token
3. Set isAuthenticated
4. Set hasCheckedAuth to true

**useEffect Hook: Load Cart**
**Trigger**: When hasCheckedAuth or isAuthenticated changes

**Processing**:
1. Wait for auth check completion
2. **If Not Authenticated**:
   - Load cart from AsyncStorage only
   - Set cart state
3. **If Authenticated**:
   - GET `/products/cartitemsapp`
   - Set cart from API response
   - Save to AsyncStorage
   - On error: Load from AsyncStorage

**useEffect Hook: Save Cart**
**Trigger**: When cart changes

**Processing**:
- Save cart to AsyncStorage (if auth checked)

**Function: `refreshAuthStatus()`**
- **Purpose**: Updates authentication status
- **Processing**:
  1. Get user from AsyncStorage
  2. Check token exists
  3. Update isAuthenticated
  4. If not authenticated: Clear cart
  5. If authenticated: Fetch cart from API

**Function: `addToCart(product, quantity, selectedSize, selectedSeller)`**
- **Purpose**: Adds product to cart

**Parameters**:
- `product`: Product object
- `quantity`: Number of items
- `selectedSize`: Size index
- `selectedSeller`: Seller object

**Processing Flow**:
1. **Check Authentication**:
   - If not authenticated: Show login toast and return
2. **Extract Data**:
   - Get price_size from seller or product
   - Validate seller exists
   - Validate size exists
   - Get selected price_size details
3. **API Call**:
   - POST `/products/addtocartapp` with:
     - productId
     - quantity
     - selectedsize (size string)
     - selectedPrice
     - selectedDiscountedPrice
     - sellerId
4. **Update State**:
   - Set cart from response
   - Save to AsyncStorage
   - Show success toast
5. **Error Handling**:
   - Show error toast

**Function: `updateQuantity(item, newQuantity)`**
- **Purpose**: Updates item quantity

**Parameters**:
- `item`: Cart item object
- `newQuantity`: New quantity value

**Processing Flow**:
1. Check authentication
2. POST `/products/addtocartapp` with updated quantity
3. Update cart state
4. Save to AsyncStorage
5. Show success toast

**Function: `removeFromCart(itemId)`**
- **Purpose**: Removes item from cart

**Parameters**:
- `itemId`: Cart item ID

**Processing Flow**:
1. Check authentication
2. DELETE `/products/removeitem/:itemId`
3. **Update Local State**:
   - Filter out removed item
   - Recalculate totals
   - Update cart state
   - Save to AsyncStorage
4. Show success toast

**Function: `clearCart()`**
- **Purpose**: Clears entire cart

**Processing Flow**:
1. If authenticated: DELETE `/products/clearcart`
2. Reset cart to empty state
3. Remove from AsyncStorage
4. Show success toast (on error)

**Function: `isProductInCart(productId)`**
- **Purpose**: Checks if product in cart
- **Returns**: Boolean

**Function: `cartSize()`**
- **Purpose**: Gets cart item count
- **Returns**: Number of items

**Context Value**:
```javascript
{
  cart,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  cartSize,
  isProductInCart,
  refreshAuthStatus,
  isAuthenticated
}
```

**Key Features**:
- Authentication-aware loading
- AsyncStorage persistence
- API synchronization
- Optimistic updates
- Toast notifications
- Error handling

---

#### 4.2 Wishlist Context (`agri-app/src/context/WishlistContext.js`)

**Purpose**: Global wishlist state management with API synchronization

**State**:
- `wishlist`: Set of product IDs
- `isAuthenticated`: Authentication status
- `hasCheckedAuth`: Auth check completion flag

**useEffect Hook: Check Authentication**
**Trigger**: Component mount

**Processing**:
1. Get user from AsyncStorage
2. Check token exists
3. Set isAuthenticated
4. Set hasCheckedAuth to true

**useEffect Hook: Load Wishlist**
**Trigger**: When hasCheckedAuth or isAuthenticated changes

**Processing**:
1. Wait for auth check
2. **If Not Authenticated**:
   - Load from AsyncStorage only
   - Convert to Set
3. **If Authenticated**:
   - GET `/products/wishlistid`
   - Convert array to Set
   - On error: Load from AsyncStorage

**useEffect Hook: Save Wishlist**
**Trigger**: When wishlist changes

**Processing**:
- Convert Set to array
- Save to AsyncStorage

**Function: `refreshAuthStatus()`**
- **Purpose**: Updates authentication status
- **Processing**:
  1. Get user from AsyncStorage
  2. Check token
  3. Update isAuthenticated
  4. If not authenticated: Clear wishlist

**Function: `toggleWishlist(productId)`**
- **Purpose**: Adds or removes product from wishlist

**Parameters**:
- `productId`: Product ID

**Processing Flow**:
1. **Check Authentication**:
   - If not authenticated: Show login toast and return
2. **Create New Set**:
   - Copy current wishlist
3. **Check if Wishlisted**:
   - Check if productId in set
4. **If Wishlisted**:
   - POST `/products/removewishlist` with productId
   - Delete from set
   - Show "Removed" toast
5. **If Not Wishlisted**:
   - POST `/products/addwishlist` with productId
   - Add to set
   - Show "Added" toast with heart emoji
6. **Update State**:
   - Set wishlist
   - Save to AsyncStorage
7. **Error Handling**:
   - Show error toast

**Context Value**:
```javascript
{
  wishlist,
  toggleWishlist,
  refreshAuthStatus,
  isAuthenticated
}
```

**Key Features**:
- Set data structure for O(1) lookups
- Authentication-aware loading
- AsyncStorage persistence
- API synchronization
- Toast notifications
- Toggle functionality

---

### 5. SCREENS

#### 5.1 Cart Page (`agri-app/src/screens/Products/CartPage.js`)

**Purpose**: Displays shopping cart with checkout options

**Context Usage**:
- `CartContext`: cart, removeFromCart, updateQuantity, clearCart

**Constants**:
- `SHIPPING_CHARGE`: 40 (not currently used)
- `FREE_SHIPPING_THRESHOLD`: 0

**useMemo Hook: Price Details**
**Dependencies**: cart.totalDiscountedPrice, cart.totalPrice

**Calculations**:
- `isFreeShipping`: Check if above threshold
- `finalShippingCharge`: 0 if free, else SHIPPING_CHARGE
- `finalAmount`: totalDiscountedPrice + shipping
- `totalDiscount`: totalPrice - totalDiscountedPrice

**Function: `handleQuantityUpdate(item, newQuantity)`**
- **Debounced**: 300ms delay
- **Purpose**: Updates quantity with debouncing
- **Processing**:
  1. Validate newQuantity >= 1
  2. Call updateQuantity from context
  3. On error: Show alert

**Function: `handleRemoveItem(itemId)`**
- **Purpose**: Removes item with confirmation

**Processing**:
1. Show confirmation alert
2. On confirm:
   - Call removeFromCart
   - On error: Show alert

**Function: `handleClearCart()`**
- **Purpose**: Clears cart with confirmation

**Processing**:
1. Check cart not empty
2. Show confirmation alert
3. On confirm:
   - Call clearCart
   - On error: Show alert

**Function: `renderItem({ item })`**
- **Purpose**: Renders cart item

**UI Components**:
- Product image
- Product name
- Size text
- Price (with strikethrough for original)
- Quantity controls:
  - Minus button (disabled if quantity = 1)
  - Quantity display
  - Plus button
  - Remove button

**Main UI Sections**:

1. **CustomTopBar**: "My Cart" title

2. **Empty State** (if no items):
   - "Your cart is empty" message
   - Continue Shopping button → HomePage

3. **Cart Items** (if has items):
   - **Header**:
     - Savings text (if discount > 0)
     - Clear Cart button
   - **FlatList**:
     - Cart items
     - Vertical scrolling

4. **Summary Container** (if has items):
   - **Price Rows**:
     - Subtotal
     - Discount (if > 0, green)
     - Shipping (commented out)
   - **Divider**
   - **Total Row**:
     - Total Amount (bold, large)
   - **Checkout Button**:
     - "Proceed to Checkout"
     - Navigate to SelectAddress with cart

**Styling**:
- Card-based item layout
- Green theme for actions
- Red for remove/clear
- Fixed summary at bottom
- Responsive layout

**Key Features**:
- Debounced quantity updates
- Confirmation dialogs
- Price breakdown
- Savings display
- Empty state handling
- Responsive design

---

#### 5.2 Wishlist Screen (`agri-app/src/screens/Products/WishlistScreen.js`)

**Purpose**: Displays user's saved products

**State**:
- `wishlistProducts`: Array of product objects
- `loading`: Loading state
- `error`: Error message

**Context Usage**:
- `WishlistContext`: wishlist, toggleWishlist

**Function: `fetchWishlistProducts()`**
- **Purpose**: Fetches wishlist products from API

**Processing**:
1. Set loading true
2. GET `/products/getminimalwishlist`
3. Set wishlistProducts from response
4. On error: Set error message
5. Set loading false

**useEffect Hook: Fetch Products**
**Trigger**: When wishlist changes
**Processing**: Call fetchWishlistProducts()

**Function: `removeFromWishlist(productId)`**
- **Purpose**: Removes product from wishlist

**Processing**:
1. Call toggleWishlist from context
2. Update local state (filter out product)

**Component: `MemoizedProductCard`**
- **Purpose**: Optimized product card rendering
- **Memoization**: Prevents unnecessary re-renders
- **OnPress**: Navigate to ProductDetail

**UI States**:

1. **Loading State**:
   - ActivityIndicator (green)
   - "Loading wishlist..." text

2. **Error State**:
   - Error message display

3. **Empty State**:
   - "Your wishlist is empty." message

4. **Products Grid**:
   - FlatList with 2 columns
   - ProductCardWishlist components
   - OnPress: Navigate to product detail
   - OnRemove: removeFromWishlist callback

**Styling**:
- 2-column grid layout
- Centered states
- Light background
- Padding around items

**Key Features**:
- Memoized components
- Loading states
- Error handling
- Empty state
- Grid layout
- Remove functionality

---

### 6. PRODUCT CARD COMPONENTS

#### 6.1 Product Card Wishlist (`agri-app/src/components/product/ProductCardWishlist.js`)
- Compact product display
- Product image
- Product name
- Price (with discount)
- Rating display
- Remove button (heart icon)
- OnPress: Navigate to detail
- OnRemove: Callback to parent

**Key Features**:
- Wishlist-specific styling
- Remove action
- Price display
- Rating integration

---

## DATA FLOW DIAGRAMS

### Add to Cart Flow
```
User (Mobile App)
    ↓ [Select product, size, quantity, seller]
ProductDetailScreen
    ↓ [Tap "Add to Cart"]
CartContext.addToCart()
    ↓ [Check authentication]
    ↓ [Extract price_size details]
    ↓ [POST /products/addtocartapp]
AddToCart.addProductToCartApp()
    ↓ [Find or create cart]
    ↓ [Check for existing item]
    ↓ [Update or add item]
    ↓ [Save cart]
Cart Model Pre-save Hook
    ↓ [Calculate totals]
Database
    ↓ [Save cart]
Response to App
    ↓ [Formatted cart]
CartContext
    ↓ [Update state]
    ↓ [Save to AsyncStorage]
    ↓ [Show toast]
UI Updates
```

### Cart Synchronization Flow
```
App Launch
    ↓
CartContext Initialize
    ↓ [Check authentication]
    ↓ [Get user from AsyncStorage]
    ↓
If Not Authenticated:
    ↓ [Load cart from AsyncStorage]
    ↓ [Set local state]
    
If Authenticated:
    ↓ [GET /products/cartitemsapp]
AddToCart.getCartItemsApp()
    ↓ [Find cart]
    ↓ [Format with product details]
Database
    ↓ [Return cart]
Response to App
    ↓ [Formatted cart]
CartContext
    ↓ [Update state]
    ↓ [Save to AsyncStorage]
UI Displays Cart
```

### Wishlist Toggle Flow
```
User (Mobile App)
    ↓ [Tap heart icon]
WishlistContext.toggleWishlist()
    ↓ [Check authentication]
    ↓ [Check if already wishlisted]
    ↓
If Wishlisted:
    ↓ [POST /products/removewishlist]
Wishlist.removeFromWishlist()
    ↓ [Find wishlist]
    ↓ [Filter out product]
    ↓ [Save wishlist]
Database
    ↓ [Update wishlist]
Response
    ↓ [Success]
WishlistContext
    ↓ [Remove from Set]
    ↓ [Save to AsyncStorage]
    ↓ [Show "Removed" toast]
    
If Not Wishlisted:
    ↓ [POST /products/addwishlist]
Wishlist.addToWishList()
    ↓ [Find or create wishlist]
    ↓ [Check for duplicate]
    ↓ [Add product]
    ↓ [Save wishlist]
Database
    ↓ [Update wishlist]
Response
    ↓ [Success]
WishlistContext
    ↓ [Add to Set]
    ↓ [Save to AsyncStorage]
    ↓ [Show "Added ❤️" toast]
    
UI Updates (heart icon filled/outline)
```

### Cart Quantity Update Flow
```
User (Mobile App)
    ↓ [Tap +/- button]
CartPage.handleQuantityUpdate()
    ↓ [Debounce 300ms]
    ↓ [Validate quantity >= 1]
CartContext.updateQuantity()
    ↓ [POST /products/addtocartapp]
AddToCart.addProductToCartApp()
    ↓ [Find cart]
    ↓ [Find existing item]
    ↓ [Update quantity]
    ↓ [Save cart]
Cart Model Pre-save Hook
    ↓ [Recalculate totals]
Database
    ↓ [Save cart]
Response
    ↓ [Updated cart]
CartContext
    ↓ [Update state]
    ↓ [Save to AsyncStorage]
    ↓ [Show toast]
UI Updates (quantity, totals)
```

---

## KEY FEATURES & CAPABILITIES

### 1. Authentication-Aware State Management
- Checks authentication before loading
- Different behavior for authenticated/guest users
- Seamless data migration on login
- AsyncStorage fallback

### 2. Persistent Storage
- AsyncStorage for offline access
- Survives app restarts
- Syncs with backend on launch
- Automatic save on changes

### 3. Multi-Seller Support
- Each cart item has sellerId
- Same product from different sellers = separate items
- Seller-specific pricing
- Seller information in cart

### 4. Size-Based Variants
- Each item has selected size
- Size-specific pricing
- Size-specific stock
- Same product + different size = separate items

### 5. Automatic Price Calculation
- Pre-save hook calculates totals
- Original price total
- Discounted price total
- Discount amount
- No manual calculation needed

### 6. Optimistic Updates
- Immediate UI feedback
- API call in background
- Rollback on error
- Toast notifications

### 7. Debounced Quantity Updates
- 300ms delay
- Prevents excessive API calls
- Smooth user experience
- Error handling

### 8. Wishlist Management
- Set data structure for performance
- Quick add/remove
- Duplicate prevention
- Timestamp tracking

### 9. Cart Segregation
- Groups items by category
- Seeds, pesticides, PPE, others
- Used by AI chatbot
- Helps with organization

### 10. Empty State Handling
- Friendly empty messages
- Call-to-action buttons
- Consistent UX
- Helpful guidance

---

## BUSINESS RULES

### Cart Management
1. User must be authenticated to add to cart
2. Each cart item must have: product, quantity, size, seller
3. Same product + same size + same seller = one item (quantity updates)
4. Same product + different size OR different seller = separate items
5. Quantity must be >= 1
6. Cart totals auto-calculated on save
7. Cart persists in AsyncStorage
8. Cart syncs with backend on app launch

### Quantity Updates
1. Minimum quantity: 1
2. Quantity updates replace (not increment) in mobile app
3. Quantity updates increment in web version
4. Stock validation on frontend (not enforced on backend for app)
5. Debounced to prevent excessive API calls

### Cart Removal
1. Remove requires confirmation
2. Clear cart requires confirmation
3. Removal updates totals automatically
4. Removed items cannot be recovered

### Wishlist Management
1. User must be authenticated to use wishlist
2. No duplicates allowed
3. Only product ID stored (no variants)
4. Timestamp tracked for each addition
5. Wishlist persists in AsyncStorage
6. Wishlist syncs with backend on app launch

### Wishlist Toggle
1. If in wishlist: Remove
2. If not in wishlist: Add
3. Toggle provides immediate feedback
4. Toast notifications for actions

### Price Calculations
1. Subtotal = Sum of (selectedPrice × quantity)
2. Total Discounted = Sum of (selectedDiscountedPrice × quantity)
3. Total Discount = Subtotal - Total Discounted
4. Final Amount = Total Discounted + Shipping
5. Free shipping threshold: 0 (always free currently)

### Data Synchronization
1. AsyncStorage is source of truth for guest users
2. Backend is source of truth for authenticated users
3. AsyncStorage used as cache for authenticated users
4. Sync on app launch
5. Sync after each mutation

---

## SECURITY FEATURES

### 1. Authentication
- JWT required for all cart/wishlist operations
- User role required for app endpoints
- Token validation on each request

### 2. Authorization
- Users can only access their own cart
- Users can only access their own wishlist
- UserId from JWT (not request body)

### 3. Data Validation
- Required field checking
- ObjectId validation
- Product existence validation
- Seller existence validation

### 4. Data Integrity
- Pre-save hooks for calculations
- Prevents manual total manipulation
- Consistent data structure

---

## ERROR HANDLING

### Frontend
- Toast notifications for all actions
- Confirmation dialogs for destructive actions
- Loading states during async operations
- Error states with retry options
- Graceful degradation (AsyncStorage fallback)
- Debouncing to prevent errors

### Backend
- Specific error messages
- HTTP status codes
- Validation errors
- Not found errors
- Server error handling

### Common Errors
- 400: Missing fields, invalid data
- 401: Not authenticated
- 403: Wrong role
- 404: Cart/wishlist/product not found
- 500: Internal server error

---

## PERFORMANCE OPTIMIZATIONS

### 1. Frontend
- Context API for global state
- useMemo for expensive calculations
- Debounced quantity updates
- Memoized components (wishlist)
- Set data structure for wishlist (O(1) lookups)
- AsyncStorage caching

### 2. Backend
- Pre-save hooks for calculations
- Minimal data in wishlist (just IDs)
- Aggregation for minimal wishlist
- Indexed fields (userId)
- Lean queries where possible

### 3. API
- Formatted responses for app
- Minimal data transfer (getminimalwishlist)
- Batch operations (cart updates)
- Efficient queries

---

## TESTING CONSIDERATIONS

### Unit Tests
- Price calculation logic
- Cart total calculations
- Wishlist Set operations
- Debounce functionality

### Integration Tests
- Add to cart flow
- Update quantity flow
- Remove from cart flow
- Clear cart flow
- Wishlist toggle flow
- Cart synchronization

### E2E Tests
- Complete shopping flow
- Cart persistence across app restarts
- Wishlist persistence
- Authentication state changes
- Guest to authenticated migration

---

## FUTURE ENHANCEMENTS

1. **Cart Sharing**: Share cart with others
2. **Save for Later**: Move items from cart to saved list
3. **Cart Expiration**: Auto-remove old items
4. **Price Alerts**: Notify when wishlist item price drops
5. **Stock Alerts**: Notify when wishlist item back in stock
6. **Cart Recommendations**: Suggest related products
7. **Bulk Actions**: Select multiple items for removal
8. **Cart Notes**: Add notes to cart items
9. **Gift Options**: Mark items as gifts
10. **Wishlist Sharing**: Share wishlist with friends
11. **Multiple Wishlists**: Create named wishlists
12. **Wishlist Privacy**: Public/private wishlists
13. **Cart Analytics**: Track cart abandonment
14. **Smart Sorting**: Sort cart by category, price, etc.
15. **Cart Merge**: Merge guest cart with user cart on login

---

## ENVIRONMENT VARIABLES

No specific environment variables required for cart/wishlist features.

---

## CONCLUSION

The Shopping Cart & Wishlist feature provides a robust, user-friendly system for managing shopping activities with real-time synchronization, persistent storage, multi-seller support, and comprehensive error handling. The system is designed to work seamlessly for both authenticated and guest users, with automatic data migration upon login. The use of Context API, AsyncStorage, and optimized API calls ensures excellent performance and user experience across the mobile application.
