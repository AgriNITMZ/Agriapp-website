const express = require('express');
const router = express.Router()
const {
    createCategory,
    getCategories,
    getCategoryById,
    createParentCategory,
    getAllParentCategories,
    getParentCategoryById,
    getParentCategoriesList

} = require('../controller/Category');
const { auth, isAdmin, isUser, isSeller } = require('../middleware/auth');
const { createProduct,
    getProductById,
    getAllProducts,
    getProductsByParentCategory,
    getProductsByCategory, 
    seachProduct,
    getFilteredProducts,
   
    editProduct,
    addSellerToProduct,
    getAllProductBySeller,
    } = require('../controller/Product');


router.post('/createparentcategory', auth, isAdmin, createParentCategory)
router.get('/getallparentcategory', getAllParentCategories)
router.get('/getcategorylist', getParentCategoriesList)
router.post('/getonecategory', getParentCategoryById)
router.post("/createcategory", auth, isAdmin, createCategory)
router.get('/getCategory', getCategories)
router.post('/particularcreatecategory', getCategoryById)


router.post("/createproduct", auth, isSeller, createProduct)
router.get('/getproductbyId/:productId', getProductById)
router.get('/getallproduct', getAllProducts)
router.get('/getproductbyparentcategory', getProductsByParentCategory)
router.get('/getproductbycategory', getProductsByCategory)




const { addToProductToCart,
    getCartItems,
    removeCartItem, addProductToCartApp, getCartItemsApp, clearCart } = require('../controller/AddToCart');

router.post('/addtocart', auth, addToProductToCart)
router.post('/addtocartapp', auth, isUser, addProductToCartApp)
router.get('/cartitems', auth, getCartItems)
router.get('/cartitemsapp', auth, isUser, getCartItemsApp)
router.delete('/removeitem/:id', auth,  removeCartItem)
router.delete('/clearcart', auth, isUser, clearCart);


// wishlist
const { addToWishList, getWishlistProducts, removeFromWishlist, getWishList, getWishlistProductsMinimal } = require('../controller/WishList')
router.post('/addwishlist', auth,  addToWishList)
router.get('/getdetailswishlist', auth, isUser, getWishlistProducts)
router.get('/getminimalwishlist', auth, isUser, getWishlistProductsMinimal)
router.post('/removewishlist', auth,removeFromWishlist)
router.get('/wishlistid', auth, getWishList)


router.get('/searchProducts/search',seachProduct)
router.get('/sellerProductt',auth,isSeller,getAllProductBySeller)
router.get('/searchProducts/search', seachProduct)
router.get('/filteredproducts', getFilteredProducts)


// rating and review
const { createRatingAndReview, getAllRatingsAndReviews } = require('../controller/RatingAndReview')
router.post("/create", auth, createRatingAndReview);
router.get("/:productId", getAllRatingsAndReviews);


// edit product
router.put("/editproduct/:productId",auth,isSeller,editProduct)
router.put("/addseller/:productId", auth,isSeller,addSellerToProduct);


module.exports = router;