import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import { useSelector } from "react-redux";

// Required Excel columns
const REQUIRED_COLUMNS = [
  "Name of the Shop",
  "Address of Shop", 
  "Phone Number",
  "Product Type",
  "Product Name",
  "Price(Rs)",
  "Images"
];

// FIXED: Added unique identifier prop to prevent input ID conflicts
const ImageUploadField = ({ images, onImagesChange, uniqueId }) => {
  const inputId = `file-upload-${uniqueId}`; // Make ID unique!
  
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    onImagesChange([...images, ...newPreviews]);
  };

  const removeImage = (idx) => {
    const updated = [...images];
    updated.splice(idx, 1);
    onImagesChange(updated);
  };

  return (
    <div>
      <div className="flex gap-2 flex-wrap mb-2">
        {images.map((img, idx) => (
          <div
            key={idx}
            className="relative w-20 h-20 border rounded overflow-hidden"
          >
            <img
              src={img.url || img}
              alt="preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => removeImage(idx)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
              aria-label="Remove image"
            >
              ×
            </button>
          </div>
        ))}
        <label
          htmlFor={inputId} // Use unique ID
          className="cursor-pointer w-20 h-20 border rounded flex items-center justify-center text-gray-500 hover:bg-gray-100 select-none"
          title="Add images"
        >
          +
          <input
            id={inputId} // Use unique ID
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
};

const BulkUpload = () => {
  const [excelData, setExcelData] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [productImages, setProductImages] = useState({});
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState("");

  const token = useSelector((state) => state.auth.token);
  const [allCategories, setAllCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/products/getallparentcategory`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAllCategories(data.data || []);
      } catch (err) {
        setError(err.message || "Failed to load categories");
      }
    };
    fetchCategories();
  }, [token]);

const parsePriceSize = (priceStr) => {
  if (!priceStr) return [];
  return priceStr.split(",").map((entry) => {
    const match = entry.match(/([a-zA-Z0-9\- ]+)\s*\(?₹?(\d+(\.\d+)?)\D*\)?/i);
    return match
      ? {
          size: match[1]?.trim() || "Default",
          price: parseFloat(match[2]) || 0,
          discountedPrice: parseFloat(match[2]) || 0,
          quantity: 20,
        }
      : {
          size: "Default",
          price: 0,
          discountedPrice: 0, // safer default as match is null here
          quantity: 20,
        };
  });


  };

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

        const normalized = jsonData.map((row) => {
          const newRow = {};
          Object.keys(row).forEach((key) => {
            newRow[key.trim()] = row[key];
          });
          return newRow;
        });

        const headers = Object.keys(normalized[0] || {});
        const missing = REQUIRED_COLUMNS.filter((col) => !headers.includes(col));
        if (missing.length) {
          setError(`Missing required columns: ${missing.join(", ")}`);
          setParsing(false);
          return;
        }

        setExcelData(normalized);
      } catch (err) {
        setError("Error reading file: " + err.message);
      } finally {
        setParsing(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const getParentCategoryId = (parentName) => {
    if (!parentName) return "";
    const category = allCategories.find(
      (c) => c.name.trim().toLowerCase() === parentName.trim().toLowerCase()
    );
    return category ? category._id : "";
  };

  // FIXED: Generate unique keys for products to handle duplicates/empty names
  const generateUniqueKey = (productName, index) => {
    return productName && productName.trim() 
      ? `${productName.trim()}_${index}` 
      : `product_${index}`;
  };

  useEffect(() => {
    if (excelData.length === 0 || allCategories.length === 0) {
      setPreviewData([]);
      setSelectedSubcategories([]);
      setProductImages({});
      return;
    }

    let lastShopName = null,
      lastAddress = null,
      lastPhone = null,
      lastOwner = null,
      lastEmail = null,
      lastParentCategory = null,
      lastImages = null,
      lastPriceString = null;

    const transformed = excelData.map((item, index) => {
      if (item["Name of the Shop"]) lastShopName = item["Name of the Shop"];
      if (item["Address of Shop"]) lastAddress = item["Address of Shop"];
      if (item["Phone Number"]) lastPhone = item["Phone Number"];
      if (item["Owner Name"]) lastOwner = item["Owner Name"];
      if (item["Email"]) lastEmail = item["Email"];
      if (item["Product Type"]) lastParentCategory = item["Product Type"];
      if (item["Images"]) lastImages = item["Images"];
      if (item["Price(Rs)"]) lastPriceString = item["Price(Rs)"];

      const parentCategoryId = getParentCategoryId(lastParentCategory);
      const priceSizeArray = parsePriceSize(lastPriceString);
      const productName = item["Product Name"] || "";
      const uniqueKey = generateUniqueKey(productName, index);

      return {
        name: productName,
        uniqueKey: uniqueKey, // Add unique key
     fullShopDetails: `${lastShopName || "N/A"}, ${lastAddress || "N/A"}`.trim(),



        description: `Sold by ${lastShopName || "N/A"} Contact: ${lastPhone || "N/A"}`,
        parent_category: parentCategoryId,
        category: "",
        images: lastImages
          ? lastImages.split(",").map((img) => img.trim()).filter(Boolean)
          : [],
        price_size: priceSizeArray,
        owner: lastOwner || "N/A",
        email: lastEmail || "N/A",
      };
    });

    setPreviewData(transformed);
    setSelectedSubcategories(transformed.map(() => ""));
    
    // Use unique keys for image storage
    setProductImages(prev => {
      const newMap = {};
      transformed.forEach(prod => {
        newMap[prod.uniqueKey] = prev[prod.uniqueKey] || (
          Array.isArray(prod.images)
            ? prod.images.map((imgUrl) => ({
                file: null,
                url: imgUrl,
              }))
            : []
        );
      });
      return newMap;
    });
  }, [excelData, allCategories]);

  const handleUpload = async () => {
    if (!previewData.length) {
      alert("No data to upload.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      const bulkData = previewData.map((item, i) => ({
        ...item,
        category: selectedSubcategories[i] || "",
        images: [],
      }));

      // Use unique keys for form data
      previewData.forEach((prod) => {
        const imagesArr = productImages[prod.uniqueKey] || [];
        imagesArr.forEach((imgObj) => {
          if (imgObj.file) {
            formData.append(`images_${prod.uniqueKey}[]`, imgObj.file);
          }
        });
      });

      formData.append("bulkData", JSON.stringify(bulkData));
      let val = token && token.value ? token.value : token;

      await axios.post(
        `${import.meta.env.VITE_API_URL}/products/bulk-upload`,
        formData,
        { headers: { Authorization: `Bearer ${val}` } }
      );
      alert("Upload successful!");
      setExcelData([]);
      setPreviewData([]);
      setProductImages({});
      setSelectedSubcategories([]);
    } catch (err) {
      alert("Upload failed: " + JSON.stringify(err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Bulk Product Upload</h1>

      <input
        type="file"
        accept=".xlsx"
        onChange={handleFileUpload}
        className="mb-4"
      />

      {parsing && <p className="text-blue-600 animate-pulse mb-4">Reading file...</p>}
      {error && (
        <div className="text-red-600 border border-red-400 bg-red-100 p-2 mb-4 rounded">
          <strong>Validation Errors:</strong> {error}
        </div>
      )}

      {previewData.length > 0 && !parsing && (
        <>
          <button
            className={`bg-blue-600 text-white px-4 py-2 rounded mb-4 hover:bg-blue-700 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handleUpload}
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload All Products"}
          </button>

          <div className="overflow-x-auto border rounded shadow max-h-[500px] overflow-y-auto">
            <table className="min-w-full text-sm text-left border-collapse">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="border px-3 py-2">Name</th>
                  <th className="border px-3 py-2">fullShopDetails</th>
                  <th className="border px-3 py-2">Images</th>
                  <th className="border px-3 py-2">Description</th>
                  <th className="border px-3 py-2">Parent Category</th>
                  <th className="border px-3 py-2">Subcategory</th>
                  <th className="border px-3 py-2">Price Details</th>
                  <th className="border px-3 py-2">Owner</th>
                  <th className="border px-3 py-2">Email</th>
                </tr>
              </thead>
              <tbody>
                {previewData.map((item, i) => (
                  <tr key={item.uniqueKey} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="border px-3 py-1 align-top">{item.name}</td>
                    <td className="border px-3 py-1 align-top">{item.fullShopDetails}</td>
                    {/* FIXED: Use uniqueKey and pass uniqueId prop */}
                    <td className="border px-3 py-1 align-top">
                      <ImageUploadField
                        images={productImages[item.uniqueKey] || []}
                        uniqueId={item.uniqueKey} // Pass unique ID
                        onImagesChange={(newImgs) => {
                          setProductImages((prev) => ({
                            ...prev,
                            [item.uniqueKey]: newImgs,
                          }));
                        }}
                      />
                    </td>
                    <td className="border px-3 py-1 align-top">{item.description}</td>
                    <td className="border px-3 py-1 align-top">
                      {allCategories.find((c) => c._id === item.parent_category)?.name ||
                        item.parent_category}
                    </td>
                    <td className="border px-3 py-1 align-top">
                      <select
                        className="w-full p-2 border rounded"
                        value={selectedSubcategories[i] || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          setSelectedSubcategories((prev) => {
                            const copy = [...prev];
                            copy[i] = value;
                            return copy;
                          });
                          setPreviewData((prev) => {
                            const copy = [...prev];
                            copy[i] = { ...copy[i], category: value };
                            return copy;
                          });
                        }}
                        disabled={!item.parent_category}
                      >
                        <option value="">Select Subcategory</option>
                        {item.parent_category &&
                          (allCategories.find((c) => c._id === item.parent_category)
                            ?.subcategories || []
                          ).map((sub) => (
                            <option key={sub._id} value={sub._id}>
                              {sub.name}
                            </option>
                          ))}
                      </select>
                    </td>
                    <td className="border px-3 py-1 align-top">
                      {item.price_size.map((ps, idx2) => (
                        <div key={idx2} className="mb-2 space-y-1">
                          <div className="font-medium">{ps.size}: ₹{ps.price}</div>

                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600">Discount:</label>
                            <input
                              type="number"
                              value={ps.discountedPrice ?? ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                setPreviewData((prev) => {
                                  const updated = [...prev];
                                  updated[i].price_size[idx2].discountedPrice = value ? parseFloat(value) : null;
                                  return updated;
                                });
                              }}
                              className="w-20 p-1 border rounded text-sm"
                              placeholder="₹"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600">Qty:</label>
                            <input
                              type="number"
                              value={ps.quantity ?? ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                setPreviewData((prev) => {
                                  const updated = [...prev];
                                  updated[i].price_size[idx2].quantity = value ? parseInt(value) : null;
                                  return updated;
                                });
                              }}
                              className="w-20 p-1 border rounded text-sm"
                              placeholder="pcs"
                            />
                          </div>
                        </div>
                      ))}
                    </td>
                    <td className="border px-3 py-1 align-top">{item.owner}</td>
                    <td className="border px-3 py-1 align-top">{item.email}</td>
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
