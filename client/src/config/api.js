// Centralized API configuration for MediConnect
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5001';

/**
 * Validates and parses API responses.
 * Gracefully intercepts non-JSON/HTML payloads (e.g. Vercel 404 pages) and throws a meaningful, user-friendly error message.
 * @param {Response} response - The Fetch API Response object
 * @returns {Promise<any>} Parsed JSON content or null if status is 204 No Content
 */
export async function handleApiResponse(response) {
  const contentType = response.headers.get('content-type');
  
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    return data;
  }
  
  if (response.ok) {
    return null;
  }
  
  throw new Error('Unable to connect to MediConnect server. Please try again later.');
}
