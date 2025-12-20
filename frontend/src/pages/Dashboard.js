import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, GitBranch, TrendingUp, LogOut, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { repoAPI } from '../services/api';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [repos, setRepos] = useState([]);
  const [filteredRepos, setFilteredRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRepos();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = repos.filter(
        (repo) =>
          repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          repo.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRepos(filtered);
    } else {
      setFilteredRepos(repos);
    }
  }, [searchQuery, repos]);

  const fetchRepos = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await repoAPI.getUserRepos(1, 50);
      if (response.data.success) {
        setRepos(response.data.data);
        setFilteredRepos(response.data.data);
      }
    } catch (err) {
      setError('Failed to load repositories');
      console.error('Error fetching repos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRepoClick = (repo) => {
    navigate(`/repo/${repo.owner.login}/${repo.name}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Check if search query is in format "owner/repo"
    if (searchQuery.includes('/')) {
      const [owner, repo] = searchQuery.split('/');
      if (owner && repo) {
        navigate(`/repo/${owner.trim()}/${repo.trim()}`);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <TrendingUp size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">PRLens</h1>
                <p className="text-sm text-gray-400">Pull Request Analyzer</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={user?.avatarUrl}
                  alt={user?.name}
                  className="w-8 h-8 rounded-full"
                />
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="text-xs text-gray-400">@{user?.login}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-white transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search your repos or enter 'owner/repo' (e.g., facebook/react)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {searchQuery.includes('/') && (
              <p className="mt-2 text-sm text-blue-400">
                Press Enter to analyze {searchQuery}
              </p>
            )}
          </form>
        </div>

        {/* Repository List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="animate-spin text-blue-500" size={40} />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchRepos}
              className="text-blue-500 hover:text-blue-400"
            >
              Try Again
            </button>
          </div>
        ) : filteredRepos.length === 0 ? (
          <div className="text-center py-20">
            <GitBranch className="mx-auto text-gray-600 mb-4" size={48} />
            <p className="text-gray-400">
              {searchQuery
                ? 'No repositories found matching your search'
                : 'No repositories found'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRepos.map((repo) => (
              <div
                key={repo.id}
                onClick={() => handleRepoClick(repo)}
                className="bg-gray-800 border border-gray-700 rounded-lg p-5 hover:border-blue-500 cursor-pointer transition-all hover:shadow-lg"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg mb-1 truncate">
                      {repo.name}
                    </h3>
                    <p className="text-gray-400 text-sm">{repo.full_name}</p>
                  </div>
                  {repo.private && (
                    <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                      Private
                    </span>
                  )}
                </div>

                {repo.description && (
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {repo.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-400">
                  {repo.language && (
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                      <span>{repo.language}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <GitBranch size={14} />
                    <span>{repo.open_issues_count || 0} issues</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
