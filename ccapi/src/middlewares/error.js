// 统一错误处理：multer 错误 / 业务错误 / 未知错误
const multer = require('multer');
const { fail } = require('../utils/response');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  if (err instanceof multer.MulterError) {
    return res.status(400).json(fail(`上传失败：${err.message}`, 400));
  }
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
