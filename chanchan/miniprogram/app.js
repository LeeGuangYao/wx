const { BASE_URL, API_PATH_PREFIX } = require('./config')

const PASSWORD_STORAGE_KEY = 'appPassword'
const PASSWORD_STATUS_URL = BASE_URL + API_PATH_PREFIX + '/api/auth/password/status'
const PASSWORD_VERIFY_URL = BASE_URL + API_PATH_PREFIX + '/api/auth/password/verify'
const TAB_PATHS = [
  'pages/list/index',
  'pages/category/index',
  'pages/recommend/index',
  'pages/meal/index'
]

function makeRoute(path, query) {
  let cleanPath = String(path || '').split('?')[0]
  while (cleanPath.charAt(0) === '/') cleanPath = cleanPath.slice(1)
  if (!cleanPath || cleanPath === 'pages/password/index') return ''
  const pairs = Object.keys(query || {})
    .filter((key) => query[key] !== undefined && query[key] !== null)
    .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(String(query[key])))
  return '/' + cleanPath + (pairs.length ? '?' + pairs.join('&') : '')
}

App({
  onLaunch(options) {
    this.globalData = {
      env: '',
      token: '',
      openid: '',
      isAdmin: false,
      passwordEnabled: null,
      passwordToken: '',
      passwordStatus: 'checking',
      pendingRoute: '',
      activeRoute: '',
      passwordRedirecting: false
    }
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: this.globalData.env,
        traceUser: true
      })
    }
    this.rememberLaunchRoute(options)
    this.checkPasswordGate()
  },

  onShow(options) {
    this.rememberLaunchRoute(options)
  },

  rememberLaunchRoute(options) {
    if (!this.globalData || !options || !options.path) return
    const route = makeRoute(options.path, options.query)
    if (route) this.globalData.pendingRoute = route
  },

  rememberPageRoute(page, query) {
    if (!this.globalData || !page || !page.route) return
    const route = makeRoute(page.route, query)
    if (!route) return
    const previous = this.globalData.activeRoute || ''
    const queryProvided = query && Object.keys(query).length > 0
    if (
      !queryProvided &&
      previous &&
      previous.split('?')[0] === route
    ) {
      this.globalData.pendingRoute = previous
      return
    }
    this.globalData.activeRoute = route
    this.globalData.pendingRoute = route
  },

  guardPage(page, query) {
    if (!page || page.route === 'pages/password/index') {
      if (this.globalData) this.globalData.passwordRedirecting = false
      return true
    }
    this.rememberPageRoute(page, query)
    if (this.globalData && this.globalData.passwordStatus === 'unlocked') return true
    this.redirectToPassword()
    return false
  },

  redirectToPassword() {
    if (!this.globalData || this.globalData.passwordStatus === 'unlocked') return
    const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : []
    const current = pages.length ? pages[pages.length - 1] : null
    if (current && current.route === 'pages/password/index') {
      this.globalData.passwordRedirecting = false
      return
    }
    if (this.globalData.passwordRedirecting) return
    this.globalData.passwordRedirecting = true
    wx.reLaunch({
      url: '/pages/password/index',
      fail: () => {
        this.globalData.passwordRedirecting = false
      }
    })
  },

  checkPasswordGate() {
    if (this._passwordGatePromise) return this._passwordGatePromise
    this.globalData.passwordStatus = 'checking'
    this._passwordGatePromise = new Promise((resolve) => {
      wx.request({
        url: PASSWORD_STATUS_URL,
        method: 'GET',
        timeout: 15000,
        success: (res) => {
          const body = res.data
          if (
            res.statusCode < 200 ||
            res.statusCode >= 300 ||
            !body ||
            body.code !== 0 ||
            !body.data ||
            typeof body.data.enabled !== 'boolean'
          ) {
            this.globalData.passwordStatus = 'error'
            resolve({ ok: false, reason: 'network' })
            return
          }

          this.globalData.passwordEnabled = body.data.enabled
          if (!body.data.enabled) {
            wx.removeStorageSync(PASSWORD_STORAGE_KEY)
            this.globalData.passwordToken = ''
            this.globalData.passwordStatus = 'unlocked'
            this.login()
            this.openPendingRoute()
            resolve({ ok: true, enabled: false })
            return
          }

          const cachedPassword = wx.getStorageSync(PASSWORD_STORAGE_KEY)
          if (!cachedPassword) {
            this.globalData.passwordStatus = 'required'
            resolve({ ok: true, enabled: true })
            return
          }

          this.verifyAppPassword(cachedPassword, true).then((result) => {
            resolve(Object.assign({ enabled: true }, result))
          })
        },
        fail: () => {
          this.globalData.passwordStatus = 'error'
          resolve({ ok: false, reason: 'network' })
        }
      })
    }).finally(() => {
      this._passwordGatePromise = null
    })
    return this._passwordGatePromise
  },

  verifyAppPassword(password, fromCache) {
    return new Promise((resolve) => {
      wx.request({
        url: PASSWORD_VERIFY_URL,
        method: 'POST',
        data: { password },
        header: { 'content-type': 'application/json' },
        timeout: 15000,
        success: (res) => {
          const body = res.data
          if (
            res.statusCode >= 200 &&
            res.statusCode < 300 &&
            body &&
            body.code === 0 &&
            body.data &&
            body.data.token
          ) {
            wx.setStorageSync(PASSWORD_STORAGE_KEY, password)
            this.globalData.passwordEnabled = true
            this.globalData.passwordToken = body.data.token
            this.globalData.passwordStatus = 'unlocked'
            this.login()
            this.openPendingRoute()
            resolve({ ok: true })
            return
          }

          if (res.statusCode === 401) {
            wx.removeStorageSync(PASSWORD_STORAGE_KEY)
            this.globalData.passwordToken = ''
            this.globalData.passwordStatus = 'required'
            resolve({ ok: false, reason: fromCache ? 'invalid-cache' : 'invalid' })
            return
          }

          if (res.statusCode === 429) {
            this.globalData.passwordStatus = 'required'
            resolve({
              ok: false,
              reason: 'limited',
              message: (body && body.message) || '密码尝试次数过多，请稍后重试'
            })
            return
          }

          this.globalData.passwordStatus = 'error'
          resolve({ ok: false, reason: 'network' })
        },
        fail: () => {
          this.globalData.passwordStatus = 'error'
          resolve({ ok: false, reason: 'network' })
        }
      })
    })
  },

  retryPasswordGate() {
    return this.checkPasswordGate()
  },

  handlePasswordAccessExpired() {
    if (!this.globalData) return
    const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : []
    const current = pages.length ? pages[pages.length - 1] : null
    if (current && current.route !== 'pages/password/index') {
      this.rememberPageRoute(current, current.options)
    }
    this.globalData.passwordToken = ''
    this.globalData.passwordStatus = 'required'
    this.redirectToPassword()
    this.checkPasswordGate()
  },

  getPasswordHeader() {
    const token = this.globalData && this.globalData.passwordToken
    return token ? { 'X-App-Access-Token': token } : {}
  },

  openPendingRoute() {
    if (!this.globalData || this.globalData.passwordStatus !== 'unlocked') return
    const target = this.globalData.pendingRoute || '/pages/album/index'
    let path = target.split('?')[0]
    while (path.charAt(0) === '/') path = path.slice(1)
    this.globalData.pendingRoute = ''
    this.globalData.passwordRedirecting = false
    if (TAB_PATHS.indexOf(path) >= 0) {
      wx.switchTab({ url: '/' + path })
    } else {
      wx.reLaunch({ url: target })
    }
  },

  login() {
    const that = this
    wx.login({
      success(loginRes) {
        if (!loginRes.code) {
          console.error('wx.login 失败', loginRes.errMsg)
          return
        }
        const header = Object.assign(
          { 'content-type': 'application/json' },
          that.getPasswordHeader()
        )
        wx.request({
          url: BASE_URL + API_PATH_PREFIX + '/api/auth/login',
          method: 'POST',
          data: { code: loginRes.code },
          header,
          timeout: 15000,
          success(res) {
            const body = res.data
            if (
              res.statusCode >= 200 &&
              res.statusCode < 300 &&
              body &&
              body.code === 0
            ) {
              const d = body.data
              that.globalData.token = d.token
              that.globalData.openid = d.openid
              that.globalData.isAdmin = !!d.isAdmin
              wx.setStorageSync('token', d.token)
              wx.setStorageSync('openid', d.openid)
              wx.setStorageSync('isAdmin', d.isAdmin)
            } else {
              console.error('登录接口失败', (body && body.message) || res.statusCode)
            }
          },
          fail(err) {
            console.error('登录请求失败', (err && err.errMsg) || '网络异常')
          }
        })
      },
      fail(err) {
        console.error('wx.login 失败', err.errMsg)
      }
    })
  },

  getToken() {
    if (this.globalData.token) return this.globalData.token
    return wx.getStorageSync('token') || ''
  },

  getOpenid() {
    if (this.globalData.openid) return this.globalData.openid
    return wx.getStorageSync('openid') || ''
  },

  isAdminUser() {
    if (this.globalData.isAdmin) return true
    return wx.getStorageSync('isAdmin') || false
  }
})
