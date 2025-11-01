"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function PaymentPageInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const reservationId = sp.get("reservation_id") || "";

  const [formData, setFormData] = useState({
    cardNumber: "",
    expirationDate: "",
    cardCode: "",
    firstName: "",
    lastName: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Secure: Amount fetched from server-side verification API only
  const [verifiedData, setVerifiedData] = useState(null);
  const [verifying, setVerifying] = useState(true);
  const [verifyError, setVerifyError] = useState("");

  // Fetch verified amount from secure API (ignores any URL amount parameter)
  useEffect(() => {
    if (!reservationId) {
      setVerifyError("Missing reservation ID");
      setVerifying(false);
      return;
    }

    let ignore = false;

    (async () => {
      try {
        setVerifying(true);
        setVerifyError("");
        
        console.log("[Payment] Verifying reservation:", reservationId);
        
        const response = await fetch(
          `/api/payment/verify?reservation_id=${encodeURIComponent(reservationId)}`,
          { cache: 'no-store' }
        );

        const data = await response.json();

        if (ignore) return;

        if (!response.ok || !data?.success) {
          const errorMsg = data?.error || "Unable to verify payment amount";
          setVerifyError(errorMsg);
          console.error("[Payment] Verification failed:", errorMsg);
          return;
        }

        console.log("[Payment] Verification successful:", data.data);
        setVerifiedData(data.data);
        
      } catch (err) {
        if (ignore) return;
        console.error("[Payment] Verification error:", err);
        setVerifyError("Payment verification failed. Please try again.");
      } finally {
        if (!ignore) setVerifying(false);
      }
    })();

    return () => { ignore = true; };
  }, [reservationId]);

  const amount = verifiedData?.depositAmount || 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === "cardNumber") {
      v = value.replace(/\s/g, "").replace(/(\d{4})/g, "$1 ").trim();
      if (v.replace(/\s/g, "").length > 16) return;
    }
    if (name === "expirationDate") {
      v = value.replace(/\D/g, "");
      if (v.length >= 2) v = v.slice(0, 2) + "/" + v.slice(2, 4);
      if (v.length > 5) return;
    }
    if (name === "cardCode") {
      v = value.replace(/\D/g, "");
      if (v.length > 4) return;
    }
    setFormData((f) => ({ ...f, [name]: v }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Security: Prevent submission if amount not verified from server
    if (!verifiedData || !verifiedData.depositAmount) {
      setError("Payment amount not verified. Please refresh and try again.");
      return;
    }
    
    setLoading(true);
    try {
      const cardNumberClean = formData.cardNumber.replace(/\s/g, "");
      const expirationDateClean = formData.expirationDate.replace(/\//g, "");
      if (cardNumberClean.length < 13 || cardNumberClean.length > 16) throw new Error("Invalid card number");
      if (expirationDateClean.length !== 4) throw new Error("Invalid expiration (MM/YY)");
      if (formData.cardCode.length < 3 || formData.cardCode.length > 4) throw new Error("Invalid CVV");
      if (!formData.firstName || !formData.lastName) throw new Error("Enter cardholder name");

      console.log("[Payment] Submitting with verified amount:", verifiedData.depositAmount);

      const resp = await fetch("/api/payment/authorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardNumber: cardNumberClean,
          expirationDate: expirationDateClean,
          cardCode: formData.cardCode,
          // Use ONLY server-verified amount
          amount: Number(verifiedData.depositAmount).toFixed(2),
          firstName: formData.firstName,
          lastName: formData.lastName,
          reservationId,
        }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || !data?.success) throw new Error(data?.error || "Payment failed");
      router.push(`/booking-confirmation?reservation_id=${encodeURIComponent(reservationId)}&paid=1`);
    } catch (err) {
      setError(err.message || "Payment processing failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: 20 }}>
      <h1 style={{ marginBottom: 8 }}>Secure Payment</h1>
      <p style={{ color: "#555", marginBottom: 20 }}>Pay your 5% deposit to confirm your booking.</p>

      {verifying && (
        <div style={{ background: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe", borderRadius: 8, padding: 16, marginBottom: 16, textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>🔒 Verifying payment amount...</div>
          <div style={{ fontSize: 14, opacity: 0.8 }}>Please wait while we securely verify your reservation.</div>
        </div>
      )}

      {verifyError && (
        <div style={{ background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca", borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>❌ Verification Failed</div>
          <div>{verifyError}</div>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: 12, padding: "8px 16px", background: "#991b1b", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}
          >
            Retry
          </button>
        </div>
      )}

      {verifiedData && !verifying && (
        <>
          <div style={{ background: "#0a2a6b", color: "#fff", borderRadius: 12, padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontSize: 14, opacity: 0.9 }}>Deposit Amount (5%) - Verified ✓</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>${Number(amount).toFixed(2)}</div>
          </div>

          {verifiedData.dates && (
            <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 14 }}>
              <div><strong>Reservation #{reservationId}</strong></div>
              <div>Check-in: {verifiedData.dates.checkIn}</div>
              <div>Check-out: {verifiedData.dates.checkOut}</div>
              <div>Total Amount: ${Number(verifiedData.total).toFixed(2)}</div>
            </div>
          )}
        </>
      )}

      {error && (
        <div style={{ background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca", borderRadius: 8, padding: 12, marginBottom: 12 }}>{error}</div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <div>
          <label>Card Number</label>
          <input name="cardNumber" value={formData.cardNumber} onChange={handleChange} placeholder="1234 5678 9012 3456" required disabled={loading || verifying || !!verifyError} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }} />
        </div>
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
          <div>
            <label>Expiration (MM/YY)</label>
            <input name="expirationDate" value={formData.expirationDate} onChange={handleChange} placeholder="MM/YY" required disabled={loading || verifying || !!verifyError} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }} />
          </div>
          <div>
            <label>CVV</label>
            <input name="cardCode" value={formData.cardCode} onChange={handleChange} placeholder="123" required disabled={loading || verifying || !!verifyError} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }} />
          </div>
        </div>
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
          <div>
            <label>First Name</label>
            <input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="John" required disabled={loading || verifying || !!verifyError} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }} />
          </div>
          <div>
            <label>Last Name</label>
            <input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Doe" required disabled={loading || verifying || !!verifyError} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" onClick={() => router.back()} disabled={loading} style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #ddd", background: "#fff" }}>Back</button>
          <button 
            type="submit" 
            disabled={loading || verifying || !!verifyError || !verifiedData} 
            style={{ 
              padding: "10px 16px", 
              borderRadius: 8, 
              border: "none", 
              background: (loading || verifying || !!verifyError || !verifiedData) ? "#9ca3af" : "#2E5C9A", 
              color: "#fff", 
              fontWeight: 600,
              cursor: (loading || verifying || !!verifyError || !verifiedData) ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Processing..." : verifying ? "Verifying..." : `Pay $${Number(amount).toFixed(2)}`}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div style={{ maxWidth: 720, margin: "40px auto", padding: 20 }}><p>Loading payment form...</p></div>}>
      <PaymentPageInner />
    </Suspense>
  );
}
