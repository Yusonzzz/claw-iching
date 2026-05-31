/**
 * 易经起卦与解卦引擎
 */
import { HEXAGRAMS, TRIGRAMS, getHexagramByNumber, getHexagramByTrigrams, getHexagram } from '../data/hexagrams.js'
import { applyNajia } from './najia.js'
import { analyzeTiYong } from './meihua.js'
import { getDayGanZhi } from './calendar.js'
import { getLeiXiangInterpretation } from '../data/leixiang.js'
import { calculateOverallScore, formatScore } from './scoring.js'
import { getFuShen, formatFuShen } from './fushen.js'

/**
 * 从上下卦名获取六爻（以阴阳数组表示：从下往上6位）
 */
function getHexagramLines(upperName, lowerName) {
  const upper = TRIGRAMS[upperName]
  const lower = TRIGRAMS[lowerName]
  if (!upper || !lower) return null
  return [...lower.lines, ...upper.lines] // [下卦三爻, 上卦三爻]
}

/**
 * 从六爻数组（从下往上）获取卦名
 */
function getHexagramNameFromLines(lines) {
  // 下卦：lines[0-2]，上卦：lines[3-5]
  const lowerLines = [lines[0], lines[1], lines[2]]
  const upperLines = [lines[3], lines[4], lines[5]]

  const lowerName = getTrigramNameFromLines(lowerLines)
  const upperName = getTrigramNameFromLines(upperLines)
  if (!lowerName || !upperName) return null

  const hex = getHexagramByTrigrams(upperName, lowerName)
  return hex ? hex.name : null
}

/**
 * 从三爻数组获取八卦名
 */
function getTrigramNameFromLines(lines) {
  for (const [name, tri] of Object.entries(TRIGRAMS)) {
    if (tri.lines[0] === lines[0] && tri.lines[1] === lines[1] && tri.lines[2] === lines[2]) {
      return name
    }
  }
  return null
}

/**
 * 从六爻数组获取上下卦名
 */
function getTrigramNamesFromHexagramLines(lines) {
  const lowerName = getTrigramNameFromLines([lines[0], lines[1], lines[2]])
  const upperName = getTrigramNameFromLines([lines[3], lines[4], lines[5]])
  return { upper: upperName, lower: lowerName }
}

/**
 * 方式一：数字起卦（梅花易数）
 * 用户输入3个数字
 * 第一个数→上卦，第二个数→下卦，第三个数→动爻
 */
export function castByNumbers(num1, num2, num3) {
  // 取余数
  const upperIdx = ((num1 % 8) + 8) % 8 || 8
  const lowerIdx = ((num2 % 8) + 8) % 8 || 8
  const movingIdx = ((num3 % 6) + 6) % 6 || 6 // 1-6, 从下往上数

  const upperName = getTrigramNameByNumber(upperIdx)
  const lowerName = getTrigramNameByNumber(lowerIdx)

  if (!upperName || !lowerName) return null

  const original = getHexagramByTrigrams(upperName, lowerName)
  if (!original) return null

  // 获取今日干支（用于纳甲六神）
  const now = new Date()
  const dayGZ = getDayGanZhi(now.getFullYear(), now.getMonth() + 1, now.getDate())
  const dayGan = dayGZ.gan.name

  return buildDivinationResult(original, upperName, lowerName, movingIdx - 1, '数字起卦', { num1, num2, num3 }, dayGan)
}

/**
 * 方式二：时间起卦
 * 用当前年月日时（或指定时间）起卦
 */
export function castByTime(year, month, day, hour) {
  // 上卦：年+月+日 之和 mod 8
  const upperNum = (year + month + day) % 8 || 8
  // 下卦：年+月+日+时 之和 mod 8
  const lowerNum = (year + month + day + hour) % 8 || 8
  // 动爻：年+月+日+时 之和 mod 6
  const movingNum = (year + month + day + hour) % 6 || 6

  const upperName = getTrigramNameByNumber(upperNum)
  const lowerName = getTrigramNameByNumber(lowerNum)

  if (!upperName || !lowerName) return null

  const original = getHexagramByTrigrams(upperName, lowerName)
  if (!original) return null

  // 获取今日干支
  const dayGZ = getDayGanZhi(year, month, day)
  const dayGan = dayGZ.gan.name

  return buildDivinationResult(original, upperName, lowerName, movingNum - 1, '时间起卦', { year, month, day, hour }, dayGan)
}

/**
 * 方式三：六爻摇卦
 * 模拟6次抛硬币，每次得到一爻（从下往上）
 * 3个硬币：3正面=老阳(变)，2正1反=少阳(不变)，1正2反=少阴(不变)，3反面=老阴(变)
 */
export function castByCoins(randomFunc = Math.random) {
  const originalLines = []
  const changingLines = [] // 哪些爻是变爻
  
  for (let i = 0; i < 6; i++) {
    // 模拟3个硬币
    let heads = 0
    for (let j = 0; j < 3; j++) {
      heads += randomFunc() > 0.5 ? 1 : 0
    }
    
    // 0正3反 = 老阴(变) → 阴爻 ⚋
    // 1正2反 = 少阴(不变) → 阴爻 ⚋
    // 2正1反 = 少阳(不变) → 阳爻 ⚊
    // 3正0反 = 老阳(变) → 阳爻 ⚊
    
    if (heads === 3) {
      originalLines.push(1) // 老阳→阳爻
      changingLines.push(true)
    } else if (heads === 0) {
      originalLines.push(0) // 老阴→阴爻
      changingLines.push(true)
    } else if (heads === 2) {
      originalLines.push(1) // 少阳→阳爻
      changingLines.push(false)
    } else {
      originalLines.push(0) // 少阴→阴爻
      changingLines.push(false)
    }
  }

  // 获取变爻索引（从布尔数组转为数字索引）
  const changingIndices = []
  for (let i = 0; i < changingLines.length; i++) {
    if (changingLines[i]) changingIndices.push(i)
  }

  const { upper: upperName, lower: lowerName } = getTrigramNamesFromHexagramLines(originalLines)
  const original = getHexagramByTrigrams(upperName, lowerName)

  if (!original) return null

  // 获取今日干支
  const now = new Date()
  const dayGZ = getDayGanZhi(now.getFullYear(), now.getMonth() + 1, now.getDate())
  const dayGan = dayGZ.gan.name

  return buildDivinationResult(original, upperName, lowerName, changingIndices, '六爻摇卦', null, dayGan)
}

/**
 * 方式四：方位起卦（梅花易数·方位法）
 * 用户选择面对的方向，结合当前日期起卦
 * @param {'n'|'ne'|'e'|'se'|'s'|'sw'|'w'|'nw'} direction - 方向
 */
export function castByDirection(direction) {
  const DIRECTION_MAP = {
    'n':  { num: 1, gua: '坎', label: '北', symbol: '⬆️' },
    'ne': { num: 8, gua: '艮', label: '东北', symbol: '↗️' },
    'e':  { num: 4, gua: '震', label: '东', symbol: '➡️' },
    'se': { num: 5, gua: '巽', label: '东南', symbol: '↘️' },
    's':  { num: 3, gua: '离', label: '南', symbol: '⬇️' },
    'sw': { num: 2, gua: '坤', label: '西南', symbol: '↙️' },
    'w':  { num: 7, gua: '兑', label: '西', symbol: '⬅️' },
    'nw': { num: 6, gua: '乾', label: '西北', symbol: '↖️' },
  }

  const dir = DIRECTION_MAP[direction]
  if (!dir) return null

  const now = new Date()
  const month = now.getMonth() + 1
  const day = now.getDate()
  const hour = now.getHours()

  // 上卦 = 方向的卦，下卦 = (月+日) mod 8
  const upperName = dir.gua
  const lowerNum = (month + day) % 8 || 8
  const lowerName = getTrigramNameByNumber(lowerNum)
  const movingNum = (dir.num + month + day) % 6 || 6

  if (!upperName || !lowerName) return null
  const original = getHexagramByTrigrams(upperName, lowerName)
  if (!original) return null

  const dayGZ = getDayGanZhi(now.getFullYear(), month, day)
  const dayGan = dayGZ.gan.name

  return buildDivinationResult(
    original, upperName, lowerName, movingNum - 1,
    `方位起卦（面向${dir.label}）`,
    { direction: dir.label, gua: dir.gua, symbol: dir.symbol },
    dayGan
  )
}

/**
 * 方式五：物象起卦（梅花易数·观物法）
 * 用户选择一个物体，映射为卦象
 * @param {number} categoryIdx - 分类索引
 * @param {number} objectIdx - 物体索引
 */
export function castByObject(categoryIdx, objectIdx) {
  const OBJECT_MAP = [
    {
      category: '天象', icon: '☀️',
      objects: [
        { name: '太阳', gua: '离' }, { name: '月亮', gua: '坎' },
        { name: '雷电', gua: '震' }, { name: '风云', gua: '巽' },
        { name: '星空', gua: '乾' }, { name: '雨水', gua: '坎' },
      ],
    },
    {
      category: '地象', icon: '🏔️',
      objects: [
        { name: '高山', gua: '艮' }, { name: '河流', gua: '坎' },
        { name: '大地', gua: '坤' }, { name: '沼泽', gua: '兑' },
        { name: '火堆', gua: '离' }, { name: '森林', gua: '震' },
      ],
    },
    {
      category: '动物', icon: '🐾',
      objects: [
        { name: '龙/马', gua: '乾' }, { name: '牛/鹿', gua: '坤' },
        { name: '鸡/鸟', gua: '离' }, { name: '猪/鱼', gua: '坎' },
        { name: '虎/豹', gua: '艮' }, { name: '蛇/虫', gua: '巽' },
      ],
    },
    {
      category: '植物', icon: '🌿',
      objects: [
        { name: '松柏', gua: '震' }, { name: '花草', gua: '巽' },
        { name: '竹林', gua: '震' }, { name: '莲荷', gua: '离' },
        { name: '果树', gua: '坤' }, { name: '藤蔓', gua: '兑' },
      ],
    },
    {
      category: '器物', icon: '🏺',
      objects: [
        { name: '金玉', gua: '乾' }, { name: '陶器', gua: '坤' },
        { name: '兵器', gua: '离' }, { name: '文书', gua: '巽' },
        { name: '杯盘', gua: '兑' }, { name: '衣帽', gua: '艮' },
      ],
    },
  ]

  const cat = OBJECT_MAP[categoryIdx]
  if (!cat) return null
  const obj = cat.objects[objectIdx]
  if (!obj) return null

  const now = new Date()
  const upperName = obj.gua
  const lowerNum = (objectIdx + 1) % 8 || 8
  const lowerName = getTrigramNameByNumber(lowerNum)
  const movingNum = (categoryIdx + objectIdx + 2) % 6 || 6

  if (!upperName || !lowerName) return null
  const original = getHexagramByTrigrams(upperName, lowerName)
  if (!original) return null

  const dayGZ = getDayGanZhi(now.getFullYear(), now.getMonth() + 1, now.getDate())
  const dayGan = dayGZ.gan.name

  return buildDivinationResult(
    original, upperName, lowerName, movingNum - 1,
    `物象起卦（${cat.icon}${obj.name}）`,
    { category: cat.category, icon: cat.icon, object: obj.name },
    dayGan
  )
}

/**
 * 获取八卦名（1=乾, 2=兑, 3=离, 4=震, 5=巽, 6=坎, 7=艮, 8=坤）
 */
function getTrigramNameByNumber(n) {
  const map = { 1: '乾', 2: '兑', 3: '离', 4: '震', 5: '巽', 6: '坎', 7: '艮', 8: '坤' }
  return map[n] || null
}

/**
 * 构建完整的占卜结果
 */
function buildDivinationResult(original, upperName, lowerName, movingIndices, method, methodData, dayGan) {
  const originalLines = getHexagramLines(upperName, lowerName)
  if (!originalLines) return null

  // 规范化动爻参数：可以是单个索引或数组
  const movingIndicesArray = Array.isArray(movingIndices) ? movingIndices : [movingIndices]
  const validMovingIndices = movingIndicesArray.filter(i => i >= 0 && i < 6)

  // 变卦：在动爻位置取反
  const changedLines = [...originalLines]
  validMovingIndices.forEach(idx => { changedLines[idx] = changedLines[idx] === 1 ? 0 : 1 })

  const { upper: changedUpperName, lower: changedLowerName } = getTrigramNamesFromHexagramLines(changedLines)
  const changed = getHexagramByTrigrams(changedUpperName, changedLowerName)

  // 互卦：取本卦的2-4爻为下卦，3-5爻为上卦
  const huLowerLines = [originalLines[1], originalLines[2], originalLines[3]]
  const huUpperLines = [originalLines[2], originalLines[3], originalLines[4]]
  const huLower = getTrigramNameFromLines(huLowerLines)
  const huUpper = getTrigramNameFromLines(huUpperLines)
  const hu = huLower && huUpper ? getHexagramByTrigrams(huUpper, huLower) : null

  // 动爻详情
  const movingYaoDetails = validMovingIndices.map(idx => ({
    index: idx,
    position: ['初', '二', '三', '四', '五', '上'][idx],
    originalYao: originalLines[idx] === 1 ? '阳' : '阴',
    changedYao: changedLines[idx] === 1 ? '阳' : '阴',
    isYang: originalLines[idx] === 1,
    text: original.lines ? original.lines[idx]?.text : '',
    meaning: original.lines ? original.lines[idx]?.meaning : '',
  }))

  // 纳甲装卦
  let najia = null
  if (dayGan) {
    najia = applyNajia(original.name, upperName, lowerName, dayGan)
  }

  // 梅花体用（含四季旺衰）
  const now = new Date()
  const tiYong = analyzeTiYong(lowerName, upperName, validMovingIndices.length > 0, changedLowerName, changedUpperName, now.getMonth() + 1)

  // 伏神
  let fuShen = null
  if (dayGan) {
    fuShen = getFuShen(original.name, upperName, lowerName, dayGan)
  }

  return {
    original,
    changed,
    hu,
    upperName,
    lowerName,
    changedUpperName,
    changedLowerName,
    originalLines,
    changedLines,
    movingYaoDetails,
    method,
    methodData,
    hasChange: validMovingIndices.length > 0,
    najia,
    tiYong,
    fuShen,
  }
}
export function generateInterpretation(result, question, baziContext, userName) {
  const parts = []

  // ===== 上层：大白话结论 =====

  // 1. 起卦方式说明
  parts.push(`【起卦方式】${result.method}`)

  // 2. 大白话总结（第一眼读懂，个性化）
  const summary = generatePlainSummary(result, question, baziContext, userName)
  if (summary) parts.push(`\n${summary}`)

  // 3. 综合评分（移到上面）
  const overall = calculateOverallScore(result, baziContext)
  if (overall) {
    parts.push(`\n${formatScore(overall)}`)
  }

  // 4. 综合论断 + 行动建议（用户最关心的，深度结合姓名+八字+卦象）
  parts.push(`\n${generateSynthesis(result, question, baziContext, userName)}`)

  // 5. 卦象有效期（放在建议下面，专业分析上面）
  parts.push(`\n${getValidityNote(result, question)}`)

  // ===== 分隔 =====
  parts.push(`\n\n━━━ 以下为专业分析详情（可跳过）━━━\n`)

  // ===== 下层：专业分析详情 =====

  // 5. 本卦详解
  const orig = result.original
  parts.push(`【本卦】${orig.name}卦（${orig.upper}上${orig.lower}下）`)
  parts.push(`卦辞：${orig.judgment}`)
  parts.push(`解读：${orig.judgmentMeaning}`)
  parts.push(`该卦寓意：${orig.meaning}`)
  
  // 卦象编号与上下卦说明
  const trigramNames = { '乾': '☰天', '兑': '☱泽', '离': '☲火', '震': '☳雷', '巽': '☴风', '坎': '☵水', '艮': '☶山', '坤': '☷地' }
  parts.push(`上卦${orig.upper}为${trigramNames[orig.upper] || orig.upper}，下卦${orig.lower}为${trigramNames[orig.lower] || orig.lower}`)

  // 6. 六爻全览（全部6爻，动爻高亮，加解释）
  if (result.najia) {
    const legend = '（干支·五行·六亲·六神，世=自己/应=对方，⚡=变爻）'
    parts.push(`\n【六爻全览】${legend}`)
    const allLines = [...result.najia.lines].reverse()
    const movingSet = new Set((result.movingYaoDetails || []).map(y => y.index))
    for (const line of allLines) {
      const isMoving = movingSet.has({0:5,1:4,2:3,3:2,4:1,5:0}[{初:0,二:1,三:2,四:3,五:4,上:5}[line.position]])
      const tags = []
      if (line.isShi) tags.push('世（自己）')
      if (line.isYing) tags.push('应（对方/环境）')
      if (isMoving) tags.push('⚡变爻')
      const tagStr = tags.length ? `  ← ${tags.join(' · ')}` : ''
      let text = `  ${line.position}爻  ${line.gan}${line.zhi} · ${line.wuxing} · ${line.liuQin} · ${line.liuShen}${tagStr}`
      parts.push(text)
    }
    
    // 世应关系分析
    const shiLine = result.najia.lines.find(l => l.isShi)
    const yingLine = result.najia.lines.find(l => l.isYing)
    if (shiLine && yingLine) {
      parts.push(`\n💡 世应关系（世=您·应=对方）：`)
      parts.push(`  世在${shiLine.position}位 → ${shiLine.gan}${shiLine.zhi}·${shiLine.wuxing}·${shiLine.liuQin}`)
      parts.push(`  应在${yingLine.position}位 → ${yingLine.gan}${yingLine.zhi}·${yingLine.wuxing}·${yingLine.liuQin}`)
      if (shiLine.wuxing === yingLine.wuxing) {
        parts.push(`  → 五行相同，立场一致，容易达成共识。`)
      } else {
        const s = { '金': '水', '水': '木', '木': '火', '火': '土', '土': '金' }
        const k = { '金': '木', '木': '土', '土': '水', '水': '火', '火': '金' }
        if (s[shiLine.wuxing] === yingLine.wuxing) parts.push(`  → ${shiLine.wuxing}生${yingLine.wuxing}，您需主动付出。`)
        else if (s[yingLine.wuxing] === shiLine.wuxing) parts.push(`  → ${yingLine.wuxing}生${shiLine.wuxing}，外部有利。`)
        else if (k[shiLine.wuxing] === yingLine.wuxing) parts.push(`  → ${shiLine.wuxing}克${yingLine.wuxing}，您能掌控。`)
        else parts.push(`  → ${yingLine.wuxing}克${shiLine.wuxing}，压力较大宜守。`)
      }
      // 六亲分析
      parts.push(`世爻临${shiLine.liuQin}：${getLiuQinInterpretation(shiLine.liuQin)}`)
      parts.push(`应爻临${yingLine.liuQin}：${getLiuQinInterpretation(yingLine.liuQin)}`)
    }
  }

  // 7. 动爻深度解读
  if (result.movingYaoDetails.length > 0) {
    const ym = result.movingYaoDetails
    parts.push(`\n【动爻详解（共${ym.length}爻变动）】`)
    
    // 解读动爻数量
    if (ym.length === 1) {
      parts.push(`一爻变动，主事情的关键在於一個点上。動爻在${ym[0].position}位，焦點在此。`)
    } else if (ym.length === 2) {
      parts.push(`两爻变动，事情有两方面需要关注。`)
      if (ym.some(y => y.index < 3) && ym.some(y => y.index >= 3)) {
        parts.push(`上下卦都有动爻，说明内外因素都在变化。`)
      } else if (ym.every(y => y.index < 3)) {
        parts.push(`动爻都在下卦，问题根源于内部或自身。`)
      } else {
        parts.push(`动爻都在上卦，问题源于外部环境。`)
      }
    } else if (ym.length === 3) {
      parts.push(`三爻变动，变化较多，需要灵活应对。`)
    } else if (ym.length === 4) {
      parts.push(`四爻变动，事态变化剧烈，不可掉以轻心。`)
    } else if (ym.length === 5) {
      parts.push(`五爻变动，几乎全盘皆变，宜静不宜动。`)
    } else {
      parts.push(`六爻全变，事物向对立面转化，大变动之象。`)
    }
    
    // 每个动爻的详细解读
    for (const y of ym) {
      if (y.text) {
        parts.push(`\n${y.position}爻「${y.text}」：${y.meaning}`)
      }
    }
    
    // 动爻五行互动（如果有2个以上动爻）
    if (ym.length >= 2 && result.najia) {
      const movingZhi = ym.map(y => result.najia.lines[y.index]?.zhi).filter(Boolean)
      if (movingZhi.length >= 2) {
        const wuxing = { '子': '水','丑': '土','寅': '木','卯': '木','辰': '土','巳': '火','午': '火','未': '土','申': '金','酉': '金','戌': '土','亥': '水' }
        const shengMap = { '金': '水', '水': '木', '木': '火', '火': '土', '土': '金' }
        const keMap = { '金': '木', '木': '土', '土': '水', '水': '火', '火': '金' }
        for (let i = 0; i < movingZhi.length; i++) {
          for (let j = i + 1; j < movingZhi.length; j++) {
            const z1 = movingZhi[i], z2 = movingZhi[j]
            const w1 = wuxing[z1], w2 = wuxing[z2]
            if (w1 && w2 && w1 !== w2) {
              if (shengMap[w1] === w2) parts.push(`注意：动爻${z1}(${w1})生${z2}(${w2})，爻与爻之间有相生的联动关系。`)
              else if (keMap[w1] === w2) parts.push(`注意：动爻${z1}(${w1})克${z2}(${w2})，爻与爻之间存在制约关系。`)
            }
          }
        }
      }
    }
  } else {
    parts.push(`\n【动爻】六爻安静，没有动爻。主事情处于稳定状态，宜静不宜动。`)
  }

  // 8. 变卦分析
  if (result.changed && result.hasChange) {
    const ch = result.changed
    parts.push(`\n【变卦】${ch.name}卦（${result.changedUpperName}上${result.changedLowerName}下）`)
    parts.push(`卦辞：${ch.judgment}`)
    parts.push(`解读：${ch.judgmentMeaning}`)
    
    // 本卦变卦的关系
    const origTri = orig.upper + orig.lower
    const chTri = ch.upper + ch.lower
    if (origTri !== chTri) {
      parts.push(`\n从【${orig.name}】变为【${ch.name}】，事情的发展趋势：`)
      parts.push(`本卦代表当前状态，变卦代表未来走向。`)
      const chMeaning = ch.judgmentMeaning.split('。')[0]
      parts.push(`变卦提示：${chMeaning}。`)
    }
    
    // 体用变化提示（梅花体用已分析，这里补充）
    if (result.tiYong?.changedRelation) {
      parts.push(`体用关系从「${result.tiYong.relation}」变为「${result.tiYong.changedRelation}」`)
    }
  }

  // 9. 互卦
  if (result.hu) {
    parts.push(`\n【互卦】${result.hu.name}卦（${result.hu.upper}上${result.hu.lower}下）`)
    parts.push(`卦辞：${result.hu.judgment}`)
    parts.push(`互卦由本卦中间四爻交互而成，反映事情发展过程中的内部状态和潜在因素。`)
    const hMeaning = result.hu.judgmentMeaning.split('。')[0]
    parts.push(`互卦提示：${hMeaning}。`)
  }

  // 10. 梅花易数体用生克
  if (result.tiYong) {
    const ty = result.tiYong
    parts.push(`\n【体用生克（梅花易数）】`)
    parts.push(`体卦（${ty.bodyName}·${ty.bodyWx}）→ 代表问卜者自身状态`)
    parts.push(`用卦（${ty.funcName}·${ty.funcWx}）→ 代表所问之事或外部环境`)
    parts.push(`体用关系：${ty.relation}`)
    parts.push(`解析：${ty.meaning}`)
    if (ty.seasonNote) parts.push(`季节影响：${ty.seasonNote}`)
    if (ty.changedRelation) {
      parts.push(`\n变卦后：体用关系转为「${ty.changedRelation}」`)
      parts.push(`${ty.changedMeaning}`)
    }
  }

  // 11. 纳甲六亲六神详表
  if (result.najia) {
    const liuQinCount = {}
    const liuShenList = []
    for (const line of result.najia.lines) {
      liuQinCount[line.liuQin] = (liuQinCount[line.liuQin] || 0) + 1
      liuShenList.push(line.liuShen)
    }
    parts.push(`\n【六亲六神分析】`)
    const lqText = Object.entries(liuQinCount).map(([k,v]) => `${k}${v}位`).join('、')
    parts.push(`六亲分布：${lqText}`)
    
    // 六亲解读
    if (liuQinCount['官鬼'] >= 2) parts.push(`官鬼多现，事业压力或感情中的不确定性增加。`)
    if (liuQinCount['妻财'] >= 2) parts.push(`妻财多现，财运机会多，但也需防财来财去。`)
    if (liuQinCount['兄弟'] >= 2) parts.push(`兄弟多现，竞争较强，注意人际关系。`)
    if (liuQinCount['父母'] >= 2) parts.push(`父母多现，长辈或文书类事务增多。`)
    if (liuQinCount['子孙'] >= 2) parts.push(`子孙多现，创意和贵人运旺，轻松自在。`)

    // 六神走势
    parts.push(`六神走势（从初爻到上爻）：${liuShenList.join('→')}`)
    const firstShen = liuShenList[0]
    const lastShen = liuShenList[liuShenList.length - 1]
    const shenMeaning = { '青龙': '吉庆', '朱雀': '口舌', '勾陈': '拖延', '螣蛇': '虚惊', '白虎': '血光', '玄武': '暗昧' }
    parts.push(`初爻临${firstShen}（${shenMeaning[firstShen] || ''}），上爻临${lastShen}（${shenMeaning[lastShen] || ''}），事情从开始到结束的基调有所变化。`)
  }

  // 12. 飞神伏神
  if (result.fuShen && result.fuShen.length > 0) {
    parts.push(`\n${formatFuShen(result.fuShen)}`)
    parts.push(`伏神代表隐藏的深层因素，是表面看不到的影响力。`)
  }

  // 13. 特殊起卦方式的文化含义解读
  if (result.methodData?.symbol) {
    // 方位起卦
    const DIR_MEANINGS = {
      '北': '北方属坎卦，代表水、冬天、收藏、险阻。面向北起卦，主当前有考验，宜沉潜内省。',
      '东北': '东北属艮卦，代表山、止、终始。面向东北起卦，主事物到了转折点，宜稳守待机。',
      '东': '东方属震卦，代表雷、春、生发、变动。面向东起卦，主新生与变动，积极进取之象。',
      '东南': '东南属巽卦，代表风、入、顺。面向东南起卦，主顺势而为，宜观察而不宜强求。',
      '南': '南方属离卦，代表火、夏、光明、文明。面向南起卦，主前途光明，适宜行动。',
      '西南': '西南属坤卦，代表地、收藏、包容。面向西南起卦，主以静制动，厚德载物。',
      '西': '西方属兑卦，代表泽、秋、喜悦、缺憾。面向西起卦，主沟通交流之象，但也暗示不完美。',
      '西北': '西北属乾卦，代表天、刚健、权威。面向西北起卦，主有贵人相助，宜积极进取。',
    }
    const dirMeaning = DIR_MEANINGS[result.methodData.symbol] || ''
    if (dirMeaning) {
      parts.push(`\n【方位含义】`)
      parts.push(dirMeaning)
    }
  }
  if (result.methodData?.object && result.methodData?.category) {
    // 物象起卦
    const OBJ_MEANINGS = {
      '太阳': '太阳象征光明、热情、生命力。以日入卦，主公开透明，适合正面解决问题。',
      '月亮': '月亮象征阴柔、情感、潜意识。以月入卦，主暗中有光，宜凭直觉行事。',
      '雷电': '雷电象征突变、震撼、觉醒。以雷入卦，主将有突发事件打破平静。',
      '风云': '风云象征变化、不可捉摸。以风入卦，主事态多变，需灵活应对。',
      '高山': '高山象征稳固、阻隔、目标。以山入卦，主有难关但可攀越。',
      '河流': '河流象征流动、转折、生命之源。以水入卦，主顺流而下则吉。',
      '大地': '大地象征承载、包容、生生不息。以地入卦，主根基稳固。',
      '龙/马': '龙马象征阳刚、进取、成功。以此入卦，主志向高远，大有可为。',
      '牛/鹿': '牛鹿象征温顺、勤劳、奉献。以此入卦，主脚踏实地，必有回报。',
      '金玉': '金玉象征珍贵、价值、不朽。以此入卦，主事物有价值，值得坚持。',
    }
    const objMeaning = OBJ_MEANINGS[result.methodData.object]
    if (objMeaning) {
      parts.push(`\n【物象含义】`)
      parts.push(`您以「${result.methodData.icon}${result.methodData.object}」入卦，${objMeaning}`)
    }
  }

  // 14. 八卦类象（针对问题类型）
  if (question) {
    const leixiang = getLeiXiangInterpretation(result.upperName, result.lowerName, question)
    if (leixiang) {
      parts.push(`\n${leixiang}`)
    }
  }

  return parts.join('\n')
}

/**
 * 卦象有效期说明
 * 传统规则：一事不二卜，卦象有时间范围
 */
function getValidityNote(result, question) {
  const lines = ['【卦象有效期】']
  
  const hasChange = result.hasChange
  const movingCount = result.movingYaoDetails?.length || 0
  
  // 判断是否有具体问题
  const hasQuestion = !!question
  const q = question || ''
  const isYearly = q.includes('今年') || q.includes('年运')
  const isMonthly = q.includes('本月') || q.includes('月运') || q.includes('这个月')
  const isWeekly = q.includes('本周')
  const isDaily = q.includes('今日') || q.includes('今天')
  const isLove = q.includes('感情') || q.includes('婚姻')
  const isSpec = q.includes('官司') || q.includes('跳槽') || q.includes('换工作') || q.includes('考试')
  
  // 有效期判断
  let validity, nextDivination
  
  if (isYearly) {
    validity = '本次卦象反映的是整年的运势走向，有效期为一年。'
    nextDivination = '明年或遇到重大人生变化时可以重新起卦。'
  } else if (isMonthly) {
    validity = '本次卦象反映的是当月运势，有效期为一个月。'
    nextDivination = '下个月可以重新起卦。'
  } else if (isWeekly) {
    validity = '本次卦象反映的是当周运势，有效期为一周。'
    nextDivination = '下周可以重新起卦。'
  } else if (isDaily) {
    validity = '本次卦象反映的是当日运势，有效期为一天。'
    nextDivination = '明天可以重新起卦。'
  } else if (isLove || isSpec) {
    validity = `本次卦象针对「${question}」这一具体问题。`
    if (hasChange && movingCount > 0) {
      nextDivination = '动爻表明事情还在变化中，建议至少等待3-7天后再针对同一问题重新起卦，给事情一些发展的时间。'
    } else {
      nextDivination = '无动爻表明事情较为稳定，若7天内情况没有明显变化，不建议重复起卦。'
    }
  } else if (hasQuestion) {
    validity = `本次卦象针对「${question}」这一问题进行解读。`
    if (hasChange) {
      nextDivination = '事情有变化迹象，建议过3-5天后再关注变化。'
    } else {
      nextDivination = '传统讲究「一事不二卜」，建议7天内不要就同一问题反复起卦，以免信息混乱。'
    }
  } else {
    validity = '本次卦象是当前状态的即时反映，没有具体问题。'
    nextDivination = '一般来说，普通问题的卦象有效期为3-7天。有明显变化后可重新起卦。'
  }
  
  // 附加规则
  const rules = []
  rules.push('💡 传统易经讲究「心诚则灵」：')
  rules.push('  • 一日内不宜为同一问题反复起卦（建议至少间隔3天）')
  rules.push('  • 卦象再差也不用担心——卦象是提示，不是定数，趋吉避凶才是易经的智慧')
  rules.push('  • 若结果不理想，建议：调整心态、改善行动，过段时间再卜')
  rules.push('  • 不问不正之事，不试探卦象，保持平常心')

  lines.push(validity)
  lines.push(nextDivination)
  lines.push('')
  lines.push(rules.join('\n'))
  
  return lines.join('\n')
}

function getLiuQinInterpretation(liuQin) {
  const map = {
    '父母': '主文书、长辈、房产、操心。此爻有力则文事顺遂，反之则劳心费力。',
    '兄弟': '主竞争、朋友、破财、社交。此爻有力则朋友多，但需防破耗。',
    '妻财': '主财富、感情、机会、物质。此爻有力则财运佳，感情丰沛。',
    '官鬼': '主事业、压力、官非、丈夫。此爻有力则事业亨通，反之则压力重重。',
    '子孙': '主创意、福气、晚辈、轻松。此爻有力则无忧无虑，才思敏捷。',
  }
  return map[liuQin] || '需结合具体问题分析'
}

/**
 * 深度解读：只做问题维度和行动建议，不复述卦象基本信息
 */
function generateSynthesis(result, question, baziContext, userName) {
  const lines = []
  const orig = result.original
  const overall = calculateOverallScore(result, baziContext)
  const name = userName || '您'

  // 不用 isGood/isBad（卦号吉凶），统一用 overall.score 决定语态
  const gLevel = overall.score >= 75 ? 'good' : overall.score >= 45 ? 'mid' : 'bad'

  if (question && question.length > 1) {
    const q = question
    // 检测问题类型
    const isCareer=/事业|工作|跳槽|创业|职场|升职/.test(q)
    const isLove=/感情|婚姻|恋爱|伴侣|分手|复合|脱单|结婚/.test(q)
    const isWealth=/财运|赚钱|投资|股票|理财|还债/.test(q)
    const isHealth=/健康|身体|疾病|康复|症状/.test(q)
    const isStudy=/学业|考试|考研|学习|成绩/.test(q)
    const isGossip=/小人|是非|口舌|纠纷|陷害/.test(q)
    const isHome=/家宅|家里|风水|不干净|鬼|灵异|房屋|装修/.test(q)
    const isLost=/失物|找不|丢了|遗失/.test(q)
    const isTravel=/出行|旅行|搬家|移居/.test(q)
    const isFortune=/运势|运气|顺不|好不好/.test(q)

    lines.push('')

    if (isCareer) {
      const act = q.includes('跳槽')||q.includes('换工作')?'换工作':q.includes('创业')?'创业':q.includes('升职')?'晋升':'职业发展'
      if (gLevel === 'good') {
        lines.push(act+'方面卦象整体向好。'+orig.name+'卦提醒您：机会是有，但需要主动去接，不是等来的。')
        if (q.includes('跳槽')) lines.push('跳槽的话卦上有机会，但爻辞提示——不要裸辞，骑驴找马比较稳妥。')
        else if (q.includes('创业')) lines.push('创业可尝试，建议从小步验证开始，不要一次投太多。')
        else lines.push('保持现在的节奏，把手头的事做好，机会自然会来。')
      } else if (gLevel === 'mid') {
        lines.push(act+'方面卦象中平，不好不坏。'+orig.name+'卦说：按自己的节奏走，不用跟人比。')
        lines.push('这段时间效率可能不如预期，但坚持住就会有起色。')
      } else {
        lines.push(act+'方面卦象有阻力。'+orig.name+'卦提示——眼下不是大动的时候。')
        lines.push('建议以守为攻，先把手中的事做扎实。机会会在更合适的时机出现。')
      }
    } else if (isLove) {
      const act = q.includes('脱单')?'脱单':q.includes('分手')?'分手复合':q.includes('结婚')?'婚姻':'感情'
      if (gLevel === 'good') {
        lines.push(act+'方面卦象偏吉。'+orig.name+'卦在感情上的启示——')
        if (q.includes('脱单')) lines.push('缘分有机会来，但要主动创造机会——多出门、多社交。不能光等。')
        else if (q.includes('分手')) lines.push('复合有转机，但需要两个人真正面对之前的问题，光一个人努力不够。')
        else lines.push('关系整体健康，别总想"更好的选择"，珍惜眼前的才是正道。')
      } else if (gLevel === 'mid') {
        lines.push(act+'方面卦象平稳。')
        if (q.includes('脱单')) lines.push('桃花不过不失，缘分需要主动经营。多出门走走，不用着急。')
        else lines.push('平平淡淡反而是最好的状态，不用追求戏剧化。顺其自然。')
      } else {
        lines.push(act+'方面卦象有坎。这段时间感情上不要操之过急。')
        if (q.includes('脱单')) lines.push('别因为焦虑而随便将就。对的人会在对的时间出现。')
        else if (q.includes('分手')) lines.push('两人冷静一下比较好，强行复合反而更伤。给彼此一点时间。')
        else lines.push('现在可能遇到了一些瓶颈，沟通是解药。别把问题憋在心里。')
      }
    } else if (isWealth) {
      if (gLevel === 'good') lines.push('财运不错，但别因为运势好就放松警惕。投资控制在能力范围内。')
      else if (gLevel === 'mid') lines.push('财运平平，正财为主、偏财谨慎。控制开支，不要冒险。')
      else lines.push('财运偏紧。近期别做大的投资决策，守财比理财更重要。')
    } else if (isHealth) {
      if (baziContext) {
        const riGanWx = baziContext.bazi?.day?.gan?.wuxing
        if (riGanWx) {
          const organ = { '木': '肝胆', '火': '心血管', '土': '脾胃消化', '金': '肺和呼吸道', '水': '肾脏泌尿' }
          lines.push('从八字看您体质偏' + riGanWx + '，需留意' + (organ[riGanWx]||'身体') + '。')
        }
      }
      lines.push(gLevel==='bad'?'卦象有警示，建议近期做个体检。':'保持习惯就好，该体检还是要定期去。')
    } else if (isStudy) {
      lines.push('学业方面' + (gLevel==='good'?'考试运不错，稳住心态是关键。':gLevel==='mid'?'按部就班，扎实复习最重要。':'压力不小但不用慌，沉下心来就有转机。'))
    } else if (isGossip) {
      lines.push(gLevel==='bad'?'卦象提示近期注意人际。做好自己的事，是非不沾身。':'人际关系无需过度担心，低调行事即可。')
    } else if (isHome) {
      if (q.includes('不干净')||q.includes('鬼')||q.includes('灵异')) {
        lines.push(orig.name+'卦说：'+(gLevel==='bad'?'有点阴郁，但更多是心理暗示。保持家里明亮、通风。心定则气清，一切都会好的。':'还算清净。不安大多源于想象，家里整洁明亮，自然神清气爽。'))
      } else if (q.includes('风水')) {
        const hint = orig.upper==='坎'?'注意防潮防漏':orig.upper==='离'?'注意电器电线':orig.upper==='震'||orig.upper==='巽'?'适合多放绿植':orig.upper==='艮'||orig.upper==='坤'?'保持整洁最重要':'整体正常'
        lines.push('风水上，' + hint + '。')
      } else lines.push('家宅' + (gLevel==='bad'?'有些小问题要注意':'还好') + '，日常维护即可。')
    } else if (isLost) {
      lines.push('失物方面，' + (gLevel==='good'?'有找回的希望':'找回的希望不大但可以再找找') + '。')
    } else if (isTravel) {
      lines.push('出行' + (gLevel==='good'?'顺利':gLevel==='bad'?'要多加小心':'还算顺利') + '。')
    } else if (isFortune) {
      lines.push('运势' + (gLevel==='good'?'不错，可以积极一些':gLevel==='mid'?'平稳，稳扎稳打':'偏低，以守为主') + '。')
    } else {
      // 通用匹配：把卦意回扣到问题
      lines.push(orig.name+'卦对你问的这件事的启示：' + (orig.judgmentMeaning||'审时度势'))
      if (result.tiYong) {
        if (result.tiYong.relation === '用生体') lines.push('外部条件有利，天时在帮你。')
        else if (result.tiYong.relation === '体生用') lines.push('需要你主动一些。')
        else if (result.tiYong.relation === '用克体') lines.push('外部阻力不小，先观察。')
      }
    }
  }

  return lines.join('\n')
}

function generatePlainSummary(result, question, baziContext, userName) {
  const lines = []
  const orig = result.original
  const overall = calculateOverallScore(result, baziContext)

  // ── 1. 开场：你是谁 + 你问了啥 ──
  const nameStr = userName ? `${userName}` : ''
  const sayHi = nameStr ? `${nameStr}，您好。` : `您好。`
  const qPart = question ? `您问的是「${question}」` : '来看看整体运势'

  // 如果同时有姓名和八字，合并开场
  if (baziContext) {
    const riGan = baziContext.bazi.day.gan
    lines.push(`${sayHi}${qPart}。从您提供的八字来看，您是${baziContext.formatted}，日主【${riGan.name}】属${riGan.wuxing}。`)
  } else {
    lines.push(`${sayHi}${qPart}。`)
  }

  // ── 2. 卦象来了 ──
  const mood = overall.score >= 75 ? '相当不错' : overall.score >= 50 ? '还可以' : overall.score >= 35 ? '有需要注意的地方' : '提示您要谨慎'
  lines.push(`\n起得的卦是【${orig.name}卦】，综合评分${overall.score}分（${overall.label}）——${mood}。`)

  // 卦意：用真正的大白话说一遍
  const gist = orig.judgmentMeaning
  const mea = orig.meaning
  lines.push('')
  lines.push('「' + orig.name + '卦」的原意是：' + (gist || ''))
  // 64卦大白话翻译表
  const simpleExplain = {
    '鼎':'鼎是古代的锅，烹饪代表"更新换代、旧的不去新的不来"。',
    '晋':'晋是"前进、晋升"，事业或状态往上走。',
    '复':'复是"回来、恢复"，事情会有转机。',
    '屯':'屯是刚萌芽，事情还在起步阶段，不容易但不用怕。',
    '蒙':'蒙是"开蒙解惑"，多问多学比闷着头想要有用。',
    '需':'需是"等待"，有些事急不来，等一等反而更好。',
    '讼':'讼是"争议纠纷"，最好别跟人硬碰硬。',
    '师':'师是"行军打仗"，得认真策划才能赢。',
    '比':'比是"亲近合作"，找人一起比单打独斗强。',
    '小畜':'小畜是"慢慢积累"，不是一夜暴富的卦。',
    '履':'履是"踩老虎尾巴"，看着危险但小心走就没事。',
    '泰':'泰是"天地通畅"，顺风顺水的好卦。',
    '否':'否是"闭塞不通"，忍一忍，转机在后面。',
    '同人':'同人是"志同道合"，要找人一起干。',
    '大有':'大有是"大丰收"，各方面都有收获。',
    '谦':'谦是"谦虚低调"，骄傲会坏事。',
    '豫':'豫是"轻松愉快"，事情不会太紧张。',
    '随':'随是"随机应变"，别太执着。',
    '蛊':'蛊是"累积的老问题"，该清理了。',
    '临':'临是"亲临指导"，居高临下但要以德服人。',
    '观':'观是"先看看再动"，观察比行动重要。',
    '噬嗑':'噬嗑是"咬断、决策"，该下决心了。',
    '贲':'贲是"装饰包装"，面子重要里子更重要。',
    '剥':'剥是"一层层剥落"，根基在动摇，稳住。',
    '无妄':'无妄是"别瞎折腾"，不妄动就是最好的策略。',
    '大畜':'大畜是"大积蓄"，需要时间，厚积薄发。',
    '颐':'颐是"养"——养精蓄锐，先照顾好自己。',
    '大过':'大过是"过火了"，有些事情做得太过了。',
    '坎':'坎是"险坑"，难是真难，但坑再深也能爬出来。',
    '离':'离是"光明附着"，找到对的人或对的方向很重要。',
    '咸':'咸是"感应"，关系在慢慢酝酿。',
    '恒':'恒是"持久"，坚持住，不是三天两天的事。',
    '遁':'遁是"退一步"，别硬顶，以退为进。',
    '大壮':'大壮是"非常强壮"，势头猛但别用力过猛。',
    '明夷':'明夷是"光明被遮蔽"，暗处藏身，等天亮。',
    '家人':'家人是"一家子"，内部关系最重要。',
    '睽':'睽是"分歧"，有人跟你想的不一样。',
    '蹇':'蹇是"跛脚走路"，困难，要找帮手。',
    '解':'解是"松开"，困难在消散。',
    '损':'损是"减掉一些"，少即是多。',
    '益':'益是"增加"，对自己有利。',
    '夬':'夬是"决裂"，该断的要断。',
    '姤':'姤是"相遇"，会有新的遇到。',
    '萃':'萃是"聚集"，人多力量大。',
    '升':'升是"上升"，整体往上走。',
    '困':'困是"被困住"，进退两难，但总会过去。',
    '井':'井是"资源靠自己去取"，不挖就没有水。',
    '革':'革是"变革"，是时候改变了。',
    '震':'震是"打雷"，突发的，动静大。',
    '艮':'艮是"停"，该收手时就收手。',
    '渐':'渐是"一步一步来"，慢但一直在走。',
    '归妹':'归妹是"身不由己"，有些事情你说了不算。',
    '丰':'丰是"盛大顶峰"，状态最好的时候。',
    '旅':'旅是"漂泊变动"，不稳定中。',
    '巽':'巽是"顺着风走"，顺势而为最省力。',
    '兑':'兑是"开心"，口才好，凡事往好处想。',
    '涣':'涣是"散"，凝聚力不够，需要团结。',
    '节':'节是"节制"，适可而止是智慧。',
    '中孚':'中孚是"真心实意"，用真心换真心。',
    '小过':'小过是"稍微过头"，不是大问题。',
    '既济':'既济是"快完成了"，再加把劲。',
    '未济':'未济是"还没完成"，继续努力。',
  }[orig.name]
  if (simpleExplain) {
    // 把卦意跟问题挂钩，说真正的大白话
    if (question && /健康|身体|疾病|不舒服|疼|痛/.test(question)) {
      lines.push('用大白话说——' + simpleExplain.replace(/。$/, '') + '，对健康问题来说，这个卦在提醒你要留心身体。')
    } else if (question && /感情|婚姻|分手|复合|脱单|对象/.test(question)) {
      lines.push('用大白话说——' + simpleExplain.replace(/。$/, '') + '，对感情来说，卦象的提醒很直接。')
    } else if (question && /财运|赚钱|投资|生意/.test(question)) {
      lines.push('用大白话说——' + simpleExplain.replace(/。$/, '') + '，对财运来说，你心里那杆秤要拿稳。')
    } else if (question && /工作|事业|跳槽|压力|加班|升职/.test(question)) {
      lines.push('用大白话说——' + simpleExplain.replace(/。$/, '') + '，放到工作上看，这就是卦给你的信号。')
    } else if (question && /学业|考试|学习|成绩|孩子|读书/.test(question)) {
      lines.push('用大白话说——' + simpleExplain.replace(/。$/, '') + '，放到学习和孩子身上，卦的意思很清楚。')
    } else {
      lines.push('用大白话说——' + simpleExplain)
    }
  }

  // ── 3. 体用关系：这对你问的事意味着什么 ──
  if (result.tiYong) {
    const ty = result.tiYong
    const rw = {
      '比和': `卦气和你问的这件事气场一致——事情会顺着你预想的方向走，不用太焦虑。`,
      '用生体': `卦象在帮你。你问的这件事，外部条件、时机都在往好的方向推。${question?'是个积极的信号。':''}`,
      '体生用': `卦象说你需要主动去推动这件事。${overall.score >= 75 ? '好消息是卦象整体很支持，你的付出会有很好的回报。' : overall.score >= 45 ? '付出会有回报，不会白费力气。' : '虽然眼下有些阻力，但坚持住总比什么都不做要强。'}`,
      '体克用': `主动权在你手上——你有能力把事情往想要的方向推。当然，也别忘了给别人留余地。`,
      '用克体': `${overall.score >= 70 ? '虽然外部环境看起来有些压力，但卦象整体评分较高——这点压力你完全可以扛过去。' : overall.score >= 45 ? '眼下天时不太配合，外部压力大。但别被吓到，稳住心态最重要。' : '眼下天时不太配合，外部压力大。建议以守为主，先观察形势，别硬碰硬。'}`,
    }
    lines.push('\n从卦象和您问的事来看——' + rw[ty.relation] + '')
  }

  // ── 4. 动爻：卦在跟你说的最关键的那句话 ──
  const moving = result.movingYaoDetails
  if (moving.length > 0) {
    lines.push('')
    if (moving.length === 1) {
      const y = moving[0]
      lines.push(`这个卦给您的关键提示是第${y.position}爻——爻辞「${y.text}」。`)
      lines.push(`意思是：${y.meaning}`)
      // 把动爻跟问题挂钩
      if (question) {
        const ql = question
        const relateMap = {
          '脱单': '如果你问脱单，这爻在说——缘分的事急不得，先把自己过好',
          '感情': '如果你问感情，这爻在说——两个人的关系要慢慢经营，不要急着要结果',
          '恋爱': '如果你问感情，这爻在说——两个人的关系要慢慢经营，不要急着要结果',
          '结婚': '如果你问结婚，这爻在说——水到渠成最好，勉强的事长远不了',
          '分手': '如果你问分手复合，这爻在说——两个人的缘分深浅，卦上一目了然',
          '复合': '如果你问分手复合，这爻在说——两个人的缘分深浅，卦上一目了然',
          '事业': '对事业来说，这爻在说——机会是有，但别急着跳，先看清楚',
          '工作': '对工作来说，这爻在说——把手头的事做到位，升职加薪自然来',
          '跳槽': '对跳槽来说，这爻在说——先看清楚新机会到底怎么样，不要因为一时不满就急着走',
          '创业': '对创业来说，这爻在说——可以开始，但从小处着手，不要一上来就押全部',
          '投资': '对投资理财来说，这爻在说——不要被高回报诱惑，稳字当头',
          '财运': '对财运来说，这爻在说——钱是赚不完的，但亏得完，控制风险',
          '赚钱': '对赚钱来说，这爻在说——正财为主，偏财谨慎，别想着一夜暴富',
          '健康': '对健康来说，这爻在说——身体的信号别忽视，小毛病拖成大问题',
          '学业': '对学业来说，这爻在说——下功夫比想捷径靠谱',
          '考试': '对考试来说，这爻在说——心态稳了，结果就不会差',
          '家里': '对家里的事，这爻在说——心定则家安，胡思乱想最耗神',
          '不干净': '对您担心的这事，这爻在说——很多时候是自己的心理暗示作祟，心定则气清',
          '小人': '对人缘这事，这爻在说——做好自己的事，是非不沾身',
          '运势': '对运势来说，这爻在说——整体方向向好，但每天的事还需要每天做',
        }
        let found = false
        for (const [k, v] of Object.entries(relateMap)) {
          if (ql.includes(k)) { lines.push(v + '。'); found = true; break }
        }
        if (!found) {
          // 通用解读：不照搬爻辞，给真正的白话解释
          const yaoTips = {
            '初': '事情刚刚开始，一切还在酝酿，多点耐心',
            '二': '核心矛盾逐渐浮现，找到关键点就成功一半',
            '三': '到了一个需要仔细权衡的关口，选对了方向比什么都重要',
            '四': '事情到了中段，可能会有点迷茫，但稳住就好',
            '五': '高层面的力量在为你撑腰，这时候要相信自己',
            '上': '快要见分晓了，注意别到最后关头松懈',
          }
          const posShort = y.position?.charAt(0) || ''
          const posTip = yaoTips[posShort] || ''
          lines.push('爻辞这句话对「' + question + '」的提示是——' + y.meaning + (posTip ? '（具体来说：' + posTip + '）' : '') + '。')
        }
      }
    } else {
      const yMin = Math.min(moving.length, 3)
      const yDesc = moving.slice(0, yMin).map(y => `${y.position}爻「${y.text}」`).join('、')
      lines.push(`这个卦有${moving.length}个爻位在变，核心变化在${yDesc}。说明问的这件事涉及多个方面，不是一个简单的问题。`)
      lines.push(`最重要的提示是${moving[0].position}爻——「${moving[0].text}」：${moving[0].meaning}`)
    }
  }

  // ── 5. 八字和卦象的五行联动 ──
  if (baziContext) {
    const riGan = baziContext.bazi.day.gan
    const origUpper = orig.upper
    const guaWx = origUpper === '乾' || origUpper === '兑' ? '金' :
      origUpper === '离' ? '火' : origUpper === '震' || origUpper === '巽' ? '木' :
      origUpper === '坎' ? '水' : '土'
    const s = { '金': '水', '水': '木', '木': '火', '火': '土', '土': '金' }
    const k = { '金': '木', '木': '土', '土': '水', '水': '火', '火': '金' }
    
    lines.push(`\n把卦和您的八字放在一起看——`)
    if (s[guaWx] === riGan.wuxing) {
      lines.push(`卦象属${guaWx}，在生您的日主${riGan.wuxing}。这是一种很有利的组合：天时在帮您，外部条件自然而然地往您这边靠。${question?'对于您问的事，这是一个明显的正面信号。':''}`)
    } else if (s[riGan.wuxing] === guaWx) {
      lines.push(`您的日主${riGan.wuxing}，在生卦象的${guaWx}。意思是您需要主动付出，去推动事情——付出有回报，但不会自动送上门。`)
    } else if (k[guaWx] === riGan.wuxing) {
      lines.push(`卦象属${guaWx}，在克您的日主${riGan.wuxing}。眼下天时对您不太友好，最近做事阻力会大一些。${question?'对于您问的这事，建议先观察，别急着做决定。':''}`)
    } else if (k[riGan.wuxing] === guaWx) {
      lines.push(`您的日主${riGan.wuxing}，能克住卦象的${guaWx}。主动权在您这边，您有能力克服眼前的困难。`)
    } else {
      lines.push(`卦象${guaWx}和您的日主${riGan.wuxing}五行相同，气场同频。这种状态下，顺其自然就是最好的策略。`)
    }

    // 加上神煞和大运
    const gs = (baziContext.shensha || []).filter(s => s.type === '吉')
    const bs = (baziContext.shensha || []).filter(s => s.type === '凶')
    if (gs.length) lines.push(`另外您的八字命带${gs.map(s => s.name + '（' + (s.description || s.meaning || '') + '）').join('、')}等吉神加持。`)
    if (bs.length) lines.push(`需留意的方面：命逢${bs.map(s => s.name + '（' + (s.description || s.meaning || '') + '）').join('、')}，做重要决定前多思量。`)
    if (baziContext.currentDayun) {
      const du = baziContext.currentDayun
      lines.push(`当前大运「${du.label}」——${du.summary}`)
    }
  }

  // ── 6. 总结（根据问题类型给不同语气） ──
  lines.push('')
  const isHealthQ = question && /健康|身体|疾病|康复|症状|妈妈|爸爸|父亲|母亲|老人|不舒服|疼|痛/.test(question) && !/孩子|子女/.test(question)
  const isLoveQ = question && /感情|婚姻|恋爱|分手|复合|脱单|结婚|对象/.test(question)
  const isMoneyQ = question && /财运|赚钱|投资|股票|理财|还债|生意/.test(question)
  const isStudyQ = question && /学业|考试|考研|学习|成绩|孩子|读书/.test(question)
  const isWorkQ = question && /工作|事业|跳槽|压力|加班|辞职|升职/.test(question)
  if (overall.score >= 75) {
    if (isHealthQ) lines.push('总的来说，卦象偏吉，身体方面不用太担心。保持好习惯，该检查检查。')
    else if (isLoveQ) lines.push('总的来说，感情方面卦象给了绿灯，关系整体向好。珍惜眼前人。')
    else if (isMoneyQ) lines.push('总的来说财运不错，但顺境中更要管住手，别因为运气好就冒进。')
    else if (isStudyQ) lines.push('总的来说学业方面卦象偏吉。学习上走对了方向，保持现在的节奏就好。' + (question?.includes('孩子') ? '孩子的状态在往上走。' : ''))
    else if (isWorkQ) lines.push('总的来说工作方面卦象给了绿灯。目前的方向是对的，稳住，别被一时的压力打乱节奏。')
    else lines.push('总的来说，' + (nameStr || '您') + '问的这件事，卦象给了绿灯。' + (nameStr ? nameStr + '，' : '') + '踏实去干就行。')
  } else if (overall.score >= 60) {
    if (isHealthQ) lines.push('总的来说健康方面卦象偏吉。继续保持现状就好，有什么不舒服及时去看。')
    else if (isLoveQ) lines.push('总的来说感情卦象偏吉。关系需要两个人一起经营，您主动一点会有好的回响。')
    else if (isStudyQ) lines.push('总的来说学业方面偏吉，不用太担心。坚持就是胜利，不要三天打鱼两天晒网。')
    else if (isWorkQ) lines.push('总的来说工作方面卦象还行。压力是暂时的，扛过去就会好转。')
    else lines.push('总的来说，' + (nameStr || '您') + '问的这件事卦象偏吉。大部分条件比较有利，需要您自己主动一点去把握。')
  } else if (overall.score >= 45) {
    if (isHealthQ) lines.push('总的来说健康方面还算平稳，该注意的要注意，不用担心过度。')
    else if (isLoveQ) lines.push('总的来说感情卦平和中正。不急不躁，两个人慢慢来，该有的都会有。')
    else if (isStudyQ) lines.push('总的来说学业方面中平，好坏各半。关键在于方法对不对——方法对了成绩自然上来。')
    else if (isWorkQ) lines.push('总的来说工作方面中平，有好有坏。稳住节奏，不要因为暂时的瓶颈就否定自己。')
    else if (isMoneyQ) lines.push('总的来说财运平平，稳扎稳打最靠谱，别贪快钱。')
    else lines.push('总的来说，' + (nameStr || '您') + '问的这件事，卦象平和中正。不急不躁，跟着节奏走，该有的都会有。')
  } else if (overall.score >= 30) {
    if (isHealthQ) lines.push('总的来说健康方面卦象有提醒。建议重视身体发出的信号，做个检查会更安心。')
    else if (isLoveQ) lines.push('总的来说感情上有些坎。但坎不是绝路——两个人好好沟通，很多问题说开了就好一半。')
    else if (isStudyQ) lines.push('总的来说学业方面需要多下功夫。卦象提醒您——不是孩子不行，是方法要换一换。')
    else if (isWorkQ) lines.push('总的来说工作上有挑战。但挑战也是机会——扛过去就上一个台阶了。')
    else lines.push('总的来说，' + (nameStr || '您') + '问的这件事，卦象提示有坎。不过坎不是绝路，只是要多花些心思，谨慎一点没坏处。')
  } else {
    if (isHealthQ) lines.push('总的来说健康卦偏凶，重视起来！尽快安排体检，身体的信号不能忽视。')
    else if (isLoveQ) lines.push('总的来说感情上眼下不太顺。先冷静下来，不要做冲动的决定，过段时间再看。')
    else if (isStudyQ) lines.push('总的来说学业方面卦象不太支持。建议调整学习方式，硬逼可能适得其反。')
    else if (isWorkQ) lines.push('总的来说眼下工作上阻力较大。宜守不宜攻，先把手里的事做扎实。')
    else lines.push('总的来说，' + (nameStr || '您') + '问的这件事，卦象偏凶。但凶也不是没有转机——这段时间宜守、宜等、宜反思，过了这个坎就好了。')
  }

  lines.push('（下面是专业细节分析，可展开查看 ↓）')
  return lines.join('\n')
}

/** 获取当日卦象 */
export function getDailyHexagram(y,m,d) { return castByTime(y,m,d,0) }
/** 获取当月卦象 */
export function getMonthlyHexagram(y,m) { return castByTime(y,m,15,12) }
/** 获取当年卦象 */
export function getYearlyHexagram(y) { return castByTime(y,6,15,12) }
/** 获取本周卦象 */
export function getWeeklyHexagram(y,m,d) {
  const dt=new Date(y,m-1,d);const dw=dt.getDay();const mo=dw===0?-6:1-dw
  const md=new Date(dt);md.setDate(dt.getDate()+mo)
  return castByTime(md.getFullYear(),md.getMonth()+1,md.getDate(),0)
}
