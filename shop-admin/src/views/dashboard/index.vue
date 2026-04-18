<template>
  <div class="dashboard-page">
    <!-- 日期标题 -->
    <div class="date-header">
      <el-icon><Calendar /></el-icon>
      <span>今日数据 · {{ today }}</span>
    </div>

    <!-- 统计卡片 -->
    <div class="stat-grid">
      <div class="stat-card purple">
        <div class="stat-icon">💰</div>
        <div class="stat-num">¥{{ formatNumber(stats.todaySales) }}</div>
        <div class="stat-label">今日销售额</div>
        <div class="stat-trend up">
          <el-icon><ArrowUp /></el-icon>
          <span>23%</span>
        </div>
      </div>
      <div class="stat-card blue">
        <div class="stat-icon">📋</div>
        <div class="stat-num">{{ stats.todayOrders }}</div>
        <div class="stat-label">今日订单数</div>
        <div class="stat-trend up">
          <el-icon><ArrowUp /></el-icon>
          <span>15%</span>
        </div>
      </div>
      <div class="stat-card gold">
        <div class="stat-icon">👥</div>
        <div class="stat-num">{{ stats.ongoingGroups }}</div>
        <div class="stat-label">进行中拼团</div>
        <div class="stat-trend ok">{{ stats.nearComplete }}个即将完成</div>
      </div>
      <div class="stat-card green">
        <div class="stat-icon">💸</div>
        <div class="stat-num">¥{{ formatNumber(stats.todayRefund) }}</div>
        <div class="stat-label">今日退款额</div>
        <div class="stat-trend neutral">{{ stats.refundCount }}笔完成</div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="chart-section">
      <div class="chart-card">
        <div class="card-header">
          <span class="card-title">销售趋势</span>
          <el-radio-group v-model="chartPeriod" size="small">
            <el-radio-button label="week">近7天</el-radio-button>
            <el-radio-button label="month">近30天</el-radio-button>
          </el-radio-group>
        </div>
        <v-chart class="chart" :option="salesChartOption" autoresize />
      </div>
    </div>

    <!-- 数据表格区域 -->
    <div class="tables-section">
      <!-- 最新订单 -->
      <div class="table-card">
        <div class="card-header">
          <span class="card-title">最新订单</span>
          <el-button type="primary" link @click="$router.push('/order')">
            查看全部 <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
        <el-table :data="latestOrders" size="small" stripe>
          <el-table-column prop="orderNo" label="订单号" width="120">
            <template #default="{ row }">
              <span class="order-no">{{ row.orderNo }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="productName" label="商品" min-width="150" show-overflow-tooltip />
          <el-table-column prop="totalAmount" label="金额" width="100">
            <template #default="{ row }">
              <span class="amount">¥{{ row.totalAmount }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getOrderTagType(row.status)" size="small">
                {{ getOrderStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 待处理退款 -->
      <div class="table-card">
        <div class="card-header">
          <span class="card-title">待处理退款</span>
          <el-button type="primary" link @click="$router.push('/refund')">
            去处理 <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
        <el-table :data="pendingRefunds" size="small" stripe>
          <el-table-column prop="refundNo" label="退款单" width="120">
            <template #default="{ row }">
              <span class="order-no">{{ row.refundNo }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="amount" label="金额" width="100">
            <template #default="{ row }">
              <span class="amount primary">¥{{ row.amount }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getRefundTagType(row.status)" size="small">
                {{ getRefundStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="90" align="center">
            <template #default="{ row }">
              <el-button type="success" link size="small" @click="handleRefund(row)">
                执行退款
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { Calendar, ArrowUp, ArrowRight } from '@element-plus/icons-vue'
import { getDashboardStats, getDashboardChart } from '@/api/admin'
import dayjs from 'dayjs'

use([CanvasRenderer, LineChart, BarChart, GridComponent, TooltipComponent, LegendComponent])

const today = computed(() => dayjs().format('YYYY-MM-DD'))
const chartPeriod = ref('week')

// 统计数据
const stats = ref({
  todaySales: 12830,
  todayOrders: 86,
  ongoingGroups: 34,
  nearComplete: 12,
  todayRefund: 3280,
  refundCount: 8
})

// 最新订单
const latestOrders = ref([
  { orderNo: 'NO.0001', productName: 'Nike 运动跑鞋', totalAmount: 299, status: 2 },
  { orderNo: 'NO.0002', productName: '气质项链 S925', totalAmount: 128, status: 6 },
  { orderNo: 'NO.0003', productName: '大容量背包', totalAmount: 199, status: 0 },
  { orderNo: 'NO.0004', productName: '智能手表', totalAmount: 399, status: 5 }
])

// 待处理退款
const pendingRefunds = ref([
  { refundNo: 'RF0004', amount: 399, status: 0 },
  { refundNo: 'RF0005', amount: 128, status: 0 }
])

// 图表配置
const salesChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: chartPeriod.value === 'week' 
      ? ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
      : Array.from({ length: 15 }, (_, i) => `${i + 1}日`),
    axisLine: { lineStyle: { color: '#E5E7EB' } },
    axisLabel: { color: '#6B7280' }
  },
  yAxis: {
    type: 'value',
    axisLine: { show: false },
    splitLine: { lineStyle: { color: '#F3F4F6' } },
    axisLabel: { color: '#6B7280' }
  },
  series: [
    {
      name: '销售额',
      type: 'line',
      smooth: true,
      data: chartPeriod.value === 'week'
        ? [8200, 9320, 9010, 11340, 12900, 13300, 12830]
        : Array.from({ length: 15 }, () => Math.floor(Math.random() * 5000 + 8000)),
      itemStyle: { color: '#6C3CE1' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(108,60,225,0.3)' },
            { offset: 1, color: 'rgba(108,60,225,0.05)' }
          ]
        }
      }
    }
  ]
}))

// 工具函数
const formatNumber = (num) => {
  return num?.toLocaleString() || '0'
}

const getOrderStatusText = (status) => {
  const map = { 0: '待付款', 1: '已付款', 2: '拼团中', 3: '待发货', 4: '已发货', 5: '申请退款', 6: '已退款', 7: '已完成' }
  return map[status] || '未知'
}

const getOrderTagType = (status) => {
  const map = { 0: 'warning', 1: 'info', 2: 'primary', 3: 'info', 4: 'success', 5: 'warning', 6: 'success', 7: 'success' }
  return map[status] || 'info'
}

const getRefundStatusText = (status) => {
  const map = { 0: '待处理', 1: '处理中', 2: '已完成', 3: '已拒绝' }
  return map[status] || '未知'
}

const getRefundTagType = (status) => {
  const map = { 0: 'warning', 1: 'info', 2: 'success', 3: 'danger' }
  return map[status] || 'info'
}

const handleRefund = (row) => {
  console.log('处理退款', row)
}

onMounted(async () => {
  try {
    const data = await getDashboardStats()
    if (data) stats.value = { ...stats.value, ...data }
  } catch (e) {
    // 使用默认数据
  }
})
</script>

<style scoped>
.dashboard-page {
  max-width: 1400px;
}

.date-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 16px;
  font-weight: 500;
}

/* 统计卡片 */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  position: relative;
  overflow: hidden;
}

.stat-card::after {
  content: '';
  position: absolute;
  right: -20px;
  bottom: -20px;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  opacity: 0.04;
}

.stat-card.purple::after { background: var(--primary); }
.stat-card.blue::after { background: var(--info); }
.stat-card.gold::after { background: var(--gold); }
.stat-card.green::after { background: var(--success); }

.stat-icon {
  font-size: 28px;
  margin-bottom: 10px;
}

.stat-num {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 4px;
}

.stat-card.purple .stat-num { color: var(--primary); }
.stat-card.blue .stat-num { color: var(--info); }
.stat-card.gold .stat-num { color: var(--gold); }
.stat-card.green .stat-num { color: var(--success); }

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.stat-trend {
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-trend.up { color: var(--danger); }
.stat-trend.ok { color: var(--success); }
.stat-trend.neutral { color: var(--text-hint); }

/* 图表 */
.chart-section {
  margin-bottom: 20px;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-main);
}

.chart {
  height: 280px;
}

/* 表格区域 */
.tables-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
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

.amount {
  font-weight: 600;
  color: var(--text-main);
}

.amount.primary {
  color: var(--primary);
}

@media (max-width: 1200px) {
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .tables-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stat-grid {
    grid-template-columns: 1fr;
  }
}
</style>
