"use client";

import { useEffect, useMemo } from "react";
import styles from "@/app/checkout/checkout.module.css";

/**
 * BookingSummary Component
 * Displays booking details and calculates totals according to the following formula:
 * 
 * 1. Nightly Charge = Nightly Rate × Number of Nights
 * 2. Subtotal = Nightly Charge + Cleaning Fee + Pet Fee - Discount
 * 3. Tax (13.50%) = Subtotal × 13.50%
 * 4. Payment Charge (5%) = (Subtotal + Tax) × 5%
 * 5. Grand Total = Subtotal + Tax + Payment Charge
 */
export default function BookingSummary({
  propertyId,
  fromDate,
  toDate,
  adults,
  children,
  pets,
  quote,
  loading,
  error,
  discountCode,
  onDiscountCodeChange,
  onApplyDiscount,
  optionalServices = [],
}) {
  // Format currency with US$ prefix and 2 decimal places
  const money = (v) => {
    const n = Number(v) || 0;
    return `US$${n.toFixed(2)}`;
  };

  // Calculate number of nights between check-in and check-out
  const nights = useMemo(() => {
    try {
      if (!fromDate || !toDate) return 0;
      const d1 = new Date(fromDate);
      const d2 = new Date(toDate);
      const ms = d2.setHours(0,0,0,0) - d1.setHours(0,0,0,0);
      return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
    } catch { return 0; }
  }, [fromDate, toDate]);

  /**
   * Calculations per spec:
   * Nightly Charge = Nightly Rate × Nights
   * Subtotal = Nightly Charge + Cleaning Fee + Pet Fee - Discount
   * Tax Base = Nightly Charge + Cleaning Fee (exclude Pet Fee and Discount)
   * Taxes (13.50%) = Tax Base × 0.135
   * Grand Total = Subtotal + Taxes
   * Booking Amount (5%) = Subtotal × 0.05
   */
  const summary = useMemo(() => {
    if (!quote) return null;

    // Step 1: Extract base values from quote
    // Nightly charge from API
    const nightlyCharge = Number(quote?.reservation_net ?? quote?.base_rate ?? quote?.discounted_rent_rental_charges ?? quote?.net ?? 0);
    
    // Calculate nightly rate (total nightly charge / number of nights)
    const nightlyRate = nights > 0 ? nightlyCharge / nights : 0;
    
    // Total fees from quote
    const totalFees = Number(quote?.fees ?? quote?.total_fees ?? quote?.fees_net ?? 0);
    
    // Pet fee (derive from computedPetFee or fee items when pets > 0)
    let petFee = 0;
    if (Number(pets) > 0) {
      petFee = Number(quote?.computedPetFee || 0) || 0;
      if (!petFee) {
        try {
          const raw = quote?.fee_items || quote?.fees_items || quote?.fees_breakdown || [];
          const list = Array.isArray(raw) ? raw : Object.values(raw || {});
          for (const f of list) {
            const title = (f?.title || f?.name || '').toLowerCase();
            const amount = Number(f?.value || f?.amount || 0) || 0;
            if (title.includes('pet')) { petFee = amount; break; }
          }
        } catch {}
      }
    }

    // Cleaning fee (flat): show only $100, ignore other fee items
    const cleaningFee = 100;
    
    // Discount amount (positive value) - robust extraction
    let discount = 0;
    
    // Debug: Log all quote data to console
    if (typeof window !== 'undefined' && quote) {
      console.log('=== QUOTE DISCOUNT DEBUG ===');
      console.log('Property ID:', propertyId);
      console.log('Quote keys:', Object.keys(quote));
      console.log('quote.discounts:', quote.discounts);
      console.log('quote.discount:', quote.discount);
      console.log('quote.discounts_total:', quote.discounts_total);
      console.log('quote.discount_total:', quote.discount_total);
      console.log('quote.total_discount:', quote.total_discount);
      console.log('Full quote object:', quote);
      console.log('Nightly charge for calculation:', nightlyCharge);
    }
    
    try {
      // direct totals if provided
      const directTotals = [quote?.discounts_total, quote?.discount_total, quote?.total_discount];
      for (const v of directTotals) { if (v != null) { discount = Math.abs(toNum(v)); break; } }
      if (!discount) {
        const candidates = [quote?.discounts, quote?.applied_discounts, quote?.discount_items];
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
                  console.log(`Applied ${val}% discount: ${(nightlyCharge * val) / 100}`);
                } else {
                  // Fixed dollar amount
                  totalDiscountAmount += val;
                  console.log(`Applied fixed discount: ${val}`);
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
      const s = String(quote?.discount || 0).replace(/[^0-9.\-]/g, '');
      const n = parseFloat(s);
      discount = Math.abs(Number.isFinite(n) ? n : 0);
    }
    
    // Debug: Log final discount calculation
    if (typeof window !== 'undefined') {
      console.log('Final calculated discount:', discount);
      console.log('=== END DISCOUNT DEBUG ===');
    }


    // Final fallback: infer discount from reservation_net vs discounted rent
    if (!discount) {
      const base = Number(quote?.reservation_net ?? quote?.base_rate ?? quote?.net ?? 0) || 0;
      const discounted = Number(quote?.discounted_rent_rental_charges ?? quote?.discounted_rent ?? quote?.net ?? 0) || 0;
      if (discounted > 0 && base > discounted) {
        discount = Math.max(0, base - discounted);
      }
    }

    // Step 2: Calculate Subtotal
    // Subtotal = Nightly Charge + Cleaning Fee + Pet Fee - Discount
    const subtotal = nightlyCharge + cleaningFee + petFee - discount;

    // Step 3: Taxes on taxBase (exclude pet and discount)
    const TAX_RATE = 0.135; // 13.50%
    const taxBase = nightlyCharge + cleaningFee;
    const taxAmount = taxBase * TAX_RATE;

    // Step 4: Grand Total (no booking amount included)
    const grandTotal = subtotal + taxAmount;

    // Step 5: Booking Amount (5% of Subtotal)
    const BOOKING_AMOUNT_RATE = 0.05;
    const bookingAmount = subtotal * BOOKING_AMOUNT_RATE;

    return {
      nightlyRate: nightlyRate,
      nightlyCharge: nightlyCharge,
      cleaningFee: cleaningFee,
      petFee: petFee,
      discount: discount,
      subtotal: subtotal,
      taxRate: TAX_RATE,
      taxAmount: taxAmount,
      bookingAmountRate: BOOKING_AMOUNT_RATE,
      bookingAmount: bookingAmount,
      grandTotal: grandTotal
    };
  }, [quote, nights, pets]);

  useEffect(() => {
    // reserved for future side effects when totals change
  }, [summary]);

  return (
    <div className={styles.summaryBox}>
      <div className={styles.summaryHeader}>Booking Summary</div>
      <div className={styles.summaryBody}>
        <div className={styles.summaryRow}><span>Property</span><span>#{propertyId || "-"}</span></div>
        <div className={styles.summaryRow}><span>Check-in</span><span>{fromDate || "-"}</span></div>
        <div className={styles.summaryRow}><span>Check-out</span><span>{toDate || "-"}</span></div>
        <div className={styles.summaryRow}><span>Nights</span><span>{nights}</span></div>
        <div className={styles.summaryRow}><span>Guests</span><span>{Number(adults)||0} Adults, {Number(children)||0} Children, {Number(pets)||0} Pets</span></div>
        <hr className={styles.hr} />
        {loading && <div className={styles.info}>Calculating quote…</div>}
        {error && <div className={styles.error}>{error}</div>}
        {summary && (
          <>
            {/* Nightly Charge Breakdown */}
            <div className={styles.summaryRow}>
              <span>Nightly Charge</span>
              <span>{money(summary.nightlyCharge)}</span>
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginLeft: '8px', marginBottom: '8px' }}>
              (Nightly Rate: {money(summary.nightlyRate)} × {nights} {nights === 1 ? 'night' : 'nights'})
            </div>

            {/* Cleaning Fee */}
            <div className={styles.summaryRow}>
              <span>Cleaning Fee</span>
              <span>{money(summary.cleaningFee)}</span>
            </div>

            {/* Pet Fee (if applicable) */}
            {Number(pets) > 0 && (
              <div className={styles.summaryRow}>
                <span>Pet Fee</span>
                <span>{money(summary.petFee)}</span>
              </div>
            )}

            {/* Discount (after Pet Fee) */}
            {summary.discount > 0 && (
              <div className={styles.summaryRow}>
                <span>Discount</span>
                <span style={{ color: '#059669' }}>- {money(summary.discount)}</span>
              </div>
            )}
            


            <hr className={styles.hr} />

            {/* Subtotal */}
            <div className={styles.summaryRow} style={{ fontWeight: 600 }}>
              <span>Subtotal</span>
              <span>{money(summary.subtotal)}</span>
            </div>

            {/* Taxes (exclude Pet Fee and Discount) */}
            <div className={styles.summaryRow}>
              <span>Taxes ({(summary.taxRate * 100).toFixed(2)}%)</span>
              <span>{money(summary.taxAmount)}</span>
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginLeft: '8px', marginBottom: '8px' }}>
              (Calculated on Nightly Charge + Cleaning Fee only)
            </div>

            {/* Grand Total */}
            <div className={styles.totalRow}>
              <span style={{ fontWeight: 700, fontSize: '16px' }}>Grand Total</span>
              <span className={styles.total} style={{ fontWeight: 700, fontSize: '18px' }}>{money(summary.grandTotal)}</span>
            </div>

            {/* Booking Amount (after Grand Total) */}
            <div className={styles.summaryRow} style={{ color: '#2E5C9A', fontWeight: 600, marginTop: 10 }}>
              <span>Booking Amount ({(summary.bookingAmountRate * 100).toFixed(0)}%)</span>
              <span>{money(summary.bookingAmount)}</span>
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginLeft: '8px', marginTop: '2px' }}>
              (5% of Subtotal)
            </div>
          </>
        )}
      </div>
    </div>
  );
}
