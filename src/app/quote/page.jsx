'use client';

import { useState } from 'react';

export default function QuotePage() {
  const [form, setForm] = useState({
    property_id: '',
    from_date: '',
    to_date: '',
    adults: 2,
    children: 0,
    pets: 0,
    room_id: ''
  });
  const [status, setStatus] = useState({ loading: false, error: null, success: null });
  const [quote, setQuote] = useState(null);

  const setField = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null, success: null });
    setQuote(null);
    try {
      const payload = {
        from_date: form.from_date,
        to_date: form.to_date,
        adults: Number(form.adults) || 0,
        children: Number(form.children) || 0,
        pets: Number(form.pets) || 0,
        property_id: Number(form.property_id) || 0,
      };
      if (Number(form.room_id) > 0) payload.room_id = Number(form.room_id);
      const resp = await fetch('/api/reservations/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || !data.success) {
        const debug = { status: resp.status, payload, response: data };
        try { console.error('Quote page failed', JSON.parse(JSON.stringify(debug))); } catch { console.error('Quote page failed', debug); }
        throw new Error(data?.details?.message || data?.error || 'Failed to calculate quote');
      }
      setQuote(data.data || null);
      setStatus({ loading: false, error: null, success: 'Quote calculated' });
    } catch (err) {
      setStatus({ loading: false, error: err.message || 'Failed to calculate quote', success: null });
    }
  };

  return (
    <div className="container" style={{ maxWidth: 920, margin: '0 auto', padding: '24px' }}>
      <h1 style={{ marginBottom: 8 }}>Calculate Quote</h1>
      <p className="text-muted" style={{ marginBottom: 24 }}>Calls `POST /api/reservations/quote` and shows totals, taxes and fees.</p>

      <form onSubmit={onSubmit} className="panel panel-default" style={{ padding: 16 }}>
        <div className="row">
          <div className="col-sm-4"><div className="form-group"><label>Property ID</label><input type="number" className="form-control" value={form.property_id} onChange={e=>setField('property_id', e.target.value)} required /></div></div>
          <div className="col-sm-4"><div className="form-group"><label>From date</label><input type="date" className="form-control" value={form.from_date} onChange={e=>setField('from_date', e.target.value)} required /></div></div>
          <div className="col-sm-4"><div className="form-group"><label>To date</label><input type="date" className="form-control" value={form.to_date} onChange={e=>setField('to_date', e.target.value)} required /></div></div>
          <div className="col-sm-3"><div className="form-group"><label>Adults</label><input type="number" className="form-control" min="0" value={form.adults} onChange={e=>setField('adults', e.target.value)} /></div></div>
          <div className="col-sm-3"><div className="form-group"><label>Children</label><input type="number" className="form-control" min="0" value={form.children} onChange={e=>setField('children', e.target.value)} /></div></div>
          <div className="col-sm-3"><div className="form-group"><label>Pets</label><input type="number" className="form-control" min="0" value={form.pets} onChange={e=>setField('pets', e.target.value)} /></div></div>
          <div className="col-sm-3"><div className="form-group"><label>Room ID (optional)</label><input type="number" className="form-control" min="0" value={form.room_id} onChange={e=>setField('room_id', e.target.value)} /></div></div>
        </div>
        <button type="submit" className="btn btn-primary" disabled={status.loading}>
          {status.loading ? 'Calculating…' : 'Calculate Quote'}
        </button>
        {status.error && (<div className="alert alert-danger" style={{ marginTop: 12 }}>{status.error}</div>)}
        {status.success && (<div className="alert alert-success" style={{ marginTop: 12 }}>{status.success}</div>)}
      </form>

      {quote && (
        <div className="panel panel-default" style={{ padding: 16, marginTop: 16 }}>
          <h3 style={{ marginTop: 0 }}>Quote Summary</h3>
          <div className="row">
            <div className="col-sm-4"><strong>Nights:</strong> {quote.nights ?? '-'} </div>
            <div className="col-sm-4"><strong>Base Rate:</strong> ${quote.base_rate ?? '-'} </div>
            <div className="col-sm-4"><strong>Total:</strong> <span style={{ color: 'green', fontWeight: 'bold' }}>${quote.total ?? '-'}</span></div>
          </div>
          <div style={{ marginTop: 8 }}>
            <div><strong>Total Taxes:</strong> ${quote.total_tax ?? '-'} </div>
            <div><strong>Total Fees:</strong> ${quote.total_fees ?? '-'} </div>
          </div>
          <details style={{ marginTop: 10 }}>
            <summary>Raw response</summary>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(quote, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
}
