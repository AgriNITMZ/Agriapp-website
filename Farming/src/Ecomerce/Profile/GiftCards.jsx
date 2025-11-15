import React, { useState, useEffect } from 'react';
import ProfileLayout from './Profile';
import { Gift, Plus, CreditCard, Calendar, DollarSign, AlertCircle, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const GiftCards = () => {
  const [giftCards, setGiftCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [redeemCode, setRedeemCode] = useState('');

  // Mock data for demonstration
  useEffect(() => {
    // In a real app, fetch from API
    setGiftCards([
      {
        id: '1',
        code: 'AGRI2024GIFT',
        balance: 500,
        originalAmount: 1000,
        expiryDate: '2024-12-31',
        status: 'active',
        issuedDate: '2024-01-15'
      },
      {
        id: '2',
        code: 'WELCOME100',
        balance: 0,
        originalAmount: 100,
        expiryDate: '2024-06-30',
        status: 'used',
        issuedDate: '2024-01-01'
      }
    ]);
  }, []);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Gift card code copied!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleRedeemGiftCard = async () => {
    if (!redeemCode.trim()) {
      toast.error('Please enter a gift card code');
      return;
    }

    setLoading(true);
    try {
      // In a real app, make API call to redeem gift card
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock API call
      toast.success('Gift card redeemed successfully!');
      setRedeemCode('');
      setShowAddModal(false);
      // Refresh gift cards list
    } catch (error) {
      toast.error('Failed to redeem gift card');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'used':
        return 'bg-gray-100 text-gray-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
  };

  return (
    <ProfileLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gift Cards</h1>
            <p className="text-gray-600">Manage your gift cards and redeem new ones</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-mizoram-600 text-white px-6 py-3 rounded-xl hover:bg-mizoram-700 transition-colors duration-200 shadow-lg mt-4 sm:mt-0"
          >
            <Plus className="w-4 h-4" />
            <span>Redeem Gift Card</span>
          </button>
        </div>

        {/* Gift Cards Grid */}
        {giftCards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {giftCards.map((card) => (
              <div
                key={card.id}
                className="bg-gradient-to-br from-mizoram-500 to-mizoram-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-200 relative overflow-hidden"
              >
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                  <Gift className="w-full h-full" />
                </div>

                {/* Card Content */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-5 h-5" />
                      <span className="text-sm font-medium">PRECI AGRI</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(card.status)} text-gray-800`}>
                      {card.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm opacity-80 mb-1">Gift Card Code</p>
                    <div className="flex items-center justify-between bg-white/20 rounded-lg p-2">
                      <span className="font-mono text-sm">{card.code}</span>
                      <button
                        onClick={() => handleCopyCode(card.code)}
                        className="p-1 hover:bg-white/20 rounded transition-colors duration-200"
                      >
                        {copiedCode === card.code ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm opacity-80 mb-1">Balance</p>
                      <p className="text-xl font-bold">₹{card.balance}</p>
                    </div>
                    <div>
                      <p className="text-sm opacity-80 mb-1">Original Amount</p>
                      <p className="text-lg font-semibold">₹{card.originalAmount}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Expires: {new Date(card.expiryDate).toLocaleDateString()}</span>
                    </div>
                    {isExpired(card.expiryDate) && (
                      <span className="text-red-200 font-medium">EXPIRED</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Gift className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No gift cards found</h3>
            <p className="text-gray-600 mb-6">Redeem your first gift card to get started</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 bg-mizoram-600 text-white px-6 py-3 rounded-xl hover:bg-mizoram-700 transition-colors duration-200 shadow-lg mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Redeem Gift Card</span>
            </button>
          </div>
        )}

        {/* Redeem Gift Card Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Redeem Gift Card</h3>
                    <p className="text-gray-600 mt-1">Enter your gift card code</p>
                  </div>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  >
                    <Plus className="w-5 h-5 rotate-45 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gift Card Code
                    </label>
                    <input
                      type="text"
                      value={redeemCode}
                      onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mizoram-500 focus:border-mizoram-500 transition-colors duration-200 font-mono"
                      placeholder="Enter gift card code"
                    />
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4 flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-blue-900 mb-1">How to redeem</h4>
                      <p className="text-sm text-blue-700">
                        Enter the gift card code exactly as it appears. The amount will be added to your account balance.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4 mt-6">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRedeemGiftCard}
                    disabled={loading || !redeemCode.trim()}
                    className="flex-1 px-4 py-3 bg-mizoram-600 text-white rounded-xl hover:bg-mizoram-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {loading && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    <span>{loading ? 'Redeeming...' : 'Redeem Gift Card'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 bg-gray-50 rounded-2xl p-6 border border-gray-200">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-gray-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Gift Card Information</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Gift cards can be used for any purchase on PRECI AGRI</li>
                <li>• Gift cards do not expire unless specified</li>
                <li>• Multiple gift cards can be combined for a single purchase</li>
                <li>• Gift card balances are non-refundable</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ProfileLayout>
  );
};

export default GiftCards;
