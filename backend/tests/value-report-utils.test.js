const test = require('node:test');
const assert = require('node:assert');
const {
  MONTHLY_ADVISORY_RATE,
  TOTAL_CHAPTERS,
  calculateSavedAdvisory,
  calculateLearningProgress,
  formatAggregateRow,
  formatValueReport
} = require('../lib/value-report-utils');

test('常量:咨询费率 ¥30/次,章节总数 23', () => {
  assert.strictEqual(MONTHLY_ADVISORY_RATE, 30);
  assert.strictEqual(TOTAL_CHAPTERS, 23);
});

test('calculateSavedAdvisory: 0 次 = 0,100 次 = 3000,1 次 = 30', () => {
  assert.strictEqual(calculateSavedAdvisory(0), 0);
  assert.strictEqual(calculateSavedAdvisory(1), 30);
  assert.strictEqual(calculateSavedAdvisory(100), 3000);
});

test('calculateSavedAdvisory: 负数/NaN/null 全部夹断为 0', () => {
  assert.strictEqual(calculateSavedAdvisory(-5), 0);
  assert.strictEqual(calculateSavedAdvisory(NaN), 0);
  assert.strictEqual(calculateSavedAdvisory(null), 0);
  assert.strictEqual(calculateSavedAdvisory(undefined), 0);
});

test('calculateSavedAdvisory: 自定义 rate 可注入', () => {
  assert.strictEqual(calculateSavedAdvisory(10, 50), 500);
  assert.strictEqual(calculateSavedAdvisory(10, 0), 0);
});

test('calculateLearningProgress: 0/23 = 0%, 23/23 = 100%, 30/23 夹断到 100%', () => {
  assert.deepStrictEqual(calculateLearningProgress(0), { learned: 0, total: 23, percent: 0 });
  assert.deepStrictEqual(calculateLearningProgress(23), { learned: 23, total: 23, percent: 100 });
  const over = calculateLearningProgress(30);
  assert.strictEqual(over.percent, 100);
  assert.strictEqual(over.learned, 23, '已学不应超过总数');
});

test('calculateLearningProgress: 自定义 total + 边界 (null/0)', () => {
  assert.strictEqual(calculateLearningProgress(5, 10).percent, 50);
  assert.strictEqual(calculateLearningProgress(null).percent, 0);
  // total = 0 应回退到默认 23(避免 div-by-zero)
  assert.strictEqual(calculateLearningProgress(0, 0).total, 23);
});

test('formatAggregateRow: 处理 null tokens / null cost (LEFT JOIN 空结果)', () => {
  const row = { calls: null, tokens: null, cost: null };
  const result = formatAggregateRow(row);
  assert.deepStrictEqual(result, { calls: 0, tokens: 0, cost: 0, savedAdvisory: 0 });
});

test('formatAggregateRow: 正常聚合行 + savedAdvisory 自动计算', () => {
  const row = { calls: 17, tokens: 4523, cost: 0.0341 };
  const result = formatAggregateRow(row);
  assert.strictEqual(result.calls, 17);
  assert.strictEqual(result.tokens, 4523);
  assert.strictEqual(result.cost, 0.0341);
  assert.strictEqual(result.savedAdvisory, 510);
});

test('formatValueReport: 完整组装 month / lifetime / progress', () => {
  const report = formatValueReport({
    monthRow: { calls: 5, tokens: 1200, cost: 0.012 },
    lifetimeRow: { calls: 42, tokens: 10000, cost: 0.1 },
    learnedChapters: 8
  });
  assert.deepStrictEqual(report.month, { calls: 5, tokens: 1200, cost: 0.012, savedAdvisory: 150 });
  assert.deepStrictEqual(report.lifetime, { calls: 42, tokens: 10000, cost: 0.1, savedAdvisory: 1260 });
  assert.deepStrictEqual(report.progress, { learned: 8, total: 23, percent: 35 });
});

test('formatValueReport: 空数据库(全 null)返回安全零值', () => {
  const report = formatValueReport({
    monthRow: { calls: null, tokens: null, cost: null },
    lifetimeRow: { calls: null, tokens: null, cost: null },
    learnedChapters: 0
  });
  assert.strictEqual(report.month.savedAdvisory, 0);
  assert.strictEqual(report.lifetime.savedAdvisory, 0);
  assert.strictEqual(report.progress.percent, 0);
});
