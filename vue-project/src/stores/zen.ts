import { defineStore } from 'pinia'
import { ref } from 'vue'
import { audioEngine } from '@/utils/audioEngine'

export const useZenStore = defineStore('zen', () => {
  const isBowlAnimating = ref(false)
  const lastBowlTime = ref(0)

  const triggerBowl = () => {
    const now = Date.now()
    // 防止过于频繁触发（至少间隔1秒）
    if (now - lastBowlTime.value < 1000) return

    lastBowlTime.value = now
    
    // 播放声音
    audioEngine.playBowl()
    
    // 触发动画
    // 如果动画正在进行，先重置一下（通过 key 变化或者简单的状态切换）
    isBowlAnimating.value = false
    setTimeout(() => {
      isBowlAnimating.value = true
      
      // 动画持续时间后自动关闭状态
      setTimeout(() => {
        isBowlAnimating.value = false
      }, 4000) // 动画持续4秒
    }, 10)
  }

  return {
    isBowlAnimating,
    triggerBowl
  }
})
