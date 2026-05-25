// Pure helpers for the user value-report route (GET /api/user/value-report).
// Side-effect-free so they can be exercised under node --test and contribute
// to lib/** coverage without a running HTTP server or database.

// 假设市场心理咨询 ¥300/小时,每次 AI 等价 6 分钟咨询 = ¥30。
// 系数挂在常量上,需要调整时改这里 + 加单测即可。
const MONTHLY_ADVISORY_RATE = 30;

// 已收录章节总数(与 divination-utils.KNOWLEDGE_CHAPTERS 对齐 = 23)。
const TOTAL_CHAPTERS = 23;

function clampNonNegative(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

function calculateSavedAdvisory(callCount, rate = MONTHLY_ADVISORY_RATE) {
  const calls = Math.floor(clampNonNegative(callCount));
  const r = clampNonNegative(rate);
  return calls * r;
}

function calculateLearningProgress(learnedChapters, total = TOTAL_CHAPTERS) {
  const learned = Math.floor(clampNonNegative(learnedChapters));
  const t = Math.max(1, Math.floor(clampNonNegative(total) || TOTAL_CHAPTERS));
  const percent = Math.min(100, Math.round((learned / t) * 100));
  return { learned: Math.min(learned, t), total: t, percent };
}

// 把 SQL 聚合行装成 API 响应 shape。row 形状:
//   { calls, tokens, cost } 任一字段可能为 null(SUM over empty set)
function formatAggregateRow(row, rate = MONTHLY_ADVISORY_RATE) {
  const calls = Math.floor(clampNonNegative(row && row.calls));
  const tokens = Math.floor(clampNonNegative(row && row.tokens));
  const cost = Number(clampNonNegative(row && row.cost).toFixed(6));
  const savedAdvisory = calculateSavedAdvisory(calls, rate);
  return { calls, tokens, cost, savedAdvisory };
}

// 顶层装载函数:把月聚合行 + 累计聚合行 + 学习进度装成完整响应。
function formatValueReport({ monthRow, lifetimeRow, learnedChapters }, rate = MONTHLY_ADVISORY_RATE) {
  return {
    month: formatAggregateRow(monthRow, rate),
    lifetime: formatAggregateRow(lifetimeRow, rate),
    progress: calculateLearningProgress(learnedChapters)
  };
}

module.exports = {
  MONTHLY_ADVISORY_RATE,
  TOTAL_CHAPTERS,
  calculateSavedAdvisory,
  calculateLearningProgress,
  formatAggregateRow,
  formatValueReport
};
