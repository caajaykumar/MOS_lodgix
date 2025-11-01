import { NextResponse } from 'next/server';
import LODGIX_CONFIG from '@/config/lodgix';

// Simple in-memory rate limiting
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 1000; // Disabled throttling for server-side enrichment

export async function GET(request, { params }) {
  // Get client IP for rate limiting
  const clientIP = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const now = Date.now();
  
  // Clean up old rate limit entries
  for (const [ip, { timestamp }] of rateLimit.entries()) {
    if (now - timestamp > RATE_LIMIT_WINDOW) {
      rateLimit.delete(ip);
    }
  }

  // Check rate limit
  const clientRate = rateLimit.get(clientIP) || { count: 0, timestamp: now };
  if (now - clientRate.timestamp > RATE_LIMIT_WINDOW) {
    rateLimit.set(clientIP, { count: 1, timestamp: now });
  } else {
    // Disabled 429 to allow batch enrichment
    rateLimit.set(clientIP, { count: Math.min(clientRate.count + 1, MAX_REQUESTS), timestamp: clientRate.timestamp });
  }

  // Get property ID from params (await for Next.js 15+)
  const resolvedParams = await params;
  const id = resolvedParams?.id;

  if (!id) {
    return NextResponse.json(
      { success: false, error: 'Property ID is required' },
      { status: 400 }
    );
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '0');
  let nextUrl = `${LODGIX_CONFIG.API_BASE_URL}/properties/${id}/photos/`;
  const options = {
    method: 'GET',
    headers: LODGIX_CONFIG.getHeaders(),
    cache: 'no-store',
    next: { revalidate: 0 }
  };

  try {
    let aggregated = [];
    let foundCover = null;
    let safety = 0;
    while (nextUrl && safety < 20) {
      safety++;
      const response = await fetch(nextUrl, options);
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error ${response.status} for property ${id}:`, errorText);
        let errorData;
        try { errorData = errorText ? JSON.parse(errorText) : {}; } catch (e) { errorData = { raw: errorText }; }
        return NextResponse.json(
          { success: false, error: 'Failed to fetch property photos', status: response.status, details: errorData },
          { status: response.status }
        );
      }
      const data = await response.json();
      const results = Array.isArray(data) ? data : (data.results || []);
      // Track cover if present on this page
      if (!foundCover) {
        foundCover = results.find(p => p && p.is_cover);
        if (foundCover && limit === 1) {
          // We can stop early if we only need one and it's the cover
          const chosen = foundCover;
          return NextResponse.json({ success: true, data: [chosen] });
        }
      }
      aggregated = aggregated.concat(results);
      nextUrl = (Array.isArray(data) ? null : (data.next || null));
      if (limit > 0 && aggregated.length >= limit && !foundCover) {
        break;
      }
    }

    // Sort: prefer cover/primary photo, then by order_no
    const sorted = [...aggregated].sort((a, b) => {
      const aCover = (a?.is_cover || a?.is_primary) ? 1 : 0;
      const bCover = (b?.is_cover || b?.is_primary) ? 1 : 0;
      if (aCover !== bCover) return bCover - aCover; // cover/primary first
      const ao = (a?.order_no ?? Number.MAX_SAFE_INTEGER);
      const bo = (b?.order_no ?? Number.MAX_SAFE_INTEGER);
      return ao - bo;
    });

    const limited = limit > 0 ? sorted.slice(0, limit) : sorted;
    return NextResponse.json({ success: true, data: limited });

  } catch (error) {
    console.error('Error fetching property photos:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    );
  }
}
