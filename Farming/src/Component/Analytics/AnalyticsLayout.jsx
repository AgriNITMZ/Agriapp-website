import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { analyticsUtils } from '../../services/operations/analytics';

const AnalyticsLayout = ({ children, title, onPeriodChange, currentPeriod = '30d', hideBackButton = false }) => {
    const [selectedPeriod, setSelectedPeriod] = useState(currentPeriod);
    const periodOptions = analyticsUtils.getPeriodOptions();
    const navigate = useNavigate();

    const handlePeriodChange = (period) => {
        setSelectedPeriod(period);
        if (onPeriodChange) {
            onPeriodChange(period);
        }
    };

    return (
        <div className={`min-h-screen bg-gray-50 p-6 ${hideBackButton ? '' : 'pt-24'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Back Button - Only show if not hidden */}
                {!hideBackButton && (
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-4 flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Back</span>
                    </button>
                )}

                {/* Header */}
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                        <p className="text-gray-600 mt-1">Analytics and insights dashboard</p>
                    </div>

                    {/* Period Selector and Refresh Button */}
                    <div className="flex items-center space-x-4">
                        <label className="text-sm font-medium text-gray-700">Time Period:</label>
                        <select
                            value={selectedPeriod}
                            onChange={(e) => handlePeriodChange(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                            {periodOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        
                        <button
                            onClick={() => handlePeriodChange(selectedPeriod)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2"
                            title="Refresh data"
                        >
                            <span>🔄</span>
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Content */}
                {children}
            </div>
        </div>
    );
};

export default AnalyticsLayout;