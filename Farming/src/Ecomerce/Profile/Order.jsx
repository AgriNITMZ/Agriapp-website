import React, { useEffect, useState } from 'react';
import ProfileLayout from './Profile';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Package, Clock, CheckCircle, XCircle,
  AlertTriangle, Truck, Eye, MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [shiprocketOrders, setShiprocketOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
    fetchShiprocketOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const storedTokenData = JSON.parse(localStorage.getItem('token'));
      if (!storedTokenData || Date.now() >= storedTokenData.expires) {
        throw new Error('Token expired or not found');
      }

      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/order/orderhistory`,
        { headers: { Authorization: `Bearer ${storedTokenData.value}` } }
      );

      setOrders(data.orders);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchShiprocketOrders = async () => {
    try {
      const storedTokenData = JSON.parse(localStorage.getItem('token'));
      if (!storedTokenData || Date.now() >= storedTokenData.expires) {
        return;
      }

      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/shiprocket/orders`,
        { headers: { Authorization: `Bearer ${storedTokenData.value}` } }
      );

      if (data.success) {
        setShiprocketOrders(data.orders);
      }
    } catch (err) {
      console.error('Error fetching Shiprocket orders:', err);
    }
  };

  const handleCancelShiprocketOrder = async (shipmentId, orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    setCancellingOrderId(orderId);

    try {
      const storedTokenData = JSON.parse(localStorage.getItem('token'));
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/shiprocket/cancel/${shipmentId}`,
        {},
        { headers: { Authorization: `Bearer ${storedTokenData.value}` } }
      );

      if (response.data.success) {
        toast.success('Order cancelled successfully');
        setShiprocketOrders(shiprocketOrders.map(order =>
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

  /* ---------- helpers ---------- */
  const getStatusIcon = (s) => ({
    Pending:     <Clock      className="text-yellow-500" size={24} />,
    Processing:  <Package    className="text-blue-500"   size={24} />,
    Shipped:     <Truck      className="text-purple-500" size={24} />,
    Delivered:   <CheckCircle className="text-green-500" size={24} />,
    Cancelled:   <XCircle    className="text-red-500"    size={24} />,
  }[s] || <AlertTriangle className="text-gray-500" size={24} />);

  const badgeColor = (s) => ({
    Pending:    'bg-yellow-100 text-yellow-800',
    Processing: 'bg-blue-100 text-blue-800',
    Shipped:    'bg-purple-100 text-purple-800',
    Delivered:  'bg-green-100 text-green-800',
    Cancelled:  'bg-red-100 text-red-800',
  }[s] || 'bg-gray-100 text-gray-800');

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  /* ---------- render ---------- */
  if (loading) {
    return (
      <ProfileLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
        </div>
      </ProfileLayout>
    );
  }
  if (error) {
    return (
      <ProfileLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <strong>Error:&nbsp;</strong>{error}
        </div>
      </ProfileLayout>
    );
  }

  return (
    <ProfileLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">My Orders</h1>

        {/* Shiprocket Orders Section */}
        {shiprocketOrders.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-green-700 border-b pb-2">Shiprocket Orders</h2>
            {shiprocketOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-md p-6 space-y-4 border-l-4 border-green-500">
                {/* Order Header */}
                <div className="flex flex-wrap justify-between items-center gap-y-4 border-b pb-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Order Placed</p>
                    <p className="font-medium">{formatDate(order.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
                    <p className="font-medium">₹{order.totalAmount?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Payment Mode</p>
                    <p className="font-medium">{order.paymentMethod === 'cod' ? 'COD' : 'Online'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Order #</p>
                    <p className="font-medium">{order._id.slice(-6)}</p>
                  </div>
                </div>

                {/* Shipping Address */}
                {order.shippingAddress && (
                  <div className="bg-green-50 rounded-md p-4 space-y-0.5 text-sm">
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="w-4 h-4 text-green-600" />
                      <p className="font-semibold text-green-800">Shipping Address</p>
                    </div>
                    <p>{order.shippingAddress.name}</p>
                    <p>{order.shippingAddress.streetAddress}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                    <p>Phone: {order.shippingAddress.mobile}</p>
                  </div>
                )}

                {/* Items */}
                <div className="space-y-3">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-16 h-16 flex-shrink-0">
                        <img
                          src={item.imageUrl || '/placeholder.png'}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        <p className="text-green-600 font-semibold">₹{item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Status & Actions */}
                <div className="border-t pt-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                    </span>
                    {order.shiprocket?.shipment_id && (
                      <span className="text-xs text-gray-500">
                        Shipment: {order.shiprocket.shipment_id}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {order.shiprocket?.shipment_id && (
                      <button
                        onClick={() => navigate(`/shiprocket/track/${order.shiprocket.shipment_id}`)}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Track</span>
                      </button>
                    )}
                    
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <button
                        onClick={() => handleCancelShiprocketOrder(order.shiprocket?.shipment_id, order._id)}
                        disabled={cancellingOrderId === order._id}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {cancellingOrderId === order._id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Cancelling...</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4" />
                            <span>Cancel</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Regular Orders Section */}
        {orders.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-blue-700 border-b pb-2">Regular Orders</h2>
            {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-md p-6 space-y-4 border-l-4 border-blue-500">
              {/* ---------- order header ---------- */}
              <div className="flex flex-wrap justify-between items-center gap-y-4 border-b pb-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Order Placed</p>
                  <p className="font-medium">{formatDate(order.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
                  <p className="font-medium">₹{order.totalAmount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Payment Mode</p>
                  <p className="font-medium">{order.paymentMethod}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Order #</p>
                  <p className="font-medium">{order._id.slice(-6)}</p>
                </div>
              </div>

              {/* ---------- NEW: shipping address block ---------- */}
              {order.shippingAddress && (
                <div className="bg-blue-50 rounded-md p-4 space-y-0.5 text-sm">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <p className="font-semibold text-blue-800">Shipping Address</p>
                  </div>
                  <p>{order.shippingAddress.Name}</p>
                 
                  <p>
                   {order.shippingAddress.streetAddress}, {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                    {order.shippingAddress.zipcode}
                  </p>
                  <p>Phone: {order.shippingAddress.mobile}</p>
                </div>
              )}

              {/* ---------- items ---------- */}
              <div className="space-y-4">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-24 h-24 flex-shrink-0">
                      <img
                        src={item.product?.images?.[0] || '/placeholder.png'}
                        alt={item.product?.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-medium">{item.product?.name}</h3>
                      <p className="text-sm text-gray-500">
                        Size: {item.size} | Qty: {item.quantity}
                      </p>
                      <p className="text-sm">
                        Price: ₹{(item.selectedDiscountedPrice || 0).toFixed(2)}
                          {(item.selectedDiscountedPrice || 0) < (item.selectedprice || 0) && (
                          <span className="line-through text-gray-500 ml-2">
                            ₹{item.selectedprice.toFixed(2)}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* ---------- status & timeline ---------- */}
              <div className="border-t pt-4">
                <div className="flex flex-wrap items-center justify-between gap-y-2">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(order.orderStatus)}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${badgeColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${badgeColor(order.paymentStatus)}`}>
                    Payment: {order.paymentStatus}
                  </span>
                </div>

                {/* timeline */}
                <div className="mt-4">
                  <div className="flex items-center space-x-4">
                    {['Ordered', 'Processing', 'Shipped', 'Delivered'].map((step, i) => (
                      <React.Fragment key={step}>
                        <div
                          className={`h-2 w-2 rounded-full ${
                            (step === 'Ordered' ||
                              (step === 'Processing' && ['Processing', 'Shipped', 'Delivered'].includes(order.orderStatus)) ||
                              (step === 'Shipped' && ['Shipped', 'Delivered'].includes(order.orderStatus)) ||
                              (step === 'Delivered' && order.orderStatus === 'Delivered'))
                              ? 'bg-green-500'
                              : 'bg-gray-300'
                          }`}
                        />
                        {i < 3 && (
                          <div
                            className={`flex-1 h-0.5 ${
                              (step === 'Ordered' && ['Processing', 'Shipped', 'Delivered'].includes(order.orderStatus)) ||
                              (step === 'Processing' && ['Shipped', 'Delivered'].includes(order.orderStatus)) ||
                              (step === 'Shipped' && order.orderStatus === 'Delivered')
                                ? 'bg-green-500'
                                : 'bg-gray-300'
                            }`}
                          />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Ordered</span>
                    <span>Processing</span>
                    <span>Shipped</span>
                    <span>Delivered</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}

        {/* No Orders Message */}
        {orders.length === 0 && shiprocketOrders.length === 0 && (
          <div className="text-center py-8">
            <Package className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No orders yet</h3>
            <p className="mt-1 text-gray-500">Start shopping to see your orders here.</p>
          </div>
        )}
      </div>
    </ProfileLayout>
  );
};

export default Order;
