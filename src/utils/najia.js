/**
 * 纳甲装卦推算引擎
 */
import {
  TRIGRAM_NA_ZHI, TRIGRAM_NA_GAN, HEXAGRAM_NAJIA_INFO,
  ZHI_WUXING, PALACE_WUXING, getLiuQin, getLiuShen, LIU_SHEN_MEANING,
} from '../data/najiaData.js'

/**
 * 为卦象的每条爻配纳甲信息
 * @param {string} hexagramName - 卦名（如 "乾为天"）
 * @param {string} upperName - 上卦名
 * @param {string} lowerName - 下卦名
 * @param {string} dayGan - 占卜日的天干（如"甲"）
 * @returns {Array} 六爻纳甲信息 [初, 二, 三, 四, 五, 上]
 */
export function applyNajia(hexagramName, upperName, lowerName, dayGan) {
  const info = HEXAGRAM_NAJIA_INFO[hexagramName]
  if (!info) return null

  const palaceName = info.palace
  const palaceWx = PALACE_WUXING[palaceName] || ''
  const shiYao = info.shi
  const yingYao = info.ying

  const innerZhi = TRIGRAM_NA_ZHI.inner[lowerName]
  const outerZhi = TRIGRAM_NA_ZHI.outer[upperName]

  // 六爻干支：[初, 二, 三, 四, 五, 上]
  const allZhi = [...innerZhi, ...outerZhi]
  const innerGan = TRIGRAM_NA_GAN[lowerName]?.inner || ''
  const outerGan = TRIGRAM_NA_GAN[upperName]?.outer || ''
  const allGan = [innerGan, innerGan, innerGan, outerGan, outerGan, outerGan]

  const result = allZhi.map((zhi, idx) => {
    const gan = allGan[idx]
    const liuQin = getLiuQin(palaceWx, zhi, gan)
    const liuShen = getLiuShen(dayGan, idx)
    const wuxing = ZHI_WUXING[zhi] || ''
    const isShi = idx === shiYao
    const isYing = idx === yingYao

    return {
      position: ['初', '二', '三', '四', '五', '上'][idx],
      gan,
      zhi,
      wuxing,
      liuQin,
      liuShen,
      liuShenMeaning: LIU_SHEN_MEANING[liuShen] || '',
      isShi,
      isYing,
      palaceWx, // 宫位五行
    }
  })

  return {
    lines: result,
    palaceName,
    palaceWx,
    shiYao,
    yingYao,
  }
}

/**
 * 生成纳甲解卦文字
 */
export function generateNajiaInterpretation(najia) {
  if (!najia) return ''
  const lines = []

  lines.push(`【纳甲装卦】宫位：${najia.palaceName}宫${najia.palaceWx}`)

  for (const line of najia.lines) {
    const parts = []
    if (line.isShi) parts.push('【世】')
    if (line.isYing) parts.push('【应】')
    parts.push(`${line.position}爻`)
    parts.push(`${line.gan}${line.zhi}`)
    if (line.wuxing) parts.push(line.wuxing)
    parts.push(line.liuQin)
    parts.push(line.liuShen)
    lines.push(`  ${parts.join(' ')}`)
  }

  return lines.join('\n')
}
