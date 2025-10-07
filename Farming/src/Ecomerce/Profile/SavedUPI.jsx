import React, { useState, useEffect } from 'react';
import ProfileLayout from './Profile';
import { Smartphone, Plus, Trash2, Edit3, Check, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const SavedUPI = () => {
  const [upiAccounts, setUpiAccounts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUPI, setEditingUPI] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    upiId: '',
    nickname: ''
  });

  // Mock data for demonstration
  useEffect(() => {
    setUpiAccounts([
      {
        id: '1',
        upiId: 'farmer@paytm',
        nickname: 'Primary UPI',
        isDefault: true,
        addedDate: '2024-01-15'
      },
      {
        id: '2',
        upiId: 'agriculture@gpay',
        nickname: 'Business UPI',
        isDefault: false,
        addedDate: '2024-02-10'
      }
    ]);
  }, []);

  const validateUPI = (upiId) => {
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;
    return upiRegex.test(upiId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.upiId.trim()) {
      toast.error('Please enter UPI ID');
      return;
    }

    if (!validateUPI(formData.upiId)) {
      toast.error('Please enter a valid UPI ID');
      return;
    }

    if (!formData.nickname.trim()) {
      toast.error('Please enter a nickname');
      return;
    }

    setLoading(true);
    try {
      // In a real app, make API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editingUPI) {
        setUpiAccounts(prev => prev.map(upi => 
          upi.id === editingUPI.id 
            ? { ...upi, ...formData }
            : upi
        ));
        toast.success('UPI account updated successfully');
      } else {
        const newUPI = {
          id: Date.now().toString(),
          ...formData,
          isDefault: upiAccounts.length === 0,
          addedDate: new Date().toISOString().split('T')[0]
        };
        setUpiAccounts(prev => [...prev, newUPI]);
        toast.success('UPI account added successfully');
      }

      setFormData({ upiId: '', nickname: '' });
      setShowAddModal(false);
      setEditingUPI(null);
    } catch (error) {
      toast.error('Failed to save UPI account');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (upi) => {
    setEditingUPI(upi);
    setFormData({
      upiId: upi.upiId,
      nickname: upi.nickname
    });
    setShowAddModal(true);
  };

  const handleDelete = async (upiId) => {
    if (window.confirm('Are you sure you want to delete this UPI account?')) {
      try {
        // In a real app, make API call
        setUpiAccounts(prev => prev.filter(upi => upi.id !== upiId));
        toast.success('UPI account deleted successfully');
      } catch (error) {
        toast.error('Failed to delete UPI account');
      }
    }
  };

  const handleSetDefault = async (upiId) => {
    try {
      setUpiAccounts(prev => prev.map(upi => ({
        ...upi,
        isDefault: upi.id === upiId
      })));
      toast.success('Default UPI account updated');
    } catch (error) {
      toast.error('Failed to update default UPI');
    }
  };

  const handleCancel = () => {
    setFormData({ upiId: '', nickname: '' });
    setShowAddModal(false);
    setEditingUPI(null);
  };

  return (
    <ProfileLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved UPI Accounts</h1>
            <p className="text-gray-600">Manage your UPI payment methods</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-mizoram-600 text-white px-6 py-3 rounded-xl hover:bg-mizoram-700 transition-colors duration-200 shadow-lg mt-4 sm:mt-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add UPI Account</span>
          </button>
        </div>

        {/* UPI Accounts List */}
        {upiAccounts.length > 0 ? (
          <div className="space-y-4">
            {upiAccounts.map((upi) => (
              <div
                key={upi.id}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-mizoram-100 rounded-full flex items-center justify-center">
                      <Smartphone className="w-6 h-6 text-mizoram-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900">{upi.nickname}</h3>
                        {upi.isDefault && (
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 font-mono">{upi.upiId}</p>
                      <p className="text-sm text-gray-500">Added on {new Date(upi.addedDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!upi.isDefault && (
                      <button
                        onClick={() => handleSetDefault(upi.id)}
                        className="text-sm text-mizoram-600 hover:text-mizoram-700 font-medium"
                      >
                        Set as Default
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(upi)}
                      className="p-2 text-gray-500 hover:text-mizoram-600 hover:bg-mizoram-50 rounded-lg transition-colors duration-200"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(upi.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Smartphone className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No UPI accounts found</h3>
            <p className="text-gray-600 mb-6">Add your first UPI account for quick payments</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 bg-mizoram-600 text-white px-6 py-3 rounded-xl hover:bg-mizoram-700 transition-colors duration-200 shadow-lg mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add UPI Account</span>
            </button>
          </div>
        )}

        {/* Add/Edit UPI Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {editingUPI ? 'Edit UPI Account' : 'Add UPI Account'}
                    </h3>
                    <p className="text-gray-600 mt-1">
                      {editingUPI ? 'Update your UPI details' : 'Add a new UPI payment method'}
                    </p>
                  </div>
                  <button
                    onClick={handleCancel}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      UPI ID *
                    </label>
                    <input
                      type="text"
                      value={formData.upiId}
                      onChange={(e) => setFormData(prev => ({ ...prev, upiId: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mizoram-500 focus:border-mizoram-500 transition-colors duration-200 font-mono"
                      placeholder="example@paytm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nickname *
                    </label>
                    <input
                      type="text"
                      value={formData.nickname}
                      onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mizoram-500 focus:border-mizoram-500 transition-colors duration-200"
                      placeholder="Primary UPI"
                    />
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4 flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-blue-900 mb-1">Security Note</h4>
                      <p className="text-sm text-blue-700">
                        Your UPI details are encrypted and stored securely. We never store your UPI PIN.
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-4 mt-6">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors duration-200 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-4 py-3 bg-mizoram-600 text-white rounded-xl hover:bg-mizoram-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {loading && (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      )}
                      <span>
                        {loading 
                          ? (editingUPI ? 'Updating...' : 'Adding...') 
                          : (editingUPI ? 'Update UPI' : 'Add UPI')
                        }
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProfileLayout>
  );
};

export default SavedUPI;
