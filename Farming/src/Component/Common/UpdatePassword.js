import React, { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

const UpdatePassword = () => {
  const [cofermPassword, setconfermPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate=useNavigate()
  const {token}=useParams()

  const handleSubmit = async(e) => {
    e.preventDefault();
    if (cofermPassword != newPassword) {
      setError("Both password must be Same");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
   try {
    let response=await axios.post("http://localhost:4000/api/v1/auth/resetpassword",{
        password:newPassword,
         confirmPassword:cofermPassword,
          token:token
    })
    
   } catch (error) {
    
   }
    toast.success("Password updated successfully")
    navigate('/login')
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-green-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md border border-green-100">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-green-100 p-3 rounded-full">
            <Lock className="w-6 h-6 text-green-600" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold mb-6 text-center text-green-800">
          Update Password
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-green-800 font-medium mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showOldPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
                required
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 hover:text-green-700"
              >
                {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-green-800 font-medium mb-2">
              Conferm New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={cofermPassword}
                onChange={(e) => setconfermPassword(e.target.value)}
                className="w-full p-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
                required
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 hover:text-green-700"
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p className="mt-2 text-sm text-green-600">
              Password must be at least 8 characters long
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transform transition-all duration-200 hover:scale-[1.02] font-medium"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePassword;

