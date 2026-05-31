/**
 * 运势推演引擎 — 按日/周/月/年不同维度深度分析
 */
import { analyzeBazi } from './bazi.js'
import { getDayGanZhi } from './calendar.js'
import { getDailyHexagram, getWeeklyHexagram, getMonthlyHexagram, getYearlyHexagram } from './iching.js'
import { HEXAGRAM_KNOWLEDGE, GUA_DE, GUA_WUXING } from '../data/hexagramKnowledge.js'

const SHENG = { '金': '水', '水': '木', '木': '火', '火': '土', '土': '金' }
const KE = { '金': '木', '木': '土', '土': '水', '水': '火', '火': '金' }
const LIU_HE = { '子丑': 1, '丑子': 1, '寅亥': 1, '亥寅': 1, '卯戌': 1, '戌卯': 1, '辰酉': 1, '酉辰': 1, '巳申': 1, '申巳': 1, '午未': 1, '未午': 1 }
const LIU_CHONG = { '子午': 1, '午子': 1, '丑未': 1, '未丑': 1, '寅申': 1, '申寅': 1, '卯酉': 1, '酉卯': 1, '辰戌': 1, '戌辰': 1, '巳亥': 1, '亥巳': 1 }
const SEASON_WX = { '春': '木', '夏': '火', '秋': '金', '冬': '水' }
function getSeason(m) { return m >= 3 && m <= 5 ? '春' : m >= 6 && m <= 8 ? '夏' : m >= 9 && m <= 11 ? '秋' : '冬' }

export function getNewFortune(profile, year, month, day, period) {
  if (!profile) return null
  const bazi = analyzeBazi(profile.birthYear, profile.birthMonth, profile.birthDay, profile.birthHour || 12, profile.birthMinute || 0)
  if (!bazi) return null
  const result = { title: '', period, date: { year, month, day }, bazi: bazi.bazi, baziStr: bazi.formatted, sections: [], hexagram: null }
  
  // 对应的卦象
  let hex = null
  try {
    if (period === 'day') hex = getDailyHexagram(year, month, day)
    else if (period === 'week') hex = getWeeklyHexagram(year, month, day)
    else if (period === 'month') hex = getMonthlyHexagram(year, month)
    else hex = getYearlyHexagram(year)
  } catch (e) { /* 忽略卦象获取失败 */ }
  if (hex?.original) {
    const num = hex.original.number
    const kw = HEXAGRAM_KNOWLEDGE[num] || {}
    result.hexagram = {
      name: hex.original.name,
      upper: hex.original.upper,
      lower: hex.original.lower,
      judgment: hex.original.judgment,
      guaDe: (GUA_DE[hex.original.upper] || '') + '上' + (GUA_DE[hex.original.lower] || '') + '下',
      wuxing: '上' + (GUA_WUXING[hex.original.upper] || '') + '下' + (GUA_WUXING[hex.original.lower] || ''),
      xiang: kw.xiang || '',
      upperXiang: guaXiang(hex.original.upper),
      lowerXiang: guaXiang(hex.original.lower),
    }
  }
  switch (period) {
    case 'day': result.title = year + '年' + month + '月' + day + '日 运势'; result.sections = analyzeDay(getDayGanZhi(year, month, day), bazi, year, month, day); break
    case 'week': result.title = year + '年第' + getWeekNum({ year, month, day }) + '周 运势'; result.sections = analyzeWeek(year, month, day, bazi); break
    case 'month': result.title = year + '年' + month + '月 运势'; result.sections = analyzeMonth(year, month, bazi); break
    case 'year': result.title = year + '年 运势'; result.sections = analyzeYear(year, bazi); break
  }

  // 追加卦象相关的分析项
  if (result.hexagram) {
    const hx = result.hexagram
    result.sections.push({ title: '🔮 时卦解读', text: hx.name + '卦（' + hx.wuxing + '）│ ' + hx.guaDe + '。' + (hx.xiang || hx.judgment || '此卦与您当前时段相呼应。') })
    result.sections.push({ title: '🧭 卦象启示', text: '上卦' + hx.upper + '（' + hx.upperXiang + '）代表外部环境；下卦' + hx.lower + '（' + hx.lowerXiang + '）代表您的内在状态。' + hx.name + '卦提醒您：审时度势，顺势而为。' })
  }
  return result
}

// ══════ 日运 ══════
function analyzeDay(dayGZ, bazi, year, month, day) {
  const s = []
  const riGan = bazi.bazi.day.gan, riZhi = bazi.bazi.day.zhi
  const dg = dayGZ.gan, dz = dayGZ.zhi, season = getSeason(month)
  const wxRel = getShiShen(dg.wuxing, dg.yinyang, riGan.wuxing, riGan.yinyang)

  s.push({ title: '📅 今日干支', text: dg.name + dz.name + '日（' + dg.wuxing + dz.wuxing + '）│ ' + season + '季 │ ' + year + '.' + month + '.' + day })
  s.push({ title: '🔮 日主联动', text: '今日' + dg.name + '干（' + dg.wuxing + '）对日主' + riGan.name + '（' + riGan.wuxing + '）为「' + wxRel + '」，' + shiShenShort(wxRel) })

  const chong = LIU_CHONG[dz.name + riZhi.name], he = LIU_HE[dz.name + riZhi.name]
  if (chong) s.push({ title: '⚠️ 日柱相冲', text: '今日' + dz.name + '冲日支' + riZhi.name + '。情绪易波动，不宜做重大决定。' })
  else if (he) s.push({ title: '🤝 日柱相合', text: '今日' + dz.name + '合日支' + riZhi.name + '。气场顺，适合社交。' })

  const seasonWx = SEASON_WX[season]
  const wxState = SHENG[seasonWx] === riGan.wuxing ? '时令生您，运势向好' : seasonWx === riGan.wuxing ? '得时令，精力充沛' : KE[seasonWx] === riGan.wuxing ? '时令克您，能量偏低' : '时令平和'
  s.push({ title: '🌿 时令旺衰', text: season + '季' + seasonWx + '旺——' + wxState + '。' })

  addSections(s, wxRel, riGan, '今日')
  return s
}

// ══════ 周运 ══════
function analyzeWeek(year, month, day, bazi) {
  const s = []
  const riGan = bazi.bazi.day.gan, riZhi = bazi.bazi.day.zhi, season = getSeason(month)
  const weekGZ = getDayGanZhi(year, month, day)
  const wxRel = getShiShen(weekGZ.gan.wuxing, weekGZ.gan.yinyang, riGan.wuxing, riGan.yinyang)

  s.push({ title: '📅 本周干支', text: '第' + getWeekNum({ year, month, day }) + '周 │ 始于' + year + '.' + month + '.' + day + '（' + weekGZ.gan.name + weekGZ.zhi.name + '日）│ ' + season + '季' })
  s.push({ title: '🔮 周干照命', text: '周天干' + weekGZ.gan.name + '（' + weekGZ.gan.wuxing + '）对日主' + riGan.name + '为「' + wxRel + '」——' + shiShenShort(wxRel) })

  const seasonWx = SEASON_WX[season]
  s.push({ title: '🌿 五行流布', text: season + '季' + seasonWx + '气当令——' + (riGan.wuxing === seasonWx ? '日主得令，本周气场充沛' : SHENG[seasonWx] === riGan.wuxing ? '时令生日主，整体向好' : KE[seasonWx] === riGan.wuxing ? '时令克日主，本周低调行事' : '平和，正常节奏') + '。' })

  addSections(s, wxRel, riGan, '本周')
  return s
}

// ══════ 月运 ══════
function analyzeMonth(year, month, bazi) {
  const s = []
  const riGan = bazi.bazi.day.gan, riZhi = bazi.bazi.day.zhi, season = getSeason(month)
  const mG = getMonthGan(year, month), mZ = getMonthZhi(month)
  const wxRel = getShiShen(mG.wuxing, mG.yinyang, riGan.wuxing, riGan.yinyang)

  s.push({ title: '📅 本月干支', text: mG.name + mZ.name + '月（' + mG.wuxing + mZ.wuxing + '）│ ' + season + '季' })
  s.push({ title: '🔮 月干照命', text: '月干' + mG.name + '（' + mG.wuxing + '）对日主' + riGan.name + '为「' + wxRel + '」——' + shiShenShort(wxRel) })

  const chong = LIU_CHONG[mZ.name + riZhi.name], he = LIU_HE[mZ.name + riZhi.name]
  if (chong) s.push({ title: '⚠️ 月日相冲', text: '本月' + mZ.name + '冲日支' + riZhi.name + '，多有变动，宜稳不宜动。' })
  else if (he) s.push({ title: '🤝 月日相合', text: '本月' + mZ.name + '合日支' + riZhi.name + '，人际顺，适合合作。' })

  const seasonWx = SEASON_WX[season]
  s.push({ title: '🌿 月令旺衰', text: season + '月' + seasonWx + '旺——' + (SHENG[seasonWx] === riGan.wuxing ? '月令生您，抓住机会' : seasonWx === riGan.wuxing ? '月令同您，可以大展拳脚' : KE[seasonWx] === riGan.wuxing ? '月令克您，宜守不宜攻' : '月令平和，按部就班') + '。' })

  addSections(s, wxRel, riGan, '本月')
  return s
}

// ══════ 年运 ══════
function analyzeYear(year, bazi) {
  const s = []
  const riGan = bazi.bazi.day.gan, riZhi = bazi.bazi.day.zhi
  const yG = getYearGan(year), yZ = getYearZhi(year)
  const wxRel = getShiShen(yG.wuxing, yG.yinyang, riGan.wuxing, riGan.yinyang)

  s.push({ title: '📅 流年干支', text: '岁次' + yG.name + yZ.name + '（' + yG.wuxing + yZ.wuxing + '）│ 属相：' + yZ.name + '年' })
  s.push({ title: '🔮 年干照命', text: '年干' + yG.name + '（' + yG.wuxing + '）对日主' + riGan.name + '为「' + wxRel + '」——今年基调：' + shiShenShort(wxRel) })

  const chong = LIU_CHONG[yZ.name + riZhi.name], he = LIU_HE[yZ.name + riZhi.name]
  if (chong) s.push({ title: '⚠️ 岁日相冲', text: '流年' + yZ.name + '冲日支' + riZhi.name + '——今年变动较大，换工作/搬家之类的事可能发生。' })
  else if (he) s.push({ title: '🤝 岁日相合', text: '流年' + yZ.name + '合日支' + riZhi.name + '——今年整体顺遂，人缘好。' })

  const birthZhi = bazi.bazi.year.zhi
  const taiSui = yZ.name === birthZhi.name ? '值太岁（本命年）谨慎低调' : LIU_CHONG[yZ.name + birthZhi.name] ? '冲太岁，变动之年' : getXingTai(yZ.name, birthZhi.name)
  if (taiSui) s.push({ title: '🏮 太岁关系', text: taiSui + '，今年宜低调行事、多行善事、注意交通安全。可戴红色饰品化解。' })
  if (bazi.currentDayun) s.push({ title: '🔄 当前大运', text: '「' + bazi.currentDayun.label + '」——' + bazi.currentDayun.summary })

  // 年各方面（与日/周/月不同内容）
  const level = getLevel(wxRel)
  const riWx = riGan.wuxing
  const organMap = { '木': '肝胆', '火': '心脏心血管', '土': '脾胃消化', '金': '肺和呼吸道', '水': '肾和泌尿' }

  const yCareer = {
    '正官': { good: '今年事业有上升势头。做好规划，上半年发力效果最好。', mid: '事业平稳，不求爆发但求扎实积累。', bad: '今年职场规则多注意，低调做事不出头。' },
    '七杀': { good: '压力与机会并存的一年。敢闯就会有突破，但也要注意节奏。', mid: '压力有但扛得住。别同时搞太多事。', bad: '今年事业挑战多，守住基本盘最重要。' },
    '正印': { good: '适合充电学习的一年。拿到证书、学历对你未来帮助很大。', mid: '打好基础，为以后爆发做准备。', bad: '进展偏慢，但慢工出细活。' },
    '食神': { good: '创意和才华有空间发挥。适合做内容、设计之类的工作。', mid: '舒服的一年，不紧不慢。', bad: '容易松散，给自己定几个硬目标。' },
    '伤官': { good: '表达和创造力强。适合独立项目、自由职业。', mid: '才华有但注意别太尖锐。', bad: '今年职场口舌多，管住嘴就是自保。' },
    '正财': { good: '稳步前进，收入增长可期。适合长期规划。', mid: '平平淡淡，做好本分。', bad: '别盲目跳槽或创业。' },
    '偏财': { good: '有意外之机。副业、投资可能有惊喜，但要适可而止。', mid: '财运波动，靠正职吃饭最稳。', bad: '今年别碰高风险投资。不借钱不担保。' },
    '比肩': { good: '独立作战能力强。适合自己主导项目。', mid: '不靠别人也能成事。', bad: '别太固执，学会借力。' },
    '劫财': { good: '人脉广的一年。社交带来机会，但也要防范竞争。', mid: '注意同行竞争关系。', bad: '今年谨防职场小人，重要的事留好证据。' },
    '偏印': { good: '研究、策划能力突出的一年。想法大胆一些。', mid: '创意不错但落地需要时间。', bad: '容易想得多做得少，逼自己一把。' },
  }
  s.push({ title: '💼 年事业运', text: '今年遇「' + wxRel + '」——' + ((yCareer[wxRel] || yCareer['比肩'])[level]) })
  s.push({ title: '💰 年财运', text: level === 'good' ? '今年财运整体向好。正财稳定增长，偏财也有机会。做好规划，有余钱可以适当投资。' : level === 'bad' ? '今年财运偏紧。以守为主，控制开支、不借钱、不担保。熬过今年就是胜利。' : '今年财运平稳。正职收入稳定，别有太高预期，脚踏实地最实在。' })
  s.push({ title: '❤️ 年感情运', text: level === 'good' ? '今年感情运势不错。单身者有机会遇到正缘，秋天前后是高峰期。有伴者关系稳定升温。' : level === 'bad' ? '今年感情需要多些耐心。不要冲动做重大决定（结婚/分手），冷静一两个月再说。' : '今年感情平稳。没有大起大落，细水长流也是福。' })
  s.push({ title: '🫀 年健康运', text: '日主' + riWx + '，重点保养' + (organMap[riWx] || '身体') + '。' + (level === 'bad' ? '今年压力较大，别硬撑。建议做一次全面体检。' : '保持好作息，该体检的还是要定期去。') + ' | 宜：' + ({木:'早睡养肝',火:'午休养心',土:'规律饮食',金:'深呼吸养肺',水:'多喝水养肾'}[riWx]||'坚持运动') })
  const luckyC = {木:'绿色',火:'红色',土:'黄色',金:'白色',水:'蓝色'}
  s.push({ title: '🍀 年开运', text: '幸运色：' + (luckyC[riWx]||'金色') + ' | 幸运数：' + ({木:'3、8',火:'2、7',土:'5、0',金:'4、9',水:'1、6'}[riWx]||'') + ' | 贵人方向：' + ({木:'东',火:'南',土:'中',金:'西',水:'北'}[riWx]||'南') })

  return s
}

// ══════ 共享：日/周/月维度 ══════
function addSections(sections, ss, riGan, tw) {
  const level = getLevel(ss)
  const riWx = riGan.wuxing
  const isDay = tw === '今日'

  // 事业
  const careerDay = {
    '正官':['上午做事效率最高，重要的事尽量放上午处理。今天容易被领导注意到，表现好一点留下好印象。','节奏偏慢的一天，把手头的事做好就行，别急着揽新活。按自己的步调来，不用跟别人比。','今天工作上可能有点小坎坷，能推的事推到明天。这不是退缩，是聪明的策略。'],
    '七杀':['今天适合攻克最难的那件事，咬牙挺过去就轻松了。压力是动力，但别把自己逼太紧。','今天事多但不乱，列个优先级一个个来。注意休息别透支，明天还有明天的事。','今天压力山大，硬扛可能适得其反。适当放手一些不重要的事，先保住核心任务。'],
    '正印':['今天脑子特别清醒，适合学习新东西、请教前辈。有贵人相助的好日子，主动问、主动学。','适合整理文档、复盘、做计划的一天。不急着冲，慢一点反而想得更清楚。','今天脑子有点钝，别做大决定。先记录想法，等清醒的时候再行动。'],
    '偏印':['灵感来得快，赶紧记下来。今天适合头脑风暴和创意工作，天马行空的想法可能变成好方案。','适合想想长远规划，但不一定今天就要执行。先想清楚再动，磨刀不误砍柴工。','今天思维有点发散，别同时搞太多事。列个清单一件件来，专注一件事效率高。'],
    '比肩':['今天靠自己就行，效率会很高。独立完成任务，做完比求完美更重要。','正常节奏的一天，该干嘛干嘛。不需要别人帮忙也能搞定自己的事。','今天别太固执己见，听同事一句劝可能少走弯路。团队合作有时比自己死磕高效。'],
    '劫财':['今天适合跑外勤、见客户，人缘帮你开路。社交场合可能有意外收获，放开一点去聊。','注意和同事的竞争关系。做好自己的事就行，别被别人的节奏带跑。','今天小心职场小动作，重要文件和沟通留好书面记录。害人之心不可有，防人之心不可无。'],
    '食神':['今天心情好效率高，适合做需要耐心的细活。一边做事一边享受过程，质量比数量重要。','轻松的一天，稳扎稳打就好。不用太拼，给自己一点空间享受工作的乐趣。','今天容易分心，给自己设几个小目标，完成一个奖励自己一下。番茄钟是今天的好朋友。'],
    '伤官':['今天口才特别好，适合做汇报、展示、提方案。才华不用藏着，但注意语气别太尖锐。','今天说话收着点，别因为一时口快得罪人。表达可以，批评要婉转。','今天职场口舌多，管住嘴就是最大的自保。少参与议论、少发表看法、多看多听。'],
    '正财':['今天适合谈薪资、签合同，正事正办。钱的事今天比较顺，把该处理的事务都清了。','正常上班族的一天，稳住就行。别指望突然有好事砸头上，但也不会有坏事。','今天收益平平，别抱太大期待。该花的钱还是要花，但不该花的一定省着。'],
    '偏财':['今天可能有意外之喜——比如客户突然多下了个单，或者收到之前没想到的回款。','按部就班的一天，不要幻想暴富。意外之财看天意，强求反而容易吃亏。','今天别碰高风险的事，容易亏。稳稳当当过一天，比什么都强。'],
  }
  const careerWeek = {
    '正官':['本周事业有上升势头，上级对你的关注度提高。把握周二的汇报或述职机会，周三周四多沟通。好印象是积累出来的，不是临时表现的。','本周节奏平稳，按计划推进就好。不求突出但求扎实，稳扎稳打就是最好的策略。','本周工作上有些阻力，尤其是周二周三。遇到困难别硬顶，绕一下反而更快。实在不行也只是一周的事。'],
    '七杀':['本周将是挑战的一周，但也正是立功的好机会。全力以赴但不透支，周三是最关键的一天。扛过去你会感激自己付出的努力。','压力不小但能应对，合理安排时间别把所有事挤在一起。周中注意休息，周末好好放松。','本周压力比较大，宜守不宜攻。硬来可能适得其反，学会以柔克刚。这不是认输，是智慧。'],
    '正印':['本周适合学习进修，看书、听课、请教他人的效率特别高。有贵人运，主动请教前辈会得到帮助。学进去的东西比做出来的成果更值钱。','适合整理积累、打磨专业，为接下来的忙碌做准备。不急着出活，基础打好了后面更快。','本周进展偏慢，别急。慢就慢一点，积累比速度重要。这一周的低谷是在为下一周的高峰蓄力。'],
    '偏印':['本周灵感迸发，适合做策划、创意工作。把想到的都写下来，哪怕不完美也比空白好。突破往往来自天马行空的想法。','适合研究和规划，不必急于执行。先把思路理清楚，后面的行动才有方向。','本周容易虎头蛇尾，别开太多头。盯住一件事坚持，完成比完美更重要。'],
    '比肩':['本周独立作战能力强，适合主导项目。不靠别人也能出成绩，但该沟通还是要沟通——独立和孤立是两回事。','靠自己就够用，别人帮不帮都影响不大。但别拒绝善意的帮助，有时候省力也是一种智慧。','本周别太独，团队合作比自己蛮干高效。学会借力不是示弱，是成熟。'],
    '劫财':['本周社交活动多，人脉拓展的好时机。饭局、应酬可能带来意外收获——新的业务机会或合作伙伴。但也要擦亮眼，不是每个热情的人都是朋友。','注意和同行的竞争关系，做好自己的事别被带节奏。不跟风、不攀比，按自己的节奏走。','本周小心职场小动作，重要沟通留文字、重要文件留痕迹。防人之心不可无，但也不必疑神疑鬼。'],
    '食神':['本周心态轻松、效率高，适合做需要创造力和耐心的任务。享受工作本身就是最好的生产力。不用赶，自然就快了。','心情不错的一周，稳扎稳打就好。不用太拼，给点空间享受工作的乐趣。','本周容易松散，提醒自己别摸鱼太明显。定几个小目标，完成之后再放松会更爽。'],
    '伤官':['本周表达能力强，适合做展示、提方案。才华会被看见，但注意语气别太尖锐。锋芒可以有，但也要给人留面子。','说话收着点，别因为一时口快给自己惹麻烦。有些事情看破不说破，是高级的智慧。','本周职场容易起争执，不要卷入是非。别人吵架你别当裁判，别人的麻烦你别去凑热闹。'],
    '正财':['本周正财运好，加薪或奖金的消息可能传来。该谈的事情这周谈效果最好。认真工作的回报正在路上。','稳定的一周，做好本分就行。不求惊喜但求顺利，平平淡淡也是福气。','本周别抱太大期望，有时没消息就是好消息。先把手里的事做扎实。'],
    '偏财':['本周可能有偏财进账——兼职、副业或意外奖励。但别因为运气好就放松警惕，见好就收。财来了要懂接，更要懂守。','财运平稳不突出，别冲动消费。这周花钱之前多想一秒：这东西我真的需要吗？','本周别碰高风险投资，保守第一。保住本钱比赚快钱重要一百倍。'],
  }
  const careerMonth = {
    '正官':['本月事业处于上升通道。上级对你评价不错，把握月中旬的汇报和述职机会。好印象是持续积累的，不是一次表现就能成的。','本月节奏稳定，按部就班推进。适合夯实基础、整理流程。不求爆发但求扎实，基础好后面才稳。','本月工作上有些瓶颈，尤其是月中旬。遇到困难别硬撞，换个角度、换个方法，绕一下反而更快。'],
    '七杀':['本月将面临挑战，但挑战就是晋升的跳板。迎难而上会有意想不到的收获。但注意节奏，别同时启动太多事——一个月时间要分清楚主次。','本月压力较大但可控。合理分配精力，最重要的事放前面，次要的可以缓缓。不要把自己绷太紧。','本月谨慎决策，重大决策推迟到下个月更好。这段时间适合观察、收集信息、做准备，不宜冒进。'],
    '正印':['本月是学习月。投入时间在培训和技能提升上，回报是长期的。下个月的业绩，很大程度上取决于这个月你学了多少。','适合打磨专业、积累经验，为下半年做储备。慢一点不要紧，方向对了就行。','本月进展不快，但慢工出细活。沉住气，积累够了自然会有爆发的一天。'],
    '偏印':['本月创意力强，适合做新项目提案、内容创作。大胆想，但也要有落地计划。好的创意如果只停留在脑子里，等于零。','适合研究和策略规划，不急着行动。先想清楚方向、摸清楚情况，再出手。','本月容易三心二意，选一件事专注做会更出效果。贪多嚼不烂。'],
    '比肩':['本月独立作战能力强，适合主导项目。靠自己的力量可以完成大部分工作，但关键环节记得沟通确认。','自己来就够，不用等别人配合。但有帮手的时候也别拒绝，一个人走得快，一群人走得远。','本月别太刚，学会借力。团队比你想象的更重要，有时候一个人的盲区需要另一个人来点醒。'],
    '劫财':['本月人脉广、社交多，资源整合的好时机。但交友也要擦亮眼——热情的不一定是真朋友，冷漠的不一定是敌人。','注意同行竞争，但别因此内耗。竞争是好事，说明你的赛道有价值。专注自己，别总盯着别人。','本月谨防职场暗箭，重要的事多留个凭证。这不是多想，是职业习惯。'],
    '食神':['本月心情轻松创意好，做出来的东西质量反而高。不用逼自己太紧，松弛感本身就是创造力。工作当作享受，结果反而更好。','舒服的一个月，节奏自己掌握。不用赶，但也别太散。给自己一个柔软的时间表。','本月容易懈怠，给自己定个小目标。完成之后奖励自己，动力就有了。'],
    '伤官':['本月口才和创造力都在线，适合做展示、提方案。但注意锋芒太露容易招人烦——才华要有，但也要懂得适时收敛。','有才华但要收着点。有些话说出来之前多想一秒：有没有更好的表达方式？','本月职场口舌是非多，管住嘴就是最大的自保。少议论、少评判、多做事。'],
    '正财':['本月正财运旺，努力工作的回报正在路上。可以谈谈薪资，但这之前先把业绩做出来。先干活再谈条件，底气更足。','本月收支平衡，不用太担心但也别太期待。该来的会来，不该来的强求也没用。','本月财路不宽，控制大额支出。不是省钱的月份，但也不是浪费的月份。'],
    '偏财':['本月偏财运好，投资理财、兼职副业有不错的机会。但见好就收——赚到就赚到，别贪。财运像潮水，来的时候接住，退的时候别追。','财运平平，稳字当头。别羡慕别人突然赚到钱，每个人的财路不同，比不了。','本月别碰不熟悉的投资，管住钱包。保住本金就是最大的财运。'],
  }

  const cDay = careerDay[ss] || careerDay['比肩']
  const cWeek = careerWeek[ss] || careerWeek['比肩']
  const cMonth = careerMonth[ss] || careerMonth['比肩']
  let careerText
  if (isDay) careerText = cDay[level === 'good' ? 0 : level === 'bad' ? 2 : 1]
  else if (tw === '本周') careerText = cWeek[level === 'good' ? 0 : level === 'bad' ? 2 : 1]
  else careerText = cMonth[level === 'good' ? 0 : level === 'bad' ? 2 : 1]
  sections.push({ title: '💼 事业运', text: careerText })

  // 财运(扩展版)
  let wealth
  if (isDay) {
    if (level === 'good') wealth = '财气不错的一天，适合处理财务、报销、收款等事情。有钱进账是好事，但也别忘了记账——钱花在哪比赚了多少更重要。'
    else if (level === 'bad') wealth = '财运偏紧，别做大额支出。今天适合记账、对账、清点，但不适合花钱。省下来的每一分都是赚的。'
    else wealth = '收支平衡的一天，正常花销就好。不求发财但求不亏，平平淡淡也是好日子。'
  } else if (tw === '本周') {
    if (level === 'good') wealth = '本周财运上扬，有进账的可能。适合整理账目、追讨欠款。记好每一笔开销，到了周末看看一周的账本，做到心中有数。'
    else if (level === 'bad') wealth = '本周财运偏紧，控制非必要支出。记住三个"不"：不借钱、不担保、不冲动消费。一周很快就过去了。'
    else wealth = '本周财运平稳，有小钱进也有小钱出。重点不是控制每一笔，而是确保月底账目是正的。'
  } else {
    if (level === 'good') wealth = '本月财运整体向好。正财稳定有增长，偏财也有机会。做好收支规划，多余的钱可以适当储蓄或投资——但记住永远留足应急资金。'
    else if (level === 'bad') wealth = '本月财运偏紧，以守为主。大额支出能缓则缓。重点是控制支出而不是增加收入——这个月守住钱包就是胜利。'
    else wealth = '本月财运平稳，收支大致平衡。不求爆发但求稳健。每月稳定增长比一夜暴富更踏实可靠。'
  }
  sections.push({ title: '💰 财运', text: wealth })

  // 感情
  let love
  if (isDay) {
    love = level === 'good' ? '感情顺畅的一天，适合和对象聊聊天、约个饭。单身的话，今天适合出门，缘分可能就在不经意间。不用刻意找，顺其自然就好。' : level === 'bad' ? '今天容易有小摩擦，语气柔和一点。说话之前多想一秒，有些话说了就收不回来。真想发火的时候，先深呼吸三次。' : '平平淡淡的一天，没什么大波澜。平淡有时候也是福气——不用大喜大悲，安安静静也是种享受。'
  } else if (tw === '本周') {
    love = level === 'good' ? '本周感情运势不错。单身者周末社交有机会认识新朋友，有伴者关系升温。适合一起做些小事——一顿饭、一场电影、一次散步，比什么礼物都强。' : level === 'bad' ? '本周感情容易有摩擦，尤其是周中。管住情绪别让小事发酵。记住一句话：赢了面子输了感情，不值。' : '本周感情平稳，没有大起大落。平平淡淡有时比轰轰烈烈更长久。'
  } else {
    love = level === 'good' ? '本月感情运势向上。单身者有机会通过朋友介绍或社交活动遇到心仪对象。有伴者感情升温，适合一起规划未来——短途旅行、一起学点什么，都能加深感情。' : level === 'bad' ? '本月耐心第一。不要冲动做决定（特别是结婚、分手这种大事），冷静一段时间再看不迟。给感情一个缓冲期，也给自己的心情一点空间。' : '本月感情比较平稳，没有大的波澜。顺其自然就好，不用刻意追求浪漫。日复一日的温暖，有时候比偶尔的惊喜更珍贵。'
  }
  sections.push({ title: '❤️ 感情运', text: love })

  // 健康
  const hm = { '正官': '注意肩颈腰椎，久坐的话每隔一小时起来活动一下。', '七杀': '压力大影响睡眠和免疫力。睡前放下手机，泡个热水脚比刷手机管用。', '正印': '精神状态不错，注意饮食规律。三餐定时比吃什么更重要。', '偏印': '思虑过度伤脾胃。少操没用的心，有些事想再多也没用，不如放下。', '比肩': '体力充沛，适合运动锻炼。跑个步、打个球，出出汗浑身舒服。', '劫财': '注意肠胃和口腔卫生。吃干净、刷干净，小毛病往往是因为小疏忽。', '食神': '心情好身体就好，但注意别吃太撑。享受美食要有度，过犹不及。', '伤官': '注意咽喉呼吸道，多喝水。说话多了嗓子容易哑，备个保温杯。', '正财': '身体平稳，保持习惯就好。该吃饭吃饭、该运动运动、该睡觉睡觉。', '偏财': '精力不错但容易熬夜。一时爽快换来第二天昏沉，不值。' }
  const organMap = { '木': '肝胆', '火': '心脏心血管', '土': '脾胃消化', '金': '肺和呼吸道', '水': '肾和泌尿' }
  sections.push({ title: '🫀 健康运', text: '日主' + riWx + '，重点留意' + (organMap[riWx] || '身体') + '。' + (hm[ss] || '正常作息，不要太拼。') })

  // 人际
  let social
  if (isDay) {
    social = level === 'good' ? '人缘好的一天，适合约饭、见朋友。有件事想找人帮忙的话，今天开口成功率最高。' : level === 'bad' ? '今天少说多听，别掺和别人的是非。有些热闹不是你的圈子就别去凑，保持距离反而更安全。' : '人际关系正常的一天，和平时差不多。不用刻意讨好谁，也不用特意回避谁。'
  } else if (tw === '本周') {
    social = level === 'good' ? '本周社交运旺，适合拜访客户、拓展人脉。主动联系很久没见的人——不是为了功利，是为了维系关系。人与人之间，很多时候就差一句问候。' : level === 'bad' ? '本周低调行事。少参与议论、少当裁判、少评判他人。有些是非不沾身就是最好的处理。' : '本周人际关系正常。该来往的来往，不该来往的别勉强。社交是一种选择，不是义务。'
  } else {
    social = level === 'good' ? '本月人缘不错，适合团队合作、拓展社交圈。遇到贵人帮你的可能性大。但贵人不是等来的——主动交流、主动分享、主动帮忙，贵人才会出现。' : level === 'bad' ? '本月低调做人，不卷入是非，保持距离感。守住自己的边界，不侵犯别人的边界。人际关系有时候越简单越好。' : '本月正常社交就好。不用刻意讨好谁，也不用刻意回避谁。做好自己，自然有人愿意靠近你。'
  }
  sections.push({ title: '🤝 人际运', text: social })

  // 综合建议
  let overallTip = ''
  if (isDay) {
    overallTip = level === 'good' ? '今天整体状态不错，适合做一些拖延已久的事。早上精力最充沛，重要的事放上午做。保持好心情，今天会是高效的一天。' : level === 'bad' ? '今天能量偏低，别太勉强自己。能推的事就推一推，推不掉的就降低预期。今天的目标不是完美，是过得去就行。' : '今天节奏正常，不急不躁过一天。不用给自己太大压力，有些事做得快不如做得对。'
  } else if (tw === '本周') {
    overallTip = level === 'good' ? '本周整体向好，适合推进重要项目。把握周三周四，这两天效率最高。周末给自己一个放松的时间，做好一周的收尾。' : level === 'bad' ? '本周宜保守，重大决策等下周。多给自己一点缓冲空间，别把日程排太满。有时候慢就是快。' : '本周节奏平稳，顺其自然就好。不用刻意追求什么，也不用刻意回避什么。该来的会来，该走的会走。'
  } else {
    overallTip = level === 'good' ? '本月运势整体向上，是推进大计划的好时机。月初多做规划，月尾验收成果。中间的波折不要紧，方向是对的就不怕路远。' : level === 'bad' ? '本月宜守不宜攻。重要的决策可以缓一缓。低谷不可怕，就当是蓄力期。冬天不就是在积蓄春天的能量吗？' : '本月运程平稳，按自己的节奏走。不贪快不焦虑，稳稳当当就是最好的状态。一个月不长不短，够做很多事，也够放自己一马。'
  }
  sections.push({ title: '📋 综合建议', text: overallTip })

  // 注意事项
  let caution = ''
  caution = (isDay ? '今日' : tw === '本周' ? '本周' : '本月') + '注意：'
  if (level === 'bad') caution += '避免冲动消费、避免与人争执、避免做重要决策。多休息，少折腾。记住：忍一时风平浪静，退一步海阔天空。'
  else caution += '避免熬夜和暴饮暴食；保持规律作息；多喝水少喝咖啡奶茶；心态平和最重要。好习惯是一点一点养成的，坏习惯也是一点一点惯出来的。'
  sections.push({ title: '⚠️ 注意事项', text: caution })

  // 开运
  const sWx = SHENG[riWx] || '木'
  sections.push({ title: '🍀 开运建议', text: '幸运色：' + ({木:'绿色',火:'红色',土:'黄色',金:'白色',水:'蓝色'}[sWx]||'绿色') + ' | 幸运方向：' + ({木:'东',火:'南',土:'中',金:'西',水:'北'}[sWx]||'东') + ' | 宜：平和心态 | 忌：冲动熬夜。' })
}

// ══════ 辅助函数 ══════
function getLevel(ss) { return ['正官', '正印', '正财', '食神'].includes(ss) ? 'good' : ['七杀', '伤官', '劫财', '偏印'].includes(ss) ? 'bad' : 'mid' }

function shiShenShort(ss) {
  const m = { '比肩': '自我意识强，适合独立做事', '劫财': '社交活跃注意开支', '正印': '学习运好有贵人', '偏印': '思维活跃灵感多', '食神': '心情愉快适合创作', '伤官': '表达欲强注意言行', '正财': '财运稳定', '偏财': '偏财机会注意分寸', '正官': '事业运好有上升', '七杀': '压力中有突破机会' }
  return m[ss] || '运势平稳'
}

function getShiShen(aWx, aYy, bWx, bYy) {
  if (aWx === bWx) return aYy === bYy ? '比肩' : '劫财'
  if (SHENG[aWx] === bWx) return aYy === bYy ? '正印' : '偏印'
  if (SHENG[bWx] === aWx) return aYy === bYy ? '食神' : '伤官'
  if (KE[aWx] === bWx) return aYy === bYy ? '正官' : '七杀'
  return aYy === bYy ? '正财' : '偏财'
}

function getXingTai(yZ, bZ) {
  const xing = { '寅巳': '刑太岁', '巳寅': '刑太岁', '丑戌': '刑太岁', '戌丑': '刑太岁', '子卯': '刑太岁', '卯子': '刑太岁', '辰辰': '自刑', '午午': '自刑', '酉酉': '自刑', '亥亥': '自刑' }
  const hai = { '寅巳': '害太岁', '巳寅': '害太岁', '卯辰': '害太岁', '辰卯': '害太岁', '丑午': '害太岁', '午丑': '害太岁', '未子': '害太岁', '子未': '害太岁', '申亥': '害太岁', '亥申': '害太岁', '酉戌': '害太岁', '戌酉': '害太岁' }
  return xing[bZ + yZ] || hai[bZ + yZ] || null
}

function getYearGan(y) { const s = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'], w = ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水']; const i = (y - 4) % 10; return { name: s[i], wuxing: w[i], yinyang: i % 2 ? '阴' : '阳' } }
function getYearZhi(y) { const b = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'], w = ['水', '土', '木', '木', '土', '火', '火', '土', '金', '金', '土', '水']; const i = (y - 4) % 12; return { name: b[i], wuxing: w[i] } }
function getMonthGan(y, m) { const s = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'], w = ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水']; const base = [2, 4, 6, 8, 0][Math.floor(((y - 4) % 10) / 2)]; const i = (base + m - 1) % 10; return { name: s[i], wuxing: w[i], yinyang: i % 2 ? '阴' : '阳' } }
function getMonthZhi(m) { const b = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'], w = ['木', '木', '土', '火', '火', '土', '金', '金', '土', '水', '水', '土']; return { name: b[(m - 1) % 12], wuxing: w[(m - 1) % 12] } }
function getWeekNum({ year, month, day }) { const d = new Date(year, month - 1, day), s = new Date(year, 0, 1); return Math.ceil(((d - s) / 86400000 + s.getDay() + 1) / 7) }

// 八卦简要类象
function guaXiang(name) {
  const m = {
    '乾': '天·刚健·权威', '坤': '地·柔顺·包容', '震': '雷·震动·变革', '巽': '风·渗透·顺从',
    '坎': '水·险陷·智慧', '离': '火·光明·文采', '艮': '山·停止·稳重', '兑': '泽·喜悦·口舌'
  }
  return m[name] || name
}
