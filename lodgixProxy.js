// lodgixProxy.js
// One-file Express proxy for Lodgix API with simple token-bucket rate limiting
// Usage:
//   set env vars: LODGIX_API_KEY=<key> [optional LODGIX_CUSTOMER_ID] [PORT=3001]
//   node lodgixProxy.js

const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());

const BASE_URL = 'https://www.lodgix.com/public-api/v2';
const API_KEY = process.env.NEXT_PUBLIC_LODGIX_API_KEY || '';
// const CUSTOMER_ID = process.env.LODGIX_CUSTOMER_ID || '';

// Basic sanity check
if (!API_KEY) {
  console.warn('[lodgixProxy] Warning: LODGIX_API_KEY is not set. Requests will fail with 401.');
}

// -------- Simple token-bucket rate limiter (per IP) --------
// Defaults: 60 tokens capacity, refill 1 token per second
const RATE_CAPACITY = Number(process.env.RATE_CAPACITY || 60);
const RATE_REFILL_PER_SEC = Number(process.env.RATE_REFILL_PER_SEC || 1);
const buckets = new Map(); // ip -> { tokens, last }

function rateLimit(req, res, next) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'local';
  const now = Date.now();
  let b = buckets.get(ip);
  if (!b) {
    b = { tokens: RATE_CAPACITY, last: now };
    buckets.set(ip, b);
  }
  // Refill tokens
  const elapsed = (now - b.last) / 1000;
  b.tokens = Math.min(RATE_CAPACITY, b.tokens + elapsed * RATE_REFILL_PER_SEC);
  b.last = now;
  if (b.tokens < 1) {
    return res.status(429).json({ success: false, error: 'Too Many Requests', details: { ip } });
  }
  b.tokens -= 1;
  next();
}

app.use(rateLimit);

// -------- Helpers --------
function buildHeaders(extra = {}) {
  const headers = {
    'Authorization': `Token ${API_KEY}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...extra,
  };
  // Include optional customer id header if present (for systems that need it)
  if (CUSTOMER_ID) headers['X-CUSTOMER-ID'] = CUSTOMER_ID;
  return headers;
}

async function forwardJson(url, options = {}) {
  const resp = await fetch(url, options);
  const ct = resp.headers.get('content-type') || '';
  const data = ct.includes('application/json') ? await resp.json().catch(() => ({})) : { raw: await resp.text().catch(() => '') };
  return { ok: resp.ok, status: resp.status, data };
}

// -------- Routes --------
// GET /api/properties?offset=&limit=
app.get('/api/properties', async (req, res) => {
  try {
    const { offset, limit } = req.query;
    const u = new URL(BASE_URL + '/properties/');
    if (offset !== undefined) u.searchParams.set('offset', String(offset));
    if (limit !== undefined) u.searchParams.set('limit', String(limit));

    const r = await forwardJson(u.toString(), { method: 'GET', headers: buildHeaders() });
    if (!r.ok) return res.status(r.status).json({ success: false, error: r.data?.message || 'Failed to fetch properties', details: r.data });
    res.json({ success: true, data: r.data });
  } catch (err) {
    console.error('GET /api/properties error', err);
    res.status(500).json({ success: false, error: 'Internal server error', details: err.message });
  }
});

// GET /api/properties/:id
app.get('/api/properties/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const r = await forwardJson(`${BASE_URL}/properties/${encodeURIComponent(id)}/`, { method: 'GET', headers: buildHeaders() });
    if (!r.ok) return res.status(r.status).json({ success: false, error: r.data?.message || 'Failed to fetch property', details: r.data });
    res.json({ success: true, data: r.data });
  } catch (err) {
    console.error('GET /api/properties/:id error', err);
    res.status(500).json({ success: false, error: 'Internal server error', details: err.message });
  }
});

// POST /api/quotes/calculate -> Lodgix reservations quote
// Body: { from_date, to_date, adults, children, pets, property_id, room_id? }
app.post('/api/quotes/calculate', async (req, res) => {
  try {
    const payload = req.body || {};
    const r = await forwardJson(`${BASE_URL}/reservations/quote/`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(payload),
    });
    if (!r.ok) return res.status(r.status).json({ success: false, error: r.data?.message || 'Quote failed', details: r.data });
    res.json({ success: true, data: r.data });
  } catch (err) {
    console.error('POST /api/quotes/calculate error', err);
    res.status(500).json({ success: false, error: 'Internal server error', details: err.message });
  }
});

// POST /api/guests -> Lodgix create guest
app.post('/api/guests', async (req, res) => {
  try {
    const payload = req.body || {};
    // Optional: normalize title
    const normalizeTitle = (t) => {
      const s = String(t || '').trim().toLowerCase();
      if (!s) return 'MISTER';
      if (['dr','miss','missis','mister','mrmrs'].includes(s)) return s.toUpperCase();
      if (['mr','mr.','mister','sir'].includes(s)) return 'MISTER';
      if (['ms','ms.','miss'].includes(s)) return 'MISS';
      if (['mrs','mrs.','missis'].includes(s)) return 'MISSIS';
      if (['dr.','doc','doctor'].includes(s)) return 'DR';
      if (['mr & mrs','mr and mrs','mr&mrs','mr+mrs','mr mrs'].includes(s)) return 'MRMRS';
      return 'MISTER';
    };

    const body = {
      first_name: payload.first_name,
      last_name: payload.last_name,
      title: normalizeTitle(payload.title),
      company: payload.company || '',
      email: payload.email,
      address: {
        address1: payload.address?.address1 || '',
        address2: payload.address?.address2 || '',
        city: payload.address?.city || '',
        zip: payload.address?.zip || '',
        country: payload.address?.country || '',
        state: payload.address?.state || '',
        fax: payload.address?.fax || '',
        work_phone: payload.address?.work_phone || '',
        work_phone_ext: payload.address?.work_phone_ext || '',
      },
    };
    if (payload.address?.phone) {
      const digits = String(payload.address.phone).replace(/\D/g, '');
      if (digits.length >= 7 && digits.length <= 15) body.address.phone = digits;
    }
    const sid = Number(payload.status_id);
    if (Number.isInteger(sid) && sid > 0) body.status_id = sid;

    const r = await forwardJson(`${BASE_URL}/guests/`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(body),
    });
    if (!r.ok) return res.status(r.status).json({ success: false, error: r.data?.message || 'Failed to create guest', details: r.data });
    res.json({ success: true, data: r.data });
  } catch (err) {
    console.error('POST /api/guests error', err);
    res.status(500).json({ success: false, error: 'Internal server error', details: err.message });
  }
});

// POST /api/reservations -> Lodgix create reservation
// Body: { from_date, to_date, adults, children, pets, guest_id, stay_type: 'GUEST', entities: [{ property_id, room_ids: [] }] }
app.post('/api/reservations', async (req, res) => {
  try {
    const payload = req.body || {};
    const r = await forwardJson(`${BASE_URL}/reservations/`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(payload),
    });
    if (!r.ok) return res.status(r.status).json({ success: false, error: r.data?.message || 'Failed to create reservation', details: r.data });
    res.json({ success: true, data: r.data });
  } catch (err) {
    console.error('POST /api/reservations error', err);
    res.status(500).json({ success: false, error: 'Internal server error', details: err.message });
  }
});

// -------- Minimal HTML Frontend (optional) --------
app.get('/', (req, res) => {
  res.type('html').send(`
  <!doctype html>
  <html>
  <head>
    <meta charset="utf-8" />
    <title>Lodgix Quote</title>
    <style>
      body { font-family: Arial; background:#f7f7f7; display:flex; justify-content:center; align-items:center; height:100vh; margin:0; }
      .card { background:#fff; padding:24px; border-radius:12px; width:360px; box-shadow:0 8px 24px rgba(0,0,0,0.12); }
      h2 { margin: 0 0 12px; }
      label { display:block; font-size:12px; color:#555; margin-top:10px; }
      input { width:100%; padding:10px; margin-top:4px; box-sizing:border-box; }
      button { width:100%; margin-top:14px; padding:10px; background:#007bff; color:#fff; border:none; border-radius:6px; cursor:pointer; }
      button:hover { background:#0062cc; }
      .result { margin-top:14px; font-size:14px; }
      .muted { color:#777; font-size:12px; margin-top:6px; }
      pre { white-space:pre-wrap; word-wrap:break-word; background:#f3f3f3; padding:10px; border-radius:6px; }
    </style>
  </head>
  <body>
    <div class="card">
      <h2>🏠 Lodgix Quote</h2>
      <label>Property ID</label>
      <input type="number" id="property_id" placeholder="e.g. 62273" />
      <label>From date</label>
      <input type="date" id="from_date" />
      <label>To date</label>
      <input type="date" id="to_date" />
      <label>Adults</label>
      <input type="number" id="adults" min="0" value="2" />
      <label>Children</label>
      <input type="number" id="children" min="0" value="0" />
      <label>Pets</label>
      <input type="number" id="pets" min="0" value="0" />
      <button onclick="calc()">Calculate Quote</button>
      <div class="result" id="out"></div>
      <div class="muted">Uses POST /api/quotes/calculate</div>
    </div>
    <script>
      async function calc(){
        const out = document.getElementById('out');
        out.textContent = 'Calculating…';
        const payload = {
          property_id: Number(document.getElementById('property_id').value || 0),
          from_date: document.getElementById('from_date').value,
          to_date: document.getElementById('to_date').value,
          adults: Number(document.getElementById('adults').value || 0),
          children: Number(document.getElementById('children').value || 0),
          pets: Number(document.getElementById('pets').value || 0),
        };
        try {
          const resp = await fetch('/api/quotes/calculate', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
          const data = await resp.json();
          if(!resp.ok || data.success === false){
            out.innerHTML = '<span style="color:#b00020">❌ ' + (data.error || 'Quote failed') + '</span>' + (data.details ? '<pre>'+JSON.stringify(data.details,null,2)+'</pre>' : '');
            return;
          }
          const q = data.data || {};
          out.innerHTML = ''
            + '<div><strong>Nights:</strong> ' + (q.nights ?? '-') + ' </div>'
            + '<div><strong>Base Rate:</strong> $' + (q.base_rate ?? '-') + ' </div>'
            + '<div><strong>Total Tax:</strong> $' + (q.total_tax ?? '-') + ' </div>'
            + '<div><strong>Total Fees:</strong> $' + (q.total_fees ?? '-') + ' </div>'
            + '<div><strong>Total:</strong> <span style="color:green;font-weight:bold;">$' + (q.total ?? '-') + '</span></div>'
            + '<details style="margin-top:8px;"><summary>Raw response</summary><pre>' + JSON.stringify(q,null,2) + '</pre></details>';
        } catch (e){
          out.innerHTML = '<span style="color:#b00020">⚠️ Error calculating quote.</span>';
          console.error(e);
        }
      }
    </script>
  </body>
  </html>`);
});

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log(`[lodgixProxy] Listening on http://localhost:${PORT}`);
});
