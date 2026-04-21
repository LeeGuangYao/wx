const { createMeal } = require('../../api/meal')

const MAX_COUNT = 9
const MAX_SIZE = 10 * 1024 * 1024

function formatToday() {
  const d = new Date()
  const pad = (n) => (n < 10 ? '0' + n : '' + n)
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} · ${weekdays[d.getDay()]}`
}

Page({
  data: {
    today: '',
    maxCount: MAX_COUNT,
    images: [],
    title: '',
    content: '',
    submitting: false,
    canSubmit: false
  },

  onLoad() {
    this.setData({ today: formatToday() })
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 })
    }
  },

  goList() {
    wx.navigateTo({ url: '/pages/meal-list/index' })
  },

  onChooseImage() {
    const remain = MAX_COUNT - this.data.images.length
    if (remain <= 0) {
      wx.showToast({ title: `最多 ${MAX_COUNT} 张`, icon: 'none' })
      return
    }
    wx.chooseMedia({
      count: remain,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['compressed'],
      success: (res) => {
        const files = (res.tempFiles || []).filter((f) => {
          if (f.size > MAX_SIZE) {
            wx.showToast({ title: '\u56fe\u7247不能超过 10MB', icon: 'none' })
            return false
          }
          return true
        })
        if (!files.length) return
        const next = this.data.images.concat(files.map((f) => f.tempFilePath)).slice(0, MAX_COUNT)
        this.setData({ images: next }, this.refreshCanSubmit)
      }
    })
  },

  onPreview(e) {
    const index = e.currentTarget.dataset.index
    const urls = this.data.images
    if (!urls.length) return
    wx.previewImage({ urls, current: urls[index] })
  },

  onRemoveImage(e) {
    const index = e.currentTarget.dataset.index
    const next = this.data.images.slice()
    next.splice(index, 1)
    this.setData({ images: next }, this.refreshCanSubmit)
  },

  onTitleInput(e) {
    this.setData({ title: e.detail.value }, this.refreshCanSubmit)
  },

  onContentInput(e) {
    this.setData({ content: e.detail.value }, this.refreshCanSubmit)
  },

  refreshCanSubmit() {
    this.setData({ canSubmit: this.data.images.length > 0 })
  },

  onSubmit() {
    if (!this.data.canSubmit || this.data.submitting) return
    const { images, title, content } = this.data

    this.setData({ submitting: true })
    wx.showLoading({ title: '\u4e0a\u4f20中…', mask: true })

    createMeal({
      filePaths: images,
      title: title.trim(),
      content: content.trim()
    })
      .then(() => {
        wx.hideLoading()
        this.setData({
          images: [],
          title: '',
          content: '',
          canSubmit: false,
          submitting: false
        })
        wx.showModal({
          title: '\u53d1\u5e03成功 🎉',
          content: '是否查看我的\u98df\u8bb0？',
          confirmText: '去看看',
          cancelText: '留在这里',
          confirmColor: '#FF5E3A',
          success: (res) => {
            if (res.confirm) {
              wx.navigateTo({ url: '/pages/meal-list/index' })
            } else {
              wx.showToast({ title: '已保存', icon: 'success' })
            }
          }
        })
      })
      .catch((err) => {
        wx.hideLoading()
        wx.showToast({ title: err.message || '\u4e0a\u4f20失败', icon: 'none' })
        this.setData({ submitting: false })
      })
  }
})
