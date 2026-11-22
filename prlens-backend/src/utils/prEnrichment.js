/**
 * Pull request enrichment
 *
 * GitHub's "list pull requests" endpoint does NOT return additions,
 * deletions, changed_files, comments or review_comments. Those fields only
 * exist on the single-PR endpoint (GET /repos/{owner}/{repo}/pulls/{number}).
 * Scoring list results directly made every PR look maximally risky, so every
 * PR is fetched in full before it is scored or used in analytics.
 */

const SIZE_FIELDS = ['additions', 'deletions', 'changed_files', 'comments', 'review_comments'];

/** True if a PR object carries the fields the risk model needs. */
function hasFullDetails(pr) {
  return SIZE_FIELDS.every((field) => typeof pr[field] === 'number');
}

/**
 * Run an async function over items with at most `limit` calls in flight,
 * preserving input order in the result.
 */
async function mapWithConcurrency(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index], index);
    }
  });
  await Promise.all(workers);
  return results;
}

/**
 * Small cache of full PR objects. The key includes updated_at, so any change
 * to a PR on GitHub produces a new key and a fresh fetch.
 */
class DetailCache {
  constructor(maxEntries = 2000) {
    this.maxEntries = maxEntries;
    this.map = new Map();
  }

  key(owner, repo, pr) {
    return `${owner}/${repo}#${pr.number}@${pr.updated_at}`;
  }

  get(k) {
    return this.map.get(k);
  }

  set(k, value) {
    if (this.map.size >= this.maxEntries) {
      // Drop the oldest entry (Map keeps insertion order).
      this.map.delete(this.map.keys().next().value);
    }
    this.map.set(k, value);
  }
}

/**
 * Replace list-endpoint PR objects with full PR objects.
 * @param {Array} prs - PRs from the list endpoint
 * @param {Function} fetchDetails - async (prNumber) => full PR object
 * @param {Object} opts - { owner, repo, cache, concurrency }
 */
async function enrichPullRequests(prs, fetchDetails, opts = {}) {
  const { owner = '', repo = '', cache = null, concurrency = 6 } = opts;
  return mapWithConcurrency(prs, concurrency, async (pr) => {
    if (hasFullDetails(pr)) return pr;
    const k = cache ? cache.key(owner, repo, pr) : null;
    if (cache && cache.get(k)) return cache.get(k);
    const full = await fetchDetails(pr.number);
    if (cache) cache.set(k, full);
    return full;
  });
}

module.exports = { hasFullDetails, mapWithConcurrency, enrichPullRequests, DetailCache };
