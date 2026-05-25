const test = require('node:test');
const assert = require('node:assert');
const {
  TEAM_SIZE_OPTIONS,
  INTENT_OPTIONS,
  NOTE_MAX_LENGTH,
  validateLeadInput,
  normalizeLeadInput
} = require('../lib/leads-utils');

test('validateLeadInput: 正常输入 → valid', () => {
  const result = validateLeadInput({
    name: '张三',
    email: 'zhangsan@example.com',
    company: '某公司',
    phone: '13800138000',
    teamSize: '11-50',
    intent: 'enterprise',
    note: '希望了解企业版'
  });
  assert.strictEqual(result.valid, true);
  assert.deepStrictEqual(result.errors, []);
});

test('validateLeadInput: 缺 name → invalid', () => {
  const result = validateLeadInput({ name: '', email: 'a@b.com' });
  assert.strictEqual(result.valid, false);
  assert.ok(result.errors.some(e => e.includes('name')));
});

test('validateLeadInput: 错 email 格式 → invalid', () => {
  const result = validateLeadInput({ name: '李四', email: 'not-an-email' });
  assert.strictEqual(result.valid, false);
  assert.ok(result.errors.some(e => e.includes('email')));
});

test('validateLeadInput: teamSize 超出枚举 → invalid', () => {
  const result = validateLeadInput({
    name: '王五',
    email: 'wang@x.com',
    teamSize: '500-1000'
  });
  assert.strictEqual(result.valid, false);
  assert.ok(result.errors.some(e => e.includes('teamSize')));
});

test('validateLeadInput: note 超长 → invalid', () => {
  const result = validateLeadInput({
    name: '赵六',
    email: 'zhao@x.com',
    note: 'x'.repeat(NOTE_MAX_LENGTH + 1)
  });
  assert.strictEqual(result.valid, false);
  assert.ok(result.errors.some(e => e.includes('note')));
});

test('validateLeadInput: phone 格式错误 → invalid', () => {
  const result = validateLeadInput({
    name: '钱七',
    email: 'qian@x.com',
    phone: 'not a phone number!'
  });
  assert.strictEqual(result.valid, false);
  assert.ok(result.errors.some(e => e.includes('phone')));
});

test('validateLeadInput: 仅 name + email(最小)→ valid', () => {
  const result = validateLeadInput({ name: '孙八', email: 'sun@x.com' });
  assert.strictEqual(result.valid, true);
});

test('validateLeadInput: null / 非对象输入安全降级 → invalid', () => {
  assert.strictEqual(validateLeadInput(null).valid, false);
  assert.strictEqual(validateLeadInput(undefined).valid, false);
  assert.strictEqual(validateLeadInput('string').valid, false);
});

test('normalizeLeadInput: 默认 intent=enterprise,email 小写,空字段为 null', () => {
  const normalized = normalizeLeadInput({
    name: '  张三  ',
    email: 'ZhangSan@Example.COM',
    phone: '',
    note: ''
  });
  assert.strictEqual(normalized.name, '张三');
  assert.strictEqual(normalized.email, 'zhangsan@example.com');
  assert.strictEqual(normalized.intent, 'enterprise');
  assert.strictEqual(normalized.phone, null);
  assert.strictEqual(normalized.note, null);
});

test('TEAM_SIZE_OPTIONS 4 档,INTENT_OPTIONS 含 enterprise', () => {
  assert.strictEqual(TEAM_SIZE_OPTIONS.length, 4);
  assert.ok(INTENT_OPTIONS.includes('enterprise'));
});
