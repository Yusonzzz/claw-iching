/**
 * 农历转换引擎
 * 基于公历转农历的查表法（1900-2100）
 * 编码规则：
 * - 低16位：1-12月大小月（1=30天，0=29天）
 * - 16-19位：闰月（0=无闰月）
 * - 20位：闰月大小（1=30天，0=29天）
 */

// 农历数据表（1900-2100年）
const LUNAR_INFO = [
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
  0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
  0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
  0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
  0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
  0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,
  0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
  0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,
  0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
  0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x05ac0, 0x0ab60, 0x096d5, 0x092e0,
  0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
  0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
  0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
  0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
  0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
  0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06aa0, 0x1a6c4, 0x0aae0,
  0x092e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,
  0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,
  0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160,
  0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a4d0, 0x0d150, 0x0f252,
  0x0d520,
]

const TIAN_GAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸']
const DI_ZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']
const SHENG_XIAO = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪']
const LUNAR_MONTHS = ['正','二','三','四','五','六','七','八','九','十','冬','腊']
const LUNAR_DAYS = [
  '初一','初二','初三','初四','初五','初六','初七','初八','初九','初十',
  '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
  '廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'
]

function lunarYearDays(year) {
  let total = 0
  const info = LUNAR_INFO[year - 1900]
  for (let i = 0x8000; i > 0x8; i >>= 1) {
    total += (info & i) ? 30 : 29
  }
  if (leapMonth(year)) {
    total += (info & 0x10000) ? 30 : 29
  }
  return total
}

function leapMonth(year) {
  return LUNAR_INFO[year - 1900] & 0xf
}

function monthDays(year, month) {
  const info = LUNAR_INFO[year - 1900]
  return (info & (0x10000 >> month)) ? 30 : 29
}

function leapMonthDays(year) {
  return (LUNAR_INFO[year - 1900] & 0x10000) ? 30 : 29
}

function getYearGanZhiStr(year) {
  const gan = TIAN_GAN[(year - 4) % 10]
  const zhi = DI_ZHI[(year - 4) % 12]
  return gan + zhi
}

/**
 * 构建某农历年的实际月序列表（含闰月）
 */
function buildLunarMonths(lunarYear) {
  const months = []
  const leap = leapMonth(lunarYear)
  for (let m = 1; m <= 12; m++) {
    months.push({ month: m, isLeap: false, days: monthDays(lunarYear, m) })
    if (leap > 0 && m === leap) {
      months.push({ month: m, isLeap: true, days: leapMonthDays(lunarYear) })
    }
  }
  return months
}

/**
 * 公历转农历
 */
export function solarToLunar(year, month, day) {
  const baseDate = new Date(1900, 0, 31)
  const targetDate = new Date(year, month - 1, day)
  let offset = Math.round((targetDate - baseDate) / 86400000)

  if (offset < 0) {
    return { year: 0, month: 0, day: 0, isLeap: false, monthName: '', dayName: '', ganZhi: '', shengXiao: '', ganZhiYear: '' }
  }

  let lunarYear = 1900
  let yearDays = lunarYearDays(lunarYear)
  while (offset >= yearDays) {
    offset -= yearDays
    lunarYear++
    yearDays = lunarYearDays(lunarYear)
  }

  const months = buildLunarMonths(lunarYear)
  let lunarMonthInfo = null
  for (const m of months) {
    if (offset < m.days) {
      lunarMonthInfo = m
      break
    }
    offset -= m.days
  }

  if (!lunarMonthInfo) {
    lunarMonthInfo = { month: 12, isLeap: false }
  }

  const lunarDay = offset + 1
  const ganZhiYear = getYearGanZhiStr(lunarYear)
  const shengXiao = SHENG_XIAO[(lunarYear - 4) % 12]
  const monthName = (lunarMonthInfo.isLeap ? '闰' : '') + LUNAR_MONTHS[(lunarMonthInfo.month - 1 + 12) % 12] + '月'
  const dayName = LUNAR_DAYS[lunarDay - 1] || ''

  return {
    year: lunarYear,
    month: lunarMonthInfo.month,
    day: lunarDay,
    isLeap: lunarMonthInfo.isLeap,
    monthName,
    dayName,
    ganZhi: ganZhiYear,
    shengXiao,
    ganZhiYear,
  }
}

export function getLunarDateString(year, month, day) {
  const lunar = solarToLunar(year, month, day)
  if (!lunar || !lunar.dayName) return ''
  return `农历${lunar.monthName}${lunar.dayName}`
}

export function getLunarInfo(year, month, day) {
  const lunar = solarToLunar(year, month, day)
  return {
    ...lunar,
    fullString: `农历${lunar.ganZhiYear}年 ${lunar.monthName}${lunar.dayName}`,
    shortString: `${lunar.monthName}${lunar.dayName}`,
    shengXiao: lunar.shengXiao,
  }
}

export { leapMonth as getLeapMonth, monthDays as getLunarMonthDays, leapMonthDays as getLeapMonthDays, LUNAR_MONTHS, LUNAR_DAYS, buildLunarMonths }

/**
 * 农历转公历
 */
export function lunarToSolar(lunarYear, lunarMonth, lunarDay, isLeap = false) {
  if (lunarYear < 1900 || lunarYear > 2100) return null

  const baseDate = new Date(1900, 0, 31)
  let totalDays = 0

  for (let y = 1900; y < lunarYear; y++) {
    totalDays += lunarYearDays(y)
  }

  const months = buildLunarMonths(lunarYear)
  for (const m of months) {
    if (m.month === lunarMonth && m.isLeap === isLeap) break
    totalDays += m.days
  }

  totalDays += (lunarDay - 1)

  const resultDate = new Date(baseDate.getTime() + totalDays * 86400000)
  return {
    year: resultDate.getFullYear(),
    month: resultDate.getMonth() + 1,
    day: resultDate.getDate(),
  }
}
