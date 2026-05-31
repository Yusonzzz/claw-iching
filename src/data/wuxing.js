/**
 * 五行生克关系
 */
export const WU_XING = {
  金: { color: '#FFD700', sheng: '水', ke: '木', beiKe: '火', shengWo: '土' },
  木: { color: '#4CAF50', sheng: '火', ke: '土', beiKe: '金', shengWo: '水' },
  水: { color: '#2196F3', sheng: '木', ke: '火', beiKe: '土', shengWo: '金' },
  火: { color: '#F44336', sheng: '土', ke: '金', beiKe: '水', shengWo: '木' },
  土: { color: '#FF9800', sheng: '金', ke: '水', beiKe: '木', shengWo: '火' },
}

/** 五行相生关系 */
export const WU_XING_SHENG = {
  金: '水', 水: '木', 木: '火', 火: '土', 土: '金',
}

/** 五行相克关系 */
export const WU_XING_KE = {
  金: '木', 木: '土', 土: '水', 水: '火', 火: '金',
}

/**
 * 分析八字中五行的分布
 */
export function analyzeWuxing(bazi) {
  const counts = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 }
  const pillars = ['year', 'month', 'day', 'hour']
  
  pillars.forEach(p => {
    const gan = bazi[p].gan
    const zhi = bazi[p].zhi
    if (counts[gan.wuxing] !== undefined) counts[gan.wuxing]++
    if (counts[zhi.wuxing] !== undefined) counts[zhi.wuxing]++
  })

  // 找出最旺和缺失的五行
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  const maxCount = sorted[0][1]
  const minCount = sorted[sorted.length - 1][1]
  const dominant = sorted.filter(([_, c]) => c === maxCount).map(([n]) => n)
  const missing = sorted.filter(([_, c]) => c === minCount).map(([n]) => n)

  // 日主（日干）五行
  const riZhu = bazi.day.gan

  return {
    counts,
    dominant,
    missing,
    riZhu,
    isBalanced: maxCount - minCount <= 1,
    summary() {
      const parts = [`日主为【${riZhu.name}${riZhu.wuxing}】`]
      if (this.isBalanced) {
        parts.push('五行较为平衡')
      } else {
        if (dominant.length) parts.push(`${dominant.join('、')}较旺`)
        if (missing.length) parts.push(`${missing.join('、')}较弱`)
      }
      return parts.join('，')
    }
  }
}
