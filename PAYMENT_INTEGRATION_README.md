# Authorize.Net Payment Integration

This document explains the 5% payment charge integration using Authorize.Net on the checkout page and booking confirmation page.

## Overview

When a customer completes a reservation, they are prompted to pay a 5% payment charge of the total booking amount using Authorize.Net payment gateway. The payment can be made on either:
1. **Checkout Page**: Immediately after booking confirmation (recommended flow)
2. **Booking Confirmation Page**: As a fallback option

## Features

- **5% Payment Charge**: Automatically calculates and displays 5% payment charge on checkout
- **Integrated Checkout Flow**: Payment modal appears immediately after booking confirmation
- **Secure Payment Processing**: Uses Authorize.Net's secure payment gateway
- **Real-time Validation**: Client-side validation for card details
- **Payment Status Tracking**: Shows pending/paid status throughout the flow
- **User-Friendly Modal**: Clean, modern payment form with proper formatting
- **Error Handling**: Comprehensive error messages for failed transactions
- **Booking Summary Update**: Shows payment charge breakdown in booking summary

## Setup Instructions

### 1. Install Dependencies

The `authorizenet` package is already included in `package.json`. If you need to reinstall:

```bash
npm install authorizenet
```

### 2. Configure Environment Variables

Create or update your `.env.local` file with your Authorize.Net credentials:

```env
AUTHORIZENET_API_LOGIN_ID=your_api_login_id
AUTHORIZENET_TRANSACTION_KEY=your_transaction_key
AUTHORIZENET_ENVIRONMENT=sandbox
```

**Important**: 
- Use `sandbox` for testing
- Use `production` for live transactions
- Never commit your `.env.local` file to version control

### 3. Get Authorize.Net Credentials

#### For Sandbox (Testing):
1. Go to https://developer.authorize.net/
2. Sign up for a sandbox account
3. Get your API Login ID and Transaction Key from the account dashboard

#### For Production:
1. Sign up at https://www.authorize.net/
2. Complete merchant account setup
3. Get your production API Login ID and Transaction Key

### 4. Test Cards for Sandbox

Use these test card numbers in sandbox mode:

| Card Type | Card Number      | CVV | Expiration |
|-----------|------------------|-----|------------|
| Visa      | 4007000000027    | 123 | Any future |
| Mastercard| 5424000000000015 | 123 | Any future |
| Amex      | 370000000000002  | 1234| Any future |

## File Structure

```
src/
├── app/
│   ├── api/
│   │   └── payment/
│   │       └── authorize/
│   │           └── route.js          # Payment API endpoint
│   ├── booking-confirmation/
│   │   └── page.jsx                  # Confirmation page with payment
│   └── components/
│       └── PaymentModal/
│           ├── PaymentModal.jsx      # Payment form component
│           └── PaymentModal.module.css # Styles
```

## How It Works

### 1. Checkout Page
- Displays booking summary with 5% payment charge breakdown
- Shows: Subtotal → Payment Charge (5%) → Grand Total
- After clicking "Complete Booking", reservation is created
- Payment modal automatically appears after successful booking

### 2. Payment Modal
- Opens when user clicks "Pay Deposit" button
- Collects card information:
  - Card number (formatted with spaces)
  - Expiration date (MM/YY format)
  - CVV (3-4 digits)
  - Cardholder name
- Validates all inputs before submission
- Shows loading state during processing

### 3. Payment Processing
- Sends encrypted payment data to `/api/payment/authorize`
- API route communicates with Authorize.Net
- Returns transaction ID and status
- Updates UI based on success/failure

### 4. Success State
- Shows success message in modal
- Updates payment status to "Paid"
- Automatically redirects to booking confirmation page
- Confirmation page shows payment completed status

## API Endpoint

### POST `/api/payment/authorize`

**Request Body:**
```json
{
  "cardNumber": "4007000000027",
  "expirationDate": "1225",
  "cardCode": "123",
  "amount": "50.00",
  "firstName": "John",
  "lastName": "Doe",
  "reservationId": "88346801"
}
```

**Success Response:**
```json
{
  "success": true,
  "transactionId": "12345678",
  "responseCode": "1",
  "messageCode": "1",
  "description": "This transaction has been approved.",
  "authCode": "ABC123",
  "amount": "50.00"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "The credit card number is invalid.",
  "errorCode": "6"
}
```

## Security Features

1. **Rate Limiting**: Maximum 5 payment requests per minute per IP
2. **Server-side Processing**: Card data never stored on your server
3. **PCI Compliance**: Authorize.Net handles card data securely
4. **Environment Variables**: Sensitive credentials stored securely
5. **HTTPS Required**: All payment transactions must use HTTPS in production

## Testing

### Test Successful Payment:
1. Go to checkout page and fill in all required details
2. Click "Complete Booking" button
3. Wait for reservation confirmation
4. Payment modal will automatically appear
5. Enter test card: `4007000000027`
6. Enter expiration: `12/25`
7. Enter CVV: `123`
8. Enter name: `Test User`
9. Click "Pay" button
10. Should see success message and redirect to confirmation page

### Test Failed Payment:
Use card number `4222222222222` to simulate a declined transaction.

## Troubleshooting

### Payment Gateway Not Configured
**Error**: "Payment gateway not configured"
**Solution**: Check that `AUTHORIZENET_API_LOGIN_ID` and `AUTHORIZENET_TRANSACTION_KEY` are set in `.env.local`

### Invalid Credentials
**Error**: "The merchant login ID or password is invalid"
**Solution**: Verify your API credentials are correct for the environment (sandbox/production)

### Transaction Declined
**Error**: Various decline messages
**Solution**: 
- Check card number is valid
- Verify expiration date is in the future
- Ensure CVV is correct
- In sandbox, use test card numbers

### Rate Limit Exceeded
**Error**: "Too many payment requests"
**Solution**: Wait 1 minute before trying again

## Going Live

Before switching to production:

1. **Update Environment Variable**:
   ```env
   AUTHORIZENET_ENVIRONMENT=production
   ```

2. **Use Production Credentials**:
   - Replace sandbox API Login ID
   - Replace sandbox Transaction Key

3. **Test Thoroughly**:
   - Test with real cards (small amounts)
   - Verify transactions appear in Authorize.Net dashboard
   - Test refund process if needed

4. **Enable HTTPS**:
   - Ensure your site uses HTTPS
   - Never process payments over HTTP

5. **Monitor Transactions**:
   - Check Authorize.Net dashboard regularly
   - Set up email notifications for transactions
   - Monitor for suspicious activity

## Support

- **Authorize.Net Documentation**: https://developer.authorize.net/api/reference/
- **Authorize.Net Support**: https://support.authorize.net/
- **Test Account**: https://sandbox.authorize.net/

## Notes

- The payment integration charges exactly 5% of the total booking amount as a payment processing fee
- The 5% charge is displayed in the booking summary on the checkout page
- Transaction details are logged to console for debugging
- Payment modal appears automatically after successful booking
- Payment status is stored in component state (consider persisting to database)
- After successful payment, user is redirected to confirmation page
- Consider adding email notifications for successful payments
- Consider updating reservation status in Lodgix API after successful payment
