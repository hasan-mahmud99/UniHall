import React, { useEffect, useMemo, useState } from "react";

const EVENT_NAME = "uh:toast";

function classForType(type) {
  if (type === "success") return "bg-emerald-600";
  if (type === "error") return "bg-rose-600";
  return "bg-slate-800";
}

function iconForType(type) {
  if (type === "success") return "✓";
  if (type === "error") return "✕";
  return "i";
}

export default function ToastHost() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    function onToast(e) {
      const detail = e?.detail || {};
      const id = crypto?.randomUUID ? crypto.randomUUID() : String(Date.now());
      const toast = {
        id,
        type: detail.type || "info",
        message: String(detail.message || ""),
        durationMs:
          typeof detail.durationMs === "number" ? detail.durationMs : 3500,
      };

      setToasts((prev) => [toast, ...prev].slice(0, 4));

      const ms = Math.max(1200, toast.durationMs);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, ms);
    }

    window.addEventListener(EVENT_NAME, onToast);
    return () => window.removeEventListener(EVENT_NAME, onToast);
  }, []);

  const visible = useMemo(() => toasts.filter((t) => t.message), [toasts]);
  if (visible.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 w-[min(92vw,520px)]">
      {visible.map((t) => (
        <div
          key={t.id}
          className={`${classForType(
            t.type
          )} text-white rounded-xl shadow-lg px-4 py-3 flex items-start gap-3`}
          role="status"
          aria-live="polite"
        >
          <div className="mt-0.5 w-7 h-7 rounded-full bg-white/15 flex items-center justify-center font-bold">
            {iconForType(t.type)}
          </div>
          <div className="flex-1 text-sm leading-snug break-words">
            {t.message}
          </div>
          <button
            type="button"
            className="text-white/90 hover:text-white text-lg leading-none"
            aria-label="Close"
            onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
