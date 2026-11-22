const test = require('node:test');
const assert = require('node:assert/strict');
const { enrichPullRequests, mapWithConcurrency, hasFullDetails, DetailCache } = require('../src/utils/prEnrichment');

const listPR = (n) => ({ number: n, updated_at: '2026-01-01T00:00:00Z' });
const fullPR = (n) => ({ ...listPR(n), additions: n, deletions: 0, changed_files: 1, comments: 0, review_comments: 0 });

test('list-endpoint PRs are replaced by full PRs, in order', async () => {
  const out = await enrichPullRequests([listPR(1), listPR(2), listPR(3)], async (n) => fullPR(n));
  assert.deepEqual(out.map((p) => p.number), [1, 2, 3]);
  assert.ok(out.every(hasFullDetails));
});

test('PRs that already have full details are not refetched', async () => {
  let calls = 0;
  await enrichPullRequests([fullPR(1), listPR(2)], async (n) => { calls++; return fullPR(n); });
  assert.equal(calls, 1);
});

test('concurrency limit is respected', async () => {
  let inFlight = 0, peak = 0;
  await mapWithConcurrency(Array.from({ length: 20 }, (_, i) => i), 4, async () => {
    inFlight++; peak = Math.max(peak, inFlight);
    await new Promise((r) => setTimeout(r, 5));
    inFlight--;
  });
  assert.equal(peak, 4);
});

test('cache avoids refetching an unchanged PR, refetches after an update', async () => {
  const cache = new DetailCache();
  let calls = 0;
  const fetch = async (n) => { calls++; return fullPR(n); };
  await enrichPullRequests([listPR(5)], fetch, { owner: 'o', repo: 'r', cache });
  await enrichPullRequests([listPR(5)], fetch, { owner: 'o', repo: 'r', cache });
  assert.equal(calls, 1);
  await enrichPullRequests([{ ...listPR(5), updated_at: '2026-02-01T00:00:00Z' }], fetch, { owner: 'o', repo: 'r', cache });
  assert.equal(calls, 2);
});
