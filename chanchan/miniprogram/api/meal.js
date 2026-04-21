const { BASE_URL } = require('../config')
const { buildMultipart } = require('../utils/multipart')

// 多文件批量提交：底层 API 单次仅支持 1 个文件，
// 业务需要一次带多张资源，这里用 wx.request + 手动拼 multipart/form-data。
function createMeal({ filePaths = [], title = '', content = '' }) {
  return new Promise((resolve, reject) => {
    if (!filePaths || !filePaths.length) {
      reject(new Error('至少选择一张\u56fe\u7247'))
      return
    }

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

    wx.request({
      url: `${BASE_URL}/api/meal/create`,
      method: 'POST',
      header: { 'content-type': payload.contentType },
      data: payload.body,
      timeout: 30000,
      success(res) {
        const body = res.data
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
    wx.request({
      url: `${BASE_URL}/api/meal/list`,
      method: 'GET',
      data: { page, pageSize },
      timeout: 15000,
      success(res) {
        const body = res.data
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
