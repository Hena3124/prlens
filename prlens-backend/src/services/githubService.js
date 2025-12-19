const axios = require('axios');
const config = require('../config/config');

/**
 * GitHub Service
 * Handles all interactions with GitHub API
 */
class GitHubService {
  /**
   * Create axios instance with GitHub API configuration
   */
  static createClient(accessToken) {
    return axios.create({
      baseURL: config.github.apiUrl,
      headers: {
        Authorization: `token ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
  }

  /**
   * Exchange OAuth code for access token
   */
  static async getAccessToken(code) {
    try {
      const response = await axios.post(
        'https://github.com/login/oauth/access_token',
        {
          client_id: config.github.clientId,
          client_secret: config.github.clientSecret,
          code,
        },
        {
          headers: {
            Accept: 'application/json',
          },
        }
      );

      return response.data.access_token;
    } catch (error) {
      console.error('Error getting access token:', error.response?.data || error.message);
      throw new Error('Failed to get access token');
    }
  }

  /**
   * Get authenticated user information
   */
  static async getAuthenticatedUser(accessToken) {
    try {
      const client = this.createClient(accessToken);
      const response = await client.get('/user');
      return response.data;
    } catch (error) {
      console.error('Error getting user:', error.response?.data || error.message);
      throw new Error('Failed to get user information');
    }
  }

  /**
   * Get user's repositories
   */
  static async getUserRepos(accessToken, page = 1, perPage = 30) {
    try {
      const client = this.createClient(accessToken);
      const response = await client.get('/user/repos', {
        params: {
          sort: 'updated',
          per_page: perPage,
          page,
          affiliation: 'owner,collaborator,organization_member',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error getting repos:', error.response?.data || error.message);
      throw new Error('Failed to get repositories');
    }
  }

  /**
   * Get pull requests for a repository
   */
  static async getRepoPullRequests(accessToken, owner, repo, state = 'all', perPage = 50) {
    try {
      const client = this.createClient(accessToken);
      const response = await client.get(`/repos/${owner}/${repo}/pulls`, {
        params: {
          state,
          per_page: perPage,
          sort: 'updated',
          direction: 'desc',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error getting PRs:', error.response?.data || error.message);
      throw new Error('Failed to get pull requests');
    }
  }

  /**
   * Get detailed information about a specific PR
   */
  static async getPullRequestDetails(accessToken, owner, repo, prNumber) {
    try {
      const client = this.createClient(accessToken);
      
      // Get PR data
      const prResponse = await client.get(`/repos/${owner}/${repo}/pulls/${prNumber}`);
      
      // Get review comments
      const reviewCommentsResponse = await client.get(
        `/repos/${owner}/${repo}/pulls/${prNumber}/comments`
      );
      
      // Get issue comments (general PR comments)
      const issueCommentsResponse = await client.get(
        `/repos/${owner}/${repo}/issues/${prNumber}/comments`
      );

      // Get reviews
      const reviewsResponse = await client.get(
        `/repos/${owner}/${repo}/pulls/${prNumber}/reviews`
      );

      return {
        ...prResponse.data,
        review_comments_data: reviewCommentsResponse.data,
        issue_comments_data: issueCommentsResponse.data,
        reviews_data: reviewsResponse.data,
      };
    } catch (error) {
      console.error('Error getting PR details:', error.response?.data || error.message);
      throw new Error('Failed to get pull request details');
    }
  }

  /**
   * Get repository statistics
   */
  static async getRepoStats(accessToken, owner, repo) {
    try {
      const client = this.createClient(accessToken);
      const response = await client.get(`/repos/${owner}/${repo}`);
      return {
        name: response.data.name,
        fullName: response.data.full_name,
        description: response.data.description,
        stars: response.data.stargazers_count,
        forks: response.data.forks_count,
        openIssues: response.data.open_issues_count,
        language: response.data.language,
        defaultBranch: response.data.default_branch,
        createdAt: response.data.created_at,
        updatedAt: response.data.updated_at,
      };
    } catch (error) {
      console.error('Error getting repo stats:', error.response?.data || error.message);
      throw new Error('Failed to get repository statistics');
    }
  }

  /**
   * Search repositories
   */
  static async searchRepositories(accessToken, query, page = 1, perPage = 20) {
    try {
      const client = this.createClient(accessToken);
      const response = await client.get('/search/repositories', {
        params: {
          q: query,
          per_page: perPage,
          page,
          sort: 'updated',
        },
      });
      return response.data.items;
    } catch (error) {
      console.error('Error searching repos:', error.response?.data || error.message);
      throw new Error('Failed to search repositories');
    }
  }

  /**
   * Check rate limit status
   */
  static async getRateLimit(accessToken) {
    try {
      const client = this.createClient(accessToken);
      const response = await client.get('/rate_limit');
      return response.data;
    } catch (error) {
      console.error('Error getting rate limit:', error.response?.data || error.message);
      throw new Error('Failed to get rate limit');
    }
  }
}

module.exports = GitHubService;
