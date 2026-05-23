<template>
  <div data-testid="register-page" class="auth-quiet min-h-screen flex items-center justify-center p-4">
    <div class="auth-panel bg-light/95 w-full max-w-md overflow-hidden border border-secondary/30">
      <div class="auth-heading p-6 text-center">
        <h1 class="text-2xl font-bold text-primary">道德经学习</h1>
        <p class="text-dark/70 mt-2">创建账号后保存学习进度和章节笔记</p>
      </div>

      <div class="p-6">
        <form @submit.prevent="handleRegister" class="space-y-5" data-testid="register-form">
          <div>
            <label for="registerName" class="block text-sm font-medium text-dark mb-1">用户名</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="fas fa-user text-secondary" aria-hidden="true"></i>
              </div>
              <input
                id="registerName"
                v-model="registerForm.name"
                name="username"
                type="text"
                autocomplete="username"
                spellcheck="false"
                data-testid="register-name"
                class="w-full pl-10 pr-3 py-3 bg-white/90 border border-secondary/40 rounded-md text-dark placeholder:text-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-primary transition-colors duration-200"
                placeholder="请输入用户名…"
                required
              >
            </div>
          </div>

          <div>
            <label for="registerEmail" class="block text-sm font-medium text-dark mb-1">邮箱</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="fas fa-envelope text-secondary" aria-hidden="true"></i>
              </div>
              <input
                id="registerEmail"
                v-model="registerForm.email"
                name="email"
                type="email"
                autocomplete="email"
                spellcheck="false"
                data-testid="register-email"
                class="w-full pl-10 pr-3 py-3 bg-white/90 border border-secondary/40 rounded-md text-dark placeholder:text-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-primary transition-colors duration-200"
                placeholder="name@example.com…"
                required
              >
            </div>
          </div>

          <div>
            <label for="registerPassword" class="block text-sm font-medium text-dark mb-1">密码</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="fas fa-lock text-secondary" aria-hidden="true"></i>
              </div>
              <input
                id="registerPassword"
                v-model="registerForm.password"
                name="new-password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                data-testid="register-password"
                class="w-full pl-10 pr-10 py-3 bg-white/90 border border-secondary/40 rounded-md text-dark placeholder:text-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-primary transition-colors duration-200"
                placeholder="至少 8 位密码…"
                required
                @input="checkPasswordStrength"
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
            <div class="mt-1">
              <div class="flex justify-between text-xs text-secondary mb-1">
                <span>密码强度</span>
                <span :class="strengthColor">{{ strengthText }}</span>
              </div>
              <div class="w-full bg-secondary/20 rounded-full h-1.5">
                <div
                  class="h-1.5 rounded-full transition-[width,background-color] duration-300"
                  :class="strengthBarColor"
                  :style="{ width: strengthPercent + '%' }"
                ></div>
              </div>
            </div>
          </div>

          <div>
            <label for="registerConfirmPassword" class="block text-sm font-medium text-dark mb-1">确认密码</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="fas fa-lock text-secondary" aria-hidden="true"></i>
              </div>
              <input
                id="registerConfirmPassword"
                v-model="registerForm.confirmPassword"
                name="confirm-password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                data-testid="register-confirm-password"
                class="w-full pl-10 pr-10 py-3 bg-white/90 border border-secondary/40 rounded-md text-dark placeholder:text-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-primary transition-colors duration-200"
                placeholder="再次输入密码…"
                :aria-invalid="!!passwordMismatch"
                aria-describedby="passwordMismatchMessage"
                required
              >
            </div>
            <p v-if="passwordMismatch" id="passwordMismatchMessage" class="text-red-700 text-xs mt-1" aria-live="polite">两次输入的密码不一致，请重新输入</p>
          </div>

          <button
            type="submit"
            :disabled="isLoading || !!passwordMismatch"
            data-testid="register-submit"
            class="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-4 rounded-md transition-colors duration-200 flex items-center justify-center disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-light"
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
            <span class="px-2 bg-light text-secondary">或使用以下方式注册</span>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-4">
          <button type="button" aria-label="使用微信注册" @click="handleThirdPartyLogin" class="flex items-center justify-center p-3 border border-secondary/40 rounded-md hover:bg-secondary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors duration-200">
            <i class="fab fa-weixin text-primary text-xl" aria-hidden="true"></i>
          </button>
          <button type="button" aria-label="使用 QQ 注册" @click="handleThirdPartyLogin" class="flex items-center justify-center p-3 border border-secondary/40 rounded-md hover:bg-secondary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors duration-200">
            <i class="fab fa-qq text-primary text-xl" aria-hidden="true"></i>
          </button>
          <button type="button" aria-label="使用微博注册" @click="handleThirdPartyLogin" class="flex items-center justify-center p-3 border border-secondary/40 rounded-md hover:bg-secondary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors duration-200">
            <i class="fab fa-weibo text-primary text-xl" aria-hidden="true"></i>
          </button>
        </div>
      </div>

      <div class="bg-secondary/10 px-6 py-4 border-t border-secondary/30">
        <p class="text-center text-sm text-dark">
          已有账号?
          <router-link to="/login" data-testid="register-to-login" class="font-medium text-primary hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded transition-colors duration-200 ml-1">
            立即登录
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const { register } = authStore

const isLoading = ref(false)
const showPassword = ref(false)

const registerForm = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const handleThirdPartyLogin = () => {
  alert('第三方登录暂未开放，请使用账号密码登录')
}

const strengthPercent = ref(0)
const strengthText = ref('弱')
const strengthColor = ref('text-red-700')
const strengthBarColor = ref('bg-red-700')

const passwordMismatch = computed(() => {
  return registerForm.password && registerForm.confirmPassword && registerForm.password !== registerForm.confirmPassword
})

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
    router.push('/')
  } catch (error: any) {
    alert(error.message || '注册失败，请稍后重试')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.auth-quiet {
  background:
    linear-gradient(180deg, rgba(252, 252, 248, 0.98), rgba(249, 245, 235, 0.9)),
    repeating-linear-gradient(90deg, rgba(107, 72, 38, 0.04) 0 1px, transparent 1px 36px);
}

.auth-panel {
  border-radius: 8px;
  box-shadow: 0 18px 48px rgba(51, 51, 51, 0.1);
}

.auth-heading {
  border-bottom: 1px solid rgba(166, 124, 82, 0.22);
  background: rgba(249, 245, 235, 0.72);
}
</style>
