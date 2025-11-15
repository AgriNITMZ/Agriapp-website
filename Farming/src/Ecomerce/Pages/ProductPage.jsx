import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../Product/ProductCard';
import EnhancedProductCard from '../Product/EnhancedProductCard';
import Loading from '../../Component/Common/Loading';
import Filter from './Filter';

const ProductPage = () => {
  const { id } = useParams();
  const [secondLevecategory, setSecondLevecategory] = useState([]);
  const [product, setProduct] = useState([]);
  const [loading, setLoading] = useState(false);
  const [secondLevecategorydata, setSecondLevecategorydata] = useState(false);
  const [filters, setFilters] = useState({ size: '', minPrice: '', maxPrice: '', rating: '' });
  

  const fetchCategory = async () => {
    try {
      setLoading(true);
      let response = await axios.post(`${import.meta.env.VITE_API_URL}/products/getonecategory`, { parentCategoryId: id });
      setSecondLevecategory(response?.data?.data?.subcategories);
      setLoading(false);
    } catch (error) {
      console.error("Error in fetching second level category", error);
    }
  };

  // New function to fetch grouped products for a category
  const fetchGroupedProductsForCategory = async (categoryId) => {
    try {
      const token = localStorage.getItem('token');
      let authToken = token;
      
      // Handle token format
      try {
        const tokenData = JSON.parse(token);
        if (tokenData && tokenData.value) {
          authToken = tokenData.value;
        }
      } catch (e) {
        // Token is already a string
      }

      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/products/getgroupedproducts`,
        {
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );

      if (response.data.success) {
        // Filter products by category if needed
        let groupedProducts = response.data.products;
        if (categoryId) {
          groupedProducts = groupedProducts.filter(product => 
            product.category._id === categoryId || product.category === categoryId
          );
        }
        return groupedProducts;
      }
      return [];
    } catch (error) {
      console.error("Error fetching grouped products:", error);
      return [];
    }
  };

  useEffect(() => {
    fetchCategory();
  }, []);

  // Use grouped products for all products view
  const [allGroupedProducts, setAllGroupedProducts] = useState([]);
  
  useEffect(() => {
    const fetchAllGrouped = async () => {
      if (secondLevecategory.length > 0) {
        const grouped = await fetchGroupedProductsForCategory();
        setAllGroupedProducts(grouped);
      }
    };
    fetchAllGrouped();
  }, [secondLevecategory]);

  const allProducts = allGroupedProducts.length > 0 
    ? allGroupedProducts 
    : secondLevecategory.flatMap(category => category.product);

  const handleClick = async (id) => {
    try {
      setSecondLevecategorydata(false);
      let response = await axios.post(`${import.meta.env.VITE_API_URL}/products/particularcreatecategory`, { categoryId: id });
      setProduct(response?.data?.data?.product);
      
      // Try to get grouped products first
      const groupedProducts = await fetchGroupedProductsForCategory(id);
      
      if (groupedProducts.length > 0) {
        setProduct(groupedProducts);
      } else {
        // Fallback to original method if no grouped products
        let response = await axios.post(`${process.env.REACT_APP_BASE_URL}/products/particularcreatecategory`, { categoryId: id });
        setProduct(response?.data?.data?.product);
      }
      
      setSecondLevecategorydata(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredProducts = (secondLevecategorydata ? product : allProducts).filter(prod => {
    // Handle both grouped and regular products
    const isGrouped = prod.sellerCount > 1 || prod.priceRange;
    
    if (isGrouped) {
      // For grouped products, use priceRange
      return (
        (!filters.minPrice || prod.priceRange?.min >= filters.minPrice) &&
        (!filters.maxPrice || prod.priceRange?.max <= filters.maxPrice) &&
        (!filters.rating || prod.avgRating >= filters.rating)
      );
    } else {
      // For regular products, use original logic
      return (
        (!filters.size || prod.size === filters.size) &&
        (!filters.minPrice || prod?.price_size?.[0]?.discountedPrice >= filters.minPrice) &&
        (!filters.maxPrice || prod?.price_size?.[0]?.discountedPrice <= filters.maxPrice) &&
        (!filters.rating || prod.avgRating >= filters.rating)
      );
    }
  });

  const handleResetFilters = () => {
    setFilters({
      size: '',
      minPrice: '',
      maxPrice: '',
      rating: ''
    });
  };

  return (
    <>
      {loading ? (<Loading text={"Fetching Product Data"} />) : (
        <div className="flex">
          {/* Sidebar Filter Section */}

          <div className="w-full ">
            <nav className="w-full bg-[#cefad0] shadow-sm mt-16">
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex space-x-4 overflow-x-auto py-4 scrollbar-hide justify-evenly">
                  {secondLevecategory.map((category, index) => (
                    <div key={index} className="flex-shrink-0 text-center cursor-pointer group" onClick={() => handleClick(category._id)}>
                      <div className={`rounded-full p-4 mb-2 ${category.bgColor} group-hover:shadow-md transition-shadow duration-200`}>
                        <img src={category.image} alt={category.name || "Category"} className="w-16 h-16 object-cover rounded-full" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                        {category.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </nav>
            {/* Product Section */}
            <div className="w-full flex gap-2">
              {/* Sidebar Filter Section */}
             
              
                
                <Filter
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onResetFilters={handleResetFilters}
                />

            

              {/* Product Grid Section */}
              <div  className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-3 mb-2">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map(prod => <EnhancedProductCard key={prod?._id} product={prod} />)
                ) : (
                  <p className="col-span-full text-center text-gray-500">No products found</p>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default ProductPage;
