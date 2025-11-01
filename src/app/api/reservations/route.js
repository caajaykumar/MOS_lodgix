import { NextResponse } from 'next/server';
import LODGIX_CONFIG from '@/config/lodgix';

// Simple in-memory rate limiting
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10; // Max requests per minute per IP

export async function POST(request) {
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
    if (clientRate.count >= MAX_REQUESTS) {
      return NextResponse.json(
        { success: false, error: 'Too many requests', retryAfter: Math.ceil((clientRate.timestamp + RATE_LIMIT_WINDOW - now) / 1000) },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((clientRate.timestamp + RATE_LIMIT_WINDOW - now) / 1000)) } }
      );
    }
    rateLimit.set(clientIP, { count: clientRate.count + 1, timestamp: clientRate.timestamp });
  }

  try {
    const bookingData = await request.json();
    
    // Validate required fields
    if (!bookingData.from_date || !bookingData.to_date || !bookingData.guest_id || !bookingData.entities?.[0]?.property_id) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const url = `${LODGIX_CONFIG.API_BASE_URL}/reservations/`;
    const options = {
      method: 'POST',
      headers: LODGIX_CONFIG.getHeaders(),
      body: JSON.stringify(bookingData),
      cache: 'no-store',
      next: { revalidate: 0 }
    };

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      console.error('Lodgix API Error:', data);
      return NextResponse.json(
        { 
          success: false, 
          error: data.message || 'Failed to create reservation',
          details: data
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Reservation created successfully'
    });

  } catch (error) {
    console.error('Error creating reservation:', error);
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
