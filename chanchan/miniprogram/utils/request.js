function request(url, data = {}, method = 'GET') {
  return new Promise((resolve, reject) => {
    const app = getApp()
    const token = app ? app.getToken() : ''
    const header = { 'content-type': 'application/json' }
    if (token) header['Authorization'] = `Bearer ${token}`

    wx.request({
      url,
      data,
      method,
      timeout: 15000,
      header,
      success(res) {
        if (res.statusCode === 401 && app && app.login) {
          app.login()
          reject(new Error('登录已过期，正在重新登录…'))
          return
        }
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
        } else {
          reject(new Error(`HTTP ${res.statusCode}`))
        }
      },
      fail(err) {
        reject(err)
      }
    })
  })
}

module.exports = { request }
