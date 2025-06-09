import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProductListedBySeller } from "../../../services/operations/Seller/listedProductApi";
import { Edit, Trash2, EyeIcon } from 'lucide-react';
import { deleteProduct, getProductById } from "../../../services/operations/singleproductApi";
import { useNavigate } from "react-router-dom";

const ProductTable = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, sellerProducts, error } = useSelector((state) => state.sellerproduct);

  const [token, setToken] = useState(null);

  // Fetch token from localStorage on component mount
  useEffect(() => {
    const storedTokenData = JSON.parse(localStorage.getItem("token"));
    if (storedTokenData && Date.now() < storedTokenData.expires) {
      setToken(storedTokenData.value);
    } else {
      localStorage.removeItem("token");
      setToken(null);
    }
  }, []);

  // Fetch product list when the token is available
  useEffect(() => {
    if (token) {
      dispatch(getProductListedBySeller(token));
    }
  }, [token, dispatch]);

  // Status color mapping
  const getStockStatusColor = (stock) => {
    if (stock === 0) return "text-red-500";
    if (stock < 10) return "text-yellow-500";
    return "text-green-500";
  };

  // Handle view details
  const handleViewDetails=(productId)=>{
    getProductById(productId)
      navigate(`/product/item/${productId}`)
  }
  // Handle delete product
  const handleDeleteProduct = (productId) => {
   deleteProduct(productId)
  };
  const handleEditProduct = (id) => {
    navigate(`/seller/edit-product/${id}`);
  }
console.log("seller product is",sellerProducts)
  return (
    <div className="w-full">
      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          {error}
        </div>
      )}

      {/* Product Table */}
      {!loading && !error && (
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100 border-b sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[250px]">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[80px]">
                  Stock
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Array.isArray(sellerProducts) && sellerProducts.length > 0 ? (
                sellerProducts.map((product) => (
                  <tr 
                    key={product?._id} 
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-4 py-4 w-[250px]">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 mr-4">
                          <img 
                            className="h-10 w-10 rounded-md object-cover" 
                            src={product?.images?.[0] || "/api/placeholder/50/50"} 
                            alt={product?.name || "Product Image"} 
                          />
                        </div>
                        <div className="truncate max-w-[180px]">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {product?.name || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 w-[100px] text-sm text-gray-500">
                      ${product?.price?.toFixed(2) || "N/A"}
                    </td>
                    <td className="px-4 py-4 w-[120px]">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 truncate">
                        {product?.category || "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-4 w-[80px]">
                      <span className={`font-bold ${getStockStatusColor(product?.stock)}`}>
                        {product?.stock || 0}
                      </span>
                    </td>
                    <td className="px-4 py-4 w-[120px] text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Edit Product"
                          onClick={() => handleEditProduct(product._id)}
                        >
                          <Edit size={20} />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Delete Product"
                          onClick={() => handleDeleteProduct(product._id)}
                        >
                          <Trash2 size={20} />
                        </button>
                        <button 
                          className="text-green-600 hover:text-green-900 transition-colors"
                          title="View Details" onClick={() => handleViewDetails(product._id)}
                        >
                          <EyeIcon size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td 
                    colSpan="5" 
                    className="px-4 py-4 text-center text-gray-500"
                  >
                    No products found. Start adding products to your inventory!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductTable;