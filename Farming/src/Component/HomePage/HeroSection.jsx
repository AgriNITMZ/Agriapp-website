import React from 'react'

const HeroSection = () => {

  return (
    <div className="py-16 bg-gradient-to-br from-white to-mizoram-50">
      <div className="container mx-auto px-6 lg:px-12">

        {/* About PRECI AGRI Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-6 hero-text">
            About <span className="text-mizoram-600">PRECI AGRI</span>
          </h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-xl text-gray-600 leading-relaxed mb-10 font-body body-text">
              PRECI AGRI is a revolutionary smart farming platform that bridges traditional Mizoram
              agricultural practices with cutting-edge IoT technology. Our marketplace empowers
              agricultural sellers to provide farmers with essential products and modern solutions.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-white rounded-xl shadow-lg border border-mizoram-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 professional-text">Smart Farming with IoT</h3>
                <p className="text-gray-600 body-text">Advanced sensors and automation for precision agriculture</p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-lg border border-mizoram-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 professional-text">Seller-Focused Marketplace</h3>
                <p className="text-gray-600 body-text">Platform for sellers to reach farmers with quality products</p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-lg border border-mizoram-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 professional-text">Traditional + Modern</h3>
                <p className="text-gray-600 body-text">Respecting heritage while embracing innovation</p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action for Sellers */}
        <div className="bg-gradient-to-r from-mizoram-600 to-mizoram-700 rounded-2xl p-8 lg:p-10 text-white text-center shadow-professional-lg">
          <h3 className="text-3xl font-bold mb-4 font-display hero-text">
            Join Our Marketplace
          </h3>
          <p className="text-xl text-mizoram-100 max-w-2xl mx-auto font-body body-text">
            Connect with farmers across Mizoram. Sell seeds, fertilizers, farming instruments, and IoT solutions through our smart farming marketplace.
          </p>
        </div>
      </div>
    </div>
  )
}

export default HeroSection