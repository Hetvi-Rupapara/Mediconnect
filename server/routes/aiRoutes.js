/**
 * AI Routes
 * Registers endpoints for AI services.
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const aiController = require('../controllers/aiController');

// @route   POST /api/ai/chat
// @desc    Interact with MediConnect AI healthcare assistant
// @access  Private (Requires authentication)
router.post('/chat', auth, aiController.chatWithAI);

module.exports = router;
