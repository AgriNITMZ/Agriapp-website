import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from './ProductCard';

const Search = () => {
    const [searchParams] = useSearchParams();
    const [product, setProduct] = useState([]);
    const query = searchParams.get("query");
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState(""); // Sorting state
    const limit = 8;

    const searchProduct = async () => {
        try {
            const response = await axios.get("http://localhost:4000/api/v1/products/searchProducts/search", {
                params: { query, page, limit },
            });
            setProduct(response.data.products || []); // Ensure an empty array if no products
        } catch (error) {
            console.error("Error fetching products", error);
        }
    };

    useEffect(() => {
        searchProduct();
    }, [query, page]); // Fetch data only on query/page change

    // Sort products locally
    const sortedProducts = [...product].sort((a, b) => {
        if (sort === "priceHigh") return b.price_size[0].discountedPrice - a.price_size[0].discountedPrice; // High to Low
        if (sort === "priceLow") return a.price_size[0].discountedPrice - b.price_size[0].discountedPrice;  // Low to High
        if (sort === "newest") return new Date(b.updatedAt) - new Date(a.updatedAt); // Newest First
        return 0; // Default (No Sorting)
    });

    return (
        <div className='mt-16 p-4'>
            <h2 className='text-xl font-semibold'>Search Results</h2>

            {/* Sorting Options in a Row */}
            <div className="flex space-x-4 mb-3 border-b pb-2">
                <button 
                    className={`px-4 py-2 text-sm font-medium ${sort === "priceHigh" ? "text-blue-500 border-b-2 border-blue-500" : "text-gray-700"}`}
                    onClick={() => setSort("priceHigh")}
                >
                    Price: High to Low
                </button>
                <button 
                    className={`px-4 py-2 text-sm font-medium ${sort === "priceLow" ? "text-blue-500 border-b-2 border-blue-500" : "text-gray-700"}`}
                    onClick={() => setSort("priceLow")}
                >
                    Price: Low to High
                </button>
                <button 
                    className={`px-4 py-2 text-sm font-medium ${sort === "newest" ? "text-blue-500 border-b-2 border-blue-500" : "text-gray-700"}`}
                    onClick={() => setSort("newest")}
                >
                    Newest First
                </button>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-3 mb-2">
                {sortedProducts.length > 0 ? (
                    sortedProducts.map(prod => <ProductCard key={prod._id} product={prod} />)
                ) : (
                    <p className="col-span-full text-center text-gray-500">No products found</p>
                )}
            </div>

            {/* Pagination Controls */}
            <div className="mt-4 flex justify-center space-x-4">
                <button 
                    onClick={() => setPage(page - 1)} 
                    disabled={page === 1} 
                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
                >
                    Previous
                </button>
                <span className="px-4 py-2">{page}</span>
                <button 
                    onClick={() => setPage(page + 1)} 
                    disabled={product.length < limit} 
                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default Search;


