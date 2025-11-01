import { NextResponse } from 'next/server';
import lodgixApi from '@/utils/lodgixApi';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json(
      { success: false, error: 'Email is required' },
      { status: 400 }
    );
  }

  try {
    const resp = await lodgixApi.get('/guests/', { params: { email } });
    if (resp.status >= 200 && resp.status < 300) {
      const data = Array.isArray(resp.data) ? resp.data : resp.data?.results || [];
      return NextResponse.json({ success: true, data: data[0] || null });
    }
    return NextResponse.json(
      { success: false, error: resp.data?.error || 'Failed to fetch guest', details: resp.data },
      { status: resp.status || 502 }
    );
  } catch (error) {
    console.error('Guest check error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
