/**
 * 综合评分系统
 * 将体用、纳甲、神煞、干支互动、四季旺衰、大运所有维度
 * 综合计算为统一的吉凶指数
 */

/**
 * 综合评分
 * @param {object} divinationResult - 起卦结果（含tiYong, najia等）
 * @param {object} baziContext - 八字分析结果
 * @returns {{ score, level, label, color, details }}
 */
export function calculateOverallScore(divinationResult, baziContext) {
  let totalScore = 50 // 基准分
  const details = []

  // 1. 体用生克评分
  if (divinationResult?.tiYong?.score) {
    const s = divinationResult.tiYong.score
    // 从0-100映射到-30到+30
    const contribution = (s - 50) * 0.6
    totalScore += contribution
    details.push({
      factor: '体用生克',
      score: s,
      contribution: Math.round(contribution),
      note: `${divinationResult.tiYong.relation}（${divinationResult.tiYong.bodyWx} vs ${divinationResult.tiYong.funcWx}）`,
    })
  }

  // 2. 四季旺衰
  if (divinationResult?.tiYong?.bodyStrength) {
    const strengthMap = { '旺': 10, '相': 5, '休': 0, '囚': -5, '死': -10, '平': 0 }
    const adj = strengthMap[divinationResult.tiYong.bodyStrength] || 0
    totalScore += adj
    details.push({
      factor: `体卦${divinationResult.tiYong.bodyStrength}`,
      score: adj,
      contribution: adj,
      note: `${divinationResult.tiYong.bodyName}当季${divinationResult.tiYong.bodyStrength}`,
    })
  }

  // 3. 神煞
  if (baziContext?.shensha?.length) {
    let shenshaScore = 0
    for (const s of baziContext.shensha) {
      if (s.type === '吉') shenshaScore += 8
      else if (s.type === '凶') shenshaScore -= 6
    }
    shenshaScore = Math.min(20, Math.max(-15, shenshaScore))
    totalScore += shenshaScore
    details.push({
      factor: '神煞',
      score: shenshaScore,
      contribution: shenshaScore,
      note: `${baziContext.shensha.filter(s => s.type === '吉').length}吉 ${baziContext.shensha.filter(s => s.type === '凶').length}凶`,
    })
  }

  // 4. 干支互动
  if (baziContext?.interactions?.length) {
    let interactionScore = 0
    for (const item of baziContext.interactions) {
      interactionScore += item.info?.score || 0
    }
    interactionScore = Math.min(40, Math.max(-30, interactionScore))
    totalScore += interactionScore
    details.push({
      factor: '干支互动',
      score: interactionScore,
      contribution: interactionScore,
      note: `${baziContext.interactions.length}组互动`,
    })
  }

  // 5. 卦象本身（基于卦序的吉凶）
  if (divinationResult?.original?.number) {
    const num = divinationResult.original.number
    const goodNums = [1, 11, 13, 14, 15, 24, 35, 42, 46, 50, 55, 61]
    const badNums = [12, 23, 29, 36, 38, 39, 47, 56, 62]
    let guaScore = 0
    if (goodNums.includes(num)) guaScore = 10
    else if (badNums.includes(num)) guaScore = -8
    totalScore += guaScore
    details.push({
      factor: `卦象（${divinationResult.original.name}）`,
      score: guaScore,
      contribution: guaScore,
      note: goodNums.includes(num) ? '吉卦' : badNums.includes(num) ? '凶卦' : '平卦',
    })
  }

  // 6. 纳甲六亲
  if (divinationResult?.najia?.lines) {
    const lines = divinationResult.najia.lines
    const shiLine = lines.find(l => l.isShi)
    if (shiLine) {
      const liuQin = shiLine.liuQin
      if (liuQin === '子孙' || liuQin === '妻财') {
        totalScore += 5
        details.push({ factor: `世爻${liuQin}`, score: 5, contribution: 5, note: '世爻得位' })
      } else if (liuQin === '官鬼' || liuQin === '兄弟') {
        totalScore -= 5
        details.push({ factor: `世爻${liuQin}`, score: -5, contribution: -5, note: '世爻受压' })
      }
    }
  }

  // 归一化到0-100
  totalScore = Math.max(0, Math.min(100, Math.round(totalScore)))

  // 等级划分
  let level, label, color
  if (totalScore >= 80) {
    level = '上上'
    label = '大吉'
    color = '#30D158'
  } else if (totalScore >= 65) {
    level = '上'
    label = '吉'
    color = '#30D158'
  } else if (totalScore >= 50) {
    level = '中'
    label = '平'
    color = '#FF9F0A'
  } else if (totalScore >= 35) {
    level = '下'
    label = '凶'
    color = '#FF453A'
  } else {
    level = '下下'
    label = '大凶'
    color = '#FF453A'
  }

  return { score: totalScore, level, label, color, details }
}

export function formatScore(overall) {
  if (!overall) return ''
  
  // 用文字描述替代符号条
  const starMap = { '上上': '★★★★★', '上': '★★★★☆', '中': '★★★☆☆', '下': '★★☆☆☆', '下下': '★☆☆☆☆' }
  const stars = starMap[overall.level] || '★★★☆☆'
  
  const lines = [
    `综合评分：${overall.score}分（${overall.label}）`,
    `等级：${overall.level} ${stars}`,
  ]

  if (overall.details?.length) {
    // 只显示有实际影响的项（contribution !== 0）
    const impactful = overall.details.filter(d => d.contribution !== 0)
    if (impactful.length > 0) {
      lines.push(`\n评分影响因素：`)
      lines.push(impactful.map(d => {
        return d.contribution > 0
          ? `  ✅ ${d.factor} +${d.contribution}分`
          : `  ⚠️ ${d.factor} ${d.contribution}分`
      }).join('\n'))
    }
  }

  return lines.join('\n')
}
