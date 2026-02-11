// 工具函数JavaScript

// 防抖函数
function debounce (func, wait) {
  let timeout
  return function () {
    const context = this
    const args = arguments
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      func.apply(context, args)
    }, wait)
  }
}

// 节流函数
function throttle (func, limit) {
  let inThrottle
  return function () {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// 格式化日期
function formatDate (date, format = 'YYYY-MM-DD') {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

// 相对时间
function timeAgo (date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)

  let interval = Math.floor(seconds / 31536000)
  if (interval > 1) return interval + ' 年前'

  interval = Math.floor(seconds / 2592000)
  if (interval > 1) return interval + ' 个月前'

  interval = Math.floor(seconds / 86400)
  if (interval > 1) return interval + ' 天前'

  interval = Math.floor(seconds / 3600)
  if (interval > 1) return interval + ' 小时前'

  interval = Math.floor(seconds / 60)
  if (interval > 1) return interval + ' 分钟前'

  return '刚刚'
}

// 本地存储工具
const storage = {
  // 设置本地存储
  set (key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (e) {
      console.error('设置本地存储失败:', e)
      return false
    }
  },

  // 获取本地存储
  get (key) {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (e) {
      console.error('获取本地存储失败:', e)
      return null
    }
  },

  // 删除本地存储
  remove (key) {
    try {
      localStorage.removeItem(key)
      return true
    } catch (e) {
      console.error('删除本地存储失败:', e)
      return false
    }
  },

  // 清空本地存储
  clear () {
    try {
      localStorage.clear()
      return true
    } catch (e) {
      console.error('清空本地存储失败:', e)
      return false
    }
  }
}

// URL参数工具
const urlParams = {
  // 获取URL参数
  get (name) {
    const url = new URL(window.location.href)
    return url.searchParams.get(name)
  },

  // 设置URL参数
  set (name, value) {
    const url = new URL(window.location.href)
    url.searchParams.set(name, value)
    window.history.replaceState({}, '', url)
  },

  // 删除URL参数
  remove (name) {
    const url = new URL(window.location.href)
    url.searchParams.delete(name)
    window.history.replaceState({}, '', url)
  },

  // 获取所有URL参数
  getAll () {
    const url = new URL(window.location.href)
    const params = {}
    url.searchParams.forEach((value, key) => {
      params[key] = value
    })
    return params
  }
}

// DOM工具
const dom = {
  // 等待DOM加载完成
  ready (fn) {
    if (document.readyState !== 'loading') {
      fn()
    } else {
      document.addEventListener('DOMContentLoaded', fn)
    }
  },

  // 创建元素
  create (tag, attributes = {}, children = []) {
    const element = document.createElement(tag)

    // 设置属性
    Object.keys(attributes).forEach(key => {
      if (key === 'className') {
        element.className = attributes[key]
      } else if (key === 'innerHTML') {
        element.innerHTML = attributes[key]
      } else if (key === 'textContent') {
        element.textContent = attributes[key]
      } else if (key.startsWith('data-')) {
        element.setAttribute(key, attributes[key])
      } else {
        element[key] = attributes[key]
      }
    })

    // 添加子元素
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child))
      } else {
        element.appendChild(child)
      }
    })

    return element
  },

  // 查找元素
  find (selector, parent = document) {
    return parent.querySelector(selector)
  },

  // 查找所有元素
  findAll (selector, parent = document) {
    return Array.from(parent.querySelectorAll(selector))
  },

  // 添加类
  addClass (element, className) {
    if (element) element.classList.add(className)
  },

  // 移除类
  removeClass (element, className) {
    if (element) element.classList.remove(className)
  },

  // 切换类
  toggleClass (element, className) {
    if (element) element.classList.toggle(className)
  },

  // 检查是否包含类
  hasClass (element, className) {
    return element ? element.classList.contains(className) : false
  }
}

// HTTP请求工具
const http = {
  // GET请求
  get (url, options = {}) {
    return fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    }).then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return response.json()
    })
  },

  // POST请求
  post (url, data, options = {}) {
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: JSON.stringify(data),
      ...options
    }).then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return response.json()
    })
  },

  // PUT请求
  put (url, data, options = {}) {
    return fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: JSON.stringify(data),
      ...options
    }).then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return response.json()
    })
  },

  // DELETE请求
  delete (url, options = {}) {
    return fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    }).then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return response.json()
    })
  }
}

// 验证工具
const validate = {
  // 验证邮箱
  email (email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  },

  // 验证手机号
  phone (phone) {
    const regex = /^1[3456789]\d{9}$/
    return regex.test(phone)
  },

  // 验证密码强度
  password (password) {
    let strength = 0

    // 长度检查
    if (password.length >= 8) strength += 1
    if (password.length >= 12) strength += 1

    // 复杂度检查
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1

    return strength
  },

  // 验证用户名
  username (username) {
    const regex = /^[a-zA-Z0-9_]{4,16}$/
    return regex.test(username)
  }
}

// 导出工具函数
window.utils = {
  debounce,
  throttle,
  formatDate,
  timeAgo,
  storage,
  urlParams,
  dom,
  http,
  validate
}
