App({
  onLaunch: function () {
    this.globalData = {
      env: "",
      token: "",
      openid: "",
      isAdmin: false,
    };
    if (!wx.cloud) {
      console.error("请使用 2.2.3 或以上的基础库以使用云能力");
    } else {
      wx.cloud.init({
        env: this.globalData.env,
        traceUser: true,
      });
    }
    this.login();
  },

  login: function () {
    const that = this;
    wx.login({
      success(loginRes) {
        if (!loginRes.code) {
          console.error("wx.login 失败", loginRes.errMsg);
          return;
        }
        const { BASE_URL } = require("./config");
        wx.request({
          url: `${BASE_URL}/api/auth/login`,
          method: "POST",
          data: { code: loginRes.code },
          timeout: 15000,
          success(res) {
            const body = res.data;
            if (
              res.statusCode >= 200 &&
              res.statusCode < 300 &&
              body &&
              body.code === 0
            ) {
              const d = body.data;
              that.globalData.token = d.token;
              that.globalData.openid = d.openid;
              that.globalData.isAdmin = !!d.isAdmin;
              wx.setStorageSync("token", d.token);
              wx.setStorageSync("openid", d.openid);
              wx.setStorageSync("isAdmin", d.isAdmin);
            } else {
              console.error(
                "登录接口失败",
                (body && body.message) || res.statusCode
              );
            }
          },
          fail(err) {
            console.error("登录请求失败", (err && err.errMsg) || "网络异常");
          },
        });
      },
      fail(err) {
        console.error("wx.login 失败", err.errMsg);
      },
    });
  },

  getToken: function () {
    if (this.globalData.token) return this.globalData.token;
    return wx.getStorageSync("token") || "";
  },

  getOpenid: function () {
    if (this.globalData.openid) return this.globalData.openid;
    return wx.getStorageSync("openid") || "";
  },

  isAdminUser: function () {
    if (this.globalData.isAdmin) return true;
    return wx.getStorageSync("isAdmin") || false;
  },
});
