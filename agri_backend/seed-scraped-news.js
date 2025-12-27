// Static news data source - treated as a "website" by the scraper
// This file exports news data that the scraper will read and save to database
// Add 15-20 news items here and the scraper will automatically pick them up

const staticNewsData = [
    {
        title: "New Agricultural Subsidy Scheme Announced for Mizoram Farmers",
        description: "The Mizoram government has announced a new subsidy scheme to support local farmers with modern farming equipment and techniques. The scheme aims to boost agricultural productivity across the state.",
        link: "https://agriculturemizoram.nic.in/news/subsidy-scheme-2024",
        date: new Date(),
        source: "Mizoram Agriculture Department"
    },
    {
        title: "Weather Advisory: Heavy Rainfall Expected in Agricultural Regions",
        description: "IMD Aizawl has issued a weather advisory warning of heavy rainfall in the coming week. Farmers are advised to take necessary precautions to protect their crops.",
        link: "https://mausam.imd.gov.in/aizawl/advisory-nov-2024",
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        source: "IMD Aizawl Weather"
    },
    {
        title: "Organic Farming Training Program Launched in Serchhip District",
        description: "A comprehensive training program on organic farming methods has been launched for farmers in Serchhip district. The program includes hands-on training and certification.",
        link: "https://serchhip.nic.in/schemes/organic-farming-training",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        source: "Serchhip District"
    },
    {
        title: "Government Announces Increased MSP for Rice and Maize",
        description: "The central government has announced an increase in Minimum Support Price (MSP) for rice and maize, benefiting farmers across Mizoram and other northeastern states.",
        link: "https://agriculturemizoram.nic.in/news/msp-increase-2024",
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        source: "Mizoram Agriculture Department"
    },
    {
        title: "Soil Health Card Distribution Drive in Aizawl District",
        description: "The agriculture department has initiated a drive to distribute soil health cards to farmers in Aizawl district. This will help farmers understand their soil quality and take appropriate measures.",
        link: "https://aizawl.nic.in/agriculture/soil-health-cards",
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        source: "Aizawl District"
    },
    {
        title: "New Irrigation Project Approved for Champhai District",
        description: "A major irrigation project worth Rs 50 crores has been approved for Champhai district to improve water availability for agricultural activities.",
        link: "https://champhai.nic.in/news/irrigation-project-2024",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        source: "Champhai District"
    },
    {
        title: "Pest Control Workshop for Farmers in Kolasib",
        description: "A workshop on modern pest control techniques and integrated pest management will be conducted for farmers in Kolasib district next week.",
        link: "https://kolasib.nic.in/agriculture/pest-control-workshop",
        date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
        source: "Kolasib District"
    },
    {
        title: "Horticulture Development Scheme Extended to Lunglei",
        description: "The state horticulture development scheme has been extended to Lunglei district, providing financial assistance for fruit and vegetable cultivation.",
        link: "https://lunglei.nic.in/schemes/horticulture-development",
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        source: "Lunglei District"
    },
    {
        title: "Agricultural Machinery Bank Established in Mamit",
        description: "A new agricultural machinery bank has been established in Mamit district, allowing farmers to rent modern farming equipment at subsidized rates.",
        link: "https://mamit.nic.in/agriculture/machinery-bank",
        date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
        source: "Mamit District"
    },
    {
        title: "Bamboo Cultivation Training Program Announced",
        description: "A specialized training program on bamboo cultivation and processing has been announced for farmers interested in bamboo-based agriculture and entrepreneurship.",
        link: "https://agriculturemizoram.nic.in/news/bamboo-training-2024",
        date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), // 9 days ago
        source: "Mizoram Agriculture Department"
    },
    {
        title: "Crop Insurance Enrollment Drive Begins Across Mizoram",
        description: "The Pradhan Mantri Fasal Bima Yojana enrollment drive has begun across all districts of Mizoram. Farmers are encouraged to register for crop insurance coverage.",
        link: "https://pmfby.gov.in/mizoram-enrollment-2024",
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        source: "PM Fasal Bima Yojana"
    },
    {
        title: "Success Story: Organic Ginger Farming in Siaha District",
        description: "Farmers in Siaha district have achieved remarkable success with organic ginger cultivation, earning premium prices in national markets.",
        link: "https://siaha.nic.in/success-stories/organic-ginger",
        date: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000), // 11 days ago
        source: "Siaha District"
    },
    {
        title: "Mobile Veterinary Services Launched for Remote Areas",
        description: "Mobile veterinary services have been launched to provide healthcare support for livestock in remote agricultural areas of Mizoram.",
        link: "https://agriculturemizoram.nic.in/news/mobile-vet-services",
        date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
        source: "Mizoram Agriculture Department"
    },
    {
        title: "Farmers' Market Initiative to Connect Producers with Consumers",
        description: "A new farmers' market initiative has been launched to help farmers sell their produce directly to consumers, eliminating middlemen and increasing profits.",
        link: "https://mizoram.nic.in/farmers-market-initiative",
        date: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000), // 13 days ago
        source: "Mizoram State Portal"
    },
    {
        title: "Climate-Resilient Agriculture Practices Workshop",
        description: "A workshop on climate-resilient agriculture practices will be conducted to help farmers adapt to changing weather patterns and ensure sustainable farming.",
        link: "https://agriculturemizoram.nic.in/news/climate-resilient-workshop",
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        source: "Mizoram Agriculture Department"
    },
    {
        title: "Digital Agriculture Platform Launched for Mizoram Farmers",
        description: "A new digital platform has been launched to provide farmers with real-time information on weather, market prices, and best farming practices.",
        link: "https://agriculturemizoram.nic.in/news/digital-platform-2024",
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        source: "Mizoram Agriculture Department"
    },
    {
        title: "Organic Certification Drive for Small Farmers",
        description: "The agriculture department has initiated a drive to help small farmers obtain organic certification for their produce, enabling them to access premium markets.",
        link: "https://agriculturemizoram.nic.in/news/organic-certification-2024",
        date: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000), // 16 days ago
        source: "Mizoram Agriculture Department"
    },
    {
        title: "Drip Irrigation Subsidy Scheme Extended",
        description: "The government has extended the drip irrigation subsidy scheme to help farmers conserve water and improve crop yields.",
        link: "https://agriculturemizoram.nic.in/schemes/drip-irrigation-2024",
        date: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000), // 17 days ago
        source: "Mizoram Agriculture Department"
    },
    {
        title: "Farmer Producer Organizations Training Program",
        description: "A comprehensive training program for Farmer Producer Organizations (FPOs) has been launched to strengthen collective farming initiatives.",
        link: "https://agriculturemizoram.nic.in/news/fpo-training-2024",
        date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000), // 18 days ago
        source: "Mizoram Agriculture Department"
    },
    {
        title: "Integrated Pest Management Workshop Series Announced",
        description: "A series of workshops on integrated pest management will be conducted across all districts to promote sustainable farming practices.",
        link: "https://agriculturemizoram.nic.in/news/ipm-workshop-2024",
        date: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000), // 19 days ago
        source: "Mizoram Agriculture Department"
    }
];

// Function to get static news data (called by scraper)
const scrapeStaticNews = async () => {
    try {
        console.log(`📰 [STATIC NEWS] Reading ${staticNewsData.length} news items from static data source`);
        
        // Return news items with fresh dates (relative to current time)
        const newsWithFreshDates = staticNewsData.map(item => ({
            ...item,
            // Dates are already relative, so they stay fresh
            date: item.date
        }));
        
        return newsWithFreshDates;
    } catch (error) {
        console.error('Error reading static news:', error.message);
        return [];
    }
};

// Export for use by scraper
module.exports = {
    scrapeStaticNews,
    staticNewsData
};
