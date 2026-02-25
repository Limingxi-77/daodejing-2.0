// 增强的RAG检索服务 - 为AI解读提供智能知识检索
import Fuse from 'fuse.js'
import { knowledgeBase, type KnowledgeItem } from '@/data/knowledge_base'

// 检索配置
const SEARCH_CONFIG = {
  threshold: 0.3,
  distance: 100,
  includeScore: true,
  keys: [
    { name: 'content', weight: 0.5 },
    { name: 'keywords', weight: 0.3 },
    { name: 'annotations.modern', weight: 0.2 }
  ]
}

// 章节关键词映射
const CHAPTER_KEYWORDS: Record<number, string[]> = {
  1: ['道可道', '非常道', '名可名', '非常名', '总纲', '第一章'],
  2: ['美善', '相对', '无为', '第二章'],
  3: ['无为', '不尚贤', '不贵难得之货', '第三章'],
  4: ['冲虚', '道冲', '第四章'],
  5: ['守中', '天地不仁', '第五章'],
  6: ['谷神', '玄牝', '第六章'],
  7: ['无私', '天长地久', '第七章'],
  8: ['上善若水', '水', '不争', '第八章'],
  9: ['持满', '功成身退', '第九章'],
  10: ['玄德', '第十章'],
  12: ['五色', '五音', '五味', '目盲', '耳聋', '第十二章'],
  33: ['知人', '自知', '胜人', '自胜', '第三十三章'],
  48: ['为学日益', '为道日损', '第四十八章'],
  81: ['信言不美', '美言不信', '第八十一章']
}

// 概念关键词映射
const CONCEPT_KEYWORDS: Record<string, number[]> = {
  '道': [1, 4, 25, 34, 42],
  '德': [21, 38, 41, 51, 55],
  '无为': [2, 3, 10, 37, 43, 48, 57, 63],
  '自然': [17, 23, 25, 51, 64],
  '柔弱': [36, 40, 43, 76, 78],
  '不争': [8, 22, 66, 68, 73, 81],
  '虚静': [16, 37, 45, 61],
  '养生': [10, 12, 13, 50, 55, 59],
  '治国': [3, 10, 17, 29, 30, 57, 60, 65],
  '修身': [10, 13, 16, 33, 52, 54, 59]
}

// 初始化搜索引擎
const searchEngine = new Fuse(knowledgeBase, SEARCH_CONFIG)

// RAG检索结果接口
export interface RAGResult {
  knowledge: KnowledgeItem | null
  relevance: number // 相关性分数 0-1
  context: string // 检索到的上下文
  suggestions: string[] // 相关建议
}

/**
 * 智能RAG检索
 */
export const intelligentSearch = (query: string): RAGResult => {
  // 预处理查询
  const processedQuery = preprocessQuery(query)
  
  // 多策略检索
  const results = {
    fuzzy: searchEngine.search(processedQuery),
    chapter: searchByChapter(processedQuery),
    concept: searchByConcept(processedQuery)
  }
  
  // 合并和排序结果
  const mergedResults = mergeSearchResults(results, processedQuery)
  
  // 构建RAG结果
  return buildRAGResult(mergedResults, query)
}

/**
 * 查询预处理
 */
const preprocessQuery = (query: string): string => {
  // 移除标点符号
  let processed = query.replace(/[，。！？；：""""]/g, ' ')
  
  // 转换为小写
  processed = processed.toLowerCase()
  
  // 移除常见停用词
  const stopWords = ['的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这个', '那个', '这样', '那样', '什么', '怎么', '为什么', '如何', '多少', '哪里', '什么时候', '谁']
  
  stopWords.forEach(word => {
    processed = processed.replace(new RegExp(`\\b${word}\\b`, 'g'), '')
  })
  
  // 移除多余空格
  processed = processed.replace(/\\s+/g, ' ').trim()
  
  return processed
}

/**
 * 按章节检索
 */
const searchByChapter = (query: string): any[] => {
  const results: any[] = []
  
  Object.entries(CHAPTER_KEYWORDS).forEach(([chapter, keywords]) => {
    const matchCount = keywords.filter(keyword => 
      query.includes(keyword.toLowerCase())
    ).length
    
    if (matchCount > 0) {
      const knowledge = knowledgeBase.find(item => item.chapter === parseInt(chapter))
      if (knowledge) {
        results.push({
          item: knowledge,
          score: 1 - (matchCount / keywords.length) * 0.1
        })
      }
    }
  })
  
  return results
}

/**
 * 按概念检索
 */
const searchByConcept = (query: string): any[] => {
  const results: any[] = []
  
  Object.entries(CONCEPT_KEYWORDS).forEach(([concept, chapters]) => {
    if (query.includes(concept.toLowerCase())) {
      chapters.forEach(chapter => {
        const knowledge = knowledgeBase.find(item => item.chapter === chapter)
        if (knowledge) {
          results.push({
            item: knowledge,
            score: 0.8
          })
        }
      })
    }
  })
  
  return results
}

/**
 * 合并检索结果
 */
const mergeSearchResults = (results: any, query: string): any[] => {
  const allResults = [
    ...results.fuzzy.map((r: any) => ({ ...r, source: 'fuzzy' })),
    ...results.chapter.map((r: any) => ({ ...r, source: 'chapter' })),
    ...results.concept.map((r: any) => ({ ...r, source: 'concept' }))
  ]
  
  // 去重
  const seen = new Set()
  const uniqueResults = allResults.filter((result: any) => {
    const key = result.item.chapter
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
  
  // 按相关性排序
  return uniqueResults.sort((a: any, b: any) => {
    // 根据来源类型调整权重
    const weightA = getSourceWeight(a.source, query)
    const weightB = getSourceWeight(b.source, query)
    
    return (b.score * weightB) - (a.score * weightA)
  })
}

/**
 * 获取来源权重
 */
const getSourceWeight = (source: string, _query: string): number => {
  const weights: Record<string, number> = {
    chapter: 1.2, // 章节匹配权重最高
    concept: 1.1, // 概念匹配次之
    fuzzy: 1.0  // 模糊搜索权重最低
  }
  
  return weights[source] || 1.0
}

/**
 * 构建RAG结果
 */
const buildRAGResult = (results: any[], originalQuery: string): RAGResult => {
  if (results.length === 0) {
    return {
      knowledge: null,
      relevance: 0,
      context: '',
      suggestions: generateDefaultSuggestions(originalQuery)
    }
  }
  
  const bestResult = results[0]
  const knowledge = bestResult.item
  const relevance = Math.min(1, bestResult.score || 0.7)
  
  // 构建上下文
  const context = buildContext(knowledge, originalQuery)
  
  // 生成建议
  const suggestions = generateSuggestions(knowledge, originalQuery)
  
  return {
    knowledge,
    relevance,
    context,
    suggestions
  }
}

/**
 * 构建上下文
 */
const buildContext = (knowledge: KnowledgeItem, query: string): string => {
  const contextParts: string[] = []
  
  // 添加章节信息
  contextParts.push(`《道德经》第${knowledge.chapter}章`)
  
  // 添加原文
  contextParts.push(`原文：${knowledge.content}`)
  
  // 根据查询类型选择注释
  if (query.includes('意思') || query.includes('含义') || query.includes('解释')) {
    contextParts.push(`现代解读：${knowledge.annotations.modern}`)
  } else if (query.includes('王弼') || query.includes('古代')) {
    contextParts.push(`王弼注：${knowledge.annotations.wangbi}`)
  } else if (query.includes('河上公') || query.includes('道家')) {
    contextParts.push(`河上公注：${knowledge.annotations.heshanggong}`)
  } else {
    // 默认添加现代解读
    contextParts.push(`现代解读：${knowledge.annotations.modern}`)
  }
  
  return contextParts.join('\\n')
}

/**
 * 生成建议
 */
const generateSuggestions = (knowledge: KnowledgeItem, query: string): string[] => {
  const suggestions: string[] = []
  
  // 基于章节的建议
  suggestions.push(`了解更多关于第${knowledge.chapter}章的内容`)
  
  // 基于概念的建议
  const concepts = Object.keys(CONCEPT_KEYWORDS).filter(concept => 
    knowledge.content.includes(concept) || knowledge.keywords.includes(concept)
  )
  
  if (concepts.length > 0) {
    suggestions.push(`探索"${concepts[0]}"在其他章节中的论述`)
  }
  
  // 基于查询类型的建议
  if (query.includes('如何') || query.includes('怎样')) {
    suggestions.push('这个观点在现代生活中如何应用？')
    suggestions.push('能否举一个具体的实践例子？')
  } else if (query.includes('为什么') || query.includes('原因')) {
    suggestions.push('这个观点背后的哲学原理是什么？')
    suggestions.push('与其他哲学思想的联系是什么？')
  } else {
    suggestions.push('这个观点对现代人有什么启发？')
    suggestions.push('能否从不同角度再解释一下？')
  }
  
  return suggestions.slice(0, 3)
}

/**
 * 生成默认建议
 */
const generateDefaultSuggestions = (query: string): string[] => {
  const suggestions: string[] = [
    '可以尝试查询具体的章节或概念',
    '《道德经》第一章是全书的总纲，建议从这里开始',
    '可以询问关于"道"、"德"、"无为"等核心概念'
  ]
  
  // 根据查询内容调整建议
  if (query.includes('第一章') || query.includes('道可道')) {
    suggestions.push('第一章"道可道，非常道"是理解全书的关键')
  } else if (query.includes('无为')) {
    suggestions.push('"无为"是道家思想的核心概念，涉及多个章节')
  } else if (query.includes('上善若水')) {
    suggestions.push('"上善若水"出自第八章，是重要的处世哲学')
  }
  
  return suggestions
}

// 注释掉未使用的函数，保留以备将来扩展
/*
 * 获取相关章节
 * 此函数目前未使用，但保留以备将来扩展功能
 */
/*
const getRelatedChapters = (chapter: number): KnowledgeItem[] => {
  const relatedChapters: KnowledgeItem[] = []
  
  // 前后章节
  const prevChapter = knowledgeBase.find(item => item.chapter === chapter - 1)
  const nextChapter = knowledgeBase.find(item => item.chapter === chapter + 1)
  
  if (prevChapter) relatedChapters.push(prevChapter)
  if (nextChapter) relatedChapters.push(nextChapter)
  
  // 概念相关的章节
  const currentItem = knowledgeBase.find(item => item.chapter === chapter)
  if (currentItem) {
    const relatedConcepts = Object.entries(CONCEPT_KEYWORDS)
      .filter(([_concept, chapters]) => 
        chapters.includes(chapter) && chapters.some(c => c !== chapter)
      )
      .flatMap(([_, chapters]) => chapters)
      .filter(c => c !== chapter)
      .slice(0, 2)
    
    relatedConcepts.forEach(chapterNum => {
      const item = knowledgeBase.find(item => item.chapter === chapterNum)
      if (item) relatedChapters.push(item)
    })
  }
  
  return relatedChapters
}
*/

/**
 * 批量检索
 */
export const batchSearch = (queries: string[]): RAGResult[] => {
  return queries.map(query => intelligentSearch(query))
}

/**
 * 获取知识库统计
 */
export const getKnowledgeStats = () => {
  return {
    totalChapters: knowledgeBase.length,
    coveredChapters: Array.from(new Set(knowledgeBase.map(item => item.chapter))).length,
    totalKeywords: Array.from(new Set(knowledgeBase.flatMap(item => item.keywords))).length,
    concepts: Object.keys(CONCEPT_KEYWORDS).length
  }
}

// 导出类型
export type { KnowledgeItem }