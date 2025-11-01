'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

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

  // Update state when URL changes
  useEffect(() => {
    if (searchParams.has('from_date') || searchParams.has('checkIn')) {
      setCheckIn(searchParams.get('from_date') || searchParams.get('checkIn'));
    }
    if (searchParams.has('to_date') || searchParams.has('checkOut')) {
      setCheckOut(searchParams.get('to_date') || searchParams.get('checkOut'));
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
        {/* Check-in Date */}
        <div className="col-md-3 col-sm-3">
          <div className={`form-group ${errors.checkIn ? 'has-error' : ''}`}>
            <label className="control-label">Check-in Date</label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => {
                setCheckIn(e.target.value);
                if (errors.checkIn) {
                  setErrors(prev => ({ ...prev, checkIn: null }));
                }
              }}
              min={today}
              className="form-control"
              disabled={isLoading}
            />
            {errors.checkIn && (
              <span className="help-block">{errors.checkIn}</span>
            )}
          </div>
        </div>

        {/* Check-out Date */}
        <div className="col-md-3 col-sm-3">
          <div className={`form-group ${errors.checkOut ? 'has-error' : ''}`}>
            <label className="control-label">Check-out Date</label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => {
                setCheckOut(e.target.value);
                if (errors.checkOut) {
                  setErrors(prev => ({ ...prev, checkOut: null }));
                }
              }}
              min={checkIn || today}
              className="form-control"
              disabled={isLoading}
            />
            {errors.checkOut && (
              <span className="help-block">{errors.checkOut}</span>
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
    </form>
  );
}
