// 学习路径数据
const learningPaths = {
  beginner: {
    name: '初学者路径',
    description: '适合刚接触《道德经》的学习者，从基础概念开始，循序渐进地理解老子思想的核心',
    progress: 0,
    totalLessons: 18,
    completedLessons: 0,
    lessons: [
      { id: 1, title: '第一章：道可道', difficulty: 'easy', duration: '15分钟', completed: false, current: true },
      { id: 2, title: '第二章：天下皆知', difficulty: 'easy', duration: '15分钟', completed: false, current: false },
      { id: 3, title: '第三章：不尚贤', difficulty: 'easy', duration: '15分钟', completed: false, current: false },
      { id: 4, title: '第四章：道冲而用之', difficulty: 'easy', duration: '15分钟', completed: false, current: false },
      { id: 5, title: '第五章：天地不仁', difficulty: 'easy', duration: '15分钟', completed: false, current: false },
      { id: 6, title: '第六章：谷神不死', difficulty: 'medium', duration: '20分钟', completed: false, current: false },
      { id: 7, title: '第七章：天长地久', difficulty: 'medium', duration: '20分钟', completed: false, current: false },
      { id: 8, title: '第八章：上善若水', difficulty: 'medium', duration: '20分钟', completed: false, current: false },
      { id: 9, title: '第九章：持而盈之', difficulty: 'medium', duration: '20分钟', completed: false, current: false },
      { id: 10, title: '第十章：载营魄', difficulty: 'hard', duration: '25分钟', completed: false, current: false },
      { id: 11, title: '第十一章：三十辐', difficulty: 'hard', duration: '25分钟', completed: false, current: false },
      { id: 12, title: '第十二章：五色令人目盲', difficulty: 'hard', duration: '25分钟', completed: false, current: false },
      { id: 13, title: '第十三章：宠辱若惊', difficulty: 'medium', duration: '20分钟', completed: false, current: false },
      { id: 14, title: '第十四章：视之不见', difficulty: 'medium', duration: '20分钟', completed: false, current: false },
      { id: 15, title: '第十五章：古之善为士者', difficulty: 'hard', duration: '25分钟', completed: false, current: false },
      { id: 16, title: '第十六章：致虚极', difficulty: 'hard', duration: '25分钟', completed: false, current: false },
      { id: 17, title: '第十七章：太上', difficulty: 'medium', duration: '20分钟', completed: false, current: false },
      { id: 18, title: '第十八章：大道废', difficulty: 'easy', duration: '15分钟', completed: false, current: false }
    ]
  },
  intermediate: {
    name: '进阶者路径',
    description: '适合有一定基础的学习者，深入探讨《道德经》的哲学思想和内在逻辑',
    progress: 35,
    totalLessons: 27,
    completedLessons: 9,
    lessons: [
      { id: 19, title: '第十九章：绝圣弃智', difficulty: 'medium', duration: '30分钟', completed: true, current: false },
      { id: 20, title: '第二十章：绝学无忧', difficulty: 'medium', duration: '30分钟', completed: true, current: false },
      { id: 21, title: '第二十一章：孔德之容', difficulty: 'hard', duration: '35分钟', completed: true, current: false },
      { id: 22, title: '第二十二章：曲则全', difficulty: 'easy', duration: '25分钟', completed: true, current: false },
      { id: 23, title: '第二十三章：希言自然', difficulty: 'medium', duration: '30分钟', completed: true, current: false },
      { id: 24, title: '第二十四章：企者不立', difficulty: 'easy', duration: '25分钟', completed: true, current: false },
      { id: 25, title: '第二十五章：有物混成', difficulty: 'hard', duration: '40分钟', completed: true, current: false },
      { id: 26, title: '第二十六章：重为轻根', difficulty: 'medium', duration: '30分钟', completed: true, current: false },
      { id: 27, title: '第二十七章：善行无辙迹', difficulty: 'medium', duration: '30分钟', completed: true, current: false },
      { id: 28, title: '第二十八章：知其雄', difficulty: 'hard', duration: '35分钟', completed: false, current: true },
      { id: 29, title: '第二十九章：将欲取天下', difficulty: 'medium', duration: '30分钟', completed: false, current: false },
      { id: 30, title: '第三十章：以道佐人主', difficulty: 'medium', duration: '30分钟', completed: false, current: false },
      { id: 31, title: '第三十一章：夫佳兵者', difficulty: 'medium', duration: '30分钟', completed: false, current: false },
      { id: 32, title: '第三十二章：道常无名', difficulty: 'hard', duration: '35分钟', completed: false, current: false },
      { id: 33, title: '第三十三章：知人者智', difficulty: 'easy', duration: '25分钟', completed: false, current: false },
      { id: 34, title: '第三十四章：大道泛兮', difficulty: 'medium', duration: '30分钟', completed: false, current: false },
      { id: 35, title: '第三十五章：执大象', difficulty: 'medium', duration: '30分钟', completed: false, current: false },
      { id: 36, title: '第三十六章：将欲翕之', difficulty: 'hard', duration: '35分钟', completed: false, current: false },
      { id: 37, title: '第三十七章：道常无为', difficulty: 'medium', duration: '30分钟', completed: false, current: false },
      { id: 38, title: '第三十八章：上德不德', difficulty: 'hard', duration: '40分钟', completed: false, current: false },
      { id: 39, title: '第三十九章：昔之得一者', difficulty: 'hard', duration: '40分钟', completed: false, current: false },
      { id: 40, title: '第四十章：反者道之动', difficulty: 'medium', duration: '30分钟', completed: false, current: false },
      { id: 41, title: '第四十一章：上士闻道', difficulty: 'medium', duration: '30分钟', completed: false, current: false },
      { id: 42, title: '第四十二章：道生一', difficulty: 'hard', duration: '40分钟', completed: false, current: false },
      { id: 43, title: '第四十三章：天下之至柔', difficulty: 'medium', duration: '30分钟', completed: false, current: false },
      { id: 44, title: '第四十四章：名与身孰亲', difficulty: 'easy', duration: '25分钟', completed: false, current: false },
      { id: 45, title: '第四十五章：大成若缺', difficulty: 'medium', duration: '30分钟', completed: false, current: false }
    ]
  },
  advanced: {
    name: '研究者路径',
    description: '适合深度研究者，全面解析《道德经》的文本、历史背景和学术争议',
    progress: 10,
    totalLessons: 36,
    completedLessons: 4,
    lessons: [
      { id: 46, title: '第四十六章：天下有道', difficulty: 'medium', duration: '45分钟', completed: true, current: false },
      { id: 47, title: '第四十七章：不出户', difficulty: 'medium', duration: '45分钟', completed: true, current: false },
      { id: 48, title: '第四十八章：为学日益', difficulty: 'hard', duration: '50分钟', completed: true, current: false },
      { id: 49, title: '第四十九章：圣人无常心', difficulty: 'medium', duration: '45分钟', completed: true, current: false },
      { id: 50, title: '第五十章：出生入死', difficulty: 'hard', duration: '50分钟', completed: false, current: true },
      { id: 51, title: '第五十一章：道生之', difficulty: 'hard', duration: '50分钟', completed: false, current: false },
      { id: 52, title: '第五十二章：天下有始', difficulty: 'medium', duration: '45分钟', completed: false, current: false },
      { id: 53, title: '第五十三章：使我介然有知', difficulty: 'medium', duration: '45分钟', completed: false, current: false },
      { id: 54, title: '第五十四章：善建者不拔', difficulty: 'medium', duration: '45分钟', completed: false, current: false },
      { id: 55, title: '第五十五章：含德之厚', difficulty: 'hard', duration: '50分钟', completed: false, current: false },
      { id: 56, title: '第五十六章：知者不言', difficulty: 'medium', duration: '45分钟', completed: false, current: false },
      { id: 57, title: '第五十七章：以正治国', difficulty: 'medium', duration: '45分钟', completed: false, current: false },
      { id: 58, title: '第五十八章：其政闷闷', difficulty: 'medium', duration: '45分钟', completed: false, current: false },
      { id: 59, title: '第五十九章：治人事天', difficulty: 'medium', duration: '45分钟', completed: false, current: false },
      { id: 60, title: '第六十章：治大国', difficulty: 'easy', duration: '40分钟', completed: false, current: false },
      { id: 61, title: '第六十一章：大国者下流', difficulty: 'medium', duration: '45分钟', completed: false, current: false },
      { id: 62, title: '第六十二章：道者万物之奥', difficulty: 'hard', duration: '50分钟', completed: false, current: false },
      { id: 63, title: '第六十三章：为无为', difficulty: 'medium', duration: '45分钟', completed: false, current: false },
      { id: 64, title: '第六十四章：其安易持', difficulty: 'medium', duration: '45分钟', completed: false, current: false },
      { id: 65, title: '第六十五章：古之善为道者', difficulty: 'medium', duration: '45分钟', completed: false, current: false },
      { id: 66, title: '第六十六章：江海所以能为百谷王者', difficulty: 'easy', duration: '40分钟', completed: false, current: false },
      { id: 67, title: '第六十七章：天下皆谓我道大', difficulty: 'hard', duration: '50分钟', completed: false, current: false },
      { id: 68, title: '第六十八章：善为士者', difficulty: 'medium', duration: '45分钟', completed: false, current: false },
      { id: 69, title: '第六十九章：用兵有言', difficulty: 'medium', duration: '45分钟', completed: false, current: false },
      { id: 70, title: '第七十章：吾言甚易知', difficulty: 'medium', duration: '45分钟', completed: false, current: false },
      { id: 71, title: '第七十一章：知不知', difficulty: 'hard', duration: '50分钟', completed: false, current: false },
      { id: 72, title: '第七十二章：民不畏威', difficulty: 'medium', duration: '45分钟', completed: false, current: false },
      { id: 73, title: '第七十三章：勇于敢', difficulty: 'medium', duration: '45分钟', completed: false, current: false },
      { id: 74, title: '第七十四章：民不畏死', difficulty: 'hard', duration: '50分钟', completed: false, current: false },
      { id: 75, title: '第七十五章：民之饥', difficulty: 'medium', duration: '45分钟', completed: false, current: false },
      { id: 76, title: '第七十六章：人之生也柔弱', difficulty: 'easy', duration: '40分钟', completed: false, current: false },
      { id: 77, title: '第七十七章：天之道', difficulty: 'medium', duration: '45分钟', completed: false, current: false },
      { id: 78, title: '第七十八章：天下莫柔弱于水', difficulty: 'easy', duration: '40分钟', completed: false, current: false },
      { id: 79, title: '第七十九章：和大怨', difficulty: 'medium', duration: '45分钟', completed: false, current: false },
      { id: 80, title: '第八十章：小国寡民', difficulty: 'medium', duration: '45分钟', completed: false, current: false },
      { id: 81, title: '第八十一章：信言不美', difficulty: 'hard', duration: '50分钟', completed: false, current: false }
    ]
  }
}

// 课程题目数据
const lessonQuestions = {
  1: {
    question: '"道可道，非常道" 是什么意思？',
    options: [
      { id: 'A', text: '道是可以说出来的' },
      { id: 'B', text: '道是无法完全用语言表达的永恒真理' },
      { id: 'C', text: '道是一种特殊的道路' },
      { id: 'D', text: '道是常识' }
    ],
    correctAnswer: 'B',
    explanation: '老子认为"道"是宇宙的本源，超越了语言的描述范围。一旦用语言说出来，就不是那个永恒不变的"道"了。'
  },
  2: {
    question: '"天下皆知美之为美，斯恶已" 强调了什么概念？',
    options: [
      { id: 'A', text: '美丑是绝对的' },
      { id: 'B', text: '对立统一与相互依存' },
      { id: 'C', text: '大家都喜欢美' },
      { id: 'D', text: '恶是美的反面' }
    ],
    correctAnswer: 'B',
    explanation: '老子强调美与丑、善与恶都是相对存在的，没有恶就没有美，它们是相互依存、相互转化的。'
  },
  3: {
    question: '"不尚贤，使民不争" 提倡什么样的治理方式？',
    options: [
      { id: 'A', text: '不推崇贤能，减少争斗' },
      { id: 'B', text: '打压贤能之人' },
      { id: 'C', text: '奖励争斗' },
      { id: 'D', text: '选拔贤能' }
    ],
    correctAnswer: 'A',
    explanation: '老子认为过度推崇贤能会导致人们为了名利而争斗，不如顺其自然，让百姓安居乐业。'
  },
  4: {
    question: '"道冲而用之或不盈" 形容道的什么特性？',
    options: [
      { id: 'A', text: '道是空虚的' },
      { id: 'B', text: '道是满盈的' },
      { id: 'C', text: '道体虚空而作用无穷' },
      { id: 'D', text: '道是冲动的' }
    ],
    correctAnswer: 'C',
    explanation: '"冲"通"盅"，意为虚空。道体虽然虚空，但其作用却是无穷无尽的，永远不会枯竭。'
  },
  5: {
    question: '"天地不仁，以万物为刍狗" 的真正含义是？',
    options: [
      { id: 'A', text: '天地很残忍' },
      { id: 'B', text: '天地把万物当草狗玩弄' },
      { id: 'C', text: '天地无私，对万物一视同仁' },
      { id: 'D', text: '天地没有仁爱之心' }
    ],
    correctAnswer: 'C',
    explanation: '这句话不是说天地残酷，而是说天地顺其自然，没有偏爱，对待万物就像对待祭祀用的草狗一样，任其自然生灭。'
  },
  6: {
    question: '"谷神不死，是谓玄牝" 中的 "谷神" 象征什么？',
    options: [
      { id: 'A', text: '山谷里的神' },
      { id: 'B', text: '虚空生养万物的道' },
      { id: 'C', text: '粮食之神' },
      { id: 'D', text: '不死的精神' }
    ],
    correctAnswer: 'B',
    explanation: '"谷神"象征道的虚空博大和生生不息的特性，就像空旷的山谷一样，能容纳万物并孕育生命。'
  },
  7: {
    question: '"天长地久" 的原因是？',
    options: [
      { id: 'A', text: '它们很坚硬' },
      { id: 'B', text: '它们不自生，故能长生' },
      { id: 'C', text: '它们很大' },
      { id: 'D', text: '它们存在很久了' }
    ],
    correctAnswer: 'B',
    explanation: '老子认为天地之所以长久，是因为它们不为自己生存，而是无私地养育万物，所以能够长久。'
  },
  8: {
    question: '"上善若水" 赞美水的什么品质？',
    options: [
      { id: 'A', text: '透明清澈' },
      { id: 'B', text: '滋润万物而不争' },
      { id: 'C', text: '汹涌澎湃' },
      { id: 'D', text: '随波逐流' }
    ],
    correctAnswer: 'B',
    explanation: '水善于滋润万物却不与万物相争，停留在众人厌恶的低洼之地，这种品质最接近于"道"。'
  },
  9: {
    question: '"持而盈之，不如其已" 告诫我们什么？',
    options: [
      { id: 'A', text: '只要持有就要充满' },
      { id: 'B', text: '适可而止，过犹不及' },
      { id: 'C', text: '必须要盈满' },
      { id: 'D', text: '放弃持有' }
    ],
    correctAnswer: 'B',
    explanation: '老子告诫我们要懂得适可而止，如果执着于盈满，反而容易招致倾覆，不如及时停止。'
  },
  10: {
    question: '"生之畜之，生而不有" 描述的是什么德行？',
    options: [
      { id: 'A', text: '玄德' },
      { id: 'B', text: '公德' },
      { id: 'C', text: '私德' },
      { id: 'D', text: '明德' }
    ],
    correctAnswer: 'A',
    explanation: '这种生长万物却不占有，抚育万物却不自恃，统领万物却不主宰的品德，老子称之为"玄德"（深远的德）。'
  },
  11: {
    question: '"三十辐共一毂，当其无，有车之用" 说明了什么道理？',
    options: [
      { id: 'A', text: '车轮需要三十根辐条' },
      { id: 'B', text: '"有"和"无"的辩证关系，"无"的作用' },
      { id: 'C', text: '车子的构造' },
      { id: 'D', text: '轮毂的重要性' }
    ],
    correctAnswer: 'B',
    explanation: '老子通过车轮、器皿、房屋的比喻，说明实有的东西之所以有用，是因为其中空的"无"的部分发挥了作用。'
  },
  12: {
    question: '"五色令人目盲" 意在警示什么？',
    options: [
      { id: 'A', text: '颜色太多会瞎' },
      { id: 'B', text: '贪图感官享乐会迷失本性' },
      { id: 'C', text: '要多看五颜六色的东西' },
      { id: 'D', text: '眼睛不好要少看' }
    ],
    correctAnswer: 'B',
    explanation: '老子认为过分追求感官刺激（如五色、五音、五味）会让人迷失本性，应保持内心的清静和平和。'
  },
  13: {
    question: '"宠辱若惊" 告诉我们对待得失的态度应该是？',
    options: [
      { id: 'A', text: '得到宠爱要惊喜，受到侮辱要惊恐' },
      { id: 'B', text: '淡然处之，不为外物所动' },
      { id: 'C', text: '要努力争取宠爱' },
      { id: 'D', text: '要极力避免侮辱' }
    ],
    correctAnswer: 'B',
    explanation: '老子认为宠和辱都是让人惊恐的，只有把得失看淡，重视自身生命，才能不为外物所累。'
  },
  14: {
    question: '"视之不见名曰夷，听之不闻名曰希" 描述的是？',
    options: [
      { id: 'A', text: '鬼魂' },
      { id: 'B', text: '道的无形无象' },
      { id: 'C', text: '视力和听力不好' },
      { id: 'D', text: '远处的风景' }
    ],
    correctAnswer: 'B',
    explanation: '老子用"夷"（看不见）、"希"（听不到）、"微"（摸不着）来形容道的虚无缥缈、无形无象的特性。'
  },
  15: {
    question: '"古之善为士者，微妙玄通" 这里的"士"指什么人？',
    options: [
      { id: 'A', text: '士兵' },
      { id: 'B', text: '得道的统治者或圣人' },
      { id: 'C', text: '读书人' },
      { id: 'D', text: '武士' }
    ],
    correctAnswer: 'B',
    explanation: '这里的"士"指的是古代善于为道的人，也就是得道的统治者或修道者，他们性格深沉、难以捉摸。'
  },
  16: {
    question: '"致虚极，守静笃" 是修道的什么境界？',
    options: [
      { id: 'A', text: '极其虚无和宁静的状态' },
      { id: 'B', text: '极其虚伪和安静' },
      { id: 'C', text: '极其空虚和孤独' },
      { id: 'D', text: '极其虚弱和冷静' }
    ],
    correctAnswer: 'A',
    explanation: '这是老子提出的修养功夫，要求使心灵达到极度虚空，保持极度宁静，这样才能观察万物的本源。'
  },
  17: {
    question: '"太上，不知有之" 是什么样的统治境界？',
    options: [
      { id: 'A', text: '百姓不知道有统治者存在' },
      { id: 'B', text: '百姓不理睬统治者' },
      { id: 'C', text: '统治者不存在' },
      { id: 'D', text: '统治者很高高在上' }
    ],
    correctAnswer: 'A',
    explanation: '老子认为最好的统治者是顺应自然，百姓感觉不到他的干预，仿佛一切都是自然而然发生的。'
  },
  18: {
    question: '"大道废，有仁义" 说明了什么？',
    options: [
      { id: 'A', text: '仁义是很好的东西' },
      { id: 'B', text: '大道废弃后，才显现出仁义的可贵' },
      { id: 'C', text: '仁义导致大道废弃' },
      { id: 'D', text: '要废除大道' }
    ],
    correctAnswer: 'B',
    explanation: '老子认为在淳朴的大道盛行时，仁义是自然存在的，不需要特别提倡。只有大道废弃了，人们才开始强调仁义。'
  },
  19: {
    question: '"绝圣弃智，民利百倍" 意在反对什么？',
    options: [
      { id: 'A', text: '反对所有的智慧' },
      { id: 'B', text: '反对巧伪的聪明和虚假的圣人' },
      { id: 'C', text: '反对百姓获利' },
      { id: 'D', text: '反对学习' }
    ],
    correctAnswer: 'B',
    explanation: '老子并非反对真正的智慧，而是反对那些用来欺诈百姓、巧取豪夺的"智"和虚伪的仁义道德。'
  },
  20: {
    question: '"绝学无忧" 中的"学"主要指？',
    options: [
      { id: 'A', text: '学习知识' },
      { id: 'B', text: '学习礼教规范' },
      { id: 'C', text: '学习技能' },
      { id: 'D', text: '学习语言' }
    ],
    correctAnswer: 'B',
    explanation: '老子这里的"学"特指当时社会上繁琐虚伪的礼教规范，抛弃这些束缚，人才能返璞归真，没有忧愁。'
  },
  21: {
    question: '"孔德之容，惟道是从" 说明"德"与"道"的关系是？',
    options: [
      { id: 'A', text: '德是道的体现，完全顺从于道' },
      { id: 'B', text: '德比道更重要' },
      { id: 'C', text: '道顺从于德' },
      { id: 'D', text: '德和道没有关系' }
    ],
    correctAnswer: 'A',
    explanation: '"孔"是大意思。大德的形态，就是完全顺从于道。德是道在万物中的具体体现。'
  },
  22: {
    question: '"曲则全，枉则直" 体现了什么辩证法？',
    options: [
      { id: 'A', text: '委曲求全' },
      { id: 'B', text: '对立面可以相互转化' },
      { id: 'C', text: '弯曲就是直的' },
      { id: 'D', text: '要学会弯腰' }
    ],
    correctAnswer: 'B',
    explanation: '受得住委曲，才能保全；经得起冤屈，才能伸直。体现了事物向对立面转化的辩证智慧。'
  },
  23: {
    question: '"希言自然" 意思是？',
    options: [
      { id: 'A', text: '少说话符合自然之道' },
      { id: 'B', text: '希望大自然说话' },
      { id: 'C', text: '自然界的声音很稀少' },
      { id: 'D', text: '说话要自然' }
    ],
    correctAnswer: 'A',
    explanation: '老子认为，少发号施令，顺应自然规律，才是长久之道。狂风暴雨都不能持久，何况苛政呢？'
  },
  24: {
    question: '"企者不立，跨者不行" 告诫我们？',
    options: [
      { id: 'A', text: '不要踮脚站立，不要大步跨越' },
      { id: 'B', text: '急于求成反而达不到目的' },
      { id: 'C', text: '站姿要端正' },
      { id: 'D', text: '走路要慢' }
    ],
    correctAnswer: 'B',
    explanation: '踮起脚跟站不稳，跨大步走不远。比喻急于表现自己或急于求成，反而不能长久。'
  },
  25: {
    question: '"有物混成，先天地生" 指的是？',
    options: [
      { id: 'A', text: '盘古' },
      { id: 'B', text: '道' },
      { id: 'C', text: '混沌' },
      { id: 'D', text: '元气' }
    ],
    correctAnswer: 'B',
    explanation: '这是对"道"的经典描述：有一个混然而成的东西，在天地形成之前就已经存在了。'
  },
  26: {
    question: '"重为轻根，静为躁君" 强调了什么的重要性？',
    options: [
      { id: 'A', text: '轻和躁' },
      { id: 'B', text: '重和静' },
      { id: 'C', text: '根和君' },
      { id: 'D', text: '平衡' }
    ],
    correctAnswer: 'B',
    explanation: '稳重是轻浮的根基，宁静是躁动的主宰。老子强调要保持稳重和宁静，不要轻率躁动。'
  },
  27: {
    question: '"善行无辙迹" 的意思是？',
    options: [
      { id: 'A', text: '走路不留脚印' },
      { id: 'B', text: '善于行动的人顺应自然，不留痕迹' },
      { id: 'C', text: '要穿软底鞋' },
      { id: 'D', text: '做坏事不留证据' }
    ],
    correctAnswer: 'B',
    explanation: '善于行走的人，像顺水推舟一样顺应自然规律，所以不会留下由于强行作为而产生的痕迹。'
  },
  28: {
    question: '"知其雄，守其雌" 提倡什么态度？',
    options: [
      { id: 'A', text: '虽有刚强的实力，却安守柔弱的地位' },
      { id: 'B', text: '要变得像女性一样' },
      { id: 'C', text: '要争强好胜' },
      { id: 'D', text: '要知道男女的区别' }
    ],
    correctAnswer: 'A',
    explanation: '深知什么是雄强，却安守雌柔的地位，这样才能成为天下的溪涧，德行才不会离失。'
  },
  29: {
    question: '"将欲取天下而为之，吾见其不得已" 原因是？',
    options: [
      { id: 'A', text: '能力不够' },
      { id: 'B', text: '天下是神圣的，不能强行作为' },
      { id: 'C', text: '时机未到' },
      { id: 'D', text: '百姓不支持' }
    ],
    correctAnswer: 'B',
    explanation: '老子认为"天下神器，不可为也"。天下是神圣的，不能强行去把持或改变它，强行作为必然失败。'
  },
  30: {
    question: '"以道佐人主者，不以兵强天下" 为什么？',
    options: [
      { id: 'A', text: '因为兵器不够好' },
      { id: 'B', text: '因为好战必有恶报' },
      { id: 'C', text: '因为打仗花钱' },
      { id: 'D', text: '因为人主不喜欢' }
    ],
    correctAnswer: 'B',
    explanation: '"其事好还"。用武力逞强于天下，必然会遭到报应。师之所处，荆棘生焉。'
  },
  31: {
    question: '"夫佳兵者，不祥之器" 对待战争的态度应是？',
    options: [
      { id: 'A', text: '不得已而用之，恬淡为上' },
      { id: 'B', text: '多多益善' },
      { id: 'C', text: '彻底消灭战争' },
      { id: 'D', text: '用来炫耀武力' }
    ],
    correctAnswer: 'A',
    explanation: '兵器是不祥的东西，君子只有在不得已的时候才使用它，即使胜利了也不要以此为美。'
  },
  32: {
    question: '"道常无名，朴" 这里的"朴"是指？',
    options: [
      { id: 'A', text: '朴素' },
      { id: 'B', text: '没有雕琢的木头，象征道的原始状态' },
      { id: 'C', text: '朴实的人' },
      { id: 'D', text: '树皮' }
    ],
    correctAnswer: 'B',
    explanation: '"朴"指未经加工的木材，老子用它来比喻道的那种原始、自然、未被分割和定义的状态。'
  },
  33: {
    question: '"知人者智，自知者明" 哪一个境界更高？',
    options: [
      { id: 'A', text: '知人者' },
      { id: 'B', text: '自知者' },
      { id: 'C', text: '一样高' },
      { id: 'D', text: '都不高' }
    ],
    correctAnswer: 'B',
    explanation: '了解别人只能算聪明，能认清自己才是真正的清明高超。'
  },
  34: {
    question: '"大道泛兮，其可左右" 形容道？',
    options: [
      { id: 'A', text: '左右摇摆' },
      { id: 'B', text: '无处不在，无所不包' },
      { id: 'C', text: '很宽阔' },
      { id: 'D', text: '泛滥成灾' }
    ],
    correctAnswer: 'B',
    explanation: '大道广泛流行，无处不在，万物都依靠它而生长，它却不推辞责任，不自以为主。'
  },
  35: {
    question: '"执大象，天下往" 这里的"大象"指？',
    options: [
      { id: 'A', text: '很大的大象' },
      { id: 'B', text: '大道理' },
      { id: 'C', text: '道的形象或规律' },
      { id: 'D', text: '气象' }
    ],
    correctAnswer: 'C',
    explanation: '谁掌握了"道"（大象），天下人都会归向他。'
  },
  36: {
    question: '"将欲翕之，必固张之" 说明了什么？',
    options: [
      { id: 'A', text: '物极必反的微明之道' },
      { id: 'B', text: '要做假动作' },
      { id: 'C', text: '张开是为了合上' },
      { id: 'D', text: '呼吸的方法' }
    ],
    correctAnswer: 'A',
    explanation: '想要收敛它，必先扩张它。这体现了事物发展到极限就会向反面转化的规律，是深奥的智慧（微明）。'
  },
  37: {
    question: '"道常无为而无不为" 意思是？',
    options: [
      { id: 'A', text: '道什么都不做' },
      { id: 'B', text: '道顺应自然，不妄为，所以什么都能成就' },
      { id: 'C', text: '道什么都做' },
      { id: 'D', text: '道很懒' }
    ],
    correctAnswer: 'B',
    explanation: '道不强行干预万物，顺其自然，结果万物都得到了生长和成就，仿佛道什么都做了。'
  },
  38: {
    question: '"上德不德，是以有德" 含义是？',
    options: [
      { id: 'A', text: '上等的德不表现为有德，所以才是真正的德' },
      { id: 'B', text: '没有德才是德' },
      { id: 'C', text: '上等的德是不讲道德' },
      { id: 'D', text: '德行高的人没有德' }
    ],
    correctAnswer: 'A',
    explanation: '具备上等德行的人，不有意去表现德，不执着于德的形式，这才是真正的德。'
  },
  39: {
    question: '"昔之得一者" 中的"一"指？',
    options: [
      { id: 'A', text: '第一名' },
      { id: 'B', text: '道' },
      { id: 'C', text: '统一' },
      { id: 'D', text: '数字一' }
    ],
    correctAnswer: 'B',
    explanation: '这里的"一"指的就是道，或者是道所产生的元气。天得一以清，地得一以宁。'
  },
  40: {
    question: '"反者道之动" 揭示了？',
    options: [
      { id: 'A', text: '道是反着动的' },
      { id: 'B', text: '事物循环往复、向对立面转化的运动规律' },
      { id: 'C', text: '反对道的人' },
      { id: 'D', text: '造反有理' }
    ],
    correctAnswer: 'B',
    explanation: '这是《道德经》最重要的命题之一。循环往复是道的运动，事物发展到极点就会走向反面。'
  },
  41: {
    question: '"大器晚成" 原意可能是？',
    options: [
      { id: 'A', text: '大的器具最后完成' },
      { id: 'B', text: '大器免成（不需要加工）' },
      { id: 'C', text: '成功比较晚' },
      { id: 'D', text: '很大的盘子' }
    ],
    correctAnswer: 'B',
    explanation: '根据马王堆出土帛书，此句应为"大器免成"，意为最大的器具（道）是天然形成的，不需要人工雕琢。现行本多作"晚成"。'
  },
  42: {
    question: '"道生一，一生二，二生三，三生万物" 描述了？',
    options: [
      { id: 'A', text: '数学计算' },
      { id: 'B', text: '宇宙生成的模式' },
      { id: 'C', text: '家庭繁衍' },
      { id: 'D', text: '细胞分裂' }
    ],
    correctAnswer: 'B',
    explanation: '这是老子的宇宙生成论。道是本源，生出元气，元气分阴阳，阴阳交合生万物。'
  },
  43: {
    question: '"天下之至柔，驰骋天下之至坚" 比喻什么？',
    options: [
      { id: 'A', text: '水或气' },
      { id: 'B', text: '马' },
      { id: 'C', text: '车' },
      { id: 'D', text: '风' }
    ],
    correctAnswer: 'A',
    explanation: '无形之气（或水）可以穿透任何坚硬的东西，说明柔弱胜刚强的道理。'
  },
  44: {
    question: '"知足不辱，知止不殆" 劝诫我们要？',
    options: [
      { id: 'A', text: '懂得满足和适可而止' },
      { id: 'B', text: '知道脚在哪里' },
      { id: 'C', text: '知道什么时候休息' },
      { id: 'D', text: '不要受辱' }
    ],
    correctAnswer: 'A',
    explanation: '懂得满足就不会受到屈辱，懂得适可而止就不会遇到危险，这样才能长久。'
  },
  45: {
    question: '"大成若缺，其用不弊" 意思是？',
    options: [
      { id: 'A', text: '最大的成就好像有缺陷' },
      { id: 'B', text: '完满的东西就是有缺点的' },
      { id: 'C', text: '最完美的事物表面看好像有缺陷，但作用无穷' },
      { id: 'D', text: '坏了的东西也能用' }
    ],
    correctAnswer: 'C',
    explanation: '真正完美的东西，表面上好像有残缺，但它的作用永远不会衰竭。'
  },
  46: {
    question: '"天下有道，却走马以粪" 描绘了什么景象？',
    options: [
      { id: 'A', text: '和平时期，战马用来耕田' },
      { id: 'B', text: '马随地大小便' },
      { id: 'C', text: '天下大乱' },
      { id: 'D', text: '马跑得很快' }
    ],
    correctAnswer: 'A',
    explanation: '天下有道时，战马被退还回去给田地施肥（耕作），象征和平。天下无道时，战马在郊外生驹。'
  },
  47: {
    question: '"不出户，知天下" 依靠的是？',
    options: [
      { id: 'A', text: '互联网' },
      { id: 'B', text: '掌握了道的规律' },
      { id: 'C', text: '听别人说' },
      { id: 'D', text: '想象力' }
    ],
    correctAnswer: 'B',
    explanation: '圣人掌握了事物的根本规律（道），所以不需要出门远行，就能推知天下的事理。'
  },
  48: {
    question: '"为学日益，为道日损" 区别在于？',
    options: [
      { id: 'A', text: '学习要积累，修道要减损欲望' },
      { id: 'B', text: '学习很难，修道很容易' },
      { id: 'C', text: '学习要每天做，修道偶尔做' },
      { id: 'D', text: '二者没有区别' }
    ],
    correctAnswer: 'A',
    explanation: '求学问要天天积累知识，修道却要天天减少欲望和私心，直到无为的境界。'
  },
  49: {
    question: '"圣人无常心，以百姓心为心" 说明圣人？',
    options: [
      { id: 'A', text: '没有主见' },
      { id: 'B', text: '顺应百姓的需求' },
      { id: 'C', text: '心脏不好' },
      { id: 'D', text: '替百姓操心' }
    ],
    correctAnswer: 'B',
    explanation: '圣人没有固执的私心，而是把百姓的心愿作为自己的心愿。'
  },
  50: {
    question: '"出生入死" 的本义是？',
    options: [
      { id: 'A', text: '冒险' },
      { id: 'B', text: '出来是生，进去是死（指离开生存领域进入死亡领域）' },
      { id: 'C', text: '生生死死' },
      { id: 'D', text: '生下来就死了' }
    ],
    correctAnswer: 'B',
    explanation: '人从出生（生之徒）到死亡（死之徒），是因为过分追求养生（生生之厚），反而加速了死亡。'
  },
  51: {
    question: '"道生之，德畜之" 说明万物的生长依靠？',
    options: [
      { id: 'A', text: '阳光雨露' },
      { id: 'B', text: '道和德的自然养育' },
      { id: 'C', text: '父母' },
      { id: 'D', text: '运气' }
    ],
    correctAnswer: 'B',
    explanation: '万物由道产生，由德蓄养，没有任何强迫，都是自然而然的（势成之）。'
  },
  52: {
    question: '"既得其母，以知其子" 这里的"母"指？',
    options: [
      { id: 'A', text: '母亲' },
      { id: 'B', text: '道（本源）' },
      { id: 'C', text: '老师' },
      { id: 'D', text: '祖国' }
    ],
    correctAnswer: 'B',
    explanation: '把道当作天下的母体。只要掌握了根本的道（母），就能了解万物（子）。'
  },
  53: {
    question: '"使我介然有知，行于大道，唯施是畏" 担心的是？',
    options: [
      { id: 'A', text: '走错路' },
      { id: 'B', text: '误入歧途（偏离大道）' },
      { id: 'C', text: '施舍' },
      { id: 'D', text: '畏惧' }
    ],
    correctAnswer: 'B',
    explanation: '如果我稍微有点知识，在康庄大道上行走，唯一担心的就是走了邪路（施，指斜路）。'
  },
  54: {
    question: '"善建者不拔" 比喻？',
    options: [
      { id: 'A', text: '建筑质量好' },
      { id: 'B', text: '根基扎实（修道深厚）不可动摇' },
      { id: 'C', text: '力气大拔不出来' },
      { id: 'D', text: '善于建设' }
    ],
    correctAnswer: 'B',
    explanation: '善于建树的人，其建树不可拔除。比喻修道者的德行深厚，不会轻易改变。'
  },
  55: {
    question: '"含德之厚，比于赤子" 婴儿有什么特点？',
    options: [
      { id: 'A', text: '爱哭' },
      { id: 'B', text: '柔弱但充满生命力，精气充足' },
      { id: 'C', text: '无知' },
      { id: 'D', text: '需要照顾' }
    ],
    correctAnswer: 'B',
    explanation: '婴儿虽然柔弱，但筋骨柔韧，精气充足，没有欲念，这是德行深厚的象征。'
  },
  56: {
    question: '"知者不言，言者不知" 意思是？',
    options: [
      { id: 'A', text: '聪明人不说话' },
      { id: 'B', text: '真懂道的人不夸夸其谈，夸夸其谈的人不懂道' },
      { id: 'C', text: '说话的人都笨' },
      { id: 'D', text: '哑巴最聪明' }
    ],
    correctAnswer: 'B',
    explanation: '真正悟道的人明白道不可言说，所以不乱说；喜欢高谈阔论的人往往并没有真正悟道。'
  },
  57: {
    question: '"以正治国，以奇用兵，以无事取天下" 强调？',
    options: [
      { id: 'A', text: '治国要正，用兵要奇，治天下要无为' },
      { id: 'B', text: '都要用奇计' },
      { id: 'C', text: '都要正规' },
      { id: 'D', text: '什么都不做' }
    ],
    correctAnswer: 'A',
    explanation: '治国要用正道，打仗要用奇计，而治理天下要顺应自然，不骚扰百姓。'
  },
  58: {
    question: '"其政闷闷，其民淳淳" 什么样的政治最好？',
    options: [
      { id: 'A', text: '严苛的政治' },
      { id: 'B', text: '宽厚不明察的政治' },
      { id: 'C', text: '混乱的政治' },
      { id: 'D', text: '精明的政治' }
    ],
    correctAnswer: 'B',
    explanation: '政治宽厚混沌（不苛察），百姓就淳朴忠厚；政治苛察严厉，百姓就狡黠多诈。'
  },
  59: {
    question: '"治人事天，莫若啬" "啬"的意思是？',
    options: [
      { id: 'A', text: '吝啬' },
      { id: 'B', text: '爱惜精神，积蓄力量' },
      { id: 'C', text: '小气' },
      { id: 'D', text: '种庄稼' }
    ],
    correctAnswer: 'B',
    explanation: '治理百姓、侍奉上天，没有比爱惜精神（积德）更好的了。'
  },
  60: {
    question: '"治大国，若烹小鲜" 意思是？',
    options: [
      { id: 'A', text: '做菜很难' },
      { id: 'B', text: '治理大国不能随意翻动（折腾），要掌握火候' },
      { id: 'C', text: '大国像小鱼一样' },
      { id: 'D', text: '要请厨师治国' }
    ],
    correctAnswer: 'B',
    explanation: '煎小鱼不能常翻，否则会烂。治大国也不能朝令夕改，折腾百姓。'
  },
  61: {
    question: '"大国者下流" 意指？',
    options: [
      { id: 'A', text: '大国很卑鄙' },
      { id: 'B', text: '大国应像江河下游一样，处于谦下地位以汇聚万物' },
      { id: 'C', text: '大国水流很急' },
      { id: 'D', text: '大国在下游' }
    ],
    correctAnswer: 'B',
    explanation: '大国应该像江河的下游一样，谦虚包容，这样天下的小国才会归附。'
  },
  62: {
    question: '"道者万物之奥" "奥"通"奥"，意思是？',
    options: [
      { id: 'A', text: '深奥' },
      { id: 'B', text: '庇护所（主宰）' },
      { id: 'C', text: '奥运会' },
      { id: 'D', text: '角落' }
    ],
    correctAnswer: 'B',
    explanation: '道是万物的主宰和庇护者。善人把它当作宝，不善的人也依靠它保全。'
  },
  63: {
    question: '"为无为，事无事，味无味" 倡导？',
    options: [
      { id: 'A', text: '什么感觉都没有' },
      { id: 'B', text: '以无为的态度去作为，顺应自然' },
      { id: 'C', text: '吃没味道的菜' },
      { id: 'D', text: '不做事' }
    ],
    correctAnswer: 'B',
    explanation: '以无为的态度去行事，办那些顺应自然的事，体味那恬淡无味的大道。'
  },
  64: {
    question: '"千里之行，始于足下" 说明？',
    options: [
      { id: 'A', text: '走路要看脚' },
      { id: 'B', text: '大事由小事积累而成，要重视积累' },
      { id: 'C', text: '要买好鞋' },
      { id: 'D', text: '路很远' }
    ],
    correctAnswer: 'B',
    explanation: '合抱之木生于毫末，九层之台起于累土。强调了积累和从基础做起的重要性。'
  },
  65: {
    question: '"古之善为道者，非以明民，将以愚之" "愚"是指？',
    options: [
      { id: 'A', text: '愚弄百姓' },
      { id: 'B', text: '使百姓淳朴无伪' },
      { id: 'C', text: '让百姓变笨' },
      { id: 'D', text: '不让百姓读书' }
    ],
    correctAnswer: 'B',
    explanation: '这里的"愚"不是愚弄，而是让百姓返璞归真，保持淳朴敦厚的状态，不被巧智所迷惑。'
  },
  66: {
    question: '"江海所以能为百谷王者，以其善下之" 强调？',
    options: [
      { id: 'A', text: '江海很大' },
      { id: 'B', text: '谦下包容的力量' },
      { id: 'C', text: '水往低处流' },
      { id: 'D', text: '要做王' }
    ],
    correctAnswer: 'B',
    explanation: '江海之所以能汇聚百川，是因为它善于处在低下的位置。欲上民，必以言下之。'
  },
  67: {
    question: '"我有三宝，持而保之" 是哪三宝？',
    options: [
      { id: 'A', text: '金、银、珠宝' },
      { id: 'B', text: '慈、俭、不敢为天下先' },
      { id: 'C', text: '仁、义、礼' },
      { id: 'D', text: '车、马、房' }
    ],
    correctAnswer: 'B',
    explanation: '老子的三宝是：慈爱、俭啬、不敢居于天下人之先（谦退）。'
  },
  68: {
    question: '"善战者不怒" 意思是？',
    options: [
      { id: 'A', text: '打仗不能生气' },
      { id: 'B', text: '善于打仗的人不轻易被激怒' },
      { id: 'C', text: '生气打不赢' },
      { id: 'D', text: '要笑着打仗' }
    ],
    correctAnswer: 'B',
    explanation: '善于指挥作战的人，不会被敌人的挑衅激怒，保持冷静才能控制局势。这叫"不争之德"。'
  },
  69: {
    question: '"祸莫大于轻敌" 后果是？',
    options: [
      { id: 'A', text: '丧失吾宝（几近灭亡）' },
      { id: 'B', text: '被嘲笑' },
      { id: 'C', text: '浪费粮食' },
      { id: 'D', text: '敌人跑了' }
    ],
    correctAnswer: 'A',
    explanation: '轻视敌人是最大的祸患，轻敌几近于丧失我的"三宝"，导致失败。'
  },
  70: {
    question: '"吾言甚易知，甚易行。天下莫能知，莫能行" 原因是？',
    options: [
      { id: 'A', text: '大家都很笨' },
      { id: 'B', text: '言语中有宗指，行事中有君主（人们被私欲蒙蔽）' },
      { id: 'C', text: '话太简单了' },
      { id: 'D', text: '老子没说明白' }
    ],
    correctAnswer: 'B',
    explanation: '老子的话有根源、有主旨，但世人被世俗的智巧和私欲蒙蔽，所以不理解、不实行。'
  },
  71: {
    question: '"知不知，尚矣" 意思是？',
    options: [
      { id: 'A', text: '知道自己不知道，是最好的' },
      { id: 'B', text: '知道就是不知道' },
      { id: 'C', text: '不知道也要装知道' },
      { id: 'D', text: '不知道是高尚的' }
    ],
    correctAnswer: 'A',
    explanation: '知道自己有所不知，这是高明的。不知道却自以为知道，这是毛病（病矣）。'
  },
  72: {
    question: '"民不畏威，则大威至" 意在警告统治者？',
    options: [
      { id: 'A', text: '要更威严' },
      { id: 'B', text: '不要压迫百姓，否则会引起反抗' },
      { id: 'C', text: '百姓胆子大' },
      { id: 'D', text: '要有大威风' }
    ],
    correctAnswer: 'B',
    explanation: '如果百姓不再畏惧统治者的威压，那么更大的动荡（起义）就要到来了。所以不要逼迫百姓。'
  },
  73: {
    question: '"天网恢恢，疏而不失" 说明？',
    options: [
      { id: 'A', text: '网破了' },
      { id: 'B', text: '自然法则（天道）虽宽，但不会漏掉任何违背它的人' },
      { id: 'C', text: '要修补天网' },
      { id: 'D', text: '捕鸟的网' }
    ],
    correctAnswer: 'B',
    explanation: '天道自然之网广大无边，虽然网眼稀疏，但什么也不会漏掉。善恶终有报。'
  },
  74: {
    question: '"民不畏死，奈何以死惧之" 说明？',
    options: [
      { id: 'A', text: '死刑没有威慑力' },
      { id: 'B', text: '当百姓生存艰难到不怕死时，严刑峻法就失效了' },
      { id: 'C', text: '百姓很勇敢' },
      { id: 'D', text: '吓唬人没用' }
    ],
    correctAnswer: 'B',
    explanation: '当暴政让百姓无法生存时，他们就不怕死了，用死来威胁他们是没有用的。'
  },
  75: {
    question: '"民之饥，以其上食税之多" 指出饥荒原因是？',
    options: [
      { id: 'A', text: '天灾' },
      { id: 'B', text: '统治者吞食赋税太多' },
      { id: 'C', text: '百姓懒惰' },
      { id: 'D', text: '土地贫瘠' }
    ],
    correctAnswer: 'B',
    explanation: '百姓之所以遭受饥荒，是因为统治者征收的赋税太多了。'
  },
  76: {
    question: '"人之生也柔弱，其死也坚强" 说明？',
    options: [
      { id: 'A', text: '死了就僵硬了' },
      { id: 'B', text: '柔弱是生机，坚强是死相' },
      { id: 'C', text: '活着要软弱' },
      { id: 'D', text: '身体结构' }
    ],
    correctAnswer: 'B',
    explanation: '柔弱是富有生机的表现，坚硬是死亡枯槁的表现。所以"坚强者死之徒，柔弱者生之徒"。'
  },
  77: {
    question: '"天之道，损有余而补不足" 区别于"人之道"的？',
    options: [
      { id: 'A', text: '人之道损不足以奉有余' },
      { id: 'B', text: '人之道也是补不足' },
      { id: 'C', text: '没有区别' },
      { id: 'D', text: '天道不公平' }
    ],
    correctAnswer: 'A',
    explanation: '自然的规律是减少多余的补给不足的（趋向平衡），而人类社会的法则往往是剥夺不足的去奉养富裕的。'
  },
  78: {
    question: '"天下莫柔弱于水，而攻坚强者莫之能胜" 道理是？',
    options: [
      { id: 'A', text: '水能灭火' },
      { id: 'B', text: '柔弱胜刚强' },
      { id: 'C', text: '水滴石穿' },
      { id: 'D', text: '不要和水打架' }
    ],
    correctAnswer: 'B',
    explanation: '水最柔弱，但能攻克最坚强的东西，没有东西能替代它。这证明了柔胜刚、弱胜强。'
  },
  79: {
    question: '"和大怨，必有余怨" 建议我们？',
    options: [
      { id: 'A', text: '不要和解' },
      { id: 'B', text: '报怨以德，根本上消除怨恨' },
      { id: 'C', text: '多给钱' },
      { id: 'D', text: '把怨恨藏起来' }
    ],
    correctAnswer: 'B',
    explanation: '调和大怨恨，必然还会留下残余的积怨。只有像圣人一样执左契而不责于人（施恩不望报），才能真正无怨。'
  },
  80: {
    question: '"小国寡民" 是老子理想的？',
    options: [
      { id: 'A', text: '落后社会' },
      { id: 'B', text: '理想社会模式' },
      { id: 'C', text: '军事策略' },
      { id: 'D', text: '外交政策' }
    ],
    correctAnswer: 'B',
    explanation: '这是老子描绘的理想社会：国家小，人口少，百姓安居乐业，不相往来，没有战争和纷争。'
  },
  81: {
    question: '"信言不美，美言不信" 告诉我们？',
    options: [
      { id: 'A', text: '好听的话不可信，真实的话不好听' },
      { id: 'B', text: '说话要漂亮' },
      { id: 'C', text: '相信美女' },
      { id: 'D', text: '不要说话' }
    ],
    correctAnswer: 'A',
    explanation: '真实的言辞往往不华美，华美的言辞往往不真实。这是全书的总结性教诲。'
  }
}

// 当前选择的学习路径
let currentPath = null

// 缓存DOM元素
let pathDetailsEl
let currentPathNameEl
let currentPathDescEl
let progressPercentEl
let completedLessonsEl
let totalLessonsEl
let progressCircleEl
let lessonListEl

// 选择学习路径
function selectPath (pathType) {
  currentPath = learningPaths[pathType]

  // 初始化DOM元素引用（如果尚未初始化）
  if (!pathDetailsEl) {
    pathDetailsEl = document.getElementById('pathDetails')
    currentPathNameEl = document.getElementById('currentPathName')
    currentPathDescEl = document.getElementById('currentPathDesc')
    progressPercentEl = document.getElementById('progressPercent')
    completedLessonsEl = document.getElementById('completedLessons')
    totalLessonsEl = document.getElementById('totalLessons')
    progressCircleEl = document.getElementById('progressCircle')
    lessonListEl = document.getElementById('lessonList')
  }

  // 使用requestAnimationFrame优化动画
  requestAnimationFrame(() => {
    updatePathDetails()
    pathDetailsEl.style.display = 'block'

    // 优化滚动动画 - 使用更轻量的方式
    setTimeout(() => {
      pathDetailsEl.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }, 50)
  })
}

// 更新路径详情 - 优化性能
function updatePathDetails () {
  if (!currentPath) return

  // 批量更新文本内容
  currentPathNameEl.textContent = currentPath.name
  currentPathDescEl.textContent = currentPath.description
  progressPercentEl.textContent = currentPath.progress + '%'
  completedLessonsEl.textContent = currentPath.completedLessons
  totalLessonsEl.textContent = currentPath.totalLessons

  // 更新进度环
  const circumference = 2 * Math.PI * 26
  const offset = circumference - (currentPath.progress / 100) * circumference
  progressCircleEl.style.strokeDashoffset = offset

  // 优化课程列表生成 - 使用文档片段减少DOM操作
  const fragment = document.createDocumentFragment()

  currentPath.lessons.forEach(lesson => {
    const lessonItem = document.createElement('div')
    lessonItem.className = 'lesson-item p-4 rounded-lg border'
    lessonItem.dataset.lessonId = lesson.id

    if (lesson.completed) {
      lessonItem.className += ' lesson-completed'
    } else if (lesson.current) {
      lessonItem.className += ' lesson-current'
    }

    let difficultyClass = ''
    let difficultyText = ''

    if (lesson.difficulty === 'easy') {
      difficultyClass = 'difficulty-easy'
      difficultyText = '初级'
    } else if (lesson.difficulty === 'medium') {
      difficultyClass = 'difficulty-medium'
      difficultyText = '中级'
    } else if (lesson.difficulty === 'hard') {
      difficultyClass = 'difficulty-hard'
      difficultyText = '高级'
    }

    lessonItem.innerHTML = `
            <div class="flex flex-col md:flex-row md:items-center md:justify-between">
                <div class="flex items-center mb-3 md:mb-0">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                        lesson.completed
? 'bg-green-100 text-green-600'
                        : lesson.current ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'
                    }">
                        ${lesson.completed ? '<i class="fas fa-check"></i>' : lesson.id}
                    </div>
                    <div>
                        <h4 class="font-medium text-dark">${lesson.title}</h4>
                        <div class="flex items-center mt-1">
                            <span class="badge ${difficultyClass} mr-2">${difficultyText}</span>
                            <span class="text-sm text-gray-600"><i class="far fa-clock mr-1"></i>${lesson.duration}</span>
                        </div>
                    </div>
                </div>
                <div>
                    ${lesson.completed
                        ? '<button class="btn btn-outline btn-sm">复习</button>'
                        : lesson.current
                        ? '<button class="btn btn-primary btn-sm">继续学习</button>'
                        : '<button class="btn btn-outline btn-sm" disabled>未解锁</button>'
                    }
                </div>
            </div>
        `

    fragment.appendChild(lessonItem)
  })

  // 清空并一次性添加所有元素
  lessonListEl.innerHTML = ''
  lessonListEl.appendChild(fragment)
}

// 初始化认证模态框 - 优化性能
function initLocalAuthModal () {
  const authModal = document.getElementById('authModal')
  const closeModal = document.getElementById('closeModal')

  // 统一的事件处理函数
  function handleAuthModal (e) {
    const target = e.target

    if (target.id === 'loginBtnNav' || target.id === 'loginBtnMobile' ||
            target.id === 'registerBtnNav' || target.id === 'registerBtnMobile') {
      // 打开模态框
      authModal.classList.remove('hidden')
    } else if (target === closeModal || target === authModal) {
      // 关闭模态框
      authModal.classList.add('hidden')
    }
  }

  // 使用事件委托减少监听器数量
  document.addEventListener('click', handleAuthModal)
}

// 初始化继续学习功能
function initContinueLearning () {
  // 使用事件委托监听继续学习按钮点击
  document.addEventListener('click', function (e) {
    // 处理继续学习按钮
    if (e.target.textContent === '继续学习' && e.target.classList.contains('btn-primary')) {
      // 获取当前课程信息
      const lessonItem = e.target.closest('.lesson-item')
      const lessonTitle = lessonItem.querySelector('h4').textContent
      const lessonId = lessonItem.dataset.lessonId

      // 显示学习题目模态框
      showLearningQuestion(lessonId, lessonTitle)
    }

    // 处理复习按钮
    if (e.target.textContent === '复习' && (e.target.classList.contains('btn-outline') || e.target.classList.contains('btn-sm'))) {
      // 获取当前课程信息
      const lessonItem = e.target.closest('.lesson-item')
      const lessonTitle = lessonItem.querySelector('h4').textContent
      const lessonId = lessonItem.dataset.lessonId

      // 显示学习题目模态框，但标记为复习模式
      showLearningQuestion(lessonId, lessonTitle, true)
    }
  })
}

// 显示学习题目
function showLearningQuestion (lessonId, lessonTitle, isReview = false) {
  const questionData = lessonQuestions[lessonId]

  if (!questionData) {
    // 如果没有找到对应ID的题目，尝试使用默认题目或提示
    console.warn('未找到课程ID ' + lessonId + ' 的题目')
    alert('该课程暂无题目')
    return
  }

  // 创建题目模态框
  const modal = document.createElement('div')
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center'

  // 生成选项HTML
  const optionsHtml = questionData.options.map(option => `
        <div class="flex items-center cursor-pointer p-2 hover:bg-gray-50 rounded" onclick="document.getElementById('option${option.id}').checked = true">
            <input type="radio" id="option${option.id}" name="answer" value="${option.id}" class="mr-3">
            <label for="option${option.id}" class="text-gray-700 cursor-pointer flex-1 pointer-events-none">${option.id}. ${option.text}</label>
        </div>
    `).join('')

  const titlePrefix = isReview ? '复习：' : ''

  modal.innerHTML = `
        <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative shadow-xl">
            <button class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 close-question-btn">
                <i class="fas fa-times"></i>
            </button>
            
            <div class="mb-2">
                <h2 class="text-xl font-bold text-primary mb-2">${titlePrefix}${lessonTitle}</h2>
                <div class="w-full h-1 bg-gray-100 rounded mb-4"></div>
                <p class="text-lg font-medium text-dark mb-4">请回答以下问题：</p>
                
                <div class="mb-6">
                    <p class="text-dark mb-4 font-medium bg-gray-50 p-3 rounded border-l-4 border-accent">
                        ${questionData.question}
                    </p>
                    
                    <div class="space-y-2">
                        ${optionsHtml}
                    </div>
                </div>
                
                <div class="flex space-x-4">
                    <button class="btn btn-primary flex-1 check-answer hover:bg-opacity-90 transition-colors">检查答案</button>
                    <button class="btn btn-secondary flex-1 close-question-btn">跳过</button>
                </div>
            </div>
        </div>
    `

  document.body.appendChild(modal)
  document.body.style.overflow = 'hidden'

  // 添加事件监听器 - 关闭按钮
  const closeBtns = modal.querySelectorAll('.close-question-btn')
  closeBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      document.body.removeChild(modal)
      document.body.style.overflow = ''
    })
  })

  // 检查答案按钮
  modal.querySelector('.check-answer').addEventListener('click', function () {
    const selectedOption = modal.querySelector('input[name="answer"]:checked')
    if (selectedOption) {
      const answerId = selectedOption.value
      let feedback = ''
      let isCorrect = false

      if (answerId === questionData.correctAnswer) {
        feedback = '恭喜你，回答正确！\n\n' + questionData.explanation
        isCorrect = true
      } else {
        const correctOption = questionData.options.find(o => o.id === questionData.correctAnswer)
        feedback = '回答错误。\n\n正确答案是：' + questionData.correctAnswer + '. ' + correctOption.text + '\n\n解析：' + questionData.explanation
      }

      // 显示反馈 - 可以优化为模态框内的显示而不是alert
      alert(feedback)

      if (isCorrect) {
        document.body.removeChild(modal)
        document.body.style.overflow = ''

        // 只有非复习模式下才标记完成
        if (!isReview) {
          // 标记当前课程为完成，并解锁下一课
          markLessonAsCompleted(lessonId)
        }
      }
    } else {
      alert('请选择一个答案')
    }
  })
}

// 标记课程完成
function markLessonAsCompleted (lessonId) {
  // 这里只是简单的前端状态更新，实际应该调用API保存进度
  if (currentPath && currentPath.lessons) {
    const lessonIndex = currentPath.lessons.findIndex(l => l.id == lessonId)
    if (lessonIndex !== -1) {
      // 更新当前课程状态
      currentPath.lessons[lessonIndex].completed = true
      currentPath.lessons[lessonIndex].current = false

      // 更新进度
      currentPath.completedLessons++
      currentPath.progress = Math.round((currentPath.completedLessons / currentPath.totalLessons) * 100)

      // 解锁下一课
      if (lessonIndex + 1 < currentPath.lessons.length) {
        currentPath.lessons[lessonIndex + 1].current = true
      }

      // 更新UI
      updatePathDetails()

      // 更新成就状态
      updateAchievements()
    }
  }
}

// 更新成就状态
function updateAchievements () {
  // 计算所有已完成的课程总数（跨路径累加）
  let totalCompleted = 0

  // 遍历所有路径
  Object.values(learningPaths).forEach(path => {
    if (path.lessons) {
      path.lessons.forEach(lesson => {
        if (lesson.completed) {
          totalCompleted++
        }
      })
    }
  })

  // 更新成就UI辅助函数
  function updateAchievementUI (elementId, isUnlocked, bgClass, textClass, iconClass) {
    const element = document.getElementById(elementId)
    if (!element) return

    const container = element.querySelector('.icon-container')
    const icon = element.querySelector('.icon')

    if (isUnlocked) {
      container.className = `w-20 h-20 mx-auto mb-3 rounded-full ${bgClass} flex items-center justify-center icon-container transition-colors duration-300`
      icon.className = `${iconClass} text-3xl ${textClass} icon transition-colors duration-300`
    } else {
      container.className = 'w-20 h-20 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center icon-container transition-colors duration-300'
      icon.className = `${iconClass} text-3xl text-gray-400 icon transition-colors duration-300`
    }
  }

  // 初学者：完成1章
  updateAchievementUI('achieve-beginner', totalCompleted >= 1, 'bg-yellow-100', 'text-yellow-600', 'fas fa-trophy')

  // 思考者：完成10章
  updateAchievementUI('achieve-thinker', totalCompleted >= 10, 'bg-blue-100', 'text-blue-500', 'fas fa-medal')

  // 智者：完成40章
  updateAchievementUI('achieve-sage', totalCompleted >= 40, 'bg-purple-100', 'text-purple-500', 'fas fa-crown')

  // 大师：完成81章
  updateAchievementUI('achieve-master', totalCompleted >= 81, 'bg-red-100', 'text-red-500', 'fas fa-star')
}

// 页面加载完成后初始化 - 优化性能
document.addEventListener('DOMContentLoaded', function () {
  // 缓存DOM元素引用
  pathDetailsEl = document.getElementById('pathDetails')
  currentPathNameEl = document.getElementById('currentPathName')
  currentPathDescEl = document.getElementById('currentPathDesc')
  progressPercentEl = document.getElementById('progressPercent')
  completedLessonsEl = document.getElementById('completedLessons')
  totalLessonsEl = document.getElementById('totalLessons')
  progressCircleEl = document.getElementById('progressCircle')
  lessonListEl = document.getElementById('lessonList')

  // 使用requestIdleCallback延迟非关键初始化
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(() => {
      // 初始化导航栏
      if (typeof initNavigation === 'function') {
        initNavigation()
      }

      // 初始化认证模态框
      initLocalAuthModal()

      // 初始化通用认证（同步导航栏状态）
      if (typeof initCommonAuth === 'function') {
        initCommonAuth()
      }

      // 初始化滚动效果
      if (typeof initScrollEffects === 'function') {
        initScrollEffects()
      }

      // 初始化继续学习功能
      initContinueLearning()

      // 初始化成就状态
      updateAchievements()
    })
  } else {
    // 降级方案：使用setTimeout延迟执行
    setTimeout(() => {
      if (typeof initNavigation === 'function') {
        initNavigation()
      }
      initLocalAuthModal()
      if (typeof initCommonAuth === 'function') {
        initCommonAuth()
      }
      if (typeof initScrollEffects === 'function') {
        initScrollEffects()
      }
      // 初始化成就状态
      updateAchievements()
    }, 0)
  }

  // 性能优化：延迟加载非关键CSS资源
  setTimeout(function () {
    // 确保学习路径CSS已加载
    const learningPathCSS = document.querySelector('link[href="css/learning-path.css"]')
    if (learningPathCSS && !learningPathCSS.sheet) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'css/learning-path.css'
      document.head.appendChild(link)
    }
  }, 200)
})

// 性能监控和优化
window.addEventListener('load', function () {
  // 记录页面加载时间
  if (window.performance) {
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart
    console.log('页面加载时间：' + loadTime + 'ms')

    // 如果加载时间过长，提供优化建议
    if (loadTime > 3000) {
      console.warn('页面加载较慢，建议进一步优化资源加载策略')
    }
  }

  // 移除加载动画或显示页面内容
  setTimeout(() => {
    document.body.classList.remove('loading')
  }, 100)
})
