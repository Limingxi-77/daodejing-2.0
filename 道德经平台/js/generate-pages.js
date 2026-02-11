/**
 * 道德经章节页面生成脚本
 * 用于动态生成《道德经》81章的单独页面
 */

const fs = require('fs')
const path = require('path')

// 道德经章节数据
const daoDeJingChapters = [
  {
    id: 1,
    title: '道可道',
    content: `道可道，非常道。
名可名，非常名。
无名天地之始，有名万物之母。
故常无欲，以观其妙；常有欲，以观其徼。
此两者同出而异名，同谓之玄。
玄之又玄，众妙之门。`,
    interpretation: `这一章是《道德经》的开篇，也是全书的总纲。老子提出了"道"的概念，指出真正的"道"是无法用言语完全表达的。"名"也是如此，真正的"名"不是我们通常所说的名称。

"无"和"有"是同一根源的不同表现，都是深奥的。这种深奥中的深奥，是理解一切奥妙的门径。老子在这里强调了超越语言和概念的重要性，提醒人们不要被表面的名称所束缚，而要体悟更深层的实在。`
  },
  {
    id: 2,
    title: '天下皆知',
    content: `天下皆知美之为美，斯恶已；
皆知善之为善，斯不善已。
故有无相生，难易相成，长短相形，高下相倾，音声相和，前后相随。
是以圣人处无为之事，行不言之教。
万物作焉而不辞，生而不有，为而不恃，功成而弗居。
夫唯弗居，是以不去。`,
    interpretation: `这一章阐述了相对性的概念。当人们知道了什么是美，丑的概念就产生了；知道了什么是善，不善的概念就产生了。所有概念都是相对而生的，如"有"和"无"、"难"和"易"、"长"和"短"等。

圣人顺应自然，不做刻意的事情，实行不言的教化。让万物自然发展而不干预，生养万物而不占有，有所作为而不依赖，功成而不居功。正因为不居功，所以功绩不会失去。`
  },
  {
    id: 3,
    title: '不尚贤',
    content: `不尚贤，使民不争；
不贵难得之货，使民不为盗；
不见可欲，使民心不乱。
是以圣人之治，
虚其心，实其腹，
弱其志，强其骨。
常使民无知无欲，
使夫智者不敢为也。
为无为，则无不治。`,
    interpretation: `这一章讨论了治理的原则。不推崇贤能，使民众不争夺；不珍视稀有之物，使民众不偷盗；不显现可引起欲望的东西，使民众心不乱。

圣人治理时，简化民众的思想，填饱他们的肚子，减弱他们的欲望，强健他们的筋骨。常使民众没有伪诈的心智和欲望，使那些聪明人不敢轻举妄动。顺应自然无为而治，则没有什么不能治理的。`
  },
  {
    id: 4,
    title: '道冲而用之',
    content: `道冲而用之，或不盈。
渊兮，似万物之宗。
挫其锐，解其纷，和其光，同其尘。
湛兮，似或存。
吾不知谁之子，象帝之先。`,
    interpretation: `这一章描述了"道"的特性。"道"是空虚的，但用之不尽；它深邃得像是万物的宗主。它能挫去锋芒，解除纷扰，调和光芒，混同尘世。

它幽深得似有若无。我不知道它由谁而生，似乎在天帝之前就已存在。老子用诗意的语言描绘了"道"的超越性和普遍性，强调它是一切存在的根源。`
  },
  {
    id: 5,
    title: '天地不仁',
    content: `天地不仁，以万物为刍狗；
圣人不仁，以百姓为刍狗。
天地之间，其犹橐籥乎？
虚而不屈，动而愈出。
多言数穷，不如守中。`,
    interpretation: `这一章探讨了"不仁"的概念。天地无所谓仁爱，将万物视为草狗；圣人无所谓仁爱，将百姓视为草狗。"刍狗"是古代祭祀用的草扎的狗，用完即弃，这里比喻天地和圣人对待万物和百姓的无差别态度。

天地之间，不就像风箱吗？空虚却不会穷竭，越动越出。言语过多往往导致困窘，不如保持内心的虚静。老子在这里强调了超越情感偏执的自然态度。`
  },
  {
    id: 6,
    title: '谷神不死',
    content: `谷神不死，是谓玄牝。
玄牝之门，是谓天地根。
绵绵若存，用之不勤。`,
    interpretation: `这一章以"谷神"比喻"道"。"谷神"永存不死，这就是神秘的母性。这神秘母性的门户，就是天地的根源。它连绵不绝地存在着，用之不尽。

老子用生育的意象来描述"道"的创生能力，强调"道"如同母体一样，是万物产生的根源，而且这种创生能力是永恒不绝的。`
  },
  {
    id: 7,
    title: '天长地久',
    content: `天长地久。
天地所以能长且久者，以其不自生，故能长生。
是以圣人后其身而身先，外其身而身存。
非以其无私邪？故能成其私。`,
    interpretation: `这一章以天地的永恒来比喻无私的美德。天地之所以能长久存在，是因为它们不为自己而生，所以能够长久。

圣人把自己放在后面，反而能居于人前；把自己置之度外，反而能保全自身。这不正是因为他无私吗？所以能成就他自己的利益。老子在这里阐述了"无私而成其私"的辩证思想。`
  },
  {
    id: 8,
    title: '上善若水',
    content: `上善若水。
水善利万物而不争，处众人之所恶，故几于道。
居善地，心善渊，与善仁，言善信，正善治，事善能，动善时。
夫唯不争，故无尤。`,
    interpretation: `这一章以水的特性来比喻最高的善。水善于滋养万物而不与万物相争，停留在众人都不喜欢的地方，所以最接近于"道"。

居住要善于选择地方，心思要善于保持深沉，交往要善于表现仁爱，言语要善于保持诚信，为政要善于有条理，做事要善于发挥所长，行动要善于把握时机。正因为不争，所以没有过失。`
  },
  {
    id: 9,
    title: '持而盈之',
    content: `持而盈之，不如其已。
揣而锐之，不可长保。
金玉满堂，莫之能守。
富贵而骄，自遗其咎。
功遂身退，天之道也。`,
    interpretation: `这一章讲述了适可而止的道理。持握盈满，不如适时停止；锤炼锋芒，难以长久保持；金玉满堂，无法长久守护；富贵而骄纵，自招灾祸。

功成身退，这是自然的规律。老子在这里提醒人们不要过度追求，要懂得适可而止，保持谦逊，这样才能长久。`
  },
  {
    id: 10,
    title: '载营魄',
    content: `载营魄抱一，能无离乎？
专气致柔，能婴儿乎？
涤除玄览，能无疵乎？
爱民治国，能无知乎？
天门开阖，能为雌乎？
明白四达，能无为乎？
生之、畜之，
生而不有，为而不恃，长而不宰，
是谓玄德。`,
    interpretation: `这一章提出了一系列修身治国的问题。精神与形体合一，能不分离吗？聚集精气达到柔和，能像婴儿一样吗？洗涤内心，能没有瑕疵吗？爱民治国，能不用智巧吗？

天门开合，能保持柔静吗？明白通达，能顺应自然吗？生养万物，生养而不占有，有所作为而不依赖，引导而不主宰，这就是深奥的德。`
  },
  {
    id: 11,
    title: '三十辐',
    content: `三十辐共一毂，当其无，有车之用。
埏埴以为器，当其无，有器之用。
凿户牖以为室，当其无，有室之用。
故有之以为利，无之以为用。`,
    interpretation: `这一章以具体事物为例，阐述了"无"的功用。三十根辐条汇集于一个毂，因为有了空处，才有车的作用；揉捏陶土制作器皿，因为有了空处，才有器皿的作用；开凿门窗建造房屋，因为有了空处，才有房屋的作用。

所以"有"给人便利，"无"发挥了作用。老子通过这些日常例子，说明了"无"的重要性，强调虚空的价值。`
  },
  {
    id: 12,
    title: '五色令人目盲',
    content: `五色令人目盲，五音令人耳聋，五味令人口爽，
驰骋畋猎令人心发狂，难得之货令人行妨。
是以圣人为腹不为目，
故去彼取此。`,
    interpretation: `这一章警示过度追求感官享受的危害。缤纷的色彩使人眼花缭乱，繁杂的音乐使人听觉失灵，丰美的食物使人味觉迟钝，纵马打猎使人心发狂，稀有之物使人行为不轨。

圣人只求吃饱肚子而不追求感官享受，所以要摒弃后者而选取前者。老子在这里提醒人们要节制欲望，追求内在的充实而非外在的刺激。`
  }
  // 注意：这里只列出了前12章作为示例，实际应包含全部81章
]

// HTML模板
const chapterPageTemplate = (chapter) => `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>第${chapter.id}章 ${chapter.title} - 道德经AI互动解读者平台</title>
    <link rel="stylesheet" href="../css/main.css">
    <link rel="stylesheet" href="../css/components.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        /* 章节页面特定样式 */
        .chapter-content {
            font-family: 'KaiTi', '楷体', serif;
            font-size: 1.25rem;
            line-height: 2;
            white-space: pre-line;
        }
        
        .chapter-number {
            font-size: 3rem;
            font-weight: bold;
            color: var(--primary-color);
            opacity: 0.2;
            position: absolute;
            top: 1rem;
            right: 1rem;
        }
        
        .chapter-nav {
            display: flex;
            justify-content: space-between;
            margin-top: 3rem;
        }
        
        .comment-box {
            background-color: #f9fafb;
            border-radius: 0.5rem;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
        }
        
        .comment-author {
            display: flex;
            align-items: center;
            margin-bottom: 0.75rem;
        }
        
        .comment-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            margin-right: 0.75rem;
        }
        
        .comment-text {
            margin-bottom: 0.5rem;
        }
        
        .comment-actions {
            display: flex;
            font-size: 0.875rem;
            color: #6b7280;
        }
        
        .comment-actions button {
            background: none;
            border: none;
            color: inherit;
            cursor: pointer;
            margin-right: 1rem;
            display: flex;
            align-items: center;
        }
        
        .comment-actions button:hover {
            color: var(--primary-color);
        }
        
        .comment-form {
            margin-top: 2rem;
        }
        
        .form-group {
            margin-bottom: 1rem;
        }
        
        .form-label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: #374151;
        }
        
        .form-input, .form-textarea {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 0.375rem;
            font-size: 1rem;
            transition: border-color 0.2s ease;
        }
        
        .form-input:focus, .form-textarea:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
        }
        
        .form-textarea {
            min-height: 100px;
            resize: vertical;
        }
    </style>
</head>
<body class="bg-light">
    <!-- 导航栏 -->
    <nav class="navbar">
        <div class="container">
            <div class="nav-brand">
                <div class="logo">
                    <i class="fas fa-yin-yang"></i>
                </div>
                <span class="brand-text">道德经AI解读者</span>
            </div>
            <ul class="nav-menu">
                <li class="nav-item">
                    <a href="../index.html" class="nav-link">首页</a>
                </li>
                <li class="nav-item">
                    <a href="../ai-interpretation.html" class="nav-link">AI解读</a>
                </li>
                <li class="nav-item">
                    <a href="../learning-path.html" class="nav-link">学习路径</a>
                </li>
                <li class="nav-item">
                    <a href="../community.html" class="nav-link">社区</a>
                </li>
                <li class="nav-item">
                    <a href="../resource-library.html" class="nav-link">资源库</a>
                </li>
                <li class="nav-item">
                    <a href="../about.html" class="nav-link">关于</a>
                </li>
            </ul>
            <div class="nav-actions">
                <button id="loginBtn" class="btn btn-outline">登录</button>
                <button id="registerBtn" class="btn btn-primary">注册</button>
            </div>
        </div>
    </nav>

    <!-- 主要内容 -->
    <main class="container my-12">
        <!-- 章节标题 -->
        <div class="text-center mb-8">
            <h1 class="text-4xl font-bold text-primary mb-2">第${chapter.id}章 ${chapter.title}</h1>
            <div class="flex justify-center items-center text-gray-600">
                <i class="fas fa-book-open mr-2"></i>
                <span>《道德经》</span>
            </div>
        </div>

        <!-- 章节内容 -->
        <section class="bg-white rounded-lg shadow-md p-8 mb-8 relative">
            <div class="chapter-number">${chapter.id}</div>
            <div class="chapter-content mb-8">${chapter.content}</div>
            
            <!-- AI解读 -->
            <div class="border-t pt-6">
                <h3 class="text-xl font-bold text-dark mb-4 flex items-center">
                    <i class="fas fa-robot text-primary mr-2"></i>
                    AI解读
                </h3>
                <div class="text-gray-700 leading-relaxed mb-6">
                    ${chapter.interpretation}
                </div>
                <button class="btn btn-outline">
                    <i class="fas fa-comments mr-2"></i>
                    与AI讨论此章
                </button>
            </div>
        </section>

        <!-- 章节导航 -->
        <div class="chapter-nav">
            ${chapter.id > 1
? `
            <a href="chapter-${chapter.id - 1}.html" class="btn btn-outline">
                <i class="fas fa-chevron-left mr-2"></i>
                上一章
            </a>
            `
: '<div></div>'}
            
            ${chapter.id < 81
? `
            <a href="chapter-${chapter.id + 1}.html" class="btn btn-outline">
                下一章
                <i class="fas fa-chevron-right ml-2"></i>
            </a>
            `
: '<div></div>'}
        </div>

        <!-- 评论区 -->
        <section class="mt-12">
            <h2 class="text-2xl font-bold text-dark mb-6">学习心得</h2>
            
            <!-- 评论列表 -->
            <div class="mb-8">
                <!-- 示例评论1 -->
                <div class="comment-box">
                    <div class="comment-author">
                        <img src="https://picsum.photos/seed/user1/40/40.jpg" alt="用户头像" class="comment-avatar">
                        <div>
                            <h4 class="font-medium text-dark">张明</h4>
                            <span class="text-sm text-gray-500">2天前</span>
                        </div>
                    </div>
                    <div class="comment-text">
                        这一章让我对"道"有了更深的理解。原来真正的"道"是无法用言语完全表达的，这让我想到佛家的"不可说"概念，东西方哲学在这里有相通之处。
                    </div>
                    <div class="comment-actions">
                        <button><i class="far fa-thumbs-up mr-1"></i> 12</button>
                        <button><i class="far fa-comment mr-1"></i> 回复</button>
                        <button><i class="far fa-share mr-1"></i> 分享</button>
                    </div>
                </div>
                
                <!-- 示例评论2 -->
                <div class="comment-box">
                    <div class="comment-author">
                        <img src="https://picsum.photos/seed/user2/40/40.jpg" alt="用户头像" class="comment-avatar">
                        <div>
                            <h4 class="font-medium text-dark">李静</h4>
                            <span class="text-sm text-gray-500">1周前</span>
                        </div>
                    </div>
                    <div class="comment-text">
                        老子在这一章提醒我们不要被表面的名称所束缚，要体悟更深层的实在。这对我日常生活中的思维方式有很大启发，不再轻易被标签和概念限制。
                    </div>
                    <div class="comment-actions">
                        <button><i class="far fa-thumbs-up mr-1"></i> 8</button>
                        <button><i class="far fa-comment mr-1"></i> 回复</button>
                        <button><i class="far fa-share mr-1"></i> 分享</button>
                    </div>
                </div>
            </div>
            
            <!-- 发表评论表单 -->
            <div class="comment-form">
                <h3 class="text-lg font-bold text-dark mb-4">发表您的学习心得</h3>
                <form id="commentForm">
                    <div class="form-group">
                        <label for="commentText" class="form-label">您的想法</label>
                        <textarea id="commentText" class="form-textarea" placeholder="分享您对这一章的理解、感悟或问题..." required></textarea>
                    </div>
                    <div class="flex justify-end">
                        <button type="submit" class="btn btn-primary">发表评论</button>
                    </div>
                </form>
            </div>
        </section>
    </main>

    <!-- 页脚 -->
    <footer class="bg-dark text-white py-8">
        <div class="container">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <div class="flex items-center mb-4">
                        <div class="logo mr-2">
                            <i class="fas fa-yin-yang"></i>
                        </div>
                        <span class="text-xl font-bold">道德经AI解读者</span>
                    </div>
                    <p class="text-gray-400">
                        以AI智慧，探索老子思想的现代价值
                    </p>
                </div>
                <div>
                    <h4 class="text-lg font-bold mb-4">平台功能</h4>
                    <ul class="space-y-2">
                        <li><a href="../ai-interpretation.html" class="text-gray-400 hover:text-white">AI解读</a></li>
                        <li><a href="../learning-path.html" class="text-gray-400 hover:text-white">学习路径</a></li>
                        <li><a href="../community.html" class="text-gray-400 hover:text-white">社区交流</a></li>
                        <li><a href="../resource-library.html" class="text-gray-400 hover:text-white">资源库</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="text-lg font-bold mb-4">学习资源</h4>
                    <ul class="space-y-2">
                        <li><a href="#" class="text-gray-400 hover:text-white">道德经原文</a></li>
                        <li><a href="#" class="text-gray-400 hover:text-white">注解版本</a></li>
                        <li><a href="#" class="text-gray-400 hover:text-white">学习工具</a></li>
                        <li><a href="#" class="text-gray-400 hover:text-white">研究论文</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="text-lg font-bold mb-4">联系我们</h4>
                    <ul class="space-y-2">
                        <li class="text-gray-400"><i class="fas fa-envelope mr-2"></i>contact@daodejing.ai</li>
                        <li class="text-gray-400"><i class="fas fa-phone mr-2"></i>+86 123 4567 8900</li>
                        <li class="text-gray-400"><i class="fas fa-map-marker-alt mr-2"></i>北京市朝阳区</li>
                    </ul>
                </div>
            </div>
            <div class="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
                <p>&copy; 2023 道德经AI互动解读者平台. 保留所有权利.</p>
            </div>
        </div>
    </footer>

    <!-- 引入JavaScript文件 -->
    <script src="../js/main.js"></script>
    <script src="../js/auth-module.js"></script>
    <script src="../js/scroll-effects.js"></script>
    <script src="../js/utils.js"></script>
    <script>
        // 页面加载完成后初始化
        document.addEventListener('DOMContentLoaded', function() {
            // 初始化导航栏
            initNavbar();
            
            // 初始化认证模块
            initAuthModule();
            
            // 初始化滚动效果
            initScrollEffects();
            
            // 评论表单提交
            const commentForm = document.getElementById('commentForm');
            commentForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const commentText = document.getElementById('commentText').value;
                
                if (!commentText.trim()) {
                    alert('请输入评论内容');
                    return;
                }
                
                // 这里应该发送到服务器
                console.log('发表评论:', commentText);
                
                // 清空表单
                commentForm.reset();
                
                // 显示成功消息
                alert('评论发表成功！');
                
                // 刷新页面或动态添加新评论
                // window.location.reload();
            });
            
            // 点赞功能
            const likeButtons = document.querySelectorAll('.comment-actions button');
            likeButtons.forEach(button => {
                if (button.querySelector('.fa-thumbs-up')) {
                    button.addEventListener('click', function() {
                        const countSpan = this.querySelector('span');
                        let count = parseInt(countSpan.textContent);
                        
                        if (this.classList.contains('active')) {
                            count--;
                            this.classList.remove('active');
                            this.querySelector('i').classList.remove('fas');
                            this.querySelector('i').classList.add('far');
                        } else {
                            count++;
                            this.classList.add('active');
                            this.querySelector('i').classList.remove('far');
                            this.querySelector('i').classList.add('fas');
                        }
                        
                        countSpan.textContent = count;
                    });
                }
            });
        });
    </script>
</body>
</html>`

// 创建章节数据的函数
function generateChapterData () {
  // 这里应该包含完整的81章内容
  // 为了示例，我们只生成前12章
  return daoDeJingChapters
}

// 生成章节页面的函数
function generateChapterPages () {
  const chapters = generateChapterData()
  const chaptersDir = path.join(__dirname, 'chapters')

  // 确保章节目录存在
  if (!fs.existsSync(chaptersDir)) {
    fs.mkdirSync(chaptersDir, { recursive: true })
  }

  // 为每个章节生成HTML文件
  chapters.forEach(chapter => {
    const htmlContent = chapterPageTemplate(chapter)
    const filePath = path.join(chaptersDir, `chapter-${chapter.id}.html`)

    fs.writeFileSync(filePath, htmlContent, 'utf8')
    console.log(`已生成章节页面: ${filePath}`)
  })

  // 生成章节索引页面
  generateChapterIndex(chapters, chaptersDir)
}

// 生成章节索引页面的函数
function generateChapterIndex (chapters, outputDir) {
  const indexContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>道德经全文 - 道德经AI互动解读者平台</title>
    <link rel="stylesheet" href="../css/main.css">
    <link rel="stylesheet" href="../css/components.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        .chapter-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1.5rem;
        }
        
        .chapter-item {
            background-color: white;
            border-radius: 0.5rem;
            padding: 1.5rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
        }
        
        .chapter-item:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }
        
        .chapter-number {
            font-size: 1.5rem;
            font-weight: bold;
            color: var(--primary-color);
            margin-bottom: 0.5rem;
        }
        
        .chapter-title {
            font-size: 1.25rem;
            font-weight: bold;
            margin-bottom: 0.75rem;
        }
        
        .chapter-preview {
            color: #6b7280;
            font-size: 0.875rem;
            line-height: 1.5;
            margin-bottom: 1rem;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        
        .search-box {
            position: relative;
            margin-bottom: 2rem;
        }
        
        .search-input {
            width: 100%;
            padding: 0.75rem 1rem 0.75rem 3rem;
            border: 1px solid #d1d5db;
            border-radius: 0.5rem;
            font-size: 1rem;
            transition: border-color 0.2s ease;
        }
        
        .search-input:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
        }
        
        .search-icon {
            position: absolute;
            left: 1rem;
            top: 50%;
            transform: translateY(-50%);
            color: #6b7280;
        }
    </style>
</head>
<body class="bg-light">
    <!-- 导航栏 -->
    <nav class="navbar">
        <div class="container">
            <div class="nav-brand">
                <div class="logo">
                    <i class="fas fa-yin-yang"></i>
                </div>
                <span class="brand-text">道德经AI解读者</span>
            </div>
            <ul class="nav-menu">
                <li class="nav-item">
                    <a href="../index.html" class="nav-link">首页</a>
                </li>
                <li class="nav-item">
                    <a href="../ai-interpretation.html" class="nav-link">AI解读</a>
                </li>
                <li class="nav-item">
                    <a href="../learning-path.html" class="nav-link">学习路径</a>
                </li>
                <li class="nav-item">
                    <a href="../community.html" class="nav-link">社区</a>
                </li>
                <li class="nav-item">
                    <a href="../resource-library.html" class="nav-link">资源库</a>
                </li>
                <li class="nav-item">
                    <a href="../about.html" class="nav-link">关于</a>
                </li>
            </ul>
            <div class="nav-actions">
                <button id="loginBtn" class="btn btn-outline">登录</button>
                <button id="registerBtn" class="btn btn-primary">注册</button>
            </div>
        </div>
    </nav>

    <!-- 主要内容 -->
    <main class="container my-12">
        <!-- 页面标题 -->
        <div class="text-center mb-12">
            <h1 class="text-4xl font-bold text-primary mb-4">道德经全文</h1>
            <p class="text-xl text-dark max-w-3xl mx-auto">
                阅读老子《道德经》全文，共八十一章，探索道家哲学的精髓
            </p>
        </div>

        <!-- 搜索框 -->
        <div class="search-box max-w-2xl mx-auto mb-8">
            <i class="fas fa-search search-icon"></i>
            <input type="text" class="search-input" placeholder="搜索章节标题或内容..." id="chapterSearch">
        </div>

        <!-- 章节列表 -->
        <div class="chapter-list" id="chapterList">
            ${chapters.map(chapter => `
            <div class="chapter-item" data-title="${chapter.title}" data-content="${chapter.content}">
                <div class="chapter-number">第${chapter.id}章</div>
                <h3 class="chapter-title">${chapter.title}</h3>
                <div class="chapter-preview">${chapter.content}</div>
                <a href="chapter-${chapter.id}.html" class="btn btn-outline btn-sm">阅读全文</a>
            </div>
            `).join('')}
        </div>
    </main>

    <!-- 页脚 -->
    <footer class="bg-dark text-white py-8">
        <div class="container">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <div class="flex items-center mb-4">
                        <div class="logo mr-2">
                            <i class="fas fa-yin-yang"></i>
                        </div>
                        <span class="text-xl font-bold">道德经AI解读者</span>
                    </div>
                    <p class="text-gray-400">
                        以AI智慧，探索老子思想的现代价值
                    </p>
                </div>
                <div>
                    <h4 class="text-lg font-bold mb-4">平台功能</h4>
                    <ul class="space-y-2">
                        <li><a href="../ai-interpretation.html" class="text-gray-400 hover:text-white">AI解读</a></li>
                        <li><a href="../learning-path.html" class="text-gray-400 hover:text-white">学习路径</a></li>
                        <li><a href="../community.html" class="text-gray-400 hover:text-white">社区交流</a></li>
                        <li><a href="../resource-library.html" class="text-gray-400 hover:text-white">资源库</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="text-lg font-bold mb-4">学习资源</h4>
                    <ul class="space-y-2">
                        <li><a href="#" class="text-gray-400 hover:text-white">道德经原文</a></li>
                        <li><a href="#" class="text-gray-400 hover:text-white">注解版本</a></li>
                        <li><a href="#" class="text-gray-400 hover:text-white">学习工具</a></li>
                        <li><a href="#" class="text-gray-400 hover:text-white">研究论文</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="text-lg font-bold mb-4">联系我们</h4>
                    <ul class="space-y-2">
                        <li class="text-gray-400"><i class="fas fa-envelope mr-2"></i>contact@daodejing.ai</li>
                        <li class="text-gray-400"><i class="fas fa-phone mr-2"></i>+86 123 4567 8900</li>
                        <li class="text-gray-400"><i class="fas fa-map-marker-alt mr-2"></i>北京市朝阳区</li>
                    </ul>
                </div>
            </div>
            <div class="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
                <p>&copy; 2023 道德经AI互动解读者平台. 保留所有权利.</p>
            </div>
        </div>
    </footer>

    <!-- 引入JavaScript文件 -->
    <script src="../js/main.js"></script>
    <script src="../js/auth-module.js"></script>
    <script src="../js/scroll-effects.js"></script>
    <script src="../js/utils.js"></script>
    <script>
        // 页面加载完成后初始化
        document.addEventListener('DOMContentLoaded', function() {
            // 初始化导航栏
            initNavbar();
            
            // 初始化认证模块
            initAuthModule();
            
            // 初始化滚动效果
            initScrollEffects();
            
            // 搜索功能
            const searchInput = document.getElementById('chapterSearch');
            const chapterItems = document.querySelectorAll('.chapter-item');
            
            searchInput.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                
                chapterItems.forEach(item => {
                    const title = item.dataset.title.toLowerCase();
                    const content = item.dataset.content.toLowerCase();
                    
                    if (title.includes(searchTerm) || content.includes(searchTerm)) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    </script>
</body>
</html>`

  const indexPath = path.join(outputDir, 'index.html')
  fs.writeFileSync(indexPath, indexContent, 'utf8')
  console.log(`已生成章节索引页面: ${indexPath}`)
}

// 主函数
function main () {
  console.log('开始生成道德经章节页面...')

  try {
    generateChapterPages()
    console.log('道德经章节页面生成完成！')
  } catch (error) {
    console.error('生成页面时出错:', error)
  }
}

// 如果直接运行此脚本，则执行主函数
if (require.main === module) {
  main()
}

// 导出函数供其他模块使用
module.exports = {
  generateChapterPages,
  generateChapterData,
  chapterPageTemplate
}
