// Pure helpers for the leads route (POST /api/leads).
// Validates B-side contact-request form input before DB write.
// Side-effect-free for node --test coverage.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+0-9\-\s()]{6,30}$/;
const TEAM_SIZE_OPTIONS = Object.freeze(['1-10', '11-50', '51-200', '200+']);
const INTENT_OPTIONS = Object.freeze(['team', 'enterprise', 'consulting', 'other']);
const NOTE_MAX_LENGTH = 1000;
const NAME_MAX_LENGTH = 100;
const EMAIL_MAX_LENGTH = 200;
const COMPANY_MAX_LENGTH = 200;

function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === '';
}

function validateLeadInput(input) {
  const errors = [];
  const safe = input && typeof input === 'object' ? input : {};

  if (isBlank(safe.name)) {
    errors.push('name is required');
  } else if (String(safe.name).trim().length > NAME_MAX_LENGTH) {
    errors.push(`name too long (max ${NAME_MAX_LENGTH})`);
  }

  if (isBlank(safe.email)) {
    errors.push('email is required');
  } else {
    const email = String(safe.email).trim();
    if (email.length > EMAIL_MAX_LENGTH) {
      errors.push(`email too long (max ${EMAIL_MAX_LENGTH})`);
    } else if (!EMAIL_REGEX.test(email)) {
      errors.push('email format invalid');
    }
  }

  if (!isBlank(safe.phone) && !PHONE_REGEX.test(String(safe.phone).trim())) {
    errors.push('phone format invalid');
  }

  if (!isBlank(safe.company) && String(safe.company).trim().length > COMPANY_MAX_LENGTH) {
    errors.push(`company too long (max ${COMPANY_MAX_LENGTH})`);
  }

  if (!isBlank(safe.teamSize) && !TEAM_SIZE_OPTIONS.includes(String(safe.teamSize).trim())) {
    errors.push(`teamSize must be one of ${TEAM_SIZE_OPTIONS.join(', ')}`);
  }

  if (!isBlank(safe.intent) && !INTENT_OPTIONS.includes(String(safe.intent).trim())) {
    errors.push(`intent must be one of ${INTENT_OPTIONS.join(', ')}`);
  }

  if (!isBlank(safe.note) && String(safe.note).length > NOTE_MAX_LENGTH) {
    errors.push(`note too long (max ${NOTE_MAX_LENGTH})`);
  }

  return { valid: errors.length === 0, errors };
}

function normalizeLeadInput(input) {
  const safe = input && typeof input === 'object' ? input : {};
  return {
    name: String(safe.name || '').trim().slice(0, NAME_MAX_LENGTH),
    email: String(safe.email || '').trim().slice(0, EMAIL_MAX_LENGTH).toLowerCase(),
    company: isBlank(safe.company) ? null : String(safe.company).trim().slice(0, COMPANY_MAX_LENGTH),
    phone: isBlank(safe.phone) ? null : String(safe.phone).trim().slice(0, 50),
    teamSize: isBlank(safe.teamSize) ? null : String(safe.teamSize).trim(),
    intent: isBlank(safe.intent) ? 'enterprise' : String(safe.intent).trim(),
    note: isBlank(safe.note) ? null : String(safe.note).slice(0, NOTE_MAX_LENGTH)
  };
}

module.exports = {
  EMAIL_REGEX,
  PHONE_REGEX,
  TEAM_SIZE_OPTIONS,
  INTENT_OPTIONS,
  NOTE_MAX_LENGTH,
  validateLeadInput,
  normalizeLeadInput
};
