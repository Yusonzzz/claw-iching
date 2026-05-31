/**
 * 流月分析
 * 在年运势中展开12个月的逐月分析
 */
import { getMonthGanZhi } from './calendar.js'
import { getMonthlyHexagram, generateInterpretation } from './iching.js'
import { getTianGan } from '../data/tiangan.js'
import { DI_ZHI } from '../data/dizhi.js'

const MONTH_NAMES = ['正月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '冬月', '腊月']

/**
 * 获取某年12个月的流月分析
 */
export function getLiuYueAnalysis(year, baziContext) {
  const months = []

  // 年干
  const yearGan = getTianGan((year - 4) % 10)
  const yearGanIndex = yearGan.idx

  for (let m = 1; m <= 12; m++) {
    // 节气月的地支：寅=2, 卯=3, ... 丑=1
    const solarTermMonth = ((m + 1) % 12) // 公历月m对节气月 (m+1月=寅月/2)
    
    // 使用五虎遁计算流月天干
    const startGanTable = { 0: 2, 1: 4, 2: 6, 3: 8, 4: 0 }
    const yearGanMod5 = ((yearGanIndex % 5) + 5) % 5
    const startGan = startGanTable[yearGanMod5]
    const ganIdx = (startGan + m - 1) % 10
    const zhiIdx = (m + 1) % 12 // 寅=2, 卯=3...

    const monthGan = getTianGan(ganIdx)
    const monthZhi = DI_ZHI[zhiIdx]

    // 该月中旬起卦（月中15日左右）
    const monthHex = getMonthlyHexagram(year, m + 2 > 12 ? m - 10 : m + 2)
    const question = `${year}年${MONTH_NAMES[m-1]}运势`

    months.push({
      index: m,
      lunarMonth: m,
      name: MONTH_NAMES[m - 1],
      ganZhi: `${monthGan.name}${monthZhi.name}`,
      gan: monthGan,
      zhi: monthZhi,
      wuxing: monthGan.wuxing,
      hexagram: monthHex,
      interpretation: monthHex ? generateInterpretation(monthHex, question, baziContext) : '',
    })
  }

  return months
}

/**
 * 格式化流月分析文本（精简版，用于年运势内展示）
 */
export function formatLiuYue(liuYue) {
  if (!liuYue || liuYue.length === 0) return ''

  const lines = ['\n【流月】']
  for (const month of liuYue) {
    const hexName = month.hexagram?.original?.name || '—'
    const score = month.hexagram?.tiYong?.score
    const scoreLabel = score ? (score >= 75 ? '吉' : score >= 50 ? '平' : '凶') : ''
    lines.push(`  ${month.name}（${month.ganZhi}·${month.wuxing}）→ ${hexName}${scoreLabel ? ` ${scoreLabel}` : ''}`)
  }
  return lines.join('\n')
}
