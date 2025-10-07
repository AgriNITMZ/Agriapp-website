import React, { useState, useEffect, useCallback } from 'react';
import AnalyticsLayout from './AnalyticsLayout';
import MetricCard from './MetricCard';
import ChartWidget from './ChartWidget';
import { adminAnalyticsAPI } from '../../services/operations/analytics';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [platformOverview, setPlatformOverview] = useState(null);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [productAnalytics, setProductAnalytics] = useState(null);
  const [revenueAnalytics, setRevenueAnalytics] = useState(null);

  const fetchAnalyticsData = useCallback(async (selectedPeriod = period) => {
    try {
      setLoading(true);
      const params = { period: selectedPeriod };

      const [platformData, userData, productData, revenueData] = await Promise.all([
        adminAnalyticsAPI.getPlatformOverview(params),
        adminAnalyticsAPI.getUserAnalytics(params),
        adminAnalyticsAPI.getProductAnalytics(params),
        adminAnalyticsAPI.getRevenueAnalytics(params)
      ]);

      if (platformData.success) setPlatformOverview(platformData.data);
      if (userData.success) setUserAnalytics(userData.data);
      if (productData.success) setProductAnalytics(productData.data);
      if (revenueData.success) setRevenueAnalytics(revenueData.data);

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    fetchAnalyticsData(newPeriod);
  };

  // Format revenue trends data for charts
  const formatRevenueTrendsData = (trends) => {
    if (!trends || !trends.revenueTrends) return [];
    
    return trends.revenueTrends.map(trend => ({
      date: new Date(trend.date).toLocaleDateString(),
      revenue: trend.revenue,
      orders: trend.orders
    }));
  };

  // Format category distribution data for charts
  const formatCategoryData = (categories) => {
    if (!categories || !categories.categoryDistribution) return [];
    console.log('Category data:', categories.categoryDistribution);
    
    return categories.categoryDistribution.slice(0, 6).map(category => ({
      name: category.category || category._id, // Handle both possible field names
      value: category.count || category.productCount // Handle both possible field names
    }));
  };

  // Format user registration trends
  const formatUserTrendsData = (trends) => {
    if (!trends || !trends.registrationTrends) return [];
    
    return trends.registrationTrends.map(trend => ({
      date: new Date(trend.date).toLocaleDateString(),
      users: trend.totalRegistrations
    }));
  };

  return (
    <AnalyticsLayout 
      title="Admin Analytics" 
      onPeriodChange={handlePeriodChange}
      currentPeriod={period}
    >
      {/* Platform Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Users"
          value={platformOverview?.totalUsers || 0}
          icon="👥"
          type="number"
          loading={loading}
        />
        <MetricCard
          title="Total Sellers"
          value={platformOverview?.totalSellers || 0}
          icon="🏪"
          type="number"
          loading={loading}
        />
        <MetricCard
          title="Total Products"
          value={platformOverview?.totalProducts || 0}
          icon="📦"
          type="number"
          loading={loading}
        />
        <MetricCard
          title="Platform Revenue"
          value={platformOverview?.platformRevenue || 0}
          growth={platformOverview?.revenueGrowth}
          icon="💰"
          type="currency"
          loading={loading}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Active Users"
          value={platformOverview?.activeUsers || 0}
          icon="🟢"
          type="number"
          loading={loading}
        />
        <MetricCard
          title="Total Orders"
          value={revenueAnalytics?.financialOverview?.totalOrders || 0}
          growth={revenueAnalytics?.financialOverview?.orderGrowth}
          icon="📋"
          type="number"
          loading={loading}
        />
        <MetricCard
          title="Avg Order Value"
          value={revenueAnalytics?.financialOverview?.averageOrderValue || 0}
          icon="💳"
          type="currency"
          loading={loading}
        />
        <MetricCard
          title="Commission Earned"
          value={revenueAnalytics?.commissionAnalysis?.totalCommissionEarned || 0}
          icon="🏦"
          type="currency"
          loading={loading}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartWidget
          title="Revenue Trends"
          data={formatRevenueTrendsData(revenueAnalytics)}
          type="area"
          loading={loading}
        />
        <ChartWidget
          title="User Registration Trends"
          data={formatUserTrendsData(userAnalytics)}
          type="line"
          loading={loading}
        />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartWidget
          title="Product Categories"
          data={formatCategoryData(productAnalytics)}
          type="pie"
          loading={loading}
        />
        <ChartWidget
          title="Payment Methods"
          data={revenueAnalytics?.paymentMethodDistribution?.map(method => ({
            name: method.paymentMethod,
            value: method.revenue
          })) || []}
          type="bar"
          loading={loading}
        />
      </div>

      {/* Top Sellers Table */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Sellers</h3>
        {loading ? (
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seller
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commission
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {revenueAnalytics?.topSellers?.slice(0, 10).map((seller, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {seller.sellerName || seller.sellerEmail}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{seller.totalRevenue}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {seller.totalOrders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{seller.platformCommission}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* User Insights */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">👥 User Insights</h3>
          <div className="space-y-2">
            <p className="text-sm text-blue-700">
              <span className="font-medium">Retention Rate:</span> {userAnalytics?.retentionMetrics?.retentionRate || 0}%
            </p>
            <p className="text-sm text-blue-700">
              <span className="font-medium">New Users:</span> {userAnalytics?.retentionMetrics?.newUsers || 0}
            </p>
            <p className="text-sm text-blue-700">
              <span className="font-medium">Active Users:</span> {userAnalytics?.retentionMetrics?.activeUsers || 0}
            </p>
          </div>
        </div>

        {/* Product Insights */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-4">📦 Product Insights</h3>
          <div className="space-y-2">
            <p className="text-sm text-green-700">
              <span className="font-medium">Categories:</span> {productAnalytics?.summary?.totalCategories || 0}
            </p>
            <p className="text-sm text-green-700">
              <span className="font-medium">Low Stock Items:</span> {productAnalytics?.inventoryStatus?.lowStockProducts || 0}
            </p>
            <p className="text-sm text-green-700">
              <span className="font-medium">Avg Rating:</span> {productAnalytics?.summary?.averageRatingAcrossProducts || 0}/5
            </p>
          </div>
        </div>

        {/* Financial Insights */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-4">💰 Financial Insights</h3>
          <div className="space-y-2">
            <p className="text-sm text-yellow-700">
              <span className="font-medium">Daily Avg Revenue:</span> ₹{revenueAnalytics?.keyMetrics?.averageDailyRevenue || 0}
            </p>
            <p className="text-sm text-yellow-700">
              <span className="font-medium">Revenue per Customer:</span> ₹{revenueAnalytics?.keyMetrics?.revenuePerCustomer || 0}
            </p>
            <p className="text-sm text-yellow-700">
              <span className="font-medium">Commission Rate:</span> {revenueAnalytics?.keyMetrics?.platformCommissionRate || 5}%
            </p>
          </div>
        </div>
      </div>
    </AnalyticsLayout>
  );
};

export default AdminDashboard;