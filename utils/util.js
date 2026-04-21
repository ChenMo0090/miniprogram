// utils/util.js

/**
 * 格式化价格，保留两位小数
 * @param {number|string} val
 * @returns {string}
 */
function formatPrice(val) {
  if (val == null) return '0.00'
  return parseFloat(val).toFixed(2)
}

/**
 * 格式化时间
 * @param {string|Date} date
 * @param {string} fmt  'YYYY-MM-DD HH:mm:ss' 等
 */
function formatDate(date, fmt = 'YYYY-MM-DD HH:mm') {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date.replace(/-/g, '/')) : date
  const pad = n => String(n).padStart(2, '0')
  return fmt
    .replace('YYYY', d.getFullYear())
    .replace('MM', pad(d.getMonth() + 1))
    .replace('DD', pad(d.getDate()))
    .replace('HH', pad(d.getHours()))
    .replace('mm', pad(d.getMinutes()))
    .replace('ss', pad(d.getSeconds()))
}

/**
 * 倒计时格式化（剩余秒数 → HH:mm:ss）
 * @param {number} seconds
 * @returns {string}
 */
function formatCountdown(seconds) {
  if (seconds <= 0) return '00:00:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const pad = n => String(n).padStart(2, '0')
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

/**
 * 计算距离某个时间点的剩余秒数
 * @param {string} expireAt ISO 时间字符串
 * @returns {number}
 */
function secondsUntil(expireAt) {
  const diff = new Date(expireAt.replace(/-/g, '/')) - Date.now()
  return Math.max(0, Math.floor(diff / 1000))
}

/**
 * 订单状态文本
 */
const ORDER_STATUS_MAP = {
  0: '待付款',
  1: '待发货',
  2: '已发货',
  3: '已完成',
  4: '申请退款',
  5: '退款中',
  6: '已退款',
  7: '已取消'
}

/**
 * 拼团状态文本
 */
const GROUP_STATUS_MAP = {
  1: '拼团中',
  2: '已成团',
  3: '已失败'
}

/**
 * 脱敏手机号（保留前3后4）
 * @param {string} phone
 */
function maskPhone(phone) {
  if (!phone || phone.length < 7) return phone
  return phone.slice(0, 3) + '****' + phone.slice(-4)
}

module.exports = {
  formatPrice,
  formatDate,
  formatCountdown,
  secondsUntil,
  ORDER_STATUS_MAP,
  GROUP_STATUS_MAP,
  maskPhone
}
