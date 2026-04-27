const { fail } = require('../utils/response');

function errorHandler(err, req, res, _next) {
  if (err && err.status) {
    return res.status(err.status).json(fail(err.message, err.status));
  }
  console.error('[error]', err);
  return res.status(500).json(fail(err.message || '服务器内部错误', 500));
}

function notFound(_req, res) {
  res.status(404).json(fail('接口不存在', 404));
}

module.exports = { errorHandler, notFound };
