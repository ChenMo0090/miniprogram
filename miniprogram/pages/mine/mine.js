// pages/mine/mine.js
const { request } = require('../../utils/request')
const app = getApp()

Page({
  data: {
    userInfo: null,
    stats: { orders: 0, groups: 0, refunds: 0 },
    menus: [
      { section: '我的订单', items: [
        { icon: '📦', color: 'purple', name: '全部订单', path: '/pages/order-list/order-list', badge: 0 },
        { icon: '⏳', color: 'orange', name: '待付款', path: '/pages/order-list/order-list?status=0', badge: 0 },
        { icon: '🚚', color: 'blue',   name: '待发货', path: '/pages/order-list/order-list?status=1', badge: 0 }
      ]},
      { section: '拼团中心', items: [
        { icon: '👥', color: 'purple', name: '我的拼团', path: '/pages/group-list/group-list', badge: 0 },
        { icon: '💰', color: 'green',  name: '退款记录', path: '/pages/order-list/order-list?tab=refund', badge: 0 }
      ]},
      { section: '帮助', items: [
        { icon: '📞', color: 'blue',   name: '联系客服', path: '',   badge: 0 },
        { icon: '📋', color: 'orange', name: '活动规则', path: '',   badge: 0 }
      ]}
    ]
  },

  onShow() {
    const userInfo = app.globalData.userInfo
    if (userInfo) {
      this.setData({ userInfo })
      this.loadStats()
    }
  },

  loadStats() {
    request('/user/stats').then(res => {
      this.setData({ stats: res.data || { orders: 0, groups: 0, refunds: 0 } })
    }).catch(() => {})
  },

  onMenuTap(e) {
    const path = e.currentTarget.dataset.path
    if (!path) { wx.showToast({ title: '即将开放', icon: 'none' }); return }
    wx.navigateTo({ url: path })
  },

  toLogin() {
    wx.navigateTo({ url: '/pages/login/login' })
  },

  onLogout() {
    wx.showModal({ title: '确认退出登录？', success: ({ confirm }) => {
      if (confirm) {
        wx.removeStorageSync('token')
        app.globalData.token = null
        app.globalData.userInfo = null
        this.setData({ userInfo: null, stats: { orders: 0, groups: 0, refunds: 0 } })
        wx.showToast({ title: '已退出登录' })
      }
    }})
  }
})
