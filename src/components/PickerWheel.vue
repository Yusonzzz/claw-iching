<template>
  <div class="picker-overlay" @click.self="$emit('close')">
    <div class="picker-container">
      <div class="picker-toolbar">
        <button class="picker-btn picker-btn-cancel" @click="$emit('close')">取消</button>
        <div class="picker-title">{{ title }}</div>
        <button class="picker-btn picker-btn-done" @click="confirm">确定</button>
      </div>

      <div class="picker-body">
        <div class="picker-col" v-for="(col, ci) in columns" :key="ci">
          <div class="picker-wheel" :ref="el => setWheelRef(ci, el)" @scroll="onScroll($event, ci)">
            <div 
              v-for="(opt, oi) in col.options" 
              :key="oi"
              class="picker-item"
              :class="{ 'picker-item-selected': selectedIndices[ci] === oi }"
              @click="selectItem(ci, oi)"
            >
              {{ opt.label }}
            </div>
          </div>
        </div>
        <div class="picker-indicator"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { LUNAR_MONTHS, LUNAR_DAYS, buildLunarMonths } from '../utils/lunar.js'

const props = defineProps({
  modelValue: { type: Object, default: () => ({ year: 2000, month: 1, day: 1, isLeap: false }) },
  title: { type: String, default: '请选择日期' },
  yearRange: { type: Array, default: () => [1900, 2030] },
  lunarMode: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'close', 'confirm'])

const ITEM_HEIGHT = 36
const wheelRefs = ref({})

function setWheelRef(ci, el) {
  if (el) wheelRefs.value[ci] = el
}

const years = computed(() => {
  const arr = []
  for (let i = props.yearRange[0]; i <= props.yearRange[1]; i++) {
    arr.push({ value: i, label: String(i) + '年' })
  }
  return arr
})

const months = computed(() => {
  if (props.lunarMode) {
    return LUNAR_MONTHS.map((name, i) => ({
      value: i + 1,
      label: name + '月'
    }))
  }
  return Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: String(i + 1) + '月'
  }))
})

const days = computed(() => {
  if (props.lunarMode) {
    // 农历日：初一至三十
    return LUNAR_DAYS.map((name, i) => ({
      value: i + 1,
      label: name
    }))
  }
  const y = selectedIndices.value[0] !== -1 ? years.value[selectedIndices.value[0]]?.value : 2000
  const m = selectedIndices.value[1] !== -1 ? months.value[selectedIndices.value[1]]?.value : 1
  const daysInMonth = new Date(y, m, 0).getDate()
  return Array.from({ length: daysInMonth }, (_, i) => ({
    value: i + 1,
    label: String(i + 1) + '日'
  }))
})

// 是否有闰月（用于农历模式）
const hasLeapMonth = computed(() => {
  if (!props.lunarMode) return false
  const yIdx = selectedIndices.value[0]
  if (yIdx < 0) return false
  const year = years.value[yIdx]?.value
  if (!year) return false
  const months = buildLunarMonths(year)
  return months.some(m => m.isLeap)
})

const columns = computed(() => [
  { key: 'year', options: years.value },
  { key: 'month', options: months.value },
  { key: 'day', options: days.value },
])

const selectedIndices = ref([-1, -1, -1])
const isLeapChecked = ref(false)

onMounted(() => {
  const yIdx = years.value.findIndex(y => y.value === (props.modelValue.year || 2000))
  const mIdx = months.value.findIndex(m => m.value === (props.modelValue.month || 1))
  const dIdx = days.value.findIndex(d => d.value === (props.modelValue.day || 1))
  
  selectedIndices.value = [
    yIdx >= 0 ? yIdx : Math.floor(years.value.length / 2),
    mIdx >= 0 ? mIdx : 0,
    dIdx >= 0 ? dIdx : 0,
  ]

  isLeapChecked.value = props.modelValue.isLeap || false

  nextTick(() => {
    scrollToIndex(0, selectedIndices.value[0])
    scrollToIndex(1, selectedIndices.value[1])
    scrollToIndex(2, selectedIndices.value[2])
  })
})

// 公历模式下天数变化时修复选中
watch(() => days.value.length, (newLen) => {
  if (!props.lunarMode && selectedIndices.value[2] >= newLen) {
    selectedIndices.value[2] = newLen - 1
    nextTick(() => scrollToIndex(2, selectedIndices.value[2]))
  }
})

function getValue() {
  return {
    year: years.value[selectedIndices.value[0]]?.value || props.yearRange[0],
    month: months.value[selectedIndices.value[1]]?.value || 1,
    day: days.value[selectedIndices.value[2]]?.value || 1,
    isLeap: props.lunarMode ? isLeapChecked.value : false,
  }
}

function selectItem(colIdx, optIdx) {
  selectedIndices.value[colIdx] = optIdx
  scrollToIndex(colIdx, optIdx)
}

function onScroll(event, colIdx) {
  const scrollTop = event.target.scrollTop
  const idx = Math.round(scrollTop / ITEM_HEIGHT)
  if (idx >= 0 && idx < columns.value[colIdx].options.length) {
    selectedIndices.value[colIdx] = idx
  }
}

function scrollToIndex(colIdx, idx) {
  const wheel = wheelRefs.value[colIdx]
  if (wheel) {
    wheel.scrollTop = idx * ITEM_HEIGHT
  }
}

function confirm() {
  const val = getValue()
  emit('update:modelValue', val)
  emit('confirm', val)
  emit('close')
}
</script>

<style scoped>
.picker-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,.45);
  backdrop-filter: blur(6px);
  z-index: 500;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  animation: fadeIn .2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.picker-container {
  width: 100%;
  max-width: 480px;
  background: #2a2218;
  border-radius: 18px 18px 0 0;
  overflow: hidden;
  animation: slideUp .3s ease;
  box-shadow: 0 -4px 24px rgba(0,0,0,.4);
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.picker-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: .5px solid rgba(212,160,23,.12);
  background: #2a2218;
}

.picker-title {
  font-size: 15px;
  font-weight: 600;
  color: #e8d8b8;
}

.picker-btn {
  background: none;
  border: none;
  font-size: 15px;
  cursor: pointer;
  padding: 4px 0;
}

.picker-btn-cancel { color: #a09070; }
.picker-btn-done { color: #d4a017; font-weight: 600; }

.picker-body {
  display: flex;
  position: relative;
  height: 220px;
  padding: 0 8px;
  background: #2a2218;
}

.picker-col {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.picker-wheel {
  height: 100%;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  -webkit-overflow-scrolling: touch;
  padding: 92px 0;
  scrollbar-width: none;
}

.picker-wheel::-webkit-scrollbar { display: none; }

.picker-item {
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: rgba(232,216,184,.3);
  scroll-snap-align: center;
  cursor: pointer;
}

.picker-item-selected {
  color: #f0e4cc;
  font-weight: 600;
  font-size: 18px;
}

.picker-indicator {
  position: absolute;
  top: 50%;
  left: 8px;
  right: 8px;
  height: 36px;
  transform: translateY(-50%);
  border-top: .5px solid rgba(212,160,23,.35);
  border-bottom: .5px solid rgba(212,160,23,.35);
  pointer-events: none;
}
</style>
