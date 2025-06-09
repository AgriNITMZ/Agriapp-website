import React, { useState } from 'react'

const Card = ({imageUrl,Title,Desc}) => {
    const [isHovered, setIsHovered] = useState(false);
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 20;
    const rotateY = -(x - centerX) / 20;

    setCoordinates({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCoordinates({ x: 0, y: 0 });
  };

  return (
    <div className="p-8">
    <div
      className="relative w-64 bg-white rounded-xl shadow-lg transition-all duration-300 ease-out cursor-pointer overflow-hidden"
      style={{
        transform: isHovered 
          ? `scale(1.2) rotateX(${coordinates.x}deg) rotateY(${coordinates.y}deg)`
          : 'scale(1) rotateX(0) rotateY(0)',
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Image */}
      <img
        src={imageUrl}
        alt="Card Image"
        className="w-full h-48 object-cover"
      />

      {/* Content */}
      <div className="p-4">
        <h3 className="text-xl font-bold mb-2">{Title}</h3>
        
        {/* Description - Only visible on hover */}
        <div 
          className="transition-opacity duration-300"
          style={{ opacity: isHovered ? 1 : 0 }}
        >
          <p className="text-gray-600">
           {Desc}
          </p>
        </div>
      </div>
    </div>
  </div>
  )
}

export default Card