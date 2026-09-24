const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test, after } = require('node:test');
const jwt = require('jsonwebtoken');

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ccapi-password-gate-'));
process.env.DB_PATH = path.join(tempDir, 'meal.db');
process.env.UPLOAD_DIR = path.join(tempDir, 'uploads');
process.env.PASSWORD_LOGIN_ENABLED = 'true';
process.env.JWT_SECRET = 'password-gate-test-secret';
fs.mkdirSync(process.env.UPLOAD_DIR, { recursive: true });

const config = require('../src/config');
const authService = require('../src/services/auth.service');
const authController = require('../src/controllers/auth.controller');
const authMiddleware = require('../src/middlewares/auth');
const authRouter = require('../src/routes/auth.route');

after(() => {
  require('../src/db').close();
  fs.rmSync(tempDir, { recursive: true, force: true });
});

function invokeAuth(pathname, headers = {}) {
  return new Promise((resolve) => {
    const req = { path: pathname, method: 'GET', headers };
    const res = {
      statusCode: 200,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(body) {
        this.body = body;
        resolve({ statusCode: this.statusCode, body, nextCalled: false });
      },
    };
    authMiddleware(req, res, () => resolve({ statusCode: 200, nextCalled: true }));
  });
}

function invokeController(handler, req = {}) {
  return new Promise((resolve, reject) => {
    const res = {
      statusCode: 200,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(body) {
        this.body = body;
        resolve({ statusCode: this.statusCode, body });
      },
    };
    try {
      handler(req, res, reject);
    } catch (error) {
      reject(error);
    }
  });
}

test('password service checks the configured code and scopes its access token', () => {
  assert.equal(typeof authService.verifyAppPassword, 'function');
  assert.equal(typeof authService.signPasswordToken, 'function');
  assert.equal(typeof authService.verifyPasswordToken, 'function');
  assert.equal(authService.verifyAppPassword('0821'), true);
  assert.equal(authService.verifyAppPassword('0000'), false);
  assert.equal(authService.verifyPasswordToken(authService.signPasswordToken()).passwordGate, true);
});

test('password status reports the server-side setting', async () => {
  assert.equal(typeof authController.passwordStatus, 'function');
  config.passwordLoginEnabled = true;
  const result = await invokeController(authController.passwordStatus);
  assert.deepEqual(result.body.data, { enabled: true });
  config.passwordLoginEnabled = false;
  const disabled = await invokeController(authController.passwordStatus);
  assert.deepEqual(disabled.body.data, { enabled: false });
  config.passwordLoginEnabled = true;
});

test('password routes expose exactly a status endpoint and a verification endpoint', () => {
  const routes = authRouter.stack
    .filter((layer) => layer.route)
    .map((layer) => ({
      path: layer.route.path,
      methods: layer.route.methods,
    }))
    .filter((route) => route.path.startsWith('/password/'));
  assert.deepEqual(
    routes.map((route) => [route.path, Object.keys(route.methods)]),
    [
      ['/password/status', ['get']],
      ['/password/verify', ['post']],
    ]
  );
});

test('password verification rejects a wrong code and returns a scoped token for the right code', async () => {
  assert.equal(typeof authController.passwordVerify, 'function');
  config.passwordLoginEnabled = true;
  const rejected = await invokeController(authController.passwordVerify, { body: { password: '0000' } });
  assert.equal(rejected.statusCode, 401);

  const accepted = await invokeController(authController.passwordVerify, { body: { password: '0821' } });
  assert.equal(accepted.statusCode, 200);
  assert.equal(authService.verifyPasswordToken(accepted.body.data.token).passwordGate, true);

  config.passwordLoginEnabled = false;
  const disabled = await invokeController(authController.passwordVerify, { body: { password: '0821' } });
  assert.equal(disabled.statusCode, 403);
  config.passwordLoginEnabled = true;
});

test('password verification limits repeated failures from one address', async () => {
  config.passwordLoginEnabled = true;
  const ip = '203.0.113.52';
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const rejected = await invokeController(authController.passwordVerify, {
      ip,
      body: { password: '0000' },
    });
    assert.equal(rejected.statusCode, 401);
  }
  const limited = await invokeController(authController.passwordVerify, {
    ip,
    body: { password: '0000' },
  });
  assert.equal(limited.statusCode, 429);
});

test('password gate rejects business API calls without a password access token', async () => {
  config.passwordLoginEnabled = true;
  const result = await invokeAuth('/api/caipu/list');
  assert.equal(result.statusCode, 401);
  assert.equal(result.nextCalled, false);
  const login = await invokeAuth('/api/auth/login', { 'content-type': 'application/json' });
  assert.equal(login.statusCode, 401);
});

test('password gate accepts only a valid password access token', async () => {
  config.passwordLoginEnabled = true;
  const token = authService.signPasswordToken();
  const accepted = await invokeAuth('/api/caipu/list', { 'x-app-access-token': token });
  assert.equal(accepted.nextCalled, true);

  const wxToken = jwt.sign({ openid: 'test-user', isAdmin: false }, config.jwtSecret, { expiresIn: '1h' });
  const rejected = await invokeAuth('/api/caipu/list', { 'x-app-access-token': wxToken });
  assert.equal(rejected.statusCode, 401);
});

test('password status and verification endpoints remain available before unlock', async () => {
  config.passwordLoginEnabled = true;
  const status = await invokeAuth('/api/auth/password/status');
  const verify = await invokeAuth('/api/auth/password/verify');
  assert.equal(status.nextCalled, true);
  assert.equal(verify.nextCalled, true);
});

test('password gate leaves APIs unchanged when disabled', async () => {
  config.passwordLoginEnabled = false;
  const result = await invokeAuth('/api/caipu/list');
  assert.equal(result.nextCalled, true);
});
