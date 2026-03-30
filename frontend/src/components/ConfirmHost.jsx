import React, { useEffect, useState } from "react";

const EVENT_NAME = "uh:confirm";

export default function ConfirmHost() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState({
    title: "Confirm",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    danger: false,
    resolve: null,
  });

  useEffect(() => {
    function onConfirm(e) {
      const d = e?.detail || {};
      setState({
        title: d.title || "Confirm",
        message: String(d.message || ""),
        confirmText: d.confirmText || "Confirm",
        cancelText: d.cancelText || "Cancel",
        danger: Boolean(d.danger),
        resolve: typeof d.resolve === "function" ? d.resolve : null,
      });
      setOpen(true);
    }

    window.addEventListener(EVENT_NAME, onConfirm);
    return () => window.removeEventListener(EVENT_NAME, onConfirm);
  }, []);

  useEffect(() => {
    function onKeyDown(e) {
      if (!open) return;
      if (e.key === "Escape") {
        e.preventDefault();
        close(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const close = (value) => {
    try {
      state.resolve?.(value);
    } finally {
      setOpen(false);
      setState((prev) => ({ ...prev, resolve: null }));
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={state.title}
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => close(false)}
      />
      <div className="relative w-[min(92vw,520px)] rounded-2xl bg-white shadow-2xl border border-slate-200">
        <div className="p-5">
          <div className="text-lg font-semibold text-slate-900">
            {state.title}
          </div>
          <div className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">
            {state.message}
          </div>
          <div className="mt-5 flex items-center justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50"
              onClick={() => close(false)}
            >
              {state.cancelText}
            </button>
            <button
              type="button"
              className={
                state.danger
                  ? "px-4 py-2 rounded-lg bg-rose-600 text-white text-sm font-medium hover:bg-rose-700"
                  : "px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
              }
              onClick={() => close(true)}
            >
              {state.confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
