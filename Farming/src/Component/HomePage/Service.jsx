import React from 'react'
import { advantages } from '../../Data/advatage'
import Card from '../Common/Card'

const Service = () => {
    return (
        <div className="py-16 bg-gradient-to-br from-mizoram-50 to-white">
            <div className="container mx-auto px-6 lg:px-12">
                
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-6 hero-text">
                        SELLER ADVANTAGES ON{' '}
                        <span className="text-mizoram-600">PRECI AGRI</span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-body body-text">
                        Join our marketplace and discover the benefits of selling agricultural 
                        products and IoT solutions to Mizoram farmers
                    </p>
                </div>

                {/* Advantages Grid */}
                <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {advantages.map((item, index) => (
                        <Card
                            key={index}
                            imageUrl={item.src}
                            Title={item.title}
                            Desc={item.description}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Service