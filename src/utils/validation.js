export function isEmail(value) {
  if (!value) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  return re.test(String(value).trim());
}

export function emailMatches(a, b) {
  return String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase();
}

export function minAge(dateStr, years) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age >= years;
}

export function requiredFields(obj, fields) {
  const missing = [];
  for (const f of fields) {
    const v = f.split('.') .reduce((acc, k) => (acc ? acc[k] : undefined), obj);
    if (v === undefined || v === null || String(v).trim() === '') missing.push(f);
  }
  return missing;
}
