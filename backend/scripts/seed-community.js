const mysql = require('mysql2/promise')
const bcrypt = require('bcryptjs')
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

const demoUsers = [
  { username: '道学爱好者', email: 'daoxue@example.com', displayName: '道学爱好者', bio: '研读道德经十年，每日抄写一章' },
  { username: '静心居士', email: 'jingxin@example.com', displayName: '静心居士', bio: '以老子的智慧指导生活' },
  { username: '水善若水', email: 'shuixue@example.com', displayName: '水善若水', bio: '上善若水，水善利万物而不争' },
  { username: '无为书生', email: 'wuwei@example.com', displayName: '无为书生', bio: '在读哲学博士，研究方向为道家哲学' },
  { username: '自然之子', email: 'ziran@example.com', displayName: '自然之子', bio: '热爱自然，喜欢在山水间读老子' }
]

const posts = [
  { key: 'p1', title: '读老子第一章有感："道可道，非常道"如何理解？', content: '最近反复诵读第一章，对"道可道，非常道"有了新的体会。第一个"道"是本体，第二个"道"是言说。真正的道是无法用语言穷尽的，但这并不意味着我们不应该去说它——恰恰相反，老子正是通过"非常道"来提示我们超越语言。大家对此有什么不同的理解？', tags: ['第一章', '讨论', '哲学'], userIdx: 3, views: 256 },
  { key: 'p2', title: '分享：三十天抄写道德经的心得体会', content: '坚持每天早上抄写一章道德经，三十天下来，最大的收获不是记住了多少句子，而是心境的改变。以前总觉得"无为"就是什么都不做，现在才明白"无为"其实是"不妄为"。推荐大家都试试抄经，真的很受用。', tags: ['抄经', '心得', '修行'], userIdx: 0, views: 489 },
  { key: 'p3', title: '请教：王弼注本和河上公注本哪个更适合初学者？', content: '刚开始学习道德经，想买一本注本辅助阅读。网上推荐最多的是王弼注本和河上公注本，但不知道哪个更适合入门。王弼偏哲学思辨，河上公偏养生实践，求各位前辈指点！', tags: ['入门', '注本', '求助'], userIdx: 2, views: 312 },
  { key: 'p4', title: '道德经对焦虑的疗愈作用——我的亲身经历', content: '去年因工作压力严重焦虑，偶然接触到道德经。"致虚极，守静笃"这六个字成了我的心理锚点。每当焦虑袭来，我就默念这句话，配合深呼吸。半年下来，焦虑症状大幅减轻。老子的智慧在今天依然有强大的疗愈力量。', tags: ['心理健康', '焦虑', '疗愈'], userIdx: 1, views: 623, status: 'pinned' },
  { key: 'p5', title: '发现了一个有趣的帛书本异文', content: '最近对比马王堆帛书本和王弼本，发现第一章"常无欲以观其妙，常有欲以观其徼"在帛书本中无"以"字，断句也不同。这会不会影响我们对"有欲""无欲"的理解？有没有研究出土文献的朋友一起讨论一下？', tags: ['帛书', '校勘', '学术'], userIdx: 3, views: 198 },
  { key: 'p6', title: '用道德经的智慧教育孩子："行不言之教"', content: '作为一位父亲，我一直在思考如何把老子的智慧用在家庭教育中。"行不言之教"不是说不要说话，而是身教重于言传。当我开始少说多做，孩子反而变得更自律了。', tags: ['家庭', '教育', '应用'], userIdx: 4, views: 445 },
  { key: 'p7', title: '"上善若水"在职场中的实践', content: '我在公司做中层管理多年，最深的体会就是老子说的"上善若水"。水流到哪里都能适应形状，管理者也需要这样的柔性。最近用"不争"原则处理了一次部门冲突，效果出奇地好。', tags: ['职场', '管理', '经验'], userIdx: 2, views: 534 },
  { key: 'p8', title: '推荐一本冷门好书：《老子骑牛出关图》考', content: '这本小书专门研究老子出关这个传说的历史演变，从《史记》到道教造像再到当代影视作品，梳理了"老子出关"形象两千年来的变迁，非常有意思。', tags: ['推荐', '书籍', '文化史'], userIdx: 3, views: 167 },
  { key: 'p9', title: '晨读打卡：今天读到第四十二章', content: '"道生一，一生二，二生三，三生万物。万物负阴而抱阳，冲气以为和。"这句话越读越有味道。宇宙从单一本源（道）分化出阴阳两极，再通过阴阳交合产生万物——两千年后，我们在大爆炸理论和量子场论中看到了类似的图景。', tags: ['打卡', '第四十二章', '阴阳'], userIdx: 0, views: 289 },
  { key: 'p10', title: '我翻译道德经遇到的困难', content: '正在尝试把道德经翻译成英文，最大的挑战不是词汇（虽然"道"确实很难翻），而是思维方式。比如"无为"如果译为 non-action，西方读者会觉得消极；译为 effortless action 似乎好一些，但又丢失了"无"的哲学深度。翻译界的前辈们有什么建议？', tags: ['翻译', '英文', '跨文化'], userIdx: 1, views: 378 },
  { key: 'p11', title: '道家与禅宗的"无为"有什么不同？', content: '最近同时在读道德经和《六祖坛经》，感觉两家都讲"无为"，但侧重点不同。道家偏向"顺自然"，禅宗偏向"破执著"。有没有对两家都有研究的朋友，来聊聊异同？', tags: ['比较', '禅宗', '哲学'], userIdx: 0, views: 412 },
  { key: 'p12', title: '冬至日读老子："万物并作，吾以观复"', content: '冬至是一年中阴气最盛、阳气始生的转折点。今天读第十六章特别有感触——"万物并作，吾以观复"，道的运行就是一个永恒回归的过程。冬至之后，日光渐长，这不就是"反者道之动"的最好例证吗？祝大家冬至安康！', tags: ['节气', '第十六章', '感悟'], userIdx: 4, views: 521 }
]

const comments = [
  { postKey: 'p1', userIdx: 0, text: '说得太好了！"非常道"恰恰是要引导我们超越语言本身的局限。这让我想起维特根斯坦的"对于不可说的东西，我们必须保持沉默"。' },
  { postKey: 'p1', userIdx: 1, text: '我个人觉得第一个"道"和第二个"道"可以理解为本体和作用。道体不可说，但道用可以通过语言指示。' },
  { postKey: 'p4', userIdx: 2, text: '感谢分享！"致虚极，守静笃"也是我最喜欢的一句话。在快节奏的现代社会，能做到这六个字真的不容易。' },
  { postKey: 'p4', userIdx: 4, text: '真为你感到高兴！道德经的智慧就是最好的心理医生。' },
  { postKey: 'p4', userIdx: 3, text: '推荐一本相关的书：《老子与心理治疗》，作者是瑞士心理学家。里面专门讨论了道家思想与现代心理治疗的结合。' },
  { postKey: 'p7', userIdx: 0, text: '"水善利万物而不争"——在职场能做到不争而利他，这才是真正的高手境界。向你学习！' },
  { postKey: 'p7', userIdx: 1, text: '想问一下具体是怎么处理那次部门冲突的？方便分享一下吗？' },
  { postKey: 'p7', userIdx: 2, text: '回复 @静心居士：其实很简单，就是先让双方把意见充分说出来，我不急于做判断。最后大家都冷静下来后，方案自然就浮现了。这就是"静为躁君"吧。' },
  { postKey: 'p2', userIdx: 4, text: '我也坚持抄经两个月了，每天一章，感觉心静了很多。而且意外的是，毛笔字也进步了不少！' },
  { postKey: 'p3', userIdx: 3, text: '建议先读王弼注本，虽然深奥一点，但很体系化。河上公注本偏养生，如果对道教修炼有兴趣可以后来读。另外陈鼓应的《老子今注今译》也很适合入门。' },
  { postKey: 'p10', userIdx: 3, text: '我在翻译时也觉得"道"直接用 Tao 最好，毕竟这个词已经进入英文词典了。关键是后面的解说要到位。' },
  { postKey: 'p5', userIdx: 0, text: '帛书本确实重要！刘笑敢教授有一篇论文专门讨论这个断句问题，结论是帛书本的断句更合理。建议找来看看。' },
  { postKey: 'p12', userIdx: 1, text: '冬至一阳生，正是养生的好时节。祝大家身体健康，道心日增！' },
  { postKey: 'p9', userIdx: 1, text: '"冲气以为和"——这个"和"字太精妙了！阴阳不是对立而是和谐，这是道家最伟大的洞见之一。' },
  { postKey: 'p6', userIdx: 0, text: '"行不言之教"用在教育上太对了。孩子看到父母怎么做，比听到父母怎么说要重要得多。' }
]

async function main() {
  const conn = await mysql.createConnection(getDbConfig())

  // 1. 创建演示用户
  const userIds = []
  for (const u of demoUsers) {
    const [existing] = await conn.query('SELECT id FROM users WHERE username = ? LIMIT 1', [u.username])
    if (existing.length > 0) {
      userIds.push(existing[0].id)
      console.log('跳过（已存在）:', u.username)
      continue
    }
    const hash = await bcrypt.hash('password123', 10)
    const id = randomUUID()
    await conn.execute(
      'INSERT INTO users (id, username, email, password_hash, plain_password, display_name, bio) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, u.username, u.email, hash, 'password123', u.displayName, u.bio]
    )
    userIds.push(id)
    console.log('用户:', u.username)
  }

  // 2. 创建帖子
  const postIds = {}
  for (const p of posts) {
    const [existing] = await conn.query('SELECT id FROM community_posts WHERE title = ? LIMIT 1', [p.title])
    if (existing.length > 0) {
      postIds[p.key] = existing[0].id
      console.log('跳过帖子:', p.title.substring(0, 20) + '...')
      continue
    }
    const id = randomUUID()
    const hoursAgo = Math.floor(Math.random() * 240)
    await conn.execute(
      'INSERT INTO community_posts (id, user_id, title, content, tags, status, view_count, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL ? HOUR))',
      [id, userIds[p.userIdx], p.title, p.content, JSON.stringify(p.tags), p.status || 'published', p.views || 0, hoursAgo]
    )
    postIds[p.key] = id
    console.log('帖子:', p.title.substring(0, 30) + '...')
  }

  // 3. 创建评论
  let commentCount = 0
  for (const c of comments) {
    const id = randomUUID()
    const hoursAgo = Math.floor(Math.random() * 200)
    try {
      await conn.execute(
        'INSERT INTO community_comments (id, post_id, user_id, content, created_at) VALUES (?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL ? HOUR))',
        [id, postIds[c.postKey], userIds[c.userIdx], c.text, hoursAgo]
      )
      commentCount++
    } catch (e) {
      console.error('评论插入失败:', e.message)
    }
  }
  console.log('评论:', commentCount)

  // 4. 点赞
  const likeSet = new Set()
  for (let i = 0; i < 50; i++) {
    const pIdx = Math.floor(Math.random() * posts.length)
    const uIdx = Math.floor(Math.random() * demoUsers.length)
    const key = pIdx + '|' + uIdx
    if (likeSet.has(key)) continue
    likeSet.add(key)
    const id = randomUUID()
    try {
      await conn.execute('INSERT IGNORE INTO community_likes (id, post_id, user_id) VALUES (?, ?, ?)',
        [id, postIds[posts[pIdx].key], userIds[uIdx]])
    } catch (e) {}
  }
  console.log('点赞:', likeSet.size)

  // 5. 收藏
  const bookmarkSet = new Set()
  for (let i = 0; i < 25; i++) {
    const pIdx = Math.floor(Math.random() * posts.length)
    const uIdx = Math.floor(Math.random() * demoUsers.length)
    const key = pIdx + '|' + uIdx
    if (bookmarkSet.has(key)) continue
    bookmarkSet.add(key)
    const id = randomUUID()
    try {
      await conn.execute('INSERT IGNORE INTO community_bookmarks (id, post_id, user_id) VALUES (?, ?, ?)',
        [id, postIds[posts[pIdx].key], userIds[uIdx]])
    } catch (e) {}
  }
  console.log('收藏:', bookmarkSet.size)

  // 统计
  const [postCnt] = await conn.query('SELECT COUNT(*) as cnt FROM community_posts')
  const [commentCnt] = await conn.query('SELECT COUNT(*) as cnt FROM community_comments')
  const [likeCnt] = await conn.query('SELECT COUNT(*) as cnt FROM community_likes')
  const [bookCnt] = await conn.query('SELECT COUNT(*) as cnt FROM community_bookmarks')
  console.log(`\n=== 社区统计 ===`)
  console.log(`用户 ${demoUsers.length} | 帖子 ${postCnt[0].cnt} | 评论 ${commentCnt[0].cnt} | 点赞 ${likeCnt[0].cnt} | 收藏 ${bookCnt[0].cnt}`)

  await conn.end()
}

main().catch(e => { console.error(e.message || e); process.exit(1) })
