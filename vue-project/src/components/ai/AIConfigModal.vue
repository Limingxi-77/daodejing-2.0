<!-- AI配置弹窗组件 -->
<template>
  <div class="ai-config-modal" v-if="visible">
    <div class="modal-overlay" @click="closeModal"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">AI服务配置</h2>
        <button class="close-btn" @click="closeModal">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <!-- AI提供商选择 -->
        <div class="config-section">
          <h3 class="section-title">选择AI提供商</h3>
          <div class="provider-list">
            <div 
              v-for="provider in availableProviders" 
              :key="provider.name"
              class="provider-item"
              :class="{ active: selectedProvider === provider.name }"
              @click="selectProvider(provider.name)"
            >
              <div class="provider-icon">
                <i :class="getProviderIcon(provider.name)"></i>
              </div>
              <div class="provider-info">
                <h4 class="provider-name">{{ getProviderDisplayName(provider.name) }}</h4>
                <p class="provider-desc">{{ getProviderDescription(provider.name) }}</p>
              </div>
              <div class="provider-status" :class="{ connected: isProviderConnected(provider.name) }">
                {{ isProviderConnected(provider.name) ? '已连接' : '未配置' }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- API密钥配置 -->
        <div class="config-section" v-if="selectedProvider">
          <h3 class="section-title">API密钥配置</h3>
          <div class="api-key-input">
            <label class="input-label">{{ getProviderDisplayName(selectedProvider) }} API密钥</label>
            <div class="input-group">
              <input 
                type="password" 
                v-model="apiKey" 
                :placeholder="`请输入${getProviderDisplayName(selectedProvider)} API密钥`"
                class="api-key-field"
              />
              <button 
                class="toggle-visibility"
                @click="toggleKeyVisibility"
                type="button"
              >
                <i :class="showApiKey ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            <p class="help-text">
              {{ getAPIKeyHelp(selectedProvider) }}
            </p>
          </div>
        </div>
        
        <!-- 测试连接 -->
        <div class="config-section" v-if="selectedProvider && apiKey">
          <h3 class="section-title">测试连接</h3>
          <button 
            class="test-btn" 
            @click="testConnection"
            :disabled="testingConnection"
          >
            <i class="fas fa-plug"></i>
            {{ testingConnection ? '测试中...' : '测试连接' }}
          </button>
          <div class="test-result" v-if="testResult">
            <i :class="testResult.success ? 'fas fa-check-circle success' : 'fas fa-times-circle error'"></i>
            <span>{{ testResult.message }}</span>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn-secondary" @click="closeModal">取消</button>
        <button 
          class="btn-primary" 
          @click="saveConfig"
          :disabled="!selectedProvider || !apiKey || testingConnection"
        >
          保存配置
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  getAvailableProviders, 
  setAPIKey, 
  initializeAIService,
  getServiceStatus 
} from '@/services/directAIService'

// 组件属性
interface Props {
  visible: boolean
}

defineProps<Props>()

// 事件定义
const emit = defineEmits<{
  close: []
  save: [provider: string, apiKey: string]
}>()

// 响应式数据
const selectedProvider = ref<string>('')
const apiKey = ref<string>('')
const showApiKey = ref<boolean>(false)
const testingConnection = ref<boolean>(false)
const testResult = ref<{success: boolean, message: string} | null>(null)

// 计算属性
const availableProviders = computed(() => getAvailableProviders())

// 提供商信息
const providerInfo = {
  deepseek: {
    name: 'DeepSeek',
    icon: 'fas fa-brain',
    description: '国产AI模型，免费使用，支持中文对话',
    help: '在 DeepSeek 官网注册并获取API密钥'
  },
  openrouter: {
    name: 'OpenRouter',
    icon: 'fas fa-route',
    description: '聚合多个AI模型，包括Google Gemini等',
    help: '在 OpenRouter 官网注册并获取免费API密钥'
  }
}

// 方法
const getProviderDisplayName = (provider: string) => {
  return providerInfo[provider as keyof typeof providerInfo]?.name || provider
}

const getProviderIcon = (provider: string) => {
  return providerInfo[provider as keyof typeof providerInfo]?.icon || 'fas fa-robot'
}

const getProviderDescription = (provider: string) => {
  return providerInfo[provider as keyof typeof providerInfo]?.description || ''
}

const getAPIKeyHelp = (provider: string) => {
  return providerInfo[provider as keyof typeof providerInfo]?.help || '请输入API密钥'
}

const isProviderConnected = (provider: string) => {
  const status = getServiceStatus()
  return status.isConnected && status.currentProvider?.name === provider
}

const selectProvider = (provider: string) => {
  selectedProvider.value = provider
  testResult.value = null
  
  // 从localStorage加载已保存的API密钥
  const savedKey = localStorage.getItem(`ai_api_key_${provider}`)
  if (savedKey) {
    apiKey.value = savedKey
  } else {
    apiKey.value = ''
  }
}

const toggleKeyVisibility = () => {
  showApiKey.value = !showApiKey.value
}

const testConnection = async () => {
  if (!selectedProvider.value || !apiKey.value) return
  
  testingConnection.value = true
  testResult.value = null
  
  try {
    // 临时设置API密钥进行测试
    setAPIKey(selectedProvider.value, apiKey.value)
    
    const success = await initializeAIService(selectedProvider.value, apiKey.value)
    
    if (success) {
      testResult.value = {
        success: true,
        message: '连接测试成功！AI服务已就绪。'
      }
    } else {
      throw new Error('初始化失败')
    }
    
  } catch (error) {
    testResult.value = {
      success: false,
      message: `连接测试失败: ${error instanceof Error ? error.message : '未知错误'}`
    }
  } finally {
    testingConnection.value = false
  }
}

const saveConfig = async () => {
  if (!selectedProvider.value || !apiKey.value) return
  
  try {
    // 保存到localStorage
    localStorage.setItem(`ai_api_key_${selectedProvider.value}`, apiKey.value)
    
    // 初始化AI服务
    const success = await initializeAIService(selectedProvider.value, apiKey.value)
    
    if (success) {
      emit('save', selectedProvider.value, apiKey.value)
      closeModal()
    } else {
      throw new Error('AI服务初始化失败')
    }
    
  } catch (error) {
    testResult.value = {
      success: false,
      message: `保存失败: ${error instanceof Error ? error.message : '未知错误'}`
    }
  }
}

const closeModal = () => {
  emit('close')
  resetForm()
}

const resetForm = () => {
  selectedProvider.value = ''
  apiKey.value = ''
  showApiKey.value = false
  testingConnection.value = false
  testResult.value = null
}

// 生命周期
onMounted(() => {
  // 检查是否有已保存的配置
  const savedProvider = localStorage.getItem('ai_provider')
  if (savedProvider && availableProviders.value.some(p => p.name === savedProvider)) {
    selectProvider(savedProvider)
  }
})
</script>

<style scoped>
.ai-config-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: relative;
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #212529;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #6c757d;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: #f8f9fa;
}

.modal-body {
  padding: 1.5rem;
}

.config-section {
  margin-bottom: 2rem;
}

.config-section:last-child {
  margin-bottom: 0;
}

.section-title {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #495057;
}

.provider-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.provider-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  gap: 1rem;
}

.provider-item:hover {
  border-color: #007bff;
}

.provider-item.active {
  border-color: #007bff;
  background-color: #f8f9fa;
}

.provider-icon {
  width: 3rem;
  height: 3rem;
  background: #007bff;
  color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.provider-info {
  flex: 1;
}

.provider-name {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #212529;
}

.provider-desc {
  margin: 0;
  font-size: 0.875rem;
  color: #6c757d;
}

.provider-status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  background: #e9ecef;
  color: #6c757d;
}

.provider-status.connected {
  background: #d4edda;
  color: #155724;
}

.api-key-input {
  margin-bottom: 1rem;
}

.input-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #495057;
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.api-key-field {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.875rem;
}

.api-key-field:focus {
  outline: none;
  border-color: #007bff;
}

.toggle-visibility {
  position: absolute;
  right: 0.5rem;
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 0.25rem;
}

.help-text {
  margin: 0.5rem 0 0 0;
  font-size: 0.75rem;
  color: #6c757d;
}

.test-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.test-btn:hover:not(:disabled) {
  background: #218838;
}

.test-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.test-result {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  font-size: 0.875rem;
}

.test-result .success {
  color: #28a745;
}

.test-result .error {
  color: #dc3545;
}

.modal-footer {
  display: flex;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e9ecef;
  justify-content: flex-end;
}

.btn-primary, .btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-primary:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}
</style>