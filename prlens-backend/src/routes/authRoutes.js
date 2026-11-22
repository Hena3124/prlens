const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route   GET /api/auth/github
 * @desc    Initiate GitHub OAuth flow
 * @access  Public
 */
router.get('/github', authController.initiateGitHubOAuth);

/**
 * @route   GET /api/auth/github/callback
 * @desc    Handle GitHub OAuth callback
 * @access  Public
 */
router.get('/github/callback', authController.handleGitHubCallback);

/**
 * @route   POST /api/auth/exchange
 * @desc    Swap a single-use login code for the access token
 * @access  Public
 */
router.post('/exchange', authController.exchangeLoginCode);

/**
 * @route   GET /api/auth/verify
 * @desc    Verify access token
 * @access  Private
 */
router.get('/verify', authenticateToken, authController.verifyToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authenticateToken, authController.logout);

module.exports = router;
