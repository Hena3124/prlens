const GitHubService = require('../services/githubService');

/**
 * Repository Controller
 * Handles repository-related operations
 */

/**
 * Get user's repositories
 */
const getUserRepositories = async (req, res, next) => {
  try {
    const { accessToken } = req;
    const { page = 1, per_page = 30 } = req.query;

    const repos = await GitHubService.getUserRepos(accessToken, page, per_page);

    res.json({
      success: true,
      data: repos,
      count: repos.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search repositories
 */
const searchRepositories = async (req, res, next) => {
  try {
    const { accessToken } = req;
    const { query, page = 1, per_page = 20 } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required',
      });
    }

    const repos = await GitHubService.searchRepositories(accessToken, query, page, per_page);

    res.json({
      success: true,
      data: repos,
      count: repos.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get repository statistics
 */
const getRepositoryStats = async (req, res, next) => {
  try {
    const { accessToken } = req;
    const { owner, repo } = req.params;

    const stats = await GitHubService.getRepoStats(accessToken, owner, repo);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserRepositories,
  searchRepositories,
  getRepositoryStats,
};
