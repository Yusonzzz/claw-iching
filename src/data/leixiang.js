/**
 * 八卦万物类象（梅花易数核心系统）
 * 每个卦在不同领域中有不同的象征意义
 */

// 问题类型分类
export const QUESTION_CATEGORIES = {
  career: ['事业', '工作', '创业', '求职', '职场', '老板', '升职', '跳槽', '生意'],
  love: ['感情', '婚姻', '恋爱', '伴侣', '结婚', '分手', '复合', '桃花'],
  wealth: ['财运', '投资', '股票', '基金', '赚钱', '破财', '借贷', '生意'],
  health: ['健康', '疾病', '身体', '看病', '手术', '养生', '康复'],
  study: ['学业', '考试', '学习', '考研', '升学', '留学', '论文'],
  travel: ['出行', '旅行', '搬家', '迁移', '搬迁', '远行', '路上'],
  legal: ['官司', '诉讼', '纠纷', '合同', '签约', '仲裁'],
  family: ['家宅', '家庭', '父母', '子女', '房产', '装修', '风水'],
  lost: ['失物', '寻人', '找人', '找东西', '小偷'],
  other: ['其他', '一般', '普通'],
}

/**
 * 八卦类象完整数据
 */
export const LEI_XIANG = {
  '乾': {
    name: '乾',
    pinyin: 'qián',
    nature: '天',
    wuxing: '金',
    gua: '☰',
    // 基础属性
    base: {
      direction: '西北',
      season: '秋冬之交',
      number: 1,
      color: ['大红', '金色', '玄色'],
      taste: '辛辣',
      sound: '商声',
      animal: ['马', '天鹅', '狮子', '大象'],
      body: ['头', '骨', '肺', '大肠'],
    },
    // 按领域分类
    categories: {
      career: {
        symbol: '天、君、领导',
        meaning: '乾为天，象征高位、权威、领导力。问事业主掌权、晋升，但需防刚愎自用。',
        good: '事业通达，位高权重，有领导力',
        bad: '过于刚强，独断专行，高处不胜寒',
      },
      love: {
        symbol: '刚健、君父',
        meaning: '乾卦纯阳，刚健有力。问感情主对方性格强势，关系中有主导方。纯阳无阴，男性主动女性被动之象。',
        good: '正大光明，阳刚果决',
        bad: '缺乏柔情，大男子主义，沟通不畅',
      },
      wealth: {
        symbol: '金玉、宝珠',
        meaning: '乾为金玉，主大财、正财。财运亨通，但需正直取财。',
        good: '财源广进，得贵人相助',
        bad: '财多身弱，守财不易',
      },
      health: {
        symbol: '头、骨、肺',
        meaning: '乾主头、骨骼、呼吸系统。注意头部和肺部健康。',
        good: '身体素质好，恢复力强',
        bad: '头痛、骨病、呼吸道疾病',
      },
      study: {
        symbol: '刚健、自强不息',
        meaning: '乾卦"天行健，君子以自强不息"。问学业主勤奋努力，有进取心。',
        good: '成绩优异，名列前茅',
        bad: '压力过大，过于求胜心切',
      },
      travel: {
        symbol: '西北、远行',
        meaning: '乾为西北方向，主远行。出行顺利，但注意旅途劳顿。',
        good: '出行顺利，西北方向尤佳',
        bad: '旅途劳累，注意天气变化',
      },
      legal: {
        symbol: '刚直、公正',
        meaning: '乾为刚直，主公正。官司有理，但需据理力争。',
        good: '公道自在人心，正直者可胜',
        bad: '刚则易折，不宜硬碰硬',
      },
      family: {
        symbol: '天、父',
        meaning: '乾为父，主家长。家宅中男主人为主导，秩序井然。',
        good: '家宅兴旺，长子出息',
        bad: '父亲过于严厉，家庭缺乏温情',
      },
      lost: {
        symbol: '金玉、高处',
        meaning: '失物在西北方向高处，金属容器中，或与老人/权威人物有关。',
        good: '有望寻回',
        bad: '被收藏不易找',
      },
    },
  },

  '坤': {
    name: '坤',
    pinyin: 'kūn',
    nature: '地',
    wuxing: '土',
    gua: '☷',
    base: {
      direction: '西南',
      season: '夏秋之交',
      number: 8,
      color: ['黄色', '棕色', '土色'],
      taste: '甘甜',
      sound: '宫声',
      animal: ['牛', '母马', '虫'],
      body: ['腹', '脾', '胃', '肌肉'],
    },
    categories: {
      career: {
        symbol: '地、臣、母',
        meaning: '坤为地，象征柔顺、包容、母性。问事业宜守成、配合，不宜独立开创。',
        good: '稳扎稳打，得到支持，人缘好',
        bad: '缺乏主见，过于被动，进步缓慢',
      },
      love: {
        symbol: '柔顺、包容',
        meaning: '坤卦纯阴，柔顺包容。问感情主温柔体贴，关系和睦。',
        good: '两情相悦，互相包容，家庭和睦',
        bad: '过于迁就，失去自我',
      },
      wealth: {
        symbol: '土地、包容',
        meaning: '坤为土，主不动产、仓储之财。财运平稳，宜守旧业。',
        good: '财源稳定，储蓄丰厚',
        bad: '投资回报慢，缺乏突破',
      },
      health: {
        symbol: '腹、脾、胃',
        meaning: '坤主腹部、消化系统。注意脾胃、饮食问题。',
        good: '体质温和，恢复平稳',
        bad: '脾胃虚弱，消化不良，湿气重',
      },
      study: {
        symbol: '柔顺、厚德载物',
        meaning: '坤卦"厚德载物"。问学业主踏实认真，循序渐进。',
        good: '基础扎实，厚积薄发',
        bad: '进展缓慢，缺乏创新',
      },
      travel: {
        symbol: '西南、平地',
        meaning: '坤为西南方向，平地。出行平稳顺利。',
        good: '旅途平安，西南方向适宜',
        bad: '行程略慢，可能被延迟',
      },
      legal: {
        symbol: '柔顺、被动',
        meaning: '坤为柔顺，官司中处于被动地位，宜和解。',
        good: '能得人调解',
        bad: '弱势一方，不宜硬争',
      },
      family: {
        symbol: '地、母',
        meaning: '坤为母，主女性长辈。家宅安宁，女主人持家有道。',
        good: '家庭和睦，长辈安康',
        bad: '母亲操心过多，家事琐碎',
      },
      lost: {
        symbol: '土地、低处',
        meaning: '失物在西南方低处、容器中或与女性有关。',
        good: '徐徐可寻',
        bad: '可能被覆盖掩埋',
      },
    },
  },

  '震': {
    name: '震',
    pinyin: 'zhèn',
    nature: '雷',
    wuxing: '木',
    gua: '☳',
    base: {
      direction: '东',
      season: '春',
      number: 4,
      color: ['青色', '绿色'],
      taste: '酸味',
      sound: '角声',
      animal: ['龙', '蛇', '马鸣'],
      body: ['足', '肝', '发'],
    },
    categories: {
      career: {
        symbol: '雷、震动',
        meaning: '震为雷，象征变动、起势。问事业主变动中有机遇，宜主动出击。',
        good: '趁势而起，一鸣惊人',
        bad: '变动太大，根基不稳，有反复',
      },
      love: {
        symbol: '震动、行动',
        meaning: '震卦主动，感情中主动出击者占优势。关系有变动。',
        good: '积极追求，有突破性进展',
        bad: '感情冲动，争吵不断',
      },
      wealth: {
        symbol: '震动、发散',
        meaning: '震主动，财运有波动。宜做短线和流动性强的投资。',
        good: '抓住机遇可获利',
        bad: '财来财去，守不住',
      },
      health: {
        symbol: '足、肝',
        meaning: '震主肝胆、足部。注意肝火旺盛、脚部受伤。',
        good: '精力充沛，行动力强',
        bad: '肝火旺易怒，腿脚受伤',
      },
      study: {
        symbol: '震动、奋发',
        meaning: '震为奋发向上。问学业主有冲劲，但需注意基础。',
        good: '进步快，有突破',
        bad: '急于求成，学而不精',
      },
      travel: {
        symbol: '东、行动',
        meaning: '震为东方，主出行。适合出行，但需防意外变动。',
        good: '出行顺利，东方吉利',
        bad: '旅途多变动，防意外',
      },
      legal: {
        symbol: '震动、冲突',
        meaning: '震主动，官司有冲突。需做好应对准备。',
        good: '主动出击，掌握先机',
        bad: '冲突激烈，劳心劳力',
      },
      family: {
        symbol: '长男',
        meaning: '震为长子。家宅中长子的地位重要，或有变动。',
        good: '长子有作为',
        bad: '家中不宁，有惊扰之事',
      },
      lost: {
        symbol: '东方、震动',
        meaning: '失物在东方、高处、或与木器有关。有重新出现的可能。',
        good: '失物能被发现',
        bad: '被移动过位置',
      },
    },
  },

  '巽': {
    name: '巽',
    pinyin: 'xùn',
    nature: '风',
    wuxing: '木',
    gua: '☴',
    base: {
      direction: '东南',
      season: '春夏之交',
      number: 5,
      color: ['蓝色', '绿色'],
      taste: '酸味',
      sound: '角声',
      animal: ['鸡', '鸟', '虫'],
      body: ['股', '胆', '气官'],
    },
    categories: {
      career: {
        symbol: '风、入、顺',
        meaning: '巽为风，主顺入、传播、沟通。问事业宜做文化、传播、中介类。需善于沟通。',
        good: '善于沟通，人脉广，顺风顺水',
        bad: '随风倒，缺乏主见',
      },
      love: {
        symbol: '顺入、柔顺',
        meaning: '巽主顺入，感情中需要慢慢渗透。宜耐心培养感情。',
        good: '温柔体贴，相处融洽',
        bad: '犹豫不决，感情不够坚定',
      },
      wealth: {
        symbol: '风顺、流通',
        meaning: '巽为风，主流通之财。做贸易、中介、传播类财运佳。',
        good: '财路通畅，有偏财',
        bad: '财来快去也快',
      },
      health: {
        symbol: '股、胆',
        meaning: '巽主大腿、胆囊、呼吸系统。注意肝胆和呼吸道。',
        good: '气机通畅',
        bad: '胆怯、呼吸不畅、股部不适',
      },
      study: {
        symbol: '顺入、渗透',
        meaning: '巽为入，学东西慢慢渗透。适合文科、语言类学习。',
        good: '悟性高，举一反三',
        bad: '不够专注，浅尝辄止',
      },
      travel: {
        symbol: '东南、风行',
        meaning: '巽为东南方向。出行顺利如风，但需注意行程变化。',
        good: '出行顺畅，东南方向有利',
        bad: '行程不稳，有变更',
      },
      legal: {
        symbol: '顺入、随风',
        meaning: '巽主顺，官司中宜灵活变通，不宜硬碰。',
        good: '可协商解决',
        bad: '立场不坚定，易被说服',
      },
      family: {
        symbol: '长女',
        meaning: '巽为长女。家宅中长女有影响力。',
        good: '长女能干，家庭和谐',
        bad: '家庭关系随风而动，不够稳定',
      },
      lost: {
        symbol: '东南、风',
        meaning: '失物在东南方通风处、或与木质/纸质物有关。',
        good: '容易被发现',
        bad: '可能被风吹走或移位',
      },
    },
  },

  '坎': {
    name: '坎',
    pinyin: 'kǎn',
    nature: '水',
    wuxing: '水',
    gua: '☵',
    base: {
      direction: '北',
      season: '冬',
      number: 6,
      color: ['黑色', '蓝色'],
      taste: '咸味',
      sound: '羽声',
      animal: ['鱼', '鼠', '狐', '水族'],
      body: ['耳', '肾', '膀胱'],
    },
    categories: {
      career: {
        symbol: '水、险、陷',
        meaning: '坎为水，主险陷、曲折。问事业有阻碍，需坚持和智慧应对。',
        good: '遇水则发，智慧化解',
        bad: '困难重重，阻碍颇多',
      },
      love: {
        symbol: '水、柔情',
        meaning: '坎为水，主情感流动。感情中有波澜，需用心经营。',
        good: '感情深厚，细水长流',
        bad: '情感波折，暗中生变',
      },
      wealth: {
        symbol: '流水、暗财',
        meaning: '坎为水，主流动之财、暗财。适合水利、物流、贸易。',
        good: '暗中有财，意外之喜',
        bad: '破财如水，经济紧张',
      },
      health: {
        symbol: '耳、肾、膀胱',
        meaning: '坎主肾脏、泌尿系统、耳朵。注意腰肾和听力。',
        good: '肾气足，精力充沛',
        bad: '腰酸背痛，肾虚，耳疾',
      },
      study: {
        symbol: '水、智',
        meaning: '坎为水，主智慧。学问需要在困难中钻研。',
        good: '智慧增长，深思熟虑',
        bad: '学业有阻碍，进度慢',
      },
      travel: {
        symbol: '北、水路',
        meaning: '坎为北方，水路。出行需注意安全。',
        good: '北方有利',
        bad: '路途有险，注意水患',
      },
      legal: {
        symbol: '险陷、曲折',
        meaning: '坎主险，官司中有波折，需小心应对。',
        good: '有智慧者可脱险',
        bad: '官司缠身，麻烦不断',
      },
      family: {
        symbol: '中男、水',
        meaning: '坎为中男。家宅中有中年男性需关注，或与水有关。',
        good: '家中男子有担当',
        bad: '家有隐忧，注意安全',
      },
      lost: {
        symbol: '北、水中',
        meaning: '失物在北方、水边、低洼处、或与黑色有关。',
        good: '耐心可寻',
        bad: '可能被水浸损坏',
      },
    },
  },

  '离': {
    name: '离',
    pinyin: 'lí',
    nature: '火',
    wuxing: '火',
    gua: '☲',
    base: {
      direction: '南',
      season: '夏',
      number: 3,
      color: ['红色', '紫色'],
      taste: '苦味',
      sound: '徵声',
      animal: ['雉', '凤凰', '孔雀', '龟'],
      body: ['目', '心', '小肠'],
    },
    categories: {
      career: {
        symbol: '火、明、丽',
        meaning: '离为火，主光明、文化、艺术。问事业适合文化、创意、科技类。',
        good: '前途光明，名声远扬',
        bad: '虚火旺盛，华而不实',
      },
      love: {
        symbol: '火、光明',
        meaning: '离为火，热情明亮。感情炽热，但也容易激烈。',
        good: '热情似火，光明正大',
        bad: '感情来得快去也快，易生口角',
      },
      wealth: {
        symbol: '火、虚',
        meaning: '离为火，主虚财、名气变现。适合文化创意类。',
        good: '名利双收',
        bad: '虚浮之财，不踏实',
      },
      health: {
        symbol: '目、心',
        meaning: '离主眼睛、心脏、血液。注意视力、心血管问题。',
        good: '心明眼亮',
        bad: '眼疾，心脏病，血压高',
      },
      study: {
        symbol: '火、文明',
        meaning: '离为文明之象。问学业主文科好，有文采。',
        good: '聪明好学，文采出众',
        bad: '心浮气躁，不能持久',
      },
      travel: {
        symbol: '南、光明',
        meaning: '离为南方。出行顺利，南方尤佳。',
        good: '出行愉快，南方大吉',
        bad: '炎热天气需防暑',
      },
      legal: {
        symbol: '火、明',
        meaning: '离为光明，官司能明辨是非。',
        good: '真相大白，得公正',
        bad: '争吵激烈，火上浇油',
      },
      family: {
        symbol: '中女、火',
        meaning: '离为中女。家宅中中年女性活跃，或有喜事。',
        good: '家宅光明，有喜事',
        bad: '口角之争，火气大',
      },
      lost: {
        symbol: '南、光明处',
        meaning: '失物在南方、明亮处、火热处、或与女性有关。',
        good: '容易被发现',
        bad: '被烧毁或损坏',
      },
    },
  },

  '艮': {
    name: '艮',
    pinyin: 'gèn',
    nature: '山',
    wuxing: '土',
    gua: '☶',
    base: {
      direction: '东北',
      season: '冬春之交',
      number: 7,
      color: ['黄色', '棕色'],
      taste: '甘甜',
      sound: '宫声',
      animal: ['狗', '狼', '虎', '鼠'],
      body: ['手', '鼻', '背'],
    },
    categories: {
      career: {
        symbol: '山、止、守',
        meaning: '艮为山，主停止、守成。问事业不宜冒进，宜守住现有阵地。',
        good: '稳定发展，根基牢固',
        bad: '停滞不前，缺乏突破',
      },
      love: {
        symbol: '山、阻',
        meaning: '艮为山，感情中有阻碍。需要耐心和真诚跨越障碍。',
        good: '感情稳定，经得起考验',
        bad: '感情受阻，冷若冰霜',
      },
      wealth: {
        symbol: '山、库',
        meaning: '艮为山，主积蓄、不动产。财富在积累和守成。',
        good: '积蓄增加，不动产稳妥',
        bad: '投资回报慢，资金被套',
      },
      health: {
        symbol: '手、鼻、背',
        meaning: '艮主手、鼻、背部。注意风湿、鼻塞、背痛。',
        good: '体格结实',
        bad: '手脚不便，鼻病，背痛',
      },
      study: {
        symbol: '山、止',
        meaning: '艮为止，学业需踏实，但进展较慢。',
        good: '用功实在，基础牢固',
        bad: '进展缓慢，缺乏灵活性',
      },
      travel: {
        symbol: '东北、山路',
        meaning: '艮为东北，山路。出行需注意安全，或有延迟。',
        good: '适合休闲游山',
        bad: '路途受阻，不宜远行',
      },
      legal: {
        symbol: '止、背',
        meaning: '艮主止，官司宜止不宜进。',
        good: '和解为佳',
        bad: '僵持不下，两败俱伤',
      },
      family: {
        symbol: '少男',
        meaning: '艮为少男。家宅中少年男性需关注。',
        good: '家宅安宁',
        bad: '少年叛逆，沟通不畅',
      },
      lost: {
        symbol: '东北、高处',
        meaning: '失物在东北方高处、山石间、或与狗有关。',
        good: '在固定处未移动',
        bad: '被搁置难寻',
      },
    },
  },

  '兑': {
    name: '兑',
    pinyin: 'duì',
    nature: '泽',
    wuxing: '金',
    gua: '☱',
    base: {
      direction: '西',
      season: '秋',
      number: 2,
      color: ['白色', '银色'],
      taste: '辛辣',
      sound: '商声',
      animal: ['羊', '鸟', '泽中物'],
      body: ['口', '舌', '肺'],
    },
    categories: {
      career: {
        symbol: '泽、悦、说',
        meaning: '兑为泽，主喜悦、口才、沟通。问事业适合销售、教师、公关等。',
        good: '口才佳，人缘好，有贵人',
        bad: '只说不做，空谈误事',
      },
      love: {
        symbol: '泽、悦',
        meaning: '兑为喜悦，感情甜蜜。但兑为缺，需防美中不足。',
        good: '两情相悦，甜甜蜜蜜',
        bad: '有口舌之争，美中不足',
      },
      wealth: {
        symbol: '泽、悦',
        meaning: '兑为泽，喜悦之财。适合口才、娱乐、服务业。',
        good: '得财有道，收入可观',
        bad: '财源有缺口',
      },
      health: {
        symbol: '口、舌、肺',
        meaning: '兑主口腔、咽喉、肺部。注意呼吸道和口腔问题。',
        good: '肺气充足',
        bad: '咽喉炎，口腔溃疡，咳喘',
      },
      study: {
        symbol: '口、悦',
        meaning: '兑为口，问学业主语言能力强，适合外语、演讲。',
        good: '善于表达，外语好',
        bad: '口惠而实不至，学业不精',
      },
      travel: {
        symbol: '西、泽',
        meaning: '兑为西方。出行顺利，注意水和口舌。',
        good: '旅途愉快，西方有利',
        bad: '口舌是非，注意水泽',
      },
      legal: {
        symbol: '说、口',
        meaning: '兑为口，官司中口才很重要。但也容易口舌是非。',
        good: '善于辩论',
        bad: '口舌是非多',
      },
      family: {
        symbol: '少女',
        meaning: '兑为少女。家宅中少女或年轻女性有喜事。',
        good: '家有喜事，欢歌笑语',
        bad: '口舌是非，争吵',
      },
      lost: {
        symbol: '西、泽',
        meaning: '失物在西方、水边、或与金属/少女有关。',
        good: '可寻回',
        bad: '落入水中难寻',
      },
    },
  },
}

/**
 * 根据问题文本判断类别
 */
export function classifyQuestion(question) {
  if (!question) return 'other'
  const q = question.toLowerCase()
  for (const [category, keywords] of Object.entries(QUESTION_CATEGORIES)) {
    for (const kw of keywords) {
      if (q.includes(kw)) return category
    }
  }
  return 'other'
}

/**
 * 获取与问题相关的类象解读
 */
export function getLeiXiangInterpretation(upperName, lowerName, question) {
  const category = classifyQuestion(question)
  const upper = LEI_XIANG[upperName]
  const lower = LEI_XIANG[lowerName]
  if (!upper || !lower) return ''

  const uCat = upper.categories[category]
  const lCat = lower.categories[category]
  if (!uCat || !lCat) return ''

  const lines = [`【八卦类象】问题分类：${categoryTranslate(category)}`]
  lines.push(`上卦${upperName}为${upper.nature}：${uCat.meaning}`)
  lines.push(`下卦${lowerName}为${lower.nature}：${lCat.meaning}`)

  // 结合体用给出针对性建议
  const body = lower
  const func = upper
  const bodyCat = lCat
  const funcCat = uCat

  lines.push(`\n在${categoryTranslate(category)}方面：`)
  lines.push(`• 下卦${bodyName(body)}为${body.nature}，代表您自身：${bodyCat.symbol} → ${pickGoodBad(bodyCat, category)}`)
  lines.push(`• 上卦${funcName(func)}为${func.nature}，代表外部因素：${funcCat.symbol} → ${pickGoodBad(funcCat, category)}`)

  return lines.join('\n')
}

function categoryTranslate(cat) {
  return {
    career: '事业工作', love: '感情婚姻', wealth: '财运投资',
    health: '健康疾病', study: '学业考试', travel: '出行迁移',
    legal: '官司诉讼', family: '家宅家庭', lost: '失物寻人', other: '综合',
  }[cat] || cat
}

function bodyName(t) { return t.name }
function funcName(t) { return t.name }

function pickGoodBad(cat, category) {
  if (category === 'lost') return cat.good || cat.meaning
  return `${cat.good || ''}；但${cat.bad || ''}`
}
