import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const SingleScheme = () => {
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {id}=useParams();
  const navigate = useNavigate();
    console.log('SingleScheme id', id)

  // Fetch data from the API
  useEffect(() => {
    const fetchScheme = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/scheme/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch scheme data");
        }
        const data = await response.json();
        if (data.success) {
          setScheme(data.data); // Set the fetched scheme data
        } else {
          throw new Error("Scheme data not found");
        }
      } catch (err) {
        setError(err.message); // Handle errors
      } finally {
        setLoading(false); // Stop loading state
      }
    };

    fetchScheme();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center pt-24">
        <p className="text-xl font-semibold text-gray-700">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center pt-24">
        <div className="text-center">
          <p className="text-xl font-semibold text-red-500 mb-4">Error: {error}</p>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 mx-auto"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className=" min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 pt-24">
      <div className="w-full max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Image Section */}
          <div className="h-64 w-full relative">
            <img
              src={scheme.image}
              alt={scheme.title}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-4">
              <h1 className="text-xl font-bold text-white">{scheme.title}</h1>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6">
            {/* Date and Source */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-500">
                Published on: {new Date(scheme.date).toLocaleDateString()}
              </span>
              <span className="text-sm text-gray-500">Source: {scheme.source}</span>
            </div>

            {/* Description */}
            <p className="text-gray-700 leading-relaxed mb-6">{scheme.description}</p>

            {/* Additional Info */}
            <div className="border-t border-gray-200 pt-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Key Highlights:</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>Financial assistance for entrepreneurs and farmers.</li>
                <li>Introduction of minimum support price for ginger, broom, turmeric, and Mizo bird-eye chili.</li>
                <li>Promotes inclusive economic growth and self-sufficiency.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



export default SingleScheme