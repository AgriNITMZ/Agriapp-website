import React from 'react'

const FourProduct = ({sumerSpci}) => {
  return (
    <div className="bg-white grid grid-cols-2 gap-4 p-4">
    {sumerSpci.map((product) => (
      <div key={product.id} className="p-4 border-[1px] shadow-md">
        <a href={product?.url} className="block">
          {/* Display Product Image */}
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover hover:scale-110 transition-transform duration-300"
          />
        </a>
        {/* Product Details */}
        <div className="mt-4 text-center">
          <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
          <p className="text-sm text-green-500">
            Min {product.discountPercentage}% off
          </p>
        </div>
      </div>
    ))}
  </div>
  )
}

export default FourProduct