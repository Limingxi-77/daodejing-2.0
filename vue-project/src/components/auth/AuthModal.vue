<template>
  <div v-if="isAuthModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
    <div class="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-fade-in">
      <!-- 模态框头部 -->
      <div class="bg-primary text-white p-4 flex justify-between items-center">
        <h2 class="text-xl font-bold">{{ authMode === 'login' ? '账号登录' : '账号注册' }}</h2>
        <button @click="closeAuthModal" class="text-white hover:text-accent transition-colors">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      
      <!-- 模态框内容 -->
      <div class="p-6">
        <!-- 登录表单 -->
        <form v-if="authMode === 'login'" @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-dark mb-1">邮箱</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="fas fa-envelope text-secondary"></i>
              </div>
              <input 
                v-model="loginForm.email"
                type="email" 
                class="w-full pl-10 pr-3 py-3 border border-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all" 
                placeholder="请输入邮箱" 
                required
              >
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-dark mb-1">密码</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="fas fa-lock text-secondary"></i>
              </div>
              <input 
                v-model="loginForm.password"
                :type="showPassword ? 'text' : 'password'" 
                class="w-full pl-10 pr-10 py-3 border border-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all" 
                placeholder="请输入密码" 
                required
              >
              <button 
                type="button" 
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary hover:text-primary"
              >
                <i :class="showPassword ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
              </button>
            </div>
          </div>
          
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input id="rememberMe" type="checkbox" class="h-4 w-4 text-accent focus:ring-accent border-secondary rounded">
              <label for="rememberMe" class="ml-2 block text-sm text-dark">记住我</label>
            </div>
            <div class="text-sm">
              <a href="#" class="font-medium text-primary hover:text-accent transition-colors">忘记密码?</a>
            </div>
          </div>
          
          <div>
            <button 
              type="submit" 
              :disabled="isLoading"
              class="w-full bg-primary hover:bg-opacity-90 text-white font-semibold py-3 px-4 rounded-md transition-colors flex items-center justify-center disabled:opacity-70"
            >
              <span>登录</span>
              <i v-if="isLoading" class="fas fa-spinner fa-spin ml-2"></i>
            </button>
          </div>
        </form>

        <!-- 注册表单 -->
        <form v-else @submit.prevent="handleRegister" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-dark mb-1">用户名</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="fas fa-user text-secondary"></i>
              </div>
              <input 
                v-model="registerForm.name"
                type="text" 
                class="w-full pl-10 pr-3 py-3 border border-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all" 
                placeholder="请输入用户名" 
                required
              >
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-dark mb-1">邮箱</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="fas fa-envelope text-secondary"></i>
              </div>
              <input 
                v-model="registerForm.email"
                type="email" 
                class="w-full pl-10 pr-3 py-3 border border-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all" 
                placeholder="请输入邮箱" 
                required
              >
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-dark mb-1">密码</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="fas fa-lock text-secondary"></i>
              </div>
              <input 
                v-model="registerForm.password"
                :type="showPassword ? 'text' : 'password'" 
                class="w-full pl-10 pr-10 py-3 border border-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all" 
                placeholder="请输入密码（至少8位）" 
                required
                @input="checkPasswordStrength"
              >
              <button 
                type="button" 
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary hover:text-primary"
              >
                <i :class="showPassword ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
              </button>
            </div>
            <!-- 密码强度指示器 -->
            <div class="mt-1">
              <div class="flex justify-between text-xs text-secondary mb-1">
                <span>密码强度</span>
                <span :class="strengthColor">{{ strengthText }}</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  class="h-1.5 rounded-full transition-all duration-300" 
                  :class="strengthBarColor"
                  :style="{ width: strengthPercent + '%' }"
                ></div>
              </div>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-dark mb-1">确认密码</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="fas fa-lock text-secondary"></i>
              </div>
              <input 
                v-model="registerForm.confirmPassword"
                :type="showPassword ? 'text' : 'password'" 
                class="w-full pl-10 pr-10 py-3 border border-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all" 
                placeholder="请确认密码" 
                required
              >
            </div>
            <p v-if="passwordMismatch" class="text-red-500 text-xs mt-1">两次输入的密码不一致</p>
          </div>
          
          <div>
            <button 
              type="submit" 
              :disabled="isLoading || !!passwordMismatch"
              class="w-full bg-primary hover:bg-opacity-90 text-white font-semibold py-3 px-4 rounded-md transition-colors flex items-center justify-center disabled:opacity-70"
            >
              <span>注册</span>
              <i v-if="isLoading" class="fas fa-spinner fa-spin ml-2"></i>
            </button>
          </div>
        </form>
        
        <!-- 分隔线 -->
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-secondary border-opacity-30"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-secondary">或使用以下方式登录</span>
          </div>
        </div>
        
        <!-- 社交媒体登录 -->
        <div class="grid grid-cols-3 gap-4">
          <button class="flex items-center justify-center p-3 border border-gray-300 rounded-md hover:bg-green-50 transition-colors">
            <i class="fab fa-weixin text-green-600 text-xl"></i>
          </button>
          <button class="flex items-center justify-center p-3 border border-gray-300 rounded-md hover:bg-blue-50 transition-colors">
            <i class="fab fa-qq text-blue-500 text-xl"></i>
          </button>
          <button class="flex items-center justify-center p-3 border border-gray-300 rounded-md hover:bg-red-50 transition-colors">
            <i class="fab fa-weibo text-red-500 text-xl"></i>
          </button>
        </div>
      </div>
      
      <!-- 模态框底部 -->
      <div class="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <p class="text-center text-sm text-dark">
          {{ authMode === 'login' ? '还没有账号?' : '已有账号?' }} 
          <button 
            @click="toggleMode" 
            class="font-medium text-primary hover:text-accent transition-colors ml-1"
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

// 表单数据
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

// 密码强度状态
const strengthPercent = ref(0)
const strengthText = ref('弱')
const strengthColor = ref('text-red-500')
const strengthBarColor = ref('bg-red-500')

// 计算属性：检查密码是否匹配
const passwordMismatch = computed(() => {
  return registerForm.password && registerForm.confirmPassword && registerForm.password !== registerForm.confirmPassword
})

// 方法：切换登录/注册模式
const toggleMode = () => {
  openAuthModal(authMode.value === 'login' ? 'register' : 'login')
  // 重置表单
  loginForm.email = ''
  loginForm.password = ''
  registerForm.name = ''
  registerForm.email = ''
  registerForm.password = ''
  registerForm.confirmPassword = ''
  strengthPercent.value = 0
}

// 方法：检查密码强度
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
      strengthColor.value = 'text-red-500'
      strengthBarColor.value = 'bg-red-500'
      break
    case 2:
      strengthPercent.value = 50
      strengthText.value = '中'
      strengthColor.value = 'text-yellow-500'
      strengthBarColor.value = 'bg-yellow-500'
      break
    case 3:
      strengthPercent.value = 75
      strengthText.value = '良好'
      strengthColor.value = 'text-blue-500'
      strengthBarColor.value = 'bg-blue-500'
      break
    case 4:
      strengthPercent.value = 100
      strengthText.value = '强'
      strengthColor.value = 'text-green-500'
      strengthBarColor.value = 'bg-green-500'
      break
  }
}

// 方法：处理登录
const handleLogin = async () => {
  isLoading.value = true
  try {
    await login(loginForm.email)
  } finally {
    isLoading.value = false
  }
}

// 方法：处理注册
const handleRegister = async () => {
  isLoading.value = true
  try {
    await register(registerForm.name, registerForm.email)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
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
