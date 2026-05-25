// Thin wrapper over the Web Speech API. Browser support is uneven — callers must
// check `isSupported` before instantiating. We only target chrome/edge which
// expose SpeechRecognition via webkit-prefixed identifier.

type SpeechRecognitionLike = {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: any) => void) | null
  onerror: ((event: any) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
}

interface SpeechWindow extends Window {
  SpeechRecognition?: { new (): SpeechRecognitionLike }
  webkitSpeechRecognition?: { new (): SpeechRecognitionLike }
}

export const isSpeechRecognitionSupported = (): boolean => {
  if (typeof window === 'undefined') return false
  const w = window as SpeechWindow
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition)
}

export interface SpeechResult {
  transcript: string
  isFinal: boolean
}

export interface SpeechRecognizerOptions {
  lang?: string
  continuous?: boolean
  interimResults?: boolean
  onResult?: (result: SpeechResult) => void
  onError?: (message: string) => void
  onEnd?: () => void
  onStart?: () => void
}

export class SpeechRecognizer {
  private recognizer: SpeechRecognitionLike | null = null
  private listening = false

  constructor(private options: SpeechRecognizerOptions = {}) {}

  start(): boolean {
    if (this.listening) return true
    if (!isSpeechRecognitionSupported()) {
      this.options.onError?.('当前浏览器不支持语音识别,请使用 Chrome 或 Edge')
      return false
    }
    const w = window as SpeechWindow
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition
    if (!Ctor) return false

    const rec = new Ctor()
    rec.lang = this.options.lang ?? 'zh-CN'
    rec.continuous = this.options.continuous ?? false
    rec.interimResults = this.options.interimResults ?? true
    rec.maxAlternatives = 1

    rec.onresult = (event: any) => {
      const results = event.results
      if (!results || results.length === 0) return
      let finalText = ''
      let interimText = ''
      for (let i = event.resultIndex ?? 0; i < results.length; i++) {
        const r = results[i]
        const t = r[0]?.transcript ?? ''
        if (r.isFinal) finalText += t
        else interimText += t
      }
      if (finalText) {
        this.options.onResult?.({ transcript: finalText, isFinal: true })
      } else if (interimText) {
        this.options.onResult?.({ transcript: interimText, isFinal: false })
      }
    }

    rec.onerror = (event: any) => {
      const code = event?.error ?? 'unknown'
      const msg = mapErrorCode(code)
      this.options.onError?.(msg)
    }

    rec.onstart = () => {
      this.listening = true
      this.options.onStart?.()
    }

    rec.onend = () => {
      this.listening = false
      this.options.onEnd?.()
    }

    try {
      rec.start()
      this.recognizer = rec
      return true
    } catch (err) {
      this.options.onError?.(err instanceof Error ? err.message : '语音识别启动失败')
      return false
    }
  }

  stop(): void {
    if (!this.recognizer) return
    try {
      this.recognizer.stop()
    } catch {
      // ignore
    }
  }

  abort(): void {
    if (!this.recognizer) return
    try {
      this.recognizer.abort()
    } catch {
      // ignore
    }
    this.listening = false
  }

  get isListening(): boolean {
    return this.listening
  }
}

const ERROR_MESSAGES: Record<string, string> = {
  'no-speech': '没有检测到语音,请重试',
  'audio-capture': '无法访问麦克风,请检查权限',
  'not-allowed': '用户拒绝了麦克风权限',
  'network': '网络错误,语音识别需要联网',
  'aborted': '语音识别被中止',
  'service-not-allowed': '浏览器禁止了语音识别服务'
}

export const mapErrorCode = (code: string): string => {
  return ERROR_MESSAGES[code] ?? `语音识别错误: ${code}`
}
