/**
 * 纳甲装卦系统数据
 * 六爻配干支 · 定世应 · 配六亲 · 配六神
 */

/**
 * 八卦纳支（从下往上三爻）
 * 每卦的内卦(下卦)和外卦(上卦)纳支不同
 */
export const TRIGRAM_NA_ZHI = {
  // 内卦（下卦）三爻
  inner: {
    '乾': ['子', '寅', '辰'], // 初九子，九二寅，九三辰
    '坤': ['未', '巳', '卯'], // 初六未，六二巳，六三卯
    '震': ['子', '寅', '辰'], // 同乾
    '巽': ['丑', '亥', '酉'], // 初六丑，九二亥，九三酉
    '坎': ['寅', '辰', '午'], // 初六寅，九二辰，六三午
    '离': ['卯', '丑', '亥'], // 初九卯，六二丑，九三亥
    '艮': ['辰', '午', '申'], // 初六辰，六二午，九三申
    '兑': ['巳', '卯', '丑'], // 初九巳，九二卯，六三丑
  },
  // 外卦（上卦）三爻
  outer: {
    '乾': ['午', '申', '戌'], // 九四午，九五申，上九戌
    '坤': ['丑', '亥', '酉'], // 六四丑，六五亥，上六酉
    '震': ['午', '申', '戌'], // 同乾外
    '巽': ['未', '巳', '卯'], // 六四未，九五巳，上九卯
    '坎': ['申', '戌', '子'], // 六四申，九五戌，上六子
    '离': ['酉', '未', '巳'], // 九四酉，六五未，上九巳
    '艮': ['戌', '子', '寅'], // 六四戌，六五子，上九寅
    '兑': ['亥', '酉', '未'], // 九四亥，九五酉，上六未
  },
}

/**
 * 八卦纳干
 */
export const TRIGRAM_NA_GAN = {
  '乾': { inner: '甲', outer: '壬' },
  '坤': { inner: '乙', outer: '癸' },
  '震': { inner: '庚', outer: '庚' },
  '巽': { inner: '辛', outer: '辛' },
  '坎': { inner: '戊', outer: '戊' },
  '离': { inner: '己', outer: '己' },
  '艮': { inner: '丙', outer: '丙' },
  '兑': { inner: '丁', outer: '丁' },
}

/**
 * 六十四卦所属八宫 + 世应位置
 * 格式: [palace, shiYao(世爻), yingYao(应爻)]
 * shiYao: 0-5 = 初到上
 * yingYao: 0-5 = 初到上
 */
export const HEXAGRAM_NAJIA_INFO = {
  // ===== 乾宫八卦 =====
  '乾为天':   { palace: '乾', shi: 5, ying: 2 }, // 八纯世在上
  '天风姤':   { palace: '乾', shi: 0, ying: 3 },
  '天山遁':   { palace: '乾', shi: 1, ying: 4 },
  '天地否':   { palace: '乾', shi: 2, ying: 5 },
  '风地观':   { palace: '乾', shi: 3, ying: 0 },
  '山地剥':   { palace: '乾', shi: 4, ying: 1 },
  '火地晋':   { palace: '乾', shi: 4, ying: 1 }, // 游魂
  '火天大有': { palace: '乾', shi: 3, ying: 0 }, // 归魂

  // ===== 坎宫八卦 =====
  '坎为水':   { palace: '坎', shi: 5, ying: 2 },
  '水泽节':   { palace: '坎', shi: 0, ying: 3 },
  '水雷屯':   { palace: '坎', shi: 1, ying: 4 },
  '水火既济': { palace: '坎', shi: 2, ying: 5 },
  '泽火革':   { palace: '坎', shi: 3, ying: 0 },
  '雷火丰':   { palace: '坎', shi: 4, ying: 1 },
  '地火明夷': { palace: '坎', shi: 4, ying: 1 }, // 游魂
  '地水师':   { palace: '坎', shi: 3, ying: 0 }, // 归魂

  // ===== 艮宫八卦 =====
  '艮为山':   { palace: '艮', shi: 5, ying: 2 },
  '山火贲':   { palace: '艮', shi: 0, ying: 3 },
  '山天大畜': { palace: '艮', shi: 1, ying: 4 },
  '山泽损':   { palace: '艮', shi: 2, ying: 5 },
  '火泽睽':   { palace: '艮', shi: 3, ying: 0 },
  '天泽履':   { palace: '艮', shi: 4, ying: 1 },
  '风泽中孚': { palace: '艮', shi: 4, ying: 1 }, // 游魂
  '风山渐':   { palace: '艮', shi: 3, ying: 0 }, // 归魂

  // ===== 震宫八卦 =====
  '震为雷':   { palace: '震', shi: 5, ying: 2 },
  '雷地豫':   { palace: '震', shi: 0, ying: 3 },
  '雷水解':   { palace: '震', shi: 1, ying: 4 },
  '雷风恒':   { palace: '震', shi: 2, ying: 5 },
  '地风升':   { palace: '震', shi: 3, ying: 0 },
  '水风井':   { palace: '震', shi: 4, ying: 1 },
  '泽风大过': { palace: '震', shi: 4, ying: 1 }, // 游魂
  '泽雷随':   { palace: '震', shi: 3, ying: 0 }, // 归魂

  // ===== 巽宫八卦 =====
  '巽为风':   { palace: '巽', shi: 5, ying: 2 },
  '风天小畜': { palace: '巽', shi: 0, ying: 3 },
  '风火家人': { palace: '巽', shi: 1, ying: 4 },
  '风雷益':   { palace: '巽', shi: 2, ying: 5 },
  '天雷无妄': { palace: '巽', shi: 3, ying: 0 },
  '火雷噬嗑': { palace: '巽', shi: 4, ying: 1 },
  '山雷颐':   { palace: '巽', shi: 4, ying: 1 }, // 游魂
  '山风蛊':   { palace: '巽', shi: 3, ying: 0 }, // 归魂

  // ===== 离宫八卦 =====
  '离为火':   { palace: '离', shi: 5, ying: 2 },
  '火山旅':   { palace: '离', shi: 0, ying: 3 },
  '火风鼎':   { palace: '离', shi: 1, ying: 4 },
  '火水未济': { palace: '离', shi: 2, ying: 5 },
  '山水蒙':   { palace: '离', shi: 3, ying: 0 },
  '风水涣':   { palace: '离', shi: 4, ying: 1 },
  '天水讼':   { palace: '离', shi: 4, ying: 1 }, // 游魂
  '天火同人': { palace: '离', shi: 3, ying: 0 }, // 归魂

  // ===== 坤宫八卦 =====
  '坤为地':   { palace: '坤', shi: 5, ying: 2 },
  '地雷复':   { palace: '坤', shi: 0, ying: 3 },
  '地泽临':   { palace: '坤', shi: 1, ying: 4 },
  '地天泰':   { palace: '坤', shi: 2, ying: 5 },
  '雷天大壮': { palace: '坤', shi: 3, ying: 0 },
  '泽天夬':   { palace: '坤', shi: 4, ying: 1 },
  '水天需':   { palace: '坤', shi: 4, ying: 1 }, // 游魂
  '水地比':   { palace: '坤', shi: 3, ying: 0 }, // 归魂

  // ===== 兑宫八卦 =====
  '兑为泽':   { palace: '兑', shi: 5, ying: 2 },
  '泽水困':   { palace: '兑', shi: 0, ying: 3 },
  '泽地萃':   { palace: '兑', shi: 1, ying: 4 },
  '泽山咸':   { palace: '兑', shi: 2, ying: 5 },
  '水山蹇':   { palace: '兑', shi: 3, ying: 0 },
  '地山谦':   { palace: '兑', shi: 4, ying: 1 },
  '雷山小过': { palace: '兑', shi: 4, ying: 1 }, // 游魂
  '雷泽归妹': { palace: '兑', shi: 3, ying: 0 }, // 归魂
}

/**
 * 地支五行
 */
export const ZHI_WUXING = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木',
  '辰': '土', '巳': '火', '午': '火', '未': '土',
  '申': '金', '酉': '金', '戌': '土', '亥': '水',
}

/**
 * 五行六亲关系
 * 以卦宫五行为"我"，地支五行为"他"
 */
export function getLiuQin(palaceWuxing, lineZhi, lineGan) {
  const zhiWx = ZHI_WUXING[lineZhi] || ''
  if (!zhiWx) return ''

  const shengMap = { '金': '水', '水': '木', '木': '火', '火': '土', '土': '金' }
  const keMap = { '金': '木', '木': '土', '土': '水', '水': '火', '火': '金' }

  if (palaceWuxing === zhiWx) return '兄弟'
  if (shengMap[palaceWuxing] === zhiWx) return '子孙'
  if (shengMap[zhiWx] === palaceWuxing) return '父母'
  if (keMap[palaceWuxing] === zhiWx) return '妻财'
  if (keMap[zhiWx] === palaceWuxing) return '官鬼'

  return ''
}

/**
 * 六神（以占卜日的天干定）
 */
export const LIU_SHEN = {
  // 以日干从初爻到上爻分配
  '甲乙': ['青龙', '朱雀', '勾陈', '螣蛇', '白虎', '玄武'],
  '丙丁': ['朱雀', '勾陈', '螣蛇', '白虎', '玄武', '青龙'],
  '戊':   ['勾陈', '螣蛇', '白虎', '玄武', '青龙', '朱雀'],
  '己':   ['螣蛇', '白虎', '玄武', '青龙', '朱雀', '勾陈'],
  '庚辛': ['白虎', '玄武', '青龙', '朱雀', '勾陈', '螣蛇'],
  '壬癸': ['玄武', '青龙', '朱雀', '勾陈', '螣蛇', '白虎'],
}

export function getLiuShen(dayGan, yaoIndex) {
  // yaoIndex: 0=初爻, 5=上爻
  for (const [key, values] of Object.entries(LIU_SHEN)) {
    if (key.includes(dayGan)) {
      return values[yaoIndex] || ''
    }
  }
  return ''
}

/**
 * 六神含义
 */
export const LIU_SHEN_MEANING = {
  '青龙': '吉利、喜庆、贵人、升迁',
  '朱雀': '口舌、文书、争吵、信息',
  '勾陈': '拖延、房产、土地、内耗',
  '螣蛇': '虚惊、怪异、梦魇、不实',
  '白虎': '血光、丧事、争斗、手术',
  '玄武': '暗昧、偷盗、隐私、失物',
}

/**
 * 八宫五行属性
 */
export const PALACE_WUXING = {
  '乾': '金', '兑': '金',
  '离': '火',
  '震': '木', '巽': '木',
  '坎': '水',
  '艮': '土', '坤': '土',
}
