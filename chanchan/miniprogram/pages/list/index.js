const { getRecipeList } = require('../../api/recipe')
const { getFavorites, isFavorite, toggleFavorite } = require('../../utils/favorites')

const POOL_SIZE = 1000
const PICK_SIZE = 500
const PAGE_SIZE = 100
const WINDOW_STEP = 20
const SEARCH_MAX = 500
const SEARCH_DEBOUNCE_MS = 300

const GRADIENTS = [
  'linear-gradient(135deg, #FF8A5B 0%, #FF5E3A 100%)',
  'linear-gradient(135deg, #FFB38A 0%, #FF6B35 100%)',
  'linear-gradient(135deg, #F6A96B 0%, #E8573C 100%)',
  'linear-gradient(135deg, #FFCA8A 0%, #FF8A3D 100%)',
  'linear-gradient(135deg, #FF9A6B 0%, #E84B3C 100%)',
  'linear-gradient(135deg, #FFA573 0%, #D64430 100%)'
]

function pickGradient(seed) {
  const s = String(seed || '')
  let hash = 0
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) | 0
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length]
}

function buildPreview(item) {
  const parts = []
  if (item.yuanliao) {
    const ing = item.yuanliao.split(/[；;,，、]/).map((s) => s.trim()).filter(Boolean)
    if (ing.length) parts.push(`原料 ${ing.length} 种`)
  }
  if (item.tiaoliao) {
    const sea = item.tiaoliao.split(/[；;,，、]/).map((s) => s.trim()).filter(Boolean)
    if (sea.length) parts.push(`调料 ${sea.length} 种`)
  }
  return parts.join(' · ')
}

function decorate(list) {
  return list.map((item) => ({
    ...item,
    _desc: item.texing || item.yuanliao || '',
    _preview: buildPreview(item),
    _initial: (item.cp_name || '').charAt(0),
    _gradient: pickGradient(item.id || item.cp_name),
    _favorited: isFavorite(item.id)
  }))
}

function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = a[i]
    a[i] = a[j]
    a[j] = tmp
  }
  return a
}

async function fetchBatches({ word, target }) {
  const first = await getRecipeList({ num: PAGE_SIZE, page: 1, word: word || '' }, { silent: true })
  const total = Math.min(Number(first.allnum) || 0, target)
  if (total <= PAGE_SIZE) return first.list.slice(0, total)

  const pages = Math.ceil(total / PAGE_SIZE)
  const rest = []
  for (let p = 2; p <= pages; p++) {
    rest.push(getRecipeList({ num: PAGE_SIZE, page: p, word: word || '' }, { silent: true }))
  }
  const results = await Promise.all(rest)
  let merged = first.list.slice()
  for (const r of results) merged = merged.concat(r.list || [])
  return merged.slice(0, total)
}

Page({
  data: {
    filtered: [],
    favIds: [],
    loading: false,
    loadingMore: false,
    error: '',
    tab: 'all',
    keyword: '',
    favCount: 0,
    hasMore: false,
    windowEnd: 0
  },

  _pool: [],
  _picked: [],
  _searchSeq: 0,
  _searchTimer: null,

  async onLoad() {
    await this.loadPool()
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 })
    }
    const favs = getFavorites()
    const favIds = favs.map((f) => String(f.id))
    this.setData({ favIds, favCount: favs.length })

    if (this.data.tab === 'fav') {
      this.renderFavorites()
      return
    }
    this.syncFavoritesIntoPicked(favIds)
  },

  syncFavoritesIntoPicked(favIds) {
    if (!this._picked.length) return
    this._picked = this._picked.map((item) => ({
      ...item,
      _favorited: favIds.indexOf(String(item.id)) > -1
    }))
    this.renderWindow(this.data.windowEnd || WINDOW_STEP)
  },

  async onPullDownRefresh() {
    await this.loadPool()
    wx.stopPullDownRefresh()
  },

  async onReachBottom() {
    if (this.data.tab !== 'all') return
    if (!this.data.hasMore || this.data.loadingMore) return
    this.setData({ loadingMore: true })
    const nextEnd = Math.min(this.data.windowEnd + WINDOW_STEP, this._picked.length)
    this.renderWindow(nextEnd)
    this.setData({ loadingMore: false })
  },

  async loadPool() {
    this.setData({ loading: true, error: '', keyword: '', tab: 'all' })
    try {
      const items = await fetchBatches({ word: '', target: POOL_SIZE })
      this._pool = items
      this._picked = shuffle(items).slice(0, PICK_SIZE)
      this.renderWindow(WINDOW_STEP)
    } catch (e) {
      this._pool = []
      this._picked = []
      this.setData({ filtered: [], hasMore: false, windowEnd: 0, error: '加载失败，请下拉重试' })
    } finally {
      this.setData({ loading: false })
    }
  },

  renderWindow(end) {
    const capped = Math.min(end, this._picked.length)
    const slice = decorate(this._picked.slice(0, capped))
    this.setData({
      filtered: slice,
      windowEnd: capped,
      hasMore: capped < this._picked.length
    })
  },

  renderFavorites() {
    const favs = getFavorites()
    const slice = decorate(favs)
    this.setData({ filtered: slice, hasMore: false, windowEnd: slice.length })
  },

  onTapTab(e) {
    const { tab } = e.currentTarget.dataset
    if (tab === this.data.tab) return
    this.setData({ tab })
    if (tab === 'fav') {
      this.renderFavorites()
    } else if (this.data.keyword) {
      this.runSearch(this.data.keyword)
    } else {
      this.renderWindow(WINDOW_STEP)
    }
  },

  onSearchInput(e) {
    const keyword = e.detail.value
    this.setData({ keyword })
    if (this.data.tab === 'fav') {
      this.setData({ tab: 'all' })
    }
    if (this._searchTimer) clearTimeout(this._searchTimer)
    const kw = (keyword || '').trim()
    if (!kw) {
      this._picked = shuffle(this._pool).slice(0, PICK_SIZE)
      this.renderWindow(WINDOW_STEP)
      return
    }
    this._searchTimer = setTimeout(() => this.runSearch(kw), SEARCH_DEBOUNCE_MS)
  },

  onClearSearch() {
    if (this._searchTimer) clearTimeout(this._searchTimer)
    this.setData({ keyword: '' })
    this._picked = shuffle(this._pool).slice(0, PICK_SIZE)
    this.renderWindow(WINDOW_STEP)
  },

  async runSearch(keyword) {
    const seq = ++this._searchSeq
    this.setData({ loading: true, error: '' })
    try {
      const items = await fetchBatches({ word: keyword, target: SEARCH_MAX })
      if (seq !== this._searchSeq) return
      this._picked = items
      this.renderWindow(WINDOW_STEP)
    } catch (e) {
      if (seq !== this._searchSeq) return
      this._picked = []
      this.setData({ filtered: [], hasMore: false, windowEnd: 0, error: '搜索失败，请重试' })
    } finally {
      if (seq === this._searchSeq) this.setData({ loading: false })
    }
  },

  onTapItem(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/detail/index?id=${id}` })
  },

  onTapFav(e) {
    const { id } = e.currentTarget.dataset
    const strId = String(id)
    const item =
      this._picked.find((r) => String(r.id) === strId) ||
      this.data.filtered.find((r) => String(r.id) === strId)
    if (!item) return
    toggleFavorite(item)
    const favs = getFavorites()
    const favIds = favs.map((f) => String(f.id))
    this.setData({ favIds, favCount: favs.length })

    if (this.data.tab === 'fav') {
      this.renderFavorites()
      return
    }
    this._picked = this._picked.map((r) => ({
      ...r,
      _favorited: favIds.indexOf(String(r.id)) > -1
    }))
    this.renderWindow(this.data.windowEnd || WINDOW_STEP)
    wx.showToast({
      title: favIds.indexOf(strId) > -1 ? '已收藏' : '已取消',
      icon: 'none',
      duration: 900
    })
  },

  onRefresh() {
    this.loadPool()
  }
})
