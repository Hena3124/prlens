const test = require('node:test');
const assert = require('node:assert/strict');
const { LoginCodeStore } = require('../src/utils/loginCodes');

test('a code can be redeemed exactly once', () => {
  const store = new LoginCodeStore();
  const code = store.issue({ token: 't' });
  assert.deepEqual(store.redeem(code), { token: 't' });
  assert.equal(store.redeem(code), null);
});

test('expired codes are rejected', () => {
  let t = 0;
  const store = new LoginCodeStore({ ttlMs: 1000, now: () => t });
  const code = store.issue({ token: 't' });
  t = 1001;
  assert.equal(store.redeem(code), null);
});

test('unknown or malformed codes are rejected', () => {
  const store = new LoginCodeStore();
  assert.equal(store.redeem('nope'), null);
  assert.equal(store.redeem(undefined), null);
});
