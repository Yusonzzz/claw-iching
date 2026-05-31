<template>
  <div class="card">
    <div class="card-title">{{ title }}</div>

    <!-- 卦象可视化：从下往上，重新排版 -->
    <div class="hexagram-viz">
      <div
        v-for="(yao, idx) in displayLines"
        :key="idx"
        class="yao-line"
        :class="{ moving: yao.moving }"
      >
        <span class="yao-label">{{ yaoLabels[5 - idx] }}</span>
        <div class="yao-track">
          <!-- 阳爻：一条实线 -->
          <div v-if="yao.value === 1" class="yao-yang-bar"></div>
          <!-- 阴爻：两条实线中间留空 -->
          <div v-else class="yao-yin-bars">
            <div class="yao-yin-piece"></div>
            <div class="yao-yin-gap"></div>
            <div class="yao-yin-piece"></div>
          </div>
        </div>
        <span class="yao-mark">{{ yao.moving ? '⚡' : '' }}</span>
      </div>
    </div>

    <!-- 卦名 -->
    <div class="gua-name">
      <span class="gua-title">{{ hexagram.original.name }}卦</span>
      <span class="gua-sub">{{ hexagram.upperName }}上{{ hexagram.lowerName }}下</span>
    </div>

    <!-- 变卦 -->
    <div v-if="hexagram.changed && hexagram.hasChange" class="gua-change">
      → 变卦：<span class="text-gold">{{ hexagram.changed.name }}卦</span>
      <span class="gua-sub">（{{ hexagram.changedUpperName }}上{{ hexagram.changedLowerName }}下）</span>
    </div>

    <!-- 互卦 -->
    <div v-if="hexagram.hu" class="gua-change">
      互卦：<span class="text-gold">{{ hexagram.hu.name }}卦</span>
    </div>

    <!-- 卦辞预览 -->
    <div class="gua-judgment">{{ hexagram.original.judgment }}</div>

    <!-- 彖传 / 大象传（如有） -->
    <div v-if="hexMeta.tuan" class="gua-tuan">
      <div class="knowledge-label">彖曰</div>
      <div class="knowledge-text">{{ hexMeta.tuan }}</div>
    </div>
    <div v-if="hexMeta.xiang" class="gua-xiang">
      <div class="knowledge-label">象曰</div>
      <div class="knowledge-text">{{ hexMeta.xiang }}</div>
    </div>

    <!-- 完整解读（分段展示） -->
    <div v-if="showDetail && interpretation" class="mt-12">
      <div class="card-title">📖 解卦详情</div>

      <!-- 上层：综合结论（不折叠） -->
      <div v-for="(section, si) in summarySections" :key="'s'+si" class="interpret-section">
        <template v-if="!section.title">
          <div class="section-body">{{ section.content }}</div>
        </template>
        <template v-else>
          <div class="section-header">
            <span class="section-title">{{ section.title }}</span>
            <span v-if="section.badge" class="section-badge" :style="{ background: section.badgeColor + '20', color: section.badgeColor }">{{ section.badge }}</span>
          </div>
          <div class="section-body">{{ section.content }}</div>
        </template>
      </div>

      <!-- 分隔 + 折叠按钮 -->
      <div v-if="detailSections.length > 0" class="detail-toggle">
        <button @click="showDetailContent = !showDetailContent" class="toggle-btn">
          {{ showDetailContent ? '▲ 收起专业分析' : '▼ 展开专业分析' }}
        </button>
      </div>

      <!-- 下层：专业分析（可折叠） -->
      <div v-if="showDetailContent" class="detail-content">
        <div v-for="(section, si) in detailSections" :key="'d'+si" class="interpret-section">
          <template v-if="!section.title">
            <div class="section-body">{{ section.content }}</div>
          </template>
          <template v-else>
            <div class="section-header">
              <span class="section-title">{{ section.title }}</span>
              <span v-if="section.badge" class="section-badge" :style="{ background: section.badgeColor + '20', color: section.badgeColor }">{{ section.badge }}</span>
            </div>
            <div class="section-body">{{ section.content }}</div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { HEXAGRAM_KNOWLEDGE } from '../data/hexagramKnowledge.js'

const props = defineProps({
  hexagram: { type: Object, default: null },
  title: { type: String, default: '卦象' },
  showDetail: { type: Boolean, default: false },
  interpretation: { type: String, default: '' },
})

const showDetailContent = ref(false)

const hexMeta = computed(() => {
  if (!props.hexagram?.original?.number) return {}
  return HEXAGRAM_KNOWLEDGE[props.hexagram.original.number] || {}
})

const yaoLabels = ['上', '五', '四', '三', '二', '初']

const displayLines = computed(() => {
  if (!props.hexagram || !props.hexagram.originalLines) return []
  const lines = props.hexagram.originalLines
  const movingIndicesSet = new Set(
    (props.hexagram.movingYaoDetails || []).map(y => y.index)
  )
  return lines.slice(0, 6).reverse().map((val, idx) => ({
    value: val,
    moving: movingIndicesSet.has(5 - idx),
  }))
})

// 图标映射
const iconMap = {
  '起卦方式': '🪷',
  '综合评分': '📊',
  '综合论断': '📝',
  '卦象有效期': '⏳',
  '本卦': '☯',
  '六爻全览': '⚖️',
  '动爻详解': '⚡',
  '动爻': '⚡',
  '变卦': '🔄',
  '互卦': '🔗',
  '体用生克（梅花易数）': '🌿',
  '六亲六神分析': '🏛️',
  '飞神伏神': '👻',
  '八卦类象': '🌌',
}

// 解析文本为结构化段落
function parseSections(text) {
  if (!text) return []
  const sections = []
  const lines = text.split('\n')
  let currentTitle = ''
  let currentContent = ''
  let foundSeparator = false
  let isAfterSeparator = false

  function flushSection() {
    if (currentContent.trim()) {
      const titleKey = currentTitle.replace(/[【】]/g, '').trim().split('：')[0].split('（')[0]
      const icon = iconMap[titleKey] || ''
      const titleDisplay = icon ? `${icon} ${currentTitle.replace(/[【】]/g, '')}` : currentTitle

      let badge = ''
      let badgeColor = ''
      if (titleKey === '综合评分') {
        const m = currentContent.match(/(\d+)分（[^）]+）/)
        if (m) {
          const s = parseInt(m[1])
          badge = `${s}分`
          badgeColor = s >= 75 ? '#30D158' : s >= 50 ? '#FF9F0A' : '#FF453A'
        }
      }

      // 如果是分隔符之后的段落，标记
      const isAfterSep = isAfterSeparator

      sections.push({
        icon,
        title: icon ? titleDisplay : currentTitle.replace(/[【】]/g, ''),
        content: currentContent.trim(),
        badge,
        badgeColor,
        isAfterSeparator: isAfterSep,
      })
      currentContent = ''
    }
  }

  for (const line of lines) {
    // 检测分隔线
    if (line.includes('专业分析详情') || line.includes('━━━')) {
      if (currentContent) flushSection()
      foundSeparator = true
      isAfterSeparator = true
      continue
    }
    if (line.startsWith('【')) {
      flushSection()
      currentTitle = line
    } else {
      currentContent += line + '\n'
    }
  }
  flushSection()

  return sections
}

const allSections = computed(() => parseSections(props.interpretation))

const summarySections = computed(() => allSections.value.filter(s => !s.isAfterSeparator))
const detailSections = computed(() => allSections.value.filter(s => s.isAfterSeparator))
</script>

<style scoped>
/* 卦象可视化 - 重新设计 */
.hexagram-viz {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px 0;
}
.yao-line {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 180px;
}
.yao-label {
  width: 20px;
  font-size: 12px;
  color: var(--label-secondary);
  text-align: right;
  flex-shrink: 0;
}
.yao-track {
  flex: 1;
  height: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.yao-yang-bar {
  width: 100%;
  height: 6px;
  background: var(--gold);
  border-radius: 2px;
}
.yao-yin-bars {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}
.yao-yin-piece {
  flex: 1;
  height: 6px;
  background: var(--gold);
  border-radius: 2px;
}
.yao-yin-gap {
  width: 8px;
  flex-shrink: 0;
}
.yao-mark {
  width: 24px;
  font-size: 11px;
  text-align: left;
  flex-shrink: 0;
}
.moving .yao-yang-bar,
.moving .yao-yin-piece {
  background: #FF453A;
  box-shadow: 0 0 8px rgba(255,69,58,0.5);
}

.gua-name { text-align: center; margin-top: 8px; }
.gua-title { font-size: 20px; font-weight: bold; color: var(--gold); }
.gua-sub { font-size: 12px; color: var(--label-secondary); margin-left: 6px; }
.gua-change { text-align: center; font-size: 13px; color: var(--label-secondary); margin-top: 6px; }
.gua-judgment { font-size: 12px; color: var(--label-secondary); text-align: center; margin-top: 6px; }
.gua-tuan, .gua-xiang {
  margin-top: 8px;
  padding: 8px 12px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-xs);
  border-left: 3px solid var(--gold);
}
.knowledge-label {
  font-size: 11px; font-weight: 600; color: var(--gold);
  margin-bottom: 3px;
}
.knowledge-text {
  font-size: 12px; color: var(--label-secondary); line-height: 1.6;
}

/* 分段展示 */
.interpret-section {
  margin-bottom: 10px;
  padding: 10px 12px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
.section-title { font-size: 14px; font-weight: 600; color: var(--gold); }
.section-badge { font-size: 12px; font-weight: 600; padding: 2px 8px; border-radius: var(--radius-sm); }
.section-body {
  font-size: 13px;
  line-height: 1.7;
  color: var(--label-primary);
  white-space: pre-wrap;
}

/* 折叠按钮 */
.detail-toggle { text-align: center; margin: 8px 0; }
.toggle-btn {
  padding: 8px 20px; height: 36px;
  border-radius: var(--radius-sm);
  border: .5px solid rgba(212,160,23,.25);
  background: rgba(212,160,23,.06);
  color: var(--gold);
  font-size: 13px; font-weight: 500;
  cursor: pointer;
  transition: background .2s;
  font-family: inherit;
}
.toggle-btn:active { background: rgba(212,160,23,.15); }

.detail-content { animation: fadeIn 0.2s ease; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>
