const express = require('express');
const router = express.Router();
const schemeController = require('../controller/Scheme');

router.post('/', schemeController.addScheme);
router.get('/', schemeController.getSchemes);
router.get('/:id', schemeController.getSchemeById);
router.put('/:id', schemeController.updateScheme);
router.delete('/:id', schemeController.deleteScheme);

module.exports = router;
