/**
 * 十二地支数据
 */
export const DI_ZHI = [
  { name: '子', wuxing: '水', yinyang: '阳', shengxiao: '鼠', shiChen: ['23:00', '00:59'], idx: 0 },
  { name: '丑', wuxing: '土', yinyang: '阴', shengxiao: '牛', shiChen: ['01:00', '02:59'], idx: 1 },
  { name: '寅', wuxing: '木', yinyang: '阳', shengxiao: '虎', shiChen: ['03:00', '04:59'], idx: 2 },
  { name: '卯', wuxing: '木', yinyang: '阴', shengxiao: '兔', shiChen: ['05:00', '06:59'], idx: 3 },
  { name: '辰', wuxing: '土', yinyang: '阳', shengxiao: '龙', shiChen: ['07:00', '08:59'], idx: 4 },
  { name: '巳', wuxing: '火', yinyang: '阴', shengxiao: '蛇', shiChen: ['09:00', '10:59'], idx: 5 },
  { name: '午', wuxing: '火', yinyang: '阳', shengxiao: '马', shiChen: ['11:00', '12:59'], idx: 6 },
  { name: '未', wuxing: '土', yinyang: '阴', shengxiao: '羊', shiChen: ['13:00', '14:59'], idx: 7 },
  { name: '申', wuxing: '金', yinyang: '阳', shengxiao: '猴', shiChen: ['15:00', '16:59'], idx: 8 },
  { name: '酉', wuxing: '金', yinyang: '阴', shengxiao: '鸡', shiChen: ['17:00', '18:59'], idx: 9 },
  { name: '戌', wuxing: '土', yinyang: '阳', shengxiao: '狗', shiChen: ['19:00', '20:59'], idx: 10 },
  { name: '亥', wuxing: '水', yinyang: '阴', shengxiao: '猪', shiChen: ['21:00', '22:59'], idx: 11 },
]

export const getDiZhi = (idx) => DI_ZHI[((idx % 12) + 12) % 12]

/**
 * 根据小时数获取地支索引
 */
export function hourToDiZhi(hour) {
  for (let i = 0; i < DI_ZHI.length; i++) {
    const [start, end] = DI_ZHI[i].shiChen
    const s = parseInt(start.split(':')[0])
    const e = parseInt(end.split(':')[0])
    // 子时特殊处理（跨日）
    if (i === 0) {
      if (hour >= 23 || hour < 1) return 0
    } else {
      if (hour >= s && hour <= e) return i
    }
  }
  return 0
}
