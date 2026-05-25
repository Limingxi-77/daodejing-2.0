import { createRouter, createWebHistory } from 'vue-router'

// 共享 loader 映射：路由懒加载 + 主动 prefetch 复用同一份 import()
// 同一个 import() 在已解析后会命中浏览器的模块缓存，二次调用没有额外网络开销
const routeLoaders: Record<string, () => Promise<unknown>> = {
  Home: () => import('@/views/HomeView.vue'),
  Login: () => import('@/views/LoginView.vue'),
  Register: () => import('@/views/RegisterView.vue'),
  AIInterpretation: () => import('@/views/AIInterpretationView.vue'),
  LearningPath: () => import('@/views/LearningPathView.vue'),
  Community: () => import('@/views/CommunityView.vue'),
  Inbox: () => import('@/views/InboxView.vue'),
  ResourceLibrary: () => import('@/views/ResourceLibraryView.vue'),
  About: () => import('@/views/AboutView.vue'),
  DecisionHelper: () => import('@/views/DecisionHelperView.vue'),
  PictureBook: () => import('@/views/PictureBookView.vue'),
  DaoBusiness: () => import('@/views/DaoBusinessView.vue'),
  DaoArt: () => import('@/views/DaoArtView.vue'),
  TTS: () => import('@/views/TTSView.vue'),
  BusinessPlan: () => import('@/views/BusinessPlanView.vue')
}

const prefetched = new Set<string>()

export const prefetchRoute = (name: string) => {
  if (prefetched.has(name)) return
  const loader = routeLoaders[name]
  if (!loader) return
  prefetched.add(name)
  // 失败时回退：移除标记，下次还能再试
  loader().catch(() => prefetched.delete(name))
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'Home', component: routeLoaders.Home },
    { path: '/login', name: 'Login', component: routeLoaders.Login },
    { path: '/register', name: 'Register', component: routeLoaders.Register },
    { path: '/ai-interpretation', name: 'AIInterpretation', component: routeLoaders.AIInterpretation },
    { path: '/learning-path', name: 'LearningPath', component: routeLoaders.LearningPath },
    { path: '/community', name: 'Community', component: routeLoaders.Community },
    { path: '/inbox', name: 'Inbox', component: routeLoaders.Inbox },
    { path: '/resource-library', name: 'ResourceLibrary', component: routeLoaders.ResourceLibrary },
    { path: '/about', name: 'About', component: routeLoaders.About },
    { path: '/decision-helper', name: 'DecisionHelper', component: routeLoaders.DecisionHelper },
    { path: '/picture-book', name: 'PictureBook', component: routeLoaders.PictureBook },
    { path: '/dao-business', name: 'DaoBusiness', component: routeLoaders.DaoBusiness },
    { path: '/dao-art', name: 'DaoArt', component: routeLoaders.DaoArt },
    {
      path: '/tts',
      name: 'TTS',
      component: routeLoaders.TTS,
      meta: { title: '语音合成', requiresAuth: false }
    },
    {
      path: '/business-plan',
      name: 'BusinessPlan',
      component: routeLoaders.BusinessPlan,
      meta: { title: '商业蓝图', requiresAuth: false }
    }
  ]
})

export default router
