<template>
  <div class="group-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">拼团管理</h2>
    </div>

    <!-- 搜索筛选 -->
    <div class="filter-bar">
      <el-input
        v-model="searchForm.groupCode"
        placeholder="拼团编号"
        clearable
        style="width: 180px"
        @keyup.enter="handleSearch"
      />
      <el-input
        v-model="searchForm.productName"
        placeholder="商品名称"
        clearable
        style="width: 180px"
        @keyup.enter="handleSearch"
      />
      <el-select v-model="searchForm.status" placeholder="拼团状态" clearable style="width: 130px">
        <el-option label="进行中" :value="0" />
        <el-option label="已成团" :value="1" />
        <el-option label="已失败" :value="2" />
      </el-select>
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <!-- 数据表格 -->
    <div class="table-card">
      <el-table :data="groupList" v-loading="loading" stripe>
        <el-table-column type="index" width="50" />
        <el-table-column prop="groupCode" label="拼团编号" width="140">
          <template #default="{ row }">
            <span class="group-code">{{ row.groupCode }}</span>
          </template>
        </el-table-column>
        <el-table-column label="商品信息" min-width="220">
          <template #default="{ row }">
            <div class="product-info">
              <el-image :src="row.productImage" class="product-img" fit="cover" />
              <div class="product-detail">
                <div class="product-name">{{ row.productName }}</div>
                <div class="product-price">拼团价: ¥{{ row.groupPrice }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="拼团进度" width="160">
          <template #default="{ row }">
            <div class="progress-col">
              <div class="progress-text">
                <span class="current">{{ row.currentSize }}</span>
                <span class="sep">/</span>
                <span class="total">{{ row.groupSize }}人</span>
              </div>
              <el-progress 
                :percentage="Math.round((row.currentSize / row.groupSize) * 100)" 
                :color="getProgressColor(row.status)"
                :stroke-width="6"
                :show-text="false"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="发起人" width="140">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="24" :src="row.leaderAvatar" />
              <span class="user-name">{{ row.leaderName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="剩余时间" width="120">
          <template #default="{ row }">
            <span v-if="row.status === 0" class="countdown">{{ formatCountdown(row.expireTime) }}</span>
            <span v-else class="expired">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleDetail(row)">详情</el-button>
            <el-button 
              v-if="row.status === 0" 
              type="danger" 
              link 
              size="small" 
              @click="handleClose(row)"
            >
              关闭
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

    <!-- 拼团详情弹窗 -->
    <el-dialog v-model="detailVisible" title="拼团详情" width="600px">
      <div v-if="currentGroup" class="group-detail">
        <!-- 状态头部 -->
        <div :class="['detail-header', getHeaderClass(currentGroup.status)]">
          <div class="header-icon">{{ getHeaderIcon(currentGroup.status) }}</div>
          <div class="header-title">{{ getStatusText(currentGroup.status) }}</div>
          <div class="header-desc">{{ getHeaderDesc(currentGroup) }}</div>
        </div>

        <!-- 拼团信息 -->
        <div class="detail-section">
          <div class="section-title">拼团信息</div>
          <div class="detail-row">
            <span class="label">拼团编号：</span>
            <span class="value">{{ currentGroup.groupCode }}</span>
          </div>
          <div class="detail-row">
            <span class="label">拼团进度：</span>
            <span class="value">{{ currentGroup.currentSize }} / {{ currentGroup.groupSize }} 人</span>
          </div>
          <div class="detail-row">
            <span class="label">创建时间：</span>
            <span class="value">{{ currentGroup.createTime }}</span>
          </div>
          <div class="detail-row" v-if="currentGroup.status === 0">
            <span class="label">截止时间：</span>
            <span class="value">{{ currentGroup.expireTime }}</span>
          </div>
          <div class="detail-row" v-if="currentGroup.successTime">
            <span class="label">成团时间：</span>
            <span class="value">{{ currentGroup.successTime }}</span>
          </div>
        </div>

        <!-- 商品信息 -->
        <div class="detail-section">
          <div class="section-title">商品信息</div>
          <div class="detail-product">
            <el-image :src="currentGroup.productImage" class="detail-img" fit="cover" />
            <div class="detail-product-info">
              <div class="name">{{ currentGroup.productName }}</div>
              <div class="price">
                <span class="group-price">拼团价 ¥{{ currentGroup.groupPrice }}</span>
                <span class="original-price">原价 ¥{{ currentGroup.originalPrice }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 成员列表 -->
        <div class="detail-section">
          <div class="section-title">参团成员 ({{ currentGroup.currentSize }}/{{ currentGroup.groupSize }})</div>
          <div class="member-list">
            <div 
              v-for="(member, index) in currentGroup.members" 
              :key="index"
              :class="['member-item', { leader: member.role === 1 }]"
            >
              <div class="member-avatar">
                <el-avatar :size="40" :src="member.avatar">
                  {{ member.nickname?.[0] || '?' }}
                </el-avatar>
                <span v-if="member.role === 1" class="leader-badge">团长</span>
              </div>
              <div class="member-info">
                <div class="member-name">{{ member.nickname }}</div>
                <div class="member-time">{{ member.joinTime }}</div>
              </div>
              <div class="member-status">
                <el-tag :type="member.paid ? 'success' : 'warning'" size="small">
                  {{ member.paid ? '已支付' : '待支付' }}
                </el-tag>
              </div>
            </div>
            <!-- 空位展示 -->
            <div 
              v-for="n in (currentGroup.groupSize - currentGroup.currentSize)" 
              :key="'empty-'+n"
              class="member-item empty"
            >
              <div class="member-avatar empty-avatar">
                <el-icon :size="20"><Plus /></el-icon>
              </div>
              <div class="member-info">
                <div class="member-name">待加入</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getGroupList, getGroupDetail, closeGroup } from '@/api/admin'
import dayjs from 'dayjs'

const loading = ref(false)
const groupList = ref([])
const searchForm = reactive({
  groupCode: '',
  productName: '',
  status: null
})
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 详情弹窗
const detailVisible = ref(false)
const currentGroup = ref(null)

// 倒计时定时器
let countdownTimer = null

const statusMap = {
  0: { text: '进行中', type: 'primary' },
  1: { text: '已成团', type: 'success' },
  2: { text: '已失败', type: 'info' }
}

const getStatusText = (status) => statusMap[status]?.text || '未知'
const getStatusType = (status) => statusMap[status]?.type || 'info'

const getProgressColor = (status) => {
  const colors = { 0: '#6C3CE1', 1: '#10B981', 2: '#9CA3AF' }
  return colors[status] || '#6C3CE1'
}

const getHeaderClass = (status) => {
  const classes = { 0: 'ongoing', 1: 'success', 2: 'failed' }
  return classes[status] || 'ongoing'
}

const getHeaderIcon = (status) => {
  const icons = { 0: '⏳', 1: '✅', 2: '❌' }
  return icons[status] || '⏳'
}

const getHeaderDesc = (group) => {
  if (group.status === 0) return `还差 ${group.groupSize - group.currentSize} 人成团`
  if (group.status === 1) return '拼团成功，成员可申请退款'
  return '拼团失败，已自动退款'
}

const formatCountdown = (expireTime) => {
  const end = dayjs(expireTime)
  const now = dayjs()
  const diff = end.diff(now)
  if (diff <= 0) return '已过期'
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  return `${hours}时${minutes}分`
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getGroupList({
      page: pagination.page,
      size: pagination.size,
      ...searchForm
    })
    groupList.value = res.list || []
    pagination.total = res.total || 0
  } catch (e) {
    // 模拟数据
    groupList.value = [
      { id: 1, groupCode: 'G20250410001', productName: 'Nike 运动跑鞋', productImage: 'https://via.placeholder.com/60', groupPrice: 299, originalPrice: 599, currentSize: 2, groupSize: 3, status: 0, leaderName: '小明', leaderAvatar: '', createTime: '2025-04-10 10:20:30', expireTime: '2025-04-11 10:20:30' },
      { id: 2, groupCode: 'G20250409002', productName: '气质项链 S925', productImage: 'https://via.placeholder.com/60', groupPrice: 128, originalPrice: 268, currentSize: 3, groupSize: 3, status: 1, leaderName: '小红', leaderAvatar: '', createTime: '2025-04-09 14:30:00', successTime: '2025-04-09 16:45:22' },
      { id: 3, groupCode: 'G20250408003', productName: '智能手表', productImage: 'https://via.placeholder.com/60', groupPrice: 399, originalPrice: 799, currentSize: 1, groupSize: 3, status: 2, leaderName: '小李', leaderAvatar: '', createTime: '2025-04-08 09:00:00', expireTime: '2025-04-09 09:00:00' }
    ]
    pagination.total = 3
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  loadData()
}

const handleReset = () => {
  searchForm.groupCode = ''
  searchForm.productName = ''
  searchForm.status = null
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
    const res = await getGroupDetail(row.id)
    currentGroup.value = res || {
      ...row,
      members: [
        { nickname: '小明', avatar: '', role: 1, joinTime: '2025-04-10 10:20:30', paid: true },
        { nickname: '小红', avatar: '', role: 0, joinTime: '2025-04-10 11:15:22', paid: true }
      ]
    }
    detailVisible.value = true
  } catch (e) {
    currentGroup.value = {
      ...row,
      members: [
        { nickname: '小明', avatar: '', role: 1, joinTime: '2025-04-10 10:20:30', paid: true },
        { nickname: '小红', avatar: '', role: 0, joinTime: '2025-04-10 11:15:22', paid: true }
      ]
    }
    detailVisible.value = true
  }
}

const handleClose = async (row) => {
  try {
    await ElMessageBox.confirm('确定关闭该拼团？关闭后将自动退款给已支付成员', '警告', { type: 'warning' })
    await closeGroup(row.id)
    ElMessage.success('拼团已关闭')
    loadData()
  } catch (e) {}
}

// 启动倒计时刷新
const startCountdown = () => {
  countdownTimer = setInterval(() => {
    groupList.value = [...groupList.value]
  }, 60000)
}

onMounted(() => {
  loadData()
  startCountdown()
})

onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer)
})
</script>

<style scoped>
.group-page {
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

.group-code {
  font-family: monospace;
  font-size: 12px;
  color: var(--text-secondary);
}

.product-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.product-img {
  width: 50px;
  height: 50px;
  border-radius: 6px;
  border: 1px solid var(--border);
}

.product-detail {
  flex: 1;
}

.product-name {
  font-size: 13px;
  color: var(--text-main);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 4px;
}

.product-price {
  font-size: 12px;
  color: var(--primary);
  font-weight: 600;
}

.progress-col {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.progress-text {
  font-size: 13px;
}

.progress-text .current {
  color: var(--primary);
  font-weight: 700;
}

.progress-text .sep {
  color: var(--text-hint);
  margin: 0 2px;
}

.progress-text .total {
  color: var(--text-secondary);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name {
  font-size: 13px;
  color: var(--text-main);
}

.countdown {
  font-size: 12px;
  color: var(--danger);
  font-weight: 600;
}

.expired {
  font-size: 12px;
  color: var(--text-hint);
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

/* 详情样式 */
.group-detail {
  max-height: 550px;
  overflow-y: auto;
}

.detail-header {
  text-align: center;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 20px;
  color: white;
}

.detail-header.ongoing {
  background: linear-gradient(135deg, #6C3CE1, #9B5DE5);
}

.detail-header.success {
  background: linear-gradient(135deg, #10B981, #34D399);
}

.detail-header.failed {
  background: linear-gradient(135deg, #6B7280, #9CA3AF);
}

.header-icon {
  font-size: 36px;
  margin-bottom: 8px;
}

.header-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
}

.header-desc {
  font-size: 13px;
  opacity: 0.9;
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

.detail-row {
  display: flex;
  margin-bottom: 8px;
  font-size: 13px;
}

.detail-row .label {
  color: var(--text-secondary);
  width: 80px;
  flex-shrink: 0;
}

.detail-row .value {
  color: var(--text-main);
  flex: 1;
}

.detail-product {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.detail-img {
  width: 70px;
  height: 70px;
  border-radius: 6px;
}

.detail-product-info {
  flex: 1;
}

.detail-product-info .name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 8px;
}

.detail-product-info .price {
  display: flex;
  gap: 12px;
  align-items: center;
}

.group-price {
  color: var(--primary);
  font-weight: 700;
  font-size: 15px;
}

.original-price {
  color: var(--text-hint);
  font-size: 12px;
  text-decoration: line-through;
}

/* 成员列表 */
.member-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.member-item.empty {
  background: transparent;
  border: 1px dashed var(--border);
}

.member-avatar {
  position: relative;
}

.leader-badge {
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--gold);
  color: white;
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 8px;
  font-weight: 700;
}

.empty-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-hint);
}

.member-info {
  flex: 1;
}

.member-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 2px;
}

.member-time {
  font-size: 11px;
  color: var(--text-hint);
}
</style>
