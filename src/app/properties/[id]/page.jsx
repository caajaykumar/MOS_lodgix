'use client';
import { useEffect, useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs, FreeMode, Zoom } from 'swiper/modules';
import Image from 'next/image';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import 'swiper/css/zoom';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { 
  FaBed, 
  FaBath, 
  FaUsers, 
  FaRulerCombined, 
  FaWifi, 
  FaSwimmingPool, 
  FaParking, 
  FaUtensils, 
  FaTv, 
  FaSnowflake,
  FaMapMarkerAlt,
  FaStar,
  FaCalendarAlt,
  FaUserFriends,
  FaDollarSign,
  FaShareAlt,
  FaHeart,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaExpand
} from 'react-icons/fa';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import styles from './propertyDetails.module.css';
import PopupGallery from './PopupGallery';
import GuestSelector from '@/app/components/GuestSelector';

// Sample amenities data - replace with actual data from your API
const AMENITIES = [
  { id: 'wifi', name: 'Free WiFi', icon: <FaWifi /> },
  { id: 'pool', name: 'Swimming Pool', icon: <FaSwimmingPool /> },
  { id: 'parking', name: 'Free Parking', icon: <FaParking /> },
  { id: 'kitchen', name: 'Kitchen', icon: <FaUtensils /> },
  { id: 'ac', name: 'Air Conditioning', icon: <FaSnowflake /> },
  { id: 'tv', name: 'Cable TV', icon: <FaTv /> },
];


const PropertyDetails = () => {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [zoom, setZoom] = useState(false);
  // Controls the photo gallery modal visibility
  const [showGallery, setShowGallery] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  
  // Booking form state
  const [bookingData, setBookingData] = useState({
    checkIn: null,
    checkOut: null,
    adults: 2,
    children: 0,
    infants: 0,
    pets: 0,
    specialRequests: ''
  });
  const [guestOpen, setGuestOpen] = useState(false);
  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [imagesReady, setImagesReady] = useState(false);
  const dateWrapRef = useRef(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeField, setActiveField] = useState('checkin'); // 'checkin' | 'checkout'

  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Handle date selection from URL parameters
  useEffect(() => {
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const guests = searchParams.get('guests');
    
    if (checkIn && checkOut) {
      setBookingData(prev => ({
        ...prev,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        adults: guests ? parseInt(guests) : 2
      }));
      setShowBookingForm(true);
    }
  }, [searchParams]);

  // Close date popover on outside click / ESC
  useEffect(() => {
    const onDocClick = (e) => {
      if (!pickerOpen) return;
      if (dateWrapRef.current && !dateWrapRef.current.contains(e.target)) setPickerOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setPickerOpen(false); };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [pickerOpen]);
  
  // Helpers
  const nightlyRate = property?.price_per_night ?? property?.nightly_rate_min ?? 0;

  const getPropertyId = () => {
    // Try multiple common fields that may hold the Lodgix property id
    const candidates = [
      property?.id,
      property?.property_id,
      property?.lodgix_id,
      property?.result?.id,
      id,
    ];
    const num = Number(candidates.find((x) => Number(x) > 0));
    return Number.isFinite(num) && num > 0 ? num : 0;
  };

  const getRoomId = () => {
    try {
      // Try from property shape if rooms/units exist
      const candidates = [
        property?.room_id,
        property?.default_room_id,
        property?.rooms?.[0]?.id,
        property?.units?.[0]?.id,
      ];
      // Try from URL (?room_id=...)
      const spRoom = searchParams?.get ? Number(searchParams.get('room_id')) : 0;
      if (spRoom && Number(spRoom) > 0) candidates.unshift(spRoom);
      const num = Number(candidates.find((x) => Number(x) > 0));
      return Number.isFinite(num) && num > 0 ? num : 0;
    } catch { return 0; }
  };

  const formatCurrency = (amount) => {
    try {
      const currency = property?.currency || 'INR';
      const locale = currency === 'INR' ? 'en-IN' : 'en-US';
      return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount || 0);
    } catch {
      return `₹${Math.round(amount || 0).toLocaleString('en-IN')}`;
    }
  };

  // Calculate nights and an estimated total when a nightly rate exists
  const calculateTotal = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return null;
    const nights = Math.max(1, Math.ceil((bookingData.checkOut - bookingData.checkIn) / (1000 * 60 * 60 * 24)));
    if (!nightlyRate) return { nights };
    const subtotal = nights * nightlyRate;
    const taxes = subtotal * 0.1; // 10% tax (estimate only)
    const cleaningFee = 50; // Fixed cleaning fee (estimate only)
    const serviceFee = subtotal * 0.05; // 5% service fee (estimate only)
    return { nights, subtotal, taxes, cleaningFee, serviceFee, total: subtotal + taxes + cleaningFee + serviceFee };
  };
  
  const totalCost = calculateTotal();

  // Auto fetch quote when inputs are ready
  useEffect(() => {
    const ready = bookingData.checkIn && bookingData.checkOut && getPropertyId() > 0;
    if (!ready) {
      setQuote(null);
      return;
    }
    const controller = new AbortController();
    const run = async () => {
      try {
        setQuoteLoading(true);
        setQuoteError(null);
        const payload = {
          from_date: format(bookingData.checkIn, 'yyyy-MM-dd'),
          to_date: format(bookingData.checkOut, 'yyyy-MM-dd'),
          adults: Number(bookingData.adults) || 0,
          children: Number(bookingData.children) || 0,
          pets: Number(bookingData.pets) || 0,
          property_id: getPropertyId(),
        };
        const roomId = getRoomId();
        if (roomId > 0) payload.room_id = roomId;
        try { console.debug('Quote payload', payload); } catch {}
        const resp = await fetch('/api/reservations/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
          cache: 'no-store'
        });
        const data = await resp.json().catch(() => ({}));
        try { console.debug('Quote response', { status: resp.status, data }); } catch {}
        if (!resp.ok || !data.success) {
          throw new Error(data?.error || 'Failed to fetch quote');
        }
        const q = data.data || null;
        setQuote(q);
        try {
          if (typeof window !== 'undefined') {
            window.sessionStorage.setItem('lodgix_latest_quote', JSON.stringify({ quote: q, payload }));
          }
        } catch (_) {}
      } catch (e) {
        if (e.name !== 'AbortError') setQuoteError(e.message || 'Failed to fetch quote');
        setQuote(null);
      } finally {
        setQuoteLoading(false);
      }
    };
    run();
    return () => controller.abort();
  }, [bookingData.checkIn, bookingData.checkOut, bookingData.adults, bookingData.children, bookingData.pets, id, property]);

  // Preload key images to keep loader visible until visuals are ready
  useEffect(() => {
    if (!property) { setImagesReady(false); return; }
    const photos = Array.isArray(property.photos) ? property.photos : [];
    const targets = photos.slice(0, 4).map(p => p?.url).filter(Boolean);
    if (targets.length === 0) { setImagesReady(true); return; }
    let cancelled = false;
    let loaded = 0;
    targets.forEach(src => {
      try {
        const img = new window.Image();
        img.onload = img.onerror = () => { if (!cancelled) { loaded += 1; if (loaded >= targets.length) setImagesReady(true); } };
        img.src = src;
      } catch { /* ignore */ }
    });
    return () => { cancelled = true; };
  }, [property]);
  
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    // Navigate directly to checkout with selected dates and guest counts
    const propertyId = getPropertyId();
    const from = format(bookingData.checkIn, 'yyyy-MM-dd');
    const to = format(bookingData.checkOut, 'yyyy-MM-dd');
    const adults = Number(bookingData.adults) || 0;
    const children = Number(bookingData.children) || 0;
    const pets = Number(bookingData.pets) || 0;
    const params = new URLSearchParams({
      property_id: String(propertyId || ''),
      from_date: from,
      to_date: to,
      adults: String(adults),
      children: String(children),
      pets: String(pets),
    });
    const roomId = getRoomId();
    if (roomId > 0) params.set('room_id', String(roomId));
    router.push(`/checkout?${params.toString()}`);
  };

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/properties/${id}`, {
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // Ensure we have photos; if missing, fetch via local proxy and map best URL fields
        try {
          if (!data?.photos || data.photos.length === 0) {
            const pr = await fetch(`/api/properties/${id}/photos`, { cache: 'no-store' });
            if (pr.ok) {
              const ph = await pr.json();
              const list = Array.isArray(ph) ? ph : (ph.data || ph.results || []);
              const mapped = (Array.isArray(list) ? list : []).map((p) => {
                const url = p.url_medium 
                  || p.url_large 
                  || p.url 
                  || p.preview_url 
                  || p.thumbnail_url 
                  || p.p_thumbnail_url 
                  || p.url_small 
                  || p.url_original;
                return { url };
              }).filter(x => !!x.url);
              data.photos = mapped;
            }
          } else {
            // Normalize any existing photo objects so Swiper receives {url}
            data.photos = data.photos.map((p) => ({
              url: p.url 
                || p.url_medium 
                || p.url_large 
                || p.preview_url 
                || p.thumbnail_url 
                || p.p_thumbnail_url 
                || p.url_small 
                || p.url_original
            })).filter(x => !!x.url);
          }
        } catch (_) { /* non-blocking */ }

        setProperty(data);
      } catch (err) {
        console.error("Error fetching property:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <div className={styles.overlayLoader}>
        <div className={styles.skeletonGrid}>
          <div className={styles.skeletonCard}>
            <div className={`${styles.skeletonBlock} ${styles.gallerySkeleton}`}></div>
            <div className={`${styles.skeletonText} ${styles.titleSkeleton} ${styles.skeletonBlock}`} style={{ marginTop: 18 }}></div>
            <div style={{ display:'flex', gap:10, marginTop: 10 }}>
              <div className={`${styles.skeletonBlock} ${styles.skeletonChip}`}></div>
              <div className={`${styles.skeletonBlock} ${styles.skeletonChip}`}></div>
              <div className={`${styles.skeletonBlock} ${styles.skeletonChip}`}></div>
            </div>
            <div className={`${styles.skeletonText} ${styles.skeletonBlock}`} style={{ width:'90%' }}></div>
            <div className={`${styles.skeletonText} ${styles.skeletonBlock}`} style={{ width:'80%' }}></div>
            <div className={`${styles.skeletonText} ${styles.skeletonBlock}`} style={{ width:'70%' }}></div>
          </div>
          <div className={styles.skeletonCard}>
            <div className={`${styles.skeletonBlock} ${styles.bookingSkeletonHeader}`}></div>
            <div className={`${styles.skeletonBlock} ${styles.bookingSkeletonBox}`}></div>
            <div className={`${styles.skeletonBlock} ${styles.bookingSkeletonBtn}`}></div>
            <div className={`${styles.skeletonText} ${styles.skeletonBlock}`} style={{ width:'60%' }}></div>
            <div className={`${styles.skeletonText} ${styles.skeletonBlock}`} style={{ width:'80%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-lg">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">We couldn't load the property details. {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
          <button 
            onClick={() => router.push('/')} 
            className="ml-4 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error loading property: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // If data is ready but images are still loading, keep showing the skeleton overlay
  const showVisualLoader = !imagesReady;

  return (
    <>
      {showVisualLoader && (
        <div className={styles.overlayLoader}>
          <div className={styles.skeletonGrid}>
            <div className={styles.skeletonCard}>
              <div className={`${styles.skeletonBlock} ${styles.gallerySkeleton}`}></div>
              <div className={`${styles.skeletonText} ${styles.titleSkeleton} ${styles.skeletonBlock}`} style={{ marginTop: 18 }}></div>
              <div style={{ display:'flex', gap:10, marginTop: 10 }}>
                <div className={`${styles.skeletonBlock} ${styles.skeletonChip}`}></div>
                <div className={`${styles.skeletonBlock} ${styles.skeletonChip}`}></div>
                <div className={`${styles.skeletonBlock} ${styles.skeletonChip}`}></div>
              </div>
              <div className={`${styles.skeletonText} ${styles.skeletonBlock}`} style={{ width:'90%' }}></div>
              <div className={`${styles.skeletonText} ${styles.skeletonBlock}`} style={{ width:'80%' }}></div>
              <div className={`${styles.skeletonText} ${styles.skeletonBlock}`} style={{ width:'70%' }}></div>
            </div>
            <div className={styles.skeletonCard}>
              <div className={`${styles.skeletonBlock} ${styles.bookingSkeletonHeader}`}></div>
              <div className={`${styles.skeletonBlock} ${styles.bookingSkeletonBox}`}></div>
              <div className={`${styles.skeletonBlock} ${styles.bookingSkeletonBtn}`}></div>
              <div className={`${styles.skeletonText} ${styles.skeletonBlock}`} style={{ width:'60%' }}></div>
              <div className={`${styles.skeletonText} ${styles.skeletonBlock}`} style={{ width:'80%' }}></div>
            </div>
          </div>
        </div>
      )}
      <Breadcrumb
        title={property.name || 'Unnamed Property'}
        breadcrumbs={[
          { name: 'Home', link: '/', active: false },
          { name: 'properties', link: '/properties', active: false },
          { name: property.name || 'Unnamed Property', link: '#', active: true },
        ]}
      />
      <section className="room_details_area" >

        <div className="container">
          <div className="row room_details_inner">



            <div className="col-md-6">
              {property.photos?.length > 0 ? (
                <Swiper
                  modules={[Navigation, Pagination]}
                  navigation
                  pagination={{ clickable: true }}
                  loop={true}
                  style={{ borderRadius: "10px" }}
                >
                  {property.photos.map((photo, index) => (
                    <SwiperSlide key={index} className="relative">
                      <Image
                        src={photo.url}
                        alt={`${property.name || "Property"} - ${index + 1}`}
                        width={800}
                        height={375}

                        loading="lazy"
                        className="object-cover"
                        style={{ borderRadius: "10px" }}

                        onError={(e) => {
                          console.error("Error loading image:", e);
                          e.currentTarget.src = "/img/placeholder-property.jpg";
                        }}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : (
                <div className="w-full h-[400px] flex flex-col items-center justify-center bg-gray-100 rounded-lg">
                  <svg
                    className="w-16 h-16 text-gray-400 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-gray-500">No images available</span>
                </div>
              )}
            </div>


            <div className="col-lg-3 col-md-3">
              {property.photos?.slice(0, 2).map((photo, index) => (
                <Image
                  key={index}
                  src={photo.url}
                  alt={`Thumbnail ${index + 1}`}
                  width={350}
                  height={350}
                  className="img-responsive marbottomsm "
                  style={{ marginTop: "10px", borderRadius: "10px" }}
                />
              ))}
            </div>

            <div className="col-lg-3 col-md-3" style={{position:"relative"}}>
              {property.photos?.slice(2, 4).map((photo, index) => (
                <Image
                  key={index}
                  src={photo.url}
                  alt={`Thumbnail ${index + 3}`}
                  width={350}
                  height={350}
                  className="img-responsive marbottomsm "
                  style={{ marginTop: "10px", borderRadius: "10px" }}
                />
              ))}

              {/* Show All Photos button */}

              <button className={`btn btn-info mt-2 ${styles.photobtn}`} id="openBtn"
                onClick={() => setShowGallery(true)}>
                <i className="fa fa-bars"></i> Show All Photos
              </button>
              <div className={styles.overlay} id="overlay" style={{ display: "none" }}></div>


            </div>


            {showGallery && (
              <>
                {/* Overlay: clicking closes the modal */}
                <div
                  className={styles.overlay}
                  id="overlay"
                  onClick={() => setShowGallery(false)}
                  style={{ display: "block" }}
                ></div>
                {/* Modal popup: prevent click from closing when clicking inside */}
                <div
                  className={`${styles.popup} ${styles.show}`}
                  id="popup"
                  onClick={e => e.stopPropagation()}
                  style={{ display: "block" }}
                >
                  <PopupGallery
                    isOpen={showGallery}
                    onClose={() => setShowGallery(false)}
                    property={property}
                  />
                </div>
              </>
            )}


          </div>

          <div className="row room_details_inner" style={{ marginTop: "20px" }}>
            {/* proparties details section  */}
            <div className="col-md-8">
              <div className="room_details">
                <h2 className="home_name">{property.name || 'Unnamed Property'}</h2>

                <ul className="home_feature" style={{
                  paddingLeft: "0",
                  listStyleType: "circle",
                  display: "inline-flex",
                  gap: "16px",
                  margin: 0,
                  alignItems: "center",

                }}>
                  <li> 6 Guests</li>
                  <li> {property.bedrooms} {property.bedrooms > 1 ? 'Bedrooms' : 'Bedroom'}</li>
                  <li> {property.bathrooms} {property.bathrooms > 1 ? 'Bathrooms' : 'Bathroom'}</li>
                </ul>


                <div className="host_details" style={{ borderTop: "1px solid #ddd" }}>
                  <div className="item item_img">

                    <img src="/img/manny.png" className="manny_img" />
                  </div>
                  <div className="item item_name">
                    <p>   Hosted by Manny</p>
                    <span> 13 years hosting</span>
                  </div>





                </div>


                <div className="host_details">
                  <div className="item item_img">


                    <img src="/img/icon/check-in.png" />
                  </div>
                  <div className="item item_name">
                    <p>Self check-in</p>
                    <span>Check yourself in with the keypad.</span>
                  </div>



                </div>


                <div className="s_blog_quote1">
                  <p id="shortContent">{property.description}</p>

                </div>

                <div className="s_blog_quote1">
                  <p id="shortContent">{property.additional_info}</p>

                </div>

              </div>

            </div>

            {/* proparties booking section */}
            <div className="col-md-4">
              <div className={`bg-white ${styles.quoteCard} p-4 md:p-5 sticky-top`} style={{ top: 20 }}>
                {quoteLoading ? (
                  <div className={styles.priceHeader}>
                    <span className={styles.nightsText}>Calculating quote…</span>
                  </div>
                ) : bookingData.checkIn && bookingData.checkOut && quote ? (
                  <div className={styles.priceHeader}>
                    {(() => {
                      const subtotal = Number(quote?.reservation_net ?? quote?.base_rate ?? quote?.discounted_rent_rental_charges ?? quote?.net ?? 0) || 0;
                      const taxes = Number(quote?.taxes ?? quote?.total_tax ?? 0) || 0;
                      const fees = Number(quote?.fees ?? quote?.total_fees ?? quote?.fees_net ?? 0) || 0;
                      const discount = Math.abs(Number(quote?.discount || 0)) || 0;
                      const total = Number(quote?.gross ?? quote?.total) || (subtotal + taxes + fees - discount);
                      const finalTotal = Math.max(0, total);
                      const nights = (quote.nights ?? totalCost?.nights) || 0;
                      return (
                        <>
                          <span className={styles.originalPrice}>{formatCurrency(Math.round(finalTotal * 1.13))}</span>
                          <span className={styles.finalPrice}>{formatCurrency(Math.round(finalTotal))}</span>
                          <span className={styles.nightsText}>for {nights || '-'} night{(nights || 0) > 1 ? 's' : ''}</span>
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <div className={styles.priceHeader}>
                    {bookingData.checkIn && bookingData.checkOut && totalCost ? (
                      <>
                        {typeof totalCost.total === 'number' ? (
                          <>
                            <span className={styles.finalPrice}>{formatCurrency(Math.round(totalCost.total))}</span>
                            <span className={styles.nightsText}>for {totalCost.nights} night{totalCost.nights > 1 ? 's' : ''} (est.)</span>
                          </>
                        ) : (
                          <>
                            <span className={styles.finalPrice}>{formatCurrency(0)}</span>
                            <span className={styles.nightsText}>for {totalCost.nights} night{totalCost.nights > 1 ? 's' : ''}</span>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <span className={styles.finalPrice}>{formatCurrency(nightlyRate)}</span>
                        <span className={styles.nightsText}>/ night</span>
                      </>
                    )}
                  </div>
                )}

                <div className={styles.selectorCard} ref={dateWrapRef}>
                  <div className={styles.selectorGrid}>
                    <div className={`${styles.selectorCell} ${styles.cellDivider}`}>
                      <div className={styles.cellLabel}>CHECK-IN</div>
                      <input
                        type="text"
                        readOnly
                        className={styles.dateInput}
                        value={bookingData.checkIn ? new Date(bookingData.checkIn).toLocaleDateString() : ''}
                        placeholder="Add date"
                        onClick={() => { setActiveField('checkin'); setPickerOpen(true); }}
                      />
                    </div>
                    <div className={styles.selectorCell}>
                      <div className={styles.cellLabel}>CHECKOUT</div>
                      <input
                        type="text"
                        readOnly
                        className={styles.dateInput}
                        value={bookingData.checkOut ? new Date(bookingData.checkOut).toLocaleDateString() : ''}
                        placeholder="Add date"
                        onClick={() => { setActiveField('checkout'); setPickerOpen(true); }}
                      />
                    </div>
                  </div>
                  {pickerOpen && (
                    <div className="pd-popover">
                      <DayPicker
                        mode="range"
                        numberOfMonths={1}
                        selected={{ from: bookingData.checkIn || undefined, to: bookingData.checkOut || undefined }}
                        defaultMonth={activeField === 'checkout' ? (bookingData.checkOut || bookingData.checkIn || new Date()) : (bookingData.checkIn || new Date())}
                        onSelect={(r) => {
                          const from = r?.from ? new Date(r.from) : null;
                          const to = r?.to ? new Date(r.to) : null;
                          setBookingData(prev => ({ ...prev, checkIn: from, checkOut: to }));
                          if (from && to) setPickerOpen(false);
                        }}
                        disabled={{ before: new Date(new Date().toDateString()) }}
                      />
                      <div className="pd-popover-actions">
                        <button type="button" className="btn btn-default btn-xs" onClick={() => setBookingData(prev => ({ ...prev, checkIn: null, checkOut: null }))}>Clear</button>
                        <button type="button" className="btn btn-primary btn-xs" onClick={() => setPickerOpen(false)}>Done</button>
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.guestRow}>
                  <GuestSelector
                    value={{ adults: bookingData.adults, children: bookingData.children, infants: bookingData.infants, pets: bookingData.pets }}
                    onChange={(v) => setBookingData(prev => ({ ...prev, adults: v.adults, children: v.children, infants: v.infants, pets: v.pets }))}
                  />
                </div>

                <div className="mt-4">
                  <button
                    onClick={handleBookingSubmit}
                    disabled={!bookingData.checkIn || !bookingData.checkOut}
                    className={styles.reserveBtn}
                  >
                    Reserve
                  </button>
                  <p className={styles.note}>You won't be charged yet</p>
                  {quoteError && (
                    <p className="text-xs" style={{ color:'#b91c1c', textAlign:'center', marginTop: 6 }}>{quoteError}</p>
                  )}
                </div>

                {/* Pricing breakdown intentionally removed per request; only show note and Reserve button */}
              </div>
            </div>

          </div>
        </div>

      </section>
      {showQuoteModal && quote && (
        <div className="custom-modal-overlay" onClick={() => setShowQuoteModal(false)}>
          <div className="custom-modal" onClick={(e)=>e.stopPropagation()}>
            <div className="custom-modal-header">
              <h3 className="custom-modal-title">Quote Summary</h3>
              <button className="custom-modal-close" onClick={() => setShowQuoteModal(false)}>✕</button>
            </div>
            <div className="custom-modal-body">
              <div className="summary-grid">
                <div className="summary-card"><div className="label">Net</div><div className="value">{formatCurrency(quote?.net ?? quote?.base_rate ?? 0)}</div></div>
                <div className="summary-card"><div className="label">Gross</div><div className="value" style={{ color:'#16a34a' }}>{formatCurrency(quote?.gross ?? quote?.total ?? 0)}</div></div>
                <div className="summary-card"><div className="label">Fees (net)</div><div className="value">{formatCurrency(quote?.fees_net ?? quote?.total_fees ?? 0)}</div></div>
                <div className="summary-card"><div className="label">Taxes</div><div className="value">{formatCurrency(quote?.taxes ?? quote?.total_tax ?? 0)}</div></div>
                <div className="summary-card"><div className="label">Nights</div><div className="value">{quote?.nights ?? '-'}</div></div>
              </div>
              <details className="raw-toggle" style={{ marginTop: 10 }}>
                <summary>Raw response</summary>
                <pre style={{ whiteSpace:'pre-wrap' }}>{JSON.stringify(quote, null, 2)}</pre>
              </details>
            </div>
            <div className="custom-modal-footer">
              <button className="btn btn-default" onClick={() => setShowQuoteModal(false)}>Close</button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setShowQuoteModal(false);
                  router.push(`/booking?propertyId=${id}&checkIn=${format(bookingData.checkIn, 'yyyy-MM-dd')}&checkOut=${format(bookingData.checkOut, 'yyyy-MM-dd')}&guests=${bookingData.adults + bookingData.children}`);
                }}
              >
                Continue to Guest Details
              </button>
            </div>
          </div>
          <style jsx>{`
            .custom-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; z-index: 1050; }
            .custom-modal { width: 720px; max-width: calc(100% - 32px); background: #fff; border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,.25); overflow: hidden; }
            .custom-modal-header { display:flex; align-items:center; justify-content:space-between; padding: 14px 18px; background: linear-gradient(90deg, #2563eb, #4f46e5); color:#fff; }
            .custom-modal-title { margin:0; font-size: 18px; font-weight: 600; }
            .custom-modal-close { border:none; background: transparent; color: #fff; font-size: 18px; cursor: pointer; }
            .custom-modal-body { padding: 16px; }
            .summary-grid { display:grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap:12px; margin-bottom: 16px; }
            .summary-card { border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px; }
            .summary-card .label { font-size: 12px; color: #6b7280; }
            .summary-card .value { font-size: 18px; font-weight: 600; }
            .custom-modal-footer { display:flex; justify-content:flex-end; gap:8px; padding:12px 16px; background:#f9fafb; border-top:1px solid #e5e7eb; }
          `}</style>
        </div>
      )}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* <h1 className="text-3xl font-bold mb-6">{property.name || 'Property Details'}</h1> */}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="relative w-full h-96 bg-gray-100 overflow-hidden">

          </div>

          <div className="p-6">
            <div className="mb-6">
              {/* <h1 className="text-3xl font-bold text-gray-800 mb-2">{property.name || 'Unnamed Property'}</h1> */}
              {/* {property.location && (
                <p className="text-gray-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {property.location}
                </p>
              )} */}
            </div>

            {/* Property Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
              {/* {property.bedrooms && (
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-2">
                  <FaBed className="text-blue-600 text-xl" />
                </div>
                <span className="text-sm text-gray-600">{property.bedrooms} {property.bedrooms > 1 ? 'Bedrooms' : 'Bedroom'}</span>
              </div>
            )} */}

              {/* {property.bathrooms && (
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-2">
                  <FaBath className="text-blue-600 text-xl" />
                </div>
                <span className="text-sm text-gray-600">{property.bathrooms} {property.bathrooms > 1 ? 'Bathrooms' : 'Bathroom'}</span>
              </div>
            )}
             */}
              {/* {property.area && (
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </div>
                <span className="text-sm text-gray-600">{property.area} sq.ft</span>
              </div>
            )} */}

              {/* {property.nightly_rate_min && (
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm text-gray-600">${property.nightly_rate_min}/night</span>
              </div>
            )} */}
            </div>

            {/* Description */}
            {/* {property.description && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3 text-gray-800">About This Property</h2>
              <p className="text-gray-700 leading-relaxed">{property.description}</p>
            </div>
          )} */}

            {property.nightly_rate_min && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  ${property.nightly_rate_min} <span className="text-base font-normal text-gray-500">/ night</span>
                </p>
              </div>
            )}


   {/* <Reviews propertyId={property.id} /> */}



          </div>
        </div>
      </div>
    </>
  );
}

export default PropertyDetails;
