/**
 * 大运排盘引擎
 * 阳男阴女顺排，阴男阳女逆排
 * 起运年龄 = (节气间距天数) / 3
 */
import { getTianGan } from '../data/tiangan.js'
import { getDiZhi } from '../data/dizhi.js'
import { getJieDate } from '../data/solarTermsPrecise.js'
import { analyzeWuxing } from '../data/wuxing.js'

// 天干地支序列
const GAN_LIST = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸']
const ZHI_LIST = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']

function getGanIndex(name) { return GAN_LIST.indexOf(name) }
function getZhiIndex(name) { return ZHI_LIST.indexOf(name) }

/**
 * 计算起运年龄
 * @param {number} year - 出生年
 * @param {number} month - 出生月
 * @param {number} day - 出生日
 * @param {string} yearGan - 年干（如"甲"）
 * @param {string} gender - 'male' | 'female'
 * @returns { { age: number, direction: string, startDate: object } }
 */
export function calculateQiYun(birthYear, birthMonth, birthDay, yearGan, gender) {
  const ganIdx = getGanIndex(yearGan)
  const isYang = ganIdx % 2 === 0 // 甲丙戊庚壬为阳
  const isShun = (isYang && gender === 'male') || (!isYang && gender === 'female')

  // 找到出生后的第一个节（顺排）或上一个节（逆排）
  const currentJieDates = getAllJieForYear(birthYear)
  const prevYearJie = getAllJieForYear(birthYear - 1)

  let targetJie = null

  if (isShun) {
    // 顺排：找下一个节
    const birthJD = new Date(birthYear, birthMonth - 1, birthDay).getTime()
    for (const jie of currentJieDates) {
      const jieJD = new Date(birthYear, jie.month - 1, jie.day).getTime()
      if (jieJD > birthJD) {
        targetJie = jie
        break
      }
    }
    // 如果今年没有找到（如出生在12月最后一个节之后），取下一年立春
    if (!targetJie) {
      const nextYearFirst = getJieDate(birthYear + 1, 0) // 立春
      targetJie = { ...nextYearFirst, name: '立春' }
    }
  } else {
    // 逆排：找上一个节
    const birthJD = new Date(birthYear, birthMonth - 1, birthDay).getTime()
    // 先查今年的节
    for (let i = currentJieDates.length - 1; i >= 0; i--) {
      const jie = currentJieDates[i]
      const jieJD = new Date(birthYear, jie.month - 1, jie.day).getTime()
      if (jieJD < birthJD) {
        targetJie = jie
        break
      }
    }
    // 如果没找到（出生在立春前），取上一年小寒
    if (!targetJie) {
      targetJie = prevYearJie[prevYearJie.length - 1] // 小寒
    }
  }

  if (!targetJie) return { age: 3, direction: isShun ? '顺排' : '逆排', startDate: null }

  // 计算天数差
  const birthDate = new Date(birthYear, birthMonth - 1, birthDay)
  const jieDate = new Date(
    targetJie.year || birthYear,
    (targetJie.month || 1) - 1,
    targetJie.day || 1
  )
  const diffDays = Math.abs(Math.round((jieDate - birthDate) / 86400000))

  // 3天 = 1岁，余1天=4个月，余1时辰=10天
  const age = Math.floor(diffDays / 3)
  const remainder = diffDays % 3
  const extraMonths = remainder * 4 // 余1天=4个月, 余2天=8个月

  return {
    age: Math.max(age, 1), // 最小1岁起运
    months: extraMonths,
    direction: isShun ? '顺排' : '逆排',
    isShun,
    startJie: targetJie.name,
    startDate: targetJie,
    diffDays,
  }
}

/**
 * 获取10步大运
 * @param {number} baziMonthGanIdx - 月柱天干索引
 * @param {number} baziMonthZhiIdx - 月柱地支索引
 * @param {boolean} isShun - 是否顺排
 * @param {number} qiYunAge - 起运年龄
 * @returns {Array} 大运列表 [{ gan, zhi, startAge, endAge }]
 */
export function generateDaYun(baziMonthGanIdx, baziMonthZhiIdx, isShun, qiYunAge) {
  const dayun = []
  const step = isShun ? 1 : -1

  for (let i = 0; i < 10; i++) {
    const ganIdx = ((baziMonthGanIdx + (i + 1) * step) % 10 + 10) % 10
    const zhiIdx = ((baziMonthZhiIdx + (i + 1) * step) % 12 + 12) % 12
    const startAge = qiYunAge + i * 10
    const endAge = qiYunAge + (i + 1) * 10

    dayun.push({
      index: i + 1,
      gan: GAN_LIST[ganIdx],
      zhi: ZHI_LIST[zhiIdx],
      ganObj: getTianGan(ganIdx),
      zhiObj: getDiZhi(zhiIdx),
      startAge,
      endAge,
      label: `${GAN_LIST[ganIdx]}${ZHI_LIST[zhiIdx]}（${startAge}-${endAge}岁）`,
    })
  }

  return dayun
}

/**
 * 分析当前所处的大运
 */
export function getCurrentDaYun(dayun, currentAge) {
  return dayun.find(d => currentAge >= d.startAge && currentAge < d.endAge) || null
}

/**
 * 大运与八字原局的互动简析
 */
export function analyzeDaYunInteraction(dayun, bazi) {
  if (!dayun || dayun.length === 0) return []

  const results = []

  for (const dy of dayun) {
    const notes = []
    const ganWx = dy.ganObj.wuxing
    const zhiWx = dy.zhiObj.wuxing
    const riGanWx = bazi.day.gan.wuxing

    // 大运天干与日干关系
    if (ganWx === riGanWx) {
      notes.push(dy.ganObj.yinyang === bazi.day.gan.yinyang ? '比肩运' : '劫财运')
    } else {
      const shengMap = { '金': '水', '水': '木', '木': '火', '火': '土', '土': '金' }
      const keMap = { '金': '木', '木': '土', '土': '水', '水': '火', '火': '金' }
      if (shengMap[ganWx] === riGanWx) notes.push('印运（贵人运）')
      else if (shengMap[riGanWx] === ganWx) notes.push('食伤运（发挥才能）')
      else if (keMap[ganWx] === riGanWx) notes.push('官杀运（压力挑战）')
      else notes.push('财运')
    }

    results.push({
      ...dy,
      summary: notes.join('、'),
    })
  }

  return results
}

/**
 * 获取某年所有节（用于起运计算）
 */
function getAllJieForYear(year) {
  const jieIndices = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22]
  const jieNames = ['立春','惊蛰','清明','立夏','芒种','小暑','立秋','白露','寒露','立冬','大雪','小寒']
  const results = []
  for (let i = 0; i < 12; i++) {
    const date = getJieDate(year, i)
    if (date) {
      results.push({
        index: i,
        name: jieNames[i],
        year: date.year,
        month: date.month,
        day: date.day,
      })
    }
  }
  return results
}

/**
 * 格式化大运文本
 */
export function formatDaYun(dayun, currentDayun) {
  if (!dayun || dayun.length === 0) return ''
  const lines = ['【大运】']
  for (const dy of dayun) {
    const marker = currentDayun && dy.index === currentDayun.index ? ' ← 当前大运' : ''
    lines.push(`  ${dy.label}${marker}`)
    if (dy.summary) lines.push(`    └ ${dy.summary}`)
  }
  return lines.join('\n')
}
