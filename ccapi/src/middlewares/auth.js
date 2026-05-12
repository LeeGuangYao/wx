const authService = require('../services/auth.service');
const { fail } = require('../utils/response');

const SKIP_PATHS = ['/api/auth/login', '/api/health', '/api/caipu', '/api/config'];

function authMiddleware(req, _res, next) {
  const path = req.path;
  if (!path.startsWith('/api')) {
    return next();
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
