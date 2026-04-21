Component({
  data: {
    selected: 0,
    list: [
      {
        pagePath: '/pages/list/index',
        text: '菜谱',
        icon: '/images/tabbar/recipe.svg',
        iconSel: '/images/tabbar/recipe-on.svg'
      },
      {
        pagePath: '/pages/category/index',
        text: '精选',
        icon: '/images/tabbar/category.svg',
        iconSel: '/images/tabbar/category-on.svg'
      },
      {
        pagePath: '/pages/recommend/index',
        text: '今天吃什么',
        icon: '/images/tabbar/pick.svg',
        iconSel: '/images/tabbar/pick-on.svg'
      },
      {
        pagePath: '/pages/meal/index',
        text: '食记',
        icon: '/images/tabbar/diary.svg',
        iconSel: '/images/tabbar/diary-on.svg'
      }
    ]
  },

  methods: {
    switchTab(e) {
      const { path, index } = e.currentTarget.dataset
      const cur = this.data.selected
      if (cur === index) return
      wx.switchTab({ url: path })
      this.setData({ selected: index })
    }
  }
})
