import React from 'react'
import { Droplets, Thermometer, Smartphone, Satellite, Zap, TreePine } from 'lucide-react'

const Technique = () => {
    const iotProducts = [
        {
            icon: <Droplets className="w-8 h-8 text-mizoram-600" />,
            title: "Irrigation Sensors",
            description: "Smart moisture and water level sensors for automated irrigation systems in Mizoram's terraced fields.",
            features: ["Soil moisture detection", "Automated watering", "Water conservation"]
        },
        {
            icon: <Thermometer className="w-8 h-8 text-mizoram-600" />,
            title: "Climate Sensors",
            description: "Weather monitoring devices for real-time temperature, humidity, and environmental tracking.",
            features: ["Temperature logging", "Humidity monitoring", "Weather alerts"]
        },
        {
            icon: <Smartphone className="w-8 h-8 text-mizoram-600" />,
            title: "Mobile Apps",
            description: "Smart farming applications for crop management and marketplace access on mobile devices.",
            features: ["Crop monitoring", "Market access", "Expert consultation"]
        },
        {
            icon: <Satellite className="w-8 h-8 text-mizoram-600" />,
            title: "GPS Equipment",
            description: "Precision farming tools with GPS technology for accurate field mapping and resource management.",
            features: ["Field mapping", "Precision planting", "Resource optimization"]
        },
        {
            icon: <Zap className="w-8 h-8 text-mizoram-600" />,
            title: "IoT Controllers",
            description: "Central control units that connect and manage multiple smart farming devices and sensors.",
            features: ["Device integration", "Remote control", "Data analytics"]
        },
        {
            icon: <TreePine className="w-8 h-8 text-mizoram-600" />,
            title: "Organic Solutions",
            description: "Eco-friendly farming products and organic fertilizers suitable for sustainable agriculture.",
            features: ["Organic fertilizers", "Bio-pesticides", "Soil enhancers"]
        }
    ];

    return (
        <div className="py-16 bg-gradient-to-br from-white to-mizoram-50">
            <div className="container mx-auto px-6 lg:px-12">
                
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-6 hero-text">
                        IoT Products &{' '}
                        <span className="text-mizoram-600">Smart Solutions</span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-body body-text">
                        Discover the range of IoT-based smart farming products and solutions 
                        available for farmers on our marketplace
                    </p>
                </div>

                {/* IoT Products Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {iotProducts.map((product, index) => (
                        <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-mizoram-100 group">
                            <div className="mb-4">
                                <div className="bg-mizoram-100 rounded-full p-3 w-14 h-14 flex items-center justify-center mb-4 group-hover:bg-mizoram-200 transition-colors duration-200">
                                    {product.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3 professional-text">
                                    {product.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed mb-4 body-text">
                                    {product.description}
                                </p>
                            </div>
                            
                            <div className="space-y-2">
                                {product.features.map((feature, featureIndex) => (
                                    <div key={featureIndex} className="flex items-center space-x-3">
                                        <div className="w-2 h-2 bg-mizoram-600 rounded-full flex-shrink-0"></div>
                                        <span className="text-gray-700 font-medium text-sm">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Call to Action Section */}
                <div className="bg-gradient-to-r from-mizoram-600 to-mizoram-700 rounded-2xl p-8 lg:p-10 text-white text-center shadow-professional-lg">
                    <h3 className="text-3xl font-bold mb-4 font-display hero-text">
                        Smart Farming Technology for Mizoram
                    </h3>
                    <p className="text-xl text-mizoram-100 max-w-2xl mx-auto font-body body-text">
                        Advanced IoT devices, sensors, and smart farming solutions designed specifically for Mizoram's unique agricultural landscape and traditional farming practices.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Technique