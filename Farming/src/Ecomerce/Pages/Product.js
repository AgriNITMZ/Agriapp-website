import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import FarmCarousel from '../../Component/HomePage/Carsol';
import AgriProductCarousel from './AgriProductCarousel';
import PromoCard from './PromoCard';
import AgriSpecials from './AgriSpecials';
import BelowSomePrice from './BelowSomePrice';
import axios from 'axios';

const Product = () => {
  const [parentCategories, setParentCategories] = useState([]);

  const fetchCategory = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/v1/products/getallparentcategory');
      console.log("Parent category", response?.data?.data);
      setParentCategories(response?.data?.data);
    } catch (error) {
      console.error(error);
    }

  }
  console.log("parent categories 2", parentCategories)


  useEffect(() => {
    fetchCategory()
  }, [])


  const navigate = useNavigate();
  const handleClick = (id) => {
  
    navigate(`/product/${id}`); // Or use React Router's `navigate()`
  };

  return (
    <>
      <nav className="w-full bg-[#cefad0] shadow-sm mt-16">
        {/* Navigation Section */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-4 overflow-x-auto py-4 scrollbar-hide justify-evenly">
            {parentCategories.map((category, index) => (
              <div
                key={index}
                className="flex-shrink-0 text-center cursor-pointer group"
              onClick={() => handleClick(category._id)}
              >
                <div
                  className={`rounded-full p-4 mb-2 ${category.bgColor} group-hover:shadow-md transition-shadow duration-200`}
                >
                  <img
                    src={category.image}
                    alt={category.name || "Category"}
                    className="w-16 h-16 object-cover rounded-full"
                  />
                </div>

                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                  {category.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </nav>
      {/* Carousel Section */}
      <div className="w-full">
        <FarmCarousel />
      </div>
      <div>
        <AgriProductCarousel />
      </div>

      <div>
        <PromoCard />
      </div>
      <div>
        <AgriSpecials />
      </div>
      <div>
        <BelowSomePrice />
      </div>
    </>
  );
}

export default Product