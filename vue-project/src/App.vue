<template>
  <div id="app" class="min-h-screen bg-background font-chinese relative">
    <DynamicInkBackground />
    <div class="relative z-10">
      <Navigation />
      <main class="pt-20">
        <router-view />
      </main>
      <Footer />
    </div>
    <AuthModal />
    <PricingModal />
    <ZenBowlOverlay />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import Navigation from '@/components/layout/Navigation.vue'
import Footer from '@/components/layout/Footer.vue'
import AuthModal from '@/components/auth/AuthModal.vue'
import PricingModal from '@/components/auth/PricingModal.vue'
import ZenBowlOverlay from '@/components/layout/ZenBowlOverlay.vue'
import DynamicInkBackground from '@/components/layout/DynamicInkBackground.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  authStore.initAuth()
})
</script>