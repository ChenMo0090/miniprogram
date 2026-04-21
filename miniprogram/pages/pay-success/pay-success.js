// pages/pay-success/pay-success.js
const { request } = require('../../utils/request')
const { formatPrice, formatCountdown, secondsUntil } = require('../../utils/util')

Page({
  data: {
    orderId: '',
    groupId: '',
    order: null,
    group: null,
    countdown: '23:59:59',
    countdownSec: 0,
    members: [],
    requiredCount: 3,
    loading: true
  },

  onLoad({ orderId, groupId }) {
    this.setData({ orderId, groupId })
    this.loadData(orderId, groupId)
  },

  onUnload() {
    if (this._timer) clearInterval(this._timer)
  },

  loadData(orderId, groupId) {
    const reqs = [request(`/order/detail/${orderId}`)]
    if (groupId) reqs.push(request(`/group/detail/${groupId}`))
    Promise.all(reqs).then(([orderRes, groupRes]) => {
      const order = orderRes.data
      const group = groupRes ? groupRes.data : null
      const members = group ? (group.members || []) : []
      const requiredCount = group ? group.requiredCount : 3
      const countdownSec = group ? secondsUntil(group.expireAt) : 0
      // 进度条计算（WXML 不支持复杂表达式）
      const rawPct = members.length * 100 / (requiredCount || 1)
      this.setData({
        order: { ...order, amountText: formatPrice(order.totalAmount) },
        group,
        members,
        requiredCount,
        countdownSec,
        countdown: formatCountdown(countdownSec),
        progressPercent: Math.round(rawPct),
        progressWidth: Math.min(100, rawPct).toFixed(1),
        loading: false
      })
      if (group && countdownSec > 0) this.startTimer()
    }).catch(() => this.setData({ loading: false }))
  },

  startTimer() {
    this._timer = setInterval(() => {
      let sec = this.data.countdownSec - 1
      if (sec <= 0) {
        sec = 0; clearInterval(this._timer)
        // 重新拉取状态
        this.loadData(this.data.orderId, this.data.groupId)
      }
      this.setData({ countdownSec: sec, countdown: formatCountdown(sec) })
    }, 1000)
  },

  onShareAppMessage() {
    const { groupId, group } = this.data
    return {
      title: `我正在参加拼团，邀你一起！成功后全额退款`,
      path: `/pages/group-detail/group-detail?groupId=${groupId}`,
      imageUrl: group ? group.productImage : ''
    }
  },

  toOrderList() {
    wx.navigateTo({ url: '/pages/order-list/order-list' })
  },

  toHome() {
    wx.switchTab({ url: '/pages/index/index' })
  }
})
