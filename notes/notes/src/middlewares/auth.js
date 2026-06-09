const config = require('../config');
const { getSessionFromRequest } = require('../utils/session-token');
const { fail } = require('../utils/response');

function requireAuth(req, res, next) {
  if (!config.auth.enabled) return next();

  const session = getSessionFromRequest(req);
  if (!session) {
    return res.status(401).json(fail('未登录', 401));
  }

  req.auth = session;
  next();
}

module.exports = { requireAuth };
