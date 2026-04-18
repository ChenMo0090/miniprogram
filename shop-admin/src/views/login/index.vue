<template>
  <div class="login-page">
    <div class="login-box">
      <div class="login-header">
        <div class="logo">
          <span class="logo-icon">✦</span>
          <span class="logo-text">拼团商城管理</span>
        </div>
        <p class="subtitle">管理员登录</p>
      </div>
      <el-form ref="formRef" :model="form" :rules="rules" class="login-form">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" size="large" :prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" size="large" :prefix-icon="Lock" show-password @keyup.enter="handleLogin" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" class="login-btn" :loading="loading" @click="handleLogin">登录</el-button>
        </el-form-item>
      </el-form>
      <div class="login-tips">
        <p>默认账号: admin / 密码: admin123</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { login } from '@/api/admin'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const formRef = ref(null)
const form = reactive({ username: '', password: '' })
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    const res = await login(form)
    userStore.setToken(res.token)
    userStore.setUserInfo(res.userInfo)
    ElMessage.success('登录成功')
    router.push('/')
  } catch (e) {
    // 登录失败，错误信息由 request.js 拦截器统一弹出
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0D0826 0%, #16113A 50%, #2D1B69 100%);
}

.login-box {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 8px;
}

.logo-icon {
  font-size: 28px;
  color: var(--primary);
}

.logo-text {
  font-size: 22px;
  font-weight: 800;
  color: var(--text-main);
}

.subtitle {
  font-size: 14px;
  color: var(--text-secondary);
}

.login-form {
  margin-bottom: 20px;
}

.login-btn {
  width: 100%;
  background: linear-gradient(135deg, #6C3CE1, #9B5DE5);
  border: none;
}

.login-btn:hover {
  background: linear-gradient(135deg, #5a2bc4, #8a4dd4);
}

.login-tips {
  text-align: center;
  font-size: 12px;
  color: var(--text-hint);
}
</style>
