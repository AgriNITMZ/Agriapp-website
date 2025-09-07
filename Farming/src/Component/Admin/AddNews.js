import React, { useState } from "react";
import axios from "axios";

const AddNewsForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    source: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [message, setMessage] = useState("");

  // Handle text inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle file input
  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("date", formData.date);
      data.append("source", formData.source);
      data.append("description", formData.description);
      if (imageFile) {
        data.append("image", imageFile);
      }
      const storedTokenData = JSON.parse(localStorage.getItem("token"));
        if (!storedTokenData || Date.now() >= storedTokenData.expires) {
            setMessage("Admin token is missing or expired. Please log in again.");
            return;
        }

      const res = await axios.post("http://localhost:4000/api/v1/news", data, 
         { headers: { Authorization: `Bearer ${storedTokenData.value}` } }
      );

      setMessage(res.data.message);
      setFormData({ title: "", date: "", source: "", description: "" });
      setImageFile(null);
    } catch (error) {
      setMessage(error.response?.data?.message || "Error adding news");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Add News</h2>
      {message && <p className="text-center mb-4 text-green-600">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="News Title"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        <input
          type="text"
          name="source"
          value={formData.source}
          onChange={handleChange}
          placeholder="News Source"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        {/* File input instead of text URL */}
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full"
          required
        />

        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="News Description"
          rows="4"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        ></textarea>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Add News
        </button>
      </form>
    </div>
  );
};

export default AddNewsForm;
