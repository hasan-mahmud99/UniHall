import React, { useEffect, useMemo, useState } from "react";
import apiClient from "../../lib/apiClient.js";

const PUBLIC_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ||
  "http://localhost:5000";

const toPublicUrl = (raw) => {
  if (!raw) return "";
  const value = String(raw);
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/")) return `${PUBLIC_BASE_URL}${value}`;
  return `${PUBLIC_BASE_URL}/${value}`;
};

export default function Notices() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const limit = 5;
  const [total, setTotal] = useState(0);

  const totalPages = useMemo(() => {
    const pages = Math.ceil((Number(total) || 0) / limit);
    return Math.max(1, pages || 1);
  }, [total]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await apiClient.get("/notifications", {
          params: { limit, page },
        });
        if (cancelled) return;
        setItems(res.data?.data || []);
        setTotal(Number(res.data?.pagination?.total || 0));
      } catch (e) {
        if (!cancelled) {
          setItems([]);
          setTotal(0);
          setError(e?.response?.data?.message || "Failed to load notices");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [page]);

  // Clamp page if total changes
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const goTo = (p) => {
    const n = Math.min(totalPages, Math.max(1, p));
    setPage(n);
  };

  const pageButtons = useMemo(() => {
    const pages = [];
    const maxButtons = 7;
    const start = Math.max(1, page - Math.floor(maxButtons / 2));
    const end = Math.min(totalPages, start + maxButtons - 1);
    const adjustedStart = Math.max(1, end - maxButtons + 1);
    for (let p = adjustedStart; p <= end; p++) pages.push(p);
    return pages;
  }, [page, totalPages]);

  return (
    <div
      className="grid gap-6"
      style={{
        backgroundColor: "#013A63",
        padding: "1.5rem",
        borderRadius: "0.5rem",
      }}
    >
      <div className="border rounded p-4" style={{ backgroundColor: "#2c7da0" }}>
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="font-semibold text-lg text-white">📢 Notices</h2>
            <p className="text-sm text-white opacity-90">
              Page {page} of {totalPages}
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm mb-3">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-white text-center py-4">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-white text-center py-4">No notices</p>
        ) : (
          <div className="space-y-3">
            {items.map((n) => (
              <div
                key={n.id}
                className="p-3 rounded-lg border border-gray-300 bg-white shadow-md"
              >
                <h3 className="font-semibold text-gray-900">{n.title}</h3>
                <p className="text-sm mt-1 text-gray-800">{n.body}</p>
                {n.attachment?.url && (
                  <a
                    href={toPublicUrl(n.attachment.url)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-sky-700 hover:text-sky-800 underline mt-2 inline-block"
                  >
                    Download: {n.attachment?.name || "Attachment"}
                  </a>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
          <button
            className="px-3 py-1.5 rounded bg-white text-gray-900 text-sm disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => goTo(page - 1)}
          >
            Previous
          </button>

          <div className="flex items-center gap-2 flex-wrap justify-center">
            {pageButtons.map((p) => (
              <button
                key={p}
                onClick={() => goTo(p)}
                className={
                  p === page
                    ? "px-3 py-1.5 rounded bg-indigo-600 text-white text-sm"
                    : "px-3 py-1.5 rounded bg-white text-gray-900 text-sm"
                }
              >
                {p}
              </button>
            ))}
          </div>

          <button
            className="px-3 py-1.5 rounded bg-white text-gray-900 text-sm disabled:opacity-50"
            disabled={page >= totalPages}
            onClick={() => goTo(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
