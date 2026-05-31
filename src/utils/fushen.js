/**
 * 飞神伏神系统
 * 通过比较当前卦与所属八宫纯卦，找出隐藏爻（伏神）
 * 飞神 = 当前卦的爻，伏神 = 纯卦对应的隐藏爻
 */
import { HEXAGRAM_NAJIA_INFO, PALACE_WUXING, ZHI_WUXING, getLiuQin, getLiuShen, LIU_SHEN_MEANING } from '../data/najiaData.js'
import { applyNajia } from './najia.js'

// 八宫纯卦
const PURE_HEXAGRAMS = {
  '乾': '乾为天',
  '坎': '坎为水',
  '艮': '艮为山',
  '震': '震为雷',
  '巽': '巽为风',
  '离': '离为火',
  '坤': '坤为地',
  '兑': '兑为泽',
}

/**
 * 获取伏神信息
 * @param {string} hexagramName - 当前卦名
 * @param {string} upperName - 上卦名
 * @param {string} lowerName - 下卦名
 * @param {string} dayGan - 日干
 * @returns {Array} 伏神信息 [{ position, hiddenLine, description }]
 */
export function getFuShen(hexagramName, upperName, lowerName, dayGan) {
  const info = HEXAGRAM_NAJIA_INFO[hexagramName]
  if (!info) return []

  const palaceName = info.palace
  const pureName = PURE_HEXAGRAMS[palaceName]
  if (!pureName) return []

  // 纯卦的纳甲信息
  // 乾为天: 上下皆乾, 坎为水: 上下皆坎...
  const pureUpper = palaceName
  const pureLower = palaceName
  const pureNajia = applyNajia(pureName, pureUpper, pureLower, dayGan)

  // 当前卦的纳甲信息
  const currentNajia = applyNajia(hexagramName, upperName, lowerName, dayGan)

  if (!pureNajia || !currentNajia) return []

  const fuShenList = []

  for (let i = 0; i < 6; i++) {
    const currentLine = currentNajia.lines[i]
    const pureLine = pureNajia.lines[i]
    const position = ['初', '二', '三', '四', '五', '上'][i]

    // 如果地支不同，则纯卦的爻为伏神
    if (currentLine.zhi !== pureLine.zhi) {
      fuShenList.push({
        index: i,
        position,
        // 飞神：当前卦的爻
        feiShen: {
          gan: currentLine.gan,
          zhi: currentLine.zhi,
          wuxing: currentLine.wuxing,
          liuQin: currentLine.liuQin,
          liuShen: currentLine.liuShen,
        },
        // 伏神：纯卦隐藏的爻
        fuShen: {
          gan: pureLine.gan,
          zhi: pureLine.zhi,
          wuxing: pureLine.wuxing,
          liuQin: pureLine.liuQin,
          liuShen: pureLine.liuShen,
        },
        description: generateFuShenDescription(pureLine.liuQin, pureLine.wuxing, palaceName),
      })
    }
  }

  return fuShenList
}

function generateFuShenDescription(liuQin, wuxing, palaceName) {
  const descMap = {
    '父母': '代表隐藏的文书、长辈、房产之事',
    '兄弟': '代表隐藏的竞争、朋友关系、破财因素',
    '妻财': '代表隐藏的财源、感情机会',
    '官鬼': '代表隐藏的压力、潜在风险、事业机遇',
    '子孙': '代表隐藏的创意、贵人、福气',
  }
  return descMap[liuQin] || `伏神为${liuQin}，五行属${wuxing}，需注意${palaceName}宫方面的隐藏因素`
}

/**
 * 格式化飞神伏神文本
 */
export function formatFuShen(fuShenList) {
  if (!fuShenList || fuShenList.length === 0) return ''

  const lines = ['【飞神伏神】']
  for (const fs of fuShenList) {
    lines.push(`  ${fs.position}爻：`)
    lines.push(`    飞神 ${fs.feiShen.gan}${fs.feiShen.zhi}（${fs.feiShen.wuxing}）${fs.feiShen.liuQin}·${fs.feiShen.liuShen}`)
    lines.push(`    伏神 ${fs.fuShen.gan}${fs.fuShen.zhi}（${fs.fuShen.wuxing}）${fs.fuShen.liuQin}·${fs.fuShen.liuShen}`)
    lines.push(`    └ ${fs.description}`)
  }
  return lines.join('\n')
}
