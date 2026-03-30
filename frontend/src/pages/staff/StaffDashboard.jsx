import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import apiClient from "../../lib/apiClient.js";

const STATUS_BADGES = {
  Pending: "bg-yellow-100 text-yellow-800",
  Working: "bg-blue-100 text-blue-800",
  Resolved: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-700",
};

function normalizeComplaintStatus(status) {
  const raw = String(status || "").trim().toLowerCase();
  if (!raw) return "Pending";
  if (raw === "pending" || raw === "open") return "Pending";
  if (raw === "working" || raw === "in progress" || raw === "in_progress")
    return "Working";
  if (raw === "resolved" || raw === "solved" || raw === "closed")
    return "Resolved";
  if (raw === "rejected" || raw === "reject") return "Rejected";
  // Fallback: keep original capitalization if it matches one of our badges
  const title = raw.charAt(0).toUpperCase() + raw.slice(1);
  return STATUS_BADGES[title] ? title : "Pending";
}

function SidebarLink({ to, label, icon, currentPath, badge }) {
  const active = currentPath === to;
  const showBadge = Number.isFinite(Number(badge)) && Number(badge) > 0;
  return (
    <Link
      to={to}
      className={`group flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
        active
          ? "bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-md"
          : "bg-white text-gray-700 hover:bg-brand-50 hover:text-brand-700"
      }`}
    >
      <span
        className={`text-lg ${
          active
            ? "grayscale-0"
            : "grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100"
        }`}
        aria-hidden="true"
      >
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      {showBadge && (
        <span
          className={`inline-flex items-center justify-center min-w-[1.75rem] px-2 py-0.5 text-xs font-bold rounded-full ${
            active
              ? "bg-white/20 text-white border border-white/30"
              : "bg-brand-100 text-brand-700 border border-brand-200"
          }`}
        >
          {Number(badge)}
        </span>
      )}
    </Link>
  );
}

export default function StaffDashboard() {
  const { user } = useAuth();
  const location = useLocation();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [profilePhoto] = useState(() => {
    return localStorage.getItem(`profile_photo_${user?.id}`) || null;
  });

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await apiClient.get("/complaints");
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        if (active) setComplaints(list);
      } catch (e) {
        if (active) {
          setComplaints([]);
          setError(e?.response?.data?.message || e?.message || "Request failed");
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const complaintStats = useMemo(() => {
    const counts = {
      Total: 0,
      Pending: 0,
      Working: 0,
      Resolved: 0,
      Rejected: 0,
      Open: 0,
    };

    const list = Array.isArray(complaints) ? complaints : [];
    counts.Total = list.length;

    for (const c of list) {
      const s = normalizeComplaintStatus(c?.status);
      if (s === "Pending") counts.Pending += 1;
      else if (s === "Working") counts.Working += 1;
      else if (s === "Resolved") counts.Resolved += 1;
      else if (s === "Rejected") counts.Rejected += 1;
    }
    counts.Open = counts.Pending + counts.Working;
    return counts;
  }, [complaints]);

  const recentComplaints = useMemo(() => {
    const list = Array.isArray(complaints) ? [...complaints] : [];
    list.sort((a, b) => {
      const da = new Date(a?.createdAt || a?.created_at || 0).getTime();
      const db = new Date(b?.createdAt || b?.created_at || 0).getTime();
      return (Number.isNaN(db) ? 0 : db) - (Number.isNaN(da) ? 0 : da);
    });
    return list.slice(0, 6);
  }, [complaints]);

  return (
    <div
      className="relative w-full flex flex-col lg:flex-row gap-4 h-[calc(100vh-6rem)] overflow-hidden rounded-3xl p-4"
      style={{ backgroundColor: "#123456" }}
    >
      <aside
        className="hidden lg:block w-72 p-4 lg:h-[calc(100vh-6rem)] lg:sticky lg:top-20 flex-shrink-0 overflow-y-auto shadow-lg rounded-2xl border border-white/10"
        style={{ backgroundColor: "#123456" }}
      >
        <h2 className="text-xs font-bold text-white mb-5 uppercase tracking-wider px-1">
          Staff portal
        </h2>
        <nav className="space-y-2 text-sm">
          <SidebarLink
            to="/staff"
            label="Dashboard"
            icon="🏠"
            currentPath={location.pathname}
          />
          <SidebarLink
            to="/complaints"
            label="Complaints"
            icon="🧾"
            currentPath={location.pathname}
            badge={complaintStats.Open}
          />
          <SidebarLink
            to="/notifications"
            label="Notifications"
            icon="📢"
            currentPath={location.pathname}
          />
          <SidebarLink
            to="/profile"
            label="Profile"
            icon="👤"
            currentPath={location.pathname}
          />
        </nav>
      </aside>

      <div className="flex-1 overflow-y-auto rounded-2xl bg-slate-50 p-6 shadow-lg">
        <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="Profile"
                  className="w-12 h-12 rounded-full object-cover shadow-lg border border-white"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-600 to-brand-700 text-white flex items-center justify-center text-xl font-bold shadow-lg">
                  {String(user?.name || "S").charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Welcome, {user?.name || "Staff"}
                </h1>
                <p className="text-sm text-gray-500">Hall Staff Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/complaints"
                className="inline-flex items-center px-4 py-2 bg-brand-600 hover:bg-brand-700 text-sm font-semibold rounded-full text-white shadow-md hover:shadow-lg transition-all"
              >
                Review complaints
              </Link>
              <Link
                to="/notifications"
                className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-sm font-semibold rounded-full text-gray-800 shadow-sm transition-all"
              >
                View notices
              </Link>
            </div>
          </div>
        </section>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-gray-500">Total</div>
            <div className="mt-2 text-2xl font-bold text-gray-900">
              {loading ? "…" : complaintStats.Total}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-gray-500">Pending</div>
            <div className="mt-2 text-2xl font-bold text-gray-900">
              {loading ? "…" : complaintStats.Pending}
            </div>
            <div className="mt-2 inline-flex text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
              Needs attention
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-gray-500">Working</div>
            <div className="mt-2 text-2xl font-bold text-gray-900">
              {loading ? "…" : complaintStats.Working}
            </div>
            <div className="mt-2 inline-flex text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              In progress
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-gray-500">Resolved</div>
            <div className="mt-2 text-2xl font-bold text-gray-900">
              {loading ? "…" : complaintStats.Resolved}
            </div>
            <div className="mt-2 inline-flex text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-800">
              Completed
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-gray-500">Rejected</div>
            <div className="mt-2 text-2xl font-bold text-gray-900">
              {loading ? "…" : complaintStats.Rejected}
            </div>
            <div className="mt-2 inline-flex text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
              Closed
            </div>
          </div>
        </div>

        <section className="mt-4 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Recent complaints
              </h2>
              <p className="text-xs text-gray-500">
                Latest items filed for your hall.
              </p>
            </div>
            <Link
              to="/complaints"
              className="text-sm font-semibold text-brand-700 hover:text-brand-800"
            >
              View all
            </Link>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-sm text-gray-600">Loading…</div>
          ) : recentComplaints.length === 0 ? (
            <div className="text-sm text-gray-600">No complaints found.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentComplaints.map((c) => {
                const status = normalizeComplaintStatus(c?.status);
                const badge = STATUS_BADGES[status] || "bg-gray-100 text-gray-700";
                return (
                  <div
                    key={c?.id || `${c?.title}-${c?.createdAt}`}
                    className="py-3 flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 truncate">
                        {c?.title || "Untitled complaint"}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {c?.description || c?.body || ""}
                      </div>
                    </div>
                    <span
                      className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${badge}`}
                    >
                      {status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
