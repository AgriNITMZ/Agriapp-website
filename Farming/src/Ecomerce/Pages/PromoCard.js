import React from 'react'
import { promoData } from '../../Data/PromoCardData'

const PromoCard = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4 py-6">
      {promoData.map((promo, index) => (
        <div
          key={index}
          className={`relative rounded-lg overflow-hidden shadow-md ${promo.bgColor} h-48 cursor-pointer transition-transform hover:scale-105`}
        >
          <div className="p-4 h-full flex justify-center">
            {/* Text Content */}
            <div className="flex flex-col justify-between flex-grow">
              <div>
                <p className="text-gray-700 text-sm mb-1">{promo.category}</p>
                <h3 className="font-bold text-gray-900 text-lg mb-1">{promo.brands}</h3>
                {promo.price && (
                  <p className="font-bold text-gray-900">{promo.price}</p>
                )}
                {promo.discount && (
                  <p className="font-bold text-gray-900">{promo.discount}</p>
                )}
                {promo.subtext && (
                  <p className="text-sm text-gray-700 mt-1">{promo.subtext}</p>
                )}
              </div>

              {/* Bank Offer */}
              {promo.bank && (
                <div className="bg-white rounded-md p-2 inline-block mt-auto">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold">{promo.bank}</span>
                    <span className="text-xs">{promo.bankOffer}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Image */}
            <div className="w-32 h-32 relative">
              <img
                src={promo.image}
                alt={promo.category}
                className="absolute right-0 bottom-0 object-cover rounded-md"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default PromoCard