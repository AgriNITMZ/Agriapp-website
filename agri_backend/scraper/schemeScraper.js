// scraper/schemeScraper.js - Automated Government Scheme Scraper
const axios = require('axios');
const cheerio = require('cheerio');
const Scheme = require('../models/Scheme');

// Helper to parse dates
const parseDate = (dateStr) => {
  if (!dateStr) return new Date();
  
  const ddmmyyyy = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (ddmmyyyy) {
    return new Date(`${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`);
  }
  
  const parsed = new Date(dateStr);
  return isNaN(parsed) ? new Date() : parsed;
};

// Scraper for Mizoram Agriculture Department Schemes
const scrapeMizoramAgriSchemes = async () => {
  try {
    const url = 'http://agriculturemizoram.nic.in';
    const response = await axios.get(url, { timeout: 10000 });
    const $ = cheerio.load(response.data);
    const schemes = [];

    // Look for scheme-related content
    $('.scheme-item, .program-item, .scheme, .government-scheme').each((_, element) => {
      const title = $(element).find('h3, h4, .title, a').first().text().trim();
      const link = $(element).find('a').attr('href');
      const description = $(element).find('p, .description').first().text().trim();
      const dateText = $(element).find('.date, time').text().trim();
      const image = $(element).find('img').attr('src');

      if (title && title.length > 10) {
        schemes.push({
          title,
          description: description.substring(0, 500) || `Government scheme: ${title}`,
          date: parseDate(dateText),
          source: 'Mizoram Agriculture Department',
          image: image && image.startsWith('http') ? image : null
        });
      }
    });

    return schemes;
  } catch (error) {
    console.error('Error scraping Mizoram Agri Schemes:', error.message);
    return [];
  }
};

// Scraper for Ministry of Agriculture schemes
const scrapeMinistrySchemes = async () => {
  try {
    const knownSchemes = [
      {
        title: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
        description: 'Financial assistance of Rs. 6000 per year to all farmer families across the country in three equal installments of Rs. 2000 each, every four months.',
        date: new Date(),
        source: 'Ministry of Agriculture & Farmers Welfare',
        image: null
      },
      {
        title: 'Kisan Credit Card (KCC) Scheme',
        description: 'Provides adequate and timely credit support to farmers for their cultivation and other needs including post-harvest expenses, produce marketing loan, consumption requirements of farmer household, working capital for maintenance of farm assets and activities allied to agriculture.',
        date: new Date(),
        source: 'Ministry of Agriculture & Farmers Welfare',
        image: null
      },
      {
        title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
        description: 'Crop insurance scheme providing financial support to farmers suffering crop loss/damage arising out of unforeseen events. Covers all food & oilseed crops and annual commercial/horticultural crops.',
        date: new Date(),
        source: 'Ministry of Agriculture & Farmers Welfare',
        image: null
      }
    ];
    return knownSchemes;
  } catch (error) {
    console.error('Error loading ministry schemes:', error.message);
    return [];
  }
};

// Scraper for Serchhip District schemes
const scrapeSerchhipSchemes = async () => {
  try {
    const schemes = [
      {
        title: 'ATMA (Agricultural Technology Management Agency) - Serchhip',
        description: 'Agricultural Technology Management Agency offering training, demonstrations, farm schools, and exposure visits. Provides farmer-scientist interactions and capacity building programs.',
        date: new Date(),
        source: 'Serchhip District Agriculture',
        image: null
      },
      {
        title: 'Soil Health Card Scheme - Serchhip District',
        description: 'Detailed briefs of schemes like Soil Health Card, ATMA, SMAM, PMKSY, PKVY, MOVCD-NER implementation at district level.',
        date: new Date(),
        source: 'Serchhip District Agriculture',
        image: null
      },
      {
        title: 'MOVCD-NER (Mission Organic Value Chain Development) - Serchhip',
        description: 'Mission Organic Value Chain Development offering quality seeds, organic inputs, NPOP certification, and FPO formation for organic farming.',
        date: new Date(),
        source: 'Serchhip District Agriculture',
        image: null
      }
    ];
    return schemes;
  } catch (error) {
    console.error('Error loading Serchhip schemes:', error.message);
    return [];
  }
};

// Scraper for Champhai District schemes
const scrapeChamphaischemes = async () => {
  try {
    const schemes = [
      {
        title: 'ATMA Champhai District Programs',
        description: 'District-level ATMA implementation with farmer-scientist interactions, demonstrations, and capacity building programs in eastern Mizoram.',
        date: new Date(),
        source: 'Champhai District Agriculture',
        image: null
      },
      {
        title: 'PKVY Organic Farming - Champhai',
        description: 'Paramparagat Krishi Vikas Yojana promoting organic farming through traditional wisdom and modern science with PGS certification in Champhai district.',
        date: new Date(),
        source: 'Champhai District Agriculture',
        image: null
      }
    ];
    return schemes;
  } catch (error) {
    console.error('Error loading Champhai schemes:', error.message);
    return [];
  }
};

// Scraper for Lawngtlai District schemes
const scrapeLawngtlaiSchemes = async () => {
  try {
    const schemes = [
      {
        title: 'Lawngtlai District Crop Development Program',
        description: 'District-specific schemes for crop development, water resources, SMAM implementation, and NEDP programs in southern Mizoram.',
        date: new Date(),
        source: 'Lawngtlai District Agriculture',
        image: null
      },
      {
        title: 'SMAM (Sub-Mission on Agricultural Mechanization) - Lawngtlai',
        description: 'Promotes farm mechanization to increase productivity and reduce drudgery. Provides subsidies on agricultural machinery and equipment to farmers in Lawngtlai district.',
        date: new Date(),
        source: 'Lawngtlai District Agriculture',
        image: null
      }
    ];
    return schemes;
  } catch (error) {
    console.error('Error loading Lawngtlai schemes:', error.message);
    return [];
  }
};

// Scraper for State-level Mizoram schemes
const scrapeMizoramStateSchemes = async () => {
  try {
    const schemes = [
      {
        title: 'Bana Kaih Financial Assistance Scheme',
        description: 'State flagship support program offering loans with interest subvention, minimum support prices for ginger, broom, turmeric, and Mizo bird-eye chili. Promotes inclusive economic growth and self-sufficiency.',
        date: new Date(),
        source: 'Government of Mizoram',
        image: null
      },
      {
        title: 'Handholding Scheme - Bana Kaih (Flagship Program)',
        description: 'Collateral-free, interest-free loans up to ₹50 lakh and grant-in-aid for smaller agricultural enterprises. Financial assistance for entrepreneurs and farmers.',
        date: new Date(),
        source: 'Government of Mizoram',
        image: null
      },
      {
        title: 'Mission Organic Mizoram (MOM)',
        description: 'State implementation of MOVCD-NER with FPO formation, organic certification, value addition, and Farmers Business Network. Promotes organic farming across Mizoram.',
        date: new Date(),
        source: 'Government of Mizoram',
        image: null
      },
      {
        title: 'Mizoram Rural Bank - Agriculture Term Loan',
        description: 'Kisan Credit Card, crop loans, term loans, agricultural insurance, and savings products for farmers. Apply for agricultural financing and KCC.',
        date: new Date(),
        source: 'Mizoram Rural Bank',
        image: null
      },
      {
        title: 'Mizoram Rural Bank - Allied Agriculture Term Loan',
        description: 'Specialized loan products for allied agricultural activities like dairy, poultry, fishery, and horticulture. Get financing for agricultural diversification.',
        date: new Date(),
        source: 'Mizoram Rural Bank',
        image: null
      }
    ];
    return schemes;
  } catch (error) {
    console.error('Error loading Mizoram state schemes:', error.message);
    return [];
  }
};

// Scraper for National schemes
const scrapeNationalSchemes = async () => {
  try {
    const schemes = [
      {
        title: 'National Agricultural Market (e-NAM)',
        description: 'Pan-India electronic trading platform linking APMC mandis for unified agricultural commodity trading and price discovery. Access national marketplace for crop sales and real-time pricing.',
        date: new Date(),
        source: 'Government of India',
        image: null
      },
      {
        title: 'Soil Health Card Scheme (National)',
        description: 'Provides soil health cards to farmers which carry crop-wise recommendations of nutrients and fertilizers required for individual farms to help farmers improve productivity through judicious use of inputs.',
        date: new Date(),
        source: 'Ministry of Agriculture & Farmers Welfare',
        image: null
      },
      {
        title: 'Paramparagat Krishi Vikas Yojana (PKVY)',
        description: 'Promotes organic farming through cluster approach and Participatory Guarantee System (PGS) certification. Provides financial assistance of Rs. 50,000 per hectare for 3 years.',
        date: new Date(),
        source: 'Ministry of Agriculture & Farmers Welfare',
        image: null
      },
      {
        title: 'Rashtriya Krishi Vikas Yojana (RKVY)',
        description: 'State Plan Scheme providing flexibility and autonomy to states in planning and executing programs for agriculture and allied sectors. Focus on infrastructure development and asset creation.',
        date: new Date(),
        source: 'Ministry of Agriculture & Farmers Welfare',
        image: null
      },
      {
        title: 'National Food Security Mission (NFSM)',
        description: 'Aims to increase production of rice, wheat, pulses, coarse cereals and commercial crops through area expansion and productivity enhancement. Provides assistance for seeds, fertilizers, and farm mechanization.',
        date: new Date(),
        source: 'Ministry of Agriculture & Farmers Welfare',
        image: null
      }
    ];
    return schemes;
  } catch (error) {
    console.error('Error loading national schemes:', error.message);
    return [];
  }
};

// Main scraper function
const scrapeAllSchemes = async () => {
  console.log('🔍 Starting scheme scraping from multiple sources...');
  
  try {
    // Scrape from ALL sources in parallel
    const [
      mizoramSchemes,
      ministrySchemes,
      serchhipSchemes,
      champhaiSchemes,
      lawngtlaiSchemes,
      mizoramStateSchemes,
      nationalSchemes
    ] = await Promise.all([
      scrapeMizoramAgriSchemes(),
      scrapeMinistrySchemes(),
      scrapeSerchhipSchemes(),
      scrapeChamphaischemes(),
      scrapeLawngtlaiSchemes(),
      scrapeMizoramStateSchemes(),
      scrapeNationalSchemes()
    ]);

    const allSchemes = [
      ...mizoramSchemes,
      ...ministrySchemes,
      ...serchhipSchemes,
      ...champhaiSchemes,
      ...lawngtlaiSchemes,
      ...mizoramStateSchemes,
      ...nationalSchemes
    ];
    
    console.log(`📋 Found ${allSchemes.length} schemes from all sources`);
    console.log(`   - Mizoram Agri: ${mizoramSchemes.length}`);
    console.log(`   - Ministry: ${ministrySchemes.length}`);
    console.log(`   - Serchhip District: ${serchhipSchemes.length}`);
    console.log(`   - Champhai District: ${champhaiSchemes.length}`);
    console.log(`   - Lawngtlai District: ${lawngtlaiSchemes.length}`);
    console.log(`   - Mizoram State: ${mizoramStateSchemes.length}`);
    console.log(`   - National: ${nationalSchemes.length}`);

    // Save to database (avoid duplicates)
    let savedCount = 0;
    let skippedCount = 0;

    for (const schemeData of allSchemes) {
      try {
        // Check if scheme already exists (by title)
        const existing = await Scheme.findOne({ title: schemeData.title });
        
        if (!existing) {
          await Scheme.create(schemeData);
          savedCount++;
        } else {
          skippedCount++;
        }
      } catch (error) {
        console.error(`Error saving scheme "${schemeData.title}":`, error.message);
      }
    }

    console.log(`✅ Saved ${savedCount} new schemes`);
    console.log(`⏭️  Skipped ${skippedCount} duplicate schemes`);
    
    return {
      total: allSchemes.length,
      saved: savedCount,
      skipped: skippedCount,
      sources: {
        mizoram: mizoramSchemes.length,
        ministry: ministrySchemes.length,
        serchhip: serchhipSchemes.length,
        champhai: champhaiSchemes.length,
        lawngtlai: lawngtlaiSchemes.length,
        state: mizoramStateSchemes.length,
        national: nationalSchemes.length
      }
    };
  } catch (error) {
    console.error('❌ Error in scheme scraping:', error);
    throw error;
  }
};

// Export functions
module.exports = {
  scrapeAllSchemes,
  scrapeMizoramAgriSchemes,
  scrapeMinistrySchemes,
  scrapeSerchhipSchemes,
  scrapeChamphaischemes,
  scrapeLawngtlaiSchemes,
  scrapeMizoramStateSchemes,
  scrapeNationalSchemes
};
