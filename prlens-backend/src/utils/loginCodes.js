/**
 * One-time login codes
 *
 * After GitHub OAuth succeeds, the backend used to redirect to the frontend
 * with the access token in the URL, where it ends up in browser history,
 * proxy logs and server logs. Instead the token is parked here under a
 * random, single-use code that expires after 60 seconds. The frontend swaps
 * the code for the token with a POST, so the token never appears in a URL.
 */

const crypto = require('crypto');

const TTL_MS = 60 * 1000;

class LoginCodeStore {
  constructor({ ttlMs = TTL_MS, now = () => Date.now() } = {}) {
    this.ttlMs = ttlMs;
    this.now = now;
    this.codes = new Map();
  }

  /** Store a payload and return a fresh single-use code. */
  issue(payload) {
    this.sweep();
    const code = crypto.randomBytes(24).toString('hex');
    this.codes.set(code, { payload, expiresAt: this.now() + this.ttlMs });
    return code;
  }

  /** Return the payload once; the code is deleted whether or not it expired. */
  redeem(code) {
    if (typeof code !== 'string') return null;
    const entry = this.codes.get(code);
    if (!entry) return null;
    this.codes.delete(code);
    if (entry.expiresAt < this.now()) return null;
    return entry.payload;
  }

  sweep() {
    const t = this.now();
    for (const [code, entry] of this.codes) {
      if (entry.expiresAt < t) this.codes.delete(code);
    }
  }
}

module.exports = { LoginCodeStore, loginCodes: new LoginCodeStore() };
