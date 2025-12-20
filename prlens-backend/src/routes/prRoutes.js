const express = require('express');
const router = express.Router();
const prController = require('../controllers/prController');
const { authenticateToken } = require('../middleware/auth');

// All PR routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/prs/:owner/:repo/analytics
 * @desc    Get repository-wide PR analytics
 * @access  Private
 */
router.get('/:owner/:repo/analytics', prController.getRepositoryAnalytics);

/**
 * @route   GET /api/prs/:owner/:repo/top-risky
 * @desc    Get top risky PRs
 * @access  Private
 */
router.get('/:owner/:repo/top-risky', prController.getTopRiskyPRs);

/**
 * @route   GET /api/prs/:owner/:repo
 * @desc    Get pull requests with risk analysis
 * @access  Private
 */
router.get('/:owner/:repo', prController.getRepositoryPullRequests);

/**
 * @route   GET /api/prs/:owner/:repo/:pr_number
 * @desc    Get detailed PR analysis
 * @access  Private
 */
router.get('/:owner/:repo/:pr_number', prController.getPullRequestDetails);

module.exports = router;
