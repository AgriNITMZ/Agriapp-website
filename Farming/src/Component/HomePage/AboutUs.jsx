import React from 'react'
import { MapPin, Users, Leaf, Award } from 'lucide-react'

const AboutUs = () => {
  const stats = [
    { icon: <Users className="w-8 h-8" />, number: "200+", label: "Active Sellers" },
    { icon: <MapPin className="w-8 h-8" />, number: "8", label: "Districts Covered" },
    { icon: <Leaf className="w-8 h-8" />, number: "5000+", label: "Products Listed" },
    { icon: <Award className="w-8 h-8" />, number: "98%", label: "Seller Satisfaction" }
  ];

  return (
    <div className='py-16 bg-gradient-to-br from-mizoram-50 to-white pt-20'>
      <div className='container mx-auto px-6 lg:px-12'>
        
        {/* Section Header */}
        <div className='text-center mb-12'>
          <h2 className='text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-6 hero-text'>
            Why Choose <span className='text-mizoram-600'>PRECI AGRI</span>
          </h2>
          <p className='text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-body body-text'>
            The premier marketplace connecting agricultural sellers with Mizoram farmers through smart technology
          </p>
        </div>

        <div className='grid lg:grid-cols-2 gap-12 items-center mb-12'>
          
          {/* Left Content */}
          <div className='space-y-6'>
            <div className='space-y-4'>
              <h3 className='text-3xl font-bold text-gray-900 professional-text'>
                Smart Marketplace for Agricultural Success
              </h3>
              
              <p className='text-lg text-gray-600 leading-relaxed body-text'>
                PRECI AGRI is a revolutionary marketplace platform that connects agricultural sellers 
                with farmers across Mizoram. We provide a comprehensive ecosystem where sellers can 
                offer seeds, fertilizers, farming instruments, and IoT-based smart farming solutions 
                to enhance traditional agricultural practices.
              </p>
              
              <p className='text-lg text-gray-600 leading-relaxed body-text'>
                Our platform bridges the gap between traditional Mizoram farming wisdom and modern 
                agricultural technology, enabling sellers to reach farmers in all eight districts 
                with quality products and innovative solutions.
              </p>
            </div>

            <div className='grid md:grid-cols-2 gap-6'>
              <div className='bg-white p-4 rounded-xl shadow-lg border border-mizoram-100'>
                <h4 className='text-lg font-semibold text-gray-900 mb-2 professional-text'>For Sellers</h4>
                <p className='text-gray-600 leading-relaxed text-sm body-text'>
                  Expand your agricultural business by reaching farmers across Mizoram through our marketplace platform.
                </p>
              </div>

              <div className='bg-white p-4 rounded-xl shadow-lg border border-mizoram-100'>
                <h4 className='text-lg font-semibold text-gray-900 mb-2 professional-text'>For Farmers</h4>
                <p className='text-gray-600 leading-relaxed text-sm body-text'>
                  Access quality agricultural products and modern IoT-based farming solutions.
                </p>
              </div>
            </div>
          </div>

          {/* Right Content - Image */}
          <div className='relative'>
            <div className='relative rounded-2xl overflow-hidden shadow-2xl'>
              <img 
                src="https://images.herzindagi.info/image/2023/Apr/offbeat-places-in-mizoram.jpg" 
                alt="Mizoram Agricultural Landscape" 
                className='w-full h-[500px] object-cover image-professional'
              />
              <div className="absolute inset-0 bg-gradient-to-t from-mizoram-900/30 to-transparent"></div>
            </div>
            
            {/* Floating Quote */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 max-w-xs border border-mizoram-100">
              <p className="text-gray-700 italic mb-2 text-sm body-text">
                "Connecting sellers with farmers through smart technology and traditional wisdom."
              </p>
              <p className="text-xs font-semibold text-mizoram-600 professional-text">- PRECI AGRI Team</p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className='bg-white rounded-2xl shadow-xl p-8 lg:p-10 border border-mizoram-100'>
          <h3 className='text-3xl font-bold text-center text-gray-900 mb-10 professional-text'>
            PRECI AGRI Marketplace Impact
          </h3>
          
          <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {stats.map((stat, index) => (
              <div key={index} className='text-center space-y-3'>
                <div className='bg-mizoram-100 rounded-full p-3 w-14 h-14 mx-auto flex items-center justify-center text-mizoram-600'>
                  {stat.icon}
                </div>
                <div>
                  <p className='text-2xl font-bold text-gray-900 professional-text'>{stat.number}</p>
                  <p className='text-gray-600 font-medium text-sm body-text'>{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className='text-center mt-12'>
          <h3 className='text-2xl font-bold text-gray-900 mb-4 professional-text'>
            Join the Agricultural Revolution
          </h3>
          <p className='text-lg text-gray-600 max-w-2xl mx-auto body-text'>
            PRECI AGRI connects sellers and farmers across Mizoram through smart farming technology and traditional agricultural wisdom.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AboutUs