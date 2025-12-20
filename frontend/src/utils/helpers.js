// Format dates
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
      }
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    }
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  } catch (error) {
    return 'N/A';
  }
};

// Format numbers with commas
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  if (typeof num !== 'number') {
    const parsed = parseInt(num);
    if (isNaN(parsed)) return '0';
    return parsed.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Get risk color
export const getRiskColor = (level) => {
  const colors = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444',
    critical: '#dc2626',
  };
  return colors[level] || '#6b7280';
};

// Get risk badge classes
export const getRiskBadgeClass = (level) => {
  const classes = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  };
  return classes[level] || 'bg-gray-100 text-gray-800';
};

// Get health status color
export const getHealthColor = (status) => {
  const colors = {
    healthy: '#10b981',
    'at-risk': '#f59e0b',
    stale: '#6b7280',
    critical: '#ef4444',
  };
  return colors[status] || '#6b7280';
};

// 🆕 NEW: Get merge readiness (Traffic Light System)
export const getMergeReadiness = (riskScore, pr) => {
  const daysSinceUpdate = (new Date() - new Date(pr.updatedAt)) / (1000 * 60 * 60 * 24);
  const hasReviews = (pr.comments + pr.reviewComments) > 0;
  const hasReviewers = pr.requestedReviewers > 0;
  
  // GREEN: Ready to merge
  if (riskScore < 30 && hasReviews && daysSinceUpdate < 2) {
    return { 
      status: 'ready', 
      color: '#10b981', 
      bgClass: 'bg-green-900/30 border-green-700',
      icon: '✓', 
      label: 'Ready to Merge',
      description: 'Low risk, reviewed, and active'
    };
  }
  
  // YELLOW: Needs attention
  if (riskScore < 60 && (hasReviews || hasReviewers)) {
    return { 
      status: 'caution', 
      color: '#f59e0b', 
      bgClass: 'bg-yellow-900/30 border-yellow-700',
      icon: '⚠', 
      label: 'Review Carefully',
      description: 'Moderate risk, needs thorough review'
    };
  }
  
  // RED: Block merge
  return { 
    status: 'block', 
    color: '#ef4444', 
    bgClass: 'bg-red-900/30 border-red-700',
    icon: '✋', 
    label: 'Not Ready',
    description: 'High risk or needs review'
  };
};

// 🆕 NEW: Check if PR is stale
export const isStale = (updatedAt, days = 7) => {
  const daysSinceUpdate = (new Date() - new Date(updatedAt)) / (1000 * 60 * 60 * 24);
  return daysSinceUpdate > days;
};

// 🆕 NEW: Get PR size category
export const getPRSizeCategory = (additions, deletions) => {
  const total = additions + deletions;
  if (total < 50) return { label: 'Tiny', color: '#10b981', emoji: '🔹' };
  if (total < 200) return { label: 'Small', color: '#3b82f6', emoji: '📘' };
  if (total < 500) return { label: 'Medium', color: '#f59e0b', emoji: '📙' };
  if (total < 1000) return { label: 'Large', color: '#ef4444', emoji: '📕' };
  return { label: 'Huge', color: '#dc2626', emoji: '📚' };
};

// Truncate text
export const truncate = (text, length = 50) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

// Parse repo full name
export const parseRepoName = (fullName) => {
  if (!fullName || !fullName.includes('/')) return { owner: '', repo: '' };
  const [owner, repo] = fullName.split('/');
  return { owner, repo };
};