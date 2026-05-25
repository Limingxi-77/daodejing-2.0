// 增强的RAG检索服务 - 为AI解读提供智能知识检索
import Fuse from 'fuse.js'
import { knowledgeBase, type KnowledgeItem } from '@/data/knowledge_base'

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
  10: ['玄德', '营魄抱一', '第十章'],
  12: ['五色', '五音', '五味', '目盲', '耳聋', '第十二章'],
  16: ['致虚', '守静', '归根', '第十六章'],
  22: ['曲则全', '抱一', '第二十二章'],
  25: ['道法自然', '天地母', '第二十五章'],
  33: ['知人', '自知', '胜人', '自胜', '知足', '第三十三章'],
  37: ['道常无为', '无不为', '自化', '第三十七章'],
  38: ['上德', '下德', '第三十八章'],
  40: ['反者道之动', '弱者道之用', '第四十章'],
  42: ['道生一', '阴阳', '第四十二章'],
  44: ['知足不辱', '知止', '第四十四章'],
  48: ['为学日益', '为道日损', '第四十八章'],
  57: ['以正治国', '以无事取天下', '第五十七章'],
  63: ['为无为', '报怨以德', '第六十三章'],
  64: ['千里之行', '始于足下', '合抱之木', '第六十四章'],
  66: ['江海', '百谷王', '第六十六章'],
  76: ['柔弱', '坚强', '第七十六章'],
  78: ['天下莫柔弱于水', '弱之胜强', '第七十八章'],
  81: ['信言不美', '善者不辩', '第八十一章']
}

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

const searchEngine = new Fuse(knowledgeBase, SEARCH_CONFIG)

export interface RAGResult {
  knowledge: KnowledgeItem | null
  relevance: number
  context: string
  suggestions: string[]
  candidates?: KnowledgeItem[]
}

// ---------- TF-IDF re-ranking (character bigrams) ----------

const tokenize = (text: string): string[] => {
  if (!text) return []
  const cleaned = text
    .replace(/[\s　，。！？；：""''《》、（）()\[\]【】.,!?;:'"\\-]+/g, '')
  const tokens: string[] = []
  for (let i = 0; i < cleaned.length - 1; i++) {
    const bg = cleaned.slice(i, i + 2)
    if (bg.length === 2) tokens.push(bg)
  }
  return tokens
}

const buildDoc = (item: KnowledgeItem): string => {
  const kw = item.keywords.join('')
  return `${item.content}${item.annotations.modern}${kw}`
}

interface TfIdfIndex {
  idf: Map<string, number>
  vectors: Map<number, Map<string, number>>
  norms: Map<number, number>
}

let tfIdfIndex: TfIdfIndex | null = null

const ensureIndex = (): TfIdfIndex => {
  if (tfIdfIndex) return tfIdfIndex
  const docCount = knowledgeBase.length
  const df = new Map<string, number>()
  const tfPerDoc = new Map<number, Map<string, number>>()

  knowledgeBase.forEach(item => {
    const tokens = tokenize(buildDoc(item))
    const tf = new Map<string, number>()
    tokens.forEach(t => tf.set(t, (tf.get(t) || 0) + 1))
    tfPerDoc.set(item.chapter, tf)
    for (const t of tf.keys()) df.set(t, (df.get(t) || 0) + 1)
  })

  const idf = new Map<string, number>()
  for (const [term, docFreq] of df) {
    idf.set(term, Math.log((docCount + 1) / (docFreq + 1)) + 1)
  }

  const vectors = new Map<number, Map<string, number>>()
  const norms = new Map<number, number>()
  for (const [chapter, tf] of tfPerDoc) {
    const vec = new Map<string, number>()
    let sumSquares = 0
    for (const [term, freq] of tf) {
      const w = freq * (idf.get(term) || 0)
      vec.set(term, w)
      sumSquares += w * w
    }
    vectors.set(chapter, vec)
    norms.set(chapter, Math.sqrt(sumSquares) || 1)
  }

  tfIdfIndex = { idf, vectors, norms }
  return tfIdfIndex
}

export const tfidfScore = (query: string, item: KnowledgeItem): number => {
  const idx = ensureIndex()
  const tokens = tokenize(query)
  if (tokens.length === 0) return 0
  const vec = idx.vectors.get(item.chapter)
  const norm = idx.norms.get(item.chapter) || 1
  if (!vec) return 0
  const qTf = new Map<string, number>()
  tokens.forEach(t => qTf.set(t, (qTf.get(t) || 0) + 1))
  let dot = 0
  let qSumSquares = 0
  for (const [term, freq] of qTf) {
    const qw = freq * (idx.idf.get(term) || 0)
    qSumSquares += qw * qw
    const dw = vec.get(term)
    if (dw) dot += qw * dw
  }
  const qNorm = Math.sqrt(qSumSquares) || 1
  return dot / (qNorm * norm)
}

export const rerankCandidates = (
  query: string,
  candidates: KnowledgeItem[]
): { item: KnowledgeItem; score: number }[] => {
  return candidates
    .map(item => ({ item, score: tfidfScore(query, item) }))
    .sort((a, b) => b.score - a.score)
}

// ---------- Search pipeline ----------

export const intelligentSearch = (query: string): RAGResult => {
  const processedQuery = preprocessQuery(query)
  const results = {
    fuzzy: searchEngine.search(processedQuery),
    chapter: searchByChapter(processedQuery),
    concept: searchByConcept(processedQuery)
  }
  const merged = mergeSearchResults(results, processedQuery)
  const reranked = applyTfIdfRerank(query, merged)
  return buildRAGResult(reranked, query)
}

const applyTfIdfRerank = (query: string, merged: any[]): any[] => {
  if (merged.length === 0) return merged
  const tfMap = new Map<number, number>()
  merged.forEach((r: any) => {
    tfMap.set(r.item.chapter, tfidfScore(query, r.item))
  })
  // 归一化 tf-idf 分数 [0,1]
  const maxTf = Math.max(0.0001, ...Array.from(tfMap.values()))
  return merged
    .map((r: any) => {
      const tf = (tfMap.get(r.item.chapter) || 0) / maxTf
      // 原 strategy 分 * tf-idf 加权
      const baseWeight = getSourceWeight(r.source, query)
      const combined = (r.score || 0.5) * baseWeight * (0.4 + 0.6 * tf)
      return { ...r, score: combined, tfidf: tf }
    })
    .sort((a, b) => b.score - a.score)
}

const preprocessQuery = (query: string): string => {
  let processed = query.replace(/[，。！？；：""""]/g, ' ')
  processed = processed.toLowerCase()
  const stopWords = ['的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这个', '那个', '这样', '那样', '什么', '怎么', '为什么', '如何', '多少', '哪里', '什么时候', '谁']
  stopWords.forEach(word => {
    processed = processed.replace(new RegExp(`\\b${word}\\b`, 'g'), '')
  })
  processed = processed.replace(/\s+/g, ' ').trim()
  return processed
}

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

const searchByConcept = (query: string): any[] => {
  const results: any[] = []
  Object.entries(CONCEPT_KEYWORDS).forEach(([concept, chapters]) => {
    if (query.includes(concept.toLowerCase())) {
      chapters.forEach(chapter => {
        const knowledge = knowledgeBase.find(item => item.chapter === chapter)
        if (knowledge) {
          results.push({ item: knowledge, score: 0.8 })
        }
      })
    }
  })
  return results
}

const mergeSearchResults = (results: any, _query: string): any[] => {
  const allResults = [
    ...results.fuzzy.map((r: any) => ({ ...r, source: 'fuzzy' })),
    ...results.chapter.map((r: any) => ({ ...r, source: 'chapter' })),
    ...results.concept.map((r: any) => ({ ...r, source: 'concept' }))
  ]
  const seen = new Set<number>()
  const unique = allResults.filter((r: any) => {
    const key = r.item.chapter
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
  return unique
}

const getSourceWeight = (source: string, _query: string): number => {
  const weights: Record<string, number> = {
    chapter: 1.2,
    concept: 1.1,
    fuzzy: 1.0
  }
  return weights[source] || 1.0
}

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
  const context = buildContext(knowledge, originalQuery)
  const suggestions = generateSuggestions(knowledge, originalQuery)
  const candidates = results.slice(0, 4).map((r: any) => r.item)
  return { knowledge, relevance, context, suggestions, candidates }
}

const buildContext = (knowledge: KnowledgeItem, query: string): string => {
  const contextParts: string[] = []
  contextParts.push(`《道德经》第${knowledge.chapter}章`)
  contextParts.push(`原文：${knowledge.content}`)
  if (query.includes('意思') || query.includes('含义') || query.includes('解释')) {
    contextParts.push(`现代解读：${knowledge.annotations.modern}`)
  } else if (query.includes('王弼') || query.includes('古代')) {
    contextParts.push(`王弼注：${knowledge.annotations.wangbi}`)
  } else if (query.includes('河上公') || query.includes('道家')) {
    contextParts.push(`河上公注：${knowledge.annotations.heshanggong}`)
  } else {
    contextParts.push(`现代解读：${knowledge.annotations.modern}`)
  }
  return contextParts.join('\n')
}

const generateSuggestions = (knowledge: KnowledgeItem, query: string): string[] => {
  const suggestions: string[] = []
  suggestions.push(`了解更多关于第${knowledge.chapter}章的内容`)
  const concepts = Object.keys(CONCEPT_KEYWORDS).filter(concept =>
    knowledge.content.includes(concept) || knowledge.keywords.includes(concept)
  )
  if (concepts.length > 0) {
    suggestions.push(`探索"${concepts[0]}"在其他章节中的论述`)
  }
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

const generateDefaultSuggestions = (query: string): string[] => {
  const suggestions: string[] = [
    '可以尝试查询具体的章节或概念',
    '《道德经》第一章是全书的总纲，建议从这里开始',
    '可以询问关于"道"、"德"、"无为"等核心概念'
  ]
  if (query.includes('第一章') || query.includes('道可道')) {
    suggestions.push('第一章"道可道，非常道"是理解全书的关键')
  } else if (query.includes('无为')) {
    suggestions.push('"无为"是道家思想的核心概念，涉及多个章节')
  } else if (query.includes('上善若水')) {
    suggestions.push('"上善若水"出自第八章，是重要的处世哲学')
  }
  return suggestions
}

export const batchSearch = (queries: string[]): RAGResult[] => {
  return queries.map(query => intelligentSearch(query))
}

export type { KnowledgeItem }
