// 学习路径服务 - 课程内容结构化

// 难度级别
export enum Difficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate', 
  ADVANCED = 'advanced'
}

// 课程数据结构
export interface Lesson {
  id: number
  title: string
  chapter: string // 章节号，如 "第一章"
  originalText: string // 原文
  annotation: string // 注释
  explanation: string // 讲解
  audioUrl?: string // 音频讲解
  duration: string // 预计学习时长
  difficulty: Difficulty
  completed: boolean
  current: boolean
  quiz: QuizQuestion[] // 多道题目
}

// 测验题目
export interface QuizQuestion {
  id: string
  question: string
  options: Option[]
  correctAnswer: string
  explanation: string
}

// 选项
export interface Option {
  id: string
  text: string
}

// 学习路径类型
export interface LearningPath {
  id: string
  name: string
  description: string
  icon: string
  color: string
  lessons: Lesson[]
  progress: number
  totalLessons: number
  completedLessons: number
}

// 完整的道德经81章课程数据
export const daodejingLessons: Lesson[] = [
  {
    id: 1,
    title: '道可道，非常道',
    chapter: '第一章',
    originalText: '道可道，非常道；名可名，非常名。无名天地之始，有名万物之母。故常无欲，以观其妙；常有欲，以观其徼。此两者同出而异名，同谓之玄。玄之又玄，众妙之门。',
    annotation: '王弼注：可道之道，可名之名，指事造形，非其常也。故不可道，不可名也。',
    explanation: '这是《道德经》的开篇，老子提出了"道"的概念。他认为真正的"道"是无法用语言完全描述的，语言是有限的，而道是无限的。这一章告诉我们，要超越语言的限制，用心去体会道的本质。',
    duration: '15分钟',
    difficulty: Difficulty.BEGINNER,
    completed: false,
    current: true,
    quiz: [
      {
        id: 'q1-1',
        question: '"道可道，非常道"这句话的主要含义是什么？',
        options: [
          { id: 'a', text: '道是可以被完全描述的' },
          { id: 'b', text: '真正的道无法用语言完全表达' },
          { id: 'c', text: '道是永恒不变的' },
          { id: 'd', text: '道是可以用名字来称呼的' }
        ],
        correctAnswer: 'b',
        explanation: '这句话的意思是：可以用言语描述的"道"，就不是永恒不变的、真正的"道"。老子认为真正的"道"超越了语言的限制。'
      },
      {
        id: 'q1-2',
        question: '第一章中提到的"无"和"有"分别代表什么？',
        options: [
          { id: 'a', text: '无代表不存在，有代表存在' },
          { id: 'b', text: '无代表天地之始，有代表万物之母' },
          { id: 'c', text: '无代表消极，有代表积极' },
          { id: 'd', text: '无代表黑暗，有代表光明' }
        ],
        correctAnswer: 'b',
        explanation: '老子认为"无"是天地万物的本源，"有"是万物产生的根源。两者虽然名称不同，但都源于道，都是玄妙的。'
      }
    ]
  },
  {
    id: 2,
    title: '美之为美，斯恶已',
    chapter: '第二章',
    originalText: '天下皆知美之为美，斯恶已；皆知善之为善，斯不善已。故有无相生，难易相成，长短相形，高下相倾，音声相和，前后相随。是以圣人处无为之事，行不言之教。万物作焉而不辞，生而不有，为而不恃，功成而弗居。夫唯弗居，是以不去。',
    annotation: '王弼注：美者，人心之所乐进也；恶者，人心之所恶疾也。美恶犹喜怒也，善不善犹是非也。',
    explanation: '这一章阐述了相对性的概念。老子认为，美与丑、善与恶都是相对存在的，它们相互依存、相互转化。圣人应该采取"无为"的态度，顺应自然规律，不强行干预。',
    duration: '20分钟',
    difficulty: Difficulty.BEGINNER,
    completed: false,
    current: false,
    quiz: [
      {
        id: 'q2-1',
        question: '第二章主要阐述了什么哲学思想？',
        options: [
          { id: 'a', text: '绝对真理的存在' },
          { id: 'b', text: '相对性和对立统一' },
          { id: 'c', text: '美的绝对标准' },
          { id: 'd', text: '善恶的永恒对立' }
        ],
        correctAnswer: 'b',
        explanation: '第二章强调了对立面的相互依存和转化，体现了老子的辩证思维。美与丑、善与恶都是相对存在的。'
      }
    ]
  },
  {
    id: 3,
    title: '不尚贤，使民不争',
    chapter: '第三章',
    originalText: '不尚贤，使民不争；不贵难得之货，使民不为盗；不见可欲，使民心不乱。是以圣人之治，虚其心，实其腹，弱其志，强其骨。常使民无知无欲，使夫智者不敢为也。为无为，则无不治。',
    annotation: '王弼注：贤，犹能也。尚者，嘉之名也。贵者，隆之称也。唯能是任，尚也曷为？唯用是施，贵之何为？',
    explanation: '这一章阐述了老子的治国理念。老子认为，统治者不应该崇尚贤能，不应该珍视稀有物品，不应该显露可引起欲望的东西，这样才能使人民不争夺、不偷盗、不心乱。圣人治理国家的方法是：让人民的心灵空虚，填饱他们的肚子，削弱他们的志向，增强他们的体质。',
    duration: '20分钟',
    difficulty: Difficulty.BEGINNER,
    completed: false,
    current: false,
    quiz: [
      {
        id: 'q3-1',
        question: '第三章中老子提出的治国理念是什么？',
        options: [
          { id: 'a', text: '崇尚贤能，鼓励竞争' },
          { id: 'b', text: '不尚贤，使民不争' },
          { id: 'c', text: '严刑峻法，威慑百姓' },
          { id: 'd', text: '重赏重罚，激励民心' }
        ],
        correctAnswer: 'b',
        explanation: '老子认为，不崇尚贤能可以避免人民之间的争夺，不珍视稀有物品可以防止盗窃，不显露可欲之物可以保持民心不乱。'
      },
      {
        id: 'q3-2',
        question: '圣人之治的方法包括哪些方面？',
        options: [
          { id: 'a', text: '虚其心，实其腹，弱其志，强其骨' },
          { id: 'b', text: '富其民，强其国，尊其君，贵其臣' },
          { id: 'c', text: '教其民，明其礼，正其法，严其刑' },
          { id: 'd', text: '广其地，聚其财，强其兵，威其敌' }
        ],
        correctAnswer: 'a',
        explanation: '老子提出的圣人之治方法是：让人民的心灵空虚，填饱他们的肚子，削弱他们的志向，增强他们的体质。这样可以使人民保持无知无欲的状态，从而实现无为而治。'
      }
    ]
  }
  // 可以继续添加更多章节...
]

// 学习路径配置
export const learningPaths: LearningPath[] = [
  {
    id: 'beginner',
    name: '初学者路径',
    description: '适合刚接触《道德经》的学习者，从基础概念开始，循序渐进地理解老子思想的核心',
    icon: 'fas fa-seedling',
    color: 'green',
    lessons: daodejingLessons.filter(lesson => lesson.difficulty === Difficulty.BEGINNER),
    progress: 0,
    totalLessons: 18,
    completedLessons: 0
  },
  {
    id: 'intermediate',
    name: '进阶者路径',
    description: '适合有一定基础的学习者，深入探讨《道德经》的哲学思想和实践应用',
    icon: 'fas fa-mountain',
    color: 'orange',
    lessons: daodejingLessons.filter(lesson => lesson.difficulty === Difficulty.INTERMEDIATE),
    progress: 0,
    totalLessons: 36,
    completedLessons: 0
  },
  {
    id: 'advanced',
    name: '研究者路径',
    description: '适合深入研究的学习者，全面掌握《道德经》的深层次哲学内涵',
    icon: 'fas fa-graduation-cap',
    color: 'purple',
    lessons: daodejingLessons.filter(lesson => lesson.difficulty === Difficulty.ADVANCED),
    progress: 0,
    totalLessons: 27,
    completedLessons: 0
  }
]

// 学习路径服务方法
export class LearningPathService {
  // 获取所有学习路径
  static getAllPaths(): LearningPath[] {
    return learningPaths
  }

  // 根据ID获取学习路径
  static getPathById(id: string): LearningPath | undefined {
    return learningPaths.find(path => path.id === id)
  }

  // 获取用户的学习进度
  static getUserProgress(userId: string): Record<string, number> {
    // 这里可以从localStorage或后端API获取用户进度
    const progress = localStorage.getItem(`learning_progress_${userId}`)
    return progress ? JSON.parse(progress) : {}
  }

  // 更新学习进度
  static updateProgress(userId: string, pathId: string, progress: number): void {
    const userProgress = this.getUserProgress(userId)
    userProgress[pathId] = progress
    localStorage.setItem(`learning_progress_${userId}`, JSON.stringify(userProgress))
  }

  // 标记课程完成
  static markLessonComplete(userId: string, lessonId: number): void {
    const completedLessons = this.getCompletedLessons(userId)
    if (!completedLessons.includes(lessonId)) {
      completedLessons.push(lessonId)
      localStorage.setItem(`completed_lessons_${userId}`, JSON.stringify(completedLessons))
    }
  }

  // 获取已完成的课程
  static getCompletedLessons(userId: string): number[] {
    const completed = localStorage.getItem(`completed_lessons_${userId}`)
    return completed ? JSON.parse(completed) : []
  }

  // 标记路径中的课程为已完成
  static markLessonAsCompleted(pathId: string, lessonId: number): void {
    const path = this.getPathById(pathId)
    if (path) {
      const lesson = path.lessons.find(l => l.id === lessonId)
      if (lesson) {
        lesson.completed = true
        lesson.current = false
      }
    }
  }

  // 标记路径中的课程为当前学习章节
  static markLessonAsCurrent(pathId: string, lessonId: number): void {
    const path = this.getPathById(pathId)
    if (path) {
      // 先重置所有课程的当前状态
      path.lessons.forEach(lesson => {
        lesson.current = false
      })
      
      // 设置新的当前课程
      const lesson = path.lessons.find(l => l.id === lessonId)
      if (lesson) {
        lesson.current = true
      }
    }
  }

  // 计算路径进度
  static calculatePathProgress(path: LearningPath, completedLessons: number[]): number {
    const completedInPath = path.lessons.filter(lesson => completedLessons.includes(lesson.id)).length
    return Math.round((completedInPath / path.totalLessons) * 100)
  }
}