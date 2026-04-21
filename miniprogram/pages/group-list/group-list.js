// pages/group-list/group-list.js
const { request } = require('../../utils/request')
const { formatPrice, formatCountdown, secondsUntil, GROUP_STATUS_MAP } = require('../../utils/util')
const app = getApp()

Page({
  data: {
    activeTab: 0,
    tabs: ['全部拼团', '进行中', '已成团', '已失败'],
    statusMap: [-1, 1, 2, 3],
    groups: [],
    hotGroups: [],   // 热门拼团（游客可见）
    page: 1, hasMore: true, loading: false,
    isLogin: false
  },

  onShow() {
    const isLogin = !!app.globalData.token
    this.setData({ isLogin })
    this.loadGroups(true)
    if (!isLogin) this.loadHotGroups()
  },

  loadHotGroups() {
    request('/group/hot', 'GET', { pageSize: 6 }).then(res => {
      const list = (res.data || []).map(g => {
        const rawPct = (g.currentCount || 0) * 100 / (g.requiredCount || 1)
        return {
          ...g,
          statusText: GROUP_STATUS_MAP[g.status],
          groupPriceText: formatPrice(g.groupPrice),
          countdownSec: secondsUntil(g.expireAt),
          countdown: formatCountdown(secondsUntil(g.expireAt)),
          progressWidth: Math.min(100, rawPct).toFixed(1)
        }
      })
      this.setData({ hotGroups: list })
    }).catch(() => {})
  },

  loadGroups(reset = false) {
    const isLogin = !!app.globalData.token
    if (!isLogin) return
    const status = this.data.statusMap[this.data.activeTab]
    const page = reset ? 1 : this.data.page
    this.setData({ loading: true })
    request('/group/mine', 'GET', {
      page, pageSize: 10,
      status: status >= 0 ? status : undefined
    }).then(res => {
      const list = (res.data.records || []).map(g => {
        const rawPct = (g.currentCount || 0) * 100 / (g.requiredCount || 1)
        return {
          ...g,
          statusText: GROUP_STATUS_MAP[g.status],
          groupPriceText: formatPrice(g.groupPrice),
          countdown: g.status === 1 ? formatCountdown(secondsUntil(g.expireAt)) : '',
          progressWidth: Math.min(100, rawPct).toFixed(1)
        }
      })
      this.setData({
        groups: reset ? list : [...this.data.groups, ...list],
        page: page + 1, hasMore: list.length >= 10, loading: false
      })
    }).catch(() => this.setData({ loading: false }))
  },

  onTabTap(e) {
    this.setData({ activeTab: e.currentTarget.dataset.idx, groups: [], page: 1, hasMore: true })
    this.loadGroups(true)
  },

  onReachBottom() {
    if (this.data.hasMore) this.loadGroups(false)
  },

  toGroupDetail(e) {
    wx.navigateTo({ url: `/pages/group-detail/group-detail?groupId=${e.currentTarget.dataset.id}` })
  },

  toLogin() {
    wx.navigateTo({ url: '/pages/login/login' })
  }
})
