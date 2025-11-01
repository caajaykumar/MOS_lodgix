'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import SearchForm from './components/SearchForm';
import ResultsGrid from './components/ResultsGrid';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import DateFilter from './components/DateFilter';
import { useLoader } from '@/app/components/LoaderProvider';

function SearchPageContent() {
  const { hideLoader } = useLoader();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchResults, setSearchResults] = useState({
    properties: [],
    loading: false,
    error: null,
    searchCriteria: {}
  });
  const [aborter, setAborter] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Extract search parameters from URL
  const from_date = searchParams.get('from_date') || searchParams.get('checkIn');
  const to_date = searchParams.get('to_date') || searchParams.get('checkOut');
  const guests = parseInt(searchParams.get('guests') || '2');
  const rooms = parseInt(searchParams.get('rooms') || '1');
  const pets = parseInt(searchParams.get('pets') || '0');

  // Search function
  const performSearch = async (criteria) => {
    // If dates are missing, clear results without calling API
    if (!criteria?.from_date || !criteria?.to_date) {
      // Abort any in-flight request
      try { if (aborter) aborter.abort(); } catch {}
      setAborter(null);
      try { sessionStorage.removeItem('lodgix_search_criteria'); } catch {}
      setSearchResults({
        properties: [],
        loading: false,
        error: null,
        searchCriteria: {},
        availablePropertyIds: [],
        totalFound: 0,
      });
      setHasSearched(false);
      return;
    }

    setSearchResults(prev => ({
      ...prev,
      loading: true,
      error: null,
      searchCriteria: criteria
    }));
    setHasSearched(true);

    // Abort any in-flight request
    if (aborter) aborter.abort();
    const controller = new AbortController();
    setAborter(controller);

    try {
      // Persist criteria for back-navigation UX
      try { sessionStorage.setItem('lodgix_search_criteria', JSON.stringify(criteria)); } catch {}

      const params = new URLSearchParams(criteria);
      // Also include Lodgix-compatible aliases
      if (criteria.from_date) params.set('arrival_date', criteria.from_date);
      if (criteria.to_date) params.set('departure_date', criteria.to_date);
      if (criteria.guests) params.set('num_adults', String(criteria.guests));
      if (criteria.pets) params.set('pets_allowed', String(criteria.pets));
      // Use App Router route handler
      const response = await fetch(`/api/availability/search?${params.toString()}`, { signal: controller.signal });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Search failed');

      // App Router response shape: { success, availablePropertyIds, data }
      // Back-compat with older shape available_property_ids
      const ids = data.availablePropertyIds || data.available_property_ids || [];

      // Use server-enriched array
      const properties = Array.isArray(data.data) ? data.data : [];

      setSearchResults({
        properties,
        loading: false,
        error: null,
        searchCriteria: criteria,
        availablePropertyIds: ids,
        totalFound: data.totalFound || properties.length
      });

    } catch (error) {
      console.error('Search error:', error);
      setSearchResults(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to search properties'
      }));
    }
  };

  // Reset search criteria and results, used by "Clear Search" button
  const handleResetSearch = () => {
    try { sessionStorage.removeItem('lodgix_search_criteria'); } catch {}
    setSearchResults({
      properties: [],
      loading: false,
      error: null,
      searchCriteria: {},
      availablePropertyIds: [],
      totalFound: 0,
    });
    setHasSearched(false);
    // Notify child filters to clear their local UI state (dates, guests)
    try { if (typeof window !== 'undefined') window.dispatchEvent(new Event('lodgix:clear_filters')); } catch {}
    try { router.replace('/availability', { scroll: false }); } catch {}
  };

  useEffect(() => {
    if (from_date && to_date) {
      const criteria = {
        from_date,
        to_date,
        guests: guests.toString(),
        rooms: rooms.toString(),
        pets: String(Number.isFinite(pets) ? Math.max(0, pets) : 0),
      };
      performSearch(criteria);
    } else {
      // Fresh page load without criteria should be in initial (not searched) state
      setHasSearched(false);
    }
    // Page mounted: ensure header-triggered loader is cleared
    try { hideLoader(300); } catch {}
  }, [from_date, to_date, guests, rooms, pets]);

  // Whenever search finishes (or no search criteria), hide the global loader
  useEffect(() => {
    if (!searchResults.loading) {
      try { hideLoader(150); } catch {}
    }
  }, [searchResults.loading, hideLoader]);

  // Failsafe: hide loader after 2 seconds on mount in case any of the above paths miss
  useEffect(() => {
    const t = setTimeout(() => { try { hideLoader(0); } catch {} }, 2000);
    return () => clearTimeout(t);
  }, [hideLoader]);

  return (
    <>

      <Breadcrumb
        title="Search Properties"
        breadcrumbs={[
          { name: 'Home', link: '/', active: false },
          { name: 'Search Properties', link: '/search', active: true },
        ]}
      />

      {/* <DateFilter
        initialValues={{
          from_date,
          to_date,
          checkIn: from_date,
          checkOut: to_date,
        }}
        onSearch={performSearch}
        isLoading={searchResults.loading}
      /> */}

      <div className="container">
        <div className="row">
          <div className="col-md-12">
          <div className="text-center" style={{ marginBottom: '5px', marginTop: '30px' }}>
            <h1>Find Your Perfect Stay</h1>
            <p className="text-muted">
              Search available properties using MyOrlandoStay availability system
            </p>
            <DateFilter
        initialValues={{
          from_date,
          to_date,
          checkIn: from_date,
          checkOut: to_date,
        }}
        onSearch={performSearch}
        isLoading={searchResults.loading}
      />



          </div>
          
          {/* Search Results */}
          <ResultsGrid 
            properties={searchResults.properties}
            loading={searchResults.loading}
            error={searchResults.error}
            searchCriteria={searchResults.searchCriteria}
            hasSearched={hasSearched}
            onReset={handleResetSearch}
          />

          {/* Debug Information hidden */}
          </div>
        </div>
      </div>
    </>
  );
}

export default function availability() {
  return (
    <Suspense fallback={
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="text-center" style={{ padding: '50px 0' }}>
              <div style={{ fontSize: '18px', marginBottom: '10px' }}>
                <span className="glyphicon glyphicon-refresh" style={{ 
                  animation: 'spin 1s linear infinite', 
                  marginRight: '10px' 
                }}></span>
                Loading search page...
              </div>
            </div>
          </div>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    }>
      <SearchPageContent />
    </Suspense>


  );
}
