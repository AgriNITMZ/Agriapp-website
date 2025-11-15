import React from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

const AgriProductCarousel = () => {
  const products = [
    {
      name: "Tractor 5000X",
      category: "Farm Equipment",
      image: "https://img.freepik.com/free-vector/set-object-element-with-garden-farm-equipment-corn-cart-windmills-tractor-other-cartoon-style-isolated-white-background_1150-65606.jpg",
     
      minDiscount: "Min. 20% Off",
      url: "/products/farm-equipment/tractor-5000x",
      seller: "John Deere",
      rating: 4.5
    },
    {
      name: "Organic Seeds Pack",
      category: "Seeds & Plants",
      image: "https://static.vecteezy.com/system/resources/previews/001/590/983/non_2x/set-of-different-seeds-isolated-on-white-background-free-vector.jpg",
     
      minDiscount: "Min. 70% Off",
      url: "/products/seeds/organic-pack",
      seller: "Nature's Best",
      rating: 4.8
    },
    {
      name: "Pro Sprinkler Set",
      category: "Irrigation",
      image: "https://images.smiletemplates.com/uploads/screenshots/443/0000443719/powerpoint-template-450w.jpg",
      originalPrice: 2499,
      minDiscount: "From ₹2,499",
      url: "/products/irrigation/pro-sprinkler",
      seller: "Rainmaker",
      rating: 4.3
    },
    {
      name: "Premium Fertilizer",
      category: "Fertilizers",
      image: "https://www.gardenworks.ca/files/images/webshop/gardenworks-premium-fall-fertilizer-10-4-24-981x655-6618275f15f59_l.webp",
    
      minDiscount: "Under ₹ 499",
      url: "/products/fertilizers/premium",
      seller: "GrowWell",
      rating: 4.6
    },
    {
      name: "Harvest Tools Kit",
      category: "Tools",
      image: "https://m.media-amazon.com/images/I/61QagZ5C-kL.jpg",
   
      minDiscount: "Min. 50% Off",
      url: "/products/tools/harvest-kit",
      seller: "FarmTools Pro",
      rating: 4.7
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Top Offers</h2>
        <div className="flex space-x-2">
        
          
        </div>
      </div>

      <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide bg-white justify-evenly">
        {products.map((product, index) => (
          <a
            key={index}
            href={product.url}
            className="flex-shrink-0 w-48 group relative"
          >
            <div className="transition-transform duration-200 ease-in-out transform group-hover:scale-105 bg-gray-200 p-5 border-[1px] rounded-md  mt-4">
              <div className="relative aspect-[4/5] mb-2 ">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                />
                {/* Rating badge */}
                <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-800">
                  ★ {product.rating}
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">{product.category}</span>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                </div>
                <h3 className="text-sm font-medium text-gray-800 truncate group-hover:text-blue-600">
                  {product.name}
                </h3>
                <div className="text-xs text-gray-500">by {product.seller}</div>
                <div className="text-sm font-bold text-green-600">
                  {product.minDiscount}
                </div>
                {product.discount && (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 line-through">
                      MRP: ₹{product.originalPrice.toLocaleString()}
                    </span>
                    <span className="text-xs font-medium text-red-500">
                      -{product.discount}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default AgriProductCarousel;