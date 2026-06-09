const { getLoginLimit } = require('../utils/login-attempts');
const { fail } = require('../utils/response');

function blockExcessiveLoginFailures(req, res, next) {
  const limit = getLoginLimit(req);

  if (!limit.blocked) return next();

  res.set('Retry-After', String(limit.retryAfterSeconds));
  return res.status(429).json(fail('密码错误次数过多，请明天再试', 429));
}

module.exports = { blockExcessiveLoginFailures };
