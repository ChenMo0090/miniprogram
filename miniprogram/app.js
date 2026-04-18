// app.js
const { request, BASE_URL } = require('./utils/request')

App({
  globalData: {
    userInfo: null,
    token: null,
    BASE_URL
  },

  onLaunch() {
    // 读取本地缓存的 token
    const token = wx.getStorageSync('token')
    if (token) {
      this.globalData.token = token
      this.fetchUserInfo()
    }
  },

  /** 微信登录 → 换取服务端 token */
  login() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: ({ code }) => {
          request('/user/login', 'POST', { code })
            .then(res => {
              const { token, userInfo } = res.data
              this.globalData.token = token
              this.globalData.userInfo = userInfo
              wx.setStorageSync('token', token)
              resolve(userInfo)
            })
            .catch(reject)
        },
        fail: reject
      })
    })
  },

  fetchUserInfo() {
    request('/user/info', 'GET')
      .then(res => {
        this.globalData.userInfo = res.data
      })
      .catch(() => {
        // token 失效，清除
        this.globalData.token = null
        wx.removeStorageSync('token')
      })
  },

  /** 确保已登录，未登录则跳转登录页 */
  ensureLogin(cb) {
    if (this.globalData.token) {
      cb && cb()
    } else {
      wx.navigateTo({ url: '/pages/login/login' })
    }
  }
})
