import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowUp } from 'lucide-react'

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
 
  return (
    <footer className="bg-gradient-to-br from-mizoram-800 to-mizoram-900 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center max-w-4xl mx-auto">
          
          {/* Company Branding */}
          <div className="mb-8">
            <h2 className="text-4xl lg:text-5xl font-display font-bold mb-4 tracking-wide hero-text">
              PERCI AGRI
            </h2>
            <h3 className="text-xl lg:text-2xl font-display font-semibold text-mizoram-200 mb-6 professional-text">
              Smart Farming Marketplace
            </h3>
          </div>

          {/* Company Description */}
          <div className="mb-12">
            <p className="text-lg lg:text-xl text-mizoram-100 leading-relaxed font-body max-w-3xl mx-auto body-text">
              Connecting agricultural sellers with Mizoram farmers through IoT-based smart farming solutions and modern marketplace technology.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            <Link to="/" className="text-mizoram-200 hover:text-white transition-colors duration-200 font-medium">
              Home
            </Link>
            <Link to="/about" className="text-mizoram-200 hover:text-white transition-colors duration-200 font-medium">
              About Us
            </Link>
            <Link to="/news" className="text-mizoram-200 hover:text-white transition-colors duration-200 font-medium">
              News
            </Link>
            <Link to="/product" className="text-mizoram-200 hover:text-white transition-colors duration-200 font-medium">
              Marketplace
            </Link>
            <Link to="/contact" className="text-mizoram-200 hover:text-white transition-colors duration-200 font-medium">
              Contact
            </Link>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-mizoram-700">
        <div className="container mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-mizoram-300 text-sm font-medium">
            © 2024 PERCI AGRI. All rights reserved. Smart farming marketplace for Mizoram.
          </p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-mizoram-300 hover:text-white text-sm transition-colors font-medium">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-mizoram-300 hover:text-white text-sm transition-colors font-medium">
              Terms of Service
            </Link>
            <button
              onClick={scrollToTop}
              className="bg-mizoram-600 hover:bg-mizoram-500 text-white rounded-full p-2 shadow-lg transition-colors duration-200"
              aria-label="Scroll to Top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer