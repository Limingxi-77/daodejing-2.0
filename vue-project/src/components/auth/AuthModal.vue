<template>
  <div
    v-if="isAuthModalOpen"
    class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4 overscroll-contain"
    role="dialog"
    aria-modal="true"
    aria-labelledby="authModalTitle"
    @keydown.esc="closeAuthModal"
  >
    <div class="w-full max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto rounded-xl border border-secondary/30 bg-light shadow-2xl animate-fade-in">
      <div class="flex items-center justify-between bg-gradient-to-br from-primary via-secondary to-primary p-4 text-white">
        <h2 id="authModalTitle" class="text-xl font-bold">
          {{ authMode === 'login' ? '账号登录' : '账号注册' }}
        </h2>
        <button
          type="button"
          aria-label="关闭登录注册窗口"
          @click="closeAuthModal"
          class="rounded text-white transition-colors duration-200 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <i class="fas fa-times text-xl" aria-hidden="true"></i>
        </button>
      </div>

      <div class="p-6">
        <form v-if="authMode === 'login'" @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label for="modalLoginEmail" class="mb-1 block text-sm font-medium text-dark">邮箱</label>
            <div class="relative">
              <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <i class="fas fa-envelope text-secondary" aria-hidden="true"></i>
              </div>
              <input
                id="modalLoginEmail"
                v-model="loginForm.email"
                name="email"
                type="email"
                autocomplete="email"
                spellcheck="false"
                class="w-full rounded-md border border-secondary/40 bg-white/90 py-3 pl-10 pr-3 text-dark placeholder:text-secondary/60 transition-colors duration-200 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                placeholder="name@example.com…"
                required
              >
            </div>
          </div>

          <div>
            <label for="modalLoginPassword" class="mb-1 block text-sm font-medium text-dark">密码</label>
            <div class="relative">
              <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <i class="fas fa-lock text-secondary" aria-hidden="true"></i>
              </div>
              <input
                id="modalLoginPassword"
                v-model="loginForm.password"
                name="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                class="w-full rounded-md border border-secondary/40 bg-white/90 py-3 pl-10 pr-10 text-dark placeholder:text-secondary/60 transition-colors duration-200 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                placeholder="请输入密码…"
                required
              >
              <button
                type="button"
                :aria-label="showPassword ? '隐藏密码' : '显示密码'"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 flex items-center rounded pr-3 text-secondary transition-colors duration-200 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <i :class="showPassword ? 'fas fa-eye' : 'fas fa-eye-slash'" aria-hidden="true"></i>
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <label for="modalRememberMe" class="flex cursor-pointer items-center text-sm text-dark">
              <input
                id="modalRememberMe"
                name="rememberMe"
                type="checkbox"
                class="h-4 w-4 rounded border-secondary/50 text-primary focus-visible:ring-accent"
              >
              <span class="ml-2">记住我</span>
            </label>
            <button
              type="button"
              class="rounded text-sm font-medium text-primary transition-colors duration-200 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              忘记密码?
            </button>
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="flex w-full items-center justify-center rounded-md bg-primary px-4 py-3 font-semibold text-white transition-colors duration-200 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-light disabled:opacity-70"
          >
            <span>登录</span>
            <i v-if="isLoading" class="fas fa-spinner fa-spin ml-2" aria-hidden="true"></i>
          </button>
        </form>

        <form v-else @submit.prevent="handleRegister" class="space-y-5">
          <div>
            <label for="modalRegisterName" class="mb-1 block text-sm font-medium text-dark">用户名</label>
            <div class="relative">
              <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <i class="fas fa-user text-secondary" aria-hidden="true"></i>
              </div>
              <input
                id="modalRegisterName"
                v-model="registerForm.name"
                name="username"
                type="text"
                autocomplete="username"
                spellcheck="false"
                class="w-full rounded-md border border-secondary/40 bg-white/90 py-3 pl-10 pr-3 text-dark placeholder:text-secondary/60 transition-colors duration-200 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                placeholder="请输入用户名…"
                required
              >
            </div>
          </div>

          <div>
            <label for="modalRegisterEmail" class="mb-1 block text-sm font-medium text-dark">邮箱</label>
            <div class="relative">
              <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <i class="fas fa-envelope text-secondary" aria-hidden="true"></i>
              </div>
              <input
                id="modalRegisterEmail"
                v-model="registerForm.email"
                name="email"
                type="email"
                autocomplete="email"
                spellcheck="false"
                class="w-full rounded-md border border-secondary/40 bg-white/90 py-3 pl-10 pr-3 text-dark placeholder:text-secondary/60 transition-colors duration-200 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                placeholder="name@example.com…"
                required
              >
            </div>
          </div>

          <div>
            <label for="modalRegisterPassword" class="mb-1 block text-sm font-medium text-dark">密码</label>
            <div class="relative">
              <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <i class="fas fa-lock text-secondary" aria-hidden="true"></i>
              </div>
              <input
                id="modalRegisterPassword"
                v-model="registerForm.password"
                name="new-password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                class="w-full rounded-md border border-secondary/40 bg-white/90 py-3 pl-10 pr-10 text-dark placeholder:text-secondary/60 transition-colors duration-200 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                placeholder="至少 8 位密码…"
                required
                @input="checkPasswordStrength"
              >
              <button
                type="button"
                :aria-label="showPassword ? '隐藏密码' : '显示密码'"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 flex items-center rounded pr-3 text-secondary transition-colors duration-200 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <i :class="showPassword ? 'fas fa-eye' : 'fas fa-eye-slash'" aria-hidden="true"></i>
              </button>
            </div>

            <div class="mt-1">
              <div class="mb-1 flex justify-between text-xs text-secondary">
                <span>密码强度</span>
                <span :class="strengthColor">{{ strengthText }}</span>
              </div>
              <div class="h-1.5 w-full rounded-full bg-secondary/20">
                <div
                  class="h-1.5 rounded-full transition-[width,background-color] duration-300"
                  :class="strengthBarColor"
                  :style="{ width: strengthPercent + '%' }"
                ></div>
              </div>
            </div>
          </div>

          <div>
            <label for="modalRegisterConfirmPassword" class="mb-1 block text-sm font-medium text-dark">确认密码</label>
            <div class="relative">
              <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <i class="fas fa-lock text-secondary" aria-hidden="true"></i>
              </div>
              <input
                id="modalRegisterConfirmPassword"
                v-model="registerForm.confirmPassword"
                name="confirm-password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                class="w-full rounded-md border border-secondary/40 bg-white/90 py-3 pl-10 pr-10 text-dark placeholder:text-secondary/60 transition-colors duration-200 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                placeholder="再次输入密码…"
                :aria-invalid="!!passwordMismatch"
                aria-describedby="modalPasswordMismatchMessage"
                required
              >
            </div>
            <p
              v-if="passwordMismatch"
              id="modalPasswordMismatchMessage"
              class="mt-1 text-xs text-red-700"
              aria-live="polite"
            >
              两次输入的密码不一致，请重新输入
            </p>
          </div>

          <button
            type="submit"
            :disabled="isLoading || !!passwordMismatch"
            class="flex w-full items-center justify-center rounded-md bg-primary px-4 py-3 font-semibold text-white transition-colors duration-200 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-light disabled:opacity-70"
          >
            <span>注册</span>
            <i v-if="isLoading" class="fas fa-spinner fa-spin ml-2" aria-hidden="true"></i>
          </button>
        </form>

        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-secondary/30"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="bg-light px-2 text-secondary">
              {{ authMode === 'login' ? '或使用以下方式登录' : '或使用以下方式注册' }}
            </span>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-4">
          <button
            type="button"
            :aria-label="authMode === 'login' ? '使用微信登录' : '使用微信注册'"
            class="flex items-center justify-center rounded-md border border-secondary/40 p-3 transition-colors duration-200 hover:bg-secondary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <i class="fab fa-weixin text-xl text-primary" aria-hidden="true"></i>
          </button>
          <button
            type="button"
            :aria-label="authMode === 'login' ? '使用 QQ 登录' : '使用 QQ 注册'"
            class="flex items-center justify-center rounded-md border border-secondary/40 p-3 transition-colors duration-200 hover:bg-secondary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <i class="fab fa-qq text-xl text-primary" aria-hidden="true"></i>
          </button>
          <button
            type="button"
            :aria-label="authMode === 'login' ? '使用微博登录' : '使用微博注册'"
            class="flex items-center justify-center rounded-md border border-secondary/40 p-3 transition-colors duration-200 hover:bg-secondary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <i class="fab fa-weibo text-xl text-primary" aria-hidden="true"></i>
          </button>
        </div>
      </div>

      <div class="border-t border-secondary/30 bg-secondary/10 px-6 py-4">
        <p class="text-center text-sm text-dark">
          {{ authMode === 'login' ? '还没有账号?' : '已有账号?' }}
          <button
            type="button"
            @click="toggleMode"
            class="ml-1 rounded font-medium text-primary transition-colors duration-200 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {{ authMode === 'login' ? '立即注册' : '立即登录' }}
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const { isAuthModalOpen, authMode } = storeToRefs(authStore)
const { login, register, closeAuthModal, openAuthModal } = authStore

const isLoading = ref(false)
const showPassword = ref(false)

const loginForm = reactive({
  email: '',
  password: ''
})

const registerForm = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const strengthPercent = ref(0)
const strengthText = ref('弱')
const strengthColor = ref('text-red-700')
const strengthBarColor = ref('bg-red-700')

const passwordMismatch = computed(() => {
  return registerForm.password && registerForm.confirmPassword && registerForm.password !== registerForm.confirmPassword
})

const resetForms = () => {
  loginForm.email = ''
  loginForm.password = ''
  registerForm.name = ''
  registerForm.email = ''
  registerForm.password = ''
  registerForm.confirmPassword = ''
  strengthPercent.value = 0
  strengthText.value = '弱'
  strengthColor.value = 'text-red-700'
  strengthBarColor.value = 'bg-red-700'
  showPassword.value = false
}

const toggleMode = () => {
  openAuthModal(authMode.value === 'login' ? 'register' : 'login')
  resetForms()
}

const checkPasswordStrength = () => {
  const pwd = registerForm.password
  let strength = 0

  if (pwd.length >= 8) strength++
  if (pwd.match(/[A-Z]/)) strength++
  if (pwd.match(/[0-9]/)) strength++
  if (pwd.match(/[^A-Za-z0-9]/)) strength++

  switch (strength) {
    case 0:
    case 1:
      strengthPercent.value = 25
      strengthText.value = '弱'
      strengthColor.value = 'text-red-700'
      strengthBarColor.value = 'bg-red-700'
      break
    case 2:
      strengthPercent.value = 50
      strengthText.value = '中'
      strengthColor.value = 'text-secondary'
      strengthBarColor.value = 'bg-secondary'
      break
    case 3:
      strengthPercent.value = 75
      strengthText.value = '良好'
      strengthColor.value = 'text-primary'
      strengthBarColor.value = 'bg-primary'
      break
    case 4:
      strengthPercent.value = 100
      strengthText.value = '强'
      strengthColor.value = 'text-accent'
      strengthBarColor.value = 'bg-accent'
      break
  }
}

const handleLogin = async () => {
  if (!loginForm.email || !loginForm.password) {
    alert('请填写邮箱和密码')
    return
  }

  isLoading.value = true
  try {
    await login(loginForm.email, loginForm.password)
  } catch (error: any) {
    alert(error.message || '登录失败，请检查邮箱和密码')
  } finally {
    isLoading.value = false
  }
}

const handleRegister = async () => {
  if (!registerForm.name || !registerForm.email || !registerForm.password || !registerForm.confirmPassword) {
    alert('请填写所有必填字段')
    return
  }

  if (passwordMismatch.value) {
    alert('两次输入的密码不一致')
    return
  }

  if (strengthPercent.value < 50) {
    alert('密码强度不足，请使用更强的密码')
    return
  }

  isLoading.value = true
  try {
    await register(registerForm.name, registerForm.email, registerForm.password)
  } catch (error: any) {
    alert(error.message || '注册失败，请稍后重试')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@media (prefers-reduced-motion: reduce) {
  .animate-fade-in {
    animation: none;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>