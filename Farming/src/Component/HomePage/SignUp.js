import axios from 'axios';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import React, { useState } from 'react'
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setSignupData } from '../../slice/authSlice';
import { sendOtp } from '../../services/operations/authApi';

const SignUp = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch()
    const [formData, setFormData] = useState({
        Name: '',
        email: '',
        accountType: '',
        password: '',
        confirmPassword: ''
    });
    const [passwordError, setPasswordError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            if (formData.password !== formData. confirmPassword) {
                setPasswordError('Passwords do not match');
                return;
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                setFormData({ ...formData, email: '' });
                return alert('Invalid email format');
            }
            const signupData = {
                ...formData,
            }
            //api call to send otp
            dispatch(setSignupData(signupData,navigate))
            dispatch(sendOtp(formData.email, navigate))

            setFormData({
                Name: '',
                email: '',
                accountType: '',
                password: '',
                confirmPassword: ''
            })
        } catch (error) {
            if (error.response) {
                // Server responded with a status code outside the 2xx range
                console.error('Error response:', error.response.data);
            } else if (error.request) {
                // Request was made, but no response was received
                console.error('No response received:', error.request);
            } else {
                // Something happened setting up the request
                console.error('Error setting up request:', error.message);
            }
        }


    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-indigo-100 flex items-center justify-center p-4 mt-16">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
                {/* Header */}
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
                    <p className="mt-2 text-gray-600">
                        Join us today and start your journey
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    {/* Full Name Input */}
                    <div className="relative">
                        <label className="text-sm font-medium text-gray-700 block mb-2">
                            Full Name
                        </label>
                        <div className="relative">
                            <User className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <input
                                type="text"
                                required
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:green-green-500 transition-colors"
                                placeholder="John Doe"
                                value={formData.Name}
                                onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                            />
                        </div>
                    </div>

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
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Account Type Dropdown */}
                    <div className="relative">
                        <label className="text-sm font-medium text-gray-700 block mb-2">
                            Account Type
                        </label>
                        <select
                            required
                            className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                            value={formData.accountType}
                            onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                        >
                            <option value="">Select account type</option>
                            <option value="User">User</option>
                            <option value="Business">Farmer</option>
                            <option value="Seller">Seller</option>
                        </select>
                    </div>

                    {/* Password Input */}
                    <div className="relative">
                        <label className="text-sm font-medium text-gray-700 block mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-600 transition-colors"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password Input */}
                    <div className="relative">
                        <label className="text-sm font-medium text-gray-700 block mb-2">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-600 transition-colors"
                                placeholder="••••••••"
                                value={formData. confirmPassword}
                                onChange={(e) => setFormData({ ...formData,  confirmPassword: e.target.value })}
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                        {passwordError && (
                            <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-200 transition-colors duration-300"
                    >
                        Sign Up
                    </button>

                    {/* Alternative Sign-up Options */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            className="flex items-center justify-center py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <img src="https://w7.pngwing.com/pngs/882/225/png-transparent-google-logo-google-logo-google-search-icon-google-text-logo-business-thumbnail.png" alt="Google" className="w-6 h-6 mr-2" />
                            Google
                        </button>
                        <button
                            type="button"
                            className="flex items-center justify-center py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <img src="https://cdn-icons-png.flaticon.com/512/0/747.png" alt="Apple" className="w-6 h-6 mr-2" />
                            Apple
                        </button>
                    </div>

                    {/* Login Link */}
                    <p className="text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <a href="/login" className="font-medium text-green-600 hover:text-green-500">
                            Sign in
                        </a>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default SignUp