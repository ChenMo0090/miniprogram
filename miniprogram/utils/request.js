// utils/request.js
const BASE_URL = 'https://your-domain.com/api'

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
