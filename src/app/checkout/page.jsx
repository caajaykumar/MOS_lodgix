"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "./checkout.module.css";
import BookingSummary from "@/app/components/BookingSummary";
import GuestDetailsForm from "@/app/components/GuestDetailsForm";
import BillingAddressForm from "@/app/components/BillingAddressForm";
import Breadcrumb from "@/app/components/Breadcrumb/Breadcrumb";
import { isEmail, requiredFields, emailMatches } from "@/utils/validation";
import { useLoader } from "@/app/components/LoaderProvider";
import Background from "@/app/components/UI/Background";
import { calculatePetFee } from "@/utils/calculatePetFee";

export default function CheckoutPage() {
  const { hideLoader } = useLoader();
  const sp = useSearchParams();
  const router = useRouter();

  // Hide global loader shortly after checkout page mounts
  useEffect(() => { try { hideLoader(300); } catch {} }, [hideLoader]);

  const initial = useMemo(() => ({
    property_id: Number(sp.get("property_id") || 0),
    from_date: sp.get("check_in") || sp.get("from_date") || "",
    to_date: sp.get("check_out") || sp.get("to_date") || "",
    adults: Number(sp.get("adults") || 2),
    children: Number(sp.get("children") || 0),
    pets: Number(sp.get("pets") || 0),
  }), [sp]);

  const [quote, setQuote] = useState(null);
  const [quoteError, setQuoteError] = useState("");
  const [loadingQuote, setLoadingQuote] = useState(false);

  const [guest, setGuest] = useState({
    title: "Mr.",
    first_name: "",
    last_name: "",
    email: "",
    confirm_email: "",
    age: "",
    phone: "",
  });

  const [billing, setBilling] = useState({
    address1: "",
    address2: "",
    zip: "",
    city: "",
    state: "",
    country: "India",
  });

  // Miscellaneous section removed per requirements

  const [agree, setAgree] = useState({ rental: false });
  const [discountCode, setDiscountCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(null);

  // Mutable criteria for dates and guest counts
  const [criteria, setCriteria] = useState(() => ({
    property_id: Number(initial.property_id) || 0,
    from_date: initial.from_date || "",
    to_date: initial.to_date || "",
    adults: Number(initial.adults) || 2,
    children: Number(initial.children) || 0,
    pets: Number(initial.pets) || 0,
  }));
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [reservationData, setReservationData] = useState(null);

  const normalizedQuotePayload = useCallback(() => ({
    from_date: criteria.from_date,
    to_date: criteria.to_date,
    adults: Math.max(1, Number(criteria.adults) || 0),
    children: Math.max(0, Number(criteria.children) || 0),
    pets: Math.max(0, Number(criteria.pets) || 0),
    property_id: Number(criteria.property_id) || 0,
    discount_code: discountCode || undefined,
  }), [criteria, discountCode]);

  useEffect(() => {
    let ignore = false;
    if (!criteria.property_id || !criteria.from_date || !criteria.to_date) return;
    (async () => {
      try {
        setLoadingQuote(true);
        setQuoteError("");
        const payload = normalizedQuotePayload();
        const resp = await fetch("/api/reservations/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await resp.json().catch(() => ({}));
        if (!ignore) {
          if (resp.ok && data?.success) {
            let q = data.data;
            // If pets are selected, try to compute pet fee delta by fetching a quote with pets = 0
            if ((payload.pets || 0) > 0) {
              try {
                const noPetsPayload = { ...payload, pets: 0 };
                const respNoPets = await fetch("/api/reservations/quote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(noPetsPayload) });
                const dataNoPets = await respNoPets.json().catch(() => ({}));
                if (respNoPets.ok && dataNoPets?.success) {
                  const feesWithPets = Number(q.fees ?? q.total_fees ?? q.fees_net ?? 0) || 0;
                  const feesNoPets = Number(dataNoPets.data?.fees ?? dataNoPets.data?.total_fees ?? dataNoPets.data?.fees_net ?? 0) || 0;
                  const computedPetFee = Math.max(0, feesWithPets - feesNoPets);
                  q = { ...q, computedPetFee };
                }
              } catch {}
            }
            setQuote(q);
          } else {
            setQuote(null);
            setQuoteError(data?.error || "Unable to calculate pricing. Please try again.");
          }
        }
      } catch (_) {
        if (!ignore) {
          setQuote(null);
          setQuoteError("Unable to calculate pricing. Please try again.");
        }
      } finally {
        if (!ignore) setLoadingQuote(false);
      }
    })();
    return () => { ignore = true; };
  }, [normalizedQuotePayload, criteria.property_id, criteria.from_date, criteria.to_date]);

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    const payload = normalizedQuotePayload();
    try {
      setLoadingQuote(true);
      const resp = await fetch("/api/reservations/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await resp.json().catch(() => ({}));
      if (resp.ok && data?.success) {
        setQuote(data.data);
        setQuoteError("");
      } else {
        setQuoteError(data?.error || "Invalid discount code");
      }
    } catch (_) {
      setQuoteError("Invalid discount code");
    } finally {
      setLoadingQuote(false);
    }
  };

  /**
   * Calculate payment amount as Booking Amount (5% of Subtotal)
   * Subtotal = Nightly Charge + Cleaning Fee + Pet Fee - Discount
   * Taxes = (Nightly Charge + Cleaning Fee) × 13.50% (excluded from booking amount base)
   */
  const paymentAmount = useMemo(() => {
    if (!quote) return 0;
    
    // Step 1: Extract base values
    // Nightly charge from API (base for room rate)
    const nightlyCharge = Number(quote?.reservation_net ?? quote?.base_rate ?? quote?.discounted_rent_rental_charges ?? quote?.net ?? 0);
    const cleaningFee = Number(quote?.fees ?? quote?.total_fees ?? quote?.fees_net ?? 0);
    // Compute nights locally
    let nights = 0;
    try {
      const d1 = new Date(criteria.from_date);
      const d2 = new Date(criteria.to_date);
      const ms = d2.setHours(0,0,0,0) - d1.setHours(0,0,0,0);
      nights = Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
    } catch {}
    // Pet fee per business rules
    const petFee = Number(criteria.pets) > 0 ? (calculatePetFee(nights, Number(criteria.pets)) || 0) : 0;
    // Robust discount parse (totals, arrays, and string fields)
    const toNum = (v) => {
      if (v == null) return 0;
      const s = String(v).replace(/[^0-9.\-]/g, '');
      const n = parseFloat(s);
      return Number.isFinite(n) ? n : 0;
    };
    let discount = 0;
    try {
      const directTotals = [quote?.discounts_total, quote?.discount_total, quote?.total_discount];
      for (const v of directTotals) { if (v != null) { discount = Math.abs(toNum(v)); break; } }
      if (!discount) {
        const candidates = [quote?.discounts, quote?.applied_discounts, quote?.discount_items, quote?.details?.discounts, quote?.pricing?.discounts];
        for (const arr of candidates) {
          const list = Array.isArray(arr) ? arr : [];
          if (list.length) {
            let totalDiscountAmount = 0;
            for (const d of list) {
              const val = Number(d?.value ?? d?.amount ?? d?.net ?? d?.total ?? 0) || 0;
              if (val > 0) {
                // If value is between 1-100, treat as percentage of nightly charge
                if (val > 1 && val <= 100) {
                  totalDiscountAmount += (nightlyCharge * val) / 100;
                } else {
                  // Fixed dollar amount
                  totalDiscountAmount += val;
                }
              }
            }
            if (totalDiscountAmount > 0) {
              discount = totalDiscountAmount;
              break;
            }
          }
        }
      }
      if (!discount && quote?.discounts != null) {
        const sTot = toNum(quote.discounts);
        if (sTot) discount = Math.abs(sTot);
      }
      if (!discount) discount = Math.abs(toNum(quote?.discount || 0));
    } catch {
      discount = Math.abs(toNum(quote?.discount || 0));
    }
    
    // Step 2: Calculate Subtotal
    const subtotal = nightlyCharge + cleaningFee + petFee - discount;
    // Step 3: Calculate Tax per spec (excluded from booking amount base)
    const taxAmount = (nightlyCharge + cleaningFee) * 0.135;
    // Booking Amount is 5% of Subtotal (not used directly with tax here, but left for clarity)
    const bookingAmount = subtotal * 0.05;
    return bookingAmount;
  }, [quote, initial.pets]);

  // optional services removed per requirements

  const validateAll = () => {
    const missing = requiredFields({
      title: guest.title,
      first_name: guest.first_name,
      last_name: guest.last_name,
      email: guest.email,
      age: guest.age,
      address1: billing.address1,
      city: billing.city,
      state: billing.state,
      zip: billing.zip,
      country: billing.country,
    }, [
      "title",
      "first_name",
      "last_name",
      "email",
      "age",
      "address1",
      "city",
      "state",
      "zip",
      "country",
    ]);
    if (missing.length) return `Please fill required fields: ${missing.join(", ")}`;
    if (!isEmail(guest.email)) return "Invalid email format";
    if (!emailMatches(guest.email, guest.confirm_email)) return "Emails do not match";
    if (!(Number(guest.age) >= 21)) return "Guest must be at least 21 years old";
    if (!agree.rental) return "You must accept the rental agreement";
    if (!criteria.property_id || !criteria.from_date || !criteria.to_date) return "Dates and property are required";
    if (Number(criteria.pets) > 2) return "Maximum 2 pets allowed";
    return "";
  };

  const handlePaymentSuccess = () => {};

  const handleCompleteBooking = async () => {
    setSubmitError("");
    const v = validateAll();
    if (v) { setSubmitError(v); return; }
    try {
      setSubmitting(true);
      // map UI country name to ISO alpha-2 where possible
      const toIsoCountry = (c) => {
        const s = String(c || '').trim().toLowerCase();
        if (!s) return '';
        const map = {
          india: 'IN',
          'united states': 'US',
          usa: 'US',
          'united kingdom': 'GB',
          uk: 'GB',
          canada: 'CA',
          australia: 'AU',
        };
        return map[s] || c; // fallback to raw if not mapped
      };
      // sanitize phone (optional)
      const phoneDigits = String(guest.phone || '').replace(/\D/g, '');
      const phoneValid = phoneDigits.length >= 7 && phoneDigits.length <= 15;
      const guestPayload = {
        first_name: guest.first_name,
        last_name: guest.last_name,
        title: guest.title,
        email: guest.email,
        address: {
          address1: billing.address1,
          address2: billing.address2,
          city: billing.city,
          zip: billing.zip,
          country: toIsoCountry(billing.country),
          state: billing.state,
          // include phone only if valid
          ...(phoneValid ? { phone: phoneDigits } : {}),
          fax: "",
          work_phone: "",
          work_phone_ext: "",
        },
        company: "myorlandostay_website",
      };
      // Preflight: try to find existing guest by email
      let guest_id = null;
      try {
        const findResp = await fetch(`/api/guests?email=${encodeURIComponent(guest.email)}`);
        const findData = await findResp.json().catch(() => ({}));
        if (findResp.ok && findData?.success && findData?.data?.id) {
          guest_id = findData.data.id;
        }
      } catch {}
      // If not found, try to create
      if (!guest_id) {
        const gResp = await fetch("/api/guests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(guestPayload) });
        const gData = await gResp.json().catch(() => ({}));
        if (!gResp.ok || !gData?.success) {
          const details = gData?.details;
          const errors = Array.isArray(details?.errors) ? details.errors.map(e => e?.message || JSON.stringify(e)).join('; ') : '';
          const msg = [gData?.error, details?.message, errors].filter(Boolean).join(' | ') || 'Guest creation failed';
          // If duplicate email, fallback to lookup again and proceed
          if (/exists/i.test(msg) || /duplicate/i.test(msg)) {
            try {
              const retryResp = await fetch(`/api/guests?email=${encodeURIComponent(guest.email)}`);
              const retryData = await retryResp.json().catch(() => ({}));
              if (retryResp.ok && retryData?.success && retryData?.data?.id) {
                guest_id = retryData.data.id;
              } else {
                throw new Error(msg);
              }
            } catch {
              throw new Error(msg);
            }
          } else {
            throw new Error(msg);
          }
        } else {
          guest_id = gData?.data?.id;
        }
      }
      const reservationPayload = {
        from_date: criteria.from_date,
        to_date: criteria.to_date,
        adults: Number(criteria.adults) || 0,
        children: Number(criteria.children) || 0,
        pets: Number(criteria.pets) || 0,
        guest_id,
        stay_type: "GUEST",
        entities: [{ property_id: Number(criteria.property_id) || 0, room_ids: [] }],
        discount_code: discountCode || undefined,
        special_requests: "",
      };
      const rResp = await fetch("/api/reservations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(reservationPayload) });
      const rData = await rResp.json().catch(() => ({}));
      if (!rResp.ok || !rData?.success) throw new Error(rData?.error || "Reservation could not be completed. Please contact support.");
      // Ensure guest counts are preserved for confirmation page rendering
      const mergedReservation = {
        ...(rData.data || {}),
        adults: Number(criteria.adults) || 0,
        children: Number(criteria.children) || 0,
        pets: Number(criteria.pets) || 0,
      };
      setSuccess({ reservation: mergedReservation });
      setReservationData({ reservation: mergedReservation, guest: guestPayload, quote });
      // persist for confirmation page
      try { sessionStorage.setItem('lodgix_latest_reservation', JSON.stringify({ reservation: mergedReservation, guest: guestPayload, quote })); } catch {}
      // also log to console per request
      try { console.log('Reservation success', rData.data); } catch {}
      // Redirect to dedicated payment page with amount and reservation id
      try {
        const id = rData?.data?.id || rData?.data?.reservation_number || "";
        if (id) router.push(`/booking-confirmation?reservation_id=${encodeURIComponent(id)}`);
      } catch {}
    } catch (e) {
      setSubmitError(e.message || "Reservation could not be completed. Please contact support.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.pageWrap}>
      <Breadcrumb
        title="Checkout"
        breadcrumbs={[
          { name: 'Home', link: '/', active: false },
          { name: 'Booking', link: '/booking', active: false },
          { name: 'Checkout', link: '#', active: true },
        ]}
        fluid={false}
      />
      <div className={styles.content}>
        <div className={styles.mainCol}>
          <div style={{ marginTop: 28, marginBottom: 16 }}>
            <Background
              title="Complete Your Booking"
              subtitle="Review your details and confirm your reservation in one simple step."
            />
          </div>
          <div className={styles.accordion}>
            {/* Optional services removed as pricing shown in booking summary */}

            <details open>
              <summary className={styles.sectionTitle}>Guest Details</summary>
              <div className={styles.sectionBody}>
                <GuestDetailsForm value={guest} onChange={setGuest} />
              </div>
            </details>

            <details open>
              <summary className={styles.sectionTitle}>Billing Address</summary>
              <div className={styles.sectionBody}>
                <BillingAddressForm value={billing} onChange={setBilling} />
              </div>
            </details>

            {/* Miscellaneous section removed per requirements */}

            <div className={styles.termsBox}>
              <label className={styles.checkbox}> 
                <input type="checkbox" checked={agree.rental} onChange={(e) => setAgree((a) => ({ ...a, rental: e.target.checked }))} />
                <span>Accept the Rental Agreement</span>
              </label>
            </div>

            {submitError && <div className={styles.error}>{submitError}</div>}

            <button className={styles.primaryBtn} disabled={submitting} onClick={handleCompleteBooking}>
              {submitting ? "Completing Booking..." : "Complete Booking"}
            </button>

            {success && (
              <div className={styles.successBox}>
                <div className={styles.successTitle}>Booking Confirmed! Your reservation has been created successfully.</div>
                <div className={styles.successDetails}>
                  Confirmation: {success?.reservation?.id || success?.reservation?.reservation_number || ""}
                </div>
                <div style={{ marginTop: 12, color: '#2E5C9A', fontWeight: 600 }}>
                  Proceeding to secure payment page...
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className={styles.sideCol}>
          <BookingSummary
            propertyId={criteria.property_id}
            fromDate={criteria.from_date}
            toDate={criteria.to_date}
            adults={criteria.adults}
            children={criteria.children}
            pets={criteria.pets}
            quote={quote}
            loading={loadingQuote}
            error={quoteError}
            discountCode={discountCode}
            onDiscountCodeChange={setDiscountCode}
            onApplyDiscount={handleApplyDiscount}
          />
        </aside>
      </div>

      {/* Payment handled on dedicated page */}
    </div>
  );
}
