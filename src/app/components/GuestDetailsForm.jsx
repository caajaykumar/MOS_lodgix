"use client";

import { useMemo } from "react";
import styles from "@/app/checkout/checkout.module.css";
import { isEmail } from "@/utils/validation";

export default function GuestDetailsForm({ value, onChange }) {
  const v = value || {};
  const emailValid = isEmail(v.email);
  const ageValid = v.age ? Number(v.age) >= 21 : true;

  const titles = useMemo(() => ["Mr.", "Ms.", "Mrs.", "Dr."], []);

  return (
    <div className={styles.formGrid}>
      <div className={styles.rowGroup}>
        <div className={styles.colThird}>
          <div className={styles.formRow}>
            <label>Title</label>
            <select className={styles.input} value={v.title} onChange={(e) => onChange({ ...v, title: e.target.value })}>
              {titles.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
        <div className={styles.colThird}>
          <div className={styles.formRow}>
            <label>First Name</label>
            <input className={styles.input} value={v.first_name} onChange={(e) => onChange({ ...v, first_name: e.target.value })} />
          </div>
        </div>
        <div className={styles.colThird}>
          <div className={styles.formRow}>
            <label>Last Name</label>
            <input className={styles.input} value={v.last_name} onChange={(e) => onChange({ ...v, last_name: e.target.value })} />
          </div>
        </div>
      </div>

      <div className={styles.rowGroup}>
        <div className={styles.colHalf}>
          <div className={styles.formRow}>
            <label>Email</label>
            <input className={styles.input} type="email" value={v.email} onChange={(e) => onChange({ ...v, email: e.target.value })} />
            {!emailValid && v.email && <div className={styles.errorSmall}>Invalid email</div>}
          </div>
        </div>
        <div className={styles.colHalf}>
          <div className={styles.formRow}>
            <label>Confirm Email</label>
            <input className={styles.input} type="email" value={v.confirm_email} onChange={(e) => onChange({ ...v, confirm_email: e.target.value })} />
          </div>
        </div>
      </div>

      <div className={styles.rowGroup}>
        <div className={styles.colHalf}>
          <div className={styles.formRow}>
            <label>Age</label>
            <input className={styles.input} type="number" min={21} value={v.age || ""} onChange={(e) => onChange({ ...v, age: e.target.value })} />
            {v.age && !ageValid && <div className={styles.errorSmall}>Minimum age is 21</div>}
          </div>
        </div>
        <div className={styles.colHalf}>
          <div className={styles.formRow}>
            <label>Mobile Phone</label>
            <input className={styles.input} value={v.phone} onChange={(e) => onChange({ ...v, phone: e.target.value })} />
          </div>
        </div>
      </div>
    </div>
  );
}
