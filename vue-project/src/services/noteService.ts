import { apiClient } from '@/services/api'

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

interface NotesResponse {
  success: boolean
  notes: LearningNote[]
}

interface NoteResponse {
  success: boolean
  note: LearningNote
}

export class NoteService {
  static getUserNotes(userId: string): LearningNote[] {
    const notes = localStorage.getItem(`user_notes_${userId}`)
    return notes ? JSON.parse(notes) : []
  }

  static async fetchUserNotes(userId: string): Promise<LearningNote[]> {
    try {
      const response = await apiClient<NotesResponse>('/notes')
      this.saveNotes(userId, response.notes)
      return response.notes
    } catch (error) {
      console.warn('后端笔记加载失败，使用本地缓存:', error)
      return this.getUserNotes(userId)
    }
  }

  static getNotesByLesson(userId: string, lessonId: number): LearningNote[] {
    const notes = this.getUserNotes(userId)
    return notes.filter(note => note.lessonId === lessonId)
  }

  static async fetchNotesByLesson(userId: string, lessonId: number): Promise<LearningNote[]> {
    try {
      const response = await apiClient<NotesResponse>(`/notes?lessonId=${lessonId}`)
      return response.notes
    } catch (error) {
      console.warn('后端课程笔记加载失败，使用本地缓存:', error)
      return this.getNotesByLesson(userId, lessonId)
    }
  }

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
    this.createNoteRemote(newNote).catch(error => console.warn('后端笔记创建失败:', error))

    return newNote
  }

  static async createNoteRemote(note: LearningNote): Promise<LearningNote> {
    const response = await apiClient<NoteResponse>('/notes', {
      method: 'POST',
      body: note
    })
    return response.note
  }

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
    this.updateNoteRemote(noteId, updates).catch(error => console.warn('后端笔记更新失败:', error))

    return updatedNote
  }

  static async updateNoteRemote(noteId: string, updates: Partial<LearningNote>): Promise<LearningNote> {
    const response = await apiClient<NoteResponse>(`/notes/${noteId}`, {
      method: 'PATCH',
      body: updates
    })
    return response.note
  }

  static deleteNote(userId: string, noteId: string): boolean {
    const notes = this.getUserNotes(userId)
    const filteredNotes = notes.filter(note => note.id !== noteId)
    if (filteredNotes.length === notes.length) return false

    this.saveNotes(userId, filteredNotes)
    this.deleteNoteRemote(noteId).catch(error => console.warn('后端笔记删除失败:', error))
    return true
  }

  static async deleteNoteRemote(noteId: string): Promise<void> {
    await apiClient(`/notes/${noteId}`, { method: 'DELETE' })
  }

  static searchNotes(userId: string, query: string): LearningNote[] {
    const notes = this.getUserNotes(userId)
    const lowerQuery = query.toLowerCase()

    return notes.filter(note =>
      note.title.toLowerCase().includes(lowerQuery) ||
      note.content.toLowerCase().includes(lowerQuery) ||
      note.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }

  static getPopularTags(userId: string, limit: number = 10): string[] {
    const notes = this.getUserNotes(userId)
    const tagCount: Record<string, number> = {}

    notes.forEach(note => {
      note.tags.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1
      })
    })

    return Object.entries(tagCount)
      .sort(([, first], [, second]) => second - first)
      .slice(0, limit)
      .map(([tag]) => tag)
  }

  static exportNotes(userId: string, format: 'json' | 'markdown' = 'json'): string {
    const notes = this.getUserNotes(userId)
    if (format === 'markdown') return this.exportToMarkdown(notes)
    return JSON.stringify(notes, null, 2)
  }

  static importNotes(userId: string, notesData: string): boolean {
    try {
      const notes = JSON.parse(notesData) as LearningNote[]
      if (!Array.isArray(notes) || !notes.every(this.isValidNote)) return false
      const existingNotes = this.getUserNotes(userId)
      const mergedNotes = [...existingNotes, ...notes]
      this.saveNotes(userId, mergedNotes)
      notes.forEach(note => this.createNoteRemote(note).catch(error => console.warn('后端笔记导入失败:', error)))
      return true
    } catch (error) {
      console.error('导入笔记失败:', error)
      return false
    }
  }

  private static generateId(): string {
    return `note_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
  }

  private static saveNotes(userId: string, notes: LearningNote[]): void {
    localStorage.setItem(`user_notes_${userId}`, JSON.stringify(notes))
  }

  private static exportToMarkdown(notes: LearningNote[]): string {
    let markdown = '# 道德经学习笔记\n\n'
    notes.forEach(note => {
      markdown += `## ${note.title}\n\n`
      markdown += `**课程**: 第${note.lessonId}章  \n`
      markdown += `**创建时间**: ${new Date(note.createdAt).toLocaleString()}  \n`
      markdown += `**标签**: ${note.tags.join(', ')}  \n\n`
      markdown += `${note.content}\n\n---\n\n`
    })
    return markdown
  }

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

