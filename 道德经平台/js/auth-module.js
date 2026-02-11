// 登录注册模块JavaScript

// ========== 全局辅助函数 ==========

// 切换密码可见性
function togglePasswordVisibility (button) {
  // 尝试找到相关的输入框
  // 1. 尝试前一个兄弟元素
  let input = button.previousElementSibling

  // 2. 如果前一个元素不是input，尝试在父元素中查找input
  if (!input || input.tagName !== 'INPUT') {
    const parent = button.parentElement
    input = parent.querySelector('input')
  }

  const icon = button.querySelector('i')

  if (input && input.tagName === 'INPUT') {
    if (input.type === 'password') {
      input.type = 'text'
      icon.classList.remove('fa-eye-slash')
      icon.classList.add('fa-eye')
    } else {
      input.type = 'password'
      icon.classList.remove('fa-eye')
      icon.classList.add('fa-eye-slash')
    }
  } else {
    console.warn('未找到密码输入框')
  }
}

// 验证邮箱格式
function isValidEmail (email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

// 验证密码强度
function checkPasswordStrength (password) {
  const strengthBar = document.getElementById('strengthBar')
  const passwordStrength = document.getElementById('passwordStrength')

  let strength = 0

  if (password.length >= 8) strength++
  if (password.match(/[A-Z]/)) strength++
  if (password.match(/[0-9]/)) strength++
  if (password.match(/[^A-Za-z0-9]/)) strength++

  // 只有在UI元素存在时才更新UI
  if (strengthBar && passwordStrength) {
    switch (strength) {
      case 0:
      case 1:
        strengthBar.style.width = '25%'
        strengthBar.className = 'bg-red-500 h-1.5 rounded-full transition-all duration-300'
        passwordStrength.textContent = '弱'
        passwordStrength.className = 'text-red-500'
        break
      case 2:
        strengthBar.style.width = '50%'
        strengthBar.className = 'bg-yellow-500 h-1.5 rounded-full transition-all duration-300'
        passwordStrength.textContent = '中'
        passwordStrength.className = 'text-yellow-500'
        break
      case 3:
        strengthBar.style.width = '75%'
        strengthBar.className = 'bg-blue-500 h-1.5 rounded-full transition-all duration-300'
        passwordStrength.textContent = '良好'
        passwordStrength.className = 'text-blue-500'
        break
      case 4:
        strengthBar.style.width = '100%'
        strengthBar.className = 'bg-green-500 h-1.5 rounded-full transition-all duration-300'
        passwordStrength.textContent = '强'
        passwordStrength.className = 'text-green-500'
        break
    }
  }

  return strength >= 2 // 至少中等强度
}

// 显示错误消息
function showError (input, message) {
  const errorElement = input.parentElement.nextElementSibling
  if (errorElement && errorElement.classList.contains('error-message')) {
    errorElement.textContent = message
    errorElement.classList.remove('hidden')
    input.classList.add('border-red-500')
  }
}

// 隐藏错误消息
function hideError (input) {
  const errorElement = input.parentElement.nextElementSibling
  if (errorElement && errorElement.classList.contains('error-message')) {
    errorElement.textContent = ''
    errorElement.classList.add('hidden')
    input.classList.remove('border-red-500')
  }
}

// 更新UI为已登录状态
function updateUIForLoggedInUser (user) {
  // 桌面端
  const authButtonsDesktop = document.getElementById('authButtonsDesktop')
  const userProfileDesktop = document.getElementById('userProfileDesktop')
  const userNameDesktop = document.getElementById('userNameDesktop')

  // 移动端
  const authButtonsMobile = document.getElementById('authButtonsMobile')
  const userProfileMobile = document.getElementById('userProfileMobile')
  const userNameMobile = document.getElementById('userNameMobile')

  if (authButtonsDesktop) {
    authButtonsDesktop.classList.add('hidden')
    authButtonsDesktop.classList.remove('md:flex')
  }

  if (userProfileDesktop) {
    userProfileDesktop.classList.remove('hidden')
    userProfileDesktop.classList.add('md:flex')
  }
  if (userNameDesktop) userNameDesktop.textContent = user.name || '用户'

  if (authButtonsMobile) authButtonsMobile.classList.add('hidden')

  if (userProfileMobile) {
    userProfileMobile.classList.remove('hidden')
    userProfileMobile.classList.add('flex')
  }
  if (userNameMobile) userNameMobile.textContent = user.name || '用户'
}

// 更新UI为未登录状态
function updateUIForLoggedOutUser () {
  // 桌面端
  const authButtonsDesktop = document.getElementById('authButtonsDesktop')
  const userProfileDesktop = document.getElementById('userProfileDesktop')

  // 移动端
  const authButtonsMobile = document.getElementById('authButtonsMobile')
  const userProfileMobile = document.getElementById('userProfileMobile')

  if (authButtonsDesktop) {
    authButtonsDesktop.classList.remove('hidden')
    authButtonsDesktop.classList.add('md:flex')
  }

  if (userProfileDesktop) {
    userProfileDesktop.classList.add('hidden')
    userProfileDesktop.classList.remove('md:flex')
  }

  if (authButtonsMobile) authButtonsMobile.classList.remove('hidden')

  if (userProfileMobile) {
    userProfileMobile.classList.add('hidden')
    userProfileMobile.classList.remove('flex')
  }
}

// 处理退出登录
function handleLogout () {
  localStorage.removeItem('user')
  updateUIForLoggedOutUser()
  console.log('已退出登录')

  // 如果在需要登录的页面，可能需要跳转
  // window.location.href = 'index.html';
}

// 表单提交处理
function handleFormSubmit (formId, submitButtonId, modalElement = null) {
  const form = document.getElementById(formId)
  const submitButton = document.getElementById(submitButtonId)

  // 检查表单和按钮是否存在
  if (!form || !submitButton) {
    return
  }

  const spinner = submitButton.querySelector('i.fa-spinner')

  form.addEventListener('submit', function (e) {
    e.preventDefault()

    // 重置错误消息
    const inputs = form.querySelectorAll('input')
    inputs.forEach(hideError)

    // 表单验证
    let isValid = true

    if (formId === 'loginForm') {
      const email = document.getElementById('loginEmail')
      const password = document.getElementById('loginPassword')

      if (email && !isValidEmail(email.value)) {
        showError(email, '请输入有效的邮箱地址')
        isValid = false
      }

      if (password && password.value.length < 6) {
        showError(password, '密码至少需要6个字符')
        isValid = false
      }
    } else if (formId === 'registerForm') {
      const name = document.getElementById('registerName')
      const email = document.getElementById('registerEmail')
      const password = document.getElementById('registerPassword')
      const confirmPassword = document.getElementById('registerConfirmPassword')

      if (name && name.value.trim().length < 2) {
        showError(name, '用户名至少需要2个字符')
        isValid = false
      }

      if (email && !isValidEmail(email.value)) {
        showError(email, '请输入有效的邮箱地址')
        isValid = false
      }

      if (password && password.value.length < 8) {
        showError(password, '密码至少需要8个字符')
        isValid = false
      }

      if (password && !checkPasswordStrength(password.value)) {
        showError(password, '密码强度太弱，请包含大小写字母、数字和特殊字符')
        isValid = false
      }

      if (password && confirmPassword && password.value !== confirmPassword.value) {
        showError(confirmPassword, '两次输入的密码不一致')
        isValid = false
      }
    } else if (formId === 'forgotPasswordForm') {
      const email = document.getElementById('forgotEmail')

      if (email && !isValidEmail(email.value)) {
        showError(email, '请输入有效的邮箱地址')
        isValid = false
      }
    }

    if (isValid) {
      // 显示加载状态
      if (spinner) spinner.classList.remove('hidden')
      submitButton.disabled = true

      // 模拟API请求
      setTimeout(() => {
        if (spinner) spinner.classList.add('hidden')
        submitButton.disabled = false

        // 处理成功逻辑
        if (formId === 'loginForm') {
          console.log('登录成功')

          const email = document.getElementById('loginEmail').value
          const name = email.split('@')[0]
          const user = { name, email }
          localStorage.setItem('user', JSON.stringify(user))

          updateUIForLoggedInUser(user)

          if (modalElement) {
            closeModal(modalElement)
          } else {
            // 独立页面登录成功跳转
            window.location.href = 'index.html'
          }
        } else if (formId === 'registerForm') {
          console.log('注册成功')

          const name = document.getElementById('registerName').value
          const email = document.getElementById('registerEmail').value
          const user = { name, email }
          localStorage.setItem('user', JSON.stringify(user))

          updateUIForLoggedInUser(user)

          if (modalElement) {
            closeModal(modalElement)
          } else {
            // 独立页面注册成功跳转
            window.location.href = 'index.html'
          }
        } else if (formId === 'forgotPasswordForm') {
          console.log('重置密码链接已发送')
          if (modalElement) {
            closeModal(modalElement)
          } else {
            // 提示发送成功
            alert('重置密码链接已发送到您的邮箱')
          }
        }
      }, 1500)
    }
  })
}

// 打开模态框
function openModal (modal) {
  if (modal) {
    modal.classList.remove('hidden')
    document.body.classList.add('overflow-hidden')
  }
}

// 关闭模态框
function closeModal (modal) {
  if (modal) {
    modal.classList.add('hidden')
    document.body.classList.remove('overflow-hidden')
  }
}

// ========== 初始化函数 ==========

// 通用初始化（适用于所有页面）
function initCommonAuth () {
  // 绑定退出登录事件
  const logoutBtnDesktop = document.getElementById('logoutBtnDesktop')
  const logoutBtnMobile = document.getElementById('logoutBtnMobile')

  if (logoutBtnDesktop) logoutBtnDesktop.addEventListener('click', handleLogout)
  if (logoutBtnMobile) logoutBtnMobile.addEventListener('click', handleLogout)

  // 绑定密码切换按钮事件
  const togglePasswordButtons = document.querySelectorAll('.togglePassword')
  if (togglePasswordButtons) {
    togglePasswordButtons.forEach(button => {
      // 移除旧的监听器（防止重复绑定，虽然这里是初始化，但是个好习惯）
      const newButton = button.cloneNode(true)
      button.parentNode.replaceChild(newButton, button)
      newButton.addEventListener('click', function () {
        togglePasswordVisibility(this)
      })
    })
  }

  // 检查本地存储中的用户状态
  const storedUser = localStorage.getItem('user')
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser)
      // 延迟一点执行以确保DOM完全加载
      setTimeout(() => updateUIForLoggedInUser(user), 100)
    } catch (e) {
      console.error('解析用户信息失败', e)
      localStorage.removeItem('user')
    }
  }
}

// 登录页面专用初始化
function initLoginPageAuth () {
  initCommonAuth()
  handleFormSubmit('loginForm', 'loginSubmit')
}

// 注册页面专用初始化
function initRegisterPageAuth () {
  initCommonAuth()
  handleFormSubmit('registerForm', 'registerSubmit')

  const registerPassword = document.getElementById('registerPassword')
  const registerConfirmPassword = document.getElementById('registerConfirmPassword')
  const passwordMatchStatus = document.getElementById('passwordMatchStatus')

  // 检查密码匹配函数
  function checkPasswordMatch () {
    if (!registerPassword || !registerConfirmPassword || !passwordMatchStatus) return

    const p1 = registerPassword.value
    const p2 = registerConfirmPassword.value

    // 如果确认密码为空，隐藏状态
    if (!p2) {
      passwordMatchStatus.classList.add('hidden')
      return
    }

    passwordMatchStatus.classList.remove('hidden')

    if (p1 === p2) {
      passwordMatchStatus.textContent = '相同'
      passwordMatchStatus.className = 'text-green-500 text-sm mt-1'
    } else {
      passwordMatchStatus.textContent = '不相同请用户修改'
      passwordMatchStatus.className = 'text-red-500 text-sm mt-1'
    }
  }

  // 注册页面密码强度检测
  if (registerPassword) {
    registerPassword.addEventListener('input', function () {
      checkPasswordStrength(this.value)
      checkPasswordMatch() // 密码改变时也要检查匹配
    })
  }

  // 确认密码输入监听
  if (registerConfirmPassword) {
    registerConfirmPassword.addEventListener('input', checkPasswordMatch)
  }
}

// 模态框方式初始化（用于index.html等）
function initAuthModal () {
  initCommonAuth()

  // 获取模态框元素
  const loginModal = document.getElementById('loginModal')
  const registerModal = document.getElementById('registerModal')
  const forgotPasswordModal = document.getElementById('forgotPasswordModal')

  // 导航栏按钮
  const loginBtnNav = document.getElementById('loginBtnNav')
  const registerBtnNav = document.getElementById('registerBtnNav')
  const loginBtnMobile = document.getElementById('loginBtnMobile')
  const registerBtnMobile = document.getElementById('registerBtnMobile')

  // 绑定打开模态框事件
  if (loginBtnNav && loginModal) loginBtnNav.addEventListener('click', () => openModal(loginModal))
  if (registerBtnNav && registerModal) registerBtnNav.addEventListener('click', () => openModal(registerModal))
  if (loginBtnMobile && loginModal) loginBtnMobile.addEventListener('click', () => openModal(loginModal))
  if (registerBtnMobile && registerModal) registerBtnMobile.addEventListener('click', () => openModal(registerModal))

  // 关闭按钮
  const closeModalButtons = document.querySelectorAll('.closeModal')
  if (closeModalButtons) {
    closeModalButtons.forEach(button => {
      button.addEventListener('click', function () {
        const modal = this.closest('[id$="Modal"]')
        if (modal) closeModal(modal)
      })
    })
  }

  // 切换模态框
  const switchToRegister = document.getElementById('switchToRegister')
  const switchToLogin = document.getElementById('switchToLogin')
  const forgotPasswordLink = document.getElementById('forgotPassword')

  if (switchToRegister && loginModal && registerModal) {
    switchToRegister.addEventListener('click', function (e) {
      e.preventDefault()
      closeModal(loginModal)
      openModal(registerModal)
    })
  }

  if (switchToLogin && registerModal && loginModal) {
    switchToLogin.addEventListener('click', function (e) {
      e.preventDefault()
      closeModal(registerModal)
      openModal(loginModal)
    })
  }

  if (forgotPasswordLink && loginModal && forgotPasswordModal) {
    forgotPasswordLink.addEventListener('click', function (e) {
      e.preventDefault()
      closeModal(loginModal)
      openModal(forgotPasswordModal)
    })
  }

  // 注册表单密码强度
  const registerPassword = document.getElementById('registerPassword')
  if (registerPassword) {
    registerPassword.addEventListener('input', function () {
      checkPasswordStrength(this.value)
    })
  }

  // 初始化表单处理
  if (document.getElementById('loginForm') && document.getElementById('loginSubmit')) {
    handleFormSubmit('loginForm', 'loginSubmit', loginModal)
  }

  if (document.getElementById('registerForm') && document.getElementById('registerSubmit')) {
    handleFormSubmit('registerForm', 'registerSubmit', registerModal)
  }

  if (document.getElementById('forgotPasswordForm') && document.getElementById('forgotSubmit')) {
    handleFormSubmit('forgotPasswordForm', 'forgotSubmit', forgotPasswordModal)
  }
}

// 主入口函数
function initAuthModule () {
  const path = window.location.pathname

  if (path.includes('login.html')) {
    initLoginPageAuth()
  } else if (path.includes('register.html')) {
    initRegisterPageAuth()
  } else {
    initAuthModal()
  }
}

// 兼容性函数
function initAuthModalCompat () {
  initAuthModule()
}
