import React from 'react';
import { analyticsUtils } from '../../services/operations/analytics';

const MetricCard = ({ 
  title, 
  value, 
  growth, 
  icon, 
  type = 'number',
  loading = false 
}) => {
  const formatValue = (val, type) => {
    if (loading) return '...';
    
    switch (type) {
      case 'currency':
        return analyticsUtils.formatCurrency(val);
      case 'percentage':
        return `${val}%`;
      case 'number':
        return analyticsUtils.formatNumber(val);
      default:
        return val;
    }
  };

  const getGrowthDisplay = (growth) => {
    if (growth === undefined || growth === null) return null;
    
    return (
      <div className={`flex items-center text-sm ${analyticsUtils.getGrowthColor(growth)}`}>
        <span className="mr-1">{analyticsUtils.getGrowthIcon(growth)}</span>
        <span>{analyticsUtils.formatPercentage(growth)}</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {formatValue(value, type)}
          </p>
          {getGrowthDisplay(growth)}
        </div>
        
        {icon && (
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">{icon}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;