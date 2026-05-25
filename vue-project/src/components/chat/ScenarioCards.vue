<template>
  <div data-testid="scenario-cards-panel">
    <div class="flex items-end justify-between mb-4">
      <div>
        <h2 class="text-2xl font-semibold text-primary">从生活情境开始</h2>
        <p class="text-sm text-gray-500 mt-1">不知道问什么?选一张现在最贴近你的卡片,我们替你把问题问出来。</p>
      </div>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      <button
        v-for="card in scenarios"
        :key="card.id"
        type="button"
        class="scenario-card group ink-splash"
        :class="{ 'is-active': activeId === card.id, 'is-disabled': isSending }"
        :disabled="isSending"
        @click="onClick(card)"
        :data-testid="`scenario-card-${card.id}`"
      >
        <div class="text-3xl mb-1 transition-transform group-hover:scale-110" aria-hidden="true">{{ card.emoji }}</div>
        <div class="font-semibold text-primary text-sm">{{ card.title }}</div>
        <div class="text-xs text-gray-500 leading-snug mt-0.5">{{ card.hint }}</div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import { SCENARIO_CARDS, type ScenarioCard } from '@/data/scenarioCards'

const props = defineProps<{ scenarios?: ScenarioCard[] }>()
const scenarios = props.scenarios ?? SCENARIO_CARDS

const chatStore = useChatStore()
const authStore = useAuthStore()
const activeId = ref<string | null>(null)
const isSending = ref(false)

// 可选注入:父级(AIInterpretationView)注入后,场景卡按当前模式分发(单人=流式;议事=回填 textarea)
const promptPick = inject<((prompt: string) => void) | null>('aiInterpretationPromptPick', null)

async function onClick(card: ScenarioCard) {
  if (isSending.value) return
  if (!authStore.isLoggedIn) {
    authStore.openAuthModal('login')
    return
  }
  activeId.value = card.id

  // 若注入了模式感知 handler(AI 解读页),交给它分发
  if (promptPick) {
    try {
      promptPick(card.prompt)
    } catch (e) {
      console.warn('场景卡 promptPick 失败:', e)
    }
    return
  }

  // 否则回退到直接流式(HomeView 等场景仍兼容旧行为)
  isSending.value = true
  try {
    await chatStore.sendStream(card.prompt)
    requestAnimationFrame(() => {
      const target = document.querySelector('[data-testid="ai-chat"]') || document.querySelector('.ai-chat-container')
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  } catch (e) {
    console.warn('场景卡发送失败:', e)
  } finally {
    isSending.value = false
  }
}
</script>

<style scoped>
.scenario-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.85rem 0.5rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(141, 110, 99, 0.15);
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(6px);
  cursor: pointer;
  text-align: center;
  transition: transform 0.15s, box-shadow 0.2s, border-color 0.2s, background-color 0.2s;
  min-height: 96px;
}

.scenario-card:hover,
.scenario-card:focus-visible {
  transform: translateY(-2px);
  border-color: rgba(141, 110, 99, 0.45);
  box-shadow: 0 6px 18px rgba(51, 51, 51, 0.08);
  outline: none;
}

.scenario-card:focus-visible {
  outline: 2px solid #6b4826;
  outline-offset: 2px;
}

.scenario-card.is-active {
  border-color: #6b4826;
  background: linear-gradient(135deg, rgba(107, 72, 38, 0.06), rgba(193, 162, 110, 0.08));
}

.scenario-card.is-disabled {
  opacity: 0.7;
  cursor: wait;
}

@media (prefers-reduced-motion: reduce) {
  .scenario-card,
  .scenario-card:hover {
    transform: none;
    transition: none;
  }
}

:global(html.retro-mode) .scenario-card {
  font-family: "KaiTi", "STKaiti", serif;
}
</style>
