import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('github_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('github_token');
      localStorage.removeItem('github_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  getAuthUrl: () => api.get('/api/auth/github'),
  handleCallback: (code) => api.get(`/api/auth/github/callback?code=${code}`),
  verifyToken: () => api.get('/api/auth/verify'),
  logout: () => api.post('/api/auth/logout'),
};

// Repository API
export const repoAPI = {
  getUserRepos: (page = 1, perPage = 30) =>
    api.get('/api/repos', { params: { page, per_page: perPage } }),
  searchRepos: (query, page = 1, perPage = 20) =>
    api.get('/api/repos/search', { params: { query, page, per_page: perPage } }),
  getRepoStats: (owner, repo) => api.get(`/api/repos/${owner}/${repo}/stats`),
};

// Pull Request API
export const prAPI = {
  getRepoPRs: (owner, repo, state = 'all', perPage = 50) =>
    api.get(`/api/prs/${owner}/${repo}`, { params: { state, per_page: perPage } }),
  getPRDetails: (owner, repo, prNumber) =>
    api.get(`/api/prs/${owner}/${repo}/${prNumber}`),
  getRepoAnalytics: (owner, repo, perPage = 100) =>
    api.get(`/api/prs/${owner}/${repo}/analytics`, { params: { per_page: perPage } }),
  getTopRiskyPRs: (owner, repo, limit = 10) =>
    api.get(`/api/prs/${owner}/${repo}/top-risky`, { params: { limit } }),
};

export default api;
