// scraper/newsCronJob.js - Cron job for news scraping (every 30 minutes)
const cron = require('node-cron');
const { runNewsScraper } = require('./newsScraper');

/**
 * Schedule news scraping every 30 minutes
 */
const scheduleNewsScraping = () => {
  // Run every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    console.log('🕐 [CRON] Starting scheduled news scraping (every 30 minutes)...');
    
    try {
      const result = await runNewsScraper();
      
      if (result.success) {
        console.log(`✅ [CRON] News scraping complete: ${result.savedCount} saved, ${result.skippedCount} skipped`);
      } else {
        console.error('❌ [CRON] News scraping failed:', result.error);
      }
    } catch (error) {
      console.error('❌ [CRON] News scraping error:', error.message);
    }
  });

  console.log('✅ [CRON] News scraping scheduled: Every 30 minutes');
};

/**
 * Initialize news cron job
 */
const initializeNewsCron = () => {
  scheduleNewsScraping();
};

module.exports = { initializeNewsCron };
