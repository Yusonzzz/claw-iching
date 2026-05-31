<template>
  <div class="page">
    <div class="page-header">
      <div class="page-title">生辰档案</div>
      <div class="page-subtitle">创建和管理命主档案</div>
    </div>

    <!-- 已有档案列表 -->
    <div v-if="profiles.length > 0" class="section">
      <div class="section-title">已保存档案</div>
      <div 
        v-for="p in profiles" :key="p.id"
        :class="['profile-card', { 'profile-card-active': activeProfile?.id === p.id }]"
        @click="toggleSelect(p.id)"
      >
        <div class="profile-card-body">
          <div class="profile-name">
            {{ p.name }}
            <span v-if="activeProfile?.id === p.id" class="profile-badge">使用中</span>
          </div>
          <div class="profile-meta">
            {{ p.birthYear }}年{{ p.birthMonth }}月{{ p.birthDay }}日
            <template v-if="p.birthHour !== null"> · {{ String(p.birthHour).padStart(2,'0') }}:{{ String(p.birthMinute||0).padStart(2,'0') }}</template>
            <template v-if="p.cityName"> · {{ p.cityName }}</template>
          </div>
          <div v-if="p.birthYear" class="profile-lunar">
            {{ getLunarStr(p.birthYear, p.birthMonth, p.birthDay) }}
          </div>
        </div>
        <div class="profile-actions">
          <button class="icon-btn" @click.stop="startEdit(p)" title="编辑">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="icon-btn icon-btn-danger" @click.stop="removeProfile(p.id)" title="删除">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF453A" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 新建/编辑表单 -->
    <div class="section">
      <div class="section-title">{{ isEditing ? '编辑档案' : '新建档案' }}</div>

      <!-- 昵称 -->
      <div class="form-row">
        <div class="form-label">昵称</div>
        <input v-model="form.name" class="ios-input" placeholder="如：我、张三" />
      </div>

      <!-- 公历/农历切换 -->
      <div class="form-row">
        <div class="form-label">历法</div>
        <div class="cal-toggle">
          <button 
            :class="['cal-btn', { active: !isLunarMode }]" 
            @click="isLunarMode = false"
          >公历</button>
          <button 
            :class="['cal-btn', { active: isLunarMode }]" 
            @click="isLunarMode = true"
          >农历</button>
        </div>
      </div>

      <!-- 出生日期 -->
      <div class="form-row">
        <div class="form-label">{{ isLunarMode ? '农历' : '公历' }}</div>
        <button class="ios-input ios-picker-btn" @click="showDatePicker = true">
          <span v-if="form.birthYear">{{ dateDisplay }}</span>
          <span v-else class="placeholder">请选择出生日期</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--label-tertiary)" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
      </div>

      <!-- 闰月开关（农历模式下） -->
      <div v-if="isLunarMode && hasLeapInYear" class="form-row">
        <div class="form-label">闰月</div>
        <button 
          :class="['leap-toggle', { active: form.isLeap }]"
          @click="form.isLeap = !form.isLeap"
        >
          {{ form.isLeap ? '是' : '否' }}
        </button>
        <div class="text-xs" style="color: var(--label-secondary); padding-top: 10px;">
          {{ form.isLeap ? '✓ 切换为闰月' : '若不确认也可选否' }}
        </div>
      </div>

      <!-- 转换显示（农历模式下显示公历对应） -->
      <div v-if="isLunarMode && form.birthYear && convertedSolar" class="form-row" style="margin-top: -4px;">
        <div class="form-label"></div>
        <div class="lunar-hint">
          对应公历：{{ convertedSolar.year }}年{{ convertedSolar.month }}月{{ convertedSolar.day }}日
        </div>
      </div>
      <!-- 公历模式下显示农历 -->
      <div v-if="!isLunarMode && form.birthYear && solarLunarStr" class="form-row" style="margin-top: -4px;">
        <div class="form-label"></div>
        <div class="lunar-hint">{{ solarLunarStr }}</div>
      </div>

      <!-- 出生时间 -->
      <div class="form-row">
        <div class="form-label">时间</div>
        <div class="time-group">
          <select v-model="form.birthHour" class="ios-input ios-select">
            <option :value="null">时</option>
            <option v-for="h in 24" :key="h-1" :value="h-1">{{ String(h-1).padStart(2,'0') }}时</option>
          </select>
          <select v-model="form.birthMinute" class="ios-input ios-select">
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
            <div v-if="cityResults.length > 0" class="city-dropdown">
              <div v-for="c in cityResults" :key="c.name" class="city-option" @click="selectCity(c)">
                {{ c.name }}
              </div>
            </div>
          </div>
          <span v-if="selectedCity" class="city-tag">{{ selectedCity.name }}</span>
        </div>
      </div>

      <!-- 保存按钮 -->
      <div v-if="formError" class="form-error">{{ formError }}</div>
      <button class="ios-btn ios-btn-primary" @click="saveProfile">
        {{ isEditing ? '保存修改' : '创建档案' }}
      </button>
      <button v-if="isEditing" class="ios-btn ios-btn-cancel" @click="cancelEdit" style="margin-top: 8px;">
        取消编辑
      </button>
    </div>

    <!-- 提示 -->
    <div class="section">
      <div class="tip-card">
        <div class="tip-icon">📌</div>
        <div class="tip-text">
          所有数据仅保存在本地，不会上传。<br/>
          若只知道农历生日，选择「农历」输入即可自动换算。
        </div>
      </div>
    </div>

    <!-- 日期选择器 -->
    <PickerWheel
      v-if="showDatePicker"
      :modelValue="pickerValue"
      :lunarMode="isLunarMode"
      @confirm="onDateConfirm"
      @close="showDatePicker = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProfileStore } from '../stores/profileStore.js'
import { CITIES } from '../data/cities.js'
import { getLunarInfo, lunarToSolar, buildLunarMonths } from '../utils/lunar.js'
import PickerWheel from '../components/PickerWheel.vue'

const profileStore = useProfileStore()
const { profiles, activeProfile, addProfile, updateProfile, setActiveProfile, deleteProfile, clearActiveProfile } = profileStore

const isEditing = ref(false)
const editId = ref('')
const isLunarMode = ref(false)
const showDatePicker = ref(false)
const citySearch = ref('')
const selectedCity = ref(null)
const cityResults = ref([])

const form = ref({
  name: '',
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

const pickerValue = computed(() => ({
  year: form.value.birthYear || 2000,
  month: form.value.birthMonth || 6,
  day: form.value.birthDay || 15,
  isLeap: form.value.isLeap || false,
}))

// 选择的年份是否有闰月
const hasLeapInYear = computed(() => {
  if (!form.value.birthYear) return false
  const months = buildLunarMonths(Number(form.value.birthYear))
  return months.some(m => m.isLeap)
})

// 农历→公历转换结果
const convertedSolar = computed(() => {
  if (!isLunarMode.value || !form.value.birthYear || !form.value.birthMonth || !form.value.birthDay) return null
  return lunarToSolar(
    Number(form.value.birthYear),
    Number(form.value.birthMonth),
    Number(form.value.birthDay),
    form.value.isLeap
  )
})

// 公历→农历字符串
const solarLunarStr = computed(() => {
  if (isLunarMode.value || !form.value.birthYear || !form.value.birthMonth || !form.value.birthDay) return ''
  return getLunarInfo(
    Number(form.value.birthYear),
    Number(form.value.birthMonth),
    Number(form.value.birthDay)
  ).fullString
})

// 日期显示文本
const dateDisplay = computed(() => {
  if (!form.value.birthYear) return ''
  if (isLunarMode.value) {
    const months = ['正','二','三','四','五','六','七','八','九','十','冬','腊']
    const days = ['初一','初二','初三','初四','初五','初六','初七','初八','初九','初十',
      '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
      '廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十']
    const leapLabel = form.value.isLeap ? '闰' : ''
    return `${form.value.birthYear}年${leapLabel}${months[(form.value.birthMonth||1)-1]}月${days[(form.value.birthDay||1)-1]}`
  }
  return `${form.value.birthYear}年${form.value.birthMonth}月${form.value.birthDay}日`
})

function getLunarStr(year, month, day) {
  return getLunarInfo(year, month, day).shortString
}

function toggleSelect(id) {
  if (activeProfile.value?.id === id) clearActiveProfile()
  else setActiveProfile(id)
}

function startEdit(profile) {
  isEditing.value = true
  editId.value = profile.id
  isLunarMode.value = false
  form.value = {
    name: profile.name,
    birthYear: profile.birthYear,
    birthMonth: profile.birthMonth,
    birthDay: profile.birthDay,
    isLeap: false,
    birthHour: profile.birthHour,
    birthMinute: profile.birthMinute || 0,
    cityName: profile.cityName || '',
    lng: profile.lng || null,
    lat: profile.lat || null,
  }
  if (profile.cityName) {
    selectedCity.value = { name: profile.cityName, lng: profile.lng }
    citySearch.value = profile.cityName
  }
}

function cancelEdit() {
  isEditing.value = false
  editId.value = ''
  resetForm()
}

function onDateConfirm(val) {
  form.value.birthYear = val.year
  form.value.birthMonth = val.month
  form.value.birthDay = val.day
  form.value.isLeap = val.isLeap || false
}

function filterCities() {
  if (!citySearch.value) { cityResults.value = []; return }
  const q = citySearch.value.toLowerCase()
  cityResults.value = CITIES.filter(c => c.name.includes(q)).slice(0, 8)
}

function selectCity(c) {
  selectedCity.value = c
  citySearch.value = c.name
  form.value.cityName = c.name
  form.value.lng = c.lng
  form.value.lat = c.lat
  cityResults.value = []
}

const formError = ref('')

function saveProfile() {
  formError.value = ''
  if (!form.value.name || !form.value.name.trim()) {
    formError.value = '请填写昵称'
    return
  }
  if (!form.value.birthYear || !form.value.birthMonth || !form.value.birthDay) {
    formError.value = '请选择出生日期'
    return
  }

  // 如果选择了农历，转换为公历存储
  let birthData = {
    birthYear: Number(form.value.birthYear),
    birthMonth: Number(form.value.birthMonth),
    birthDay: Number(form.value.birthDay),
  }

  if (isLunarMode.value) {
    const solar = lunarToSolar(birthData.birthYear, birthData.birthMonth, birthData.birthDay, form.value.isLeap)
    if (solar) {
      birthData = solar
    } else {
      alert('农历日期无效，请重新选择')
      return
    }
  }

  const data = {
    name: form.value.name,
    ...birthData,
    birthHour: form.value.birthHour !== null && form.value.birthHour !== '' ? Number(form.value.birthHour) : null,
    birthMinute: form.value.birthMinute || 0,
    cityName: form.value.cityName || '',
    lng: form.value.lng || null,
    lat: form.value.lat || null,
  }

  if (isEditing.value && editId.value) {
    updateProfile({ id: editId.value, ...data })
  } else {
    const newP = addProfile(data)
    setActiveProfile(newP.id)
  }

  resetForm()
  isEditing.value = false
  editId.value = ''
}

function removeProfile(id) {
  if (confirm('确定删除此档案？')) deleteProfile(id)
}

function resetForm() {
  form.value = { name: '', birthYear: '', birthMonth: '', birthDay: '', isLeap: false, birthHour: null, birthMinute: 0, cityName: '', lng: null, lat: null }
  isLunarMode.value = false
  citySearch.value = ''
  selectedCity.value = null
  cityResults.value = []
}
</script>

<style scoped>
.page { padding: 0 16px 80px; }
.page-header { padding: 20px 0 16px; }
.page-title { font-size: 28px; font-weight: 700; color: var(--label-primary); }
.page-subtitle { font-size: 14px; color: var(--label-secondary); margin-top: 2px; }

.section { margin-bottom: 20px; }
.section-title { font-size: 13px; font-weight: 600; color: var(--label-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; padding-left: 4px; }

.profile-card {
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  border: 1px solid var(--separator);
  cursor: pointer;
  transition: box-shadow 0.2s;
  -webkit-tap-highlight-color: transparent;
}
.profile-card:active { opacity: 0.8; }
.profile-card-active { box-shadow: 0 0 0 3px rgba(212,160,23,.2); }
.profile-card-body { flex: 1; }
.profile-name { font-size: 16px; font-weight: 600; color: var(--label-primary); display: flex; align-items: center; gap: 8px; }
.profile-badge { font-size: 11px; color: #fff; background: var(--gold); border-radius: var(--radius-xs); padding: 1px 6px; font-weight: 600; }
.profile-meta { font-size: 13px; color: var(--label-secondary); margin-top: 2px; }
.profile-lunar { font-size: 12px; color: var(--gold); margin-top: 2px; }
.profile-actions { display: flex; gap: 6px; margin-left: 8px; }

.icon-btn {
  width: 32px; height: 32px;
  border-radius: var(--radius-sm);
  background: var(--separator);
  border: none;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  -webkit-tap-highlight-color: transparent;
}
.icon-btn:active { background: var(--separator); }
.icon-btn-danger:active { background: rgba(255,69,58,0.15); }

.form-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 14px;
  gap: 10px;
}
.form-label {
  width: 48px;
  font-size: 15px;
  color: var(--label-primary);
  padding-top: 10px;
  flex-shrink: 0;
}
.form-row .form-label + * { flex: 1; }

.ios-input {
  width: 100%;
  padding: 10px 14px;
  background: var(--bg-tertiary);
  border: none;
  border-radius: var(--radius-sm);
  color: var(--label-primary);
  font-size: 15px;
  outline: none;
  transition: box-shadow 0.2s;
  font-family: inherit;
}
.ios-input:focus { box-shadow: 0 0 0 3px rgba(212,160,23,.2); }
.ios-input::placeholder { color: var(--label-tertiary); }

.ios-picker-btn {
  display: flex; align-items: center; justify-content: space-between;
  cursor: pointer; text-align: left;
}
.ios-picker-btn .placeholder { color: var(--label-tertiary); }

.ios-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238E8E93' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 32px;
}

/* 公历/农历切换 */
.cal-toggle {
  display: flex;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  padding: 3px;
  border: none;
}
.cal-btn {
  flex: 1;
  padding: 7px 16px;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  background: transparent;
  color: var(--label-secondary);
  transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;
}
.cal-btn.active {
  background: var(--gold);
  color: #fff;
  font-weight: 600;
}

/* 闰月开关 */
.leap-toggle {
  padding: 7px 20px;
  border-radius: var(--radius-sm);
  border: none;
  background: var(--bg-tertiary);
  color: var(--label-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;
}
.leap-toggle.active {
  background: rgba(212,160,23,.15);
  box-shadow: 0 0 0 3px rgba(212,160,23,.2);
  color: var(--gold);
}

.time-group { display: flex; gap: 8px; }
.time-group .ios-select { flex: 1; }

.city-group { position: relative; }
.city-input-wrap { position: relative; }
.city-dropdown {
  position: absolute;
  top: 100%; left: 0; right: 0;
  background: var(--bg-elevated);
  border: none;
  border-radius: var(--radius-sm);
  margin-top: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
}
.city-option {
  padding: 10px 14px;
  font-size: 14px;
  color: var(--label-primary);
  cursor: pointer;
  border-bottom: 0.5px solid var(--separator);
}
.city-option:last-child { border: none; }
.city-option:active { background: var(--separator); }
.city-tag {
  display: inline-block;
  margin-top: 6px;
  padding: 2px 10px;
  background: rgba(212,160,23,.1);
  color: var(--gold);
  border-radius: var(--radius-xs);
  font-size: 13px;
}

.lunar-hint { font-size: 13px; color: var(--gold); padding-top: 2px; }

.ios-btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: var(--radius-md);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  -webkit-tap-highlight-color: transparent;
}
.ios-btn:active { opacity: 0.8; }
.ios-btn-primary { background: var(--gold); color: #fff; box-shadow: var(--shadow-glow); }
.ios-btn-cancel { background: var(--bg-tertiary); color: var(--label-secondary); }

.form-error {
  color: var(--system-red);
  font-size: 14px;
  padding: 8px 0;
  margin-bottom: 8px;
}

.tip-card {
  background: rgba(33, 150, 243, 0.08);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  display: flex; gap: 10px;
  align-items: flex-start;
}
.tip-icon { font-size: 16px; }
.tip-text { font-size: 13px; color: var(--system-blue); line-height: 1.5; }
</style>
