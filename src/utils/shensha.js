/**
 * 神煞系统
 * 常用神煞推算：天乙贵人、文昌、桃花、驿马、华盖、孤辰寡宿等
 */

// 地支索引
const ZHI_IDX = { '子':0,'丑':1,'寅':2,'卯':3,'辰':4,'巳':5,'午':6,'未':7,'申':8,'酉':9,'戌':10,'亥':11 }

/**
 * 天乙贵人（以日干起）
 * 口诀：甲戊庚牛羊，乙己鼠猴乡，丙丁猪鸡位，壬癸蛇兔藏，六辛逢虎马
 */
export function getTianYiGuiRen(dayGan) {
  const table = {
    '甲': ['丑', '未'], '戊': ['丑', '未'], '庚': ['丑', '未'],
    '乙': ['子', '申'], '己': ['子', '申'],
    '丙': ['亥', '酉'], '丁': ['亥', '酉'],
    '壬': ['巳', '卯'], '癸': ['巳', '卯'],
    '辛': ['寅', '午'],
  }
  return table[dayGan] || []
}

/**
 * 文昌贵人（以日干起）
 * 口诀：甲巳乙午丙戊申，丁酉庚亥辛见子，壬寅癸卯是文昌
 */
export function getWenChang(dayGan) {
  const table = {
    '甲': '巳', '乙': '午', '丙': '申', '丁': '酉',
    '戊': '申', '己': '酉', '庚': '亥',
    '辛': '子', '壬': '寅', '癸': '卯',
  }
  return table[dayGan] || ''
}

/**
 * 桃花（咸池，以年支或日支起）
 * 口诀：申子辰在酉，寅午戌在卯，巳酉丑在午，亥卯未在子
 */
export function getTaoHua(yearZhi) {
  const table = {
    '申': '酉', '子': '酉', '辰': '酉',
    '寅': '卯', '午': '卯', '戌': '卯',
    '巳': '午', '酉': '午', '丑': '午',
    '亥': '子', '卯': '子', '未': '子',
  }
  return table[yearZhi] || ''
}

/**
 * 驿马（以年支或日支起）
 * 口诀：申子辰在寅，寅午戌在申，巳酉丑在亥，亥卯未在巳
 */
export function getYiMa(yearZhi) {
  const table = {
    '申': '寅', '子': '寅', '辰': '寅',
    '寅': '申', '午': '申', '戌': '申',
    '巳': '亥', '酉': '亥', '丑': '亥',
    '亥': '巳', '卯': '巳', '未': '巳',
  }
  return table[yearZhi] || ''
}

/**
 * 华盖（以年支或日支起）
 * 口诀：申子辰在辰，寅午戌在戌，巳酉丑在丑，亥卯未在未
 */
export function getHuaGai(yearZhi) {
  const table = {
    '申': '辰', '子': '辰', '辰': '辰',
    '寅': '戌', '午': '戌', '戌': '戌',
    '巳': '丑', '酉': '丑', '丑': '丑',
    '亥': '未', '卯': '未', '未': '未',
  }
  return table[yearZhi] || ''
}

/**
 * 孤辰寡宿（以年支起）
 * 口诀：亥子丑在寅戌，寅卯辰在巳丑，巳午未在申辰，申酉戌在亥未
 */
export function getGuChen(yearZhi) {
  const table = {
    '亥': '寅', '子': '寅', '丑': '寅',
    '寅': '巳', '卯': '巳', '辰': '巳',
    '巳': '申', '午': '申', '未': '申',
    '申': '亥', '酉': '亥', '戌': '亥',
  }
  return { guchen: table[yearZhi] || '', guasu: '' }
}

export function getGuaSu(yearZhi) {
  const table = {
    '亥': '戌', '子': '戌', '丑': '戌',
    '寅': '丑', '卯': '丑', '辰': '丑',
    '巳': '辰', '午': '辰', '未': '辰',
    '申': '未', '酉': '未', '戌': '未',
  }
  return table[yearZhi] || ''
}

/**
 * 天德贵人（以月支起）
 * 口诀：正丁二申中，三壬四辛同，五亥六甲上，七癸八寅逢，九丙十归乙，子巳丑庚中
 */
export function getTianDe(monthZhi) {
  const table = { '寅': '丁', '卯': '申', '辰': '壬', '巳': '辛', '午': '亥', '未': '甲', '申': '癸', '酉': '寅', '戌': '丙', '亥': '乙', '子': '巳', '丑': '庚' }
  return table[monthZhi] || ''
}

/**
 * 月德贵人（以月支起）
 * 口诀：寅午戌月在丙，申子辰月在壬，亥卯未月在甲，巳酉丑月在庚
 */
export function getYueDe(monthZhi) {
  const table = { '寅': '丙', '午': '丙', '戌': '丙', '申': '壬', '子': '壬', '辰': '壬', '亥': '甲', '卯': '甲', '未': '甲', '巳': '庚', '酉': '庚', '丑': '庚' }
  return table[monthZhi] || ''
}

/**
 * 获取所有神煞
 * @returns {Array} [{ name, description }]
 */
export function getAllShenSha(dayGan, yearZhi, monthZhi, dayZhi) {
  const result = []

  // 天乙贵人
  const tianYi = getTianYiGuiRen(dayGan)
  if (tianYi.length > 0) {
    for (const zhi of tianYi) {
      if (zhi === dayZhi) result.push({ name: '天乙贵人', type: '吉', description: '最吉之神，遇难有救，逢凶化吉。' })
    }
    if (!result.some(s => s.name === '天乙贵人')) {
      result.push({ name: '天乙贵人', type: '吉', description: `贵人在${tianYi.join('、')}方。` })
    }
  }

  // 文昌
  const wenChang = getWenChang(dayGan)
  if (wenChang === dayZhi) result.push({ name: '文昌贵人', type: '吉', description: '聪明文采，学业事业有成就。' })

  // 桃花
  const taoHua = getTaoHua(yearZhi)
  if (taoHua === dayZhi) result.push({ name: '桃花', type: '中性', description: '人缘好，异性缘旺，但也容易生是非。' })

  // 驿马
  const yiMa = getYiMa(yearZhi)
  if (yiMa === dayZhi) result.push({ name: '驿马', type: '中性', description: '奔波劳碌，动中求财，适合变动。' })

  // 华盖
  const huaGai = getHuaGai(yearZhi)
  if (huaGai === dayZhi) result.push({ name: '华盖', type: '中性', description: '聪慧孤独，与玄学有缘，宜静修。' })

  // 天德
  const tianDe = getTianDe(monthZhi)
  if (tianDe === dayGan) result.push({ name: '天德', type: '吉', description: '上天之德，诸事顺利，百无禁忌。' })

  // 月德
  const yueDe = getYueDe(monthZhi)
  if (yueDe === dayGan) result.push({ name: '月德', type: '吉', description: '月之德辉，逢凶化吉，诸事顺遂。' })

  // 孤辰寡宿
  const guChen = getGuChen(yearZhi)
  if (guChen.guchen === dayZhi) result.push({ name: '孤辰', type: '凶', description: '孤独之宿，不利婚姻，宜独处。' })
  const guaSu = getGuaSu(yearZhi)
  if (guaSu === dayZhi) result.push({ name: '寡宿', type: '凶', description: '寡居之宿，不利感情，宜修身。' })

  return result
}

/**
 * 神煞总结文本
 */
export function formatShenSha(shenshaList) {
  if (!shenshaList || shenshaList.length === 0) return ''
  const lines = ['【神煞】']
  for (const s of shenshaList) {
    const emoji = s.type === '吉' ? '🌟' : s.type === '凶' ? '⚠️' : '⚖️'
    lines.push(`${emoji} ${s.name}（${s.type}）：${s.description}`)
  }
  return lines.join('\n')
}
