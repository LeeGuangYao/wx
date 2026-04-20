const { getRecipeDetail } = require('../../api/recipe')
const { isFavorite, toggleFavorite } = require('../../utils/favorites')

function splitList(str) {
  if (!str) return []
  return str
    .split(/[；;,，、]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function splitSteps(str) {
  if (!str) return []
  return str
    .split(/(?=\d+[\.、])/)
    .map((s) => s.replace(/^\d+[\.、]\s*/, '').trim())
    .filter(Boolean)
}

Page({
  data: {
    recipe: null,
    steps: [],
    ingredients: [],
    seasonings: [],
    loading: false,
    error: '',
    favorited: false,
    initial: '',
    gradient: ''
  },

  async onLoad({ id }) {
    this.recipeId = id
    await this.fetchDetail()
  },

  onShow() {
    if (this.recipeId) {
      this.setData({ favorited: isFavorite(this.recipeId) })
    }
  },

  pickGradient(seed) {
    const palettes = [
      'linear-gradient(135deg, #FF8A5B 0%, #FF5E3A 100%)',
      'linear-gradient(135deg, #FFB38A 0%, #FF6B35 100%)',
      'linear-gradient(135deg, #F6A96B 0%, #E8573C 100%)',
      'linear-gradient(135deg, #FFCA8A 0%, #FF8A3D 100%)',
      'linear-gradient(135deg, #FF9A6B 0%, #E84B3C 100%)'
    ]
    const s = String(seed || '')
    let hash = 0
    for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) | 0
    return palettes[Math.abs(hash) % palettes.length]
  },

  async fetchDetail() {
    this.setData({ loading: true, error: '' })
    try {
      const recipe = await getRecipeDetail(this.recipeId)
      const name = (recipe && recipe.cp_name) || ''
      this.setData({
        recipe,
        steps: splitSteps(recipe.zuofa),
        ingredients: splitList(recipe.yuanliao),
        seasonings: splitList(recipe.tiaoliao),
        favorited: isFavorite(recipe.id),
        initial: name ? name.charAt(0) : '',
        gradient: this.pickGradient(recipe.id || name)
      })
      if (name) {
        wx.setNavigationBarTitle({ title: name })
      }
    } catch (e) {
      this.setData({ error: '加载失败，请返回重试' })
    } finally {
      this.setData({ loading: false })
    }
  },

  onToggleFavorite() {
    const { recipe } = this.data
    if (!recipe) return
    const now = toggleFavorite(recipe)
    this.setData({ favorited: now })
    wx.showToast({
      title: now ? '已加入收藏' : '已取消收藏',
      icon: 'none',
      duration: 1200
    })
  },

  onShareAppMessage() {
    const { recipe } = this.data
    return {
      title: recipe ? `推荐一道菜：${recipe.cp_name}` : '菜谱推荐',
      path: `/pages/detail/index?id=${this.recipeId}`
    }
  }
})
