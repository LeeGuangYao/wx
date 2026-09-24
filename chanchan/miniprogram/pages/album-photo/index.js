const { getPhoto } = require('../../data/album')
const { getAlbumShareMessage, getAlbumTimelineMessage, saveDownloadedToAlbum } = require('../../utils/album-media')

const MAX_DOWNLOAD_RETRIES = 2

Page({
  data: {
    photo: null,
    imagePath: '',
    previewReady: false,
    originalReady: false,
    loading: true,
    progress: 0,
    downloadText: '正在下载原图 · 0%',
    saving: false,
    error: '',
    navTop: 20,
    navHeight: 42,
    safeBottom: 0
  },

  onLoad(query) {
    if (!getApp().guardPage(this, query)) return
    if (!query || !query.file) {
      wx.reLaunch({ url: getAlbumShareMessage(query && query.chapterId).path })
      return
    }
    let file = ''
    try { file = decodeURIComponent(query.file) } catch (error) {}
    const photo = getPhoto(file)
    if (!photo) {
      wx.reLaunch({ url: '/pages/album/index' })
      return
    }
    this._leaving = false
    this._saveRequested = false
    this._hidden = false
    this._downloadGeneration = 0
    this._downloadRetries = 0
    this._retryPending = false
    this._retryTimer = null
    this.photo = photo
    const system = wx.getSystemInfoSync()
    const menu = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null
    const navTop = system.statusBarHeight || 20
    wx.setNavigationBarColor({ frontColor: '#ffffff', backgroundColor: '#171614' })
    this.setData({
      photo,
      navTop,
      navHeight: menu ? Math.max(42, menu.bottom - navTop) : 42,
      safeBottom: system.safeArea ? Math.max(0, system.screenHeight - system.safeArea.bottom) : 0
    })
    this.loadOriginal()
  },

  onUnload() {
    this._leaving = true
    this._saveRequested = false
    this._downloadGeneration++
    this._retryPending = false
    this.clearRetryTimer()
    if (this.downloadTask && this.downloadTask.abort) this.downloadTask.abort()
    this.downloadTask = null
  },

  onShow() {
    if (!getApp().guardPage(this)) return
    this._hidden = false
    this.scheduleDownloadRetry()
    wx.showShareMenu({ menus: ['shareAppMessage', 'shareTimeline'] })
  },

  onHide() {
    this._hidden = true
    this.clearRetryTimer()
  },

  onShareAppMessage() {
    return getAlbumShareMessage(this.photo && this.photo.chapterId)
  },

  onShareTimeline() {
    return getAlbumTimelineMessage(this.photo && this.photo.chapterId)
  },

  loadOriginal(isRetry = false) {
    if (!this.photo || this._leaving || this.downloadTask || this._retryPending) return
    if (!isRetry) this._downloadRetries = 0
    const generation = ++this._downloadGeneration
    const label = isRetry ? `重新下载（${this._downloadRetries}/${MAX_DOWNLOAD_RETRIES}）` : '正在下载原图'
    this.tempFilePath = ''
    this.setData({ loading: true, error: '', progress: 0, downloadText: `${label} · 0%`, imagePath: '', originalReady: false })
    const task = wx.downloadFile({
      url: this.photo.originalUrl,
      timeout: 60000,
      success: (result) => {
        if (this._leaving || generation !== this._downloadGeneration) return
        this._downloadGeneration++
        this.downloadTask = null
        if (result.statusCode !== 200 || !result.tempFilePath) {
          this.onOriginalFailure(result.statusCode === 404 ? '原图暂未找到' : '原图下载失败', result)
          return
        }
        this.tempFilePath = result.tempFilePath
        this.setData({ imagePath: result.tempFilePath, progress: 100, downloadText: '正在打开原图…' })
        if (this._saveRequested) this.saveOriginalFile()
      },
      fail: (error) => {
        if (this._leaving || generation !== this._downloadGeneration) return
        this._downloadGeneration++
        this.downloadTask = null
        const interrupted = /interrupted/i.test(error && error.errMsg || '')
        const timedOut = /timeout|timed out/i.test(error && error.errMsg || '')
        if ((interrupted || timedOut) && this._downloadRetries < MAX_DOWNLOAD_RETRIES) {
          this._downloadRetries++
          this._retryPending = true
          this.setData({ downloadText: `下载${timedOut ? '超时' : '中断'}，准备重试（${this._downloadRetries}/${MAX_DOWNLOAD_RETRIES}）` })
          this.scheduleDownloadRetry()
          return
        }
        this.onOriginalFailure(timedOut ? '原图下载超时' : interrupted ? '原图下载中断，请检查网络后重试' : '原图下载失败', error)
      }
    })
    if (task && task.onProgressUpdate) {
      task.onProgressUpdate((result) => {
        if (this._leaving || generation !== this._downloadGeneration) return
        const progress = result.progress || 0
        this.setData({ progress, downloadText: `${label} · ${progress}%` })
      })
    }
    this.downloadTask = task
  },

  scheduleDownloadRetry() {
    if (!this._retryPending || this._retryTimer || this._hidden || this._leaving) return
    this._retryTimer = setTimeout(() => {
      this._retryTimer = null
      if (this._hidden || this._leaving) return
      this._retryPending = false
      this.loadOriginal(true)
    }, this._downloadRetries * 1000)
  },

  clearRetryTimer() {
    if (this._retryTimer) clearTimeout(this._retryTimer)
    this._retryTimer = null
  },

  onPreviewLoad() {
    if (!this._leaving) this.setData({ previewReady: true })
  },

  onPreviewError() {
    if (!this._leaving) this.setData({ previewReady: false })
  },

  onOriginalLoad(e) {
    if (this._leaving || e.currentTarget.dataset.path !== this.data.imagePath) return
    this.setData({ originalReady: true, loading: false, error: '' })
  },

  onOriginalError(e) {
    if (this._leaving || e.currentTarget.dataset.path !== this.data.imagePath) return
    this.onOriginalFailure('原图无法显示', e.detail)
  },

  onOriginalFailure(message, detail) {
    console.warn('[album-photo] 原图加载失败', {
      file: this.photo.file,
      url: this.photo.originalUrl,
      detail
    })
    this.setData({ loading: false, error: message, imagePath: '', originalReady: false })
    if (this._saveRequested) {
      this._saveRequested = false
      this.setData({ saving: false })
      this.showSaveFailure(message, detail)
    }
  },

  onSave() {
    if (!this.photo || this._leaving || this.data.saving) return
    this._saveRequested = true
    this.setData({ saving: true })
    if (this.tempFilePath) this.saveOriginalFile()
    else this.loadOriginal()
  },

  saveOriginalFile() {
    if (!this._saveRequested || !this.tempFilePath || this._leaving) return
    this._saveRequested = false
    saveDownloadedToAlbum(this.tempFilePath, () => !this._leaving)
      .then(() => {
        if (!this._leaving) wx.showToast({ title: '已保存到相册', icon: 'success' })
      })
      .catch((error) => {
        if (!this._leaving && error && error.message !== '相册权限未开启' && error.message !== '保存已取消') {
          this.showSaveFailure(error.message || '保存失败', error.detail)
        }
      })
      .finally(() => {
        if (!this._leaving) this.setData({ saving: false })
      })
  },

  showSaveFailure(message, detail) {
    const errMsg = detail && detail.errMsg || ''
    const statusCode = detail && detail.statusCode
    const domainBlocked = /url not in domain|domain list/i.test(errMsg)
    const reason = domainBlocked ? '微信未允许该图片地址下载，请联系相册维护者检查下载域名。' : message
    const diagnostics = [errMsg, statusCode ? `HTTP ${statusCode}` : '']
    if (detail && detail.errno != null) diagnostics.push(`errno: ${detail.errno}`)
    const diagnostic = diagnostics.filter(Boolean).join('\n')
    console.warn('[album-photo] 保存原图失败', { file: this.photo.file, detail })
    wx.showModal({
      title: '保存原图失败',
      content: diagnostic ? `${reason}\n\n${diagnostic}` : reason,
      showCancel: false,
      confirmText: '知道了'
    })
  },

  onBack() {
    wx.navigateBack({ delta: 1 })
  },

  onRetry() {
    if (this.data.loading || this.data.saving) return
    this.loadOriginal()
  },

})
