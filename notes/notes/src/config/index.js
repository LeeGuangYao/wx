require('dotenv').config();
const path = require('path');

function parseBool(value, defaultValue) {
  if (value == null || value === '') return defaultValue;
  return String(value).toLowerCase() !== 'false';
}

function parsePositiveNumber(value, defaultValue) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : defaultValue;
}

const config = {
  port: Number(process.env.PORT) || 3175,
  dbPath: path.resolve(process.env.DB_PATH || './data/notes.db'),
  auth: {
    enabled: parseBool(process.env.NOTES_AUTH_ENABLED, true),
    username: process.env.NOTES_AUTH_USERNAME || '',
    password: process.env.NOTES_AUTH_PASSWORD || '',
    sessionSecret: process.env.NOTES_SESSION_SECRET || '',
    sessionDays: parsePositiveNumber(process.env.NOTES_SESSION_DAYS, 30),
    cookieName: 'notes_session',
  },
};

function validateAuthConfig() {
  if (!config.auth.enabled) return;

  const missing = [];
  if (!config.auth.username) missing.push('NOTES_AUTH_USERNAME');
  if (!config.auth.password) missing.push('NOTES_AUTH_PASSWORD');
  if (!config.auth.sessionSecret) missing.push('NOTES_SESSION_SECRET');

  if (missing.length > 0) {
    throw new Error(`鉴权已开启，但缺少环境变量：${missing.join(', ')}`);
  }

  if (config.auth.sessionSecret.length < 32) {
    throw new Error('NOTES_SESSION_SECRET 至少需要 32 个字符');
  }
}

config.validateAuthConfig = validateAuthConfig;

module.exports = config;
