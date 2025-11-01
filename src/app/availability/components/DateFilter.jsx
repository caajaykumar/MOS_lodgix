// components/SearchFilter.jsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './SearchFilter.module.css';

export default function DateFilter({ initialValues = {}, onSearch, isLoading = false }) {
  const router = useRouter();
  const [checkInDate, setCheckInDate] = useState(initialValues.from_date || initialValues.checkIn || '');
  const [checkOutDate, setCheckOutDate] = useState(initialValues.to_date || initialValues.checkOut || '');
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  const [error, setError] = useState('');
  // Aggregate guests UI (adults+children+infants). Start from 0 to avoid stale defaults after clear.
  const [guests, setGuests] = useState({
    adults: 0,
    children: 0,
    infants: 0,
    pets: 0,
  });
  
  const dropdownRef = useRef(null);

  const clearCheckIn = () => {
    setCheckInDate('');
    setCheckOutDate('');
    try { sessionStorage.removeItem('lodgix_search_criteria'); } catch {}
    try {
      if (typeof onSearch === 'function') onSearch({});
    } catch {}
    // Clear URL query params to avoid rehydration from URL on refresh
    try { router.replace('/availability', { scroll: false }); } catch {}
  };

  const clearCheckOut = () => {
    setCheckOutDate('');
    try { sessionStorage.removeItem('lodgix_search_criteria'); } catch {}
    try {
      if (typeof onSearch === 'function') onSearch({});
    } catch {}
    try { router.replace('/availability', { scroll: false }); } catch {}
  };

  const clearGuests = () => {
    setGuests({ adults: 0, children: 0, infants: 0, pets: 0 });
    setShowGuestDropdown(false);
    // Clear persisted criteria so stale 'Who' values don't reappear on refresh
    try { sessionStorage.removeItem('lodgix_search_criteria'); } catch {}
    // Notify parent to clear results and criteria state
    try {
      if (typeof onSearch === 'function') onSearch({});
    } catch {}
    // Also clear URL query params so refresh doesn't restore guests/pets
    try { router.replace('/availability', { scroll: false }); } catch {}
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowGuestDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prefill from sessionStorage or initial values
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? sessionStorage.getItem('lodgix_search_criteria') : null;
      if (raw) {
        const sc = JSON.parse(raw);
        if (sc?.from_date && !checkInDate) setCheckInDate(sc.from_date);
        if (sc?.to_date && !checkOutDate) setCheckOutDate(sc.to_date);
        if (Number.isFinite(Number(sc?.guests))) {
          const total = Math.max(1, Number(sc.guests));
          // distribute into adults primarily
          setGuests((g) => ({ ...g, adults: Math.max(1, Math.min(total, total - (g.children + g.infants))) }));
        }
        if (Number.isFinite(Number(sc?.pets))) setGuests((g) => ({ ...g, pets: Math.max(0, Number(sc.pets)) }));
      }
    } catch (_) {}
  }, [checkInDate, checkOutDate]);

  const todayStr = new Date().toISOString().split('T')[0];

  const handleIncrement = (type) => {
    setGuests(prev => ({
      ...prev,
      [type]: prev[type] + 1
    }));
  };

  const handleDecrement = (type) => {
    setGuests(prev => ({
      ...prev,
      [type]: prev[type] > 0 ? prev[type] - 1 : 0
    }));
  };

  const getTotalGuests = () => {
    const total = (Number(guests.adults)||0) + (Number(guests.children)||0) + (Number(guests.infants)||0);
    const guestText = total === 1 ? 'guest' : 'guests';
    const petText = (Number(guests.pets)||0) > 0 ? `, ${guests.pets} pet${guests.pets > 1 ? 's' : ''}` : '';
    return `${total} ${guestText}${petText}`;
  };

  const validate = () => {
    if (!checkInDate || !checkOutDate) return 'Select both check-in and check-out dates';
    if (checkInDate < todayStr) return 'Check-in date cannot be in the past';
    if (checkOutDate <= checkInDate) return 'Check-out must be after check-in';
    return '';
  };

  const handleSearch = () => {
    const err = validate();
    setError(err);
    if (err) return;

    const totalGuests = (Number(guests.adults)||0) + (Number(guests.children)||0) + (Number(guests.infants)||0);
    const criteria = {
      from_date: checkInDate,
      to_date: checkOutDate,
      guests: Math.max(1, totalGuests),
      pets: Math.max(0, Number(guests.pets) || 0),
    };

    try { sessionStorage.setItem('lodgix_search_criteria', JSON.stringify(criteria)); } catch {}
    try { window.dispatchEvent(new CustomEvent('lodgix:search_criteria', { detail: criteria })); } catch {}

    if (typeof onSearch === 'function') {
      onSearch({
        from_date: criteria.from_date,
        to_date: criteria.to_date,
        guests: String(criteria.guests),
        rooms: '1',
        pets: String(criteria.pets),
      });
    }
  };

  return (
    <div className="container">
      <div className={styles.searchFilterWrapper}>
        <div className={styles.searchFilterContainer}>
          
          {/* Check-in Date */}
          <div className={styles.filterSection}>
            <label className={styles.filterLabel}>Check in</label>
            <input
              type="date"
              value={checkInDate}
              min={todayStr}
              onChange={(e) => {
                const v = e.target.value;
                setCheckInDate(v);
                if (checkOutDate && checkOutDate <= v) {
                  // auto-set checkout to next day
                  try {
                    const d = new Date(v);
                    d.setDate(d.getDate() + 1);
                    const next = d.toISOString().split('T')[0];
                    setCheckOutDate(next);
                  } catch {}
                }
              }}
              className={`form-control ${styles.dateInput}`}
              placeholder="Mm/Dd/Yyyy"
              disabled={isLoading}
            />
            {checkInDate && (
              <button
                type="button"
                className={styles.clearBtn}
                aria-label="Clear check-in"
                onMouseDown={(e)=>{ e.preventDefault(); e.stopPropagation(); }}
                onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); clearCheckIn(); }}
                disabled={isLoading}
              >
                <span className="glyphicon glyphicon-remove"></span>
              </button>
            )}
          </div>

          {/* Divider */}
          <div className={styles.filterDivider}></div>

          {/* Check-out Date */}
          <div className={styles.filterSection}>
            <label className={styles.filterLabel}>Check out</label>
            <input
              type="date"
              value={checkOutDate}
              min={checkInDate || todayStr}
              onChange={(e) => setCheckOutDate(e.target.value)}
              className={`form-control ${styles.dateInput}`}
              placeholder="Mm/Dd/Yyyy"
              disabled={isLoading}
            />
            {checkOutDate && (
              <button
                type="button"
                className={styles.clearBtn}
                aria-label="Clear check-out"
                onMouseDown={(e)=>{ e.preventDefault(); e.stopPropagation(); }}
                onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); clearCheckOut(); }}
                disabled={isLoading}
              >
                <span className="glyphicon glyphicon-remove"></span>
              </button>
            )}
          </div>

          {/* Divider */}
          <div className={styles.filterDivider}></div>

          {/* Who - Guests Dropdown */}
          <div 
            className={`${styles.filterSection} ${styles.whoSection}`} 
            ref={dropdownRef}
          >
            <label className={styles.filterLabel}>Who</label>
            <div 
              className={styles.guestDisplay}
              onClick={() => setShowGuestDropdown(!showGuestDropdown)}
            >
              <i className="glyphicon glyphicon-user"></i>
              <span>{getTotalGuests()}</span>
            </div>
            {(guests.adults||guests.children||guests.infants||guests.pets) ? (
              <button
                type="button"
                className={styles.clearBtn}
                aria-label="Clear guests"
                onMouseDown={(e)=>{ e.preventDefault(); e.stopPropagation(); }}
                onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); clearGuests(); }}
                disabled={isLoading}
              >
                <span className="glyphicon glyphicon-remove"></span>
              </button>
            ) : null}

            {showGuestDropdown && (
              <div className={styles.guestDropdown}>
                
                {/* Adults */}
                <div className={styles.guestRow}>
                  <div className={styles.guestInfo}>
                    <div className={styles.guestType}>Adults</div>
                    <div className={styles.guestDescription}>Ages 13 or above</div>
                  </div>
                  <div className={styles.guestCounter}>
                    <button
                      type="button"
                      onClick={() => handleDecrement('adults')}
                      disabled={isLoading || guests.adults <= 1}
                      className={`btn btn-default ${styles.counterBtn}`}
                    >
                      <span className="glyphicon glyphicon-minus"></span>
                    </button>
                    <span className={styles.counterValue}>{guests.adults}</span>
                    <button
                      type="button"
                      onClick={() => handleIncrement('adults')}
                      disabled={isLoading}
                      className={`btn btn-default ${styles.counterBtn}`}
                    >
                      <span className="glyphicon glyphicon-plus"></span>
                    </button>
                  </div>
                </div>

                {/* Children */}
                <div className={styles.guestRow}>
                  <div className={styles.guestInfo}>
                    <div className={styles.guestType}>Children</div>
                    <div className={styles.guestDescription}>Ages 2–12</div>
                  </div>
                  <div className={styles.guestCounter}>
                    <button
                      type="button"
                      onClick={() => handleDecrement('children')}
                      disabled={isLoading || guests.children <= 0}
                      className={`btn btn-default ${styles.counterBtn}`}
                    >
                      <span className="glyphicon glyphicon-minus"></span>
                    </button>
                    <span className={styles.counterValue}>{guests.children}</span>
                    <button
                      type="button"
                      onClick={() => handleIncrement('children')}
                      disabled={isLoading}
                      className={`btn btn-default ${styles.counterBtn}`}
                    >
                      <span className="glyphicon glyphicon-plus"></span>
                    </button>
                  </div>
                </div>

                {/* Infants */}
                <div className={styles.guestRow}>
                  <div className={styles.guestInfo}>
                    <div className={styles.guestType}>Infants</div>
                    <div className={styles.guestDescription}>Under 2</div>
                  </div>
                  <div className={styles.guestCounter}>
                    <button
                      type="button"
                      onClick={() => handleDecrement('infants')}
                      disabled={isLoading || guests.infants <= 0}
                      className={`btn btn-default ${styles.counterBtn}`}
                    >
                      <span className="glyphicon glyphicon-minus"></span>
                    </button>
                    <span className={styles.counterValue}>{guests.infants}</span>
                    <button
                      type="button"
                      onClick={() => handleIncrement('infants')}
                      disabled={isLoading}
                      className={`btn btn-default ${styles.counterBtn}`}
                    >
                      <span className="glyphicon glyphicon-plus"></span>
                    </button>
                  </div>
                </div>

                {/* Pets */}
                <div className={styles.guestRow}>
                  <div className={styles.guestInfo}>
                    <div className={styles.guestType}>Pets</div>
                    <div className={styles.guestDescription}>
                      <a href="#" className={styles.serviceLink}>Bringing a service animal?</a>
                    </div>
                  </div>
                  <div className={styles.guestCounter}>
                    <button
                      type="button"
                      onClick={() => handleDecrement('pets')}
                      disabled={isLoading || guests.pets <= 0}
                      className={`btn btn-default ${styles.counterBtn}`}
                    >
                      <span className="glyphicon glyphicon-minus"></span>
                    </button>
                    <span className={styles.counterValue}>{guests.pets}</span>
                    <button
                      type="button"
                      onClick={() => handleIncrement('pets')}
                      disabled={isLoading}
                      className={`btn btn-default ${styles.counterBtn}`}
                    >
                      <span className="glyphicon glyphicon-plus"></span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Search Button */}
          <button
            type="button"
            onClick={handleSearch}
            className={`btn ${styles.btnSearch}`}
            disabled={isLoading}
          >
            <span className="glyphicon glyphicon-search"></span>
            <span className={styles.searchText}>Search</span>
          </button>
        </div>
        {error && (
          <div className="alert alert-danger" style={{ marginTop: 12 }}>{error}</div>
        )}
      </div>
    </div>
  );
}
