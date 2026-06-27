/**
 * AI Service
 * Handles the interaction with the OpenRouter API.
 * Keeps the vendor integration isolated from routes and controllers.
 */

// Load parameters from process.env
const apiKey = process.env.OPENROUTER_API_KEY;
const modelName = process.env.OPENROUTER_MODEL || 'openai/gpt-oss-120b';
const baseUrl = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';

// Mandatory system prompt for medical safety and boundaries
const SYSTEM_PROMPT = 
  "You are MediConnect AI, a healthcare assistant.\n\n" +
  "You are NOT a doctor.\n\n" +
  "Never diagnose diseases or prescribe medications.\n\n" +
  "Always answer using simple English and short sentences.\n\n" +
  "Keep responses between 50 and 120 words whenever possible.\n\n" +
  "Avoid long paragraphs and unnecessary explanations.\n\n" +
  "When appropriate, structure your response using these headings:\n\n" +
  "Possible Cause\n" +
  "Recommended Doctor\n" +
  "Urgency\n" +
  "Advice\n\n" +
  "Use short bullet points.\n\n" +
  "Recommend only one medical specialist.\n\n" +
  "Estimate urgency as Low, Medium, or High with one short reason.\n\n" +
  "For general healthcare questions, provide a short explanation with simple bullet points.\n\n" +
  "Always finish with:\n\n" +
  "'Please consult a qualified healthcare professional for proper medical advice.'\n\n" +
  "Your responses should be easy enough for a beginner or a non-medical person to understand.";

/**
 * Sends a message prompt to the OpenRouter chat completions endpoint
 * @param {string} userMessage - The patient message query
 * @returns {Promise<string>} The assistant's reply text
 */
async function getAIChatResponse(userMessage) {
  // Graceful fallback for unconfigured API keys
  if (!apiKey || apiKey === 'YOUR_OPENROUTER_API_KEY') {
    console.warn('AI Service Warning: OPENROUTER_API_KEY is not configured in .env file.');
    return "MediConnect AI is currently running in offline demonstration mode. To enable live AI chat responses, please update the OPENROUTER_API_KEY in your server/.env configuration file.";
  }

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenRouter API error status:', response.status, data);
      return "The AI assistant service encountered an error communicating with the provider. Please try again shortly.";
    }

    // Safely extract the assistant response message
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    } else {
      console.error('Unexpected OpenRouter response format:', data);
      return "The AI assistant service returned an unexpected response format. Please try again.";
    }
  } catch (error) {
    console.error('AI Service Connection failure:', error.message);
    // Return a generic friendly response instead of throwing to prevent backend crashes
    return "The AI assistant is temporarily unavailable due to a network connection issue. Please check your internet connectivity and try again.";
  }
}

module.exports = {
  getAIChatResponse
};
