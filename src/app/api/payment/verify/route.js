import { NextResponse } from 'next/server';
import LODGIX_CONFIG from '@/config/lodgix';

// Runtime configuration
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Simple rate limiting (per reservation_id to prevent abuse)
const verificationAttempts = new Map();
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 60 * 1000; // 1 minute

function checkRateLimit(reservationId) {
  const now = Date.now();
  const key = `verify_${reservationId}`;
  
  // Clean old entries
  for (const [k, v] of verificationAttempts.entries()) {
    if (now - v.timestamp > WINDOW_MS) {
      verificationAttempts.delete(k);
    }
  }
  
  const record = verificationAttempts.get(key) || { count: 0, timestamp: now };
  
  if (now - record.timestamp > WINDOW_MS) {
    // Reset window
    verificationAttempts.set(key, { count: 1, timestamp: now });
    return true;
  }
  
  if (record.count >= MAX_ATTEMPTS) {
    return false;
  }
  
  verificationAttempts.set(key, { count: record.count + 1, timestamp: record.timestamp });
  return true;
}

/**
 * Secure payment verification endpoint
 * Fetches reservation from Lodgix API and calculates correct deposit amount server-side
 * 
 * Security features:
 * - Only accepts reservation_id (no client-provided amounts)
 * - Uses server-side API key (not exposed to client)
 * - Validates reservation existence
 * - Rate limits to prevent abuse
 * - Logs all attempts for audit trail
 */
export async function GET(request) {
  const startTime = Date.now();
  const { searchParams } = new URL(request.url);
  const reservationId = searchParams.get('reservation_id');
  
  // Log attempt
  console.log('[Payment Verify] Attempt:', {
    reservationId,
    ip: request.headers.get('x-forwarded-for') || 'unknown',
    timestamp: new Date().toISOString()
  });

  // Validation: reservation_id is required and must be numeric
  if (!reservationId) {
    return NextResponse.json(
      { success: false, error: 'Missing reservation_id' },
      { status: 400 }
    );
  }

  const reservationIdNum = Number(reservationId);
  if (!Number.isInteger(reservationIdNum) || reservationIdNum <= 0) {
    return NextResponse.json(
      { success: false, error: 'Invalid reservation_id format' },
      { status: 400 }
    );
  }

  // Rate limiting
  if (!checkRateLimit(reservationId)) {
    console.warn('[Payment Verify] Rate limit exceeded:', reservationId);
    return NextResponse.json(
      { success: false, error: 'Too many verification requests' },
      { status: 429 }
    );
  }

  try {
    // Fetch reservation from Lodgix API using server-side credentials
    const apiKey = LODGIX_CONFIG.getApiKey();
    if (!apiKey) {
      console.error('[Payment Verify] Missing Lodgix API key');
      return NextResponse.json(
        { success: false, error: 'Payment system configuration error' },
        { status: 500 }
      );
    }

    const lodgixUrl = `${LODGIX_CONFIG.API_BASE_URL}/reservations/${reservationId}/`;
    
    console.log('[Payment Verify] Fetching reservation from Lodgix:', lodgixUrl);
    
    const response = await fetch(lodgixUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      const status = response.status;
      console.error('[Payment Verify] Lodgix API error:', { status, reservationId });
      
      if (status === 404) {
        return NextResponse.json(
          { success: false, error: 'Reservation not found' },
          { status: 404 }
        );
      }
      
      if (status === 401) {
        console.error('[Payment Verify] Unauthorized - check API key');
        return NextResponse.json(
          { success: false, error: 'Payment system authentication error' },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { success: false, error: 'Unable to verify reservation' },
        { status: 500 }
      );
    }

    const reservation = await response.json();
    
    // Validate reservation has required fields
    if (!reservation || typeof reservation !== 'object') {
      console.error('[Payment Verify] Invalid reservation data');
      return NextResponse.json(
        { success: false, error: 'Invalid reservation data' },
        { status: 500 }
      );
    }

    // Extract total amount from reservation
    // The reservation object from Lodgix should contain gross/total
    const total = Number(
      reservation.gross ?? 
      reservation.total ?? 
      reservation.balance ?? 
      0
    );

    if (total <= 0) {
      console.error('[Payment Verify] Invalid total amount:', { reservationId, total });
      return NextResponse.json(
        { success: false, error: 'Invalid reservation total' },
        { status: 400 }
      );
    }

    // Calculate deposit amount (5% of total) - SERVER SIDE ONLY
    const depositAmount = total * 0.05;
    const depositAmountFixed = Number(depositAmount.toFixed(2));

    console.log('[Payment Verify] Success:', {
      reservationId,
      total,
      depositAmount: depositAmountFixed,
      duration: `${Date.now() - startTime}ms`
    });

    // Return only verified data - no client manipulation possible
    return NextResponse.json({
      success: true,
      data: {
        reservationId: reservation.id || reservationId,
        depositAmount: depositAmountFixed,
        total: Number(total.toFixed(2)),
        currency: 'USD',
        // Include basic reservation info for display (no sensitive data)
        dates: {
          checkIn: reservation.from_date,
          checkOut: reservation.to_date
        }
      }
    });

  } catch (error) {
    console.error('[Payment Verify] Error:', {
      reservationId,
      error: error.message,
      stack: error.stack
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Payment verification failed',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
