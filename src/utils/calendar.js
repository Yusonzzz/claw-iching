/**
 * 日历工具函数
 * 包含：公历日期计算、真太阳时校正、农历近似转换
 */

import { getTianGan } from '../data/tiangan.js'
import { getDiZhi, hourToDiZhi } from '../data/dizhi.js'
import { getSolarTermMonthPrecise } from '../data/solarTermsPrecise.js'

/**
 * 计算两个日期之间的天数差
 */
function daysBetween(year1, month1, day1, year2, month2, day2) {
  const d1 = new Date(year1, month1 - 1, day1)
  const d2 = new Date(year2, month2 - 1, day2)
  return Math.round((d2 - d1) / (24 * 60 * 60 * 1000))
}

/**
 * 计算从1900-01-01到指定日期的天数
 */
function daysSince1900(year, month, day) {
  return daysBetween(1900, 1, 1, year, month, day)
}

/**
 * 获取某日的天干地支（干支纪日）
 * 1900-01-01 = 甲戌日（60天周期中位置10）
 * @returns { { gan: object, zhi: object } }
 */
export function getDayGanZhi(year, month, day) {
  const days = daysSince1900(year, month, day)
  const cyclePos = ((days + 10) % 60 + 60) % 60
  const ganIdx = cyclePos % 10
  const zhiIdx = cyclePos % 12
  return { gan: getTianGan(ganIdx), zhi: getDiZhi(zhiIdx) }
}

/**
 * 获取某年的天干地支（干支纪年）
 * 以立春为界（立春一般在2月4日前后）
 * @returns { { gan: object, zhi: object } }
 */
export function getYearGanZhi(year, month) {
  // 立春前仍属上一年
  const effectiveYear = (month >= 2) ? year : year - 1
  const ganIdx = (effectiveYear - 4) % 10
  const zhiIdx = (effectiveYear - 4) % 12
  return { gan: getTianGan(ganIdx), zhi: getDiZhi(zhiIdx) }
}

/**
 * 获取某月的天干地支（干支纪月）
 * 使用五虎遁：年上起月法
 * 以节气为界
 */
export function getMonthGanZhi(yearGanIndex, solarTermMonth) {
  // 地支月：寅=2, 卯=3, ... 丑=1
  const monthZhi = solarTermMonth

  // 五虎遁：甲己之年丙作首，乙庚之岁戊为头
  // 丙辛必定寻庚起，丁壬壬位顺行流
  // 若问戊癸何方发，甲寅之上好追求
  const startGanTable = { 0: 2, 1: 4, 2: 6, 3: 8, 4: 0 }
  const yearGanMod5 = ((yearGanIndex % 5) + 5) % 5
  const startGan = startGanTable[yearGanMod5]

  // 寅月用startGan，卯月用下一个...
  const offset = ((monthZhi - 2) % 12 + 12) % 12
  const ganIdx = (startGan + offset) % 10

  return { gan: getTianGan(ganIdx), zhi: getDiZhi(monthZhi) }
}

/**
 * 获取某时辰的天干地支（干支纪时）
 * 使用五鼠遁：日上起时法
 */
export function getHourGanZhi(dayGanIndex, hour) {
  const hourZhi = hourToDiZhi(hour)

  // 五鼠遁：甲己还加甲，乙庚丙作初
  // 丙辛从戊起，丁壬庚子居
  // 戊癸何方发，壬子是真途
  const startGanTable = { 0: 0, 1: 2, 2: 4, 3: 6, 4: 8 }
  const dayGanMod5 = ((dayGanIndex % 5) + 5) % 5
  const startGan = startGanTable[dayGanMod5]

  const ganIdx = (startGan + hourZhi) % 10

  return { gan: getTianGan(ganIdx), zhi: getDiZhi(hourZhi) }
}

/**
 * 真太阳时校正
 * 将北京时间转换为出生地的真太阳时
 * @param {number} hour - 北京时间的小时（含分钟小数）
 * @param {number} minute - 分钟
 * @param {number} cityLng - 出生城市的经度
 * @returns { { hour: number, minute: number, totalHours: number } } 校正后的小时和分钟
 */
export function trueSolarTime(hour, minute, cityLng) {
  // 北京时间以东经120度为标准
  const beijingLng = 120
  const lngDiff = cityLng - beijingLng
  // 每度经度差对应4分钟
  const timeDiffMinutes = lngDiff * 4
  // 加上均时差修正（简化版，不考虑季节性变化）
  let totalMinutes = hour * 60 + minute + timeDiffMinutes

  // 处理日期边界
  totalMinutes = ((totalMinutes % 1440) + 1440) % 1440

  const resultHour = Math.floor(totalMinutes / 60)
  const resultMinute = Math.floor(totalMinutes % 60)
  return { hour: resultHour, minute: resultMinute, totalHours: resultHour + resultMinute / 60 }
}

/**
 * 获取完整八字（四柱）
 * @param {number} year - 公历年份
 * @param {number} month - 公历月份
 * @param {number} day - 公历日期
 * @param {number} hour - 出生小时
 * @param {number} minute - 出生分钟
 * @param {object} city - { name, lng, tz } 出生城市
 * @returns { { year: {}, month: {}, day: {}, hour: {}, solarTermMonth: number } }
 */
export function getBazi(year, month, day, hour, minute, city) {
  // 如果提供了城市，进行真太阳时校正
  let adjustedHour = hour
  if (city && city.lng !== undefined) {
    const solarTime = trueSolarTime(hour, minute, city.lng)
    adjustedHour = solarTime.hour
  }

  // 年柱
  const yearGZ = getYearGanZhi(year, month)

  // 月柱（需要节气月）
  const solarTermMonth = getSolarTermMonthPrecise(year, month, day)
  const monthGZ = getMonthGanZhi(yearGZ.gan.idx, solarTermMonth)

  // 日柱
  const dayGZ = getDayGanZhi(year, month, day)

  // 时柱
  const hourGZ = getHourGanZhi(dayGZ.gan.idx, adjustedHour)

  return {
    year: yearGZ,
    month: monthGZ,
    day: dayGZ,
    hour: hourGZ,
    solarTermMonth,
    adjustedHour,
  }
}

/**
 * 简化版节气月判断
 * 使用近似日期判断节气月份
 */
function getSolarTermMonthSimple(year, month, day) {
  // 节气大概日期（每月两个节气）
  // 寅月(2): 立春(2/4) ~ 惊蛰(3/5)
  // 卯月(3): 惊蛰(3/6) ~ 清明(4/4)
  // 辰月(4): 清明(4/5) ~ 立夏(5/5)
  // 巳月(5): 立夏(5/6) ~ 芒种(6/5)
  // 午月(6): 芒种(6/6) ~ 小暑(7/6)
  // 未月(7): 小暑(7/7) ~ 立秋(8/7)
  // 申月(8): 立秋(8/8) ~ 白露(9/7)
  // 酉月(9): 白露(9/8) ~ 寒露(10/7)
  // 戌月(10): 寒露(10/8) ~ 立冬(11/7)
  // 亥月(11): 立冬(11/8) ~ 大雪(12/6)
  // 子月(0): 大雪(12/7) ~ 小寒(1/5)
  // 丑月(1): 小寒(1/6) ~ 立春(2/3)
  
  const boundaries = [
    { m: 2, d: 4, dz: 2 },   // 立春 → 寅(2)
    { m: 3, d: 6, dz: 3 },   // 惊蛰 → 卯(3)
    { m: 4, d: 5, dz: 4 },   // 清明 → 辰(4)
    { m: 5, d: 6, dz: 5 },   // 立夏 → 巳(5)
    { m: 6, d: 6, dz: 6 },   // 芒种 → 午(6)
    { m: 7, d: 7, dz: 7 },   // 小暑 → 未(7)
    { m: 8, d: 8, dz: 8 },   // 立秋 → 申(8)
    { m: 9, d: 8, dz: 9 },   // 白露 → 酉(9)
    { m: 10, d: 8, dz: 10 }, // 寒露 → 戌(10)
    { m: 11, d: 8, dz: 11 }, // 立冬 → 亥(11)
    { m: 12, d: 7, dz: 0 },  // 大雪 → 子(0)
    { m: 1, d: 6, dz: 1 },   // 小寒 → 丑(1)
  ]

  // 如果日期在立春之前（1月-2月初），可能是上一年丑月
  if (month === 1 || (month === 2 && day < 4)) {
    // 检查是否在小寒之后
    if ((month === 1 && day >= 6) || (month === 2)) {
      return 1 // 丑月
    }
    return 0 // 子月
  }

  for (let i = boundaries.length - 1; i >= 0; i--) {
    const b = boundaries[i]
    if (month > b.m || (month === b.m && day >= b.d)) {
      return b.dz
    }
  }

  // 默认寅月
  return 2
}

/**
 * 格式化八字为字符串
 */
export function formatBazi(bazi) {
  return `${bazi.year.gan.name}${bazi.year.zhi.name}年 ` +
         `${bazi.month.gan.name}${bazi.month.zhi.name}月 ` +
         `${bazi.day.gan.name}${bazi.day.zhi.name}日 ` +
         `${bazi.hour.gan.name}${bazi.hour.zhi.name}时`
}

/**
 * 格式化纳音五行（简化版）
 */
export function getNaYinWuxing(yearGan, yearZhi) {
  // 简化版：根据年干支的五行属性做参考
  const wuxingMap = {
    '甲子': '金', '乙丑': '金',
    '丙寅': '火', '丁卯': '火',
    '戊辰': '木', '己巳': '木',
    '庚午': '土', '辛未': '土',
    '壬申': '金', '癸酉': '金',
    '甲戌': '火', '乙亥': '火',
    '丙子': '水', '丁丑': '水',
    '戊寅': '土', '己卯': '土',
    '庚辰': '金', '辛巳': '金',
    '壬午': '木', '癸未': '木',
    '甲申': '水', '乙酉': '水',
    '丙戌': '土', '丁亥': '土',
    '戊子': '火', '己丑': '火',
    '庚寅': '木', '辛卯': '木',
    '壬辰': '水', '癸巳': '水',
    '甲午': '金', '乙未': '金',
    '丙申': '火', '丁酉': '火',
    '戊戌': '木', '己亥': '木',
    '庚子': '土', '辛丑': '土',
    '壬寅': '金', '癸卯': '金',
    '甲辰': '火', '乙巳': '火',
    '丙午': '水', '丁未': '水',
    '戊申': '土', '己酉': '土',
    '庚戌': '金', '辛亥': '金',
    '壬子': '木', '癸丑': '木',
    '甲寅': '水', '乙卯': '水',
    '丙辰': '土', '丁巳': '土',
    '戊午': '火', '己未': '火',
    '庚申': '木', '辛酉': '木',
    '壬戌': '水', '癸亥': '水',
  }
  
  return wuxingMap[`${yearGan}${yearZhi}`] || ''
}
