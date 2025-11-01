'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import { fetchProperties } from '../../lib/api';
import LODGIX_CONFIG from '../../config/lodgix';
import Image from 'next/image';

export default function PropertiesList() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [propertyPhotos, setPropertyPhotos] = useState({});
  const [isLoadingPhotos, setIsLoadingPhotos] = useState({});
  const [visibleCount, setVisibleCount] = useState(12);
  const [coverUrls, setCoverUrls] = useState({});
  const router = useRouter();
  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/properties', {
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            error: `HTTP error! status: ${response.status}`
          }));
          throw new Error(errorData.error || 'Failed to load properties');
        }

        const propertiesData = await response.json();
        if (!Array.isArray(propertiesData)) {
          throw new Error('Invalid response format: Expected an array of properties');
        }

        console.log(`Loaded ${propertiesData.length} properties:`, propertiesData.map(p => ({ id: p.id, name: p.name })));
        setProperties(propertiesData);

        // Initialize stable cover URLs from existing property data once
        setCoverUrls((prev) => {
          const next = { ...prev };
          for (const p of propertiesData) {
            const key = String(p.id);
            if (!next[key]) {
              const initial = p.mainPhoto?.url || p.images?.[0]?.url || '';
              if (initial) next[key] = initial;
            }
          }
          return next;
        });

        // Batch fetch all images at once using our optimized endpoint
        const propertyIds = propertiesData.map(p => p.id);
        if (propertyIds.length > 0) {
          console.log('Batch fetching all property images...');
          try {
            const batchResponse = await fetch('/api/properties/images/batch', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ propertyIds }),
              cache: 'no-store'
            });

            if (batchResponse.ok) {
              const batchData = await batchResponse.json();
              console.log('Batch response:', batchData);
              
              if (batchData.success && batchData.images) {
                console.log(`Batch loaded ${Object.keys(batchData.images).length} property images`);
                
                // Convert batch response to expected format
                const newPhotosMap = {};
                Object.entries(batchData.images).forEach(([propId, imageData]) => {
                  console.log(`Property ${propId} image data:`, imageData);
                  // Include all images with responsive URLs
                  if (imageData.url && imageData.url !== '/img/placeholder-property.jpg') {
                    newPhotosMap[String(propId)] = [{
                      url: imageData.url,
                      preview_url: imageData.preview_url,
                      thumbnail_url: imageData.thumbnail_url,
                      p_thumbnail_url: imageData.p_thumbnail_url,
                      width: imageData.width,
                      height: imageData.height,
                      blur: imageData.blurDataUrl
                    }];
                  } else {
                    console.log(`Property ${propId} has no image, will use placeholder`);
                    newPhotosMap[String(propId)] = [];
                  }
                });
                
                setPropertyPhotos(newPhotosMap);

                // Do not update coverUrls from API; keep initial single image per property
              } else {
                console.error('Batch response missing success/images:', batchData);
              }
            } else {
              const errorText = await batchResponse.text();
              console.error('Batch image fetch failed:', batchResponse.status, errorText);
              // Fallback to individual photo fetching
              console.log('Batch failed, falling back to individual photo fetching...');
              await fallbackIndividualFetch(propertiesData);
            }
          } catch (batchErr) {
            console.error('Batch image fetch error:', batchErr);
            // Fallback to individual photo fetching
            console.log('Falling back to individual photo fetching...');
            await fallbackIndividualFetch(propertiesData);
          }
        }
      } catch (error) {
        console.error('Error loading properties:', error);
        setError(error.message || 'Failed to load properties');
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, []);

  // Preload critical images for better performance
  useEffect(() => {
    if (properties.length > 0) {
      // Preload first 3 property images
      properties.slice(0, 3).forEach((property, index) => {
        const imgSrc = property.mainPhoto?.url || property.images?.[0]?.url || propertyPhotos[String(property.id)]?.[0]?.url;
        if (imgSrc && imgSrc !== '/img/placeholder-property.jpg') {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'image';
          link.href = imgSrc;
          document.head.appendChild(link);
        }
      });
    }
  }, [properties, propertyPhotos]);

  // Fallback individual photo fetching if batch fails
  const fallbackIndividualFetch = async (propertiesData) => {
    const fetchPropertyPhotos = async (property) => {
      try {
        const response = await fetch(`/api/properties/${property.id}/photos?limit=1`, {
          cache: 'no-store'
        });

        if (!response.ok) {
          return { propertyId: property.id, photos: [] };
        }

        const data = await response.json();
        const raw = data && (Array.isArray(data) ? data : (data.data || data.results || []));
        const mapped = (Array.isArray(raw) ? raw : []).map(p => ({
          url: p.url_medium || p.url_large || p.url || p.url_original,
          blur: p.thumbnail_url || p.p_thumbnail_url
        })).filter(x => !!x.url);
        
        console.log(`Fallback: Property ${property.id} mapped photos:`, mapped);
        
        return { propertyId: property.id, photos: mapped };
      } catch (err) {
        console.error(`Error fetching photos for property ${property.id}:`, err);
        return { propertyId: property.id, photos: [] };
      }
    };

    // Fetch in batches of 5
    const concurrency = 5;
    const results = [];
    for (let i = 0; i < propertiesData.length; i += concurrency) {
      const batch = propertiesData.slice(i, i + concurrency);
      const batchResults = await Promise.all(batch.map(fetchPropertyPhotos));
      results.push(...batchResults);
    }

    // Update state
    const newPhotosMap = { ...propertyPhotos };
    results.forEach(result => {
      newPhotosMap[String(result.propertyId)] = result.photos;
    });
    setPropertyPhotos(newPhotosMap);

    // Do not update coverUrls from API; keep initial single image per property
  };

  // Airbnb-style progressive loading component
  function PropertyCard({ property, index }) {
    const [inView, setInView] = useState(index < 6); // Show first 6 immediately
    const propKey = String(property.id);
    const photosForProp = propertyPhotos[String(property.id)] || [];
    const batchPreferred = photosForProp[0]?.preview_url || photosForProp[0]?.thumbnail_url || photosForProp[0]?.url;
    const initialSrc = batchPreferred || property.mainPhoto?.url || property.images?.[0]?.url || '/img/placeholder-property.jpg';
    const [src, setSrc] = useState(initialSrc);
    const isPlaceholder = src === '/img/placeholder-property.jpg';
    const [imageLoaded, setImageLoaded] = useState(!isPlaceholder);
    const [imageError, setImageError] = useState(false);
    const ref = useRef(null);
    
    useEffect(() => {
      if (inView || !ref.current) return;
      const el = ref.current;
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setInView(true);
            io.disconnect();
          }
        });
      }, { rootMargin: '300px' }); // Larger margin for better UX
      io.observe(el);
      return () => io.disconnect();
    }, [inView]);

    // Reset error state when property changes
    useEffect(() => {
      // Compute preferred single URL: batch > property fields > placeholder
      const photos = propertyPhotos[String(property.id)] || [];
      const preferred = photos[0]?.preview_url || photos[0]?.thumbnail_url || photos[0]?.url || property.mainPhoto?.url || property.images?.[0]?.url || '/img/placeholder-property.jpg';
      // Only upgrade from placeholder to a real image once to avoid flicker
      setSrc(prev => (prev === '/img/placeholder-property.jpg' ? preferred : prev));
      setImageError(false);
      setImageLoaded(preferred !== '/img/placeholder-property.jpg');
    }, [propKey, propertyPhotos]);

    useEffect(() => {
      try {
        console.log(`Property ${property.id} card image src:`, src);
      } catch {}
    }, [src, property.id]);

    if (!inView) {
      return (
        <div ref={ref} className="col-md-4 col-sm-6">
          <div className="explor_item">
            <div className="room_image" style={{ height: '350px', background: '#f3f4f6' }} />
            <div className="explor_text">
              <div className="explor_footer">
                <div className="skeleton-box" style={{ height: '24px', width: '80%', marginBottom: '10px' }}></div>
                <div className="skeleton-box" style={{ height: '20px', width: '100px' }}></div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const blur = undefined; // keep blur disabled unless small blur available
    const isPriority = index < 3; // Prioritize first 3 images
    
    // Use ONLY stable cover source to prevent blinking
    const primarySrc = src;

    return (
      <div className="col-md-4 col-sm-6">
        <div className="explor_item">
          <Link href={`/properties/${property.id}`} className="room_image">
            {/* Using stable cover to avoid blinking */}
            <div style={{ position: 'relative', width: '100%', height: '350px', background: '#f3f4f6' }}>
              <img
                src={primarySrc}
                alt={property.name || 'Property Image'}
                loading={isPriority ? 'eager' : 'lazy'}
                referrerPolicy="no-referrer"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                onError={() => {
                  try {
                    const photos = propertyPhotos[String(property.id)] || [];
                    const fallbacks = [photos[0]?.thumbnail_url, photos[0]?.url, '/img/placeholder-property.jpg'].filter(Boolean);
                    const next = fallbacks.find(u => u && u !== src) || '/img/placeholder-property.jpg';
                    console.warn(`Image failed for property ${property.id}, switching to:`, next);
                    setSrc(next);
                  } catch {
                    setSrc('/img/placeholder-property.jpg');
                  }
                }}
                onLoad={() => {
                  try { console.log(`Property ${property.id} image loaded.`); } catch {}
                }}
              />
            </div>
          </Link>

          <div className="explor_text">
            <div className="explor_footer">
              <Link href={`/properties/${property.id}`} className="text-center">
                <h4 className="text-center">
                  {property.name || 'Unnamed Property'}, {property.bedrooms || 'N/A'} Bedrooms Home
                </h4>
              </Link>
              <div className="pull-left">
                <Link
                  href={property.booking_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="book_now_btn text-center"
                >
                  Book Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Skeleton loader component
  const SkeletonLoader = () => (
    <div className="container">
      <div className="row">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="col-md-4 col-sm-6 mb-4">
            <div className="explor_item">
              <div className="room_image">
                <div className="skeleton-box" style={{ height: '250px', width: '100%' }}></div>
              </div>
              <div className="explor_text p-3">
                <div className="explor_footer">
                  <h4 className="skeleton-box" style={{ height: '24px', width: '80%', marginBottom: '10px' }}></h4>
                  <p className="skeleton-box" style={{ height: '16px', width: '60%' }}></p>
                  <div className="d-flex justify-content-between mt-3">
                    <span className="skeleton-box" style={{ height: '20px', width: '80px' }}></span>
                    <span className="skeleton-box" style={{ height: '20px', width: '100px' }}></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Skeleton styles
  const skeletonStyles = `
    @keyframes shimmer {
      0% { background-position: -1000px 0; }
      100% { background-position: 1000px 0; }
    }
    .skeleton-box {
      background: #f0f0f0;
      border-radius: 4px;
      position: relative;
      overflow: hidden;
    }
    .skeleton-box::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      transform: translateX(-100%);
      background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%);
      animation: shimmer 1.5s infinite;
    }
  `;

  if (loading) {
    return (
      <>
        <style jsx>{skeletonStyles}</style>
        <Breadcrumb
          title="Properties"
          breadcrumbs={[
            { name: 'Home', link: '/', active: false },
            { name: 'Properties', link: '/properties', active: true },
          ]}
        />
        <div className="py-5">
          <SkeletonLoader />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .image-container {
          position: relative;
          overflow: hidden;
        }
        .image-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          transform: translateX(-100%);
          animation: shimmer 1.5s infinite;
          z-index: 1;
        }
      `}</style>
      <Breadcrumb
        title="Properties"
        breadcrumbs={[
          { name: 'Home', link: '/', active: false },
          { name: 'Properties', link: '/properties', active: true },
        ]}
      />
      <section className="explor_room_area explore_room_list">
        <div className="container">
          <div className="explor_title row m0">
            <div className="left_ex_title">
              <h2>Properties <span></span></h2>
              <p>
                These homes are 3 bedrooms, 3 bath townhomes just 1 mile from the Disney parks. The homes are in a gated community with a semi-large swimming pool which is heated in the winters. The pool is open for our guests without a charge.
              </p>
            </div>
          </div>

          <div className="row explor_room_item_inner">
            {properties.slice(0, visibleCount).map((property, idx) => (
              <PropertyCard key={property.id} property={property} index={idx} />
            ))}
          </div>
          {properties.length > visibleCount && (
            <div className="text-center" style={{ margin: '30px 0' }}>
              <button className="btn btn-primary" onClick={() => setVisibleCount(c => Math.min(c + 12, properties.length))}>
                Load More Properties
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
