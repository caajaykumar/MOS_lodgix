"use client";

import styles from "@/app/checkout/checkout.module.css";

const COUNTRIES = ["India", "United States", "Canada", "United Kingdom", "Australia"];

export default function BillingAddressForm({ value, onChange }) {
  const v = value || {};
  return (
    <div className={styles.formGrid}>
      <div className={styles.rowGroup}>
        <div className={styles.colHalf}>
          <div className={styles.formRow}>
            <label>Address Line 1</label>
            <input className={styles.input} value={v.address1} onChange={(e) => onChange({ ...v, address1: e.target.value })} />
          </div>
        </div>
        <div className={styles.colHalf}>
          <div className={styles.formRow}>
            <label>Address Line 2</label>
            <input className={styles.input} value={v.address2} onChange={(e) => onChange({ ...v, address2: e.target.value })} />
          </div>
        </div>
      </div>

      <div className={styles.rowGroup}>
        <div className={styles.colHalf}>
          <div className={styles.formRow}>
            <label>Zip/Postal Code</label>
            <input className={styles.input} value={v.zip} onChange={(e) => onChange({ ...v, zip: e.target.value })} />
          </div>
        </div>
        <div className={styles.colHalf}>
          <div className={styles.formRow}>
            <label>City</label>
            <input className={styles.input} value={v.city} onChange={(e) => onChange({ ...v, city: e.target.value })} />
          </div>
        </div>
      </div>

      <div className={styles.rowGroup}>
        <div className={styles.colHalf}>
          <div className={styles.formRow}>
            <label>State/Region</label>
            <input className={styles.input} value={v.state} onChange={(e) => onChange({ ...v, state: e.target.value })} />
          </div>
        </div>
        <div className={styles.colHalf}>
          <div className={styles.formRow}>
            <label>Country</label>
            <select className={styles.input} value={v.country} onChange={(e) => onChange({ ...v, country: e.target.value })}>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
