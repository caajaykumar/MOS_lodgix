"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const ACCEPT_SRC = process.env.NEXT_PUBLIC_ACCEPT_JS_URL || "https://jstest.authorize.net/v1/Accept.js";

function detectBrand(num) {
  const s = String(num || "").replace(/\s|-/g, "");
  if (/^4[0-9]{6,}$/.test(s)) return "Visa";
  if (/^5[1-5][0-9]{5,}$/.test(s) || /^2(2[2-9]|[3-6][0-9]|7[01])[0-9]{4,}$/.test(s)) return "Mastercard";
  if (/^3[47][0-9]{5,}$/.test(s)) return "Amex";
  if (/^6(?:011|5[0-9]{2})[0-9]{3,}$/.test(s)) return "Discover";
  return "Card";
}

export default function PaymentForm({
  propertyId,
  checkIn,
  checkOut,
  guestDetails,
  totalAmount,
  quoteId,
  adults = 1,
  children = 0,
  pets = 0,
}) {
  const router = useRouter();
  const [cardNumber, setCardNumber] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [zip, setZip] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [brand, setBrand] = useState("Card");
  const scriptLoaded = useRef(false);

  const apiLoginID = useMemo(() => process.env.NEXT_PUBLIC_AUTHORIZENET_API_LOGIN_ID || "", []);
  const clientKey = useMemo(() => process.env.NEXT_PUBLIC_AUTHORIZENET_PUBLIC_CLIENT_KEY || "", []);

  useEffect(() => { setBrand(detectBrand(cardNumber)); }, [cardNumber]);

  useEffect(() => {
    if (scriptLoaded.current) return;
    const existing = document.querySelector(`script[src='${ACCEPT_SRC}']`);
    if (existing) { scriptLoaded.current = true; return; }
    const s = document.createElement("script");
    s.src = ACCEPT_SRC;
    s.async = true;
    s.onload = () => { scriptLoaded.current = true; };
    s.onerror = () => { /* ignore */ };
    document.body.appendChild(s);
  }, []);

  const validate = () => {
    if (!totalAmount || Number(totalAmount) <= 0) return "Invalid amount";
    if (!cardNumber || !expMonth || !expYear || !cvv) return "Please enter full card details";
    if (!guestDetails?.name || !guestDetails?.email) return "Guest name and email required";
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const v = validate();
    if (v) { setError(v); return; }
    if (typeof window === 'undefined' || !window.Accept) { setError("Payment library not loaded. Please retry."); return; }
    setLoading(true);
    const authData = { clientKey, apiLoginID };
    const cardData = { cardNumber, month: expMonth, year: expYear, cardCode: cvv, zip }; // AVS includes zip
    const secureData = { authData, cardData };

    const dispatchCb = async (response) => {
      try {
        if (response?.messages?.resultCode === "Error") {
          const msg = response?.messages?.message?.[0]?.text || "Payment tokenization failed";
          setError(msg); setLoading(false); return;
        }
        const opaqueData = response?.opaqueData;
        if (!opaqueData?.dataDescriptor || !opaqueData?.dataValue) {
          setError("Invalid payment token"); setLoading(false); return;
        }
        const payload = {
          paymentNonce: { dataDescriptor: opaqueData.dataDescriptor, dataValue: opaqueData.dataValue },
          bookingDetails: {
            propertyId,
            checkIn,
            checkOut,
            guestName: guestDetails?.name,
            guestEmail: guestDetails?.email,
            guestPhone: guestDetails?.phone || "",
            adults, children, pets,
            totalAmount: Number(totalAmount),
            quoteId: quoteId || "",
          },
        };
        const r = await fetch('/api/booking/create-with-payment', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
        const j = await r.json().catch(()=>({}));
        if (!r.ok || !j?.success) {
          setError(j?.message || 'Payment or booking failed'); setLoading(false); return;
        }
        // Success → go to confirmation
        router.push(`/booking-confirmation?reservation_id=${encodeURIComponent(j.reservationId || '')}&tx=${encodeURIComponent(j.transactionId || '')}`);
      } catch (err) {
        setError(err.message || 'Unexpected error');
        setLoading(false);
      }
    };

    try {
      window.Accept.dispatchData(secureData, dispatchCb);
    } catch (ex) {
      setError(ex?.message || 'Payment failed'); setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:16, boxShadow:'0 8px 20px rgba(16,24,40,.08)' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <div style={{ fontWeight:700 }}>Pay {Number(totalAmount||0).toLocaleString(undefined,{style:'currency',currency:'USD'})}</div>
        <div style={{ fontSize:12, color:'#6b7280' }}>Processed securely • {brand}</div>
      </div>

      <div style={{ display:'grid', gap:10 }}>
        <div>
          <label style={{ fontSize:12, fontWeight:600, color:'#6b7280' }}>Card Number</label>
          <input value={cardNumber} onChange={(e)=>setCardNumber(e.target.value)} placeholder="1234 1234 1234 1234" className="form-control" />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:'#6b7280' }}>Exp. Month</label>
            <input value={expMonth} onChange={(e)=>setExpMonth(e.target.value)} placeholder="MM" className="form-control" />
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:'#6b7280' }}>Exp. Year</label>
            <input value={expYear} onChange={(e)=>setExpYear(e.target.value)} placeholder="YYYY" className="form-control" />
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:'#6b7280' }}>CVV</label>
            <input value={cvv} onChange={(e)=>setCvv(e.target.value)} placeholder="CVV" className="form-control" />
          </div>
        </div>
        <div>
          <label style={{ fontSize:12, fontWeight:600, color:'#6b7280' }}>Billing ZIP</label>
          <input value={zip} onChange={(e)=>setZip(e.target.value)} placeholder="Zip" className="form-control" />
        </div>
      </div>

      {error && <div style={{ marginTop:10, padding:10, background:'#FFF1F2', border:'1px solid #FECDD3', color:'#B91C1C', borderRadius:10 }}>{error}</div>}

      <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop:12 }}>
        {loading ? 'Processing payment...' : 'Complete Booking & Pay'}
      </button>
      <div style={{ marginTop:8, fontSize:12, color:'#6b7280' }}>By continuing you agree to our Terms & Conditions.</div>
    </form>
  );
}
