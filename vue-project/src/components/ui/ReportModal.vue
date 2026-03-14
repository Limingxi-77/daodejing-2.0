<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4" @click.self="$emit('close')">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-lg font-bold text-dark">
          <i class="fas fa-exclamation-triangle text-red-500 mr-2"></i>
          举报内容
        </h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-dark">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="p-6">
        <p class="text-sm text-gray-500 mb-4">
          请选择举报原因，我们会尽快处理您的举报。
        </p>
        
        <div class="space-y-2 mb-4">
          <label
            v-for="reason in reasons"
            :key="reason.value"
            :class="[
              'flex items-center p-3 rounded-lg border cursor-pointer transition-all',
              selectedReason === reason.value
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-gray-300'
            ]"
          >
            <input
              type="radio"
              :value="reason.value"
              v-model="selectedReason"
              class="w-4 h-4 text-primary focus:ring-primary"
            >
            <div class="ml-3">
              <span class="font-medium text-dark">{{ reason.label }}</span>
              <p class="text-xs text-gray-500 mt-0.5">{{ reason.description }}</p>
            </div>
          </label>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-dark mb-2">详细说明（可选）</label>
          <textarea
            v-model="description"
            class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            rows="3"
            placeholder="请提供更多详细信息..."
            maxlength="500"
          ></textarea>
          <div class="text-right text-xs text-gray-400 mt-1">{{ description.length }} / 500</div>
        </div>
      </div>
      
      <div class="p-4 bg-gray-50 flex justify-end gap-3">
        <button
          @click="$emit('close')"
          class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
        >
          取消
        </button>
        <button
          @click="submitReport"
          :disabled="!selectedReason || submitting"
          class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i v-if="submitting" class="fas fa-spinner fa-spin mr-1"></i>
          {{ submitting ? '提交中...' : '提交举报' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  targetId: string
  targetType: 'post' | 'comment' | 'user'
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  submit: []
}>()

const reasons = [
  { value: 'spam', label: '垃圾信息', description: '广告、重复内容、无意义信息' },
  { value: 'harassment', label: '骚扰辱骂', description: '人身攻击、歧视性言论' },
  { value: 'inappropriate', label: '不当内容', description: '色情、暴力、违法内容' },
  { value: 'misinformation', label: '虚假信息', description: '谣言、误导性内容' },
  { value: 'copyright', label: '侵权内容', description: '抄袭、盗用他人作品' },
  { value: 'other', label: '其他原因', description: '其他违规行为' }
]

const selectedReason = ref('')
const description = ref('')
const submitting = ref(false)

const submitReport = async () => {
  if (!selectedReason.value) return
  
  submitting.value = true
  
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const reportData = {
    targetId: props.targetId,
    targetType: props.targetType,
    reason: selectedReason.value,
    description: description.value,
    createdAt: new Date().toISOString()
  }
  
  console.log('Report submitted:', reportData)
  
  const reports = JSON.parse(localStorage.getItem('reports') || '[]')
  reports.push(reportData)
  localStorage.setItem('reports', JSON.stringify(reports))
  
  submitting.value = false
  emit('submit')
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

:global(html.zen-mode) .bg-white {
  background-color: #2c2c2e;
}

:global(html.zen-mode) .text-dark {
  color: #d4b483;
}

:global(html.zen-mode) .border-gray-200,
:global(html.zen-mode) .border-gray-100 {
  border-color: #3f3f46;
}

:global(html.zen-mode) .bg-gray-50 {
  background-color: #1c1c1e;
}

:global(html.zen-mode) .text-gray-500,
:global(html.zen-mode) .text-gray-700 {
  color: #9ca3af;
}
</style>
