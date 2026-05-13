const { BASE_URL, API_PATH_PREFIX } = require('../config')
const { buildMultipart } = require('../utils/multipart')

function createMeal({ filePaths = [], title = '', content = '' }) {
  return new Promise((resolve, reject) => {
    if (!filePaths || !filePaths.length) {
      reject(new Error('至少选择一张\u56fe\u7247'))
      return
    }

    const app = getApp()
    const token = app ? app.getToken() : ''

    let payload
    try {
      payload = buildMultipart(
        { title, content },
        filePaths.map((p) => ({ name: 'images', filePath: p }))
      )
    } catch (e) {
      reject(new Error('读取\u56fe\u7247失败：' + (e && e.message ? e.message : '未知错误')))
      return
    }

    const header = { 'content-type': payload.contentType }
    if (token) header['Authorization'] = `Bearer ${token}`

    wx.request({
      url: `${BASE_URL}${API_PATH_PREFIX}/api/meal/create`,
      method: 'POST',
      header,
      data: payload.body,
      timeout: 30000,
      success(res) {
        const body = res.data
        if (res.statusCode === 401 && app && app.login) {
          app.login()
          reject(new Error('登录已过期，正在重新登录…'))
          return
        }
        if (res.statusCode >= 200 && res.statusCode < 300 && body && body.code === 0) {
          resolve(body.data)
        } else {
          const msg = (body && body.message) || `\u4e0a\u4f20失败(${res.statusCode})`
          reject(new Error(msg))
        }
      },
      fail(err) {
        reject(new Error((err && err.errMsg) || '网络异常'))
      }
    })
  })
}

function listMeals({ page = 1, pageSize = 10 } = {}) {
  return new Promise((resolve, reject) => {
    const app = getApp()
    const token = app ? app.getToken() : ''
    const header = {}
    if (token) header['Authorization'] = `Bearer ${token}`

    wx.request({
      url: `${BASE_URL}${API_PATH_PREFIX}/api/meal/list`,
      method: 'GET',
      data: { page, pageSize },
      timeout: 15000,
      header,
      success(res) {
        const body = res.data
        if (res.statusCode === 401 && app && app.login) {
          app.login()
          reject(new Error('登录已过期，正在重新登录…'))
          return
        }
        if (res.statusCode >= 200 && res.statusCode < 300 && body && body.code === 0) {
          resolve(body.data)
        } else {
          reject(new Error((body && body.message) || `请求失败(${res.statusCode})`))
        }
      },
      fail(err) {
        reject(new Error((err && err.errMsg) || '网络异常'))
      }
    })
  })
}

module.exports = { createMeal, listMeals }
