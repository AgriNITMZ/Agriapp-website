const express = require('express');
const router = express.Router();
const newsController = require('../controller/News');

// Create news
router.post('/', newsController.addNews);

// Get all news (with pagination)
router.get('/', newsController.getAllNews);

// Get single news
router.get('/:id', newsController.getNewsById);

// Update news
router.put('/:id', newsController.updateNews);

// Delete news
router.delete('/:id', newsController.deleteNews);

module.exports = router;
