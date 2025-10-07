import React, { useState, useEffect } from 'react';
import ProfileLayout from './Profile';
import { Tag, Calendar, Percent, Copy, Check, AlertCircle, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const MyCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [filter, setFilter] = useState('all'); // all, active, expired, used
  const [copiedCode, setCopiedCode] = useState(null);

  // Mock data for demonstration
  useEffect(() => {
    setCoupons([
      {
        id: '1',
        code: 'WELCOME20',
        title: 'Welcome Discount',
        description: 'Get 20% off on your first order',
        discount: 20,
        discountType: 'percentage',
        minOrderValue: 500,
        maxDiscount: 200,
        expiryDate: '2024-12-31',
        status: 'active',
        usedDate: null,
        category: 'welcome'
      },
      {
        id: '2',
        code: 'AGRI50',
        title: 'Agricultural Special',
        description: 'Flat ₹50 off on agricultural products',
        discount: 50,
        discountType: 'fixed',
        minOrderValue: 300,
        maxDiscount: 50,
        expiryDate: '2024-06-30',
        status: 'used',
        usedDate: '2024-03-15',
        category: 'special'
      },
      {
        id: '3',
        code: 'SEEDS15',
        title: 'Seeds Discount',
        description: '15% off on all seeds',
        discount: 15,
        discountType: 'percentage',
        minOrderValue: 200,
        maxDiscount: 100,
        expiryDate: '2024-03-31',
        status: 'expired',
        usedDate: null,
        category: 'category'
      }
    ]);
  }, []);

  const filteredCoupons = coupons.filter(coupon => {
    if (filter === 'all') return true;
    return coupon.status === filter;
  });

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Coupon code copied!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'used':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'welcome':
        return 'bg-blue-500';
      case 'special':
        return 'bg-purple-500';
      case 'category':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const isExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
  };

  const formatDiscount = (coupon) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discount}% OFF`;
    } else {
      return `₹${coupon.discount} OFF`;
    }
  };

  return (
    <ProfileLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Coupons</h1>
            <p className="text-gray-600">Manage and use your available coupons</p>
          </div>
          
          {/* Filter Buttons */}
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <Filter className="w-4 h-4 text-gray-500" />
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[
                { key: 'all', label: 'All' },
                { key: 'active', label: 'Active' },
                { key: 'used', label: 'Used' },
                { key: 'expired', label: 'Expired' }
              ].map((filterOption) => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                    filter === filterOption.key
                      ? 'bg-white text-mizoram-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Coupons Grid */}
        {filteredCoupons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCoupons.map((coupon) => (
              <div
                key={coupon.id}
                className={`bg-white rounded-2xl shadow-lg border-2 overflow-hidden hover:shadow-xl transition-all duration-200 ${
                  coupon.status === 'active' ? 'border-mizoram-200' : 'border-gray-200'
                }`}
              >
                {/* Coupon Header */}
                <div className={`h-2 ${getCategoryColor(coupon.category)}`}></div>
                
                <div className="p-6">
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(coupon.status)}`}>
                      {coupon.status.toUpperCase()}
                    </span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-mizoram-600">
                        {formatDiscount(coupon)}
                      </div>
                    </div>
                  </div>

                  {/* Coupon Details */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{coupon.title}</h3>
                      <p className="text-gray-600 text-sm">{coupon.description}</p>
                    </div>

                    {/* Coupon Code */}
                    <div className="bg-gray-50 rounded-lg p-3 border-2 border-dashed border-gray-300">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">COUPON CODE</p>
                          <p className="font-mono font-bold text-gray-900">{coupon.code}</p>
                        </div>
                        <button
                          onClick={() => handleCopyCode(coupon.code)}
                          disabled={coupon.status !== 'active'}
                          className={`p-2 rounded-lg transition-colors duration-200 ${
                            coupon.status === 'active'
                              ? 'hover:bg-mizoram-100 text-mizoram-600'
                              : 'text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {copiedCode === coupon.code ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Coupon Terms */}
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Expires: {new Date(coupon.expiryDate).toLocaleDateString()}
                          {isExpired(coupon.expiryDate) && (
                            <span className="text-red-600 font-medium ml-2">EXPIRED</span>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Tag className="w-4 h-4" />
                        <span>Min order: ₹{coupon.minOrderValue}</span>
                      </div>
                      {coupon.discountType === 'percentage' && (
                        <div className="flex items-center space-x-2">
                          <Percent className="w-4 h-4" />
                          <span>Max discount: ₹{coupon.maxDiscount}</span>
                        </div>
                      )}
                      {coupon.usedDate && (
                        <div className="text-gray-500">
                          Used on: {new Date(coupon.usedDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Tag className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filter === 'all' ? 'No coupons found' : `No ${filter} coupons found`}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? 'You don\'t have any coupons yet. Check back later for exciting offers!'
                : `You don't have any ${filter} coupons at the moment.`
              }
            </p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="text-mizoram-600 hover:text-mizoram-700 font-medium"
              >
                View all coupons
              </button>
            )}
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">How to use coupons</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Copy the coupon code and apply it at checkout</li>
                <li>• Make sure your order meets the minimum value requirement</li>
                <li>• Coupons cannot be combined with other offers</li>
                <li>• Each coupon can only be used once</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ProfileLayout>
  );
};

export default MyCoupons;
