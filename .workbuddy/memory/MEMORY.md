# 长期记忆

## 项目信息
- **shop-backend**: Spring Boot + MyBatis 电商后台，JDK 17
- **shop-admin**: Vue 3 + Vite 管理后台前端
- **miniprogram**: 微信小程序端（拼团商城），紫色主题 #6C3CE1
- **技术栈**: BCryptPasswordEncoder（Spring Security），MySQL，Vite Proxy

## 已修复问题记录
1. `context-path` 设为 `/api` 解决 404 路由问题
2. 密码编码从 Hutool 迁移到 Spring Security 的 BCryptPasswordEncoder
3. AdminPasswordFixer 启动时自动修复损坏的密码哈希
4. 前后端 API 路径对齐（createProduct、toggleProductStatus）
5. 新增 UploadController 图片上传接口 + WebMvcConfig 静态资源映射

## 小程序注意事项
- WXML 不支持复杂表达式（三元运算、算术运算、方法调用），必须在 JS 中预计算
- 已修复 3 个页面的进度条表达式：group-detail / group-list / pay-success
- tabBar 图标位于 miniprogram/assets/icons/，由 Python Pillow 生成（81x81 PNG）

## Mock 数据
- Mock 开关: `request.js` 中 `MOCK_ENABLED = true`
- 覆盖接口: 商品列表/详情、登录、用户信息/统计、订单列表/详情、拼团详情/列表
- 登录页有 "Mock 模式" 按钮可一键模拟登录体验完整流程
