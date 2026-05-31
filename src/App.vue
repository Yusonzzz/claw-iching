<template>
  <div id="app-root">
    <router-view :key="$route.fullPath" />
    <nav class="tab-bar">
      <router-link to="/" class="tab-item" :class="{ active: $route.path === '/' }" replace>
        <span class="tab-icon">☰</span>
        <span>首页</span>
      </router-link>
      <router-link to="/divination" class="tab-item" :class="{ active: $route.path === '/divination' }" replace>
        <span class="tab-icon">🔮</span>
        <span>问卦</span>
      </router-link>
      <router-link to="/fortune" class="tab-item" :class="{ active: $route.path === '/fortune' }" replace>
        <span class="tab-icon">📈</span>
        <span>运势</span>
      </router-link>
      <router-link to="/profile" class="tab-item" :class="{ active: $route.path === '/profile' }" replace>
        <span class="tab-icon">👤</span>
        <span>我的</span>
      </router-link>
      <!-- 主题切换 —— 融入 Tab Bar 右侧 -->
      <button class="tab-item theme-tab" @click="handleToggle" :aria-label="theme === 'dark' ? '切换白天模式' : '切换深夜模式'">
        <span class="tab-icon theme-icon" :class="{ swapping: isSwapping }">{{ theme === 'dark' ? '☀️' : '🌙' }}</span>
        <span>主题</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTheme } from './composables/useTheme.js'

const { theme, toggleTheme } = useTheme()
const isSwapping = ref(false)

function handleToggle() {
  isSwapping.value = true
  toggleTheme()
  setTimeout(() => { isSwapping.value = false }, 400)
}
</script>

<style scoped>
#app-root {
  min-height: 100vh;
}

/* —— 主题切换按钮（融入 Tab Bar）—— */
.theme-tab {
  flex: 0 0 auto;
  width: 52px;
  opacity: .65;
  transition: opacity .3s;
}
.theme-tab:hover {
  opacity: 1;
}
.theme-tab .theme-icon {
  transition: transform .35s var(--spring);
}
.theme-tab .theme-icon.swapping {
  animation: themeSwap .4s var(--spring);
}
@keyframes themeSwap {
  0%   { transform: scale(1) rotate(0deg); }
  50%  { transform: scale(.5) rotate(180deg); }
  100% { transform: scale(1) rotate(360deg); }
}
</style>
