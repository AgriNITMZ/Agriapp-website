import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Heart, Search, Server, ShoppingCart, Store, User } from "lucide-react";
import logo from "../../Data/Logo/logo.png";
import { useSelector } from "react-redux";
import axios from "axios";
import ChatBot from "./ChatBot";

const NavBar = () => {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [query, setQuery] = useState("");

  // ⬇️  NEW: read token from Redux
  const token = useSelector((state) => state.auth.token);
  console.log("Token from Redux:", token);

  // Redux state for wishlist & user profile
  const wishlistCount = useSelector((state) => state.wishlist.totalItems);
  const reduxUser = useSelector((state) => state.profile.user);

  // Local copies (so we can fill them either from Redux or fallback fetch)
  const [userImage, setUserImage] = useState("");
  const [userRole, setUserRole] = useState("");

  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  /* ------------------------------------------------------------------ */
  /* 1.  Sync local img / role from Redux whenever it changes           */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (reduxUser) {
      setUserImage(reduxUser.image);
      setUserRole(reduxUser.accountType);
    }
  }, [reduxUser]);

  /* ------------------------------------------------------------------ */
  /* 2.  Fallback: fetch user if we have a token but no redux user      */
  /*     (keeps your old behavior / context happy)                      */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:4000/api/v1/auth/getuserbytoken",
          { headers: { Authorization: `Bearer ${token.value}` } }
        );
        setUserImage(data.user.image);
        setUserRole(data.user.accountType);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    if (token && !reduxUser) fetchUser();
  }, [token, reduxUser]);

  /* ------------------------------------------------------------------ */
  /* 3.  Active section (kept as‑is)                                    */
  /* ------------------------------------------------------------------ */
  const [activeSection, setActiveSection] = useState("");
  useEffect(() => {
    setActiveSection(location.pathname.startsWith("/product") ? "product" : "");
  }, [location]);

  /* ------------------------------------------------------------------ */
  /* 4.  Close mobile menu on outside click (unchanged)                 */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMobileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  /* ------------------------------------------------------------------ */
  /* 5.  Navigation helpers                                             */
  /* ------------------------------------------------------------------ */
  const handleSearch   = () => navigate(`/product/search?query=${query}`);
  const goToCart       = () => navigate("/product/cart");
  const goToProfile    = () => navigate("/product/profile");
  const goToWishList   = () => navigate("/product/wishlist");

  /* ------------------------------------------------------------------ */
  /* 6.  Render                                                         */
  /* ------------------------------------------------------------------ */
  return (
    <>
      {activeSection !== "product" ? (
        /* ---------------------  Marketing / home navbar  --------------------- */
        <nav className="bg-green-600 text-white shadow-lg fixed top-0 left-0 w-full z-50">
          <div className="container mx-auto px-4 flex justify-between items-center py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img src={logo} alt="PreciAgri Logo" className="h-10 w-40 object-contain" />
            </Link>

            {/* Desktop links */}
            <ul className="hidden md:flex space-x-6">
              <li><Link to="/"        className="hover:text-gray-200">Home</Link></li>
              <li><Link to="/news"    className="hover:text-gray-200">News</Link></li>
              <li><Link to="/about"   className="hover:text-gray-200">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-gray-200">Contact</Link></li>
              <li><Link to="/product" className="hover:text-gray-200">Product</Link></li>

              {!token ? (
                /* Guest view */
                <div className="flex gap-5">
                  <li><Link to="/signup" className="hover:text-gray-200 font-bold">SignUp</Link></li>
                  <li><Link to="/login"  className="font-bold hover:text-gray-200">Login</Link></li>
                </div>
              ) : (
                /* Logged‑in view */
                <div className="flex gap-5 items-center">
                  <li>
                    <Link to="/profile" className="hover:text-gray-200 font-bold">
                      <img src={userImage} alt="User" className="w-8 h-8 rounded-full object-cover" />
                    </Link>
                  </li>
                  <li>
                    <Link to="/server" className="hover:text-gray-200 font-bold">
                      <Server className="w-5 h-5" />
                    </Link>
                  </li>
                </div>
              )}
            </ul>

            {/* Mobile burger */}
            <button
              className="md:hidden text-white focus:outline-none"
              onClick={() => setMobileMenu(!mobileMenu)}
            >
              ☰
            </button>
          </div>

          {/* Mobile drawer */}
          {mobileMenu && (
            <div ref={menuRef} className="block md:hidden" onClick={() => setMobileMenu(false)}>
              <ul className="space-y-0 px-4 py-2 bg-green-700 flex justify-between items-center">
                <li><Link to="/"        className="hover:text-gray-200">Home</Link></li>
                <li><Link to="/news"    className="hover:text-gray-200">News</Link></li>
                <li><Link to="/about"   className="hover:text-gray-200">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-gray-200">Contact</Link></li>
                <li><Link to="/product" className="hover:text-gray-200">Product</Link></li>

                {!token ? (
                  <div className="flex gap-5">
                    <li><Link to="/signup" className="hover:text-gray-200 font-bold">SignUp</Link></li>
                    <li><Link to="/login"  className="font-bold hover:text-gray-200">Login</Link></li>
                  </div>
                ) : (
                  <div className="flex gap-5 items-center">
                    <li>
                      <Link to="/profile" className="hover:text-gray-200 font-bold">
                        <img src={userImage} alt="User" className="w-8 h-8 rounded-full object-cover" />
                      </Link>
                    </li>
                    <li>
                      <Link to="/server" className="hover:text-gray-200 font-bold">
                        <Server className="w-5 h-5" />
                      </Link>
                    </li>
                  </div>
                )}
              </ul>
            </div>
          )}
        </nav>
      ) : (
        /* ---------------------  In‑product toolbar --------------------- */
        <div className="fixed top-0 left-0 w-full bg-green-600 text-white shadow-lg z-50">
          <div className="flex items-center justify-between px-4 md:px-8 py-3">
            {/* Logo + Search */}
            <div className="flex items-center gap-4 md:gap-8 w-full">
              <Link to="/" className="flex items-center">
                <img src={logo} alt="PreciAgri Logo" className="h-10 w-auto" />
              </Link>
              <div className="flex items-center border border-gray-300 rounded-lg shadow-sm bg-green-200 w-full max-w-lg">
                <button onClick={handleSearch} className="p-2 text-gray-500 hover:text-gray-700">
                  <Search className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for seeds, pesticides, tools..."
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full px-3 py-2 text-gray-700 bg-green-200 focus:outline-none"
                />
              </div>
            </div>

            {/* Icons */}
            <div className="flex items-center gap-4 md:gap-6">
              <Link to="/" className="flex items-center gap-2 hover:text-gray-200">
                <span className="hidden md:inline">Home</span>
              </Link>

              <div className="flex items-center gap-2 cursor-pointer hover:text-gray-200" onClick={goToCart}>
                <ShoppingCart className="w-5 h-5" />
                <span className="hidden md:inline">Cart</span>
              </div>
              <div className="flex items-center gap-2 cursor-pointer hover:text-gray-200" onClick={goToProfile}>
                <User className="w-5 h-5" />
                <span className="hidden md:inline">Profile</span>
              </div>
              <div className="flex items-center gap-2 cursor-pointer hover:text-gray-200" onClick={goToWishList}>
                <Heart className="w-5 h-5 relative" />
                {wishlistCount > 0 && (
                  <span className="absolute top-[15px] right-[85px] bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
                <span className="hidden md:inline">Wishlist</span>
              </div>
              {userRole === "Seller" && (
                <div className="flex items-center gap-2 cursor-pointer hover:text-gray-200" onClick={() => navigate("/seller")}>
                  <Store className="w-5 h-5" />
                  <span className="hidden md:inline">Sell Now</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
          <ChatBot />

    </>
  );
};

export default NavBar;
