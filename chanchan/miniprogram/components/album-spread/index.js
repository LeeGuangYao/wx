const { photosById } = require('../../data/album')
const { layoutSpread } = require('../../utils/album-layout')

Component({
  properties: {
    page: { type: Object, value: null },
    chapter: { type: Object, value: null },
    active: { type: Boolean, value: false }
  },

  data: { placements: [], canvasHeight: 0 },

  observers: {
    'page, active': function (page, active) {
      if (!page) return
      if (!this._pageId || this._pageId !== page.id) this.resetPage(page)
      if (active) this.startNextPhoto()
      else {
        this._done = false
        this.clearImageTimer()
        if (this._currentFile) {
          const slot = this._slots[this._loadIndex]
          if (slot) slot.src = ''
          this._currentFile = ''
          this.refreshPlacements()
        }
      }
      this.measureCanvas()
    }
  },

  lifetimes: {
    created() {
      this._slots = []
      this._pageId = ''
      this._generation = 0
      this._loadIndex = 0
      this._currentFile = ''
      this._timer = null
      this._done = false
    },
    ready() { this.measureCanvas() },
    detached() {
      this.clearImageTimer()
      this._generation++
    }
  },

  pageLifetimes: { resize() { this.measureCanvas() } },

  methods: {
    resetPage(page) {
      this.clearImageTimer()
      this._generation++
      this._pageId = page.id
      this._loadIndex = 0
      this._currentFile = ''
      this._done = false
      this._slots = (page.files || []).map((file) => ({
        file,
        src: '',
        loaded: false,
        failed: false,
        visible: false
      }))
      this._geometry = []
      this.refreshPlacements()
    },

    measureCanvas() {
      const page = this.properties.page
      if (!page) return
      wx.createSelectorQuery().in(this).select('.spread-canvas').boundingClientRect((rect) => {
        if (!rect || !rect.width || !rect.height) return
        this.setData({ canvasHeight: rect.height })
        this.rebuildPlacements(rect.width, rect.height)
      }).exec()
    },

    refreshPlacements() {
      const slots = this._slots || []
      const geometry = this._geometry || []
      const byFile = Object.create(null)
      slots.forEach((slot) => { byFile[slot.file] = slot })
      this.setData({ placements: geometry.map((placement) => ({ ...placement, ...byFile[placement.file] })) })
    },

    rebuildPlacements(width, height) {
      const page = this.properties.page
      if (!page) return
      this._geometry = layoutSpread(page, photosById, width, height)
      const slots = this._slots || []
      const byFile = Object.create(null)
      slots.forEach((slot) => { byFile[slot.file] = slot })
      this.setData({ placements: this._geometry.map((placement) => ({ ...placement, ...byFile[placement.file] })) })
    },

    startNextPhoto() {
      if (!this.properties.active || !this._slots || this._currentFile) return
      while (this._loadIndex < this._slots.length && this._slots[this._loadIndex].loaded) {
        this._loadIndex++
      }
      if (this._loadIndex >= this._slots.length) {
        this.reportReady()
        return
      }
      const slot = this._slots[this._loadIndex]
      const generation = this._generation
      this._currentFile = slot.file
      slot.src = photosById[slot.file].previewUrl
      this.refreshPlacements()
      this._timer = setTimeout(() => {
        if (generation === this._generation && this._currentFile === slot.file) this.finishCurrentPhoto(true)
      }, 15000)
    },

    onImageLoad(e) {
      this.finishCurrentPhoto(false, e.currentTarget.dataset.file)
    },

    onImageError(e) {
      this.finishCurrentPhoto(true, e.currentTarget.dataset.file)
    },

    finishCurrentPhoto(failed, file) {
      if (!this.properties.active || !this._currentFile || (file && file !== this._currentFile)) return
      this.clearImageTimer()
      const current = this._slots[this._loadIndex]
      if (!current || current.file !== this._currentFile) return
      current.loaded = !failed
      current.failed = !!failed
      current.visible = !failed
      this._loadIndex++
      this._currentFile = ''
      this.refreshPlacements()
      const generation = this._generation
      setTimeout(() => {
        if (generation === this._generation) this.startNextPhoto()
      }, 140)
    },

    retryPhoto(e) {
      const file = e.currentTarget.dataset.file
      const index = this._slots.findIndex((slot) => slot.file === file)
      if (index < 0 || !this.properties.active) return
      this._slots[index] = { ...this._slots[index], src: '', failed: false, visible: false }
      this._loadIndex = index
      this._currentFile = ''
      this.refreshPlacements()
      this.startNextPhoto()
    },

    reportReady() {
      if (this._done) return
      this._done = true
      this.triggerEvent('ready', {
        pageId: this._pageId,
        failed: this._slots.some((slot) => slot.failed)
      })
    },

    onTapPhoto(e) {
      const file = e.currentTarget.dataset.file
      this.triggerEvent('photo', { file })
    },

    clearImageTimer() {
      if (this._timer) clearTimeout(this._timer)
      this._timer = null
    }
  }
})
