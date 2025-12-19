import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  TrendingUp,
  AlertTriangle,
  Activity,
  GitPullRequest,
  Clock,
  FileText,
  Users,
  Loader,
} from 'lucide-react';
import { prAPI, repoAPI } from '../services/api';
import { formatDate, getRiskColor, getRiskBadgeClass, formatNumber } from '../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const RepositoryPage = () => {
  const { owner, repo } = useParams();
  const navigate = useNavigate();
  const [prs, setPrs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [repoStats, setRepoStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('prs');

  useEffect(() => {
    fetchData();
  }, [owner, repo]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prsRes, analyticsRes, statsRes] = await Promise.all([
        prAPI.getRepoPRs(owner, repo, 'open'),
        prAPI.getRepoAnalytics(owner, repo),
        repoAPI.getRepoStats(owner, repo),
      ]);

      if (prsRes.data.success) setPrs(prsRes.data.data);
      if (analyticsRes.data.success) setAnalytics(analyticsRes.data.data);
      if (statsRes.data.success) setRepoStats(statsRes.data.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePRClick = (prNumber) => {
    navigate(`/repo/${owner}/${repo}/pr/${prNumber}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  const riskChartData = analytics?.analytics?.riskDistribution
    ? [
        { name: 'Low', value: analytics.analytics.riskDistribution.low, color: '#10b981' },
        { name: 'Medium', value: analytics.analytics.riskDistribution.medium, color: '#f59e0b' },
        { name: 'High', value: analytics.analytics.riskDistribution.high, color: '#ef4444' },
        { name: 'Critical', value: analytics.analytics.riskDistribution.critical, color: '#dc2626' },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-lg">
              <GitPullRequest size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{repoStats?.name}</h1>
              <p className="text-gray-400">{repoStats?.fullName}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('prs')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'prs'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Pull Requests ({prs.length})
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'prs' ? (
          <div className="space-y-4">
            {prs.length === 0 ? (
              <div className="text-center py-20">
                <GitPullRequest className="mx-auto text-gray-600 mb-4" size={48} />
                <p className="text-gray-400">No open pull requests</p>
              </div>
            ) : (
              prs.map((pr) => (
                <div
                  key={pr.id}
                  onClick={() => handlePRClick(pr.number)}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-5 hover:border-blue-500 cursor-pointer transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-semibold text-lg">
                          #{pr.number} {pr.title}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getRiskBadgeClass(pr.risk.level)}`}>
                          {pr.risk.level.toUpperCase()} RISK
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">
                        by {pr.user.login} • {formatDate(pr.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold" style={{ color: getRiskColor(pr.risk.level) }}>
                        {pr.risk.score}
                      </div>
                      <div className="text-gray-400 text-xs">Risk Score</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400 mb-1">Changes</div>
                      <div className="text-white font-medium">
                        <span className="text-green-500">+{formatNumber(pr.additions)}</span>
                        {' / '}
                        <span className="text-red-500">-{formatNumber(pr.deletions)}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400 mb-1">Files</div>
                      <div className="text-white font-medium">{pr.changedFiles}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 mb-1">Comments</div>
                      <div className="text-white font-medium">{pr.comments + pr.reviewComments}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 mb-1">Reviewers</div>
                      <div className="text-white font-medium">{pr.requestedReviewers}</div>
                    </div>
                  </div>

                  {pr.risk.recommendations.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <div className="flex items-start gap-2 text-sm text-yellow-400">
                        <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                        <span>{pr.risk.recommendations[0].message}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
                <div className="flex items-center gap-3 mb-2">
                  <GitPullRequest className="text-blue-500" size={24} />
                  <div className="text-gray-400 text-sm">Total PRs</div>
                </div>
                <div className="text-3xl font-bold text-white">
                  {analytics?.analytics?.overview?.totalPRs || 0}
                </div>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="text-green-500" size={24} />
                  <div className="text-gray-400 text-sm">Merge Rate</div>
                </div>
                <div className="text-3xl font-bold text-white">
                  {analytics?.analytics?.overview?.mergeRate || 0}%
                </div>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="text-yellow-500" size={24} />
                  <div className="text-gray-400 text-sm">Avg Size</div>
                </div>
                <div className="text-3xl font-bold text-white">
                  {formatNumber(Math.round(analytics?.analytics?.sizeMetrics?.averageLines || 0))}
                </div>
                <div className="text-gray-400 text-xs">lines</div>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="text-purple-500" size={24} />
                  <div className="text-gray-400 text-sm">Avg Merge Time</div>
                </div>
                <div className="text-xl font-bold text-white">
                  {analytics?.analytics?.timeMetrics?.averageTimeToMerge || '0h'}
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Risk Distribution */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h3 className="text-white font-semibold text-lg mb-4">Risk Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={riskChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {riskChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Review Metrics */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h3 className="text-white font-semibold text-lg mb-4">Review Metrics</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Review Rate</span>
                      <span className="text-white font-medium">
                        {analytics?.analytics?.reviewMetrics?.reviewRate || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${analytics?.analytics?.reviewMetrics?.reviewRate || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="text-gray-400 text-sm mb-1">Average Comments per PR</div>
                    <div className="text-white text-2xl font-bold">
                      {analytics?.analytics?.reviewMetrics?.averageComments || 0}
                    </div>
                  </div>

                  <div>
                    <div className="text-gray-400 text-sm mb-1">PRs Without Review</div>
                    <div className="text-white text-2xl font-bold">
                      {analytics?.analytics?.reviewMetrics?.prsWithoutReview || 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RepositoryPage;
