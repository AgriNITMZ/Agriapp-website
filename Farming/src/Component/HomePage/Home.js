import React, { useEffect } from 'react'
import Typed from 'typed.js';
import HeroSection from './HeroSection';
import Service from './Service';
import Technique from './Technique';
import NavBar from '../Common/NavBar';
import video from '../../Data/Logo/Video Banner.mp4';

const Home = () => {

  useEffect(() => {
    // Initialize Typed.js after the component mounts
    const typed = new Typed(".role", {
      strings: [
        "Empowering Farmers, Enriching Futures",
        "Sustainable Farming Solutions for a Greener Tomorrow",
        "Connecting Farmers with Technology and Innovation",
        "From Seed to Harvest, We Are With You Every Step",
        "Quality Products, Better Harvests",
        "Farming Made Simple with Technology",
      ],
      loop: true,
      typeSpeed: 100,
      backSpeed: 80,
      backDelay: 1000,
    });

    // Clean up Typed.js on component unmount
    return () => {
      typed.destroy();
    };
  }, []);



  return (
    <div>
    
      <div className="relative w-full h-[70vh] overflow-hidden mt-16">
        <video
          src={video}
          autoPlay
          loop
          muted
          className="absolute top-0 left-0 w-full h-full object-cover"
        >
          Your browser does not support the video tag.
        </video>
        <div className='absolute z-10 mt-20 font-bold text-3xl px-32 gap-32 text-white'>
          <div className=''>
            <div>Powerful Digital</div>
            <div className='mt-2'> Agriculture Solutions</div>
          </div>
          <div className='mt-10'>
            <div >We are a company dedicated to revolutionizing the</div>
            <div className='mt-2'>agricultural industry we provide  <span className="role text-green-600"></span></div>
          </div>

        </div>
      

      </div>
      <div className=''>
      <HeroSection/>

      </div>
      <div className='px-32'>
      <Service/>
          
      </div>
      <div className='px-32'>
        <Technique/>
      </div>
     
     
  
     
  


    </div>
  )
}

export default Home