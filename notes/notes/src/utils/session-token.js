const crypto = require('crypto');
const config = require('../config');

function sign(value) {
  return crypto
    .createHmac('sha256', config.auth.sessionSecret)
    .update(value)
    .digest('base64url');
}

function safeEqual(a, b) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function createSessionToken(username) {
  const expiresAt = Date.now() + config.auth.sessionDays * 24 * 60 * 60 * 1000;
  const payload = Buffer.from(JSON.stringify({ username, expiresAt })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return null;

  const [payload, signature] = token.split('.');
  if (!payload || !signature || token.split('.').length !== 2) return null;

  if (!safeEqual(signature, sign(payload))) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!session.username || !session.expiresAt || session.expiresAt < Date.now()) {
      return null;
    }
    return session;
  } catch (_err) {
    return null;
  }
}

function getCookie(header, name) {
  if (!header) return null;

  for (const part of header.split(';')) {
    const index = part.indexOf('=');
    if (index === -1) continue;

    const key = part.slice(0, index).trim();
    if (key !== name) continue;

    const value = part.slice(index + 1).trim();
    try {
      return decodeURIComponent(value);
    } catch (_err) {
      return value;
    }
  }

  return null;
}

function getSessionFromRequest(req) {
  if (!config.auth.enabled) {
    return { username: null, expiresAt: null };
  }

  const token = getCookie(req.headers.cookie, config.auth.cookieName);
  return verifySessionToken(token);
}

module.exports = {
  createSessionToken,
  getSessionFromRequest,
};
