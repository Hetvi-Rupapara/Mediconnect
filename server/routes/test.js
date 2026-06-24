const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

/**
 * @route   GET /api/test
 * @desc    Test connection and check database status
 * @access  Public
 */
router.get('/', (req, res) => {
  // Check the state of the mongoose connection: 1 means connected
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  res.json({
    status: 'ok',
    message: 'MediConnect Backend is running and connected!',
    database: dbStatus
  });
});

module.exports = router;
