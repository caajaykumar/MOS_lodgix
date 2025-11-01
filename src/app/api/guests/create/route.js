import { NextResponse } from 'next/server';
import lodgixApi from '@/utils/lodgixApi';
import { validateGuestPayload } from '@/utils/validators';

export async function POST(request) {
  try {
    const payload = await request.json();
    const { valid, errors } = validateGuestPayload(payload);
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: errors }, { status: 400 });
    }

    const body = {
      first_name: payload.first_name,
      last_name: payload.last_name,
      title: payload.title || '',
      company: payload.company || 'myorlandostay_website',
      email: payload.email,
      address: {
        address1: payload.address?.address1 || '',
        address2: payload.address?.address2 || '',
        city: payload.address?.city || '',
        zip: payload.address?.zip || '',
        country: payload.address?.country || '',
        state: payload.address?.state || '',
        phone: payload.address?.phone || '',
        fax: payload.address?.fax || '',
        work_phone: payload.address?.work_phone || '',
        work_phone_ext: payload.address?.work_phone_ext || '',
      },
      status_id: payload.status_id ?? 0,
    };

    const resp = await lodgixApi.post('/guests/', body);
    if (resp.status >= 200 && resp.status < 300) {
      return NextResponse.json({ success: true, data: resp.data, message: 'Guest created successfully' });
    }

    return NextResponse.json(
      { success: false, error: resp.data?.error || 'Failed to create guest', details: resp.data },
      { status: resp.status || 502 }
    );
  } catch (error) {
    console.error('Guest create error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
