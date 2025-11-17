import React, { useState, useEffect, useCallback } from 'react';
import AnalyticsLayout from './AnalyticsLayout';
import MetricCard from './MetricCard';
import ChartWidget from './ChartWidget';
import { sellerAnalyticsAPI } from '../../services/operations/analytics';
import toast from 'react-hot-toast';

const SellerDashboard = ({ hideBackButton = false }) => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [overview, setOverview] = useState(null);
  const [productPerformance, setProductPerformance] = useState(null);
  const [salesTrends, setSalesTrends] = useState(null);

  const fetchAnalyticsData = useCallback(async (selectedPeriod = period) => {
    try {
      setLoading(true);
      const params = { period: selectedPeriod };

      const [overviewData, productData, trendsData] = await Promise.all([
        sellerAnalyticsAPI.getOverview(params),
        sellerAnalyticsAPI.getProductPerformance(params),
        sellerAnalyticsAPI.getSalesTrends(params)
      ]);

      if (overviewData.success) setOverview(overviewData.data);
      if (productData.success) setProductPerformance(productData.data);
      if (trendsData.success) setSalesTrends(trendsData.data);

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

  // Format sales trends data for charts
  const formatSalesTrendsData = (trends) => {
    if (!trends || !trends.salesTrends) return [];
    
    return trends.salesTrends.map(trend => ({
      date: new Date(trend.date).toLocaleDateString(),
      value: trend.totalRevenue || 0, // Use revenue as the main value for the chart
      sales: trend.totalSales || 0,
      revenue: trend.totalRevenue || 0,
      orders: trend.orderCount || 0
    }));
  };

  // Format top products data for charts
  const formatTopProductsData = (products) => {
    if (!products || !products.topProducts) return [];
    
    return products.topProducts.slice(0, 5).map(product => ({
      name: product.productName 
        ? (product.productName.length > 20 ? product.productName.substring(0, 20) + '...' : product.productName)
        : 'Unknown Product',
      value: product.totalQuantitySold || 0
    }));
  };

  return (
    <AnalyticsLayout 
      title="Seller Analytics" 
      onPeriodChange={handlePeriodChange}
      currentPeriod={period}
      hideBackButton={hideBackButton}
    >
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Sales"
          value={overview?.totalSales || 0}
          growth={overview?.salesGrowth}
          icon="📊"
          type="number"
          loading={loading}
        />
        <MetricCard
          title="Total Revenue"
          value={overview?.totalRevenue || 0}
          growth={overview?.revenueGrowth}
          icon="💰"
          type="currency"
          loading={loading}
        />
        <MetricCard
          title="Total Orders"
          value={overview?.totalOrders || 0}
          growth={overview?.orderGrowth}
          icon="📦"
          type="number"
          loading={loading}
        />
        <MetricCard
          title="Avg Order Value"
          value={overview?.averageOrderValue || 0}
          icon="💳"
          type="currency"
          loading={loading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartWidget
          title="Sales Trends"
          data={formatSalesTrendsData(salesTrends)}
          type="line"
          loading={loading}
        />
        <ChartWidget
          title="Top Products"
          data={formatTopProductsData(productPerformance)}
          type="bar"
          loading={loading}
        />
      </div>

      {/* Product Performance Table */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Performance</h3>
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
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity Sold
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productPerformance?.topProducts?.length > 0 ? (
                  productPerformance.topProducts.slice(0, 10).map((product, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.productName || 'Unknown Product'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.totalQuantitySold || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{product.totalRevenue || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.orderCount || 0}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500">
                      No product data available yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Low Stock Alerts */}
      {productPerformance?.lowStockAlerts?.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-4">⚠️ Low Stock Alerts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {productPerformance.lowStockAlerts.map((product, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-yellow-300">
                <h4 className="font-medium text-gray-900">{product.productName || 'Unknown Product'}</h4>
                <p className="text-sm text-gray-600">Category: {product.category || 'N/A'}</p>
                <p className="text-sm text-red-600 font-medium">
                  Min Stock: {product.minQuantity || 0} units
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </AnalyticsLayout>
  );
};

export default SellerDashboard;