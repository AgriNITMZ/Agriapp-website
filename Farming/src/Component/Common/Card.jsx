import React, { useState } from 'react'

const Card = ({imageUrl, Title, Desc}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="group">
      <div
        className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-out cursor-pointer overflow-hidden border border-mizoram-100 h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <div className="relative overflow-hidden">
          <img
            src={imageUrl}
            alt={Title}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110 image-professional"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-mizoram-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-mizoram-600 transition-colors duration-200 professional-text">
            {Title}
          </h3>
          
          {/* Description */}
          <div className={`transition-all duration-300 ${isHovered ? 'max-h-32 opacity-100' : 'max-h-14 opacity-70'} overflow-hidden`}>
            <p className="text-gray-600 leading-relaxed text-sm body-text">
              {Desc}
            </p>
          </div>

          {/* Hover indicator */}
          <div className={`flex items-center text-mizoram-600 font-medium transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            <span className="text-xs professional-text">Learn more</span>
            <svg className="w-3 h-3 ml-2 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Card