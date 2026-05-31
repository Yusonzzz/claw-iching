/**
 * 全动态运势综合分析
 * 支持任意日期/周/月/年，自动传入隐含问题文本触发类象
 */
import { analyzeBazi } from './bazi.js'
import { getDayGanZhi } from './calendar.js'
import { getDailyHexagram, getWeeklyHexagram, getMonthlyHexagram, getYearlyHexagram, generateInterpretation } from './iching.js'
import { getLiuYueAnalysis, formatLiuYue } from './liuyue.js'

const IMPLICIT_QUESTIONS = {
  daily: '今日运势如何',
  weekly: '本周运势如何',
  monthly: '本月运势如何',
  yearly: '今年运势如何',
}

/**
 * 获取完整运势分析（全动态）
 * @param {object} profile - 生辰档案
 * @param {object} time - { year, month, day } 当前查看的时间
 * @param {string} period - 'daily' | 'weekly' | 'monthly' | 'yearly'
 */
export function getFortuneAnalysis(profile, time, period = 'daily') {
  const now = time || { year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate() }
  const { year, month, day } = now

  let baziContext = null
  if (profile) {
    const city = profile.cityName ? { name: profile.cityName, lng: profile.lng } : null
    baziContext = analyzeBazi(
      profile.birthYear, profile.birthMonth, profile.birthDay,
      profile.birthHour || 12, profile.birthMinute || 0, city
    )
  }

  return {
    daily: getDailyFortune(year, month, day, baziContext),
    weekly: getWeeklyFortune(year, month, day, baziContext),
    monthly: getMonthlyFortune(year, month, baziContext),
    yearly: getYearlyFortune(year, baziContext),
    baziContext,
    date: { year, month, day },
  }
}

/**
 * 查询单一日期的运势
 */
export function getSingleFortune(profile, year, month, day, period) {
  let baziContext = null
  if (profile) {
    const city = profile.cityName ? { name: profile.cityName, lng: profile.lng } : null
    baziContext = analyzeBazi(
      profile.birthYear, profile.birthMonth, profile.birthDay,
      profile.birthHour || 12, profile.birthMinute || 0, city
    )
  }

  // 根据 period 生成不同维度的运势 + 隐含问题
  const question = IMPLICIT_QUESTIONS[period] || '今日运势如何'

  switch (period) {
    case 'yearly':
      return getYearlyFortune(year, baziContext, question, profile?.name)
    case 'monthly':
      return getMonthlyFortune(year, month, baziContext, question, profile?.name)
    case 'weekly':
      return getWeeklyFortune(year, month, day, baziContext, question, profile?.name)
    case 'daily':
    default:
      return getDailyFortune(year, month, day, baziContext, question, profile?.name)
  }
}

function getDailyFortune(year, month, day, baziContext, question, userName) {
  question = question || IMPLICIT_QUESTIONS.daily
  const dailyHex = getDailyHexagram(year, month, day)
  const dayGZ = getDayGanZhi(year, month, day)
  const interpretation = dailyHex ? generateInterpretation(dailyHex, question, baziContext, userName) : ''

  return {
    title: `${year}年${month}月${day}日 运势`,
    ganZhi: `${dayGZ.gan.name}${dayGZ.zhi.name}日`,
    hexagram: dailyHex,
    interpretation,
  }
}

function getWeeklyFortune(year, month, day, baziContext, question, userName) {
  question = question || IMPLICIT_QUESTIONS.weekly
  const weeklyHex = getWeeklyHexagram(year, month, day)
  const interpretation = weeklyHex ? generateInterpretation(weeklyHex, question, baziContext, userName) : ''

  return {
    title: `${year}年第${getWeekNumber(year, month, day)}周 运势`,
    hexagram: weeklyHex,
    interpretation,
  }
}

function getMonthlyFortune(year, month, baziContext, question, userName) {
  question = question || IMPLICIT_QUESTIONS.monthly
  const monthlyHex = getMonthlyHexagram(year, month)
  const interpretation = monthlyHex ? generateInterpretation(monthlyHex, question, baziContext, userName) : ''

  return {
    title: `${year}年${month}月 运势`,
    hexagram: monthlyHex,
    interpretation,
  }
}

function getYearlyFortune(year, baziContext, question, userName) {
  question = question || IMPLICIT_QUESTIONS.yearly
  const yearlyHex = getYearlyHexagram(year)
  const interpretation = yearlyHex ? generateInterpretation(yearlyHex, question, baziContext, userName) : ''

  // 流月分析
  const liuYue = baziContext ? getLiuYueAnalysis(year, baziContext) : []

  let liuNian = ''
  if (baziContext) {
    const yearGZ = baziContext.bazi.year
    const riGan = baziContext.bazi.day.gan
    liuNian = `流年为${yearGZ.gan.name}${yearGZ.zhi.name}年，日主为${riGan.name}`

    if (yearGZ.gan.wuxing === riGan.wuxing) {
      liuNian += yearGZ.gan.yinyang === riGan.yinyang
        ? '，比肩之年，自我意识增强，注意人际关系。'
        : '，劫财之年，社交活跃但注意财务。'
    } else {
      const shengMap = { '金': '水', '水': '木', '木': '火', '火': '土', '土': '金' }
      const keMap = { '金': '木', '木': '土', '土': '水', '水': '火', '火': '金' }
      if (shengMap[yearGZ.gan.wuxing] === riGan.wuxing) liuNian += '，天干生我，贵人运旺。'
      else if (shengMap[riGan.wuxing] === yearGZ.gan.wuxing) liuNian += '，我生天干，需付出更多。'
      else if (keMap[yearGZ.gan.wuxing] === riGan.wuxing) liuNian += '，天干克我，压力较大，需谨慎。'
      else liuNian += '，天干我克，能掌控局面。'
    }
  }

  // 流月文本追加到解读
  let fullInterpretation = interpretation
  if (liuYue.length > 0) {
    fullInterpretation += `\n\n${formatLiuYue(liuYue)}`
  }

  return { title: `${year}年运势`, liuNian, hexagram: yearlyHex, interpretation: fullInterpretation, liuYue }
}

function getWeekNumber(year, month, day) {
  const date = new Date(year, month - 1, day)
  const startOfYear = new Date(year, 0, 1)
  const diff = date - startOfYear
  return Math.ceil((((diff / 86400000) + startOfYear.getDay() + 1) / 7))
}
