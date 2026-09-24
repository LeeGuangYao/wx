const authService = require('../services/auth.service');
const config = require('../config');
const { fail } = require('../utils/response');

const PASSWORD_GATE_EXEMPT_PATHS = [
  '/api/health',
  '/api/auth/password/status',
  '/api/auth/password/verify',
];
const SKIP_PATHS = [
  ...PASSWORD_GATE_EXEMPT_PATHS,
  '/api/auth/login',
  '/api/caipu',
  '/api/config',
  '/api/meal',
];

function authMiddleware(req, _res, next) {
  const path = req.path;
  if (!path.startsWith('/api')) {
    return next();
  }

  if (config.passwordLoginEnabled && !PASSWORD_GATE_EXEMPT_PATHS.includes(path)) {
    const passwordToken = req.headers['x-app-access-token'] || '';
    const passwordPayload = authService.verifyPasswordToken(passwordToken);
    if (!passwordPayload) {
      return _res.status(401).json(fail('密码验证凭证无效', 401));
    }
    req.passwordVerified = true;
  }

  if (SKIP_PATHS.some((p) => path === p || path.startsWith(p + '/'))) {
    return next();
  }

  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) {
    return _res.status(401).json(fail('未登录', 401));
  }

  const payload = authService.verifyToken(token);
  if (!payload) {
    return _res.status(401).json(fail('登录已过期，请重新登录', 401));
  }

  req.openid = payload.openid;
  req.isAdmin = !!payload.isAdmin;
  next();
}

module.exports = authMiddleware;
