<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg p-6 md:p-8 max-w-md w-full relative shadow-xl transform transition-all">
      <!-- 关闭按钮 -->
      <button 
        @click="$emit('close')" 
        class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
      >
        <i class="fas fa-times text-xl"></i>
      </button>
      
      <div class="mb-2">
        <h2 class="text-xl font-bold text-primary mb-2">
          <span v-if="isReview" class="text-secondary mr-1">复习：</span>
          {{ title }}
        </h2>
        <div class="w-full h-1 bg-gray-100 rounded mb-4"></div>
        <p class="text-lg font-medium text-dark mb-4">请回答以下问题：</p>
        
        <div class="mb-6">
          <p class="text-dark mb-4 font-medium bg-gray-50 p-3 rounded border-l-4 border-accent">
            {{ question.question }}
          </p>
          
          <div class="space-y-2">
            <div 
              v-for="option in question.options" 
              :key="option.id"
              @click="selectedOption = option.id"
              :class="['flex items-center cursor-pointer p-3 rounded border transition-all', selectedOption === option.id ? 'bg-primary/5 border-primary' : 'hover:bg-gray-50 border-transparent']"
            >
              <div :class="['w-5 h-5 rounded-full border flex items-center justify-center mr-3', selectedOption === option.id ? 'border-primary' : 'border-gray-400']">
                <div v-if="selectedOption === option.id" class="w-2.5 h-2.5 rounded-full bg-primary"></div>
              </div>
              <span class="text-gray-700 flex-1">{{ option.id }}. {{ option.text }}</span>
            </div>
          </div>
        </div>
        
        <!-- 反馈信息 -->
        <div v-if="feedback.show" :class="['mb-6 p-4 rounded-md', feedback.isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800']">
          <div class="flex items-start">
            <i :class="['fas mt-1 mr-2', feedback.isCorrect ? 'fa-check-circle' : 'fa-times-circle']"></i>
            <div>
              <p class="font-bold mb-1">{{ feedback.isCorrect ? '回答正确！' : '回答错误' }}</p>
              <p class="text-sm whitespace-pre-line">{{ feedback.message }}</p>
            </div>
          </div>
        </div>
        
        <div class="flex space-x-4">
          <button 
            @click="checkAnswer" 
            :disabled="!selectedOption || feedback.show"
            class="btn-primary flex-1 py-2 rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            检查答案
          </button>
          <button 
            v-if="feedback.isCorrect"
            @click="$emit('complete')"
            class="btn-secondary flex-1 py-2 rounded-md hover:bg-opacity-90 transition-colors"
          >
            {{ isReview ? '完成复习' : '下一课' }}
          </button>
          <button 
            v-else
            @click="$emit('close')" 
            class="px-4 py-2 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50 transition-colors"
          >
            {{ feedback.show ? '关闭' : '取消' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Option {
  id: string
  text: string
}

interface Question {
  question: string
  options: Option[]
  correctAnswer: string
  explanation: string
}

const props = defineProps<{
  title: string
  question: Question
  isReview: boolean
}>()

const emit = defineEmits(['close', 'complete'])

const selectedOption = ref<string | null>(null)
const feedback = ref({
  show: false,
  isCorrect: false,
  message: ''
})

// 当题目变化时重置状态
watch(() => props.question, () => {
  selectedOption.value = null
  feedback.value = {
    show: false,
    isCorrect: false,
    message: ''
  }
})

const checkAnswer = () => {
  if (!selectedOption.value) return
  
  const isCorrect = selectedOption.value === props.question.correctAnswer
  const correctOption = props.question.options.find(o => o.id === props.question.correctAnswer)
  
  feedback.value = {
    show: true,
    isCorrect,
    message: isCorrect 
      ? props.question.explanation 
      : `正确答案是：${props.question.correctAnswer}. ${correctOption?.text}\n\n解析：${props.question.explanation}`
  }
}
</script>
