// pages/order-list/order-list.js
const { request } = require('../../utils/request')
const { formatPrice, formatDate, ORDER_STATUS_MAP } = require('../../utils/util')

Page({
  data: {
    activeTab: 0,
    tabs: ['全部', '待付款', '待发货', '已发货', '已完成', '退款'],
    statusMap: [-1, 0, 1, 2, 3, 6],  // -1=全部
    orders: [],
    page: 1, hasMore: true, loading: false
  },

  onLoad({ status, tab }) {
    let activeTab = 0
    if (status !== undefined) {
      const idx = this.data.statusMap.indexOf(parseInt(status))
      if (idx >= 0) activeTab = idx
    }
    if (tab === 'refund') activeTab = 5
    this.setData({ activeTab })
    this.loadOrders(true)
  },

  onTabTap(e) {
    this.setData({ activeTab: e.currentTarget.dataset.idx, orders: [], page: 1, hasMore: true })
    this.loadOrders(true)
  },

  loadOrders(reset = false) {
    if (this.data.loading) return
    const status = this.data.statusMap[this.data.activeTab]
    const page = reset ? 1 : this.data.page
    this.setData({ loading: true })
    request('/order/list', 'GET', {
      page, pageSize: 10,
      status: status >= 0 ? status : undefined
    }).then(res => {
      const list = (res.data.records || []).map(o => ({
        ...o,
        statusText: ORDER_STATUS_MAP[o.status] || '',
        amountText: formatPrice(o.totalAmount),
        createdAtText: formatDate(o.createdAt)
      }))
      this.setData({
        orders: reset ? list : [...this.data.orders, ...list],
        page: page + 1, hasMore: list.length >= 10, loading: false
      })
    }).catch(() => this.setData({ loading: false }))
  },

  onReachBottom() {
    if (this.data.hasMore) this.loadOrders(false)
  },

  toOrderDetail(e) {
    const { id, groupid } = e.currentTarget.dataset
    if (groupid) {
      wx.navigateTo({ url: `/pages/group-detail/group-detail?groupId=${groupid}` })
    } else {
      wx.navigateTo({ url: `/pages/pay-success/pay-success?orderId=${id}` })
    }
  },

  onPayTap(e) {
    wx.navigateTo({ url: `/pages/product/product?id=${e.currentTarget.dataset.productid}` })
  }
})
