// 环境配置：按小程序发布环境自动切换 BASE_URL
// envVersion:
//   develop → 开发版（开发者工具 / 真机调试）
//   trial   → 体验版
//   release → 正式版
//
// 发布前请把下方 trial / release 的 URL 改成真实线上域名（需 HTTPS，
// 并在微信公众平台 → 开发 → 服务器域名 的 uploadFile / request 合法域名中配置）。

const ENV_URLS = {
  develop: 'http://localhost:3000',
  trial: 'https://your-staging-domain.com',
  release: 'https://your-production-domain.com'
}

function resolveBaseUrl() {
  try {
    const info = wx.getAccountInfoSync()
    const envVersion = info && info.miniProgram && info.miniProgram.envVersion
    if (envVersion && ENV_URLS[envVersion]) return ENV_URLS[envVersion]
  } catch (e) {}
  return ENV_URLS.develop
}

const BASE_URL = resolveBaseUrl()

module.exports = { BASE_URL, ENV_URLS }
