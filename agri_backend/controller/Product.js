
const Product = require('../models/Product')
const Category = require('../models/Category')
const ParenstCategory = require('../models/ParentCategory');
const User = require('../models/Users')
const mongoose = require('mongoose')
const { uploadUmageToCloudinary } = require('../utils/ImageUploader')
const{asyncHandler}=require('../utils/error')


exports.createProduct = asyncHandler(async (req, res) => {
            const userId = req.user.id;
           
            let { name, price_size, category, description, tag: _tag, badges, fullShopDetails, modelNumber, brand, deliveryInfo, warranty } = req.body;
            
            // Trim and clean the product name to ensure consistent slug generation
            name = name ? name.trim().replace(/\s+/g, ' ') : name;
            
            const parsedPriceSize = Array.isArray(price_size) ? price_size : JSON.parse(price_size);
            const images = Array.isArray(req.files.image) ? req.files.image : [req.files.image];
    
            if (!images || !name || !parsedPriceSize || !category || !description || !_tag || !badges || !fullShopDetails) {
                return res.status(400).json({ success: false, msg: 'Please fill all required fields' });
            }

            // Validate price_size data
            const invalidPrices = parsedPriceSize.some(
                item => !item.price || !item.discountedPrice || item.discountedPrice === 0 || item.price === 0
            );
            
            if (invalidPrices) {
                return res.status(400).json({ 
                    success: false, 
                    msg: 'Invalid price data. Price and discounted price must be greater than 0.' 
                });
            }

            // Validate that discounted price is not greater than original price
            const invalidDiscount = parsedPriceSize.some(
                item => Number(item.discountedPrice) > Number(item.price)
            );
            
            if (invalidDiscount) {
                return res.status(400).json({ 
                    success: false, 
                    msg: 'Discounted price cannot be greater than original price.' 
                });
            }
    
            const user = await User.findById(userId);
            if (!user || user.accountType !== "Seller") {
                return res.status(401).json({ success: false, msg: 'Only sellers can create products' });
            }
    
            const categoryExists = await Category.findById(category);
            if (!categoryExists) {
                return res.status(404).json({ success: false, msg: 'Category not found' });
            }

            // Generate product slug from cleaned name
            const productSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
            // Check if product already exists using slug or modelNumber
            let existingProduct = null;
            if (modelNumber && modelNumber.trim()) {
                // For model number, also check with trimmed name for better matching
                existingProduct = await Product.findOne({ 
                    modelNumber: modelNumber.trim(),
                    productSlug: productSlug 
                });
            }
            
            // If not found by model number, try by slug alone
            if (!existingProduct && productSlug) {
                existingProduct = await Product.findOne({ productSlug });
            }

            // If product exists, add this seller to it
            if (existingProduct) {
                // Check if seller already exists for this product
                const sellerExists = existingProduct.sellers.some(s => s.sellerId.toString() === userId);
                
                if (sellerExists) {
                    return res.status(400).json({ 
                        success: false, 
                        msg: 'You are already selling this product. Please update your existing offer instead.' 
                    });
                }

                // Add new seller to existing product
                existingProduct.sellers.push({
                    sellerId: userId,
                    price_size: parsedPriceSize,
                    fullShopDetails,
                    deliveryInfo: deliveryInfo || 'Standard delivery',
                    warranty: warranty || 'No warranty'
                });

                const updatedProduct = await existingProduct.save();
                await User.findByIdAndUpdate(userId, { $push: { products: updatedProduct._id } }, { new: true });

                console.log("Seller added to existing product:", updatedProduct);
                return res.status(201).json({ 
                    success: true, 
                    msg: 'You have been added as a seller for this existing product', 
                    product: updatedProduct,
                    isNewProduct: false
                });
            }
    
            // Product doesn't exist, create new one
            const uploadedImages = [];
            for (const imageFile of images) {
                const uploadedImage = await uploadUmageToCloudinary(imageFile, process.env.FOLDER_NAME, 1000, 1000);
                uploadedImages.push(uploadedImage.secure_url);
            }
    
            const tag = JSON.parse(_tag);
    
            const newProduct = new Product({
                name,
                productSlug,
                modelNumber: modelNumber || undefined,
                brand: brand || '',
                category,
                description,
                tag,
                images: uploadedImages,
                badges,
                sellers: [{
                    sellerId: userId,
                    price_size: parsedPriceSize,
                    fullShopDetails,
                    deliveryInfo: deliveryInfo || 'Standard delivery',
                    warranty: warranty || 'No warranty'
                }]
            });
    
            const savedProduct = await newProduct.save();
    
            await User.findByIdAndUpdate(userId, { $push: { products: savedProduct._id } }, { new: true });
            await Category.findByIdAndUpdate(category, { $push: { product: savedProduct._id } }, { new: true });
    
            console.log("Newly created product:", savedProduct);
            res.status(201).json({ success: true, msg: 'Product created successfully', product: savedProduct, isNewProduct: true });
    });




exports.createBulkUpload = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  console.log(req.body.bulkData);
  console.log(req.files);
  const folder = process.env.FOLDER_NAME || 'products';

  // 1. Parse bulk data
  let bulkData;
  if (Array.isArray(req.body.bulkData)) {
    bulkData = req.body.bulkData;
  } else {
    try {
      bulkData = JSON.parse(req.body.bulkData);
    } catch (error) {
      return res.status(400).json({ success: false, msg: 'Invalid bulkData JSON' });
    }
  }

  if (!bulkData || !Array.isArray(bulkData)) {
    return res.status(400).json({ success: false, msg: 'Invalid bulk data' });
  }

  // 2. Validate seller
  const user = await User.findById(userId);
  if (!user || user.accountType !== 'Seller') {
    return res.status(401).json({ success: false, msg: 'Only sellers can upload products' });
  }

  const createdProducts = [];

  for (let i = 0; i < bulkData.length; i++) {
    const row = bulkData[i];
    try {
      const {
        name,
        uniqueKey, // Get the uniqueKey from frontend
        price_size,
        category,
        description,
        tag,
        badges,
        fullShopDetails = "",
      } = row;

      const trimmedName = name?.trim();

      if (
        !trimmedName ||
        !Array.isArray(price_size) || price_size.length === 0 ||
        !description
      ) {
        console.log(`Skipping invalid product: ${trimmedName}`);
        continue;
      }

      const categoryDoc = await Category.findById(category);
      if (!categoryDoc) {
        console.log(`Category not found: ${category}`);
        continue;
      }

      // 3. Handle Image Uploads - UPDATED to use uniqueKey
      let uploadedImages = [];
      
      // Look for images with the uniqueKey format
      const imageFieldName = `images_${uniqueKey}[]`;
      
      if (req.files && req.files[imageFieldName]) {
        const files = Array.isArray(req.files[imageFieldName])
          ? req.files[imageFieldName]
          : [req.files[imageFieldName]];

        for (const file of files) {
          const uploaded = await uploadUmageToCloudinary(file, folder, 1000, 1000);
          uploadedImages.push(uploaded.secure_url);
        }
      }
      
      // FALLBACK: Also check for old index-based format for backward compatibility
      if (uploadedImages.length === 0) {
        const oldImageFieldName = `image_${i}`;
        if (req.files && req.files[oldImageFieldName]) {
          const files = Array.isArray(req.files[oldImageFieldName])
            ? req.files[oldImageFieldName]
            : [req.files[oldImageFieldName]];

          for (const file of files) {
            const uploaded = await uploadUmageToCloudinary(file, folder, 1000, 1000);
            uploadedImages.push(uploaded.secure_url);
          }
        }
      }
      
      console.log(`Product: ${trimmedName}, Images found: ${uploadedImages.length}`);

      const parsedTag = typeof tag === "string" ? JSON.parse(tag) : tag;

      // 4. Create product
      const newProduct = new Product({
        name: trimmedName,
        category,
        description,
        tag: parsedTag,
        images: uploadedImages,
        badges,
        sellers: [
          {
            sellerId: userId,
            price_size,
            fullShopDetails,
          },
        ],
      });

      const savedProduct = await newProduct.save();

      // 5. Push product into user and category
      await User.findByIdAndUpdate(userId, { $push: { products: savedProduct._id } });
      await Category.findByIdAndUpdate(category, { $push: { product: savedProduct._id } });

      createdProducts.push(savedProduct);
    } catch (err) {
      console.error(`Error uploading product "${row.name || 'Unnamed'}":`, err);
    }
  }

  res.status(201).json({
    success: true,
    msg: `${createdProducts.length} products uploaded successfully`,
    products: createdProducts,
  });
});






// find product by id

exports.getProductById = asyncHandler(async (req, res) => {

        const productId = req.params.productId;

        const product = await Product.findById(productId)
            .populate({
                path: 'sellers.sellerId',
                select: 'Name email image accountType',
                populate: {
                    path: 'additionalDetails',
                    select: 'firstName lastName contactNo'
                }
            })
            .populate('ratingandreview');
            
        if (!product) {
            return res.status(404).json({
                success: false,
                msg: 'Product not found'
            })
        }

        // BACKWARD COMPATIBILITY: Handle old products with root-level fields
        let productObj = product.toObject();
        
        // If sellers array is empty but root-level fields exist, migrate them
        if ((!productObj.sellers || productObj.sellers.length === 0) && productObj.sellerId) {
            productObj.sellers = [{
                sellerId: productObj.sellerId,
                price_size: productObj.price_size || [],
                fullShopDetails: productObj.fullShopDetails || 'Shop Details',
                deliveryInfo: 'Standard delivery',
                warranty: 'No warranty'
            }];
        }

        // Ensure sellers array exists
        if (!productObj.sellers || productObj.sellers.length === 0) {
            productObj.sellers = [{
                sellerId: null,
                price_size: productObj.price_size || [],
                fullShopDetails: productObj.fullShopDetails || 'Shop Details',
                deliveryInfo: 'Standard delivery',
                warranty: 'No warranty'
            }];
        }

        // Format sellers data for frontend
        const formattedProduct = {
            ...productObj,
            sellersCount: productObj.sellers.length,
            allSellers: productObj.sellers.map(seller => {
                let sellerName = 'Unknown Seller';
                let sellerPhone = null;
                
                // Try to get name from User.Name first
                if (seller.sellerId?.Name) {
                    sellerName = seller.sellerId.Name;
                } 
                // Then try additionalDetails (Profile)
                else if (seller.sellerId?.additionalDetails?.firstName) {
                    const firstName = seller.sellerId.additionalDetails.firstName;
                    const lastName = seller.sellerId.additionalDetails.lastName || '';
                    sellerName = `${firstName} ${lastName}`.trim();
                } 
                // Fallback to fullShopDetails
                else if (seller.fullShopDetails) {
                    sellerName = seller.fullShopDetails;
                }
                
                // Get phone number
                if (seller.sellerId?.additionalDetails?.contactNo) {
                    sellerPhone = seller.sellerId.additionalDetails.contactNo;
                }
                
                return {
                    sellerId: seller.sellerId?._id || seller.sellerId,
                    sellerName: sellerName,
                    sellerEmail: seller.sellerId?.email,
                    sellerPhone: sellerPhone,
                    price_size: seller.price_size || [],
                    fullShopDetails: seller.fullShopDetails || 'Shop Details',
                    deliveryInfo: seller.deliveryInfo || 'Standard delivery',
                    warranty: seller.warranty || 'No warranty',
                    addedAt: seller.addedAt
                };
            })
        };

        res.status(200).json({
            success: true,
            msg: 'Product found successfully',
            product: formattedProduct
        })  
})

// get all products

exports.getAllProducts = asyncHandler(async (req, res) => {
        const products = await Product.find();

        // BACKWARD COMPATIBILITY: Ensure all products have sellers array
        const formattedProducts = products.map(product => {
            const productObj = product.toObject();
            
            // If sellers array is empty but root-level fields exist, use them
            if ((!productObj.sellers || productObj.sellers.length === 0) && productObj.sellerId) {
                productObj.sellers = [{
                    sellerId: productObj.sellerId,
                    price_size: productObj.price_size || [],
                    fullShopDetails: productObj.fullShopDetails || 'Shop Details',
                    deliveryInfo: 'Standard delivery',
                    warranty: 'No warranty'
                }];
            }
            
            // Ensure sellers array exists
            if (!productObj.sellers || productObj.sellers.length === 0) {
                productObj.sellers = [{
                    sellerId: null,
                    price_size: productObj.price_size || [],
                    fullShopDetails: productObj.fullShopDetails || 'Shop Details',
                    deliveryInfo: 'Standard delivery',
                    warranty: 'No warranty'
                }];
            }
            
            return productObj;
        });

        res.status(200).json({
            success: true,
            msg: 'Products found successfully',
            products: formattedProducts
        })

})

// get product by parent category

exports.getProductsByParentCategory = asyncHandler(async (req, res) => {
        const { parentCategoryId } = req.body;


        const parentCategory = await ParenstCategory.findById(parentCategoryId)
            .populate({
                path: 'subcategories', // Populating subcategories
                populate: {
                    path: 'product', // Populating products inside each subcategory
                },
            });

        if (!parentCategory) {
            return res.status(404).json({ message: 'Parent category not found' });
        }

        // Flattening all products from subcategories into a single array
        const allProducts = parentCategory.subcategories.reduce((acc, subcategories) => {
            return acc.concat(subcategories.product);
        }, []);

        // Return the list of products
        return res.status(200).json(allProducts);

});


//   get product by category

exports.getProductsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.body;

        const category = await Category.findById(categoryId)
            .populate('product');

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Return the list of products
        return res.status(200).json(category.product);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error, please try again' });
    }
};


exports.seachProduct = async (req, res) => {
    try {
        // Accept both 'query' and 'search' parameters for compatibility
        let { query, search, page, limit } = req.query;
        const searchQuery = query || search;
        
        if (!searchQuery) return res.status(400).json({ message: "Query is required" });

        const pageNumber = parseInt(page) || 1;
        const pageSize = parseInt(limit) || 20;

        // Create regex for case-insensitive search
        const searchRegex = new RegExp(searchQuery, 'i');

        // Search in name, description, and tags
        const searchConditions = {
            $or: [
                { name: searchRegex },
                { description: searchRegex },
                { tag: { $elemMatch: { $regex: searchRegex } } }
            ]
        };

        const totalProducts = await Product.countDocuments(searchConditions);

        const products = await Product.find(searchConditions)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize);

        res.json({
            totalProducts,
            totalPages: Math.ceil(totalProducts / pageSize),
            currentPage: pageNumber,
            pageSize,
            products,
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};


// find all product for a seller that listed
exports.getAllProductBySeller = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch all products where the sellerId matches the current user's ID
        const products = await Product.find({ "sellers.sellerId": userId }).populate('category');

        console.log("Products: ", products);

        if (!products || products.length === 0) {
            return res.status(404).json({
                success: false,
                msg: 'No products found for this seller'
            });
        }

        const refinedProducts = products.map(product => {
            const sellerData = product.sellers.find(s => s.sellerId.toString() === userId);
            let totalStock = 0;
            if (sellerData && Array.isArray(sellerData.price_size)) {
              totalStock = sellerData.price_size.reduce((sum, p) => sum + (p.quantity || 0), 0);
            }
          
            return {
              _id: product._id,
              name: product.name,
              category: product.category?.name || product.category,
              images: product.images,
              stock: totalStock,
              price: sellerData?.price_size?.[0]?.discountedPrice || sellerData?.price_size?.[0]?.price || 0,
            };
          });
          
          return res.status(200).json({
            success: true,
            msg: 'Products found successfully',
            products: refinedProducts
          });
          

    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({
            success: false,
            msg: 'Something went wrong while fetching products'
        });
    }
};

// delete products
exports.deleteProduct = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const product = await Product.findOneAndDelete(
      { _id: productId },
      { session }
    );

    if (!product) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, msg: 'Product not found' });
    }


          // string
const isSeller = product.sellers.some(
  (s) => s.sellerId.toString() === userId
);

if (!isSeller) {
  await session.abortTransaction();
  return res.status(403).json({
    success: false,
    msg: 'You are not authorized to delete this product',
  });
}


    await Category.updateOne(
      { _id: product.category },
      { $pull: { products: productId } },
      { session }
    );

    await User.updateOne(
      { _id: userId },
      { $pull: { products: productId } },
      { session }
    );

    // TODO: send notification to admin here (email/queue) if needed

    await session.commitTransaction();
    res.status(200).json({ success: true, msg: 'Product deleted successfully' });
  } catch (err) {
    await session.abortTransaction();
    console.error(err);
    res.status(500).json({
      success: false,
      msg: 'Something went wrong while deleting the product',
    });
  } finally {
    session.endSession();
  }
};

exports.getFilteredProducts = async (req, res) => {

    try {
        const {
            search,
            category,
            minPrice,
            maxPrice,
            minDiscount,
            minRating,
            tags,
            badges,
            sellerId,
            sort = 'newest',
            page = 1,
            limit = 10
        } = req.query;
        // Build the filter object
        const filter = {};

        // Search by name or tags
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { tag: { $in: [new RegExp(search, 'i')] } }
            ];
        }
        //search by category
        if (category) {
            // Split the comma-separated string into an array of IDs
            const categoryIds = category.split(',');
            // Use $in operator to match any product whose category is in the array
            filter.category = { $in: categoryIds };
        }

        // Tags filter (multiple tags possible)
        if (tags) {
            const tagArray = tags.split(',').map(tag => tag.trim());
            filter.tag = { $in: tagArray };
        }

        // Badge filter
        if (badges) {
            filter.badges = badges;
        }

        // Seller filter
        if (sellerId) {
            filter.sellerId = sellerId;
        }

        // Rating filter
        if (minRating) {
            filter.avgRating = { $gte: parseFloat(minRating) };
        }

        if (minPrice || maxPrice) {
            filter['price_size.price'] = {};

            if (minPrice) {
                filter['price_size.price'].$gte = parseFloat(minPrice);
            }

            if (maxPrice) {
                filter['price_size.price'].$lte = parseFloat(maxPrice);
            }
        }

        // Discount filter (calculated as percentage)
        if (minDiscount) {
            // We'll handle this in the aggregation pipeline
        }

        // Set up sort options
        let sortOption = {};
        switch (sort) {
            case 'newest':
                sortOption = { createdAt: -1 };
                break;
            case 'price_asc':
                // Will use $sort in aggregation pipeline
                break;
            case 'price_desc':
                // Will use $sort in aggregation pipeline
                break;
            case 'rating':
                sortOption = { avgRating: -1 };
                break;
            case 'popularity':
                sortOption = { 'ratings.count': -1 };
                break;
            case 'discount':
                // Will use $sort in aggregation pipeline
                break;
            default:
                sortOption = { createdAt: -1 }; // Default to newest
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build the aggregation pipeline
        const pipeline = [];

        // Match stage (apply filters)
        pipeline.push({ $match: filter });

        // Extract price_size from first seller to root level for easier access
        pipeline.push({
            $addFields: {
                price_size: { 
                    $arrayElemAt: ['$sellers.price_size', 0] 
                }
            }
        });

        // Unwind the price_size array for price/discount filtering
        if (minPrice || maxPrice || minDiscount || sort === 'price_asc' || sort === 'price_desc' || sort === 'discount') {
            pipeline.push({ $unwind: '$price_size' });

            // Additional filtering after unwind
            const additionalMatch = {};

            // Price range filtering (after unwind)
            if (minPrice) {
                additionalMatch['price_size.price'] = additionalMatch['price_size.price'] || {};
                additionalMatch['price_size.price'].$gte = parseFloat(minPrice);
            }

            if (maxPrice) {
                additionalMatch['price_size.price'] = additionalMatch['price_size.price'] || {};
                additionalMatch['price_size.price'].$lte = parseFloat(maxPrice);
            }

            // Discount percentage filtering
            if (minDiscount) {
                pipeline.push({
                    $addFields: {
                        discountPercentage: {
                            $multiply: [
                                {
                                    $divide: [
                                        { $subtract: ['$price_size.price', '$price_size.discountedPrice'] },
                                        '$price_size.price'
                                    ]
                                },
                                100
                            ]
                        }
                    }
                });

                additionalMatch.discountPercentage = { $gte: parseFloat(minDiscount) };
            }

            if (Object.keys(additionalMatch).length > 0) {
                pipeline.push({ $match: additionalMatch });
            }

            // Group back after unwinding
            pipeline.push({
                $group: {
                    _id: '$_id',
                    name: { $first: '$name' },
                    price_size: { $push: '$price_size' },
                    images: { $first: '$images' },
                    avgRating: { $first: '$avgRating' },
                    ratings: { $first: '$ratings' },
                    createdAt: { $first: '$createdAt' },
                    badges: { $first: '$badges' },
                    // Store min/max values for sorting
                    minPrice: { $min: '$price_size.price' },
                    maxPrice: { $max: '$price_size.price' },
                    maxDiscount: {
                        $max: {
                            $cond: [
                                { $eq: ['$price_size.price', 0] },
                                0,
                                {
                                    $multiply: [
                                        {
                                            $divide: [
                                                { $subtract: ['$price_size.price', '$price_size.discountedPrice'] },
                                                '$price_size.price'
                                            ]
                                        },
                                        100
                                    ]
                                }
                            ]
                        }
                    }
                }
            });
        }

        // Sort based on selected option
        if (sort === 'price_asc') {
            pipeline.push({ $sort: { minPrice: 1 } });
        } else if (sort === 'price_desc') {
            pipeline.push({ $sort: { minPrice: -1 } });
        } else if (sort === 'discount') {
            pipeline.push({ $sort: { maxDiscount: -1 } });
        } else {
            pipeline.push({ $sort: sortOption });
        }

        // Pagination
        pipeline.push({ $skip: skip });
        pipeline.push({ $limit: parseInt(limit) });

        // Project only required fields
        pipeline.push({
            $project: {
                _id: 1,
                name: 1,
                price_size: 1,
                images: { $arrayElemAt: ["$images", 0] }, // First image only
                avgRating: 1,
            }
        });

        // Execute the aggregation pipeline
        const products = await Product.aggregate(pipeline);

        // Get total count for pagination
        const countPipeline = [...pipeline];
        // Remove skip, limit and project from count pipeline
        countPipeline.splice(countPipeline.findIndex(stage => Object.keys(stage)[0] === '$skip'), 3);
        countPipeline.push({ $count: 'total' });

        const totalResults = await Product.aggregate(countPipeline);
        const total = totalResults.length > 0 ? totalResults[0].total : 0;

        res.status(200).json({
            success: true,
            data: {
                products,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products',
            error: error.message
        });
    }
};



exports.editProduct = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const productId = req.params.productId;
  const product = await Product.findById(productId);

  if (!product) {
    return res.status(404).json({
      success: false,
      msg: "Product not found",
    });
  }

  // Find seller index
  const sellerIndex = product.sellers.findIndex(
    (seller) => seller.sellerId.toString() === userId
  );

  if (sellerIndex === -1) {
    return res.status(401).json({
      success: false,
      msg: "You are not authorized to edit this product",
    });
  }

  const {
    name,
    price_size,
    category,
    description,
    tag: _tag,
    badges,
    fullShopDetails,
    deletedImages, // array of URLs or publicIds from frontend
  } = req.body;

  // ✅ Parse price_size safely
  let parsedPriceSize;
  try {
    parsedPriceSize = Array.isArray(price_size)
      ? price_size
      : JSON.parse(price_size);

    const validatePriceSize = (priceSizeArray) => {
      console.log(priceSizeArray);
      if (!Array.isArray(priceSizeArray)) return false;
      return priceSizeArray.every(
        (item) =>
          typeof item.price === "number" &&
          typeof item.discountedPrice === "number" &&
          typeof item.size === "string" &&
          typeof item.quantity === "number"
      );
    };

    if (!validatePriceSize(parsedPriceSize)) {
      return res.status(400).json({
        success: false,
        msg: "Invalid price_size format",
      });
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      msg: "Error parsing price_size",
    });
  }

  // ✅ Handle images
  let updatedImages = [...product.images];

  // 🔹 Delete selected images
  if (deletedImages && Array.isArray(deletedImages)) {
    await Promise.all(
      deletedImages.map(async (img) => {
        try {
          // If you store publicId in DB, use directly
          // Otherwise extract publicId from URL
          const publicId = img.includes("/")
            ? img.split("/").pop().split(".")[0]
            : img;

          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error("Cloudinary deletion error:", err);
        }
      })
    );

    // Remove from DB
    updatedImages = updatedImages.filter((img) => !deletedImages.includes(img));
  }

  // 🔹 Add new images
  if (req.files && req.files.image) {
    const images = Array.isArray(req.files.image)
      ? req.files.image
      : [req.files.image];

    const uploadedImages = await Promise.all(
      images.map(async (image) => {
        const uploadResult = await uploadUmageToCloudinary(
          image,
          process.env.FOLDER_NAME,
          1000,
          1000
        );
        return uploadResult.secure_url;
      })
    );

    updatedImages = [...updatedImages, ...uploadedImages];
  }

  // ✅ Handle category change
  if (category && category !== product.category.toString()) {
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        msg: "New category not found",
      });
    }

    await Category.findByIdAndUpdate(product.category, {
      $pull: { product: productId },
    });

    await Category.findByIdAndUpdate(category, {
      $push: { product: productId },
    });
  }

  // ✅ Update seller-specific fields
  product.sellers[sellerIndex].price_size =
    parsedPriceSize || product.sellers[sellerIndex].price_size;
  product.sellers[sellerIndex].fullShopDetails =
    fullShopDetails || product.sellers[sellerIndex].fullShopDetails;

  // ✅ Update common product fields
  product.name = name || product.name;
  product.description = description || product.description;
  product.category = category || product.category;
  product.tag = _tag ? JSON.parse(_tag) : product.tag;
  product.badges = badges || product.badges;
  product.images = updatedImages;

  // ✅ Save changes
  await product.save();

  res.status(200).json({
    success: true,
    msg: "Product updated successfully",
    product,
  });
});


 



// Controller to add a seller to an existing product
exports.addSellerToProduct = asyncHandler(async (req, res) => {
    
        const userId = req.user.id;
        const { productId } = req.params;
        const { price_size, fullShopDetails, deliveryInfo, warranty } = req.body;

        // Parse price_size if sent as string
        const parsedPriceSize = Array.isArray(price_size)
            ? price_size
            : JSON.parse(price_size);

        // Validate inputs
        if (!parsedPriceSize || !fullShopDetails) {
            return res.status(400).json({
                success: false,
                msg: 'Missing price/size or shop details',
            });
        }

        // Check if user is a seller
        const user = await User.findById(userId);
        if (!user || user.accountType !== 'Seller') {
            return res.status(403).json({
                success: false,
                msg: 'Only sellers can sell products',
            });
        }

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                msg: 'Product not found',
            });
        }

        // Check if seller already added
        const alreadySelling = product.sellers.some(s => s.sellerId.toString() === userId);
        if (alreadySelling) {
            return res.status(409).json({
                success: false,
                msg: 'Seller already added to this product',
            });
        }

        // Push seller to product
        product.sellers.push({
            sellerId: userId,
            price_size: parsedPriceSize,
            fullShopDetails,
            deliveryInfo: deliveryInfo || 'Standard delivery',
            warranty: warranty || 'No warranty'
        });

        await product.save();

        // Update seller's product list
        await User.findByIdAndUpdate(userId, {
            $addToSet: { products: product._id }
        });

        res.status(200).json({
            success: true,
            msg: 'Seller added to product successfully',
            product
        });

  
});
