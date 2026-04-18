// 学习笔记服务

// 笔记数据结构
export interface LearningNote {
  id: string
  userId: string
  lessonId: number
  title: string
  content: string
  tags: string[]
  createdAt: string
  updatedAt: string
  isPublic: boolean
}

// 笔记服务类
export class NoteService {
  // 获取用户的所有笔记
  static getUserNotes(userId: string): LearningNote[] {
    const notes = localStorage.getItem(`user_notes_${userId}`)
    return notes ? JSON.parse(notes) : []
  }

  // 根据课程ID获取笔记
  static getNotesByLesson(userId: string, lessonId: number): LearningNote[] {
    const notes = this.getUserNotes(userId)
    return notes.filter(note => note.lessonId === lessonId)
  }

  // 创建新笔记
  static createNote(userId: string, lessonId: number, title: string, content: string, tags: string[] = [], isPublic: boolean = false): LearningNote {
    const newNote: LearningNote = {
      id: this.generateId(),
      userId,
      lessonId,
      title,
      content,
      tags,
      isPublic,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const notes = this.getUserNotes(userId)
    notes.push(newNote)
    this.saveNotes(userId, notes)

    return newNote
  }

  // 更新笔记
  static updateNote(userId: string, noteId: string, updates: Partial<LearningNote>): LearningNote | null {
    const notes = this.getUserNotes(userId)
    const noteIndex = notes.findIndex(note => note.id === noteId)
    
    if (noteIndex === -1) return null

    const updatedNote = {
      ...notes[noteIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    notes[noteIndex] = updatedNote
    this.saveNotes(userId, notes)

    return updatedNote
  }

  // 删除笔记
  static deleteNote(userId: string, noteId: string): boolean {
    const notes = this.getUserNotes(userId)
    const filteredNotes = notes.filter(note => note.id !== noteId)
    
    if (filteredNotes.length === notes.length) return false

    this.saveNotes(userId, filteredNotes)
    return true
  }

  // 搜索笔记
  static searchNotes(userId: string, query: string): LearningNote[] {
    const notes = this.getUserNotes(userId)
    const lowerQuery = query.toLowerCase()
    
    return notes.filter(note => 
      note.title.toLowerCase().includes(lowerQuery) ||
      note.content.toLowerCase().includes(lowerQuery) ||
      note.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }

  // 获取热门标签
  static getPopularTags(userId: string, limit: number = 10): string[] {
    const notes = this.getUserNotes(userId)
    const tagCount: Record<string, number> = {}
    
    notes.forEach(note => {
      note.tags.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1
      })
    })

    return Object.entries(tagCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([tag]) => tag)
  }

  // 生成唯一ID
  private static generateId(): string {
    return `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // 保存笔记到本地存储
  private static saveNotes(userId: string, notes: LearningNote[]): void {
    localStorage.setItem(`user_notes_${userId}`, JSON.stringify(notes))
  }

  // 导出笔记
  static exportNotes(userId: string, format: 'json' | 'markdown' = 'json'): string {
    const notes = this.getUserNotes(userId)
    
    if (format === 'markdown') {
      return this.exportToMarkdown(notes)
    }
    
    return JSON.stringify(notes, null, 2)
  }

  // 导出为Markdown格式
  private static exportToMarkdown(notes: LearningNote[]): string {
    let markdown = '# 道德经学习笔记\n\n'
    
    notes.forEach(note => {
      markdown += `## ${note.title}\n\n`
      markdown += `**课程**: 第${note.lessonId}章  
`
      markdown += `**创建时间**: ${new Date(note.createdAt).toLocaleString()}  
`
      markdown += `**标签**: ${note.tags.join(', ')}  
\n`
      markdown += `${note.content}\n\n`
      markdown += '---\n\n'
    })
    
    return markdown
  }

  // 导入笔记
  static importNotes(userId: string, notesData: string): boolean {
    try {
      const notes = JSON.parse(notesData) as LearningNote[]
      
      // 验证数据格式
      if (!Array.isArray(notes) || !notes.every(this.isValidNote)) {
        return false
      }
      
      // 合并现有笔记
      const existingNotes = this.getUserNotes(userId)
      const mergedNotes = [...existingNotes, ...notes]
      
      this.saveNotes(userId, mergedNotes)
      return true
    } catch (error) {
      console.error('导入笔记失败:', error)
      return false
    }
  }

  // 验证笔记格式
  private static isValidNote(note: any): note is LearningNote {
    return (
      typeof note.id === 'string' &&
      typeof note.userId === 'string' &&
      typeof note.lessonId === 'number' &&
      typeof note.title === 'string' &&
      typeof note.content === 'string' &&
      Array.isArray(note.tags) &&
      typeof note.createdAt === 'string' &&
      typeof note.updatedAt === 'string' &&
      typeof note.isPublic === 'boolean'
    )
  }
}