const jwt = require('jsonwebtoken');

/**
 * Authentication Middleware
 * Verifies the JWT token from the Authorization header and attaches the user payload to the request.
 */
module.exports = function (req, res, next) {
  // Get the token from the request header (Authorization: Bearer <token>)
  const authHeader = req.header('Authorization');
  
  // Check if header is present
  if (!authHeader) {
    return res.status(401).json({ message: 'No authorization token, access denied' });
  }

  // Expect header in format 'Bearer <token>'
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Token format is invalid, must be Bearer <token>' });
  }

  const token = parts[1];

  try {
    // Verify the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach decoded user data (usually has { id, role }) to request object
    req.user = decoded;
    
    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // Return unauthorized if token is invalid or expired
    res.status(401).json({ message: 'Token is not valid or has expired' });
  }
};
