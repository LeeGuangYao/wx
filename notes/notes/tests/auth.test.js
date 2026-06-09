const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { after, before, test } = require('node:test');

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'notes-auth-test-'));

process.env.DB_PATH = path.join(tempDir, 'notes.db');
process.env.NOTES_AUTH_ENABLED = 'true';
process.env.NOTES_AUTH_USERNAME = 'owner';
process.env.NOTES_AUTH_PASSWORD = 'secret-password';
process.env.NOTES_SESSION_SECRET = 'test-session-secret-at-least-32-chars';
process.env.NOTES_SESSION_DAYS = '30';

const migrate = require('../src/db/migrate');
const app = require('../src/app');

let server;
let baseUrl;

function getCookie(setCookieHeader) {
  assert.ok(setCookieHeader, 'expected Set-Cookie header');
  return setCookieHeader.split(';')[0];
}

async function request(pathname, options = {}) {
  const res = await fetch(`${baseUrl}${pathname}`, options);
  const json = await res.json();
  return { res, json };
}

before(async () => {
  migrate();
  server = http.createServer(app);
  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('rejects unauthenticated note API access', async () => {
  const { res, json } = await request('/api/notes');

  assert.equal(res.status, 401);
  assert.equal(json.code, 401);
  assert.equal(json.message, '未登录');
});

test('rejects invalid login credentials', async () => {
  const { res, json } = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'owner', password: 'wrong' }),
  });

  assert.equal(res.status, 401);
  assert.equal(json.code, 401);
  assert.equal(json.message, '用户名或密码错误');
});

test('blocks an IP for a day after five failed login attempts', async () => {
  const headers = {
    'Content-Type': 'application/json',
    'X-Forwarded-For': '203.0.113.10',
  };

  for (let i = 0; i < 5; i += 1) {
    const attempt = await request('/api/auth/login', {
      method: 'POST',
      headers,
      body: JSON.stringify({ username: 'owner', password: `wrong-${i}` }),
    });

    assert.equal(attempt.res.status, 401);
    assert.equal(attempt.json.code, 401);
  }

  const blocked = await request('/api/auth/login', {
    method: 'POST',
    headers,
    body: JSON.stringify({ username: 'owner', password: 'secret-password' }),
  });

  assert.equal(blocked.res.status, 429);
  assert.equal(blocked.json.code, 429);
  assert.equal(blocked.json.message, '密码错误次数过多，请明天再试');

  const otherIp = await request('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Forwarded-For': '203.0.113.11',
    },
    body: JSON.stringify({ username: 'owner', password: 'secret-password' }),
  });

  assert.equal(otherIp.res.status, 200);
  assert.equal(otherIp.json.code, 0);
});

test('allows note API access after login and clears client session on logout', async () => {
  const login = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'owner', password: 'secret-password' }),
  });

  assert.equal(login.res.status, 200);
  assert.equal(login.json.code, 0);
  assert.equal(login.json.data.authenticated, true);

  const cookie = getCookie(login.res.headers.get('set-cookie'));

  const session = await request('/api/auth/session', {
    headers: { Cookie: cookie },
  });

  assert.equal(session.res.status, 200);
  assert.equal(session.json.code, 0);
  assert.equal(session.json.data.authenticated, true);
  assert.equal(session.json.data.username, 'owner');

  const notes = await request('/api/notes', {
    headers: { Cookie: cookie },
  });

  assert.equal(notes.res.status, 200);
  assert.equal(notes.json.code, 0);
  assert.ok(Array.isArray(notes.json.data));

  const logout = await request('/api/auth/logout', {
    method: 'POST',
    headers: { Cookie: cookie },
  });

  assert.equal(logout.res.status, 200);
  assert.equal(logout.json.code, 0);
  assert.match(logout.res.headers.get('set-cookie'), /notes_session=;/);
  assert.match(logout.res.headers.get('set-cookie'), /Expires=Thu, 01 Jan 1970/);

  const afterLogout = await request('/api/notes');

  assert.equal(afterLogout.res.status, 401);
  assert.equal(afterLogout.json.code, 401);
});

test('returns 404 for common scanner paths before SPA fallback', async () => {
  const res = await fetch(`${baseUrl}/.env`);
  const body = await res.text();

  assert.equal(res.status, 404);
  assert.equal(body, 'Not found');
  assert.equal(res.headers.get('x-powered-by'), null);
});
