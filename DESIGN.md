# Design

> 这是道德经 2.0 的视觉宪法。所有页面、所有组件、所有 token 必须从这里推导。
> 任何"我觉得这样好看"如果与本文件冲突,改本文件,不要改实现。

## Theme

`light` — 主主题,默认状态。

**场景句**:一个 28 岁的读者,晚上 9 点在书桌前取出道德经,桌灯是暖黄色。屏幕该像那张纸,而不像那盏灯,也不像那个夜。所以是骨白,不是纯白;是墨色,不是纯黑。

不做 dark mode(竞赛 demo 周期内)。

---

## Color

全部使用 **OKLCH**。绝不出现 `#000` 或 `#fff`。所有中性色微微向**暖纸色相**(hue ≈ 85)tint,chroma 在 0.003-0.01 之间 — 屏幕上几乎看不出色,但放在一起就有一致的呼吸。

### Neutral scale(墨纸光谱)

CSS 自定义属性命名为 `--ink-{nn}`,从最浅到最深 9 步。

| Token | OKLCH | 用途 |
|---|---|---|
| `--ink-50`  | `oklch(0.992 0.003 85)` | 最高层背景 / 主页面底色(骨白+一缕暖) |
| `--ink-100` | `oklch(0.978 0.004 85)` | 次级背景 / 卡片底色 / 章节分隔区段 |
| `--ink-200` | `oklch(0.955 0.005 85)` | 输入框 placeholder 底色 / 浅描边 |
| `--ink-300` | `oklch(0.890 0.006 85)` | 分割线 / 极弱边框 / 装饰格线 |
| `--ink-400` | `oklch(0.720 0.008 85)` | 失能文字 / 注释文字 / 极轻 hint |
| `--ink-500` | `oklch(0.560 0.009 85)` | 次级文字 / 副标题 / 表单 label |
| `--ink-600` | `oklch(0.420 0.010 85)` | 引文 / 注释正文 |
| `--ink-700` | `oklch(0.300 0.010 85)` | 正文(默认 body color) |
| `--ink-900` | `oklch(0.180 0.008 85)` | 标题 / 强调文字 / 太极 mark 描边 |

> `--ink-700` 与 `--ink-50` 的对比度 ≈ 11:1,远超阅读舒适线。
> `--ink-700` 与 `--ink-100` ≈ 10.5:1。

### Accent

唯一强调色,**朱砂**。绝不与"金"或"龙凤纹"或"印章纹理"同框出现,所以它不会被读成传统国学的红。

| Token | OKLCH | 用途 |
|---|---|---|
| `--cinnabar` | `oklch(0.555 0.180 28)` | 标记色:CTA hover / 链接强 emphasis / 太极 mark 的一个点(可选) / BusinessPlan 关键数字 |
| `--cinnabar-soft` | `oklch(0.620 0.120 28)` | 极少使用,仅在朱砂主体上需要轻微叠合时 |

**朱砂使用守则**(违反必删):
- 面积占比单页 ≤ **8%**
- 绝不作为大段背景填充
- 绝不与渐变结合
- 绝不与"金 / 黄 / 红"同色域元素堆叠
- 用作文字色仅限按钮文字、单链接、章节序号、关键数字

### Color strategy

- **Product 寄存器页面**(AIInterpretation / LearningPath / Profile / Pricing): **Restrained**。中性色 + 朱砂 ≤ 8% 表面。
- **Brand 寄存器页面**(Home / About / BusinessPlan): **Committed 时刻** — 单页允许一个 hero 或 section 把朱砂推到 30-40%(例:BusinessPlan 的"商业蓝图"开篇 H1 朱砂大字),但只在那一个时刻。其余正文回到 Restrained。

---

## Typography

### Stack

```css
--font-serif-cn: "Source Han Serif SC", "Noto Serif SC", "Songti SC", "STSong", serif;
--font-display-cn: "LXGW WenKai", "Source Han Serif SC", "Noto Serif SC", serif;
--font-serif-en: "Source Serif 4", "Source Serif Pro", "EB Garamond", Georgia, serif;
--font-mono: "IBM Plex Mono", "JetBrains Mono", ui-monospace, monospace;
```

**字体职能分工**:

| 字体 | 用途 | 注意 |
|---|---|---|
| Source Han Serif SC | **正文 / 原文 / 注释 / 多数 UI 标签**。权重从 Regular(400)到 Heavy(900)负责所有中文层级。 | 已通过 Noto Serif SC 落地,无需额外加载 |
| LXGW WenKai(霞鹜文楷) | **章节标题 / 卦象标记 / 仪式性段落**。免授权开源字体,有楷书韵但非仿宋,符合"典则不仿古"。 | CDN: `https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.7.0/style.css` |
| 方正聚珍新仿 / 汉仪本悦体 | **可选商业升级位**。若获得授权,可替换 LXGW 用于 Hero 大字。 | demo 阶段不强求,生产可考虑 |
| Source Serif 4 | **西文正文 / 英文术语 / 引用 attribution** | 与思源宋体同源(Adobe),自然配对 |
| IBM Plex Mono | **数据 / 经济单位 / 章节编号(可选)**。BusinessPlan 单元经济学的数字用 Mono 表"严肃"。 | 不要用 Mono 写中文 |

### Scale(1.4 ratio,modular,允许跳级)

```css
--text-xs:   12px;   /* 标签 / 微说明 */
--text-sm:   14px;   /* 注释 / 副信息 */
--text-base: 16px;   /* 桌面正文最小 */
--text-md:   18px;   /* 推荐正文 */
--text-lg:   22px;   /* 大正文 / 引文 */
--text-xl:   28px;   /* H4 */
--text-2xl:  40px;   /* H3 / 章节副标题 */
--text-3xl:  56px;   /* H2 / 章节标题 */
--text-4xl:  80px;   /* H1 / 区段开篇 */
--text-display: 128px; /* Hero 唯一 */
```

跳级不连用:`28px → 56px → 128px` 是允许的(古典版面常见空隙比例)。

### Leading & tracking

| 用途 | line-height | letter-spacing |
|---|---|---|
| Body(中文) | 1.85 | 0.02em |
| Body(英文 / 数字) | 1.65 | 0 |
| H1-H2(中文标题) | 1.2 | -0.01em(略紧) |
| Caption / Label | 1.4 | 0.04em(略松,显严肃) |
| 章节原文(《道德经》文本本身) | 2.1 | 0.06em |

**铁律**:正文行长 cap 在 65ch(中文 ≈ 32-36 字 / 行)。超过必拆。

### Weight contrast

最少 1 个跳点,推荐 2 个:
- Regular(400)→ Heavy(900)是主要对比
- 不允许 Medium(500)和 SemiBold(600)出现在同一视觉块 — 看不出差别就是噪音

---

## Spacing

修正 Fibonacci 似的非线性节奏,**绝不每行同 padding**:

```css
--space-1:  4px;
--space-2:  8px;
--space-3:  12px;
--space-4:  20px;
--space-5:  32px;
--space-6:  56px;
--space-7:  88px;
--space-8:  144px;
--space-9:  232px;   /* 区段间气口 */
```

使用守则:
- 同层级元素间 用相邻档(2→3, 3→4)
- 跨层级(H2 与下一段正文)用跳档(4→6, 5→7)
- 区段(`<section>`)之间最少 `--space-7`,Brand 页面 hero 之间 `--space-9`

---

## Layout

| Token | Value | 用途 |
|---|---|---|
| `--measure-prose` | 42rem(672px) | 单栏阅读宽度上限(中文 35-38 字 / 行) |
| `--measure-narrow` | 32rem(512px) | 注释 / 引文 |
| `--container-default` | 75rem(1200px) | 多栏 / 数据 / 应用 UI |
| `--container-wide` | 90rem(1440px) | Brand 大气口区段(仅 Home/BusinessPlan) |

**规则**:
- 不用 `container` 包一切。一个 `<main>` 配 inner-content 即可。
- 多列(2-3 栏)只在 BusinessPlan / About 用,产品页面默认单栏 + 侧边导航。
- **绝不嵌套卡片**。卡片只在确实是"独立信息单元"时使用,否则用空白做边界。

---

## Motion

### Easing

```css
--ease-out-quint: cubic-bezier(0.22, 1, 0.36, 1);
--ease-out-expo:  cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out-quart: cubic-bezier(0.76, 0, 0.24, 1);
```

**只用 ease-out**。无 bounce,无 elastic,无 spring。

### Duration

- Micro(focus, hover):150ms
- Standard(state transition):240ms
- Entrance(scroll reveal, modal in):480ms
- Page transition:320ms 出 + 480ms 入

### Bans

- 不动 `width` / `height` / `margin` / `padding`(layout 属性)
- 用 `transform` + `opacity`
- 不动 `background-color` 大区段(会触发重绘)
- `prefers-reduced-motion: reduce` → 全部 duration = 0ms,只保留 opacity 切换

---

## Brand Mark(太极)

唯一品牌符号。**Outline-only 几何精度**。

### 构造

- 外圈:正圆,描边 `1.5px` `var(--ink-900)`,**fill: none**
- S 曲线:同样 `1.5px`,**fill: none**(不分阴阳填充)
- 两个内点:小圆,⌀ = 外圈 ⌀ / 8,描边 `1.5px`,**fill: none**(可选:其中一个填充 `--cinnabar` 作为唯一活元素,但仅限 Home Hero 与 hover 状态)
- 几何精度:S 曲线由两个半径 = R/2 的圆弧组成,不容许手绘起伏

### 使用守则

- 出现位置:Nav 左上角(32px)、Home Hero(120-160px)、Footer(48px)、BusinessPlan 章节分隔(96px)。**全站使用次数 ≤ 6**。
- 绝不与背景图、装饰纹、其他符号同框
- 绝不旋转(可以,但只在 hover 时极慢转一圈,duration ≥ 4000ms,作为"安静"的暗示)
- 不做镜像 / 不做大小渐变 / 不做颜色渐变

### SVG 基础码

```html
<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="1.5">
  <circle cx="50" cy="50" r="48"/>
  <path d="M50 2 A24 24 0 0 1 50 50 A24 24 0 0 0 50 98 A48 48 0 0 1 50 2 Z"/>
  <circle cx="50" cy="26" r="3"/>
  <circle cx="50" cy="74" r="3"/>
</svg>
```

---

## Components

> 全部组件以"克制"为默认。绝不在没有功能必要时增加视觉权重。

### Buttons

| 等级 | 样式 | 用途 |
|---|---|---|
| **Primary** | 实心:bg `--ink-900` / text `--ink-50` / 圆角 2px / padding `12px 28px` | 每屏唯一,主行动 |
| **Secondary** | 线框:border 1.5px `--ink-900` / text `--ink-900` / bg transparent | 次要行动 |
| **Tertiary** | 文字链接 + 下划线 offset 4px | 大多数场合用这个,不要默认开 button |
| **Hover** | `--cinnabar` 文字 或 `--ink-50` on `--cinnabar` bg(仅 Primary) | 唯一允许出现朱砂的 UI 动作 |

**禁**:阴影 > 2px、圆角 > 4px、渐变背景、玻璃拟态、emoji icon。

### Inputs

- 默认样式:**底线** + 透明背景,聚焦时底线变粗为 2px 并切到 `--ink-900`
- 不用 box-style 边框输入
- 不用圆角填色 chip 风格

### Cards

- 仅在"该卡片是独立的可移动单元"时使用,否则空白足够区分
- 边框:1px `--ink-300`,圆角 4px,padding `--space-5`
- 不允许阴影
- **绝不嵌套**

### Dividers

- 1px `--ink-300` 横线,长度不通栏(留 8-10ch 缩进做"古书页眉"的感觉)
- 不用点状线、双线、虚线
- 章节大分隔可用 `太极 mark / 居中 / 24px / --ink-300 描边` 替代横线

### Modals

- **默认禁止**。
- 真要弹,bg `--ink-50` / 边框 1px `--ink-300` / 居中 / max-width 480px / no overlay color(只用 `--ink-900` @ 30% opacity 遮罩)
- 不允许带阴影、不允许动画从 scale(0.8) 弹入(用 opacity fade + 8px 下移即可)

### Lists / Data Tables

- 行高至少 `--space-4`(20px)
- 表头 `--ink-500` 小号字 + 字间距 0.04em
- 行底线 1px `--ink-300`,不要 alternate row striping
- 数字列右对齐 + IBM Plex Mono

---

## Anti-patterns(实施时见即拒)

来自 PRODUCT.md anti-references 的代码侧映射 — 见到即重写:

1. **任何 `linear-gradient`**(背景、文字、按钮、卡片)→ 重写为纯色或两色硬切换
2. **任何 `text-shadow` / `box-shadow` 大于 2px**(除了真实卡片的 `0 1px 2px rgba(ink, 0.04)`)→ 重写
3. **`background-clip: text`** → 严禁
4. **重复装饰图样作为背景图**(包括太极)→ 删
5. **三列等宽 icon + heading + text 卡片栅**(SaaS 三件套)→ 重写为不等宽 / 错位 / 跳栏
6. **居中堆叠的 hero(big number + small label + sub text)**→ 重写为左对齐 + 大段留白
7. **emoji icon**(❤️🌟🚀 之类) → 删
8. **Inter / Roboto / Arial / 系统 sans-serif 默认堆栈** → 用上面定义的字体栈
9. **彩色徽章 / pill / 标签云**(SaaS 风)→ 用文字 + 边框线代替

---

## Surface Guidance

### Home(brand)

- 全屏 Hero,**单一大字标题**(`--text-display` 起步)
- 副标题 `--text-lg` 思源宋体 Regular,行长 ≤ 28 字
- 太极 mark 出现一次,120-160px,outline-only
- 不放"特性卡片九宫格"
- 滚动后是"今日道签 → 入口三件套 → 安静的 CTA"

### About(brand)

- 长卷,文字主导
- 章节分隔用太极 mark + 留白,不用线
- 引《道德经》原文时用 `--text-lg` LXGW WenKai + 居中 + `--measure-narrow`

### BusinessPlan(brand · 评委专用)

- 滚动长卷 7 节
- 关键数字(¥600 亿 / 87% 毛利)用 `--text-4xl` 朱砂色 IBM Plex Mono Bold — **这是允许朱砂大用的场景**
- 表格(竞品对比 / 定价矩阵)用 Source Han Serif,单栏底线,不用框
- 路线图用纵向时间线(左侧 1px line + 节点 4px circle),不用 SVG 装饰

### AIInterpretation(product)

- 工具优先,版面让位
- 对话气泡:无圆角填色(用左对齐 + 头像 + 时间戳),用户消息 `--ink-100` 底,AI 消息 `--ink-50` 底 + 1px 左侧 `--ink-300` 线(标识 AI)— 此处的"左侧细线"是**结构性**的(指示发言者),不是 PRODUCT 禁止的装饰性 side-stripe
- 输入框底线样式,不要 boxed

### LearningPath(product)

- 章节列表用 `<ol>` 表格化,每行:章号(IBM Plex Mono)+ 章名(Source Han Serif Heavy)+ 副标题 + 状态
- 进度用细线条 + 百分比,不要圆环 + 渐变

### Profile / Pricing(product)

- Pricing 5 档:不要等宽卡片栅。**主打档(Pro / Team)略大、略带朱砂边框**,其余等大 — 用大小做层级
- 修行账单(ValueReportCard):Source Han Serif 标题 + IBM Plex Mono 数字 + 朱砂高亮"节省咨询费"

---

## Implementation Notes

- 现有 `tailwind.config.js` 的 `primary: #6B4826` 等是 anti-ref 颜色 — 替换为本文件的 OKLCH token
- 现有 `home-quiet` 样式 / `.parchment-card` 样式 → 全面重构
- 现有 Hero 的 `太极图 + 竹简` stock 背景图 → 删除,改为纯空间 + 单一太极 mark
- 字体引入:LXGW WenKai 通过 CDN,首屏 `font-display: swap`
- 实现优先级:**Home → About → BusinessPlan → AIInterpretation → LearningPath → Pricing**(brand 先,product 后,符合"门面优先"的判分逻辑)
