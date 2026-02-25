// 性能监控和统计服务 - 监控AI解读模块的性能和使用情况

// 性能指标接口
interface PerformanceMetrics {
  responseTime: number // 响应时间(ms)
  tokenUsage: {
    prompt: number
    completion: number
    total: number
  }
  ragRelevance: number // RAG检索相关性分数
  userSatisfaction: number // 用户满意度(基于交互)
  errorRate: number // 错误率
}

// 使用统计接口
interface UsageStats {
  totalConversations: number
  totalMessages: number
  activeUsers: number
  popularQuestions: string[]
  peakUsageTimes: string[]
  averageResponseTime: number
}

// 监控数据存储
const performanceData: Array<PerformanceMetrics & { timestamp: string; provider: string }> = []
const usageStats: UsageStats = {
  totalConversations: 0,
  totalMessages: 0,
  activeUsers: 0,
  popularQuestions: [],
  peakUsageTimes: [],
  averageResponseTime: 0
}

// 性能监控配置
const MONITOR_CONFIG = {
  maxRecords: 1000, // 最多保存1000条记录
  samplingRate: 0.1, // 10%的采样率
  retentionDays: 30 // 保留30天数据
}

/**
 * 记录性能指标
 */
export const recordPerformance = (
  metrics: Omit<PerformanceMetrics, 'userSatisfaction'>,
  provider: string
): void => {
  // 采样控制
  if (Math.random() > MONITOR_CONFIG.samplingRate) {
    return
  }
  
  const record = {
    ...metrics,
    userSatisfaction: calculateUserSatisfaction(metrics),
    timestamp: new Date().toISOString(),
    provider
  }
  
  performanceData.push(record)
  
  // 清理旧数据
  cleanupOldData()
  
  // 更新使用统计
  updateUsageStats()
}

/**
 * 计算用户满意度
 */
const calculateUserSatisfaction = (metrics: Omit<PerformanceMetrics, 'userSatisfaction'>): number => {
  let satisfaction = 0.8 // 基础满意度
  
  // 响应时间影响
  if (metrics.responseTime < 2000) {
    satisfaction += 0.1
  } else if (metrics.responseTime > 5000) {
    satisfaction -= 0.2
  }
  
  // RAG相关性影响
  satisfaction += metrics.ragRelevance * 0.1
  
  // 错误率影响
  satisfaction -= metrics.errorRate * 0.3
  
  return Math.max(0, Math.min(1, satisfaction))
}

/**
 * 清理旧数据
 */
const cleanupOldData = (): void => {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - MONITOR_CONFIG.retentionDays)
  
  const cutoffTime = cutoffDate.getTime()
  
  // 移除过期数据
  const validRecords = performanceData.filter(record => 
    new Date(record.timestamp).getTime() > cutoffTime
  )
  
  // 限制记录数量
  if (validRecords.length > MONITOR_CONFIG.maxRecords) {
    validRecords.splice(0, validRecords.length - MONITOR_CONFIG.maxRecords)
  }
  
  // 更新数据（这里需要重新赋值，因为数组是引用类型）
  performanceData.length = 0
  performanceData.push(...validRecords)
}

/**
 * 更新使用统计
 */
const updateUsageStats = (): void => {
  // 从本地存储加载基础统计
  const storedStats = localStorage.getItem('ai_usage_stats')
  if (storedStats) {
    Object.assign(usageStats, JSON.parse(storedStats))
  }
  
  // 更新平均响应时间
  const recentRecords = performanceData.slice(-100)
  if (recentRecords.length > 0) {
    usageStats.averageResponseTime = recentRecords.reduce(
      (sum, r) => sum + r.responseTime, 0
    ) / recentRecords.length
  }
  
  // 保存到本地存储
  localStorage.setItem('ai_usage_stats', JSON.stringify(usageStats))
}

/**
 * 记录对话开始
 */
export const recordConversationStart = (): void => {
  usageStats.totalConversations++
  usageStats.activeUsers++
  
  // 记录峰值使用时间
  const now = new Date()
  const hour = now.getHours()
  if (!usageStats.peakUsageTimes.includes(`${hour}:00`)) {
    usageStats.peakUsageTimes.push(`${hour}:00`)
    usageStats.peakUsageTimes.sort()
  }
  
  saveUsageStats()
}

/**
 * 记录消息发送
 */
export const recordMessageSent = (message: string): void => {
  usageStats.totalMessages++
  
  // 记录热门问题
  if (message.length > 5 && message.length < 100) {
    const question = message.trim()
    if (!usageStats.popularQuestions.includes(question)) {
      usageStats.popularQuestions.unshift(question)
      
      // 只保留最近20个问题
      if (usageStats.popularQuestions.length > 20) {
        usageStats.popularQuestions = usageStats.popularQuestions.slice(0, 20)
      }
    }
  }
  
  saveUsageStats()
}

/**
 * 记录对话结束
 */
export const recordConversationEnd = (): void => {
  usageStats.activeUsers = Math.max(0, usageStats.activeUsers - 1)
  saveUsageStats()
}

/**
 * 保存使用统计
 */
const saveUsageStats = (): void => {
  localStorage.setItem('ai_usage_stats', JSON.stringify(usageStats))
}

/**
 * 获取性能报告
 */
export const getPerformanceReport = (timeRange: 'day' | 'week' | 'month' = 'week') => {
  const now = new Date()
  let startDate: Date
  
  switch (timeRange) {
    case 'day':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      break
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
  }
  
  const relevantData = performanceData.filter(record => 
    new Date(record.timestamp) >= startDate
  )
  
  if (relevantData.length === 0) {
    return {
      timeRange,
      totalRecords: 0,
      message: '暂无足够数据生成报告'
    }
  }
  
  // 计算各项指标
  const avgResponseTime = relevantData.reduce((sum, r) => sum + r.responseTime, 0) / relevantData.length
  const avgSatisfaction = relevantData.reduce((sum, r) => sum + r.userSatisfaction, 0) / relevantData.length
  const avgRagRelevance = relevantData.reduce((sum, r) => sum + r.ragRelevance, 0) / relevantData.length
  const errorRate = relevantData.filter(r => r.errorRate > 0).length / relevantData.length
  
  // 按提供商分组统计
  const providerStats = relevantData.reduce((stats: any, record) => {
    if (!stats[record.provider]) {
      stats[record.provider] = { count: 0, avgResponseTime: 0, avgSatisfaction: 0 }
    }
    stats[record.provider].count++
    stats[record.provider].avgResponseTime += record.responseTime
    stats[record.provider].avgSatisfaction += record.userSatisfaction
    return stats
  }, {})
  
  // 计算平均值
  Object.keys(providerStats).forEach(provider => {
    providerStats[provider].avgResponseTime /= providerStats[provider].count
    providerStats[provider].avgSatisfaction /= providerStats[provider].count
  })
  
  return {
    timeRange,
    totalRecords: relevantData.length,
    summary: {
      averageResponseTime: Math.round(avgResponseTime),
      averageSatisfaction: Math.round(avgSatisfaction * 100),
      averageRagRelevance: Math.round(avgRagRelevance * 100),
      errorRate: Math.round(errorRate * 100)
    },
    providerStats,
    recommendations: generateRecommendations({
      avgResponseTime,
      avgSatisfaction,
      errorRate,
      providerStats
    })
  }
}

/**
 * 生成优化建议
 */
const generateRecommendations = (metrics: any): string[] => {
  const recommendations: string[] = []
  
  if (metrics.avgResponseTime > 3000) {
    recommendations.push('响应时间较长，建议优化网络连接或使用更快的AI提供商')
  }
  
  if (metrics.avgSatisfaction < 70) {
    recommendations.push('用户满意度较低，建议优化回答质量和RAG检索准确性')
  }
  
  if (metrics.errorRate > 0.1) {
    recommendations.push('错误率较高，建议检查AI服务配置和网络稳定性')
  }
  
  // 提供商建议
  const providers = Object.keys(metrics.providerStats)
  if (providers.length > 1) {
    const bestProvider = providers.reduce((best, current) => 
      metrics.providerStats[current].avgSatisfaction > metrics.providerStats[best].avgSatisfaction 
        ? current 
        : best
    )
    recommendations.push(`推荐使用 ${bestProvider} 提供商，其用户满意度最高`)
  }
  
  if (recommendations.length === 0) {
    recommendations.push('系统运行良好，继续保持当前配置')
  }
  
  return recommendations
}

/**
 * 获取实时性能指标
 */
export const getRealtimeMetrics = () => {
  const recentData = performanceData.slice(-50) // 最近50条记录
  
  if (recentData.length === 0) {
    return {
      status: 'no_data',
      message: '暂无性能数据'
    }
  }
  
  const currentResponseTime = recentData[recentData.length - 1].responseTime
  const currentSatisfaction = recentData[recentData.length - 1].userSatisfaction
  
  return {
    status: 'healthy',
    responseTime: currentResponseTime,
    satisfaction: Math.round(currentSatisfaction * 100),
    activeConversations: usageStats.activeUsers,
    todayMessages: getTodayMessageCount()
  }
}

/**
 * 获取今日消息数量
 */
const getTodayMessageCount = (): number => {
  const today = new Date().toDateString()
  const todayRecords = performanceData.filter(record => 
    new Date(record.timestamp).toDateString() === today
  )
  
  return todayRecords.length
}

/**
 * 导出性能数据（用于分析）
 */
export const exportPerformanceData = (format: 'json' | 'csv' = 'json') => {
  if (format === 'csv') {
    const headers = ['timestamp', 'provider', 'responseTime', 'ragRelevance', 'userSatisfaction', 'errorRate']
    const csvRows = [headers.join(',')]
    
    performanceData.forEach(record => {
      const row = [
        record.timestamp,
        record.provider,
        record.responseTime,
        record.ragRelevance,
        record.userSatisfaction,
        record.errorRate
      ].join(',')
      csvRows.push(row)
    })
    
    return csvRows.join('\n')
  }
  
  return {
    performanceData,
    usageStats,
    generatedAt: new Date().toISOString()
  }
}

/**
 * 重置监控数据
 */
export const resetMonitoringData = (): void => {
  performanceData.length = 0
  Object.assign(usageStats, {
    totalConversations: 0,
    totalMessages: 0,
    activeUsers: 0,
    popularQuestions: [],
    peakUsageTimes: [],
    averageResponseTime: 0
  })
  
  localStorage.removeItem('ai_usage_stats')
}

// 导出类型
export type { PerformanceMetrics, UsageStats }