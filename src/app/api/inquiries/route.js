import { NextResponse } from 'next/server';
import LODGIX_CONFIG from '../../../../src/config/lodgix';

export async function POST(request) {
  try {
    const formData = await request.json();
    
    const apiUrl = `${LODGIX_CONFIG.API_BASE_URL}/inquiries/`;
    console.log('Sending request to:', apiUrl);
    console.log('Request headers:', LODGIX_CONFIG.getHeaders());
    console.log('Request body:', formData);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: LODGIX_CONFIG.getHeaders(),
      body: JSON.stringify(formData),
    });

    // Get the response as text first
    const responseText = await response.text();
    console.log('Raw response:', responseText);
    
    let responseData;
    try {
      responseData = responseText ? JSON.parse(responseText) : {};
    } catch (e) {
      console.error('Failed to parse JSON response:', e);
      console.error('Response was:', responseText);
      return NextResponse.json(
        { 
          error: 'Invalid response from server',
          details: responseText.substring(0, 200) // First 200 chars of the response
        },
        { status: 500 }
      );
    }
    
    if (!response.ok) {
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        response: responseData
      });
      
      return NextResponse.json(
        { 
          error: responseData.detail || responseData.message || 'Failed to submit inquiry',
          status: response.status
        },
        { status: response.status }
      );
    }

    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('Inquiry submission error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; // Ensure this is a dynamic route
