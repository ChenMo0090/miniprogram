import request from './request'

// 登录
export const login = (data) => request.post('/admin/login', data)

// 仪表盘统计
export const getDashboardStats = () => request.get('/admin/dashboard/stats')
export const getDashboardChart = (params) => request.get('/admin/dashboard/chart', { params })

// 商品管理
export const getProductList = (params) => request.get('/admin/product/list', { params })
export const getProductDetail = (id) => request.get(`/admin/product/${id}`)
export const createProduct = (data) => request.post('/admin/product/add', data)
export const updateProduct = (id, data) => request.put(`/admin/product/${id}`, data)
export const deleteProduct = (id) => request.delete(`/admin/product/${id}`)
export const toggleProductStatus = (id, status) => request.put(`/admin/product/${id}/status/${status}`)

// 订单管理
export const getOrderList = (params) => request.get('/admin/order/list', { params })
export const getOrderDetail = (id) => request.get(`/admin/order/${id}`)
export const shipOrder = (id, data) => request.put(`/admin/order/${id}/ship`, data)

// 拼团管理
export const getGroupList = (params) => request.get('/admin/group/list', { params })
export const getGroupDetail = (id) => request.get(`/admin/group/${id}`)
export const closeGroup = (id) => request.put(`/admin/group/${id}/close`)

// 用户管理
export const getUserList = (params) => request.get('/admin/user/list', { params })
export const getUserDetail = (id) => request.get(`/admin/user/${id}`)
export const toggleUserStatus = (id, status) => request.put(`/admin/user/${id}/status`, { status })

// 退款管理
export const getRefundList = (params) => request.get('/admin/refund/list', { params })
export const getRefundDetail = (id) => request.get(`/admin/refund/${id}`)
export const processRefund = (id, data) => request.put(`/admin/refund/${id}/process`, data)
