import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Truck, Package, MapPin, Calendar, RefreshCw, ArrowLeft, CheckCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ShiprocketTrack = () => {
  const { shipmentId } = useParams();
  const navigate = useNavigate();
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Get token from localStorage
  const getToken = () => {
    const storedTokenData = JSON.parse(localStorage.getItem("token"));
    return storedTokenData && Date.now() < storedTokenData.expires ? storedTokenData.value : null;
  };

  const token = getToken();

  // Fetch tracking details
  const fetchTracking = async (showRefreshToast = false) => {
    if (!token) {
      toast.error('Session expired. Please log in again.');
      navigate('/login');
      return;
    }

    try {
      setRefreshing(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/shiprocket/track/${shipmentId}`,

        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setTracking(response.data.tracking);
        if (showRefreshToast) {
          toast.success('Tracking information updated');
        }
      }
    } catch (error) {
      console.error('Error fetching tracking:', error);
      toast.error(error.response?.data?.message || 'Failed to load tracking information');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTracking();
  }, [shipmentId]);

  // Format date and time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="bg-white h-32 rounded-lg"></div>
            <div className="bg-white h-64 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!tracking) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-lg p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Tracking Not Available</h2>
            <p className="text-gray-600 mb-6">Unable to load tracking information for this shipment</p>
            <button
              onClick={() => navigate('/shiprocket/orders')}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Extract tracking data
  const trackingData = tracking.tracking_data || tracking;
  const shipmentTrack = trackingData?.shipment_track?.[0] || trackingData;
  const currentStatus = shipmentTrack?.current_status || trackingData?.current_status || 'In Transit';
  const trackingHistory = shipmentTrack?.shipment_track_activities || trackingData?.shipment_track_activities || [];
  const courierName = shipmentTrack?.courier_name || trackingData?.courier_name || 'Courier';
  const awbCode = shipmentTrack?.awb_code || trackingData?.awb_code || shipmentId;

  return (
    <div className="min-h-screen bg-gray-50 py-12 pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/shiprocket/orders')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Orders</span>
        </button>

        {/* Header */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Track Shipment</h1>
              <p className="text-gray-600 mt-1">Shipment ID: {shipmentId}</p>
            </div>
            <button
              onClick={() => fetchTracking(true)}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Current Status */}
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <Truck className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Status</p>
                <p className="text-xl font-bold text-green-600">{currentStatus}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Shipment Details */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipment Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <Truck className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Courier</p>
                <p className="font-semibold text-gray-900">{courierName}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Package className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600">AWB/Tracking Number</p>
                <p className="font-semibold text-gray-900">{awbCode}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tracking Timeline */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Tracking History</h2>
          
          {trackingHistory.length > 0 ? (
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              
              {/* Timeline Items */}
              <div className="space-y-6">
                {trackingHistory.map((activity, index) => (
                  <div key={index} className="relative flex items-start space-x-4">
                    {/* Timeline Dot */}
                    <div className="relative z-10 flex-shrink-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-green-600' : 'bg-gray-300'
                      }`}>
                        {index === 0 ? (
                          <CheckCircle className="w-6 h-6 text-white" />
                        ) : (
                          <Package className="w-6 h-6 text-white" />
                        )}
                      </div>
                    </div>
                    
                    {/* Activity Details */}
                    <div className="flex-1 bg-gray-50 p-4 rounded-lg">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                        <h3 className={`font-semibold ${
                          index === 0 ? 'text-green-600' : 'text-gray-900'
                        }`}>
                          {activity.activity || activity.status || 'Status Update'}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDateTime(activity.date || activity.timestamp)}</span>
                        </div>
                      </div>
                      
                      {activity.location && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{activity.location}</span>
                        </div>
                      )}
                      
                      {activity.sr_status_label && (
                        <p className="text-sm text-gray-600 mt-2">
                          Status: {activity.sr_status_label}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No tracking history available yet</p>
              <p className="text-sm text-gray-500 mt-1">Check back later for updates</p>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Need help?</strong> If you have any questions about your shipment, please contact customer support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShiprocketTrack;
