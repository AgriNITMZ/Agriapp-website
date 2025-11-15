const axios = require('axios');
const cheerio = require('cheerio');

const TARGET_URL = 'https://serchhip.nic.in/schemes/';

exports.scrapeWebsite = async (req, res) => {
  try {
    const response = await axios.get(TARGET_URL);
    const html = response.data;
    const $ = cheerio.load(html);

    const scrapedData = [];

    $('.eventItem .eventContent').each((index, element) => {
      const title = $(element).find('h2.heading3 a').text().trim();
      const link = $(element).find('h2.heading3 a').attr('href');
      const description = $(element).find('p').text().trim();
      const publishDateText = $(element).find('.uppercase').text().trim();
      const publishDateMatch = publishDateText.match(/Publish date:\s*(.*)/i);
      const publishDate = publishDateMatch ? publishDateMatch[1] : null;

      if (title && link && publishDate) {
        scrapedData.push({
          title,
          link: link.startsWith('http') ? link : `https://serchhip.nic.in${link}`,
          description,
          publishDate
        });
      }
    });

    // Convert DD/MM/YYYY → YYYY-MM-DD and sort descending
    scrapedData.sort((a, b) => {
      const dateA = new Date(a.publishDate.split('/').reverse().join('-'));

      const dateB = new Date(b.publishDate.split('/').reverse().join('-'));
      return dateB - dateA;
    });

    // 🧠 Filter only recent ones — e.g. last 60 days
    const recentCutoff = new Date();
    recentCutoff.setDate(recentCutoff.getDate() - 60); // last 60 days

    const recentData = scrapedData.filter(scheme => {
      const date = new Date(scheme.publishDate.split('/').reverse().join('-'));
      console.log("data is",date, recentCutoff);
      return date >= recentCutoff;
    });

    // If no schemes in last 60 days, just return the latest 2–3
    const dataToSend = recentData.length > 0 ? recentData : scrapedData.slice(0, 2);

    res.json({
      source: TARGET_URL,
      total: dataToSend.length,
      data: dataToSend
    });

  } catch (error) {
    console.error('Error during scraping:', error);
    res.status(500).json({
      error: 'An error occurred while scraping the Serchhip schemes page.',
      details: error.message,
    });
  }
};
