const mysql = require('mysql2/promise')
const { randomUUID } = require('crypto')
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })

function getDbConfig() {
  return {
    host: process.env.MYSQL_HOST || process.env.VITE_MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT || process.env.VITE_MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || process.env.VITE_MYSQL_USER || 'daodejing',
    password: process.env.MYSQL_PASSWORD || process.env.VITE_MYSQL_PASSWORD || 'password',
    database: process.env.MYSQL_DATABASE || process.env.VITE_MYSQL_DATABASE || 'daodejing_platform'
  }
}

// 根据 resourceType + era 决定分类
function getCategorySlug(resourceType, era) {
  if (resourceType === 'audio') return 'audio'
  if (resourceType === 'video') return 'learning'
  if (resourceType === 'link') return 'learning'
  // pdf, book, article: 汉代及以前的 → dao-texts; 其余 → learning
  const ancientEras = ['春秋战国', '汉代', '魏晋南北朝', '唐宋', '明清']
  if (ancientEras.includes(era)) return 'dao-texts'
  if (resourceType === 'book' && era === '现代') {
    // 现代学术专著仍归 经典原文
    return 'dao-texts'
  }
  return 'learning'
}

// 前端 35 条 mock 数据全部入库
const resources = [
  // ============================================================
  // 1-6: PDF / 图书类学术资源
  // ============================================================
  {
    title: '道德经王弼注本',
    summary: '魏晋玄学代表人物王弼的经典注本，不仅是研究老子思想的重要资料，也是魏晋玄学的奠基之作。',
    content: '王弼（226-249）以"无"为本体，主张"崇本息末"。此注本逐章训释，以"道"为"无"，以"德"为"有"，构建了完整的玄学解老体系，是两千年来的权威注释本之一。',
    resourceType: 'pdf', era: '魏晋南北朝', author: '王弼',
    tags: ['注本', '王弼', '玄学', '魏晋'],
    viewCount: 12345, downloadCount: 1234, status: 'published'
  },
  {
    title: '河上公章句',
    summary: '汉代河上公所作注本，侧重于养生与治国，对后世道教影响深远。',
    content: '河上公注本为现存最早的道德经完整注本之一。以"气"释"道"，将老子哲学与养生术结合，每章标题概括主旨。对东汉黄老道和后世道教内丹学影响极大。',
    resourceType: 'pdf', era: '汉代', author: '河上公',
    tags: ['注本', '河上公', '养生', '汉代'],
    viewCount: 2890, downloadCount: 567, status: 'published'
  },
  {
    title: '马王堆帛书《老子》甲乙本',
    summary: '1973年出土的马王堆帛书老子甲乙本，汉代抄本的重要发现。',
    content: '1973年长沙马王堆三号汉墓出土的两份帛书《老子》抄本，甲本抄于汉高祖时期（约前200年），乙本抄于汉文帝时期。德经在前、道经在后，与传世本王弼本存在大量异文。',
    resourceType: 'pdf', era: '汉代', author: '老子',
    tags: ['帛书', '马王堆', '考古', '校勘'],
    viewCount: 3456, downloadCount: 678, status: 'published'
  },
  {
    title: '成玄英《道德经义疏》',
    summary: '唐代道士成玄英对道德经的义疏，融合道教思想的深度阐释。',
    content: '成玄英（约601-690）为唐初道教重玄学派代表人物。此《义疏》援引佛教中观学和庄子哲学解老，以"重玄"双遣法破"有""无"之执，开出道家注疏的新境界。',
    resourceType: 'pdf', era: '唐宋', author: '成玄英',
    tags: ['注本', '成玄英', '重玄', '唐代'],
    viewCount: 1078, downloadCount: 345, status: 'published'
  },
  {
    title: '严复《老子道德经评注》',
    summary: '近代思想家严复对道德经的评注，结合西方哲学思想的独特解读。',
    content: '严复（1854-1921）以留学英国的社会进化论视野点评老子，将"道"与斯宾塞的"不可知之物"、赫胥黎的"宇宙过程"相参比，是中国近代中西哲学比较的先驱之作。',
    resourceType: 'pdf', era: '现代', author: '严复',
    tags: ['注本', '严复', '中西比较', '近代'],
    viewCount: 1234, downloadCount: 345, status: 'published'
  },
  {
    title: '李零《道德经古本疏证》',
    summary: '北京大学李零教授对道德经古本的考证和疏证，学术研究价值高。',
    content: '李零（1948-）以出土文献与传世文献互证的方法，系统梳理了郭店楚简、马王堆帛书与王弼本的关系，提出"老子非一人一时之作"的层累说，是当代老学研究的重要成果。',
    resourceType: 'pdf', era: '现代', author: '李零',
    tags: ['注本', '李零', '古本', '考证'],
    viewCount: 1456, downloadCount: 456, status: 'published'
  },

  // ============================================================
  // 7-12: 视频讲学类
  // ============================================================
  {
    title: '曾仕强详解道德经',
    summary: '曾仕强教授通过通俗易懂的语言，结合现代生活实例，深入浅出地讲解道德经的智慧。',
    content: '曾仕强（1935-2018）以"中国式管理"闻名。此系列视频以生活化的语言和生动的案例，将老子智慧与现代职场、家庭、人际关系的实际场景结合，适合零基础入门。共81集。',
    resourceType: 'video', era: '现代', author: '曾仕强',
    tags: ['视频', '曾仕强', '通俗', '入门'],
    viewCount: 8567, downloadCount: 2345, status: 'published'
  },
  {
    title: '南怀瑾讲道德经',
    summary: '南怀瑾先生对道德经的深入解读，结合人生智慧与实践应用。',
    content: '南怀瑾（1918-2012）以融通儒释道三家的深厚学养，从"内修外用"两个维度解读老子。此讲座不重字句考据，而重生命体悟，对当代人安顿身心颇具启发。',
    resourceType: 'video', era: '现代', author: '南怀瑾',
    tags: ['视频', '南怀瑾', '生命智慧', '儒释道'],
    viewCount: 2456, downloadCount: 890, status: 'published'
  },
  {
    title: '傅佩荣详解道德经',
    summary: '台湾大学傅佩荣教授对道德经的详细讲解，结合中西哲学比较。',
    content: '傅佩荣（1950-）以严格的概念分析和西方哲学训练为底子，逐章解释老子原文，注重逻辑结构和概念定义。适合希望以西方哲学方法论理解老子思想的读者。共81讲。',
    resourceType: 'video', era: '现代', author: '傅佩荣',
    tags: ['视频', '傅佩荣', '中西比较', '学院派'],
    viewCount: 2034, downloadCount: 789, status: 'published'
  },
  {
    title: '楼宇烈教授讲道德经',
    summary: '北京大学楼宇烈教授对道德经的深度解读，结合传统文化。',
    content: '楼宇烈（1934-）主张以中国文化自身的思维方式理解老子，反对以西释中。此讲座强调"得意忘言"，从整体性、有机性的中国思维传统出发体悟老子的智慧。',
    resourceType: 'video', era: '现代', author: '楼宇烈',
    tags: ['视频', '楼宇烈', '传统文化', '北大'],
    viewCount: 1789, downloadCount: 678, status: 'published'
  },
  {
    title: '钱穆道德经专题讲座',
    summary: '国学大师钱穆对道德经的专题讲座，从历史角度深入分析。',
    content: '钱穆（1895-1990）从中国思想史的宏观视野出发，将老子置于春秋战国时代的思想脉络中，比较分析老子与孔子、墨子、庄子之异同，还原老子思想的时代语境。',
    resourceType: 'video', era: '现代', author: '钱穆',
    tags: ['视频', '钱穆', '思想史', '国学'],
    viewCount: 1567, downloadCount: 567, status: 'published'
  },
  {
    title: '牟宗三道德经哲学讲座',
    summary: '新儒家代表人物牟宗三对道德经哲学体系的深度分析。',
    content: '牟宗三（1909-1995）以康德哲学为参照框架，将老子"道"论置于其"圆教"体系中考察。此讲座辨析了道家"无"的哲学与佛教"空"的异同，是20世纪最具哲学深度的老学讲论之一。',
    resourceType: 'video', era: '现代', author: '牟宗三',
    tags: ['视频', '牟宗三', '新儒家', '哲学'],
    viewCount: 1432, downloadCount: 456, status: 'published'
  },

  // ============================================================
  // 13-18: 音频类
  // ============================================================
  {
    title: '道德经诵读（配乐版）',
    summary: '专业配音员朗读，配以古琴背景音乐，适合静心聆听和冥想。',
    content: '全长约4小时，八十一章完整诵读。男声标准普通话，背景音乐为古琴曲《流水》《平沙落雁》等。录音棚级别音质，MP3 320kbps。适合每日聆听一章，或作为冥想背景音。',
    resourceType: 'audio', era: '现代', author: '佚名',
    tags: ['音频', '诵读', '配乐', '古琴'],
    viewCount: 5234, downloadCount: 1234, status: 'published'
  },
  {
    title: '道德经全文诵读（古音版）',
    summary: '道德经全文古音诵读，还原春秋战国时期的语言韵律。',
    content: '语言学家依据上古音韵研究拟构的春秋时期汉语发音诵读。虽为学术拟音，但韵律感极强，能让听者感受两千年前的语言魅力。全长约5小时。',
    resourceType: 'audio', era: '现代', author: '老子',
    tags: ['音频', '诵读', '古音', '韵文'],
    viewCount: 3456, downloadCount: 890, status: 'published'
  },
  {
    title: '徐梵澄道德经心解',
    summary: '现代学者徐梵澄对道德经的心灵层面解读，融合东西方思想。',
    content: '徐梵澄（1909-2000）旅居印度三十年，深研印度哲学。此音频从精神修炼的角度解读老子，认为"道"的体证类似瑜伽的"三摩地"境界，是东西方心灵哲学比较的力作。共30讲。',
    resourceType: 'audio', era: '现代', author: '徐梵澄',
    tags: ['音频', '徐梵澄', '心灵', '东西比较'],
    viewCount: 1654, downloadCount: 567, status: 'published'
  },
  {
    title: '叶海烟道德经现代解读',
    summary: '台湾学者叶海烟对道德经的现代化解读，结合当代思潮。',
    content: '叶海烟（1951-）以存在主义和后现代哲学为参照，将老子智慧与当代人的焦虑、虚无、消费主义等话题连接。此音频课程风格轻松，适合通勤聆听。共24讲。',
    resourceType: 'audio', era: '现代', author: '叶海烟',
    tags: ['音频', '叶海烟', '存在主义', '当代'],
    viewCount: 1234, downloadCount: 456, status: 'published'
  },
  {
    title: '林语堂道德经英文解读',
    summary: '林语堂对道德经的英文解读音频，面向国际读者的独特视角。',
    content: '林语堂（1895-1976）以英文母语者的思维模式重新诠释老子，用流畅的英文将"道"的智慧讲给西方读者。他认为老子是中国最具世界意义的哲学家。共12讲。',
    resourceType: 'audio', era: '现代', author: '林语堂',
    tags: ['音频', '林语堂', '英文', '国际'],
    viewCount: 1089, downloadCount: 345, status: 'published'
  },
  {
    title: '翟鸿燊道德经智慧应用',
    summary: '翟鸿燊教授将道德经智慧应用于现代生活和管理的音频课程。',
    content: '翟鸿燊（1940-）以"国学应用"为特色，将老子智慧与现代企业管理、人际沟通、家庭关系等场景紧密结合。风格接地气，注重实操。共36讲。',
    resourceType: 'audio', era: '现代', author: '翟鸿燊',
    tags: ['音频', '翟鸿燊', '应用', '管理'],
    viewCount: 2345, downloadCount: 678, status: 'published'
  },

  // ============================================================
  // 19-28: 图书/文章类学术资源
  // ============================================================
  {
    title: '老子通释',
    summary: '全面解析老子思想体系，对比各版本差异，适合学术研究参考。',
    content: '陈鼓应（1935-）以六十余年老学研究功力汇成此著。逐章对比帛书本、楚简本与王弼本，引用历代重要注家的观点，每章附白话翻译和深度解析。是当代老学研究的集大成之作。',
    resourceType: 'book', era: '现代', author: '陈鼓应',
    tags: ['图书', '陈鼓应', '通释', '集大成'],
    viewCount: 3456, downloadCount: 890, status: 'published'
  },
  {
    title: '帛书老子校注',
    summary: '基于马王堆汉墓出土的帛书《老子》进行的校勘和注释，还原更古老的面貌。',
    content: '高明（1930-）以帛书甲乙本为底本，参校郭店楚简、王弼本等十余种版本，逐字校勘异文。每处校改均附详细理由，是帛书老子研究的必备参考书。',
    resourceType: 'book', era: '现代', author: '高明',
    tags: ['图书', '高明', '校注', '帛书'],
    viewCount: 1987, downloadCount: 567, status: 'published'
  },
  {
    title: '朱熹《道德经集注》',
    summary: '宋代朱熹对道德经的集注，融合儒家思想的深度解读。',
    content: '朱熹（1130-1200）虽以理学名世，其对老子的注解却较少为人注意。此《集注》援引程颢、程颐等北宋理学家的观点，以"理"释"道"，开儒家注老的新路径。',
    resourceType: 'book', era: '唐宋', author: '朱熹',
    tags: ['图书', '朱熹', '理学', '宋代'],
    viewCount: 987, downloadCount: 345, status: 'published'
  },
  {
    title: '王夫之《老子衍》',
    summary: '明末清初王夫之对道德经的阐释，结合时代背景的深刻分析。',
    content: '王夫之（1619-1692）以"六经责我开生面"的气魄注解老子，反对佛老虚无之说，将老子重新纳入儒家"经世致用"的框架。其"物物者非物"之论是对"道器"关系的经典阐发。',
    resourceType: 'book', era: '明清', author: '王夫之',
    tags: ['图书', '王夫之', '船山', '明清'],
    viewCount: 876, downloadCount: 234, status: 'published'
  },
  {
    title: '王德有《道德经新译》',
    summary: '中国社科院王德有研究员对道德经的新翻译和阐释。',
    content: '王德有以现代汉语重新翻译《道德经》，在忠于原文的基础上力求白话流畅。每章附"导读提示"和"延伸思考"两大板块，既适合初学者也适合进阶研读。',
    resourceType: 'book', era: '现代', author: '王德有',
    tags: ['图书', '王德有', '新译', '注释'],
    viewCount: 987, downloadCount: 345, status: 'published'
  },
  {
    title: '冯友兰《中国哲学史》中的道德经解读',
    summary: '著名哲学家冯友兰对道德经在哲学史中的地位和影响的分析。',
    content: '冯友兰（1895-1990）在《中国哲学史》中将老子定位为"中国哲学之父"，以西方哲学范畴（本体论、认识论、政治哲学）系统分析老子思想，影响了整个20世纪的老学研究范式。',
    resourceType: 'book', era: '现代', author: '冯友兰',
    tags: ['图书', '冯友兰', '哲学史', '学术'],
    viewCount: 1543, downloadCount: 456, status: 'published'
  },
  {
    title: '胡适《中国哲学史大纲》道德经部分',
    summary: '胡适对道德经在中国哲学史中地位的经典论述。',
    content: '胡适（1891-1962）以考据学和实用主义哲学的方法重新审视老子时代问题，质疑"孔子问礼于老子"的传统说法，引发了近代以来最激烈的老学方法论争论。',
    resourceType: 'book', era: '现代', author: '胡适',
    tags: ['图书', '胡适', '哲学史', '考据'],
    viewCount: 876, downloadCount: 234, status: 'published'
  },
  {
    title: '任继愈《老子新译》',
    summary: '著名哲学家任继愈对道德经的新译和注释，学术价值极高。',
    content: '任继愈（1916-2009）以马克思主义唯物论立场解读老子，但其深厚的文献功底使得注释精当翔实，是新中国老学研究的奠基性著作之一。',
    resourceType: 'book', era: '现代', author: '任继愈',
    tags: ['图书', '任继愈', '新译', '唯物论'],
    viewCount: 1567, downloadCount: 456, status: 'published'
  },
  {
    title: '张岱年《中国哲学大纲》道德经部分',
    summary: '张岱年先生对道德经在中国哲学体系中地位的经典论述。',
    content: '张岱年（1909-2004）以"范畴史"方法梳理中国哲学的核心概念。在《中国哲学大纲》中，他系统辨析了老子"道""德""自然""无为"等概念的哲学内涵及历史流变。',
    resourceType: 'book', era: '现代', author: '张岱年',
    tags: ['图书', '张岱年', '范畴', '哲学'],
    viewCount: 1234, downloadCount: 345, status: 'published'
  },
  {
    title: '道德经心理学解读',
    summary: '从心理学角度解读道德经，探讨道家思想对心理健康的启示。',
    content: '此书从荣格分析心理学和积极心理学的双重视角解读老子，提出"道"是集体无意识的本源意象，"无为"与"正念"具有深层的心理同构性。是跨学科老学研究的新尝试。',
    resourceType: 'book', era: '现代', author: '心理学',
    tags: ['图书', '心理学', '荣格', '跨学科'],
    viewCount: 1234, downloadCount: 345, status: 'published'
  },

  // ============================================================
  // 29-35: 链接/专题/特殊资源
  // ============================================================
  {
    title: '冯友兰《中国哲学史》中的道德经解读',
    summary: '著名哲学家冯友兰对道德经在哲学史中的地位和影响的分析。',
    content: '链接至冯友兰《中国哲学史》在线版中关于老子和道德经的章节，包含原文阅读和学术引用功能。',
    resourceType: 'link', era: '现代', author: '冯友兰',
    tags: ['链接', '冯友兰', '哲学史', '在线'],
    viewCount: 1543, downloadCount: 456, status: 'published'
  },
  {
    title: '张松辉道德经研究专题',
    summary: '湖南大学张松辉教授对道德经的研究专题，包含多篇学术论文。',
    content: '张松辉（1949-）长期从事老庄研究。此专题网站汇集其三十余年来发表的老学研究论文，涵盖文本考证、思想分析、比较研究等多个维度。',
    resourceType: 'link', era: '现代', author: '张松辉',
    tags: ['链接', '张松辉', '论文', '专题'],
    viewCount: 1345, downloadCount: 234, status: 'published'
  },
  {
    title: '道德经多语言译本数据库',
    summary: '汇集道德经英、法、德、日等多语言译本的在线数据库。',
    content: '该数据库收录了道德经60余种语言的500多种译本，可按译者、年代、语言分类浏览，每本附简要评介和原文对比功能。是跨文化老学研究的珍贵工具。',
    resourceType: 'link', era: '现代', author: '国际翻译',
    tags: ['链接', '多语言', '翻译', '数据库'],
    viewCount: 3456, downloadCount: 234, status: 'published'
  },
  {
    title: '道德经在线学习社区',
    summary: '道德经爱好者交流平台，分享学习心得和研究成果。',
    content: '汇聚全球道德经爱好者的在线社区。设有每日打卡抄经、章节讨论区、学习笔记分享、线上读书会等功能。已有超过50万注册会员，是最大的中文经典学习社区之一。',
    resourceType: 'link', era: '现代', author: '学习社区',
    tags: ['链接', '社区', '学习', '互动'],
    viewCount: 2890, downloadCount: 234, status: 'published'
  },
  {
    title: '道德经与中医养生智慧',
    summary: '探讨道德经养生思想与中医理论的结合，提供健康生活指导。',
    content: '深入分析道德经"长生久视"之道与《黄帝内经》养生理论的关联。涵盖：饮食有节（"五味令人口爽"）、起居有常（"归根曰静"）、形神共养（"载营魄抱一"）三大板块。',
    resourceType: 'article', era: '现代', author: '中医养生',
    tags: ['文章', '中医', '养生', '健康'],
    viewCount: 2123, downloadCount: 567, status: 'published'
  },
  {
    title: '道德经领导力智慧讲座',
    summary: '从道德经角度探讨现代领导力，无为而治的管理智慧。',
    content: '聚焦"太上，下知有之"的管理境界，以"治大国若烹小鲜"为核心理念，分析老子思想在当代组织管理中的应用：授权、容错、静观、顺势。',
    resourceType: 'video', era: '现代', author: '刘笑敢',
    tags: ['视频', '领导力', '管理', '现代应用'],
    viewCount: 1890, downloadCount: 567, status: 'published'
  },
  {
    title: '道德经家庭教育智慧',
    summary: '将道德经智慧应用于现代家庭教育，培养孩子自然成长。',
    content: '"行不言之教"——以老子的教育哲学为纲，探讨如何尊重孩子的天性、避免过度干预、用"生而不有"的态度陪伴成长。结合当代儿童心理学的研究成果。共18讲音频。',
    resourceType: 'audio', era: '现代', author: '家庭教育',
    tags: ['音频', '家庭教育', '亲子', '成长'],
    viewCount: 1567, downloadCount: 567, status: 'published'
  }
]

async function main() {
  const conn = await mysql.createConnection(getDbConfig())

  // 获取分类映射
  const [cats] = await conn.query('SELECT id, slug FROM resource_categories')
  const catMap = {}
  cats.forEach(c => { catMap[c.slug] = c.id })

  // 清空旧资源（保留 categories 不变）
  await conn.query('DELETE FROM resources')
  console.log('已清空旧资源')

  let inserted = 0
  for (const r of resources) {
    const categorySlug = getCategorySlug(r.resourceType, r.era)
    const categoryId = catMap[categorySlug]
    if (!categoryId) {
      console.error('未找到分类:', categorySlug)
      continue
    }

    const id = randomUUID()
    await conn.execute(
      `INSERT INTO resources
       (id, category_id, title, summary, content, resource_type, era, author, tags, status, sort_order, view_count, download_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, categoryId, r.title, r.summary, r.content, r.resourceType, r.era, r.author,
       JSON.stringify(r.tags), r.status || 'published', 0, r.viewCount || 0, r.downloadCount || 0]
    )
    inserted++
  }

  // 统计输出
  console.log('')
  console.log('=== 资源类型分布 ===')
  const [typeStats] = await conn.query("SELECT resource_type, COUNT(*) as cnt FROM resources GROUP BY resource_type ORDER BY cnt DESC")
  typeStats.forEach(r => console.log(`  ${r.resource_type}: ${r.cnt} 条`))

  console.log('')
  console.log('=== 时代分布 ===')
  const [eraStats] = await conn.query("SELECT era, COUNT(*) as cnt FROM resources GROUP BY era ORDER BY cnt DESC")
  eraStats.forEach(r => console.log(`  ${r.era || '(无)'}: ${r.cnt} 条`))

  console.log('')
  console.log('=== 分类分布 ===')
  const [catStats] = await conn.query(
    "SELECT rc.name, COUNT(r.id) as cnt FROM resource_categories rc LEFT JOIN resources r ON r.category_id = rc.id GROUP BY rc.id, rc.name ORDER BY cnt DESC"
  )
  catStats.forEach(r => console.log(`  ${r.name}: ${r.cnt} 条`))

  const [total] = await conn.query('SELECT COUNT(*) as total FROM resources')
  console.log(`\n总资源数: ${total[0].total} 条`)

  await conn.end()
  console.log('\n种子数据写入完成。')
}

main().catch(error => {
  console.error('种子数据写入失败:', error.message || error)
  process.exit(1)
})
