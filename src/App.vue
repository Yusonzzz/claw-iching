<template>
  <div id="app-root">
    <!-- 主题切换按钮 -->
    <button class="theme-toggle" @click="handleToggle" :aria-label="theme === 'dark' ? '切换白天模式' : '切换深夜模式'">
      <span class="theme-icon" :class="{ swapping: isSwapping }">{{ theme === 'dark' ? '☀️' : '🌙' }}</span>
    </button>

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

/* —— 主题切换按钮 —— */
.theme-toggle {
  position: fixed;
  top: 48px;
  right: calc(50% - 195px);
  z-index: 901;
  width: 40px;
  height: 40px;
  border-radius: 20px;
  border: .5px solid var(--separator-strong);
  background: var(--bg-card);
  backdrop-filter: blur(30px) saturate(180%);
  -webkit-backdrop-filter: blur(30px) saturate(180%);
  box-shadow: var(--shadow-card);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all .35s var(--spring);
}
.theme-toggle:active {
  transform: scale(.88);
  box-shadow: 0 1px 4px rgba(0,0,0,.06);
}
.theme-icon {
  font-size: 18px;
  line-height: 1;
  display: block;
  transition: transform .35s var(--spring);
}
.theme-icon.swapping {
  animation: themeSwap .4s var(--spring);
}
@keyframes themeSwap {
  0%   { transform: scale(1) rotate(0deg); }
  50%  { transform: scale(.5) rotate(180deg); }
  100% { transform: scale(1) rotate(360deg); }
}

/* 响应式：在窄屏时左移 */
@media (max-width: 430px) {
  .theme-toggle {
    right: 10px;
  }
}
</style>
