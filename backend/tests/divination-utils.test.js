const test = require('node:test');
const assert = require('node:assert');
const {
  KNOWLEDGE_CHAPTERS,
  CHAPTER_TEXTS,
  getChapterText,
  getDateKey,
  pickChapterDeterministic,
  buildDivinationPrompt,
  parseDivinationContent,
  buildMockDivination
} = require('../lib/divination-utils');

test('KNOWLEDGE_CHAPTERS 含 23 个唯一章节,全部在 1-81 范围内', () => {
  assert.strictEqual(KNOWLEDGE_CHAPTERS.length, 23);
  const uniq = new Set(KNOWLEDGE_CHAPTERS);
  assert.strictEqual(uniq.size, 23, 'KNOWLEDGE_CHAPTERS 必须全部互不相同');
  for (const ch of KNOWLEDGE_CHAPTERS) {
    assert.ok(Number.isInteger(ch), `${ch} 不是整数`);
    assert.ok(ch >= 1 && ch <= 81, `${ch} 不在 1-81 范围内`);
  }
});

test('getDateKey 默认返回今日 UTC YYYY-MM-DD', () => {
  const key = getDateKey();
  assert.match(key, /^\d{4}-\d{2}-\d{2}$/);
});

test('getDateKey 给定 Date 时按 UTC 输出', () => {
  // 2026-05-23T01:00:00Z → '2026-05-23' regardless of caller's local TZ
  const d = new Date('2026-05-23T01:00:00Z');
  assert.strictEqual(getDateKey(d), '2026-05-23');

  const edge = new Date('2026-05-23T23:59:59Z');
  assert.strictEqual(getDateKey(edge), '2026-05-23');
});

test('pickChapterDeterministic 同 userId + 同 dateKey 总返回同章节', () => {
  const a = pickChapterDeterministic('user-42', '2026-05-23');
  const b = pickChapterDeterministic('user-42', '2026-05-23');
  const c = pickChapterDeterministic('user-42', '2026-05-23');
  assert.strictEqual(a, b);
  assert.strictEqual(b, c);
  assert.ok(KNOWLEDGE_CHAPTERS.includes(a));
});

test('pickChapterDeterministic 不同 dateKey 大概率不同章节(分布大致均匀)', () => {
  // 同一用户连续 100 天,期望覆盖至少 10 个不同章节(理论上 ~22.6 个)
  const seen = new Set();
  const baseDate = new Date('2026-01-01T00:00:00Z');
  for (let i = 0; i < 100; i++) {
    const d = new Date(baseDate.getTime() + i * 86400000);
    seen.add(pickChapterDeterministic('user-1', getDateKey(d)));
  }
  assert.ok(seen.size >= 10, `100 天只覆盖了 ${seen.size} 个章节,分布过于集中`);
});

test('pickChapterDeterministic 不同 salt 可强制重抽出不同章节', () => {
  // 给一个高熵 salt,绝大多数情况下应当与无 salt 结果不同
  // 用 5 个不同 salt,期望至少有 1 个不一样
  const base = pickChapterDeterministic('user-7', '2026-05-23');
  const variants = ['1', '2', 'reroll-a', 'reroll-b', 'reroll-c']
    .map(s => pickChapterDeterministic('user-7', '2026-05-23', s));
  assert.ok(variants.some(v => v !== base), '所有 salt 都返回了相同章节,熵不足');
});

test('pickChapterDeterministic 接受空/异常 userId 不崩,返回有效章节', () => {
  const fromNull = pickChapterDeterministic(null, '2026-05-23');
  const fromUndef = pickChapterDeterministic(undefined, '2026-05-23');
  const fromEmpty = pickChapterDeterministic('', '2026-05-23');
  for (const ch of [fromNull, fromUndef, fromEmpty]) {
    assert.ok(KNOWLEDGE_CHAPTERS.includes(ch));
  }
});

test('buildDivinationPrompt 包含 system + user 两条 messages,引用章节号', () => {
  const r = buildDivinationPrompt(8, '上善若水。', '最上等的善像水一样。');
  assert.ok(Array.isArray(r.messages));
  assert.strictEqual(r.messages.length, 2);
  assert.strictEqual(r.messages[0].role, 'system');
  assert.strictEqual(r.messages[1].role, 'user');
  assert.match(r.messages[0].content, /JSON/);
  assert.match(r.messages[1].content, /第 8 章/);
  assert.match(r.messages[1].content, /上善若水/);
});

test('parseDivinationContent 解析标准 JSON', () => {
  const r = parseDivinationContent('{"insight":"顺势而为","action":"静坐五分钟"}');
  assert.strictEqual(r.insight, '顺势而为');
  assert.strictEqual(r.action, '静坐五分钟');
});

test('parseDivinationContent 解析 ```json ... ``` 包裹', () => {
  const wrapped = '```json\n{"insight":"放下执着","action":"散步 20 分钟"}\n```';
  const r = parseDivinationContent(wrapped);
  assert.strictEqual(r.insight, '放下执着');
  assert.strictEqual(r.action, '散步 20 分钟');
});

test('parseDivinationContent 对完全无法解析的文本兜底', () => {
  const r = parseDivinationContent('这只是一段散文,完全没有 JSON。');
  assert.ok(typeof r.insight === 'string');
  assert.ok(typeof r.action === 'string');
});

test('buildMockDivination 始终返回包含章节号的演示文案', () => {
  const r = buildMockDivination(42);
  assert.match(r.insight, /演示模式/);
  assert.match(r.insight, /第 42 章/);
  assert.ok(r.action.length > 0);
});

test('CHAPTER_TEXTS 覆盖全部 KNOWLEDGE_CHAPTERS', () => {
  for (const ch of KNOWLEDGE_CHAPTERS) {
    const t = getChapterText(ch);
    assert.ok(t, `第 ${ch} 章在 CHAPTER_TEXTS 中缺失`);
    assert.ok(t.content && t.content.length > 0, `第 ${ch} 章 content 为空`);
    assert.ok(t.modern && t.modern.length > 0, `第 ${ch} 章 modern 为空`);
  }
});

test('getChapterText 对未收录章节返回 null', () => {
  assert.strictEqual(getChapterText(3), null);
  assert.strictEqual(getChapterText(999), null);
});
