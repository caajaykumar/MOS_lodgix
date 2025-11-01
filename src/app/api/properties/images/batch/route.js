import { NextResponse } from 'next/server';
import { cacheGet, cacheSet } from '../../../../../lib/cache';
import LODGIX_CONFIG from '../../../../../config/lodgix';

// Batch fetch all property images and return optimized data
export async function POST(request) {
  try {
    const { propertyIds } = await request.json();
    
    if (!Array.isArray(propertyIds) || propertyIds.length === 0) {
      return NextResponse.json({ error: 'Property IDs required' }, { status: 400 });
    }

    console.log(`Batch fetching images for ${propertyIds.length} properties:`, propertyIds);

    // Check cache for batch result
    const batchCacheKey = `batch_imgs:${propertyIds.sort().join(',')}`;
    const cached = await cacheGet(batchCacheKey);
    if (cached) {
      console.log('Returning cached batch image data');
      return NextResponse.json({ success: true, images: cached });
    }

    // Fetch photos for all properties in parallel
    const sleep = (ms) => new Promise(res => setTimeout(res, ms));

    const fetchPropertyPhotos = async (propertyId, attempt = 1) => {
      try {
        // Fetch a few photos to reliably find the primary (some properties may not return primary first)
        const url = `${LODGIX_CONFIG.API_BASE_URL}/properties/${propertyId}/photos/?limit=5`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        const response = await fetch(url, { signal: controller.signal, headers: LODGIX_CONFIG.getHeaders() });
        clearTimeout(timeout);

        if (!response.ok) {
          console.warn(`Failed to fetch photos for property ${propertyId}: ${response.status}`);
          // simple retry once
          if (attempt < 2) {
            await sleep(350);
            return fetchPropertyPhotos(propertyId, attempt + 1);
          }
          return { propertyId, photos: [] };
        }

        const data = await response.json();
        console.log(`Raw photo data for property ${propertyId}:`, data);
        const photos = Array.isArray(data) ? data : (data.results || data.data || []);
        
        // Extract the primary/first image with all available sizes
        let primaryPhoto = photos.find(p => p.is_primary);
        if (!primaryPhoto && photos.length > 0) {
          // Try the lowest order_no
          primaryPhoto = [...photos].sort((a, b) => (a.order_no || 9999) - (b.order_no || 9999))[0];
        }
        if (!primaryPhoto) {
          primaryPhoto = photos[0];
        }
        if (primaryPhoto) {
          const processed = [{
            // Main image URL (full size)
            url: primaryPhoto.url,
            // Preview for medium screens (~800px)
            preview_url: primaryPhoto.preview_url,
            // Thumbnail for small screens (~400px) 
            thumbnail_url: primaryPhoto.thumbnail_url,
            // Tiny thumbnail for blur placeholder (~100px)
            p_thumbnail_url: primaryPhoto.p_thumbnail_url,
            // Metadata
            width: primaryPhoto.width,
            height: primaryPhoto.height,
            is_primary: primaryPhoto.is_primary,
            order_no: primaryPhoto.order_no
          }];
          
          console.log(`Processed primary photo for property ${propertyId}:`, processed[0]);
          return { propertyId, photos: processed };
        } else {
          console.log(`No photos found for property ${propertyId}`);
          return { propertyId, photos: [] };
        }
      } catch (error) {
        console.error(`Error fetching photos for property ${propertyId}:`, error);
        return { propertyId, photos: [] };
      }
    };

    // Fetch all in parallel with concurrency limit
    const concurrency = 3; // Lodgix allows ~3 req/sec
    const results = [];
    for (let i = 0; i < propertyIds.length; i += concurrency) {
      const batch = propertyIds.slice(i, i + concurrency);
      const batchResults = await Promise.all(batch.map(fetchPropertyPhotos));
      results.push(...batchResults);
      // small delay between batches to stay under RPS
      if (i + concurrency < propertyIds.length) {
        await sleep(400);
      }
    }

    // Convert to optimized format with responsive image URLs
    const imageMap = {};
    results.forEach(({ propertyId, photos }) => {
      if (photos.length > 0) {
        const photo = photos[0];
        imageMap[propertyId] = {
          // Responsive image URLs for different screen sizes
          url: photo.url, // Full size (4000px)
          preview_url: photo.preview_url, // Medium (~800px)
          thumbnail_url: photo.thumbnail_url, // Small (~400px)
          p_thumbnail_url: photo.p_thumbnail_url, // Tiny (~100px)
          
          // Image metadata
          width: photo.width,
          height: photo.height,
          is_primary: photo.is_primary,
          
          // Blur placeholder
          blurDataUrl: generateBlurDataUrl()
        };
      } else {
        imageMap[propertyId] = {
          url: '/img/placeholder-property.jpg',
          preview_url: null,
          thumbnail_url: null,
          p_thumbnail_url: null,
          width: 400,
          height: 300,
          is_primary: false,
          blurDataUrl: null
        };
      }
    });

    // Cache the batch result for 1 hour
    try {
      await cacheSet(batchCacheKey, imageMap, 3600);
    } catch (cacheErr) {
      console.warn('Failed to cache batch images:', cacheErr);
    }

    console.log(`Batch processed ${Object.keys(imageMap).length} property images`);
    return NextResponse.json({ success: true, images: imageMap });

  } catch (error) {
    console.error('Batch image fetch error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to batch fetch images',
      details: error.message 
    }, { status: 500 });
  }
}

// Generate a tiny blur data URL for placeholders
function generateBlurDataUrl(thumbnailUrl) {
  try {
    // Return a simple base64 blur placeholder
    // This creates a smooth loading experience
    return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
  } catch {
    return null;
  }
}
