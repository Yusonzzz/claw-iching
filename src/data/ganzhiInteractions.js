/**
 * 天干地支互动数据
 * 六合、三合、六冲、三刑、六害、天干五合、天干相冲
 */

// ========== 天干 ==========

/** 天干五合 */
export const TIAN_GAN_WU_HE = {
  '甲': { target: '己', wuxing: '土' },
  '乙': { target: '庚', wuxing: '金' },
  '丙': { target: '辛', wuxing: '水' },
  '丁': { target: '壬', wuxing: '木' },
  '戊': { target: '癸', wuxing: '火' },
  '己': { target: '甲', wuxing: '土' },
  '庚': { target: '乙', wuxing: '金' },
  '辛': { target: '丙', wuxing: '水' },
  '壬': { target: '丁', wuxing: '木' },
  '癸': { target: '戊', wuxing: '火' },
}

/** 天干相冲 */
export const TIAN_GAN_XIANG_CHONG = {
  '甲': '庚', '乙': '辛', '丙': '壬', '丁': '癸',
  '戊': '己', '己': '戊',
  '庚': '甲', '辛': '乙', '壬': '丙', '癸': '丁',
}

// ========== 地支 ==========

/** 地支六合 */
export const DI_ZHI_LIU_HE = {
  '子': { target: '丑', wuxing: '土' },
  '丑': { target: '子', wuxing: '土' },
  '寅': { target: '亥', wuxing: '木' },
  '亥': { target: '寅', wuxing: '木' },
  '卯': { target: '戌', wuxing: '火' },
  '戌': { target: '卯', wuxing: '火' },
  '辰': { target: '酉', wuxing: '金' },
  '酉': { target: '辰', wuxing: '金' },
  '巳': { target: '申', wuxing: '水' },
  '申': { target: '巳', wuxing: '水' },
  '午': { target: '未', wuxing: '土' },
  '未': { target: '午', wuxing: '土' },
}

/** 地支三合局 */
export const DI_ZHI_SAN_HE = {
  '申': { group: '申子辰', wuxing: '水', members: ['申','子','辰'] },
  '子': { group: '申子辰', wuxing: '水', members: ['申','子','辰'] },
  '辰': { group: '申子辰', wuxing: '水', members: ['申','子','辰'] },
  '亥': { group: '亥卯未', wuxing: '木', members: ['亥','卯','未'] },
  '卯': { group: '亥卯未', wuxing: '木', members: ['亥','卯','未'] },
  '未': { group: '亥卯未', wuxing: '木', members: ['亥','卯','未'] },
  '寅': { group: '寅午戌', wuxing: '火', members: ['寅','午','戌'] },
  '午': { group: '寅午戌', wuxing: '火', members: ['寅','午','戌'] },
  '戌': { group: '寅午戌', wuxing: '火', members: ['寅','午','戌'] },
  '巳': { group: '巳酉丑', wuxing: '金', members: ['巳','酉','丑'] },
  '酉': { group: '巳酉丑', wuxing: '金', members: ['巳','酉','丑'] },
  '丑': { group: '巳酉丑', wuxing: '金', members: ['巳','酉','丑'] },
}

/** 地支六冲 */
export const DI_ZHI_LIU_CHONG = {
  '子': '午', '午': '子',
  '丑': '未', '未': '丑',
  '寅': '申', '申': '寅',
  '卯': '酉', '酉': '卯',
  '辰': '戌', '戌': '辰',
  '巳': '亥', '亥': '巳',
}

/** 地支三刑 */
export const DI_ZHI_SAN_XING = {
  // 无礼之刑
  '子': { type: '无礼之刑', target: '卯', description: '子卯相刑，无礼之刑。主不尊礼节，容易因小事起冲突。' },
  '卯': { type: '无礼之刑', target: '子', description: '子卯相刑，无礼之刑。主不尊礼节，容易因小事起冲突。' },
  // 无恩之刑（三刑中任意两个相遇）
  '寅': { type: '无恩之刑', target: ['巳', '申'], description: '寅巳申三刑，无恩之刑。主忘恩负义，口舌是非。' },
  '巳': { type: '无恩之刑', target: ['寅', '申'], description: '寅巳申三刑，无恩之刑。主忘恩负义，口舌是非。' },
  '申': { type: '无恩之刑', target: ['寅', '巳'], description: '寅巳申三刑，无恩之刑。主忘恩负义，口舌是非。' },
  // 恃势之刑
  '丑': { type: '恃势之刑', target: ['未', '戌'], description: '丑未戌三刑，恃势之刑。主仗势欺人，家庭不和。' },
  '未': { type: '恃势之刑', target: ['丑', '戌'], description: '丑未戌三刑，恃势之刑。主仗势欺人，家庭不和。' },
  '戌': { type: '恃势之刑', target: ['丑', '未'], description: '丑未戌三刑，恃势之刑。主仗势欺人，家庭不和。' },
  // 自刑
  '辰': { type: '自刑', target: '辰', description: '辰辰自刑，主自我矛盾，内心纠结。' },
  '午': { type: '自刑', target: '午', description: '午午自刑，主自寻烦恼，性情刚烈。' },
  '酉': { type: '自刑', target: '酉', description: '酉酉自刑，主自以为是，孤傲不合群。' },
  '亥': { type: '自刑', target: '亥', description: '亥亥自刑，主自我消耗，思虑过多。' },
}

/** 地支六害 */
export const DI_ZHI_LIU_HAI = {
  '子': { target: '未', description: '子未相害，主不利六亲，易生矛盾。' },
  '未': { target: '子', description: '未子相害，主不利六亲，易生矛盾。' },
  '丑': { target: '午', description: '丑午相害，主官非口舌，疾病痛苦。' },
  '午': { target: '丑', description: '午丑相害，主官非口舌，疾病痛苦。' },
  '寅': { target: '巳', description: '寅巳相害，主口舌是非，出行不利。' },
  '巳': { target: '寅', description: '巳寅相害，主口舌是非，出行不利。' },
  '卯': { target: '辰', description: '卯辰相害，主财务损失，兄弟不和。' },
  '辰': { target: '卯', description: '辰卯相害，主财务损失，兄弟不和。' },
  '申': { target: '亥', description: '申亥相害，主做事受阻，好事多磨。' },
  '亥': { target: '申', description: '亥申相害，主做事受阻，好事多磨。' },
  '酉': { target: '戌', description: '酉戌相害，主口舌官司，小人暗害。' },
  '戌': { target: '酉', description: '戌酉相害，主口舌官司，小人暗害。' },
}

/** 互动分类 & 影响程度 */
export const INTERACTION_INFO = {
  '天干五合': {
    type: '合',
    impact: '吉',
    score: 20,
    general: '天干相合，代表合作、结合、化合。主关系融洽，事情有合作之象。',
  },
  '天干相冲': {
    type: '冲',
    impact: '凶',
    score: -20,
    general: '天干相冲，代表冲突、对立、变动。主意见不合，事情有波折。',
  },
  '地支六合': {
    type: '合',
    impact: '吉',
    score: 25,
    general: '地支六合，代表亲密合作、团结、结合。主关系紧密，事情顺利推进。',
  },
  '地支三合': {
    type: '合',
    impact: '吉',
    score: 30,
    general: '地支三合局，代表大局助力、三方合力。主有强大的外部力量支持，事情易成。',
  },
  '地支六冲': {
    type: '冲',
    impact: '凶',
    score: -25,
    general: '地支六冲，代表冲突、对立、分离、变动。主事情有突变。',
  },
  '地支三刑': {
    type: '刑',
    impact: '凶',
    score: -15,
    general: '地支相刑，代表刑罚、纠纷、痛苦、摩擦。主有法律或人际纠纷。',
  },
  '地支六害': {
    type: '害',
    impact: '凶',
    score: -12,
    general: '地支相害，代表暗害、不利、损耗、猜忌。主有小人或隐性阻力。',
  },
}
