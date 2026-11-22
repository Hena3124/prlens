const test = require('node:test');
const assert = require('node:assert/strict');
const RiskCalculator = require('../src/utils/riskCalculator');

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n) => new Date(Date.now() - n * DAY).toISOString();

// A full PR object, shaped like GET /repos/{owner}/{repo}/pulls/{number}
const pr = (overrides = {}) => ({
  number: 1,
  additions: 40,
  deletions: 10,
  changed_files: 2,
  comments: 1,
  review_comments: 1,
  requested_reviewers: [{}, {}, {}],
  created_at: daysAgo(0.5),
  updated_at: daysAgo(0.2),
  ...overrides,
});

test('small, well-reviewed, fresh PR is low risk', () => {
  const r = RiskCalculator.calculateRiskScore(pr());
  // every factor at its lowest step: 0.1 across the board -> 10
  assert.equal(r.score, 10);
  assert.equal(r.level, 'low');
  assert.deepEqual(r.recommendations, []);
});

test('large, unreviewed, stale PR is critical', () => {
  const r = RiskCalculator.calculateRiskScore(
    pr({ additions: 1500, deletions: 200, changed_files: 40, comments: 0, review_comments: 0,
         requested_reviewers: [], updated_at: daysAgo(20), created_at: daysAgo(30) })
  );
  // 0.95*25 + 0.9*20 + 0.9*25 + 0.9*15 + 0.95*15 = 92
  assert.equal(r.score, 92);
  assert.equal(r.level, 'critical');
  const types = r.recommendations.map((x) => x.type).sort();
  assert.deepEqual(types, ['complexity', 'review', 'reviewers', 'size', 'staleness']);
});

test('size thresholds', () => {
  const f = (lines) => RiskCalculator.calculateSizeFactor({ additions: lines, deletions: 0 });
  assert.equal(f(99), 0.1);
  assert.equal(f(100), 0.3);
  assert.equal(f(499), 0.5);
  assert.equal(f(999), 0.7);
  assert.equal(f(1000), 0.95);
});

test('review density is comments per 100 changed lines', () => {
  const f = (c, lines) => RiskCalculator.calculateReviewActivityFactor(
    { additions: lines, deletions: 0, comments: c, review_comments: 0 });
  assert.equal(f(3, 100), 0.1);   // 3 per 100
  assert.equal(f(1, 100), 0.5);   // exactly 1 per 100 is not > 1, so the 0.5 band
  assert.equal(f(0.3, 100), 0.7);
  assert.equal(f(0, 100), 0.9);
});

test('reviewer factor counts requested reviewers', () => {
  const f = (n) => RiskCalculator.calculateReviewerCountFactor({ requested_reviewers: Array(n).fill({}) });
  assert.deepEqual([0, 1, 2, 3].map(f), [0.95, 0.6, 0.3, 0.1]);
});

test('level boundaries', () => {
  assert.deepEqual([29, 30, 49, 50, 69, 70].map((s) => RiskCalculator.getRiskLevel(s)),
    ['low', 'medium', 'medium', 'high', 'high', 'critical']);
});

test('regression: a list-endpoint PR (no size fields) is rejected, not scored as max risk', () => {
  // This is the shape GitHub returns from GET /repos/{owner}/{repo}/pulls.
  const listShaped = { number: 7, created_at: daysAgo(1), updated_at: daysAgo(1), requested_reviewers: [] };
  assert.throws(() => RiskCalculator.calculateRiskScore(listShaped), /missing size\/comment fields/);
});
