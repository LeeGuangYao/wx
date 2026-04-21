const { getCategories, getRecipeList } = require('../../api/recipe')

const PAGE_SIZE = 20

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

function decorate(list) {
  return list.map((item) => ({
    ...item,
    _initial: (item.cp_name || '').charAt(0),
    _gradient: pickGradient(item.id || item.cp_name),
    _desc: item.texing || ''
  }))
}

Page({
  data: {
    categories: [],
    activeTypeId: null,
    recipes: [],
    page: 1,
    allnum: 0,
    hasMore: true,
    loading: false,
    loadingMore: false,
    loadingCats: false,
    error: ''
  },

  // 各分类已加载数据的内存缓存：{ [type_id]: { recipes, page, allnum, hasMore } }
  _cache: {},

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 })
    }
  },

  async onLoad() {
    await this.fetchCategories()
  },

  async fetchCategories() {
    this.setData({ loadingCats: true, error: '' })
    try {
      const categories = await getCategories()
      if (!categories.length) {
        this.setData({ categories: [], error: '暂无分类数据' })
        return
      }
      this.setData({ categories })
      await this.switchCategory(categories[0].type_id)
    } catch (e) {
      this.setData({ error: '加载分类失败，点击重试' })
    } finally {
      this.setData({ loadingCats: false })
    }
  },

  async onTapCategory(e) {
    const { typeId } = e.currentTarget.dataset
    if (typeId === this.data.activeTypeId) return
    await this.switchCategory(typeId)
  },

  async switchCategory(typeId) {
    const cat = this.data.categories.find((c) => c.type_id === typeId)
    if (!cat) return

    // 命中缓存：直接复用
    const cached = this._cache[typeId]
    if (cached) {
      this.setData({
        activeTypeId: typeId,
        recipes: cached.recipes,
        page: cached.page,
        allnum: cached.allnum,
        hasMore: cached.hasMore,
        error: ''
      })
      return
    }

    this.setData({
      activeTypeId: typeId,
      recipes: [],
      page: 1,
      allnum: 0,
      hasMore: true,
      loading: true,
      error: ''
    })

    try {
      const { list, allnum } = await getRecipeList(
        { num: PAGE_SIZE, page: 1, word: cat.type_name },
        { silent: true }
      )
      const recipes = decorate(list)
      const hasMore = recipes.length < allnum
      this._cache[typeId] = { recipes, page: 1, allnum, hasMore }
      // 防竞态：期间若用户已切到别的分类，不要覆盖当前视图
      if (this.data.activeTypeId !== typeId) return
      this.setData({ recipes, allnum, hasMore, loading: false })
    } catch (err) {
      if (this.data.activeTypeId !== typeId) return
      this.setData({ loading: false, error: '加载失败，点击重试' })
    }
  },

  async onLoadMore() {
    const { activeTypeId, hasMore, loading, loadingMore, page } = this.data
    if (!activeTypeId || !hasMore || loading || loadingMore) return

    const cat = this.data.categories.find((c) => c.type_id === activeTypeId)
    if (!cat) return

    const nextPage = page + 1
    this.setData({ loadingMore: true })

    try {
      const { list, allnum } = await getRecipeList(
        { num: PAGE_SIZE, page: nextPage, word: cat.type_name },
        { silent: true }
      )
      const newItems = decorate(list)
      const recipes = this.data.recipes.concat(newItems)
      const hasMoreNow = newItems.length > 0 && recipes.length < allnum
      this._cache[activeTypeId] = {
        recipes,
        page: nextPage,
        allnum,
        hasMore: hasMoreNow
      }
      this.setData({
        recipes,
        page: nextPage,
        allnum,
        hasMore: hasMoreNow
      })
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      this.setData({ loadingMore: false })
    }
  },

  onRetry() {
    if (!this.data.categories.length) {
      this.fetchCategories()
    } else if (this.data.activeTypeId) {
      // 清缓存重试
      delete this._cache[this.data.activeTypeId]
      this.switchCategory(this.data.activeTypeId)
    }
  },

  onTapItem(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/detail/index?id=${id}` })
  }
})
