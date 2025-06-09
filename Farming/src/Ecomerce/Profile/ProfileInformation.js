import { useState } from "react";
import ProfileLayout from "./Profile";


const ProfileInformation = () => {
    const [formData, setFormData] = useState({
        name: "",
        gender: "",
        email: "",
        mobile: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Profile Data:", formData);
    };

    return (
        <ProfileLayout>
            <h2 className="text-2xl text-gray-800 text-center mb-6">Personal Information</h2>
            <form onSubmit={handleSubmit} className="space-y-4 w-1/2">
                <div>
                    <label className="block mb-2 text-gray-700">Full Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your full name"
                    />
                </div>
                <div>
                    <label className="block mb-2 text-gray-700">Gender</label>
                    <div className="flex space-x-4">
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                name="gender"
                                value="male"
                                checked={formData.gender === "male"}
                                onChange={handleChange}
                                className="form-radio text-blue-600"
                            />
                            <span className="ml-2">Male</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                name="gender"
                                value="female"
                                checked={formData.gender === "female"}
                                onChange={handleChange}
                                className="form-radio text-blue-600"
                            />
                            <span className="ml-2">Female</span>
                        </label>
                    </div>
                </div>
                <div>
                    <label className="block mb-2 text-gray-700">Email Address</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your email"
                    />
                </div>
                <div>
                    <label className="block mb-2 text-gray-700">Mobile Number</label>
                    <input
                        type="tel"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter mobile number"
                    />
                </div>
                <div className="flex flex-row gap-2">
                    <button
                        type="submit"
                        className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 transition-colors"
                    >
                        Edit
                    </button>
                    <button
                        type="submit"
                        className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors"
                    >
                        Save Changes
                    </button>
                </div>
            </form>
        </ProfileLayout>
    );
};

export default ProfileInformation;