/**
 * 十天干数据
 */
export const TIAN_GAN = [
  { name: '甲', wuxing: '木', yinyang: '阳', idx: 0 },
  { name: '乙', wuxing: '木', yinyang: '阴', idx: 1 },
  { name: '丙', wuxing: '火', yinyang: '阳', idx: 2 },
  { name: '丁', wuxing: '火', yinyang: '阴', idx: 3 },
  { name: '戊', wuxing: '土', yinyang: '阳', idx: 4 },
  { name: '己', wuxing: '土', yinyang: '阴', idx: 5 },
  { name: '庚', wuxing: '金', yinyang: '阳', idx: 6 },
  { name: '辛', wuxing: '金', yinyang: '阴', idx: 7 },
  { name: '壬', wuxing: '水', yinyang: '阳', idx: 8 },
  { name: '癸', wuxing: '水', yinyang: '阴', idx: 9 },
]

export const getTianGan = (idx) => TIAN_GAN[((idx % 10) + 10) % 10]
