<template>
  <div
    data-testid="value-report-card"
    class="bg-white/95 backdrop-blur rounded-2xl shadow-md border border-secondary/20 p-6 mb-6"
  >
    <div class="flex items-center justify-between mb-4">
      <div>
        <h3 class="text-lg font-bold text-primary font-serif flex items-center">
          <i class="fas fa-scroll mr-2 text-secondary"></i>
          我的修行账单
        </h3>
        <p class="text-xs text-dark/60 mt-1">本月与累计的修行价值,一目了然</p>
      </div>
      <button
        v-if="!loading"
        type="button"
        class="text-xs text-primary/70 hover:text-primary transition-colors"
        @click="$emit('refresh')"
      >
        <i class="fas fa-rotate-right mr-1"></i>刷新
      </button>
    </div>

    <div v-if="loading" class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div
        v-for="i in 4"
        :key="i"
        class="h-24 bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-xl animate-pulse"
      ></div>
    </div>

    <div v-else-if="data" class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div
        data-testid="value-card-calls"
        class="rounded-xl p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-100"
      >
        <div class="text-xs text-dark/60 mb-1">本月 AI 对话</div>
        <div class="text-3xl font-bold text-blue-700">{{ data.month.calls }}</div>
        <div class="text-xs text-dark/50 mt-1">累计 {{ data.lifetime.calls }} 次</div>
      </div>

      <div
        data-testid="value-card-tokens"
        class="rounded-xl p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-100"
      >
        <div class="text-xs text-dark/60 mb-1">本月 Tokens</div>
        <div class="text-3xl font-bold text-purple-700">{{ formatNumber(data.month.tokens) }}</div>
        <div class="text-xs text-dark/50 mt-1">累计 {{ formatNumber(data.lifetime.tokens) }}</div>
      </div>

      <div
        data-testid="value-card-saved"
        class="rounded-xl p-4 bg-gradient-to-br from-green-50 to-emerald-100/60 border border-green-200"
      >
        <div class="text-xs text-dark/60 mb-1">节省咨询费</div>
        <div class="text-3xl font-bold text-emerald-700">¥{{ data.month.savedAdvisory }}</div>
        <div class="text-xs text-emerald-600/80 mt-1">本月对照 ¥30/次</div>
      </div>

      <div
        data-testid="value-card-progress"
        class="rounded-xl p-4 bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-100 flex items-center justify-between"
      >
        <div>
          <div class="text-xs text-dark/60 mb-1">道学进度</div>
          <div class="text-3xl font-bold text-amber-700">{{ data.progress.percent }}%</div>
          <div class="text-xs text-dark/50 mt-1">{{ data.progress.learned }}/{{ data.progress.total }} 章</div>
        </div>
        <svg :width="56" :height="56" viewBox="0 0 56 56" class="-mr-1">
          <circle cx="28" cy="28" r="24" stroke="#fde68a" stroke-width="6" fill="none" />
          <circle
            cx="28"
            cy="28"
            r="24"
            stroke="#d97706"
            stroke-width="6"
            fill="none"
            stroke-linecap="round"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="dashOffset"
            transform="rotate(-90 28 28)"
            style="transition: stroke-dashoffset 0.6s ease"
          />
        </svg>
      </div>
    </div>

    <div v-else class="text-center text-sm text-dark/40 py-4">
      <i class="fas fa-circle-info mr-1"></i>暂无数据
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ValueReport } from '@/services/valueReportService'

const props = defineProps<{
  data: ValueReport | null
  loading: boolean
}>()

defineEmits<{ refresh: [] }>()

const RADIUS = 24
const circumference = 2 * Math.PI * RADIUS

const dashOffset = computed(() => {
  if (!props.data) return circumference
  const pct = Math.max(0, Math.min(100, props.data.progress.percent))
  return circumference * (1 - pct / 100)
})

function formatNumber(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}
</script>
