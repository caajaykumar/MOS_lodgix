"use client";

import { useState } from "react";
import styles from "./PaymentModal.module.css";

export default function PaymentModal({ isOpen, onClose, amount, reservationId, onSuccess }) {
  const [formData, setFormData] = useState({
    cardNumber: "",
    expirationDate: "",
    cardCode: "",
    firstName: "",
    lastName: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format card number (add spaces every 4 digits)
    if (name === "cardNumber") {
      formattedValue = value.replace(/\s/g, "").replace(/(\d{4})/g, "$1 ").trim();
      if (formattedValue.replace(/\s/g, "").length > 16) return;
    }

    // Format expiration date (MM/YY)
    if (name === "expirationDate") {
      formattedValue = value.replace(/\D/g, "");
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.slice(0, 2) + "/" + formattedValue.slice(2, 4);
      }
      if (formattedValue.length > 5) return;
    }

    // Format CVV (3-4 digits only)
    if (name === "cardCode") {
      formattedValue = value.replace(/\D/g, "");
      if (formattedValue.length > 4) return;
    }

    setFormData({ ...formData, [name]: formattedValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate form
      const cardNumberClean = formData.cardNumber.replace(/\s/g, "");
      const expirationDateClean = formData.expirationDate.replace(/\//g, "");

      if (cardNumberClean.length < 13 || cardNumberClean.length > 16) {
        throw new Error("Invalid card number");
      }

      if (expirationDateClean.length !== 4) {
        throw new Error("Invalid expiration date (use MM/YY format)");
      }

      if (formData.cardCode.length < 3 || formData.cardCode.length > 4) {
        throw new Error("Invalid CVV");
      }

      if (!formData.firstName || !formData.lastName) {
        throw new Error("Please enter cardholder name");
      }

      // Format expiration date for Authorize.Net (MMYY)
      const expirationMonth = expirationDateClean.slice(0, 2);
      const expirationYear = expirationDateClean.slice(2, 4);
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;

      if (parseInt(expirationMonth) < 1 || parseInt(expirationMonth) > 12) {
        throw new Error("Invalid expiration month");
      }

      if (parseInt(expirationYear) < currentYear || 
          (parseInt(expirationYear) === currentYear && parseInt(expirationMonth) < currentMonth)) {
        throw new Error("Card has expired");
      }

      // Send payment request
      const response = await fetch("/api/payment/authorize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cardNumber: cardNumberClean,
          expirationDate: expirationDateClean,
          cardCode: formData.cardCode,
          amount: parseFloat(amount).toFixed(2),
          firstName: formData.firstName,
          lastName: formData.lastName,
          reservationId: reservationId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Payment failed");
      }

      // Payment successful
      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess(data);
        onClose();
      }, 2000);

    } catch (err) {
      setError(err.message || "Payment processing failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Secure Payment</h2>
          <button className={styles.closeBtn} onClick={onClose} disabled={loading}>
            ×
          </button>
        </div>

        {success ? (
          <div className={styles.successMessage}>
            <div className={styles.successIcon}>✓</div>
            <h3>Payment Successful!</h3>
            <p>Your 5% deposit has been processed successfully.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.amountBox}>
              <div className={styles.amountLabel}>Deposit Amount (5%)</div>
              <div className={styles.amountValue}>${parseFloat(amount).toFixed(2)}</div>
            </div>

            {error && (
              <div className={styles.errorBox}>
                {error}
              </div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="cardNumber">Card Number</label>
              <input
                type="text"
                id="cardNumber"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleChange}
                placeholder="1234 5678 9012 3456"
                required
                disabled={loading}
                className={styles.input}
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="expirationDate">Expiration Date</label>
                <input
                  type="text"
                  id="expirationDate"
                  name="expirationDate"
                  value={formData.expirationDate}
                  onChange={handleChange}
                  placeholder="MM/YY"
                  required
                  disabled={loading}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="cardCode">CVV</label>
                <input
                  type="text"
                  id="cardCode"
                  name="cardCode"
                  value={formData.cardCode}
                  onChange={handleChange}
                  placeholder="123"
                  required
                  disabled={loading}
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  required
                  disabled={loading}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  required
                  disabled={loading}
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.securityNote}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1l6 2v4.5c0 3.5-2.5 6.5-6 7.5-3.5-1-6-4-6-7.5V3l6-2zm0 1.5L3 4v4.5c0 2.8 2 5.2 5 6 3-.8 5-3.2 5-6V4l-5-1.5z"/>
              </svg>
              Your payment information is encrypted and secure
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? "Processing..." : `Pay $${parseFloat(amount).toFixed(2)}`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
