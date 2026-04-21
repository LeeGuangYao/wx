const { getTabs } = require('../api/config')

// 按 key 映射本地 icon，避免后端下发图标路径
const ICONS = {
  list:      { icon: '/images/tabbar/recipe.svg',   iconSel: '/images/tabbar/recipe-on.svg'   },
  category:  { icon: '/images/tabbar/category.svg', iconSel: '/images/tabbar/category-on.svg' },
  recommend: { icon: '/images/tabbar/pick.svg',     iconSel: '/images/tabbar/pick-on.svg'     },
  meal:      { icon: '/images/tabbar/diary.svg',    iconSel: '/images/tabbar/diary-on.svg'    }
}

Component({
  data: {
    selected: 0,
    list: []
  },

  lifetimes: {
    attached() {
      this.loadTabs()
    }
  },

  pageLifetimes: {
    show() {
      this.syncSelected()
    }
  },

  methods: {
    loadTabs() {
      getTabs().then((tabs) => {
        const list = tabs
          .filter((t) => t && t.visible !== false && ICONS[t.key])
          .map((t) => ({
            key: t.key,
            pagePath: t.pagePath,
            text: t.text,
            icon: ICONS[t.key].icon,
            iconSel: ICONS[t.key].iconSel
          }))
        this.setData({ list }, () => this.syncSelected())
      })
    },

    syncSelected() {
      const pages = getCurrentPages()
      const cur = pages[pages.length - 1]
      if (!cur) return
      const path = '/' + cur.route
      const idx = this.data.list.findIndex((t) => t.pagePath === path)
      if (idx >= 0 && idx !== this.data.selected) {
        this.setData({ selected: idx })
      }
    },

    switchTab(e) {
      const { path, index } = e.currentTarget.dataset
      if (this.data.selected === index) return
      wx.switchTab({ url: path })
      this.setData({ selected: index })
    }
  }
})
