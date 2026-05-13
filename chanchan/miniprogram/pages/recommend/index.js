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

const FOOD_TIPS = [
  '今天也要好好吃饭。',
  '工作辛苦，加餐犒劳自己。',
  '别空着肚子赶路。',
  '好好吃饭，心情会亮一点。',
  '今天这顿，给自己一点奖励。',
  '忙也要记得吃口热的。',
  '认真生活，从认真吃饭开始。',
  '饿了就吃，别太委屈自己。',
  '这一餐，慢慢享受。',
  '给今天加一点香气。',
  '胃暖了，人也轻松些。',
  '吃点喜欢的，补回元气。',
  '今天也值得一顿好饭。',
  '先吃饱，再继续努力。',
  '热饭热菜，最能安慰人。',
  '饭点到了，先照顾自己。',
  '别凑合，吃点顺口的。',
  '今天的你，值得被好好喂饱。',
  '换个口味，换个心情。',
  '吃饱一点，烦恼少一点。',
  '让这一餐把疲惫接住。',
  '给胃一点温柔。',
  '再忙也别忘了饭点。',
  '认真吃饭，也是在认真爱自己。',
  '今天适合吃点开心的。',
  '先把自己照顾好。',
  '一顿好饭，能治很多累。',
  '愿你吃得满足，也睡得安稳。',
  '把今天的辛苦，换成一口好吃的。',
  '别等太饿了才想起自己。',
  '吃点热乎的，继续向前。',
  '给生活添一道喜欢的味道。',
  '这一口，留给努力的你。',
  '饭香会让日子踏实一点。',
  '今天也要按时补充快乐。',
  '好好吃饭，慢慢变好。',
  '从一顿饭开始恢复能量。',
  '别只顾忙，饭也很重要。',
  '吃饱了，才有力气发光。',
  '这一餐别将就。',
  '给自己安排点好吃的。',
  '今天的快乐，从选菜开始。',
  '让味蕾先放个假。',
  '吃饭这件事，值得认真。',
  '胃满意了，心也会软下来。',
  '今天辛苦了，吃点好的。',
  '一口热饭，胜过很多安慰。',
  '把平凡日子吃出滋味。',
  '饭要趁热，生活也要趁兴。',
  '先吃饭，别让自己低电量。',
  '今天的你，需要一点美味充电。',
  '别怕麻烦，值得吃好一点。',
  '让今天有个好吃的暂停。',
  '这顿饭，给自己满格电量。',
  '好味道会把心情拉回来。',
  '吃一顿舒服的，慢慢回血。',
  '今天也请温柔对待自己。',
  '选一道菜，安放这一刻。',
  '饭桌上的小快乐，别错过。',
  '让胃先开心一下。',
  '别急，先吃点东西。',
  '今天适合被美食照顾。',
  '吃得踏实，心就不慌。',
  '愿这一餐刚好合你胃口。',
  '给忙碌的一天留点香味。',
  '吃饭不是小事，是补给。',
  '这顿饭，专治不知道吃啥。',
  '今天吃点让人满足的。',
  '把好心情拌进饭里。',
  '一餐一饭，都值得期待。',
  '别让肚子陪你加班。',
  '先吃好，再处理世界。',
  '给自己一点热气腾腾的安慰。',
  '今天也要吃得有滋有味。',
  '胃口好一点，日子甜一点。',
  '为今天挑一道小确幸。',
  '忙碌暂停，吃饭优先。',
  '别省略自己的饭点。',
  '吃点喜欢的，给心情续航。',
  '让这一餐成为今天的亮点。',
  '把疲惫交给一顿好饭。',
  '今天不难为自己，好好吃饭。',
  '一口好吃的，能让人重新出发。',
  '给生活加一点烟火气。',
  '饭菜热乎，心也热乎。',
  '吃得开心，也是一种效率。',
  '别饿着，灵感需要能量。',
  '今天也给自己一份认真。',
  '好吃的会让普通一天变好。',
  '这一餐，吃出一点期待。',
  '愿你每顿都不太匆忙。',
  '吃好这一顿，再想下一步。',
  '用一口美味奖励现在的你。',
  '先填饱肚子，再填满计划。',
  '日子再忙，也要有饭香。',
  '今天适合给自己加点菜。',
  '吃点顺心的，缓一缓。',
  '把不知道吃啥，变成刚好想吃。',
  '愿这一口刚好治愈你。',
  '好好吃饭，是今天的小目标。'
]

function pickFoodTip() {
  return FOOD_TIPS[Math.floor(Math.random() * FOOD_TIPS.length)]
}

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
    favCount: 0,
    tipText: ''
  },

  _cache: [],

  async onLoad() {
    this.setData({
      slot: currentSlot(),
      today: todayStr(),
      weekday: weekdayStr(),
      tipText: pickFoodTip()
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
        favCount: getFavorites().length,
        tipText: pickFoodTip()
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
      title: recipe ? `今天吃${recipe.cp_name}吧！` : '今天吃啥',
      path: recipe ? `/pages/detail/index?id=${recipe.id}` : '/pages/recommend/index'
    }
  }
})
