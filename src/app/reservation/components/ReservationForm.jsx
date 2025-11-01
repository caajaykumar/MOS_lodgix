'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ReservationForm() {
  const router = useRouter();
  const sp = useSearchParams();

  const [form, setForm] = useState({
    from_date: sp.get('from_date') || sp.get('checkIn') || '',
    to_date: sp.get('to_date') || sp.get('checkOut') || '',
    adults: parseInt(sp.get('adults') || sp.get('guests') || '2'),
    children: parseInt(sp.get('children') || '0'),
    pets: parseInt(sp.get('pets') || '0'),
    guest_id: parseInt(sp.get('guest_id') || '0'),
    stay_type: 'GUEST',
    property_id: parseInt(sp.get('property_id') || '0'),
    room_ids: [], // optional
  });

  const [status, setStatus] = useState({ loading: false, error: null, success: null });

  const update = (name, val) => setForm(prev => ({ ...prev, [name]: val }));

  const validate = () => {
    const err = {};
    if (!form.from_date) err.from_date = 'Check-in is required';
    if (!form.to_date) err.to_date = 'Check-out is required';
    if (form.from_date && form.to_date && new Date(form.from_date) >= new Date(form.to_date)) {
      err.to_date = 'Check-out must be after check-in';
    }
    if (!form.property_id) err.property_id = 'Property ID is required';
    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setStatus({ loading: false, error: 'Please fix validation errors', success: null });
      return;
    }

    setStatus({ loading: true, error: null, success: null });

    try {
      const payload = {
        from_date: form.from_date,
        to_date: form.to_date,
        adults: Number(form.adults) || 0,
        children: Number(form.children) || 0,
        pets: Number(form.pets) || 0,
        guest_id: Number(form.guest_id) || 0,
        stay_type: form.stay_type,
        entities: [
          {
            property_id: Number(form.property_id),
            room_ids: Array.isArray(form.room_ids) ? form.room_ids : [],
          },
        ],
      };

      const resp = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await resp.json();
      if (!resp.ok || !data.success) {
        throw new Error(data?.details?.message || data.error || 'Reservation failed');
      }

      setStatus({ loading: false, error: null, success: 'Reservation created successfully!' });
    } catch (err) {
      setStatus({ loading: false, error: err.message || 'Reservation failed', success: null });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-md-6">
          <div className="form-group">
            <label>Check-in (YYYY-MM-DD)</label>
            <input className="form-control" type="date" value={form.from_date} onChange={e => update('from_date', e.target.value)} />
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group">
            <label>Check-out (YYYY-MM-DD)</label>
            <input className="form-control" type="date" value={form.to_date} onChange={e => update('to_date', e.target.value)} />
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label>Adults</label>
            <input className="form-control" type="number" min="0" value={form.adults} onChange={e => update('adults', e.target.value)} />
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label>Children</label>
            <input className="form-control" type="number" min="0" value={form.children} onChange={e => update('children', e.target.value)} />
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label>Pets</label>
            <input className="form-control" type="number" min="0" value={form.pets} onChange={e => update('pets', e.target.value)} />
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group">
            <label>Property ID</label>
            <input className="form-control" type="number" value={form.property_id} onChange={e => update('property_id', e.target.value)} />
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group">
            <label>Guest ID (optional)</label>
            <input className="form-control" type="number" value={form.guest_id} onChange={e => update('guest_id', e.target.value)} />
          </div>
        </div>
        <div className="col-md-12">
          <div className="form-group">
            <label>Room IDs (optional, comma-separated)</label>
            <input className="form-control" type="text" placeholder="e.g., 1001,1002" onChange={e => {
              const val = e.target.value.trim();
              if (!val) return update('room_ids', []);
              update('room_ids', val.split(',').map(v => Number(v.trim())).filter(Boolean));
            }} />
            <p className="help-block">Leave empty if rooms are not required for this property.</p>
          </div>
        </div>
      </div>

      {status.error && (
        <div className="alert alert-danger">{status.error}</div>
      )}
      {status.success && (
        <div className="alert alert-success">{status.success}</div>
      )}

      <button type="submit" className="btn btn-primary" disabled={status.loading}>
        {status.loading ? (
          <>
            <span className="glyphicon glyphicon-refresh" style={{ animation: 'spin 1s linear infinite', marginRight: 6 }}></span>
            Booking...
          </>
        ) : (
          'Confirm Reservation'
        )}
      </button>

      <style jsx>{`
        @keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }
      `}</style>
    </form>
  );
}
