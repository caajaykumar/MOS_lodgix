import { NextResponse } from 'next/server';
import LODGIX_CONFIG from '@/config/lodgix';

export async function GET(request, { params }) {
  // Await params for Next.js 15+
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  const photoId = resolvedParams?.photoId;
  if (!id || !photoId) {
    return NextResponse.json({ success: false, error: 'Property ID and Photo ID are required' }, { status: 400 });
  }
  const url = `${LODGIX_CONFIG.API_BASE_URL}/properties/${id}/photos/${photoId}/`;
  try {
    const resp = await fetch(url, { headers: LODGIX_CONFIG.getHeaders(), cache: 'no-store' });
    if (!resp.ok) {
      const text = await resp.text();
      let json;
      try { json = text ? JSON.parse(text) : {}; } catch { json = { raw: text }; }
      return NextResponse.json({ success: false, error: 'Failed to fetch photo', status: resp.status, details: json }, { status: resp.status });
    }
    const data = await resp.json();
    return NextResponse.json({ success: true, data });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Internal server error', details: e.message }, { status: 500 });
  }
}
