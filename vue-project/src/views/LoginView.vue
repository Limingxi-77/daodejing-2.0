<template>
  <div data-testid="login-page" class="min-h-screen bg-background bg-traditional-pattern flex items-center justify-center p-4">
    <div class="bg-light/95 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-secondary/30">
      <div class="bg-gradient-to-br from-primary via-secondary to-primary p-6 text-center">
        <h1 class="text-2xl font-bold text-white">道德经AI平台</h1>
        <p class="text-light mt-2">登录您的账号</p>
      </div>

      <div class="p-6">
        <form @submit.prevent="handleLogin" class="space-y-5" data-testid="login-form">
          <div>
            <label for="loginEmail" class="block text-sm font-medium text-dark mb-1">邮箱</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="fas fa-envelope text-secondary" aria-hidden="true"></i>
              </div>
              <input
                id="loginEmail"
                v-model="loginForm.email"
                name="email"
                type="email"
                autocomplete="email"
                spellcheck="false"
                data-testid="login-email"
                class="w-full pl-10 pr-3 py-3 bg-white/90 border border-secondary/40 rounded-md text-dark placeholder:text-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-primary transition-colors duration-200"
                placeholder="name@example.com…"
                required
              >
            </div>
          </div>

          <div>
            <label for="loginPassword" class="block text-sm font-medium text-dark mb-1">密码</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="fas fa-lock text-secondary" aria-hidden="true"></i>
              </div>
              <input
                id="loginPassword"
                v-model="loginForm.password"
                name="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                data-testid="login-password"
                class="w-full pl-10 pr-10 py-3 bg-white/90 border border-secondary/40 rounded-md text-dark placeholder:text-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-primary transition-colors duration-200"
                placeholder="请输入密码…"
                required
              >
              <button
                type="button"
                @click="showPassword = !showPassword"
                :aria-label="showPassword ? '隐藏密码' : '显示密码'"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded transition-colors duration-200"
              >
                <i :class="showPassword ? 'fas fa-eye' : 'fas fa-eye-slash'" aria-hidden="true"></i>
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <label for="rememberMe" class="flex items-center text-sm text-dark cursor-pointer">
              <input id="rememberMe" name="rememberMe" type="checkbox" class="h-4 w-4 text-primary focus-visible:ring-accent border-secondary/50 rounded">
              <span class="ml-2">记住我</span>
            </label>
            <div class="text-sm">
              <button type="button" class="font-medium text-primary hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded transition-colors duration-200">忘记密码?</button>
            </div>
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            data-testid="login-submit"
            class="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-4 rounded-md transition-colors duration-200 flex items-center justify-center disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-light"
          >
            <span>登录</span>
            <i v-if="isLoading" class="fas fa-spinner fa-spin ml-2" aria-hidden="true"></i>
          </button>
        </form>

        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-secondary/30"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-light text-secondary">或使用以下方式登录</span>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-4">
          <button type="button" aria-label="使用微信登录" class="flex items-center justify-center p-3 border border-secondary/40 rounded-md hover:bg-secondary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors duration-200">
            <i class="fab fa-weixin text-primary text-xl" aria-hidden="true"></i>
          </button>
          <button type="button" aria-label="使用 QQ 登录" class="flex items-center justify-center p-3 border border-secondary/40 rounded-md hover:bg-secondary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors duration-200">
            <i class="fab fa-qq text-primary text-xl" aria-hidden="true"></i>
          </button>
          <button type="button" aria-label="使用微博登录" class="flex items-center justify-center p-3 border border-secondary/40 rounded-md hover:bg-secondary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors duration-200">
            <i class="fab fa-weibo text-primary text-xl" aria-hidden="true"></i>
          </button>
        </div>
      </div>

      <div class="bg-secondary/10 px-6 py-4 border-t border-secondary/30">
        <p class="text-center text-sm text-dark">
          还没有账号?
          <router-link to="/register" data-testid="login-to-register" class="font-medium text-primary hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded transition-colors duration-200 ml-1">
            立即注册
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const { login } = authStore

const isLoading = ref(false)
const showPassword = ref(false)

const loginForm = reactive({
  email: '',
  password: ''
})

const handleLogin = async () => {
  if (!loginForm.email || !loginForm.password) {
    alert('请填写邮箱和密码')
    return
  }

  isLoading.value = true
  try {
    await login(loginForm.email, loginForm.password)
    router.push('/')
  } catch (error: any) {
    alert(error.message || '登录失败，请检查邮箱和密码')
  } finally {
    isLoading.value = false
  }
}
</script>