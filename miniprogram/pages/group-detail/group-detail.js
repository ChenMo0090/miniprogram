// pages/group-detail/group-detail.js
const { request } = require('../../utils/request')
const { formatPrice, formatCountdown, secondsUntil, GROUP_STATUS_MAP } = require('../../utils/util')
const app = getApp()

Page({
  data: {
    groupId: '',
    group: null,
    members: [],
    loading: true,
    countdown: '',
    countdownSec: 0,
    canJoin: false,       // 当前用户能否参团
    alreadyJoined: false  // 当前用户是否已在这个团
  },

  onLoad({ groupId }) {
    this.setData({ groupId })
    this.loadGroup(groupId)
  },

  onUnload() {
    if (this._timer) clearInterval(this._timer)
  },

  loadGroup(groupId) {
    request(`/group/detail/${groupId}`).then(res => {
      const g = res.data
      const members = g.members || []
      const userId = app.globalData.userInfo?.id
      const alreadyJoined = members.some(m => m.userId === userId)
      const countdownSec = g.status === 1 ? secondsUntil(g.expireAt) : 0
      this.setData({
        group: {
          ...g,
          statusText: GROUP_STATUS_MAP[g.status] || '未知',
          groupPriceText: formatPrice(g.groupPrice)
        },
        members,
        loading: false,
        countdownSec,
        countdown: formatCountdown(countdownSec),
        alreadyJoined,
        canJoin: g.status === 1 && !alreadyJoined && members.length < g.requiredCount
      })
      if (g.status === 1 && countdownSec > 0) this.startTimer()
    }).catch(() => this.setData({ loading: false }))
  },

  startTimer() {
    this._timer = setInterval(() => {
      let sec = this.data.countdownSec - 1
      if (sec <= 0) {
        sec = 0; clearInterval(this._timer)
        this.loadGroup(this.data.groupId)
      }
      this.setData({ countdownSec: sec, countdown: formatCountdown(sec) })
    }, 1000)
  },

  /** 参团 → 跳商品详情页并传入 groupId */
  onJoinGroup() {
    if (!app.globalData.token) {
      wx.navigateTo({ url: '/pages/login/login' }); return
    }
    const { group } = this.data
    wx.navigateTo({
      url: `/pages/product/product?id=${group.productId}&joinGroupId=${group.id}`
    })
  },

  onShareAppMessage() {
    const { group } = this.data
    return {
      title: `邀你参团！${group?.productName} — 成功后全额退款`,
      path: `/pages/group-detail/group-detail?groupId=${this.data.groupId}`,
      imageUrl: group?.productImage || ''
    }
  },

  onBack() { wx.navigateBack() }
})
