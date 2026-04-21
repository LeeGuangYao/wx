const { BASE_URL } = require('../config')

// 拉取底部菜单权限；失败或接口异常时返回空数组，
// 组件侧据此默认隐藏所有 tab（避免审核时意外暴露）。
function getTabs() {
  return new Promise((resolve) => {
    wx.request({
      url: `${BASE_URL}/api/config`,
      method: 'GET',
      timeout: 8000,
      success(res) {
        const body = res.data
        if (res.statusCode >= 200 && res.statusCode < 300 && body && body.code === 0) {
          const tabs = body.data && Array.isArray(body.data.tabs) ? body.data.tabs : []
          resolve(tabs)
        } else {
          resolve([])
        }
      },
      fail() {
        resolve([])
      }
    })
  })
}

module.exports = { getTabs }
