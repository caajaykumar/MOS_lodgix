import { NextResponse } from 'next/server';
import LODGIX_CONFIG from '../../../../config/lodgix';

export async function GET(request, { params }) {
  // In Next.js 15+, params must be awaited before accessing properties
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  
  if (!id) {
    return NextResponse.json(
      { error: 'Property ID is required' },
      { status: 400 }
    );
  }

  try {
    // First, try to fetch from Lodgix API
    const lodgixUrl = `${LODGIX_CONFIG.API_BASE_URL}/properties/${id}`;
    const response = await fetch(lodgixUrl, {
      headers: LODGIX_CONFIG.getHeaders(),
      cache: 'no-store'
    });

    if (!response.ok) {
      // If not found in Lodgix, check if we have it in the local database
      // or fall back to the properties list
      const allPropertiesResponse = await fetch(`${request.nextUrl.origin}/api/properties`, {
        cache: 'no-store'
      });
      
      if (allPropertiesResponse.ok) {
        const allProperties = await allPropertiesResponse.json();
        const property = Array.isArray(allProperties) 
          ? allProperties.find(p => p.id === parseInt(id) || p.PropertyID === id)
          : (allProperties.results || []).find(p => p.id === parseInt(id) || p.PropertyID === id);
        
        if (property) {
          return NextResponse.json(property);
        }
      }
      
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    const propertyData = await response.json();
    
    // Fetch all photos for this property with pagination
    let allPhotos = [];
    let nextUrl = `${LODGIX_CONFIG.API_BASE_URL}/properties/${id}/photos/`;
    
    try {
      // Keep fetching until there are no more pages
      while (nextUrl) {
        const photosResponse = await fetch(nextUrl, {
          headers: LODGIX_CONFIG.getHeaders(),
          cache: 'no-store'
        });
        
        if (!photosResponse.ok) break;
        
        const photosData = await photosResponse.json();
        const photos = photosData.results || [];
        allPhotos = [...allPhotos, ...photos];
        console.log(`Fetched ${photos.length} photos for property ${id}`);
        
        // Check if there's a next page
        nextUrl = photosData.next || null;
      }
      
      console.log(`Fetched ${allPhotos.length} photos for property ${id}`);
    } catch (photoError) {
      console.error('Error fetching property photos:', photoError);
    }
    
    // Sort photos by order_no if available
    if (allPhotos.length > 0 && allPhotos[0].order_no !== undefined) {
      allPhotos.sort((a, b) => (a.order_no || 0) - (b.order_no || 0));
    }
    
    // Return property data with photos
    return NextResponse.json({
      ...propertyData,
      photos: allPhotos
    });
    
  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json(
      { error: 'Failed to fetch property', details: error.message },
      { status: 500 }
    );
  }
}
