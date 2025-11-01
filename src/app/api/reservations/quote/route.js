import { NextResponse } from 'next/server';
import LODGIX_CONFIG from '@/config/lodgix';

export async function POST(request) {
  try {
    const payload = await request.json();
    // Basic validation
    const required = ['from_date', 'to_date', 'adults', 'children', 'pets', 'property_id'];
    for (const k of required) {
      if (payload[k] === undefined || payload[k] === null || payload[k] === '') {
        return NextResponse.json({ success: false, error: `Missing field: ${k}` }, { status: 400 });
      }
    }

    const url = `${LODGIX_CONFIG.API_BASE_URL}/reservations/quote/`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: LODGIX_CONFIG.getHeaders(),
      body: JSON.stringify(payload),
      cache: 'no-store',
      next: { revalidate: 0 },
    });
    let data;
    const ct = resp.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      try { data = await resp.json(); } catch (_) { data = null; }
    } else {
      try { data = { raw: await resp.text() }; } catch (_) { data = null; }
    }

    if (!resp.ok) {
      console.error('Lodgix POST /reservations/quote error', { status: resp.status, data, payload });
      return NextResponse.json(
        { success: false, error: data?.message || data?.error || 'Failed to get quote', details: data },
        { status: resp.status }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Quote route error', error);
    return NextResponse.json({ success: false, error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
