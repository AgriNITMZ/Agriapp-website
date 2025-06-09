import axios from "axios";
import React, { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const RatingAndReview = ({ productId }) => {
  const [ratingReview, setRatingReview] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRatingAndReview = async () => {
      try {
        setLoading(true);
        setError("");
        let response = await axios.get(`http://localhost:4000/api/v1/products/${productId}`);
        setRatingReview(response?.data?.data || []);
      } catch (error) {
        setError("Failed to load reviews.");
      } finally {
        setLoading(false);
      }
    };

    fetchRatingAndReview();
  }, [productId]); // Fetch only when productId changes
  console.log(`Review`, ratingReview)

  const ratingCounts = [5, 4, 3, 2, 1].map((rating) => ({
    rating: `${rating} ★`,
    count: ratingReview.filter((review) => review.rating === rating).length,
  }));

  return (
    <div className=" flex   justify-between max-w-7xl mx-auto  mb-3 ">
    <div className="w-3/4"></div>
      <div className="mt-1 space-y-2 bg-white  p-6 w-2/4 shadow-lg rounded-2xl border border-gray-200 mb-3">
      <p className="font-semibold">RatingAndReview</p>
      
        {ratingCounts.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700 w-16">{item.rating}</span>
            <div className="w-full bg-gray-200 h-3 rounded-full">
              <div
                className={`h-3 rounded-full transition-all`}
                style={{
                  width: `${(item.count / ratingReview.length) * 100 || 0}%`,
                  backgroundColor: ["#4CAF50", "#FFC107", "#FF9800", "#F44336", "#D32F2F"][index],
                }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-600">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RatingAndReview;
