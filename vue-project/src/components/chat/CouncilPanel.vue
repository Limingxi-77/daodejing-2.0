<template>
  <div data-testid="council-panel">
    <!-- 输入区 -->
    <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 p-6 mb-6">
      <!-- 会议模式切换 -->
      <div class="flex items-center justify-between mb-3">
        <label for="council-question" class="text-sm font-semibold text-dark/70">你的问题</label>
        <div class="inline-flex rounded-lg border border-gray-200/70 bg-white/80 backdrop-blur-sm p-1" role="tablist" aria-label="议事模式">
          <button
            type="button"
            class="council-mode-tab"
            :class="{ active: mode === 'parallel' }"
            data-testid="council-mode-tab-parallel"
            role="tab"
            :aria-selected="mode === 'parallel'"
            :disabled="loading"
            @click="mode = 'parallel'"
            title="三家并行回答"
          >
            <i class="fas fa-users mr-1" aria-hidden="true"></i>会议
          </button>
          <button
            type="button"
            class="council-mode-tab"
            :class="{ active: mode === 'debate' }"
            data-testid="council-mode-tab-debate"
            role="tab"
            :aria-selected="mode === 'debate'"
            :disabled="loading"
            @click="mode = 'debate'"
            title="两轮辩论:第二轮看到对方观点后回应"
          >
            <i class="fas fa-comments mr-1" aria-hidden="true"></i>辩论
          </button>
        </div>
      </div>

      <textarea
        id="council-question"
        v-model="question"
        data-testid="council-question-input"
        rows="3"
        :placeholder="mode === 'debate' ? '例如:996 文化下如何保持自我?(辩论模式约 1500 tokens)' : '例如:工作压力大、容易焦虑,《道德经》中有什么启示?'"
        class="w-full px-4 py-3 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y bg-white"
        :disabled="loading"
      ></textarea>
      <div class="flex items-center justify-between mt-3">
        <p class="text-xs text-dark/50">{{ question.length }} / 1500</p>
        <button
          @click="onAsk"
          data-testid="council-ask-button"
          class="px-6 py-2 btn-primary rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="loading || !question.trim()"
        >
          <i v-if="loading" class="fas fa-spinner fa-spin mr-1"></i>
          <i v-else class="fas fa-comments mr-1"></i>
          {{ buttonLabel }}
        </button>
      </div>
      <p
        v-if="errorMessage"
        data-testid="council-error"
        class="text-sm text-red-500 mt-2"
      >
        {{ errorMessage }}
      </p>
    </div>

    <!-- 单轮(parallel)结果 -->
    <div v-if="(response || loading) && !isDebateView" data-testid="council-results">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <article
          v-for="(persona, idx) in personaCards"
          :key="persona.personaId"
          class="bg-white rounded-xl shadow p-5 border-t-4"
          :class="cardBorderClass(idx)"
          :data-testid="`council-card-${persona.personaId}`"
        >
          <header class="flex items-center mb-3">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center text-white mr-3"
              :class="iconBgClass(idx)"
            >
              <i :class="`fas ${persona.icon}`"></i>
            </div>
            <div>
              <h3 class="font-bold text-primary">{{ persona.personaName }}</h3>
              <p class="text-xs text-dark/50">{{ statusLabel(persona) }}</p>
            </div>
          </header>
          <div
            v-if="loading && !persona.content && !persona.error"
            class="space-y-2 animate-pulse"
          >
            <div class="h-3 bg-secondary/20 rounded"></div>
            <div class="h-3 bg-secondary/20 rounded w-11/12"></div>
            <div class="h-3 bg-secondary/20 rounded w-4/5"></div>
            <div class="h-3 bg-secondary/20 rounded w-2/3"></div>
          </div>
          <p
            v-else-if="persona.error"
            class="text-sm text-red-500"
            :data-testid="`council-card-${persona.personaId}-error`"
          >
            {{ persona.error }}
          </p>
          <div
            v-else
            class="text-sm leading-relaxed text-dark whitespace-pre-wrap"
            :data-testid="`council-card-${persona.personaId}-content`"
          >
            {{ persona.content }}
          </div>
        </article>
      </div>
      <p
        v-if="response && response.totalTokens > 0"
        class="text-center text-xs text-dark/50 mt-6"
      >
        本次议事消耗 {{ response.totalTokens }} tokens · 估算成本 ${{ response.estimatedCost.toFixed(4) }}
      </p>
    </div>

    <!-- 辩论(debate)双轮结果 -->
    <div v-else-if="isDebateView" data-testid="council-debate-results">
      <!-- Round 1 -->
      <div class="mb-4">
        <h3 class="text-sm font-bold text-dark/60 uppercase tracking-widest mb-3"><i class="fas fa-circle-1 mr-1"></i>第一轮:各抒己见</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <article
            v-for="(persona, idx) in round1Cards"
            :key="`r1-${persona.personaId}`"
            class="bg-white rounded-xl shadow p-5 border-t-4"
            :class="cardBorderClass(idx)"
            :data-testid="`council-debate-r1-${persona.personaId}`"
          >
            <header class="flex items-center mb-3">
              <div class="w-10 h-10 rounded-full flex items-center justify-center text-white mr-3" :class="iconBgClass(idx)">
                <i :class="`fas ${persona.icon}`"></i>
              </div>
              <div>
                <h3 class="font-bold text-primary">{{ persona.personaName }}</h3>
                <p class="text-xs text-dark/50">{{ statusLabel(persona) }}</p>
              </div>
            </header>
            <div v-if="loading && !persona.content && !persona.error" class="space-y-2 animate-pulse">
              <div class="h-3 bg-secondary/20 rounded"></div>
              <div class="h-3 bg-secondary/20 rounded w-11/12"></div>
              <div class="h-3 bg-secondary/20 rounded w-4/5"></div>
            </div>
            <p v-else-if="persona.error" class="text-sm text-red-500" :data-testid="`council-debate-r1-${persona.personaId}-error`">
              {{ persona.error }}
            </p>
            <div v-else class="text-sm leading-relaxed text-dark whitespace-pre-wrap" :data-testid="`council-debate-r1-${persona.personaId}-content`">
              {{ persona.content }}
            </div>
          </article>
        </div>
      </div>

      <!-- 分隔线 -->
      <div class="flex items-center my-6 text-xs text-dark/40 uppercase tracking-widest">
        <span class="flex-1 border-t border-dashed border-gray-300"></span>
        <span class="px-3"><i class="fas fa-arrow-down mr-1"></i>第二轮回应</span>
        <span class="flex-1 border-t border-dashed border-gray-300"></span>
      </div>

      <!-- Round 2 -->
      <div>
        <h3 class="text-sm font-bold text-dark/60 uppercase tracking-widest mb-3"><i class="fas fa-circle-2 mr-1"></i>第二轮:互相回应</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <article
            v-for="(persona, idx) in round2Cards"
            :key="`r2-${persona.personaId}`"
            class="bg-white rounded-xl shadow p-5 border-t-4 border-dashed"
            :class="cardBorderClass(idx)"
            :data-testid="`council-debate-r2-${persona.personaId}`"
          >
            <header class="flex items-center mb-3">
              <div class="w-10 h-10 rounded-full flex items-center justify-center text-white mr-3" :class="iconBgClass(idx)">
                <i :class="`fas ${persona.icon}`"></i>
              </div>
              <div>
                <h3 class="font-bold text-primary">{{ persona.personaName }} <span class="text-xs text-accent ml-1">· 回应</span></h3>
                <p class="text-xs text-dark/50">{{ statusLabel(persona) }}</p>
              </div>
            </header>
            <div v-if="loading && !persona.content && !persona.error" class="space-y-2 animate-pulse">
              <div class="h-3 bg-secondary/20 rounded"></div>
              <div class="h-3 bg-secondary/20 rounded w-11/12"></div>
              <div class="h-3 bg-secondary/20 rounded w-4/5"></div>
            </div>
            <p v-else-if="persona.error" class="text-sm text-red-500" :data-testid="`council-debate-r2-${persona.personaId}-error`">
              {{ persona.error }}
            </p>
            <div v-else class="text-sm leading-relaxed text-dark whitespace-pre-wrap" :data-testid="`council-debate-r2-${persona.personaId}-content`">
              {{ persona.content }}
            </div>
          </article>
        </div>
      </div>

      <p
        v-if="response && response.totalTokens > 0"
        class="text-center text-xs text-dark/50 mt-6"
      >
        本次辩论消耗 {{ response.totalTokens }} tokens · 估算成本 ${{ response.estimatedCost.toFixed(4) }}
      </p>
    </div>

    <!-- 空状态提示 -->
    <div
      v-else
      class="text-center text-dark/40 text-sm py-12"
      data-testid="council-empty-hint"
    >
      <i class="fas fa-comments text-4xl mb-3 block"></i>
      {{ mode === 'debate'
        ? '输入问题后,三家先各答一轮,再彼此回应,共两轮辩论。'
        : '输入问题后召集学者 / 隐士 / 疗愈师三种视角同屏对照' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  askCouncil,
  type CouncilResponse,
  type CouncilPersonaResult,
  type CouncilMode
} from '@/services/councilService'

const FALLBACK_PERSONAS: CouncilPersonaResult[] = [
  { personaId: 'scholar', personaName: '现代学者', icon: 'fa-graduation-cap' },
  { personaId: 'hermit', personaName: '道家隐士', icon: 'fa-mountain' },
  { personaId: 'healer', personaName: '心理疗愈师', icon: 'fa-heart' }
]

const question = ref('')
const loading = ref(false)
const errorMessage = ref('')
const response = ref<CouncilResponse | null>(null)
const mode = ref<CouncilMode>('parallel')

const isDebateView = computed(() => {
  // 辩论视图条件:用户选了 debate 且有 rounds 数据,或仍在加载且模式是 debate
  if (mode.value !== 'debate') return false
  if (loading.value) return true
  return Boolean(response.value?.rounds && response.value.rounds.length >= 2)
})

const buttonLabel = computed(() => {
  if (loading.value) return mode.value === 'debate' ? '辩论进行中...' : '议事中...'
  return mode.value === 'debate' ? '开始辩论' : '召集议事'
})

const personaCards = computed<CouncilPersonaResult[]>(() => {
  if (response.value?.personas?.length) return response.value.personas
  return FALLBACK_PERSONAS
})

const round1Cards = computed<CouncilPersonaResult[]>(() => {
  const rounds = response.value?.rounds
  if (rounds && rounds[0]?.personas?.length) return rounds[0].personas
  // 加载中或失败时使用 fallback 占位
  if (response.value?.personas?.length) return response.value.personas
  return FALLBACK_PERSONAS
})

const round2Cards = computed<CouncilPersonaResult[]>(() => {
  const rounds = response.value?.rounds
  if (rounds && rounds[1]?.personas?.length) return rounds[1].personas
  return FALLBACK_PERSONAS
})

const cardBorderClass = (idx: number) => {
  return ['border-primary', 'border-amber-500', 'border-emerald-500'][idx % 3]
}

const iconBgClass = (idx: number) => {
  return ['bg-primary', 'bg-amber-500', 'bg-emerald-500'][idx % 3]
}

const statusLabel = (p: CouncilPersonaResult): string => {
  if (loading.value && !p.content && !p.error) return '思考中…'
  if (p.error) return '失败'
  if (p.status === 'mock-no-server-key') return '本地模拟'
  if (p.status === 'success') return `${p.tokens ?? 0} tokens`
  return ''
}

const onAsk = async () => {
  const q = question.value.trim()
  if (!q) return
  if (q.length > 1500) {
    errorMessage.value = '问题过长(>1500 字)'
    return
  }
  errorMessage.value = ''
  loading.value = true
  response.value = null
  try {
    const result = await askCouncil(q, { mode: mode.value })
    response.value = result
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : '议事失败,请稍后重试'
  } finally {
    loading.value = false
  }
}

// 供父组件(AIInterpretationView)在切换到三家会议模式后,从场景卡/章节/热门问题回填问题文本
function setQuestion(q: string) {
  question.value = (q ?? '').slice(0, 1500)
}

defineExpose({ setQuestion })
</script>

<style scoped>
.council-mode-tab {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.85rem;
  border-radius: 0.375rem;
  font-size: 0.8rem;
  font-weight: 500;
  color: #6b7280;
  background: transparent;
  cursor: pointer;
  transition: color 0.2s, background-color 0.2s;
}

.council-mode-tab:hover:not(:disabled),
.council-mode-tab:focus-visible:not(:disabled) {
  color: #6b4826;
  outline: none;
}

.council-mode-tab:focus-visible {
  outline: 2px solid #6b4826;
  outline-offset: 2px;
}

.council-mode-tab.active {
  background: #6b4826;
  color: white;
}

.council-mode-tab:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
