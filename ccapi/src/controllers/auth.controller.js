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

module.exports = { login, listUsers };
