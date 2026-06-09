const SUSPICIOUS_LIMIT = 8;
const WINDOW_MS = 10 * 60 * 1000;
const BLOCK_MS = 10 * 60 * 1000;
const MAX_VISITORS = 1000;

const visitors = new Map();

function isSuspiciousPath(rawPath) {
  const pathname = String(rawPath || '').toLowerCase();

  return [
    /(^|\/)\.(env|git|svn|hg|ds_store)(\/|$)/,
    /(^|\/)(wp-admin|wp-login\.php|wordpress|phpmyadmin|pma|adminer)(\/|$)/,
    /(^|\/)(cgi-bin|vendor|node_modules|data|src|client)(\/|$)/,
    /(^|\/)(package(-lock)?\.json|server\.js|ecosystem\.config\.cjs|vite\.config\.js)(\/|$)/,
    /\.(bak|backup|old|orig|save|sql|sqlite|db|tgz|tar|gz|zip)$/i,
  ].some((pattern) => pattern.test(pathname));
}

function getVisitor(req) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();

  if (visitors.size > MAX_VISITORS) {
    for (const [key, value] of visitors) {
      if (value.expiresAt < now && value.blockedUntil < now) {
        visitors.delete(key);
      }
    }
  }

  const current = visitors.get(ip);

  if (!current || current.expiresAt < now) {
    const fresh = { count: 0, expiresAt: now + WINDOW_MS, blockedUntil: 0 };
    visitors.set(ip, fresh);
    return fresh;
  }

  return current;
}

function markSuspicious(req) {
  const visitor = getVisitor(req);
  visitor.count += 1;

  if (visitor.count >= SUSPICIOUS_LIMIT) {
    visitor.blockedUntil = Date.now() + BLOCK_MS;
  }
}

function scanProtection(req, res, next) {
  const visitor = getVisitor(req);

  if (visitor.blockedUntil > Date.now()) {
    return res.status(404).type('text/plain').send('Not found');
  }

  if (isSuspiciousPath(req.path)) {
    markSuspicious(req);
    return res.status(404).type('text/plain').send('Not found');
  }

  return next();
}

module.exports = { scanProtection, isSuspiciousPath };
