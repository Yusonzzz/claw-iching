/**
 * 天干地支互动分析引擎
 * 分析八字四柱中所有天干之间、地支之间的互动关系
 */
import {
  TIAN_GAN_WU_HE, TIAN_GAN_XIANG_CHONG,
  DI_ZHI_LIU_HE, DI_ZHI_SAN_HE, DI_ZHI_LIU_CHONG,
  DI_ZHI_SAN_XING, DI_ZHI_LIU_HAI, INTERACTION_INFO,
} from '../data/ganzhiInteractions.js'

/**
 * 分析两个天干之间的互动
 */
function analyzeGanInteraction(gan1, gan2, label1, label2) {
  const results = []

  // 天干五合
  const he = TIAN_GAN_WU_HE[gan1]
  if (he && he.target === gan2) {
    results.push({
      type: '天干五合',
      between: `${label1}${gan1} + ${label2}${gan2}`,
      detail: `化${he.wuxing}`,
      info: INTERACTION_INFO['天干五合'],
    })
  }

  // 天干相冲
  const chong = TIAN_GAN_XIANG_CHONG[gan1]
  if (chong === gan2) {
    results.push({
      type: '天干相冲',
      between: `${label1}${gan1} + ${label2}${gan2}`,
      detail: '相互对立',
      info: INTERACTION_INFO['天干相冲'],
    })
  }

  return results
}

/**
 * 分析两个地支之间的互动
 */
function analyzeZhiInteraction(zhi1, zhi2, label1, label2) {
  const results = []

  // 地支六合
  const liuHe = DI_ZHI_LIU_HE[zhi1]
  if (liuHe && liuHe.target === zhi2) {
    results.push({
      type: '地支六合',
      between: `${label1}${zhi1} + ${label2}${zhi2}`,
      detail: `合化${liuHe.wuxing}`,
      info: INTERACTION_INFO['地支六合'],
    })
  }

  // 地支三合（检查是否在同一局中）
  const sanHe1 = DI_ZHI_SAN_HE[zhi1]
  const sanHe2 = DI_ZHI_SAN_HE[zhi2]
  if (sanHe1 && sanHe2 && sanHe1.group === sanHe2.group && zhi1 !== zhi2) {
    results.push({
      type: '地支三合',
      between: `${label1}${zhi1} + ${label2}${zhi2}`,
      detail: `合${sanHe1.wuxing}局（${sanHe1.group}）`,
      info: INTERACTION_INFO['地支三合'],
    })
  }

  // 地支六冲
  const liuChong = DI_ZHI_LIU_CHONG[zhi1]
  if (liuChong === zhi2) {
    results.push({
      type: '地支六冲',
      between: `${label1}${zhi1} + ${label2}${zhi2}`,
      detail: '相互对冲',
      info: INTERACTION_INFO['地支六冲'],
    })
  }

  // 地支三刑
  const sanXing = DI_ZHI_SAN_XING[zhi1]
  if (sanXing) {
    const targets = Array.isArray(sanXing.target) ? sanXing.target : [sanXing.target]
    if (targets.includes(zhi2) || (zhi1 === zhi2 && targets.includes(zhi1) && sanXing.type === '自刑')) {
      results.push({
        type: '地支三刑',
        between: zhi1 === zhi2 ? `${label1}${zhi1}自刑` : `${label1}${zhi1} + ${label2}${zhi2}`,
        detail: sanXing.type,
        description: sanXing.description,
        info: INTERACTION_INFO['地支三刑'],
      })
    }
  }

  // 地支六害
  const liuHai = DI_ZHI_LIU_HAI[zhi1]
  if (liuHai && liuHai.target === zhi2) {
    results.push({
      type: '地支六害',
      between: `${label1}${zhi1} + ${label2}${zhi2}`,
      detail: '相互妨害',
      description: liuHai.description,
      info: INTERACTION_INFO['地支六害'],
    })
  }

  return results
}

/**
 * 分析八字四柱的所有干支互动
 * @param {object} bazi - 八字对象 { year: {gan, zhi}, month: {gan, zhi}, day: {gan, zhi}, hour: {gan, zhi} }
 * @returns {Array} 所有互动结果
 */
export function analyzeGanZhiInteractions(bazi) {
  if (!bazi) return []
  const results = []

  const pillars = [
    { key: 'year', label: '年柱' },
    { key: 'month', label: '月柱' },
    { key: 'day', label: '日柱' },
    { key: 'hour', label: '时柱' },
  ]

  // 天干之间两两分析
  for (let i = 0; i < pillars.length; i++) {
    for (let j = i + 1; j < pillars.length; j++) {
      const pi = bazi[pillars[i].key]
      const pj = bazi[pillars[j].key]
      if (!pi || !pj) continue

      // 天干互动
      const ganResults = analyzeGanInteraction(
        pi.gan.name, pj.gan.name,
        pillars[i].label, pillars[j].label
      )
      results.push(...ganResults)

      // 地支互动
      const zhiResults = analyzeZhiInteraction(
        pi.zhi.name, pj.zhi.name,
        pillars[i].label, pillars[j].label
      )
      results.push(...zhiResults)
    }
  }

  // 特殊：检查三合局是否完整（三个都在局中才算完整三合）
  // 收集所有地支
  const allZhi = pillars.map(p => bazi[p.key]?.zhi?.name).filter(Boolean)
  checkCompleteSanHe(allZhi, pillars, bazi, results)

  return results
}

/**
 * 检查完整的三合局（三个地支同时出现）
 */
function checkCompleteSanHe(allZhi, pillars, bazi, results) {
  const sanHeGroups = [
    { members: ['申', '子', '辰'], wuxing: '水', name: '申子辰' },
    { members: ['亥', '卯', '未'], wuxing: '木', name: '亥卯未' },
    { members: ['寅', '午', '戌'], wuxing: '火', name: '寅午戌' },
    { members: ['巳', '酉', '丑'], wuxing: '金', name: '巳酉丑' },
  ]

  for (const group of sanHeGroups) {
    const found = group.members.filter(m => allZhi.includes(m))
    if (found.length === 3) {
      const labels = found.map(zhi => {
        for (const p of pillars) {
          if (bazi[p.key]?.zhi?.name === zhi) return `${p.label}${zhi}`
        }
        return zhi
      })
      results.push({
        type: '地支三合',
        between: labels.join(' + '),
        detail: `完整${group.wuxing}局（${group.name}全）`,
        info: {
          type: '合',
          impact: '吉',
          score: 40,
          general: `三合局完整，${group.wuxing}气极强。大局助力显著，运势强劲。`,
        },
      })
    }
  }
}

/**
 * 格式化互动分析文本
 */
export function formatGanZhiInteractions(interactions) {
  if (!interactions || interactions.length === 0) return ''

  const parts = ['\n【干支互动】']
  let totalScore = 0

  for (const item of interactions) {
    const emoji = item.info?.impact === '吉' ? '🟢' : item.info?.impact === '凶' ? '🔴' : '⚪'
    parts.push(`${emoji} ${item.type}：${item.between}`)
    if (item.detail) parts.push(`  └ ${item.detail}`)
    if (item.description) parts.push(`  └ ${item.description}`)
    if (item.info?.general) parts.push(`  └ ${item.info.general}`)
    totalScore += item.info?.score || 0
  }

  if (interactions.length > 0) {
    if (totalScore > 20) parts.push(`\n干支互动总体偏向吉利，和谐因素多于冲突因素。`)
    else if (totalScore < -20) parts.push(`\n干支互动中冲突较多，需注意调和各方面关系。`)
    else parts.push(`\n干支互动吉凶参半，利弊共存。`)
  }

  return parts.join('\n')
}
