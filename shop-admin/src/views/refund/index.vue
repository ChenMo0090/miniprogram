<template>
  <div class="refund-page">
    <div class="page-header">
      <h2 class="page-title">退款管理</h2>
    </div>
    <div class="filter-bar">
      <el-input v-model="searchForm.refundNo" placeholder="退款单号" clearable style="width: 180px" />
      <el-input v-model="searchForm.orderNo" placeholder="订单号" clearable style="width: 180px" />
      <el-select v-model="searchForm.status" placeholder="退款状态" clearable style="width: 130px">
        <el-option label="待处理" :value="0" />
        <el-option label="处理中" :value="1" />
        <el-option label="已完成" :value="2" />
        <el-option label="已拒绝" :value="3" />
      </el-select>
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>
    <div class="stat-cards">
      <div class="stat-item"><div class="stat-icon pending">⏳</div><div class="stat-info"><div class="stat-num">{{ stats.pending }}</div><div class="stat-label">待处理</div></div></div>
      <div class="stat-item"><div class="stat-icon processing">🔄</div><div class="stat-info"><div class="stat-num">{{ stats.processing }}</div><div class="stat-label">处理中</div></div></div>
      <div class="stat-item"><div class="stat-icon completed">✅</div><div class="stat-info"><div class="stat-num">{{ stats.completed }}</div><div class="stat-label">已完成</div></div></div>
      <div class="stat-item"><div class="stat-icon amount">💰</div><div class="stat-info"><div class="stat-num">¥{{ stats.totalAmount }}</div><div class="stat-label">今日退款额</div></div></div>
    </div>
    <div class="table-card">
      <el-table :data="refundList" v-loading="loading" stripe>
        <el-table-column type="index" width="50" />
        <el-table-column prop="refundNo" label="退款单号" width="140" />
        <el-table-column prop="orderNo" label="订单号" width="140" />
        <el-table-column label="用户信息" width="140"><template #default="{ row }"><div class="user-info"><el-avatar :size="28" :src="row.userAvatar" /><span class="user-name">{{ row.userName }}</span></div></template></el-table-column>
        <el-table-column label="退款金额" width="120"><template #default="{ row }"><div class="amount-cell"><div class="refund-amount">¥{{ row.amount }}</div></div></template></el-table-column>
        <el-table-column label="状态" width="100"><template #default="{ row }"><el-tag :type="getStatusType(row.status)" size="small">{{ getStatusText(row.status) }}</el-tag></template></el-table-column>
        <el-table-column prop="createTime" label="申请时间" width="160" />
        <el-table-column label="操作" width="150" fixed="right"><template #default="{ row }"><el-button type="primary" link size="small" @click="handleDetail(row)">详情</el-button><el-button v-if="row.status === 0" type="success" link size="small" @click="handleProcess(row)">处理</el-button></template></el-table-column>
      </el-table>
      <div class="pagination"><el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.size" :total="pagination.total" layout="total, prev, pager, next" /></div>
    </div>
    <el-dialog v-model="detailVisible" title="退款详情" width="500px"><div v-if="currentRefund"><p>退款单号: {{ currentRefund.refundNo }}</p><p>金额: ¥{{ currentRefund.amount }}</p></div></el-dialog>
    <el-dialog v-model="processVisible" title="处理退款" width="400px"><el-form :model="processForm"><el-form-item label="处理"><el-radio-group v-model="processForm.action"><el-radio label="approve">同意</el-radio><el-radio label="reject">拒绝</el-radio></el-radio-group></el-form-item></el-form><template #footer><el-button @click="processVisible = false">取消</el-button><el-button type="primary" @click="handleProcessSubmit">确认</el-button></template></el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getRefundList, processRefund } from '@/api/admin'

const loading = ref(false)
const refundList = ref([])
const searchForm = reactive({ refundNo: '', orderNo: '', status: null })
const pagination = reactive({ page: 1, size: 10, total: 0 })
const stats = ref({ pending: 5, processing: 2, completed: 128, totalAmount: 3280 })
const detailVisible = ref(false)
const currentRefund = ref(null)
const processVisible = ref(false)
const processForm = reactive({ action: 'approve', note: '' })

const statusMap = { 0: { text: '待处理', type: 'warning' }, 1: { text: '处理中', type: 'info' }, 2: { text: '已完成', type: 'success' }, 3: { text: '已拒绝', type: 'danger' } }
const getStatusText = (s) => statusMap[s]?.text || '未知'
const getStatusType = (s) => statusMap[s]?.type || 'info'

const loadData = async () => {
  loading.value = true
  try {
    const res = await getRefundList({ page: pagination.page, size: pagination.size, ...searchForm })
    refundList.value = res?.list || [
      { id: 1, refundNo: 'RF202504100001', orderNo: 'NO.202504090002', userName: '小红', userAvatar: '', amount: 128, status: 0, createTime: '2025-04-10 09:30:00' },
      { id: 2, refundNo: 'RF202504090002', orderNo: 'NO.202504080003', userName: '小李', userAvatar: '', amount: 399, status: 2, createTime: '2025-04-09 10:00:00' }
    ]
    pagination.total = res?.total || 2
  } finally { loading.value = false }
}
const handleSearch = () => { pagination.page = 1; loadData() }
const handleReset = () => { searchForm.refundNo = ''; searchForm.orderNo = ''; searchForm.status = null; handleSearch() }
const handleDetail = (row) => { currentRefund.value = row; detailVisible.value = true }
const handleProcess = (row) => { currentRefund.value = row; processVisible.value = true }
const handleProcessSubmit = async () => {
  await processRefund(currentRefund.value.id, processForm)
  ElMessage.success('处理成功')
  processVisible.value = false
  loadData()
}
onMounted(loadData)
</script>

<style scoped>
.refund-page { max-width: 1400px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-title { font-size: 20px; font-weight: 700; color: var(--text-main); }
.filter-bar { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.stat-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px; }
.stat-item { background: white; border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
.stat-icon.pending { background: rgba(245,158,11,0.1); }
.stat-icon.processing { background: rgba(59,130,246,0.1); }
.stat-icon.completed { background: rgba(16,185,129,0.1); }
.stat-icon.amount { background: rgba(108,60,225,0.1); }
.stat-num { font-size: 20px; font-weight: 800; color: var(--text-main); }
.stat-label { font-size: 12px; color: var(--text-secondary); }
.table-card { background: white; border-radius: 12px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.user-info { display: flex; align-items: center; gap: 8px; }
.refund-amount { font-weight: 700; color: var(--primary); font-size: 14px; }
.pagination { display: flex; justify-content: flex-end; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border); }
</style>
