const GitHubService = require('../services/githubService');
const config = require('../config/config');
const { loginCodes } = require('../utils/loginCodes');

/**
 * Authentication Controller
 * Handles GitHub OAuth flow
 *
 * The access token is never put in a URL or written to the logs. After
 * GitHub redirects back, the token is parked under a single-use login code
 * (valid for 60 seconds) and only the code travels to the frontend, which
 * exchanges it with POST /api/auth/exchange.
 */

/**
 * Initiate GitHub OAuth - Redirect to GitHub
 */
const initiateGitHubOAuth = (req, res) => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${config.github.clientId}&scope=repo,read:user&redirect_uri=${encodeURIComponent(config.github.callbackUrl)}`;
  res.redirect(githubAuthUrl);
};

/**
 * Handle GitHub OAuth callback
 */
const handleGitHubCallback = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.redirect(`${config.frontend.url}/login?error=no_code`);
    }

    // Exchange code for access token
    const accessToken = await GitHubService.getAccessToken(code);

    if (!accessToken) {
      return res.redirect(`${config.frontend.url}/login?error=no_token`);
    }

    // Get user information
    const user = await GitHubService.getAuthenticatedUser(accessToken);

    const loginCode = loginCodes.issue({
      token: accessToken,
      user: {
        id: user.id,
        login: user.login,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatar_url,
        bio: user.bio,
        location: user.location,
      },
    });

    res.redirect(`${config.frontend.url}/auth/callback?login_code=${loginCode}`);
  } catch (error) {
    console.error('GitHub callback error:', error.message);
    res.redirect(`${config.frontend.url}/login?error=auth_failed&message=${encodeURIComponent(error.message)}`);
  }
};

/**
 * Exchange a single-use login code for the access token and user
 */
const exchangeLoginCode = (req, res) => {
  const payload = loginCodes.redeem(req.body && req.body.login_code);

  if (!payload) {
    return res.status(400).json({
      success: false,
      error: 'Invalid or expired login code',
    });
  }

  res.json({
    success: true,
    token: payload.token,
    user: payload.user,
  });
};

/**
 * Verify token and get user info
 */
const verifyToken = async (req, res) => {
  try {
    const { accessToken } = req;
    
    const user = await GitHubService.getAuthenticatedUser(accessToken);

    res.json({
      success: true,
      user: {
        id: user.id,
        login: user.login,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatar_url,
      },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid token',
    });
  }
};

/**
 * Logout (client-side will clear token)
 */
const logout = (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
};

module.exports = {
  initiateGitHubOAuth,
  handleGitHubCallback,
  exchangeLoginCode,
  verifyToken,
  logout,
};
