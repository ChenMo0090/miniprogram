// pages/refund/refund.js
const { request } = require('../../utils/request')
const { formatPrice, formatDate } = require('../../utils/util')

Page({
  data: {
    orderId: '',
    refundId: '',
    mode: 'result',   // 'result'=展示成团退款结果  'progress'=退款进度
    order: null,
    refund: null,
    group: null,
    members: [],
    loading: true,
    // 时间轴状态
    timeline: []
  },

  onLoad({ orderId, refundId, mode }) {
    this.setData({ orderId: orderId || '', refundId: refundId || '', mode: mode || 'result' })
    if (refundId) {
      this.loadRefundProgress(refundId)
    } else if (orderId) {
      this.loadGroupRefundResult(orderId)
    }
  },

  /** 加载拼团成功退款结果页（从订单ID读取） */
  loadGroupRefundResult(orderId) {
    Promise.all([
      request(`/order/detail/${orderId}`),
      request(`/refund/order/${orderId}`)
    ]).then(([orderRes, refundRes]) => {
      const order = orderRes.data
      const refund = refundRes.data
      // 查拼团成员作为退款证明
      const groupId = order.groupId
      const memberReq = groupId ? request(`/group/detail/${groupId}`) : Promise.resolve({ data: null })
      memberReq.then(groupRes => {
        const group = groupRes.data
        this.setData({
          order: { ...order, amountText: formatPrice(order.totalAmount) },
          refund: { ...refund, amountText: formatPrice(refund.refundAmount) },
          group,
          members: group ? group.members || [] : [],
          loading: false,
          mode: 'result'
        })
      })
    }).catch(() => this.setData({ loading: false }))
  },

  /** 加载退款进度时间轴 */
  loadRefundProgress(refundId) {
    request(`/refund/detail/${refundId}`).then(res => {
      const refund = res.data
      const timeline = this.buildTimeline(refund)
      this.setData({
        refund: { ...refund, amountText: formatPrice(refund.refundAmount) },
        timeline,
        loading: false,
        mode: 'progress'
      })
    }).catch(() => this.setData({ loading: false }))
  },

  buildTimeline(refund) {
    const steps = [
      { label: '申请退款', desc: '系统已提交退款申请', time: refund.applyAt, state: 'done' },
      { label: '微信受理', desc: '微信支付已受理退款', time: refund.status >= 2 ? refund.updatedAt : null, state: refund.status >= 2 ? 'done' : (refund.status === 1 ? 'current' : 'pending') },
      { label: '退款到账', desc: '预计 1-3 个工作日到账', time: refund.status === 3 ? refund.refundAt : null, state: refund.status === 3 ? 'done' : (refund.status === 2 ? 'current' : 'pending') }
    ]
    return steps
  },

  toHome() { wx.switchTab({ url: '/pages/index/index' }) },
  toOrders() { wx.navigateTo({ url: '/pages/order-list/order-list' }) },
  onBack() { wx.navigateBack() }
})
