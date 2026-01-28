const express = require('express');
const router = express.Router();

// XAMPP Server URL (college server) - from environment variable
const XAMPP_SERVER = process.env.XAMPP_SENSOR_SERVER || 'http://59.93.129.199:8090';

// Proxy route for sensor IDs
router.get('/sensor-ids', async (req, res) => {
  try {
    const response = await fetch(`${XAMPP_SERVER}/apis/get_sensor_ids.php`);
    
    if (!response.ok) {
      throw new Error(`XAMPP server returned ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching sensor IDs from XAMPP:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch sensor IDs from college server',
      error: error.message
    });
  }
});

// Proxy route for sensor data
router.get('/sensor-data', async (req, res) => {
  try {
    const { table, limit, page } = req.query;
    const url = `${XAMPP_SERVER}/apis/get_sensor_data_pagination.php?table=${table || 'sensor_201'}&limit=${limit || 20}&page=${page || 1}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`XAMPP server returned ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching sensor data from XAMPP:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch sensor data from college server',
      error: error.message
    });
  }
});

module.exports = router;
