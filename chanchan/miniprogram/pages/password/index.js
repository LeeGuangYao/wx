Page({
  data: {
    digits: [],
    dots: [0, 1, 2, 3],
    rows: [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
    checking: true,
    gateEnabled: false,
    submitting: false,
    networkError: false,
    lockedOut: false,
    error: ''
  },

  onLoad() {
    const app = getApp()
    if (!app.guardPage(this)) return
    this.refreshStatus()
  },

  refreshStatus() {
    if (this._refreshing) return
    this._refreshing = true
    this.setData({ checking: true, error: '' })
    getApp().checkPasswordGate().then((result) => {
      this._refreshing = false
      if (result.ok && !result.enabled) return
      const error = result.reason === 'invalid-cache'
        ? '已保存的密码已失效，请重新输入'
        : result.reason === 'limited'
          ? result.message || '密码尝试次数过多，请稍后重试'
          : !result.ok
            ? '暂时无法连接，请检查网络后重试'
            : ''
      this.setData({
        checking: false,
        gateEnabled: result.enabled === true,
        error,
        networkError: !result.ok && result.reason === 'network',
        lockedOut: result.reason === 'limited',
        digits: []
      })
    })
  },

  tapDigit(e) {
    if (this.data.checking || this.data.submitting || this.data.networkError || this.data.lockedOut) return
    const digit = String(e.currentTarget.dataset.digit)
    if (this.data.digits.length >= 4) return
    const digits = this.data.digits.concat(digit)
    this.setData({ digits, error: '' })
    if (digits.length !== 4) return

    this.setData({ submitting: true })
    getApp().verifyAppPassword(digits.join(''), false).then((result) => {
      if (result.ok) return
      this.setData({
        digits: [],
        submitting: false,
        networkError: result.reason === 'network',
        lockedOut: result.reason === 'limited',
        error: result.reason === 'invalid'
          ? '密码不正确，请重试'
          : result.reason === 'limited'
            ? result.message
            : '验证失败，请检查网络后重试'
      })
    })
  },

  deleteDigit() {
    if (this.data.checking || this.data.submitting) return
    this.setData({
      digits: this.data.digits.slice(0, -1),
      error: ''
    })
  },

  retry() {
    this.setData({ digits: [], error: '', networkError: false, lockedOut: false })
    this.refreshStatus()
  }
})
