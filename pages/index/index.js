// pages/index/index.js
const { request } = require('../../utils/request')
const { formatPrice } = require('../../utils/util')

Page({
  data: {
    keyword: '',
    categories: [
      { id: 0, name: '全部', icon: '🛍️' },
      { id: 1, name: '数码',  icon: '💻' },
      { id: 2, name: '服饰',  icon: '👗' },
      { id: 3, name: '美食',  icon: '🍜' },
      { id: 4, name: '运动',  icon: '🏃' }
    ],
    activeCat: 0,
    products: [],
    page: 1,
    hasMore: true,
    loading: false,
    refreshing: false,
    bannerList: [
      { title: '邀请3人购买', sub: '全额退款不是梦', badge: '限时活动 · 立即参与' }
    ]
  },

  onLoad() {
    this.loadProducts(true)
  },

  onPullDownRefresh() {
    this.loadProducts(true).then(() => wx.stopPullDownRefresh())
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadProducts(false)
    }
  },

  loadProducts(reset = false) {
    if (this.data.loading) return Promise.resolve()
    const page = reset ? 1 : this.data.page
    this.setData({ loading: true })
    return request('/product/list', 'GET', {
      page,
      pageSize: 10,
      categoryId: this.data.activeCat || undefined,
      keyword: this.data.keyword || undefined
    }).then(res => {
      const list = (res.data.records || []).map(p => ({
        ...p,
        priceText: formatPrice(p.groupPrice || p.price),
        origText: formatPrice(p.price)
      }))
      this.setData({
        products: reset ? list : [...this.data.products, ...list],
        page: page + 1,
        hasMore: list.length >= 10,
        loading: false
      })
    }).catch(() => this.setData({ loading: false }))
  },

  onCatTap(e) {
    const id = e.currentTarget.dataset.id
    this.setData({ activeCat: id, products: [], page: 1, hasMore: true })
    this.loadProducts(true)
  },

  onSearch(e) {
    this.setData({ keyword: e.detail.value, products: [], page: 1, hasMore: true })
    this.loadProducts(true)
  },

  onSearchClear() {
    this.setData({ keyword: '', products: [], page: 1, hasMore: true })
    this.loadProducts(true)
  },

  toProduct(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/product/product?id=${id}` })
  },

  toGroupList() {
    wx.switchTab({ url: '/pages/group-list/group-list' })
  }
})
