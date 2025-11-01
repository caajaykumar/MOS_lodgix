'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Breadcrumb from '@/app/components/Breadcrumb/Breadcrumb';

function BookingPageInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const initial = useMemo(() => ({
    from_date: sp.get('from_date') || sp.get('checkIn') || '',
    to_date: sp.get('to_date') || sp.get('checkOut') || '',
    adults: Number(sp.get('adults') || sp.get('guests') || 2),
    children: Number(sp.get('children') || 0),
    pets: Number(sp.get('pets') || 0),
    property_id: Number(sp.get('property_id') || 0),
    room_id: Number(sp.get('room_id') || 0),
  }), [sp]);

  const [guest, setGuest] = useState({
    first_name: '',
    last_name: '',
    title: 'MISTER',
    company: 'myorlandostay_website',
    email: '',
    address: {
      address1: '', address2: '', city: '', zip: '', country: 'US', state: '', phone: '', fax: '', work_phone: '', work_phone_ext: ''
    },
    status_id: 0,
  });

  const [resv, setResv] = useState({
    ...initial,
    stay_type: 'GUEST',
    entities: [{ property_id: initial.property_id || 0, room_ids: [] }],
    guest_id: 0,
  });

  const [status, setStatus] = useState({ phase: 'idle', loading: false, error: null, success: null });
  const [quote, setQuote] = useState(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [notify, setNotify] = useState({ open: false, type: 'error', title: '', message: '' });
  // Missing states used later when optionally loading properties
  const [properties, setProperties] = useState([]);
  const [loadingProps, setLoadingProps] = useState(false);
  const [propMeta, setPropMeta] = useState(null);

  // Helpers
  const fmtMoney = (v) => {
    const n = Number(v);
    if (!isFinite(n)) return '$0.00';
    return n.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
  };
  const fmtDate = (iso) => {
    if (!iso) return '-';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return iso; }
  };

  useEffect(() => {
    setResv((r) => ({
      ...r,
      from_date: initial.from_date,
      to_date: initial.to_date,
      adults: initial.adults,
      children: initial.children,
      pets: initial.pets,
      entities: [{ property_id: initial.property_id || 0, room_ids: r.entities?.[0]?.room_ids || [] }],
    }));
  }, [initial]);

  // Load previously calculated quote from the search page (sessionStorage)
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? sessionStorage.getItem('lodgix_latest_quote') : null;
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved?.quote) setQuote(saved.quote);
      if (saved?.payload) {
        setResv((r) => ({
          ...r,
          from_date: r.from_date || saved.payload.from_date || r.from_date,
          to_date: r.to_date || saved.payload.to_date || r.to_date,
          adults: r.adults ?? saved.payload.adults ?? r.adults,
          children: r.children ?? saved.payload.children ?? r.children,
          pets: r.pets ?? saved.payload.pets ?? r.pets,
          property_id: r.property_id || saved.payload.property_id || r.property_id,
          entities: [{ property_id: (r.entities?.[0]?.property_id) || saved.payload.property_id || 0, room_ids: r.entities?.[0]?.room_ids || [] }],
        }));
      }
    } catch (_) {}
  }, []);

  // Fetch property metadata so we can show a friendly name in the review card
  useEffect(() => {
    const pid = Number(resv.entities?.[0]?.property_id) || Number(resv.property_id) || 0;
    if (!pid) { setPropMeta(null); return; }
    let ignore = false;
    (async () => {
      try {
        const resp = await fetch(`/api/properties/${pid}`, { cache: 'no-store' });
        const data = await resp.json().catch(() => null);
        if (!ignore) setPropMeta(data || null);
      } catch (_) {
        if (!ignore) setPropMeta(null);
      }
    })();
    return () => { ignore = true; };
  }, [resv.entities, resv.property_id]);

  const updateGuest = (path, value) => {
    if (path.startsWith('address.')) {
      const key = path.split('.')[1];
      setGuest((g) => ({ ...g, address: { ...g.address, [key]: value } }));
    } else {
      setGuest((g) => ({ ...g, [path]: value }));
    }
  };

  const updateResv = (key, value) => {
    setResv((r) => {
      if (key === 'property_id') {
        return { ...r, entities: [{ property_id: Number(value) || 0, room_ids: r.entities?.[0]?.room_ids || [] }], property_id: Number(value) || 0 };
      }
      return { ...r, [key]: value };
    });
  };

  const validateGuest = () => {
    if (!guest.first_name || !guest.last_name) return 'First and last name are required';
    if (!guest.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest.email)) return 'A valid email is required';
    return null;
  };
  const validateResv = () => {
    if (!resv.from_date) return 'Check-in is required';
    if (!resv.to_date) return 'Check-out is required';
    if (new Date(resv.from_date) >= new Date(resv.to_date)) return 'Check-out must be after check-in';
    if (!resv.entities?.[0]?.property_id) return 'Property is required';
    return null;
  };

  const createGuest = async () => {
    const gerr = validateGuest();
    if (gerr) throw new Error(gerr);
    const resp = await fetch('/api/guests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(guest) });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok || !data.success) {
      const debug = { status: resp.status, payload: guest, response: data };
      try { console.error('CreateGuest failed', JSON.parse(JSON.stringify(debug))); } catch { console.error('CreateGuest failed', debug); }
      const apiMsg = data?.details?.message || data?.error;
      const errs = Array.isArray(data?.details?.errors) ? data.details.errors.map(e => e?.message || JSON.stringify(e)).join('; ') : '';
      const friendly = [apiMsg, errs].filter(Boolean).join(' | ');
      throw new Error(friendly || 'Failed to create guest');
    }
    return data?.data?.id;
  };

  // Calculate quote via internal API to avoid CORS
  const calcQuote = async (payload) => {
    const resp = await fetch('/api/reservations/quote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok || !data.success) {
      const debug = { status: resp.status, payload, response: data };
      try { console.error('Quote failed', JSON.parse(JSON.stringify(debug))); } catch { console.error('Quote failed', debug); }
      throw new Error(data?.details?.message || data?.error || 'Failed to calculate quote');
    }
    return data?.data;
  };

  // Create reservation via internal API to avoid CORS
  const createReservation = async (payload) => {
    const resp = await fetch('/api/reservations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok || !data.success) {
      console.error('CreateReservation failed', { status: resp.status, payload, response: data });
      throw new Error(data?.details?.message || data?.error || 'Reservation failed');
    }
    return data?.data;
  };

  const handleGetQuote = async (e) => {
    e.preventDefault();
    setStatus({ phase: 'quoting', loading: true, error: null, success: null });
    try {
      const rerr = validateResv();
      if (rerr) throw new Error(rerr);
      const payload = {
        from_date: resv.from_date,
        to_date: resv.to_date,
        adults: Number(resv.adults) || 0,
        children: Number(resv.children) || 0,
        pets: Number(resv.pets) || 0,
        property_id: Number(resv.entities?.[0]?.property_id) || Number(resv.property_id) || 0,
      };
      const rid = Number(sp.get('room_id') || 0) || 0;
      if (rid > 0) payload.room_id = rid;
      const q = await calcQuote(payload);
      setQuote(q);
      setStatus({ phase: 'quoted', loading: false, error: null, success: 'Quote calculated' });
      setShowQuoteModal(true);
    } catch (err) {
      console.error('handleGetQuote error', err);
      setStatus({ phase: 'quoting', loading: false, error: err.message || 'Failed to calculate quote', success: null });
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setStatus({ phase: 'booking', loading: true, error: null, success: null });
    try {
      // Create guest first
      const gid = await createGuest();
      // Redirect to /reservation with all necessary params
      const pid = Number(resv.entities?.[0]?.property_id) || Number(resv.property_id) || 0;
      const search = new URLSearchParams({
        from_date: resv.from_date || '',
        to_date: resv.to_date || '',
        adults: String(Number(resv.adults) || 0),
        children: String(Number(resv.children) || 0),
        pets: String(Number(resv.pets) || 0),
        property_id: String(pid || 0),
        guest_id: String(gid || ''),
      }).toString();
      router.push(`/reservation?${search}`);
      setStatus({ phase: 'done', loading: false, error: null, success: `Guest created (ID: ${gid}). Redirecting...` });
      setNotify({ open: true, type: 'success', title: 'Guest Created', message: `Guest ID ${gid} created successfully. Redirecting to Reservation...` });
    } catch (err) {
      console.error('handleBook error', err);
      setStatus({ phase: 'booking', loading: false, error: err.message || 'Reservation failed', success: null });
      setNotify({ open: true, type: 'error', title: 'Failed to create guest', message: err.message || 'An unexpected error occurred.' });
    }
  };

  // Load properties from internal API when needed
  useEffect(() => {
    const needsProperty = !resv.entities?.[0]?.property_id && !resv.property_id;
    if (!needsProperty) return;
    let ignore = false;
    (async () => {
      try {
        setLoadingProps(true);
        const resp = await fetch('/api/properties');
        const data = await resp.json().catch(() => ([]));
        const results = Array.isArray(data) ? data : (Array.isArray(data?.results) ? data.results : []);
        if (!ignore) setProperties(results);
      } catch (_) {
        if (!ignore) setProperties([]);
      } finally {
        if (!ignore) setLoadingProps(false);
      }
    })();
    return () => { ignore = true; };
  }, [resv.entities, resv.property_id]);

  return (
    <>
    <Breadcrumb
      title="Guest Details"
      breadcrumbs={[
        { name: 'Home', link: '/', active: false },
        { name: 'Booking', link: '/booking', active: false },
        { name: 'Guest Details', link: '#', active: true },
      ]}
    />
    <div className="container max-w-5xl mx-auto p-6">
      <div className="row">
        <div className="col-md-12 text-center mb-4">
          <h1 className="text-2xl font-semibold">Book Your Stay</h1>
          <p className="text-gray-500">Create guest, calculate quote, and place reservation.</p>
        </div>
        <div className="col-md-7">
          <form onSubmit={handleBook}>
            <div className="panel panel-default">
              <div className="panel-heading"><h3 className="panel-title">Guest Information</h3></div>
              <div className="panel-body">
                <div className="row">
                  <div className="col-md-4"><div className="form-group"><label>Title</label>
                    <select className="form-control" value={guest.title} onChange={e=>updateGuest('title', e.target.value)} required>
                      <option value="MISTER">Mr.</option>
                      <option value="MISS">Ms.</option>
                      <option value="MISSIS">Mrs.</option>
                      <option value="DR">Dr.</option>
                      <option value="MRMRS">Mr. & Mrs.</option>
                    </select>
                  </div></div>
                  <div className="col-md-4"><div className="form-group"><label>First name</label><input className="form-control" value={guest.first_name} onChange={e=>updateGuest('first_name', e.target.value)} required /></div></div>
                  <div className="col-md-4"><div className="form-group"><label>Last name</label><input className="form-control" value={guest.last_name} onChange={e=>updateGuest('last_name', e.target.value)} required /></div></div>
                  <div className="col-md-6"><div className="form-group"><label>Email</label><input type="email" className="form-control" value={guest.email} onChange={e=>updateGuest('email', e.target.value)} required /></div></div>
                  <div className="col-md-6"><div className="form-group"><label>Phone</label><input className="form-control" value={guest.address.phone} onChange={e=>updateGuest('address.phone', e.target.value)} /></div></div>
                  <div className="col-md-6"><div className="form-group"><label>Guest ID (existing)</label><input type="number" className="form-control" placeholder="Paste existing guest ID" value={guest.guest_id || ''} onChange={e=>updateGuest('guest_id', e.target.value)} /></div></div>
                  <div className="col-md-8"><div className="form-group"><label>Address 1</label><input className="form-control" value={guest.address.address1} onChange={e=>updateGuest('address.address1', e.target.value)} /></div></div>
                  <div className="col-md-4"><div className="form-group"><label>Address 2</label><input className="form-control" value={guest.address.address2} onChange={e=>updateGuest('address.address2', e.target.value)} /></div></div>
                  <div className="col-md-4"><div className="form-group"><label>City</label><input className="form-control" value={guest.address.city} onChange={e=>updateGuest('address.city', e.target.value)} /></div></div>
                  <div className="col-md-4"><div className="form-group"><label>State</label><input className="form-control" value={guest.address.state} onChange={e=>updateGuest('address.state', e.target.value)} /></div></div>
                  <div className="col-md-4"><div className="form-group"><label>ZIP</label><input className="form-control" value={guest.address.zip} onChange={e=>updateGuest('address.zip', e.target.value)} /></div></div>
                  <div className="col-md-6"><div className="form-group"><label>Country</label><input className="form-control" value={guest.address.country} onChange={e=>updateGuest('address.country', e.target.value)} /></div></div>
                </div>
              </div>
            </div>

            <div className="panel panel-default">
              <div className="panel-heading"><h3 className="panel-title">Guest Details</h3></div>
              <div className="panel-body">
                <div className="row" style={{ marginBottom: 12 }}>
                  <div className="col-sm-6"><div className="form-group"><label>Check-in</label><div className="form-control" style={{ background:'#f9f9f9' }}>{resv.from_date || '-'}</div></div></div>
                  <div className="col-sm-6"><div className="form-group"><label>Check-out</label><div className="form-control" style={{ background:'#f9f9f9' }}>{resv.to_date || '-'}</div></div></div>
                  <div className="col-sm-4"><div className="form-group"><label>Adults</label><div className="form-control" style={{ background:'#f9f9f9' }}>{resv.adults ?? '-'}</div></div></div>
                  <div className="col-sm-4"><div className="form-group"><label>Children</label><div className="form-control" style={{ background:'#f9f9f9' }}>{resv.children ?? '-'}</div></div></div>
                  <div className="col-sm-4"><div className="form-group"><label>Pets</label><div className="form-control" style={{ background:'#f9f9f9' }}>{resv.pets ?? '-'}</div></div></div>
                  <div className="col-sm-12"><div className="form-group"><label>Property</label><div className="form-control" style={{ background:'#f9f9f9' }}>{resv.entities?.[0]?.property_id || resv.property_id || '-'}</div></div></div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="submit" className="btn btn-primary" disabled={status.loading}>
                    {status.phase === 'booking' && status.loading ? (<><span className="glyphicon glyphicon-refresh" style={{ animation: 'spin 1s linear infinite', marginRight: 6 }}></span>Creating Guest...</>) : 'Create Guest'}
                  </button>
                </div>
                {status.error && (<div className="alert alert-danger" style={{ marginTop: 12 }}>{status.error}</div>)}
                {status.success && (<div className="alert alert-success" style={{ marginTop: 12 }}>{status.success}</div>)}
              </div>
            </div>
          </form>
          {showQuoteModal && (
            <div className="custom-modal-overlay" onClick={() => setShowQuoteModal(false)}>
              <div className="custom-modal" onClick={(e)=>e.stopPropagation()}>
                <div className="custom-modal-header">
                  <h3 className="custom-modal-title">Quote Summary</h3>
                  <button className="custom-modal-close" onClick={() => setShowQuoteModal(false)}>✕</button>
                </div>
                <div className="custom-modal-body">
                  <div className="summary-grid">
                    <div className="summary-card"><div className="label">Net</div><div className="value">{fmtMoney(quote?.net ?? quote?.base_rate ?? 0)}</div></div>
                    <div className="summary-card"><div className="label">Gross</div><div className="value text-green">{fmtMoney(quote?.gross ?? quote?.total ?? 0)}</div></div>
                    <div className="summary-card"><div className="label">Fees (net)</div><div className="value">{fmtMoney(quote?.fees_net ?? quote?.total_fees ?? 0)}</div></div>
                    <div className="summary-card"><div className="label">Taxes</div><div className="value">{fmtMoney(quote?.taxes ?? quote?.total_tax ?? 0)}</div></div>
                    <div className="summary-card"><div className="label">Reservation Net</div><div className="value">{fmtMoney(quote?.reservation_net ?? 0)}</div></div>
                    <div className="summary-card"><div className="label">Discount</div><div className="value">{fmtMoney(quote?.discount ?? 0)}</div></div>
                  </div>
                  <div className="details-panel">
                    <div className="details-title">Details</div>
                    <div className="details-row"><span>Discounted Rent</span><span>{fmtMoney(quote?.discounted_rent ?? 0)}</span></div>
                    <div className="details-row"><span>Rental Charges</span><span>{fmtMoney(quote?.discounted_rent_rental_charges ?? 0)}</span></div>
                    <div className="details-row"><span>Taxes (rental)</span><span>{fmtMoney(quote?.taxes_rental_charges ?? 0)}</span></div>
                    <div className="details-row"><span>Fees</span><span>{fmtMoney(quote?.fees ?? quote?.total_fees ?? 0)}</span></div>
                    <div className="details-row"><span>Taxes + Fees</span><span>{fmtMoney(quote?.taxes_and_fees ?? 0)}</span></div>
                    <div className="details-row"><span>Gross w/o Deposit</span><span>{fmtMoney(quote?.gross_without_deposit ?? 0)}</span></div>
                  </div>
                  <details className="raw-toggle"><summary>Raw response</summary><pre>{JSON.stringify(quote, null, 2)}</pre></details>
                </div>
                <div className="custom-modal-footer">
                  <button className="btn btn-default" onClick={() => setShowQuoteModal(false)}>Close</button>
                  <button className="btn btn-primary" onClick={() => setShowQuoteModal(false)}>OK</button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="col-md-5">
          <div className="panel panel-default" style={{ borderRadius: 10, overflow: 'hidden' }}>
            <div className="panel-heading" style={{ background:'#0d47a1', color:'#fff' }}>
              <h3 className="panel-title" style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span className="glyphicon glyphicon-eye-open" aria-hidden="true"></span>
                Review Booking
              </h3>
            </div>
            <div className="panel-body">
              {!quote && (
                <p className="text-muted">Calculate a quote to see an estimated price breakdown.</p>
              )}
              {quote && (
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>{propMeta?.name ? propMeta.name : `Unit ${resv.entities?.[0]?.property_id || resv.property_id || '-'}`}</div>
                  <hr style={{ marginTop: 6, marginBottom: 16 }} />
                  <div className="row" style={{ marginBottom: 12 }}>
                    <div className="col-xs-6">
                      <div style={{ color:'#666', fontSize: 12 }}>Check-in</div>
                      <div style={{ fontWeight: 600 }}>{fmtDate(resv.from_date)}</div>
                    </div>
                    <div className="col-xs-6">
                      <div style={{ color:'#666', fontSize: 12 }}>Check-out</div>
                      <div style={{ fontWeight: 600 }}>{fmtDate(resv.to_date)}</div>
                    </div>
                  </div>

                  {(() => {
                    // Normalize fields from Lodgix responses
                    const subtotal = quote.reservation_net ?? quote.base_rate ?? quote.discounted_rent_rental_charges ?? quote.net ?? 0;
                    const taxes = quote.taxes ?? quote.total_tax ?? 0;
                    const fees = quote.fees ?? quote.total_fees ?? quote.fees_net ?? 0;
                    // Derive pet fee if present in itemized fees or from computedPetFee
                    let petFee = Number(quote.computedPetFee || 0) || 0;
                    try {
                      const feeItems = quote.fee_items || quote.fees_items || quote.fees_breakdown || [];
                      const list = Array.isArray(feeItems) ? feeItems : Object.values(feeItems || {});
                      for (const f of list) {
                        const name = (f?.title || f?.name || '').toLowerCase();
                        const amount = Number(f?.value || f?.amount || 0) || 0;
                        if (name.includes('pet')) { petFee = petFee || amount; }
                      }
                    } catch {}
                    const discount = quote.discount ?? 0;
                    const total = quote.gross ?? quote.total ?? (Number(subtotal) + Number(taxes) + Number(fees) - Math.abs(Number(discount)));
                    return (
                      <div>
                        <div className="row" style={{ marginTop: 16 }}>
                          <div className="col-xs-8">Subtotal</div>
                          <div className="col-xs-4" style={{ textAlign:'right' }}>{fmtMoney(subtotal)}</div>
                          <div className="col-xs-8">Taxes</div>
                          <div className="col-xs-4" style={{ textAlign:'right' }}>{fmtMoney(taxes)}</div>
                          <div className="col-xs-8">Fees</div>
                          <div className="col-xs-4" style={{ textAlign:'right' }}>{fmtMoney(fees)}</div>
                          {petFee > 0 && (<>
                            <div className="col-xs-8" style={{ paddingLeft: 18, color:'#666' }}>Pet Fee</div>
                            <div className="col-xs-4" style={{ textAlign:'right', color:'#666' }}>{fmtMoney(petFee)}</div>
                          </>)}
                          <div className="col-xs-8">Discount</div>
                          <div className="col-xs-4" style={{ textAlign:'right' }}>-{fmtMoney(Math.abs(Number(discount)))}</div>
                        </div>
                        <hr />
                        <div className="row" style={{ fontWeight: 700, fontSize: 18 }}>
                          <div className="col-xs-8">Total</div>
                          <div className="col-xs-4" style={{ textAlign:'right', color:'#2e7d32' }}>{fmtMoney(total)}</div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }
          .custom-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; z-index: 1050; }
          .custom-modal { width: 820px; max-width: calc(100% - 32px); background: #fff; border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,.25); overflow: hidden; }
          .custom-modal-header { display:flex; align-items:center; justify-content:space-between; padding: 14px 18px; background: linear-gradient(90deg, #2563eb, #4f46e5); color:#fff; }
          .custom-modal-title { margin:0; font-size: 18px; font-weight: 600; }
          .custom-modal-close { border:none; background: transparent; color: #fff; font-size: 18px; cursor: pointer; }
          .custom-modal-body { padding: 16px; }
          .summary-grid { display:grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap:12px; margin-bottom: 16px; }
          .summary-card { border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px; }
          .summary-card .label { font-size: 12px; color: #6b7280; }
          .summary-card .value { font-size: 20px; font-weight: 600; }
          .summary-card .text-green { color: #16a34a; }
          .details-panel { border:1px solid #e5e7eb; border-radius: 10px; overflow:hidden; }
          .details-title { background:#f9fafb; padding:10px 12px; font-size: 13px; font-weight: 600; border-bottom:1px solid #e5e7eb; }
          .details-row { display:flex; justify-content:space-between; padding: 8px 12px; font-size: 14px; }
          .details-row:nth-child(odd) { background:#fafafa; }
          .raw-toggle { margin-top: 10px; }
          .custom-modal-footer { display:flex; justify-content:flex-end; gap:8px; padding:12px 16px; background:#f9fafb; border-top:1px solid #e5e7eb; }
          .page-loader { position: fixed; inset: 0; background: rgba(255,255,255,.75); display:flex; align-items:center; justify-content:center; z-index: 1100; }
          .spinner { width: 42px; height: 42px; border: 4px solid #93c5fd; border-top-color: #1d4ed8; border-radius: 9999px; animation: spin 0.9s linear infinite; }
        `}</style>
      </div>
    </div>
    {/* Full page loader */}
    {status.loading && (
      <div className="page-loader">
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
          <div className="spinner"></div>
          <div style={{ color:'#1f2937', fontWeight:600 }}>{status.phase === 'booking' ? 'Creating guest…' : status.phase === 'quoting' ? 'Calculating quote…' : 'Loading…'}</div>
        </div>
      </div>
    )}
    </>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="container max-w-5xl mx-auto p-6"><p>Loading…</p></div>}>
      <BookingPageInner />
    </Suspense>
  );
}
