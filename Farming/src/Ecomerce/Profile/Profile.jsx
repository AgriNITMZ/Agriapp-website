import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../../services/operations/authApi";
import { 
    User, 
    Package, 
    Settings, 
    MapPin, 
    CreditCard, 
    Gift, 
    Smartphone, 
    Heart, 
    Star, 
    Bell, 
    Tag, 
    LogOut,
    ChevronRight,
    Menu,
    X,
    MessageCircle
} from "lucide-react";

const ProfileLayout = ({ children }) => {
    const [activePage, setActivePage] = useState("Profile Information");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const user = useSelector((state) => state.profile.user);

    // Update active page based on current route
    useEffect(() => {
        const path = location.pathname;
        if (path.includes('/orders')) setActivePage("Orders");
        else if (path.includes('/information')) setActivePage("Profile Information");
        else if (path.includes('/addresses')) setActivePage("Manage Addresses");
        else if (path.includes('/pan-card')) setActivePage("PAN Card Information");
        else if (path.includes('/wishlist')) setActivePage("My Wishlist");
        else if (path.includes('/gift-cards')) setActivePage("Gift Cards");
        else if (path.includes('/saved-upi')) setActivePage("Saved UPI");
        else if (path.includes('/saved-cards')) setActivePage("Saved Cards");
        else if (path.includes('/coupons')) setActivePage("My Coupons");
        else if (path.includes('/reviews')) setActivePage("My Reviews & Ratings");
        else if (path.includes('/notifications')) setActivePage("All Notifications");
        else if (path.includes('/contact-us')) setActivePage("Contact Us");
    }, [location.pathname]);

    const handleNavigation = (page) => {
        setActivePage(page);
        setIsMobileMenuOpen(false);
        
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
                navigate("/profile/pan-card");
                break;
            case "My Wishlist":
                navigate("/product/wishlist");
                break;
            case "Gift Cards":
                navigate("/product/profile/gift-cards");
                break;
            case "Saved UPI":
                navigate("/product/profile/saved-upi");
                break;
            case "Saved Cards":
                navigate("/product/profile/saved-cards");
                break;
            case "My Coupons":
                navigate("/product/profile/coupons");
                break;
            case "My Reviews & Ratings":
                navigate("/product/profile/reviews");
                break;
            case "All Notifications":
                navigate("/product/profile/notifications");
                break;
            case "Contact Us":
                navigate("/product/profile/contact-us");
                break;
            default:
                navigate("/product/profile/information");
        }
    };

    const handleLogout = async () => {
        dispatch(logout(navigate));
    };

    const menuItems = [
        {
            category: "MY ORDERS",
            icon: <Package className="w-5 h-5" />,
            items: [
                { name: "Orders", key: "Orders" }
            ]
        },
        {
            category: "ACCOUNT SETTINGS",
            icon: <Settings className="w-5 h-5" />,
            items: [
                { name: "Profile Information", key: "Profile Information", icon: <User className="w-4 h-4" /> },
                { name: "Manage Addresses", key: "Manage Addresses", icon: <MapPin className="w-4 h-4" /> },
                { name: "PAN Card Information", key: "PAN Card Information", icon: <CreditCard className="w-4 h-4" /> }
            ]
        },
        {
            category: "PAYMENTS",
            icon: <CreditCard className="w-5 h-5" />,
            items: [
                { name: "Gift Cards", key: "Gift Cards", icon: <Gift className="w-4 h-4" /> },
                { name: "Saved UPI", key: "Saved UPI", icon: <Smartphone className="w-4 h-4" /> },
                { name: "Saved Cards", key: "Saved Cards", icon: <CreditCard className="w-4 h-4" /> }
            ]
        },
        {
            category: "MY STUFF",
            icon: <Heart className="w-5 h-5" />,
            items: [
                { name: "My Coupons", key: "My Coupons", icon: <Tag className="w-4 h-4" /> },
                { name: "My Reviews & Ratings", key: "My Reviews & Ratings", icon: <Star className="w-4 h-4" /> },
                { name: "All Notifications", key: "All Notifications", icon: <Bell className="w-4 h-4" /> },
                { name: "My Wishlist", key: "My Wishlist", icon: <Heart className="w-4 h-4" /> }
            ]
        },
        {
            category: "SUPPORT",
            icon: <MessageCircle className="w-5 h-5" />,
            items: [
                { name: "Contact Us", key: "Contact Us", icon: <MessageCircle className="w-4 h-4" /> }
            ]
        }
    ];

    const Sidebar = ({ isMobile = false }) => (
        <div className={`${isMobile ? 'w-full' : 'w-full md:w-80'} bg-white shadow-xl rounded-2xl overflow-hidden`}>
            {/* User Profile Header */}
            <div className="bg-gradient-to-r from-mizoram-600 to-mizoram-700 p-6 text-white">
                <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                        {user?.image ? (
                            <img 
                                src={user.image} 
                                alt="Profile" 
                                className="w-14 h-14 rounded-full object-cover"
                            />
                        ) : (
                            <User className="w-8 h-8 text-white" />
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">
                            Hello, {user?.additionalDetails?.firstName || (user?.Name ? user.Name.split(' ')[0] : 'Guest')}!
                        </h2>
                        <p className="text-mizoram-100 font-medium">
                            {user?.Name || 'PRECI AGRI Customer'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="p-4">
                {menuItems.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="mb-6">
                        {/* Category Header */}
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="text-mizoram-600">{section.icon}</div>
                            <h3 className="text-sm font-bold text-gray-800 tracking-wide">
                                {section.category}
                            </h3>
                        </div>

                        {/* Menu Items */}
                        <div className="space-y-1">
                            {section.items.map((item, itemIndex) => (
                                <button
                                    key={itemIndex}
                                    onClick={() => handleNavigation(item.key)}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group ${
                                        activePage === item.key
                                            ? 'bg-mizoram-50 text-mizoram-700 border-l-4 border-mizoram-600'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        {item.icon && (
                                            <div className={`${
                                                activePage === item.key ? 'text-mizoram-600' : 'text-gray-400'
                                            }`}>
                                                {item.icon}
                                            </div>
                                        )}
                                        <span className="font-medium text-sm">{item.name}</span>
                                    </div>
                                    <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${
                                        activePage === item.key ? 'text-mizoram-600' : 'text-gray-300 group-hover:text-gray-500'
                                    }`} />
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 p-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 group mt-6"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="font-medium text-sm">Logout</span>
                </button>
            </nav>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-16">
            <div className="flex flex-col lg:flex-row">
                {/* Mobile Menu Button */}
                <div className="lg:hidden px-4 py-2">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="flex items-center space-x-2 bg-white p-3 rounded-xl shadow-md w-full justify-center"
                    >
                        <Menu className="w-5 h-5" />
                        <span className="font-medium">Account Menu</span>
                    </button>
                </div>

                {/* Desktop Sidebar - Fixed to left edge with no gap */}
                <div className="hidden lg:block lg:w-80 lg:fixed lg:left-0 lg:top-16 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto bg-white shadow-xl border-r border-gray-200">
                    <Sidebar />
                </div>

                {/* Mobile Sidebar Overlay */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
                        <div className="absolute left-0 top-0 h-full w-80 max-w-[90vw] bg-white shadow-2xl">
                            <div className="flex items-center justify-between p-4 border-b">
                                <h2 className="text-lg font-bold">Account Menu</h2>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="overflow-y-auto h-full pb-20">
                                <Sidebar isMobile={true} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content - Properly aligned with sidebar */}
                <div className="flex-1 lg:ml-80">
                    <div className="p-4 lg:p-6">
                        <div className="bg-white rounded-2xl shadow-xl min-h-[600px]">
                            {/* Fixed header spacing to prevent overlap */}
                            <div className="p-6 lg:p-8 pt-8">
                                {children}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileLayout