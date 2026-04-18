<template>
  <router-view />
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #f5f7fa;
}

/* 管理后台主题色变量 */
:root {
  --primary: #6C3CE1;
  --primary-light: #9B5DE5;
  --primary-dark: #5a2bc4;
  --gold: #F0B429;
  --success: #10B981;
  --warning: #F59E0B;
  --danger: #EF4444;
  --info: #3B82F6;
  --text-main: #1F2937;
  --text-secondary: #6B7280;
  --text-hint: #9CA3AF;
  --border: #E5E7EB;
  --bg-dark: #0D0826;
  --bg-sidebar: #16113A;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
}
::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
