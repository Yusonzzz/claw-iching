/**
 * 二十四节气数据（用于月柱推算）
 * 每个节气包含：名称、对应月份、是否中气
 * 实际的节气日期每年不同，这里提供近似值用于推算
 */

// 节气名称列表（按顺序，从立春开始）
export const SOLAR_TERM_NAMES = [
  '立春', '雨水', '惊蛰', '春分', '清明', '谷雨',
  '立夏', '小满', '芒种', '夏至', '小暑', '大暑',
  '立秋', '处暑', '白露', '秋分', '寒露', '霜降',
  '立冬', '小雪', '大雪', '冬至', '小寒', '大寒',
]

// 每个节气对应的地支月（立春开始为寅月）
// 节气索引 → 地支索引
export const SOLAR_TERM_TO_MONTH = [
  2, 2, 3, 3, 4, 4,   // 寅(2), 寅, 卯(3), 卯, 辰(4), 辰
  5, 5, 6, 6, 7, 7,   // 巳(5), 巳, 午(6), 午, 未(7), 未
  8, 8, 9, 9, 10, 10, // 申(8), 申, 酉(9), 酉, 戌(10), 戌
  11, 11, 0, 0, 1, 1, // 亥(11), 亥, 子(0), 子, 丑(1), 丑
]

/**
 * 计算某年的立春时间（近似，公历2月3-5日）
 * 精确计算需要查万年历，此处用公式近似
 */
function approximateSolarTermDate(year, termIndex) {
  // 节气近似日期（月/日），对于大多数年份在±1天内准确
  const approxDates = [
    [2, 4],   // 立春
    [2, 19],  // 雨水
    [3, 6],   // 惊蛰
    [3, 21],  // 春分
    [4, 5],   // 清明
    [4, 20],  // 谷雨
    [5, 6],   // 立夏
    [5, 21],  // 小满
    [6, 6],   // 芒种
    [6, 21],  // 夏至
    [7, 7],   // 小暑
    [7, 23],  // 大暑
    [8, 7],   // 立秋
    [8, 23],  // 处暑
    [9, 8],   // 白露
    [9, 23],  // 秋分
    [10, 8],  // 寒露
    [10, 23], // 霜降
    [11, 7],  // 立冬
    [11, 22], // 小雪
    [12, 7],  // 大雪
    [12, 22], // 冬至
    [1, 6],   // 小寒
    [1, 20],  // 大寒
  ]
  return approxDates[termIndex]
}

/**
 * 获取某年各节气的公历日期
 * 使用简化的天文计算
 */
export function getSolarTermsForYear(year) {
  const terms = []
  for (let i = 0; i < 24; i++) {
    const [month, day] = approximateSolarTermDate(year, i)
    terms.push({ index: i, name: SOLAR_TERM_NAMES[i], month, day })
  }
  return terms
}

/**
 * 判断某公历日期所在的节气月（地支月）
 * 返回地支索引 (2=寅月[正月]...1=丑月[腊月])
 */
export function getSolarTermMonth(year, month, day) {
  const terms = getSolarTermsForYear(year)
  
  // 找上一个最近的节气
  for (let i = terms.length - 1; i >= 0; i--) {
    const t = terms[i]
    if (month > t.month || (month === t.month && day >= t.day)) {
      return SOLAR_TERM_TO_MONTH[i]
    }
  }
  // 如果日期在立春之前（1月），可能是上一年腊月
  // 检查上一年的大寒
  const prevTerms = getSolarTermsForYear(year - 1)
  const dahan = prevTerms[23] // 大寒
  if (month > dahan.month || (month === dahan.month && day >= dahan.day)) {
    return SOLAR_TERM_TO_MONTH[23] // 丑月
  }
  return SOLAR_TERM_TO_MONTH[0] // 默认寅月
}

/**
 * 简化版农历日期近似转换
 * 返回 { lunarMonth, lunarDay, isLeap }
 * 注意：精确转换需要查表，这里使用近似算法
 */
export function solarToLunarApprox(year, month, day) {
  // 此处返回简化值，精确农历需要更复杂的查表法
  // 近似：农历月大致比公历月晚1个月左右
  let lunarMonth = month - 1
  let lunarDay = day
  if (lunarMonth <= 0) { lunarMonth = 12; year-- }
  return { lunarYear: year, lunarMonth, lunarDay, isLeap: false }
}
