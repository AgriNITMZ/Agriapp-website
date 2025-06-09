import React from 'react'
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  
    const downloadPDF = () => {
      const link = document.createElement("a");
      link.href = "/Assets/react impo.pdf"; // Replace with your PDF file's path
      link.download = "Brochure.pdf"; // Replace with the desired file name
      link.click();
    };
    const navigate=useNavigate();

  
  return (
    <div 
      className="min-h-screen bg-cover bg-center relative"
      style={{
        backgroundImage: `url('/Assets/Image/agri.webp')`
      }}
    >
      {/* Content Container */}
      <div className="px-4 py-20 md:px-8 lg:px-16 max-w-7xl mx-auto">
        <div className="relative max-w-2xl">
          {/* Backdrop blur effect only behind content */}
          <div className="absolute top-0 left-0 right-0 bottom-0 backdrop-blur-md bg-white/30 rounded-lg -z-10" />
          
          {/* Content with padding to account for blur background */}
          <div className="p-8">
            {/* Headings */}
            <h1 className="text-4xl md:text-5xl font-bold text-navy-900 mb-4">
              THE COMPLETE GUIDE TO
            </h1>
            <h2 className="text-4xl md:text-5xl font-bold text-green-600 mb-8">
              SMART AGRICULTURE AND<br />FARMING
            </h2>

            {/* Description */}
            <p className="text-gray-700 text-lg mb-8 max-w-xl">
              If you want to learn more about how to implement smart farming 
              technologies for your agricultural business, you'll enjoy this comprehensive 
              guide that tells you everything you need to know.
            </p>

            {/* Buttons */}
            <div className="space-y-4 md:space-y-0 md:space-x-4 flex flex-col md:flex-row">
              <button className="bg-green-600 text-white px-8 py-3 rounded-full hover:bg-green-700 transition-colors" onClick={()=>{navigate("login")}}>
                Get In Touch
              </button>
              <button className="bg-white text-green-500 px-8 py-3 rounded-full border-2 border-green-500 hover:bg-green-50 transition-colors" onClick={()=>{downloadPDF()}}>
                Download Our Brochure
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeroSection