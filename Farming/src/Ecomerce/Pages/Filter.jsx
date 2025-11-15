import React, { useState } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';

const Filter = ({ filters, onFilterChange, onResetFilters, productStats }) => {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const handleNumericInput = (e) => {
    const { name, value } = e.target;
    const numValue = value === '' ? '' : Number(value);
    onFilterChange({ target: { name, value: numValue } });
  };

  const handlePriceRangeChange = (e) => {
    const { value } = e.target;
    const numValue = Number(value);
    
    if (e.target.name === 'priceSlider') {
      onFilterChange({ target: { name: 'minPrice', value: 0 } });
      onFilterChange({ target: { name: 'maxPrice', value: numValue } });
    } else {
      onFilterChange({ target: { name: e.target.name, value: numValue } });
    }
  };

  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
  const maxPrice = 10000;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Size Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Size</label>
        <div className="grid grid-cols-5 gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => onFilterChange({ target: { name: 'size', value: size } })}
              className={`p-2 text-sm border rounded-md transition-colors
                ${filters.size === size 
                  ? 'bg-green-500 text-white border-green-500' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-green-500'
                }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">Price Range</label>
        <div className="space-y-4">
          <div className="space-y-2">
            <input
              type="range"
              name="priceSlider"
              min="0"
              max={maxPrice}
              step="50"
              value={filters.maxPrice || 0}
              onChange={handlePriceRangeChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-600">
              <span>₹0</span>
              <span>₹{(maxPrice / 2).toLocaleString()}</span>
              <span>₹{maxPrice.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="number"
                name="minPrice"
                placeholder="Min"
                value={filters.minPrice}
                onChange={handleNumericInput}
                min="0"
                max={maxPrice}
                className="w-full p-2 text-sm border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div className="flex-1">
              <input
                type="number"
                name="maxPrice"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={handleNumericInput}
                min="0"
                max={maxPrice}
                className="w-full p-2 text-sm border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Rating Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Minimum Rating</label>
        <input
          type="range"
          name="rating"
          min="1"
          max="5"
          step="0.5"
          value={filters.rating || 1}
          onChange={handleNumericInput}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-sm text-gray-600">
          <span>1★</span>
          <span>3★</span>
          <span>5★</span>
        </div>
      </div>

      {/* Active Filters */}
      {(filters.size || filters.minPrice || filters.maxPrice || filters.rating) && (
        <div className="pt-4 border-t">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Active Filters:</h3>
          <div className="flex flex-wrap gap-2">
            {filters.size && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                Size: {filters.size}
                <button
                  onClick={() => onFilterChange({ target: { name: 'size', value: '' } })}
                  className="ml-1 hover:text-green-600"
                >
                  ×
                </button>
              </span>
            )}
            {filters.minPrice && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                Min: ₹{Number(filters.minPrice).toLocaleString()}
                <button
                  onClick={() => onFilterChange({ target: { name: 'minPrice', value: '' } })}
                  className="ml-1 hover:text-green-600"
                >
                  ×
                </button>
              </span>
            )}
            {filters.maxPrice && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                Max: ₹{Number(filters.maxPrice).toLocaleString()}
                <button
                  onClick={() => onFilterChange({ target: { name: 'maxPrice', value: '' } })}
                  className="ml-1 hover:text-green-600"
                >
                  ×
                </button>
              </span>
            )}
            {filters.rating && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                Rating: ≥{filters.rating}★
                <button
                  onClick={() => onFilterChange({ target: { name: 'rating', value: '' } })}
                  className="ml-1 hover:text-green-600"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Filter Button */}
      <button
        onClick={() => setIsMobileFilterOpen(true)}
        className="fixed bottom-4 right-4 md:hidden z-20 bg-green-500 text-white p-3 rounded-full shadow-lg"
      >
        <SlidersHorizontal size={24} />
      </button>

      {/* Desktop Filter */}
      <div className="w-1/4 p-4 bg-gray-100 sticky top-16 hidden md:block rounded-md shadow-sm mt-3 max-h-[calc(100vh-5rem)] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button 
            onClick={onResetFilters}
            className="text-sm text-green-600 hover:text-green-800 transition-colors"
          >
            Reset All
          </button>
        </div>
        <FilterContent />
      </div>

      {/* Mobile Filter Drawer */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden transition-opacity duration-300 ${
          isMobileFilterOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileFilterOpen(false)}
      >
        <div
          className={`fixed right-0 top-0 h-full w-[80%] max-w-sm bg-white transform transition-transform duration-300 ${
            isMobileFilterOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button 
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={24} />
              </button>
            </div>
            <FilterContent />
          </div>
        </div>
      </div>
    </>
  );
};

export default Filter;