/**
 * AI Controller
 * Manages HTTP request/response handling for AI capabilities.
 */

const aiService = require('../services/aiService');

/**
 * Handle chat message processing
 * @route  POST /api/ai/chat
 * @access Private
 */
async function chatWithAI(req, res) {
  const { message } = req.body;

  // Validate request body
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ message: 'A valid message text is required' });
  }

  try {
    // Call the isolated AI service
    const reply = await aiService.getAIChatResponse(message.trim());
    
    // Respond with the reply string
    return res.json({ reply });
  } catch (error) {
    console.error('Controller Error in chatWithAI:', error.message);
    // Return a clean server error response, masking tracebacks
    return res.status(500).json({ message: 'An internal server error occurred while processing your query' });
  }
}

module.exports = {
  chatWithAI
};
