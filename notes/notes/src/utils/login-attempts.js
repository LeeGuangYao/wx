const MAX_FAILED_ATTEMPTS = 5;
const WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_VISITORS = 1000;

const attempts = new Map();

function getClientIp(req) {
  return req.ip || req.socket.remoteAddress || 'unknown';
}

function pruneExpired(now) {
  if (attempts.size <= MAX_VISITORS) return;

  for (const [ip, entry] of attempts) {
    if (entry.expiresAt < now) {
      attempts.delete(ip);
    }
  }
}

function getEntry(ip, now) {
  const current = attempts.get(ip);

  if (!current || current.expiresAt < now) {
    const fresh = { count: 0, expiresAt: now + WINDOW_MS };
    attempts.set(ip, fresh);
    return fresh;
  }

  return current;
}

function getLoginLimit(req) {
  const now = Date.now();
  pruneExpired(now);

  const entry = getEntry(getClientIp(req), now);
  return {
    blocked: entry.count >= MAX_FAILED_ATTEMPTS,
    count: entry.count,
    max: MAX_FAILED_ATTEMPTS,
    retryAfterSeconds: Math.max(1, Math.ceil((entry.expiresAt - now) / 1000)),
  };
}

function recordFailedLogin(req) {
  const now = Date.now();
  pruneExpired(now);

  const entry = getEntry(getClientIp(req), now);
  entry.count += 1;
  return entry.count;
}

function clearLoginFailures(req) {
  attempts.delete(getClientIp(req));
}

module.exports = {
  clearLoginFailures,
  getLoginLimit,
  recordFailedLogin,
};
