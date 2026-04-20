const { getRecipeList } = require('../../api/recipe')
const { getFavorites, isFavorite, toggleFavorite } = require('../../utils/favorites')

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

Page({
  data: {
    recipes: [],
    filtered: [],
    favIds: [],
    loading: false,
    loadingMore: false,
    error: '',
    tab: 'all',
    keyword: '',
    favCount: 0,
    page: 1,
    hasMore: true
  },

  async onLoad() {
    await this.fetchList()
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 })
    }
    const favs = getFavorites()
    const favIds = favs.map((f) => String(f.id))
    const recipes = this.data.recipes.map((r) => ({
      ...r,
      _favorited: favIds.indexOf(String(r.id)) > -1
    }))
    this.setData({ favIds, favCount: favs.length, recipes })
    this.applyFilter(recipes, this.data.tab, this.data.keyword)
  },

  async onPullDownRefresh() {
    await this.fetchList()
    wx.stopPullDownRefresh()
  },

  async onReachBottom() {
    console.log('[onReachBottom] triggered, tab:', this.data.tab, 'hasMore:', this.data.hasMore, 'loadingMore:', this.data.loadingMore)
    if (this.data.tab !== 'all') return
    if (!this.data.hasMore || this.data.loadingMore) return
    await this.loadMore()
  },

  async fetchList() {
    this.setData({ loading: true, error: '', page: 1, hasMore: true })
    try {
      const { list } = await getRecipeList({ num: 20, page: 1 })
      console.log('[fetchList] got', list.length, 'items')
      const recipes = decorate(list)
      const favs = getFavorites()
      this.setData({ recipes, favCount: favs.length, page: 1, hasMore: true })
      this.applyFilter(recipes, this.data.tab, this.data.keyword)
    } catch (e) {
      this.setData({ error: '加载失败，请下拉重试' })
    } finally {
      this.setData({ loading: false })
    }
  },

  async loadMore() {
    const nextPage = this.data.page + 1
    this.setData({ loadingMore: true })
    try {
      const { list } = await getRecipeList({ num: 20, page: nextPage }, { silent: true })
      console.log('[loadMore] page:', nextPage, 'got', list.length, 'items')
      if (!list.length) {
        this.setData({ hasMore: false })
        return
      }
      const newItems = decorate(list)
      const recipes = this.data.recipes.concat(newItems)
      this.setData({ recipes, page: nextPage, hasMore: true })
      this.applyFilter(recipes, this.data.tab, this.data.keyword)
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      this.setData({ loadingMore: false })
    }
  },

  applyFilter(recipes, tab, keyword) {
    let source = recipes
    if (tab === 'fav') {
      const favs = getFavorites()
      source = decorate(favs)
    }
    const kw = (keyword || '').trim().toLowerCase()
    const filtered = kw
      ? source.filter((item) => {
          return (
            (item.cp_name || '').toLowerCase().indexOf(kw) > -1 ||
            (item.type_name || '').toLowerCase().indexOf(kw) > -1 ||
            (item.yuanliao || '').toLowerCase().indexOf(kw) > -1
          )
        })
      : source
    this.setData({ filtered })
  },

  onTapTab(e) {
    const { tab } = e.currentTarget.dataset
    if (tab === this.data.tab) return
    this.setData({ tab })
    this.applyFilter(this.data.recipes, tab, this.data.keyword)
  },

  onSearchInput(e) {
    const keyword = e.detail.value
    this.setData({ keyword })
    this.applyFilter(this.data.recipes, this.data.tab, keyword)
  },

  onClearSearch() {
    this.setData({ keyword: '' })
    this.applyFilter(this.data.recipes, this.data.tab, '')
  },

  onTapItem(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/detail/index?id=${id}` })
  },

  onTapFav(e) {
    const { id } = e.currentTarget.dataset
    const item = this.data.recipes.find((r) => String(r.id) === String(id)) ||
      this.data.filtered.find((r) => String(r.id) === String(id))
    if (!item) return
    const now = toggleFavorite(item)
    wx.showToast({ title: now ? '已收藏' : '已取消', icon: 'none', duration: 900 })

    const favs = getFavorites()
    const favIds = favs.map((f) => String(f.id))
    const recipes = this.data.recipes.map((r) => ({
      ...r,
      _favorited: favIds.indexOf(String(r.id)) > -1
    }))
    this.setData({ favIds, favCount: favs.length, recipes })
    this.applyFilter(recipes, this.data.tab, this.data.keyword)
  },

  onRefresh() {
    this.fetchList()
  }
})
