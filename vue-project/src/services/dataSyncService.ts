import { query, generateUUID } from './mysqlService'

// 数据同步服务
export const dataSyncService = {
  // 同步学习进度
  async syncLearningProgress(userId: string, courseId: string, chapterId: string, progress: number) {
    try {
      // 更新 MySQL 中的学习进度
      await query(
        'INSERT INTO learning_progress (id, user_id, course_id, chapter_id, progress_percentage, completed, last_accessed) VALUES (?, ?, ?, ?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE progress_percentage = VALUES(progress_percentage), completed = VALUES(completed), last_accessed = NOW(), updated_at = NOW()',
        [generateUUID(), userId, courseId, chapterId, progress, progress >= 100]
      )
      
      // 同时更新 LocalStorage 作为缓存
      const progressKey = `learning_progress_${userId}`
      const existingProgress = JSON.parse(localStorage.getItem(progressKey) || '{}')
      
      if (!existingProgress[courseId]) {
        existingProgress[courseId] = {}
      }
      
      existingProgress[courseId][chapterId] = progress
      localStorage.setItem(progressKey, JSON.stringify(existingProgress))
      
      // 更新完成的课程
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
  async syncLearningGoals(userId: string, goals: any[]) {
    try {
      // 先删除旧的学习目标
      await query('DELETE FROM learning_goals WHERE user_id = ?', [userId])
      
      // 插入新的学习目标
      if (goals.length > 0) {
        for (const goal of goals) {
          await query(
            'INSERT INTO learning_goals (id, user_id, goal_text, target_date, completed, created_at) VALUES (?, ?, ?, ?, ?, ?)',
            [generateUUID(), userId, goal.text, goal.targetDate, goal.completed, goal.createdAt || new Date().toISOString()]
          )
        }
      }
      
      // 更新 LocalStorage
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
      // 更新 MySQL 中的学习统计
      await query(
        'INSERT INTO learning_stats (id, user_id, total_study_time, completed_lessons, streak_days, last_study_date) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE total_study_time = VALUES(total_study_time), completed_lessons = VALUES(completed_lessons), streak_days = VALUES(streak_days), last_study_date = VALUES(last_study_date), updated_at = NOW()',
        [generateUUID(), userId, stats.totalStudyTime || 0, stats.completedLessons || 0, stats.streakDays || 0, stats.lastStudyDate || new Date().toISOString()]
      )
      
      // 更新 LocalStorage
      const statsKey = `learning_stats_${userId}`
      localStorage.setItem(statsKey, JSON.stringify(stats))
      
      return true
    } catch (error) {
      console.error('同步学习统计失败:', error)
      return false
    }
  },

  // 同步学习记录
  async syncStudyRecord(userId: string, record: any) {
    try {
      // 插入学习记录到 MySQL
      await query(
        'INSERT INTO study_records (id, user_id, course_id, chapter_id, study_time, completed, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [generateUUID(), userId, record.courseId, record.chapterId, record.studyTime, record.completed, record.timestamp || new Date().toISOString()]
      )
      
      // 更新 LocalStorage 中的学习记录
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
      if (note.id) {
        // 更新现有笔记
        await query(
          'UPDATE user_notes SET content = ?, chapter_id = ?, tags = ?, updated_at = NOW() WHERE id = ? AND user_id = ?',
          [note.content, note.chapterId, JSON.stringify(note.tags || []), note.id, userId]
        )
      } else {
        // 创建新笔记
        const noteId = generateUUID()
        await query(
          'INSERT INTO user_notes (id, user_id, content, chapter_id, tags, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [noteId, userId, note.content, note.chapterId, JSON.stringify(note.tags || []), note.createdAt || new Date().toISOString(), note.updatedAt || new Date().toISOString()]
        )
        note.id = noteId
      }
      
      // 更新 LocalStorage
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
      // 从 MySQL 中删除
      await query('DELETE FROM user_notes WHERE id = ? AND user_id = ?', [noteId, userId])
      
      // 从 LocalStorage 中删除
      const notesKey = `user_notes_${userId}`
      const existingNotes = JSON.parse(localStorage.getItem(notesKey) || '[]')
      const filteredNotes = existingNotes.filter((n: any) => n.id !== noteId)
      localStorage.setItem(notesKey, JSON.stringify(filteredNotes))
      
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
        // 更新现有对话
        await query(
          'UPDATE conversations SET title = ?, messages = ?, updated_at = NOW() WHERE id = ? AND user_id = ?',
          [conversation.title, JSON.stringify(conversation.messages), conversation.id, userId]
        )
      } else {
        // 创建新对话
        const convId = generateUUID()
        await query(
          'INSERT INTO conversations (id, user_id, title, messages, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
          [convId, userId, conversation.title, JSON.stringify(conversation.messages), conversation.createdAt || new Date().toISOString(), conversation.updatedAt || new Date().toISOString()]
        )
        conversation.id = convId
      }
      
      // 更新 LocalStorage
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
      // 从 MySQL 中删除
      await query('DELETE FROM conversations WHERE id = ? AND user_id = ?', [conversationId, userId])
      
      // 从 LocalStorage 中删除
      const conversationKey = `conversation_${userId}`
      const existingConversations = JSON.parse(localStorage.getItem(conversationKey) || '[]')
      const filteredConversations = existingConversations.filter((c: any) => c.id !== conversationId)
      localStorage.setItem(conversationKey, JSON.stringify(filteredConversations))
      
      return true
    } catch (error) {
      console.error('删除对话历史失败:', error)
      return false
    }
  },

  // 同步社区点赞
  async syncCommunityLike(userId: string, postId: string, liked: boolean) {
    try {
      if (liked) {
        // 添加点赞
        await query(
          'INSERT IGNORE INTO community_likes (id, user_id, post_id) VALUES (?, ?, ?)',
          [generateUUID(), userId, postId]
        )
      } else {
        // 取消点赞
        await query('DELETE FROM community_likes WHERE user_id = ? AND post_id = ?', [userId, postId])
      }
      
      // 更新 LocalStorage
      const likesKey = 'communityLikes'
      const existingLikes = JSON.parse(localStorage.getItem(likesKey) || '[]')
      
      if (liked && !existingLikes.includes(postId)) {
        existingLikes.push(postId)
      } else if (!liked) {
        const likeIndex = existingLikes.indexOf(postId)
        if (likeIndex >= 0) {
          existingLikes.splice(likeIndex, 1)
        }
      }
      
      localStorage.setItem(likesKey, JSON.stringify(existingLikes))
      
      return true
    } catch (error) {
      console.error('同步社区点赞失败:', error)
      return false
    }
  },

  // 同步社区书签
  async syncCommunityBookmark(userId: string, postId: string, bookmarked: boolean) {
    try {
      if (bookmarked) {
        // 添加书签
        await query(
          'INSERT IGNORE INTO community_bookmarks (id, user_id, post_id) VALUES (?, ?, ?)',
          [generateUUID(), userId, postId]
        )
      } else {
        // 取消书签
        await query('DELETE FROM community_bookmarks WHERE user_id = ? AND post_id = ?', [userId, postId])
      }
      
      // 更新 LocalStorage
      const bookmarksKey = 'communityBookmarks'
      const existingBookmarks = JSON.parse(localStorage.getItem(bookmarksKey) || '[]')
      
      if (bookmarked && !existingBookmarks.includes(postId)) {
        existingBookmarks.push(postId)
      } else if (!bookmarked) {
        const bookmarkIndex = existingBookmarks.indexOf(postId)
        if (bookmarkIndex >= 0) {
          existingBookmarks.splice(bookmarkIndex, 1)
        }
      }
      
      localStorage.setItem(bookmarksKey, JSON.stringify(existingBookmarks))
      
      return true
    } catch (error) {
      console.error('同步社区书签失败:', error)
      return false
    }
  },

  // 同步社区关注
  async syncCommunityFollow(userId: string, followedUserId: string, followed: boolean) {
    try {
      if (followed) {
        // 添加关注
        await query(
          'INSERT IGNORE INTO community_follows (id, user_id, followed_user_id) VALUES (?, ?, ?)',
          [generateUUID(), userId, followedUserId]
        )
      } else {
        // 取消关注
        await query('DELETE FROM community_follows WHERE user_id = ? AND followed_user_id = ?', [userId, followedUserId])
      }
      
      // 更新 LocalStorage
      const followedUsersKey = 'communityFollowedUsers'
      const existingFollowedUsers = JSON.parse(localStorage.getItem(followedUsersKey) || '[]')
      
      if (followed && !existingFollowedUsers.includes(followedUserId)) {
        existingFollowedUsers.push(followedUserId)
      } else if (!followed) {
        const followIndex = existingFollowedUsers.indexOf(followedUserId)
        if (followIndex >= 0) {
          existingFollowedUsers.splice(followIndex, 1)
        }
      }
      
      localStorage.setItem(followedUsersKey, JSON.stringify(existingFollowedUsers))
      
      return true
    } catch (error) {
      console.error('同步社区关注失败:', error)
      return false
    }
  },

  // 同步社区草稿
  async syncCommunityDraft(userId: string, draft: any) {
    try {
      if (draft.id) {
        // 更新现有草稿
        await query(
          'UPDATE community_drafts SET content = ?, title = ?, updated_at = NOW() WHERE id = ? AND user_id = ?',
          [draft.content, draft.title, draft.id, userId]
        )
      } else {
        // 创建新草稿
        const draftId = generateUUID()
        await query(
          'INSERT INTO community_drafts (id, user_id, content, title, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
          [draftId, userId, draft.content, draft.title, draft.createdAt || new Date().toISOString(), draft.updatedAt || new Date().toISOString()]
        )
        draft.id = draftId
      }
      
      // 更新 LocalStorage
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
  async deleteCommunityDraft(userId: string, draftId: string) {
    try {
      // 从 MySQL 中删除
      await query('DELETE FROM community_drafts WHERE id = ? AND user_id = ?', [draftId, userId])
      
      // 从 LocalStorage 中删除
      const draftsKey = 'communityDrafts'
      const existingDrafts = JSON.parse(localStorage.getItem(draftsKey) || '[]')
      const filteredDrafts = existingDrafts.filter((d: any) => d.id !== draftId)
      localStorage.setItem(draftsKey, JSON.stringify(filteredDrafts))
      
      return true
    } catch (error) {
      console.error('删除社区草稿失败:', error)
      return false
    }
  },

  // 同步修炼数据
  async syncCultivationData(userId: string, exp: number) {
    try {
      // 更新 MySQL 中的修炼数据
      await query(
        'INSERT INTO cultivation (id, user_id, exp, level) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE exp = VALUES(exp), level = VALUES(level), updated_at = NOW()',
        [generateUUID(), userId, exp, Math.floor(exp / 100)]
      )
      
      // 更新 LocalStorage
      localStorage.setItem('cultivation_exp', exp.toString())
      
      return true
    } catch (error) {
      console.error('同步修炼数据失败:', error)
      return false
    }
  },

  // 从 MySQL 同步数据到 LocalStorage
  async syncFromMySQL(userId: string) {
    try {
      console.log('开始从 MySQL 同步数据...')
      
      // 同步学习进度
      const { data: learningProgress } = await query('SELECT * FROM learning_progress WHERE user_id = ?', [userId])
      
      if (learningProgress && Array.isArray(learningProgress)) {
        const progressMap: any = {}
        const completedLessons: string[] = []
        
        learningProgress.forEach((item: any) => {
          if (!progressMap[item.course_id]) {
            progressMap[item.course_id] = {}
          }
          progressMap[item.course_id][item.chapter_id] = item.progress_percentage
          
          if (item.completed) {
            completedLessons.push(`${item.course_id}_${item.chapter_id}`)
          }
        })
        
        localStorage.setItem(`learning_progress_${userId}`, JSON.stringify(progressMap))
        localStorage.setItem(`completed_lessons_${userId}`, JSON.stringify(completedLessons))
      }
      
      // 同步学习目标
      const { data: learningGoals } = await query('SELECT * FROM learning_goals WHERE user_id = ?', [userId])
      
      if (learningGoals && Array.isArray(learningGoals)) {
        const goals = learningGoals.map((item: any) => ({
          id: item.id,
          text: item.goal_text,
          targetDate: item.target_date,
          completed: item.completed,
          createdAt: item.created_at
        }))
        localStorage.setItem('learning_goals', JSON.stringify(goals))
      }
      
      // 同步学习统计
      const { data: learningStats } = await query('SELECT * FROM learning_stats WHERE user_id = ?', [userId])
      
      if (learningStats && Array.isArray(learningStats) && learningStats.length > 0) {
        const stats = {
          totalStudyTime: (learningStats[0] as any).total_study_time,
          completedLessons: (learningStats[0] as any).completed_lessons,
          streakDays: (learningStats[0] as any).streak_days,
          lastStudyDate: (learningStats[0] as any).last_study_date
        }
        localStorage.setItem(`learning_stats_${userId}`, JSON.stringify(stats))
      }
      
      // 同步学习记录
      const { data: studyRecords } = await query('SELECT * FROM study_records WHERE user_id = ?', [userId])
      
      if (studyRecords && Array.isArray(studyRecords)) {
        const records = studyRecords.map((item: any) => ({
          courseId: item.course_id,
          chapterId: item.chapter_id,
          studyTime: item.study_time,
          completed: item.completed,
          timestamp: item.created_at
        }))
        localStorage.setItem(`study_records_${userId}`, JSON.stringify(records))
      }
      
      // 同步用户笔记
      const { data: userNotes } = await query('SELECT * FROM user_notes WHERE user_id = ?', [userId])
      
      if (userNotes && Array.isArray(userNotes)) {
        const notes = userNotes.map((item: any) => ({
          id: item.id,
          content: item.content,
          chapterId: item.chapter_id,
          tags: JSON.parse(item.tags || '[]'),
          createdAt: item.created_at,
          updatedAt: item.updated_at
        }))
        localStorage.setItem(`user_notes_${userId}`, JSON.stringify(notes))
      }
      
      // 同步对话历史
      const { data: conversations } = await query('SELECT * FROM conversations WHERE user_id = ?', [userId])
      
      if (conversations && Array.isArray(conversations)) {
        const convs = conversations.map((item: any) => ({
          id: item.id,
          title: item.title,
          messages: JSON.parse(item.messages),
          createdAt: item.created_at,
          updatedAt: item.updated_at
        }))
        localStorage.setItem(`conversation_${userId}`, JSON.stringify(convs))
      }
      
      // 同步社区数据
      const { data: communityLikes } = await query('SELECT post_id FROM community_likes WHERE user_id = ?', [userId])
      
      if (communityLikes && Array.isArray(communityLikes)) {
        const likes = communityLikes.map((item: any) => item.post_id)
        localStorage.setItem('communityLikes', JSON.stringify(likes))
      }
      
      const { data: communityBookmarks } = await query('SELECT post_id FROM community_bookmarks WHERE user_id = ?', [userId])
      
      if (communityBookmarks && Array.isArray(communityBookmarks)) {
        const bookmarks = communityBookmarks.map((item: any) => item.post_id)
        localStorage.setItem('communityBookmarks', JSON.stringify(bookmarks))
      }
      
      const { data: communityFollows } = await query('SELECT followed_user_id FROM community_follows WHERE user_id = ?', [userId])
      
      if (communityFollows && Array.isArray(communityFollows)) {
        const follows = communityFollows.map((item: any) => item.followed_user_id)
        localStorage.setItem('communityFollowedUsers', JSON.stringify(follows))
      }
      
      const { data: communityDrafts } = await query('SELECT * FROM community_drafts WHERE user_id = ?', [userId])
      
      if (communityDrafts && Array.isArray(communityDrafts)) {
        const drafts = communityDrafts.map((item: any) => ({
          id: item.id,
          content: item.content,
          title: item.title,
          createdAt: item.created_at,
          updatedAt: item.updated_at
        }))
        localStorage.setItem('communityDrafts', JSON.stringify(drafts))
      }
      
      // 同步修炼数据
      const { data: cultivation } = await query('SELECT exp FROM cultivation WHERE user_id = ?', [userId])
      
      if (cultivation && Array.isArray(cultivation) && cultivation.length > 0) {
        localStorage.setItem('cultivation_exp', (cultivation[0] as any).exp.toString())
      }
      
      console.log('从 MySQL 同步数据完成')
      return true
    } catch (error) {
      console.error('从 MySQL 同步数据失败:', error)
      return false
    }
  }
}

export default dataSyncService