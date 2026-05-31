# 实施计划：新增方位/物象起卦 + UI 优化

## Task 1: 方位起卦算法
**文件:** `src/utils/iching.js`
**内容:** 新增 `castByDirection(direction)` 函数
- 方向→卦映射表（北坎、东北艮、东震、东南巽、南离、西南坤、西兑、西北乾）
- 上卦 = 方向卦，下卦 = (月+日) mod 8，动爻 = (方向数字+月+日) mod 6
- 返回完整的 buildDivinationResult

## Task 2: 物象起卦算法
**文件:** `src/utils/iching.js`
**内容:** 新增 `castByObject(categoryIndex, objectIndex)` 函数
- 物象分类表（天象、地象、动物、植物、器物）
- 每个类别下属物体的卦映射
- 上卦 = 物体卦，下卦 = (objectIndex+1) mod 8，动爻 = (categoryIndex+objectIndex+2) mod 6

## Task 3: 方向 + 物象文化含义解读
**文件:** `src/utils/iching.js` — generateInterpretation
**内容:** 在专业分析详情中，根据 `result.methodData` 中的方向/物象信息，追加文化含义解读

## Task 4: 起卦方式选择器改版（水平滑动滚轮）
**文件:** `src/views/DivinationView.vue`
**内容:** 
- 5种方式改为水平滑动滚轮样式
- 每个方式显示图标+名称+一句话说明
- 选中方式居中放大高亮
- 参数区域在下方条件展开

## Task 5: 方位选择器交互
**文件:** `src/views/DivinationView.vue`
**内容:** 
- 选中"方位起卦"时下方展开8方向网格
- 每个方向显示方向名+卦名+图标

## Task 6: 物象选择器交互
**文件:** `src/views/DivinationView.vue`
**内容:**
- 选中"物象起卦"时展开两级选择
- 第一级：类别按钮
- 第二级：物体列表

## Task 7: 更新 castDivination + 构建验证
**文件:** `src/views/DivinationView.vue`
**内容:**
- 在 castDivination 中处理 method === 'direction' 和 method === 'object'
- 引入新函数，传入对应参数
- 构建验证
