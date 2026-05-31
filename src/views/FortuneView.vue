<template>
  <div class="page">
    <h2 style="font-size: 22px; color: var(--label-primary); margin-bottom: 18px; font-weight: 700; letter-spacing: -0.03em;">📈 运势推演</h2>

    <!-- 时间选择Tab -->
    <div class="card" style="padding: 8px;">
      <div class="btn-group">
        <button
          v-for="tab in tabs" :key="tab.key"
          :class="['btn', 'btn-sm', activeTab === tab.key ? 'btn-gold' : 'btn-outline']"
          @click="switchTab(tab.key)"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- 命主信息 -->
    <QuickBirthInput ref="birthInputRef" @submit="onBirthSubmit" />

    <!-- 有命主未推演时显示按钮 -->
    <button v-if="hasBirthData && !fortune" @click="refreshFortune" class="btn btn-primary" style="margin-bottom: 12px;">
      🔮 开始推演
    </button>

    <!-- 无命主 -->
    <div v-if="!hasBirthData" class="card" style="text-align: center; padding: 32px 20px;">
      <div style="font-size: 40px; margin-bottom: 12px;">☯</div>
      <div style="font-size: 15px; font-weight: 600; color: var(--label-primary); margin-bottom: 8px;">请先选择命主信息</div>
      <div style="font-size: 13px; color: var(--label-tertiary); line-height: 1.6;">
        在上方选择已保存的档案，<br/>或切换到「即时输入」填写生辰。
      </div>
    </div>

    <!-- 运势结果 -->
    <template v-if="hasBirthData && fortune">
      <!-- 八字基本信息 -->
      <div class="card">
        <div class="card-header">📜 命主八字</div>
        <div class="footnote" style="line-height: 1.8;">
          <div>八字：<span class="text-gold">{{ fortune.baziStr }}</span></div>
          <div>日主：<span class="text-gold">{{ fortune.bazi.day?.gan?.name }}（{{ fortune.bazi.day?.gan?.wuxing }}）</span></div>
        </div>
      </div>

      <!-- 日/周/月 运程卡片 -->
      <template v-if="activeTab !== 'year'">
        <div class="card">
          <div class="nav-header">
            <button class="nav-arrow" @click="navBack">‹</button>
            <div class="nav-title">{{ fortune.title }}</div>
            <button class="nav-arrow" @click="navForward">›</button>
          </div>
          <div class="text-xs" style="color: var(--label-tertiary); text-align: center; margin-bottom: 12px;">
            {{ lunarStr }}
          </div>

          <!-- 运程分析条目 -->
          <div v-for="(s, i) in fortune.sections" :key="i" class="fortune-item">
            <div class="fortune-item-title">{{ s.title }}</div>
            <div class="fortune-item-body">{{ s.text }}</div>
          </div>

          <!-- 对应卦象提示 -->
          <div v-if="fortune.hexagram" class="fortune-hex">
            <div class="fortune-hex-title">🔮 时卦提示 · {{ fortune.hexagram.name }}卦（{{ fortune.hexagram.upper }}{{ fortune.hexagram.guaDe }}）</div>
            <div class="fortune-hex-body">{{ fortune.hexagram.xiang || fortune.hexagram.judgment }}</div>
            <div class="fortune-hex-tags">
              <span class="hex-tag">上卦{{ fortune.hexagram.upper }}：{{ fortune.hexagram.upperXiang }}</span>
              <span class="hex-tag">下卦{{ fortune.hexagram.lower }}：{{ fortune.hexagram.lowerXiang }}</span>
              <span class="hex-tag">五行：{{ fortune.hexagram.wuxing }}</span>
            </div>
          </div>
        </div>
      </template>

      <!-- 年运程卡片 -->
      <template v-if="activeTab === 'year'">
        <div class="card">
          <div class="nav-header">
            <button class="nav-arrow" @click="navBack">‹</button>
            <div class="nav-title">{{ fortune.title }}</div>
            <button class="nav-arrow" @click="navForward">›</button>
          </div>

          <div v-for="(s, i) in fortune.sections" :key="i" class="fortune-item">
            <div class="fortune-item-title">{{ s.title }}</div>
            <div class="fortune-item-body">{{ s.text }}</div>
          </div>
          <!-- 年卦 -->
          <div v-if="fortune.hexagram" class="fortune-hex" style="margin-top:14px;">
            <div class="fortune-hex-title">🔮 年卦 · {{ fortune.hexagram.name }}卦</div>
            <div class="fortune-hex-body">{{ fortune.hexagram.xiang || fortune.hexagram.judgment }}</div>
          </div>
        </div>
      </template>

      <!-- 回到今日 -->
      <button @click="goToToday" class="btn btn-outline" style="margin-top: 8px;">
        📅 回到今日
      </button>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { getNewFortune } from '../utils/fortuneNew.js'
import { getLunarInfo } from '../utils/lunar.js'
import QuickBirthInput from '../components/QuickBirthInput.vue'

const birthInputRef = ref(null)

const tabs = [
  { key: 'day', label: '今日' },
  { key: 'week', label: '本周' },
  { key: 'month', label: '本月' },
  { key: 'year', label: '今年' },
]

const activeTab = ref('day')
const currentDate = ref({ year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate() })
const fortune = ref(null)

const hasBirthData = computed(() => !!birthInputRef.value?.getBirthData())

function getProfile() {
  return birthInputRef.value?.getBirthData() || null
}

function onBirthSubmit() { goToToday() }

function refreshFortune() {
  const { year, month, day } = currentDate.value
  const profile = getProfile()
  fortune.value = getNewFortune(profile, year, month, day, activeTab.value)
}

const lunarStr = computed(() => {
  const { year, month, day } = currentDate.value
  if (!year) return ''
  return getLunarInfo(year, month, day).fullString
})

function switchTab(tab) {
  activeTab.value = tab
  goToToday()
}

function navBack() {
  if (activeTab.value === 'day') shiftDay(-1)
  else if (activeTab.value === 'week') shiftDay(-7)
  else if (activeTab.value === 'month') shiftMonth(-1)
  else shiftYear(-1)
}

function navForward() {
  if (activeTab.value === 'day') shiftDay(1)
  else if (activeTab.value === 'week') shiftDay(7)
  else if (activeTab.value === 'month') shiftMonth(1)
  else shiftYear(1)
}

function shiftDay(n) {
  const d = new Date(currentDate.value.year, currentDate.value.month - 1, currentDate.value.day)
  d.setDate(d.getDate() + n)
  currentDate.value = { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() }
  refreshFortune()
}

function shiftMonth(n) {
  let { year, month } = currentDate.value
  month += n
  if (month > 12) { month = 1; year++ }
  if (month < 1) { month = 12; year-- }
  currentDate.value = { year, month, day: 1 }
  refreshFortune()
}

function shiftYear(n) {
  currentDate.value = { ...currentDate.value, year: currentDate.value.year + n }
  refreshFortune()
}

function goToToday() {
  const now = new Date()
  currentDate.value = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() }
  refreshFortune()
}

goToToday()
</script>

<style scoped>
.nav-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 6px;
}
.nav-title {
  font-size: 15px; font-weight: 600; color: var(--label-primary);
  text-align: center; flex: 1;
}
.nav-arrow {
  width: 36px; height: 36px;
  border-radius: 50%;
  border: none;
  background: var(--bg-tertiary);
  color: var(--label-secondary);
  font-size: 22px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: background .15s;
}
.nav-arrow:active { background: var(--bg-elevated); }

.fortune-item {
  padding: 10px 0;
  border-bottom: .5px solid var(--separator);
}
.fortune-item:last-child { border-bottom: none; }
.fortune-item-title {
  font-size: 13px; font-weight: 600; color: var(--gold);
  margin-bottom: 4px;
}
.fortune-item-body {
  font-size: 14px; color: var(--label-primary); line-height: 1.6;
}

.fortune-hex {
  margin-top: 14px; padding: 12px 14px;
  background: rgba(212,160,23,.05);
  border-radius: var(--radius-sm);
  border: .5px solid rgba(212,160,23,.15);
}
.fortune-hex-title {
  font-size: 13px; font-weight: 600; color: var(--gold); margin-bottom: 6px;
}
.fortune-hex-body {
  font-size: 13px; color: var(--label-secondary); line-height: 1.6; margin-bottom: 8px;
}
.fortune-hex-tags {
  display: flex; flex-wrap: wrap; gap: 6px;
}
.hex-tag {
  font-size: 11px; padding: 2px 8px;
  background: rgba(212,160,23,.1);
  color: var(--gold); border-radius: 4px;
}
</style>
