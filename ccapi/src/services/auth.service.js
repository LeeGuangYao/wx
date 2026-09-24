const https = require('https');
const jwt = require('jsonwebtoken');
const config = require('../config');

const APP_PASSWORD = '0821';
const PASSWORD_ATTEMPT_LIMIT = 10;
const PASSWORD_ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const passwordAttempts = new Map();

function code2Session(code) {
  return new Promise((resolve, reject) => {
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${config.wxAppid}&secret=${config.wxSecret}&js_code=${code}&grant_type=authorization_code`;
    https
      .get(url, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            if (data.errcode) {
              return reject(new Error(data.errmsg || '微信登录失败'));
            }
            resolve({ openid: data.openid, sessionKey: data.session_key });
          } catch (e) {
            reject(new Error('解析微信响应失败'));
          }
        });
      })
      .on('error', (err) => reject(err));
  });
}

function signToken(openid) {
  const isAdmin = config.adminOpenids.includes(openid);
  return jwt.sign({ openid, isAdmin }, config.jwtSecret, { expiresIn: '7d' });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (_e) {
    return null;
  }
}

function verifyAppPassword(password) {
  return password === APP_PASSWORD;
}

function canAttemptPassword(ip) {
  const key = String(ip || 'unknown');
  const now = Date.now();
  const attempt = passwordAttempts.get(key);
  if (!attempt || attempt.resetAt <= now) {
    passwordAttempts.set(key, { count: 0, resetAt: now + PASSWORD_ATTEMPT_WINDOW_MS });
    return true;
  }
  return attempt.count < PASSWORD_ATTEMPT_LIMIT;
}

function recordPasswordFailure(ip) {
  const key = String(ip || 'unknown');
  const now = Date.now();
  let attempt = passwordAttempts.get(key);
  if (!attempt || attempt.resetAt <= now) {
    attempt = { count: 0, resetAt: now + PASSWORD_ATTEMPT_WINDOW_MS };
  }
  attempt.count += 1;
  passwordAttempts.set(key, attempt);
}

function clearPasswordFailures(ip) {
  passwordAttempts.delete(String(ip || 'unknown'));
}

function signPasswordToken() {
  return jwt.sign({ passwordGate: true }, config.jwtSecret, { expiresIn: '7d' });
}

function verifyPasswordToken(token) {
  const payload = verifyToken(token);
  return payload && payload.passwordGate === true ? payload : null;
}

module.exports = {
  code2Session,
  signToken,
  verifyToken,
  verifyAppPassword,
  canAttemptPassword,
  recordPasswordFailure,
  clearPasswordFailures,
  signPasswordToken,
  verifyPasswordToken,
};
