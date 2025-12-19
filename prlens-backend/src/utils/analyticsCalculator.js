/**
 * Analytics Calculator
 * Computes repository-wide metrics and trends
 */

class AnalyticsCalculator {
  /**
   * Calculate comprehensive repository analytics
   * @param {Array} prs - Array of pull requests
   * @returns {Object} - Analytics data
   */
  static calculateRepoAnalytics(prs) {
    if (!prs || prs.length === 0) {
      return this.getEmptyAnalytics();
    }

    const openPRs = prs.filter(pr => pr.state === 'open');
    const closedPRs = prs.filter(pr => pr.state === 'closed');
    const mergedPRs = closedPRs.filter(pr => pr.merged_at);

    return {
      overview: this.calculateOverview(prs, openPRs, mergedPRs),
      sizeMetrics: this.calculateSizeMetrics(prs),
      reviewMetrics: this.calculateReviewMetrics(prs),
      timeMetrics: this.calculateTimeMetrics(mergedPRs),
      riskDistribution: this.calculateRiskDistribution(openPRs),
      trends: this.calculateTrends(prs),
    };
  }

  /**
   * Calculate overview statistics
   */
  static calculateOverview(allPRs, openPRs, mergedPRs) {
    return {
      totalPRs: allPRs.length,
      openPRs: openPRs.length,
      mergedPRs: mergedPRs.length,
      averageSize: this.calculateAverage(allPRs, pr => pr.additions + pr.deletions),
      mergeRate: allPRs.length > 0 ? ((mergedPRs.length / allPRs.length) * 100).toFixed(1) : 0,
    };
  }

  /**
   * Calculate size-related metrics
   */
  static calculateSizeMetrics(prs) {
    const sizes = prs.map(pr => pr.additions + pr.deletions);
    const fileCounts = prs.map(pr => pr.changed_files);

    return {
      averageLines: Math.round(this.calculateAverage(prs, pr => pr.additions + pr.deletions)),
      medianLines: this.calculateMedian(sizes),
      averageFiles: Math.round(this.calculateAverage(prs, pr => pr.changed_files)),
      medianFiles: this.calculateMedian(fileCounts),
      largestPR: Math.max(...sizes),
      smallestPR: Math.min(...sizes),
    };
  }

  /**
   * Calculate review-related metrics
   */
  static calculateReviewMetrics(prs) {
    const prsWithReviews = prs.filter(pr => (pr.comments + pr.review_comments) > 0);
    const totalComments = prs.reduce((sum, pr) => sum + pr.comments + pr.review_comments, 0);

    return {
      averageComments: (totalComments / prs.length).toFixed(1),
      reviewRate: ((prsWithReviews.length / prs.length) * 100).toFixed(1),
      prsWithoutReview: prs.length - prsWithReviews.length,
      totalComments,
    };
  }

  /**
   * Calculate time-related metrics
   */
  static calculateTimeMetrics(mergedPRs) {
    if (mergedPRs.length === 0) {
      return {
        averageTimeToMerge: 0,
        medianTimeToMerge: 0,
        fastestMerge: 0,
        slowestMerge: 0,
      };
    }

    const mergeTimes = mergedPRs.map(pr => {
      const created = new Date(pr.created_at);
      const merged = new Date(pr.merged_at);
      return (merged - created) / (1000 * 60 * 60); // hours
    });

    return {
      averageTimeToMerge: this.formatHours(this.calculateAverage(mergedPRs, (pr) => {
        const created = new Date(pr.created_at);
        const merged = new Date(pr.merged_at);
        return (merged - created) / (1000 * 60 * 60);
      })),
      medianTimeToMerge: this.formatHours(this.calculateMedian(mergeTimes)),
      fastestMerge: this.formatHours(Math.min(...mergeTimes)),
      slowestMerge: this.formatHours(Math.max(...mergeTimes)),
    };
  }

  /**
   * Calculate risk distribution for open PRs
   */
  static calculateRiskDistribution(openPRs) {
    const RiskCalculator = require('./riskCalculator');
    
    const distribution = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    openPRs.forEach(pr => {
      const risk = RiskCalculator.calculateRiskScore(pr);
      distribution[risk.level]++;
    });

    return distribution;
  }

  /**
   * Calculate trends over time
   */
  static calculateTrends(prs) {
    const last30Days = prs.filter(pr => {
      const created = new Date(pr.created_at);
      const daysAgo = (new Date() - created) / (1000 * 60 * 60 * 24);
      return daysAgo <= 30;
    });

    const last7Days = prs.filter(pr => {
      const created = new Date(pr.created_at);
      const daysAgo = (new Date() - created) / (1000 * 60 * 60 * 24);
      return daysAgo <= 7;
    });

    return {
      prsLast30Days: last30Days.length,
      prsLast7Days: last7Days.length,
      averageSizeLast30Days: Math.round(
        this.calculateAverage(last30Days, pr => pr.additions + pr.deletions)
      ),
    };
  }

  /**
   * Helper: Calculate average
   */
  static calculateAverage(items, selector) {
    if (items.length === 0) return 0;
    const sum = items.reduce((acc, item) => acc + selector(item), 0);
    return sum / items.length;
  }

  /**
   * Helper: Calculate median
   */
  static calculateMedian(numbers) {
    if (numbers.length === 0) return 0;
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  /**
   * Helper: Format hours to readable string
   */
  static formatHours(hours) {
    if (hours < 24) {
      return `${hours.toFixed(1)}h`;
    }
    const days = Math.floor(hours / 24);
    const remainingHours = Math.round(hours % 24);
    return `${days}d ${remainingHours}h`;
  }

  /**
   * Helper: Get empty analytics structure
   */
  static getEmptyAnalytics() {
    return {
      overview: {
        totalPRs: 0,
        openPRs: 0,
        mergedPRs: 0,
        averageSize: 0,
        mergeRate: 0,
      },
      sizeMetrics: {
        averageLines: 0,
        medianLines: 0,
        averageFiles: 0,
        medianFiles: 0,
        largestPR: 0,
        smallestPR: 0,
      },
      reviewMetrics: {
        averageComments: 0,
        reviewRate: 0,
        prsWithoutReview: 0,
        totalComments: 0,
      },
      timeMetrics: {
        averageTimeToMerge: 0,
        medianTimeToMerge: 0,
        fastestMerge: 0,
        slowestMerge: 0,
      },
      riskDistribution: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
      },
      trends: {
        prsLast30Days: 0,
        prsLast7Days: 0,
        averageSizeLast30Days: 0,
      },
    };
  }
}

module.exports = AnalyticsCalculator;
