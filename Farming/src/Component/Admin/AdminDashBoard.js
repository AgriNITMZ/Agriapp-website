import React from "react";
import { Link } from "react-router-dom";

const AdminDashBoard = () => {
  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Admin Dashboard
      </h1>
      <p className="text-gray-600 mb-8 text-center">
        Welcome to the Admin Dashboard. Here you can manage products, view
        orders, and handle other administrative tasks.
      </p>

      <div className="flex justify-center gap-6">
        <Link
          to="adminproducts"
          className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-600 transition"
        >
          Manage Products
        </Link>

        <Link
          to="addnews"
          className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-600 transition"
        >
          Manage News
        </Link>
      </div>
    </div>
  );
};

export default AdminDashBoard;
