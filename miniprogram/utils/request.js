// utils/request.js
const BASE_URL = 'https://your-domain.com/api'

// ========== Mock 数据开关（设为 true 启用本地 Mock） ==========
const MOCK_ENABLED = true
// ================================================================

/**
 * Mock API 响应 —— 所有接口的模拟数据都在这里
 */
function mockResponse(url, method, data) {
  // ---- 商品列表 ----
  if (url === '/product/list') {
    const mockProducts = [
      { id: 1, name: 'Apple iPhone 17 Pro Max 256GB 钛金属', price: 9999.00, groupPrice: 8999.00, coverImg: '', emoji: '📱', sales: 2341, categoryId: 1 },
      { id: 2, name: 'Sony WH-1000XM5 无线降噪耳机 黑色', price: 2499.00, groupPrice: 1999.00, coverImg: '', emoji: '🎧', sales: 892, categoryId: 1 },
      { id: 3, name: '优衣库 轻薄羽绒服 2026春款 多色可选 S-XXL', price: 499.00, groupPrice: 299.00, coverImg: '', emoji: '👗', sales: 5678, categoryId: 2 },
      { id: 4, name: 'Nike Air Max 2026 运动跑鞋 经典黑白配色', price: 1299.00, groupPrice: 899.00, coverImg: '', emoji: '👟', sales: 3456, categoryId: 4 },
      { id: 5, name: '三只松鼠 每日坚果礼盒 750g 混合装 30包', price: 128.00, groupPrice: 68.00, coverImg: '', emoji: '🥜', sales: 12345, categoryId: 3 },
      { id: 6, name: '戴森 V15 Detect 无绳吸尘器 金色套装', price: 5490.00, groupPrice: 4690.00, coverImg: '', emoji: '🔋', sales: 567, categoryId: 1 },
      { id: 7, name: 'Lululemon Align 高腰瑜伽裤 25寸 黑色', price: 850.00, groupPrice: 650.00, coverImg: '', emoji: '🧘', sales: 2109, categoryId: 4 },
      { id: 8, name: '星巴克 咖啡豆组合装 200g×3袋', price: 199.00, groupPrice: 129.00, coverImg: '', emoji: '☕', sales: 6789, categoryId: 3 },
      { id: 9, name: 'iPad Pro 13英寸 M4芯片 256GB WiFi版', price: 10999.00, groupPrice: 9899.00, coverImg: '', emoji: '💻', sales: 1234, categoryId: 1 },
      { id: 10, name: '海底捞 自煮火锅套餐 2-3人份', price: 168.00, groupPrice: 88.00, coverImg: '', emoji: '🍲', sales: 9876, categoryId: 3 }
    ]
    return {
      code: 200,
      data: {
        records: mockProducts,
        total: mockProducts.length
      },
      message: 'success'
    }
  }

  // ---- 商品详情 ----
  if (url.startsWith('/product/detail')) {
    return {
      code: 200,
      data: {
        id: 1,
        name: 'Apple iPhone 17 Pro Max 256GB 钛金属',
        description: '全新 A19 Pro 芯片，4800万像素主摄系统，钛金属边框设计。支持 USB-C 接口，电池续航提升30%。',
        price: 9999.00,
        groupPrice: 8999.00,
        originalPrice: 11999.00,
        coverImg: '',
        emoji: '📱',
        sales: 2341,
        requiredCount: 3,
        stock: 500
      }
    }
  }

  // ---- 用户登录 ----
  if (url === '/user/login') {
    return {
      code: 200,
      data: {
        token: 'mock-token-' + Date.now(),
        userInfo: { id: 1, nickname: '测试用户', avatar: '', phone: '138****8888' }
      }
    }
  }

  // ---- 用户信息 ----
  if (url === '/user/info') {
    return {
      code: 200,
      data: {
        id: 1,
        nickname: '测试用户',
        avatar: '',
        phone: '138****8888'
      }
    }
  }

  // ---- 用户统计 ----
  if (url === '/user/stats') {
    return {
      code: 200,
      data: { orders: 12, groups: 5, refunds: 2 }
    }
  }

  // ---- 订单列表 ----
  if (url === '/order/list') {
    const mockOrders = [
      { id: 101, orderNo: 'GD20260418001', status: 1, totalAmount: 8999.00, productImage: '', productName: 'iPhone 17 Pro Max', createdAt: new Date().toISOString(), groupId: 1, productId: 1 },
      { id: 102, orderNo: 'GD20260417002', status: 2, totalAmount: 299.00, productImage: '', productName: '优衣库轻薄羽绒服', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), groupId: null, productId: 3 },
      { id: 103, orderNo: 'GD20240416003', status: 3, totalAmount: 68.00, productImage: '', productName: '三只松鼠坚果礼盒', createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), groupId: 2, productId: 5 },
      { id: 104, orderNo: 'GD20240415004', status: 6, totalAmount: 1999.00, productImage: '', productName: 'Sony WH-1000XM5耳机', createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), groupId: null, productId: 2 }
    ]
    return {
      code: 200,
      data: { records: mockOrders, total: mockOrders.length }
    }
  }

  // ---- 订单详情 ----
  if (url.startsWith('/order/detail')) {
    return {
      code: 200,
      data: {
        id: 101,
        orderNo: 'GD20260418001',
        status: 1,
        totalAmount: 8999.00,
        productImage: '',
        productName: 'iPhone 17 Pro Max',
        createdAt: new Date().toISOString()
      }
    }
  }

  // ---- 拼团详情 ----
  if (url.startsWith('/group/detail')) {
    return {
      code: 200,
      data: {
        id: 1,
        productId: 1,
        productName: 'iPhone 17 Pro Max',
        groupPrice: 8999.00,
        requiredCount: 3,
        currentCount: 2,
        status: 1,
        expireAt: new Date(Date.now() + 3600000 * 23).toISOString(),
        members: [
          { id: 1, userId: 1, nickname: '我', avatar: '', role: 'LEADER' },
          { id: 2, userId: 2, nickname: '小明同学', avatar: '', role: '' }
        ],
        productImage: ''
      }
    }
  }

  // ---- 我的拼团列表 ----
  if (url === '/group/mine' || url === '/group/hot') {
    const now = Date.now()
    const mockGroups = [
      {
        id: 1, productId: 1, productName: 'iPhone 17 Pro Max', groupPrice: 8999.00,
        requiredCount: 3, currentCount: 2, status: 1,
        expireAt: new Date(now + 3600000 * 23).toISOString(),
        members: [{ id: 1, nickname: '我', avatar: '' }, { id: 2, nickname: '小明', avatar: '' }],
        productImage: ''
      },
      {
        id: 2, productId: 3, productName: '优衣库轻薄羽绒服', groupPrice: 299.00,
        requiredCount: 5, currentCount: 5, status: 2,
        expireAt: new Date(now - 86400000).toISOString(),
        members: [{ id: 1, nickname: '我', avatar: '' }, { id: 2, nickname: '小红', avatar: '' }, { id: 3, nickname: '小王', avatar: '' }, { id: 4, nickname: '小李', avatar: '' }, { id: 5, nickname: '小张', avatar: '' }],
        productImage: ''
      },
      {
        id: 3, productId: 5, productName: '三只松鼠坚果礼盒', groupPrice: 68.00,
        requiredCount: 3, currentCount: 1, status: 3,
        expireAt: new Date(now - 86400000 * 3).toISOString(),
        members: [{ id: 1, nickname: '我', avatar: '' }],
        productImage: ''
      }
    ]
    return {
      code: 200,
      data: { records: mockGroups, total: mockGroups.length }
    }
  }

  // ---- 默认空响应 ----
  return { code: 200, data: {}, message: 'success' }
}

const app = getApp()

/**
 * 封装 wx.request，自动携带 token，统一错误处理
 * @param {string} url
 * @param {'GET'|'POST'|'PUT'|'DELETE'} method
 * @param {object} data
 * @returns {Promise}
 */
function request(url, method = 'GET', data = {}) {
  return new Promise((resolve, reject) => {
    // ====== Mock 模式：直接返回模拟数据 ======
    if (MOCK_ENABLED) {
      console.log(`[Mock] ${method} ${url}`, data)
      setTimeout(() => {
        const res = mockResponse(url, method, data)
        resolve(res)
      }, 300 + Math.random() * 400) // 模拟网络延迟 300~700ms
      return
    }
    // =========================================

    const token = wx.getStorageSync('token') || (app && app.globalData && app.globalData.token)
    wx.request({
      url: BASE_URL + url,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success(res) {
        const body = res.data
        if (body.code === 200 || body.code === 0) {
          resolve(body)
        } else if (body.code === 401) {
          wx.removeStorageSync('token')
          wx.navigateTo({ url: '/pages/login/login' })
          reject(new Error('未登录'))
        } else {
          wx.showToast({ title: body.message || '请求失败', icon: 'none' })
          reject(new Error(body.message))
        }
      },
      fail(err) {
        wx.showToast({ title: '网络错误，请重试', icon: 'none' })
        reject(err)
      }
    })
  })
}

module.exports = { request, BASE_URL }
