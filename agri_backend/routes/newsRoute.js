// routes/newsRoute.js - Isolated News Routes
const express = require('express');
const router = express.Router();
const AgriNews = require('../models/newsModel');
const { runNewsScraper } = require('../scraper/newsScraper');

/**
 * GET /api/news
 * Get all news sorted by date (latest first)
 */
router.get('/', async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [news, total] = await Promise.all([
      AgriNews.find()
        .sort({ date: -1 })
        .limit(parseInt(limit))
        .skip(skip)
        .lean(),
      AgriNews.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      news,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news',
      error: error.message
    });
  }
});

/**
 * POST /api/news/run
 * Manually trigger the news scraper
 */
router.post('/run', async (req, res) => {
  try {
    console.log('🚀 [API] Manual news scraping triggered');
    const result = await runNewsScraper();

    res.status(200).json({
      success: result.success,
      message: result.success ? 'News scraping completed' : 'News scraping failed',
      ...result
    });
  } catch (error) {
    console.error('Error running scraper:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to run scraper',
      error: error.message
    });
  }
});

module.exports = router;
