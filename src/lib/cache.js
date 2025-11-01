// Simple cache utility with optional Upstash Redis REST integration
// Falls back to in-memory TTL cache if Upstash env vars are not present

const MEM = new Map();

function now() { return Math.floor(Date.now() / 1000); }

export async function cacheGet(key) {
  try {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (url && token) {
      const resp = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (!resp.ok) return null;
      const data = await resp.json().catch(() => null);
      if (!data || data.result == null) return null;
      try { return JSON.parse(data.result); } catch { return data.result; }
    }
  } catch (_) { /* ignore */ }

  // Fallback: in-memory TTL
  const item = MEM.get(key);
  if (!item) return null;
  if (item.exp && item.exp < now()) { MEM.delete(key); return null; }
  return item.val;
}

export async function cacheSet(key, value, ttlSeconds = 3600) {
  try {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (url && token) {
      const body = new URLSearchParams();
      body.set('value', typeof value === 'string' ? value : JSON.stringify(value));
      body.set('ex', String(ttlSeconds));
      const resp = await fetch(`${url}/set/${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: `Bearer ${token}` },
        body,
      });
      return resp.ok;
    }
  } catch (_) { /* ignore */ }

  // Fallback: in-memory TTL
  MEM.set(key, { val: value, exp: now() + (ttlSeconds || 3600) });
  return true;
}
