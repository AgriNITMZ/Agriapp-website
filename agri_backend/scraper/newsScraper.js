// scraper/newsScraper.js - Isolated News Scraper
const axios = require('axios');
const cheerio = require('cheerio');
const AgriNews = require('../models/newsModel');

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

// Generic NIC website scraper
const scrapeGenericNIC = async (url, sourceName) => {
  try {
    const response = await axios.get(url, { timeout: 10000 });
    const $ = cheerio.load(response.data);
    const news = [];

    const selectors = ['.eventItem', '.news-item', '.scheme-item', '.update-item', 'article', '.content-item'];

    selectors.forEach(selector => {
      $(selector).each((_, element) => {
        const title = $(element).find('h2, h3, h4, .title, a').first().text().trim();
        const link = $(element).find('a').attr('href');
        const description = $(element).find('p, .description').first().text().trim();
        const dateText = $(element).find('.date, .publish-date, time').text().trim();

        if (title && link && !news.find(n => n.title === title)) {
          news.push({
            title,
            link: link.startsWith('http') ? link : new URL(link, url).href,
            description: description.substring(0, 500),
            date: parseDate(dateText),
            source: sourceName
          });
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
    { fn: scrapeMizoramAgri, name: 'Mizoram Agriculture' },
    { fn: scrapeSerchhip, name: 'Serchhip District' },
    { fn: scrapeIMDWeather, name: 'IMD Weather' },
    { 
      fn: () => scrapeGenericNIC('https://lawngtlai.nic.in/agriculture/', 'Lawngtlai Agriculture'),
      name: 'Lawngtlai'
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
