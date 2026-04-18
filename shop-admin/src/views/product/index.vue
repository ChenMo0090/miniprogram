<template>
  <div class="product-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">商品管理</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>新增商品
      </el-button>
    </div>

    <!-- 搜索筛选 -->
    <div class="filter-bar">
      <el-input
        v-model="searchForm.keyword"
        placeholder="搜索商品名称"
        clearable
        style="width: 240px"
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select v-model="searchForm.categoryId" placeholder="全部分类" clearable style="width: 140px">
        <el-option label="服饰" :value="1" />
        <el-option label="食品" :value="2" />
        <el-option label="美妆" :value="3" />
        <el-option label="家居" :value="4" />
      </el-select>
      <el-select v-model="searchForm.status" placeholder="全部状态" clearable style="width: 120px">
        <el-option label="上架中" :value="1" />
        <el-option label="已下架" :value="0" />
      </el-select>
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <!-- 数据表格 -->
    <div class="table-card">
      <el-table :data="productList" v-loading="loading" stripe>
        <el-table-column type="index" width="50" />
        <el-table-column label="商品信息" min-width="280">
          <template #default="{ row }">
            <div class="product-info">
              <el-image :src="row.mainImage" class="product-img" fit="cover" />
              <div class="product-detail">
                <div class="product-name">{{ row.name }}</div>
                <div class="product-category">{{ row.categoryName }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="价格" width="180">
          <template #default="{ row }">
            <div class="price-col">
              <div class="group-price">
                <span class="label">拼团价</span>
                <span class="value">¥{{ row.groupPrice }}</span>
              </div>
              <div class="original-price">
                <span class="label">原价</span>
                <span class="value">¥{{ row.originalPrice }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100" />
        <el-table-column prop="sales" label="销量" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '上架中' : '已下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button 
              :type="row.status === 1 ? 'warning' : 'success'" 
              link 
              size="small" 
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? '下架' : '上架' }}
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
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

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增商品' : '编辑商品'"
      width="700px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="商品分类" prop="categoryId">
          <el-select v-model="form.categoryId" placeholder="请选择分类" style="width: 100%">
            <el-option label="服饰" :value="1" />
            <el-option label="食品" :value="2" />
            <el-option label="美妆" :value="3" />
            <el-option label="家居" :value="4" />
          </el-select>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="拼团价格" prop="groupPrice">
              <el-input-number v-model="form.groupPrice" :min="0.01" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="原价" prop="originalPrice">
              <el-input-number v-model="form.originalPrice" :min="0.01" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="库存" prop="stock">
              <el-input-number v-model="form.stock" :min="0" :precision="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="拼团人数" prop="groupSize">
              <el-input-number v-model="form.groupSize" :min="2" :max="10" :precision="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="拼团时长" prop="groupHours">
          <el-input-number v-model="form.groupHours" :min="1" :max="72" :precision="0" style="width: 150px">
            <template #append>小时</template>
          </el-input-number>
        </el-form-item>
        <el-form-item label="商品主图" prop="mainImage">
          <el-upload
            class="avatar-uploader"
            action="/api/upload"
            :show-file-list="false"
            :on-success="handleUploadSuccess"
          >
            <img v-if="form.mainImage" :src="form.mainImage" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="商品详情" prop="detail">
          <el-input v-model="form.detail" type="textarea" :rows="4" placeholder="请输入商品详情描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { getProductList, createProduct, updateProduct, deleteProduct, toggleProductStatus } from '@/api/admin'

const loading = ref(false)
const productList = ref([])
const searchForm = reactive({
  keyword: '',
  categoryId: null,
  status: null
})
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 弹窗相关
const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref(null)
const submitting = ref(false)
const form = reactive({
  id: null,
  name: '',
  categoryId: null,
  groupPrice: 99,
  originalPrice: 199,
  stock: 100,
  groupSize: 3,
  groupHours: 24,
  mainImage: '',
  detail: ''
})

const rules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  groupPrice: [{ required: true, message: '请输入拼团价', trigger: 'blur' }],
  originalPrice: [{ required: true, message: '请输入原价', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur' }],
  groupSize: [{ required: true, message: '请输入拼团人数', trigger: 'blur' }],
  mainImage: [{ required: true, message: '请上传商品主图', trigger: 'change' }]
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await getProductList({
      page: pagination.page,
      size: pagination.size,
      ...searchForm
    })
    productList.value = res.list || []
    pagination.total = res.total || 0
  } catch (e) {
    // 使用模拟数据
    productList.value = [
      { id: 1, name: 'Nike 运动跑鞋 透气轻便网面', categoryName: '服饰', mainImage: 'https://via.placeholder.com/80', groupPrice: 299, originalPrice: 599, stock: 156, sales: 1200, status: 1 },
      { id: 2, name: '气质项链 S925 纯银饰品', categoryName: '美妆', mainImage: 'https://via.placeholder.com/80', groupPrice: 128, originalPrice: 268, stock: 89, sales: 3600, status: 1 },
      { id: 3, name: '大容量背包 防水旅行双肩包', categoryName: '服饰', mainImage: 'https://via.placeholder.com/80', groupPrice: 199, originalPrice: 399, stock: 234, sales: 892, status: 0 },
      { id: 4, name: '智能手表 运动健康监测', categoryName: '家居', mainImage: 'https://via.placeholder.com/80', groupPrice: 399, originalPrice: 799, stock: 45, sales: 567, status: 1 }
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
  searchForm.categoryId = null
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

// 新增
const handleAdd = () => {
  dialogType.value = 'add'
  Object.assign(form, {
    id: null,
    name: '',
    categoryId: null,
    groupPrice: 99,
    originalPrice: 199,
    stock: 100,
    groupSize: 3,
    groupHours: 24,
    mainImage: '',
    detail: ''
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogType.value = 'edit'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 提交
const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (dialogType.value === 'add') {
      await createProduct(form)
      ElMessage.success('新增成功')
    } else {
      await updateProduct(form.id, form)
      ElMessage.success('更新成功')
    }
    dialogVisible.value = false
    loadData()
  } finally {
    submitting.value = false
  }
}

// 上下架
const handleToggleStatus = async (row) => {
  const action = row.status === 1 ? '下架' : '上架'
  try {
    await ElMessageBox.confirm(`确定${action}该商品？`, '提示', { type: 'warning' })
    await toggleProductStatus(row.id, row.status === 1 ? 0 : 1)
    ElMessage.success(`${action}成功`)
    loadData()
  } catch (e) {}
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定删除该商品？此操作不可恢复', '警告', { type: 'error' })
    await deleteProduct(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (e) {}
}

// 上传成功
const handleUploadSuccess = (res) => {
  form.mainImage = res.url
}

onMounted(loadData)
</script>

<style scoped>
.product-page {
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

.product-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-img {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  border: 1px solid var(--border);
}

.product-detail {
  flex: 1;
}

.product-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-category {
  font-size: 12px;
  color: var(--text-secondary);
}

.price-col {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.price-col .label {
  font-size: 11px;
  color: var(--text-hint);
  margin-right: 6px;
}

.price-col .value {
  font-weight: 600;
}

.group-price .value {
  color: var(--primary);
  font-size: 14px;
}

.original-price .value {
  color: var(--text-secondary);
  font-size: 12px;
  text-decoration: line-through;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

/* 上传样式 */
.avatar-uploader {
  border: 1px dashed var(--border);
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 120px;
  height: 120px;
  transition: border-color 0.3s;
}

.avatar-uploader:hover {
  border-color: var(--primary);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: var(--text-hint);
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar {
  width: 120px;
  height: 120px;
  object-fit: cover;
}
</style>
