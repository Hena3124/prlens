/**
 * Error Handler Middleware
 * Catches and formats errors
 */

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // GitHub API errors
  if (err.response?.status === 401) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired GitHub token',
      message: 'Please re-authenticate with GitHub',
    });
  }

  if (err.response?.status === 403) {
    return res.status(403).json({
      success: false,
      error: 'GitHub API rate limit exceeded',
      message: 'Please try again later',
      resetTime: err.response.headers['x-ratelimit-reset'],
    });
  }

  if (err.response?.status === 404) {
    return res.status(404).json({
      success: false,
      error: 'Resource not found',
      message: 'The requested repository or pull request was not found',
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
