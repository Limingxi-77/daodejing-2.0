// 兼容层：历史代码仍会导入 mysqlService，但浏览器端不再直连 MySQL。
// 新增功能请直接使用 services/api.ts 调用 Express 后端 API。

export const testConnection = async () => {
  console.warn('mysqlService 已迁移为前端兼容层，请通过 Express API 访问数据库')
  return true
}

export const query = async (_sql: string, _params?: any[]) => {
  console.warn('已阻止前端直接执行 SQL，请改用 Express API')
  return { data: [], error: null }
}

export const generateUUID = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, char => {
    const random = Math.random() * 16 | 0
    const value = char === 'x' ? random : (random & 0x3 | 0x8)
    return value.toString(16)
  })
}

export const authService = {
  async register() {
    throw new Error('authService.register 已迁移到 Express /api/auth/register')
  },
  async login() {
    throw new Error('authService.login 已迁移到 Express /api/auth/login')
  },
  async updateUser() {
    throw new Error('authService.updateUser 应通过 Express API 实现')
  },
  async getUserById() {
    throw new Error('authService.getUserById 应通过 Express API 实现')
  }
}

export const learningService = {
  async updateProgress() {
    throw new Error('learningService.updateProgress 已迁移到 Express /api/learning/progress')
  },
  async getProgress() {
    throw new Error('learningService.getProgress 已迁移到 Express /api/learning/progress')
  },
  async getUserProgress() {
    throw new Error('learningService.getUserProgress 已迁移到 Express /api/learning/progress')
  },
  async getCourses() {
    throw new Error('learningService.getCourses 应通过 Express API 实现')
  },
  async getChapters() {
    throw new Error('learningService.getChapters 应通过 Express API 实现')
  },
  async getChapterContent() {
    throw new Error('learningService.getChapterContent 应通过 Express API 实现')
  },
  async saveNote() {
    throw new Error('learningService.saveNote 已迁移到 Express /api/notes')
  },
  async getNotes() {
    throw new Error('learningService.getNotes 已迁移到 Express /api/notes')
  }
}

export default {
  testConnection,
  query,
  generateUUID,
  authService,
  learningService
}

