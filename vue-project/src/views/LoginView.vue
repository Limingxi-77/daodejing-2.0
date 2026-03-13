<template>
  <div class="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
      <!-- 头部 -->
      <div class="bg-green-600 p-6 text-center">
        <h1 class="text-2xl font-bold text-white">道德经AI平台</h1>
        <p class="text-green-100 mt-2">登录您的账号</p>
      </div>
      
      <!-- 登录表单 -->
      <div class="p-6">
        <form @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="fas fa-envelope text-gray-400"></i>
              </div>
              <input 
                v-model="loginForm.email"
                type="email" 
                class="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" 
                placeholder="请输入邮箱" 
                required
              >
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">密码</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="fas fa-lock text-gray-400"></i>
              </div>
              <input 
                v-model="loginForm.password"
                :type="showPassword ? 'text' : 'password'" 
                class="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" 
                placeholder="请输入密码" 
                required
              >
              <button 
                type="button" 
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-green-600"
              >
                <i :class="showPassword ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
              </button>
            </div>
          </div>
          
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input id="rememberMe" type="checkbox" class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded">
              <label for="rememberMe" class="ml-2 block text-sm text-gray-700">记住我</label>
            </div>
            <div class="text-sm">
              <a href="#" class="font-medium text-green-600 hover:text-green-800 transition-colors">忘记密码?</a>
            </div>
          </div>
          
          <div>
            <button 
              type="submit" 
              :disabled="isLoading"
              class="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-md transition-colors flex items-center justify-center disabled:opacity-70"
            >
              <span>登录</span>
              <i v-if="isLoading" class="fas fa-spinner fa-spin ml-2"></i>
            </button>
          </div>
        </form>
        
        <!-- 分隔线 -->
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-200"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500">或使用以下方式登录</span>
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
      
      <!-- 底部 -->
      <div class="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <p class="text-center text-sm text-gray-700">
          还没有账号? 
          <router-link to="/register" class="font-medium text-green-600 hover:text-green-800 transition-colors ml-1">
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

// 表单数据
const loginForm = reactive({
  email: '',
  password: ''
})

// 方法：处理登录
const handleLogin = async () => {
  // 表单验证
  if (!loginForm.email || !loginForm.password) {
    alert('请填写邮箱和密码')
    return
  }
  
  isLoading.value = true
  try {
    await login(loginForm.email, loginForm.password)
    // 登录成功后跳转到首页
    router.push('/')
  } catch (error: any) {
    alert(error.message || '登录失败，请检查邮箱和密码')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* 可以添加额外的样式 */
</style>