# PRLens

**See which open pull requests are most likely to cause trouble, and why, before they're merged.**

PRLens signs in with your GitHub account, pulls the open pull requests for any repository you can access, and gives each one a 0–100 risk score. Every score comes with the factors behind it and specific next steps, like "Consider breaking this PR into smaller chunks" or "No reviewers assigned - add at least 2 reviewers". A merge-readiness indicator flags what's on track, what needs attention and what's gone stale. A repository analytics view shows how the team reviews code over time.

<!-- Add a screenshot of the dashboard here: ![PRLens dashboard](docs/dashboard.png) -->

## How the risk score works

Each pull request is scored on five factors. Each factor maps to a value between 0 and 1 using fixed thresholds, and then the factors are weighted:

| Factor | Weight | Measured as | Low risk → high risk |
|---|---|---|---|
| Size | 25% | Lines added + deleted | under 100 lines (0.1) → 1,000+ lines (0.95) |
| Review activity | 25% | Comments per 100 changed lines | over 2 (0.1) → almost none (0.9) |
| Complexity | 20% | Files changed | 3 or fewer (0.1) → over 25 (0.9) |
| Staleness | 15% | Days since last update | under 1 day (0.1) → 14+ days (0.9) |
| Reviewers | 15% | Reviewers requested | 3+ (0.1) → none (0.95) |

`score = 100 × Σ weight × factor`, capped at 100, and then labelled: **low** (under 30), **medium** (30–49), **high** (50–69) or **critical** (70+).

The thresholds are deliberately simple and readable. Every number in a score can be traced back to something visible on the pull request, so a reviewer can argue with it.

## Repository analytics

Computed across a repository's pull requests:
- **Overview:** total, open and merged pull requests, and the merge rate
- **Size:** average and median lines and files changed, plus the largest and smallest pull request
- **Review:** average comments, the share of pull requests that got any review, and the number merged with none
- **Speed:** time to merge (average, median, fastest, slowest)
- **Risk distribution** of currently open pull requests, and trends over time

## Architecture

```
frontend/         React 18 · React Router · Tailwind CSS · Recharts
prlens-backend/   Node.js · Express
  src/services/   GitHub REST API client (OAuth token exchange, repos, PRs, reviews, comments)
  src/utils/      riskCalculator.js · analyticsCalculator.js
  src/routes/, src/controllers/, src/middleware/
```

Security: GitHub OAuth, helmet, and express-rate-limit (100 requests per 15 minutes per IP).

## Run it locally

1. Create a GitHub OAuth app. Set the callback URL to `http://localhost:5000/api/auth/github/callback`.
2. Create `prlens-backend/.env`:
   ```
   GITHUB_CLIENT_ID=...
   GITHUB_CLIENT_SECRET=...
   GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback
   FRONTEND_URL=http://localhost:3000
   SESSION_SECRET=<any long random string>
   ```
3. Start both apps:
   ```bash
   cd prlens-backend && npm install && npm run dev     # http://localhost:5000
   cd frontend && npm install && npm start             # http://localhost:3000
   ```

API endpoints are listed in [`prlens-backend/README.md`](prlens-backend/README.md).

## Limitations and next steps

- **Weights are hand-set, not learned.** The next step is to fit them on historical pull requests that were later reverted or needed follow-up fixes, then check whether the score actually predicts trouble.
- **The reviewer factor counts requested reviewers,** not completed reviews. Counting approvals would be a better signal.
- **Run it where the work happens:** as a GitHub Action that comments the score on each new pull request.
- No automated tests yet.

## License

MIT
