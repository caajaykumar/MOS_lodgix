'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useLoader } from '@/app/components/LoaderProvider';
import AnimatedEmptyIllustration from './AnimatedEmptyIllustration';
import btnStyles from './PropertyCardButtons.module.css';

export default function ResultsGrid({
  properties = [],
  loading = false,
  error = null,
  searchCriteria = {},
  pagination = null,
  hasSearched = false,
  onReset = () => {},
}) {

  const { showLoader, hideLoader } = useLoader();
  const [bookingId, setBookingId] = useState(null);
  const [bookingError, setBookingError] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [quote, setQuote] = useState(null);
  const [criteria, setCriteria] = useState(searchCriteria || {});
  const [showModal, setShowModal] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(10);

  // Unified pets value used across payloads and links
  const effectivePets = useMemo(() => {
    const fromCriteria = Number(criteria?.pets);
    const fromProps = Number(searchCriteria?.pets);
    const val = Number.isFinite(fromCriteria) ? fromCriteria : (Number.isFinite(fromProps) ? fromProps : 0);
    return Math.max(0, val || 0);
  }, [criteria?.pets, searchCriteria?.pets]);

  const fmtMoney = (v) => {
    const n = Number(v);
    if (!isFinite(n)) return '$0.00';
    return n.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
  };

  // Safely parse values that may include currency symbols/commas
  const toNum = (v) => {
    if (v == null) return 0;
    const s = String(v).replace(/[^0-9.\-]/g, '');
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : 0;
  };

  // Debug: log key details for each property (once per update)
  useEffect(() => {
    try {
      const essentials = (properties || []).map(p => ({
        id: p.id,
        name: p.name,
        photo_url: p.photo_url || p.photoUrl,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
      }));
      console.log('Search results (essentials):', essentials);
    } catch (_) {}
  }, [properties]);

  // Restore criteria from sessionStorage if not provided
  useEffect(() => {
    if (!criteria?.from_date || !criteria?.to_date) {
      try {
        const raw = typeof window !== 'undefined' ? sessionStorage.getItem('lodgix_search_criteria') : null;
        if (raw) {
          const sc = JSON.parse(raw);
          setCriteria((prev) => ({ ...prev, ...sc }));
        }
      } catch {}
    }
  }, []);

  // Keep local criteria in sync with the latest props from parent searches
  useEffect(() => {
    try {
      if (searchCriteria && Object.keys(searchCriteria).length) {
        setCriteria((prev) => ({ ...prev, ...searchCriteria }));
      }
    } catch {}
  }, [searchCriteria]);

  // Modern inline icons (avoid extra deps)
  const BedIcon = ({ size=22, color='#6B7280' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M3 10h18a2 2 0 0 1 2 2v6h-2v-2H3v2H1v-6a2 2 0 0 1 2-2Zm2 0V7a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3H5Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  const ShowerIcon = ({ size=22, color='#6B7280' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M7 4h7a5 5 0 0 1 5 5v1" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M4 20V6a2 2 0 0 1 2-2h1" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <circle cx="17" cy="14" r="1" fill={color}/>
      <circle cx="14" cy="16" r="1" fill={color}/>
      <circle cx="20" cy="16" r="1" fill={color}/>
      <circle cx="17" cy="18" r="1" fill={color}/>
      <circle cx="14" cy="20" r="1" fill={color}/>
      <circle cx="20" cy="20" r="1" fill={color}/>
    </svg>
  );
  const UsersIcon = ({ size=22, color='#6B7280' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <circle cx="9.5" cy="7" r="3.5" stroke={color} strokeWidth="2"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M17 3.34A3.5 3.5 0 0 1 19.5 7c0 1.16-.55 2.19-1.4 2.84" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
  const EyeIcon = ({ size=18, color='#1d4ed8' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2"/>
    </svg>
  );
  const CalendarCheckIcon = ({ size=20, color='currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="3" y="4" width="18" height="17" rx="2" stroke={color} strokeWidth="2" fill="none"/>
      <path d="M16 2v4M8 2v4M3 10h18" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M10 16l2 2 4-4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  // Lazy card component with IntersectionObserver to defer offscreen rendering
  function PropertyCard({ property, index }) {
    const [inView, setInView] = useState(index < 6); // prime first row or two
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
      }, { rootMargin: '200px' });
      io.observe(el);
      return () => io.disconnect();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inView]);

    if (!inView) {
      return (
        <div ref={ref} className="col-md-4 col-sm-6" style={{ marginBottom: '30px' }}>
          <div className="panel panel-default" style={{ height: '100%' }}>
            <div style={{ position: 'relative', height: '200px', background:'#f3f4f6' }} />
            <div className="panel-body">
              <div className="skeleton" style={{ height: 14, width: '60%', background:'#eee', borderRadius:4, marginBottom:8 }}></div>
              <div className="skeleton" style={{ height: 12, width: '40%', background:'#eee', borderRadius:4 }}></div>
            </div>
          </div>
        </div>
      );
    }

    const imgSrc = property.photo_url || property.photoUrl || '/img/placeholder-property.svg';
    const blur = property.blur_photo_url || undefined;
    const isPriority = index < 2; // preload only first two
    const detailsUrl = `/properties/${property.id}?checkIn=${criteria.from_date || searchCriteria.from_date}&checkOut=${criteria.to_date || searchCriteria.to_date}&guests=${criteria.guests || searchCriteria.guests || 2}`;
    const maxGuests = Number(property.sleeps || property.max_guests || 0) || 0;
    const isAvailable = Boolean(
      (property && (property.available === true || property.is_available === true)) ||
      (typeof property?.status === 'string' && property.status.toLowerCase() === 'available')
    );

    const onCardClick = () => { try { window.location.href = detailsUrl; } catch (_) {} };

    return (
      <div className="col-md-4 col-sm-6" style={{ marginBottom: '30px' }}>
        <div
          className="card-modern"
          role="link"
          tabIndex={0}
          aria-label={`View details for ${property.name || 'Property'}`}
          onClick={onCardClick}
          onKeyDown={(e)=>{ if (e.key === 'Enter') onCardClick(); }}
        >
          <div className="cm-image">
            <Image
              src={imgSrc}
              alt={property.name || `Property ${property.id}`}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              quality={55}
              priority={isPriority}
              loading={isPriority ? 'eager' : 'lazy'}
              placeholder={blur ? 'blur' : undefined}
              blurDataURL={blur}
            />
            {isAvailable && <div className="cm-available">Available</div>}
          </div>

          <div className="cm-body">
            <div className="cm-title-row">
              <Link href={detailsUrl} className="cm-title" onClick={(e)=> e.stopPropagation()}>
                {property.name || `Property ${property.id}`}
              </Link>
              {property.nightly_rate && (
                <div className="cm-price">
                  ${property.nightly_rate.toLocaleString()}
                  <small>per night</small>
                </div>
              )}
            </div>

            <div className="cm-icons">
              {property.bedrooms ? (
                <div className="cm-icon-item"><BedIcon /><span>{property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}</span></div>
              ) : null}
              {property.bathrooms ? (
                <div className="cm-icon-item"><ShowerIcon /><span>{property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}</span></div>
              ) : null}
              {maxGuests ? (
                <div className="cm-icon-item"><UsersIcon /><span>Max: {maxGuests}</span></div>
              ) : null}
            </div>

            <div className={btnStyles.buttonContainer}>
              <Link href={detailsUrl} className={btnStyles.btnSecondary} onClick={(e)=> e.stopPropagation()}>
                <span className={btnStyles.btnIcon}><EyeIcon size={20} color="#1d4ed8" /></span>
                <span>View Details</span>
              </Link>
              <button
                className={btnStyles.btnPrimary}
                onClick={(e)=>{ e.stopPropagation(); handleBookNow(property); }}
                disabled={bookingLoading && bookingId === property.id}
              >
                <span className={btnStyles.btnIcon}><CalendarCheckIcon /></span>
                <span>{bookingLoading && bookingId === property.id ? 'Loading…' : 'Book Now'}</span>
              </button>
            </div>
          </div>

          <style jsx>{`
            .card-modern { background:#fff; border:0.5px solid #ddd; border-radius:16px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,.04); transition: transform .35s cubic-bezier(.4,0,.2,1), box-shadow .35s, border-color .35s; cursor:pointer; }
            .card-modern:hover { transform: translateY(-8px) scale(1.01); box-shadow:0 20px 40px rgba(59,130,246,.18); border-color:#dbeafe; }
            .cm-image { position:relative; height:200px; overflow:hidden; }
            .cm-image :global(img) { transition: transform .8s ease; }
            .card-modern:hover .cm-image :global(img) { transform: scale(1.08); }
            .cm-available { position:absolute; top:12px; right:12px; padding:6px 10px; border-radius:12px; font-weight:600; font-size:12px; color:#065f46; background:#dff0d8; border:1px solid #cbe8c3; box-shadow:0 4px 12px rgba(0,0,0,.08); }
            .cm-body { padding:16px; display:flex; flex-direction:column; gap:14px; }
            .cm-title-row { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
            .cm-title { font-size:18px; font-weight:600; color:#1F2937; text-decoration:none; transition: color .25s, text-decoration-color .25s; }
            .cm-title:hover { color:#3B82F6; text-decoration:underline; text-decoration-color:#93c5fd; }
            .cm-price { color:#2563eb; font-weight:700; font-size:16px; text-align:right; }
            .cm-price small { display:block; color:#6b7280; font-weight:500; margin-top:2px; }
            .cm-icons { display:flex; align-items:center; gap:18px; color:#6B7280; }
            .cm-icon-item { display:flex; align-items:center; gap:8px; font-size:13px; font-weight:500; }
            .cm-icon-item:hover { color:#374151; }
            /* Button styles now provided via PropertyCardButtons.module.css */
            @media (max-width: 767px) { .cm-image { height: 180px; } .cm-body { padding:14px } }
          `}</style>
        </div>
      </div>
    );
  }

  async function handleBookNow(property) {
    try {
      setBookingError(null);
      setBookingLoading(true);
      setBookingId(property.id);
      setSelectedPropertyId(property.id);
      // Show global loader immediately
      try { showLoader(); } catch {}
      // Validate max guests based on property capacity
      const requestedGuests = Number(criteria.guests || searchCriteria.guests || 2) || 0;
      const capacity = Number(property.sleeps || property.max_guests || 0) || 0;
      if (capacity && requestedGuests > capacity) {
        setBookingError(`This property allows up to ${capacity} guests. Please reduce guest count.`);
        setShowModal(false);
        setBookingLoading(false);
        setBookingId(null);
        return;
      }

      const payload = {
        from_date: criteria.from_date || searchCriteria.from_date,
        to_date: criteria.to_date || searchCriteria.to_date,
        adults: Number(requestedGuests) || 0,
        children: 0,
        pets: effectivePets,
        property_id: Number(property.id) || 0,
      };
      // Helper to POST for a quote
      const postQuote = async (pl) => {
        try { console.log('POST /reservations/quote payload:', pl); } catch {}
        const r = await fetch('/api/reservations/quote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pl) });
        const j = await r.json().catch(() => ({}));
        try { console.log('POST /reservations/quote response:', { ok: r.ok, status: r.status, data: j }); } catch {}
        if (!r.ok || !j.success) {
          throw new Error(j?.details?.message || j?.error || 'Failed to get quote');
        }
        try { console.log('Normalized quote data:', j.data); } catch {}
        return j.data;
      };

      let quoteWithPets = await postQuote(payload);
      // If pets are selected, compute pet fee delta by requesting a quote without pets
      let computedPetFee = 0;
      if ((payload.pets || 0) > 0) {
        try {
          const payloadNoPets = { ...payload, pets: 0 };
          const quoteNoPets = await postQuote(payloadNoPets);
          const feesWithPets = Number(quoteWithPets.fees ?? quoteWithPets.total_fees ?? quoteWithPets.fees_net ?? 0) || 0;
          const feesNoPets = Number(quoteNoPets.fees ?? quoteNoPets.total_fees ?? quoteNoPets.fees_net ?? 0) || 0;
          computedPetFee = Math.max(0, feesWithPets - feesNoPets);
        } catch (_) {
          // ignore delta errors; we will still show total fees
          computedPetFee = 0;
        }
      }

      // Attach computed pet fee for UI breakdown
      setQuote({ ...quoteWithPets, computedPetFee });
      setShowModal(true);
      // Stash quote for later pages
      try { sessionStorage.setItem('lodgix_latest_quote', JSON.stringify({ quote: { ...quoteWithPets, computedPetFee }, payload })); } catch {}
    } catch (err) {
      setBookingError(err.message || 'Failed to get quote');
      // Ensure the modal opens to display the error feedback
      setShowModal(true);
      // Hide loader soon after showing the error modal
      try { hideLoader(300); } catch {}
    } finally {
      setBookingLoading(false);
      setBookingId(null);
    }
  }

  // Hide the global loader only after the modal is visible and content is ready
  useEffect(() => {
    if (showModal && (quote || bookingError)) {
      try { hideLoader(300); } catch {}
    }
  }, [showModal, quote, bookingError, hideLoader]);

  // Loading state
  if (loading) {
    return (
      <div className="row">
        <div className="col-md-12">
          <div className="text-center" style={{ padding: '20px 0' }}>
            <div style={{ fontSize: '18px', marginBottom: '10px' }}>
              <span className="glyphicon glyphicon-refresh" style={{ animation: 'spin 1s linear infinite', marginRight: '10px' }}></span>
              Searching available properties...
            </div>
            <p className="text-muted">
              Checking availability from {searchCriteria.from_date} to {searchCriteria.to_date}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="row">
        <div className="col-md-12">
          <div className="alert alert-danger" style={{ margin: '20px 0' }}>
            <h4>
              <span className="glyphicon glyphicon-exclamation-sign" style={{ marginRight: '10px' }}></span>
              Search Error
            </h4>
            <p><strong>Error:</strong> {error}</p>
            <p className="text-muted">Please try adjusting your search criteria or try again later.</p>
            <button onClick={() => window.location.reload()} className="btn btn-primary" style={{ marginTop: '10px' }}>
              <span className="glyphicon glyphicon-refresh" style={{ marginRight: '5px' }}></span>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty results
  if (!properties || properties.length === 0) {
    if (!hasSearched) {
      return (
        <div className="row">
          <div className="col-md-12">
            <div className="text-center" style={{ padding: '8px 12px' }}>
              <div style={{ marginBottom: 6, display: 'inline-block' }}>
                <AnimatedEmptyIllustration size={190} />
              </div>
              <h3 style={{ marginBottom: 4 }}>Start Your Perfect Vacation</h3>
              <p className="text-muted" style={{ fontSize: '13px', marginBottom: 0 }}>
                Enter your dates and guest count to discover available properties
              </p>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="row">
        <div className="col-md-12">
          <div className="text-center" style={{ padding: '60px 20px' }}>
            <div style={{ fontSize: '48px', color: '#d1d5db', marginBottom: '16px' }}>🔎</div>
            <h3 style={{ marginBottom: 8 }}>No Properties Found</h3>
            <p className="text-muted" style={{ fontSize: '16px', marginBottom: '18px' }}>
              We couldn't find properties matching your search. Try adjusting your dates or guest count.
            </p>
            <ul style={{ listStyle: 'disc', display: 'inline-block', textAlign: 'left', color: '#6b7280', marginBottom: 16 }}>
              <li>Try different check-in/check-out dates</li>
              <li>Reduce the number of guests</li>
              <li>Clear filters and search again</li>
            </ul>
            <div style={{ marginTop: 8 }}>
              <button className="btn btn-default" onClick={onReset}>
                Clear Search
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="row">
      <div className="col-md-12" style={{ marginBottom: '20px' }}>
        <div className="alert alert-success">
          <span className="glyphicon glyphicon-ok-circle" style={{ marginRight: '10px' }}></span>
          <strong>{properties.length}</strong>
          {pagination && typeof pagination.count === 'number' ? (
            <span> of <strong>{pagination.count}</strong></span>
          ) : null}{' '}
          properties available for your dates
          {searchCriteria.from_date && searchCriteria.to_date && (
            <span className="text-muted"> ({searchCriteria.from_date} to {searchCriteria.to_date})</span>
          )}
        </div>
      </div>

      {properties.slice(0, visibleCount).map((property, idx) => (
        <PropertyCard key={property.id} property={property} index={idx} />
      ))}
    </div>
    {properties.length > visibleCount && (
      <div className="text-center" style={{ margin: '10px 0 30px' }}>
        <button className="btn btn-default" onClick={() => setVisibleCount(c => Math.min(c + 10, properties.length))}>
          Load More
        </button>
      </div>
    )}
    {/* Quote preview modal */}
    {showModal && (
      <div className="custom-modal-overlay" onClick={() => setShowModal(false)}>
        <div className="custom-modal" onClick={(e)=>e.stopPropagation()}>
          <div className="custom-modal-header">
            <h3 className="custom-modal-title">Quote Summary</h3>
            <button className="custom-modal-close" onClick={() => setShowModal(false)}>✕</button>
          </div>
          <div className="custom-modal-body">
            {!quote && <p className="text-muted">No quote available.</p>}
            {quote && (
              <div>
                <h4 style={{ marginTop: 0, marginBottom: 16, fontSize: 16, fontWeight: 600, color: '#333' }}>Booking Summary</h4>
                
                {/* Rental Charges */}
                <div className="row" style={{ marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid #f0f0f0' }}>
                  <div className="col-xs-8" style={{ fontSize: 15, color: '#555' }}>Rental Charges</div>
                  <div className="col-xs-4" style={{ textAlign:'right', fontSize: 15, fontWeight: 500 }}>{fmtMoney(quote.reservation_net ?? quote.base_rate ?? quote.net ?? 0)}</div>
                </div>

                {/* Fee Items Breakdown */}
                {(() => {
                  const feeItems = quote.fee_items || quote.fees_items || quote.fees_breakdown || [];
                  const feeList = Array.isArray(feeItems) ? feeItems : Object.values(feeItems || {});
                  let petFeeTotal = Number(quote.computedPetFee || 0) || 0;
                  let cleaningFeeTotal = 0;
                  let otherFeesTotal = 0;
                  const petFees = [];
                  const cleaningFees = [];
                  const otherFees = [];
                  const petKeywords = ['pet', 'animal', 'dog', 'cat'];
                  const cleaningKeywords = ['clean', 'cleaning', 'housekeeping', 'turnover'];
                  const isPetTitle = (t) => {
                    const s = String(t || '').toLowerCase();
                    return petKeywords.some((k) => s.includes(k));
                  };
                  const isCleaningTitle = (t) => {
                    const s = String(t || '').toLowerCase();
                    return cleaningKeywords.some((k) => s.includes(k));
                  };
                  feeList.forEach((f) => {
                    const title = (f?.title || f?.name || 'Fee').trim();
                    const amount = Number(f?.value || f?.amount || 0) || 0;
                    const isPet = isPetTitle(title);
                    const isCleaning = isCleaningTitle(title);
                    if (isPet) {
                      petFees.push({ title, amount });
                      // Prefer explicit item over computed delta when present
                      petFeeTotal = petFeeTotal > 0 ? petFeeTotal : amount;
                    } else if (isCleaning) {
                      cleaningFees.push({ title, amount });
                      cleaningFeeTotal += amount;
                    } else {
                      otherFees.push({ title, amount });
                      otherFeesTotal += amount;
                    }
                  });

                  // Cleaning fee (flat): always $100 for display and calculations
                  const totalFeesFromQuote = Number(quote.fees ?? quote.total_fees ?? quote.fees_net ?? 0) || 0;
                  const estimatedCleaning = 100;

                  // Compute breakdown per spec (display only)
                  const nightlyCharge = Number(quote.reservation_net ?? quote.base_rate ?? quote.net ?? 0) || 0;
                  
                  
                  // Debug: Log all quote data to console for ResultsGrid
                  if (typeof window !== 'undefined' && quote) {
                    console.log('=== RESULTSGRID QUOTE DISCOUNT DEBUG ===');
                    console.log('Selected Property ID:', selectedPropertyId || 'unknown');
                    console.log('Quote keys:', Object.keys(quote));
                    console.log('quote.discounts:', quote.discounts);
                    console.log('quote.discount:', quote.discount);
                    console.log('Full quote object:', quote);
                    console.log('Nightly charge for calculation:', nightlyCharge);
                  }

                  // Robust discount extraction
                  let discount = 0; 
                  try {
                    const directTotals = [quote?.discounts_total, quote?.discount_total, quote?.total_discount];
                    for (const v of directTotals) { if (v != null) { discount = Math.abs(toNum(v)); break; } }
                    if (!discount) {
                      const candidates = [quote?.discounts, quote?.applied_discounts, quote?.discount_items, quote?.details?.discounts, quote?.pricing?.discounts];
                      for (const arr of candidates) {
                        const list = Array.isArray(arr) ? arr : [];
                        if (list.length) {
                          let totalDiscountAmount = 0;
                          for (const d of list) {
                            const val = toNum(d?.value ?? d?.amount ?? d?.net ?? d?.total ?? 0);
                            if (val > 0) {
                              // If value is between 1-100, treat as percentage of nightly charge
                              if (val > 1 && val <= 100) {
                                totalDiscountAmount += (nightlyCharge * val) / 100;
                              } else {
                                // Fixed dollar amount
                                totalDiscountAmount += val;
                              }
                            }
                          }
                          if (totalDiscountAmount > 0) {
                            discount = totalDiscountAmount;
                            break;
                          }
                        }
                      }
                    }
                    if (!discount && quote?.discounts != null) {
                      discount = Math.abs(toNum(quote.discounts));
                    }
                    if (!discount) discount = Math.abs(toNum(quote?.discount || 0)) || 0;
                  } catch { discount = Math.abs(toNum(quote?.discount || 0)) || 0; }
                  const subtotal = nightlyCharge + estimatedCleaning + petFeeTotal - discount;
                  // Taxes based on Nightly + Cleaning only
                  const taxBase = nightlyCharge + estimatedCleaning;
                  const taxAmount = taxBase * 0.135;
                  const grandTotal = subtotal + taxAmount;
                  const bookingAmount = subtotal * 0.05;
                  const totalFeesDisplay = estimatedCleaning + petFeeTotal;

                  return (
                    <>
                      {/* Pet Fee: always show when pets > 0 to avoid confusion */}
                      {Number(criteria.pets || 0) > 0 && (
                        <div className="row" style={{ marginBottom: 6 }}>
                          <div className="col-xs-8" style={{ fontSize: 14, color: '#666', paddingLeft: 20 }}>
                            <span className="glyphicon glyphicon-menu-right" style={{ fontSize: 10, marginRight: 6, color: '#999' }}></span>
                            {petFees[0]?.title || 'Pet Fee'}
                          </div>
                          <div className="col-xs-4" style={{ textAlign:'right', fontSize: 14, color: '#666' }}>{fmtMoney(petFees[0]?.amount ?? petFeeTotal ?? 0)}</div>
                        </div>
                      )}

                      {/* Cleaning Fee: flat $100 (no tax shown here) */}
                      {estimatedCleaning > 0 && (
                        <div className="row" style={{ marginBottom: 6 }}>
                          <div className="col-xs-8" style={{ fontSize: 14, color: '#666', paddingLeft: 20 }}>
                            <span className="glyphicon glyphicon-menu-right" style={{ fontSize: 10, marginRight: 6, color: '#999' }}></span>
                            {cleaningFees[0]?.title || 'Cleaning Fee'}
                          </div>
                          <div className="col-xs-4" style={{ textAlign:'right', fontSize: 14, color: '#666' }}>{fmtMoney(estimatedCleaning)}</div>
                        </div>
                      )}
                      {/* Discount (show if available) */}
                      {(() => {
                        let d = 0; 
                        try {
                          const directTotals = [quote?.discounts_total, quote?.discount_total, quote?.total_discount];
                          for (const v of directTotals) { if (v != null) { d = Math.abs(toNum(v)); break; } }
                          if (!d) {
                            const candidates = [quote?.discounts, quote?.applied_discounts, quote?.discount_items, quote?.details?.discounts, quote?.pricing?.discounts];
                            for (const arr of candidates) {
                              const list = Array.isArray(arr) ? arr : [];
                              if (list.length) {
                                let totalDiscountAmount = 0;
                                for (const disc of list) {
                                  const val = toNum(disc?.value ?? disc?.amount ?? disc?.net ?? disc?.total ?? 0);
                                  if (val > 0) {
                                    const nightlyForDiscount = Number(quote.reservation_net ?? quote.base_rate ?? quote.net ?? 0) || 0;
                                    // If value is between 1-100, treat as percentage of nightly charge
                                    if (val > 1 && val <= 100) {
                                      totalDiscountAmount += (nightlyForDiscount * val) / 100;
                                    } else {
                                      // Fixed dollar amount
                                      totalDiscountAmount += val;
                                    }
                                  }
                                }
                                if (totalDiscountAmount > 0) {
                                  d = totalDiscountAmount;
                                  break;
                                }
                              }
                            }
                          }
                          if (!d && quote?.discounts != null) {
                            d = Math.abs(toNum(quote.discounts));
                          }
                          if (!d) d = Math.abs(toNum(quote?.discount || 0)) || 0;
                        } catch {}
                        return d > 0 ? (
                          <div className="row" style={{ marginBottom: 6 }}>
                            <div className="col-xs-8" style={{ fontSize: 14, color: '#666', paddingLeft: 20 }}>
                              <span className="glyphicon glyphicon-menu-right" style={{ fontSize: 10, marginRight: 6, color: '#999' }}></span>
                              Discount
                            </div>
                            <div className="col-xs-4" style={{ textAlign:'right', fontSize: 14, color: '#059669' }}>-{fmtMoney(d)}</div>
                          </div>
                        ) : null;
                      })()}
                      
                      {/* Other Fees */}
                      {otherFees.map((fee, idx) => (
                        <div key={`fee-${idx}`} className="row" style={{ marginBottom: 6 }}>
                          <div className="col-xs-8" style={{ fontSize: 14, color: '#666', paddingLeft: 20 }}>
                            <span className="glyphicon glyphicon-menu-right" style={{ fontSize: 10, marginRight: 6, color: '#999' }}></span>
                            {fee.title}
                          </div>
                          <div className="col-xs-4" style={{ textAlign:'right', fontSize: 14, color: '#666' }}>{fmtMoney(fee.amount)}</div>
                        </div>
                      ))}

                      {/* Total Fees Summary (Pet + Cleaning only) */}
                      <div className="row" style={{ marginBottom: 8, marginTop: 8, paddingBottom: 8, borderBottom: '1px solid #f0f0f0' }}>
                        <div className="col-xs-8" style={{ fontSize: 15, color: '#555', fontWeight: 500 }}>Total Fees</div>
                        <div className="col-xs-4" style={{ textAlign:'right', fontSize: 15, fontWeight: 500 }}>{fmtMoney(totalFeesDisplay)}</div>
                      </div>

                      {/* Calculated breakdown */}
                      <div className="row" style={{ marginTop: 8 }}>
                        <div className="col-xs-8" style={{ fontSize: 15, color: '#555' }}>Subtotal</div>
                        <div className="col-xs-4" style={{ textAlign:'right', fontSize: 15 }}>{fmtMoney(subtotal)}</div>
                        <div className="col-xs-8" style={{ fontSize: 15, color: '#555' }}>Taxes (13.5%)</div>
                        <div className="col-xs-4" style={{ textAlign:'right', fontSize: 15 }}>{fmtMoney(taxAmount)}</div>
                        <div className="col-xs-12" style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                          (Calculated on Nightly Charge + Cleaning Fee only)
                        </div>
                      </div>
                    </>
                  );
                })()}

                {/* Remove API taxes row to avoid mismatch; calculated taxes shown above */}

                {/* Deposit */}
                <div className="row" style={{ marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid #f0f0f0' }}>
                  <div className="col-xs-8" style={{ fontSize: 15, color: '#555' }}>Security Deposit</div>
                  <div className="col-xs-4" style={{ textAlign:'right', fontSize: 15, fontWeight: 500 }}>{fmtMoney(quote.deposit ?? quote.security_deposit ?? 0)}</div>
                </div>

                {/* Grand Total */}
                {(() => {
                  const nightlyCharge = Number(quote.reservation_net ?? quote.base_rate ?? quote.net ?? 0) || 0;
                  const petFees = Number(quote.computedPetFee || 0) || 0;
                  const cleaning = 100;
                  let discount = 0; 
                  try {
                    const list = Array.isArray(quote.discounts) ? quote.discounts : [];
                    if (list.length) {
                      let totalDiscountAmount = 0;
                      for (const d of list) {
                        const val = Number(d?.value ?? d?.amount ?? d?.net ?? d?.total ?? 0) || 0;
                        if (val > 0) {
                          // If value is between 1-100, treat as percentage of nightly charge
                          if (val > 1 && val <= 100) {
                            totalDiscountAmount += (nightlyCharge * val) / 100;
                          } else {
                            // Fixed dollar amount
                            totalDiscountAmount += val;
                          }
                        }
                      }
                      discount = totalDiscountAmount;
                    } else {
                      discount = Math.abs(Number(quote.discount || 0)) || 0;
                    }
                  } catch { discount = Math.abs(Number(quote.discount || 0)) || 0; }
                  const subtotal = nightlyCharge + cleaning + petFees - discount;
                  const tax = (nightlyCharge + cleaning) * 0.135;
                  const total = subtotal + tax;
                  const bookingAmountFinal = subtotal * 0.05;
                  return (
                    <>
                      <div className="row" style={{ fontWeight: 700, fontSize: 20, padding: '12px 0', background: '#f8f9fa', margin: '0 -16px', paddingLeft: 16, paddingRight: 16, borderRadius: 6 }}>
                        <div className="col-xs-8" style={{ color: '#333' }}>Grand Total</div>
                        <div className="col-xs-4" style={{ textAlign:'right', color:'#2e7d32' }}>{fmtMoney(total)}</div>
                      </div>
                      <div className="row" style={{ marginTop: 8 }}>
                        <div className="col-xs-8" style={{ fontSize: 15, color: '#2E5C9A', fontWeight: 600 }}>Booking Amount (5%)</div>
                        <div className="col-xs-4" style={{ textAlign:'right', fontSize: 15, color: '#2E5C9A', fontWeight: 600 }}>{fmtMoney(bookingAmountFinal)}</div>
                        <div className="col-xs-12" style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                          (5% of Subtotal)
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
            {bookingError && <div className="alert alert-danger" style={{ marginTop: 12 }}>{bookingError}</div>}
          </div>
          <div className="custom-modal-footer">
            <button className="btn btn-default" onClick={() => setShowModal(false)}>Close</button>
            <Link
              href={`/checkout?property_id=${encodeURIComponent(selectedPropertyId || '')}&check_in=${encodeURIComponent(searchCriteria.from_date || '')}&check_out=${encodeURIComponent(searchCriteria.to_date || '')}&adults=${encodeURIComponent(searchCriteria.guests || 2)}&children=${encodeURIComponent(0)}&pets=${encodeURIComponent(effectivePets)}`}
              className="btn btn-primary"
              onClick={() => { try { showLoader(); } catch {}; setShowModal(false); }}
            >
              Continue
            </Link>
          </div>
        </div>
        <style jsx>{`
          .custom-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; z-index: 1050; }
          .custom-modal { width: 680px; max-width: calc(100% - 32px); background: #fff; border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,.25); overflow: hidden; }
          .custom-modal-header { display:flex; align-items:center; justify-content:space-between; padding: 14px 18px; background: linear-gradient(90deg, #2563eb, #4f46e5); color:#fff; }
          .custom-modal-title { margin:0; font-size: 18px; font-weight: 600; }
          .custom-modal-close { border:none; background: transparent; color: #fff; font-size: 18px; cursor: pointer; }
          .custom-modal-body { padding: 16px; }
          .custom-modal-footer { display:flex; justify-content:flex-end; gap:8px; padding:12px 16px; background:#f9fafb; border-top:1px solid #e5e7eb; }
        `}</style>
      </div>
    )}
    </>
  );
}
