import React from 'react'
import { sections } from '../../Data/AgriSpecialsData'
import FourProduct from '../component/FourProduct';
import { SumerSpci } from '../../Data/SumerSpecial';




const AgriSpecials = () => {
    return (
        
        <div className="mx-auto p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* First Section */}
 <FourProduct sumerSpci={SumerSpci}/>

  {/* Second Section */}
  <FourProduct sumerSpci={SumerSpci}/>

  {/* Third Section */}
  <div className="bg-white p-4">
    <a href="/product/item/67ae06ca68b4ab2833a08280" className="block">
      {/* Display Product Image */}
      <img
        src="https://res.cloudinary.com/dtaz6cco4/image/upload/v1739085492/raushanMedia/abz1av0ea0wum2roqjt3.jpg"
        alt="product"
        className="w-full h-full object-cover"
      />
    </a>
  </div>
</div>

    );
};


export default AgriSpecials