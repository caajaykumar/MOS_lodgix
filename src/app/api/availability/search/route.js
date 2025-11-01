import { NextResponse } from 'next/server';
import LODGIX_CONFIG from '../../../../config/lodgix';
import { cacheGet, cacheSet } from '../../../../lib/cache';

// Limit concurrency to avoid hammering remote API and improve reliability
async function mapWithConcurrency(items, limit, mapper) {
  const results = new Array(items.length);
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const current = index++;
      try {
        results[current] = { status: 'fulfilled', value: await mapper(items[current], current) };
      } catch (e) {
        results[current] = { status: 'rejected', reason: e };
      }
    }
  }
  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

// Timeout wrapper for fetch to prevent slow endpoints from delaying the whole response
async function fetchWithTimeout(resource, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(resource, { ...options, signal: controller.signal });
    return resp;
  } finally {
    clearTimeout(id);
  }
}

async function fetchAvailablePropertyIds(params) {
  try {
    // Build query parameters for Lodgix property-availabilities endpoint
    const queryParams = new URLSearchParams({
      from_date: params.from_date,
      to_date: params.to_date,
    });

    // Optional: add property_id if checking specific property
    if (params.property_id) {
      queryParams.append('property_id', params.property_id);
    }

    const availabilityUrl = `${LODGIX_CONFIG.API_BASE_URL}/property-availabilities/?${queryParams}`;
    console.log('Fetching availability from:', availabilityUrl);

    const cacheKey = `avail:${params.from_date}:${params.to_date}:${params.property_id || 'all'}`;
    const cached = await cacheGet(cacheKey);
    if (cached && Array.isArray(cached.availablePropertyIds)) {
      return { success: true, availablePropertyIds: cached.availablePropertyIds, totalAvailable: cached.availablePropertyIds.length };
    }

    const response = await fetchWithTimeout(availabilityUrl, {
      method: 'GET',
      headers: LODGIX_CONFIG.getHeaders(),
    }, 8000);

    if (!response.ok) {
      throw new Error(`Lodgix API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract available property IDs from Lodgix response
    const availablePropertyIds = data.available_property_ids || [];
    try { await cacheSet(cacheKey, { availablePropertyIds }, 3600); } catch (_) {}
    
    return {
      success: true,
      availablePropertyIds,
      totalAvailable: availablePropertyIds.length
    };
    
  } catch (error) {
    console.error('Error fetching availability from Lodgix API:', error);
    throw error;
  }
}

/**
 * Fetches property details for a given property ID
 * Attempts to use Lodgix property details endpoint
 */
async function fetchPropertyDetails(propertyId) {
  try {
    // Try to fetch from Lodgix property details endpoint
    const detailsUrl = `${LODGIX_CONFIG.API_BASE_URL}/properties/${propertyId}/`;
    const dKey = `prop:${propertyId}:details`;
    const cached = await cacheGet(dKey);
    if (cached) return cached;

    const response = await fetchWithTimeout(detailsUrl, {
      method: 'GET',
      headers: LODGIX_CONFIG.getHeaders(),
    }, 8000);

    if (response.ok) {
      const propertyData = await response.json();
      try { await cacheSet(dKey, propertyData, 3600); } catch (_) {}
      return propertyData;
    } else {
      // If endpoint doesn't exist or fails, return mock data structure
      console.warn(`Property details endpoint failed for ID ${propertyId}, using mock data`);
      throw new Error('Property details endpoint not available');
    }
    
  } catch (error) {
    // Mock data structure - replace with actual property details API call when available
    const mockProperties = {
      '62271': {
        id: 62271,
        name: 'Luxury Villa with Pool',
        photo_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
        bedrooms: 3,
        bathrooms: 2,
        sleeps: 6,
        nightly_rate: 250,
        weekly_rate: 1500,
        description: 'Beautiful villa with private pool and stunning views.'
      },
      '62283': {
        id: 62283,
        name: 'Beachfront Condo',
        photo_url: 'https://images.unsplash.com/photo-1499793983690-5d611a6d0001?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
        bedrooms: 2,
        bathrooms: 2,
        sleeps: 4,
        nightly_rate: 180,
        weekly_rate: 1100,
        description: 'Stunning beachfront property with ocean views.'
      },
      '62287': {
        id: 62287,
        name: 'Downtown Apartment',
        photo_url: 'https://images.unsplash.com/photo-1502672260266-37c4d581d3a0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
        bedrooms: 1,
        bathrooms: 1,
        sleeps: 2,
        nightly_rate: 120,
        weekly_rate: 720,
        description: 'Cozy apartment in the heart of the city.'
      }
    };

    const mock = mockProperties[propertyId] || {
      id: propertyId,
      name: `Property ${propertyId}`,
      photo_url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
      bedrooms: 2,
      bathrooms: 1,
      sleeps: 4,
      nightly_rate: 150,
      description: 'Beautiful vacation rental property.'
    };
    try { await cacheSet(dKey, mock, 600); } catch (_) {}
    return mock;
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get search parameters and convert to Lodgix format
    const from_date = searchParams.get('from_date') || searchParams.get('checkIn');
    const to_date = searchParams.get('to_date') || searchParams.get('checkOut');
    const property_id = searchParams.get('property_id');
    const guests = parseInt(searchParams.get('guests') || '2');
    const rooms = parseInt(searchParams.get('rooms') || '1');
    const pets = parseInt(searchParams.get('pets') || '0');

    // Validate required parameters
    if (!from_date || !to_date) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required parameters: from_date and to_date are required',
          example: 'Use format: /api/availability/search?from_date=2025-10-10&to_date=2025-10-15'
        },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(from_date) || !dateRegex.test(to_date)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid date format. Use YYYY-MM-DD format',
          example: 'from_date=2025-10-10&to_date=2025-10-15'
        },
        { status: 400 }
      );
    }

    // Validate check-in < check-out
    if (new Date(from_date) >= new Date(to_date)) {
      return NextResponse.json(
        { success: false, error: 'Check-in date must be before check-out date' },
        { status: 400 }
      );
    }

    console.log('Searching availability for:', { from_date, to_date, property_id, guests, rooms });

    // Step 1: Get available property IDs from Lodgix
    const availabilityResult = await fetchAvailablePropertyIds({
      from_date,
      to_date,
      property_id
    });
    console.log('[search] IDs from Lodgix:', availabilityResult.totalAvailable);

    if (!availabilityResult.success || availabilityResult.availablePropertyIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No properties available for these dates',
        availablePropertyIds: []
      });
    }

    // Step 2: Enrich ALL available property IDs (no client pagination here)
    const ids = availabilityResult.availablePropertyIds;

    // Fetch property details and a single photo (medium) for each available property in the window
    const origin = new URL(request.url).origin;
    const propertyDetails = await mapWithConcurrency(
      ids,
      3,
      async (propId) => {
        const id = propId.toString();
        // Fetch details
        const details = await fetchPropertyDetails(id);
        // Attempt to fetch first photo for the property (prefer medium size)
        try {
          // Use local proxy which sorts by cover and order_no
          const pKey = `prop:${id}:photo:first`;
          const pc = await cacheGet(pKey);
          if (pc && pc.chosen) {
            details.photo_url = pc.chosen || details.photo_url;
            details.photo_url_full = pc.full || details.photo_url_full || pc.chosen;
            details.blur_photo_url = pc.blur || details.blur_photo_url || null;
          } else {
            const photosResp = await fetchWithTimeout(
              `${origin}/api/properties/${id}/photos?limit=1`,
              { cache: 'no-store' },
              7000
            );
            if (photosResp.ok) {
              const photosData = await photosResp.json();
              const list = Array.isArray(photosData) ? photosData : (photosData.data || photosData.results || []);
              const first = Array.isArray(list) ? list[0] : null;
              if (first) {
                const chosen = first.url_medium 
                  || first.url_large 
                  || first.url 
                  || first.preview_url 
                  || first.thumbnail_url 
                  || first.p_thumbnail_url 
                  || first.url_small 
                  || first.url_original;
                details.photo_url = chosen || details.photo_url;
                details.photo_url_full = first.url_original || first.url_large || first.url || details.photo_url;
                details.blur_photo_url = first.thumbnail_url || first.p_thumbnail_url || first.preview_url || first.url_small || first.url || first.url_medium || null;
                try { await cacheSet(pKey, { chosen: details.photo_url, full: details.photo_url_full, blur: details.blur_photo_url }, 3600); } catch (_) {}
              }
            }
          }
        } catch (e) {
          // non-blocking
          console.warn(`Photos fetch failed for property ${id}:`, e.message);
        }
        return details;
      }
    );

    // Build normalized list aligned with ID order, including minimal entries for failures
    const availableProperties = ids.map((propId, idx) => {
      const r = propertyDetails[idx];
      const base = (r && r.status === 'fulfilled' && r.value) ? r.value : { id: Number(propId) };
      const v = base || {};
      // Derive capacity from common fields; if unknown, do not filter out
      const capacity = v.sleeps ?? v.max_guests ?? v.capacity ?? v.occupancy ?? v.guests;
      const meetsGuests = typeof capacity === 'number' && capacity > 0 ? capacity >= guests : true;
      // Normalize fields for frontend
      const name = v.name || v.title || (v.property && (v.property.name || v.property.title)) || `Property ${v.id || propId}`;
      const bedrooms = v.bedrooms ?? v.bedrooms_count ?? v.bedroom_count ?? v.beds ?? null;
      const bathrooms = v.bathrooms ?? v.bathrooms_count ?? v.bathroom_count ?? v.baths ?? null;
      const sleeps = typeof capacity === 'number' ? capacity : (v.sleeps ?? null);
      const photo_url = v.photo_url || v.photoUrl || null;
      const blur_photo_url = v.blur_photo_url || null;
      return {
        ...v,
        id: v.id ?? Number(propId),
        name,
        bedrooms,
        bathrooms,
        sleeps,
        photo_url: photo_url || '/img/placeholder-property.svg',
        blur_photo_url: blur_photo_url || null,
        is_available: true,
        search_dates: { from_date, to_date },
        meets_guest_requirements: meetsGuests,
      };
    });

    console.log('[search] Returning properties:', availableProperties.length);

    return NextResponse.json({
      success: true,
      data: availableProperties,
      availablePropertyIds: ids,
      totalFound: ids.length,
      searchCriteria: { from_date, to_date, guests, rooms, pets }
    });
    
  } catch (error) {
    console.error('Error in availability search:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
