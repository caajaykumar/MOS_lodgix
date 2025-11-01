// Server-side Authorize.Net charge using Accept.js opaqueData
// Uses env: NEXT_PUBLIC_AUTHORIZENET_API_LOGIN_ID, AUTHORIZENET_TRANSACTION_KEY, NEXT_PUBLIC_AUTHORIZENET_API_URL

const API_URL = process.env.NEXT_PUBLIC_AUTHORIZENET_API_URL || 'https://apitest.authorize.net/xml/v1/request.api';

function assertPositiveAmount(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) throw new Error('Amount must be > 0');
  return Number(n.toFixed(2));
}

export async function processPayment({ paymentNonce, amount, customerInfo, bookingReference }) {
  const name = process.env.NEXT_PUBLIC_AUTHORIZENET_API_LOGIN_ID;
  const transactionKey = process.env.AUTHORIZENET_TRANSACTION_KEY;
  if (!name || !transactionKey) throw new Error('Authorize.Net credentials are not configured');
  if (!paymentNonce?.dataDescriptor || !paymentNonce?.dataValue) throw new Error('Missing payment token');
  const amt = assertPositiveAmount(amount);

  const payload = {
    createTransactionRequest: {
      merchantAuthentication: { name, transactionKey },
      transactionRequest: {
        transactionType: 'authCaptureTransaction',
        amount: amt.toFixed(2),
        payment: { opaqueData: { dataDescriptor: paymentNonce.dataDescriptor, dataValue: paymentNonce.dataValue } },
        order: bookingReference ? { invoiceNumber: String(bookingReference).slice(0,20) } : undefined,
        customer: customerInfo ? { email: customerInfo.email, phoneNumber: customerInfo.phone, id: customerInfo.name } : undefined,
        duplicateWindow: 120,
      },
    },
  };

  const resp = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), cache: 'no-store' });
  const data = await resp.json().catch(() => ({}));
  const resultCode = data?.messages?.resultCode;
  const tr = data?.transactionResponse || {};
  const responseCode = String(tr?.responseCode || '');
  const transId = tr?.transId ? String(tr.transId) : '';
  const authCode = tr?.authCode || '';
  const avsResponse = tr?.avsResultCode || '';
  const cvvResponse = tr?.cvvResultCode || '';
  const message = tr?.messages?.[0]?.description || data?.messages?.message?.[0]?.text || 'Unknown response';
  const errorText = tr?.errors?.[0]?.errorText || data?.messages?.message?.[0]?.text;

  if (resultCode === 'Ok' && responseCode === '1' && transId) {
    return { transactionId: transId, responseCode, authCode, avsResponse, cvvResponse, message };
  }
  const err = new Error(errorText || `Payment failed with code ${responseCode}`);
  err.responseCode = responseCode;
  err.raw = data;
  throw err;
}
