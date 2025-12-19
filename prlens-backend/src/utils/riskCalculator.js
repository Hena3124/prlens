/**
 * PRLens Risk Calculator
 * Calculates risk score and health indicators for pull requests
 */

class RiskCalculator {
  /**
   * Calculate comprehensive risk score for a PR
   * @param {Object} pr - Pull request data from GitHub API
   * @returns {Object} - Risk analysis with score and factors
   */
  static calculateRiskScore(pr) {
    const factors = {
      size: this.calculateSizeFactor(pr),
      complexity: this.calculateComplexityFactor(pr),
      reviewActivity: this.calculateReviewActivityFactor(pr),
      staleness: this.calculateStalenessFactor(pr),
      reviewerCount: this.calculateReviewerCountFactor(pr),
    };

    // Weighted risk score (0-100)
    const weights = {
      size: 0.25,
      complexity: 0.20,
      reviewActivity: 0.25,
      staleness: 0.15,
      reviewerCount: 0.15,
    };

    const riskScore = Math.round(
      factors.size * weights.size * 100 +
      factors.complexity * weights.complexity * 100 +
      factors.reviewActivity * weights.reviewActivity * 100 +
      factors.staleness * weights.staleness * 100 +
      factors.reviewerCount * weights.reviewerCount * 100
    );

    return {
      score: Math.min(riskScore, 100),
      level: this.getRiskLevel(riskScore),
      factors,
      recommendations: this.generateRecommendations(factors, pr),
    };
  }

  /**
   * Size Factor: Based on lines changed
   * Small PRs are low risk, large PRs are high risk
   */
  static calculateSizeFactor(pr) {
    const totalLines = pr.additions + pr.deletions;
    
    if (totalLines < 100) return 0.1;
    if (totalLines < 300) return 0.3;
    if (totalLines < 500) return 0.5;
    if (totalLines < 1000) return 0.7;
    return 0.95;
  }

  /**
   * Complexity Factor: Based on files changed
   * More files = more complexity = higher risk
   */
  static calculateComplexityFactor(pr) {
    const fileCount = pr.changed_files;
    
    if (fileCount <= 3) return 0.1;
    if (fileCount <= 7) return 0.3;
    if (fileCount <= 15) return 0.5;
    if (fileCount <= 25) return 0.7;
    return 0.9;
  }

  /**
   * Review Activity Factor: Based on comments and reviews
   * Low activity = high risk (not being scrutinized)
   */
  static calculateReviewActivityFactor(pr) {
    const totalLines = pr.additions + pr.deletions;
    const comments = pr.comments || 0;
    const reviewComments = pr.review_comments || 0;
    const totalComments = comments + reviewComments;
    
    // Calculate comment density (comments per 100 lines)
    const commentDensity = totalLines > 0 ? (totalComments / totalLines) * 100 : 0;
    
    // Low comment density = high risk
    if (commentDensity > 2) return 0.1; // Very active review
    if (commentDensity > 1) return 0.3; // Good review activity
    if (commentDensity > 0.5) return 0.5; // Moderate activity
    if (commentDensity > 0.1) return 0.7; // Low activity
    return 0.9; // Very low or no activity
  }

  /**
   * Staleness Factor: Based on age without activity
   * Old PRs without updates are risky
   */
  static calculateStalenessFactor(pr) {
    const created = new Date(pr.created_at);
    const updated = new Date(pr.updated_at);
    const now = new Date();
    
    const daysSinceUpdate = (now - updated) / (1000 * 60 * 60 * 24);
    
    if (daysSinceUpdate < 1) return 0.1;
    if (daysSinceUpdate < 3) return 0.3;
    if (daysSinceUpdate < 7) return 0.5;
    if (daysSinceUpdate < 14) return 0.7;
    return 0.9;
  }

  /**
   * Reviewer Count Factor: Based on number of reviewers
   * No reviewers = high risk
   */
  static calculateReviewerCountFactor(pr) {
    const reviewerCount = pr.requested_reviewers?.length || 0;
    
    if (reviewerCount >= 3) return 0.1;
    if (reviewerCount === 2) return 0.3;
    if (reviewerCount === 1) return 0.6;
    return 0.95; // No reviewers
  }

  /**
   * Get risk level label
   */
  static getRiskLevel(score) {
    if (score < 30) return 'low';
    if (score < 50) return 'medium';
    if (score < 70) return 'high';
    return 'critical';
  }

  /**
   * Generate actionable recommendations
   */
  static generateRecommendations(factors, pr) {
    const recommendations = [];

    if (factors.size > 0.6) {
      recommendations.push({
        type: 'size',
        message: 'Consider breaking this PR into smaller chunks',
        severity: 'high',
      });
    }

    if (factors.complexity > 0.6) {
      recommendations.push({
        type: 'complexity',
        message: `${pr.changed_files} files changed - consider splitting by feature/module`,
        severity: 'medium',
      });
    }

    if (factors.reviewActivity > 0.6) {
      recommendations.push({
        type: 'review',
        message: 'Low review activity detected - request specific reviewers',
        severity: 'high',
      });
    }

    if (factors.staleness > 0.6) {
      recommendations.push({
        type: 'staleness',
        message: 'PR has been inactive - consider rebasing or closing',
        severity: 'medium',
      });
    }

    if (factors.reviewerCount > 0.8) {
      recommendations.push({
        type: 'reviewers',
        message: 'No reviewers assigned - add at least 2 reviewers',
        severity: 'critical',
      });
    }

    return recommendations;
  }

  /**
   * Calculate health status for a PR
   */
  static getHealthStatus(riskScore, pr) {
    const daysSinceCreated = (new Date() - new Date(pr.created_at)) / (1000 * 60 * 60 * 24);
    
    if (riskScore < 30 && daysSinceCreated < 3) {
      return {
        status: 'healthy',
        color: '#10b981',
        icon: '✓',
        description: 'PR is on track for merge',
      };
    }
    
    if (riskScore < 50 && daysSinceCreated < 7) {
      return {
        status: 'at-risk',
        color: '#f59e0b',
        icon: '⚠',
        description: 'PR needs attention',
      };
    }
    
    if (daysSinceCreated > 14) {
      return {
        status: 'stale',
        color: '#6b7280',
        icon: '⏱',
        description: 'PR has been open too long',
      };
    }
    
    return {
      status: 'critical',
      color: '#ef4444',
      icon: '⚠',
      description: 'PR requires immediate attention',
    };
  }
}

module.exports = RiskCalculator;
