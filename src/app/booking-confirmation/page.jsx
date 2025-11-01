"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Breadcrumb from "@/app/components/Breadcrumb/Breadcrumb";
import styles from "@/app/checkout/checkout.module.css";

export default function BookingConfirmationPage() {
  const sp = useSearchParams();
  const reservationId = sp.get("reservation_id") || "";
  const [data, setData] = useState({ reservation: null, guest: null, quote: null });
  const paidParam = sp.get("paid");
  const [paymentCompleted, setPaymentCompleted] = useState(paidParam === '1');
  const pdfRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("lodgix_latest_reservation");
      if (raw) {
        const parsed = JSON.parse(raw);
        setData({ reservation: parsed.reservation || null, guest: parsed.guest || null, quote: parsed.quote || null });
        console.log("Thank you page data:", parsed);
      }
    } catch {}
  }, []);

  const money = (v) => (Number(v || 0)).toLocaleString(undefined, { style: "currency", currency: "USD" });

  const summary = useMemo(() => {
    const q = data.quote || {};
    const subtotal = q.reservation_net ?? q.base_rate ?? q.discounted_rent_rental_charges ?? q.net ?? 0;
    const taxes = q.taxes ?? q.total_tax ?? 0;
    const fees = q.fees ?? q.total_fees ?? q.fees_net ?? 0;
    const discount = Math.abs(Number(q.discount || 0));
    const total = Number(q.gross ?? q.total ?? (Number(subtotal) + Number(taxes) + Number(fees) - discount));
    const depositAmount = (total * 0.05); // 5% of total
    // compute nights from reservation dates
    let nights = 0;
    try {
      const fd = data?.reservation?.from_date;
      const td = data?.reservation?.to_date;
      if (fd && td) {
        const d1 = new Date(fd);
        const d2 = new Date(td);
        const ms = d2.setHours(0,0,0,0) - d1.setHours(0,0,0,0);
        nights = Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
      }
    } catch {}
    return { subtotal, taxes, fees, discount, total, nights, depositAmount };
  }, [data.quote, data.reservation]);

  const handleDownloadInvoice = async () => {
    if (downloading) return;
    try {
      setDownloading(true);
      const loadScript = (src) => new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src='${src}']`);
        if (existing) { resolve(); return; }
        const s = document.createElement('script');
        s.src = src;
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error('Failed to load ' + src));
        document.body.appendChild(s);
      });
      if (!window.html2canvas) {
        await loadScript('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js');
      }
      if (!window.jspdf || !window.jspdf.jsPDF) {
        await loadScript('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js');
      }
      const el = pdfRef.current;
      if (!el) return;
      const canvas = await window.html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = canvas.height * (imgWidth / canvas.width);
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
      while (heightLeft > 0) {
        pdf.addPage();
        position = position - pageHeight;
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }
      const id = reservationId || data.reservation?.id || data.reservation?.reservation_number || 'invoice';
      pdf.save(`MOS_Invoice_${id}.pdf`);
    } catch {}
    finally { setDownloading(false); }
  };

  const handlePaymentSuccess = () => {};

  return (
    <div className={styles.pageWrap}>
      <Breadcrumb
        title="Thank You"
        breadcrumbs={[
          { name: 'Home', link: '/', active: false },
          { name: 'Checkout', link: '/checkout', active: false },
          { name: 'Confirmation', link: '#', active: true },
        ]}
      />

      <div className={styles.content} ref={pdfRef}>
        <div className={styles.mainCol}>
          <div className={styles.successBox}>
            <div className={styles.successTitle}>Thank you! Your reservation has been received.</div>
            <div className={styles.successDetails}>
              {reservationId ? (
                <div>Confirmation Number: <strong>{reservationId}</strong></div>
              ) : (
                <div>Confirmation Number: <strong>{data.reservation?.id || data.reservation?.reservation_number || '-'}</strong></div>
              )}
              <div style={{ marginTop: 6, color: paymentCompleted ? '#065F46' : '#92400E', background: paymentCompleted ? '#D1FAE5' : '#FEF3C7', border: `1px solid ${paymentCompleted ? '#A7F3D0' : '#FDE68A'}`, padding: '8px 10px', borderRadius: 8 }}>
                Payment Status: <strong>{paymentCompleted ? 'Paid' : 'Pending'}</strong>
              </div>
            </div>
          </div>

          <div className="panel panel-default" style={{ borderRadius: 12 }}>
            <div className="panel-heading" style={{ background:'#2E5C9A', color:'#fff', borderTopLeftRadius:12, borderTopRightRadius:12 }}>
              <h3 className="panel-title">Booking Details</h3>
            </div>
            <div className="panel-body">
              <div className="row">
                <div className="col-sm-6">
                  <div><strong>Guest</strong></div>
                  <div>{data.guest?.first_name} {data.guest?.last_name}</div>
                  <div>{data.guest?.email}</div>
                  <div>{data.guest?.address1} {data.guest?.address2}</div>
                  <div>{data.guest?.city} {data.guest?.state} {data.guest?.zip}</div>
                  <div>{data.guest?.country}</div>
                </div>
                <div className="col-sm-6">
                  <div><strong>Stay</strong></div>
                  <div>Check-in: {data.reservation?.from_date || '-'}</div>
                  <div>Check-out: {data.reservation?.to_date || '-'}</div>
                  <div>Nights: {summary.nights}</div>
                  <div>Guests: {Number(data.reservation?.adults ?? 0)} Adults, {Number(data.reservation?.children ?? 0)} Children, {Number(data.reservation?.pets ?? 0)} Pets</div>
                  <div>Property: #{data.reservation?.entities?.[0]?.property_id || '-'}</div>
                </div>
              </div>
              <hr />
              <div className="row">
                <div className="col-sm-6">
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>Pricing</div>
                  <div>Subtotal: {money(summary.subtotal)}</div>
                  <div>Taxes: {money(summary.taxes)}</div>
                  <div>Fees: {money(summary.fees)}</div>
                  <div>Discount: -{money(summary.discount)}</div>
                  <div style={{ fontWeight: 700, marginTop: 8 }}>Total: {money(summary.total)}</div>
                </div>
                <div className="col-sm-6">
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>Next Steps</div>
                  {paymentCompleted ? (
                    <div style={{ color: '#065F46' }}>
                      <div>✓ Payment completed successfully!</div>
                      <div>Your booking is confirmed.</div>
                    </div>
                  ) : (
                    <>
                      <div style={{ marginBottom: 12 }}>Complete your 5% deposit payment to secure your booking.</div>
                      <a 
                        href={`/payment?reservation_id=${encodeURIComponent(reservationId || data.reservation?.id || data.reservation?.reservation_number || '')}`}
                        style={{
                          background: 'linear-gradient(135deg, #2E5C9A 0%, #1e40af 100%)',
                          color: 'white',
                          border: 'none',
                          padding: '12px 24px',
                          borderRadius: '8px',
                          fontSize: '16px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(46, 92, 154, 0.3)',
                          transition: 'all 0.3s',
                          display: 'inline-block',
                          textDecoration: 'none'
                        }}
                        onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                        onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                      >
                        Pay Deposit ({money(summary.depositAmount)})
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display:'flex', gap: 10 }}>
            <button className={styles.secondaryBtn} onClick={handleDownloadInvoice} disabled={downloading}>{downloading ? 'Preparing…' : 'Download PDF Invoice'}</button>
            <a className={styles.secondaryBtn} href="/" style={{ textDecoration: 'none' }}>Back to Home</a>
          </div>
        </div>

        <aside className={styles.sideCol}>
          <div className={styles.summaryBox}>
            <div className={styles.summaryHeader}>Summary</div>
            <div className={styles.summaryBody}>
              <div className={styles.summaryRow}><span>Confirmation</span><span>{reservationId || data.reservation?.id || '-'}</span></div>
              <div className={styles.summaryRow}><span>Check-in</span><span>{data.reservation?.from_date || '-'}</span></div>
              <div className={styles.summaryRow}><span>Check-out</span><span>{data.reservation?.to_date || '-'}</span></div>
              <div className={styles.summaryRow}><span>Nights</span><span>{summary.nights}</span></div>
              <div className={styles.summaryRow}><span>Guests</span><span>{Number(data.reservation?.adults ?? 0)} Adults, {Number(data.reservation?.children ?? 0)} Children, {Number(data.reservation?.pets ?? 0)} Pets</span></div>
              <hr className={styles.hr} />
              <div className={styles.summaryRow}><span>Total</span><span className={styles.total}>{money(summary.total)}</span></div>
              <div className={styles.summaryRow} style={{ background: '#f0f9ff', padding: '8px', borderRadius: '6px', marginTop: '8px' }}>
                <span style={{ fontWeight: 600 }}>Deposit (5%)</span>
                <span style={{ fontWeight: 700, color: '#2E5C9A' }}>{money(summary.depositAmount)}</span>
              </div>
              <div className={styles.info} style={{ marginTop: 12 }}>
                {paymentCompleted ? 'Payment completed. Your booking is confirmed!' : 'Payment pending. A payment link will be sent via email.'}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Payment handled on dedicated /payment page */}
    </div>
  );
}
