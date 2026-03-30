import React, { useEffect, useState, useMemo } from "react";
import api from "../../lib/apiClient.js";

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

const formatFieldValue = (field, value) => {
  if (value === null || value === undefined || value === "") return "—";

  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : "—";
  }

  const kind = String(field?.fieldConfig?.kind || "").toUpperCase();
  if (kind === "BD_ADDRESS" && value && typeof value === "object") {
    const district = String(value?.district || "").trim();
    const upazila = String(value?.upazila || "").trim();
    if (!district && !upazila) return "—";
    if (district && upazila) return `${district}, ${upazila}`;
    return district || upazila;
  }

  if (value && typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch (_) {
      return "—";
    }
  }

  return String(value);
};

const asNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const getOptionScoreMap = (field) => {
  if (!field) return {};
  if (field.optionScores && typeof field.optionScores === "object") {
    return field.optionScores;
  }
  const map = {};
  const options = Array.isArray(field.options) ? field.options : [];
  for (const opt of options) {
    const label =
      opt?.value ?? opt?.label ?? opt?.optionLabel ?? opt?.name ?? opt;
    if (label === null || label === undefined) continue;
    const score =
      opt?.optionScore ?? opt?.score ?? opt?.points ?? opt?.valueScore ?? 0;
    map[String(label)] = asNumber(score, 0);
  }
  return map;
};

const getFieldMaxScore = (field) => {
  if (!field) return 0;
  const baseScore = asNumber(field.score, 0);
  const type = String(field.type || "").toLowerCase();
  const kind = String(field?.fieldConfig?.kind || "").toUpperCase();

  if (kind === "BD_ADDRESS") {
    const districtScores = field?.fieldConfig?.districtScores || {};
    const noakhaliUpazilaScores =
      field?.fieldConfig?.noakhaliUpazilaScores || {};
    const scores = [
      ...Object.values(districtScores),
      ...Object.values(noakhaliUpazilaScores),
    ].map((v) => asNumber(v, 0));
    return scores.length ? Math.max(...scores, 0) : 0;
  }

  const rules = field?.scoringRules;
  if (type === "number" && rules && rules.mode === "RANGE_PERCENT") {
    const ranges = Array.isArray(rules.ranges) ? rules.ranges : [];
    const maxPercent = Math.max(
      asNumber(rules.defaultPercent, 0),
      ...ranges.map((r) => asNumber(r?.percent, 0)),
      0
    );
    return (baseScore * maxPercent) / 100;
  }

  if (type === "checkbox" || type === "dropdown" || type === "radio") {
    const scores = Object.values(getOptionScoreMap(field)).map((v) =>
      asNumber(v, 0)
    );
    if (!scores.length) return 0;

    if (type === "checkbox") {
      return scores.reduce((sum, s) => sum + Math.max(0, s), 0);
    }

    return Math.max(...scores, 0);
  }

  return baseScore;
};

const getFieldCurrentScore = (field, value) => {
  if (!field) return 0;
  const type = String(field.type || "").toLowerCase();
  const kind = String(field?.fieldConfig?.kind || "").toUpperCase();
  const baseScore = asNumber(field.score, 0);

  if (kind === "BD_ADDRESS") {
    if (!value || typeof value !== "object") return 0;
    const district = String(value?.district || "").trim();
    const upazila = String(value?.upazila || "").trim();

    const districtScores = field?.fieldConfig?.districtScores || {};
    const noakhaliUpazilaScores =
      field?.fieldConfig?.noakhaliUpazilaScores || {};

    if (district.toLowerCase() === "noakhali") {
      const upScore = asNumber(noakhaliUpazilaScores?.[upazila], null);
      if (upScore !== null) return upScore;
      return asNumber(districtScores?.[district], 0);
    }
    return asNumber(districtScores?.[district], 0);
  }

  const rules = field?.scoringRules;
  if (type === "number" && rules && rules.mode === "RANGE_PERCENT") {
    const numeric = asNumber(value, null);
    if (numeric === null) return 0;
    const ranges = Array.isArray(rules.ranges) ? rules.ranges : [];
    const match = ranges.find((r) => {
      const min = asNumber(r?.min, null);
      const max = asNumber(r?.max, null);
      if (min === null || max === null) return false;
      return numeric >= min && numeric <= max;
    });
    const percent = asNumber(match?.percent ?? rules.defaultPercent, 0);
    return (baseScore * percent) / 100;
  }

  if (type === "dropdown" || type === "radio") {
    const map = getOptionScoreMap(field);
    return asNumber(map?.[String(value)], 0);
  }

  if (type === "checkbox") {
    const map = getOptionScoreMap(field);
    const values = Array.isArray(value) ? value : value ? [value] : [];
    return values.reduce((sum, v) => sum + asNumber(map?.[String(v)], 0), 0);
  }

  return 0;
};

const getFormTotalMaxScore = (schema) => {
  const fields = Array.isArray(schema) ? schema : [];
  return fields.reduce((sum, f) => sum + getFieldMaxScore(f), 0);
};

export default function StudentApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const [downloadingId, setDownloadingId] = useState(null);

  const [expandedId, setExpandedId] = useState(null);
  const [detailsById, setDetailsById] = useState({});
  const [detailsLoadingId, setDetailsLoadingId] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/forms/student/applications");
        setApps(res.data?.data || []);
      } catch (e) {
        setError("Failed to load applications");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statuses = useMemo(
    () => Array.from(new Set(apps.map((a) => a.status).filter(Boolean))),
    [apps]
  );
  const pretty = (s) => {
    if (!s) return "Submitted";
    if (s === "not-alloted") return "Not-Alloted";
    return String(s)
      .split(" ")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");
  };

  const loadDetails = async (applicationId) => {
    if (!applicationId) return;
    if (detailsById[applicationId]) return detailsById[applicationId];
    setDetailsLoadingId(applicationId);
    try {
      const res = await api.get(`/forms/student/applications/${applicationId}`);
      const payload = res?.data?.data || null;
      setDetailsById((prev) => ({ ...prev, [applicationId]: payload }));
      return payload;
    } catch (e) {
      setError(
        e?.response?.data?.message || "Failed to load application details"
      );
      return null;
    } finally {
      setDetailsLoadingId(null);
    }
  };

  const safeFilename = (value) =>
    String(value || "file")
      .replace(/[\\/:*?"<>|]/g, "_")
      .replace(/\s+/g, " ")
      .trim();

  const downloadApplicationPdf = async (app) => {
    const applicationId = app?.id;
    if (!applicationId) return;

    setDownloadingId(applicationId);
    setError(null);
    try {
      const details =
        (await loadDetails(applicationId)) ||
        detailsById[applicationId] ||
        null;

      if (!details?.form?.schema || !details?.application) {
        throw new Error("Application details not available");
      }

      const [{ default: jsPDF }] = await Promise.all([import("jspdf")]);

      const doc = new jsPDF({
        orientation: "p",
        unit: "pt",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const marginX = 40;
      const marginY = 40;
      const maxTextWidth = pageWidth - marginX * 2;
      const lineHeight = 14;

      const ensureSpace = (lines = 1) => {
        const needed = lines * lineHeight;
        if (y + needed > pageHeight - marginY) {
          doc.addPage();
          y = marginY;
        }
      };

      const writeWrapped = (text, fontSize = 10) => {
        doc.setFontSize(fontSize);
        const lines = doc.splitTextToSize(String(text || ""), maxTextWidth);
        ensureSpace(lines.length);
        doc.text(lines, marginX, y);
        y += lines.length * lineHeight;
      };

      let y = marginY;

      doc.setFontSize(16);
      doc.text(
        String(app?.formTitle || details?.form?.title || "Application"),
        marginX,
        y
      );
      y += 22;

      doc.setFontSize(10);
      writeWrapped(
        `Submitted: ${
          app?.submittedAt ? new Date(app.submittedAt).toLocaleString() : "—"
        }`
      );
      writeWrapped(`Status: ${pretty(app?.status || "submitted")}`);

      const rejection =
        details?.application?.rejectionReason || app?.rejectionReason || null;
      if (String(app?.status || "").toLowerCase() === "rejected") {
        writeWrapped(`Rejection reason: ${rejection || "Not provided"}`);
      }

      y += 6;
      ensureSpace(2);
      doc.setDrawColor(200);
      doc.line(marginX, y, pageWidth - marginX, y);
      y += 14;

      const schema = Array.isArray(details?.form?.schema)
        ? details.form.schema
        : [];
      const data = details?.application?.data || {};

      const score = asNumber(details?.application?.score, 0);
      const maxScore = getFormTotalMaxScore(schema);
      writeWrapped(`Score: ${score} / ${maxScore}`, 11);
      y += 6;

      for (const field of schema) {
        const label = String(field?.label || field?.id || "Field");
        const value = formatFieldValue(field, data?.[field?.id]);
        const current = getFieldCurrentScore(field, data?.[field?.id]);
        const max = getFieldMaxScore(field);

        ensureSpace(2);
        doc.setFontSize(11);
        doc.text(label, marginX, y);
        y += lineHeight;

        writeWrapped(`Answer: ${value}`);
        writeWrapped(`Score: ${current} / ${max}`);

        y += 8;
      }

      const datePart = app?.submittedAt
        ? new Date(app.submittedAt).toISOString().slice(0, 10)
        : "";
      const filename = safeFilename(
        `${app?.formTitle || "application"}${
          datePart ? `-${datePart}` : ""
        }.pdf`
      );

      doc.save(filename);
    } catch (e) {
      setError(e?.message || "Failed to download application");
    } finally {
      setDownloadingId(null);
    }
  };

  const visible = useMemo(() => {
    if (filterStatus === "all") return apps;
    return apps.filter((a) => a.status === filterStatus);
  }, [apps, filterStatus]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">My Applications</h1>
        <p className="text-white font-bold">
          Track your application status and view submission details.
        </p>
      </header>

      <section className="bg-white border rounded-xl p-4 space-y-3">
        <div className="flex gap-3 items-center">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded px-3 py-2 text-sm text-white font-medium hover:opacity-90 transition-opacity cursor-pointer"
            style={{ backgroundColor: "#123456" }}
          >
            <option value="all">All Statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {pretty(s)}
              </option>
            ))}
          </select>
          {loading && <span className="text-sm text-gray-500">Loading…</span>}
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </section>

      <section className="space-y-3">
        {visible.map((app) => (
          <article key={app.id} className="bg-white border rounded-xl p-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {app.formTitle || "Application"}
                </h2>
                <p className="text-sm text-gray-600">
                  Submitted: {new Date(app.submittedAt).toLocaleString()}
                </p>
                {String(app.status || "").toLowerCase() === "rejected" ? (
                  <p className="mt-1 text-sm text-red-700">
                    <span className="font-semibold">Rejection reason:</span>{" "}
                    {app.rejectionReason ? app.rejectionReason : "Not provided"}
                  </p>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-gray-100 text-gray-800">
                  {pretty(app.status || "submitted")}
                </span>
                <button
                  type="button"
                  className="px-3 py-1 rounded-md text-xs font-semibold border border-emerald-200 text-emerald-700 hover:bg-emerald-50 disabled:opacity-60"
                  disabled={downloadingId === app.id}
                  onClick={() => downloadApplicationPdf(app)}
                >
                  {downloadingId === app.id ? "Preparing…" : "Download PDF"}
                </button>
                <button
                  type="button"
                  className="px-3 py-1 rounded-md text-xs font-semibold border border-sky-200 text-sky-700 hover:bg-sky-50"
                  onClick={async () => {
                    const nextId = expandedId === app.id ? null : app.id;
                    setExpandedId(nextId);
                    if (nextId) await loadDetails(nextId);
                  }}
                >
                  {expandedId === app.id ? "Hide details" : "View details"}
                </button>
              </div>
            </div>

            {expandedId === app.id ? (
              <div className="mt-4 border-t pt-4 space-y-4">
                {detailsLoadingId === app.id ? (
                  <div className="text-sm text-gray-600">Loading details…</div>
                ) : null}

                {String(app.status || "").toLowerCase() === "rejected" ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                    <p className="text-sm font-semibold text-red-800">
                      Rejected
                    </p>
                    <p className="text-sm text-red-700 mt-1">
                      {detailsById[app.id]?.application?.rejectionReason ||
                        app.rejectionReason ||
                        "No rejection reason provided."}
                    </p>
                  </div>
                ) : null}

                {detailsById[app.id]?.form?.schema ? (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-sky-50 border border-sky-100 rounded-lg px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-sky-900">
                          Score Summary
                        </p>
                        <p className="text-xs text-sky-700">
                          Current score is your saved application score.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white border border-sky-200 text-sky-800">
                          Current:{" "}
                          {asNumber(detailsById[app.id]?.application?.score, 0)}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white border border-sky-200 text-sky-800">
                          Max:{" "}
                          {getFormTotalMaxScore(
                            detailsById[app.id]?.form?.schema
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(detailsById[app.id].form.schema || []).map((field) => {
                        const data =
                          detailsById[app.id]?.application?.data || {};
                        const allAttachments =
                          detailsById[app.id]?.application?.attachments || [];

                        const fieldAttachments = (
                          Array.isArray(allAttachments) ? allAttachments : []
                        ).filter(
                          (att) =>
                            att?.fieldId &&
                            String(att.fieldId) === String(field.id)
                        );

                        const value = data[field.id];
                        const prettyValue = formatFieldValue(field, value);
                        const current = getFieldCurrentScore(field, value);
                        const max = getFieldMaxScore(field);

                        const requirement = String(
                          field?.documentRequirement || "MANDATORY"
                        )
                          .trim()
                          .toUpperCase();
                        const docMandatory =
                          !!field.requiresDocument &&
                          requirement === "MANDATORY";
                        const noneSelected =
                          String(field?.type || "").toLowerCase() ===
                            "dropdown" &&
                          String(value ?? "")
                            .trim()
                            .toLowerCase() === "none";
                        const emptySelected =
                          String(field?.type || "").toLowerCase() ===
                            "dropdown" && String(value ?? "").trim() === "";
                        const showMissingDocument =
                          docMandatory && !(noneSelected || emptySelected);

                        return (
                          <div
                            key={`${app.id}-${field.id}`}
                            className="bg-gray-50 border border-gray-200 rounded-lg p-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                {field.label || field.id}
                              </p>
                              <div className="flex items-center gap-1 shrink-0">
                                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-white text-gray-800">
                                  Current: {current}
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-white text-gray-800">
                                  Max: {max}
                                </span>
                              </div>
                            </div>
                            <p className="mt-1 text-sm text-gray-900 break-words">
                              {prettyValue}
                            </p>

                            {fieldAttachments.length > 0 ? (
                              <div className="text-xs mt-2 flex items-start gap-2">
                                <span className="text-emerald-700">📎</span>
                                <div className="flex flex-col gap-1">
                                  {fieldAttachments.map((att, idx) => (
                                    <a
                                      key={`${app.id}-${field.id}-att-${
                                        att?.url || idx
                                      }`}
                                      href={toPublicUrl(att.url)}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-emerald-700 hover:text-emerald-800 underline break-all"
                                      title="Open document"
                                    >
                                      {att?.name ||
                                        att?.url ||
                                        `Document ${idx + 1}`}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            ) : showMissingDocument ? (
                              <div className="text-xs mt-2 flex items-center gap-2">
                                <span className="text-emerald-700">📎</span>
                                <span className="text-gray-500">
                                  Document not uploaded
                                </span>
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </article>
        ))}
        {visible.length === 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-gray-500">
            No applications to show.
          </div>
        )}
      </section>
    </div>
  );
}
