const { request } = require('../utils/request')
const { BASE_URL } = require('../config')

const API_BASE = `${BASE_URL}/api/caipu`

function call(path, params = {}, { silent = false } = {}) {
  if (!silent) wx.showLoading({ title: '加载中', mask: true })
  return request(`${API_BASE}${path}`, params)
    .then((res) => {
      if (res && res.code === 200) return res.result
      const msg = (res && res.msg) || '请求失败'
      wx.showToast({ title: msg, icon: 'none' })
      return Promise.reject(new Error(msg))
    })
    .catch((err) => {
      if (!err || !err.message) {
        wx.showToast({ title: '网络异常', icon: 'none' })
      }
      return Promise.reject(err)
    })
    .finally(() => {
      if (!silent) wx.hideLoading()
    })
}

function getRecipeList(params = {}, { silent = false } = {}) {
  return call('/list', params, { silent }).then((result) => ({
    list: result.list || [],
    allnum: result.allnum || 0,
    curpage: result.curpage || 1
  }))
}

function getRecipeDetail(id) {
  return call('/detail', { id }).then((result) => (result && result.list ? result.list[0] : result))
}

function getCategories({ silent = false } = {}) {
  return call('/category', {}, { silent }).then((result) => Array.isArray(result) ? result : [])
}

module.exports = { getRecipeList, getRecipeDetail, getCategories }
