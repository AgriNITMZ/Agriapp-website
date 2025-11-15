import { useEffect, useState } from 'react'
import ProfileLayout from './Profile'
import axios from 'axios';
import { X, MoreVertical, Edit2, Trash2, Plus, MapPin, Phone, Home, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Address = () => {
    const [addresses, setAddresses] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState(null);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [formData, setFormData] = useState({
        Name: '',
        streetAddress: '',
        city: '',
        state: '',
        zipCode: '',
        mobile: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    let token;
    const storedTokenData = JSON.parse(localStorage.getItem("token"));
    if (storedTokenData && Date.now() < storedTokenData.expires) {
        console.log("Token:", storedTokenData.value);
        token = storedTokenData.value
    } else {
        localStorage.removeItem("token");
        console.log("Token has expired");
    }

    const fetchAddresses=async()=>{
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/getaddress`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setAddresses(response.data);
        } catch (error) {
            console.error("Error fetching addresses:", error);
        }
    }
    console.log("addresses",addresses)

    useEffect(()=>{
        fetchAddresses()
         
    },[])

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (!formData.Name.trim()) return "Name is required";
        if (!formData.streetAddress.trim()) return "Street address is required";
        if (!formData.city.trim()) return "City is required";
        if (!formData.state.trim()) return "State is required";
        if (!formData.zipCode.trim()) return "ZIP code is required";
        if (!formData.mobile.trim()) return "Mobile number is required";
        if (!/^\d{10}$/.test(formData.mobile)) return "Invalid mobile number";
        if (!/^\d{6}$/.test(formData.zipCode)) return "Invalid ZIP code";
        return "";
    };

    const handleEditClick = (address) => {
        setFormData({
            Name: address.Name,
            streetAddress: address.streetAddress,
            city: address.city,
            state: address.state,
            zipCode: address.zipCode,
            mobile: address.mobile
        });
        setIsEditing(true);
        setEditingAddressId(address._id);
        setShowModal(true);
        setActiveDropdown(null);
    };

    const handleDeleteClick = async (addressId) => {
        if (window.confirm('Are you sure you want to delete this address?')) {
            try {
                await axios.delete(`${import.meta.env.VITE_API_URL}/auth/deleteaddress/${addressId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                toast.success('Address deleted successfully');
                fetchAddresses();
            } catch (error) {
                console.error("Error deleting address:", error);
                toast.error("Failed to delete address");
            }
        }
        setActiveDropdown(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError('');

        try {
            if (isEditing) {
                await axios.put(
                    `${import.meta.env.VITE_API_URL}/auth/updateaddress/${editingAddressId}`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
            } else {
                await axios.post(
                    `${import.meta.env.VITE_API_URL}/auth/addaddress`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
            }

            // Show success message
            toast.success(isEditing ? 'Address updated successfully' : 'Address added successfully');
            
            // Reset form and close modal
            setFormData({ 
                Name: '',
                streetAddress: '',
                city: '',
                state: '',
                zipCode: '',
                mobile: ''
            });
            setShowModal(false);
            setIsEditing(false);
            setEditingAddressId(null);
            
            // Refresh addresses list
            fetchAddresses();
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Error saving address";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (activeDropdown && !event.target.closest('.dropdown-container')) {
                setActiveDropdown(null);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [activeDropdown]);

    return (
        <ProfileLayout>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Addresses</h1>
                        <p className="text-gray-600">Manage your delivery addresses</p>
                    </div>
                    <button
                        onClick={() => {
                            setIsEditing(false);
                            setEditingAddressId(null);
                            setFormData({
                                Name: '',
                                streetAddress: '',
                                city: '',
                                state: '',
                                zipCode: '',
                                mobile: ''
                            });
                            setShowModal(true);
                        }}
                        className="flex items-center space-x-2 bg-mizoram-600 text-white px-6 py-3 rounded-xl hover:bg-mizoram-700 transition-colors duration-200 shadow-lg mt-4 sm:mt-0"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add New Address</span>
                    </button>
                </div>

                {/* Addresses Grid */}
                {addresses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {addresses.map((address) => (
                            <div
                                key={address._id}
                                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-200 relative group"
                            >
                                {/* Actions Dropdown */}
                                <div className="dropdown-container absolute top-4 right-4">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveDropdown(activeDropdown === address._id ? null : address._id);
                                        }}
                                        className="p-2 hover:bg-gray-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                    >
                                        <MoreVertical size={18} className="text-gray-500" />
                                    </button>
                                    
                                    {activeDropdown === address._id && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg z-10 border border-gray-200 overflow-hidden">
                                            <button
                                                onClick={() => handleEditClick(address)}
                                                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 w-full transition-colors duration-200"
                                            >
                                                <Edit2 size={16} className="mr-3 text-mizoram-600" />
                                                Edit Address
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(address._id)}
                                                className="flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 w-full transition-colors duration-200"
                                            >
                                                <Trash2 size={16} className="mr-3" />
                                                Delete Address
                                            </button>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Address Content */}
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-mizoram-100 rounded-full flex items-center justify-center">
                                            <Home className="w-5 h-5 text-mizoram-600" />
                                        </div>
                                        <h3 className="font-bold text-lg text-gray-900">{address.Name}</h3>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <div className="flex items-start space-x-3">
                                            <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                                            <div className="text-gray-600">
                                                <p>{address.streetAddress}</p>
                                                <p>{`${address.city}, ${address.state} ${address.zipCode}`}</p>
                                            </div>
                                        </div>
                                        
                                        {address.mobile && (
                                            <div className="flex items-center space-x-3">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                <p className="text-gray-600">{address.mobile}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <MapPin className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No addresses found</h3>
                        <p className="text-gray-600 mb-6">Add your first delivery address to get started</p>
                        <button
                            onClick={() => {
                                setIsEditing(false);
                                setEditingAddressId(null);
                                setFormData({
                                    Name: '',
                                    streetAddress: '',
                                    city: '',
                                    state: '',
                                    zipCode: '',
                                    mobile: ''
                                });
                                setShowModal(true);
                            }}
                            className="flex items-center space-x-2 bg-mizoram-600 text-white px-6 py-3 rounded-xl hover:bg-mizoram-700 transition-colors duration-200 shadow-lg mx-auto"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Your First Address</span>
                        </button>
                    </div>
                )}

                {/* Add/Edit Address Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                            {/* Modal Header */}
                            <div className="flex justify-between items-center p-6 border-b border-gray-200">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        {isEditing ? 'Edit Address' : 'Add New Address'}
                                    </h3>
                                    <p className="text-gray-600 mt-1">
                                        {isEditing ? 'Update your delivery address' : 'Add a new delivery address'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                                >
                                    <X size={24} className="text-gray-500" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6">
                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
                                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <h4 className="text-sm font-semibold text-red-800">Error</h4>
                                            <p className="text-sm text-red-700">{error}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-6">
                                    {/* Personal Information */}
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                            <Home className="w-5 h-5 mr-2 text-mizoram-600" />
                                            Personal Information
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Full Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="Name"
                                                    value={formData.Name}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mizoram-500 focus:border-mizoram-500 transition-colors duration-200"
                                                    placeholder="Enter your full name"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Mobile Number *
                                                </label>
                                                <input
                                                    type="tel"
                                                    name="mobile"
                                                    value={formData.mobile}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mizoram-500 focus:border-mizoram-500 transition-colors duration-200"
                                                    placeholder="Enter mobile number"
                                                    maxLength="10"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Address Information */}
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                            <MapPin className="w-5 h-5 mr-2 text-mizoram-600" />
                                            Address Information
                                        </h4>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Street Address *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="streetAddress"
                                                    value={formData.streetAddress}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mizoram-500 focus:border-mizoram-500 transition-colors duration-200"
                                                    placeholder="House no, Building name, Street name"
                                                />
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        City *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="city"
                                                        value={formData.city}
                                                        onChange={handleInputChange}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mizoram-500 focus:border-mizoram-500 transition-colors duration-200"
                                                        placeholder="Enter city"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        State *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="state"
                                                        value={formData.state}
                                                        onChange={handleInputChange}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mizoram-500 focus:border-mizoram-500 transition-colors duration-200"
                                                        placeholder="Enter state"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        ZIP Code *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="zipCode"
                                                        value={formData.zipCode}
                                                        onChange={handleInputChange}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mizoram-500 focus:border-mizoram-500 transition-colors duration-200"
                                                        placeholder="Enter ZIP code"
                                                        maxLength="6"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 mt-8 pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors duration-200 font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-3 bg-mizoram-600 text-white rounded-xl hover:bg-mizoram-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                    >
                                        {loading && (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        )}
                                        <span>
                                            {loading 
                                                ? (isEditing ? 'Updating...' : 'Adding...') 
                                                : (isEditing ? 'Update Address' : 'Add Address')
                                            }
                                        </span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </ProfileLayout>
    );
};

export default Address
