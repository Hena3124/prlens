const GitHubService = require('../services/githubService');
const RiskCalculator = require('../utils/riskCalculator');
const AnalyticsCalculator = require('../utils/analyticsCalculator');

/**
 * Pull Request Controller
 * Handles PR analysis and risk calculation
 */

/**
 * Get pull requests for a repository with risk analysis
 */
const getRepositoryPullRequests = async (req, res, next) => {
  try {
    const { accessToken } = req;
    const { owner, repo } = req.params;
    const { state = 'all', per_page = 50 } = req.query;

    // Fetch PRs from GitHub
    const prs = await GitHubService.getPullRequestsWithDetails(accessToken, owner, repo, state, per_page);

    // Calculate risk for each PR
    const prsWithRisk = prs.map(pr => {
      const riskAnalysis = RiskCalculator.calculateRiskScore(pr);
      const healthStatus = RiskCalculator.getHealthStatus(riskAnalysis.score, pr);

      return {
        id: pr.id,
        number: pr.number,
        title: pr.title,
        state: pr.state,
        user: {
          login: pr.user.login,
          avatarUrl: pr.user.avatar_url,
        },
        createdAt: pr.created_at,
        updatedAt: pr.updated_at,
        mergedAt: pr.merged_at,
        closedAt: pr.closed_at,
        htmlUrl: pr.html_url,
        // Size metrics
        additions: pr.additions,
        deletions: pr.deletions,
        changedFiles: pr.changed_files,
        // Review metrics
        comments: pr.comments,
        reviewComments: pr.review_comments,
        requestedReviewers: pr.requested_reviewers?.length || 0,
        // Risk analysis
        risk: riskAnalysis,
        health: healthStatus,
      };
    });

    // Sort by risk score (highest first)
    prsWithRisk.sort((a, b) => b.risk.score - a.risk.score);

    res.json({
      success: true,
      data: prsWithRisk,
      count: prsWithRisk.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get detailed analysis for a specific PR
 */
const getPullRequestDetails = async (req, res, next) => {
  try {
    const { accessToken } = req;
    const { owner, repo, pr_number } = req.params;

    // Fetch detailed PR data
    const prDetails = await GitHubService.getPullRequestDetails(
      accessToken,
      owner,
      repo,
      pr_number
    );

    // Calculate risk analysis
    const riskAnalysis = RiskCalculator.calculateRiskScore(prDetails);
    const healthStatus = RiskCalculator.getHealthStatus(riskAnalysis.score, prDetails);

    // Format response
    const response = {
      // Basic info
      id: prDetails.id,
      number: prDetails.number,
      title: prDetails.title,
      body: prDetails.body,
      state: prDetails.state,
      user: {
        login: prDetails.user.login,
        avatarUrl: prDetails.user.avatar_url,
      },
      // Timestamps
      createdAt: prDetails.created_at,
      updatedAt: prDetails.updated_at,
      mergedAt: prDetails.merged_at,
      closedAt: prDetails.closed_at,
      // Links
      htmlUrl: prDetails.html_url,
      diffUrl: prDetails.diff_url,
      // Size metrics
      additions: prDetails.additions,
      deletions: prDetails.deletions,
      changedFiles: prDetails.changed_files,
      // Review data
      comments: prDetails.comments,
      reviewComments: prDetails.review_comments,
      commits: prDetails.commits,
      requestedReviewers: prDetails.requested_reviewers,
      reviews: prDetails.reviews_data,
      // Detailed comments
      reviewCommentsData: prDetails.review_comments_data,
      issueCommentsData: prDetails.issue_comments_data,
      // Risk analysis
      risk: riskAnalysis,
      health: healthStatus,
    };

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get repository-wide analytics
 */
const getRepositoryAnalytics = async (req, res, next) => {
  try {
    const { accessToken } = req;
    const { owner, repo } = req.params;
    const { per_page = 100 } = req.query;

    // Fetch all PRs for analytics
    const prs = await GitHubService.getPullRequestsWithDetails(accessToken, owner, repo, 'all', per_page);

    // Calculate analytics
    const analytics = AnalyticsCalculator.calculateRepoAnalytics(prs);

    // Get repo stats
    const repoStats = await GitHubService.getRepoStats(accessToken, owner, repo);

    res.json({
      success: true,
      data: {
        repository: repoStats,
        analytics,
        sampleSize: prs.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get top risky PRs across repository
 */
const getTopRiskyPRs = async (req, res, next) => {
  try {
    const { accessToken } = req;
    const { owner, repo } = req.params;
    const { limit = 10 } = req.query;

    // Fetch open PRs
    const prs = await GitHubService.getPullRequestsWithDetails(accessToken, owner, repo, 'open', 100);

    // Calculate risk and sort
    const prsWithRisk = prs
      .map(pr => {
        const riskAnalysis = RiskCalculator.calculateRiskScore(pr);
        return {
          number: pr.number,
          title: pr.title,
          user: pr.user.login,
          htmlUrl: pr.html_url,
          risk: riskAnalysis,
          additions: pr.additions,
          deletions: pr.deletions,
          changedFiles: pr.changed_files,
        };
      })
      .sort((a, b) => b.risk.score - a.risk.score)
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: prsWithRisk,
      count: prsWithRisk.length,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRepositoryPullRequests,
  getPullRequestDetails,
  getRepositoryAnalytics,
  getTopRiskyPRs,
};
