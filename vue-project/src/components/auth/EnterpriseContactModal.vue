<template>
  <div
    class="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in"
    data-testid="enterprise-contact-modal"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto relative border border-amber-200">
      <button
        type="button"
        class="absolute top-4 right-4 text-gray-400 hover:text-dark transition-colors z-10"
        @click="$emit('close')"
        aria-label="关闭"
      >
        <i class="fas fa-times text-2xl"></i>
      </button>

      <div class="p-8 md:p-10">
        <div class="text-center mb-6">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-100 mb-3">
            <i class="fas fa-handshake text-2xl text-amber-700"></i>
          </div>
          <h2 class="text-2xl font-bold text-primary font-serif">预约企业洽谈</h2>
          <p class="text-sm text-dark/60 mt-2">填写您的信息,我们会在 24 小时内联系您并安排专属顾问</p>
        </div>

        <!-- 成功状态 -->
        <div
          v-if="submitted"
          class="text-center py-10"
          data-testid="enterprise-submitted"
        >
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <i class="fas fa-check text-3xl text-green-600"></i>
          </div>
          <h3 class="text-xl font-bold text-dark mb-2">已收到您的需求</h3>
          <p class="text-sm text-dark/60 mb-6">商务团队将在 24 小时内主动联系您。<br/>感谢您对道德经 AI 的关注。</p>
          <button
            type="button"
            class="px-6 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
            @click="$emit('submitted')"
          >
            完成
          </button>
        </div>

        <!-- 表单 -->
        <form v-else @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-dark mb-1">姓名 <span class="text-red-500">*</span></label>
              <input
                v-model="form.name"
                type="text"
                required
                maxlength="100"
                placeholder="您的称呼"
                class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
                data-testid="lead-name-input"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-dark mb-1">邮箱 <span class="text-red-500">*</span></label>
              <input
                v-model="form.email"
                type="email"
                required
                maxlength="200"
                placeholder="您的工作邮箱"
                class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
                data-testid="lead-email-input"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-dark mb-1">公司名称</label>
              <input
                v-model="form.company"
                type="text"
                maxlength="200"
                placeholder="选填"
                class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
                data-testid="lead-company-input"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-dark mb-1">联系电话</label>
              <input
                v-model="form.phone"
                type="tel"
                maxlength="30"
                placeholder="选填"
                class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
                data-testid="lead-phone-input"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-dark mb-1">团队规模</label>
            <select
              v-model="form.teamSize"
              class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors bg-white"
              data-testid="lead-team-size-select"
            >
              <option value="">请选择</option>
              <option value="1-10">1-10 人</option>
              <option value="11-50">11-50 人</option>
              <option value="51-200">51-200 人</option>
              <option value="200+">200 人以上</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-dark mb-1">合作意向</label>
            <select
              v-model="form.intent"
              class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors bg-white"
              data-testid="lead-intent-select"
            >
              <option value="enterprise">企业私有部署</option>
              <option value="team">团队订阅</option>
              <option value="consulting">定制咨询 / API 接入</option>
              <option value="other">其他</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-dark mb-1">备注</label>
            <textarea
              v-model="form.note"
              rows="3"
              maxlength="1000"
              placeholder="简单描述您的使用场景或需求(可选,1000 字以内)"
              class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors resize-none"
              data-testid="lead-note-textarea"
            ></textarea>
            <p class="text-xs text-dark/40 mt-1 text-right">{{ form.note.length }} / 1000</p>
          </div>

          <div
            v-if="errorMessage"
            class="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700"
            data-testid="lead-error-message"
          >
            <i class="fas fa-circle-exclamation mr-1"></i>{{ errorMessage }}
          </div>

          <div class="flex flex-col-reverse md:flex-row md:justify-end gap-3 pt-2">
            <button
              type="button"
              class="px-6 py-2.5 rounded-lg border border-gray-300 text-dark hover:bg-gray-50 transition-colors"
              :disabled="submitting"
              @click="$emit('close')"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="px-6 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold hover:from-amber-600 hover:to-amber-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-md"
              data-testid="lead-submit-btn"
            >
              <i v-if="submitting" class="fas fa-spinner fa-spin mr-2"></i>
              <i v-else class="fas fa-paper-plane mr-2"></i>
              {{ submitting ? '提交中...' : '提交需求' }}
            </button>
          </div>

          <p class="text-xs text-dark/40 text-center pt-2">
            <i class="fas fa-shield-halved mr-1"></i>
            我们承诺仅在商务洽谈时使用您的信息,不会用于其他用途
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { apiClient } from '@/services/api'

defineEmits<{
  close: []
  submitted: []
}>()

const form = reactive({
  name: '',
  email: '',
  company: '',
  phone: '',
  teamSize: '',
  intent: 'enterprise',
  note: ''
})

const submitting = ref(false)
const submitted = ref(false)
const errorMessage = ref('')

async function handleSubmit() {
  if (!form.name.trim() || !form.email.trim()) {
    errorMessage.value = '请填写姓名和邮箱'
    return
  }

  submitting.value = true
  errorMessage.value = ''

  try {
    await apiClient<{ success: boolean; id: number }>('/leads', {
      method: 'POST',
      auth: false,
      body: {
        name: form.name.trim(),
        email: form.email.trim(),
        company: form.company.trim() || undefined,
        phone: form.phone.trim() || undefined,
        teamSize: form.teamSize || undefined,
        intent: form.intent,
        note: form.note.trim() || undefined
      }
    })
    submitted.value = true
  } catch (err: any) {
    errorMessage.value = err?.message || '提交失败,请稍后重试或直接邮件联系 contact@daodejing-ai.com'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fade-in {
  animation: fadeIn 0.25s ease-out;
}

:global(html.zen-mode) .bg-white {
  background-color: #2c2c2e;
  color: #d4b483;
}

:global(html.zen-mode) input,
:global(html.zen-mode) select,
:global(html.zen-mode) textarea {
  background-color: #1f1f23;
  color: #d4b483;
  border-color: #3f3f46;
}
</style>
