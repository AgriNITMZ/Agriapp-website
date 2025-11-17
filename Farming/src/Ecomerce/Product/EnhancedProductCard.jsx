import React, { useState } from 'react';
import ProductCard from './ProductCard';
import { ChevronDown, Store } from 'lucide-react';

const EnhancedProductCard = ({ product }) => {
  const [selectedSeller, setSelectedSeller] = useState(0);
  const [showSellerDropdown, setShowSellerDropdown] = useState(false);

  // Check if this is a grouped product with multiple sellers
  const isGrouped =
    product.sellerCount > 1 || (product.sellers && product.sellers.length > 1);

  // Fallback if not grouped
  if (!isGrouped || !product.sellers || product.sellers.length <= 1) {
    return <ProductCard product={product} />;
  }

  // ✅ Define safeSelectedSeller BEFORE using it
  const safeSelectedSeller = Math.min(selectedSeller, product.sellers.length - 1);

  // Get the seller safely
  const currentSeller = product.sellers[safeSelectedSeller];
  if (!currentSeller) {
    return <ProductCard product={product} />;
  }

  // Create product object for the selected seller
  const productForCard = {
    ...product,
    sellers: [currentSeller], // Only the selected seller
    sellerCount: 1,
    priceRange: undefined,
  };

  const handleSellerChange = (sellerIndex) => {
    setSelectedSeller(sellerIndex);
    setShowSellerDropdown(false);
  };

  return (
    <div className="relative">
      {/* Seller selector overlay */}
      {isGrouped && (
        <div className="absolute top-2 left-2 z-20">
          <div className="relative">
            <button
              onClick={() => setShowSellerDropdown(!showSellerDropdown)}
              className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 hover:bg-blue-600 transition-colors"
            >
              <Store size={12} />
              {product.sellerCount} sellers
              <ChevronDown size={12} />
            </button>

            {showSellerDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg min-w-48 z-30">
                <div className="p-2">
                  <div className="text-xs font-semibold text-gray-700 mb-2">
                    Choose Seller:
                  </div>
                  {product.sellers.map((seller, index) => {
                    const minPrice = Math.min(
                      ...seller.price_size.map((ps) => ps.discountedPrice)
                    );
                    const isSelected = safeSelectedSeller === index;

                    return (
                      <button
                        key={index}
                        onClick={() => handleSellerChange(index)}
                        className={`w-full text-left p-2 rounded text-xs hover:bg-gray-100 transition-colors ${
                          isSelected ? 'bg-blue-50 border border-blue-200' : ''
                        }`}
                      >
                        <div className="font-medium">Seller {index + 1}</div>
                        <div className="text-gray-600">From ₹{minPrice}</div>
                        <div className="text-gray-500 truncate">
                          {seller.fullShopDetails}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Original ProductCard with selected seller */}
      <ProductCard product={productForCard} />
    </div>
  );
};

export default EnhancedProductCard;
