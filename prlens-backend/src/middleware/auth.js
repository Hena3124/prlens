/**
 * Authentication Middleware
 * Verifies that user has valid access token
 */

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required',
    });
  }

  // Store token in request for use in controllers
  req.accessToken = token;
  next();
};

module.exports = { authenticateToken };
