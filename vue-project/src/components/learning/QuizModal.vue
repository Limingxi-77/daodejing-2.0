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
      
      <!-- 成绩展示 -->
      <div v-if="showResult" class="text-center mb-6">
        <h2 class="text-2xl font-bold text-primary mb-2">测验完成</h2>
        <div class="w-full h-1 bg-gray-100 rounded mb-4"></div>
        <div class="mb-4">
          <div class="text-4xl font-bold mb-2" :class="score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600'">
            {{ score }}/100
          </div>
          <p class="text-lg text-gray-600">
            共 {{ questions.length }} 题，答对 {{ correctCount }} 题
          </p>
        </div>
        <div class="mb-4">
          <div class="w-full bg-gray-200 rounded-full h-4">
            <div 
              class="bg-primary h-4 rounded-full transition-all duration-500" 
              :style="{ width: `${(score / 100) * 100}%` }"
            ></div>
          </div>
        </div>
        <div class="mb-6">
          <p class="text-sm text-gray-600" v-if="score >= 80">
            <i class="fas fa-trophy text-yellow-500 mr-1"></i>
            太棒了！你对这章内容掌握得非常好。
          </p>
          <p class="text-sm text-gray-600" v-else-if="score >= 60">
            <i class="fas fa-star text-blue-500 mr-1"></i>
            不错！继续努力，你会做得更好。
          </p>
          <p class="text-sm text-gray-600" v-else>
            <i class="fas fa-book text-gray-500 mr-1"></i>
            建议你再复习一下这章内容。
          </p>
        </div>
      </div>
      
      <!-- 题目展示 -->
      <div v-else class="mb-2">
        <h2 class="text-xl font-bold text-primary mb-2">
          <span v-if="isReview" class="text-secondary mr-1">复习：</span>
          {{ title }}
        </h2>
        <div class="w-full h-1 bg-gray-100 rounded mb-4"></div>
        
        <!-- 进度条 -->
        <div class="mb-4">
          <div class="flex justify-between text-sm text-gray-600 mb-1">
            <span>问题 {{ currentQuestionIndex + 1 }}/{{ questions.length }}</span>
            <span>得分：{{ score }}/100</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
              class="bg-primary h-2 rounded-full transition-all duration-300" 
              :style="{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }"
            ></div>
          </div>
        </div>
        
        <p class="text-lg font-medium text-dark mb-4">请回答以下问题：</p>
        
        <div class="mb-6">
          <p class="text-dark mb-4 font-medium bg-gray-50 p-3 rounded border-l-4 border-accent">
            {{ currentQuestion.question }}
          </p>
          
          <div class="space-y-2">
            <div 
              v-for="option in currentQuestion.options" 
              :key="option.id"
              @click="selectedOption = option.id"
              :class="['flex items-center cursor-pointer p-3 rounded border transition-all', 
                selectedOption === option.id ? 'bg-primary/5 border-primary' : 
                feedback.show && option.id === currentQuestion.correctAnswer ? 'bg-green-50 border-green-300' :
                feedback.show && selectedOption === option.id && option.id !== currentQuestion.correctAnswer ? 'bg-red-50 border-red-300' :
                'hover:bg-gray-50 border-transparent']"
            >
              <div :class="['w-5 h-5 rounded-full border flex items-center justify-center mr-3', 
                selectedOption === option.id ? 'border-primary' :
                feedback.show && option.id === currentQuestion.correctAnswer ? 'border-green-500' :
                feedback.show && selectedOption === option.id && option.id !== currentQuestion.correctAnswer ? 'border-red-500' :
                'border-gray-400']">
                <div v-if="selectedOption === option.id" :class="['w-2.5 h-2.5 rounded-full', 
                  feedback.show && selectedOption === option.id && option.id !== currentQuestion.correctAnswer ? 'bg-red-500' : 'bg-primary']"></div>
                <div v-else-if="feedback.show && option.id === currentQuestion.correctAnswer" class="w-2.5 h-2.5 rounded-full bg-green-500"></div>
              </div>
              <span :class="['text-gray-700 flex-1', 
                feedback.show && option.id === currentQuestion.correctAnswer ? 'font-bold text-green-600' :
                feedback.show && selectedOption === option.id && option.id !== currentQuestion.correctAnswer ? 'font-bold text-red-600' : '']">
                {{ option.id }}. {{ option.text }}
              </span>
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
            v-if="!feedback.show"
            @click="checkAnswer" 
            :disabled="!selectedOption"
            class="btn-primary flex-1 py-2 rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            检查答案
          </button>
          <button 
            v-else-if="currentQuestionIndex < questions.length - 1"
            @click="nextQuestion"
            class="btn-primary flex-1 py-2 rounded-md hover:bg-opacity-90 transition-colors"
          >
            下一题
          </button>
          <button 
            v-else-if="feedback.show && currentQuestionIndex === questions.length - 1"
            @click="showFinalResult"
            class="btn-primary flex-1 py-2 rounded-md hover:bg-opacity-90 transition-colors"
          >
            查看成绩
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
      
      <!-- 完成按钮 -->
      <div v-if="showResult" class="flex space-x-4">
        <button 
          @click="$emit('complete')"
          class="btn-primary flex-1 py-2 rounded-md hover:bg-opacity-90 transition-colors"
        >
          {{ isReview ? '完成复习' : '下一课' }}
        </button>
        <button 
          @click="$emit('close')" 
          class="btn-secondary flex-1 py-2 rounded-md hover:bg-opacity-90 transition-colors"
        >
          关闭
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Option {
  id: string
  text: string
}

interface Question {
  id: string
  question: string
  options: Option[]
  correctAnswer: string
  explanation: string
}

const props = defineProps<{
  title: string
  questions: Question[]
  isReview: boolean
}>()

const emit = defineEmits(['close', 'complete'])

const currentQuestionIndex = ref(0)
const selectedOption = ref<string | null>(null)
const feedback = ref({
  show: false,
  isCorrect: false,
  message: ''
})
const showResult = ref(false)
const correctCount = ref(0)
const score = ref(0)

// 计算当前题目
const currentQuestion = computed(() => props.questions[currentQuestionIndex.value])

// 当题目变化时重置状态
watch(() => props.questions, () => {
  resetQuiz()
}, { deep: true })

// 重置测验状态
const resetQuiz = () => {
  currentQuestionIndex.value = 0
  selectedOption.value = null
  feedback.value = {
    show: false,
    isCorrect: false,
    message: ''
  }
  showResult.value = false
  correctCount.value = 0
  score.value = 0
}

// 检查答案
const checkAnswer = () => {
  if (!selectedOption.value) return
  
  const isCorrect = selectedOption.value === currentQuestion.value.correctAnswer
  const correctOption = currentQuestion.value.options.find(o => o.id === currentQuestion.value.correctAnswer)
  
  if (isCorrect) {
    correctCount.value++
  }
  
  feedback.value = {
    show: true,
    isCorrect,
    message: isCorrect 
      ? currentQuestion.value.explanation 
      : `正确答案是：${currentQuestion.value.correctAnswer}. ${correctOption?.text}\n\n解析：${currentQuestion.value.explanation}`
  }
  
  // 计算当前得分
  score.value = Math.round((correctCount.value / (currentQuestionIndex.value + 1)) * 100)
}

// 下一题
const nextQuestion = () => {
  currentQuestionIndex.value++
  selectedOption.value = null
  feedback.value = {
    show: false,
    isCorrect: false,
    message: ''
  }
}

// 显示最终成绩
const showFinalResult = () => {
  score.value = Math.round((correctCount.value / props.questions.length) * 100)
  showResult.value = true
}
</script>
