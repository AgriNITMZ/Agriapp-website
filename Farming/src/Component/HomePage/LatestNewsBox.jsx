import React, { useState, useEffect } from 'react';
import { ExternalLink, Calendar, Newspaper, RefreshCw } from 'lucide-react';
import axios from 'axios';

const LatestNewsBox = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/news?limit=10`
      );

      if (data.success && data.news) {
        setNews(data.news);
      } else {
        setNews([]);
      }
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Failed to load news. Please try again.');
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Skeleton loader
  if (loading) {
    return (
      <div className="w-full bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center gap-2 mb-6">
          <Newspaper className="w-6 h-6 text-green-600 animate-pulse" />
          <h2 className="text-2xl font-bold text-gray-800">Latest Agriculture News</h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
        <p className="text-red-700">{error}</p>
        <button
          onClick={fetchNews}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  // No news state
  if (!news || news.length === 0) {
    return (
      <div className="w-full bg-gray-50 rounded-lg p-6 mb-8 text-center">
        <Newspaper className="w-12 h-12 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">No news available at the moment</p>
        <button
          onClick={fetchNews}
          className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Load News
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-br from-green-50 to-white rounded-lg shadow-lg p-6 mb-8 border border-green-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Newspaper className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-800">Latest Agriculture News</h2>
        </div>
        <button
          onClick={fetchNews}
          className="p-2 hover:bg-green-100 rounded-full transition-colors"
          title="Refresh news"
        >
          <RefreshCw className="w-5 h-5 text-green-600" />
        </button>
      </div>

      {/* News Cards */}
      <div className="space-y-4">
        {news && news.map((item, index) => (
          <a
            key={item._id || index}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white rounded-lg p-4 border border-gray-200 hover:border-green-400 hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-700 transition-colors mb-2 line-clamp-2">
                  {item.title}
                </h3>

                {/* Description */}
                {item.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {item.description}
                  </p>
                )}

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(item.date)}</span>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">
                    {item.source}
                  </span>
                </div>
              </div>

              {/* External Link Icon */}
              <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-green-600 flex-shrink-0 mt-1" />
            </div>
          </a>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-500">
          Updates automatically every 30 minutes • Showing latest {news?.length || 0} items
        </p>
      </div>
    </div>
  );
};

export default LatestNewsBox;
