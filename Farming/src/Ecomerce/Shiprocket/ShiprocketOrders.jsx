import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Truck, Calendar, MapPin, Eye, XCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ShiprocketOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const navigate = useNavigate();

  // Get token from localStorage
  const getToken = () => {
    const storedTokenData = JSON.parse(localStorage.getItem("token"));
    return storedTokenData && Date.now() < storedTokenData.expires ? storedTokenData.value : null;
  };

  const token = getToken();

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) {
        toast.error('Session expired. Please log in again.');
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/shiprocket/orders`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          setOrders(response.data.orders);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token, navigate]);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge color
  const getStatusColor = (status) => {
    const colors = {
      created: 'bg-blue-100 text-blue-800',
      processing: 'bg-yellow-100 text-yellow-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Handle cancel order
  const handleCancelOrder = async (shipmentId, orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    setCancellingOrderId(orderId);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/shiprocket/cancel/${shipmentId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        console.log(response.data)
        toast.success('Order cancelled successfully');
        // Refresh orders
        setOrders(orders.map(order =>
          order._id === orderId ? { ...order, status: 'cancelled' } : order
        ));
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancellingOrderId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white h-48 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-lg p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Orders Yet</h2>
            <p className="text-gray-600 mb-6">You haven't placed any Shiprocket orders yet</p>
            <button
              onClick={() => navigate('/shiprocket/checkout')}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Shiprocket Orders</h1>
          <p className="text-gray-600 mt-2">Track and manage your Shiprocket orders</p>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white shadow-lg rounded-lg overflow-hidden">
              {/* Order Header */}
              <div className="bg-gray-50 px-6 py-4 border-b">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="text-sm text-gray-600">Order ID</p>
                      <p className="font-semibold text-gray-900">{order._id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-medium text-gray-900">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Body */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Items */}
                  <div className="lg:col-span-2">
                    <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                    <div className="space-y-3">
                      {order.items?.map((item, index) => (
                        <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                          <img
                            src={item.imageUrl || 'https://via.placeholder.com/60'}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                            <p className="text-green-600 font-semibold">₹{item.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Info */}
                  <div className="space-y-4">
                    {/* Total */}
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                  <p>Subtotal: ₹{order.subTotal}</p>
<p>Shipping: ₹{order.shippingCost}</p>
<p>Total: ₹{order.totalAmount}</p>
<p>Status: {order.status}</p>
<p>Created At: {formatDate(order.createdAt)}</p>
                    
                      
                    </div>

                    {/* Shipment Info */}
                    {order.shiprocket?.shipment_id && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Truck className="w-4 h-4 text-gray-600" />
                          <p className="text-sm font-medium text-gray-900">Shipment ID</p>
                        </div>
                        <p className="text-sm text-gray-600">{order.shiprocket.shipment_id}</p>
                      </div>
                    )}

                    {/* Delivery Address */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <MapPin className="w-4 h-4 text-gray-600" />
                        <p className="text-sm font-medium text-gray-900">Delivery Address</p>
                      </div>
                      <p className="text-sm text-gray-600">
                        {order.shippingAddress?.name}<br />
                        {order.shippingAddress?.city}, {order.shippingAddress?.state}
                      </p>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                      <p className="text-sm font-medium text-gray-900">
                        {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex flex-wrap gap-3">
                  {order.shiprocket?.shipment_id && (
                    <button
                      onClick={() => navigate(`/shiprocket/track/${order.shiprocket.shipment_id}`)}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Track Order</span>
                    </button>
                  )}
                  
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <button
                      onClick={() => handleCancelOrder(order.shiprocket?.shipment_id, order._id)}
                      disabled={cancellingOrderId === order._id}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {cancellingOrderId === order._id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Cancelling...</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          <span>Cancel Order</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShiprocketOrders;
