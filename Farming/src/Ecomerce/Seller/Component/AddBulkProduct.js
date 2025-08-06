import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import axios from "axios";

const REQUIRED_COLUMNS = [
  "Name of the Shop",
  "Address of Shop",
  "Phone Number",
  "Product Type",
  "Product Name",
  "Price(Rs)",
  "Images"
];

const BulkUpload = () => {
  const [excelData, setExcelData] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState("");

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setParsing(true);
    setError("");

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const workbook = XLSX.read(bstr, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
      


        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

// Normalize keys: trim spaces
const normalizedData = jsonData.map(row => {
  const newRow = {};
  Object.keys(row).forEach(key => {
    const trimmedKey = key.trim();
    newRow[trimmedKey] = row[key];
  });
  return newRow;
});

const headers = Object.keys(normalizedData[0] || {});
const missing = REQUIRED_COLUMNS.filter(
  (col) => !headers.includes(col)
);

if (missing.length > 0) {
  setError(`Missing required columns: ${missing.join(", ")}`);
  setParsing(false);
  return;
}

setExcelData(normalizedData);


        
      } catch (err) {
        console.error(err);
        setError("Error reading file: " + err.message);
      } finally {
        setParsing(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  useEffect(() => {
    if (excelData.length === 0) return;

 let lastShopName = null;
let lastAddress = null;
let lastPhone = null;
let lastOwner = null;
let lastEmail = null;
let lastCategory = null;
let lastImages = null;
let lastPriceString = null;

const parsePriceSize = (priceStr) => {
  if (!priceStr) return [];

  return priceStr.split(",").map((entry) => {
    const match = entry.match(/(.+?)\s*\(?(\d+)\D*\)?/);
    if (match) {
      const size = match[1]?.trim() || "Default";
      const price = parseFloat(match[2]) || 0;
      return { size, price };
    } else {
      return { size: "Default", price: 0 };
    }
  });
};


const transformed = excelData.map((item) => {
  // Fill forward missing values
  if (item["Name of the Shop"]) lastShopName = item["Name of the Shop"];
  if (item["Address of Shop"]) lastAddress = item["Address of Shop"];
  if (item["Phone Number"]) lastPhone = item["Phone Number"];
  if (item["Owner Name"]) lastOwner = item["Owner Name"];
  if (item["Email"]) lastEmail = item["Email"];
  if (item["Product Type"]) lastCategory = item["Product Type"];
  if (item["Images"]) lastImages = item["Images"];
  if (item["Price(Rs)"]) lastPriceString = item["Price(Rs)"];

  return {
    name: item["Product Name"] || "",
    description: `Sold by ${lastShopName || "N/A"}, ${lastAddress || "N/A"}. Contact: ${lastPhone || "N/A"}`,
    category: lastCategory || "N/A",
    images: lastImages?.split(",").map(img => img.trim()) || [],
    price_size: parsePriceSize(lastPriceString),
    owner: lastOwner || "N/A",
    email: lastEmail || "N/A",
  };
});



    setPreviewData(transformed);
  }, [excelData]);

  const handleUpload = async () => {
    if (previewData.length === 0) {
      alert("No data to upload.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/products/bulk-upload`,
        { bulkData: previewData },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      alert(res.data.msg || "Upload successful");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Bulk Product Upload</h1>

      <input
        type="file"
        accept=".xlsx"
        onChange={handleFileUpload}
        className="mb-4"
      />

      {parsing && (
        <p className="text-blue-600 animate-pulse mb-4">Reading file...</p>
      )}

      {error && (
        <div className="text-red-600 border border-red-400 bg-red-100 p-2 mb-4 rounded">
          <strong>Validation Errors:</strong> {error}
        </div>
      )}

      {previewData.length > 0 && !parsing && (
        <>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded mb-4 hover:bg-blue-700"
            onClick={handleUpload}
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload to Server"}
          </button>

          <h2 className="text-lg font-semibold mb-2">Preview Before Upload:</h2>

          <div className="overflow-x-auto border rounded shadow">
            <table className="min-w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-3 py-2">Name</th>
                  <th className="border px-3 py-2">Description</th>
                  <th className="border px-3 py-2">Category</th>
                  <th className="border px-3 py-2">Images</th>
                  <th className="border px-3 py-2">Price-Size</th>
                  <th className="border px-3 py-2">Owner</th>
                  <th className="border px-3 py-2">Email</th>
                </tr>
              </thead>
              <tbody>
                {previewData.map((item, index) => (
                  <tr key={index}>
                    <td className="border px-3 py-1">{item.name}</td>
                    <td className="border px-3 py-1">{item.description}</td>
                    <td className="border px-3 py-1">{item.category}</td>
                    <td className="border px-3 py-1">{item.images.join(", ")}</td>
                    <td className="border px-3 py-1">
                      {item.price_size.map((ps, idx) => (
                        <div key={idx}>
                          {ps.size}: ₹{ps.price}
                        </div>
                      ))}
                    </td>
                    <td className="border px-3 py-1">{item.owner || "N/A"}</td>
                    <td className="border px-3 py-1">{item.email || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default BulkUpload;
