import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Package, Clock, CheckCircle, XCircle, AlertTriangle, Eye, Truck, Filter, Search, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSocket } from '../../../context/SocketContext';
import { jwtDecode } from 'jwt-decode';

const OrdersTable = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { socket, connected, joinSellerRoom } = useSocket();

  // Get seller ID from token and join socket room
  useEffect(() => {
    const token = getToken();
    if (token && connected) {
      try {
        const decoded = jwtDecode(token);
        const sellerId = decoded.id;
        joinSellerRoom(sellerId);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, [connected, joinSellerRoom]);

  // Listen for real-time order updates
  useEffect(() => {
    if (!socket) return;

    const handleOrderUpdated = (data) => {
      console.log('📡 Received order update:', data);
      
      // Update the order in the list
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === data.orderId 
            ? { ...order, orderStatus: data.orderStatus }
            : order
        )
      );

      // If modal is open and it's the same order, update it
      if (selectedOrder && selectedOrder._id === data.orderId) {
        setSelectedOrder(prev => ({ ...prev, orderStatus: data.orderStatus }));
      }

      toast.success('Order updated in real-time!', { icon: '🔄' });
    };

    socket.on('order-updated', handleOrderUpdated);

    return () => {
      socket.off('order-updated', handleOrderUpdated);
    };
  }, [socket, selectedOrder]);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, filterStatus, searchQuery]);

  const getToken = () => {
    const storedTokenData = JSON.parse(localStorage.getItem("token"));
    return storedTokenData && Date.now() < storedTokenData.expires ? storedTokenData.value : null;
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        throw new Error("Token expired or not found");
      }

      // Fetch both regular orders and Shiprocket orders
      const [regularOrdersResponse, shiprocketOrdersResponse] = await Promise.all([
        axios.post(
          `${import.meta.env.VITE_API_URL}/order/seller/orders`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        ).catch(err => {
          console.error('Error fetching regular orders:', err);
          return { data: { orders: [] } };
        }),
        axios.get(
          `${import.meta.env.VITE_API_URL}/shiprocket/orders`,
          { headers: { Authorization: `Bearer ${token}` } }
        ).catch(err => {
          console.error('Error fetching Shiprocket orders:', err);
          return { data: { orders: [] } };
        })
      ]);

      const regularOrders = regularOrdersResponse.data.orders || [];
      let shiprocketOrders = shiprocketOrdersResponse.data.orders || [];

      // Normalize Shiprocket orders to match regular order structure
      shiprocketOrders = shiprocketOrders.map(order => ({
        ...order,
        _id: order._id,
        userId: order.user, // Map 'user' to 'userId'
        orderStatus: order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Processing', // Map 'status' to 'orderStatus' and capitalize
        paymentStatus: order.paymentInfo?.razorpay_payment_id ? 'Completed' : 'Pending',
        shiprocketOrderId: order.shiprocket?.order_id,
        shiprocketShipmentId: order.shiprocket?.shipment_id,
        awbCode: order.shiprocket?.awb_code,
        courierName: order.shippingInfo?.courierName,
        // Keep original items structure
        items: order.items || []
      }));

      // Merge both order types
      const allOrders = [...regularOrders, ...shiprocketOrders];
      
      // Sort by creation date (newest first)
      allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setOrders(allOrders);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error.message);
      setLoading(false);
      toast.error('Failed to fetch orders');
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Filter by status
    if (filterStatus !== 'All') {
      filtered = filtered.filter(order => order.orderStatus === filterStatus);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(order => {
        const customerName = order.userId?.Name || 
          `${order.userId?.additionalDetails?.firstName || ''} ${order.userId?.additionalDetails?.lastName || ''}`.trim();
        
        return order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.userId?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.items.some(item => item.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()));
      });
    }

    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(true);
      const token = getToken();
      if (!token) {
        throw new Error("Token expired");
      }

      await axios.put(
        `${import.meta.env.VITE_API_URL}/order/update-status/${orderId}`,
        { orderStatus: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
      setShowModal(false);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return <Clock className="text-yellow-500" size={20} />;
      case 'Processing':
        return <Package className="text-blue-500" size={20} />;
      case 'Shipped':
        return <Truck className="text-purple-500" size={20} />;
      case 'Delivered':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'Cancelled':
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <AlertTriangle className="text-gray-500" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Shipped':
        return 'bg-purple-100 text-purple-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOrderStats = () => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.orderStatus === 'Pending').length,
      processing: orders.filter(o => o.orderStatus === 'Processing').length,
      shipped: orders.filter(o => o.orderStatus === 'Shipped').length,
      delivered: orders.filter(o => o.orderStatus === 'Delivered').length,
      cancelled: orders.filter(o => o.orderStatus === 'Cancelled').length,
    };
  };

  const stats = getOrderStats();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Order Management
            {/* Real-time connection status */}
            <span className={`flex items-center gap-1 text-xs font-normal px-2 py-1 rounded-full ${
              connected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
              {connected ? 'Live' : 'Offline'}
            </span>
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {connected ? 'Real-time updates enabled for regular orders' : 'View all orders'} • Shiprocket orders are view-only
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-gray-500 uppercase">Total</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow p-4">
          <p className="text-xs text-yellow-700 uppercase">Pending</p>
          <p className="text-2xl font-bold text-yellow-800">{stats.pending}</p>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-4">
          <p className="text-xs text-blue-700 uppercase">Processing</p>
          <p className="text-2xl font-bold text-blue-800">{stats.processing}</p>
        </div>
        <div className="bg-purple-50 rounded-lg shadow p-4">
          <p className="text-xs text-purple-700 uppercase">Shipped</p>
          <p className="text-2xl font-bold text-purple-800">{stats.shipped}</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4">
          <p className="text-xs text-green-700 uppercase">Delivered</p>
          <p className="text-2xl font-bold text-green-800">{stats.delivered}</p>
        </div>
        <div className="bg-red-50 rounded-lg shadow p-4">
          <p className="text-xs text-red-700 uppercase">Cancelled</p>
          <p className="text-2xl font-bold text-red-800">{stats.cancelled}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by Order ID, Customer, or Product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="All">All Orders</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => {
                  const isShiprocketOrder = order.shiprocketOrderId || order.shiprocketShipmentId;
                  
                  return (
                  <tr key={order._id} className={`hover:bg-gray-50 ${isShiprocketOrder ? 'bg-green-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order._id.slice(-8).toUpperCase()}
                      {isShiprocketOrder && (
                        <p className="text-xs text-green-600 font-semibold">Shiprocket</p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.userId?.Name || 
                       `${order.userId?.additionalDetails?.firstName || ''} ${order.userId?.additionalDetails?.lastName || ''}`.trim() || 
                       'N/A'}
                      <p className="text-xs text-gray-500">{order.userId?.email}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-xs">
                        {order.items.slice(0, 2).map((item, index) => {
                          // Handle both regular and Shiprocket order item structures
                          const itemName = item.product?.name || item.name || 'Product';
                          const itemSize = item.size || '';
                          
                          return (
                            <div key={index} className="mb-1">
                              {item.quantity}x {itemName} {itemSize && `(${itemSize})`}
                            </div>
                          );
                        })}
                        {order.items.length > 2 && (
                          <p className="text-xs text-gray-400">+{order.items.length - 2} more</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{order.totalAmount?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs uppercase font-semibold">
                        {order.paymentMethod === 'cod' ? '💵 COD' : '💳 Online'}
                      </span>
                      <p className={`text-xs mt-1 ${order.paymentStatus === 'Completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {order.paymentStatus}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isShiprocketOrder ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          🚚 Shiprocket
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          📦 Regular
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(order.orderStatus)}
                        <span className={`ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </div>
                      {isShiprocketOrder && order.awbCode && (
                        <p className="text-xs text-gray-500 mt-1">AWB: {order.awbCode}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowModal(true);
                        }}
                        className="text-green-600 hover:text-green-900 flex items-center space-x-1"
                      >
                        <Eye size={16} />
                        <span>View</span>
                      </button>
                      {isShiprocketOrder && (
                        <p className="text-xs text-gray-500 mt-1">View only</p>
                      )}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No orders found</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchQuery || filterStatus !== 'All' 
                ? 'Try adjusting your filters' 
                : 'Orders will appear here once customers place them'}
            </p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {showModal && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => {
            setShowModal(false);
            setSelectedOrder(null);
          }}
          onUpdateStatus={updateOrderStatus}
          updatingStatus={updatingStatus}
        />
      )}
    </div>
  );
};

// Order Detail Modal Component
const OrderDetailModal = ({ order, onClose, onUpdateStatus, updatingStatus }) => {
  const [newStatus, setNewStatus] = useState(order.orderStatus);
  const isShiprocketOrder = order.shiprocketOrderId || order.shiprocketShipmentId;

  const statusOptions = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  const canUpdateStatus = (currentStatus, targetStatus) => {
    if (currentStatus === 'Cancelled' || currentStatus === 'Delivered') return false;
    if (targetStatus === 'Cancelled') return true;
    
    const statusFlow = ['Pending', 'Processing', 'Shipped', 'Delivered'];
    const currentIndex = statusFlow.indexOf(currentStatus);
    const targetIndex = statusFlow.indexOf(targetStatus);
    
    return targetIndex >= currentIndex;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
            <p className="text-sm text-gray-500">Order ID: #{order._id.slice(-8).toUpperCase()}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Customer Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Customer Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">
                  {order.userId?.Name || 
                   `${order.userId?.additionalDetails?.firstName || ''} ${order.userId?.additionalDetails?.lastName || ''}`.trim() || 
                   'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{order.userId?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">
                  {order.userId?.additionalDetails?.contactNo || 
                   order.shippingAddress?.mobile || 
                   'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Order Date</p>
                <p className="font-medium">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Shipping Address</h4>
              <p className="text-gray-700">
                {order.shippingAddress.Name}<br />
                {order.shippingAddress.streetAddress}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}
              </p>
            </div>
          )}

          {/* Order Items */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Order Items</h4>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.product?.name || 'Product'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{item.size}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">₹{item.selectedDiscountedPrice}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        ₹{(item.selectedDiscountedPrice * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="4" className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                      Total Amount:
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">
                      ₹{order.totalAmount?.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Payment & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Payment Details</h4>
              <p className="text-sm text-gray-500">Method</p>
              <p className="font-medium uppercase">{order.paymentMethod}</p>
              <p className="text-sm text-gray-500 mt-2">Status</p>
              <p className={`font-medium ${order.paymentStatus === 'Completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                {order.paymentStatus}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">
                {isShiprocketOrder ? 'Order Status (View Only)' : 'Update Order Status'}
              </h4>
              
              {isShiprocketOrder ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800 mb-2">
                    <strong>🚚 Shiprocket Order</strong>
                  </p>
                  <p className="text-sm text-gray-700 mb-2">
                    This order is managed by Shiprocket. Status updates are automatic from the courier.
                  </p>
                  <p className="text-sm text-gray-600">
                    Current Status: <strong>{order.orderStatus}</strong>
                  </p>
                  {order.awbCode && (
                    <p className="text-sm text-gray-600 mt-1">
                      AWB Code: <strong>{order.awbCode}</strong>
                    </p>
                  )}
                  {order.courierName && (
                    <p className="text-sm text-gray-600 mt-1">
                      Courier: <strong>{order.courierName}</strong>
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    disabled={order.orderStatus === 'Delivered' || order.orderStatus === 'Cancelled'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 mb-3"
                  >
                    {statusOptions.map(status => (
                      <option 
                        key={status} 
                        value={status}
                        disabled={!canUpdateStatus(order.orderStatus, status)}
                      >
                        {status}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => onUpdateStatus(order._id, newStatus)}
                    disabled={updatingStatus || newStatus === order.orderStatus || order.orderStatus === 'Delivered' || order.orderStatus === 'Cancelled'}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {updatingStatus ? 'Updating...' : 'Update Status'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersTable;
