'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

export default function SearchForm({ initialValues = {}, onSearch, isLoading = false }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Parse initial values from URL or props
  const [checkIn, setCheckIn] = useState(
    initialValues.checkIn || initialValues.from_date || ''
  );
  const [checkOut, setCheckOut] = useState(
    initialValues.checkOut || initialValues.to_date || ''
  );
  const [guests, setGuests] = useState(initialValues.guests || 2);
  const [rooms, setRooms] = useState(initialValues.rooms || 1);
  const [pets, setPets] = useState(initialValues.pets || 0);
  const [errors, setErrors] = useState({});
  // DayPicker range state
  const toDateObj = (s) => {
    if (!s) return undefined;
    const d = new Date(s);
    return isNaN(d.getTime()) ? undefined : d;
  };
  const [range, setRange] = useState({
    from: toDateObj(initialValues.checkIn || initialValues.from_date || ''),
    to: toDateObj(initialValues.checkOut || initialValues.to_date || ''),
  });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeField, setActiveField] = useState('from'); // 'from' | 'to'
  const pickerWrapRef = useRef(null);

  // Update state when URL changes
  useEffect(() => {
    if (searchParams.has('from_date') || searchParams.has('checkIn')) {
      const ci = searchParams.get('from_date') || searchParams.get('checkIn');
      setCheckIn(ci);
      setRange((r) => ({ ...r, from: toDateObj(ci) }));
    }
    if (searchParams.has('to_date') || searchParams.has('checkOut')) {
      const co = searchParams.get('to_date') || searchParams.get('checkOut');
      setCheckOut(co);
      setRange((r) => ({ ...r, to: toDateObj(co) }));
    }
    if (searchParams.has('guests')) {
      setGuests(parseInt(searchParams.get('guests')));
    }
    if (searchParams.has('rooms')) {
      setRooms(parseInt(searchParams.get('rooms')));
    }
    if (searchParams.has('pets')) {
      const p = parseInt(searchParams.get('pets'));
      setPets(Number.isFinite(p) ? Math.max(0, p) : 0);
    }
  }, [searchParams]);

  // Close popover on outside click / ESC
  useEffect(() => {
    const onDocClick = (e) => {
      if (!pickerOpen) return;
      if (pickerWrapRef.current && !pickerWrapRef.current.contains(e.target)) {
        setPickerOpen(false);
      }
    };
    const onKey = (e) => { if (e.key === 'Escape') setPickerOpen(false); };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [pickerOpen]);

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    if (!checkIn) {
      newErrors.checkIn = 'Check-in date is required';
    }
    if (!checkOut) {
      newErrors.checkOut = 'Check-out date is required';
    }
    if (checkIn && checkOut && new Date(checkIn) >= new Date(checkOut)) {
      newErrors.checkOut = 'Check-out date must be after check-in date';
    }
    if (checkIn && new Date(checkIn) < new Date().setHours(0, 0, 0, 0)) {
      newErrors.checkIn = 'Check-in date cannot be in the past';
    }
    if (guests < 1) {
      newErrors.guests = 'At least 1 guest is required';
    }
    if (rooms < 1) {
      newErrors.rooms = 'At least 1 room is required';
    }
    if (pets < 0) {
      newErrors.pets = 'Pets cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Convert to Lodgix format (from_date, to_date)
    const searchParams = {
      from_date: checkIn,
      to_date: checkOut,
      guests: guests.toString(),
      rooms: rooms.toString(),
      pets: String(Math.max(0, Number(pets) || 0)),
    };

    // If onSearch prop is provided, call it (for controlled component)
    if (onSearch) {
      onSearch(searchParams);
    } else {
      // Otherwise, update URL (for uncontrolled component)
      const params = new URLSearchParams(searchParams);
      router.push(`/search?${params.toString()}`);
    }
  };

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        {/* Dates */}
        <div className="col-md-6 col-sm-6">
          <div className={`form-group ${(errors.checkIn || errors.checkOut) ? 'has-error' : ''}`} ref={pickerWrapRef}>
            <label className="control-label">Dates</label>
            <div className="date-inputs-row">
              <div className="date-input" onClick={() => { setActiveField('from'); setPickerOpen(true); }}>
                <input
                  type="text"
                  readOnly
                  className="form-control"
                  value={range.from ? range.from.toLocaleDateString() : ''}
                  placeholder="Check in"
                />
              </div>
              <div className="date-input" onClick={() => { setActiveField('to'); setPickerOpen(true); }}>
                <input
                  type="text"
                  readOnly
                  className="form-control"
                  value={range.to ? range.to.toLocaleDateString() : ''}
                  placeholder="Check out"
                />
              </div>
            </div>
            {pickerOpen && (
              <div className="popover-calendar">
                <DayPicker
                  mode="range"
                  numberOfMonths={1}
                  selected={range}
                  defaultMonth={activeField === 'to' ? (range.to || range.from || new Date()) : (range.from || new Date())}
                  onSelect={(r) => {
                    // Ensure selection starts from active field
                    const next = r || { from: undefined, to: undefined };
                    setRange(next);
                    const ci = next?.from ? next.from.toISOString().slice(0,10) : '';
                    const co = next?.to ? next.to.toISOString().slice(0,10) : '';
                    setCheckIn(ci);
                    setCheckOut(co);
                    if (errors.checkIn || errors.checkOut) {
                      setErrors(prev => ({ ...prev, checkIn: null, checkOut: null }));
                    }
                    // Auto-close when both selected
                    if (next.from && next.to) setPickerOpen(false);
                  }}
                  disabled={{ before: new Date(new Date().toDateString()) }}
                />
                <div className="popover-actions">
                  <button type="button" className="btn btn-default btn-xs" onClick={() => { setRange({ from: undefined, to: undefined }); setCheckIn(''); setCheckOut(''); }}>Clear</button>
                  <button type="button" className="btn btn-primary btn-xs" onClick={() => setPickerOpen(false)}>Done</button>
                </div>
              </div>
            )}
            {(errors.checkIn || errors.checkOut) && (
              <span className="help-block">{errors.checkIn || errors.checkOut}</span>
            )}
          </div>
        </div>

        {/* Guests */}
        <div className="col-md-2 col-sm-2">
          <div className={`form-group ${errors.guests ? 'has-error' : ''}`}>
            <label className="control-label">Guests</label>
            <div className="input-group">
              <span className="input-group-btn">
                <button
                  type="button"
                  onClick={() => {
                    setGuests(prev => Math.max(1, prev - 1));
                    if (errors.guests) {
                      setErrors(prev => ({ ...prev, guests: null }));
                    }
                  }}
                  className="btn btn-default"
                  disabled={isLoading || guests <= 1}
                >
                  -
                </button>
              </span>
              <input
                type="text"
                value={`${guests} ${guests === 1 ? 'guest' : 'guests'}`}
                className="form-control text-center"
                readOnly
              />
              <span className="input-group-btn">
                <button
                  type="button"
                  onClick={() => {
                    setGuests(prev => prev + 1);
                    if (errors.guests) {
                      setErrors(prev => ({ ...prev, guests: null }));
                    }
                  }}
                  className="btn btn-default"
                  disabled={isLoading}
                >
                  +
                </button>
              </span>
            </div>
            {errors.guests && (
              <span className="help-block">{errors.guests}</span>
            )}
          </div>
        </div>

        {/* Rooms */}
        
        <div className="col-md-2 col-sm-2">
          <div className={`form-group ${errors.rooms ? 'has-error' : ''}`}>
            <label className="control-label">Rooms</label>
            <div className="input-group">
              <span className="input-group-btn">
                <button
                  type="button"
                  onClick={() => {
                    setRooms(prev => Math.max(1, prev - 1));
                    if (errors.rooms) {
                      setErrors(prev => ({ ...prev, rooms: null }));
                    }
                  }}
                  className="btn btn-default"
                  disabled={isLoading || rooms <= 1}
                >
                  -
                </button>
              </span>
              <input
                type="text"
                value={`${rooms} ${rooms === 1 ? 'room' : 'rooms'}`}
                className="form-control text-center"
                readOnly
              />
              <span className="input-group-btn">
                <button
                  type="button"
                  onClick={() => {
                    setRooms(prev => prev + 1);
                    if (errors.rooms) {
                      setErrors(prev => ({ ...prev, rooms: null }));
                    }
                  }}
                  className="btn btn-default"
                  disabled={isLoading}
                >
                  +
                </button>
              </span>
            </div>
            {errors.rooms && (
              <span className="help-block">{errors.rooms}</span>
            )}
          </div>
        </div>

        {/* Pets */}
        <div className="col-md-2 col-sm-2">
          <div className={`form-group ${errors.pets ? 'has-error' : ''}`}>
            <label className="control-label">Pets</label>
            <div className="input-group">
              <span className="input-group-btn">
                <button
                  type="button"
                  onClick={() => {
                    setPets(prev => Math.max(0, prev - 1));
                    if (errors.pets) {
                      setErrors(prev => ({ ...prev, pets: null }));
                    }
                  }}
                  className="btn btn-default"
                  disabled={isLoading || pets <= 0}
                >
                  -
                </button>
              </span>
              <input
                type="text"
                value={`${pets} ${pets === 1 ? 'pet' : 'pets'}`}
                className="form-control text-center"
                readOnly
              />
              <span className="input-group-btn">
                <button
                  type="button"
                  onClick={() => {
                    setPets(prev => prev + 1);
                    if (errors.pets) {
                      setErrors(prev => ({ ...prev, pets: null }));
                    }
                  }}
                  className="btn btn-default"
                  disabled={isLoading}
                >
                  +
                </button>
              </span>
            </div>
            {errors.pets && (
              <span className="help-block">{errors.pets}</span>
            )}
          </div>
        </div>

        {/* Search Button */}
        <div className="col-md-2 col-sm-2">
          <div className="form-group">
            <label className="control-label" style={{ visibility: 'hidden' }}>Search</label>
            <button
              type="submit"
              className="btn btn-primary btn-block"
              style={{ marginTop: '5px' }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="glyphicon glyphicon-refresh" style={{ animation: 'spin 1s linear infinite', marginRight: '5px' }}></span>
                  Searching...
                </>
              ) : (
                'Search Properties'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Add CSS for spinner animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <style jsx global>{`
        .daypicker-wrapper { background: #fff; border: 1px solid #ddd; border-radius: 4px; padding: 6px; }
        .rdp { --rdp-accent-color: #f59e0b; }
      `}</style>
    </form>
  );
}
