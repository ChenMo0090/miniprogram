<template>
  <div class="order-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">订单管理</h2>
    </div>

    <!-- 搜索筛选 -->
    <div class="filter-bar">
      <el-input
        v-model="searchForm.orderNo"
        placeholder="订单号"
        clearable
        style="width: 180px"
        @keyup.enter="handleSearch"
      />
      <el-input
        v-model="searchForm.userName"
        placeholder="用户昵称"
        clearable
        style="width: 150px"
        @keyup.enter="handleSearch"
      />
      <el-select v-model="searchForm.status" placeholder="订单状态" clearable style="width: 130px">
        <el-option label="待付款" :value="0" />
        <el-option label="已付款" :value="1" />
        <el-option label="拼团中" :value="2" />
        <el-option label="待发货" :value="3" />
        <el-option label="已发货" :value="4" />
        <el-option label="已完成" :value="7" />
      </el-select>
      <el-date-picker
        v-model="searchForm.dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="YYYY-MM-DD"
        style="width: 260px"
      />
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <!-- 数据表格 -->
    <div class="table-card">
      <el-table :data="orderList" v-loading="loading" stripe>
        <el-table-column type="index" width="50" />
        <el-table-column prop="orderNo" label="订单号" width="140">
          <template #default="{ row }">
            <span class="order-no">{{ row.orderNo }}</span>
          </template>
        </el-table-column>
        <el-table-column label="商品信息" min-width="220">
          <template #default="{ row }">
            <div class="product-info">
              <el-image :src="row.productImage" class="product-img" fit="cover" />
              <div class="product-name">{{ row.productName }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="用户信息" width="140">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="24" :src="row.userAvatar" />
              <span class="user-name">{{ row.userName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="金额" width="120">
          <template #default="{ row }">
            <div class="amount-col">
              <div class="pay-amount">¥{{ row.totalAmount }}</div>
              <div class="item-price">单价: ¥{{ row.productPrice }}</div>
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
        <el-table-column prop="createTime" label="下单时间" width="160" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleDetail(row)">详情</el-button>
            <el-button 
              v-if="row.status === 3" 
              type="success" 
              link 
              size="small" 
              @click="handleShip(row)"
            >
              发货
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

    <!-- 订单详情弹窗 -->
    <el-dialog v-model="detailVisible" title="订单详情" width="600px">
      <div v-if="currentOrder" class="order-detail">
        <div class="detail-section">
          <div class="section-title">订单信息</div>
          <div class="detail-row">
            <span class="label">订单号：</span>
            <span class="value">{{ currentOrder.orderNo }}</span>
          </div>
          <div class="detail-row">
            <span class="label">订单状态：</span>
            <el-tag :type="getStatusType(currentOrder.status)" size="small">
              {{ getStatusText(currentOrder.status) }}
            </el-tag>
          </div>
          <div class="detail-row">
            <span class="label">下单时间：</span>
            <span class="value">{{ currentOrder.createTime }}</span>
          </div>
          <div class="detail-row">
            <span class="label">支付时间：</span>
            <span class="value">{{ currentOrder.paidAt || '-' }}</span>
          </div>
        </div>

        <div class="detail-section">
          <div class="section-title">商品信息</div>
          <div class="detail-product">
            <el-image :src="currentOrder.productImage" class="detail-img" fit="cover" />
            <div class="detail-product-info">
              <div class="name">{{ currentOrder.productName }}</div>
              <div class="spec">{{ currentOrder.specName || '默认规格' }}</div>
              <div class="price">¥{{ currentOrder.productPrice }} × {{ currentOrder.quantity || 1 }}</div>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <div class="section-title">收货信息</div>
          <div class="detail-row">
            <span class="label">收货人：</span>
            <span class="value">{{ currentOrder.receiverName || '-' }}</span>
          </div>
          <div class="detail-row">
            <span class="label">手机号：</span>
            <span class="value">{{ currentOrder.receiverPhone || '-' }}</span>
          </div>
          <div class="detail-row">
            <span class="label">收货地址：</span>
            <span class="value">{{ currentOrder.receiverAddress || '-' }}</span>
          </div>
        </div>

        <div class="detail-section" v-if="currentOrder.status >= 4">
          <div class="section-title">物流信息</div>
          <div class="detail-row">
            <span class="label">快递公司：</span>
            <span class="value">{{ currentOrder.shipCompany || '-' }}</span>
          </div>
          <div class="detail-row">
            <span class="label">快递单号：</span>
            <span class="value">{{ currentOrder.shipNo || '-' }}</span>
          </div>
        </div>

        <div class="detail-section">
          <div class="section-title">金额明细</div>
          <div class="amount-detail">
            <div class="amount-row">
              <span>商品金额</span>
              <span>¥{{ currentOrder.productAmount || currentOrder.totalAmount }}</span>
            </div>
            <div class="amount-row">
              <span>运费</span>
              <span>¥{{ currentOrder.freightAmount || 0 }}</span>
            </div>
            <div class="amount-row total">
              <span>实付金额</span>
              <span class="total-amount">¥{{ currentOrder.totalAmount }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 发货弹窗 -->
    <el-dialog v-model="shipVisible" title="订单发货" width="450px">
      <el-form ref="shipFormRef" :model="shipForm" :rules="shipRules" label-width="100px">
        <el-form-item label="快递公司" prop="shipCompany">
          <el-select v-model="shipForm.shipCompany" placeholder="请选择快递公司" style="width: 100%">
            <el-option label="顺丰速运" value="顺丰速运" />
            <el-option label="中通快递" value="中通快递" />
            <el-option label="圆通速递" value="圆通速递" />
            <el-option label="韵达快递" value="韵达快递" />
            <el-option label="申通快递" value="申通快递" />
            <el-option label="EMS" value="EMS" />
          </el-select>
        </el-form-item>
        <el-form-item label="快递单号" prop="shipNo">
          <el-input v-model="shipForm.shipNo" placeholder="请输入快递单号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="shipVisible = false">取消</el-button>
        <el-button type="primary" @click="handleShipSubmit" :loading="shipLoading">确认发货</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getOrderList, getOrderDetail, shipOrder } from '@/api/admin'

const loading = ref(false)
const orderList = ref([])
const searchForm = reactive({
  orderNo: '',
  userName: '',
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
const currentOrder = ref(null)

// 发货弹窗
const shipVisible = ref(false)
const shipLoading = ref(false)
const shipFormRef = ref(null)
const shipForm = reactive({
  orderId: null,
  shipCompany: '',
  shipNo: ''
})
const shipRules = {
  shipCompany: [{ required: true, message: '请选择快递公司', trigger: 'change' }],
  shipNo: [{ required: true, message: '请输入快递单号', trigger: 'blur' }]
}

const statusMap = {
  0: { text: '待付款', type: 'warning' },
  1: { text: '已付款', type: 'info' },
  2: { text: '拼团中', type: 'primary' },
  3: { text: '待发货', type: 'info' },
  4: { text: '已发货', type: 'success' },
  5: { text: '申请退款', type: 'warning' },
  6: { text: '已退款', type: 'success' },
  7: { text: '已完成', type: 'success' }
}

const getStatusText = (status) => statusMap[status]?.text || '未知'
const getStatusType = (status) => statusMap[status]?.type || 'info'

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      size: pagination.size,
      orderNo: searchForm.orderNo,
      userName: searchForm.userName,
      status: searchForm.status,
      startDate: searchForm.dateRange?.[0],
      endDate: searchForm.dateRange?.[1]
    }
    const res = await getOrderList(params)
    orderList.value = res.list || []
    pagination.total = res.total || 0
  } catch (e) {
    // 模拟数据
    orderList.value = [
      { id: 1, orderNo: 'NO.202504100001', productName: 'Nike 运动跑鞋', productImage: 'https://via.placeholder.com/60', productPrice: 299, totalAmount: 299, status: 3, userName: '小明', userAvatar: '', createTime: '2025-04-10 10:20:30', receiverName: '张三', receiverPhone: '138****8888', receiverAddress: '北京市朝阳区xxx街道' },
      { id: 2, orderNo: 'NO.202504100002', productName: '气质项链 S925', productImage: 'https://via.placeholder.com/60', productPrice: 128, totalAmount: 128, status: 2, userName: '小红', userAvatar: '', createTime: '2025-04-10 09:15:22', paidAt: '2025-04-10 09:16:05' },
      { id: 3, orderNo: 'NO.202504090003', productName: '智能手表', productImage: 'https://via.placeholder.com/60', productPrice: 399, totalAmount: 399, status: 4, userName: '小李', userAvatar: '', createTime: '2025-04-09 16:45:10', paidAt: '2025-04-09 16:46:30', shipCompany: '顺丰速运', shipNo: 'SF1234567890' },
      { id: 4, orderNo: 'NO.202504090004', productName: '大容量背包', productImage: 'https://via.placeholder.com/60', productPrice: 199, totalAmount: 199, status: 7, userName: '小王', userAvatar: '', createTime: '2025-04-08 14:30:00', paidAt: '2025-04-08 14:31:15', shipCompany: '中通快递', shipNo: 'ZT9876543210' }
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
  searchForm.orderNo = ''
  searchForm.userName = ''
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
    const res = await getOrderDetail(row.id)
    currentOrder.value = res || row
    detailVisible.value = true
  } catch (e) {
    currentOrder.value = row
    detailVisible.value = true
  }
}

const handleShip = (row) => {
  shipForm.orderId = row.id
  shipForm.shipCompany = ''
  shipForm.shipNo = ''
  shipVisible.value = true
}

const handleShipSubmit = async () => {
  const valid = await shipFormRef.value?.validate().catch(() => false)
  if (!valid) return

  shipLoading.value = true
  try {
    await shipOrder(shipForm.orderId, {
      shipCompany: shipForm.shipCompany,
      shipNo: shipForm.shipNo
    })
    ElMessage.success('发货成功')
    shipVisible.value = false
    loadData()
  } finally {
    shipLoading.value = false
  }
}

onMounted(loadData)
</script>

<style scoped>
.order-page {
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

.order-no {
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

.product-name {
  font-size: 13px;
  color: var(--text-main);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

.amount-col {
  display: flex;
  flex-direction: column;
}

.pay-amount {
  font-weight: 700;
  color: var(--primary);
  font-size: 14px;
}

.item-price {
  font-size: 11px;
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
.order-detail {
  max-height: 500px;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border);
}

.detail-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
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
  margin-bottom: 4px;
}

.detail-product-info .spec {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.detail-product-info .price {
  font-size: 13px;
  color: var(--primary);
  font-weight: 600;
}

.amount-detail {
  background: #f9fafb;
  border-radius: 8px;
  padding: 12px;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--text-secondary);
}

.amount-row.total {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed var(--border);
  font-size: 14px;
  font-weight: 700;
  color: var(--text-main);
}

.total-amount {
  color: var(--primary);
  font-size: 16px;
}
</style>
