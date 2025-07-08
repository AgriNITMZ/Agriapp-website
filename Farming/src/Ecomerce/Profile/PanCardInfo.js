import { useState } from "react";
import ProfileLayout from "./Profile";          // <-- adjust import path if needed

const PanCard = () => {
  const [panNumber, setPanNumber]   = useState("");
  const [file, setFile]             = useState(null);
  const [submitted, setSubmitted]   = useState(false);

  // Handle file input ------------------------------------------
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
  };

  // Submit handler ---------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic client‑side validation
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
    if (!panRegex.test(panNumber)) {
      return alert("Please enter a valid 10‑character PAN (e.g. ABCDE1234F)");
    }
    if (!file) {
      return alert("Please upload an image/PDF of your PAN card.");
    }

    /* ---------- API CALL PLACEHOLDER ----------
       const formData = new FormData();
       formData.append("panNumber", panNumber);
       formData.append("file", file);

       await axios.post("/api/profile/pan", formData, {
         headers: { "Content-Type": "multipart/form-data" },
       });
    ------------------------------------------- */

    console.log("Submitted PAN:", panNumber);
    console.log("Uploaded File:", file.name);
    setSubmitted(true);
  };

  return (
    <ProfileLayout>
      <div className="max-w-xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          PAN Card Information
        </h2>

        {submitted ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            PAN card details submitted successfully!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* PAN number ------------------------------------------------ */}
            <div>
              <label
                htmlFor="panNumber"
                className="block mb-2 text-gray-700 font-medium"
              >
                PAN Number
              </label>
              <input
                type="text"
                id="panNumber"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                placeholder="ABCDE1234F"
                className="w-full px-3 py-2 border border-gray-300 rounded-md
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={10}
                required
              />
            </div>

            {/* File upload ------------------------------------------------ */}
            <div>
              <label className="block mb-2 text-gray-700 font-medium">
                Upload PAN Card (JPEG/PNG/PDF)
              </label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
                className="w-full"
                required
              />
              {file && (
                <p className="text-sm mt-1 text-gray-600">
                  Selected file: <strong>{file.name}</strong>
                </p>
              )}
            </div>

            {/* Submit ----------------------------------------------------- */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md
                         hover:bg-blue-700 transition-colors"
            >
              Submit
            </button>
          </form>
        )}
      </div>
    </ProfileLayout>
  );
};

export default PanCard;
