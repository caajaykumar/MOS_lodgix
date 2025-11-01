"use client";

export const ShareTypes = {
  linkedin: "linkedin",
  twitter: "twitter",
  facebook: "facebook",
  copy: "copy",
};

export default function ShareButton({ type = "linkedin", href = "#", onClick, children }) {
  const presets = {
    linkedin: {
      bg: "#FCD34D",
      color: "#1F2937",
      label: "Share on LinkedIn",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="#0A66C2" style={{ marginRight: 8 }}>
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.038-1.852-3.038-1.853 0-2.136 1.447-2.136 2.942v5.665H9.352V9h3.414v1.561h.049c.476-.9 1.637-1.852 3.367-1.852 3.6 0 4.265 2.37 4.265 5.455v6.288zM5.337 7.433a2.062 2.062 0 11.001-4.124 2.062 2.062 0 01-.001 4.124zM6.994 20.452H3.679V9h3.315v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      )
    },
    twitter: {
      bg: "#E0F2FE",
      color: "#0C4A6E",
      label: "Share on X/Twitter",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="#1DA1F2" style={{ marginRight: 8 }}>
          <path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.16 4.16 0 001.82-2.3 8.27 8.27 0 01-2.63 1.01 4.14 4.14 0 00-7.06 3.77A11.75 11.75 0 013 4.79a4.14 4.14 0 001.28 5.53c-.64-.02-1.25-.2-1.79-.49v.05a4.14 4.14 0 003.32 4.06c-.3.08-.61.12-.94.12-.23 0-.45-.02-.67-.06a4.15 4.15 0 003.86 2.86A8.31 8.31 0 012 19.54a11.73 11.73 0 006.35 1.86c7.62 0 11.79-6.31 11.79-11.79 0-.18 0-.35-.01-.53A8.42 8.42 0 0024 6.56a8.2 8.2 0 01-2.35.64 4.12 4.12 0 001.81-2.27z"/>
        </svg>
      )
    },
    facebook: {
      bg: "#E8F0FE",
      color: "#1F2937",
      label: "Share on Facebook",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="#1877F2" style={{ marginRight: 8 }}>
          <path d="M22.675 0h-21.35C.595 0 0 .595 0 1.326v21.348C0 23.405.595 24 1.326 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.917.001c-1.504 0-1.796.715-1.796 1.764v2.313h3.592l-.468 3.622h-3.124V24h6.127C23.405 24 24 23.405 24 22.674V1.326C24 .595 23.405 0 22.675 0z"/>
        </svg>
      )
    },
    copy: {
      bg: "#F3F4F6",
      color: "#111827",
      label: "Copy Link",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="#6B7280" style={{ marginRight: 8 }}>
          <path d="M16 8a3 3 0 00-2.121.879l-1.415 1.414a1 1 0 11-1.414-1.414l1.414-1.414A5 5 0 1121 10l-2 2a5 5 0 11-7.071-7.071l1.415-1.415A7 7 0 1023 10l-2 2a7 7 0 11-9.9-9.9l1.414-1.414A3 3 0 0016 2z"/>
        </svg>
      )
    },
  };

  const cfg = presets[type] || presets.linkedin;
  const label = children || cfg.label;

  const commonStyle = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    backgroundColor: cfg.bg,
    color: cfg.color,
    padding: '10px 16px',
    borderRadius: 8,
    fontWeight: 700,
    textDecoration: 'none',
    border: '1px solid rgba(0,0,0,0.05)',
    boxShadow: '0 6px 14px rgba(0,0,0,0.12)',
    cursor: 'pointer'
  };

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick} style={commonStyle}>
        {cfg.icon}
        <span>{label} <span style={{ marginLeft: 4 }}>🎉</span></span>
      </a>
    );
  }
  return (
    <button onClick={onClick} style={commonStyle}>
      {cfg.icon}
      <span>{label} <span style={{ marginLeft: 4 }}>🎉</span></span>
    </button>
  );
}
