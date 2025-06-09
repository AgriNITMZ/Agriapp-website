import React, { useState, useEffect } from 'react';
import AddProduct from './Component/AddProduct';
import OrdersTable from './Component/OrdersTable';
import ProductTable from './Component/ProductTable';
import DashBoard from './Component/DashBoard';

// Placeholder components for dashboard views


const Customers = () => <div>Customers List</div>;

const UpdateProductForm = () => <div>Update Product Form</div>;

const Seller = () => {
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth > 1024);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [currentRoute, setCurrentRoute] = useState('/');

  // Menu items with routes
  const menuItems = [
    { name: "Dashboard", path: "/", icon: "📊" },
    { name: "Products", path: "/products", icon: "📦" },
    { name: "Customers", path: "/customers", icon: "👥" },
    { name: "Orders", path: "/orders", icon: "🛒" },
    { name: "Total Earnings", path: "/earnings", icon: "💰" },
    { name: "Weekly Overview", path: "/weekly", icon: "📅" },
    { name: "Monthly Overview", path: "/monthly", icon: "📆" },
    { name: "Add Product", path: "/product/create", icon: "➕" }
  ];

  // Responsive check
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth > 1024);
    };

    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Logout handler (placeholder)
  const handleLogout = () => {
    // Implement actual logout logic
    setCurrentRoute('/');
    localStorage.removeItem('token');
  };

  // Render current view based on route
  const renderCurrentView = () => {
    switch (currentRoute) {
      case '/':
        return <DashBoard />;
      case '/products':
        return <ProductTable />;
      case '/customers':
        return <Customers />;
      case '/orders':
        return <OrdersTable />;
      case '/product/create':
        return <AddProduct />;
      case '/product/update':
        return <UpdateProductForm />;
      default:
        return <DashBoard />;
    }
  };

  // Sidebar component
  const Sidebar = () => (
    <div className={`
      fixed top-0 left-0 h-full w-64 bg-gray-800 text-white transition-transform duration-300
      ${isLargeScreen || sidebarVisible ? 'translate-x-0' : '-translate-x-full'}
      lg:translate-x-0 lg:static
    `}>
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold">Admin Panel</h2>
      </div>
      
      <nav className="py-4 flex flex-col justify-between">
        {menuItems.map((item) => (
          <div 
            key={item.path}
            onClick={() => {
              setCurrentRoute(item.path);
              if (!isLargeScreen) setSidebarVisible(false);
            }}
            className="flex items-center p-3 hover:bg-gray-700 cursor-pointer"
          >
            <span className="mr-3">{item.icon}</span>
            <span>{item.name}</span>
          </div>
        ))}
      </nav>

      {/* Logout Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
        <button 
          onClick={handleLogout}
          className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );

  // Navbar component
  const Navbar = () => (
    <div className="bg-white shadow-md p-4 flex justify-between items-center lg:hidden">
      <button 
        onClick={() => setSidebarVisible(!sidebarVisible)}
        className="text-2xl"
      >
        ☰
      </button>
      <h1 className="text-xl font-semibold">Admin Panel</h1>
      <div>{/* Placeholder for additional navbar items */}</div>
    </div>
  );

  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-gray-100">
        <Navbar />
        
        <div className="p-6">
          {renderCurrentView()}
        </div>
      </main>
    </div>
  );
};


export default Seller
