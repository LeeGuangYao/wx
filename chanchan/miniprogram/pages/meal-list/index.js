const { listMeals } = require('../../api/meal')

const PAGE_SIZE = 10

Page({
  data: {
    list: [],
    page: 1,
    total: 0,
    hasMore: true,
    loading: false,
    loadingMore: false,
    error: ''
  },

  onLoad() {
    this.fetch({ reset: true })
  },

  onShow() {
    // 从上传页返回后，自动拉取最新一页
    if (this.data.list.length === 0) return
    this.fetch({ reset: true, silent: true })
  },

  onPullDownRefresh() {
    this.fetch({ reset: true }).then(() => wx.stopPullDownRefresh())
  },

  onReachBottom() {
    this.loadMore()
  },

  fetch({ reset = false, silent = false } = {}) {
    if (this.data.loading || this.data.loadingMore) return Promise.resolve()
    const nextPage = reset ? 1 : this.data.page
    const key = reset ? 'loading' : 'loadingMore'

    if (!silent) this.setData({ [key]: true, error: '' })

    return listMeals({ page: nextPage, pageSize: PAGE_SIZE })
      .then((data) => {
        const list = reset ? data.list : this.data.list.concat(data.list)
        this.setData({
          list,
          page: nextPage + 1,
          total: data.total,
          hasMore: list.length < data.total,
          loading: false,
          loadingMore: false
        })
      })
      .catch((err) => {
        this.setData({
          loading: false,
          loadingMore: false,
          error: err && err.message ? err.message : '加载失败'
        })
        if (!reset) {
          wx.showToast({ title: err.message || '加载失败', icon: 'none' })
        }
      })
  },

  loadMore() {
    if (!this.data.hasMore || this.data.loadingMore || this.data.loading) return
    this.fetch({ reset: false })
  },

  reload() {
    this.fetch({ reset: true })
  },

  onPreview(e) {
    const { urls, current } = e.currentTarget.dataset
    if (!urls || !urls.length) return
    wx.previewImage({ urls, current })
  },

  goCreate() {
    wx.switchTab({ url: '/pages/meal/index' })
  }
})
