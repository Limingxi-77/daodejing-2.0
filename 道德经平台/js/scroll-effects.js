// 滚动效果JavaScript

// 初始化滚动效果
function initScrollEffects () {
  // 导航栏滚动效果
  initNavbarScroll()

  // 元素滚动显示效果
  initScrollReveal()

  // 平滑滚动效果
  initSmoothScroll()

  // 视差滚动效果
  initParallaxEffect()
}

// 导航栏滚动效果
function initNavbarScroll () {
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
}

// 元素滚动显示效果
function initScrollReveal () {
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

// 平滑滚动效果
function initSmoothScroll () {
  const links = document.querySelectorAll('a[href^="#"]')

  links.forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault()

      const targetId = this.getAttribute('href')
      const targetElement = document.querySelector(targetId)

      if (targetElement) {
        const offsetTop = targetElement.offsetTop - 80 // 考虑导航栏高度

        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        })
      }
    })
  })
}

// 视差滚动效果
function initParallaxEffect () {
  const parallaxElements = document.querySelectorAll('.parallax')

  function updateParallax () {
    const scrollTop = window.pageYOffset

    parallaxElements.forEach(element => {
      const speed = element.dataset.speed || 0.5
      const yPos = -(scrollTop * speed)

      element.style.transform = `translateY(${yPos}px)`
    })
  }

  if (parallaxElements.length > 0) {
    window.addEventListener('scroll', updateParallax)
    updateParallax() // 初始设置
  }
}

// 滚动进度条
function initScrollProgress () {
  const progressBar = document.createElement('div')
  progressBar.className = 'scroll-progress'
  progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background-color: var(--accent);
        z-index: 9999;
        transition: width 0.2s ease;
    `
  document.body.appendChild(progressBar)

  function updateProgress () {
    const scrollTop = window.pageYOffset
    const docHeight = document.body.scrollHeight - window.innerHeight
    const scrollPercent = (scrollTop / docHeight) * 100

    progressBar.style.width = scrollPercent + '%'
  }

  window.addEventListener('scroll', updateProgress)
  updateProgress() // 初始设置
}

// 返回顶部按钮
function initBackToTop () {
  const backToTopBtn = document.createElement('button')
  backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>'
  backToTopBtn.className = 'back-to-top'
  backToTopBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background-color: var(--primary);
        color: white;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
    `
  document.body.appendChild(backToTopBtn)

  function toggleBackToTopBtn () {
    if (window.pageYOffset > 300) {
      backToTopBtn.style.opacity = '1'
      backToTopBtn.style.visibility = 'visible'
    } else {
      backToTopBtn.style.opacity = '0'
      backToTopBtn.style.visibility = 'hidden'
    }
  }

  function scrollToTop () {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  window.addEventListener('scroll', toggleBackToTopBtn)
  backToTopBtn.addEventListener('click', scrollToTop)
  toggleBackToTopBtn() // 初始设置
}

// 页面加载完成后初始化所有滚动效果
document.addEventListener('DOMContentLoaded', function () {
  initScrollProgress()
  initBackToTop()
})

// 导出函数供其他模块使用
window.initScrollEffects = initScrollEffects
