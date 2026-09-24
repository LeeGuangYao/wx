function getPasswordHeader() {
  try {
    const app = getApp()
    return app && app.getPasswordHeader ? app.getPasswordHeader() : {}
  } catch (e) {
    return {}
  }
}

function handlePasswordUnauthorized(res, app) {
  const body = res && res.data
  if (
    res &&
    res.statusCode === 401 &&
    body &&
    body.message === '密码验证凭证无效' &&
    app &&
    app.handlePasswordAccessExpired
  ) {
    app.handlePasswordAccessExpired()
    return true
  }
  return false
}

module.exports = { getPasswordHeader, handlePasswordUnauthorized }
