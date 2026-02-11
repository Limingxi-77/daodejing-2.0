// AI聊天功能 - 集成DeepSeek API
class AIChat {
  constructor () {
    this.apiUrl = 'http://localhost:8000/api/ai/ask'
    this.chatContainer = document.querySelector('.chat-container')
    this.chatInput = document.getElementById('chatInput')
    this.sendBtn = document.getElementById('sendBtn')
    this.quickQuestions = document.querySelectorAll('.quick-question')
    this.chapterSelects = document.querySelectorAll('.chapter-select')

    this.init()
  }

  init () {
    // 绑定发送按钮事件
    this.sendBtn.addEventListener('click', () => this.sendMessage())

    // 绑定回车键发送
    this.chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendMessage()
      }
    })

    // 绑定快捷问题
    this.quickQuestions.forEach(btn => {
      btn.addEventListener('click', () => {
        const question = btn.textContent.trim()
        this.sendMessageDirectly(question)
      })
    })

    // 绑定章节选择
    this.chapterSelects.forEach(btn => {
      btn.addEventListener('click', () => {
        const chapter = btn.textContent.trim()
        const question = `请解读${chapter}`
        this.sendMessageDirectly(question)
      })
    })
  }

  async sendMessage () {
    const question = this.chatInput.value.trim()
    if (!question) return

    // 添加用户消息
    this.addMessage(question, 'user')
    this.chatInput.value = ''

    // 显示加载状态
    const loadingId = this.showLoading()

    try {
      const response = await this.getAIResponse(question)
      this.hideLoading(loadingId)
      this.addMessage(response, 'ai')
    } catch (error) {
      this.hideLoading(loadingId)
      this.addMessage(this.getErrorMessage(error, question), 'ai')
    }
  }

  async sendMessageDirectly (question) {
    if (!question) return

    // 直接添加用户消息，不设置到搜索框
    this.addMessage(question, 'user')

    // 显示加载状态
    const loadingId = this.showLoading()

    try {
      const response = await this.getAIResponse(question)
      this.hideLoading(loadingId)
      this.addMessage(response, 'ai')
    } catch (error) {
      this.hideLoading(loadingId)
      this.addMessage(this.getErrorMessage(error, question), 'ai')
    }
  }

  async getAIResponse (question) {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `后端服务错误: ${response.status}`)
      }

      if (data.error) {
        throw new Error(data.error)
      }

      return data.answer
    } catch (error) {
      if (error.message.includes('网络连接错误')) {
        throw new Error('网络连接问题：请检查您的网络连接后重试。')
      } else if (error.message.includes('超时')) {
        throw new Error('请求超时：AI服务响应较慢，请稍后重试。')
      } else if (error.message.includes('API密钥')) {
        throw new Error('API服务配置问题：请联系管理员检查AI服务配置。')
      } else {
        throw new Error(`AI服务暂时不可用：${error.message}`)
      }
    }
  }

  addMessage (content, type) {
    const messageDiv = document.createElement('div')
    messageDiv.className = `chat-message ${type}`

    const avatar = type === 'ai'
      ? '<div class="chat-avatar"><i class="fas fa-robot"></i></div>'
      : '<div class="chat-avatar"><i class="fas fa-user"></i></div>'

    messageDiv.innerHTML = `
            ${avatar}
            <div class="chat-content">${content}</div>
        `

    this.chatContainer.appendChild(messageDiv)
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight
  }

  showLoading () {
    const loadingId = 'loading-' + Date.now()
    const loadingDiv = document.createElement('div')
    loadingDiv.id = loadingId
    loadingDiv.className = 'chat-message ai loading'
    loadingDiv.innerHTML = `
            <div class="chat-avatar"><i class="fas fa-robot"></i></div>
            <div class="chat-content">
                <div class="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `

    this.chatContainer.appendChild(loadingDiv)
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight

    return loadingId
  }

  hideLoading (loadingId) {
    const loadingElement = document.getElementById(loadingId)
    if (loadingElement) {
      loadingElement.remove()
    }
  }

  getErrorMessage (error, question) {
    if (error.message.includes('网络连接问题')) {
      return `🌐 网络连接问题：请检查您的网络连接后重试。\n\n您的问题: ${question}`
    } else if (error.message.includes('请求超时')) {
      return `⏰ 请求超时：AI服务响应较慢，请稍后重试。\n\n您的问题: ${question}`
    } else if (error.message.includes('API服务配置问题')) {
      return `🔑 API服务配置问题：请联系管理员检查AI服务配置。\n\n您的问题: ${question}`
    } else {
      return `🤖 AI服务暂时不可用：${error.message}\n\n您的问题: ${question}\n\n请确保Python后端服务正在运行（端口5000）。`
    }
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  new AIChat()
})
