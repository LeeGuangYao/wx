Component({
  data: {
    selected: 0,
    list: [
      {
        pagePath: '/pages/list/index',
        text: '找菜',
        icon: '/images/tabbar/recipe.svg',
        iconSel: '/images/tabbar/recipe-on.svg'
      },
      {
        pagePath: '/pages/category/index',
        text: '逛逛',
        icon: '/images/tabbar/category.svg',
        iconSel: '/images/tabbar/category-on.svg'
      },
      {
        pagePath: '/pages/recommend/index',
        text: '吃啥',
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
