import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

  const primarySeller = product?.sellers?.[0];
  const priceDetails = primarySeller?.price_size?.[0];

  const calculateDiscount = () => {
    const originalPrice = priceDetails?.price;
    const discountedPrice = priceDetails?.discountedPrice;
    return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
  };

  useEffect(() => {
    if (isHovered && product?.images?.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % product?.images?.length);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isHovered, product?.images?.length]);

  const goToProduct = (productId) => {
    navigate(`/product/item/${productId}`);
  };

  return (
    <div
      className="relative group rounded-lg shadow bg-white hover:shadow-md transition-all duration-300 overflow-hidden w-full sm:max-w-xs p-2 border-[1px] border-green-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setCurrentImageIndex(0);
      }}
    >
      <div className="absolute top-2 right-2 z-10">
        <Heart className="text-slate-400 size-6 cursor-pointer opacity-60 fill-slate-400" />
      </div>

      <div className="relative w-full h-64 sm:h-72 overflow-hidden flex justify-center items-center">
        {product.images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`${product.name} view ${index + 1}`}
            className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-500 ${
              currentImageIndex === index ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => goToProduct(product._id)}
          />
        ))}
      </div>

      <div className="p-4">
        <h3 className="text-sm sm:text-lg text-[#28410d] mb-1 truncate font-bold hover:underline">
          {product.name}
        </h3>
        {priceDetails ? (
          <div className="flex flex-wrap items-center gap-2 mb-2 text-sm sm:text-base">
            <span className="font-bold text-[#3a5e14]">
              Rs. {priceDetails.discountedPrice}
            </span>
            <span className="text-[#28410d] line-through opacity-40">
              Rs. {priceDetails.price}
            </span>
            {/* Uncomment if needed */}
            {/* <span className="font-bold text-green-500">{calculateDiscount()}% off</span> */}
            <span className="text-xs text-[#28410d]">({priceDetails.size})</span>
          </div>
        ) : (
          <div className="text-sm text-red-500">No price available</div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
