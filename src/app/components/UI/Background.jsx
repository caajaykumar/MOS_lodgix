"use client";
export default function Background({
  title = "Complete Your Booking",
  subtitle = "Review your details and confirm your reservation in one simple step.",
//   logoSrc = "https://stssevastorage.blob.core.windows.net/myorlandostay/mylogo.png",
//   buttonType = "linkedin",
//   buttonHref = "https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fmyorlandostay.com",
}) {
  return (
    <div style={{
      width: '100%',
      borderRadius: 16,
      background: "linear-gradient(90deg, #115E59, #0EA5E9)",
      color: '#fff',
      padding: 18,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 12px 30px rgba(0,0,0,0.2)'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 24, fontWeight: 800 }}>{title}</div>
        <div style={{ opacity: 0.95 }}>{subtitle}</div>
        <div style={{ marginTop: 8 }}>
         
        </div>
      </div>

      
    </div>
  );
}
