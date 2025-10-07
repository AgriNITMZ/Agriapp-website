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
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/news`, {
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
    <div className="min-h-screen bg-gray-100 py-8">
      {/* ===== Toggle Buttons ===== */}
      <div className="flex gap-4 mb-6 mt-16">
        <button
          onClick={() => setCurrentPageType("news")}
          className={`px-6 py-2 rounded-md shadow-md font-bold transition ${
            currentPageType === "news"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          News
        </button>

        <button
          onClick={() => setCurrentPageType("schemes")}
          className={`px-6 py-2 rounded-md shadow-md font-bold transition ${
            currentPageType === "schemes"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Schemes
        </button>

        <button
          onClick={() => setCurrentPageType("schemeList")}
          className={`px-6 py-2 rounded-md shadow-md font-bold transition ${
            currentPageType === "schemeList"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Government Sources
        </button>
      </div>

      {/* ===== Render Content ===== */}
      {currentPageType === "news" && (
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Latest News
          </h1>

          {/* News Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
                onClick={() => goToNews(item._id)}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {item.description.split(" ").slice(0, 20).join(" ")}...
                  </p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{item.source}</span>
                    <span>{new Date(item.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-8 space-x-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md ${
                currentPage === 1
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              Previous
            </button>
            <span className="text-gray-700">
              Page {currentPage} of {Math.ceil(total / limit)}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === Math.ceil(total / limit)}
              className={`px-4 py-2 rounded-md ${
                currentPage === Math.ceil(total / limit)
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
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
