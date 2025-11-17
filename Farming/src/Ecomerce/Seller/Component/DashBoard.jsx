import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Package, ShoppingCart, DollarSign, TrendingUp, AlertCircle, Eye, Edit, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProductListedBySeller } from '../../../services/operations/Seller/listedProductApi';
import axios from 'axios';
import toast from 'react-hot-toast';

const DashBoard = ({ onRouteChange }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { sellerProducts } = useSelector((state) => state.sellerproduct);
  
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasFetchedRef = useRef(false);

  // Get token
  const getToken = () => {
    const storedTokenData = JSON.parse(localStorage.getItem("token"));
    return storedTokenData && Date.now() < storedTokenData.expires ? storedTokenData.value : null;
  };

  const fetchDashboardData = useCallback(async () => {
    const token = getToken();
    if (!token) {
      toast.error('Please login to continue');
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      
      const products = sellerProducts || [];

      // Fetch seller orders
      let orders = [];
      let totalRevenue = 0;
      try {
        const ordersResponse = await axios.post(
          `${import.meta.env.VITE_API_URL}/order/seller/orders`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        orders = ordersResponse.data.orders || [];
        
        // Calculate total revenue from all orders (matching analytics calculation)
        totalRevenue = orders.reduce((sum, order) => {
          // Sum up revenue from items belonging to this seller
          const orderRevenue = order.items.reduce((itemSum, item) => {
            return itemSum + ((item.selectedDiscountedPrice || 0) * (item.quantity || 0));
          }, 0);
          return sum + orderRevenue;
        }, 0);
      } catch (orderError) {
        console.log('Orders not available yet:', orderError);
      }

      // Calculate analytics using the same data structure as ProductTable
      const totalProducts = products.length;
      
      // Count low stock products (using product.stock field) - threshold is 8
      const lowStockProducts = products.filter(p => (p.stock || 0) <= 8).length;

      // Calculate estimated inventory value using product.price and product.stock
      const inventoryValue = products.reduce((sum, product) => {
        const price = product.price || 0;
        const stock = product.stock || 0;
        return sum + (price * stock);
      }, 0);

      setAnalytics({
        totalProducts,
        totalOrders: orders.length,
        totalRevenue: Math.round(totalRevenue),
        inventoryValue: Math.round(inventoryValue),
        lowStockProducts,
        pendingOrders: orders.filter(o => o.orderStatus === 'Pending' || o.orderStatus === 'Processing').length,
        completedOrders: orders.filter(o => o.orderStatus === 'Delivered').length
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [sellerProducts, navigate]);

  useEffect(() => {
    const token = getToken();
    if (token) {
      dispatch(getProductListedBySeller(token));
    }
  }, [dispatch]);

  useEffect(() => {
    // Only fetch once when sellerProducts is available
    if (sellerProducts && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchDashboardData();
    }
  }, [sellerProducts, fetchDashboardData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome to Your Dashboard</h1>
        <p className="text-green-100">Manage your products, track orders, and grow your business</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Products */}
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Products</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{analytics?.totalProducts || 0}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Package className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{analytics?.totalOrders || 0}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-orange-600">⏳ {analytics?.pendingOrders || 0} pending</span>
                <span className="text-xs text-green-600">✓ {analytics?.completedOrders || 0} completed</span>
              </div>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <ShoppingCart className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">₹{analytics?.totalRevenue || 0}</p>
              <p className="text-xs text-gray-400 mt-1">Inventory: ₹{analytics?.inventoryValue || 0}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <DollarSign className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Low Stock Items</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{analytics?.lowStockProducts || 0}</p>
              <p className="text-xs text-gray-400 mt-1">
                {analytics?.lowStockProducts > 0 ? 'Needs restocking' : 'All good!'}
              </p>
            </div>
            <div className={`${analytics?.lowStockProducts > 0 ? 'bg-red-100' : 'bg-green-100'} p-3 rounded-full`}>
              <AlertCircle className={`w-8 h-8 ${analytics?.lowStockProducts > 0 ? 'text-red-600' : 'text-green-600'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/seller/addproduct')}
            className="flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Product</span>
          </button>
          
          <button
            onClick={() => onRouteChange ? onRouteChange('/analytics') : navigate('/seller/analytics')}
            className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <TrendingUp className="w-5 h-5" />
            <span>View Analytics</span>
          </button>
          
          <button
            onClick={() => navigate('/seller')}
            className="flex items-center justify-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors duration-200"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Manage Orders</span>
          </button>
        </div>
      </div>

      {/* Low Stock Items */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              Low Stock Items
            </h2>
            <button
              onClick={() => onRouteChange ? onRouteChange('/low-stock') : navigate('/seller/low-stock')}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              View All →
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1 ml-7">Keep stock above 8 units to avoid low stock alerts</p>
        </div>

        {(() => {
          const lowStockItems = (sellerProducts || []).filter(p => (p.stock || 0) <= 8);
          
          return lowStockItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {lowStockItems.slice(0, 5).map((product) => {
                    const displayPrice = product.price || 0;
                    const totalStock = product.stock || 0;

                    return (
                      <tr key={product._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={product.images?.[0] || '/placeholder.png'}
                              alt={product.name}
                              className="h-10 w-10 rounded-md object-cover"
                            />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {displayPrice > 0 ? (
                            <span>₹{displayPrice.toFixed(2)}</span>
                          ) : (
                            <span className="text-gray-400">Not set</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            totalStock === 0 ? 'bg-red-100 text-red-800' :
                            totalStock <= 3 ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {totalStock} units - Restock Now!
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => navigate(`/product/item/${product._id}`)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/seller/edit-product/${product._id}`)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2 font-medium">All products are well stocked!</p>
              <p className="text-sm text-gray-400">No items with stock at or below 8 units</p>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default DashBoard;