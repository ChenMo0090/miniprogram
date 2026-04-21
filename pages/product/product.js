// pages/product/product.js
const { request } = require('../../utils/request')
const { formatPrice } = require('../../utils/util')
const app = getApp()

Page({
  data: {
    product: null,
    selectedSpec: '',
    quantity: 1,
    loading: true
  },

  onLoad({ id }) {
    this.productId = id
    this.loadProduct(id)
  },

  loadProduct(id) {
    request(`/product/detail/${id}`).then(res => {
      const p = res.data
      this.setData({
        product: {
          ...p,
          priceText: formatPrice(p.groupPrice || p.price),
          origText: formatPrice(p.price),
          groupPriceText: formatPrice(p.groupPrice),
          specs: p.spec ? p.spec.split(',') : []
        },
        selectedSpec: p.spec ? p.spec.split(',')[0] : '',
        loading: false
      })
    }).catch(() => this.setData({ loading: false }))
  },

  onSpecTap(e) {
    this.setData({ selectedSpec: e.currentTarget.dataset.spec })
  },

  onQtyMinus() {
    if (this.data.quantity > 1) this.setData({ quantity: this.data.quantity - 1 })
  },
  onQtyPlus() {
    const stock = this.data.product.stock || 99
    if (this.data.quantity < stock) this.setData({ quantity: this.data.quantity + 1 })
  },

  /** 普通购买（暂时直接跳下单流程） */
  onBuyNow() {
    const app = getApp()
    if (!app.globalData.token) {
      wx.navigateTo({ url: '/pages/login/login' }); return
    }
    this.createOrder(false)
  },

  /** 发起/参团 */
  onGroupBuy(e) {
    if (!app.globalData.token) {
      wx.navigateTo({ url: '/pages/login/login' }); return
    }
    const groupId = e.currentTarget.dataset.groupid
    this.createOrder(true, groupId)
  },

  createOrder(isGroup, joinGroupId) {
    const { product, selectedSpec, quantity } = this.data
    wx.showLoading({ title: '下单中...' })
    request('/order/create', 'POST', {
      productId: product.id,
      quantity,
      spec: selectedSpec,
      isGroup: isGroup ? 1 : 0,
      joinGroupId: joinGroupId || undefined
    }).then(res => {
      wx.hideLoading()
      const { orderId, groupId, prepayId } = res.data
      // 发起微信支付
      this.wxPay(orderId, prepayId, groupId)
    }).catch(() => wx.hideLoading())
  },

  wxPay(orderId, prepayId, groupId) {
    request('/pay/prepay', 'POST', { orderId }).then(res => {
      const { timeStamp, nonceStr, paySign, signType, packageVal } = res.data
      wx.requestPayment({
        timeStamp, nonceStr,
        package: packageVal,
        signType: signType || 'RSA',
        paySign,
        success: () => {
          wx.navigateTo({
            url: `/pages/pay-success/pay-success?orderId=${orderId}&groupId=${groupId || ''}`
          })
        },
        fail: (err) => {
          if (err.errMsg.includes('cancel')) {
            wx.showToast({ title: '支付已取消', icon: 'none' })
          } else {
            wx.showToast({ title: '支付失败，请重试', icon: 'none' })
          }
        }
      })
    })
  },

  onBack() { wx.navigateBack() },

  onShareAppMessage() {
    return { title: this.data.product?.name || '好物分享', path: `/pages/product/product?id=${this.productId}` }
  }
})
