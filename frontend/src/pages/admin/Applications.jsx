import React, { useMemo, useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../lib/apiClient.js";

// Schema will be fetched per selected form from backend

const stageOrder = {
  scheduled: 0,
  submitted: 1,
  rejected: 2,
};

const statusStyles = {
  submitted: "bg-gray-100 text-gray-800 border-gray-200",
  scheduled: "bg-purple-100 text-purple-800 border-purple-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  alloted: "bg-green-100 text-green-800 border-green-200",
  "not-alloted": "bg-gray-100 text-gray-800 border-gray-200",
};

const prettyStatus = (s) => {
  if (!s) return "Submitted";
  const lowered = String(s).toLowerCase();
  if (lowered === "alloted") return "Allocated";
  if (lowered === "not-alloted") return "Not Allocated";
  if (lowered === "submitted") return "Submitted";
  if (lowered === "scheduled") return "Scheduled";
  if (lowered === "rejected") return "Rejected";
  return s
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

const formatDate = (isoString) =>
  new Date(isoString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const prettyProgramLevel = (raw) => {
  const v = String(raw || "").toLowerCase();
  if (v === "undergraduate" || v === "undergrad") return "Undergraduate";
  if (v === "masters" || v === "master") return "Masters";
  if (v === "phd" || v === "ph.d") return "PhD";
  return raw ? String(raw) : "—";
};

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

const asNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const getOptionScoreMap = (field) => {
  const raw = field?.optionScores;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw;
};

const getFieldMaxScore = (field) => {
  if (!field) return 0;
  const kind = String(field?.fieldConfig?.kind || "").toUpperCase();

  if (kind === "BD_ADDRESS") {
    const districtScores = field?.fieldConfig?.districtScores;
    const upazilaScores = field?.fieldConfig?.noakhaliUpazilaScores;
    const districtMax = Math.max(
      0,
      ...Object.values(districtScores || {})
        .map((v) => Number(v))
        .filter((v) => Number.isFinite(v))
    );
    const upazilaMax = Math.max(
      0,
      ...Object.values(upazilaScores || {})
        .map((v) => Number(v))
        .filter((v) => Number.isFinite(v))
    );
    return Math.max(districtMax, upazilaMax);
  }

  if (field.type === "dropdown") {
    const scores = Object.values(getOptionScoreMap(field)).map((v) =>
      asNumber(v)
    );
    return Math.max(0, ...scores);
  }

  if (field.type === "checkbox") {
    const scores = Object.values(getOptionScoreMap(field)).map((v) =>
      asNumber(v)
    );
    return scores.reduce((a, b) => a + b, 0);
  }

  if (field.type === "number" && field.scoringRules) {
    const base = asNumber(field.score);
    const ranges = Array.isArray(field.scoringRules?.ranges)
      ? field.scoringRules.ranges
      : [];
    const percents = [
      Number(field.scoringRules?.defaultPercent),
      ...ranges.map((r) => Number(r?.percent)),
    ].filter((p) => Number.isFinite(p));
    const maxPercent = percents.length ? Math.max(...percents) : 0;
    return (base * maxPercent) / 100;
  }

  return asNumber(field.score);
};

const getRangePercent = (rules, numericValue) => {
  const ranges = Array.isArray(rules?.ranges) ? rules.ranges : [];
  for (const r of ranges) {
    const min = r?.min === null || r?.min === undefined ? null : Number(r.min);
    const max = r?.max === null || r?.max === undefined ? null : Number(r.max);
    if (min !== null && !Number.isFinite(min)) continue;
    if (max !== null && !Number.isFinite(max)) continue;
    if (min !== null && numericValue < min) continue;
    if (max !== null && numericValue > max) continue;
    const percent = Number(r?.percent);
    return Number.isFinite(percent) ? percent : 0;
  }
  const fallback = Number(rules?.defaultPercent);
  return Number.isFinite(fallback) ? fallback : 0;
};

const getFieldCurrentScore = (field, value) => {
  if (!field) return 0;
  const kind = String(field?.fieldConfig?.kind || "").toUpperCase();

  if (kind === "BD_ADDRESS") {
    const district = String(value?.district || "").trim();
    const upazila = String(value?.upazila || "").trim();
    if (!district && !upazila) return 0;
    const districtScores = field?.fieldConfig?.districtScores || {};
    const upazilaScores = field?.fieldConfig?.noakhaliUpazilaScores || {};
    if (district.toLowerCase() === "noakhali") {
      if (upazila && Number.isFinite(Number(upazilaScores[upazila]))) {
        return asNumber(upazilaScores[upazila]);
      }
      return asNumber(districtScores[district]);
    }
    return asNumber(districtScores[district]);
  }

  if (field.type === "dropdown") {
    const selected = String(value || "");
    if (!selected) return 0;
    const map = getOptionScoreMap(field);
    return asNumber(map[selected]);
  }

  if (field.type === "checkbox") {
    const arr = Array.isArray(value) ? value : [];
    const map = getOptionScoreMap(field);
    return arr
      .map((opt) => asNumber(map[String(opt)]))
      .reduce((a, b) => a + b, 0);
  }

  if (field.type === "number") {
    if (value === "" || value === null || value === undefined) return 0;
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return 0;
    if (field.scoringRules && typeof field.scoringRules === "object") {
      const percent = getRangePercent(field.scoringRules, numericValue);
      return (asNumber(field.score) * percent) / 100;
    }
    return asNumber(field.score);
  }

  const s = String(value ?? "").trim();
  return s ? asNumber(field.score) : 0;
};

const getFormTotalMaxScore = (schema) => {
  const fields = Array.isArray(schema) ? schema : [];
  return fields.map((f) => getFieldMaxScore(f)).reduce((a, b) => a + b, 0);
};

export default function Applications() {
  const { user } = useAuth();
  const hallId = user?.hallId;
  const [forms, setForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [schema, setSchema] = useState([]);
  const [applications, setApplications] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectTopCount, setSelectTopCount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [disciplinaryState, setDisciplinaryState] = useState({
    loading: false,
    error: "",
    studentId: null,
    records: [],
  });

  const getDepartment = (app) =>
    app?.applicant?.department || app?.data?.department || null;
  const getSession = (app) =>
    app?.applicant?.session || app?.data?.session || null;

  const getProgramLevel = (app) => {
    const raw =
      app?.applicant?.programLevel ||
      app?.applicant?.program_level ||
      app?.data?.programLevel ||
      app?.data?.program_level ||
      null;

    if (raw) return String(raw).toLowerCase();

    const sid = String(app?.applicant?.studentId || "").toUpperCase();
    if (/^[A-Z]{3}[0-9]{2}[0-9]{2}[0-9]{3}[MF]$/.test(sid))
      return "undergraduate";
    return null;
  };

  const normalizeStageFromStatus = (status) => {
    const raw = String(status || "submitted");
    const lowered = raw.toLowerCase();
    return lowered === "interview scheduled"
      ? "scheduled"
      : lowered === "seat allocated" ||
        lowered === "allocated" ||
        lowered === "allotted" ||
        lowered === "alloted"
      ? "alloted"
      : lowered === "selected"
      ? "scheduled"
      : lowered === "under review"
      ? "submitted"
      : lowered;
  };

  const mapApplication = (app) => {
    const interview = app?.interview || null;
    const mapped = normalizeStageFromStatus(app?.status);
    const stage = mapped === "submitted" && interview ? "scheduled" : mapped;
    return {
      ...app,
      formName: selectedForm?.title,
      stage,
      interview,
      decision: null,
      seat: null,
    };
  };

  // Load forms for hall, then applications for selected form
  useEffect(() => {
    async function loadForms() {
      if (!hallId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/forms");
        const forms = res.data?.data || [];
        setForms(forms);
        const active = forms.find((f) => f.isActive) || forms[0] || null;
        setSelectedForm(active);
        setSchema(active?.schema || []);
        setFilterStage("not-scheduled");
      } catch (e) {
        setError("Failed to load forms");
      } finally {
        setLoading(false);
      }
    }
    loadForms();
  }, [hallId]);

  const reloadForms = async () => {
    if (!hallId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/forms");
      const forms = res.data?.data || [];
      setForms(forms);
      const active = forms.find((f) => f.isActive) || forms[0] || null;
      setSelectedForm(active);
      setSchema(active?.schema || []);
      setFilterStage("not-scheduled");
    } catch (e) {
      setError("Failed to load forms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    let intervalId = null;

    async function loadApplications() {
      if (!selectedForm) {
        setApplications([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/forms/${selectedForm.id}/applications`);
        const apps = (res.data?.data || []).map(mapApplication);
        if (cancelled) return;
        setApplications(apps);
      } catch (e) {
        if (!cancelled) setError("Failed to load applications");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    function handleFocus() {
      loadApplications();
    }

    loadApplications();
    intervalId = window.setInterval(loadApplications, 15000);
    window.addEventListener("focus", handleFocus);

    return () => {
      cancelled = true;
      if (intervalId) window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
    };
  }, [selectedForm?.id]);
  const [filterProgramLevel, setFilterProgramLevel] = useState("all");
  const [filterSession, setFilterSession] = useState("all");
  const [filterStage, setFilterStage] = useState("not-scheduled");
  const [includePrevious, setIncludePrevious] = useState(true);
  const [interviewModal, setInterviewModal] = useState({
    open: false,
    date: "",
    time: "",
    venue: "",
  });

  const [rejectModal, setRejectModal] = useState({
    open: false,
    appId: null,
    reason: "",
    submitting: false,
    error: "",
  });
  // Support per-card "Schedule Interview" button via event
  useEffect(() => {
    const handler = (e) => {
      const appId = e?.detail?.appId;
      if (!appId) return;
      setSelectedIds([appId]);
      setInterviewModal({ open: true, date: "", time: "", venue: "" });
    };
    document.addEventListener("open-interview-modal", handler);
    return () => document.removeEventListener("open-interview-modal", handler);
  }, []);

  const sessions = useMemo(() => {
    const fromResponses = applications
      .map((app) => app.data?.session)
      .filter(Boolean);
    const fromProfiles = applications
      .map((app) => app.applicant?.session)
      .filter(Boolean);
    return Array.from(new Set([...fromResponses, ...fromProfiles])).sort();
  }, [applications]);

  const applicantApplications = useMemo(() => {
    const list = applications || [];
    if (includePrevious) return list;
    return list.filter(
      (app) => app.stage !== "alloted" && app.stage !== "not-alloted"
    );
  }, [applications, includePrevious]);

  const stages = useMemo(() => {
    const raw = Array.from(
      new Set(applicantApplications.map((app) => app.stage))
    )
      .filter(Boolean)
      .map((s) => String(s));
    raw.sort();
    return raw;
  }, [applicantApplications]);

  const summary = useMemo(() => {
    const total = applicantApplications.length;
    const scheduled = applicantApplications.filter(
      (app) => app.stage === "scheduled" || !!app.interview
    ).length;
    const notScheduled = applicantApplications.filter(
      (app) =>
        !app?.interview &&
        app.stage !== "scheduled" &&
        app.stage !== "rejected" &&
        app.stage !== "alloted" &&
        app.stage !== "not-alloted"
    ).length;
    return { total, scheduled, notScheduled };
  }, [applicantApplications]);

  const visibleApplications = useMemo(() => {
    let list = applicantApplications;
    if (filterProgramLevel !== "all") {
      list = list.filter((app) => getProgramLevel(app) === filterProgramLevel);
    }
    if (filterSession !== "all") {
      list = list.filter((app) => getSession(app) === filterSession);
    }
    if (filterStage !== "all") {
      if (filterStage === "not-scheduled") {
        list = list.filter(
          (app) =>
            !app?.interview &&
            app.stage !== "scheduled" &&
            app.stage !== "rejected" &&
            app.stage !== "alloted" &&
            app.stage !== "not-alloted"
        );
      } else {
        list = list.filter((app) => app.stage === filterStage);
      }
    }

    const sorted = [...list];
    sorted.sort((a, b) => {
      const scoreDiff = Number(b.score || 0) - Number(a.score || 0);
      if (scoreDiff !== 0) return scoreDiff;
      return (
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );
    });
    return sorted;
  }, [applicantApplications, filterProgramLevel, filterSession, filterStage]);

  // Always compute score-ranked list for SL + top-N selection.
  const scoreRankedApplications = useMemo(() => {
    const sorted = [...visibleApplications];
    sorted.sort((a, b) => {
      const scoreDiff = Number(b.score || 0) - Number(a.score || 0);
      if (scoreDiff !== 0) return scoreDiff;
      return (
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );
    });
    return sorted;
  }, [visibleApplications]);

  const effectiveSelectedIds = useMemo(() => {
    const visibleSet = new Set(scoreRankedApplications.map((a) => a.id));
    return selectedIds.filter((id) => visibleSet.has(id));
  }, [selectedIds, scoreRankedApplications]);

  const allVisibleSelected =
    scoreRankedApplications.length > 0 &&
    scoreRankedApplications.every((app) =>
      effectiveSelectedIds.includes(app.id)
    );
  const selectedCount = effectiveSelectedIds.length;

  const expandedApp = useMemo(() => {
    if (!expandedId) return null;
    return scoreRankedApplications.find((app) => app.id === expandedId) || null;
  }, [scoreRankedApplications, expandedId]);

  useEffect(() => {
    const sid = expandedApp?.applicant?.studentId;
    if (!sid) {
      setDisciplinaryState({
        loading: false,
        error: "",
        studentId: null,
        records: [],
      });
      return;
    }

    let cancelled = false;
    async function loadRecords() {
      setDisciplinaryState((s) => ({
        ...s,
        loading: true,
        error: "",
        studentId: sid,
        records: [],
      }));
      try {
        const res = await api.get("/disciplinary-records", {
          params: { studentId: sid },
        });
        if (cancelled) return;
        setDisciplinaryState({
          loading: false,
          error: "",
          studentId: sid,
          records: res?.data?.data || [],
        });
      } catch (e) {
        if (cancelled) return;
        setDisciplinaryState({
          loading: false,
          error:
            e?.response?.data?.message || "Failed to load disciplinary records",
          studentId: sid,
          records: [],
        });
      }
    }
    loadRecords();
    return () => {
      cancelled = true;
    };
  }, [expandedApp?.applicant?.studentId]);

  useEffect(() => {
    if (expandedId && !expandedApp) {
      setExpandedId(null);
    }
  }, [expandedId, expandedApp]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(scoreRankedApplications.map((app) => app.id));
    }
  };

  const selectTopN = () => {
    const raw = String(selectTopCount || "").trim();
    const n = Number.parseInt(raw, 10);
    if (!Number.isFinite(n) || n <= 0) {
      alert("Enter a valid number of students to select");
      return;
    }

    const max = scoreRankedApplications.length;
    const clamped = Math.min(n, max);
    setSelectedIds(scoreRankedApplications.slice(0, clamped).map((a) => a.id));
  };

  const openInterviewModal = () => {
    if (selectedCount === 0) {
      alert("Select at least one application to schedule an interview.");
      return;
    }
    setInterviewModal({ open: true, date: "", time: "", venue: "" });
  };

  const downloadApplicationsPdf = async () => {
    const exportList = scoreRankedApplications;
    await generateApplicationsPdf({
      list: exportList,
      label: "Filtered",
    });
  };

  const downloadAllApplicationsPdf = async () => {
    const sortedAll = [...(applications || [])];
    sortedAll.sort((a, b) => {
      const scoreDiff = Number(b.score || 0) - Number(a.score || 0);
      if (scoreDiff !== 0) return scoreDiff;
      return (
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );
    });
    await generateApplicationsPdf({
      list: sortedAll,
      label: "All",
    });
  };

  const generateApplicationsPdf = async ({ list, label }) => {
    if (!selectedForm) {
      alert("Select a form first.");
      return;
    }
    if (!list || !list.length) {
      alert("No applications to export.");
      return;
    }

    try {
      const [{ jsPDF }, autoTableMod] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);
      const autoTable = autoTableMod.default || autoTableMod;

      const doc = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: "a4",
      });

      const now = new Date();
      const formTitle = String(selectedForm?.title || "Applications").trim();
      const header = `${formTitle} — Applications (${label})`;

      doc.setFontSize(14);
      doc.text(header, 40, 40);
      doc.setFontSize(10);
      doc.text(
        `Generated: ${now.toLocaleString()}    Total: ${list.length}`,
        40,
        60
      );

      const head = [
        [
          "Pos",
          "Name",
          "Student ID",
          "Program",
          "Dept",
          "Session",
          "Score",
          "Status",
          "Interview",
        ],
      ];

      const body = list.map((app, idx) => {
        const interview = app?.interview
          ? `${formatDate(app.interview.date)} ${app.interview.time || ""} @ ${
              app.interview.venue || ""
            }`.trim()
          : "—";

        return [
          String(idx + 1),
          String(app?.applicant?.name || "—"),
          String(app?.applicant?.studentId || "—"),
          prettyProgramLevel(app?.applicant?.programLevel),
          String(getDepartment(app) || "—"),
          String(getSession(app) || "—"),
          typeof app.score === "number" ? String(app.score) : "—",
          String(prettyStatus(app.stage || app.status || "submitted")),
          interview,
        ];
      });

      autoTable(doc, {
        startY: 80,
        head,
        body,
        styles: { fontSize: 9, cellPadding: 4, overflow: "linebreak" },
        headStyles: { fillColor: [11, 31, 59] },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 120 },
          2: { cellWidth: 95 },
          3: { cellWidth: 85 },
          4: { cellWidth: 85 },
          5: { cellWidth: 70 },
          6: { cellWidth: 55 },
          7: { cellWidth: 90 },
          8: { cellWidth: 230 },
        },
      });

      const safeBase = formTitle
        .replace(/[^a-z0-9\- _]/gi, "")
        .trim()
        .replace(/\s+/g, "_")
        .slice(0, 40);
      const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(now.getDate()).padStart(2, "0")}`;

      const safeLabel = String(label || "").toLowerCase();
      doc.save(`${safeBase || "applications"}_${safeLabel}_${stamp}.pdf`);
    } catch (e) {
      console.error(e);
      alert("Failed to generate PDF");
    }
  };

  const scheduleInterview = async () => {
    const { date, time, venue } = interviewModal;
    if (!date || !time || !venue.trim()) {
      alert("Provide date, time, and venue to schedule interviews.");
      return;
    }
    try {
      await Promise.all(
        effectiveSelectedIds.map((appId) =>
          api.post(`/forms/${selectedForm.id}/applications/${appId}/status`, {
            status: "scheduled",
            interview: { date, time, venue: venue.trim() },
          })
        )
      );
      setSelectedIds([]);
      setInterviewModal({ open: false, date: "", time: "", venue: "" });
      // reload applications
      const res = await api.get(`/forms/${selectedForm.id}/applications`);
      const apps = (res.data?.data || []).map(mapApplication);
      setApplications(apps);
    } catch (e) {
      alert("Failed to schedule interview");
    }
  };

  const openRejectModal = (appId) => {
    if (!appId) return;
    setRejectModal({
      open: true,
      appId,
      reason: "",
      submitting: false,
      error: "",
    });
  };

  const submitReject = async () => {
    const appId = rejectModal.appId;
    const formId = selectedForm?.id;
    const reason = String(rejectModal.reason || "").trim();

    if (!formId || !appId) {
      setRejectModal((m) => ({
        ...m,
        error: "No form/application selected.",
      }));
      return;
    }

    if (!reason) {
      setRejectModal((m) => ({
        ...m,
        error: "Rejection reason is required.",
      }));
      return;
    }

    setRejectModal((m) => ({ ...m, submitting: true, error: "" }));
    try {
      await api.post(`/forms/${formId}/applications/${appId}/status`, {
        status: "rejected",
        rejectionReason: reason,
      });
      const res = await api.get(`/forms/${formId}/applications`);
      const apps = (res.data?.data || []).map(mapApplication);
      setApplications(apps);
      setRejectModal({
        open: false,
        appId: null,
        reason: "",
        submitting: false,
        error: "",
      });
    } catch (e) {
      setRejectModal((m) => ({
        ...m,
        submitting: false,
        error: e?.response?.data?.message || "Failed to reject application",
      }));
    }
  };

  return (
    <div
      className="w-full rounded-xl shadow-lg p-5 sm:p-6 md:p-8 space-y-6"
      style={{ backgroundColor: "#013A63" }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Applications</h1>
          <p className="text-base font-bold text-white max-w-3xl">
            Review applicant submissions per form. Filters remain available.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={reloadForms}
            className="px-4 py-2 bg-[#2C7DA0]/40 backdrop-blur-md border border-[#2C7DA0]/50 rounded-full text-sm text-white font-medium hover:bg-[#123C69]/60 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={selectedForm?.id || ""}
          onChange={(e) => {
            const val = e.target.value;
            const f = forms.find((x) => String(x.id) === String(val)) || null;
            setSelectedForm(f);
            setSchema(Array.isArray(f?.schema) ? f.schema : []);
            setApplications([]);
            setExpandedId(null);
            setSelectedIds([]);
            setFilterStage("not-scheduled");
          }}
          className="border rounded px-3 py-2 text-sm bg-[#2C7DA0] text-white shadow-md hover:bg-[#123C69] transform hover:scale-105 transition-all duration-200"
        >
          <option value="">Select a form</option>
          {forms.map((f) => (
            <option key={f.id} value={f.id}>
              {f.title} {f.isActive ? "(Active)" : ""}
            </option>
          ))}
        </select>
        {loading && <span className="text-sm text-white/80">Loading…</span>}
        {error && <span className="text-sm text-red-200">{error}</span>}
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          title="Total Applications"
          value={summary.total}
          tone="blue"
        />
        <SummaryCard
          title="Scheduled"
          value={summary.scheduled}
          tone="purple"
        />
        <SummaryCard
          title="Not Scheduled"
          value={summary.notScheduled}
          tone="orange"
        />
      </section>

      <section className="rounded-2xl border border-white/60 bg-gradient-to-r from-white/95 via-sky-50/80 to-emerald-50/70 p-4 sm:p-5 shadow-sm backdrop-blur space-y-3">
        <div className="flex flex-wrap gap-3">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={includePrevious}
              onChange={(e) => setIncludePrevious(e.target.checked)}
            />
            Include previous (allocated)
          </label>

          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={toggleSelectAll}
            />
            Select all
          </label>

          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={scoreRankedApplications.length || 1}
              value={selectTopCount}
              onChange={(e) => setSelectTopCount(e.target.value)}
              className="w-28 border rounded px-3 py-2 text-sm"
              placeholder="Top N"
              inputMode="numeric"
            />
            <button
              type="button"
              onClick={selectTopN}
              disabled={scoreRankedApplications.length === 0}
              className="px-3 py-2 bg-emerald-600 text-white text-sm font-bold rounded hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Select Top
            </button>
          </div>

          <button
            onClick={openInterviewModal}
            className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            disabled={selectedCount === 0}
          >
            Schedule Interview ({selectedCount})
          </button>

          <button
            type="button"
            onClick={downloadApplicationsPdf}
            disabled={!selectedForm || scoreRankedApplications.length === 0}
            className="px-4 py-2 bg-[#2C7DA0] text-white text-sm font-bold rounded hover:bg-[#123C69] disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Download PDF
          </button>

          <button
            type="button"
            onClick={downloadAllApplicationsPdf}
            disabled={!selectedForm || applications.length === 0}
            className="px-4 py-2 bg-[#2C7DA0] text-white text-sm font-bold rounded hover:bg-[#123C69] disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Download All PDF
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select
            value={filterProgramLevel}
            onChange={(e) => setFilterProgramLevel(e.target.value)}
            className="border rounded px-3 py-2 text-sm bg-[#2C7DA0] text-white shadow-md hover:bg-[#123C69] transform hover:scale-105 transition-all duration-200 cursor-pointer"
          >
            <option value="all">All Programs</option>
            <option value="undergraduate">Undergraduate</option>
            <option value="masters">Masters</option>
            <option value="phd">PhD</option>
          </select>
          <select
            value={filterSession}
            onChange={(e) => setFilterSession(e.target.value)}
            className="border rounded px-3 py-2 text-sm bg-[#2C7DA0] text-white shadow-md hover:bg-[#123C69] transform hover:scale-105 transition-all duration-200 cursor-pointer"
          >
            <option value="all">All Sessions</option>
            {sessions.map((session) => (
              <option key={session} value={session}>
                {session}
              </option>
            ))}
          </select>
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            className="border rounded px-3 py-2 text-sm bg-[#2C7DA0] text-white shadow-md hover:bg-[#123C69] transform hover:scale-105 transition-all duration-200 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="not-scheduled">Not Scheduled</option>
            {stages.map((stage) => (
              <option key={stage} value={stage}>
                {prettyStatus(stage)}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setFilterProgramLevel("all");
              setFilterSession("all");
              setFilterStage("not-scheduled");
            }}
            className="px-3 py-2 bg-[#2C7DA0] text-white rounded text-sm hover:bg-[#123C69] shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Reset Filters
          </button>
        </div>
      </section>

      <section className="bg-white border-2 border-gray-200 rounded-xl p-4 sm:p-5 overflow-x-auto shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b border-gray-200">
              <th className="py-2 px-3 bg-blue-800 text-white font-bold">
                Select
              </th>
              <th className="py-2 px-3 bg-blue-800 text-white font-bold">
                Position
              </th>
              <th className="py-2 px-3 bg-blue-800 text-white font-bold">
                Name
              </th>
              <th className="py-2 px-3 bg-blue-800 text-white font-bold">
                Student ID
              </th>
              <th className="py-2 px-3 bg-blue-800 text-white font-bold">
                Dept
              </th>
              <th className="py-2 px-3 bg-blue-800 text-white font-bold">
                Session
              </th>
              <th className="py-2 px-3 bg-blue-800 text-white font-bold">
                Application Score
              </th>
            </tr>
          </thead>
          <tbody>
            {scoreRankedApplications.map((app, idx) => {
              const rowBg = idx % 2 === 0 ? "#E6F2FA" : "#ffffff";
              const rowColor = idx % 2 === 0 ? "#0B1F3B" : "#000000";
              return (
                <tr
                  key={app.id}
                  className="border-b last:border-b-0"
                  style={{ backgroundColor: rowBg, color: rowColor }}
                >
                  <td className="py-2 px-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(app.id)}
                      onChange={() => toggleSelect(app.id)}
                    />
                  </td>
                  <td className="py-2 px-3 font-semibold">{idx + 1}</td>
                  <td className="py-2 px-3">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId((prev) =>
                          prev === app.id ? null : app.id
                        )
                      }
                      className="text-left w-full underline"
                      style={{ color: rowColor }}
                    >
                      {app?.applicant?.name || "—"}
                    </button>
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId((prev) =>
                          prev === app.id ? null : app.id
                        )
                      }
                      className="text-left w-full underline"
                      style={{ color: rowColor }}
                    >
                      {app?.applicant?.studentId || "—"}
                    </button>
                  </td>
                  <td className="py-2 px-3">{getDepartment(app) || "—"}</td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    {getSession(app) || "—"}
                  </td>
                  <td className="py-2 px-3 font-semibold">
                    {typeof app.score === "number" ? app.score : "—"}
                  </td>
                </tr>
              );
            })}
            {scoreRankedApplications.length === 0 && (
              <tr>
                <td className="py-6 text-center text-gray-500" colSpan={7}>
                  {selectedForm
                    ? "No applications match the current filters."
                    : "No form selected."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="space-y-4">
        {!selectedForm && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-yellow-800">
            Select a form to view its applications.
          </div>
        )}
        {expandedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setExpandedId(null)}
            />
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <ApplicationCard
                key={expandedApp.id}
                app={expandedApp}
                schema={schema}
                expanded={true}
                onToggle={() => setExpandedId(null)}
                selected={selectedIds.includes(expandedApp.id)}
                onSelect={() => toggleSelect(expandedApp.id)}
                onReject={() => openRejectModal(expandedApp.id)}
                disciplinaryState={disciplinaryState}
              />
            </div>
          </div>
        )}
        {/* Empty state is already rendered inside the table to avoid duplication */}
      </section>

      {interviewModal.open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto space-y-4 border border-purple-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Schedule Interview
            </h2>
            <div className="space-y-3">
              <input
                type="date"
                value={interviewModal.date}
                onChange={(e) =>
                  setInterviewModal((modal) => ({
                    ...modal,
                    date: e.target.value,
                  }))
                }
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="time"
                value={interviewModal.time}
                onChange={(e) =>
                  setInterviewModal((modal) => ({
                    ...modal,
                    time: e.target.value,
                  }))
                }
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="text"
                value={interviewModal.venue}
                onChange={(e) =>
                  setInterviewModal((modal) => ({
                    ...modal,
                    venue: e.target.value,
                  }))
                }
                placeholder="Venue"
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={scheduleInterview}
                className="flex-1 px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-600"
              >
                Save
              </button>
              <button
                onClick={() =>
                  setInterviewModal({
                    open: false,
                    date: "",
                    time: "",
                    venue: "",
                  })
                }
                className="flex-1 px-4 py-2 bg-sky-200 text-sky-900 rounded hover:bg-sky-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {rejectModal.open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div
            className="absolute inset-0"
            onClick={() =>
              !rejectModal.submitting &&
              setRejectModal({
                open: false,
                appId: null,
                reason: "",
                submitting: false,
                error: "",
              })
            }
          />
          <div className="relative bg-white rounded-xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto space-y-4 border border-red-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Reject Application
            </h2>
            <p className="text-sm text-gray-600">
              Provide a reason. The student will see it.
            </p>

            <textarea
              value={rejectModal.reason}
              onChange={(e) =>
                setRejectModal((m) => ({ ...m, reason: e.target.value }))
              }
              rows={4}
              placeholder="Write the rejection reason…"
              className="w-full border rounded px-3 py-2"
              disabled={rejectModal.submitting}
            />
            {rejectModal.error ? (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">
                {rejectModal.error}
              </div>
            ) : null}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={submitReject}
                disabled={rejectModal.submitting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-60"
              >
                {rejectModal.submitting ? "Rejecting…" : "Confirm Reject"}
              </button>
              <button
                type="button"
                onClick={() =>
                  setRejectModal({
                    open: false,
                    appId: null,
                    reason: "",
                    submitting: false,
                    error: "",
                  })
                }
                disabled={rejectModal.submitting}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300 disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ApplicationCard({
  app,
  schema,
  expanded,
  onToggle,
  selected,
  onSelect,
  onReject,
  disciplinaryState,
}) {
  const interviewDetails = app.interview;
  const totalMaxScore = getFormTotalMaxScore(schema);
  const appScore =
    typeof app.score === "number" ? app.score : asNumber(app.score);

  const allAttachments = Array.isArray(app.attachments) ? app.attachments : [];
  const schemaIds = new Set((schema || []).map((f) => String(f.id)));
  const normalizeForMatch = (v) =>
    String(v || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "");

  // Best-effort mapping for old/invalid attachments that lack fieldId or refer to a previous schema.
  // This keeps student-side unchanged, but helps admins see docs on the right field.
  const unmatchedRaw = allAttachments.filter(
    (att) => !att?.fieldId || !schemaIds.has(String(att.fieldId))
  );
  const missingDocFields = (schema || [])
    .filter((f) => !!f?.requiresDocument)
    .filter(
      (f) =>
        !allAttachments.some(
          (att) => att?.fieldId && String(att.fieldId) === String(f.id)
        )
    );

  const autoAssignedByFieldId = {};
  if (unmatchedRaw.length && missingDocFields.length) {
    const remaining = [...unmatchedRaw];

    // 1) Try match by field label / document label in file name
    for (const field of missingDocFields) {
      const needles = [
        normalizeForMatch(field?.documentLabel),
        normalizeForMatch(field?.label),
        normalizeForMatch(field?.id),
      ].filter(Boolean);
      if (!needles.length) continue;

      const idx = remaining.findIndex((att) => {
        const hay = normalizeForMatch(att?.name || att?.url);
        return needles.some((n) => hay.includes(n));
      });
      if (idx >= 0) {
        const picked = remaining.splice(idx, 1)[0];
        autoAssignedByFieldId[String(field.id)] = [picked];
      }
    }

    // 2) If still ambiguous but counts line up, assign by order.
    const stillMissing = missingDocFields.filter(
      (f) => !autoAssignedByFieldId[String(f.id)]
    );
    if (stillMissing.length && remaining.length) {
      if (remaining.length === 1 && stillMissing.length === 1) {
        autoAssignedByFieldId[String(stillMissing[0].id)] = [remaining[0]];
      } else if (remaining.length === stillMissing.length) {
        stillMissing.forEach((f, i) => {
          autoAssignedByFieldId[String(f.id)] = [remaining[i]];
        });
      }
    }
  }

  const autoAssignedUrls = new Set(
    Object.values(autoAssignedByFieldId)
      .flat()
      .map((a) => a?.url)
      .filter(Boolean)
  );
  return (
    <article className="bg-white border-2 border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={selected}
            onChange={onSelect}
            className="mt-1"
          />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {app.applicant.name}
            </h2>
            <p className="text-sm text-gray-600">
              {app.applicant.studentId} • {app.applicant.email}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Submitted on {formatDate(app.submittedAt)} • {app.formName}
            </p>
            {interviewDetails && (
              <p className="text-xs text-purple-700 mt-2 whitespace-normal break-words">
                Interview on {formatDate(interviewDetails.date)} at{" "}
                {interviewDetails.time} • {interviewDetails.venue}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
            📊 {Number.isInteger(appScore) ? appScore : appScore.toFixed(2)} /{" "}
            {Number.isInteger(totalMaxScore)
              ? totalMaxScore
              : totalMaxScore.toFixed(2)}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${
              statusStyles[app.stage] ??
              "bg-gray-100 text-gray-700 border-gray-200"
            }`}
          >
            {prettyStatus(app.stage)}
          </span>
          <button
            onClick={onToggle}
            className="text-sm font-medium text-sky-600 hover:text-sky-700"
          >
            {expanded ? "Hide details ▲" : "View details ▼"}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-200 bg-gray-50 p-5 space-y-4">
          {String(app?.stage || "").toLowerCase() === "rejected" ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-sm font-semibold text-red-800">
                Rejection Reason
              </div>
              <div className="mt-1 text-sm text-red-700 whitespace-pre-wrap break-words">
                {app?.rejectionReason ? app.rejectionReason : "Not provided"}
              </div>
            </div>
          ) : null}

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm font-semibold text-gray-900">
              Score Summary
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-sm">
              <span className="px-2 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                Current:{" "}
                {Number.isInteger(appScore) ? appScore : appScore.toFixed(2)}
              </span>
              <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                Max:{" "}
                {Number.isInteger(totalMaxScore)
                  ? totalMaxScore
                  : totalMaxScore.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm font-semibold text-gray-900">
              Student Details
            </div>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
              <div>
                <span className="text-gray-500">Name:</span>{" "}
                {app?.applicant?.name || "—"}
              </div>
              <div>
                <span className="text-gray-500">Student ID:</span>{" "}
                {app?.applicant?.studentId || "—"}
              </div>
              <div>
                <span className="text-gray-500">Email:</span>{" "}
                {app?.applicant?.email || "—"}
              </div>
              <div>
                <span className="text-gray-500">Program:</span>{" "}
                {prettyProgramLevel(app?.applicant?.programLevel)}
              </div>
              <div>
                <span className="text-gray-500">Dept:</span>{" "}
                {app?.applicant?.department || "—"}
              </div>
              <div>
                <span className="text-gray-500">Session:</span>{" "}
                {app?.applicant?.session || "—"}
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm font-semibold text-gray-900">
              Disciplinary Records
            </div>
            {disciplinaryState?.loading ? (
              <div className="text-sm text-gray-500 mt-2">Loading…</div>
            ) : disciplinaryState?.error ? (
              <div className="text-sm text-red-600 mt-2">
                {disciplinaryState.error}
              </div>
            ) : (disciplinaryState?.records || []).length === 0 ? (
              <div className="text-sm text-gray-500 mt-2">
                No disciplinary records found.
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                {(disciplinaryState.records || []).map((r, idx) => (
                  <div
                    key={`${app.id}-disc-${idx}`}
                    className="border border-gray-200 rounded p-3"
                  >
                    <div className="text-sm font-semibold text-gray-900">
                      {r?.offenseType || r?.type || "Record"}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {r?.createdAt
                        ? formatDate(r.createdAt)
                        : r?.recordedAt
                        ? formatDate(r.recordedAt)
                        : ""}
                      {r?.severity ? ` • Severity: ${r.severity}` : ""}
                    </div>
                    {r?.description ? (
                      <div className="text-sm text-gray-700 mt-2 whitespace-pre-wrap break-words">
                        {r.description}
                      </div>
                    ) : null}
                    {r?.actionTaken ? (
                      <div className="text-sm text-gray-700 mt-2">
                        <span className="text-gray-500">Action:</span>{" "}
                        {r.actionTaken}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schema.map((field) => {
              const value = app.data[field.id];

              const requirement = String(
                field?.documentRequirement || "MANDATORY"
              )
                .trim()
                .toUpperCase();
              const docMandatory =
                !!field.requiresDocument && requirement === "MANDATORY";
              const noneSelected =
                String(field?.type || "").toLowerCase() === "dropdown" &&
                String(value ?? "")
                  .trim()
                  .toLowerCase() === "none";
              const emptySelected =
                String(field?.type || "").toLowerCase() === "dropdown" &&
                String(value ?? "").trim() === "";
              const showMissingDocument =
                docMandatory && !(noneSelected || emptySelected);

              const directAttachments = allAttachments.filter(
                (att) =>
                  att?.fieldId && String(att.fieldId) === String(field.id)
              );

              const fieldAttachments =
                directAttachments.length > 0
                  ? directAttachments
                  : autoAssignedByFieldId[String(field.id)] || [];

              const fieldMax = getFieldMaxScore(field);
              const fieldCurrent = getFieldCurrentScore(field, value);
              return (
                <div
                  key={`${app.id}-${field.id}`}
                  className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm"
                >
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {field.label}
                  </p>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatFieldValue(field, value)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                      Max:{" "}
                      {Number.isInteger(fieldMax)
                        ? fieldMax
                        : fieldMax.toFixed(2)}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                      Current:{" "}
                      {Number.isInteger(fieldCurrent)
                        ? fieldCurrent
                        : fieldCurrent.toFixed(2)}
                    </span>
                  </div>

                  {fieldAttachments.length > 0 ? (
                    <div className="text-xs mt-2 flex items-start gap-2">
                      <span className="text-emerald-700">📎</span>
                      <div className="flex flex-col gap-1">
                        {fieldAttachments.map((att, idx) => (
                          <a
                            key={`${app.id}-${field.id}-att-${att?.url || idx}`}
                            href={toPublicUrl(att.url)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-700 hover:text-emerald-800 underline break-all"
                            title="Open document"
                          >
                            {att?.name || att?.url || `Document ${idx + 1}`}
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

          {Array.isArray(app.attachments) && app.attachments.length > 0
            ? (() => {
                const unmatched = (app.attachments || [])
                  .filter(
                    (att) =>
                      !att?.fieldId || !schemaIds.has(String(att.fieldId))
                  )
                  .filter((att) => !autoAssignedUrls.has(att?.url));
                if (!unmatched.length) return null;

                return (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                      Unmatched Attachments
                    </h4>
                    <div className="flex flex-col gap-1">
                      {unmatched.map((att, idx) => (
                        <a
                          key={`${app.id}-unmatched-att-${att?.url || idx}`}
                          href={toPublicUrl(att.url)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-sky-700 hover:text-sky-800 underline break-all"
                          title="Open attachment"
                        >
                          {att?.name || att?.url || `Attachment ${idx + 1}`}
                        </a>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      These files couldn’t be matched to a form field.
                    </p>
                  </div>
                );
              })()
            : null}

          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
            {app.stage !== "scheduled" && app.stage !== "rejected" && (
              <button
                onClick={() =>
                  document.dispatchEvent(
                    new CustomEvent("open-interview-modal", {
                      detail: { appId: app.id },
                    })
                  )
                }
                className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Schedule Interview
              </button>
            )}
            {app.stage !== "rejected" && (
              <button
                onClick={onReject}
                className="px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-600 text-sm font-medium"
              >
                Reject
              </button>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

function SummaryCard({ title, value, tone }) {
  const toneMap = {
    blue: "bg-blue-50 text-blue-800 border-blue-200",
    purple: "bg-purple-50 text-purple-800 border-purple-200",
    teal: "bg-teal-50 text-teal-800 border-teal-200",
    indigo: "bg-indigo-50 text-indigo-800 border-indigo-200",
    orange: "bg-orange-50 text-orange-800 border-orange-200",
    red: "bg-red-50 text-red-800 border-red-200",
  };

  return (
    <div
      className={`rounded-xl border-2 p-4 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 cursor-pointer ${
        toneMap[tone] ?? "bg-gray-50 text-gray-800 border-gray-200"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
        {title}
      </p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
