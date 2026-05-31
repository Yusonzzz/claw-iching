<template>
  <div class="page">
    <!-- 顶栏：主题切换 -->
    <div class="top-bar">
      <button class="theme-home-btn" @click="handleThemeToggle" :aria-label="theme === 'dark' ? '切换白天模式' : '切换深夜模式'">
        <span class="theme-home-icon" :class="{ swapping: isSwapping }">{{ theme === 'dark' ? '☀️' : '🌙' }}</span>
      </button>
    </div>

    <!-- 当前使用者 -->
    <div v-if="activeProfile" class="user-bar">
      <span class="user-avatar">👤</span>
      <span class="user-name">{{ activeProfile.name }}</span>
      <span class="user-bazi">{{ activeProfile.birthYear }}年·日主</span>
      <router-link to="/profile" class="user-switch">切换 ›</router-link>
    </div>
    <div v-else class="user-bar user-bar-empty">
      <span>📌 未设置命主信息</span>
      <router-link to="/profile" class="user-setup-link">去设置 ›</router-link>
    </div>

    <!-- 页头 -->
    <div class="text-center" style="padding: 16px 0 14px;">
      <div style="font-size: 40px;">☯</div>
      <h1 style="font-size: 22px; color: var(--label-primary); margin-top: 4px; font-weight: 700;">易经问卜</h1>
      <div class="text-sm mt-6" style="color: var(--label-secondary);">
        {{ dateStr }}
      </div>
      <div class="text-xs mt-2" style="color: var(--label-tertiary); font-weight: 500;">
        {{ lunarStr }}
      </div>
    </div>

    <!-- 快捷入口 -->
    <div v-if="!activeProfile" class="card">
      <div class="alert alert-info">
        📌 请在「我的」页面创建命主档案，以获得个性化八字分析
      </div>
      <router-link to="/profile" class="btn btn-gold" style="text-decoration: none;">
        创建命主档案
      </router-link>
    </div>

    <!-- 今日运势摘要（需有档案） -->
    <div v-if="dailyHex && activeProfile" class="card">
      <div class="card-title">☀️ 今日运势</div>
      <div class="text-sm" style="color: var(--label-secondary);">
        {{ fortune?.daily?.ganZhi || '' }}
      </div>
      <HexagramDisplay 
        :hexagram="dailyHex" 
        title="今日卦象" 
        :showDetail="false" 
      />
      <button @click="showDailyDetail = !showDailyDetail" class="btn btn-outline mt-12 btn-sm">
        {{ showDailyDetail ? '收起运势详解' : '查看今日运势详解' }}
      </button>
      <Transition name="slide-fade">
        <div v-if="showDailyDetail && fortune" class="mt-12">
          <div class="interpretation">{{ fortune.daily.interpretation }}</div>
        </div>
      </Transition>
    </div>

    <!-- 快捷入口 -->
    <div class="card">
      <div class="card-title">⚡ 快捷入口</div>
      <div class="btn-group">
        <router-link to="/divination" class="btn btn-primary" style="text-decoration: none;">
          🔮 起卦问事
        </router-link>
        <router-link to="/fortune" class="btn btn-outline" style="text-decoration: none;">
          📈 查看运势
        </router-link>
      </div>
    </div>

    <!-- 八字摘要（需有档案） -->
    <div v-if="fortune?.baziContext && activeProfile" class="card">
      <div class="card-title">📜 命理简析</div>
      <div class="text-sm" style="line-height: 1.7;">
        <div>八字：<span class="text-gold">{{ fortune.baziContext.formatted }}</span></div>
        <div>{{ fortune.baziContext.summary }}</div>
      </div>
    </div>

    <!-- 版本信息 -->
    <div class="text-center text-xs" style="padding: 20px 0 12px;">
      易经问卜 v1.0 | 仅供娱乐参考
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProfileStore } from '../stores/profileStore.js'
import { getFortuneAnalysis, getSingleFortune } from '../utils/fortune.js'
import HexagramDisplay from '../components/HexagramDisplay.vue'
import { getLunarInfo } from '../utils/lunar.js'
import { useTheme } from '../composables/useTheme.js'

const profileStore = useProfileStore()
const { activeProfile } = profileStore

const { theme, toggleTheme } = useTheme()
const isSwapping = ref(false)
function handleThemeToggle() {
  isSwapping.value = true
  toggleTheme()
  setTimeout(() => { isSwapping.value = false }, 400)
}

const showDailyDetail = ref(false)
const fortune = ref(null)
const dailyHex = ref(null)

const dateStr = computed(() => {
  const now = new Date()
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 星期${weekDays[now.getDay()]}`
})

const lunarStr = computed(() => {
  const now = new Date()
  return getLunarInfo(now.getFullYear(), now.getMonth() + 1, now.getDate()).fullString
})

onMounted(() => {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth() + 1
  const d = now.getDate()
  
  dailyHex.value = getSingleFortune(activeProfile.value, y, m, d, 'daily')?.hexagram || null
  fortune.value = getFortuneAnalysis(activeProfile.value, { year: y, month: m, day: d }, 'daily')
})
</script>

<style scoped>
/* 顶栏 */
.top-bar {
  display: flex;
  justify-content: flex-end;
  padding: 4px 0 6px;
}

/* 主题切换 —— 独立于命主信息栏 */
.theme-home-btn {
  width: 36px;
  height: 36px;
  border-radius: 18px;
  border: .5px solid var(--separator-strong);
  background: var(--bg-card);
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  box-shadow: var(--shadow-card);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  flex-shrink: 0;
  transition: all .35s var(--spring);
}
.theme-home-btn:active {
  transform: scale(.88);
}
.theme-home-icon {
  font-size: 17px;
  line-height: 1;
  display: block;
  transition: transform .35s var(--spring);
}
.theme-home-icon.swapping {
  animation: themeSwap .4s var(--spring);
}
@keyframes themeSwap {
  0%   { transform: scale(1) rotate(0deg); }
  50%  { transform: scale(.5) rotate(180deg); }
  100% { transform: scale(1) rotate(360deg); }
}

.user-bar {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px;
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  border-radius: var(--radius-sm);
  margin-bottom: 8px;
  border: .5px solid var(--separator);
  box-shadow: var(--shadow-card);
}
.user-bar-empty {
  color: var(--label-tertiary);
}
.user-avatar { font-size: 22px; }
.user-name { font-weight: 600; font-size: 15px; color: var(--label-primary); }
.user-bazi { font-size: 12px; color: var(--label-tertiary); }
.user-switch { margin-left: auto; font-size: 13px; color: var(--gold); text-decoration: none; font-weight: 500; }
.user-setup-link { margin-left: auto; font-size: 13px; color: var(--gold); text-decoration: none; font-weight: 500; }
</style>
