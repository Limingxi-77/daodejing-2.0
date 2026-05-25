// Pure helpers for the daily divination route (/api/ai/divination).
// Side-effect-free so they can be exercised under node --test and contribute
// to lib/** coverage without a running HTTP server, database, or AI key.

const crypto = require('node:crypto');

// 23 chapters that we have full annotations + modern translations for in
// vue-project/src/data/knowledge_base.ts. Manually duplicated here to keep the
// backend free of any frontend imports (pure data, no deps).
const KNOWLEDGE_CHAPTERS = [
  1, 2, 7, 8, 10, 12, 16, 22, 25, 33,
  37, 38, 40, 42, 44, 48, 57, 63, 64, 66,
  76, 78, 81
];

// Minimal chapter text snapshot — used only by /api/ai/divination to feed the
// AI prompt with original-text + modern-paraphrase context. Kept short on
// purpose to bound prompt cost.
const CHAPTER_TEXTS = {
  1: { content: '道可道，非常道；名可名，非常名。无名天地之始，有名万物之母。', modern: '能够用语言表达的"道"，就不是永恒不变的"道"。' },
  2: { content: '天下皆知美之为美，斯恶已；皆知善之为善，斯不善已。故有无相生，难易相成，长短相形，高下相倾。', modern: '有和无相互依存，难和易相互成就，事物总是在对立中转化。' },
  7: { content: '天长地久。天地所以能长且久者，以其不自生，故能长生。是以圣人后其身而身先，外其身而身存。', modern: '圣人遇事谦退无争，反而能领先；置身度外，反而能保全。' },
  8: { content: '上善若水。水善利万物而不争，处众人之所恶，故几于道。', modern: '最高的善像水一样，滋润万物而不与之相争，停留在众人厌恶的地方。' },
  10: { content: '载营魄抱一，能无离乎？专气致柔，能如婴儿乎？生而不有，为而不恃，长而不宰，是谓玄德。', modern: '聚气至柔如同婴儿；生养万物却不据为己有，主导却不主宰，这就是玄德。' },
  12: { content: '五色令人目盲；五音令人耳聋；五味令人口爽；驰骋畋猎，令人心发狂。', modern: '过度的感官刺激与追逐欲望反而让人迷失本心。' },
  16: { content: '致虚极，守静笃。万物并作，吾以观复。夫物芸芸，各复归其根。归根曰静，是谓复命。', modern: '让心灵虚寂、保持清静，便能观察万物的循环与复归本根。' },
  22: { content: '曲则全，枉则直，洼则盈，敝则新，少则得，多则惑。是以圣人抱一为天下式。', modern: '委曲反能保全，少取反能多得，贪多反而迷惑。' },
  25: { content: '有物混成，先天地生。寂兮寥兮，独立而不改，周行而不殆。人法地，地法天，天法道，道法自然。', modern: '道独立长存、循环运行，人法地，地法天，天法道，道纯任自然。' },
  33: { content: '知人者智，自知者明。胜人者有力，自胜者强。知足者富，强行者有志。', modern: '了解他人是智，了解自己是明；战胜自己才算真正的强。' },
  37: { content: '道常无为而无不为。侯王若能守之，万物将自化。化而欲作，吾将镇之以无名之朴。', modern: '道顺任自然而无所不为；守住朴素，万物自然化育。' },
  38: { content: '上德不德，是以有德；下德不失德，是以无德。上德无为而无以为。', modern: '具备上德的人不表现为外在的有德，因而才是真正有德。' },
  40: { content: '反者道之动，弱者道之用。天下万物生于有，有生于无。', modern: '循环往复是道的运动，柔弱微妙是道的作用；万物生于有，有生于无。' },
  42: { content: '道生一，一生二，二生三，三生万物。万物负阴而抱阳，冲气以为和。', modern: '道演化出阴阳，阴阳激荡而和合，万物在对立的和谐中诞生。' },
  44: { content: '名与身孰亲？身与货孰多？甚爱必大费，多藏必厚亡。知足不辱，知止不殆，可以长久。', modern: '过分爱名必付重价，过度积财必遭损失；知足知止方能长久。' },
  48: { content: '为学日益，为道日损。损之又损，以至于无为。无为而无不为。', modern: '为学是不断累加，为道是不断减损，直至无为而无不为。' },
  57: { content: '我无为，而民自化；我好静，而民自正；我无事，而民自富；我无欲，而民自朴。', modern: '上位者无为好静，百姓便自我端正、安居乐业。' },
  63: { content: '为无为，事无事，味无味。图难于其易，为大于其细。天下难事，必作于易；天下大事，必作于细。', modern: '从容易处着手处理难事，从细微处着手成就大事。' },
  64: { content: '合抱之木，生于毫末；九层之台，起于累土；千里之行，始于足下。', modern: '大事都从微小处开始，长路都从脚下第一步走起。' },
  66: { content: '江海所以能为百谷王者，以其善下之。是以圣人欲上民，必以言下之；欲先民，必以身后之。', modern: '甘居下位反而成就汇聚；想要在上位领导他人，先以谦下相待。' },
  76: { content: '人之生也柔弱，其死也坚强。故坚强者死之徒，柔弱者生之徒。', modern: '柔弱属于生长，坚强反近死亡；保持柔软才是长生之道。' },
  78: { content: '天下莫柔弱于水，而攻坚强者莫之能胜。弱之胜强，柔之胜刚，天下莫不知，莫能行。', modern: '水至柔却能胜过最坚硬之物；弱胜强、柔胜刚，是被知而难行的智慧。' },
  81: { content: '信言不美，美言不信。善者不辩，辩者不善。圣人不积，既以为人己愈有，既以与人己愈多。', modern: '真话朴素不华丽；圣人不私自积藏，越是给予越是富有。' }
};

function getChapterText(chapter) {
  return CHAPTER_TEXTS[chapter] || null;
}

function getDateKey(date) {
  const d = date instanceof Date ? date : new Date();
  // Use UTC to avoid double-draws when a user crosses time zones in one calendar day.
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function pickChapterDeterministic(userId, dateKey, salt) {
  const seed = `${userId || 'anonymous'}:${dateKey || ''}${salt ? ':' + salt : ''}`;
  const hash = crypto.createHash('sha256').update(seed).digest('hex');
  const slice = hash.slice(0, 8);
  const n = parseInt(slice, 16);
  const idx = n % KNOWLEDGE_CHAPTERS.length;
  return KNOWLEDGE_CHAPTERS[idx];
}

function buildDivinationPrompt(chapter, content, modern) {
  const systemMessage =
    '你是道家智慧的现代导师。基于《道德经》指定章节的原文,为用户生成"今日提点"与"今日行动建议",输出**严格的 JSON**。\n' +
    '要求:\n' +
    '1. insight: 50 字以内,一句现代汉语的精神提点,扣紧本章主旨,不要复述原文。\n' +
    '2. action: 20 字以内,一个今天可执行的具体小行动(例:静坐 10 分钟、给一位旧友打电话、放下一件未做完的小事)。\n' +
    '3. 只输出 JSON,形如 {"insight":"...","action":"..."}。禁止额外说明、Markdown 代码块或注释。';

  const userMessage = `今日为我抽到的是《道德经》第 ${chapter} 章:\n\n原文:${content}\n` +
    (modern ? `\n现代解读参考:${modern}\n` : '') +
    '\n请按要求生成 JSON。';

  return {
    messages: [
      { role: 'system', content: systemMessage },
      { role: 'user', content: userMessage }
    ]
  };
}

function parseDivinationContent(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return { insight: '', action: '' };
  }
  const trimmed = rawText.trim();
  // Try strict JSON first; AI sometimes wraps in ```json ... ```.
  const candidates = [];
  candidates.push(trimmed);
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]+?)\s*```/i);
  if (fenced) candidates.push(fenced[1].trim());
  const objMatch = trimmed.match(/\{[\s\S]*\}/);
  if (objMatch) candidates.push(objMatch[0]);

  for (const c of candidates) {
    try {
      const parsed = JSON.parse(c);
      if (parsed && typeof parsed === 'object') {
        const insight = typeof parsed.insight === 'string' ? parsed.insight.trim() : '';
        const action = typeof parsed.action === 'string' ? parsed.action.trim() : '';
        if (insight || action) return { insight, action };
      }
    } catch { /* try next */ }
  }

  // Fallback: simple regex extraction
  const insightMatch = trimmed.match(/insight["'：:\s]*["'']?([^"'\n,}]+)/i);
  const actionMatch = trimmed.match(/action["'：:\s]*["'']?([^"'\n,}]+)/i);
  return {
    insight: insightMatch ? insightMatch[1].trim().replace(/[",。.]+$/, '') : '',
    action: actionMatch ? actionMatch[1].trim().replace(/[",。.]+$/, '') : ''
  };
}

function buildMockDivination(chapter) {
  return {
    insight: `【演示模式】第 ${chapter} 章提示我们顺势而为,放下一些非必要的执着。`,
    action: '今日给自己留 10 分钟独处时间'
  };
}

module.exports = {
  KNOWLEDGE_CHAPTERS,
  CHAPTER_TEXTS,
  getChapterText,
  getDateKey,
  pickChapterDeterministic,
  buildDivinationPrompt,
  parseDivinationContent,
  buildMockDivination
};
