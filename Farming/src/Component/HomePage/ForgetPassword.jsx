import React, { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react'
import axios from 'axios';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { getPasswordResetToken } from '../../services/operations/authApi';

const ForgetPassword = () => {
    const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false)
  const dispatch=useDispatch()

  const handleSubmit = async(e) => {
    e.preventDefault();
    try {
      dispatch(getPasswordResetToken(email,setEmailSent))
      // const response = await axios.post("http://localhost:4000/api/v1/auth/resetpasswordtoken", {
      //   email: email
      // });
      
      // console.log("response of reset password", response);
      
      // if (response.data.success) {
      //   setIsSubmitted(true);
      //   setError("");
      //   toast.success("Reset password link sent to your email!");
      //   console.log('Reset email sent to:', email);
      // } else {
      //   setError("Failed to send reset email");
      //   toast.error(response.data.message || "Failed to send reset email");
      // }

    } catch (error) {
      console.error("Error in reset password:", error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Something went wrong. Please try again.";
                          
      setError(errorMessage);
      toast.error(errorMessage);
      setIsSubmitted(false);
    }
};
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        {/* Back to Login Link */}
        <a 
          href="/login" 
          className="flex items-center text-green-600 hover:text-green-500 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Login
        </a>

        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Forgot Password?</h2>
          <p className="mt-2 text-gray-600">
            {!isSubmitted 
              ? "No worries! Enter your email and we'll send you reset instructions." 
              : "Check your email for reset instructions!"
            }
          </p>
        </div>

        {!isSubmitted ? (
          /* Form */
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* Email Input */}
            <div className="relative">
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-200 transition-colors duration-300"
            >
              Send Otp
            </button>
          </form>
        ) : (
          /* Success Message */
          <div className="mt-8 space-y-6">
            <div className="bg-green-50 text-green-800 p-4 rounded-lg">
              <p className="text-center">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
            </div>
            <button
              onClick={() => setIsSubmitted(false)}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-200 transition-colors duration-300"
            >
              Send Another Email
            </button>
          </div>
        )}

        {/* Help Text */}
        <p className="text-center text-sm text-gray-600">
          Didn't receive the email?{' '}
          <button 
            onClick={() => window.location.href = '/support'} 
            className="font-medium text-green-600 hover:text-green-500"
          >
            Contact Support
          </button>
        </p>
      </div>
    </div>
  )
}

export default ForgetPassword