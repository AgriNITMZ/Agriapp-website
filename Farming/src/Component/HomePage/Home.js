import React, { useEffect } from 'react'
import Typed from 'typed.js';
import HeroSection from './HeroSection';
import Service from './Service';
import Technique from './Technique';
import AboutUs from './AboutUs';
// //import video from '../../Data/Logo/Video Banner.mp4';
// import video from '../../Data/Logo/new.mp4';
import video from '../../Data/Logo/Mizo Farm Landscape.mp4';

const Home = () => {

  useEffect(() => {
    // Initialize Typed.js after the component mounts
    const typed = new Typed(".role", {
      strings: [
        "IoT-Based Smart Farming Solutions",
        "Agricultural Marketplace for Sellers",
        "Modern Technology Meets Traditional Farming",
        "Seeds, Fertilizers & Farming Tools",
        "Empowering Agricultural Sellers",
        "Smart Agriculture Technology Platform",
      ],
      loop: true,
      typeSpeed: 80,
      backSpeed: 60,
      backDelay: 1500,
    });

    // Clean up Typed.js on component unmount
    return () => {
      typed.destroy();
    };
  }, []);

  return (
    <div className="bg-gradient-to-br from-mizoram-50 to-earth-50">
      
      {/* Hero Video Section */}
      <div className="relative w-full h-[85vh] overflow-hidden mt-16">
        <video
          src={video}
          autoPlay
          loop
          muted
          className="absolute top-0 left-0 w-full h-full object-cover"
        >
          Your browser does not support the video tag.
        </video>
        
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        
        {/* Hero Content */}
        <div className='absolute inset-0 flex items-center justify-center z-10'>
          <div className='text-center px-6 md:px-12 max-w-5xl'>
            <h1 className='text-5xl md:text-7xl font-display font-bold text-white mb-8 leading-tight hero-text text-rendering-optimized'>
              PERCI AGRI
              <span className='block text-mizoram-300 mt-2'>Smart Farming Marketplace</span>
            </h1>
            <p className='text-xl md:text-2xl text-white mb-10 font-body body-text max-w-3xl mx-auto'>
              Bridging traditional Mizoram farming with modern IoT technology through{' '}
              <span className="role text-mizoram-300 font-semibold professional-text"></span>
            </p>
            <div className='flex justify-center'>
              <button 
                className='bg-mizoram-600 hover:bg-mizoram-700 text-white px-12 py-5 rounded-full font-display font-semibold text-xl transition-colors duration-200 shadow-professional-lg btn-professional focus-professional'
                onClick={() => window.location.href = '/product'}
              >
                Explore Marketplace
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Sections - Optimized Spacing */}
      <div className="space-y-0">
        <HeroSection />
        <Service />
        <Technique />
        <AboutUs />
      </div>
    </div>
  )
}

export default Home