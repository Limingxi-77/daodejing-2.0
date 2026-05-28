import { apiClient } from '@/services/api'

// 数据同步服务
export const dataSyncService = {
  // 同步学习进度
  async syncLearningProgress(userId: string, courseId: string, chapterId: string, progress: number) {
    try {
      await apiClient('/learning/progress', {
        method: 'PUT',
        body: { courseId, chapterId, progress }
      })

      const progressKey = `learning_progress_${userId}`
      const existingProgress = JSON.parse(localStorage.getItem(progressKey) || '{}')
      if (!existingProgress[courseId]) existingProgress[courseId] = {}
      existingProgress[courseId][chapterId] = progress
      localStorage.setItem(progressKey, JSON.stringify(existingProgress))

      if (progress >= 100) {
        const completedKey = `completed_lessons_${userId}`
        const completedLessons = JSON.parse(localStorage.getItem(completedKey) || '[]')
        const lessonKey = `${courseId}_${chapterId}`
        if (!completedLessons.includes(lessonKey)) {
          completedLessons.push(lessonKey)
          localStorage.setItem(completedKey, JSON.stringify(completedLessons))
        }
      }

      return true
    } catch (error) {
      console.error('同步学习进度异常:', error)
      return false
    }
  },

  // 同步学习目标
  async syncLearningGoals(_userId: string, goals: any[]) {
    try {
      localStorage.setItem('learning_goals', JSON.stringify(goals))
      return true
    } catch (error) {
      console.error('同步学习目标失败:', error)
      return false
    }
  },

  // 同步学习统计
  async syncLearningStats(userId: string, stats: any) {
    try {
      await apiClient('/learning/stats', { method: 'PUT', body: stats })
      localStorage.setItem(`learning_stats_${userId}`, JSON.stringify(stats))
      return true
    } catch (error) {
      console.error('同步学习统计失败:', error)
      return false
    }
  },

  // 同步学习记录
  async syncStudyRecord(userId: string, record: any) {
    try {
      await apiClient('/learning/records', { method: 'POST', body: record })
      const recordsKey = `study_records_${userId}`
      const existingRecords = JSON.parse(localStorage.getItem(recordsKey) || '[]')
      existingRecords.push(record)
      localStorage.setItem(recordsKey, JSON.stringify(existingRecords))
      return true
    } catch (error) {
      console.error('同步学习记录失败:', error)
      return false
    }
  },

  // 同步用户笔记
  async syncUserNote(userId: string, note: any) {
    try {
      const response = note.id
        ? await apiClient<{ success: boolean; note: any }>(`/notes/${note.id}`, { method: 'PATCH', body: note })
        : await apiClient<{ success: boolean; note: any }>('/notes', { method: 'POST', body: note })

      if (response.note?.id) note.id = response.note.id

      const notesKey = `user_notes_${userId}`
      const existingNotes = JSON.parse(localStorage.getItem(notesKey) || '[]')
      const noteIndex = existingNotes.findIndex((n: any) => n.id === note.id)
      if (noteIndex >= 0) {
        existingNotes[noteIndex] = note
      } else {
        existingNotes.push(note)
      }
      localStorage.setItem(notesKey, JSON.stringify(existingNotes))
      return true
    } catch (error) {
      console.error('同步用户笔记失败:', error)
      return false
    }
  },

  // 删除用户笔记
  async deleteUserNote(userId: string, noteId: string) {
    try {
      await apiClient(`/notes/${noteId}`, { method: 'DELETE' })
      const notesKey = `user_notes_${userId}`
      const existingNotes = JSON.parse(localStorage.getItem(notesKey) || '[]')
      localStorage.setItem(notesKey, JSON.stringify(existingNotes.filter((n: any) => n.id !== noteId)))
      return true
    } catch (error) {
      console.error('删除用户笔记失败:', error)
      return false
    }
  },

  // 同步对话历史
  async syncConversation(userId: string, conversation: any) {
    try {
      if (conversation.id) {
        await apiClient(`/conversations/${conversation.id}/messages`, {
          method: 'POST',
          body: { title: conversation.title, messages: conversation.messages }
        })
      } else {
        const res = await apiClient<{ success: boolean; conversation: any }>('/conversations', {
          method: 'POST',
          body: { title: conversation.title, messages: conversation.messages }
        })
        if (res.conversation?.id) conversation.id = res.conversation.id
      }

      const conversationKey = `conversation_${userId}`
      const existingConversations = JSON.parse(localStorage.getItem(conversationKey) || '[]')
      const convIndex = existingConversations.findIndex((c: any) => c.id === conversation.id)
      if (convIndex >= 0) {
        existingConversations[convIndex] = conversation
      } else {
        existingConversations.push(conversation)
      }
      localStorage.setItem(conversationKey, JSON.stringify(existingConversations))
      return true
    } catch (error) {
      console.error('同步对话历史失败:', error)
      return false
    }
  },

  // 删除对话历史
  async deleteConversation(userId: string, conversationId: string) {
    try {
      await apiClient(`/conversations/${conversationId}`, { method: 'DELETE' })
      const conversationKey = `conversation_${userId}`
      const existingConversations = JSON.parse(localStorage.getItem(conversationKey) || '[]')
      localStorage.setItem(conversationKey, JSON.stringify(existingConversations.filter((c: any) => c.id !== conversationId)))
      return true
    } catch (error) {
      console.error('删除对话历史失败:', error)
      return false
    }
  },

  // 同步社区点赞
  async syncCommunityLike(_userId: string, postId: string, liked: boolean) {
    try {
      await apiClient(`/community/posts/${postId}/like`, { method: 'POST', body: { liked } })
      const likesKey = 'communityLikes'
      const existingLikes = JSON.parse(localStorage.getItem(likesKey) || '[]')
      if (liked && !existingLikes.includes(postId)) {
        existingLikes.push(postId)
      } else if (!liked) {
        const likeIndex = existingLikes.indexOf(postId)
        if (likeIndex >= 0) existingLikes.splice(likeIndex, 1)
      }
      localStorage.setItem(likesKey, JSON.stringify(existingLikes))
      return true
    } catch (error) {
      console.error('同步社区点赞失败:', error)
      return false
    }
  },

  // 同步社区书签
  async syncCommunityBookmark(_userId: string, postId: string, bookmarked: boolean) {
    try {
      await apiClient(`/community/posts/${postId}/bookmark`, { method: 'POST', body: { bookmarked } })
      const bookmarksKey = 'communityBookmarks'
      const existingBookmarks = JSON.parse(localStorage.getItem(bookmarksKey) || '[]')
      if (bookmarked && !existingBookmarks.includes(postId)) {
        existingBookmarks.push(postId)
      } else if (!bookmarked) {
        const bookmarkIndex = existingBookmarks.indexOf(postId)
        if (bookmarkIndex >= 0) existingBookmarks.splice(bookmarkIndex, 1)
      }
      localStorage.setItem(bookmarksKey, JSON.stringify(existingBookmarks))
      return true
    } catch (error) {
      console.error('同步社区书签失败:', error)
      return false
    }
  },

  // 同步社区关注
  async syncCommunityFollow(_userId: string, followedUserId: string, followed: boolean) {
    try {
      if (followed) {
        await apiClient('/community/follow', { method: 'POST', body: { userId: followedUserId } })
      } else {
        await apiClient(`/community/follow/${followedUserId}`, { method: 'DELETE' })
      }

      const followedUsersKey = 'communityFollowedUsers'
      const existingFollowedUsers = JSON.parse(localStorage.getItem(followedUsersKey) || '[]')
      if (followed && !existingFollowedUsers.includes(followedUserId)) {
        existingFollowedUsers.push(followedUserId)
      } else if (!followed) {
        const followIndex = existingFollowedUsers.indexOf(followedUserId)
        if (followIndex >= 0) existingFollowedUsers.splice(followIndex, 1)
      }
      localStorage.setItem(followedUsersKey, JSON.stringify(existingFollowedUsers))
      return true
    } catch (error) {
      console.error('同步社区关注失败:', error)
      return false
    }
  },

  // 同步社区草稿
  async syncCommunityDraft(_userId: string, draft: any) {
    try {
      if (draft.id) {
        await apiClient(`/community/drafts/${draft.id}`, { method: 'PATCH', body: draft })
      } else {
        const res = await apiClient<{ success: boolean; draft: any }>('/community/drafts', { method: 'POST', body: draft })
        if (res.draft?.id) draft.id = res.draft.id
      }

      const draftsKey = 'communityDrafts'
      const existingDrafts = JSON.parse(localStorage.getItem(draftsKey) || '[]')
      const draftIndex = existingDrafts.findIndex((d: any) => d.id === draft.id)
      if (draftIndex >= 0) {
        existingDrafts[draftIndex] = draft
      } else {
        existingDrafts.push(draft)
      }
      localStorage.setItem(draftsKey, JSON.stringify(existingDrafts))
      return true
    } catch (error) {
      console.error('同步社区草稿失败:', error)
      return false
    }
  },

  // 删除社区草稿
  async deleteCommunityDraft(_userId: string, draftId: string) {
    try {
      await apiClient(`/community/drafts/${draftId}`, { method: 'DELETE' })
      const draftsKey = 'communityDrafts'
      const existingDrafts = JSON.parse(localStorage.getItem(draftsKey) || '[]')
      localStorage.setItem(draftsKey, JSON.stringify(existingDrafts.filter((d: any) => d.id !== draftId)))
      return true
    } catch (error) {
      console.error('删除社区草稿失败:', error)
      return false
    }
  },

  // 同步修炼数据
  async syncCultivationData(_userId: string, exp: number, realm?: string) {
    try {
      await apiClient('/cultivation', {
        method: 'PUT',
        body: { exp, realm: realm || '凡人' }
      })
      localStorage.setItem('cultivation_exp', exp.toString())
      return true
    } catch (error) {
      console.error('同步修炼数据失败:', error)
      return false
    }
  },

  // 从后端同步数据到 LocalStorage
  async syncFromMySQL(userId: string) {
    try {
      console.log('开始从后端同步数据...')

      // 同步学习进度
      try {
        const progressRes = await apiClient<{ success: boolean; progress: Record<string, Record<string, number>> }>('/learning/progress')
        if (progressRes.success && progressRes.progress) {
          const progressMap = progressRes.progress
          const completedLessons: string[] = []
          for (const [courseId, chapters] of Object.entries(progressMap)) {
            for (const [chapterId, pct] of Object.entries(chapters)) {
              if (pct >= 100) completedLessons.push(`${courseId}_${chapterId}`)
            }
          }
          localStorage.setItem(`learning_progress_${userId}`, JSON.stringify(progressMap))
          localStorage.setItem(`completed_lessons_${userId}`, JSON.stringify(completedLessons))
        }
      } catch {}

      // 同步学习目标
      try {
        const goalsRes = await apiClient<{ success: boolean; data: any[] }>('/learning/goals')
        if (goalsRes.success && Array.isArray(goalsRes.data)) {
          localStorage.setItem('learning_goals', JSON.stringify(goalsRes.data))
        }
      } catch {}

      // 同步学习统计
      try {
        const statsRes = await apiClient<{ success: boolean; data: any }>('/learning/stats')
        if (statsRes.success && statsRes.data) {
          localStorage.setItem(`learning_stats_${userId}`, JSON.stringify(statsRes.data))
        }
      } catch {}

      // 同步学习记录
      try {
        const recordsRes = await apiClient<{ success: boolean; data: any[] }>('/learning/records')
        if (recordsRes.success && Array.isArray(recordsRes.data)) {
          localStorage.setItem(`study_records_${userId}`, JSON.stringify(recordsRes.data))
        }
      } catch {}

      // 同步用户笔记
      try {
        const notesRes = await apiClient<{ success: boolean; notes: any[] }>('/notes')
        if (notesRes.success && Array.isArray(notesRes.notes)) {
          localStorage.setItem(`user_notes_${userId}`, JSON.stringify(notesRes.notes))
        }
      } catch {}

      // 同步对话历史
      try {
        const convsRes = await apiClient<{ success: boolean; conversations: any[] }>('/conversations')
        if (convsRes.success && Array.isArray(convsRes.conversations)) {
          localStorage.setItem(`conversation_${userId}`, JSON.stringify(convsRes.conversations))
        }
      } catch {}

      // 同步社区点赞
      try {
        const likesRes = await apiClient<{ success: boolean; data: any[] }>('/community/posts')
        if (likesRes.success && Array.isArray(likesRes.data)) {
          const likedPostIds = likesRes.data.filter((p: any) => p.liked).map((p: any) => p.id)
          localStorage.setItem('communityLikes', JSON.stringify(likedPostIds))
        }
      } catch {}

      // 同步社区书签
      try {
        const bookmarksRes = await apiClient<{ success: boolean; data: any[] }>('/community/posts')
        if (bookmarksRes.success && Array.isArray(bookmarksRes.data)) {
          const bookmarkedPostIds = bookmarksRes.data.filter((p: any) => p.bookmarked).map((p: any) => p.id)
          localStorage.setItem('communityBookmarks', JSON.stringify(bookmarkedPostIds))
        }
      } catch {}

      // 同步社区关注
      try {
        const followsRes = await apiClient<{ success: boolean; data: string[] }>('/community/follows')
        if (followsRes.success && Array.isArray(followsRes.data)) {
          localStorage.setItem('communityFollowedUsers', JSON.stringify(followsRes.data))
        }
      } catch {}

      // 同步社区草稿
      try {
        const draftsRes = await apiClient<{ success: boolean; data: any[] }>('/community/drafts')
        if (draftsRes.success && Array.isArray(draftsRes.data)) {
          localStorage.setItem('communityDrafts', JSON.stringify(draftsRes.data))
        }
      } catch {}

      // 同步修炼数据
      try {
        const cultivationRes = await apiClient<{ success: boolean; data: { exp: number; realm: string } }>('/cultivation')
        if (cultivationRes.success && cultivationRes.data) {
          localStorage.setItem('cultivation_exp', (cultivationRes.data.exp || 0).toString())
        }
      } catch {}

      console.log('从后端同步数据完成')
      return true
    } catch (error) {
      console.error('从后端同步数据失败:', error)
      return false
    }
  }
}

export default dataSyncService
