const express = require('express');
const router = express.Router();
const repoController = require('../controllers/repoController');
const { authenticateToken } = require('../middleware/auth');

// All repo routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/repos
 * @desc    Get user's repositories
 * @access  Private
 */
router.get('/', repoController.getUserRepositories);

/**
 * @route   GET /api/repos/search
 * @desc    Search repositories
 * @access  Private
 */
router.get('/search', repoController.searchRepositories);

/**
 * @route   GET /api/repos/:owner/:repo/stats
 * @desc    Get repository statistics
 * @access  Private
 */
router.get('/:owner/:repo/stats', repoController.getRepositoryStats);

module.exports = router;
