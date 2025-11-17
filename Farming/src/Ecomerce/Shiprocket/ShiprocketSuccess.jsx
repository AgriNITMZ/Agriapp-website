import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, Truck, CreditCard, Calendar, ArrowRight } from 'lucide-react';

const ShiprocketSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { order, shiprocket } = location.state || {};

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No order information found</p>
          <button
            onClick={() => navigate('/shiprocket/checkout')}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Go to Checkout
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 pt-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="bg-white shadow-lg rounded-lg p-8 mb-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
            <p className="text-gray-600">
              Your order has been confirmed and will be shipped soon
            </p>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Details</h2>
          
          <div className="space-y-4">
            {/* Order ID */}
            <div className="flex items-start">
              <Package className="w-5 h-5 text-gray-400 mt-1 mr-3" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Order ID</p>
                <p className="font-semibold text-gray-900">{order._id}</p>
              </div>
            </div>

            {/* Shipment ID */}
            {shiprocket?.shipment_id && (
              <div className="flex items-start">
                <Truck className="w-5 h-5 text-gray-400 mt-1 mr-3" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Shipment ID</p>
                  <p className="font-semibold text-gray-900">{shiprocket.shipment_id}</p>
                </div>
              </div>
            )}

            {/* Shiprocket Order ID */}
            {shiprocket?.order_id && (
              <div className="flex items-start">
                <Package className="w-5 h-5 text-gray-400 mt-1 mr-3" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Shiprocket Order ID</p>
                  <p className="font-semibold text-gray-900">{shiprocket.order_id}</p>
                </div>
              </div>
            )}

            {/* Payment Method */}
            <div className="flex items-start">
              <CreditCard className="w-5 h-5 text-gray-400 mt-1 mr-3" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Payment Method</p>
                <p className="font-semibold text-gray-900">
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                </p>
              </div>
            </div>

            {/* Payment ID (if online) */}
            {order.paymentMethod === 'online' && order.paymentInfo?.razorpay_payment_id && (
              <div className="flex items-start">
                <CreditCard className="w-5 h-5 text-gray-400 mt-1 mr-3" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Payment ID</p>
                  <p className="font-semibold text-gray-900 break-all">
                    {order.paymentInfo.razorpay_payment_id}
                  </p>
                </div>
              </div>
            )}

            {/* Order Date */}
            <div className="flex items-start">
              <Calendar className="w-5 h-5 text-gray-400 mt-1 mr-3" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Order Date</p>
                <p className="font-semibold text-gray-900">{formatDate(order.createdAt)}</p>
              </div>
            </div>

            {/* Estimated Delivery */}
            {shiprocket?.estimated_delivery_date && (
              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-gray-400 mt-1 mr-3" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Estimated Delivery</p>
                  <p className="font-semibold text-green-600">
                    {formatDate(shiprocket.estimated_delivery_date)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Items</h2>
          <div className="space-y-3">
            {order.items?.map((item, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <img
                  src={item.imageUrl || 'https://via.placeholder.com/80'}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  <p className="text-green-600 font-semibold">₹{item.price}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    ₹{item.price * item.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Total */}
          <div className="mt-4 pt-4 border-t flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">Total Amount</span>
            <span className="text-2xl font-bold text-green-600">₹{order.subTotal}</span>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Delivery Address</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-medium text-gray-900">{order.shippingAddress?.name}</p>
            <p className="text-gray-600">{order.shippingAddress?.streetAddress}</p>
            <p className="text-gray-600">
              {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
            </p>
            <p className="text-gray-600">Phone: {order.shippingAddress?.mobile}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          {shiprocket?.shipment_id && (
            <button
              onClick={() => navigate(`/shiprocket/track/${shiprocket.shipment_id}`)}
              className="flex-1 py-3 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Truck className="w-5 h-5" />
              <span>Track Shipment</span>
            </button>
          )}
          <button
            onClick={() => navigate('/shiprocket/orders')}
            className="flex-1 py-3 px-6 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Package className="w-5 h-5" />
            <span>View All Orders</span>
          </button>
        </div>

        {/* Continue Shopping */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-green-600 hover:text-green-700 flex items-center justify-center space-x-2 mx-auto"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShiprocketSuccess;
