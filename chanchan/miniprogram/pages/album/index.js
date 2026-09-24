const { chapters, getChapter, getPhotoPageIndex } = require('../../data/album')
const { getAlbumShareMessage, getAlbumTimelineMessage } = require('../../utils/album-media')

const DIRECTORY_PAGE_SIZE = 18

function buildThumbs(chapter, photoIndex, enabled) {
  return chapter.photos.map((photo, index) => ({
    file: photo.file,
    index,
    src: enabled && Math.abs(index - photoIndex) <= 4 ? photo.thumbnailUrl : ''
  }))
}

function updateSystemBar(chapter) {
  const isLight = chapter.id === 'palace' || chapter.id === 'white'
  wx.setNavigationBarColor({
    frontColor: isLight ? '#000000' : '#ffffff',
    backgroundColor: chapter.background
  })
}

Page({
  data: {
    chapters,
    chapter: chapters[0],
    pageIndex: 0,
    photoIndex: 0,
    thumbs: [],
    directoryOpen: false,
    directoryTab: 'chapters',
    directoryChapterId: chapters[0].id,
    directoryPhotos: [],
    directoryOffset: 0,
    directoryHasMore: true,
    navTop: 20,
    navHeight: 42,
    safeBottom: 0,
    ready: false
  },

  onLoad(query) {
    if (!getApp().guardPage(this, query)) return
    const chapter = getChapter(query && query.chapterId)
    const system = wx.getSystemInfoSync()
    this._thumbCellPx = (system.windowWidth || system.screenWidth || 375) / 750 * 100
    this._thumbVisibleFirst = 0
    this._thumbsEnabled = false
    const menu = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null
    const navTop = system.statusBarHeight || 20
    const navHeight = menu ? Math.max(42, menu.bottom - navTop) : 42
    updateSystemBar(chapter)
    this.setData({
      chapter,
      pageIndex: 0,
      photoIndex: 0,
      thumbs: buildThumbs(chapter, 0, false),
      navTop,
      navHeight,
      safeBottom: system.safeArea ? Math.max(0, system.screenHeight - system.safeArea.bottom) : 0,
      ready: true
    })
  },

  onShow() {
    if (!getApp().guardPage(this)) return
    updateSystemBar(this.data.chapter)
    wx.showShareMenu({ menus: ['shareAppMessage', 'shareTimeline'] })
  },

  onShareAppMessage() {
    return getAlbumShareMessage(this.data.chapter.id)
  },

  onShareTimeline() {
    return getAlbumTimelineMessage(this.data.chapter.id)
  },

  onSelectChapter(e) {
    const chapter = getChapter(e.currentTarget.dataset.id)
    if (chapter.id === this.data.chapter.id && this.data.pageIndex === 0) {
      this.setData({ photoIndex: 0, directoryChapterId: chapter.id, directoryOpen: false })
      return
    }
    this._thumbVisibleFirst = 0
    this._thumbsEnabled = false
    updateSystemBar(chapter)
    this.setData({
      chapter,
      pageIndex: 0,
      photoIndex: 0,
      thumbs: buildThumbs(chapter, 0, false),
      directoryChapterId: chapter.id,
      directoryOpen: false
    })
  },

  onPageChange(e) {
    if (e.detail.source !== 'touch') return
    const pageIndex = e.detail.current
    const page = this.data.chapter.pages[pageIndex]
    if (!page) return
    const firstFile = page.files[0]
    const photoIndex = this.data.chapter.photos.findIndex((photo) => photo.file === firstFile)
    this._thumbVisibleFirst = Math.max(0, photoIndex)
    this._thumbsEnabled = false
    this.setData({
      pageIndex,
      photoIndex: Math.max(0, photoIndex),
      thumbs: buildThumbs(this.data.chapter, Math.max(0, photoIndex), false)
    })
  },

  onSpreadReady(e) {
    const page = this.data.chapter.pages[this.data.pageIndex]
    if (!page || e.detail.pageId !== page.id) return
    this._thumbsEnabled = true
    this.setData({ thumbs: buildThumbs(this.data.chapter, this.data.photoIndex, true) }, () => {
      this.loadThumbWindow(this._thumbVisibleFirst)
    })
  },

  onThumbScroll(e) {
    const scrollLeft = Math.max(0, Number(e.detail.scrollLeft) || 0)
    const first = Math.floor(scrollLeft / this._thumbCellPx)
    this._thumbVisibleFirst = first
    this.loadThumbWindow(first)
  },

  loadThumbWindow(first) {
    if (!this._thumbsEnabled) return
    const chapter = this.data.chapter
    const start = Math.max(0, first - 2)
    const end = Math.min(chapter.photos.length, first + 10)
    let changed = false
    const thumbs = this.data.thumbs.map((thumb, index) => {
      if (index < start || index >= end || thumb.src) return thumb
      changed = true
      return { ...thumb, src: chapter.photos[index].thumbnailUrl }
    })
    if (changed) this.setData({ thumbs })
  },

  onSelectThumb(e) {
    const file = e.currentTarget.dataset.file
    const pageIndex = getPhotoPageIndex(this.data.chapter.id, file)
    const photoIndex = this.data.chapter.photos.findIndex((photo) => photo.file === file)
    if (pageIndex < 0) return
    const changingPage = pageIndex !== this.data.pageIndex
    if (changingPage) this._thumbsEnabled = false
    this._thumbVisibleFirst = photoIndex
    this.setData({
      pageIndex,
      photoIndex,
      thumbs: changingPage ? buildThumbs(this.data.chapter, photoIndex, false) : this.data.thumbs
    })
  },

  onPhotoTap(e) {
    const file = e.detail.file
    wx.navigateTo({ url: `/pages/album-photo/index?file=${encodeURIComponent(file)}` })
  },

  openDirectory() {
    this.setData({ directoryOpen: true, directoryTab: 'chapters' })
  },

  closeDirectory() {
    this.setData({ directoryOpen: false })
  },

  onDirectoryTab(e) {
    this.setData({ directoryTab: e.currentTarget.dataset.tab })
    if (e.currentTarget.dataset.tab === 'photos') this.resetDirectoryPhotos(this.data.directoryChapterId)
  },

  onDirectoryChapter(e) {
    const chapterId = e.currentTarget.dataset.id
    this.setData({ directoryChapterId: chapterId })
    if (this.data.directoryTab === 'photos') this.resetDirectoryPhotos(chapterId)
  },

  resetDirectoryPhotos(chapterId) {
    const chapter = getChapter(chapterId)
    const end = Math.min(DIRECTORY_PAGE_SIZE, chapter.photos.length)
    this.setData({
      directoryPhotos: chapter.photos.slice(0, end).map((photo) => ({ file: photo.file, src: photo.thumbnailUrl })),
      directoryOffset: end,
      directoryHasMore: end < chapter.photos.length
    })
  },

  loadMoreDirectoryPhotos() {
    if (!this.data.directoryHasMore) return
    const chapter = getChapter(this.data.directoryChapterId)
    const end = Math.min(this.data.directoryOffset + DIRECTORY_PAGE_SIZE, chapter.photos.length)
    const next = chapter.photos.slice(this.data.directoryOffset, end)
      .map((photo) => ({ file: photo.file, src: photo.thumbnailUrl }))
    this.setData({
      directoryPhotos: this.data.directoryPhotos.concat(next),
      directoryOffset: end,
      directoryHasMore: end < chapter.photos.length
    })
  },

  onDirectoryPhoto(e) {
    const file = e.currentTarget.dataset.file
    const { getPhoto } = require('../../data/album')
    const photo = getPhoto(file)
    if (!photo) return
    const chapter = getChapter(photo.chapterId)
    const pageIndex = getPhotoPageIndex(chapter.id, file)
    const photoIndex = chapter.photos.findIndex((item) => item.file === file)
    const samePage = chapter.id === this.data.chapter.id && pageIndex === this.data.pageIndex
    if (!samePage) this._thumbsEnabled = false
    this._thumbVisibleFirst = photoIndex
    updateSystemBar(chapter)
    this.setData({
      chapter,
      pageIndex,
      photoIndex,
      thumbs: samePage ? this.data.thumbs : buildThumbs(chapter, photoIndex, false),
      directoryOpen: false,
      directoryChapterId: chapter.id
    })
  },

  onRecipeTap() {
    wx.setNavigationBarColor({ frontColor: '#ffffff', backgroundColor: '#FF6B35' })
    wx.switchTab({ url: '/pages/list/index' })
  },

  noop() {}
})
