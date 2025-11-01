import { NextResponse } from 'next/server';
import LODGIX_CONFIG from '@/config/lodgix';

export async function GET() {
  const url = `${LODGIX_CONFIG.API_BASE_URL}/properties/`;
  const options = {
    method: 'GET',
    headers: LODGIX_CONFIG.getHeaders(),
    cache: 'no-store',
    next: { revalidate: 0 }
  };

  console.log('Fetching properties from:', url);
  console.log('Request headers:', options.headers);

  try {
    let response = await fetch(url, options);
    
    // If unauthorized, retry once with Bearer scheme as a fallback
    if (response.status === 401) {
      try {
        const bearerHeaders = { ...options.headers, Authorization: String(options.headers.Authorization || '')
          .replace(/^Token\s+/i, 'Bearer ') };
        response = await fetch(url, { ...options, headers: bearerHeaders });
      } catch (retryErr) {
        // fall through to normal error handling
      }
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error ${response.status}:`, errorText);
      
      let errorData;
      try {
        errorData = errorText ? JSON.parse(errorText) : {};
      } catch (e) {
        errorData = { raw: errorText };
      }
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to fetch properties',
          status: response.status,
          details: errorData
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    
    // Ensure we always return an array of properties
    let properties = [];
    if (Array.isArray(data)) {
      properties = data;
    } else if (data && Array.isArray(data.properties)) {
      properties = data.properties;
    } else if (data && Array.isArray(data.results)) {
      properties = data.results;
    } else if (data && typeof data === 'object') {
      // If it's a single property object, wrap it in an array
      properties = [data];
    }
    
    console.log(`Successfully fetched ${properties.length} properties`);
    
    return NextResponse.json(properties);
    
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
