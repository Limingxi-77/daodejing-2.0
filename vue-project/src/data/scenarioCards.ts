// 12 modern-life scenario cards — quick entry points for users who don't know
// what to ask an AI Daodejing interpreter. Each card maps a familiar feeling
// to a fully-formed prompt that flows into the existing /api/ai/chat/stream
// pipeline (no backend changes required).

export interface ScenarioCard {
  id: string
  emoji: string
  title: string
  hint: string
  prompt: string
}

export const SCENARIO_CARDS: ScenarioCard[] = [
  {
    id: 'anxiety-insomnia',
    emoji: '😰',
    title: '失眠焦虑',
    hint: '夜里脑子停不下来',
    prompt: '最近经常失眠,脑子里翻来覆去停不下来。《道德经》对此有什么启示?能给我一段提点和一个今晚可以做的具体小事吗?'
  },
  {
    id: 'procrastination',
    emoji: '⏳',
    title: '拖延症',
    hint: '明知要做却一拖再拖',
    prompt: '我有严重的拖延症,明明知道事情要做却一拖再拖。《道德经》怎么看?能否结合"千里之行,始于足下"给我一段思考与一个今天就能开始的微小行动?'
  },
  {
    id: 'breakup',
    emoji: '💔',
    title: '失恋走出',
    hint: '一段关系刚刚结束',
    prompt: '我刚经历分手,情绪一直走不出来。《道德经》中关于失去与重生的智慧能否给我一些抚慰和一个今天可以做的小练习?'
  },
  {
    id: 'life-direction',
    emoji: '🌀',
    title: '人生迷茫',
    hint: '不知道下一步往哪走',
    prompt: '我处在人生的十字路口,毕业/换工作,不知道下一步往哪走。《道德经》能否给我一段提点和一个理清思绪的今日小行动?'
  },
  {
    id: 'workplace-burnout',
    emoji: '🏢',
    title: '职场内卷',
    hint: '加班无意义感',
    prompt: '加班到深夜,觉得这样的努力没有意义,人很累。《道德经》能否给我一段视角转换的提点和一个明天可以尝试的小行动?'
  },
  {
    id: 'parenting',
    emoji: '👶',
    title: '育儿压力',
    hint: '孩子叛逆,我也无力',
    prompt: '我的孩子最近很叛逆/焦虑,我也无能为力。《道德经》中关于"无为"与教化的思想能否给我一段提点和一个今晚就能尝试的小行动?'
  },
  {
    id: 'money-anxiety',
    emoji: '💰',
    title: '经济焦虑',
    hint: '工资跟不上物价',
    prompt: '工资跟不上物价,一直存不下钱,对未来很焦虑。《道德经》中"知足""少则得"的智慧能否给我一段提点和一个今天可执行的小动作?'
  },
  {
    id: 'relationship-conflict',
    emoji: '🥊',
    title: '亲密冲突',
    hint: '和伴侣总在吵架',
    prompt: '和伴侣经常吵架,沟通似乎无效。《道德经》中"柔弱胜刚强""不争"的思想能否给我一段提点和一个今晚就能做的具体行动?'
  },
  {
    id: 'info-overload',
    emoji: '📱',
    title: '信息焦虑',
    hint: '刷手机停不下来',
    prompt: '我每天刷手机几小时,空虚又戒不掉。《道德经》中"五色令人目盲"的提醒能否给我一段思考和一个今天就开始的小行动?'
  },
  {
    id: 'perfectionism',
    emoji: '🎯',
    title: '完美主义',
    hint: '事事追求 100 分',
    prompt: '我事事追求 100 分,自己很累,周围人也累。《道德经》中"曲则全""少则得"的智慧能否给我一段提点和一个今天就能尝试的"做减法"小行动?'
  },
  {
    id: 'self-doubt',
    emoji: '🪞',
    title: '自我怀疑',
    hint: '总觉得别人比我强',
    prompt: '我总觉得别人比我强,渐渐失去信心。《道德经》中"自知者明""自胜者强"的智慧能否给我一段提点和一个今天就能做的小练习?'
  },
  {
    id: 'sudden-shock',
    emoji: '🌪️',
    title: '突发变故',
    hint: '家里出了大事',
    prompt: '家里突然出了大事,我一时手足无措。《道德经》中关于无常与柔韧的智慧能否给我一段稳住自己的提点和一个今天就能做的小行动?'
  }
]
