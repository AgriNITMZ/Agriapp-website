import axios from 'axios';
import { Shield, ShoppingCart, Star, Stars, Trash2, TrendingUp } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { removeFromWishlist } from '../../slice/wishlistSlice';

const WishList = () => {
  const [wisListproduct, setwishListProduct] = useState(null)
  const [token, setToken] = useState(null);
  const navigate = useNavigate()
  const dispatch=useDispatch()
  const { wishlist } = useSelector((state) => state.wishlist)
  console.log("wishlist", wishlist)


  // const fetchProduct = async () => {
  
  //   try {
  //     const response = await axios.get("http://localhost:4000/api/v1/products/getdetailswishlist", {
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

    dispatch(removeFromWishlist(id))
    
  
    // try {
    //   let response=await axios.post("http://localhost:4000/api/v1/products/removewishlist",{
    //     productId:id
    //   },
    // {
    //   headers: { Authorization: `Bearer ${token}` },
    // })
    // // fetchProduct()
      
    // } catch (error) {
      
    // }
  };

  const handleBuyNow = (id) => {
    // Implement buy now logic here
    console.log('Buying item:', id);
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

  if (! wishlist?.length) {
    return (
      <div className="flex items-center justify-center h-64 mt-16">
        <p className="text-gray-500 text-lg">Your WishList is empty</p>
      </div>
    );
  }
  return (
<div className="mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-6">
        { wishlist.map((item) => (
          <div key={item._id} className="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Image Container */}
              <div className="relative group w-full md:w-48 flex-shrink-0">
                <img
                  src={item.images[0]}
                  alt={item.name}
                  className="w-full h-48 md:h-40 object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              
              {/* Content Container */}
              <div className="flex-grow w-full md:w-auto">
                <div className="space-y-4">
                  {/* Product Name */}
                  <h3 className="text-xl font-semibold text-gray-800 line-clamp-2">
                    {item.name}
                  </h3>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-gray-700">4.3</span>
                      <Star size={18} className="text-yellow-400 fill-yellow-400" />
                    </div>
                    <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                      Quality Assurance
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
                </div>

                {/* Buttons Container */}
                <div className="flex flex-wrap items-center gap-4 mt-6 justify-between lg:justify-end ">
                  <button
                    onClick={() => handleBuyNow(item._id)}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <ShoppingCart size={18} />
                    Buy Now
                  </button>
                  
                  <button
                    onClick={() => handleRemove(item._id)}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200"
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
    </div>


  )
}

export default WishList