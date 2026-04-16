import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/HomeView.vue')
    },
    {
      path: '/ai-interpretation',
      name: 'AIInterpretation',
      component: () => import('@/views/AIInterpretationView.vue')
    },
    {
      path: '/learning-path',
      name: 'LearningPath',
      component: () => import('@/views/LearningPathView.vue')
    },
    {
      path: '/community',
      name: 'Community',
      component: () => import('@/views/CommunityView.vue')
    },
    {
      path: '/resource-library',
      name: 'ResourceLibrary',
      component: () => import('@/views/ResourceLibraryView.vue')
    },
    {
      path: '/about',
      name: 'About',
      component: () => import('@/views/AboutView.vue')
    },
    {
      path: '/decision-helper',
      name: 'DecisionHelper',
      component: () => import('@/views/DecisionHelperView.vue')
    },
    {
      path: '/picture-book',
      name: 'PictureBook',
      component: () => import('@/views/PictureBookView.vue')
    },
    {
      path: '/dao-business',
      name: 'DaoBusiness',
      component: () => import('@/views/DaoBusinessView.vue')
    },
    {
      path: '/dao-art',
      name: 'DaoArt',
      component: () => import('@/views/DaoArtView.vue')
    }
  ]
})

export default router