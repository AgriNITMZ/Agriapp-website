import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAdminProduct } from '../../services/operations/admin/allProducts';

const AdminProducts = () => {
  const dispatch = useDispatch();
  const { AdminProducts, loading } = useSelector((state) => state.adminProduct);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedTokenData = JSON.parse(localStorage.getItem("token"));
    if (storedTokenData && Date.now() < storedTokenData.expires) {
      setToken(storedTokenData.value);
    } else {
      localStorage.removeItem("token");
      setToken(null);
    }
  }, []);

  useEffect(() => {
    if (token) {
      dispatch(getAdminProduct(token));
    }
  }, [token, dispatch]);

  // Group products by seller fullShopDetails
  const groupedProducts = AdminProducts.reduce((acc, product) => {
    const shopName = product.sellers?.[0]?.fullShopDetails || 'Unknown Seller';
    if (!acc[shopName]) {
      acc[shopName] = [];
    }
    acc[shopName].push(product);
    return acc;
  }, {});

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">All Products</h1>
      {loading && <p className="text-blue-500">Loading products...</p>}

      {Object.keys(groupedProducts).map((shopName) => (
        <div key={shopName} className="mb-10">
          <h2 className="text-xl font-bold mb-4 text-gray-700 border-b pb-2">{shopName}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {groupedProducts[shopName].map((product) => (
              <div
                key={product._id}
                className="bg-white shadow-sm rounded-md overflow-hidden border hover:shadow-md transition-shadow duration-200"
              >
                <img
                  src={product.images?.[0] || '/placeholder.jpg'}
                  alt={product.name}
                  className="w-full h-28 object-cover"
                />
                <div className="p-3">
                  <h3 className="text-sm font-medium text-gray-800 truncate">{product.name}</h3>
                  <p className="text-xs text-gray-500 truncate">
                    {product.sellers?.[0]?.fullShopDetails || 'Unknown Seller'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminProducts;
