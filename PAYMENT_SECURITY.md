# Payment Security Implementation

## Overview

This system implements secure payment processing that prevents URL parameter tampering and ensures all payment amounts are verified server-side before processing.

## Security Features

### 1. **Server-Side Amount Verification**
- Payment amounts are **never** accepted from client-side code or URL parameters
- All amounts are calculated server-side from actual reservation data
- Prevents users from manipulating payment amounts via URL tampering

### 2. **Secure API Route: `/api/payment/verify`**
- Accepts only `reservation_id` parameter
- Fetches reservation data directly from Lodgix API using server-side credentials
- Calculates 5% deposit amount on the server
- Returns verified amount with reservation details

### 3. **Rate Limiting**
- Prevents abuse with 10 requests per minute per reservation
- Automatic cleanup of old rate limit entries
- Protects against DoS attacks

### 4. **Audit Logging**
- All verification attempts are logged with:
  - Reservation ID
  - Client IP address
  - Timestamp
  - Success/failure status

### 5. **Environment Variable Security**
- API keys stored in `.env.local` (not `.env` or with `NEXT_PUBLIC_` prefix)
- Server-side credentials never exposed to client
- Proper separation of public vs. private configuration

## API Endpoints

### GET `/api/payment/verify`

Verifies a reservation and returns the correct payment amount.

**Parameters:**
- `reservation_id` (required): The reservation ID to verify

**Response:**
```json
{
  "success": true,
  "data": {
    "reservationId": "88357862",
    "depositAmount": 28.15,
    "total": 563.00,
    "currency": "USD",
    "dates": {
      "checkIn": "2025-12-01",
      "checkOut": "2025-12-05"
    }
  }
}
```

**Error Responses:**
- `400` - Missing or invalid reservation_id
- `404` - Reservation not found
- `429` - Rate limit exceeded
- `500` - Server error

## Payment Flow

### Before (Insecure)
```
1. User clicks payment link with amount in URL
   /payment?reservation_id=123&amount=13.15
   
2. Payment page uses amount from URL directly
   ❌ User can change amount to any value
   
3. Payment processed with tampered amount
   ❌ Financial loss risk
```

### After (Secure)
```
1. User clicks payment link with only reservation ID
   /payment?reservation_id=123
   
2. Payment page calls /api/payment/verify
   ✓ Server fetches reservation from Lodgix
   ✓ Server calculates correct 5% deposit
   
3. Page displays verified amount
   ✓ User cannot modify amount
   
4. Payment processed with verified amount
   ✓ Amount guaranteed to be correct
```

## Implementation Details

### Payment Page (`/payment/page.jsx`)

1. **Removes amount from URL query parameters**
2. **Fetches verified amount on mount** using `/api/payment/verify`
3. **Disables form** until verification completes
4. **Validates** that verified data exists before submission
5. **Uses only server-verified amount** in payment request

### Verification API (`/api/payment/verify/route.js`)

1. **Validates** reservation_id format (must be positive integer)
2. **Checks rate limit** for the reservation
3. **Fetches reservation** from Lodgix API using server credentials
4. **Calculates deposit** (5% of total) server-side
5. **Returns verified data** with audit logging

## Environment Configuration

### Required in `.env.local`:

```bash
# Lodgix API - Server-side only (no NEXT_PUBLIC_ prefix)
LODGIX_API_KEY=your_actual_api_key_here
NEXT_PUBLIC_LODGIX_API_KEY=your_actual_api_key_here

# Authorize.Net - Server-side credentials
AUTHORIZENET_API_LOGIN_ID=your_login_id
AUTHORIZENET_TRANSACTION_KEY=your_transaction_key
AUTHORIZENET_ENVIRONMENT=sandbox

# Client-side Accept.js credentials
NEXT_PUBLIC_AUTHORIZENET_API_LOGIN_ID=your_login_id
NEXT_PUBLIC_AUTHORIZENET_PUBLIC_CLIENT_KEY=your_public_key
NEXT_PUBLIC_AUTHORIZENET_API_URL=https://apitest.authorize.net/xml/v1/request.api
NEXT_PUBLIC_ACCEPT_JS_URL=https://jstest.authorize.net/v1/Accept.js
```

**Security Notes:**
- Never use `NEXT_PUBLIC_` prefix for API keys that should remain server-side
- `.env.local` is gitignored by default - never commit it
- Use different keys for sandbox vs. production

## Testing

### Test the Security Fix:

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Try to tamper with URL:**
   - Navigate to: `/payment?reservation_id=88357862&amount=1.00`
   - The `amount=1.00` parameter will be **ignored**
   - Page will fetch and display the correct verified amount from server

3. **Check verification:**
   - Open browser DevTools → Network tab
   - Watch for request to `/api/payment/verify?reservation_id=88357862`
   - Verify response contains correct calculated amount

4. **Test payment submission:**
   - Fill in payment form with test card: `4111111111111111`
   - Verify amount submitted matches server-verified amount (check Network tab)

### Expected Console Logs:

```
[Payment Verify] Attempt: { reservationId: '88357862', ip: '::1', timestamp: '...' }
[Payment Verify] Fetching reservation from Lodgix: https://www.lodgix.com/public-api/v2/reservations/88357862/
[Payment Verify] Success: { reservationId: '88357862', total: 563, depositAmount: 28.15, duration: '245ms' }
[Payment] Verifying reservation: 88357862
[Payment] Verification successful: { reservationId: '88357862', depositAmount: 28.15, ... }
```

## Security Best Practices Applied

✅ **Never trust client data for payment amounts**  
✅ **Server-side validation and calculation**  
✅ **Rate limiting to prevent abuse**  
✅ **Audit logging for all attempts**  
✅ **Secure credential storage**  
✅ **Input validation (reservation_id format)**  
✅ **Error handling without exposing sensitive info**  
✅ **HTTPS-only in production**

## Monitoring and Maintenance

### What to Monitor:

1. **Rate limit violations** - May indicate attack attempts
2. **Failed verifications** - Could indicate integration issues
3. **Amount discrepancies** - Should never occur with this system
4. **API response times** - Track Lodgix API performance

### Logs to Review:

```bash
# Check verification logs
grep "[Payment Verify]" logs/app.log

# Check for rate limiting
grep "Rate limit exceeded" logs/app.log

# Check for errors
grep "ERROR" logs/app.log | grep payment
```

## Migration Guide

If you have existing payment links with amount parameters:

1. **Old links will still work** - amount parameter is simply ignored
2. **Update link generation** to remove amount parameter:
   ```javascript
   // Before
   `/payment?reservation_id=${id}&amount=${amount}`
   
   // After
   `/payment?reservation_id=${id}`
   ```

3. **No database changes required** - purely server-side implementation

## FAQ

**Q: What if Lodgix API is down?**  
A: Payment page will show verification error with retry button. User cannot proceed without verification.

**Q: Can users still see reservation amounts?**  
A: Yes, but they cannot modify the payment amount. Display-only data is safe.

**Q: What about cached amounts?**  
A: Verification API uses `cache: 'no-store'` to always fetch fresh data.

**Q: How do I test in production?**  
A: Change `AUTHORIZENET_ENVIRONMENT=production` and use production credentials.

## Support

For issues or questions:
- Check console logs for detailed error messages
- Verify environment variables are set correctly
- Ensure Lodgix API key is valid and has correct permissions
- Contact support if reservation verification consistently fails
