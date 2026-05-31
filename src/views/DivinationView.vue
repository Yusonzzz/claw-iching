<template>
  <div class="page">
    <h2 style="font-size: 22px; color: var(--label-primary); margin-bottom: 20px; font-weight: 720; letter-spacing: -0.03em;">🔮 起卦问事</h2>

    <!-- 命主信息（档案/即输） -->
    <QuickBirthInput ref="birthInputRef" @submit="onBirthSubmit" />

    <!-- 问题输入 -->
    <div class="card">
      <div class="card-title">❓ 您想问什么</div>
      <input v-model="question" class="ios-input" placeholder="输入您想问的问题（可选）" />
      <div class="text-xs mt-8" style="color: var(--label-tertiary);">
        可以空着，只起卦看当前运势
      </div>
      <div class="suggested-questions">
      <div class="sq-title">
        不知道问什么？点此快速选择👇
        <button class="sq-shuffle" @click="shuffleQuestions">换一批 🔄</button>
      </div>
      <div class="sq-grid">
        <button v-for="(sq, idx) in displayQuestions" :key="sq.text + idx"
          class="sq-btn"
          @click="question = sq.text"
        >
          <span class="sq-icon">{{ sq.icon }}</span>
          <span class="sq-text">{{ sq.text }}</span>
        </button>
      </div>
      </div>
    </div>

    <!-- 起卦方式 -->
    <div class="card">
      <div class="card-title">⚙️ 选择起卦方式</div>
      <div class="segmented">
        <button :class="['segmented-item', { active: method === 'time' }]" @click="selectMethod('time')">⏰ 时间</button>
        <button :class="['segmented-item', { active: method === 'number' }]" @click="selectMethod('number')">🔢 数字</button>
        <button :class="['segmented-item', { active: method === 'coins' }]" @click="selectMethod('coins')">🪙 六爻</button>
        <button :class="['segmented-item', { active: method === 'direction' }]" @click="selectMethod('direction')">🧭 方位</button>
        <button :class="['segmented-item', { active: method === 'object' }]" @click="selectMethod('object')">🌿 物象</button>
      </div>

      <!-- 数字起卦参数 -->
      <Transition name="slide-fade">
        <div v-if="method === 'number'" class="mt-12">
          <div class="input-group">
            <div class="input-label">请输入3个数字（随意想3个数）</div>
            <div style="display: flex; gap: 8px;">
              <input v-model.number="num1" class="ios-input" type="number" placeholder="数字1" />
              <input v-model.number="num2" class="ios-input" type="number" placeholder="数字2" />
              <input v-model.number="num3" class="ios-input" type="number" placeholder="数字3" />
            </div>
          </div>
        </div>
      </Transition>

      <!-- 方位起卦参数 -->
      <Transition name="slide-fade">
        <div v-if="method === 'direction'" class="mt-12">
          <div class="input-label">请选择您面朝的方向：</div>
          <div class="direction-grid">
            <button v-for="d in directions" :key="d.id"
              :class="['dir-btn', { active: selectedDirection === d.id }]"
              @click="selectedDirection = d.id"
            >
              <span class="dir-arrow">{{ d.arrow }}</span>
              <span class="dir-name">{{ d.label }}</span>
              <span class="dir-gua">{{ d.gua }}卦</span>
            </button>
          </div>
        </div>
      </Transition>

      <!-- 物象起卦参数 -->
      <Transition name="slide-fade">
        <div v-if="method === 'object'" class="mt-12">
          <div v-if="!selectedObjCategory" class="input-label">请选择物体类别：</div>
          <div v-if="!selectedObjCategory" class="obj-cat-grid">
            <button v-for="(cat, ci) in objectData" :key="ci"
              class="obj-cat-btn"
              @click="selectedObjCategory = ci"
            >
              <span class="obj-cat-icon">{{ cat.icon }}</span>
              <span class="obj-cat-name">{{ cat.category }}</span>
            </button>
          </div>
          <div v-if="selectedObjCategory !== null">
            <div class="obj-header">
              <button class="obj-back-btn" @click="selectedObjCategory = null; selectedObjIndex = null">‹ 返回</button>
              <span class="obj-header-title">{{ objectData[selectedObjCategory]?.icon }} {{ objectData[selectedObjCategory]?.category }}</span>
            </div>
            <div class="obj-grid">
              <button v-for="(obj, oi) in objectData[selectedObjCategory]?.objects" :key="oi"
                :class="['obj-btn', { active: selectedObjIndex === oi }]"
                @click="selectedObjIndex = oi"
              >
                {{ obj.name }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- 起卦按钮（固定在起卦方式下面） -->
    <button @click="castDivination" class="ios-btn ios-btn-primary" :disabled="loading" style="margin: 4px 0 12px;">
      <span v-if="loading" class="loading-spinner"></span>
      {{ loading ? '卦象生成中...' : '🙏 起卦' }}
    </button>

    <!-- 加载动画 -->
    <Transition name="fade">
      <div v-if="showLoadingAnimation" class="loading-overlay">
        <div class="loading-card">
          <div class="loading-taiji">☯</div>
          <div class="loading-text">卦象生成中...</div>
          <div class="loading-bar">
            <div class="loading-bar-fill"></div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 占卜结果（带淡入动画） -->
    <Transition name="fade-up">
      <div v-if="result" class="mt-16" key="divination-result">
        <HexagramDisplay 
          :hexagram="result" 
          title="起卦结果"
          :showDetail="true"
          :interpretation="interpretation"
        />

        <div class="btn-group mt-12">
          <button @click="copyResult" class="btn btn-outline btn-sm">📋 复制结果</button>
          <button @click="resetDivination" class="btn btn-outline btn-sm">🔄 重新起卦</button>
        </div>
      </div>
    </Transition>
    <!-- 弹窗提示 -->
    <Transition name="modal-fade">
      <div v-if="toastVisible" class="toast-modal" @click="toastVisible = false">
        <div class="toast-dialog" @click.stop>
          <div class="toast-icon">⚠️</div>
          <div class="toast-msg">{{ toastMsg }}</div>
          <button class="toast-ok" @click="toastVisible = false">知道了</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { castByNumbers, castByTime, castByCoins, castByDirection, castByObject, generateInterpretation } from '../utils/iching.js'
import { analyzeBazi } from '../utils/bazi.js'
import HexagramDisplay from '../components/HexagramDisplay.vue'
import QuickBirthInput from '../components/QuickBirthInput.vue'

const birthInputRef = ref(null)
const question = ref('')
const method = ref('time')
const num1 = ref(3)
const num2 = ref(8)
const num3 = ref(6)
const loading = ref(false)
const showLoadingAnimation = ref(false)
const result = ref(null)
const interpretation = ref('')
const lastBazi = ref(null)

// 方位起卦
const selectedDirection = ref('n')
const directions = [
  { id: 'n', label: '北', gua: '坎', arrow: '⬆️' },
  { id: 'ne', label: '东北', gua: '艮', arrow: '↗️' },
  { id: 'e', label: '东', gua: '震', arrow: '➡️' },
  { id: 'se', label: '东南', gua: '巽', arrow: '↘️' },
  { id: 's', label: '南', gua: '离', arrow: '⬇️' },
  { id: 'sw', label: '西南', gua: '坤', arrow: '↙️' },
  { id: 'w', label: '西', gua: '兑', arrow: '⬅️' },
  { id: 'nw', label: '西北', gua: '乾', arrow: '↖️' },
]

// 物象起卦
const selectedObjCategory = ref(null)
const selectedObjIndex = ref(null)
const objectData = [
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

// 是否显示起卦按钮（档案模式下显示，即时模式下用测算按钮代替）
const showCastButton = computed(() => {
  return !birthInputRef.value || birthInputRef.value.mode === 'profile'
})

const suggestedQuestions = [
  // 感情类
  { icon: '💕', text: '今年感情运怎么样' },
  { icon: '❤️', text: '和TA的感情走向' },
  { icon: '💔', text: '分手后还能复合吗' },
  { icon: '💑', text: '什么时候能遇到正缘' },
  { icon: '💍', text: '今年能脱单吗' },
  { icon: '👫', text: '我们两个合适吗' },
  { icon: '😤', text: '最近和伴侣总吵架' },
  { icon: '💌', text: '对方对我是什么感觉' },
  { icon: '🏠', text: '这段婚姻该不该继续' },
  { icon: '💘', text: '暗恋的人对我有没有好感' },
  // 事业类
  { icon: '💼', text: '今年事业运怎么样' },
  { icon: '🔄', text: '要不要跳槽换工作' },
  { icon: '📈', text: '什么时候能升职加薪' },
  { icon: '🤝', text: '面试能不能通过' },
  { icon: '👥', text: '和同事的关系如何' },
  { icon: '👔', text: '创业时机成熟吗' },
  { icon: '💡', text: '现在这个项目能成吗' },
  { icon: '🔥', text: '领导对我是什么看法' },
  { icon: '🤞', text: '年底能拿到年终奖吗' },
  { icon: '🎯', text: '该不该接受这个新机会' },
  // 财运类
  { icon: '💰', text: '近期的财运如何' },
  { icon: '📊', text: '这笔投资能赚钱吗' },
  { icon: '🏦', text: '股票基金走势如何' },
  { icon: '💸', text: '最近为什么总破财' },
  { icon: '🎲', text: '要不要试试彩票' },
  { icon: '🏠', text: '现在买房合适吗' },
  { icon: '💳', text: '债务什么时候能还清' },
  { icon: '🛒', text: '最近适合大额消费吗' },
  // 健康类
  { icon: '🏥', text: '身体健康如何' },
  { icon: '😷', text: '最近的小病什么时候好' },
  { icon: '💊', text: '要不要去做个全面体检' },
  { icon: '🧠', text: '最近总是失眠怎么办' },
  { icon: '😫', text: '总是觉得疲惫乏力' },
  // 学业类
  { icon: '📚', text: '学业考试运如何' },
  { icon: '📝', text: '这次考试能不能过' },
  { icon: '🎓', text: '考研能上岸吗' },
  { icon: '🏫', text: '选哪个学校比较好' },
  { icon: '✏️', text: '留学申请能成功吗' },
  // 人际关系
  { icon: '🤝', text: '这个月有没有小人' },
  { icon: '👥', text: '身边谁是真心朋友' },
  { icon: '🗣️', text: '最近的口舌是非多吗' },
  { icon: '👪', text: '和家人关系如何' },
  { icon: '🤗', text: '该不该信任这个人' },
  // 出行类
  { icon: '🚗', text: '最近出行是否顺利' },
  { icon: '✈️', text: '这次旅行运怎么样' },
  { icon: '🏠', text: '搬家换城市好吗' },
  // 家宅类
  { icon: '🏠', text: '家宅风水如何' },
  { icon: '🔮', text: '家里有没有不干净的东西' },
  { icon: '🛋️', text: '装修有哪些需要注意' },
  // 官司类
  { icon: '⚖️', text: '当前的官司纠纷' },
  { icon: '📋', text: '这个合同能签吗' },
  // 失物类
  { icon: '🔍', text: '失物能否找回' },
  { icon: '🐱', text: '走丢的宠物能回来吗' },
  // 综合类
  { icon: '🔮', text: '最近的整体运势如何' },
  { icon: '✨', text: '最近有没有好运气' },
  { icon: '🎂', text: '本命年要注意什么' },
  { icon: '😰', text: '最近总是做噩梦' },
  { icon: '❓', text: '最近总觉得心神不宁' },
  // 2026热点话题
  { icon: '🤖', text: 'AI会取代我的工作吗' },
  { icon: '🎂', text: '35岁之后该怎么办' },
  { icon: '😮‍💨', text: '越来越焦虑怎么办' },
  { icon: '🏠', text: '现在到底该不该买房' },
  { icon: '🧓', text: '父母的养老怎么安排' },
  { icon: '🛌', text: '好累，要不要躺平' },
  { icon: '📱', text: '想做自媒体能火吗' },
  { icon: '🏃', text: '想裸辞休息一段时间' },
  { icon: '💻', text: '该不该学点AI技能' },
  // 2026 更多热点
  { icon: '🏡', text: '回老家发展还是留在大城市' },
  { icon: '👶', text: '今年要孩子合适吗' },
  { icon: '💔', text: '好朋友和我疏远了怎么办' },
  { icon: '🙇', text: '要不要向老板提加薪' },
  { icon: '🏢', text: '公司会不会裁员' },
  { icon: '📉', text: '经济下行该怎么应对' },
  { icon: '🧘', text: '怎么才能不那么内耗' },
  { icon: '💪', text: '想减肥健身能坚持吗' },
  { icon: '☕', text: '要不要转行换个方向' },
  { icon: '💬', text: '想和某人和解该不该' },
  { icon: '🎁', text: '今年生日会有什么惊喜' },
  { icon: '🎮', text: '该不该戒掉打游戏' },
  // 扩展感情
  { icon: '🌹', text: '相亲对象靠谱吗' },
  { icon: '👀', text: 'TA是不是在外面有人了' },
  { icon: '💭', text: '前任为什么突然联系我' },
  { icon: '🤔', text: '感觉对方最近冷淡了' },
  { icon: '👨‍👩‍👧', text: '婆媳关系怎么处理' },
  { icon: '📅', text: '什么时候结婚比较好' },
  { icon: '💕', text: '这段异地恋能走下去吗' },
  { icon: '🥀', text: '感情平淡了还能挽回吗' },
  // 扩展事业
  { icon: '🎤', text: '要不要去竞聘主管' },
  { icon: '🤝', text: '合伙人适不适合长期合作' },
  { icon: '🌐', text: '外贸业务能不能做起来' },
  { icon: '📦', text: '开网店能赚钱吗' },
  { icon: '🏗️', text: '这个工程能不能顺利完工' },
  { icon: '🎯', text: '年底能不能完成KPI' },
  { icon: '🚀', text: '创业资金不够怎么办' },
  // 扩展财运
  { icon: '🏦', text: '银行存款会贬值吗' },
  { icon: '💎', text: '买黄金保值靠谱吗' },
  { icon: '🤯', text: '被骗了钱还能追回来吗' },
  { icon: '📝', text: '借钱给朋友会不会打水漂' },
  { icon: '🎉', text: '今年有没有意外之财' },
  { icon: '🏘️', text: '房子该卖还是该留' },
  // 扩展健康
  { icon: '🦷', text: '牙疼要不要去医院看' },
  { icon: '🏃', text: '运动受伤什么时候恢复' },
  { icon: '😴', text: '怎么改善睡眠质量' },
  { icon: '💉', text: '这个手术风险大不大' },
  // 扩展学业
  { icon: '🤔', text: '该不该考研还是直接工作' },
  { icon: '🌍', text: '出国留学选哪个国家' },
  { icon: '📖', text: '考公能上岸吗' },
  { icon: '💯', text: '这次面试能不能过' },
  // 出行 / 出行安全
  { icon: '🚌', text: '通勤路上有没有安全隐患' },
  { icon: '🏕️', text: '户外露营装备够不够' },
  { icon: '🚄', text: '去远方打工值得吗' },
  // 家宅延伸
  { icon: '🧹', text: '家里要不要大扫除净化' },
  { icon: '🕯️', text: '祖坟风水要不要看看' },
  { icon: '🏚️', text: '老家的房子该不该翻修' },
  // 人际关系延伸
  { icon: '🎭', text: '社交圈子里有没有两面人' },
  { icon: '🗣️', text: '有人在背后议论我吗' },
  { icon: '🤐', text: '邻居矛盾该怎么处理' },
  // 官司延伸
  { icon: '📄', text: '这个协议有没有坑' },
  { icon: '🔐', text: '要不要请律师打官司' },
  // 综合运势延伸
  { icon: '🌙', text: '最近运势太背怎么化解' },
  { icon: '🎐', text: '幸运色幸运方向是什么' },
  { icon: '📿', text: '戴什么开运饰品合适' },
  { icon: '🌟', text: '最近有没有转运迹象' },
  { icon: '🙏', text: '要不要去庙里拜拜' },
  // 宠物类
  { icon: '🐶', text: '要不要再养一只宠物' },
  { icon: '🐱', text: '家里的猫最近情绪不对' },
  // 极致脑洞
  { icon: '🌌', text: '外星人什么时候来地球' },
  { icon: '🧩', text: '人生的意义到底是什么' },
  { icon: '👶', text: '到底要不要生孩子' },
  { icon: '💍', text: '不想结婚行不行' },
  { icon: '🧘', text: '总是精神内耗怎么办' },
]

// 随机取6个
function shuffleArray(arr) {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

const displayQuestions = ref([])

function shuffleQuestions() {
  displayQuestions.value = shuffleArray(suggestedQuestions).slice(0, 4)
}
shuffleQuestions()

function selectMethod(m) {
  method.value = m
  // 切到物象时重置
  if (m !== 'object') { selectedObjCategory.value = null; selectedObjIndex.value = null }
}

// Toast 提示（中间弹窗，不自动消失）
const toastMsg = ref('')
const toastVisible = ref(false)
function showToast(msg) {
  toastMsg.value = msg
  toastVisible.value = true
}

// 即时输入提交后自动起卦
function onBirthSubmit(birthData) {
  castDivination()
}

function castDivination() {
  loading.value = true
  result.value = null
  interpretation.value = ''
  showLoadingAnimation.value = true

  // 模拟一段延时让用户看到加载动画
  setTimeout(() => {
    try {
      let divResult = null
      let baziContext = null

      // 从 QuickBirthInput 获取命主数据
      const birthData = birthInputRef.value?.getBirthData()
      if (birthData) {
        const city = birthData.cityName ? { name: birthData.cityName, lng: birthData.lng } : null
        baziContext = analyzeBazi(
          birthData.birthYear, birthData.birthMonth, birthData.birthDay,
          birthData.birthHour || 12, birthData.birthMinute || 0, city
        )
        lastBazi.value = baziContext
      }

      const now = new Date()
      if (method.value === 'time') {
        divResult = castByTime(
          now.getFullYear(), now.getMonth() + 1, now.getDate(), now.getHours()
        )
      } else if (method.value === 'number') {
        divResult = castByNumbers(num1.value || 1, num2.value || 2, num3.value || 3)
      } else if (method.value === 'coins') {
        divResult = castByCoins()
      } else if (method.value === 'direction') {
        divResult = castByDirection(selectedDirection.value)
      } else if (method.value === 'object') {
        if (selectedObjCategory.value === null || selectedObjIndex.value === null) {
          showToast('请先选择物体类别和具体物品，再起卦。')
          showLoadingAnimation.value = false
          loading.value = false
          return
        }
        divResult = castByObject(selectedObjCategory.value, selectedObjIndex.value)
      }

      if (divResult) {
        result.value = divResult
        interpretation.value = generateInterpretation(divResult, question.value, baziContext, birthData?.name)
      } else {
        interpretation.value = '起卦失败，请重试。'
      }
    } catch (e) {
      interpretation.value = '起卦出错：' + e.message
    }

    showLoadingAnimation.value = false
    loading.value = false
  }, 600)
}

function resetDivination() {
  result.value = null
  interpretation.value = ''
  question.value = ''
}

function copyResult() {
  const text = `【易经占卜结果】
起卦方式：${result.value?.method}
本卦：${result.value?.original?.name}卦
${interpretation.value ? '\n' + interpretation.value : ''}`
  navigator.clipboard.writeText(text).then(() => {
    alert('结果已复制到剪贴板')
  }).catch(() => {
    alert('复制失败，请手动复制')
  })
}
</script>

<style scoped>
/* 起卦方式按钮网格 */
.method-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
}
.method-grid > .method-btn:nth-child(4) {
  grid-column: 1 / 2;
}
.method-grid > .method-btn:nth-child(5) {
  grid-column: 2 / 3;
}
.method-grid::after {
  content: '';
  grid-column: 3 / 4;
}

.method-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  border-radius: var(--radius-md);
  border: 1px solid var(--separator);
  background: var(--bg-quaternary);
  color: var(--label-secondary);
  cursor: pointer;
  transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.method-btn:active {
  transform: scale(0.95);
}

.method-btn.active {
  border-color: var(--gold);
  background: rgba(212,168,75,0.12);
  color: var(--gold);
}

.method-icon {
  font-size: 22px;
  line-height: 1;
}

.method-label {
  font-size: 12px;
  font-weight: 500;
}
.method-desc {
  font-size: 10px;
  color: var(--label-quaternary);
  margin-top: 1px;
}

/* 输入标签 */
.input-label {
  font-size: 13px;
  color: var(--label-secondary);
  margin-bottom: 8px;
}

/* 方位选择 */
.direction-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}
.dir-btn {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 12px 4px; border-radius: var(--radius-md);
  border: none; background: var(--bg-tertiary);
  color: var(--label-secondary); cursor: pointer;
  transition: all .25s var(--spring);
  font-family: -apple-system, sans-serif;
}
.dir-btn:active { opacity: .6; transform: scale(.96); }
.dir-btn.active { background: rgba(232,168,32,.12); color: var(--gold); font-weight: 600; }
.dir-arrow { font-size: 20px; }
.dir-name { font-size: 12px; font-weight: 600; }
.dir-gua { font-size: 10px; opacity: 0.7; }

/* 物象选择 */
.obj-cat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.obj-cat-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  border: 0.5px solid var(--separator);
  background: var(--bg-quaternary);
  color: var(--label-primary);
  cursor: pointer;
  font-size: 13px;
  transition: all 0.15s;
  -webkit-tap-highlight-color: transparent;
}
.obj-cat-btn:active { background: rgba(212,168,75,0.1); }
.obj-cat-icon { font-size: 20px; }
.obj-cat-name { font-weight: 500; }

.obj-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.obj-back-btn {
  padding: 4px 10px;
  border-radius: var(--radius-xs);
  border: 0.5px solid var(--separator);
  background: transparent;
  color: var(--gold);
  font-size: 12px;
  cursor: pointer;
}
.obj-header-title { font-size: 14px; font-weight: 600; }

.obj-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 6px;
}
.obj-btn {
  padding: 8px 6px;
  border-radius: var(--radius-sm);
  border: 0.5px solid var(--separator);
  background: var(--bg-quaternary);
  color: var(--label-primary);
  font-size: 12px;
  cursor: pointer;
  text-align: center;
  transition: all 0.15s;
}
.obj-btn:active { transform: scale(0.93); }
.obj-btn.active {
  border-color: var(--gold);
  background: rgba(212,168,75,0.12);
  color: var(--gold);
}

/* 建议问题区域 */
.suggested-questions {
  margin-top: 14px;
  padding-top: 14px;
  border-top: .5px solid var(--separator);
}
.sq-title {
  font-size: 12px;
  color: var(--label-tertiary);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.sq-shuffle {
  font-size: 12px; font-weight: 500;
  padding: 5px 12px;
  border-radius: var(--radius-xs);
  border: .5px solid rgba(212,160,23,.25);
  background: rgba(212,160,23,.06);
  color: var(--gold);
  cursor: pointer;
}
.sq-shuffle:active { background: rgba(212,160,23,.14); }
.sq-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.sq-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 9px 12px; border-radius: var(--radius-sm);
  border: none;
  background: var(--bg-tertiary);
  color: var(--label-primary); font-size: 13px; font-weight: 450;
  cursor: pointer; transition: all .2s;
  text-align: left; line-height: 1.3;
  overflow: hidden;
}
.sq-btn:active { background: rgba(212,160,23,.1); }
.sq-icon { font-size: 14px; flex-shrink: 0; line-height: 1; }
.sq-text {
  line-height: 1.3;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* 加载动画 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  pointer-events: none;
}

.loading-card {
  text-align: center;
  padding: 32px;
}

.loading-taiji {
  font-size: 64px;
  animation: taijiSpin 2s cubic-bezier(0.45,0,0.55,1) infinite;
  margin-bottom: 20px;
  filter: drop-shadow(0 0 14px rgba(201,168,76,0.5));
}

@keyframes spin {
  0% { transform: rotate(0deg) scale(0.9); opacity: 0.7; }
  30% { transform: rotate(120deg) scale(1.05); opacity: 1; }
  60% { transform: rotate(240deg) scale(0.95); opacity: 0.85; }
  100% { transform: rotate(360deg) scale(0.9); opacity: 0.7; }
}

.loading-text {
  font-size: 17px;
  color: var(--gold);
  font-weight: 600;
  margin-bottom: 20px;
  letter-spacing: 0.06em;
  animation: pulse 1.5s ease-in-out infinite;
}

.loading-bar {
  width: 140px; height: 3px;
  background: rgba(201,168,76,0.12);
  border-radius: 2px;
  margin: 0 auto;
  overflow: hidden;
}

.loading-bar-fill {
  width: 30%; height: 100%;
  background: linear-gradient(90deg, transparent, var(--gold), transparent);
  border-radius: 2px;
  animation: barShimmer 0.9s cubic-bezier(0.45,0,0.55,1) infinite;
}

@keyframes barShimmer {
  0% { transform: translateX(-120%); }
  100% { transform: translateX(420%); }
}

/* 加载按钮旋转 */
.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid var(--separator);
  border-top-color: var(--label-tertiary);
  border-radius: 50%;
  animation: spinnerRotate 0.6s linear infinite;
}

@keyframes spinnerRotate {
  to { transform: rotate(360deg); }
}

/* 过渡动画 */
/* 中间弹窗 */
.modal-fade-enter-active { transition: all 0.3s cubic-bezier(0.16,1,0.3,1); }
.modal-fade-leave-active { transition: all 0.2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-from .toast-dialog { transform: scale(0.9) translateY(20px); }
.modal-fade-leave-to .toast-dialog { transform: scale(0.95); opacity: 0; }

.toast-modal {
  position: fixed; inset: 0;
  background: var(--bg);
  display: flex; align-items: center; justify-content: center;
  z-index: 999;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  padding: 40px;
}
.toast-dialog {
  background: var(--bg-card);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border-radius: var(--radius-lg);
  padding: 28px 24px 20px;
  text-align: center;
  max-width: 280px; width: 100%;
  border: .5px solid var(--separator);
  transition: all .3s cubic-bezier(.16,1,.3,1);
}
.toast-icon { font-size: 44px; margin-bottom: 12px; }
.toast-msg {
  font-size: 15px; color: var(--label-primary);
  line-height: 1.6; margin-bottom: 20px;
  font-weight: 500;
}
.toast-ok {
  width: 100%; padding: 11px;
  border: none; border-radius: var(--radius-sm);
  background: var(--gold);
  color: #fff; font-size: 15px; font-weight: 600;
  cursor: pointer; letter-spacing: 0.04em;
  transition: opacity 0.15s;
}
.toast-ok:active { opacity: 0.7; }

.slide-fade-enter-active {
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.slide-fade-leave-active {
  transition: all 0.2s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.fade-enter-active {
  transition: opacity 0.2s ease;
}
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
