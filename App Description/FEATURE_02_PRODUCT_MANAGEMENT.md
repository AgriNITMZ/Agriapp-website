# Feature Description: Product Management

## Feature Overview
This feature provides a comprehensive product catalog management system with support for multi-seller marketplace functionality, hierarchical category organization (parent categories and subcategories), advanced product search and filtering, bulk product upload, product editing, and seller-specific product management. The system supports multiple sellers offering the same product at different prices, creating a competitive marketplace environment.

---

## Architecture Components

### Backend Components
1. **Models** (Data Layer)
   - Product
   - Category
   - Parent Category
   - Product Additional Details

2. **Controllers** (Business Logic Layer)
   - Product Controller
   - Category Controller

3. **Routes** (API Endpoints Layer)
   - Product Routes

4. **Utils** (Helper Services)
   - Image Uploader (Cloudinary)
   - Aggregation Helpers

### Frontend Components (Mobile App)
1. **Screens** (UI Layer)
   - Product Detail Screen
   - Marketplace Screen
   - Category Screen
   - Seller Products Screen
   - Add/Edit Product Screens

2. **Components** (Reusable UI)
   - Product Card
   - Product Images
   - Product Info
   - Size Selector
   - Quantity Selector
   - Seller Selector
   - Product List

---

## Detailed Component Analysis

### 1. DATABASE MODELS

#### 1.1 Product Model (`agri_backend/models/Product.js`)
**Purpose**: Core product information with multi-seller support

**Schema Fields**:
- `productSlug` (String, unique, sparse, indexed): URL-friendly product identifier
- `modelNumber` (String, sparse, indexed): Product model/SKU number
- `brand` (String, default: ''): Product brand name
- `sellers` (Array): Multi-seller support with nested structure:
  - `sellerId` (ObjectId, ref: 'User', required): Seller reference
  - `price_size` (Array): Size-based pricing:
    - `price` (Number): Original price
    - `discountedPrice` (Number): Sale price
    - `size` (String): Size variant (e.g., "1kg", "500g")
    - `quantity` (Number): Available stock
  - `fullShopDetails` (String, default: 'Full Shop Details'): Shop information
  - `deliveryInfo` (String, default: 'Standard delivery'): Delivery details
  - `warranty` (String, default: 'No warranty'): Warranty information
  - `addedAt` (Date, default: Date.now): When seller added product
- `name` (String, required): Product name
- `category` (String, required, ref: 'Category'): Category reference
- `description` (String, required): Product description (HTML supported)
- `images` (Array of String, required): Product image URLs
- `ratingandreview` (Array of ObjectId, ref: 'RatingAndReview'): Reviews
- `tag` (Array of String, required, default: ['New Arrival']): Product tags
- `createdAt` (Date, default: Date.now()): Creation timestamp
- `badges` (String, default: 'New Arrival'): Product badge
- `avgRating` (Number, default: 0): Average rating (legacy)
- `ratings` (Object): Detailed rating information:
  - `average` (Number, default: 0): Average rating
  - `count` (Number, default: 0): Total ratings
  - `distribution` (Object): Rating breakdown:
    - `1` to `5` (Number, default: 0): Count per star rating
- `updatedAt` (Date, default: Date.now()): Last update timestamp

**Key Features**:
- Multi-seller support: Same product can be sold by multiple sellers
- Size-based pricing: Different prices for different sizes
- Stock management: Per-size inventory tracking
- Slug generation: Auto-generated URL-friendly identifiers
- Rating aggregation: Comprehensive rating system


#### 1.2 Category Model (`agri_backend/models/Category.js`)
**Purpose**: Product categorization (subcategories)

**Schema Fields**:
- `name` (String, required): Category name
- `image` (String, required): Category image URL
- `description` (String): Category description
- `product` (Array of ObjectId, ref: 'Product'): Products in this category

**Relationships**:
- One-to-Many with Products
- Many-to-One with Parent Category

#### 1.3 Parent Category Model (`agri_backend/models/ParentCategory.js`)
**Purpose**: Top-level category hierarchy

**Schema Fields**:
- `name` (String, required, unique): Parent category name
- `image` (String, required): Category image URL
- `description` (String, trim): Category description
- `subcategories` (Array of ObjectId, ref: 'Category'): Child categories

**Relationships**:
- One-to-Many with Categories

**Hierarchy Structure**:
```
Parent Category (e.g., "Seeds")
  └── Category (e.g., "Vegetable Seeds")
      └── Products (e.g., "Tomato Seeds 100g")
```

---

### 2. CONTROLLERS (Business Logic)

#### 2.1 Product Controller (`agri_backend/controller/Product.js`)

**Function: `createProduct(req, res)`**
- **Route**: POST `/api/v1/products/createproduct`
- **Authentication**: Required (Seller role)
- **Purpose**: Creates new product or adds seller to existing product

**Request Body**:
- `name` (String, required): Product name
- `price_size` (Array/JSON, required): Size-based pricing
- `category` (String, required): Category ID
- `description` (String, required): Product description
- `tag` (Array/JSON, required): Product tags
- `badges` (String, required): Product badge
- `fullShopDetails` (String, required): Shop information
- `modelNumber` (String, optional): Product model number
- `brand` (String, optional): Brand name
- `deliveryInfo` (String, optional): Delivery details
- `warranty` (String, optional): Warranty information

**Request Files**:
- `image` (File/Array): Product images

**Processing Flow**:
1. **Extract and Clean Data**:
   - Trim product name
   - Remove extra spaces
   - Parse price_size (JSON or array)
   - Handle single or multiple images
2. **Validation**:
   - Check all required fields present
   - Validate price_size structure
   - Ensure prices > 0
   - Verify discounted price ≤ original price
   - Verify user is seller
   - Check category exists
3. **Generate Product Slug**:
   - Convert name to lowercase
   - Replace non-alphanumeric with hyphens
   - Remove leading/trailing hyphens
4. **Check for Existing Product**:
   - Search by modelNumber + productSlug
   - If not found, search by productSlug alone
5. **If Product Exists**:
   - Check if seller already selling this product
   - If yes: Return error "already selling"
   - If no: Add seller to sellers array
   - Update product document
   - Add product to user's products array
   - Return success with `isNewProduct: false`
6. **If Product Doesn't Exist**:
   - Upload images to Cloudinary
   - Parse tags from JSON
   - Create new Product document with:
     - All product fields
     - Generated slug
     - Seller in sellers array
   - Save product
   - Add to user's products array
   - Add to category's product array
   - Return success with `isNewProduct: true`

**Response**:
```json
{
  "success": true,
  "msg": "Product created successfully",
  "product": { /* product object */ },
  "isNewProduct": true
}
```

**Error Handling**:
- 400: Missing fields, invalid prices, discount > price, seller already exists
- 401: Not a seller
- 404: Category not found
- 500: Internal server error

**Key Features**:
- Automatic product deduplication
- Multi-seller support
- Slug generation for SEO
- Image upload to Cloudinary
- Price validation


**Function: `createBulkUpload(req, res)`**
- **Route**: POST `/api/v1/products/bulk-upload`
- **Authentication**: Required (Seller role)
- **Purpose**: Uploads multiple products at once

**Request Body**:
- `bulkData` (Array/JSON, required): Array of product objects

**Request Files**:
- `images_{uniqueKey}[]` (Files): Images for each product (indexed by uniqueKey)
- Fallback: `image_{index}` (Files): Images indexed by array position

**Processing Flow**:
1. **Parse Bulk Data**:
   - Handle array or JSON string
   - Validate array format
2. **Validate Seller**:
   - Check user is seller
3. **Iterate Through Products**:
   For each product in bulkData:
   - Extract fields: name, uniqueKey, price_size, category, description, tag, badges, fullShopDetails
   - Trim product name
   - Validate required fields
   - Check category exists
   - **Handle Image Uploads**:
     - Look for `images_{uniqueKey}[]` format (new)
     - Fallback to `image_{index}` format (legacy)
     - Upload each image to Cloudinary
   - Parse tags (JSON or array)
   - Create Product document with seller
   - Save product
   - Add to user's products array
   - Add to category's product array
   - Add to createdProducts array
4. **Return Results**:
   - Count of successfully created products
   - Array of created product objects

**Response**:
```json
{
  "success": true,
  "msg": "5 products uploaded successfully",
  "products": [ /* array of products */ ]
}
```

**Error Handling**:
- 400: Invalid bulkData JSON
- 401: Not a seller
- Individual product errors logged but don't stop batch

**Key Features**:
- Batch product creation
- Unique key-based image mapping
- Graceful error handling (continues on individual failures)
- Automatic category and user linking

---

**Function: `getProductById(req, res)`**
- **Route**: GET `/api/v1/products/getproductbyId/:productId`
- **Authentication**: Not required
- **Purpose**: Retrieves detailed product information

**Parameters**:
- `productId` (URL param): Product ID

**Processing Flow**:
1. Find product by ID
2. Populate sellers with user details:
   - Name, email, image, accountType
   - Additional profile details (firstName, lastName, contactNo)
3. Populate ratings and reviews
4. **Backward Compatibility Check**:
   - If sellers array empty but root-level sellerId exists:
     - Migrate to sellers array format
   - If sellers array empty:
     - Create default seller entry
5. **Format Seller Data**:
   - Extract seller name from multiple sources:
     - User.Name (primary)
     - Profile firstName + lastName
     - fullShopDetails (fallback)
   - Extract phone from profile
   - Build allSellers array with formatted data
6. **Add Metadata**:
   - sellersCount: Number of sellers
   - allSellers: Formatted seller information
7. Return formatted product

**Response**:
```json
{
  "success": true,
  "msg": "Product found successfully",
  "product": {
    "_id": "...",
    "name": "Product Name",
    "sellersCount": 3,
    "allSellers": [
      {
        "sellerId": "...",
        "sellerName": "Shop Name",
        "sellerEmail": "seller@example.com",
        "sellerPhone": "1234567890",
        "price_size": [ /* sizes */ ],
        "fullShopDetails": "Shop Details",
        "deliveryInfo": "Standard delivery",
        "warranty": "No warranty",
        "addedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    /* other product fields */
  }
}
```

**Error Handling**:
- 404: Product not found

**Key Features**:
- Backward compatibility with old schema
- Seller name resolution from multiple sources
- Populated seller details
- Formatted response for frontend

---

**Function: `getAllProducts(req, res)`**
- **Route**: GET `/api/v1/products/getallproduct`
- **Authentication**: Required
- **Purpose**: Retrieves all products

**Processing Flow**:
1. Find all products
2. **Format Each Product**:
   - Apply backward compatibility fixes
   - Ensure sellers array exists
   - Migrate old format if needed
3. Return formatted products array

**Response**:
```json
{
  "success": true,
  "msg": "Products found successfully",
  "products": [ /* array of products */ ]
}
```

---

**Function: `getProductsByParentCategory(req, res)`**
- **Route**: GET `/api/v1/products/getproductbyparentcategory`
- **Authentication**: Not required
- **Purpose**: Gets all products under a parent category

**Request Body**:
- `parentCategoryId` (String, required)

**Processing Flow**:
1. Find parent category by ID
2. Populate subcategories
3. Populate products within each subcategory
4. Flatten all products from all subcategories into single array
5. Return products array

**Response**: Array of products

**Error Handling**:
- 404: Parent category not found

---

**Function: `getProductsByCategory(req, res)`**
- **Route**: GET `/api/v1/products/getproductbycategory`
- **Authentication**: Not required
- **Purpose**: Gets products in specific category

**Request Body**:
- `categoryId` (String, required)

**Processing Flow**:
1. Find category by ID
2. Populate products
3. Return products array

**Response**: Array of products

**Error Handling**:
- 404: Category not found
- 500: Server error

---

**Function: `seachProduct(req, res)`**
- **Route**: GET `/api/v1/products/searchproducts`
- **Authentication**: Not required
- **Purpose**: Searches products by query

**Query Parameters**:
- `query` or `search` (String, required): Search term
- `page` (Number, optional, default: 1): Page number
- `limit` (Number, optional, default: 20): Results per page

**Processing Flow**:
1. Extract search query (supports both 'query' and 'search' params)
2. Validate query provided
3. Parse pagination parameters
4. Create case-insensitive regex
5. Build search conditions:
   - Search in name field
   - Search in description field
   - Search in tags array
6. Count total matching products
7. Execute search with pagination:
   - Skip: (page - 1) * limit
   - Limit: pageSize
8. Return results with pagination metadata

**Response**:
```json
{
  "totalProducts": 45,
  "totalPages": 3,
  "currentPage": 1,
  "pageSize": 20,
  "products": [ /* array of products */ ]
}
```

**Error Handling**:
- 400: Query required
- 500: Server error

---

**Function: `getAllProductBySeller(req, res)`**
- **Route**: GET `/api/v1/products/sellerProductt`
- **Authentication**: Required (Seller role)
- **Purpose**: Gets all products for authenticated seller

**Processing Flow**:
1. Extract userId from auth
2. Find products where sellers array contains sellerId
3. Populate category
4. **Refine Product Data**:
   For each product:
   - Find seller's data in sellers array
   - Calculate total stock across all sizes
   - Extract first price (discounted or regular)
   - Build refined object with:
     - Product ID
     - Name
     - Category name
     - Images
     - Total stock
     - Price
5. Return refined products array

**Response**:
```json
{
  "success": true,
  "msg": "Products found successfully",
  "products": [
    {
      "_id": "...",
      "name": "Product Name",
      "category": "Category Name",
      "images": [ /* image URLs */ ],
      "stock": 150,
      "price": 299
    }
  ]
}
```

**Error Handling**:
- 404: No products found
- 500: Server error

**Key Features**:
- Seller-specific filtering
- Stock aggregation across sizes
- Simplified response format

---

**Function: `deleteProduct(req, res)`**
- **Route**: DELETE `/api/v1/products/product/delete/:productId`
- **Authentication**: Required (Seller role)
- **Purpose**: Deletes product (seller must own it)

**Parameters**:
- `productId` (URL param): Product ID

**Processing Flow** (with MongoDB transaction):
1. Start session and transaction
2. Find and delete product by ID
3. **Verify Ownership**:
   - Check if seller exists in sellers array
   - If not: Abort transaction, return 403
4. **Cleanup References**:
   - Remove product from category's product array
   - Remove product from user's products array
5. Commit transaction
6. Return success

**Response**:
```json
{
  "success": true,
  "msg": "Product deleted successfully"
}
```

**Error Handling**:
- 404: Product not found
- 403: Not authorized (not seller's product)
- 500: Server error

**Key Features**:
- Transaction support for data consistency
- Ownership verification
- Cascading cleanup

---


**Function: `getFilteredProducts(req, res)`**
- **Route**: GET `/api/v1/products/filteredproducts`
- **Authentication**: Not required
- **Purpose**: Advanced product filtering and sorting

**Query Parameters**:
- `search` (String): Search term
- `category` (String): Comma-separated category IDs
- `minPrice` (Number): Minimum price
- `maxPrice` (Number): Maximum price
- `minDiscount` (Number): Minimum discount percentage
- `minRating` (Number): Minimum rating
- `tags` (String): Comma-separated tags
- `badges` (String): Badge filter
- `sellerId` (String): Specific seller
- `sort` (String): Sort option (newest, price_asc, price_desc, rating, popularity, discount)
- `page` (Number, default: 1): Page number
- `limit` (Number, default: 10): Results per page

**Processing Flow**:
1. **Build Filter Object**:
   - Search: Regex match on name or tags
   - Category: $in operator for multiple categories
   - Tags: $in operator for multiple tags
   - Badges: Exact match
   - Seller: sellerId match
   - Rating: $gte minRating
2. **Build Aggregation Pipeline**:
   - **Match Stage**: Apply initial filters
   - **AddFields Stage**: Extract price_size from first seller
   - **Unwind Stage** (if price/discount filtering):
     - Unwind price_size array
     - Apply price range filters
     - Calculate discount percentage
     - Filter by discount percentage
     - Group back with aggregated values (min/max price, max discount)
   - **Sort Stage**:
     - newest: createdAt descending
     - price_asc: minPrice ascending
     - price_desc: minPrice descending
     - rating: avgRating descending
     - popularity: ratings.count descending
     - discount: maxDiscount descending
   - **Pagination**: Skip and limit
   - **Project Stage**: Select required fields only
3. **Execute Pipeline**:
   - Get filtered products
   - Get total count (separate pipeline without pagination)
4. **Return Results** with pagination metadata

**Response**:
```json
{
  "success": true,
  "data": {
    "products": [ /* filtered products */ ],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 10,
      "totalPages": 15
    }
  }
}
```

**Error Handling**:
- 500: Server error

**Key Features**:
- Multiple filter combinations
- Price range filtering
- Discount percentage calculation
- Multiple sort options
- Pagination support
- Aggregation pipeline for complex queries

---

**Function: `editProduct(req, res)`**
- **Route**: PUT `/api/v1/products/editproduct/:productId`
- **Authentication**: Required (Seller role)
- **Purpose**: Edits product (seller-specific fields)

**Parameters**:
- `productId` (URL param): Product ID

**Request Body**:
- `name` (String): Product name
- `price_size` (Array/JSON): Size-based pricing
- `category` (String): Category ID
- `description` (String): Description
- `tag` (Array/JSON): Tags
- `badges` (String): Badge
- `fullShopDetails` (String): Shop details
- `deletedImages` (Array): Images to delete

**Request Files**:
- `image` (File/Array): New images to add

**Processing Flow**:
1. Find product by ID
2. **Verify Ownership**:
   - Find seller index in sellers array
   - If not found: Return 401 unauthorized
3. **Parse and Validate price_size**:
   - Handle array or JSON string
   - Validate structure (price, discountedPrice, size, quantity)
   - Ensure all fields are correct types
4. **Handle Images**:
   - **Delete Images**:
     - Extract publicId from URL or use directly
     - Call Cloudinary destroy API
     - Remove from images array
   - **Add New Images**:
     - Upload to Cloudinary
     - Add URLs to images array
5. **Handle Category Change**:
   - If category changed:
     - Verify new category exists
     - Remove product from old category
     - Add product to new category
6. **Update Seller-Specific Fields**:
   - Update price_size for this seller
   - Update fullShopDetails for this seller
7. **Update Common Product Fields**:
   - name, description, category, tag, badges, images
8. Save product
9. Return updated product

**Response**:
```json
{
  "success": true,
  "msg": "Product updated successfully",
  "product": { /* updated product */ }
}
```

**Error Handling**:
- 404: Product not found, Category not found
- 401: Not authorized (not seller's product)
- 400: Invalid price_size format, parsing errors
- 500: Server error

**Key Features**:
- Seller-specific updates
- Image management (add/delete)
- Category migration
- Cloudinary integration
- Validation

---

**Function: `addSellerToProduct(req, res)`**
- **Route**: PUT `/api/v1/products/addseller/:productId`
- **Authentication**: Required (Seller role)
- **Purpose**: Adds seller to existing product

**Parameters**:
- `productId` (URL param): Product ID

**Request Body**:
- `price_size` (Array/JSON, required): Seller's pricing
- `fullShopDetails` (String, required): Shop information
- `deliveryInfo` (String, optional): Delivery details
- `warranty` (String, optional): Warranty information

**Processing Flow**:
1. Extract userId from auth
2. Parse price_size (array or JSON)
3. **Validation**:
   - Check price_size and fullShopDetails provided
   - Verify user is seller
4. Find product by ID
5. **Check if Seller Already Added**:
   - Search sellers array for sellerId
   - If found: Return 409 conflict
6. **Add Seller**:
   - Push new seller object to sellers array:
     - sellerId
     - price_size
     - fullShopDetails
     - deliveryInfo (default: 'Standard delivery')
     - warranty (default: 'No warranty')
7. Save product
8. **Update User's Products**:
   - Add product ID to user's products array ($addToSet)
9. Return success with updated product

**Response**:
```json
{
  "success": true,
  "msg": "Seller added to product successfully",
  "product": { /* updated product */ }
}
```

**Error Handling**:
- 400: Missing fields
- 403: Not a seller
- 404: Product not found
- 409: Seller already added
- 500: Server error

**Key Features**:
- Multi-seller marketplace support
- Duplicate prevention
- Automatic user linking

---

#### 2.2 Category Controller (`agri_backend/controller/Category.js`)

**Function: `createCategory(req, res)`**
- **Route**: POST `/api/v1/products/createcategory`
- **Authentication**: Required
- **Purpose**: Creates new subcategory

**Request Body**:
- `name` (String, required): Category name
- `description` (String, required): Description
- `parentCategoryId` (String, required): Parent category ID

**Request Files**:
- `image` (File, required): Category image

**Processing Flow**:
1. Validate required fields
2. Upload image to Cloudinary (1000x1000)
3. Create Category document
4. Add category to parent's subcategories array
5. Save category
6. Return success

**Response**:
```json
{
  "success": true,
  "data": { /* category object */ },
  "message": "Category created successfully"
}
```

**Error Handling**:
- 400: Missing fields
- 500: Server error

---

**Function: `createParentCategory(req, res)`**
- **Route**: POST `/api/v1/products/createparentcategory`
- **Authentication**: Required (Admin role)
- **Purpose**: Creates new parent category

**Request Body**:
- `name` (String, required): Parent category name
- `description` (String): Description

**Request Files**:
- `image` (File, required): Category image

**Processing Flow**:
1. Validate name provided
2. Upload image to Cloudinary
3. Create ParentCategory document
4. Save parent category
5. Return success

**Response**:
```json
{
  "success": true,
  "data": { /* parent category object */ },
  "message": "Parent category created successfully"
}
```

**Error Handling**:
- 400: Missing name
- 500: Server error

---

**Function: `getAllParentCategories(req, res)`**
- **Route**: GET `/api/v1/products/getallparentcategory`
- **Authentication**: Not required
- **Purpose**: Gets all parent categories with subcategories

**Processing Flow**:
1. Find all parent categories
2. Populate subcategories
3. Return array

**Response**:
```json
{
  "success": true,
  "data": [ /* parent categories with subcategories */ ],
  "message": "Parent categories fetched successfully"
}
```

---

**Function: `getParentCategoriesList(req, res)`**
- **Route**: GET `/api/v1/products/getcategorylist`
- **Authentication**: Not required
- **Purpose**: Gets parent categories with minimal data

**Processing Flow**:
1. Find all parent categories
2. Select only: _id, name, image
3. Populate subcategories with: _id, name, image
4. Return array

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Seeds",
      "image": "...",
      "subcategories": [
        { "_id": "...", "name": "Vegetable Seeds", "image": "..." }
      ]
    }
  ],
  "message": "Parent categories fetched successfully"
}
```

**Key Features**:
- Minimal data transfer
- Optimized for UI dropdowns/lists

---

**Function: `getParentCategoryById(req, res)`**
- **Route**: POST `/api/v1/products/getonecategory`
- **Authentication**: Not required
- **Purpose**: Gets single parent category with full details

**Request Body**:
- `parentCategoryId` (String, required)

**Processing Flow**:
1. Find parent category by ID
2. Populate subcategories
3. Populate products within each subcategory
4. Return parent category with nested data

**Response**:
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Seeds",
    "subcategories": [
      {
        "_id": "...",
        "name": "Vegetable Seeds",
        "product": [ /* array of products */ ]
      }
    ]
  },
  "message": "Parent category fetched successfully"
}
```

**Error Handling**:
- 404: Parent category not found
- 500: Server error

---

**Function: `getCategories(req, res)`**
- **Route**: GET `/api/v1/products/getCategory`
- **Authentication**: Not required
- **Purpose**: Gets all categories (subcategories)

**Processing Flow**:
1. Find all categories
2. Return array

**Response**:
```json
{
  "success": true,
  "data": [ /* categories */ ],
  "message": "Categories fetched successfully"
}
```

---

**Function: `getCategoryById(req, res)`**
- **Route**: POST `/api/v1/products/particularcreatecategory`
- **Authentication**: Not required
- **Purpose**: Gets single category with products

**Request Body**:
- `categoryId` (String, required)

**Processing Flow**:
1. Find category by ID
2. Populate products
3. Return category

**Response**:
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Vegetable Seeds",
    "product": [ /* products */ ]
  },
  "message": "Category fetched successfully"
}
```

**Error Handling**:
- 404: Category not found
- 500: Server error

---

### 3. ROUTES

#### 3.1 Product Routes (`agri_backend/routes/Product.js`)

**Category Management**:
```
POST   /api/v1/products/createparentcategory     - Create parent category (auth, admin)
GET    /api/v1/products/getallparentcategory     - Get all parent categories
GET    /api/v1/products/getcategorylist          - Get parent categories list
POST   /api/v1/products/getonecategory           - Get one parent category
POST   /api/v1/products/createcategory           - Create category (auth)
GET    /api/v1/products/getCategory              - Get all categories
POST   /api/v1/products/particularcreatecategory - Get category by ID
```

**Product Management**:
```
POST   /api/v1/products/createproduct            - Create product (auth, seller)
POST   /api/v1/products/bulk-upload              - Bulk upload (auth, seller)
GET    /api/v1/products/getproductbyId/:id       - Get product details
GET    /api/v1/products/getallproduct            - Get all products (auth)
GET    /api/v1/products/getproductbyparentcategory - Get by parent category
GET    /api/v1/products/getproductbycategory     - Get by category
DELETE /api/v1/products/product/delete/:id       - Delete product (auth, seller)
```

**Product Search & Filter**:
```
GET    /api/v1/products/searchProducts/search    - Search products
GET    /api/v1/products/searchproducts           - Search products (alt)
GET    /api/v1/products/sellerProductt           - Get seller products (auth, seller)
GET    /api/v1/products/filteredproducts         - Advanced filtering
```

**Product Editing**:
```
PUT    /api/v1/products/editproduct/:id          - Edit product (auth, seller)
PUT    /api/v1/products/addseller/:id            - Add seller (auth, seller)
```

**Note**: Specific routes MUST come before catch-all routes to avoid conflicts

---


## FRONTEND IMPLEMENTATION (Mobile App)

### 4. PRODUCT SCREENS

#### 4.1 Product Detail Screen (`agri-app/src/screens/Products/ProductDetailScreen.js`)

**Purpose**: Displays complete product information with purchase options

**Props (from navigation)**:
- `route.params.productId`: Product ID to display

**State Management**:
- `product`: Product data object
- `quantity`: Selected quantity (default: 1)
- `selectedSellerIndex`: Currently selected seller (default: 0)
- `selectedSize`: Selected size index (default: 0)
- `similarProducts`: Related products array
- `loading`: Loading state
- `error`: Error message

**Context Usage**:
- `CartContext`: Provides `isProductInCart()` and `addToCart()`

**useEffect Hook: Fetch Product**
**Trigger**: Runs on component mount and when productId changes

**Processing Flow**:
1. Set loading true
2. GET `/products/getproductbyId/:productId`
3. **Process Product Data**:
   - Use allSellers if available (new format)
   - Otherwise use sellers array
   - Ensure sellers have proper structure:
     - sellerName from multiple sources
     - fullShopDetails
   - If no sellers: Create default seller entry
4. Set product state
5. Fetch similar products:
   - GET `/products/filteredproducts?category={categoryId}`
6. Set similarProducts state
7. Set loading false

**useEffect Hook: Reset Size on Seller Change**
**Trigger**: Runs when selectedSellerIndex or product changes

**Processing**:
- Get current seller's price_size
- If sizes available: Reset to first size
- Reset quantity to 1

**Function: `getCurrentSeller()`**
- **Purpose**: Gets currently selected seller
- **Processing**:
  - Validate sellers array exists
  - Ensure index within bounds
  - Return seller object or null

**Function: `getCurrentPriceSize()`**
- **Purpose**: Gets price_size array for current seller
- **Processing**:
  - Get current seller
  - Validate price_size exists and is array
  - Return price_size array or empty array

**Function: `handleBuyNow()`**
- **Purpose**: Adds product to cart and navigates to cart

**Processing Flow**:
1. Validate product exists
2. Get current seller
3. Get current price_size
4. Ensure selectedSize within bounds
5. Call `addToCart(product, quantity, size, seller)`
6. Navigate to Cart screen

**Function: `handleAddToCart()`**
- **Purpose**: Adds product to cart

**Processing Flow**:
1. Validate product exists
2. Get current seller
3. Get current price_size
4. Ensure selectedSize within bounds
5. Call `addToCart(product, quantity, size, seller)`

**UI Components**:
- **ProductImages**: Image carousel
- **Back Button**: Navigation back
- **WishlistButton**: Add/remove from wishlist
- **ProductInfo**: Name, price, rating
- **SellerSelector**: Dropdown to choose seller
- **SizeSelector**: Size options with prices
- **QuantitySelector**: Quantity picker with max limit
- **Description**: HTML content in WebView
- **RatingComponent**: Rating statistics
- **ProductReviews**: Customer reviews
- **ProductList**: Similar products
- **Footer Buttons**:
  - Add to Cart / Go to Cart (conditional)
  - Buy Now

**Loading State**:
- ActivityIndicator with message
- Centered on screen

**Error State**:
- Error message display
- Go Back button

**Styling**:
- Fixed footer with action buttons
- Scrollable content
- Dividers between sections
- WebView for HTML description

**Key Features**:
- Multi-seller support with selector
- Size-based pricing
- Stock-aware quantity selection
- Similar products recommendation
- Wishlist integration
- Responsive to cart state

---

#### 4.2 Marketplace Screen (`agri-app/src/screens/Products/MarketplaceScreen.js`)

**Purpose**: Main product browsing interface with categories and search

**Props (from navigation)**:
- `route.params.categoryId`: Pre-selected category (optional)
- `route.params.subcategoryId`: Pre-selected subcategory (optional)
- `route.params.search`: Pre-filled search query (optional)

**State Management**:
- `parentCategories`: Array of parent categories
- `selectedCategory`: Currently selected category ID
- `subcategories`: Array of subcategories
- `products`: Products to display
- `searchQuery`: Search input value
- `searchResults`: Search results array
- `loading`: Initial loading state
- `productsLoading`: Products loading state
- `searchLoading`: Search loading state

**useEffect Hook: Initialize**
**Trigger**: Component mount

**Processing**:
1. Fetch parent categories
2. If categoryId in params: Select that category
3. If subcategoryId in params: Load that subcategory
4. If search in params: Execute search

**Function: `fetchParentCategories()`**
**Processing**:
1. Set loading true
2. GET `/products/getallparentcategory`
3. Set parentCategories state
4. Set loading false

**Function: `handleCategorySelect(categoryId)`**
**Processing**:
1. Set selectedCategory
2. Set productsLoading true
3. POST `/products/getonecategory` with parentCategoryId
4. Set subcategories from response
5. Flatten all products from all subcategories
6. Set products state
7. Set productsLoading false

**Function: `handleSubcategorySelect(subcategoryId)`**
**Processing**:
1. Set productsLoading true
2. POST `/products/particularcreatecategory` with categoryId
3. Set products from response
4. Set selectedCategory to 'subcategory'
5. Clear subcategories
6. Set productsLoading false

**Function: `handleSearch(query)`**
**Processing**:
1. Set searchQuery
2. If empty: Clear searchResults and return
3. Set searchLoading true
4. GET `/products/searchproducts?search={query}`
5. Set searchResults from response
6. Set searchLoading false

**Render Functions**:

**`renderCategoryItem({ item })`**:
- Circular image container
- Category name below
- OnPress: handleCategorySelect

**`renderSubcategoryItem({ item })`**:
- Smaller circular image
- Subcategory name
- OnPress: handleSubcategorySelect

**`renderProductItem({ item })`**:
- ProductCard component
- Passes navigation

**UI Sections**:

1. **SearchTopBar**: Search input with callback
2. **Categories Section** (if no search):
   - "Shop by Category" title
   - Horizontal FlatList of parent categories
3. **Subcategories Section** (if category selected, no search):
   - "Subcategories" title with close button
   - Horizontal FlatList of subcategories
4. **Products Section** (if category selected, no search):
   - "Products (count)" title
   - 2-column grid of products
   - Loading indicator
   - Empty state with icon
5. **Search Results** (if search query):
   - "Search Results for 'query' (count)" title
   - 2-column grid of results
   - Loading indicator
   - Empty state with search icon
6. **Welcome Message** (default state):
   - Storefront icon
   - "Welcome to Marketplace" title
   - Instructions to select category

**Loading States**:
- Initial: Full-screen loader
- Products: Small loader in section
- Search: Small loader in section

**Empty States**:
- No products: Cube icon with message
- No search results: Search icon with message

**Styling**:
- Category circles with elevation
- 2-column product grid
- Horizontal scrolling for categories
- Safe area insets

**Key Features**:
- Category-based browsing
- Search functionality
- Deep linking support (params)
- Multiple loading states
- Empty state handling
- Responsive layout

---

#### 4.3 Category Screen (`agri-app/src/screens/Products/CategoryScreen.js`)

**Purpose**: Displays hierarchical category structure with sidebar navigation

**State Management**:
- `categories`: Array of parent categories
- `selectedCategory`: Currently selected parent category
- `loading`: Loading state
- `error`: Error message

**useEffect Hook: Fetch Categories**
**Trigger**: Component mount

**Processing**:
1. Call fetchCategories()

**Function: `fetchCategories()`**
**Processing**:
1. Set loading true, clear error
2. GET `/products/getcategorylist`
3. Validate response format
4. Set categories state
5. Set first category as selected (default)
6. Set loading false
7. On error: Set error message

**Function: `handleCategorySelect(category)`**
- Sets selectedCategory state

**UI Layout**:

**Sidebar (28% width)**:
- Vertical ScrollView
- Parent category items:
  - Category image (circular)
  - Category name
  - Selected state (green highlight, left border)
  - OnPress: handleCategorySelect

**Main Content (72% width)**:
- Selected category title
- Subcategories grid (3 columns):
  - Circular image container
  - Subcategory name
  - OnPress: Navigate to Marketplace with subcategoryId

**Loading State**:
- ActivityIndicator with message

**Error State**:
- ErrorView component with retry button

**Empty State**:
- "No categories found" message
- Refresh button

**Styling**:
- Split-screen layout
- Sidebar with light background
- Selected item highlighting
- Circular category images
- 3-column subcategory grid

**Key Features**:
- Sidebar navigation
- Visual category hierarchy
- Selected state indication
- Error handling with retry
- Empty state handling

---

#### 4.4 Seller Products Screen (`agri-app/src/screens/Seller/SellerProducts.js`)

**Purpose**: Seller's product management interface

**Props (from navigation)**:
- `route.params.lowStockOnly`: Filter for low stock (optional)

**State Management**:
- `products`: All seller products
- `filteredProducts`: Filtered/searched products
- `loading`: Loading state
- `refreshing`: Pull-to-refresh state
- `searchQuery`: Search input value
- `lowStockOnly`: Low stock filter flag

**Function: `fetchProducts()`**
**Processing**:
1. GET `/products/sellerProductt`
2. Set products state
3. **Apply Low Stock Filter** (if enabled):
   - Filter products where stock ≤ 10
   - Set filteredProducts
4. Otherwise: Set filteredProducts to all products
5. Set loading/refreshing false

**useEffect Hook: Initialize**
**Trigger**: Component mount

**Processing**:
- Call fetchProducts()

**Function: `onRefresh()`**
- Sets refreshing true
- Calls fetchProducts()

**Function: `handleSearch(query)`**
**Processing**:
1. Set searchQuery
2. Determine base products (low stock or all)
3. If query empty: Show base products
4. Otherwise: Filter by name (case-insensitive)
5. Set filteredProducts

**Function: `handleDelete(productId, productName)`**
**Processing**:
1. Show confirmation alert
2. On confirm:
   - DELETE `/products/product/delete/:productId`
   - Show success alert
   - Refresh products list

**UI Components**:

**SellerTopBar**: Title with back button

**Low Stock Banner** (if lowStockOnly):
- Orange background
- Red left border
- Warning message

**Searchbar**: Product search input

**ScrollView** with RefreshControl:
- Pull-to-refresh functionality

**Product Cards**:
- Product image (80x80)
- Product info:
  - Name (2 lines max)
  - Category
  - Price (green, bold)
  - Stock count
- Action icons:
  - Edit (green) → Navigate to EditPost
  - Delete (red) → handleDelete with confirmation

**Empty State**:
- Package icon
- "No products found" message
- "Add Your First Product" button

**FAB (Floating Action Button)**:
- Plus icon
- Green background
- OnPress: Navigate to AddPost

**SellerFooterNavigation**: Bottom navigation bar

**Styling**:
- Card-based layout
- Horizontal product layout
- Action icons on right
- FAB positioned above footer
- Pull-to-refresh support

**Key Features**:
- Product search
- Low stock filtering
- Pull-to-refresh
- Delete with confirmation
- Edit navigation
- Empty state with CTA
- FAB for quick add

---

### 5. PRODUCT COMPONENTS

#### 5.1 Product Card Mini (`agri-app/src/components/product/ProductCardMini.js`)
- Compact product display
- Image, name, price
- OnPress: Navigate to ProductDetailScreen

#### 5.2 Product Images (`agri-app/src/components/productDetail/Images.js`)
- Image carousel/swiper
- Multiple image support
- Zoom functionality

#### 5.3 Product Info (`agri-app/src/components/productDetail/ProductInfo.js`)
- Product name
- Price display (original + discounted)
- Rating display
- Badge display

#### 5.4 Size Selector (`agri-app/src/components/productDetail/SizeSelector.js`)
- Size options from price_size array
- Shows price per size
- Stock availability indicator
- Selected state highlighting

#### 5.5 Quantity Selector (`agri-app/src/components/productDetail/QuantitySelector.js`)
- Increment/decrement buttons
- Current quantity display
- Max quantity enforcement (based on stock)
- Disabled state when out of stock

#### 5.6 Seller Selector (`agri-app/src/components/productDetail/SellerSelector.js`)
- Dropdown/picker for multiple sellers
- Displays seller name
- Shows seller count
- Updates price_size on selection

#### 5.7 Wishlist Button (`agri-app/src/components/productDetail/Wishlist.js`)
- Heart icon (filled/outline)
- Add/remove from wishlist
- Visual feedback

#### 5.8 Product List (`agri-app/src/components/product/ProductList.js`)
- Horizontal scrolling list
- Section title
- Multiple ProductCard components
- "View All" option

---

## DATA FLOW DIAGRAMS

### Product Creation Flow
```
Seller (Mobile App)
    ↓ [Fill product form, upload images]
AddPost Screen
    ↓ [Validate inputs]
    ↓ [POST /products/createproduct]
Product.createProduct()
    ↓ [Clean and validate data]
    ↓ [Generate product slug]
    ↓ [Check if product exists]
    ↓ [If exists: Add seller to sellers array]
    ↓ [If new: Upload images to Cloudinary]
    ↓ [Create Product document]
    ↓ [Add to Category]
    ↓ [Add to User's products]
Database
    ↓ [Save product]
Response to App
    ↓ [Success with isNewProduct flag]
Navigate to SellerProducts
```

### Product Browse Flow
```
User (Mobile App)
    ↓ [Open Marketplace]
MarketplaceScreen
    ↓ [GET /products/getallparentcategory]
Category.getAllParentCategories()
    ↓ [Fetch with populated subcategories]
Database
    ↓ [Return categories]
Display Categories
    ↓ [User selects category]
    ↓ [POST /products/getonecategory]
Category.getParentCategoryById()
    ↓ [Fetch with products]
Database
    ↓ [Return category with products]
Display Products Grid
    ↓ [User taps product]
Navigate to ProductDetailScreen
```

### Product Detail Flow
```
User (Mobile App)
    ↓ [Tap product]
ProductDetailScreen
    ↓ [GET /products/getproductbyId/:id]
Product.getProductById()
    ↓ [Find product]
    ↓ [Populate sellers with user details]
    ↓ [Apply backward compatibility]
    ↓ [Format seller data]
Database
    ↓ [Return product with sellers]
Display Product Details
    ↓ [User selects seller]
Update Price/Size Options
    ↓ [User selects size]
Update Quantity Limits
    ↓ [User adds to cart]
CartContext.addToCart()
    ↓ [POST /products/addtocartapp]
Cart Updated
```

### Product Search Flow
```
User (Mobile App)
    ↓ [Enter search query]
SearchTopBar
    ↓ [OnChangeText callback]
MarketplaceScreen.handleSearch()
    ↓ [GET /products/searchproducts?search=query]
Product.searchProduct()
    ↓ [Create regex pattern]
    ↓ [Search name, description, tags]
    ↓ [Apply pagination]
Database
    ↓ [Return matching products]
Display Search Results
```

### Multi-Seller Product Flow
```
Seller A creates Product X
    ↓ [New product created]
    ↓ [Seller A in sellers array]
Database saves Product X

Seller B wants to sell Product X
    ↓ [POST /products/createproduct]
Product.createProduct()
    ↓ [Generate slug]
    ↓ [Find existing product by slug]
    ↓ [Product exists!]
    ↓ [Check if Seller B already selling]
    ↓ [Not selling yet]
    ↓ [Add Seller B to sellers array]
Database updates Product X
    ↓ [Now has 2 sellers]

User views Product X
    ↓ [GET /products/getproductbyId]
    ↓ [Returns product with 2 sellers]
ProductDetailScreen
    ↓ [Shows seller selector]
    ↓ [User can choose Seller A or B]
    ↓ [Different prices/stock per seller]
```

---

## KEY FEATURES & CAPABILITIES

### 1. Multi-Seller Marketplace
- Same product can be sold by multiple sellers
- Seller-specific pricing and stock
- Seller selector in product details
- Competitive pricing environment

### 2. Hierarchical Categories
- Parent categories (e.g., "Seeds")
- Subcategories (e.g., "Vegetable Seeds")
- Products under subcategories
- Easy navigation and organization

### 3. Advanced Search & Filtering
- Text search (name, description, tags)
- Category filtering (multiple)
- Price range filtering
- Discount percentage filtering
- Rating filtering
- Tag filtering
- Multiple sort options
- Pagination support

### 4. Size-Based Pricing
- Multiple size variants per product
- Different prices per size
- Stock tracking per size
- Size selector in UI

### 5. Product Images
- Multiple images per product
- Cloudinary integration
- Image carousel in detail view
- Thumbnail in list view

### 6. Bulk Upload
- Upload multiple products at once
- Unique key-based image mapping
- Batch processing
- Error handling per product

### 7. Product Editing
- Seller-specific field updates
- Image management (add/delete)
- Category migration
- Price/stock updates

### 8. Stock Management
- Per-size stock tracking
- Low stock alerts (≤10 units)
- Stock-aware quantity selection
- Out of stock indication

### 9. Product Discovery
- Similar products recommendation
- Category-based browsing
- Search suggestions
- Popular products

### 10. Seller Dashboard
- View all seller products
- Search seller products
- Low stock filtering
- Quick edit/delete actions

---

## BUSINESS RULES

### Product Creation
1. Seller must be authenticated
2. All required fields must be provided
3. At least one image required
4. Price must be greater than 0
5. Discounted price cannot exceed original price
6. Category must exist
7. Product slug auto-generated from name
8. If product exists (by slug/model): Add seller instead of creating new

### Multi-Seller
1. Same product can have multiple sellers
2. Each seller has own pricing and stock
3. Seller cannot be added twice to same product
4. Seller-specific fields: price_size, fullShopDetails, deliveryInfo, warranty
5. Common fields: name, description, images, category, tags

### Stock Management
1. Stock tracked per size per seller
2. Cannot add to cart if out of stock
3. Quantity selector limited by available stock
4. Low stock threshold: ≤10 units

### Product Editing
1. Only seller who added product can edit their data
2. Can update seller-specific fields only
3. Can add/delete images
4. Can change category (updates both old and new)
5. Cannot edit other sellers' data

### Product Deletion
1. Only seller who added product can delete
2. Removes product from category
3. Removes product from user's products
4. Uses transaction for data consistency

### Search & Filter
1. Search is case-insensitive
2. Searches name, description, and tags
3. Multiple filters can be combined
4. Results paginated (default 10 per page)
5. Sort options affect result order

### Categories
1. Parent categories contain subcategories
2. Subcategories contain products
3. Products belong to one subcategory
4. Category images required
5. Admin can create parent categories
6. Sellers can create subcategories

---

## SECURITY FEATURES

### 1. Authentication
- JWT required for product creation
- Role-based access (Seller for create/edit)
- Admin role for parent categories

### 2. Authorization
- Sellers can only edit their own products
- Ownership verification before edit/delete
- User-product relationship validation

### 3. Input Validation
- Required field checking
- Price validation (positive numbers)
- Discount validation (≤ original price)
- Image format validation
- Category existence validation

### 4. Data Integrity
- Transaction support for delete operations
- Cascading updates (category changes)
- Reference integrity (user-product links)

---

## ERROR HANDLING

### Frontend
- Loading states for async operations
- Error states with retry options
- Empty states with helpful messages
- Toast notifications for user actions
- Graceful degradation (missing images, etc.)

### Backend
- Async error handler wrapper
- Specific error messages
- HTTP status codes
- Validation error details
- Transaction rollback on failures

### Common Errors
- 400: Bad request (validation failures)
- 401: Unauthorized (not seller)
- 403: Forbidden (not owner)
- 404: Not found (product/category)
- 409: Conflict (seller already added)
- 500: Internal server error

---

## PERFORMANCE OPTIMIZATIONS

### 1. Database
- Indexed fields: productSlug, modelNumber
- Sparse indexes for optional fields
- Lean queries for read-only operations
- Aggregation pipeline for complex filters
- Pagination to limit result sets

### 2. Images
- Cloudinary CDN for fast delivery
- Image optimization (1000x1000)
- Lazy loading in lists
- Thumbnail generation

### 3. Frontend
- FlatList for efficient rendering
- Image caching
- Debounced search input
- Pull-to-refresh for data updates
- Conditional rendering

### 4. API
- Minimal data transfer (select specific fields)
- Populated queries only when needed
- Batch operations (bulk upload)
- Response compression

---

## TESTING CONSIDERATIONS

### Unit Tests
- Slug generation
- Price validation
- Stock calculation
- Seller data formatting

### Integration Tests
- Product creation flow
- Multi-seller addition
- Product editing
- Category management
- Search functionality
- Filter combinations

### E2E Tests
- Complete product creation journey
- Browse and search
- Product detail view
- Add to cart from product
- Seller product management

---

## FUTURE ENHANCEMENTS

1. **Product Variants**: Color, material options beyond size
2. **Product Comparison**: Side-by-side comparison tool
3. **Price History**: Track price changes over time
4. **Stock Alerts**: Notify when product back in stock
5. **Seller Ratings**: Rate sellers separately from products
6. **Product Videos**: Video support in addition to images
7. **AR Preview**: Augmented reality product preview
8. **Bulk Edit**: Edit multiple products at once
9. **Product Templates**: Reusable product templates
10. **Import/Export**: CSV import/export for products
11. **Product Bundles**: Sell multiple products together
12. **Dynamic Pricing**: Time-based or quantity-based pricing
13. **Product Recommendations**: AI-powered suggestions
14. **Inventory Sync**: Integration with external inventory systems
15. **Product Analytics**: View counts, conversion rates

---

## ENVIRONMENT VARIABLES

```env
# Cloudinary
CLOUD_NAME=your_cloud_name
API_KEY=your_api_key
API_SECRET=your_api_secret
FOLDER_NAME=products

# Database
DATABASE_URL=mongodb://...
```

---

## CONCLUSION

The Product Management feature provides a comprehensive, scalable solution for managing a multi-seller agricultural marketplace. It supports hierarchical categorization, advanced search and filtering, multi-seller competitive pricing, size-based variants, bulk operations, and complete product lifecycle management. The system is designed with performance, security, and user experience as top priorities, providing both sellers and buyers with powerful tools for product discovery and management.
