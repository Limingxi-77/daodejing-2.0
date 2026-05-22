import { query, generateUUID } from './mysqlService'

// 数据迁移服务
export const dataMigrationService = {
  // 迁移用户数据
  async migrateUserData(userId: string) {
    try {
      console.log('开始迁移用户数据...')
      
      // 1. 迁移学习进度
      await this.migrateLearningProgress(userId)
      
      // 2. 迁移学习目标
      await this.migrateLearningGoals(userId)
      
      // 3. 迁移学习统计
      await this.migrateLearningStats(userId)
      
      // 4. 迁移用户笔记
      await this.migrateUserNotes(userId)
      
      // 5. 迁移对话历史
      await this.migrateConversations(userId)
      
      // 6. 迁移社区数据
      await this.migrateCommunityData(userId)
      
      // 7. 迁移修炼数据
      await this.migrateCultivationData(userId)
      
      console.log('用户数据迁移完成')
      return { success: true }
    } catch (error) {
      console.error('用户数据迁移失败:', error)
      return { success: false, error }
    }
  },

  // 迁移学习进度
  async migrateLearningProgress(userId: string) {
    try {
      const progressKey = `learning_progress_${userId}`
      const completedKey = `completed_lessons_${userId}`
      
      const progressData = localStorage.getItem(progressKey)
      const completedData = localStorage.getItem(completedKey)
      
      if (progressData) {
        const progress = JSON.parse(progressData)
        
        // 检查学习进度表是否存在
        const { data: existingProgress } = await query(
          'SELECT id FROM learning_progress WHERE user_id = ? LIMIT 1',
          [userId]
        )
        
        if (!existingProgress || (Array.isArray(existingProgress) && existingProgress.length === 0)) {
          // 批量插入学习进度
          const progressRecords = Object.entries(progress).map(([courseId, courseProgress]) => {
            if (typeof courseProgress === 'object' && courseProgress !== null) {
              return Object.entries(courseProgress).map(([chapterId, chapterProgress]) => ({
                id: generateUUID(),
                user_id: userId,
                course_id: courseId,
                chapter_id: chapterId,
                progress_percentage: chapterProgress as number,
                completed: (chapterProgress as number) >= 100
              }))
            }
            return []
          }).flat()
          
          if (progressRecords.length > 0) {
            // 批量插入
            for (const record of progressRecords) {
              await query(
                'INSERT INTO learning_progress (id, user_id, course_id, chapter_id, progress_percentage, completed) VALUES (?, ?, ?, ?, ?, ?)',
                [record.id, record.user_id, record.course_id, record.chapter_id, record.progress_percentage, record.completed]
              )
            }
          }
        }
      }
      
      if (completedData) {
        // 可以根据需要处理完成的课程数据
        JSON.parse(completedData)
      }
      
      // 清理 LocalStorage
      localStorage.removeItem(progressKey)
      localStorage.removeItem(completedKey)
      
      console.log('学习进度迁移完成')
    } catch (error) {
      console.error('迁移学习进度失败:', error)
    }
  },

  // 迁移学习目标
  async migrateLearningGoals(userId: string) {
    try {
      const goalsData = localStorage.getItem('learning_goals')
      
      if (goalsData) {
        const goals = JSON.parse(goalsData)
        
        // 检查学习目标表是否存在
        try {
          await query('SELECT id FROM learning_goals LIMIT 1')
        } catch (tableError) {
          // 表不存在，创建表
          await query(`
            CREATE TABLE learning_goals (
              id VARCHAR(36) PRIMARY KEY,
              user_id VARCHAR(36) NOT NULL,
              goal_text TEXT NOT NULL,
              target_date DATETIME,
              completed BOOLEAN DEFAULT FALSE,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
          `)
        }
        
        // 插入学习目标
        const goalRecords = goals.map((goal: any) => ({
          id: generateUUID(),
          user_id: userId,
          goal_text: goal.text,
          target_date: goal.targetDate,
          completed: goal.completed
        }))
        
        if (goalRecords.length > 0) {
          for (const record of goalRecords) {
            await query(
              'INSERT INTO learning_goals (id, user_id, goal_text, target_date, completed) VALUES (?, ?, ?, ?, ?)',
              [record.id, record.user_id, record.goal_text, record.target_date, record.completed]
            )
          }
        }
        
        // 清理 LocalStorage
        localStorage.removeItem('learning_goals')
      }
      
      console.log('学习目标迁移完成')
    } catch (error) {
      console.error('迁移学习目标失败:', error)
    }
  },

  // 迁移学习统计
  async migrateLearningStats(userId: string) {
    try {
      const statsKey = `learning_stats_${userId}`
      const recordsKey = `study_records_${userId}`
      
      const statsData = localStorage.getItem(statsKey)
      const recordsData = localStorage.getItem(recordsKey)
      
      if (statsData) {
        const stats = JSON.parse(statsData)
        
        // 检查学习统计表是否存在
        try {
          await query('SELECT id FROM learning_stats LIMIT 1')
        } catch (tableError) {
          // 表不存在，创建表
          await query(`
            CREATE TABLE learning_stats (
              id VARCHAR(36) PRIMARY KEY,
              user_id VARCHAR(36) NOT NULL,
              total_study_time INT DEFAULT 0,
              completed_lessons INT DEFAULT 0,
              streak_days INT DEFAULT 0,
              last_study_date DATETIME,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
              UNIQUE KEY (user_id)
            )
          `)
        }
        
        // 插入学习统计
        await query(
          'INSERT INTO learning_stats (id, user_id, total_study_time, completed_lessons, streak_days, last_study_date) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE total_study_time = VALUES(total_study_time), completed_lessons = VALUES(completed_lessons), streak_days = VALUES(streak_days), last_study_date = VALUES(last_study_date), updated_at = NOW()',
          [generateUUID(), userId, stats.totalStudyTime || 0, stats.completedLessons || 0, stats.streakDays || 0, stats.lastStudyDate || new Date().toISOString()]
        )
      }
      
      if (recordsData) {
        const records = JSON.parse(recordsData)
        
        // 检查学习记录表是否存在
        try {
          await query('SELECT id FROM study_records LIMIT 1')
        } catch (tableError) {
          // 表不存在，创建表
          await query(`
            CREATE TABLE study_records (
              id VARCHAR(36) PRIMARY KEY,
              user_id VARCHAR(36) NOT NULL,
              course_id VARCHAR(36),
              chapter_id VARCHAR(36),
              study_time INT DEFAULT 0,
              completed BOOLEAN DEFAULT FALSE,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
          `)
        }
        
        // 插入学习记录
        const recordRecords = records.map((record: any) => ({
          id: generateUUID(),
          user_id: userId,
          course_id: record.courseId,
          chapter_id: record.chapterId,
          study_time: record.studyTime,
          completed: record.completed,
          created_at: record.timestamp || new Date().toISOString()
        }))
        
        if (recordRecords.length > 0) {
          for (const record of recordRecords) {
            await query(
              'INSERT INTO study_records (id, user_id, course_id, chapter_id, study_time, completed, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [record.id, record.user_id, record.course_id, record.chapter_id, record.study_time, record.completed, record.created_at]
            )
          }
        }
      }
      
      // 清理 LocalStorage
      localStorage.removeItem(statsKey)
      localStorage.removeItem(recordsKey)
      
      console.log('学习统计迁移完成')
    } catch (error) {
      console.error('迁移学习统计失败:', error)
    }
  },

  // 迁移用户笔记
  async migrateUserNotes(userId: string) {
    try {
      const notesKey = `user_notes_${userId}`
      const notesData = localStorage.getItem(notesKey)
      
      if (notesData) {
        const notes = JSON.parse(notesData)
        
        // 检查用户笔记表是否存在
        try {
          await query('SELECT id FROM user_notes LIMIT 1')
        } catch (tableError) {
          // 表不存在，创建表
          await query(`
            CREATE TABLE user_notes (
              id VARCHAR(36) PRIMARY KEY,
              user_id VARCHAR(36) NOT NULL,
              content TEXT NOT NULL,
              chapter_id VARCHAR(36),
              tags TEXT,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
          `)
        }
        
        // 插入用户笔记
        const noteRecords = notes.map((note: any) => ({
          id: generateUUID(),
          user_id: userId,
          content: note.content,
          chapter_id: note.chapterId,
          tags: JSON.stringify(note.tags || []),
          created_at: note.createdAt || new Date().toISOString(),
          updated_at: note.updatedAt || new Date().toISOString()
        }))
        
        if (noteRecords.length > 0) {
          for (const record of noteRecords) {
            await query(
              'INSERT INTO user_notes (id, user_id, content, chapter_id, tags, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [record.id, record.user_id, record.content, record.chapter_id, record.tags, record.created_at, record.updated_at]
            )
          }
        }
        
        // 清理 LocalStorage
        localStorage.removeItem(notesKey)
      }
      
      console.log('用户笔记迁移完成')
    } catch (error) {
      console.error('迁移用户笔记失败:', error)
    }
  },

  // 迁移对话历史
  async migrateConversations(userId: string) {
    try {
      const conversationKey = `conversation_${userId}`
      const conversationData = localStorage.getItem(conversationKey)
      
      if (conversationData) {
        const conversations = JSON.parse(conversationData)
        
        // 检查对话历史表是否存在
        try {
          await query('SELECT id FROM conversations LIMIT 1')
        } catch (tableError) {
          // 表不存在，创建表
          await query(`
            CREATE TABLE conversations (
              id VARCHAR(36) PRIMARY KEY,
              user_id VARCHAR(36) NOT NULL,
              title VARCHAR(255) NOT NULL,
              messages TEXT NOT NULL,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
          `)
        }
        
        // 插入对话历史
        const conversationRecords = conversations.map((conversation: any) => ({
          id: generateUUID(),
          user_id: userId,
          title: conversation.title,
          messages: JSON.stringify(conversation.messages),
          created_at: conversation.createdAt || new Date().toISOString(),
          updated_at: conversation.updatedAt || new Date().toISOString()
        }))
        
        if (conversationRecords.length > 0) {
          for (const record of conversationRecords) {
            await query(
              'INSERT INTO conversations (id, user_id, title, messages, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
              [record.id, record.user_id, record.title, record.messages, record.created_at, record.updated_at]
            )
          }
        }
        
        // 清理 LocalStorage
        localStorage.removeItem(conversationKey)
      }
      
      console.log('对话历史迁移完成')
    } catch (error) {
      console.error('迁移对话历史失败:', error)
    }
  },

  // 迁移社区数据
  async migrateCommunityData(userId: string) {
    try {
      const likesKey = 'communityLikes'
      const bookmarksKey = 'communityBookmarks'
      const followedUsersKey = 'communityFollowedUsers'
      const draftsKey = 'communityDrafts'
      
      const likesData = localStorage.getItem(likesKey)
      const bookmarksData = localStorage.getItem(bookmarksKey)
      const followedUsersData = localStorage.getItem(followedUsersKey)
      const draftsData = localStorage.getItem(draftsKey)
      
      if (likesData) {
        const likes = JSON.parse(likesData)
        // 检查社区点赞表是否存在
        try {
          await query('SELECT id FROM community_likes LIMIT 1')
        } catch (tableError) {
          // 表不存在，创建表
          await query(`
            CREATE TABLE community_likes (
              id VARCHAR(36) PRIMARY KEY,
              user_id VARCHAR(36) NOT NULL,
              post_id VARCHAR(36) NOT NULL,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
              UNIQUE KEY (user_id, post_id)
            )
          `)
        }
        
        // 插入社区点赞
        const likeRecords = likes.map((postId: string) => ({
          id: generateUUID(),
          user_id: userId,
          post_id: postId
        }))
        
        if (likeRecords.length > 0) {
          for (const record of likeRecords) {
            await query(
              'INSERT IGNORE INTO community_likes (id, user_id, post_id) VALUES (?, ?, ?)',
              [record.id, record.user_id, record.post_id]
            )
          }
        }
      }
      
      if (bookmarksData) {
        const bookmarks = JSON.parse(bookmarksData)
        // 检查社区书签表是否存在
        try {
          await query('SELECT id FROM community_bookmarks LIMIT 1')
        } catch (tableError) {
          // 表不存在，创建表
          await query(`
            CREATE TABLE community_bookmarks (
              id VARCHAR(36) PRIMARY KEY,
              user_id VARCHAR(36) NOT NULL,
              post_id VARCHAR(36) NOT NULL,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
              UNIQUE KEY (user_id, post_id)
            )
          `)
        }
        
        // 插入社区书签
        const bookmarkRecords = bookmarks.map((postId: string) => ({
          id: generateUUID(),
          user_id: userId,
          post_id: postId
        }))
        
        if (bookmarkRecords.length > 0) {
          for (const record of bookmarkRecords) {
            await query(
              'INSERT IGNORE INTO community_bookmarks (id, user_id, post_id) VALUES (?, ?, ?)',
              [record.id, record.user_id, record.post_id]
            )
          }
        }
      }
      
      if (followedUsersData) {
        const followedUsers = JSON.parse(followedUsersData)
        // 检查社区关注表是否存在
        try {
          await query('SELECT id FROM community_follows LIMIT 1')
        } catch (tableError) {
          // 表不存在，创建表
          await query(`
            CREATE TABLE community_follows (
              id VARCHAR(36) PRIMARY KEY,
              user_id VARCHAR(36) NOT NULL,
              followed_user_id VARCHAR(36) NOT NULL,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
              UNIQUE KEY (user_id, followed_user_id)
            )
          `)
        }
        
        // 插入社区关注
        const followRecords = followedUsers.map((followedUserId: string) => ({
          id: generateUUID(),
          user_id: userId,
          followed_user_id: followedUserId
        }))
        
        if (followRecords.length > 0) {
          for (const record of followRecords) {
            await query(
              'INSERT IGNORE INTO community_follows (id, user_id, followed_user_id) VALUES (?, ?, ?)',
              [record.id, record.user_id, record.followed_user_id]
            )
          }
        }
      }
      
      if (draftsData) {
        const drafts = JSON.parse(draftsData)
        // 检查社区草稿表是否存在
        try {
          await query('SELECT id FROM community_drafts LIMIT 1')
        } catch (tableError) {
          // 表不存在，创建表
          await query(`
            CREATE TABLE community_drafts (
              id VARCHAR(36) PRIMARY KEY,
              user_id VARCHAR(36) NOT NULL,
              content TEXT NOT NULL,
              title VARCHAR(255) NOT NULL,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
          `)
        }
        
        // 插入社区草稿
        const draftRecords = drafts.map((draft: any) => ({
          id: generateUUID(),
          user_id: userId,
          content: draft.content,
          title: draft.title,
          created_at: draft.createdAt || new Date().toISOString(),
          updated_at: draft.updatedAt || new Date().toISOString()
        }))
        
        if (draftRecords.length > 0) {
          for (const record of draftRecords) {
            await query(
              'INSERT INTO community_drafts (id, user_id, content, title, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
              [record.id, record.user_id, record.content, record.title, record.created_at, record.updated_at]
            )
          }
        }
      }
      
      // 清理 LocalStorage
      localStorage.removeItem(likesKey)
      localStorage.removeItem(bookmarksKey)
      localStorage.removeItem(followedUsersKey)
      localStorage.removeItem(draftsKey)
      
      console.log('社区数据迁移完成')
    } catch (error) {
      console.error('迁移社区数据失败:', error)
    }
  },

  // 迁移修炼数据
  async migrateCultivationData(userId: string) {
    try {
      const expKey = 'cultivation_exp'
      const expData = localStorage.getItem(expKey)
      
      if (expData) {
        const exp = parseInt(expData)
        
        // 检查修炼数据表是否存在
        try {
          await query('SELECT id FROM cultivation LIMIT 1')
        } catch (tableError) {
          // 表不存在，创建表
          await query(`
            CREATE TABLE cultivation (
              id VARCHAR(36) PRIMARY KEY,
              user_id VARCHAR(36) NOT NULL,
              exp INT DEFAULT 0,
              level INT DEFAULT 0,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
              UNIQUE KEY (user_id)
            )
          `)
        }
        
        // 插入修炼数据
        await query(
          'INSERT INTO cultivation (id, user_id, exp, level) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE exp = VALUES(exp), level = VALUES(level), updated_at = NOW()',
          [generateUUID(), userId, exp, Math.floor(exp / 100)]
        )
        
        // 清理 LocalStorage
        localStorage.removeItem(expKey)
      }
      
      console.log('修炼数据迁移完成')
    } catch (error) {
      console.error('迁移修炼数据失败:', error)
    }
  },

  // 清理所有 LocalStorage 数据
  clearLocalStorage() {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (
        key.startsWith('learning_') ||
        key.startsWith('user_notes_') ||
        key.startsWith('conversation_') ||
        key.startsWith('community') ||
        key.startsWith('cultivation_') ||
        key === 'ai_usage_stats' ||
        key === 'ai_usage_history'
      ) {
        localStorage.removeItem(key)
      }
    })
    console.log('LocalStorage 数据清理完成')
  }
}

export default dataMigrationService