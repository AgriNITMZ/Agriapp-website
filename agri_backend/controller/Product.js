const Product = require('../models/Product')
const Category = require('../models/Category')
const ParenstCategory = require('../models/ParentCategory');
const User = require('../models/Users')
const { uploadUmageToCloudinary } = require('../utils/ImageUploader')


exports.createProduct = async (req, res) => {
        try {
            const userId = req.user.id;
            console.log("User ID: ", userId);
    
            const { name, price_size, category, description, tag: _tag, badges, fullShopDetails } = req.body;
            const parsedPriceSize = Array.isArray(price_size) ? price_size : JSON.parse(price_size);
            const images = Array.isArray(req.files.image) ? req.files.image : [req.files.image];
    
            if (!images || !name || !parsedPriceSize || !category || !description || !_tag || !badges || !fullShopDetails) {
                return res.status(400).json({ success: false, msg: 'Please fill all required fields' });
            }
    
            const user = await User.findById(userId);
            if (!user || user.accountType !== "Seller") {
                return res.status(401).json({ success: false, msg: 'Only sellers can create products' });
            }
    
            const categoryExists = await Category.findById(category);
            if (!categoryExists) {
                return res.status(404).json({ success: false, msg: 'Category not found' });
            }
    
            const uploadedImages = [];
            for (const imageFile of images) {
                const uploadedImage = await uploadUmageToCloudinary(imageFile, process.env.FOLDER_NAME, 1000, 1000);
                uploadedImages.push(uploadedImage.secure_url);
            }
    
            const tag = JSON.parse(_tag);
    
            const newProduct = new Product({
                name,
                category,
                description,
                tag,
                images: uploadedImages,
                badges,
                sellers: [{
                    sellerId: userId,
                    price_size: parsedPriceSize,
                    fullShopDetails,
                   
                }]
            });
    
            const savedProduct = await newProduct.save();
    
            await User.findByIdAndUpdate(userId, { $push: { products: savedProduct._id } }, { new: true });
            await Category.findByIdAndUpdate(category, { $push: { product: savedProduct._id } }, { new: true });
    
            console.log("Newly created product:", savedProduct);
            res.status(201).json({ success: true, msg: 'Product created successfully', product: savedProduct });
        } catch (error) {
            console.error("Error creating product:", error);
            res.status(500).json({ success: false, msg: 'Something went wrong while creating the product' });
        }
    };

// find product by id

exports.getProductById = async (req, res) => {
    try {

        const productId = req.params.productId;

        const product = await Product.findById(productId)
        if (!product) {
            return res.status(404).json({
                success: false,
                msg: 'Product not found'
            })
        }

        res.status(200).json({
            success: true,
            msg: 'Product found successfully',
            product
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: 'Some thing error while finding product'
        })
    }
}

// get all products

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find()

        res.status(200).json({
            success: true,
            msg: 'Products found successfully',
            products
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: 'Some thing error while finding products'
        })
    }
}

// get product by parent category

exports.getProductsByParentCategory = async (req, res) => {
    try {
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

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error, please try again' });
    }
};


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
        let { query, page, limit } = req.query;
        if (!query) return res.status(400).json({ message: "Query is required" });

        const words = query.split(" "); // Split query into words
        const searchRegexArray = words.map(word => new RegExp(word, 'i')); // Create regex for each word

        const pageNumber = parseInt(page);
        const pageSize = parseInt(limit);

        const totalProducts = await Product.countDocuments({
            tag: { $in: searchRegexArray } // Match if any tag contains any word
        });

        const products = await Product.find({
            tag: { $in: searchRegexArray }
        })
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
    try {
        const userId = req.user.id
        const productId = req.params.productId
        const product = await Product.findById(productId)
        if (!product) {
            return res.status(404).json({
                success: false,
                msg: 'Product not found'
            })
        }

        if (product.sellerId != userId) {
            return res.status(401).json({
                success: false,
                msg: 'You are not authorized to delete this product'
            })
        }

        await Product.findByIdAndDelete(productId)
        // also remove from category and user schema
        await Category.findByIdAndUpdate(product.category, {
            $pull: {
                product: productId
            }
        })
        await User.findByIdAndUpdate(userId, {
            $pull: {
                products: productId
            }
        })
        // send notification to admin

        res.status(200).json({
            success: true,
            msg: 'Product deleted successfully'
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: 'Some thing error while deleting product'
        })
    }
}
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

exports.editProduct = async (req, res) => {
    try {
      const userId = req.user.id;
      const productId = req.params.productId;
      const product = await Product.findById(productId);
  
      if (!product) {
        return res.status(404).json({
          success: false,
          msg: 'Product not found',
        });
      }
  
      // Find the seller's entry in the sellers array
      const sellerIndex = product.sellers.findIndex(
        (seller) => seller.sellerId.toString() === userId
      );
  
      if (sellerIndex === -1) {
        return res.status(401).json({
          success: false,
          msg: 'You are not authorized to edit this product',
        });
      }
  
      const { name, price_size, category, description, tag: _tag, badges, fullShopDetails } = req.body;
  
      // Validate and parse price_size
      let parsedPriceSize;
      try {
        parsedPriceSize = Array.isArray(price_size)
          ? price_size
          : JSON.parse(price_size);
  
        const validatePriceSize = (priceSizeArray) => {
          if (!Array.isArray(priceSizeArray)) return false;
          return priceSizeArray.every(
            (item) =>
              typeof item.price === 'number' &&
              typeof item.discountedPrice === 'number' &&
              typeof item.size === 'string' &&
              typeof item.quantity === 'number'
          );
        };
  
        if (!validatePriceSize(parsedPriceSize)) {
          return res.status(400).json({
            success: false,
            msg: 'Invalid price_size format',
          });
        }
      } catch (error) {
        return res.status(400).json({
          success: false,
          msg: 'Error parsing price_size',
        });
      }
  
      // Handle image updates
      let updatedImages = product.images;
      if (req.files && req.files.image) {
        const images = Array.isArray(req.files.image) ? req.files.image : [req.files.image];
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
        updatedImages = [...product.images, ...uploadedImages]; // Append new images
      }
  
      // Handle category change
      if (category && category !== product.category.toString()) {
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
          return res.status(404).json({
            success: false,
            msg: 'New category not found',
          });
        }
  
        // Remove from old category
        await Category.findByIdAndUpdate(product.category, {
          $pull: { product: productId },
        });
  
        // Add to new category
        await Category.findByIdAndUpdate(category, {
          $push: { product: productId },
        });
      }
  
      // Update seller-specific data
      product.sellers[sellerIndex].price_size = parsedPriceSize || product.sellers[sellerIndex].price_size;
      product.sellers[sellerIndex].fullShopDetails = fullShopDetails || product.sellers[sellerIndex].fullShopDetails;
  
      // Update common product-level data
      product.name = name || product.name;
      product.description = description || product.description;
      product.category = category || product.category;
      product.tag = _tag ? JSON.parse(_tag) : product.tag;
      product.badges = badges || product.badges;
      product.images = updatedImages;
  
      // Save the updated product
      await product.save();
  
      res.status(200).json({
        success: true,
        msg: 'Product updated successfully',
        product,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        msg: 'Something went wrong while updating the product',
      });
    }
  };

 



// Controller to add a seller to an existing product
exports.addSellerToProduct = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;
        const { price_size, fullShopDetails } = req.body;

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

    } catch (err) {
        console.error('Error adding seller to product:', err);
        res.status(500).json({
            success: false,
            msg: 'Internal server error'
        });
    }
};
