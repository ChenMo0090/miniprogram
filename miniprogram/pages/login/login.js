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
  },

  /** Mock 模式：一键模拟登录（无需微信授权） */
  onMockLogin() {
    const mockToken = 'mock-token-' + Date.now()
    const mockUser = { id: 1, nickname: '测试用户', avatar: '', phone: '138****8888' }
    app.globalData.token = mockToken
    app.globalData.userInfo = mockUser
    wx.setStorageSync('token', mockToken)
    wx.navigateBack({ delta: 1 })
    wx.showToast({ title: '已切换为 Mock 用户' })
  }
})
