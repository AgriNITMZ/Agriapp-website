// scraper/newsScraper.js - Isolated News Scraper
const axios = require('axios');
const cheerio = require('cheerio');
const AgriNews = require('../models/newsModel');
const { scrapeStaticNews } = require('../seed-scraped-news'); // for dummy

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

// Scraper for Mizoram Agriculture Department
const scrapeMizoramAgri = async () => {
  try {
    const url = 'http://agriculturemizoram.nic.in';
    const response = await axios.get(url, { timeout: 10000 });
    const $ = cheerio.load(response.data);
    const news = [];

    $('.news-item, .update-item, .announcement, .content-item').each((_, element) => {
      const title = $(element).find('h3, h4, .title, a').first().text().trim();
      const link = $(element).find('a').attr('href');
      const description = $(element).find('p, .description').first().text().trim();
      const dateText = $(element).find('.date, time').text().trim();

      if (title && link) {
        news.push({
          title,
          link: link.startsWith('http') ? link : `${url}${link}`,
          description: description.substring(0, 500),
          date: parseDate(dateText),
          source: 'Mizoram Agriculture Department'
        });
      }
    });

    return news;
  } catch (error) {
    console.error('Error scraping Mizoram Agri:', error.message);
    return [];
  }
};

// Scraper for Serchhip District
const scrapeSerchhip = async () => {
  try {
    const url = 'https://serchhip.nic.in/schemes/';
    const response = await axios.get(url, { timeout: 10000 });
    const $ = cheerio.load(response.data);
    const news = [];

    $('.eventItem .eventContent').each((_, element) => {
      const title = $(element).find('h2.heading3 a').text().trim();
      const link = $(element).find('h2.heading3 a').attr('href');
      const description = $(element).find('p').text().trim();
      const publishDateText = $(element).find('.uppercase').text().trim();
      const publishDateMatch = publishDateText.match(/Publish date:\s*(.*)/i);
      const publishDate = publishDateMatch ? publishDateMatch[1] : null;

      if (title && link) {
        news.push({
          title,
          link: link.startsWith('http') ? link : `https://serchhip.nic.in${link}`,
          description: description.substring(0, 500),
          date: parseDate(publishDate),
          source: 'Serchhip District'
        });
      }
    });

    return news;
  } catch (error) {
    console.error('Error scraping Serchhip:', error.message);
    return [];
  }
};

// Scraper for IMD Weather
const scrapeIMDWeather = async () => {
  try {
    const url = 'https://mausam.imd.gov.in/aizawl/';
    const response = await axios.get(url, { timeout: 10000 });
    const $ = cheerio.load(response.data);
    const news = [];

    $('.bulletin-item, .weather-update, .advisory, .content-item').each((_, element) => {
      const title = $(element).find('h3, h4, .title').text().trim();
      const link = $(element).find('a').attr('href');
      const description = $(element).find('p').text().trim();

      if (title) {
        news.push({
          title,
          link: link ? (link.startsWith('http') ? link : `https://mausam.imd.gov.in${link}`) : url,
          description: description.substring(0, 500),
          date: new Date(),
          source: 'IMD Aizawl Weather'
        });
      }
    });

    return news;
  } catch (error) {
    console.error('Error scraping IMD:', error.message);
    return [];
  }
};

// Generic NIC website scraper with enhanced selectors
const scrapeGenericNIC = async (url, sourceName) => {
  try {
    const response = await axios.get(url, { 
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    const $ = cheerio.load(response.data);
    const news = [];

    // Enhanced selectors for various website structures
    const selectors = [
      '.eventItem', 
      '.news-item', 
      '.scheme-item', 
      '.update-item', 
      'article', 
      '.content-item',
      '.post',
      '.news',
      '.announcement',
      '.event',
      '.notice',
      'li a[href*="scheme"]',
      'li a[href*="news"]',
      'li a[href*="event"]',
      'li a[href*="notice"]',
      '.list-group-item',
      '.card',
      '.media'
    ];

    // Try each selector
    selectors.forEach(selector => {
      $(selector).each((_, element) => {
        const $el = $(element);
        
        // Try multiple ways to get title
        let title = $el.find('h2, h3, h4, h5, .title, .heading').first().text().trim();
        if (!title) {
          title = $el.find('a').first().text().trim();
        }
        if (!title && $el.is('a')) {
          title = $el.text().trim();
        }
        
        // Try multiple ways to get link
        let link = $el.find('a').first().attr('href');
        if (!link && $el.is('a')) {
          link = $el.attr('href');
        }
        
        // Get description
        let description = $el.find('p, .description, .excerpt, .summary').first().text().trim();
        if (!description) {
          description = $el.text().trim().substring(0, 200);
        }
        
        // Get date
        const dateText = $el.find('.date, .publish-date, .posted-on, time, .timestamp').text().trim();

        // Only add if we have title and link, and it's not a duplicate
        if (title && link && title.length > 10 && !news.find(n => n.title === title)) {
          try {
            const fullLink = link.startsWith('http') ? link : new URL(link, url).href;
            news.push({
              title: title.substring(0, 200),
              link: fullLink,
              description: description.substring(0, 500),
              date: parseDate(dateText),
              source: sourceName
            });
          } catch (e) {
            // Skip invalid URLs
          }
        }
      });
    });

    return news;
  } catch (error) {
    console.error(`Error scraping ${sourceName}:`, error.message);
    return [];
  }
};

// Main scraper function
const scrapeAllNews = async () => {
  console.log('🌾 [NEWS SCRAPER] Starting news scraping...');
  
  const allNews = [];

  // Run all scrapers
  const scrapers = [
    // Static news source (always works - 20 items)
    { fn: scrapeStaticNews, name: 'Static News Data Source' }, // dummy
    
    // Live website scrapers
    { fn: scrapeMizoramAgri, name: 'Mizoram Agriculture' },
    { fn: scrapeSerchhip, name: 'Serchhip District' },
    { fn: scrapeIMDWeather, name: 'IMD Weather' },
    { 
      fn: () => scrapeGenericNIC('https://lawngtlai.nic.in/agriculture/', 'Lawngtlai Agriculture'),
      name: 'Lawngtlai'
    },
    // Additional working government sources
    { 
      fn: () => scrapeGenericNIC('https://serchhip.nic.in/', 'Serchhip District Portal'),
      name: 'Serchhip Portal'
    },
    { 
      fn: () => scrapeGenericNIC('https://mizoram.nic.in/', 'Mizoram State Portal'),
      name: 'Mizoram Portal'
    },
    { 
      fn: () => scrapeGenericNIC('https://aizawl.nic.in/', 'Aizawl District'),
      name: 'Aizawl'
    },
    { 
      fn: () => scrapeGenericNIC('https://champhai.nic.in/', 'Champhai District'),
      name: 'Champhai'
    },
    { 
      fn: () => scrapeGenericNIC('https://kolasib.nic.in/', 'Kolasib District'),
      name: 'Kolasib'
    },
    { 
      fn: () => scrapeGenericNIC('https://lunglei.nic.in/', 'Lunglei District'),
      name: 'Lunglei'
    },
    { 
      fn: () => scrapeGenericNIC('https://mamit.nic.in/', 'Mamit District'),
      name: 'Mamit'
    },
    { 
      fn: () => scrapeGenericNIC('https://siaha.nic.in/', 'Siaha District'),
      name: 'Siaha'
    },
    { 
      fn: () => scrapeGenericNIC('https://saitual.nic.in/', 'Saitual District'),
      name: 'Saitual'
    },
    { 
      fn: () => scrapeGenericNIC('https://khawzawl.nic.in/', 'Khawzawl District'),
      name: 'Khawzawl'
    }
  ];

  for (const scraper of scrapers) {
    try {
      console.log(`📡 [NEWS SCRAPER] Scraping ${scraper.name}...`);
      const news = await scraper.fn();
      allNews.push(...news);
      console.log(`✅ [NEWS SCRAPER] ${scraper.name}: Found ${news.length} items`);
    } catch (error) {
      console.error(`❌ [NEWS SCRAPER] ${scraper.name} failed:`, error.message);
    }
  }

  // Filter last 60 days
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  
  const recentNews = allNews.filter(item => item.date >= sixtyDaysAgo);

  console.log(`🎉 [NEWS SCRAPER] Total news scraped: ${recentNews.length}`);
  return recentNews;
};

// Save news to database (avoid duplicates)
const saveNewsToDatabase = async (newsItems) => {
  let savedCount = 0;
  let skippedCount = 0;

  for (const item of newsItems) {
    try {
      await AgriNews.create(item);
      savedCount++;
    } catch (error) {
      if (error.code === 11000) {
        // Duplicate link, skip
        skippedCount++;
      } else {
        console.error('Error saving news:', error.message);
      }
    }
  }

  console.log(`✅ [NEWS SCRAPER] Saved: ${savedCount}, Skipped: ${skippedCount}`);
  return { savedCount, skippedCount };
};

// Main function to scrape and save
const runNewsScraper = async () => {
  try {
    const newsItems = await scrapeAllNews();
    const result = await saveNewsToDatabase(newsItems);
    return {
      success: true,
      total: newsItems.length,
      ...result
    };
  } catch (error) {
    console.error('❌ [NEWS SCRAPER] Failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  scrapeAllNews,
  saveNewsToDatabase,
  runNewsScraper
};
