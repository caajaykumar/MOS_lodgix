import { NextResponse } from 'next/server';
import LODGIX_CONFIG from '@/config/lodgix';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get('from_date') || searchParams.get('checkIn');
    const toDate = searchParams.get('to_date') || searchParams.get('checkOut');
    const propertyId = searchParams.get('property_id');

    if (!fromDate || !toDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: from_date and to_date are required' },
        { status: 400 }
      );
    }

    // Construct the Lodgix API URL
    const apiUrl = new URL(`${LODGIX_CONFIG.API_BASE_URL}/property-availabilities/`);
    
    // Add query parameters
    const params = new URLSearchParams({
      from_date: fromDate,
      to_date: toDate,
    });

    // Add property_id if specified
    if (propertyId) {
      params.append('property_id', propertyId);
    }

    apiUrl.search = params.toString();

    // Fetch available properties from Lodgix API
    const response = await fetch(apiUrl.toString(), {
      headers: LODGIX_CONFIG.getHeaders(),
      next: { revalidate: 60 * 5 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Lodgix API error:', response.status, errorData);
      throw new Error(`Lodgix API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Get the list of available property IDs
    const availablePropertyIds = data?.available_property_ids || [];
    
    // If no property IDs are available, return empty array
    if (availablePropertyIds.length === 0) {
      return NextResponse.json([]);
    }
    
    // Fetch details for each available property
    const availableProperties = await Promise.all(
      availablePropertyIds.map(async (propertyId) => {
        try {
          // Fetch property details and first photo in parallel
          const [propertyResponse, photosResponse] = await Promise.all([
            fetch(
              `${LODGIX_CONFIG.API_BASE_URL}/properties/${propertyId}`,
              { 
                headers: LODGIX_CONFIG.getHeaders(),
                next: { revalidate: 60 * 60 } // Cache for 1 hour
              }
            ),
            fetch(
              `${LODGIX_CONFIG.API_BASE_URL}/properties/${propertyId}/photos?limit=1`,
              { 
                headers: LODGIX_CONFIG.getHeaders(),
                next: { revalidate: 60 * 60 } // Cache for 1 hour
              }
            )
          ]);
          
          if (!propertyResponse.ok) {
            console.error(`Error fetching property ${propertyId}:`, propertyResponse.statusText);
            return null;
          }
          
          const propertyData = await propertyResponse.json();
          
          // Add optimized photo URLs if available (prefer medium for listing)
          if (photosResponse.ok) {
            const photosData = await photosResponse.json();
            const first = Array.isArray(photosData) ? photosData[0] : (photosData.results?.[0] || null);
            if (first) {
              propertyData.photo_url = first.url_medium || first.url_small || first.url_original;
              propertyData.photo_url_full = first.url_original || propertyData.photo_url;
            }
          }
          
          return propertyData;
        } catch (error) {
          console.error(`Error processing property ${propertyId}:`, error);
          return null;
        }
      })
    );
    
    // Filter out any null values (failed fetches)
    const filteredProperties = availableProperties.filter(property => property !== null);

    return NextResponse.json(filteredProperties);
  } catch (error) {
    console.error('Error in availability search:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability', details: error.message },
      { status: 500 }
    );
  }
}
