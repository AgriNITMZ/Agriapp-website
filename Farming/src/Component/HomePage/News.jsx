import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Scheam from "./Scheam";
import MizoramAgriSchemesList from "./SchemesList.jsx";

const News = () => {
  const [news, setNews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();
  const [currentPageType, setCurrentPageType] = useState("news"); 
  const limit = 10;

  // Fetch news data
  const fetchNews = async (page = 1, limit = 10) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/news`, {
        params: { page, limit },
      });
      setNews(response.data.data);
      setCurrentPage(response.data.page);
      setTotal(response.data.total);
    } catch (error) {
      console.error("Error fetching news:", error);
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(total / limit)) {
      setCurrentPage(newPage);
      fetchNews(newPage, limit);
    }
  };

  // Reset when switching to news
  useEffect(() => {
    if (currentPageType === "news") {
      setCurrentPage(1);
      fetchNews(1, limit);
    }
  }, [currentPageType]);

  // Redirect to news detail
  const goToNews = (id) => {
    navigate(`/news/${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mizoram-50 to-earth-50 py-8 pt-20">
      {/* Header Section */}
      <div className="container mx-auto px-6 lg:px-12 mb-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Agricultural <span className="text-mizoram-600">News & Updates</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay informed with the latest agricultural news, government schemes, and farming updates for Mizoram
          </p>
        </div>

        {/* ===== Toggle Buttons ===== */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            onClick={() => setCurrentPageType("news")}
            className={`px-8 py-3 rounded-full font-semibold transition-all duration-200 ${
              currentPageType === "news"
                ? "bg-mizoram-600 text-white shadow-lg"
                : "bg-white text-mizoram-600 border-2 border-mizoram-600 hover:bg-mizoram-50"
            }`}
          >
            Latest News
          </button>

          <button
            onClick={() => setCurrentPageType("schemes")}
            className={`px-8 py-3 rounded-full font-semibold transition-all duration-200 ${
              currentPageType === "schemes"
                ? "bg-mizoram-600 text-white shadow-lg"
                : "bg-white text-mizoram-600 border-2 border-mizoram-600 hover:bg-mizoram-50"
            }`}
          >
            Farming Schemes
          </button>

          <button
            onClick={() => setCurrentPageType("schemeList")}
            className={`px-8 py-3 rounded-full font-semibold transition-all duration-200 ${
              currentPageType === "schemeList"
                ? "bg-mizoram-600 text-white shadow-lg"
                : "bg-white text-mizoram-600 border-2 border-mizoram-600 hover:bg-mizoram-50"
            }`}
          >
            Government Resources
          </button>
        </div>
      </div>

      {/* ===== Render Content ===== */}
      {currentPageType === "news" && (
        <div className="container mx-auto px-6 lg:px-12">
          {/* News Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden cursor-pointer transition-all duration-300 border border-mizoram-100 group"
                onClick={() => goToNews(item._id)}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-mizoram-600 transition-colors duration-200">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {item.description.split(" ").slice(0, 20).join(" ")}...
                  </p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="bg-mizoram-100 text-mizoram-700 px-3 py-1 rounded-full font-medium">
                      {item.source}
                    </span>
                    <span className="text-gray-500">
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center mt-12 space-x-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-200 ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-mizoram-600 text-white hover:bg-mizoram-700 shadow-lg"
              }`}
            >
              Previous
            </button>
            <span className="text-gray-700 font-medium px-4">
              Page {currentPage} of {Math.ceil(total / limit)}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === Math.ceil(total / limit)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-200 ${
                currentPage === Math.ceil(total / limit)
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-mizoram-600 text-white hover:bg-mizoram-700 shadow-lg"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {currentPageType === "schemes" && <Scheam />}
      {currentPageType === "schemeList" && <MizoramAgriSchemesList />}
    </div>
  );
};

export default News;
