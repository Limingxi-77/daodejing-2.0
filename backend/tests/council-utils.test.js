const test = require('node:test');
const assert = require('node:assert');
const {
  COUNCIL_PERSONAS,
  validateQuestion,
  aggregateCouncilResults,
  buildFailureFallback,
  buildDebatePeerPrompt,
  aggregateDebateResults
} = require('../lib/council-utils');

test('COUNCIL_PERSONAS 必含三种人格', () => {
  assert.strictEqual(COUNCIL_PERSONAS.length, 3);
  const ids = COUNCIL_PERSONAS.map(p => p.id).sort();
  assert.deepStrictEqual(ids, ['healer', 'hermit', 'scholar']);
});

test('每个 persona 都有必要字段', () => {
  for (const p of COUNCIL_PERSONAS) {
    assert.ok(p.id, `${p.id} 缺 id`);
    assert.ok(p.name, `${p.id} 缺 name`);
    assert.ok(p.icon, `${p.id} 缺 icon`);
    assert.ok(typeof p.temperature === 'number', `${p.id} 缺 temperature`);
    assert.ok(p.system && p.system.length > 10, `${p.id} system prompt 太短`);
  }
});

test('temperature 区分人格风格', () => {
  const byId = Object.fromEntries(COUNCIL_PERSONAS.map(p => [p.id, p]));
  assert.ok(byId.scholar.temperature < byId.healer.temperature);
  assert.ok(byId.healer.temperature < byId.hermit.temperature);
});

test('validateQuestion 拒绝空字符串', () => {
  assert.strictEqual(validateQuestion('').ok, false);
  assert.strictEqual(validateQuestion('   ').ok, false);
  assert.strictEqual(validateQuestion(null).ok, false);
  assert.strictEqual(validateQuestion(undefined).ok, false);
  assert.strictEqual(validateQuestion(123).ok, false);
});

test('validateQuestion 接受正常问题', () => {
  const r = validateQuestion('  请问什么是道？  ');
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.value, '请问什么是道？');
});

test('validateQuestion 拒绝超长问题', () => {
  const longText = '问'.repeat(1501);
  const r = validateQuestion(longText);
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.code, 'too-long');
});

test('validateQuestion 接受 1500 字边界', () => {
  const ok = '问'.repeat(1500);
  assert.strictEqual(validateQuestion(ok).ok, true);
});

test('aggregateCouncilResults 全部成功', () => {
  const r = aggregateCouncilResults([
    { tokens: 10, prompt_tokens: 4, completion_tokens: 6 },
    { tokens: 20, prompt_tokens: 8, completion_tokens: 12 },
    { tokens: 30, prompt_tokens: 12, completion_tokens: 18 }
  ]);
  assert.strictEqual(r.succeededCount, 3);
  assert.strictEqual(r.failedCount, 0);
  assert.strictEqual(r.totalTokens, 60);
  assert.strictEqual(r.promptTokens, 24);
  assert.strictEqual(r.completionTokens, 36);
  assert.strictEqual(r.status, 'success-council');
});

test('aggregateCouncilResults 部分失败', () => {
  const r = aggregateCouncilResults([
    { tokens: 10 },
    { error: '上游超时' },
    { tokens: 30 }
  ]);
  assert.strictEqual(r.succeededCount, 2);
  assert.strictEqual(r.failedCount, 1);
  assert.strictEqual(r.totalTokens, 40);
  assert.strictEqual(r.status, 'partial-council');
});

test('aggregateCouncilResults 全部失败', () => {
  const r = aggregateCouncilResults([
    { error: 'a' },
    { error: 'b' },
    { error: 'c' }
  ]);
  assert.strictEqual(r.succeededCount, 0);
  assert.strictEqual(r.failedCount, 3);
  assert.strictEqual(r.totalTokens, 0);
  assert.strictEqual(r.status, 'partial-council');
});

test('aggregateCouncilResults 空数组', () => {
  const r = aggregateCouncilResults([]);
  assert.strictEqual(r.succeededCount, 0);
  assert.strictEqual(r.failedCount, 0);
  assert.strictEqual(r.totalTokens, 0);
  assert.strictEqual(r.status, 'success-council');
});

test('aggregateCouncilResults 处理无效输入', () => {
  assert.strictEqual(aggregateCouncilResults(null).succeededCount, 0);
  assert.strictEqual(aggregateCouncilResults(undefined).succeededCount, 0);
  assert.strictEqual(aggregateCouncilResults('not array').succeededCount, 0);
});

test('aggregateCouncilResults 忽略 null 元素', () => {
  const r = aggregateCouncilResults([{ tokens: 10 }, null, undefined, { tokens: 5 }]);
  assert.strictEqual(r.succeededCount, 2);
  assert.strictEqual(r.totalTokens, 15);
});

test('buildFailureFallback 保留 persona 身份字段', () => {
  const fb = buildFailureFallback(COUNCIL_PERSONAS[0], '网络错误');
  assert.strictEqual(fb.personaId, 'scholar');
  assert.strictEqual(fb.personaName, '现代学者');
  assert.strictEqual(fb.icon, 'fa-graduation-cap');
  assert.strictEqual(fb.error, '网络错误');
});

test('buildFailureFallback 处理空消息', () => {
  const fb = buildFailureFallback(COUNCIL_PERSONAS[1], '');
  assert.strictEqual(fb.error, 'unknown error');
  assert.strictEqual(fb.personaId, 'hermit');
});

test('buildDebatePeerPrompt 拼接 peer 内容并保留 persona system', () => {
  const persona = COUNCIL_PERSONAS[0]; // scholar
  const peers = [
    { personaId: 'hermit', personaName: '道家隐士', content: '云在天上,水在瓶中,皆有其性。' },
    { personaId: 'healer', personaName: '心理疗愈师', content: '允许自己慢下来,这本身就是一种治愈。' }
  ];
  const out = buildDebatePeerPrompt(persona, '我很焦虑怎么办?', peers);
  assert.ok(out);
  assert.strictEqual(out.messages.length, 2);
  assert.strictEqual(out.messages[0].role, 'system');
  assert.strictEqual(out.messages[1].role, 'user');
  assert.match(out.messages[0].content, /学者/); // persona.system 内含此关键词
  assert.match(out.messages[0].content, /第二轮/);
  assert.match(out.messages[1].content, /我很焦虑怎么办/);
  assert.match(out.messages[1].content, /道家隐士/);
  assert.match(out.messages[1].content, /心理疗愈师/);
});

test('buildDebatePeerPrompt 在 peers 全部失败时返回 null', () => {
  const persona = COUNCIL_PERSONAS[1];
  const out = buildDebatePeerPrompt(persona, '问题', [
    { error: '超时' },
    { error: '503' }
  ]);
  assert.strictEqual(out, null);
});

test('buildDebatePeerPrompt 过滤掉空 content peer', () => {
  const persona = COUNCIL_PERSONAS[2];
  const out = buildDebatePeerPrompt(persona, '问题', [
    { personaId: 'scholar', personaName: '学者', content: '   ' },
    { personaId: 'hermit', personaName: '隐士', content: '山高水长。' }
  ]);
  assert.ok(out);
  assert.match(out.messages[1].content, /山高水长/);
  // empty content peer should not appear
  assert.doesNotMatch(out.messages[1].content, /学者/);
});

test('buildDebatePeerPrompt 接受非数组 peerResponses 返回 null', () => {
  const persona = COUNCIL_PERSONAS[0];
  assert.strictEqual(buildDebatePeerPrompt(persona, 'q', null), null);
  assert.strictEqual(buildDebatePeerPrompt(persona, 'q', undefined), null);
  assert.strictEqual(buildDebatePeerPrompt(persona, 'q', 'not-array'), null);
});

test('aggregateDebateResults 两轮全部成功 status=success-debate', () => {
  const r1 = [{ tokens: 10 }, { tokens: 20 }, { tokens: 30 }];
  const r2 = [{ tokens: 15 }, { tokens: 25 }, { tokens: 35 }];
  const agg = aggregateDebateResults(r1, r2);
  assert.strictEqual(agg.totalTokens, 135);
  assert.strictEqual(agg.failedCount, 0);
  assert.strictEqual(agg.status, 'success-debate');
  assert.strictEqual(agg.round1.totalTokens, 60);
  assert.strictEqual(agg.round2.totalTokens, 75);
});

test('aggregateDebateResults 任一轮有失败 → partial-debate', () => {
  const r1 = [{ tokens: 10 }, { error: 'timeout' }, { tokens: 30 }];
  const r2 = [{ tokens: 15 }, { tokens: 25 }, { tokens: 35 }];
  const agg = aggregateDebateResults(r1, r2);
  assert.strictEqual(agg.failedCount, 1);
  assert.strictEqual(agg.status, 'partial-debate');
  assert.strictEqual(agg.totalTokens, 115);
});
