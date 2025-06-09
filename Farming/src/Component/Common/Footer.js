import React from 'react'
import { useNavigate } from 'react-router-dom'

const Footer = () => {
 
  return (
    <footer className="bg-green-600 text-white py-8">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Industries Column */}
        <div>
          <h3 className="text-lg font-bold mb-4 uppercase">Industries</h3>
          <ul className="space-y-2">
            <li>Farms</li>
            <li>Enterprise Farms</li>
            <li>Cooperatives</li>
            <li>Food & Beverages</li>
            <li>Banks</li>
            <li>Input Manufacturers</li>
            <li>Agronomic Advisory</li>
            <li>Retail</li>
            <li>Public Sector</li>
          </ul>
        </div>

        {/* Products Column */}
        <div>
          <h3 className="text-lg font-bold mb-4 uppercase">Products</h3>
          <ul className="space-y-2">
            <li>AGRIVI 360 FMS</li>
            <li>Farm Insights</li>
            <li>Farm Enterprise</li>
            <li>Farm Advisory</li>
            <li>Agriculture Supply Chain</li>
            <li>AGRIVI AI Engage</li>
            <li>Inputs</li>
            <li>Ed</li>
            <li>Local Advisor</li>
            <li>AGRIVI Food</li>
            <li>Traceability</li>
            <li>AGRIVI Connect</li>
            <li>Fleet</li>
            <li>Meteo</li>
            <li>Soil</li>
          </ul>
        </div>

        {/* Company Column */}
        <div>
          <h3 className="text-lg font-bold mb-4 uppercase">Company</h3>
          <ul className="space-y-2">
            <li>About Us</li>
            <li>Careers</li>
            <li>Contact Us</li>
            <li>Partner Program</li>
          </ul>
        </div>

        {/* Resources Column */}
        <div>
          <h3 className="text-lg font-bold mb-4 uppercase">Resources</h3>
          <ul className="space-y-2">
            <li>ROI Calculator</li>
            <li>Farm Digitalization Score</li>
            <li>Blog</li>
            <li>News</li>
            <li>Case Studies</li>
            <li>eBooks</li>
            <li>Book a Meeting</li>
            <li>Log In</li>
          </ul>
        </div>
      </div>
      <div className="mt-8 text-center">
        <button
          className="bg-white text-green-600 rounded-full p-2 shadow-md"
          aria-label="Scroll to Top"
          
        >
          ↑
        </button>
      </div>
    </footer>
  )
}

export default Footer