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
  FaExpand,
  FaArrowRight
} from 'react-icons/fa';
import { format, addDays, isAfter, isBefore, parseISO } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';

// Sample amenities data - replace with actual data from your API
const AMENITIES = [
  { id: 'wifi', name: 'Free WiFi', icon: <FaWifi /> },
  { id: 'pool', name: 'Swimming Pool', icon: <FaSwimmingPool /> },
  { id: 'parking', name: 'Free Parking', icon: <FaParking /> },
  { id: 'kitchen', name: 'Kitchen', icon: <FaUtensils /> },
  { id: 'ac', name: 'Air Conditioning', icon: <FaSnowflake /> },
  { id: 'tv', name: 'Cable TV', icon: <FaTv /> },
  { id: 'washer', name: 'Washer', icon: <FaUtensils /> },
  { id: 'dryer', name: 'Dryer', icon: <FaUtensils /> },
  { id: 'heating', name: 'Heating', icon: <FaSnowflake /> },
  { id: 'workspace', name: 'Workspace', icon: <FaTv /> },
];

const PropertyDetails = () => {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [zoom, setZoom] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  
  // Booking form state
  const [bookingData, setBookingData] = useState({
    checkIn: null,
    checkOut: null,
    adults: 2,
    children: 0,
    specialRequests: ''
  });

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
        adults: guests ? Math.max(1, parseInt(guests)) : 2
      }));
    }
  }, [searchParams]);
  
  // Fetch property details
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
  
  // Calculate total price
  const calculateTotal = () => {
    if (!bookingData.checkIn || !bookingData.checkOut || !property?.price_per_night) {
      return {
        nights: 0,
        subtotal: 0,
        taxes: 0,
        cleaningFee: 0,
        serviceFee: 0,
        total: 0
      };
    }
    
    const nights = Math.ceil((bookingData.checkOut - bookingData.checkIn) / (1000 * 60 * 60 * 24));
    const subtotal = nights * property.price_per_night;
    const taxes = subtotal * 0.1; // 10% tax
    const cleaningFee = 50; // Fixed cleaning fee
    const serviceFee = subtotal * 0.05; // 5% service fee
    
    return {
      nights,
      subtotal,
      taxes,
      cleaningFee,
      serviceFee,
      total: subtotal + taxes + cleaningFee + serviceFee
    };
  };
  
  const totalCost = calculateTotal();
  
  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!bookingData.checkIn || !bookingData.checkOut) {
      alert('Please select check-in and check-out dates');
      return;
    }
    
    router.push(`/booking?propertyId=${id}&checkIn=${format(bookingData.checkIn, 'yyyy-MM-dd')}&checkOut=${format(bookingData.checkOut, 'yyyy-MM-dd')}&guests=${bookingData.adults + bookingData.children}`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-8">
            {/* Image Gallery Skeleton */}
            <div className="h-96 bg-gray-200 rounded-xl"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content Skeleton */}
              <div className="lg:col-span-2 space-y-6">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>
                  ))}
                </div>
                
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-100 rounded w-full"></div>
                  <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                </div>
              </div>
              
              {/* Booking Widget Skeleton */}
              <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-12 bg-gray-100 rounded-lg"></div>
                    ))}
                  </div>
                  <div className="h-12 bg-blue-500 rounded-lg"></div>
                </div>
              </div>
            </div>
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
          <p className="text-red-500 mb-4">Property not found</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Get first 6 amenities for the overview
  const visibleAmenities = showAllAmenities 
    ? AMENITIES 
    : AMENITIES.slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb 
          items={[
            { label: 'Home', href: '/' },
            { label: 'Properties', href: '/properties' },
            { label: property.name || 'Property Details', active: true }
          ]} 
        />

        {/* Property Header */}
        <div className="mt-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{property.name || 'Luxury Vacation Rental'}</h1>
              <div className="flex items-center mt-2 text-gray-600">
                <FaMapMarkerAlt className="mr-1" />
                <span>{property.location || 'Orlando, FL'}</span>
                {property.rating && (
                  <span className="ml-4 flex items-center">
                    <FaStar className="text-yellow-400 mr-1" />
                    {property.rating.toFixed(1)} ({property.review_count || 0} reviews)
                  </span>
                )}
              </div>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={() => setIsFavorite(!isFavorite)}
                className="p-2 rounded-full bg-white shadow-sm hover:bg-gray-100"
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <FaHeart className={isFavorite ? 'text-red-500' : 'text-gray-400'} />
              </button>
              <button className="p-2 rounded-full bg-white shadow-sm hover:bg-gray-100">
                <FaShareAlt className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="mt-6 relative">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[500px]">
            {/* Main Image */}
            <div className="md:col-span-3 rounded-xl overflow-hidden relative group">
              <Swiper
                spaceBetween={10}
                navigation={true}
                thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                modules={[FreeMode, Navigation, Thumbs, Zoom]}
                zoom={true}
                className="h-full"
              >
                {[1, 2, 3, 4, 5].map((_, index) => (
                  <SwiperSlide key={index} className="relative">
                    <div className="swiper-zoom-container">
                      <Image
                        src={`/img/property-${index + 1}.jpg`}
                        alt={`Property ${index + 1}`}
                        fill
                        className="object-cover"
                        priority={index === 0}
                      />
                    </div>
                    <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                      {index + 1} / 5
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
            
            {/* Thumbnails */}
            <div className="hidden md:grid grid-rows-4 gap-2 h-full">
              {[1, 2, 3, 4].map((_, index) => (
                <div key={index} className="relative rounded-lg overflow-hidden group cursor-pointer">
                  <Image
                    src={`/img/property-${index + 1}.jpg`}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover group-hover:opacity-80 transition-opacity"
                  />
                  {index === 3 && property.photos?.length > 4 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-bold text-lg">
                      +{property.photos.length - 4}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => setZoom(!zoom)}
              className="absolute bottom-4 right-4 z-10 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors md:hidden"
              aria-label={zoom ? 'Zoom out' : 'Zoom in'}
            >
              <FaExpand className="text-gray-700" />
            </button>
          </div>
        </div>

        {/* Property Details */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Property Info */}
          <div className="lg:col-span-2">
            {/* Property Highlights */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <div className="flex items-center">
                  <div className="bg-blue-50 p-3 rounded-full mr-3">
                    <FaBed className="text-blue-500 text-xl" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{property.bedrooms || 'N/A'}</div>
                    <div className="text-sm text-gray-500">Bedrooms</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="bg-blue-50 p-3 rounded-full mr-3">
                    <FaBath className="text-blue-500 text-xl" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{property.bathrooms || 'N/A'}</div>
                    <div className="text-sm text-gray-500">Bathrooms</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="bg-blue-50 p-3 rounded-full mr-3">
                    <FaUsers className="text-blue-500 text-xl" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{property.guests || 'N/A'}</div>
                    <div className="text-sm text-gray-500">Guests</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="bg-blue-50 p-3 rounded-full mr-3">
                    <FaRulerCombined className="text-blue-500 text-xl" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{property.area || 'N/A'} m²</div>
                    <div className="text-sm text-gray-500">Area</div>
                  </div>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About this property</h2>
              <p className="text-gray-600 mb-6">
                {property.description || 'This beautiful vacation rental offers a perfect blend of comfort and luxury. Enjoy modern amenities, spacious living areas, and a prime location close to all major attractions.'}
              </p>
              
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {visibleAmenities.map((amenity) => (
                    <div key={amenity.id} className="flex items-center">
                      <span className="text-blue-500 mr-3">{amenity.icon}</span>
                      <span className="text-gray-700">{amenity.name}</span>
                    </div>
                  ))}
                </div>
                
                {AMENITIES.length > 6 && (
                  <button 
                    onClick={() => setShowAllAmenities(!showAllAmenities)}
                    className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                  >
                    {showAllAmenities ? 'Show less' : `Show all ${AMENITIES.length} amenities`}
                    <FaChevronRight className={`ml-1 text-xs transition-transform ${showAllAmenities ? 'transform rotate-90' : ''}`} />
                  </button>
                )}
              </div>
            </div>
            
            {/* Reviews Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  <FaStar className="inline text-yellow-400 mr-2" />
                  {property.rating?.toFixed(1) || '5.0'} · {property.review_count || '0'} reviews
                </h2>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View all reviews
                </button>
              </div>
              
              {/* Sample Reviews */}
              <div className="space-y-6">
                {[1, 2].map((review) => (
                  <div key={review} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                    <div className="flex items-center mb-2">
                      <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 overflow-hidden">
                        <Image 
                          src={`/img/avatar-${review}.jpg`} 
                          alt="Reviewer" 
                          width={40} 
                          height={40} 
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Guest {review}</h4>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <FaStar key={i} className="text-yellow-400 text-sm" />
                          ))}
                          <span className="text-sm text-gray-500 ml-2">2 weeks ago</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 mt-2">
                      {review === 1 
                        ? "Amazing stay! The property was even better than the photos. The location was perfect and the host was very responsive."
                        : "Beautiful property with all the amenities we needed. Would definitely stay here again!"
                      }
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Location Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Location</h2>
              <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden mb-4">
                <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                  <FaMapMarkerAlt className="text-red-500 text-4xl" />
                  <span className="ml-2 text-gray-600">Map view coming soon</span>
                </div>
              </div>
              <p className="text-gray-600">
                {property.address || '123 Main St, Orlando, FL 32801, United States'}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                The property is located in a quiet neighborhood, just a short walk from restaurants, shops, and public transportation.
              </p>
            </div>
          </div>
          
          {/* Right Column - Booking Widget */}
          <div className="lg:sticky lg:top-6 h-fit">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(property.price_per_night || 0)}
                      <span className="text-base font-normal text-gray-500"> / night</span>
                    </div>
                    {totalCost.nights > 0 && (
                      <div className="text-sm text-gray-500 mt-1">
                        {totalCost.nights} {totalCost.nights === 1 ? 'night' : 'nights'} · {formatCurrency(totalCost.total)} total
                      </div>
                    )}
                  </div>
                  <div className="flex items-center">
                    <FaStar className="text-yellow-400 mr-1" />
                    <span className="font-medium">{property.rating?.toFixed(1) || '5.0'}</span>
                    <span className="text-gray-500 ml-1">({property.review_count || '0'})</span>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleBookingSubmit} className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
                      <div className="relative">
                        <DatePicker
                          selected={bookingData.checkIn}
                          onChange={(date) => setBookingData(prev => ({ ...prev, checkIn: date }))}
                          selectsStart
                          startDate={bookingData.checkIn}
                          endDate={bookingData.checkOut}
                          minDate={new Date()}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholderText="Add dates"
                          required
                        />
                        <FaCalendarAlt className="absolute right-3 top-3 text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
                      <div className="relative">
                        <DatePicker
                          selected={bookingData.checkOut}
                          onChange={(date) => setBookingData(prev => ({ ...prev, checkOut: date }))}
                          selectsEnd
                          startDate={bookingData.checkIn}
                          endDate={bookingData.checkOut}
                          minDate={bookingData.checkIn || new Date()}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholderText="Add dates"
                          required
                        />
                        <FaCalendarAlt className="absolute right-3 top-3 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
                    <div className="relative">
                      <select
                        value={`${bookingData.adults + bookingData.children} ${bookingData.adults + bookingData.children === 1 ? 'guest' : 'guests'}`}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                        onChange={(e) => {
                          const totalGuests = parseInt(e.target.value);
                          setBookingData(prev => ({
                            ...prev,
                            adults: Math.min(Math.max(totalGuests - prev.children, 1), 10),
                            children: Math.min(prev.children, totalGuests - 1)
                          }));
                        }}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                          <option key={num} value={`${num} ${num === 1 ? 'guest' : 'guests'}`}>
                            {num} {num === 1 ? 'guest' : 'guests'}
                          </option>
                        ))}
                      </select>
                      <FaUserFriends className="absolute right-3 top-3 text-gray-400" />
                    </div>
                    
                    <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <label className="block text-gray-700 mb-1">Adults</label>
                        <select
                          value={bookingData.adults}
                          onChange={(e) => setBookingData(prev => ({
                            ...prev,
                            adults: parseInt(e.target.value),
                            children: Math.min(prev.children, Math.max(0, 10 - parseInt(e.target.value)))
                          }))}
                          className="w-full px-3 py-1 border border-gray-300 rounded-md"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                            <option key={num} value={num}>{num}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-1">Children</label>
                        <select
                          value={bookingData.children}
                          onChange={(e) => setBookingData(prev => ({
                            ...prev,
                            children: parseInt(e.target.value)
                          }))}
                          className="w-full px-3 py-1 border border-gray-300 rounded-md"
                        >
                          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                            <option key={num} value={num}>{num}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                  >
                    Book now
                    <FaArrowRight className="ml-2" />
                  </button>
                  
                  <p className="text-center text-sm text-gray-500">
                    You won't be charged yet
                  </p>
                  
                  {totalCost.nights > 0 && (
                    <div className="border-t border-gray-100 pt-4 mt-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            {formatCurrency(property.price_per_night)} × {totalCost.nights} {totalCost.nights === 1 ? 'night' : 'nights'}
                          </span>
                          <span>{formatCurrency(totalCost.subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Cleaning fee</span>
                          <span>{formatCurrency(totalCost.cleaningFee)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Service fee</span>
                          <span>{formatCurrency(totalCost.serviceFee)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Taxes</span>
                          <span>{formatCurrency(totalCost.taxes)}</span>
                        </div>
                        <div className="border-t border-gray-100 pt-3 mt-2">
                          <div className="flex justify-between font-semibold">
                            <span>Total</span>
                            <span>{formatCurrency(totalCost.total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </form>
              
              <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                <p className="text-sm text-gray-500">
                  <FaDollarSign className="inline mr-1" />
                  No hidden fees
                </p>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-white rounded-xl shadow-sm">
              <h3 className="font-medium text-gray-900 mb-2">Need help booking?</h3>
              <p className="text-sm text-gray-600 mb-3">Speak to our customer service team 24/7</p>
              <button className="w-full text-blue-600 hover:text-blue-800 text-sm font-medium">
                Contact us
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Similar Properties */}
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar properties you may like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={`/img/property-${item + 1}.jpg`}
                    alt={`Similar property ${item}`}
                    fill
                    className="object-cover"
                  />
                  <button className="absolute top-3 right-3 p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all">
                    <FaHeart className="text-gray-400 hover:text-red-500" />
                  </button>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-gray-900">Luxury Apartment {item}</h3>
                    <div className="flex items-center">
                      <FaStar className="text-yellow-400 text-sm mr-1" />
                      <span className="text-sm">4.9</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Orlando, FL</p>
                  <p className="text-sm text-gray-500 mt-1">{item + 1} beds · {item} bath</p>
                  <p className="mt-2 font-semibold">
                    {formatCurrency(120 + (item * 20))} <span className="font-normal text-gray-500">night</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
