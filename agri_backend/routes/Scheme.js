const express = require('express');
const router = express.Router();
const schemeController = require('../controller/Scheme');

// Scraper endpoint (can be protected with auth if needed)
router.post('/scrape', schemeController.triggerScraper);

// CRUD endpoints
router.post('/', schemeController.addScheme);
router.get('/', schemeController.getSchemes);
router.get('/:id', schemeController.getSchemeById);
router.put('/:id', schemeController.updateScheme);
router.delete('/:id', schemeController.deleteScheme);

module.exports = router;
