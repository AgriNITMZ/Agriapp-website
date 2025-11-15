import React, { useRef } from 'react'
import { products } from '../EcomData/BelowSomePrice'
import { ChevronRight } from 'lucide-react';

const BelowSomePrice = () => {
    const scrollContainerRef = useRef(null);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 200,
        behavior: 'smooth'
      });
    }
  };

    const handleProductClick = (url) => {
        window.location.href = url;
      };
    
      const handleViewAll = () => {
        window.location.href = "/products/under-499";
      };
    
  return (
    <div className="mt-8  px-4">
      <div className="relative bg-white">
        <div className="flex justify-between w-full items-center  p-5">
          <h2 className="text-lg font-semibold">499 only</h2>
          <ChevronRight 
            className="w-6 h-6 text-green-500 cursor-pointer" 
            onClick={handleViewAll}
          />
        </div>

        <div className="relative p-3">
          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="flex-none w-48 cursor-pointer transform transition-transform hover:scale-105 p-2 border-[2px]"
                onClick={() => handleProductClick(product.productUrl)}
              >
                <div className="rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md">
                  <div className="relative h-48">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "/api/placeholder/200/250";
                      }}
                    />
                  </div>
                  <div className="p-2">
                    <h3 className="text-sm font-medium truncate">{product.name}</h3>
                    <p className="text-xs text-gray-600 mb-1">{product.category}</p>
                    <p className="text-sm font-semibold">Under ₹{product.price}</p>
                  </div>
                </div>
              </div>
            ))}

            <button 
              onClick={handleScroll}
              className="flex-none flex items-center justify-center w-12 h-48 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              <ChevronRight className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  
    
  )
}

export default BelowSomePrice