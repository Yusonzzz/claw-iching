/**
 * 八字命理分析
 */
import { getBazi, formatBazi } from './calendar.js'
import { analyzeWuxing } from '../data/wuxing.js'
import { DI_ZHI } from '../data/dizhi.js'
import { TIAN_GAN } from '../data/tiangan.js'
import { getAllShenSha, formatShenSha } from './shensha.js'
import { analyzeGanZhiInteractions, formatGanZhiInteractions } from './interactionAnalyzer.js'
import { calculateQiYun, generateDaYun, getCurrentDaYun, analyzeDaYunInteraction, formatDaYun } from './dayun.js'

/**
 * 八字完整分析
 * @param {number} year - 公历出生年
 * @param {number} month - 公历出生月
 * @param {number} day - 公历出生日
 * @param {number} hour - 出生小时
 * @param {number} minute - 出生分钟
 * @param {object} city - 出生城市 {name, lng}
 * @param {string} gender - 'male'|'female'
 */
export function analyzeBazi(year, month, day, hour, minute, city, gender) {
  const bazi = getBazi(year, month, day, hour, minute, city)
  const wuxing = analyzeWuxing(bazi)
  const naYin = '' // simplified: could add 纳音 later

  // 命宫推算（简化版）
  const mingGong = calculateMingGong(bazi)

  // 大运推算（简化版：粗略计算几岁起运）
  const daYunAge = calculateDaYunAge(bazi)

  // 神煞
  const shensha = getAllShenSha(
    bazi.day.gan.name,
    bazi.year.zhi.name,
    bazi.month.zhi.name,
    bazi.day.zhi.name,
  )

  // 干支互动
  const interactions = analyzeGanZhiInteractions(bazi)

  // 大运（需要性别）
  let dayun = []
  let currentDayun = null
  if (gender) {
    const qiYun = calculateQiYun(year, month, day, bazi.year.gan.name, gender)
    dayun = generateDaYun(bazi.month.gan.idx, bazi.month.zhi.idx, qiYun.isShun, qiYun.age)
    currentDayun = getCurrentDaYun(dayun, 30) // 简化：假设30岁，后续传真实年龄
    dayun = analyzeDaYunInteraction(dayun, bazi)
  }

  return {
    bazi,
    wuxing,
    naYin,
    mingGong,
    daYunAge,
    shensha,
    interactions,
    dayun,
    currentDayun,
    formatted: formatBazi(bazi),
    summary: generateBaziSummary(bazi, wuxing),
    riZhuAnalysis: analyzeRiZhu(bazi),
    shiShen: calculateShiShen(bazi),
  }
}

/**
 * 日主分析（日干旺衰）
 */
function analyzeRiZhu(bazi) {
  const riGan = bazi.day.gan
  const riZhi = bazi.day.zhi
  const monthZhi = bazi.month.zhi

  // 月令旺衰（简化：地支对应五行在月令的旺衰）
  // 子午卯酉为四正/帝旺，寅申巳亥为长生，辰戌丑未为余气/墓库
  const wangShuai = getYueLingWangShuai(riGan.wuxing, monthZhi.idx)

  return {
    riGan: riGan.name,
    riZhi: riZhi.name,
    riGanWuxing: riGan.wuxing,
    riZhiWuxing: riZhi.wuxing,
    wangShuai,
  }
}

/**
 * 月令旺衰（简化版）
 */
function getYueLingWangShuai(wuxing, monthZhiIdx) {
  // 五行在四季的旺相休囚死
  const wangShuaiTable = {
    // 春(寅卯): 木旺, 火相, 水休, 金囚, 土死
    // 夏(巳午): 火旺, 土相, 木休, 水囚, 金死
    // 秋(申酉): 金旺, 水相, 土休, 火囚, 木死
    // 冬(亥子): 水旺, 木相, 金休, 土囚, 火死
    // 四季末(辰戌丑未): 土旺, 金相, 火休, 木囚, 水死
    木: { 春: '旺', 夏: '休', 秋: '死', 冬: '相', 四季: '囚' },
    火: { 春: '相', 夏: '旺', 秋: '囚', 冬: '死', 四季: '休' },
    金: { 春: '囚', 夏: '死', 秋: '旺', 冬: '休', 四季: '相' },
    水: { 春: '休', 夏: '囚', 秋: '相', 冬: '旺', 四季: '死' },
    土: { 春: '死', 夏: '相', 秋: '休', 冬: '囚', 四季: '旺' },
  }

  let season
  if ([2, 3].includes(monthZhiIdx)) season = '春'
  else if ([5, 6].includes(monthZhiIdx)) season = '夏'
  else if ([8, 9].includes(monthZhiIdx)) season = '秋'
  else if ([11, 0].includes(monthZhiIdx)) season = '冬'
  else season = '四季'

  return wangShuaiTable[wuxing][season]
}

/**
 * 十神分析（简化版）
 */
function calculateShiShen(bazi) {
  const riGan = bazi.day.gan
  const otherGans = ['year', 'month', 'hour'].map(p => bazi[p].gan)

  return otherGans.map((gan, idx) => {
    const relation = getShiShenRelation(riGan.idx, gan.idx)
    const pillarNames = ['年', '月', '时']
    return { pillar: pillarNames[idx], gan: gan.name, relation }
  })
}

/**
 * 十神关系：日干与其他天干的关系
 */
function getShiShenRelation(riGanIdx, otherGanIdx) {
  // 十神表：同我、我生、生我、我克、克我
  const riWuxing = TIAN_GAN[riGanIdx].wuxing
  const otherWuxing = TIAN_GAN[otherGanIdx].wuxing

  if (riWuxing === otherWuxing) {
    // 同我：比肩/劫财（看阴阳）
    return TIAN_GAN[riGanIdx].yinyang === TIAN_GAN[otherGanIdx].yinyang ? '比肩' : '劫财'
  }

  // 生克关系
  const shengMap = { '金': '水', '水': '木', '木': '火', '火': '土', '土': '金' }
  const keMap = { '金': '木', '木': '土', '土': '水', '水': '火', '火': '金' }

  if (shengMap[riWuxing] === otherWuxing) {
    return TIAN_GAN[riGanIdx].yinyang === TIAN_GAN[otherGanIdx].yinyang ? '食神' : '伤官'
  }
  if (shengMap[otherWuxing] === riWuxing) {
    return TIAN_GAN[riGanIdx].yinyang === TIAN_GAN[otherGanIdx].yinyang ? '偏印' : '正印'
  }
  if (keMap[riWuxing] === otherWuxing) {
    return TIAN_GAN[riGanIdx].yinyang === TIAN_GAN[otherGanIdx].yinyang ? '偏财' : '正财'
  }
  if (keMap[otherWuxing] === riWuxing) {
    return TIAN_GAN[riGanIdx].yinyang === TIAN_GAN[otherGanIdx].yinyang ? '七杀' : '正官'
  }

  return ''
}

/**
 * 简化命宫推算
 */
function calculateMingGong(bazi) {
  // 简化：月柱地支+时柱地支 = 命宫地支
  const monthZhiIdx = bazi.month.zhi.idx
  const hourZhiIdx = bazi.hour.zhi.idx
  const mingGongIdx = ((monthZhiIdx + hourZhiIdx) % 12 + 12) % 12
  return { zhi: DI_ZHI[mingGongIdx] }
}

/**
 * 简化大运起运年龄（粗略）
 */
function calculateDaYunAge(bazi) {
  // 阳男阴女顺排，阴男阳女排（简化版粗略计算）
  return 3 // 简化返回3岁起运
}

/**
 * 生成八字总结
 */
function generateBaziSummary(bazi, wuxing) {
  const parts = []
  const riGan = bazi.day.gan
  const riZhi = bazi.day.zhi

  parts.push(`日主${riGan.name}(${riGan.wuxing})，生于${bazi.month.zhi.name}月`)

  // 五行简要分析
  if (!wuxing.isBalanced) {
    if (wuxing.dominant.length) parts.push(`${wuxing.dominant.join('、')}较旺`)
    if (wuxing.missing.length) parts.push(`${wuxing.missing.join('、')}较弱`)
    // 用神建议
    const yongShen = suggestYongShen(riGan, wuxing)
    if (yongShen) parts.push(`建议补${yongShen}`)
  } else {
    parts.push('五行平衡')
  }

  return parts.join('；')
}

/**
 * 用神建议（简化版）
 */
function suggestYongShen(riGan, wuxing) {
  const shengMap = { '金': '土', '水': '金', '木': '水', '火': '木', '土': '火' }
  const missing = wuxing.missing
  // 如果缺某种五行，推荐补充该五行
  if (missing.length === 1 && wuxing.counts[missing[0]] === 0) {
    return missing[0]
  }
  // 如果过旺，推荐泄耗或克制
  const dominant = wuxing.dominant[0]
  const keIt = { '金': '火', '木': '金', '水': '土', '火': '水', '土': '木' }[dominant]
  const shengIt = shengMap[dominant]
  return keIt || shengIt || ''
}
