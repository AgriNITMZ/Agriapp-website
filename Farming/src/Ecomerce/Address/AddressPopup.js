import axios from "axios";
import { useEffect, useState } from "react";

const AddressPopup = ({ isVisible, onClose, onAddressSelect }) => {
    const [addresses, setAddresses] = useState([]);
    const [isAddingAddress, setIsAddingAddress] = useState(false); // State to toggle between views
    const [formData, setFormData] = useState({
        Name: "",
        streetAddress: "",
        city: "",
        state: "",
        zipCode: "",
        mobile: "",
    });
    let token;
    const storedTokenData = JSON.parse(localStorage.getItem("token"));
    if (storedTokenData && Date.now() < storedTokenData.expires) {
        console.log("Token:", storedTokenData.value);
        token = storedTokenData.value
    } else {
        localStorage.removeItem("token");
        console.log("Token has expired");
    }

    // Fetch addresses from the backend
    const fetchAddresses = async () => {
        try {
           
            const response = await axios.get("http://localhost:4000/api/v1/auth/getaddress", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setAddresses(response.data);
        } catch (error) {
            console.error("Error fetching addresses:", error);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Handle form submission for adding a new address
    const handleAddAddress = async (e) => {
        e.preventDefault();
        try {
           
            await axios.post(
                "http://localhost:4000/api/v1/auth/addaddress",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            alert("Address added successfully!");
            setIsAddingAddress(false); // Switch back to the address selection view
            fetchAddresses(); // Refresh the address list
        } catch (error) {
            console.error("Error adding address:", error);
            alert("Failed to add address.");
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                {/* Header */}
                <h2 className="text-xl font-bold mb-4">
                    {isAddingAddress ? "Add New Address" : "Select Address"}
                </h2>

                {/* Add New Address Form */}
                {isAddingAddress && (
                    <form onSubmit={handleAddAddress} className="space-y-4">
                        <input
                            type="text"
                            name="Name"
                            placeholder="Full Name"
                            value={formData.Name}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border rounded"
                        />
                        <input
                            type="text"
                            name="streetAddress"
                            placeholder="Street Address"
                            value={formData.streetAddress}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border rounded"
                        />
                        <input
                            type="text"
                            name="city"
                            placeholder="City"
                            value={formData.city}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border rounded"
                        />
                        <input
                            type="text"
                            name="state"
                            placeholder="State"
                            value={formData.state}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border rounded"
                        />
                        <input
                            type="text"
                            name="zipCode"
                            placeholder="Zip Code"
                            value={formData.zipCode}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border rounded"
                        />
                        <input
                            type="text"
                            name="mobile"
                            placeholder="Mobile Number"
                            value={formData.mobile}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        />
                        <button
                            type="submit"
                            className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
                        >
                            Save Address
                        </button>
                        <button
                            className="w-full bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
                            onClick={() => setIsAddingAddress(false)}
                        >
                            Cancel
                        </button>
                    </form>
                )}

                {/* Select Address View */}
                {!isAddingAddress && (
                    <>
                        <div className="space-y-2">
                            {addresses.map((address) => (
                                <div
                                    key={address._id}
                                    className="p-3 border rounded cursor-pointer hover:bg-gray-100"
                                    onClick={() => {
                                        onAddressSelect(address._id);
                                        onClose();
                                    }}
                                >
                                    <p className="font-semibold">{address.Name}</p>
                                    <p>{`${address.streetAddress}, ${address.city}, ${address.state}, ${address.zipCode}`}</p>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-4">
                        <button
                            className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                            onClick={() => setIsAddingAddress(true)} // Show the "Add New Address" form
                        >
                            Add New Address
                        </button>
                        <button
                            className="mt-4 w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AddressPopup;