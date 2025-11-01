"use client";

import { useState, useEffect } from "react";

export default function BookingModal({
  open,
  onClose,
  property,
  searchCriteria,
}) {
  const [step, setStep] = useState("guest"); // guest | reserve | done
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [guest, setGuest] = useState({
    first_name: "",
    last_name: "",
    email: "",
    title: "",
    company: "myorlandostay_website",
    address: {
      address1: "",
      address2: "",
      city: "",
      state: "",
      zip: "",
      country: "US",
      phone: "",
    },
  });

  const [reservation, setReservation] = useState({
    from_date: searchCriteria?.from_date || "",
    to_date: searchCriteria?.to_date || "",
    adults: Number(searchCriteria?.guests || 2),
    children: 0,
    pets: 0,
    guest_id: 0,
    stay_type: "GUEST",
    property_id: property?.id || 0,
    room_ids: [],
  });

  useEffect(() => {
    // Sync when property or search criteria change
    setReservation((prev) => ({
      ...prev,
      from_date: searchCriteria?.from_date || prev.from_date,
      to_date: searchCriteria?.to_date || prev.to_date,
      adults: Number(searchCriteria?.guests || prev.adults || 2),
      property_id: property?.id || 0,
    }));
  }, [property, searchCriteria]);

  if (!open) return null;

  const updateGuest = (path, value) => {
    if (path.startsWith("address.")) {
      const k = path.split(".")[1];
      setGuest((g) => ({ ...g, address: { ...g.address, [k]: value } }));
    } else {
      setGuest((g) => ({ ...g, [path]: value }));
    }
  };

  const updateReservation = (key, value) => {
    setReservation((r) => ({ ...r, [key]: value }));
  };

  const validateGuest = () => {
    if (!guest.first_name || !guest.last_name) return "First and last name are required";
    if (!guest.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest.email)) return "A valid email is required";
    return null;
  };

  const validateReservation = () => {
    if (!reservation.from_date) return "Check-in is required";
    if (!reservation.to_date) return "Check-out is required";
    if (new Date(reservation.from_date) >= new Date(reservation.to_date)) return "Check-out must be after check-in";
    if (!reservation.property_id) return "Property is required";
    if (!reservation.guest_id) return "Guest must be created first";
    return null;
  };

  const handleCreateGuestAndReservation = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Step 1: Create Guest
    const gerr = validateGuest();
    if (gerr) {
      setError(gerr);
      return;
    }

    setLoading(true);
    setStep("guest");
    try {
      const resp = await fetch("/api/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(guest),
      });
      const gdata = await resp.json();
      if (!resp.ok || !gdata.success) {
        throw new Error(gdata?.details?.message || gdata.error || "Failed to create guest");
      }

      const newGuestId = gdata?.data?.id;
      if (!newGuestId) {
        throw new Error("Guest created but no ID returned");
      }

      setReservation((r) => ({ ...r, guest_id: newGuestId }));
      setStep("reserve");

      // Step 2: Create Reservation
      const rerr = validateReservation();
      if (rerr) {
        throw new Error(rerr);
      }

      const reservationPayload = {
        from_date: reservation.from_date,
        to_date: reservation.to_date,
        adults: Number(reservation.adults) || 0,
        children: Number(reservation.children) || 0,
        pets: Number(reservation.pets) || 0,
        guest_id: newGuestId,
        stay_type: reservation.stay_type,
        entities: [
          {
            property_id: Number(reservation.property_id),
            room_ids: Array.isArray(reservation.room_ids) ? reservation.room_ids : [],
          },
        ],
      };

      const rresp = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reservationPayload),
      });
      const rdata = await rresp.json();
      if (!rresp.ok || !rdata.success) {
        throw new Error(rdata?.details?.message || rdata.error || "Failed to create reservation");
      }

      setSuccess("Reservation created successfully!");
      setStep("done");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const Overlay = () => (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.45)",
      zIndex: 1000,
    }} />
  );

  return (
    <>
      <Overlay />
      <div role="dialog" aria-modal="true" style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        background: "#fff",
        width: "min(860px, 96vw)",
        maxHeight: "90vh",
        overflow: "auto",
        borderRadius: 8,
        boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
        zIndex: 1001,
      }}>
        <div className="modal-header" style={{ padding: 16, borderBottom: "1px solid #eee" }}>
          <h4 style={{ margin: 0 }}>
            {step === "done" ? "Booking Confirmed" : "Complete Your Booking"}
          </h4>
          <button type="button" className="close" aria-label="Close" onClick={onClose} disabled={loading}>
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <form onSubmit={handleCreateGuestAndReservation}>
          <div className="modal-body" style={{ padding: 16 }}>
            {property && (
              <div className="alert alert-info" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span className="glyphicon glyphicon-home" />
                <div>
                  <strong>{property.name || `Property ${property.id}`}</strong>
                  <div className="text-muted">
                    {reservation.from_date || "?"} to {reservation.to_date || "?"} · {reservation.adults} guests
                  </div>
                </div>
              </div>
            )}

            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {step !== "done" && (
              <>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>First name</label>
                      <input className="form-control" value={guest.first_name} onChange={(e) => updateGuest("first_name", e.target.value)} required />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Last name</label>
                      <input className="form-control" value={guest.last_name} onChange={(e) => updateGuest("last_name", e.target.value)} required />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Email</label>
                      <input type="email" className="form-control" value={guest.email} onChange={(e) => updateGuest("email", e.target.value)} required />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Phone</label>
                      <input className="form-control" value={guest.address.phone} onChange={(e) => updateGuest("address.phone", e.target.value)} />
                    </div>
                  </div>
                  <div className="col-md-8">
                    <div className="form-group">
                      <label>Address 1</label>
                      <input className="form-control" value={guest.address.address1} onChange={(e) => updateGuest("address.address1", e.target.value)} />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <label>Address 2</label>
                      <input className="form-control" value={guest.address.address2} onChange={(e) => updateGuest("address.address2", e.target.value)} />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <label>City</label>
                      <input className="form-control" value={guest.address.city} onChange={(e) => updateGuest("address.city", e.target.value)} />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <label>State/Region</label>
                      <input className="form-control" value={guest.address.state} onChange={(e) => updateGuest("address.state", e.target.value)} />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <label>ZIP</label>
                      <input className="form-control" value={guest.address.zip} onChange={(e) => updateGuest("address.zip", e.target.value)} />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Country</label>
                      <input className="form-control" value={guest.address.country} onChange={(e) => updateGuest("address.country", e.target.value)} />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Adults</label>
                      <input type="number" min="0" className="form-control" value={reservation.adults} onChange={(e) => updateReservation("adults", e.target.value)} />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Children</label>
                      <input type="number" min="0" className="form-control" value={reservation.children} onChange={(e) => updateReservation("children", e.target.value)} />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Pets</label>
                      <input type="number" min="0" className="form-control" value={reservation.pets} onChange={(e) => updateReservation("pets", e.target.value)} />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Check-in</label>
                      <input type="date" className="form-control" value={reservation.from_date} onChange={(e) => updateReservation("from_date", e.target.value)} />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Check-out</label>
                      <input type="date" className="form-control" value={reservation.to_date} onChange={(e) => updateReservation("to_date", e.target.value)} />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="modal-footer" style={{ padding: 16, borderTop: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="text-muted">
              {loading ? (
                <>
                  <span className="glyphicon glyphicon-refresh" style={{ animation: "spin 1s linear infinite", marginRight: 6 }} />
                  {step === "guest" ? "Creating guest..." : step === "reserve" ? "Creating reservation..." : "Processing..."}
                </>
              ) : step === "done" ? (
                "All set!"
              ) : (
                "Enter guest details to continue"
              )}
            </div>
            <div>
              <button type="button" className="btn btn-default" onClick={onClose} disabled={loading}>Cancel</button>
              {step === "done" ? (
                <button type="button" className="btn btn-primary" onClick={onClose}>Close</button>
              ) : (
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Processing..." : "Book Now"}
                </button>
              )}
            </div>
          </div>
        </form>

        <style jsx>{`
          @keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }
        `}</style>
      </div>
    </>
  );
}
