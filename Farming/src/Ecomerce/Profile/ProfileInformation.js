import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import ProfileLayout from "./Profile";
import { User, Mail, Phone, Calendar, Edit3, Save, X, Check, AlertCircle } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const ProfileInformation = () => {
    const user = useSelector((state) => state.profile.user);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        Name: "",
        gender: "",
        email: "",
        contactNo: "",
        dateofBirth: "",
        about: ""
    });

    // Get token from localStorage
    const getToken = () => {
        const storedTokenData = JSON.parse(localStorage.getItem("token"));
        if (storedTokenData && Date.now() < storedTokenData.expires) {
            return storedTokenData.value;
        }
        localStorage.removeItem("token");
        return null;
    };

    // Load user data on component mount
    useEffect(() => {
        if (user) {
            setFormData({
                Name: user.Name || "",
                gender: user.additionalDetails?.gender || "",
                email: user.email || "",
                contactNo: user.additionalDetails?.contactNo || "",
                dateofBirth: user.additionalDetails?.dateofBirth ? 
                    new Date(user.additionalDetails.dateofBirth).toISOString().split('T')[0] : "",
                about: user.additionalDetails?.about || ""
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const validateForm = () => {
        if (!formData.Name.trim()) {
            toast.error("Name is required");
            return false;
        }
        if (!formData.email.trim()) {
            toast.error("Email is required");
            return false;
        }
        if (formData.contactNo && !/^\d{10}$/.test(formData.contactNo)) {
            toast.error("Please enter a valid 10-digit mobile number");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        const token = getToken();

        try {
            const response = await axios.put(
                `${process.env.REACT_APP_BASE_URL}/auth/updateProfile`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                toast.success("Profile updated successfully!");
                setIsEditing(false);
                // You might want to dispatch an action to update the Redux store here
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        // Reset form data to original values
        if (user) {
            setFormData({
                Name: user.Name || "",
                gender: user.additionalDetails?.gender || "",
                email: user.email || "",
                contactNo: user.additionalDetails?.contactNo || "",
                dateofBirth: user.additionalDetails?.dateofBirth ? 
                    new Date(user.additionalDetails.dateofBirth).toISOString().split('T')[0] : "",
                about: user.additionalDetails?.about || ""
            });
        }
        setIsEditing(false);
    };

    return (
        <ProfileLayout>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Personal Information</h1>
                        <p className="text-gray-600">Manage your account details and preferences</p>
                    </div>
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center space-x-2 bg-mizoram-600 text-white px-6 py-3 rounded-xl hover:bg-mizoram-700 transition-colors duration-200 shadow-lg"
                        >
                            <Edit3 className="w-4 h-4" />
                            <span>Edit Profile</span>
                        </button>
                    ) : (
                        <div className="flex space-x-3">
                            <button
                                onClick={handleCancel}
                                className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-xl hover:bg-gray-600 transition-colors duration-200"
                            >
                                <X className="w-4 h-4" />
                                <span>Cancel</span>
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex items-center space-x-2 bg-mizoram-600 text-white px-4 py-2 rounded-xl hover:bg-mizoram-700 transition-colors duration-200 disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Profile Form */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <form onSubmit={handleSubmit}>
                        <div className="p-8 space-y-8">
                            {/* Basic Information */}
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                                    <User className="w-5 h-5 mr-2 text-mizoram-600" />
                                    Basic Information
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="Name"
                                            value={formData.Name}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className={`w-full px-4 py-3 border rounded-xl transition-colors duration-200 ${
                                                isEditing 
                                                    ? 'border-gray-300 focus:border-mizoram-500 focus:ring-2 focus:ring-mizoram-200' 
                                                    : 'border-gray-200 bg-gray-50'
                                            }`}
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Gender
                                        </label>
                                        <div className="flex space-x-6">
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="gender"
                                                    value="male"
                                                    checked={formData.gender === "male"}
                                                    onChange={handleChange}
                                                    disabled={!isEditing}
                                                    className="w-4 h-4 text-mizoram-600 border-gray-300 focus:ring-mizoram-500"
                                                />
                                                <span className="ml-2 text-gray-700">Male</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="gender"
                                                    value="female"
                                                    checked={formData.gender === "female"}
                                                    onChange={handleChange}
                                                    disabled={!isEditing}
                                                    className="w-4 h-4 text-mizoram-600 border-gray-300 focus:ring-mizoram-500"
                                                />
                                                <span className="ml-2 text-gray-700">Female</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                                    <Mail className="w-5 h-5 mr-2 text-mizoram-600" />
                                    Contact Information
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className={`w-full px-4 py-3 border rounded-xl transition-colors duration-200 ${
                                                isEditing 
                                                    ? 'border-gray-300 focus:border-mizoram-500 focus:ring-2 focus:ring-mizoram-200' 
                                                    : 'border-gray-200 bg-gray-50'
                                            }`}
                                            placeholder="Enter your email address"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Mobile Number
                                        </label>
                                        <input
                                            type="tel"
                                            name="contactNo"
                                            value={formData.contactNo}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className={`w-full px-4 py-3 border rounded-xl transition-colors duration-200 ${
                                                isEditing 
                                                    ? 'border-gray-300 focus:border-mizoram-500 focus:ring-2 focus:ring-mizoram-200' 
                                                    : 'border-gray-200 bg-gray-50'
                                            }`}
                                            placeholder="Enter your mobile number"
                                            maxLength="10"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Additional Information */}
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                                    <Calendar className="w-5 h-5 mr-2 text-mizoram-600" />
                                    Additional Information
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Date of Birth
                                        </label>
                                        <input
                                            type="date"
                                            name="dateofBirth"
                                            value={formData.dateofBirth}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className={`w-full px-4 py-3 border rounded-xl transition-colors duration-200 ${
                                                isEditing 
                                                    ? 'border-gray-300 focus:border-mizoram-500 focus:ring-2 focus:ring-mizoram-200' 
                                                    : 'border-gray-200 bg-gray-50'
                                            }`}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            About
                                        </label>
                                        <textarea
                                            name="about"
                                            value={formData.about}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            rows={4}
                                            className={`w-full px-4 py-3 border rounded-xl transition-colors duration-200 resize-none ${
                                                isEditing 
                                                    ? 'border-gray-300 focus:border-mizoram-500 focus:ring-2 focus:ring-mizoram-200' 
                                                    : 'border-gray-200 bg-gray-50'
                                            }`}
                                            placeholder="Tell us about yourself..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Success Message */}
                        {!isEditing && (
                            <div className="bg-green-50 border-t border-green-200 p-4">
                                <div className="flex items-center text-green-800">
                                    <Check className="w-5 h-5 mr-2" />
                                    <span className="text-sm font-medium">Profile information is up to date</span>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Help Section */}
                <div className="mt-8 bg-blue-50 rounded-2xl p-6 border border-blue-200">
                    <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-semibold text-blue-900 mb-1">Need Help?</h3>
                            <p className="text-sm text-blue-700">
                                If you need to change your email address or have trouble updating your profile, 
                                please contact our support team.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </ProfileLayout>
    );
};

export default ProfileInformation;