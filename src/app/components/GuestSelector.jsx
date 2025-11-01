"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Modal from '@/app/components/Modal';

export default function GuestSelector({ value, onChange, buttonClassName = "", popoverAlign = "left", enablePetPolicy = true }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const adults = Math.max(1, Number(value?.adults || 1));
  const children = Math.max(0, Number(value?.children || 0));
  const infants = Math.max(0, Number(value?.infants || 0));
  const pets = Math.max(0, Number(value?.pets || 0));
  const [petWarning, setPetWarning] = useState("");
  const [showPetPolicy, setShowPetPolicy] = useState(false);

  const summary = useMemo(() => {
    const totalGuests = adults + children;
    const parts = [`${totalGuests} guest${totalGuests === 1 ? "" : "s"}`];
    if (pets) parts.push(`${pets} pet${pets === 1 ? "" : "s"}`);
    return parts.join(", ");
  }, [adults, children, pets]);

  useEffect(() => {
    const onDoc = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const setCounts = (next) => {
    const v = {
      adults: Math.max(1, next.adults ?? adults),
      children: Math.max(0, next.children ?? children),
      infants: Math.max(0, next.infants ?? infants),
      pets: Math.max(0, next.pets ?? pets),
    };
    onChange?.(v);
  };

  const Row = ({ label, sub, k, min }) => (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px' }}>
      <div>
        <div style={{ fontWeight:600 }}>{label}</div>
        {sub ? <div style={{ fontSize:12, color:'#6b7280' }}>{sub}</div> : null}
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <button type="button" aria-label={`decrement-${k}`} onClick={() => setCounts({ [k]: Math.max(min, (k==='adults'?adults:k==='children'?children:k==='infants'?infants:pets) - 1) })} className="btn btn-default btn-xs" style={{ width:28, height:28, borderRadius:9999 }}>-</button>
        <span style={{ width:20, textAlign:'center' }}>{k==='adults'?adults:k==='children'?children:k==='infants'?infants:pets}</span>
        <button
          type="button"
          aria-label={`increment-${k}`}
          onClick={() => {
            if (k === 'pets' && enablePetPolicy) {
              if (pets >= 2) {
                setPetWarning('Maximum 2 pets allowed');
                try { clearTimeout(window.__lodgix_pet_to); } catch {}
                try { window.__lodgix_pet_to = setTimeout(() => setPetWarning(''), 2000); } catch {}
                return;
              }
            }
            setCounts({ [k]: (k==='adults'?adults:k==='children'?children:k==='infants'?infants:pets) + 1 });
          }}
          className="btn btn-default btn-xs"
          style={{ width:28, height:28, borderRadius:9999 }}
        >+
        </button>
      </div>
    </div>
  );

  return (
    <div ref={ref} style={{ position:'relative' }}>
      <button type="button" className={buttonClassName || "btn btn-default"} onClick={() => setOpen((v)=>!v)} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', borderRadius:10, padding:'10px 12px' }}>
        <div>
          <div style={{ fontSize:11, textTransform:'uppercase', color:'#6b7280', fontWeight:700 }}>GUESTS</div>
          <div style={{ fontSize:14 }}>{summary}</div>
        </div>
        <span>▾</span>
      </button>
      {open && (
        <div style={{ position:'absolute', [popoverAlign==='right'?'right':'left']:0, top:'calc(100% + 6px)', background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, boxShadow:'0 20px 40px rgba(0,0,0,.15)', width:300, zIndex:50 }}>
          <Row label="Adults" sub="Ages 13 or above" k="adults" min={1} />
          <Row label="Children" sub="Ages 2–12" k="children" min={0} />
          <Row label="Infants" sub="Under 2" k="infants" min={0} />
          <Row label="Pets" sub={enablePetPolicy ? 'Bringing a service animal?' : undefined} k="pets" min={0} />
          {enablePetPolicy && (
            <div style={{ padding:'0 12px' }}>
              <a href="#" onClick={(e)=>{ e.preventDefault(); setShowPetPolicy(true); }} style={{ fontSize:12 }}>Pet Policy - Click to view rules</a>
            </div>
          )}
          {petWarning ? (
            <div className="alert alert-warning" style={{ margin: '8px 12px', padding: '6px 10px' }}>{petWarning}</div>
          ) : null}
          <div style={{ padding:10, textAlign:'right' }}>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setOpen(false)}>Done</button>
          </div>
        </div>
      )}
      {enablePetPolicy && (
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
      )}
    </div>
  );
}
