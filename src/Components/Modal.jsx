import { createPortal } from "react-dom";

/**
 * Modal genérico Dark FinTech.
 * Usa ReactDOM.createPortal para montarse directamente en <body>,
 * evitando que el containing block de CSS transforms (animate-page-enter)
 * desplace el overlay fixed.
 */
export default function Modal({ title, onClose, children }) {
  return createPortal(
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#161822] text-white w-full max-w-md rounded-3xl border border-white/[0.14] shadow-[0_25px_60px_rgba(0,0,0,0.85)] p-5 sm:p-6 space-y-4 max-h-[88dvh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <h3 className="font-bold text-white text-base tracking-wide">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] flex items-center justify-center text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <i className="fas fa-times text-xs" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}
