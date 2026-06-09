const config = require('../config');
const { createSessionToken, getSessionFromRequest } = require('../utils/session-token');
const { ok, fail } = require('../utils/response');

function isSecureRequest(req) {
  return req.secure || req.get('x-forwarded-proto') === 'https';
}

function cookieOptions(req, maxAge) {
  const options = {
    httpOnly: true,
    sameSite: 'lax',
    secure: isSecureRequest(req),
    path: '/',
  };

  if (maxAge != null) options.maxAge = maxAge;
  return options;
}

function login(req, res) {
  if (!config.auth.enabled) {
    return res.json(ok({ authenticated: true, username: null, authEnabled: false }));
  }

  const username = String(req.body.username || '').trim();
  const password = String(req.body.password || '');

  if (username !== config.auth.username || password !== config.auth.password) {
    return res.status(401).json(fail('用户名或密码错误', 401));
  }

  const token = createSessionToken(username);
  const maxAge = config.auth.sessionDays * 24 * 60 * 60 * 1000;

  res.cookie(config.auth.cookieName, token, cookieOptions(req, maxAge));
  return res.json(ok({ authenticated: true, username }));
}

function session(req, res) {
  if (!config.auth.enabled) {
    return res.json(ok({ authenticated: true, username: null, authEnabled: false }));
  }

  const data = getSessionFromRequest(req);
  if (!data) {
    return res.json(ok({ authenticated: false }));
  }

  return res.json(ok({ authenticated: true, username: data.username }));
}

function logout(req, res) {
  res.clearCookie(config.auth.cookieName, cookieOptions(req));
  return res.json(ok({ authenticated: false }, '已退出'));
}

module.exports = { login, session, logout };
