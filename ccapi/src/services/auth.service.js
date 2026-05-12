const https = require('https');
const jwt = require('jsonwebtoken');
const config = require('../config');

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

module.exports = { code2Session, signToken, verifyToken };
