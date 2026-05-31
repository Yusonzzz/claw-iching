/**
 * 梅花易数 - 体用生克分析（含四季旺衰）
 */

import { TRIGRAMS } from '../data/hexagrams.js'

const WUXING_SHENG = { '金': '水', '水': '木', '木': '火', '火': '土', '土': '金' }
const WUXING_KE = { '金': '木', '木': '土', '土': '水', '水': '火', '火': '金' }

/**
 * 五行在四季中的旺衰
 */
function getSeasonalStrength(wuxing, month) {
  let season
  if ([3, 4, 5].includes(month)) season = '春'
  else if ([6, 7, 8].includes(month)) season = '夏'
  else if ([9, 10, 11].includes(month)) season = '秋'
  else season = '冬'

  // 季末（3/6/9/12）最后18天土旺
  if ([3, 6, 9, 12].includes(month) && wuxing === '土') return '旺'

  const table = {
    '春': { '木': '旺', '火': '相', '水': '休', '金': '囚', '土': '死' },
    '夏': { '火': '旺', '土': '相', '木': '休', '水': '囚', '金': '死' },
    '秋': { '金': '旺', '水': '相', '土': '休', '火': '囚', '木': '死' },
    '冬': { '水': '旺', '木': '相', '金': '休', '土': '囚', '火': '死' },
  }
  return (table[season] && table[season][wuxing]) || '平'
}

const STRENGTH_ADJUST = { '旺': 30, '相': 15, '休': 0, '囚': -10, '死': -20, '平': 0 }
const STRENGTH_LABEL = { '旺': '最旺', '相': '次旺', '休': '休养', '囚': '被困', '死': '最弱', '平': '平' }

/**
 * 体用生克分析（含四季旺衰修正）
 */
export function analyzeTiYong(bodyName, funcName, hasChange, changedBodyName, changedFuncName, month) {
  const body = TRIGRAMS[bodyName]
  const func = TRIGRAMS[funcName]
  if (!body || !func) return null

  const bodyWx = body.wuxing
  const funcWx = func.wuxing

  // 四季旺衰
  const m = month || new Date().getMonth() + 1
  const bodyStrength = getSeasonalStrength(bodyWx, m)
  const funcStrength = getSeasonalStrength(funcWx, m)
  const bodyAdj = STRENGTH_ADJUST[bodyStrength] || 0
  const funcAdj = STRENGTH_ADJUST[funcStrength] || 0

  const relation = getTiYongRelation(bodyWx, funcWx)

  // 基础分 + 旺衰修正
  let baseScore, meaning, advice
  switch (relation) {
    case '比和':
      baseScore = 90
      meaning = '体用五行相同，相互比和。主事情顺利，内外一致，吉。'
      advice = '顺势而为，此乃大吉之兆。适合推进重要事项，事半功倍。'
      break
    case '用生体':
      baseScore = 80
      meaning = '用卦生体卦，外部因素对你有利。主得他人相助，事半功倍。'
      advice = '机会在眼前，宜积极把握。注意借助外部资源和人脉。'
      break
    case '体生用':
      baseScore = 50
      meaning = '体卦生用卦，你需要付出较多精力。虽终有成但过程辛苦。'
      advice = '要有付出的准备，不可急功近利。此乃先难后易之象。'
      break
    case '体克用':
      baseScore = 60
      meaning = '体卦克用卦，你能掌控局面。虽有小阻但你可克服。'
      advice = '主动出击，你有足够的能力应对。但注意不要过于刚强。'
      break
    case '用克体':
      baseScore = 30
      meaning = '用卦克体卦，外部压力较大。主事多阻碍，宜守不宜攻。'
      advice = '暂时以守为佳，不宜冒进。等待时机成熟再做打算。'
      break
    default:
      baseScore = 50
      meaning = '体用关系不明，需结合其他因素综合判断。'
      advice = '保持中正之道，观其变化再行动。'
  }

  // 得分修正：体旺加分，体衰减分；用旺减分（对方强），用衰加分
  let score = baseScore + bodyAdj - funcAdj
  score = Math.max(10, Math.min(100, score))

  // 季节说明
  let seasonNote = ''
  if (bodyStrength !== '平') {
    seasonNote = `体卦${bodyName}(${bodyWx})${STRENGTH_LABEL[bodyStrength]}，`
    seasonNote += `用卦${funcName}(${funcWx})${STRENGTH_LABEL[funcStrength]}。`
    if (bodyStrength === '旺' || bodyStrength === '相') {
      seasonNote += '体卦当令，自身状态好，有利。'
    } else if (bodyStrength === '死' || bodyStrength === '囚') {
      seasonNote += '体卦失令，自身状态不佳，需多加小心。'
    }
  }

  const result = {
    bodyName,
    funcName,
    bodyWx,
    funcWx,
    bodyStrength,
    funcStrength,
    seasonNote,
    relation,
    score,
    meaning,
    advice,
  }

  // 变卦体用分析
  if (hasChange && changedBodyName && changedFuncName) {
    const changedBody = TRIGRAMS[changedBodyName]
    const changedFunc = TRIGRAMS[changedFuncName]
    if (changedBody && changedFunc) {
      const changedRelation = getTiYongRelation(changedBody.wuxing, changedFunc.wuxing)
      result.changedRelation = changedRelation
      result.changedBodyWx = changedBody.wuxing
      result.changedFuncWx = changedFunc.wuxing
      result.changedMeaning = getChangedMeaning(relation, changedRelation)
    }
  }

  return result
}

function getTiYongRelation(bodyWx, funcWx) {
  if (bodyWx === funcWx) return '比和'
  if (WUXING_SHENG[bodyWx] === funcWx) return '体生用'
  if (WUXING_SHENG[funcWx] === bodyWx) return '用生体'
  if (WUXING_KE[bodyWx] === funcWx) return '体克用'
  if (WUXING_KE[funcWx] === bodyWx) return '用克体'
  return ''
}

function getChangedMeaning(originalRelation, changedRelation) {
  if (originalRelation === changedRelation) return '体用关系不变，事情发展方向稳定，没有大的转折。'
  if (originalRelation === '用克体' && (changedRelation === '比和' || changedRelation === '用生体'))
    return '初始不利但后期转吉，先难后易，结局向好。'
  if ((originalRelation === '比和' || originalRelation === '用生体') && changedRelation === '用克体')
    return '初始有利但后期转不利，需防盛极而衰。'
  if ((originalRelation === '体克用' || originalRelation === '体生用') && changedRelation === '比和')
    return '初始需努力但后期逐渐顺畅。'
  return `体用关系从「${getRelationLabel(originalRelation)}」变为「${getRelationLabel(changedRelation)}」，事情有转折变化。`
}

function getRelationLabel(r) {
  return { '比和': '比和', '体生用': '体生用', '用生体': '用生体', '体克用': '体克用', '用克体': '用克体' }[r] || r
}

export function formatTiYong(tiYong) {
  if (!tiYong) return ''
  const lines = []
  lines.push(`【梅花易数·体用生克】`)
  lines.push(`体卦（${tiYong.bodyName}·${tiYong.bodyWx}）代表问卜者自身`)
  lines.push(`用卦（${tiYong.funcName}·${tiYong.funcWx}）代表所问之事/外部环境`)
  if (tiYong.seasonNote) lines.push(`四季旺衰：${tiYong.seasonNote}`)
  lines.push(`体用关系：${tiYong.relation}（${tiYong.meaning}）`)
  lines.push(`建议：${tiYong.advice}`)
  if (tiYong.changedRelation) {
    lines.push(`\n变卦体用：${tiYong.changedRelation}`)
    lines.push(tiYong.changedMeaning)
  }
  return lines.join('\n')
}
