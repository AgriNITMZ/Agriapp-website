// scraper/schemeScraperCron.js - Cron job for automated scheme scraping
const cron = require('node-cron');
const mongoose = require('mongoose');
const { scrapeAllSchemes } = require('./schemeScraper');

// Run scheme scraper
const runSchemeScraper = async () => {
  console.log('\n🕐 Scheme scraper cron job triggered at:', new Date().toISOString());
  
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️  MongoDB not connected, skipping scheme scraping');
      return;
    }

    const result = await scrapeAllSchemes();
    console.log('✅ Scheme scraping completed successfully');
    console.log(`   Total: ${result.total}, Saved: ${result.saved}, Skipped: ${result.skipped}`);
  } catch (error) {
    console.error('❌ Scheme scraper cron job failed:', error.message);
  }
};

// Initialize cron job
const initSchemeCron = () => {
  // Run every week on Monday at 6:00 AM
  // Schemes don't change as frequently as news, so weekly is sufficient
  cron.schedule('0 6 * * 1', runSchemeScraper, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  });

  console.log('✅ Scheme scraper cron job initialized');
  console.log('   Schedule: Every Monday at 6:00 AM IST');
  console.log('   Next run will fetch and update government schemes');
};

// Manual trigger function (for testing or immediate updates)
const triggerSchemeScraperNow = async () => {
  console.log('🚀 Manually triggering scheme scraper...');
  await runSchemeScraper();
};

module.exports = {
  initSchemeCron,
  triggerSchemeScraperNow,
  runSchemeScraper
};
