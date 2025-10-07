import axios from 'axios';
import { Shield, ShoppingCart, Star, Stars, Trash2, TrendingUp, Heart, Package } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { removeFromWishlist } from '../../slice/wishlistSlice';
import ProfileLayout from '../Profile/Profile';
import toast from 'react-hot-toast';

const WishList = () => {
  const [wisListproduct, setwishListProduct] = useState(null)
  const [token, setToken] = useState(null);
  const navigate = useNavigate()
  const dispatch=useDispatch()
  const { wishlist } = useSelector((state) => state.wishlist)
  console.log("wishlist", wishlist)


  // const fetchProduct = async () => {
  
  //   try {
//     const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/products/getdetailswishlist`, {
//       headers: { Authorization: `Bearer ${token}` },

  //     })
  //     setwishListProduct(response.data.products)

  //     // console.log("wishlist response",response)

  //   } catch (error) {

  //   }
  // }
  const calculateDiscount = (original, discounted) => {
    return Math.round(((original - discounted) / original) * 100);
  };

  const handleRemove = async(id) => {
    dispatch(removeFromWishlist(id));
    toast.success('Item removed from wishlist');
  };

  const handleBuyNow = (id) => {
    navigate(`/product/item/${id}`);
  };

  const handleAddToCart = (item) => {
    // Add to cart logic here
    toast.success('Item added to cart');
    console.log('Adding to cart:', item);
  };
  useEffect(() => {
    const storedTokenData = JSON.parse(localStorage.getItem("token"));
    if (storedTokenData && Date.now() < storedTokenData.expires) {
      setToken(storedTokenData.value);
    } else {
      localStorage.removeItem("token");
      setToken(null);
    }

  }, [])


  useEffect(() => {
    if (token) {
      // fetchProduct()

    }
  }, [token])
  console.log("wishlist response", wisListproduct)

  return (
    <ProfileLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header - Fixed spacing to prevent overlap */}
        <div className="mb-8 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                My Wishlist
              </h1>
              <p className="text-gray-600">
                Save your favorite items for later
              </p>
            </div>
            
            {/* Stats */}
            <div className="mt-4 sm:mt-0 flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-mizoram-600">{wishlist?.length || 0}</div>
                <div className="text-sm text-gray-600">Items</div>
              </div>
            </div>
          </div>
        </div>

        {wishlist?.length ? (
          <div className="grid grid-cols-1 gap-6">
            {wishlist.map((item) => (
              <div key={item._id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 transition-all hover:shadow-xl">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  {/* Image Container */}
                  <div className="relative group w-full md:w-48 flex-shrink-0">
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-full h-48 md:h-40 object-cover rounded-xl shadow-md group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2">
                      <Heart className="w-4 h-4 text-red-500 fill-current" />
                    </div>
                  </div>
                  
                  {/* Content Container */}
                  <div className="flex-grow w-full md:w-auto">
                    <div className="space-y-4">
                      {/* Product Name */}
                      <h3 className="text-xl font-semibold text-gray-800 line-clamp-2 hover:text-mizoram-600 cursor-pointer"
                          onClick={() => navigate(`/product/item/${item._id}`)}>
                        {item.name}
                      </h3>
                      
                      {/* Rating and Quality Badge */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-gray-700">4.3</span>
                          <Star size={18} className="text-yellow-400 fill-yellow-400" />
                        </div>
                        <span className="text-sm text-gray-600 bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                          Quality Assured
                        </span>
                      </div>
                      
                      {/* Price Information */}
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-bold text-gray-900">
                          ₹{item?.price_size[0]?.discountedPrice}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-base text-gray-500 line-through">
                            ₹{item?.price_size[0]?.price}
                          </span>
                          <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                            {calculateDiscount(
                              item?.price_size[0]?.price,
                              item?.price_size[0]?.discountedPrice
                            )}% off
                          </span>
                        </div>
                      </div>

                      {/* Product Description */}
                      {item.description && (
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Buttons Container */}
                    <div className="flex flex-wrap items-center gap-3 mt-6">
                      <button
                        onClick={() => handleBuyNow(item._id)}
                        className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-mizoram-600 rounded-xl hover:bg-mizoram-700 transition-colors duration-200 shadow-lg"
                      >
                        <Package size={18} />
                        Buy Now
                      </button>
                      
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-mizoram-600 bg-mizoram-50 rounded-xl hover:bg-mizoram-100 transition-colors duration-200"
                      >
                        <ShoppingCart size={18} />
                        Add to Cart
                      </button>
                      
                      <button
                        onClick={() => handleRemove(item._id)}
                        className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors duration-200"
                      >
                        <Trash2 size={18} />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-6">
              Save items you love to your wishlist and shop them later
            </p>
            <button
              onClick={() => navigate('/product')}
              className="flex items-center space-x-2 bg-mizoram-600 text-white px-6 py-3 rounded-xl hover:bg-mizoram-700 transition-colors duration-200 shadow-lg mx-auto"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Start Shopping</span>
            </button>
          </div>
        )}

        {/* Help Section */}
        {wishlist?.length > 0 && (
          <div className="mt-8 bg-blue-50 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-start space-x-3">
              <Heart className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-blue-900 mb-1">Wishlist Tips</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Items in your wishlist are saved across all your devices</li>
                  <li>• Get notified when wishlist items go on sale</li>
                  <li>• Share your wishlist with friends and family</li>
                  <li>• Move items to cart when you're ready to purchase</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProfileLayout>


  )
}

export default WishList
