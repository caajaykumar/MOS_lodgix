'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({
  open = false,
  onClose = () => {},
  title = '',
  ariaLabelledById = 'modal-title',
  children,
  widthClass = 'max-w-xl', // kept for API compatibility; not used by CSS fallback
}) {
  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, [open]);

  // Close on escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || typeof window === 'undefined') return null;

  return createPortal(
    <div
      className="modal-overlay"
      aria-modal="true"
      role="dialog"
      aria-labelledby={ariaLabelledById}
      onClick={onClose}
    >
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-paw">🐾</div>
          <h3 id={ariaLabelledById} className="modal-title">{title}</h3>
          <button type="button" aria-label="Close" className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
      <style jsx>{`
        .modal-overlay { position: fixed; inset: 0; z-index: 1050; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,.5); }
        .modal-dialog { position: relative; width: 100%; max-width: 640px; margin: 0 16px; background: #fff; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,.25); overflow: hidden; animation: modalPop .15s ease-out; }
        .modal-header { position: relative; padding: 18px 20px 20px; background: linear-gradient(90deg, #2563eb, #4f46e5); text-align: center; }
        .modal-title { margin: 0; color: #fff; font-weight: 600; font-size: 18px; }
        .modal-paw { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); font-size: 28px; user-select: none; }
        .modal-close { position: absolute; top: 8px; right: 10px; height: 32px; width: 32px; border: 0; border-radius: 999px; background: rgba(255,255,255,.9); color: #475569; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,.15); }
        .modal-close:hover { background: #fff; color: #111827; }
        .modal-body { padding: 20px; color: #374151; font-size: 15px; line-height: 1.6; }
        @keyframes modalPop { from { transform: translateY(2px) scale(.98); opacity:.9 } to { transform: translateY(0) scale(1); opacity:1 } }
        @media (max-width: 480px) { .modal-dialog { margin: 0 12px; border-radius: 12px; } }
      `}</style>
    </div>,
    document.body
  );
}
