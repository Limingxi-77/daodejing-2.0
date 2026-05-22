<template>
  <div class="min-h-screen pt-4 pb-20 px-4 md:px-8">
    <div class="container mx-auto max-w-5xl">
      <!-- Header -->
      <div class="text-center mb-12 animate-fade-in">
        <h1 class="text-4xl font-bold text-primary mb-4 font-serif">道家决策辅助</h1>
        <p class="text-lg text-gray-600 italic">
          "人法地，地法天，天法道，道法自然"
        </p>
        <p class="text-sm text-gray-500 mt-2 max-w-2xl mx-auto">
          将西方管理学 SWOT 分析与东方道家智慧相结合。
          <br>
          <span class="text-accent">阳(优势) · 阴(劣势) · 天时(机会) · 地利(威胁)</span>
        </p>
      </div>

      <!-- Input Section -->
      <div v-if="step === 1" class="bg-white rounded-2xl shadow-xl p-8 border border-secondary/20 animate-slide-up relative overflow-hidden">
        <!-- Background Decor -->
        <div class="absolute top-0 right-0 w-64 h-64 opacity-5 pointer-events-none">
          <i class="fas fa-compass text-9xl"></i>
        </div>

        <div class="mb-8">
          <label class="block text-lg font-bold text-primary mb-2">您面临的决策难题是？</label>
          <input 
            v-model="decisionTopic"
            type="text" 
            placeholder="例如：是否应该辞职创业？ / 是否应该接手这个新项目？"
            class="w-full px-4 py-3 rounded-lg border-2 border-secondary/30 focus:border-primary focus:outline-none transition-colors text-lg bg-light/50"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- 阳 (Strengths) -->
          <div class="space-y-2">
            <label class="flex items-center text-lg font-bold text-red-800">
              <span class="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-2 text-sm border border-red-200">阳</span>
              自身优势 (Strengths)
            </label>
            <textarea 
              v-model="swot.strengths"
              rows="4"
              placeholder="您具备哪些有利条件？您的核心竞争力是什么？"
              class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-red-400 focus:ring-1 focus:ring-red-400 focus:outline-none transition-all resize-none bg-red-50/30"
            ></textarea>
          </div>

          <!-- 阴 (Weaknesses) -->
          <div class="space-y-2">
            <label class="flex items-center text-lg font-bold text-blue-800">
              <span class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 text-sm border border-blue-200">阴</span>
              自身劣势 (Weaknesses)
            </label>
            <textarea 
              v-model="swot.weaknesses"
              rows="4"
              placeholder="您面临哪些内部阻碍？有哪些不足之处？"
              class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none transition-all resize-none bg-blue-50/30"
            ></textarea>
          </div>

          <!-- 天时 (Opportunities) -->
          <div class="space-y-2">
            <label class="flex items-center text-lg font-bold text-yellow-700">
              <span class="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center mr-2 text-sm border border-yellow-200">天</span>
              外部机遇 (Opportunities)
            </label>
            <textarea 
              v-model="swot.opportunities"
              rows="4"
              placeholder="当前大环境有哪些有利因素？是否有顺势而为的机会？"
              class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 focus:outline-none transition-all resize-none bg-yellow-50/30"
            ></textarea>
          </div>

          <!-- 地利 (Threats) -->
          <div class="space-y-2">
            <label class="flex items-center text-lg font-bold text-green-800">
              <span class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-2 text-sm border border-green-200">地</span>
              外部风险 (Threats)
            </label>
            <textarea 
              v-model="swot.threats"
              rows="4"
              placeholder="环境中有哪些潜在危机？竞争对手的情况如何？"
              class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-green-400 focus:ring-1 focus:ring-green-400 focus:outline-none transition-all resize-none bg-green-50/30"
            ></textarea>
          </div>
        </div>

        <div v-if="errorMessage" class="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <i class="fas fa-times-circle mr-1"></i> {{ errorMessage }}
        </div>

        <div class="mt-10 text-center">
          <button
            @click="analyze"
            :disabled="!isValid || isAnalyzing"
            class="px-12 py-4 bg-primary text-white text-xl font-bold rounded-full shadow-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1"
          >
            <span v-if="isAnalyzing">
              <i class="fas fa-spinner fa-spin mr-2"></i> {{ progressText }}
            </span>
            <span v-else>
              起卦推演
            </span>
          </button>
          <p v-if="!isLoggedIn" class="mt-3 text-xs text-gray-500">
            <i class="fas fa-info-circle mr-1"></i> 未登录将使用本地推演模板；
            <router-link to="/login" class="text-primary underline">登录</router-link>
            后可获得 AI 个性化分析
          </p>
        </div>
      </div>

      <!-- Result Section -->
      <div v-else class="space-y-8 animate-fade-in">
        <!-- AI Analysis Card -->
        <div class="bg-white rounded-2xl shadow-xl p-8 border-t-4 border-accent relative overflow-hidden">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-primary font-serif">道家决策建议</h2>
            <button @click="step = 1" class="text-sm text-gray-500 hover:text-primary underline">重新推演</button>
          </div>

          <div v-if="resultMode === 'ai'" class="mb-4 inline-flex items-center px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold">
            <i class="fas fa-magic mr-1"></i> 由 AI 推演 ({{ providerLabel }})
          </div>
          <div v-else-if="resultMode === 'fallback'" class="mb-4 inline-flex items-center px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200">
            <i class="fas fa-exclamation-triangle mr-1"></i> AI 暂不可用，使用本地推演兜底
          </div>

          <div class="prose max-w-none text-dark leading-relaxed">
            <div class="mb-6 p-4 bg-light rounded-lg border border-secondary/20 italic text-lg text-center">
              "{{ result.quote }}"
              <div class="text-sm text-gray-500 mt-2 not-italic">—— {{ result.source }}</div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 class="font-bold text-lg mb-3 flex items-center">
                  <i class="fas fa-yin-yang text-primary mr-2"></i> 局势研判
                </h3>
                <p class="text-gray-700">{{ result.analysis }}</p>
              </div>
              <div>
                <h3 class="font-bold text-lg mb-3 flex items-center">
                  <i class="fas fa-lightbulb text-accent mr-2"></i> 破局之道
                </h3>
                <p class="text-gray-700">{{ result.strategy }}</p>
              </div>
            </div>

            <div class="bg-primary/5 p-6 rounded-xl">
              <h3 class="font-bold text-primary mb-3">具体行动建议：</h3>
              <ul class="space-y-2">
                <li v-for="(action, idx) in result.actions" :key="idx" class="flex items-start">
                  <span class="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs mr-3 mt-0.5 flex-shrink-0">{{ idx + 1 }}</span>
                  <span class="text-gray-800">{{ action }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Hexagram Visualization (Optional/Decorative) -->
        <div class="flex justify-center opacity-30">
          <div class="flex flex-col gap-2">
            <div class="w-32 h-4 bg-primary rounded-sm"></div>
            <div class="flex gap-4">
               <div class="w-14 h-4 bg-primary rounded-sm"></div>
               <div class="w-14 h-4 bg-primary rounded-sm"></div>
            </div>
            <div class="w-32 h-4 bg-primary rounded-sm"></div>
            <div class="flex gap-4">
               <div class="w-14 h-4 bg-primary rounded-sm"></div>
               <div class="w-14 h-4 bg-primary rounded-sm"></div>
            </div>
            <div class="w-32 h-4 bg-primary rounded-sm"></div>
            <div class="w-32 h-4 bg-primary rounded-sm"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { apiClient } from '@/services/api'

const step = ref(1)
const isAnalyzing = ref(false)
const decisionTopic = ref('')
const errorMessage = ref('')
const resultMode = ref<'ai' | 'fallback' | ''>('')
const providerLabel = ref('')
const progressText = ref('推演中...')

const authStore = useAuthStore()
const { isLoggedIn } = storeToRefs(authStore)

const swot = ref({
  strengths: '',
  weaknesses: '',
  opportunities: '',
  threats: ''
})

const isValid = computed(() => {
  return decisionTopic.value.trim().length > 0 &&
         (swot.value.strengths || swot.value.weaknesses || swot.value.opportunities || swot.value.threats)
})

interface AnalysisResult {
  quote: string
  source: string
  analysis: string
  strategy: string
  actions: string[]
}

const result = ref<AnalysisResult>({
  quote: '',
  source: '',
  analysis: '',
  strategy: '',
  actions: []
})

interface AIChatResponse {
  success: boolean
  content: string
  provider?: string
  model?: string
  mode?: string
}

const buildPrompt = () => {
  const systemPrompt = `你是一位精通《道德经》《庄子》的道家智者，擅长用道家思想为现代人提供决策辅助。
用户会按"阳(优势)、阴(劣势)、天时(机会)、地利(威胁)"四象限提供处境信息，你的任务是结合用户的"决策难题"作出针对性推演。

严格按以下 JSON 结构返回，不要包含任何 JSON 之外的文字，不要使用 markdown 代码块包裹：
{
  "quote": "贴合处境的一句道家经典原文（不超过 30 字）",
  "source": "出处，如 道德经 第八章 / 庄子·逍遥游",
  "analysis": "局势研判，结合用户的具体处境，用道家术语点出本质，120-180 字",
  "strategy": "破局之道，给出符合道家思想的总体方略，100-150 字",
  "actions": ["3 条可立刻执行的具体行动建议，每条 30-60 字"]
}`

  const userPrompt = `我的决策难题：${decisionTopic.value.trim()}

【阳 · 自身优势】
${swot.value.strengths.trim() || '（未填写）'}

【阴 · 自身劣势】
${swot.value.weaknesses.trim() || '（未填写）'}

【天时 · 外部机会】
${swot.value.opportunities.trim() || '（未填写）'}

【地利 · 外部威胁】
${swot.value.threats.trim() || '（未填写）'}

请基于以上信息，按要求返回 JSON。`

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ]
}

const extractJson = (text: string): AnalysisResult | null => {
  if (!text) return null
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '')
  const firstBrace = cleaned.indexOf('{')
  const lastBrace = cleaned.lastIndexOf('}')
  if (firstBrace < 0 || lastBrace <= firstBrace) return null
  const jsonStr = cleaned.slice(firstBrace, lastBrace + 1)
  try {
    const parsed = JSON.parse(jsonStr)
    if (
      typeof parsed.quote === 'string' &&
      typeof parsed.source === 'string' &&
      typeof parsed.analysis === 'string' &&
      typeof parsed.strategy === 'string' &&
      Array.isArray(parsed.actions)
    ) {
      return {
        quote: parsed.quote,
        source: parsed.source,
        analysis: parsed.analysis,
        strategy: parsed.strategy,
        actions: parsed.actions.slice(0, 6).map((a: unknown) => String(a))
      }
    }
  } catch {
    return null
  }
  return null
}

const analyze = async () => {
  errorMessage.value = ''
  isAnalyzing.value = true
  progressText.value = '推演中...'

  try {
    if (isLoggedIn.value) {
      progressText.value = 'AI 推演中...'
      try {
        const response = await apiClient<AIChatResponse>('/ai/chat', {
          method: 'POST',
          auth: true,
          body: {
            provider: 'deepseek',
            messages: buildPrompt(),
            temperature: 0.75,
            max_tokens: 1200
          }
        })

        const parsed = extractJson(response.content)
        if (parsed) {
          result.value = parsed
          resultMode.value = 'ai'
          providerLabel.value = response.mode === 'mock-no-server-key'
            ? '演示模式'
            : (response.provider || 'AI')
          step.value = 2
          return
        }
        console.warn('AI 返回内容无法解析为 JSON，使用本地兜底', response.content)
        generateFallback()
        resultMode.value = 'fallback'
        step.value = 2
        return
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'AI 调用失败'
        errorMessage.value = `AI 调用失败：${msg}，已为您切换到本地推演`
      }
    }

    generateFallback()
    resultMode.value = isLoggedIn.value ? 'fallback' : ''
    step.value = 2
  } finally {
    isAnalyzing.value = false
  }
}

const generateFallback = () => {
  const hasStrongInternal = swot.value.strengths.length > swot.value.weaknesses.length
  const hasStrongExternal = swot.value.opportunities.length > swot.value.threats.length

  if (hasStrongInternal && hasStrongExternal) {
    result.value = {
      quote: '抟扶摇而上者九万里，绝云气，负青天。',
      source: '庄子·逍遥游（引申）',
      analysis: '当前您自身具备较强优势（阳气足），且外部环境有利（天时至）。此乃顺风顺水之局，犹如大鹏展翅，势不可挡。',
      strategy: '当“无为而无不为”。顺应大势，大胆行动，不要过分犹豫。利用自身优势最大化外部机遇。',
      actions: [
        '制定激进的扩张或行动计划，快速抢占先机。',
        '整合现有资源，集中力量在核心突破点上。',
        '保持开放心态，广泛结交盟友（“善贷且成”）。'
      ]
    }
  } else if (hasStrongInternal && !hasStrongExternal) {
    result.value = {
      quote: '持而盈之，不如其已；揣而锐之，不可长保。',
      source: '道德经 第九章',
      analysis: '您自身实力尚可，但外部环境充满挑战与风险。此时若强行出击，恐有折损之虞。正如锋芒毕露易折，盈满易溢。',
      strategy: '宜“守柔曰强”。利用自身优势构筑护城河，对外保持低调，等待外部环境转好。不争一时之长短。',
      actions: [
        '优化内部流程，降低成本，保存实力（“治大国若烹小鲜”）。',
        '避免正面冲突，寻找细分市场或避风港。',
        '密切观察环境变化，通过小规模尝试来测试风险。'
      ]
    }
  } else if (!hasStrongInternal && hasStrongExternal) {
    result.value = {
      quote: '江海所以能为百谷王者，以其善下之，故能为百谷王。',
      source: '道德经 第六十六章',
      analysis: '外部机会虽好，但您自身存在明显短板。若盲目贪大求全，恐虚不受补。此时需要谦下、包容，善于借力。',
      strategy: '当“处下不争”。承认自身不足，通过合作、外包或学习来弥补短板。像江海一样处于低位，汇聚他人之力。',
      actions: [
        '寻找合作伙伴，以利益共享换取能力互补。',
        '专注于利用机会中最容易入手的部分，逐步积累。',
        '快速学习，提升核心能力，缩小差距。'
      ]
    }
  } else {
    result.value = {
      quote: '致虚极，守静笃。万物并作，吾以观复。',
      source: '道德经 第十六章',
      analysis: '当前内忧外患，局势晦暗不明。自身条件不足，且环境恶劣。此时妄动必凶，强行作为只会加速消耗。',
      strategy: '宜“归根复命”。彻底停下来反思，回归本源，削减不必要的欲望和行动。等待是目前最好的策略。',
      actions: [
        '做减法，砍掉非核心业务或支出（“少则得，多则惑”）。',
        '静心修养，提升内在心性，等待时机流转。',
        '重新审视目标，是否违背了自然规律，考虑转换赛道。'
      ]
    }
  }
}
</script>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 0.6s ease-out forwards;
}

.animate-slide-up {
  animation: fade-in 0.6s ease-out forwards;
  animation-delay: 0.2s;
  opacity: 0;
}

/* Zen Mode Support */
:global(html.zen-mode) .bg-white {
  background-color: #2c2c2e;
  border-color: #3f3f46;
}

:global(html.zen-mode) .text-primary {
  color: #d4b483;
}

:global(html.zen-mode) .text-dark,
:global(html.zen-mode) .text-gray-700,
:global(html.zen-mode) .text-gray-800 {
  color: #d1d5db;
}

:global(html.zen-mode) .text-gray-600,
:global(html.zen-mode) .text-gray-500 {
  color: #9ca3af;
}

:global(html.zen-mode) input,
:global(html.zen-mode) textarea {
  background-color: #1c1c1e;
  border-color: #3f3f46;
  color: #d4b483;
}

:global(html.zen-mode) .bg-light {
  background-color: #3f3f46;
}
</style>
