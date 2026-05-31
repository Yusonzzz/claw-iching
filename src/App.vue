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
    </nav>
  </div>
</template>

<script setup>
</script>

<style scoped>
#app-root {
  min-height: 100vh;
}
</style>
