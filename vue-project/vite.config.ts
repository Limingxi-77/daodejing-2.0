import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

const pwaPlugin = VitePWA({
  registerType: 'autoUpdate',
  devOptions: {
    // 开发模式下关闭 SW，避免 SWR 缓存让 HMR 后第一次切换"切了又切"
    enabled: false
  },
  // 排除 AI 流式 / TTS 等长连接路径,避免 SW 拦截 SSE 导致打字机效果中断
  workbox: {
    navigateFallbackDenylist: [/^\/api\/ai\//, /^\/api\/tts\//],
    runtimeCaching: [
      {
        urlPattern: /^https?:\/\/[^/]+\/api\/resources(\/|\?|$)/,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'api-resources',
          expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 }
        }
      },
      {
        urlPattern: /^https?:\/\/[^/]+\/api\/community\/posts(\/|\?|$)/,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'api-community-posts',
          expiration: { maxEntries: 30, maxAgeSeconds: 60 * 5 }
        }
      }
    ]
  },
  includeAssets: ['logo.svg'],
  manifest: {
    name: '道德经AI平台 2.0',
    short_name: '道德经AI',
    description: '借助 AI 智慧探索老子思想的现代价值',
    theme_color: '#1c1c1e',
    background_color: '#1c1c1e',
    display: 'standalone',
    icons: [
      {
        src: 'logo.svg',
        sizes: '192x192',
        type: 'image/svg+xml'
      },
      {
        src: 'logo.svg',
        sizes: '512x512',
        type: 'image/svg+xml'
      },
      {
        src: 'logo.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any maskable'
      }
    ]
  }
})

export default defineConfig({
  plugins: [
    vue(),
    pwaPlugin
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    // 把大依赖拆成独立 chunk，避免首屏被巨型 vendor 阻塞
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-core': ['vue', 'vue-router', 'pinia'],
          'three': ['three'],
          'markdown': ['marked', 'dompurify'],
          'search': ['fuse.js']
        }
      }
    },
    // 提高警告阈值，让 three 这种本来就大的 chunk 不刷屏
    chunkSizeWarningLimit: 800
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
})
