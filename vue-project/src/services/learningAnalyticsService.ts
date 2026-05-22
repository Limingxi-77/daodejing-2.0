// 学习分析服务 - 统计和分析学习数据

// 学习统计数据
export interface LearningStats {
  userId: string
  totalStudyTime: number // 总学习时间（分钟）
  completedLessons: number // 完成的课程数量
  totalQuizzes: number // 完成的测验数量
  averageQuizScore: number // 平均测验分数
  currentStreak: number // 当前连续学习天数
  longestStreak: number // 最长连续学习天数
  lastStudyDate: string // 最后学习日期
  favoriteChapter: string // 最喜欢的章节
  learningGoals: LearningGoal[] // 学习目标
}

// 学习目标
export interface LearningGoal {
  id: string
  title: string
  targetDate: string
  progress: number
  completed: boolean
  createdAt: string
}

// 学习记录
export interface StudyRecord {
  id: string
  userId: string
  lessonId: number
  startTime: string
  endTime: string
  duration: number // 学习时长（分钟）
  notesTaken: boolean // 是否记笔记
  quizCompleted: boolean // 是否完成测验
  quizScore?: number // 测验分数
}

// 学习分析服务类
export class LearningAnalyticsService {
  // 获取用户学习统计
  static getUserStats(userId: string): LearningStats {
    const stats = localStorage.getItem(`learning_stats_${userId}`)
    if (stats) {
      return JSON.parse(stats)
    }

    // 默认统计
    return {
      userId,
      totalStudyTime: 0,
      completedLessons: 0,
      totalQuizzes: 0,
      averageQuizScore: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastStudyDate: '',
      favoriteChapter: '',
      learningGoals: []
    }
  }

  // 记录学习会话
  static recordStudySession(userId: string, lessonId: number, duration: number, notesTaken: boolean = false, quizScore?: number): void {
    const record: StudyRecord = {
      id: this.generateId(),
      userId,
      lessonId,
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      duration,
      notesTaken,
      quizCompleted: !!quizScore,
      quizScore
    }

    // 保存学习记录
    const records = this.getStudyRecords(userId)
    records.push(record)
    localStorage.setItem(`study_records_${userId}`, JSON.stringify(records))

    // 更新学习统计
    this.updateStats(userId, record)
  }

  // 更新学习统计
  private static updateStats(userId: string, record: StudyRecord): void {
    const stats = this.getUserStats(userId)
    const today = new Date().toDateString()
    const lastStudyDate = new Date(stats.lastStudyDate).toDateString()

    // 更新总学习时间
    stats.totalStudyTime += record.duration

    // 更新完成的课程数量
    if (record.quizCompleted && record.quizScore && record.quizScore >= 80) {
      stats.completedLessons += 1
    }

    // 更新测验统计
    if (record.quizCompleted && record.quizScore) {
      stats.totalQuizzes += 1
      stats.averageQuizScore = this.calculateAverageScore(stats, record.quizScore)
    }

    // 更新连续学习天数
    if (today !== lastStudyDate) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      
      if (lastStudyDate === yesterday.toDateString()) {
        stats.currentStreak += 1
      } else {
        stats.currentStreak = 1
      }

      if (stats.currentStreak > stats.longestStreak) {
        stats.longestStreak = stats.currentStreak
      }
    }

    stats.lastStudyDate = new Date().toISOString()

    // 更新最喜欢的章节
    stats.favoriteChapter = this.calculateFavoriteChapter(userId)

    // 保存更新后的统计
    localStorage.setItem(`learning_stats_${userId}`, JSON.stringify(stats))
  }

  // 计算平均分数
  private static calculateAverageScore(stats: LearningStats, newScore: number): number {
    if (stats.totalQuizzes === 0) return newScore
    return Math.round(((stats.averageQuizScore * stats.totalQuizzes) + newScore) / (stats.totalQuizzes + 1))
  }

  // 计算最喜欢的章节
  private static calculateFavoriteChapter(userId: string): string {
    const records = this.getStudyRecords(userId)
    const chapterCount: Record<number, number> = {}
    
    records.forEach(record => {
      chapterCount[record.lessonId] = (chapterCount[record.lessonId] || 0) + 1
    })

    const favoriteChapterId = Object.entries(chapterCount)
      .sort(([, a], [, b]) => b - a)[0]?.[0]

    return favoriteChapterId ? `第${favoriteChapterId}章` : '暂无'
  }

  // 获取学习记录
  static getStudyRecords(userId: string): StudyRecord[] {
    const records = localStorage.getItem(`study_records_${userId}`)
    return records ? JSON.parse(records) : []
  }

  // 获取最近的学习记录
  static getRecentStudyRecords(userId: string, limit: number = 10): StudyRecord[] {
    const records = this.getStudyRecords(userId)
    return records
      .sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime())
      .slice(0, limit)
  }

  // 获取学习趋势数据
  static getLearningTrends(userId: string, days: number = 30): { date: string; studyTime: number }[] {
    const records = this.getStudyRecords(userId)
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const trends: { date: string; studyTime: number }[] = []
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const dateStr = currentDate.toDateString()
      const dailyStudyTime = records
        .filter(record => new Date(record.endTime).toDateString() === dateStr)
        .reduce((total, record) => total + record.duration, 0)

      trends.push({
        date: currentDate.toISOString().split('T')[0],
        studyTime: dailyStudyTime
      })

      currentDate.setDate(currentDate.getDate() + 1)
    }

    return trends
  }

  // 设置学习目标
  static setLearningGoal(userId: string, title: string, targetDate: string): LearningGoal {
    const goal: LearningGoal = {
      id: this.generateId(),
      title,
      targetDate,
      progress: 0,
      completed: false,
      createdAt: new Date().toISOString()
    }

    const stats = this.getUserStats(userId)
    stats.learningGoals.push(goal)
    localStorage.setItem(`learning_stats_${userId}`, JSON.stringify(stats))

    return goal
  }

  // 更新学习目标进度
  static updateGoalProgress(userId: string, goalId: string, progress: number): void {
    const stats = this.getUserStats(userId)
    const goal = stats.learningGoals.find(g => g.id === goalId)
    
    if (goal) {
      goal.progress = Math.min(100, Math.max(0, progress))
      goal.completed = goal.progress >= 100
      localStorage.setItem(`learning_stats_${userId}`, JSON.stringify(stats))
    }
  }

  // 删除学习目标
  static deleteGoal(userId: string, goalId: string): void {
    const stats = this.getUserStats(userId)
    stats.learningGoals = stats.learningGoals.filter(g => g.id !== goalId)
    localStorage.setItem(`learning_stats_${userId}`, JSON.stringify(stats))
  }

  // 生成学习报告
  static generateLearningReport(userId: string): string {
    const stats = this.getUserStats(userId)
    // const records = this.getStudyRecords(userId) // 暂时未使用
    const trends = this.getLearningTrends(userId, 7)

    let report = `# 学习报告\n\n`
    report += `**用户**: ${userId}\n`
    report += `**报告生成时间**: ${new Date().toLocaleString()}\n\n`

    report += `## 学习概况\n`
    report += `- 总学习时间: ${Math.round(stats.totalStudyTime / 60)} 小时\n`
    report += `- 完成课程: ${stats.completedLessons} 个\n`
    report += `- 平均测验分数: ${stats.averageQuizScore}%\n`
    report += `- 当前连续学习: ${stats.currentStreak} 天\n`
    report += `- 最长连续学习: ${stats.longestStreak} 天\n\n`

    report += `## 最近学习趋势\n`
    trends.forEach(trend => {
      report += `- ${trend.date}: ${trend.studyTime} 分钟\n`
    })

    report += `\n## 学习建议\n`
    if (stats.currentStreak < 3) {
      report += `建议保持连续学习习惯，建立稳定的学习节奏。\n`
    }
    if (stats.averageQuizScore < 70) {
      report += `测验分数有待提高，建议多复习已学内容。\n`
    }
    if (stats.totalStudyTime < 300) {
      report += `学习时间较少，建议增加每日学习时长。\n`
    }

    return report
  }

  // 导出学习数据
  static exportLearningData(userId: string): string {
    const stats = this.getUserStats(userId)
    const records = this.getStudyRecords(userId)
    
    return JSON.stringify({
      stats,
      records,
      exportDate: new Date().toISOString()
    }, null, 2)
  }

  // 生成唯一ID
  private static generateId(): string {
    return `record_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}