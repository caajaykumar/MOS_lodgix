"use client";

import Image from "next/image";
import ShareButton from "./ShareButton";

export default function PromoBanner({
  title = "Complete Your Booking",
  subtitle = "Review your details and confirm your reservation in one simple step.",
  logoSrc = "https://stssevastorage.blob.core.windows.net/myorlandostay/mylogo.png",
  buttonType = "linkedin",
  buttonHref = "https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fmyorlandostay.com",
}) {
  return (
    <div style={{
      width: '100%',
      borderRadius: 12,
      background: "linear-gradient(90deg, #115E59, #0EA5E9)",
      color: '#fff',
      padding: 20,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 12px 30px rgba(0,0,0,0.2)'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 24, fontWeight: 800 }}>{title}</div>
        <div style={{ opacity: 0.95 }}>{subtitle}</div>
        <div style={{ marginTop: 8 }}>
          <ShareButton type={buttonType} href={buttonHref} />
        </div>
      </div>

      {/* <div style={{ position: 'relative', width: 220, height: 120, flexShrink: 0 }}>
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 12, background: 'rgba(255,255,255,0.1)',
          transform: 'rotate(-4deg)',
        }}></div>
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 12, background: 'rgba(255,255,255,0.12)',
          transform: 'rotate(2deg) translateY(6px)',
        }}></div>
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 12, background: '#0B3B4B', display: 'flex',
          alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
        }}>
          <Image src={logoSrc} alt="Brand" width={180} height={60} style={{ objectFit: 'contain' }} />
        </div>
      </div> */}
    </div>
  );
}
