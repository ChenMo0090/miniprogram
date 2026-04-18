// pages/login/login.js
const app = getApp()

Page({
  data: {
    loading: false
  },

  onLoad() {},

  onWxLogin() {
    this.setData({ loading: true })
    app.login().then(() => {
      wx.navigateBack({ delta: 1 })
    }).catch(() => {
      wx.showToast({ title: '登录失败，请重试', icon: 'none' })
    }).finally(() => {
      this.setData({ loading: false })
    })
  }
})
