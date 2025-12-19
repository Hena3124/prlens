const GitHubService = require('../services/githubService');
const config = require('../config/config');

/**
 * Authentication Controller
 * Handles GitHub OAuth flow
 */

/**
 * Initiate GitHub OAuth - Redirect to GitHub
 */
const initiateGitHubOAuth = (req, res) => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${config.github.clientId}&scope=repo,read:user&redirect_uri=${encodeURIComponent(config.github.callbackUrl)}`;
  
  console.log('Redirecting to GitHub OAuth:', githubAuthUrl);
  res.redirect(githubAuthUrl);
};

/**
 * Handle GitHub OAuth callback
 */
const handleGitHubCallback = async (req, res) => {
  try {
    console.log('Callback received with query:', req.query);
    const { code } = req.query;

    if (!code) {
      console.error('No code provided in callback');
      return res.redirect(`${config.frontend.url}/login?error=no_code`);
    }

    console.log('Exchanging code for token...');
    // Exchange code for access token
    const accessToken = await GitHubService.getAccessToken(code);

    if (!accessToken) {
      console.error('Failed to get access token');
      return res.redirect(`${config.frontend.url}/login?error=no_token`);
    }

    console.log('Got access token, fetching user info...');
    // Get user information
    const user = await GitHubService.getAuthenticatedUser(accessToken);
    console.log('User authenticated:', user.login);

    // Redirect to frontend with token and user data
    const userData = encodeURIComponent(JSON.stringify({
      id: user.id,
      login: user.login,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatar_url,
      bio: user.bio,
      location: user.location,
    }));

    const redirectUrl = `${config.frontend.url}/auth/callback?token=${accessToken}&user=${userData}`;
    console.log('Redirecting to frontend:', redirectUrl);
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('GitHub callback error:', error);
    res.redirect(`${config.frontend.url}/login?error=auth_failed&message=${encodeURIComponent(error.message)}`);
  }
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
  verifyToken,
  logout,
};
