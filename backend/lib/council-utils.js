// Pure helpers for the multi-agent council route. Kept side-effect-free so
// they can run under node --test and contribute to lib/** coverage without a
// running HTTP server or database.

const COUNCIL_PERSONAS = [
  {
    id: 'scholar',
    name: '现代学者',
    icon: 'fa-graduation-cap',
    temperature: 0.5,
    system: '你是一位严谨的道家文化学者。请用学术风格,引用历史与训诂,客观分析,避免空泛。回答控制在 200 字内,可引用具体章节(如 "第八章")。'
  },
  {
    id: 'hermit',
    name: '道家隐士',
    icon: 'fa-mountain',
    temperature: 0.9,
    system: '你是云游山林的道家隐士。回答用诗意比喻,贴近自然,留白启发。可引用具体章节(如 "第八章")。控制在 200 字内。'
  },
  {
    id: 'healer',
    name: '心理疗愈师',
    icon: 'fa-heart',
    temperature: 0.7,
    system: '你是擅长以道家智慧抚慰现代人的心理疗愈师。回答共情、给出可执行建议,语言温和。可引用具体章节(如 "第八章")。控制在 200 字内。'
  }
];

function validateQuestion(question) {
  if (!question || typeof question !== 'string' || !question.trim()) {
    return { ok: false, code: 'empty', message: 'question 不能为空' };
  }
  if (question.length > 1500) {
    return { ok: false, code: 'too-long', message: 'question 过长(>1500 字)' };
  }
  return { ok: true, value: question.trim() };
}

function aggregateCouncilResults(results) {
  const safeResults = Array.isArray(results) ? results : [];
  const succeeded = safeResults.filter(r => r && !r.error);
  const failed = safeResults.filter(r => r && r.error);
  const totalTokens = succeeded.reduce((acc, r) => acc + (r.tokens || 0), 0);
  const promptTokens = succeeded.reduce((acc, r) => acc + (r.prompt_tokens || 0), 0);
  const completionTokens = succeeded.reduce((acc, r) => acc + (r.completion_tokens || 0), 0);
  return {
    succeededCount: succeeded.length,
    failedCount: failed.length,
    totalTokens,
    promptTokens,
    completionTokens,
    status: failed.length === 0 ? 'success-council' : 'partial-council'
  };
}

function buildFailureFallback(persona, message) {
  return {
    personaId: persona.id,
    personaName: persona.name,
    icon: persona.icon,
    error: message || 'unknown error'
  };
}

function buildDebatePeerPrompt(persona, question, peerResponses) {
  // peerResponses: array of round-1 results from other personas (filtered to
  // successful ones; failures already have error fields and should be skipped).
  const peers = (Array.isArray(peerResponses) ? peerResponses : [])
    .filter(p => p && !p.error && typeof p.content === 'string' && p.content.trim());

  if (peers.length === 0) {
    return null;
  }

  const peerBlock = peers
    .map(p => `【${p.personaName || p.personaId}】${p.content.trim()}`)
    .join('\n\n');

  const debateSystem = `${persona.system}\n\n现在进入第二轮:你已经看到了其他两位的第一轮观点。请基于你自己的视角,对其中你认同的部分做出补充、对你不认同的部分提出温和的反驳或不同看法。控制在 200 字内,语气保持你的风格,不要复述原话。`;

  const userMessage = `本轮的问题是:${question}\n\n其他两位的第一轮回答:\n\n${peerBlock}\n\n请给出你的第二轮回应。`;

  return {
    messages: [
      { role: 'system', content: debateSystem },
      { role: 'user', content: userMessage }
    ]
  };
}

function aggregateDebateResults(round1, round2) {
  const a = aggregateCouncilResults(round1);
  const b = aggregateCouncilResults(round2);
  const totalTokens = a.totalTokens + b.totalTokens;
  const promptTokens = a.promptTokens + b.promptTokens;
  const completionTokens = a.completionTokens + b.completionTokens;
  const totalFailed = a.failedCount + b.failedCount;
  return {
    round1: a,
    round2: b,
    totalTokens,
    promptTokens,
    completionTokens,
    failedCount: totalFailed,
    status: totalFailed === 0 ? 'success-debate' : 'partial-debate'
  };
}

module.exports = {
  COUNCIL_PERSONAS,
  validateQuestion,
  aggregateCouncilResults,
  buildFailureFallback,
  buildDebatePeerPrompt,
  aggregateDebateResults
};
