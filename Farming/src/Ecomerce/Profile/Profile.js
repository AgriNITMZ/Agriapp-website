import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../services/operations/authApi";

const ProfileLayout = ({ children }) => {
    const [activePage, setActivePage] = useState("Profile Information");
    const navigate = useNavigate();
    const dispatch=useDispatch()
    const handleNavigation = (page) => {
        setActivePage(page);
        switch (page) {
            case "Orders":
                navigate("/product/profile/orders");
                break;
            case "Profile Information":
                navigate("/product/profile/information");
                break;
            case "Manage Addresses":
                navigate("/product/profile/addresses");
                break;
            case "PAN Card Information":
                navigate("/product/profile/pan-card");
                break;
            // Add cases for other pages
            default:
                navigate("/product/profile/information");
        }
    };
  const handleLogout=async()=>{
    dispatch(logout(navigate))

  }


    return (
        <div className="flex md:flex-row bg-gray-100 min-h-screen p-4 mt-16 gap-4">
            {/* Sidebar */}
            <div className="w-full md:w-1/4 bg-white shadow-md p-4 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Hello, PreciAgri Customer</h2>
                <nav>
                    <div className="mb-3 hover:bg-gray-40" onClick={() => handleNavigation("Orders")}>
                        <p className="text-gray-700 font-medium">MY ORDERS</p>
                    </div>

                    <div className="mb-3">
                        <p className="text-gray-700 font-medium">ACCOUNT SETTINGS</p>
                        <ul className="pl-4 space-y-1 text-gray-600">
                            <li
                                className={`cursor-pointer ${activePage === "Profile Information" ? "text-blue-600 font-semibold" : ""
                                    } hover:text-blue-800`}
                                onClick={() => handleNavigation("Profile Information")}
                            >
                                Profile Information
                            </li>
                            <li
                                className={`cursor-pointer ${activePage === "Manage Addresses" ? "text-blue-600 font-semibold" : ""
                                    } hover:text-gray-900`}
                                onClick={() => handleNavigation("Manage Addresses")}
                            >
                                Manage Addresses
                            </li>
                            <li
                                className={`cursor-pointer ${activePage === "PAN Card Information" ? "text-blue-600 font-semibold" : ""
                                    } hover:text-gray-900`}
                                onClick={() => handleNavigation("PAN Card Information")}
                            >
                                PAN Card Information
                            </li>
                        </ul>
                    </div>

                    <div className="mb-3">
                        <p className="text-gray-700 font-medium">PAYMENTS</p>
                        <ul className="pl-4 space-y-1 text-gray-600">
                            <li
                                className={`cursor-pointer ${activePage === "Gift Cards" ? "text-blue-600 font-semibold" : ""
                                    } hover:text-gray-900`}
                                onClick={() => handleNavigation("Gift Cards")}
                            >
                                Gift Cards
                            </li>
                            <li
                                className={`cursor-pointer ${activePage === "Saved UPI" ? "text-blue-600 font-semibold" : ""
                                    } hover:text-gray-900`}
                                onClick={() => handleNavigation("Saved UPI")}
                            >
                                Saved UPI
                            </li>
                            <li
                                className={`cursor-pointer ${activePage === "Saved Cards" ? "text-blue-600 font-semibold" : ""
                                    } hover:text-gray-900`}
                                onClick={() => handleNavigation("Saved Cards")}
                            >
                                Saved Cards
                            </li>
                        </ul>
                    </div>

                    <div className="mb-3">
                        <p className="text-gray-700 font-medium">MY STUFF</p>
                        <ul className="pl-4 space-y-1 text-gray-600">
                            <li
                                className={`cursor-pointer ${activePage === "My Coupons" ? "text-blue-600 font-semibold" : ""
                                    } hover:text-gray-900`}
                                onClick={() => handleNavigation("My Coupons")}
                            >
                                My Coupons
                            </li>
                            <li
                                className={`cursor-pointer ${activePage === "My Reviews & Ratings" ? "text-blue-600 font-semibold" : ""
                                    } hover:text-gray-900`}
                                onClick={() => handleNavigation("My Reviews & Ratings")}
                            >
                                My Reviews & Ratings
                            </li>
                            <li
                                className={`cursor-pointer ${activePage === "All Notifications" ? "text-blue-600 font-semibold" : ""
                                    } hover:text-gray-900`}
                                onClick={() => handleNavigation("All Notifications")}
                            >
                                All Notifications
                            </li>
                            <li
                                className={`cursor-pointer ${activePage === "My Wishlist" ? "text-blue-600 font-semibold" : ""
                                    } hover:text-gray-900`}
                                onClick={() => handleNavigation("My Wishlist")}
                            >
                                My Wishlist
                            </li>
                        </ul>
                    </div>

                    <div onClick={() => handleLogout()}>
                        <p className="text-red-500 font-medium cursor-pointer mt-4 hover:text-red-700">
                            Logout
                        </p>
                    </div>
                </nav>
            </div>

            {/* Main Content */}
            <div className="font-sans w-full p-6 bg-white">{children}</div>
        </div>
    );
};

export default ProfileLayout