const { request } = require('../utils/request')

const BASE_URL = 'https://apis.tianapi.com/caipu'
const API_KEY = 'b3dacac137e96e9f4d0499d08b49e532'

function call(path, params = {}, { silent = false } = {}) {
  if (!silent) wx.showLoading({ title: '加载中', mask: true })
  return request(`${BASE_URL}${path}`, { key: API_KEY, ...params })
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
  return call('/index', params, { silent }).then((result) => ({
    list: result.list || [],
    totalNum: result.totalNum || 0,
    curPage: result.curPage || 1
  }))
}

function getRecipeDetail(id) {
  return call('/cpinfo', { id }).then((result) => (result.list || [])[0])
}

module.exports = { getRecipeList, getRecipeDetail }
