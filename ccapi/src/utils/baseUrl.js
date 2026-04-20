// 根据当前请求推导对外 URL 前缀
// 优先级：config.baseUrl (强制覆盖) > X-Forwarded-* (反代) > req.host
const config = require('../config');

function getBaseUrl(req) {
  if (config.baseUrl) return config.baseUrl;
  // app.set('trust proxy', true) 已启用，req.protocol 会读 X-Forwarded-Proto
  return `${req.protocol}://${req.get('host')}`;
}

// 把相对路径（或绝对 URL）转成当前环境下的绝对 URL
// 兼容 DB 中遗留的绝对 URL（直接返回）
function toAbsoluteUrl(pathOrUrl, baseUrl) {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const p = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${baseUrl}${p}`;
}

module.exports = { getBaseUrl, toAbsoluteUrl };
