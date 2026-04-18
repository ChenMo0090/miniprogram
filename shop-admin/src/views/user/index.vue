<template>
  <div class="user-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">用户管理</h2>
    </div>

    <!-- 搜索筛选 -->
    <div class="filter-bar">
      <el-input
        v-model="searchForm.keyword"
        placeholder="搜索昵称/手机号"
        clearable
        style="width: 220px"
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select v-model="searchForm.status" placeholder="账号状态" clearable style="width: 120px">
        <el-option label="正常" :value="1" />
        <el-option label="已禁用" :value="0" />
      </el-select>
      <el-date-picker
        v-model="searchForm.dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="注册开始"
        end-placeholder="注册结束"
        value-format="YYYY-MM-DD"
        style="width: 260px"
      />
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <!-- 数据表格 -->
    <div class="table-card">
      <el-table :data="userList" v-loading="loading" stripe>
        <el-table-column type="index" width="50" />
        <el-table-column label="用户信息" min-width="220">
          <template #default="{ row }">
            <div class="user-info-cell">
              <el-avatar :size="44" :src="row.avatar">
                {{ row.nickname?.[0] || '?' }}
              </el-avatar>
              <div class="user-detail">
                <div class="user-name">{{ row.nickname }}</div>
                <div class="user-id">ID: {{ row.id }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="联系方式" width="160">
          <template #default="{ row }">
            <div class="contact-info">
              <div class="phone">{{ row.phone || '未绑定' }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="统计" width="180">
          <template #default="{ row }">
            <div class="stats-col">
              <div class="stat-item">
                <span class="label">订单:</span>
                <span class="value">{{ row.orderCount || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="label">拼团:</span>
                <span class="value">{{ row.groupCount || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="label">消费:</span>
                <span class="value">¥{{ row.totalSpend || 0 }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '正常' : '已禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="注册时间" width="160" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleDetail(row)">详情</el-button>
            <el-button 
              :type="row.status === 1 ? 'danger' : 'success'" 
              link 
              size="small" 
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 用户详情弹窗 -->
    <el-dialog v-model="detailVisible" title="用户详情" width="550px">
      <div v-if="currentUser" class="user-detail">
        <!-- 用户头部 -->
        <div class="detail-header">
          <el-avatar :size="64" :src="currentUser.avatar">
            {{ currentUser.nickname?.[0] || '?' }}
          </el-avatar>
          <div class="header-info">
            <div class="user-name">{{ currentUser.nickname }}</div>
            <div class="user-meta">
              <el-tag :type="currentUser.status === 1 ? 'success' : 'danger'" size="small">
                {{ currentUser.status === 1 ? '正常' : '已禁用' }}
              </el-tag>
              <span class="register-time">注册于 {{ currentUser.createTime }}</span>
            </div>
          </div>
        </div>

        <!-- 基本信息 -->
        <div class="detail-section">
          <div class="section-title">基本信息</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">用户ID</span>
              <span class="value">{{ currentUser.id }}</span>
            </div>
            <div class="info-item">
              <span class="label">手机号</span>
              <span class="value">{{ currentUser.phone || '未绑定' }}</span>
            </div>
            <div class="info-item">
              <span class="label">OpenID</span>
              <span class="value text-mono">{{ currentUser.openid ? currentUser.openid.slice(0, 16) + '...' : '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">最后登录</span>
              <span class="value">{{ currentUser.lastLoginTime || '-' }}</span>
            </div>
          </div>
        </div>

        <!-- 消费统计 -->
        <div class="detail-section">
          <div class="section-title">消费统计</div>
          <div class="stat-grid">
            <div class="stat-box">
              <div class="stat-num">{{ currentUser.orderCount || 0 }}</div>
              <div class="stat-label">累计订单</div>
            </div>
            <div class="stat-box">
              <div class="stat-num">{{ currentUser.groupCount || 0 }}</div>
              <div class="stat-label">参与拼团</div>
            </div>
            <div class="stat-box">
              <div class="stat-num">¥{{ currentUser.totalSpend || 0 }}</div>
              <div class="stat-label">累计消费</div>
            </div>
            <div class="stat-box">
              <div class="stat-num">¥{{ currentUser.totalRefund || 0 }}</div>
              <div class="stat-label">累计退款</div>
            </div>
          </div>
        </div>

        <!-- 最近订单 -->
        <div class="detail-section">
          <div class="section-title">最近订单</div>
          <div class="recent-orders">
            <div v-for="order in currentUser.recentOrders || []" :key="order.id" class="order-item">
              <el-image :src="order.productImage" class="order-img" fit="cover" />
              <div class="order-info">
                <div class="order-name">{{ order.productName }}</div>
                <div class="order-meta">
                  <span class="order-no">{{ order.orderNo }}</span>
                  <span class="order-time">{{ order.createTime }}</span>
                </div>
              </div>
              <div class="order-amount">
                <div class="amount">¥{{ order.totalAmount }}</div>
                <el-tag :type="getOrderStatusType(order.status)" size="small">
                  {{ getOrderStatusText(order.status) }}
                </el-tag>
              </div>
            </div>
            <div v-if="!(currentUser.recentOrders?.length)" class="empty-orders">
              暂无订单
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getUserList, getUserDetail, toggleUserStatus } from '@/api/admin'

const loading = ref(false)
const userList = ref([])
const searchForm = reactive({
  keyword: '',
  status: null,
  dateRange: []
})
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 详情弹窗
const detailVisible = ref(false)
const currentUser = ref(null)

const orderStatusMap = {
  0: { text: '待付款', type: 'warning' },
  1: { text: '已付款', type: 'info' },
  2: { text: '拼团中', type: 'primary' },
  3: { text: '待发货', type: 'info' },
  4: { text: '已发货', type: 'success' },
  5: { text: '申请退款', type: 'warning' },
  6: { text: '已退款', type: 'success' },
  7: { text: '已完成', type: 'success' }
}

const getOrderStatusText = (status) => orderStatusMap[status]?.text || '未知'
const getOrderStatusType = (status) => orderStatusMap[status]?.type || 'info'

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      size: pagination.size,
      keyword: searchForm.keyword,
      status: searchForm.status,
      startDate: searchForm.dateRange?.[0],
      endDate: searchForm.dateRange?.[1]
    }
    const res = await getUserList(params)
    userList.value = res.list || []
    pagination.total = res.total || 0
  } catch (e) {
    // 模拟数据
    userList.value = [
      { id: 10001, nickname: '小明', avatar: '', phone: '138****8888', orderCount: 12, groupCount: 8, totalSpend: 3580, status: 1, createTime: '2025-03-15 10:20:30' },
      { id: 10002, nickname: '小红', avatar: '', phone: '139****6666', orderCount: 5, groupCount: 3, totalSpend: 1280, status: 1, createTime: '2025-03-20 14:33:22' },
      { id: 10003, nickname: '小李', avatar: '', phone: '137****9999', orderCount: 0, groupCount: 0, totalSpend: 0, status: 0, createTime: '2025-04-01 09:15:00' },
      { id: 10004, nickname: '小王', avatar: '', phone: '136****5555', orderCount: 23, groupCount: 15, totalSpend: 6890, status: 1, createTime: '2025-02-28 16:45:10' }
    ]
    pagination.total = 4
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  loadData()
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.status = null
  searchForm.dateRange = []
  handleSearch()
}

const handleSizeChange = (val) => {
  pagination.size = val
  loadData()
}

const handlePageChange = (val) => {
  pagination.page = val
  loadData()
}

const handleDetail = async (row) => {
  try {
    const res = await getUserDetail(row.id)
    currentUser.value = res || {
      ...row,
      openid: 'oXGzXjN8KxKxKxKxKxKxKxKxKxKx',
      lastLoginTime: '2025-04-10 08:30:00',
      totalRefund: 299,
      recentOrders: [
        { id: 1, orderNo: 'NO.202504100001', productName: 'Nike 运动跑鞋', productImage: 'https://via.placeholder.com/50', totalAmount: 299, status: 3, createTime: '2025-04-10 10:20:30' },
        { id: 2, orderNo: 'NO.202504090002', productName: '气质项链 S925', productImage: 'https://via.placeholder.com/50', totalAmount: 128, status: 6, createTime: '2025-04-09 14:33:22' }
      ]
    }
    detailVisible.value = true
  } catch (e) {
    currentUser.value = {
      ...row,
      openid: 'oXGzXjN8KxKxKxKxKxKxKxKxKxKx',
      lastLoginTime: '2025-04-10 08:30:00',
      totalRefund: 299,
      recentOrders: [
        { id: 1, orderNo: 'NO.202504100001', productName: 'Nike 运动跑鞋', productImage: 'https://via.placeholder.com/50', totalAmount: 299, status: 3, createTime: '2025-04-10 10:20:30' },
        { id: 2, orderNo: 'NO.202504090002', productName: '气质项链 S925', productImage: 'https://via.placeholder.com/50', totalAmount: 128, status: 6, createTime: '2025-04-09 14:33:22' }
      ]
    }
    detailVisible.value = true
  }
}

const handleToggleStatus = async (row) => {
  const action = row.status === 1 ? '禁用' : '启用'
  const warning = row.status === 1 ? '禁用后该用户将无法登录小程序' : ''
  try {
    await ElMessageBox.confirm(`确定${action}该用户？${warning}`, '提示', { type: 'warning' })
    await toggleUserStatus(row.id, row.status === 1 ? 0 : 1)
    ElMessage.success(`${action}成功`)
    loadData()
  } catch (e) {}
}

onMounted(loadData)
</script>

<style scoped>
.user-page {
  max-width: 1400px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-main);
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.table-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.user-info-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-detail {
  flex: 1;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 2px;
}

.user-id {
  font-size: 11px;
  color: var(--text-hint);
  font-family: monospace;
}

.contact-info {
  font-size: 13px;
}

.phone {
  color: var(--text-main);
}

.stats-col {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-item {
  display: flex;
  gap: 6px;
  font-size: 12px;
}

.stat-item .label {
  color: var(--text-hint);
}

.stat-item .value {
  color: var(--text-main);
  font-weight: 600;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

/* 详情样式 */
.user-detail {
  max-height: 550px;
  overflow-y: auto;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 20px;
}

.header-info {
  flex: 1;
}

.header-info .user-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 8px;
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.register-time {
  font-size: 12px;
  color: var(--text-hint);
}

.detail-section {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border);
}

.detail-section:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 12px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item .label {
  font-size: 11px;
  color: var(--text-hint);
}

.info-item .value {
  font-size: 13px;
  color: var(--text-main);
}

.info-item .text-mono {
  font-family: monospace;
  font-size: 11px;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.stat-box {
  background: #f9fafb;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}

.stat-box .stat-num {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 4px;
}

.stat-box .stat-label {
  font-size: 11px;
  color: var(--text-secondary);
}

/* 最近订单 */
.recent-orders {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.order-img {
  width: 50px;
  height: 50px;
  border-radius: 6px;
  border: 1px solid var(--border);
}

.order-info {
  flex: 1;
}

.order-name {
  font-size: 13px;
  color: var(--text-main);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order-meta {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: var(--text-hint);
}

.order-no {
  font-family: monospace;
}

.order-amount {
  text-align: right;
}

.order-amount .amount {
  font-size: 14px;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 4px;
}

.empty-orders {
  text-align: center;
  padding: 24px;
  color: var(--text-hint);
  font-size: 13px;
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
