// components/SearchFilter.jsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './SearchFilter.module.css';
import Modal from '@/app/components/Modal';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

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
  const [showPetPolicy, setShowPetPolicy] = useState(false);
  const [petWarning, setPetWarning] = useState('');
  // DayPicker range state (Date objects for UI)
  const toDateObj = (s) => {
    if (!s) return undefined;
    const d = new Date(s);
    return isNaN(d.getTime()) ? undefined : d;
  };
  const [range, setRange] = useState({
    from: toDateObj(initialValues.from_date || initialValues.checkIn || ''),
    to: toDateObj(initialValues.to_date || initialValues.checkOut || ''),
  });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeField, setActiveField] = useState('from'); // 'from' | 'to'
  const dateWrapRef = useRef(null);
  
  const dropdownRef = useRef(null);
  // calendar visible month control
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const [month, setMonth] = useState(() => new Date());

  // Format a Date to YYYY-MM-DD in LOCAL time (no UTC shift)
  const toYmdLocal = (date) => {
    if (!date || isNaN(date.getTime())) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Safe display from a YYYY-MM-DD string (construct local Date)
  const displayFromYmd = (ymd) => {
    if (!ymd) return '';
    const [y, m, d] = String(ymd).split('-').map((x) => parseInt(x, 10));
    if (!y || !m || !d) return '';
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString();
  };

  const clearCheckIn = () => {
    setCheckInDate('');
    setCheckOutDate('');
    setRange({ from: undefined, to: undefined });
    try { sessionStorage.removeItem('lodgix_search_criteria'); } catch {}
    try {
      if (typeof onSearch === 'function') onSearch({});
    } catch {}
    // Clear URL query params to avoid rehydration from URL on refresh
    try { router.replace('/availability', { scroll: false }); } catch {}
  };

  const clearCheckOut = () => {
    setCheckOutDate('');
    setRange((r) => ({ ...r, to: undefined }));
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
      // Close date popover on outside click
      if (dateWrapRef.current && !dateWrapRef.current.contains(event.target)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync with initialValues (e.g., when URL is cleared by parent)
  useEffect(() => {
    const ci = initialValues.from_date || initialValues.checkIn || '';
    const co = initialValues.to_date || initialValues.checkOut || '';
    setCheckInDate(ci);
    setCheckOutDate(co);
    setRange({ from: toDateObj(ci), to: toDateObj(co) });
  }, [initialValues.from_date, initialValues.to_date, initialValues.checkIn, initialValues.checkOut]);

  // Listen for global clear event from parent page
  useEffect(() => {
    const onClear = () => {
      setCheckInDate('');
      setCheckOutDate('');
      setRange({ from: undefined, to: undefined });
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('lodgix:clear_filters', onClear);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('lodgix:clear_filters', onClear);
      }
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setShowPetPolicy(false);
    };
    if (showPetPolicy) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showPetPolicy]);

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
    setGuests(prev => {
      if (type === 'pets') {
        if ((prev.pets || 0) >= 2) {
          setPetWarning('Maximum 2 pets allowed');
          try { clearTimeout(window.__lodgix_pet_to); } catch {}
          try { window.__lodgix_pet_to = setTimeout(() => setPetWarning(''), 2500); } catch {}
          return prev; // do not increment
        }
      }
      return { ...prev, [type]: (prev[type] || 0) + 1 };
    });
  };

  const handleDecrement = (type) => {
    setGuests(prev => {
      const nextVal = (prev[type] || 0) > 0 ? (prev[type] - 1) : 0;
      if (type === 'pets' && nextVal <= 2) setPetWarning('');
      return { ...prev, [type]: nextVal };
    });
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
      <div className={styles.searchFilterWrapper} ref={dateWrapRef}>
        <div className={styles.searchFilterContainer}>
          
          {/* Check-in Date */}
          <div className={styles.filterSection}>
            <label className={styles.filterLabel}>Check in</label>
            <input
              type="text"
              readOnly
              value={displayFromYmd(checkInDate)}
              onClick={() => { setActiveField('from'); setMonth(new Date()); setPickerOpen(true); }}
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
              type="text"
              readOnly
              value={displayFromYmd(checkOutDate)}
              onClick={() => {
                if (!range.from) {
                  setError('Please select check-in date first');
                  setActiveField('from');
                  setMonth(new Date());
                  setPickerOpen(true);
                  return;
                }
                setActiveField('to');
                setMonth(range.from || new Date());
                setPickerOpen(true);
              }}
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
                  <button type="button" onClick={() => handleDecrement('adults')} disabled={isLoading || guests.adults <= 1} className={`btn btn-default ${styles.counterBtn}`}>
                    <span className="glyphicon glyphicon-minus"></span>
                  </button>
                  <span className={styles.counterValue}>{guests.adults}</span>
                  <button type="button" onClick={() => handleIncrement('adults')} disabled={isLoading} className={`btn btn-default ${styles.counterBtn}`}>
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
                  <button type="button" onClick={() => handleDecrement('children')} disabled={isLoading || guests.children <= 0} className={`btn btn-default ${styles.counterBtn}`}>
                    <span className="glyphicon glyphicon-minus"></span>
                  </button>
                  <span className={styles.counterValue}>{guests.children}</span>
                  <button type="button" onClick={() => handleIncrement('children')} disabled={isLoading} className={`btn btn-default ${styles.counterBtn}`}>
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
                  <button type="button" onClick={() => handleDecrement('infants')} disabled={isLoading || guests.infants <= 0} className={`btn btn-default ${styles.counterBtn}`}>
                    <span className="glyphicon glyphicon-minus"></span>
                  </button>
                  <span className={styles.counterValue}>{guests.infants}</span>
                  <button type="button" onClick={() => handleIncrement('infants')} disabled={isLoading} className={`btn btn-default ${styles.counterBtn}`}>
                    <span className="glyphicon glyphicon-plus"></span>
                  </button>
                </div>
              </div>
              {/* Pets */}
              <div className={styles.guestRow}>
                <div className={styles.guestInfo}>
                  <div className={styles.guestType}>Pets</div>
                  <div className={styles.guestDescription}>
                    <a
                      href="#"
                      className={`${styles.serviceLink} text-blue-600 underline`}
                      onClick={(e)=>{ e.preventDefault(); setShowPetPolicy(true); }}
                    >
                      Pet Policy - Click to view rules
                    </a>
                  </div>
                </div>
                <div className={styles.guestCounter}>
                  <button
                    type="button"
                    onClick={() => handleDecrement('pets')}
                    disabled={isLoading || (Number(guests.pets)||0) <= 0}
                    className={`btn btn-default ${styles.counterBtn}`}
                  >
                    <span className="glyphicon glyphicon-minus"></span>
                  </button>
                  <span className={styles.counterValue}>{guests.pets}</span>
                  <button
                    type="button"
                    onClick={() => handleIncrement('pets')}
                    disabled={isLoading || (Number(guests.pets)||0) >= 2}
                    className={`btn btn-default ${styles.counterBtn}`}
                  >
                    <span className="glyphicon glyphicon-plus"></span>
                  </button>
                </div>
              </div>
              {petWarning ? (
                <div className="alert alert-warning" style={{ marginTop: 8, padding: '6px 10px' }}>{petWarning}</div>
              ) : null}
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
        {pickerOpen && (
          <div className="df-popover">
            <DayPicker
              mode="range"
              numberOfMonths={1}
              selected={range}
              month={month}
              onMonthChange={setMonth}
              onSelect={(r) => {
                const next = r || { from: undefined, to: undefined };
                setRange(next);
                const ci = next?.from ? toYmdLocal(next.from) : '';
                const co = next?.to ? toYmdLocal(next.to) : '';
                setCheckInDate(ci);
                // enforce minimum 1-night stay when to picked
                if (next.from && next.to) {
                  const f = new Date(next.from.getFullYear(), next.from.getMonth(), next.from.getDate());
                  const t = new Date(next.to.getFullYear(), next.to.getMonth(), next.to.getDate());
                  if (t <= f) {
                    const tMin = new Date(f.getFullYear(), f.getMonth(), f.getDate() + 1);
                    next.to = tMin;
                  }
                  setCheckOutDate(toYmdLocal(next.to));
                  setPickerOpen(false);
                } else {
                  setCheckOutDate(co);
                }
                // after selecting check-in only, auto-advance to check-out month
                if (next.from && !next.to) {
                  setActiveField('to');
                  setMonth(next.from);
                }
              }}
              fromDate={activeField === 'from' ? todayStart : (range.from ? todayStart : todayStart)}
              disabled={(() => {
                // base rule: disable before today for both
                const rules = [{ before: todayStart }];
                if (activeField === 'to') {
                  if (range.from) {
                    const minTo = new Date(range.from.getFullYear(), range.from.getMonth(), range.from.getDate() + 1);
                    rules.push({ before: minTo });
                  }
                }
                return rules;
              })()}
            />
            <div className="df-popover-actions">
              <button type="button" className="btn btn-default btn-xs" onClick={() => { setRange({ from: undefined, to: undefined }); setCheckInDate(''); setCheckOutDate(''); }}>Clear</button>
              <button type="button" className="btn btn-primary btn-xs" onClick={() => setPickerOpen(false)}>Done</button>
            </div>
          </div>
        )}
      </div>
      {error && (
        <div className="alert alert-danger" style={{ marginTop: 12 }}>{error}</div>
      )}
    </div>
    <Modal open={showPetPolicy} onClose={() => setShowPetPolicy(false)} title="Pet Policy & Rules" ariaLabelledById="pet-policy-title" widthClass="max-w-xl">
      <div className="text-slate-700 text-[15px] leading-6">
        <p className="mb-3">
          Home is available and is pet-friendly with a fee. If you do bring your pets, a maximum of <strong>2 pets</strong> are allowed with a pet fee of <strong>$25 per night</strong> or <strong>$100 per stay</strong> (and per month if your stay exceeds the period).
        </p>
        <p className="mb-3">
          Just a reminder that you are still responsible for any damage or extra cleaning caused by the pets.
        </p>
        <ul className="list-disc pl-5 space-y-1 mb-4">
          <li>Pets are <strong>not allowed</strong> on beds or furniture.</li>
          <li>Please bring their own bedsheets and/or a crate.</li>
          <li>Any damages or excessive cleaning may incur additional charges.</li>
        </ul>
        <div className="text-right">
          <button type="button" className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700" onClick={() => setShowPetPolicy(false)}>
            I Understand
          </button>
        </div>
      </div>
    </Modal>
    <style jsx global>{`
      .df-popover { position: absolute; z-index: 1000; background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 8px; margin-top: 8px; box-shadow: 0 8px 24px rgba(0,0,0,.12); }
      .df-popover-actions { display:flex; justify-content: space-between; padding: 6px 4px 2px 4px; }
      .rdp { --rdp-accent-color: #f59e0b; }
      .rdp-day_disabled { opacity: 0.35; text-decoration: line-through; cursor: not-allowed; }
    `}</style>
  </div>
);
}
