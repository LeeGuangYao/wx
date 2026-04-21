const { getRecipeList } = require('../../api/recipe')
const { isFavorite, toggleFavorite, getFavorites } = require('../../utils/favorites')

const GRADIENTS = [
  'linear-gradient(135deg, #FF8A5B 0%, #FF5E3A 100%)',
  'linear-gradient(135deg, #FFB38A 0%, #FF6B35 100%)',
  'linear-gradient(135deg, #F6A96B 0%, #E8573C 100%)',
  'linear-gradient(135deg, #FFCA8A 0%, #FF8A3D 100%)',
  'linear-gradient(135deg, #FF9A6B 0%, #E84B3C 100%)',
  'linear-gradient(135deg, #FFA573 0%, #D64430 100%)'
]

const MEAL_SLOTS = [
  { key: 'breakfast', label: '早餐', hint: '开启元气一天', range: [5, 10] },
  { key: 'lunch', label: '午餐', hint: '补充能量时刻', range: [10, 15] },
  { key: 'dinner', label: '晚餐', hint: '犒赏一天辛苦', range: [15, 22] },
  { key: 'night', label: '夜宵', hint: '深夜小小满足', range: [22, 29] }
]

function pickGradient(seed) {
  const s = String(seed || '')
  let hash = 0
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) | 0
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length]
}

function splitList(str) {
  if (!str) return []
  return str.split(/[；;,，、]/).map((s) => s.trim()).filter(Boolean)
}

function currentSlot() {
  const h = new Date().getHours()
  const hour = h < 5 ? h + 24 : h
  return MEAL_SLOTS.find((s) => hour >= s.range[0] && hour < s.range[1]) || MEAL_SLOTS[2]
}

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

function weekdayStr() {
  return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][new Date().getDay()]
}

Page({
  data: {
    recipe: null,
    loading: false,
    error: '',
    favorited: false,
    initial: '',
    gradient: '',
    ingredients: [],
    seasonings: [],
    ingCount: 0,
    seaCount: 0,
    stepCount: 0,
    slot: null,
    today: '',
    weekday: '',
    history: [],
    favCount: 0
  },

  _cache: [],

  async onLoad() {
    this.setData({
      slot: currentSlot(),
      today: todayStr(),
      weekday: weekdayStr()
    })
    await this.fetchRandom()
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 })
    }
    const recipe = this.data.recipe
    this.setData({
      favorited: recipe ? isFavorite(recipe.id) : false,
      favCount: getFavorites().length,
      slot: currentSlot()
    })
  },

  async fetchRandom() {
    this.setData({ loading: true, error: '' })
    try {
      let list = this._cache
      if (!list || list.length < 5) {
        const res = await getRecipeList({ num: 20 })
        list = (res && res.list) || []
        this._cache = list
      }
      if (!list || list.length === 0) {
        this.setData({ error: '暂无菜谱数据' })
        return
      }
      const prev = this.data.recipe
      let recipe
      let tries = 0
      do {
        recipe = list[Math.floor(Math.random() * list.length)]
        tries++
      } while (prev && recipe.id === prev.id && list.length > 1 && tries < 8)

      const name = recipe.cp_name || ''
      const ingredients = splitList(recipe.yuanliao)
      const seasonings = splitList(recipe.tiaoliao)
      const stepCount = (recipe.zuofa || '').split(/(?=\d+[\.、])/).filter(Boolean).length

      const history = [recipe, ...(this.data.history || [])]
        .filter((v, i, arr) => arr.findIndex((x) => x.id === v.id) === i)
        .slice(0, 4)

      this.setData({
        recipe,
        initial: name.charAt(0),
        gradient: pickGradient(recipe.id || name),
        ingredients: ingredients.slice(0, 6),
        seasonings: seasonings.slice(0, 6),
        ingCount: ingredients.length,
        seaCount: seasonings.length,
        stepCount,
        favorited: isFavorite(recipe.id),
        history: history.map((h) => ({
          id: h.id,
          cp_name: h.cp_name,
          type_name: h.type_name,
          _initial: (h.cp_name || '').charAt(0),
          _gradient: pickGradient(h.id || h.cp_name)
        })),
        favCount: getFavorites().length
      })
    } catch (e) {
      this.setData({ error: '推荐失败，请稍后重试' })
    } finally {
      this.setData({ loading: false })
    }
  },

  onTapChange() {
    if (this.data.loading) return
    this.fetchRandom()
  },

  onTapCard() {
    const { recipe } = this.data
    if (!recipe) return
    wx.navigateTo({ url: `/pages/detail/index?id=${recipe.id}` })
  },

  onTapHistory(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/detail/index?id=${id}` })
  },

  onToggleFavorite() {
    const { recipe } = this.data
    if (!recipe) return
    const now = toggleFavorite(recipe)
    this.setData({ favorited: now, favCount: getFavorites().length })
    wx.showToast({
      title: now ? '已加入收藏' : '已取消收藏',
      icon: 'none',
      duration: 1000
    })
  },

  onTapFavList() {
    wx.switchTab({ url: '/pages/list/index' })
  },

  onShareAppMessage() {
    const { recipe } = this.data
    return {
      title: recipe ? `今天吃${recipe.cp_name}吧！` : '今天吃什么',
      path: recipe ? `/pages/detail/index?id=${recipe.id}` : '/pages/recommend/index'
    }
  }
})
