import { NextResponse } from 'next/server';

// Ensure this route runs on Node.js (not Edge) and stays dynamic
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Rate limiting
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5; // Max payment requests per minute per IP

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
        { success: false, error: 'Too many payment requests', retryAfter: Math.ceil((clientRate.timestamp + RATE_LIMIT_WINDOW - now) / 1000) },
        { status: 429 }
      );
    }
    rateLimit.set(clientIP, { count: clientRate.count + 1, timestamp: clientRate.timestamp });
  }

  try {
    const paymentData = await request.json();
    
    // Validate required fields
    const { cardNumber, expirationDate, cardCode, amount, firstName, lastName, reservationId } = paymentData;
    
    if (!cardNumber || !expirationDate || !cardCode || !amount || !firstName || !lastName) {
      return NextResponse.json(
        { success: false, error: 'Missing required payment fields' },
        { status: 400 }
      );
    }

    // Validate amount (should be 5% of total)
    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment amount' },
        { status: 400 }
      );
    }

    // Get Authorize.Net credentials from environment variables
    const apiLoginId = process.env.AUTHORIZENET_API_LOGIN_ID;
    const transactionKey = process.env.AUTHORIZENET_TRANSACTION_KEY;
    const environment = process.env.AUTHORIZENET_ENVIRONMENT || 'sandbox'; // 'sandbox' or 'production'

    if (!apiLoginId || !transactionKey) {
      console.error('Authorize.Net credentials not configured');
      return NextResponse.json(
        { success: false, error: 'Payment gateway not configured' },
        { status: 500 }
      );
    }

    console.log('[Payment] Processing payment:', { 
      amount, 
      environment, 
      reservationId,
      hasCredentials: Boolean(apiLoginId && transactionKey)
    });

    // Direct API endpoint (more reliable than SDK)
    const apiUrl = environment === 'production' 
      ? 'https://api.authorize.net/xml/v1/request.api'
      : 'https://apitest.authorize.net/xml/v1/request.api';

    // Build the JSON request payload directly (matching Authorize.Net schema)
    const requestPayload = {
      createTransactionRequest: {
        merchantAuthentication: {
          name: apiLoginId,
          transactionKey: transactionKey
        },
        transactionRequest: {
          transactionType: 'authCaptureTransaction',
          amount: amount.toString(),
          payment: {
            creditCard: {
              cardNumber: cardNumber,
              expirationDate: expirationDate,
              cardCode: cardCode
            }
          },
          order: {
            invoiceNumber: reservationId || `RES-${Date.now()}`,
            description: `5% Deposit for Reservation ${reservationId || ''}`
          },
          billTo: {
            firstName: firstName,
            lastName: lastName
          }
        }
      }
    };

    console.log('[Payment] Sending request to:', apiUrl);

    // Make direct HTTP request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestPayload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const data = await response.json();
      console.log('[Payment] Response received:', { 
        resultCode: data?.messages?.resultCode,
        hasTransaction: !!data?.transactionResponse 
      });

      // Check if the response indicates success
      if (data?.messages?.resultCode === 'Ok') {
        const txResponse = data.transactionResponse;
        
        if (txResponse?.messages) {
          // Payment successful
          console.log('[Payment] Transaction approved:', txResponse.transId);
          return NextResponse.json({
            success: true,
            transactionId: txResponse.transId,
            responseCode: txResponse.responseCode,
            messageCode: txResponse.messages[0]?.code,
            description: txResponse.messages[0]?.description,
            authCode: txResponse.authCode,
            amount: amount
          });
        } else if (txResponse?.errors) {
          // Transaction failed with error
          const error = txResponse.errors[0];
          console.error('[Payment] Transaction error:', error);
          return NextResponse.json({
            success: false,
            error: error?.errorText || 'Transaction failed',
            errorCode: error?.errorCode
          }, { status: 400 });
        }
      }

      // API call failed
      const errorMsg = data?.messages?.message?.[0];
      console.error('[Payment] API error:', errorMsg);
      return NextResponse.json({
        success: false,
        error: errorMsg?.text || 'Payment failed',
        errorCode: errorMsg?.code
      }, { status: 400 });

    } catch (err) {
      clearTimeout(timeoutId);
      
      if (err.name === 'AbortError') {
        console.error('[Payment] Request timeout after 15s');
        return NextResponse.json({
          success: false,
          error: 'Payment gateway timeout. Please check your internet connection and try again.'
        }, { status: 504 });
      }
      
      throw err;
    }

  } catch (error) {
    console.error('Payment processing error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Payment processing failed',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
