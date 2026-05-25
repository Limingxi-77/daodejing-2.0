<template>
  <main class="bg-gradient-to-b from-paper to-secondary/5 min-h-screen" data-testid="business-plan-page">
    <!-- Hero -->
    <section class="relative py-20 md:py-28 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-amber-100/30 pointer-events-none"></div>
      <div class="container mx-auto px-4 md:px-8 max-w-5xl relative">
        <div class="text-center animate-fade-in">
          <span class="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4 tracking-wider">
            <i class="fas fa-chart-line mr-1"></i>BUSINESS BLUEPRINT
          </span>
          <h1 class="text-4xl md:text-6xl font-bold text-primary font-serif mb-4">
            道德经 AI 商业蓝图
          </h1>
          <p class="text-lg md:text-xl text-dark/70 max-w-3xl mx-auto leading-relaxed">
            一份给评委、投资人、合作方的 5 分钟项目全景图<br/>
            <span class="text-sm text-dark/50">市场 · 单元经济学 · 定价矩阵 · 竞品对比 · 路线图</span>
          </p>
          <div class="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-dark/60">
            <span class="flex items-center"><i class="fas fa-coins text-amber-600 mr-1.5"></i>87% 毛利</span>
            <span class="flex items-center"><i class="fas fa-arrows-rotate text-blue-600 mr-1.5"></i>5.7× LTV/CAC</span>
            <span class="flex items-center"><i class="fas fa-globe text-emerald-600 mr-1.5"></i>¥600 亿市场</span>
          </div>
        </div>
      </div>
    </section>

    <!-- §1 目标用户画像 -->
    <section data-testid="bp-section-users" class="py-16 bg-white/70">
      <div class="container mx-auto px-4 md:px-8 max-w-6xl">
        <div class="text-center mb-10">
          <span class="text-xs font-bold text-secondary tracking-widest">SECTION · 01</span>
          <h2 class="text-3xl md:text-4xl font-bold text-primary font-serif mt-2">目标用户画像</h2>
          <p class="text-dark/60 mt-2">三类高意向人群,精准匹配价值主张</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <article
            v-for="p in userPersonas"
            :key="p.name"
            class="rounded-2xl p-6 bg-gradient-to-br shadow-md hover:shadow-xl transition-all border"
            :class="p.theme"
          >
            <div class="text-4xl mb-3">{{ p.emoji }}</div>
            <h3 class="text-lg font-bold text-dark mb-1">{{ p.name }}</h3>
            <p class="text-xs text-dark/50 mb-4">{{ p.segment }}</p>
            <div class="space-y-3 text-sm">
              <div>
                <div class="text-xs font-bold text-dark/40 uppercase mb-1">痛点</div>
                <p class="text-dark/80">{{ p.pain }}</p>
              </div>
              <div>
                <div class="text-xs font-bold text-dark/40 uppercase mb-1">价值主张</div>
                <p class="text-dark/80">{{ p.value }}</p>
              </div>
              <div>
                <div class="text-xs font-bold text-dark/40 uppercase mb-1">付费意愿</div>
                <p class="font-bold" :class="p.willClass">{{ p.willing }}</p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- §2 市场规模 -->
    <section data-testid="bp-section-market" class="py-16 bg-secondary/5">
      <div class="container mx-auto px-4 md:px-8 max-w-6xl">
        <div class="text-center mb-10">
          <span class="text-xs font-bold text-secondary tracking-widest">SECTION · 02</span>
          <h2 class="text-3xl md:text-4xl font-bold text-primary font-serif mt-2">市场规模</h2>
          <p class="text-dark/60 mt-2">三大赛道叠加,2025-2030 复合增长 20%+</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="rounded-2xl p-8 bg-white shadow-md text-center">
            <div class="text-xs text-dark/50 mb-2">中国心理咨询市场</div>
            <div class="text-5xl font-bold text-primary">¥600<span class="text-2xl">亿</span></div>
            <div class="text-xs text-dark/40 mt-2">2024 年估值 · CAGR 22%</div>
            <div class="text-[10px] text-dark/30 mt-1">来源:艾瑞咨询 / 中商产业研究院</div>
          </div>
          <div class="rounded-2xl p-8 bg-white shadow-md text-center border-2 border-amber-300">
            <div class="text-xs text-dark/50 mb-2">AI 心理健康(2030E)</div>
            <div class="text-5xl font-bold text-amber-700">¥250<span class="text-2xl">亿</span></div>
            <div class="text-xs text-dark/40 mt-2">2030 预估 · 高增赛道</div>
            <div class="text-[10px] text-dark/30 mt-1">来源:Grand View Research</div>
          </div>
          <div class="rounded-2xl p-8 bg-white shadow-md text-center">
            <div class="text-xs text-dark/50 mb-2">国学 / 传统文化教育</div>
            <div class="text-5xl font-bold text-emerald-700">¥420<span class="text-2xl">亿</span></div>
            <div class="text-xs text-dark/40 mt-2">2024 年估值 · CAGR 15%</div>
            <div class="text-[10px] text-dark/30 mt-1">来源:CNNIC 报告</div>
          </div>
        </div>
        <p class="text-center text-sm text-dark/60 mt-8">
          <i class="fas fa-info-circle mr-1"></i>
          三个交集 ≈ <strong class="text-primary">¥80 亿可服务市场</strong>(SAM),5 年内目标渗透 1% → ¥0.8 亿年收入
        </p>
      </div>
    </section>

    <!-- §3 定价矩阵 -->
    <section data-testid="bp-section-pricing" class="py-16 bg-white">
      <div class="container mx-auto px-4 md:px-8 max-w-6xl">
        <div class="text-center mb-10">
          <span class="text-xs font-bold text-secondary tracking-widest">SECTION · 03</span>
          <h2 class="text-3xl md:text-4xl font-bold text-primary font-serif mt-2">定价矩阵</h2>
          <p class="text-dark/60 mt-2">5 档定价梯度,从 C 端到 B 端全覆盖</p>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm border-collapse">
            <thead>
              <tr class="bg-primary/10 text-primary">
                <th class="px-4 py-3 text-left font-bold border-b border-primary/20">方案</th>
                <th class="px-4 py-3 text-left font-bold border-b border-primary/20">价格</th>
                <th class="px-4 py-3 text-left font-bold border-b border-primary/20">主要权益</th>
                <th class="px-4 py-3 text-left font-bold border-b border-primary/20">目标用户</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(tier, i) in pricingTiers" :key="tier.name" :class="i % 2 ? 'bg-secondary/5' : ''">
                <td class="px-4 py-3 font-bold text-dark">{{ tier.name }}</td>
                <td class="px-4 py-3 font-bold" :class="tier.priceClass">{{ tier.price }}</td>
                <td class="px-4 py-3 text-dark/70">{{ tier.benefits }}</td>
                <td class="px-4 py-3 text-dark/70">{{ tier.target }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- §4 单元经济学 -->
    <section data-testid="bp-section-economics" class="py-16 bg-gradient-to-br from-emerald-50 to-amber-50">
      <div class="container mx-auto px-4 md:px-8 max-w-5xl">
        <div class="text-center mb-10">
          <span class="text-xs font-bold text-secondary tracking-widest">SECTION · 04</span>
          <h2 class="text-3xl md:text-4xl font-bold text-primary font-serif mt-2">单元经济学(Pro 用户单月)</h2>
          <p class="text-dark/60 mt-2">87% 毛利 · LTV/CAC 5.7× · 健康现金流</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white rounded-2xl p-8 shadow-md">
            <h3 class="text-lg font-bold text-dark mb-4 flex items-center">
              <i class="fas fa-receipt text-primary mr-2"></i>收入与成本(单用户/月)
            </h3>
            <div class="space-y-3">
              <div class="flex justify-between text-sm">
                <span class="text-dark/70">订阅收入</span>
                <span class="font-bold text-emerald-700">+¥19.00</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-dark/70">AI 调用成本(50次×¥0.04)</span>
                <span class="font-bold text-red-600">-¥2.00</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-dark/70">服务器分摊</span>
                <span class="font-bold text-red-600">-¥0.50</span>
              </div>
              <div class="flex justify-between text-sm border-t pt-3">
                <span class="font-bold text-dark">毛利</span>
                <span class="font-bold text-2xl text-emerald-700">¥16.50</span>
              </div>
              <div class="text-center pt-2">
                <div class="text-5xl font-bold text-emerald-700">87%</div>
                <div class="text-xs text-dark/50">Gross Margin</div>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-2xl p-8 shadow-md">
            <h3 class="text-lg font-bold text-dark mb-4 flex items-center">
              <i class="fas fa-chart-pie text-primary mr-2"></i>LTV / CAC 模型
            </h3>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between">
                <span class="text-dark/70">假设月留存率</span>
                <span class="font-bold text-dark">85%</span>
              </div>
              <div class="flex justify-between">
                <span class="text-dark/70">平均生命周期</span>
                <span class="font-bold text-dark">6 个月</span>
              </div>
              <div class="flex justify-between">
                <span class="text-dark/70">用户终身价值(LTV)</span>
                <span class="font-bold text-emerald-700">¥114</span>
              </div>
              <div class="flex justify-between">
                <span class="text-dark/70">获客成本(社群裂变)</span>
                <span class="font-bold text-red-600">¥20</span>
              </div>
              <div class="text-center pt-4 border-t">
                <div class="text-5xl font-bold text-amber-700">5.7×</div>
                <div class="text-xs text-dark/50">LTV / CAC(健康线 &gt; 3×)</div>
              </div>
            </div>
          </div>
        </div>
        <p class="text-center text-xs text-dark/50 mt-8">
          * Master / Team / Enterprise 计算同理,毛利率随席位规模提升至 92%+
        </p>
      </div>
    </section>

    <!-- §5 竞品对比 -->
    <section data-testid="bp-section-competitors" class="py-16 bg-white">
      <div class="container mx-auto px-4 md:px-8 max-w-6xl">
        <div class="text-center mb-10">
          <span class="text-xs font-bold text-secondary tracking-widest">SECTION · 05</span>
          <h2 class="text-3xl md:text-4xl font-bold text-primary font-serif mt-2">竞品对比</h2>
          <p class="text-dark/60 mt-2">差异化定位:领域专精 + 多人格 + 文化锚点</p>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm border-collapse">
            <thead>
              <tr class="bg-primary/10 text-primary text-xs uppercase">
                <th class="px-3 py-3 text-left font-bold border-b border-primary/20">维度</th>
                <th class="px-3 py-3 text-center font-bold border-b border-primary/20">文心一言</th>
                <th class="px-3 py-3 text-center font-bold border-b border-primary/20">Kimi</th>
                <th class="px-3 py-3 text-center font-bold border-b border-primary/20">通义千问</th>
                <th class="px-3 py-3 text-center font-bold border-b border-primary/20 bg-amber-100 text-amber-800">道德经 AI</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in competitorRows" :key="row.label" :class="i % 2 ? 'bg-secondary/5' : ''">
                <td class="px-3 py-3 font-bold text-dark">{{ row.label }}</td>
                <td class="px-3 py-3 text-center text-dark/70">{{ row.baidu }}</td>
                <td class="px-3 py-3 text-center text-dark/70">{{ row.kimi }}</td>
                <td class="px-3 py-3 text-center text-dark/70">{{ row.qwen }}</td>
                <td class="px-3 py-3 text-center font-bold text-amber-700 bg-amber-50">{{ row.us }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- §6 变现矩阵 -->
    <section data-testid="bp-section-monetization" class="py-16 bg-secondary/5">
      <div class="container mx-auto px-4 md:px-8 max-w-6xl">
        <div class="text-center mb-10">
          <span class="text-xs font-bold text-secondary tracking-widest">SECTION · 06</span>
          <h2 class="text-3xl md:text-4xl font-bold text-primary font-serif mt-2">变现矩阵</h2>
          <p class="text-dark/60 mt-2">四条收入曲线并行,降低单一依赖</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            v-for="m in monetizationModels"
            :key="m.name"
            class="rounded-2xl p-6 bg-white shadow-md hover:shadow-xl transition-all border-l-4"
            :class="m.borderClass"
          >
            <div class="flex items-start justify-between mb-3">
              <h3 class="text-lg font-bold text-dark">
                <i :class="m.icon" class="mr-2"></i>{{ m.name }}
              </h3>
              <span class="text-xs px-2 py-0.5 rounded-full" :class="m.tagClass">{{ m.stage }}</span>
            </div>
            <p class="text-sm text-dark/70 mb-3">{{ m.desc }}</p>
            <div class="flex items-center justify-between text-sm border-t pt-3">
              <span class="text-dark/50">预估营收占比</span>
              <span class="font-bold text-primary">{{ m.revShare }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- §7 路线图 -->
    <section data-testid="bp-section-roadmap" class="py-16 bg-gradient-to-b from-white to-secondary/5">
      <div class="container mx-auto px-4 md:px-8 max-w-4xl">
        <div class="text-center mb-12">
          <span class="text-xs font-bold text-secondary tracking-widest">SECTION · 07</span>
          <h2 class="text-3xl md:text-4xl font-bold text-primary font-serif mt-2">产品路线图</h2>
          <p class="text-dark/60 mt-2">三阶段战略 · 从 MVP 到平台化</p>
        </div>
        <div class="relative pl-8 space-y-10">
          <div class="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary via-amber-400 to-emerald-500"></div>
          <div
            v-for="(stage, idx) in roadmap"
            :key="stage.period"
            class="relative animate-slide-up"
            :style="{ animationDelay: `${idx * 0.1}s` }"
          >
            <div class="absolute -left-8 top-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md" :class="stage.dotClass">
              {{ idx + 1 }}
            </div>
            <div class="bg-white rounded-2xl p-6 shadow-md">
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-lg font-bold text-dark">{{ stage.title }}</h3>
                <span class="text-xs px-3 py-1 rounded-full" :class="stage.tagClass">{{ stage.period }}</span>
              </div>
              <p class="text-sm text-dark/70 mb-3">{{ stage.desc }}</p>
              <ul class="text-sm space-y-1.5">
                <li v-for="goal in stage.goals" :key="goal" class="flex items-start">
                  <i class="fas fa-check-circle text-emerald-600 mr-2 mt-0.5"></i>
                  <span class="text-dark/80">{{ goal }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-16 bg-primary/5 border-t border-primary/10">
      <div class="container mx-auto px-4 md:px-8 max-w-4xl text-center">
        <h2 class="text-3xl font-bold text-primary font-serif mb-4">合作邀约</h2>
        <p class="text-dark/70 mb-8 max-w-2xl mx-auto">
          欢迎企业、教育机构、投资方与我们深入交流。我们提供定制化部署、API 接入、白标解决方案。
        </p>
        <div class="flex flex-wrap items-center justify-center gap-4">
          <router-link
            to="/about"
            class="px-6 py-3 rounded-full bg-primary text-white font-bold hover:bg-primary/90 transition-colors shadow-md"
          >
            <i class="fas fa-circle-info mr-2"></i>了解项目
          </router-link>
          <a
            href="mailto:contact@daodejing-ai.com"
            class="px-6 py-3 rounded-full border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-colors"
          >
            <i class="fas fa-envelope mr-2"></i>邮件洽谈
          </a>
        </div>
        <p class="text-xs text-dark/40 mt-8">
          道可道,非常道。商业之道,亦在于因时而变,顺势而为。
        </p>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
const userPersonas = [
  {
    name: 'C 端 · 心智修炼者',
    segment: '25-40 岁城市白领 / 高知人群',
    pain: '焦虑、决策疲劳、缺乏深度对话',
    value: '随时可问的 AI 国学导师,¥19/月 = 1 次咨询费',
    willing: '¥19-49 / 月',
    willClass: 'text-emerald-700',
    emoji: '🧘',
    theme: 'from-blue-50 to-blue-100/40 border-blue-200'
  },
  {
    name: 'B 端 · 团队领导者',
    segment: '中小企业管理层(50-500 人)',
    pain: '团队心理状态难追踪、培训成本高',
    value: '团队席位 + 数据仪表盘 + 私域定制',
    willing: '¥299-2999 / 月',
    willClass: 'text-blue-700',
    emoji: '👔',
    theme: 'from-amber-50 to-amber-100/40 border-amber-200'
  },
  {
    name: '机构 · 教育与文化',
    segment: '国学院 / 文旅机构 / 高校',
    pain: '内容数字化能力弱、获客成本高',
    value: '白标定制 + API 接入 + 联合品牌',
    willing: '¥10万+ / 年',
    willClass: 'text-amber-700',
    emoji: '🏛️',
    theme: 'from-emerald-50 to-emerald-100/40 border-emerald-200'
  }
]

const pricingTiers = [
  {
    name: '布衣 (Free)',
    price: '¥0/月',
    benefits: '5 次/日 AI 对话 · 基础解读 · 每日一签',
    target: '新用户尝鲜',
    priceClass: 'text-dark'
  },
  {
    name: '居士 (Pro)',
    price: '¥19/月',
    benefits: '50 次/日 · 道家隐士人格 · 深度解析',
    target: 'C 端核心付费用户',
    priceClass: 'text-primary'
  },
  {
    name: '宗师 (Master)',
    price: '¥49/月',
    benefits: '无限调用 · 全套人格 · 心理疗愈',
    target: '高频专业用户',
    priceClass: 'text-amber-700'
  },
  {
    name: '团队 (Team)',
    price: '¥299/月 · 10席',
    benefits: '团队仪表盘 · 协作功能 · 优先支持',
    target: '中小企业团队',
    priceClass: 'text-blue-700'
  },
  {
    name: '企业 (Enterprise)',
    price: '定制 (¥10万+/年)',
    benefits: '私有部署 · API 接入 · 定制 Persona',
    target: '大型机构 / 教育平台',
    priceClass: 'text-emerald-700'
  }
]

const competitorRows = [
  { label: '领域专精', baidu: '通用', kimi: '通用', qwen: '通用', us: '国学+心理(专精)' },
  { label: '多人格切换', baidu: '✗', kimi: '✗', qwen: '✗', us: '4 种人格 ✓' },
  { label: 'RAG / 经典锚点', baidu: '弱', kimi: '中', qwen: '中', us: '23 章原文锚定 ✓' },
  { label: '议事 / 多角度辩论', baidu: '✗', kimi: '✗', qwen: '✗', us: '三家会议 ✓' },
  { label: '文化基因', baidu: '无', kimi: '无', qwen: '无', us: '道家美学 ✓' },
  { label: '面向 C 端定价', baidu: '免费', kimi: '免费', qwen: '免费', us: '¥0/19/49' },
  { label: '面向 B 端定制', baidu: 'API', kimi: 'API', qwen: 'API', us: '私有 + 定制 + API' }
]

const monetizationModels = [
  {
    name: '订阅(C 端)',
    desc: '布衣 / 居士 / 宗师 三档,自然漏斗转化',
    revShare: '~45%',
    icon: 'fas fa-user',
    stage: '已落地',
    borderClass: 'border-primary',
    tagClass: 'bg-primary/10 text-primary'
  },
  {
    name: '团队席位(B 端)',
    desc: 'Team ¥299/10 席,企业内部协作',
    revShare: '~25%',
    icon: 'fas fa-users',
    stage: 'P2 已上线',
    borderClass: 'border-blue-600',
    tagClass: 'bg-blue-100 text-blue-700'
  },
  {
    name: '企业 API + 私部署',
    desc: '为大客户提供 API 与私有化交付',
    revShare: '~20%',
    icon: 'fas fa-server',
    stage: '洽谈中',
    borderClass: 'border-amber-600',
    tagClass: 'bg-amber-100 text-amber-700'
  },
  {
    name: '内容与课程',
    desc: '道商课程 / 修行训练营 / 名师陪跑',
    revShare: '~10%',
    icon: 'fas fa-graduation-cap',
    stage: '规划中',
    borderClass: 'border-emerald-600',
    tagClass: 'bg-emerald-100 text-emerald-700'
  }
]

const roadmap = [
  {
    period: 'Q2 2026',
    title: '阶段一 · MVP 完成(✓)',
    desc: '产品核心功能已交付,验证 PMF',
    goals: [
      'AI 解读 + 多人格 + 三家会议(已上线)',
      'C 端订阅(¥0/19/49)+ 模拟支付链路',
      '23 章经典锚点 + RAG 引用',
      '价值仪表盘 + 团队订阅(P2 新增)'
    ],
    dotClass: 'bg-primary',
    tagClass: 'bg-primary/10 text-primary'
  },
  {
    period: 'Q4 2026 - Q4 2027',
    title: '阶段二 · 商业化扩张',
    desc: '真支付 + B 端规模化 + 用户增长',
    goals: [
      '接入微信 / 支付宝真实收单',
      '社群裂变 + KOL 合作(目标 10 万 DAU)',
      '企业 Top 50 客户洽谈与签约',
      '团队仪表盘 + 私域统计 + 数据驾驶舱'
    ],
    dotClass: 'bg-amber-500',
    tagClass: 'bg-amber-100 text-amber-700'
  },
  {
    period: '2028+',
    title: '阶段三 · 平台化 / 扩品类',
    desc: '从单一经典到国学平台',
    goals: [
      '《论语》《庄子》《周易》多经典扩展',
      'AI 国学博物馆 / VR 沉浸式体验',
      'Open API 生态(第三方开发者接入)',
      '国学传统文化海外输出(英 / 日 / 韩)'
    ],
    dotClass: 'bg-emerald-600',
    tagClass: 'bg-emerald-100 text-emerald-700'
  }
]
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}
.animate-slide-up {
  animation: slideUp 0.7s ease-out backwards;
}

:global(html.zen-mode) .bg-white,
:global(html.zen-mode) .bg-white\/70 {
  background-color: #2c2c2e;
  color: #d4b483;
}
:global(html.zen-mode) .text-dark {
  color: #d4b483;
}
:global(html.zen-mode) td,
:global(html.zen-mode) th {
  border-color: #3f3f46;
}
</style>
