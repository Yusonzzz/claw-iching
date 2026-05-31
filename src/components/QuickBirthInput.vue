<template>
  <div class="card">
    <div class="card-title">👤 命主信息</div>

    <!-- 输入模式切换 -->
    <div class="mode-toggle">
      <button 
        :class="['mode-btn', { active: mode === 'profile' }]"
        @click="mode = 'profile'"
      >📂 已保存档案</button>
      <button 
        :class="['mode-btn', { active: mode === 'quick' }]"
        @click="mode = 'quick'"
      >⚡ 即时输入</button>
    </div>

    <!-- 模式一：从档案选择 -->
    <template v-if="mode === 'profile'">
      <select v-model="selectedProfileId" class="ios-input ios-select">
        <option value="">-- 不提供八字信息 --</option>
        <option v-for="p in profiles" :key="p.id" :value="p.id">
          {{ p.name }}（{{ p.birthYear }}年{{ p.birthMonth }}月）
        </option>
      </select>
      <div v-if="selectedProfile" class="text-xs mt-8" style="color: var(--label-secondary);">
        {{ selectedProfile.birthYear }}年{{ selectedProfile.birthMonth }}月{{ selectedProfile.birthDay }}日
        <template v-if="selectedProfile.birthHour !== null"> {{ String(selectedProfile.birthHour).padStart(2,'0') }}:{{ String(selectedProfile.birthMinute||0).padStart(2,'0') }}</template>
        <template v-if="selectedProfile.cityName"> | {{ selectedProfile.cityName }}</template>
      </div>
    </template>

    <!-- 模式二：即时输入 -->
    <template v-if="mode === 'quick'">
      <!-- 昵称 -->
      <div class="form-row">
        <div class="form-label">称呼</div>
        <input v-model="quickForm.name" class="ios-input" placeholder="可选" />
      </div>

      <!-- 性别 -->
      <div class="form-row">
        <div class="form-label">性别</div>
        <div class="gender-toggle">
          <button :class="['gender-btn', { active: quickForm.gender === 'male' }]" @click="quickForm.gender = 'male'">♂ 男</button>
          <button :class="['gender-btn', { active: quickForm.gender === 'female' }]" @click="quickForm.gender = 'female'">♀ 女</button>
        </div>
      </div>

      <!-- 公历/农历切换 -->
      <div class="form-row">
        <div class="form-label">历法</div>
        <div class="cal-toggle">
          <button :class="['cal-btn', { active: !quickForm.isLunar }]" @click="quickForm.isLunar = false">公历</button>
          <button :class="['cal-btn', { active: quickForm.isLunar }]" @click="quickForm.isLunar = true">农历</button>
        </div>
      </div>

      <!-- 出生日期 -->
      <div class="form-row">
        <div class="form-label">日期</div>
        <button class="ios-input ios-picker-btn" @click="showDatePicker = true">
          <span v-if="quickForm.birthYear">{{ dateDisplay }}</span>
          <span v-else class="placeholder">请选择出生日期</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--label-secondary)" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
      </div>

      <!-- 闰月 -->
      <div v-if="quickForm.isLunar && hasLeap" class="form-row">
        <div class="form-label">闰月</div>
        <button :class="['leap-btn', { active: quickForm.isLeap }]" @click="quickForm.isLeap = !quickForm.isLeap">
          {{ quickForm.isLeap ? '是' : '否' }}
        </button>
      </div>

      <!-- 农历→公历对照 -->
      <div v-if="quickForm.isLunar && compiledSolar" class="form-row" style="margin-top: -4px;">
        <div class="form-label"></div>
        <div class="lunar-hint">公历：{{ compiledSolar.year }}年{{ compiledSolar.month }}月{{ compiledSolar.day }}日</div>
      </div>

      <!-- 出生时间 -->
      <div class="form-row">
        <div class="form-label">时间</div>
        <div class="time-group">
          <select v-model="quickForm.birthHour" class="ios-input ios-select">
            <option :value="null">时</option>
            <option v-for="h in 24" :key="h-1" :value="h-1">{{ String(h-1).padStart(2,'0') }}时</option>
          </select>
          <select v-model="quickForm.birthMinute" class="ios-input ios-select">
            <option :value="0">分</option>
            <option v-for="m in 60" :key="m-1" :value="m-1">{{ String(m-1).padStart(2,'0') }}分</option>
          </select>
        </div>
      </div>

      <!-- 城市 -->
      <div class="form-row">
        <div class="form-label">城市</div>
        <div class="city-group">
          <div class="city-input-wrap">
            <input v-model="citySearch" class="ios-input" placeholder="搜索（可选）" @input="filterCities" />
            <div v-if="cityResults.length" class="city-dropdown">
              <div v-for="c in cityResults" :key="c.name" class="city-option" @click="selectCity(c)">{{ c.name }}</div>
            </div>
          </div>
          <span v-if="selectedCity" class="city-tag">{{ selectedCity.name }}</span>
        </div>
      </div>

      <!-- 测算按钮 -->
      <button class="calc-btn" @click="handleSubmit">🧮 测算</button>
    </template>

    <!-- 日期选择器 -->
    <PickerWheel
      v-if="showDatePicker"
      :modelValue="pickerValue"
      :lunarMode="quickForm.isLunar"
      @confirm="onDateConfirm"
      @close="showDatePicker = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useProfileStore } from '../stores/profileStore.js'
import { CITIES } from '../data/cities.js'
import { lunarToSolar, buildLunarMonths } from '../utils/lunar.js'
import PickerWheel from './PickerWheel.vue'

const profileStore = useProfileStore()

const emit = defineEmits(['update:birthData', 'submit'])

const mode = ref('profile')
const selectedProfileId = ref('')
const showDatePicker = ref(false)
const citySearch = ref('')
const selectedCity = ref(null)
const cityResults = ref([])

const quickForm = ref({
  name: '',
  gender: '',
  isLunar: false,
  birthYear: '',
  birthMonth: '',
  birthDay: '',
  isLeap: false,
  birthHour: null,
  birthMinute: 0,
  cityName: '',
  lng: null,
  lat: null,
})

const profiles = computed(() => profileStore.profiles.value)
const selectedProfile = computed(() => profiles.value.find(p => p.id === selectedProfileId.value))

const hasLeap = computed(() => {
  if (!quickForm.value.birthYear) return false
  return buildLunarMonths(Number(quickForm.value.birthYear)).some(m => m.isLeap)
})

const compiledSolar = computed(() => {
  if (!quickForm.value.isLunar || !quickForm.value.birthYear) return null
  return lunarToSolar(
    Number(quickForm.value.birthYear),
    Number(quickForm.value.birthMonth) || 1,
    Number(quickForm.value.birthDay) || 1,
    quickForm.value.isLeap
  )
})

const pickerValue = computed(() => ({
  year: quickForm.value.birthYear || 2000,
  month: quickForm.value.birthMonth || 6,
  day: quickForm.value.birthDay || 15,
  isLeap: quickForm.value.isLeap,
}))

const dateDisplay = computed(() => {
  if (!quickForm.value.birthYear) return ''
  const y = quickForm.value.birthYear
  const m = quickForm.value.birthMonth
  const d = quickForm.value.birthDay
  if (quickForm.value.isLunar) {
    const months = ['正','二','三','四','五','六','七','八','九','十','冬','腊']
    const days = ['初一','初二','初三','初四','初五','初六','初七','初八','初九','初十',
      '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
      '廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十']
    const leap = quickForm.value.isLeap ? '闰' : ''
    return `${y}年${leap}${months[(m||1)-1]}月${days[(d||1)-1]}`
  }
  return `${y}年${m}月${d}日`
})

// 获取推算用的数据
function getBirthData() {
  if (mode.value === 'profile') {
    return selectedProfile.value
  }
  // 即时模式
  if (!quickForm.value.birthYear) return null
  let data = {
    name: quickForm.value.name || '临时',
    gender: quickForm.value.gender || '',
    birthYear: Number(quickForm.value.birthYear),
    birthMonth: Number(quickForm.value.birthMonth) || 1,
    birthDay: Number(quickForm.value.birthDay) || 1,
    birthHour: quickForm.value.birthHour !== null && quickForm.value.birthHour !== '' ? Number(quickForm.value.birthHour) : null,
    birthMinute: quickForm.value.birthMinute || 0,
    cityName: quickForm.value.cityName || '',
    lng: quickForm.value.lng || null,
    lat: quickForm.value.lat || null,
  }
  // 农历转公历
  if (quickForm.value.isLunar && compiledSolar.value) {
    data.birthYear = compiledSolar.value.year
    data.birthMonth = compiledSolar.value.month
    data.birthDay = compiledSolar.value.day
  }
  return data
}

function onDateConfirm(val) {
  quickForm.value.birthYear = val.year
  quickForm.value.birthMonth = val.month
  quickForm.value.birthDay = val.day
  quickForm.value.isLeap = val.isLeap || false
}

function filterCities() {
  if (!citySearch.value) { cityResults.value = []; return }
  const q = citySearch.value.toLowerCase()
  cityResults.value = CITIES.filter(c => c.name.includes(q)).slice(0, 8)
}

function selectCity(c) {
  selectedCity.value = c
  citySearch.value = c.name
  quickForm.value.cityName = c.name
  quickForm.value.lng = c.lng
  quickForm.value.lat = c.lat
  cityResults.value = []
}

// 提交即时输入数据
function handleSubmit() {
  if (!quickForm.value.birthYear) {
    // 静默不提交，让用户看到placeholder提示
    return
  }
  const data = getBirthData()
  if (data) {
    emit('submit', data)
  }
}

// 档案模式下切换选中档案时自动通知父组件
watch(selectedProfileId, (newId) => {
  if (newId && mode.value === 'profile') {
    emit('submit', getBirthData())
  }
})

// 暴露给父组件
defineExpose({ getBirthData, mode })
</script>

<style scoped>
.mode-toggle {
  display: flex;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  padding: 3px;
  margin-bottom: 12px;
  border: 1px solid var(--separator);
}
.mode-btn {
  flex: 1;
  padding: 7px 12px;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  background: transparent;
  color: var(--label-secondary);
  transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;
}
.mode-btn.active {
  background: var(--gold);
  color: #fff;
  font-weight: 600;
}

.form-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 8px;
}
.form-label {
  width: 36px;
  font-size: 14px;
  color: var(--label-primary);
  padding-top: 10px;
  flex-shrink: 0;
}
.form-row .form-label + * { flex: 1; }

.cal-toggle {
  display: flex;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  padding: 2px;
  border: 1px solid var(--separator);
}
.cal-btn {
  flex: 1;
  padding: 5px 12px;
  border: none;
  border-radius: var(--radius-xs);
  font-size: 12px;
  cursor: pointer;
  background: transparent;
  color: var(--label-secondary);
  -webkit-tap-highlight-color: transparent;
}
.cal-btn.active { background: var(--gold); color: #fff; font-weight: 600; }

.gender-toggle {
  display: flex;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  padding: 2px;
  border: 1px solid var(--separator);
}
.gender-btn {
  flex: 1;
  padding: 5px 12px;
  border: none;
  border-radius: var(--radius-xs);
  font-size: 12px;
  cursor: pointer;
  background: transparent;
  color: var(--label-secondary);
  -webkit-tap-highlight-color: transparent;
}
.gender-btn.active { background: var(--gold); color: #fff; font-weight: 600; }

.leap-btn {
  padding: 6px 16px;
  border-radius: var(--radius-xs);
  border: 1px solid var(--separator);
  background: var(--bg-tertiary);
  color: var(--label-secondary);
  font-size: 13px;
  cursor: pointer;
}
.leap-btn.active { background: rgba(212,160,23,.15); border-color: var(--gold); color: var(--gold); }

.time-group { display: flex; gap: 6px; }
.time-group .ios-select { flex: 1; font-size: 13px; padding: 8px 10px; }

.city-group { position: relative; }
.city-input-wrap { position: relative; }
.city-dropdown {
  position: absolute;
  top: 100%; left: 0; right: 0;
  background: var(--bg-elevated);
  border: 1px solid var(--separator);
  border-radius: var(--radius-sm);
  margin-top: 4px;
  max-height: 160px;
  overflow-y: auto;
  z-index: 10;
}
.city-option {
  padding: 8px 12px;
  font-size: 13px;
  color: var(--label-primary);
  cursor: pointer;
  border-bottom: 0.5px solid var(--separator);
}
.city-option:active { background: var(--separator); }
.city-tag {
  display: inline-block;
  margin-top: 4px;
  padding: 2px 8px;
  background: rgba(212,160,23,.1);
  color: var(--gold);
  border-radius: var(--radius-xs);
  font-size: 12px;
}
.lunar-hint { font-size: 12px; color: var(--gold); padding-top: 2px; }

.calc-btn {
  width: 100%;
  padding: 11px;
  margin-top: 4px;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  background: var(--gold);
  color: #fff;
  transition: opacity 0.15s;
  -webkit-tap-highlight-color: transparent;
}
.calc-btn:active { opacity: 0.75; }
</style>
