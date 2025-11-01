"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

export default function GlobalLoader({ isVisible = false, text = "Loading booking details..." }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    try {
      if (isVisible) document.body.style.cursor = 'wait';
      else document.body.style.cursor = '';
    } catch {}
    return () => { try { document.body.style.cursor = ''; } catch {} };
  }, [isVisible]);

  // Lock body scroll while loader is visible
  useEffect(() => {
    try {
      if (isVisible) {
        const prev = document.body.style.overflow;
        document.body.dataset.prevOverflow = prev;
        document.body.style.overflow = 'hidden';
      } else if (document.body.dataset.prevOverflow !== undefined) {
        document.body.style.overflow = document.body.dataset.prevOverflow;
        delete document.body.dataset.prevOverflow;
      }
    } catch {}
    return () => {
      try {
        if (document.body.dataset.prevOverflow !== undefined) {
          document.body.style.overflow = document.body.dataset.prevOverflow;
          delete document.body.dataset.prevOverflow;
        } else {
          document.body.style.overflow = '';
        }
      } catch {}
    };
  }, [isVisible]);

  if (!mounted || !isVisible) return null;

  const overlay = (
    <div
      aria-live="assertive"
      aria-busy="true"
      role="status"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2147483647,
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'auto',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: '#fff' }}>
        <div
          style={{
            height: 48,
            width: 48,
            borderRadius: '50%',
            border: '4px solid rgba(255,255,255,0.35)',
            borderTopColor: '#fff',
            animation: 'spin 0.9s linear infinite'
          }}
        />
        <div style={{ fontSize: 14, fontWeight: 500 }}>{text}</div>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
