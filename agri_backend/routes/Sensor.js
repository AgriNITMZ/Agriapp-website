const express = require('express');
const router = express.Router();

router.get('/sensor-ids', (req, res) => {
  res.status(503).json({
    status: 'error',
    message: 'Sensor feature is still in development and will be available soon'
  });
});

router.get('/sensor-data', (req, res) => {
  res.status(503).json({
    status: 'error',
    message: 'Sensor feature is still in development and will be available soon'
  });
});

module.exports = router;
