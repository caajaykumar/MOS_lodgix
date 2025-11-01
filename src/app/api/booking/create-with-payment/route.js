import { NextResponse } from 'next/server';
import { processPayment } from '@/lib/authorize-net';
import LODGIX_CONFIG from '@/config/lodgix';

async function voidAuthorizeNetTransaction(transId) {
  const name = process.env.NEXT_PUBLIC_AUTHORIZENET_API_LOGIN_ID;
  const transactionKey = process.env.AUTHORIZENET_TRANSACTION_KEY;
  const API_URL = process.env.NEXT_PUBLIC_AUTHORIZENET_API_URL || 'https://apitest.authorize.net/xml/v1/request.api';
  if (!name || !transactionKey || !transId) return { ok: false };
  const payload = {
    createTransactionRequest: {
      merchantAuthentication: { name, transactionKey },
      transactionRequest: { transactionType: 'voidTransaction', refTransId: String(transId) },
    },
  };
  try {
    const r = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const j = await r.json().catch(() => ({}));
    const ok = j?.messages?.resultCode === 'Ok';
    return { ok, raw: j };
  } catch { return { ok: false }; }
}

function validate(body) {
  const errors = [];
  if (!body?.paymentNonce?.dataDescriptor || !body?.paymentNonce?.dataValue) errors.push('paymentNonce');
  const b = body?.bookingDetails || {};
  const required = ['propertyId','checkIn','checkOut','guestName','guestEmail','adults','children','totalAmount'];
  for (const k of required) if (b[k] === undefined || b[k] === null || b[k] === '') errors.push(`bookingDetails.${k}`);
  if (Number(b.totalAmount) <= 0) errors.push('bookingDetails.totalAmount');
  return errors;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const errors = validate(body);
    if (errors.length) return NextResponse.json({ success:false, message:'Validation error', errors }, { status: 400 });

    const { paymentNonce, bookingDetails } = body;
    const amount = Number(bookingDetails.totalAmount);

    const customerInfo = { name: bookingDetails.guestName, email: bookingDetails.guestEmail, phone: bookingDetails.guestPhone };
    const bookingReference = `ORD-${Date.now()}`;

    const pay = await processPayment({ paymentNonce, amount, customerInfo, bookingReference });

    const reservationPayload = {
      from_date: bookingDetails.checkIn,
      to_date: bookingDetails.checkOut,
      adults: Number(bookingDetails.adults) || 1,
      children: Number(bookingDetails.children) || 0,
      pets: Number(bookingDetails.pets) || 0,
      guest_id: bookingDetails.guestId || undefined,
      stay_type: 'GUEST',
      entities: [{ property_id: Number(bookingDetails.propertyId) || 0, room_ids: [] }],
      discount_code: bookingDetails.discountCode || undefined,
      special_requests: bookingDetails.specialRequests || '',
      payment: { transactionId: pay.transactionId, amount: amount, method: 'authorize_net' },
      quote_id: bookingDetails.quoteId || undefined,
    };

    const url = `${LODGIX_CONFIG.API_BASE_URL}/reservations/`;
    const resp = await fetch(url, { method:'POST', headers: LODGIX_CONFIG.getHeaders(), body: JSON.stringify(reservationPayload), cache:'no-store' });
    const data = await resp.json().catch(()=>({}));
    if (!resp.ok) {
      await voidAuthorizeNetTransaction(pay.transactionId);
      return NextResponse.json({ success:false, message: data?.message || 'Reservation failed', errors:[data] }, { status: resp.status });
    }

    return NextResponse.json({ success:true, transactionId: pay.transactionId, reservationId: data?.id || data?.reservation_number, confirmationNumber: data?.confirmation_number || data?.id, message: 'Booking confirmed' });
  } catch (e) {
    return NextResponse.json({ success:false, message: e.message || 'Server error' }, { status: 500 });
  }
}
