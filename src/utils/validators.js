// Basic validation utilities used across API routes and pages

export function isEmail(value) {
  if (!value) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  return re.test(String(value).trim());
}

export function isPhone(value) {
  if (!value) return false;
  const digits = String(value).replace(/[^0-9]/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

export function requiredFields(obj, fields) {
  const missing = [];
  for (const f of fields) {
    const v = f.split('.').reduce((acc, k) => (acc ? acc[k] : undefined), obj);
    if (v === undefined || v === null || String(v).trim() === '') missing.push(f);
  }
  return missing;
}

export function validateGuestPayload(payload) {
  const required = ['first_name', 'last_name', 'email'];
  const missing = requiredFields(payload, required);
  const errors = {};
  if (missing.length) {
    errors.missing = missing;
  }
  if (payload.email && !isEmail(payload.email)) {
    errors.email = 'Invalid email format';
  }
  // Relax phone validation to allow any string values (Lodgix accepts free-form)
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
