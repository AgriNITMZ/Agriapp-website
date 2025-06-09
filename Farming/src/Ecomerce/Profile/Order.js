import React, { useEffect, useState } from 'react';
import ProfileLayout from './Profile';
import axios from 'axios';
import { Package, Clock, CheckCircle, XCircle, AlertTriangle, Truck } from 'lucide-react';

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const storedTokenData = JSON.parse(localStorage.getItem("token"));
      if (!storedTokenData || Date.now() >= storedTokenData.expires) {
        throw new Error("Token expired or not found");
      }

      const response = await axios.get(
        'http://localhost:4000/api/v1/order/orderhistory',
        {
          headers: {
            Authorization: `Bearer ${storedTokenData.value}`
          }
        }
      );

      setOrders(response.data.orders);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return <Clock className="text-yellow-500" size={24} />;
      case 'Processing':
        return <Package className="text-blue-500" size={24} />;
      case 'Shipped':
        return <Truck className="text-purple-500" size={24} />;
      case 'Delivered':
        return <CheckCircle className="text-green-500" size={24} />;
      case 'Cancelled':
        return <XCircle className="text-red-500" size={24} />;
      default:
        return <AlertTriangle className="text-gray-500" size={24} />;
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
      month: 'long',
      day: 'numeric'
    });
  };

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
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </ProfileLayout>
    );
  }

  return (
    <ProfileLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">My Orders</h1>
        
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <Package className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No orders yet</h3>
            <p className="mt-1 text-gray-500">Start shopping to see your orders here.</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-md p-6 space-y-4">
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <p className="text-sm text-gray-500">ORDER PLACED</p>
                  <p className="font-medium">{formatDate(order.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">TOTAL</p>
                  <p className="font-medium">₹{order.totalAmount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ORDER #{order._id.slice(-6)}</p>
                </div>
              </div>

              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-24 h-24">
                      <img
                        src={item.product?.images?.[0] || '/placeholder.png'}
                        alt={item.product?.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-medium">{item.product?.name}</h3>
                      <p className="text-sm text-gray-500">
                        Size: {item.size} | Quantity: {item.quantity}
                      </p>
                      <p className="text-sm">
                        Price: ₹{item.selectedDiscountedPrice.toFixed(2)}
                        {item.selectedDiscountedPrice < item.selectedprice && (
                          <span className="line-through text-gray-500 ml-2">
                            ₹{item.selectedprice.toFixed(2)}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(order.orderStatus)}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.paymentStatus)}`}>
                      Payment: {order.paymentStatus}
                    </span>
                  </div>
                </div>
                
                {/* Order Timeline */}
                <div className="mt-4">
                  <div className="flex items-center space-x-4">
                    <div className={`h-2 w-2 rounded-full ${order.orderStatus !== 'Cancelled' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <div className={`flex-1 h-0.5 ${order.orderStatus === 'Processing' || order.orderStatus === 'Shipped' || order.orderStatus === 'Delivered' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <div className={`h-2 w-2 rounded-full ${order.orderStatus === 'Shipped' || order.orderStatus === 'Delivered' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <div className={`flex-1 h-0.5 ${order.orderStatus === 'Delivered' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <div className={`h-2 w-2 rounded-full ${order.orderStatus === 'Delivered' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-500">Ordered</span>
                    <span className="text-gray-500">Processing</span>
                    <span className="text-gray-500">Shipped</span>
                    <span className="text-gray-500">Delivered</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </ProfileLayout>
  );
};

export default Order;