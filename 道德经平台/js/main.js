// 主要JavaScript功能文件

// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function () {
  // 初始化所有功能
  initNavigation()
  initMobileMenu()
  initScrollEffects()
  initAuthModule()
})

// 导航栏初始化
function initNavigation () {
  // 初始化移动端菜单
  initMobileMenu()

  // 初始化滚动效果
  initScrollEffects()
}

// 移动端菜单功能
function initMobileMenu () {
  const mobileMenuBtn = document.getElementById('mobileMenuBtn')
  const mobileMenu = document.getElementById('mobileMenu')

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', function () {
      mobileMenu.classList.toggle('hidden')
    })

    // 点击菜单项后关闭菜单
    const menuLinks = mobileMenu.querySelectorAll('a')
    menuLinks.forEach(link => {
      link.addEventListener('click', function () {
        mobileMenu.classList.add('hidden')
      })
    })
  }
}

// 导航栏滚动效果
function initScrollEffects () {
  const mainNav = document.getElementById('mainNav')

  if (mainNav) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 50) {
        mainNav.classList.add('nav-scrolled')
      } else {
        mainNav.classList.remove('nav-scrolled')
      }
    })
  }

  // 滚动显示动画
  const scrollRevealElements = document.querySelectorAll('.scroll-reveal')

  function checkScrollReveal () {
    scrollRevealElements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top
      const windowHeight = window.innerHeight

      if (elementTop < windowHeight - 100) {
        element.classList.add('revealed')
      }
    })
  }

  // 初始检查
  checkScrollReveal()

  // 滚动时检查
  window.addEventListener('scroll', checkScrollReveal)
}

// AI对话功能
function initAIChat () {
  const chatInput = document.querySelector('.chat-input')
  const paperPlaneIcon = document.querySelector('.fa-paper-plane')
  const sendButton = paperPlaneIcon ? paperPlaneIcon.parentElement : null
  const quickButtons = document.querySelectorAll('.bg-secondary\\/10')

  if (chatInput && sendButton) {
    // 发送消息
    const sendMessage = function () {
      const message = chatInput.value.trim()
      if (message) {
        // 这里应该调用AI API
        console.log('发送消息:', message)

        // 清空输入框
        chatInput.value = ''

        // 显示用户消息
        addChatMessage(message, 'user')

        // 模拟AI回复
        setTimeout(() => {
          const aiResponse = generateAIResponse(message)
          addChatMessage(aiResponse, 'ai')
        }, 1000)
      }
    }

    // 点击发送按钮
    sendButton.addEventListener('click', sendMessage)

    // 按回车发送
    chatInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        sendMessage()
      }
    })
  }

  // 快捷按钮点击事件
  if (quickButtons) {
    quickButtons.forEach(button => {
      button.addEventListener('click', function () {
        const text = this.textContent
        if (chatInput) {
          chatInput.value = text
          chatInput.focus()
        }
      })
    })
  }
}

// 添加聊天消息到界面
function addChatMessage (message, sender) {
  // 这里需要根据实际页面结构来实现
  console.log(`${sender}: ${message}`)
}

// 生成AI回复（模拟）
function generateAIResponse (userMessage) {
  // 这里应该调用实际的AI API
  return '这是对您问题的回复。在实际应用中，这里会连接到AI服务来获取关于《道德经》的专业解读。'
}

// 页面加载完成后初始化AI聊天
// 只在AI解读页面加载时初始化AI聊天功能
window.addEventListener('load', function () {
  // 检查当前页面是否包含AI聊天功能所需的元素
  const chatInput = document.querySelector('.chat-input')
  if (chatInput) {
    initAIChat()
  }
})
