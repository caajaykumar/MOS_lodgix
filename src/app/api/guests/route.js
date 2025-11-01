import { NextResponse } from 'next/server';
import lodgixApi from '@/utils/lodgixApi';
import { validateGuestPayload } from '@/utils/validators';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const limit = searchParams.get('limit') || undefined;
  const offset = searchParams.get('offset') || undefined;

  try {
    const params = {};
    if (email) params.email = email;
    if (limit) params.limit = limit;
    if (offset) params.offset = offset;

    const resp = await lodgixApi.get('/guests/', { params });
    if (resp.status >= 200 && resp.status < 300) {
      // If email provided, keep legacy behavior: return first match
      if (email) {
        const list = Array.isArray(resp.data) ? resp.data : resp.data?.results || [];
        return NextResponse.json({ success: true, data: list[0] || null, results: list });
      }
      // No email: return full paginated object as-is
      return NextResponse.json({ success: true, data: resp.data });
    }
    console.error('Lodgix GET /guests error', { status: resp.status, data: resp.data, params });
    return NextResponse.json(
      { success: false, error: resp.data?.error || 'Failed to fetch guests', details: resp.data },
      { status: resp.status || 502 }
    );
  } catch (error) {
    console.error('Error fetching guests:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const payload = await request.json();
    const { valid, errors } = validateGuestPayload(payload);
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: errors }, { status: 400 });
    }

    // Normalize title to Lodgix sysnames
    const normalizeTitle = (t) => {
      const s = String(t || '').trim().toLowerCase();
      if (!s) return 'MISTER';
      // direct sysnames
      if (['dr','miss','missis','mister','mrmrs'].includes(s)) return s.toUpperCase();
      // common variants
      if (['mr','mr.','mister','sir'].includes(s)) return 'MISTER';
      if (['ms','ms.','miss'].includes(s)) return 'MISS';
      if (['mrs','mrs.','missis'].includes(s)) return 'MISSIS';
      if (['dr.','doc','doctor'].includes(s)) return 'DR';
      if (['mr & mrs','mr and mrs','mr&mrs','mr+mrs','mr mrs'].includes(s)) return 'MRMRS';
      return 'MISTER';
    };

    // Map to Lodgix expected schema with adjustments
    const body = {
      first_name: payload.first_name,
      last_name: payload.last_name,
      // Title must be one of Lodgix sysnames
      title: normalizeTitle(payload.title),
      company: payload.company || 'myorlandostay_website',
      email: payload.email,
      address: {
        address1: payload.address?.address1 || '',
        address2: payload.address?.address2 || '',
        city: payload.address?.city || '',
        zip: payload.address?.zip || '',
        country: payload.address?.country || '',
        state: payload.address?.state || '',
        fax: payload.address?.fax || '',
        work_phone: payload.address?.work_phone || '',
        work_phone_ext: payload.address?.work_phone_ext || '',
      },
    };
    // Only include phone if it sanitizes to 7-15 digits
    if (payload.address?.phone && String(payload.address.phone).trim()) {
      const digits = String(payload.address.phone).replace(/\D/g, '');
      if (digits.length >= 7 && digits.length <= 15) {
        body.address.phone = digits;
      }
    }
    // Only include status_id if it's a valid positive integer
    const statusIdNum = Number(payload.status_id);
    if (Number.isInteger(statusIdNum) && statusIdNum > 0) {
      body.status_id = statusIdNum;
    }

    const resp = await lodgixApi.post('/guests/', body);
    if (resp.status >= 200 && resp.status < 300) {
      return NextResponse.json({ success: true, data: resp.data, message: 'Guest created successfully' });
    }
    // Axios instance normalizes network errors to { status: 0, data: { error, message } }
    const details = resp?.data ?? null;
    const hint = (!process.env.LODGIX_API_KEY && !process.env.NEXT_PUBLIC_LODGIX_API_KEY)
      ? 'Missing API key in server environment'
      : undefined;
    console.error('Lodgix POST /guests error', { status: resp.status, data: details, payload: body });
    return NextResponse.json(
      { success: false, error: details?.message || details?.error || 'Failed to create guest', details, hint },
      { status: resp.status || 502 }
    );
  } catch (error) {
    console.error('Error creating guest:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
