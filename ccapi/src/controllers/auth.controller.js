const authService = require('../services/auth.service');
const userService = require('../services/user.service');
const config = require('../config');
const { ok, fail } = require('../utils/response');

async function login(req, res, next) {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json(fail('缺少 code 参数', 400));
    }

    const { openid } = await authService.code2Session(code);
    userService.upsert(openid);
    const token = authService.signToken(openid);
    const isAdmin = config.adminOpenids.includes(openid);

    res.json(ok({ token, openid, isAdmin }, '登录成功'));
  } catch (err) {
    next(err);
  }
}

function listUsers(req, res, next) {
  try {
    if (!req.isAdmin) {
      return res.status(403).json(fail('仅管理员可访问', 403));
    }
    const users = userService.listAll();
    res.json(ok(users));
  } catch (err) {
    next(err);
  }
}

function passwordStatus(_req, res) {
  res.json(ok({ enabled: config.passwordLoginEnabled }));
}

function passwordVerify(req, res) {
  if (!config.passwordLoginEnabled) {
    return res.status(403).json(fail('密码验证未开启', 403));
  }
  const ip = req.ip || (req.socket && req.socket.remoteAddress) || 'unknown';
  if (!authService.canAttemptPassword(ip)) {
    return res.status(429).json(fail('密码尝试次数过多，请 15 分钟后重试', 429));
  }
  const password = req.body && req.body.password;
  if (!authService.verifyAppPassword(password)) {
    authService.recordPasswordFailure(ip);
    return res.status(401).json(fail('密码错误', 401));
  }
  authService.clearPasswordFailures(ip);
  const token = authService.signPasswordToken();
  return res.json(ok({ token }, '密码验证成功'));
}

module.exports = { login, listUsers, passwordStatus, passwordVerify };
