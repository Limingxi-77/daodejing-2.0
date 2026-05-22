<template>
  <div id="app" class="min-h-screen bg-background font-chinese relative">
    <!-- 异步挂载的水墨背景，Three.js 不进首屏 chunk -->
    <DynamicInkBackground />
    <div class="relative z-10">
      <Navigation />
      <main class="pt-20">
        <router-view v-slot="{ Component, route }">
          <Suspense :key="route.path">
            <component :is="Component" />
            <template #fallback>
              <div class="page-skeleton" aria-hidden="true">
                <div class="skeleton-bar w-2/3 h-8 mb-6"></div>
                <div class="skeleton-bar w-full h-4 mb-3"></div>
                <div class="skeleton-bar w-5/6 h-4 mb-3"></div>
                <div class="skeleton-bar w-4/6 h-4 mb-8"></div>
                <div class="skeleton-bar w-full h-40"></div>
              </div>
            </template>
          </Suspense>
        </router-view>
      </main>
      <Footer />
    </div>
    <AuthModal v-if="hasOpenedAuth" />
    <PricingModal v-if="hasOpenedPricing" />
    <ZenBowlOverlay />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, ref, watch } from 'vue'
import Navigation from '@/components/layout/Navigation.vue'
import Footer from '@/components/layout/Footer.vue'
import { useAuthStore } from '@/stores/auth'

// 重量级 / 非首屏必需组件改为异步：
// - DynamicInkBackground 拉 three.js（>150KB gzip）
// - 两个 Modal 默认不显示
// - ZenBowlOverlay 仅禅模式触发
const DynamicInkBackground = defineAsyncComponent(() =>
  import('@/components/layout/DynamicInkBackground.vue')
)
const AuthModal = defineAsyncComponent(() => import('@/components/auth/AuthModal.vue'))
const PricingModal = defineAsyncComponent(() => import('@/components/auth/PricingModal.vue'))
const ZenBowlOverlay = defineAsyncComponent(() => import('@/components/layout/ZenBowlOverlay.vue'))

const authStore = useAuthStore()

// 首次打开后常驻 —— 避免反复销毁重建丢失关闭过渡，
// 同时把 chunk 的首屏代价推到"第一次真正需要"那一刻
const hasOpenedAuth = ref(false)
const hasOpenedPricing = ref(false)
watch(() => authStore.isAuthModalOpen, v => { if (v) hasOpenedAuth.value = true })
watch(() => authStore.showPricingModal, v => { if (v) hasOpenedPricing.value = true })

onMounted(() => {
  authStore.initAuth()
})
</script>

<style>
/* 路由切换淡入淡出 —— 没有这个，新页面是硬切 */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.18s ease;
}
.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}

/* 路由 chunk 还没下载完时的骨架屏 —— 取代之前的白屏 */
.page-skeleton {
  max-width: 64rem;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}
.page-skeleton .skeleton-bar {
  background: linear-gradient(90deg, #f3f0ea 0%, #ece6db 50%, #f3f0ea 100%);
  background-size: 200% 100%;
  border-radius: 6px;
  animation: skeleton-shimmer 1.2s linear infinite;
}
@keyframes skeleton-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
@media (prefers-reduced-motion: reduce) {
  .page-fade-enter-active,
  .page-fade-leave-active { transition: none; }
  .page-skeleton .skeleton-bar { animation: none; }
}
</style>
