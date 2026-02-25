// src/composables/useTTS.ts
import { ref, onUnmounted } from 'vue'

export interface TTSOptions {
  pitch?: number
  rate?: number
  volume?: number
}

export function useTTS() {
  const isSpeaking = ref(false)
  const synth = window.speechSynthesis
  let utterance: SpeechSynthesisUtterance | null = null

  // Stop speaking when component unmounts
  onUnmounted(() => {
    stop()
  })

  const speak = (text: string, persona: 'scholar' | 'sage' | 'healer' = 'scholar') => {
    // Cancel any current speech
    stop()

    if (!text) return

    utterance = new SpeechSynthesisUtterance(text)
    
    // Set language
    utterance.lang = 'zh-CN'

    // Customize voice based on persona
    switch (persona) {
      case 'sage': // 道家隐士 - 低沉、缓慢
        utterance.pitch = 0.8
        utterance.rate = 0.8
        utterance.volume = 1.0
        break
      case 'healer': // 心理疗愈 - 柔和、平缓
        utterance.pitch = 1.1
        utterance.rate = 0.9
        utterance.volume = 0.9
        break
      case 'scholar': // 现代学者 - 标准、清晰
      default:
        utterance.pitch = 1.0
        utterance.rate = 1.0
        utterance.volume = 1.0
        break
    }

    // Try to find a suitable voice
    const voices = synth.getVoices()
    // Prefer "Google 普通话" or native system voices
    const preferredVoice = voices.find(v => v.name.includes('Google') && v.lang.includes('zh')) ||
                           voices.find(v => v.lang.includes('zh'))
    
    if (preferredVoice) {
      utterance.voice = preferredVoice
    }

    // Event listeners
    utterance.onstart = () => {
      isSpeaking.value = true
    }

    utterance.onend = () => {
      isSpeaking.value = false
    }

    utterance.onerror = (e) => {
      console.error('TTS Error:', e)
      isSpeaking.value = false
    }

    synth.speak(utterance)
  }

  const stop = () => {
    if (synth.speaking) {
      synth.cancel()
    }
    isSpeaking.value = false
  }

  const toggle = (text: string, persona: 'scholar' | 'sage' | 'healer' = 'scholar') => {
    if (isSpeaking.value) {
      stop()
    } else {
      speak(text, persona)
    }
  }

  return {
    isSpeaking,
    speak,
    stop,
    toggle
  }
}
