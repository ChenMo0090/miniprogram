<template>
  <div class="admin-layout">
    <!-- 顶部栏 -->
    <header class="admin-header">
      <div class="header-left">
        <span class="logo-icon">✦</span>
        <span class="logo-text"><span class="highlight">拼团</span>商城管理</span>
      </div>
      <div class="header-right">
        <el-dropdown @command="handleCommand">
          <span class="user-info">
            <el-avatar :size="28" :icon="UserFilled" />
            <span class="username">{{ userStore.username }}</span>
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <div class="admin-body">
      <!-- 侧边导航 -->
      <nav class="admin-sidenav">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          :class="['nav-item', { active: $route.path === item.path }]"
        >
          <el-icon :size="16">
            <component :is="item.icon" />
          </el-icon>
          <span>{{ item.title }}</span>
        </router-link>
      </nav>

      <!-- 主内容区 -->
      <main class="admin-main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { UserFilled, ArrowDown } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const menuItems = computed(() => {
  return router.getRoutes()
    .find(r => r.path === '/')
    ?.children.filter(r => r.meta?.title)
    .map(r => ({
      path: '/' + r.path,
      title: r.meta.title,
      icon: r.meta.icon
    })) || []
})

const handleCommand = (cmd) => {
  if (cmd === 'logout') {
    userStore.logout()
    router.push('/login')
  }
}
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #F8F6FF;
}

/* 顶部栏 */
.admin-header {
  background: #0D0826;
  padding: 0 24px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  font-size: 18px;
  color: var(--gold);
}

.logo-text {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.logo-text .highlight {
  color: var(--gold);
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 6px;
  transition: background 0.2s;
}

.user-info:hover {
  background: rgba(255,255,255,0.1);
}

.username {
  font-size: 13px;
  opacity: 0.9;
}

/* 主体布局 */
.admin-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 侧边导航 */
.admin-sidenav {
  width: 180px;
  background: #16113A;
  padding: 12px 0;
  flex-shrink: 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  color: rgba(255,255,255,0.5);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  color: rgba(255,255,255,0.8);
  background: rgba(255,255,255,0.05);
}

.nav-item.active {
  color: var(--gold);
  background: rgba(240,180,41,0.1);
  border-left-color: var(--gold);
}

/* 主内容区 */
.admin-main {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}
</style>
