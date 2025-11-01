import { NextResponse } from 'next/server';
import { cacheGet, cacheSet } from '../../../../lib/cache';

// Image proxy to bypass browser connection limits to pictures.lodgix.com
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');
  const quality = parseInt(searchParams.get('q') || '75');
  const width = parseInt(searchParams.get('w') || '0');
  const height = parseInt(searchParams.get('h') || '0');

  if (!imageUrl) {
    return NextResponse.json({ error: 'Missing image URL' }, { status: 400 });
  }

  // Validate that it's a Lodgix image URL for security
  if (!imageUrl.includes('pictures.lodgix.com') && !imageUrl.includes('lodgix.com')) {
    return NextResponse.json({ error: 'Invalid image source' }, { status: 403 });
  }

  try {
    // Cache key includes dimensions and quality for different variants
    const cacheKey = `img:${Buffer.from(imageUrl).toString('base64')}:${width}x${height}:q${quality}`;
    
    // Check cache first (24 hour TTL for images)
    const cached = await cacheGet(cacheKey);
    if (cached && cached.data) {
      const buffer = Buffer.from(cached.data, 'base64');
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': cached.contentType || 'image/jpeg',
          'Cache-Control': 'public, max-age=86400, s-maxage=86400', // 24 hours
          'X-Cache': 'HIT'
        }
      });
    }

    // Fetch from Lodgix with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(imageUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'MyOrlandoStay/1.0',
        'Accept': 'image/webp,image/avif,image/jpeg,image/png,*/*'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    let buffer = Buffer.from(await response.arrayBuffer());

    // Basic optimization: if image is too large, we could resize it here
    // For now, just pass through but cache it
    
    // Cache the image (store as base64 to work with JSON cache)
    try {
      await cacheSet(cacheKey, {
        data: buffer.toString('base64'),
        contentType
      }, 86400); // 24 hours
    } catch (cacheErr) {
      console.warn('Failed to cache image:', cacheErr);
    }

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        'X-Cache': 'MISS'
      }
    });

  } catch (error) {
    console.error('Image proxy error:', error);
    
    // Return a 1x1 transparent pixel as fallback
    const fallbackPixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    
    return new NextResponse(fallbackPixel, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=300', // 5 minutes for errors
      },
      status: 200 // Don't return error status to avoid broken images
    });
  }
}
