---
alwaysApply: true
---
# Vue3项目目录说明

## 项目目录（前端标准架构）
```
├── public/                # 静态资源目录
│   └── vite.svg           # 静态图片等资源
├── src/                   # 源代码目录
│   ├── assets/            # 资源文件夹
│   │   └── vue.svg        # 项目相关图片资源
│   ├── components/        # 公共组件目录
│   │   └── HelloWorld.vue # 示例组件
│   ├── App.vue            # 根组件
│   ├── main.js            # 应用入口文件
│   └── style.css          # 全局样式
├── .gitignore             # Git忽略文件
├── .vscode/               # VSCode配置目录
│   └── extensions.json    # 推荐扩展配置
├── index.html             # HTML入口文件
├── package.json           # 项目配置文件
├── package-lock.json      # 依赖锁定文件
├── README.md              # 项目说明文件
└── vite.config.js         # Vite配置文件
```

## 目录说明
1. **public 目录**：存放静态资源，这些资源在构建过程中会被直接复制到输出目录，不经过打包处理。
2. **src 目录**：应用源代码主目录，包含所有组件、页面和业务逻辑。
3. **assets 目录**：存放需要被webpack处理的静态资源，如图片、字体等。
4. **components 目录**：存放可复用的Vue组件。
5. **App.vue**：应用的根组件，作为所有页面的容器。
6. **main.js**：应用入口文件，负责初始化Vue应用实例并挂载到DOM。
7. **package.json**：定义项目依赖和脚本命令。
8. **vite.config.js**：Vite构建工具的配置文件。

# 项目结构扩展建议

随着项目规模扩大，建议按以下结构组织代码：

```
├── src/
│   ├── api/               # API接口相关代码
│   ├── assets/            # 静态资源
│   ├── components/        # 通用组件
│   ├── composables/       # 可复用的组合式函数
│   ├── directives/        # 自定义指令
│   ├── filters/           # 过滤器(如需要)
│   ├── router/            # 路由配置
│   ├── store/             # 状态管理
│   ├── styles/            # 样式文件
│   ├── utils/             # 工具函数
│   ├── views/             # 页面组件
│   ├── App.vue            # 根组件
│   └── main.js            # 入口文件
```

# 组件开发规范

## 组件命名规范
- **组件名称**：使用PascalCase(大驼峰)命名，如`HelloWorld.vue`
- **单文件组件文件**：与组件名称保持一致
- **props命名**：使用camelCase(小驼峰)命名
- **事件命名**：使用kebab-case(短横线分隔)命名，如`update:value`

## 组件结构示例
```vue
<template>
  <div class="component-name">
    <!-- 组件模板 -->
  </div>
</template>

<script>
export default {
  name: 'ComponentName',
  props: {
    // 属性定义
  },
  emits: ['event-name'], // 显式声明事件
  setup(props, { emit }) {
    // 组合式API逻辑
    return {
      // 暴露给模板的数据和方法
    }
  }
}
</script>

<style scoped>
/* 组件样式 */
</style>
```

# 路由配置

使用Vue Router进行页面路由管理：

## 安装依赖
```bash
npm install vue-router@4
```

## 基本配置
```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    // 懒加载路由
    component: () => import('../views/AboutView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
```

## 在main.js中使用
```javascript
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(router)
app.mount('#app')
```

# 状态管理

推荐使用Vue 3的Composition API或Pinia进行状态管理：

## 使用Composition API的响应式系统
```javascript
import { ref, reactive, computed } from 'vue'

export function useCounter() {
  const count = ref(0)
  const increment = () => count.value++
  const doubleCount = computed(() => count.value * 2)
  
  return {
    count,
    increment,
    doubleCount
  }
}
```

## 使用Pinia
```bash
npm install pinia
```

```javascript
// store/counter.js
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0
  }),
  getters: {
    doubleCount: (state) => state.count * 2
  },
  actions: {
    increment() {
      this.count++
    }
  }
})
```

# 开发工作流

## 开发服务器
```bash
npm run dev
```

## 构建项目
```bash
npm run build
```

## 预览构建结果
```bash
npm run preview
```

# 代码规范

## ESLint配置
建议使用Vue官方推荐的ESLint配置：

```bash
npm install eslint eslint-plugin-vue --save-dev
```

## 格式化工具
推荐使用Prettier保持代码风格一致：

```bash
npm install prettier --save-dev
```

# 常见问题与解决方案

## 1. 组件之间的通信
- 父子组件：props向下传递，events向上传递
- 跨组件通信：使用provide/inject或状态管理

## 2. 生命周期钩子
在Composition API中使用：
```javascript
import { onMounted, onUnmounted } from 'vue'

setup() {
  onMounted(() => {
    // 组件挂载后执行
  })
  
  onUnmounted(() => {
    // 组件卸载前执行
  })
}
```

## 3. 响应式数据
- 使用`ref`处理基本类型
- 使用`reactive`处理对象类型
- 确保解构赋值时保持响应性

## 4. Vite配置
自定义构建配置：
```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
```

# 性能优化建议

1. **组件懒加载**：使用动态导入减少初始加载时间
2. **使用虚拟滚动**：处理长列表
3. **避免不必要的重渲染**：合理使用`v-memo`、`computed`
4. **图片优化**：使用合适的格式和尺寸，考虑懒加载
5. **代码分割**：根据路由或组件进行分割
6. **Tree Shaking**：确保打包工具能够移除未使用的代码

# 测试建议

## 单元测试
使用Vitest进行组件和逻辑测试：
```bash
npm install vitest @vue/test-utils --save-dev
```

## E2E测试
可以使用Cypress或Playwright进行端到端测试：
```bash
npm install cypress --save-dev
```

## 每次修改代码后，建议运行测试确保功能正常：
```bash
npm run test
```

# 工作日志规范

为确保项目进度的可追溯性，必须遵守以下工作日志规范：(工作日志要详细一点)

1. **实时记录**：每完成一个独立的任务步骤（如功能开发、Bug修复、文档更新等），必须立即更新 `WORK_LOG.md`。
2. **记录格式**：
   - 使用日期作为一级或二级标题（如 `## 2026-02-07`）。
   - 按功能模块或任务类型分类（如 `### 用户体验优化`）。
   - 使用列表项详细描述具体完成的工作内容。
3. **内容要求**：
   - 明确列出已完成的功能点。
   - 包含关键的技术实现细节（如使用的库、修改的配置等）。
   - 记录新创建或修改的核心文件。
