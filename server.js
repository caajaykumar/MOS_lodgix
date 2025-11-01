// Express backend for Guest Registration
// Run with: node server.js (ensure dependencies: express, axios, cors, dotenv)

const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// CORS: allow all in dev, restrict in prod via env
app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: false,
}));

app.use(express.json());

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// POST /api/guests - forwards to Lodgix API (not used by Next.js routes; keep for local testing)
app.post('/api/guests', async (req, res) => {
  try {
    const token = process.env.LODGIX_API_KEY || process.env.NEXT_PUBLIC_LODGIX_API_KEY;
    if (!token) {
      return res.status(500).json({ success: false, error: 'Missing LODGIX_API_KEY in environment' });
    }

    const payload = req.body || {};

    // Basic server-side validation for required fields
    const required = ['first_name', 'last_name', 'title', 'email'];
    const missing = required.filter((k) => !payload[k] || `${payload[k]}`.trim() === '');
    if (missing.length) {
      return res.status(400).json({ success: false, error: `Missing required fields: ${missing.join(', ')}` });
    }

    // Forward to Lodgix API (Token auth)
    const lodgixUrl = 'https://www.lodgix.com/public-api/v2/guests/';
    const lodgixResp = await axios.post(lodgixUrl, payload, {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 15000,
      validateStatus: () => true,
    });

    if (lodgixResp.status >= 200 && lodgixResp.status < 300) {
      return res.status(200).json({ success: true, data: lodgixResp.data });
    }

    return res.status(lodgixResp.status).json({
      success: false,
      error: lodgixResp.data?.error || 'Failed to create guest',
      details: lodgixResp.data,
    });
  } catch (err) {
    console.error('Error forwarding to Lodgix:', err?.response?.data || err.message);
    return res.status(500).json({ success: false, error: 'Server error forwarding request' });
  }
});

app.listen(PORT, () => {
  console.log(`Guest API server running on http://localhost:${PORT}`);
});
