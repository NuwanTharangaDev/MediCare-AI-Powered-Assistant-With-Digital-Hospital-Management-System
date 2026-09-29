const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const optionalAuth = require('../middleware/optionalAuth');
const JWT_SECRET = require('../config/jwt');

function runMiddleware(authorization) {
  const req = {
    get: () => authorization,
    body: { userId: 9999 }
  };
  const res = {
    statusCode: null,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    }
  };
  let continued = false;
  optionalAuth(req, res, () => { continued = true; });
  return { req, res, continued };
}

test('guest requests continue without a caller-supplied identity', () => {
  const { req, continued } = runMiddleware(undefined);
  assert.equal(continued, true);
  assert.equal(req.user, null);
});

test('invalid bearer tokens are rejected', () => {
  const { res, continued } = runMiddleware('Bearer not-a-valid-token');
  assert.equal(res.statusCode, 401);
  assert.equal(continued, false);
});

test('verified identity comes from the JWT instead of the request body', () => {
  const token = jwt.sign({ id: 42, role: 'patient' }, JWT_SECRET);
  const { req, continued } = runMiddleware(`Bearer ${token}`);
  assert.equal(continued, true);
  assert.deepEqual(req.user, { id: 42, role: 'patient' });
  assert.notEqual(req.user.id, req.body.userId);
});