import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import DynamicFormRenderer from "../../components/DynamicFormRenderer.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../lib/apiClient.js";
import notify from "../../lib/notify.js";

// Helper: derive hall from studentId if not allocated yet
function inferHallIdFromStudent(user) {
  // If already allocated, use that
  if (user.hallId) return user.hallId;

  // If not allocated but has studentId, infer from ID prefix
  if (user.studentId) {
    const prefix = user.studentId.substring(0, 3).toUpperCase();
    // Map common hall prefixes
    const hallMap = {
      MUH: "hall-muh",
      ASH: "hall-ash",
      SFH: "hall-sfh",
      BAH: "hall-bah",
    };
    return hallMap[prefix] || null;
  }

  return null;
}

export default function FormFill() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedForm, setSelectedForm] = useState(null);
  const [blocked, setBlocked] = useState(false);
  const [checkingDup, setCheckingDup] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [reviewOpen, setReviewOpen] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState(null);

  const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

  const isNoneSelection = (value) => {
    const s = String(value ?? "").trim();
    if (!s) return true;
    return s.toLowerCase() === "none";
  };

  const shouldRequireDocumentForField = (field, value) => {
    if (!field?.requiresDocument) return false;
    const requirement = String(field?.documentRequirement || "MANDATORY")
      .trim()
      .toUpperCase();
    if (requirement !== "MANDATORY") return false;

    if (String(field?.type || "").toLowerCase() === "dropdown") {
      return !isNoneSelection(value);
    }

    return true;
  };

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.onload = () => resolve(String(reader.result || ""));
      reader.readAsDataURL(file);
    });

  const uploadSelectedAttachments = async (attachmentsMap) => {
    const entries = Object.entries(attachmentsMap || {}).filter(
      ([, file]) => !!file
    );
    if (entries.length === 0) return {};

    for (const [, file] of entries) {
      if (file.size > MAX_UPLOAD_BYTES) {
        throw new Error("File too large. Maximum size is 5MB.");
      }
    }

    const files = await Promise.all(
      entries.map(async ([fieldId, file]) => ({
        fieldId,
        fileName: file.name,
        contentType: file.type,
        data: await fileToDataUrl(file),
      }))
    );

    const res = await api.post("/uploads/base64", { files });
    const uploadedFiles = res?.data?.files || [];

    const byFieldId = {};
    for (const f of uploadedFiles) {
      if (f?.fieldId) byFieldId[f.fieldId] = f;
    }
    return byFieldId;
  };

  const formatApiError = (err) => {
    const status = err?.response?.status;
    const message =
      err?.response?.data?.message || err?.message || "Submission failed";
    return status ? `${message} (HTTP ${status})` : message;
  };

  const formatFieldValue = (field, value) => {
    if (value === null || value === undefined || value === "") return "—";
    if (Array.isArray(value)) return value.length ? value.join(", ") : "—";

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

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/forms/student/active");
        if (!ignore) {
          setSelectedForm(data?.data || null);
        }
      } catch (err) {
        if (!ignore) {
          // If no active form is available (often because the student already submitted),
          // show a friendly message with a link to view details.
          if (err?.response?.status === 404) {
            setSelectedForm(null);
            setError("");
            setBlocked(true);
            return;
          }

          const message =
            err.response?.data?.message ||
            "No active form available for you right now.";
          setError(message);
          setSelectedForm(null);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [user?.hallId, user?.studentId]);

  // Prevent duplicate applications: if already applied for this form, warn and redirect
  useEffect(() => {
    let cancelled = false;
    async function checkDuplicate() {
      if (!selectedForm?.id) return;
      setCheckingDup(true);
      try {
        const res = await api.get("/forms/student/applications");
        const apps = res.data?.data || [];
        const already = apps.some(
          (a) =>
            (a.formId && a.formId === selectedForm.id) ||
            (a.formTitle &&
              selectedForm.title &&
              a.formTitle === selectedForm.title)
        );
        if (already && !cancelled) {
          setBlocked(true);
        }
      } catch (_) {
        // ignore; backend will still prevent duplicates on submit
      } finally {
        if (!cancelled) setCheckingDup(false);
      }
    }
    checkDuplicate();
    return () => {
      cancelled = true;
    };
  }, [selectedForm?.id, selectedForm?.title, nav]);

  const doSubmit = async ({ data, attachments }) => {
    if (!selectedForm?.id) return;
    setError("");
    setSubmitting(true);
    try {
      const uploadedByFieldId = await uploadSelectedAttachments(attachments);

      const appendQueryParam = (rawUrl, key, value) => {
        if (!rawUrl) return "";
        try {
          const url = new URL(String(rawUrl), window.location.origin);
          url.searchParams.set(String(key), String(value));
          return `${url.pathname}${url.search}`;
        } catch (_) {
          const s = String(rawUrl);
          const joiner = s.includes("?") ? "&" : "?";
          return `${s}${joiner}${encodeURIComponent(
            String(key)
          )}=${encodeURIComponent(String(value))}`;
        }
      };

      const attachmentPayload = {};
      Object.entries(attachments || {}).forEach(([fieldId, file]) => {
        if (!file) return;
        const uploaded = uploadedByFieldId[fieldId];
        if (!uploaded?.url) return;
        attachmentPayload[fieldId] = {
          name: uploaded.name || file.name,
          type: uploaded.type || file.type,
          // Persist fieldId in URL for later mapping (static server ignores query string)
          url: appendQueryParam(uploaded.url, "fieldId", fieldId),
        };
      });

      await api.post(`/forms/${selectedForm.id}/submit`, {
        data,
        attachments: attachmentPayload,
      });
      notify.success("Application submitted successfully");
      nav("/student/applications");
    } catch (err) {
      console.error("[FormFill] submit failed", err);
      setError(formatApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmit = async ({ data, attachments }) => {
    const schema = Array.isArray(selectedForm?.schema)
      ? selectedForm.schema
      : [];
    const missingDocs = [];
    for (const field of schema) {
      const value = data?.[field.id];
      if (!shouldRequireDocumentForField(field, value)) continue;
      const file = attachments?.[field.id];
      if (!file) {
        missingDocs.push(field.documentLabel || field.label || field.id);
      }
    }

    if (missingDocs.length) {
      notify.error(
        `Please upload required documents: ${missingDocs.join(", ")}`
      );
      return;
    }

    // Show confirmation + overview before the final submission.
    setPendingSubmission({ data: data || {}, attachments: attachments || {} });
    setReviewOpen(true);
  };

  // Ensure the modal is always visible and the background doesn't scroll.
  useEffect(() => {
    if (!reviewOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [reviewOpen]);

  const reviewModal = reviewOpen
    ? createPortal(
        <div className="fixed inset-0 z-[100] grid place-items-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => (submitting ? null : setReviewOpen(false))}
          />

          <div className="relative w-full max-w-3xl max-h-[85vh] rounded-2xl shadow-xl border border-white/60 bg-gradient-to-r from-white/95 via-sky-50/80 to-emerald-50/70 backdrop-blur flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  Review your application
                </div>
                <div className="text-sm text-gray-600 mt-0.5">
                  Fill up carefully. Any mismatch or false information will
                  reject your application.
                </div>
              </div>
              <button
                type="button"
                disabled={submitting}
                onClick={() => setReviewOpen(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close"
                title="Close"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(selectedForm?.schema || []).map((field) => {
                  const value = pendingSubmission?.data?.[field.id];
                  const file =
                    pendingSubmission?.attachments?.[field.id] || null;
                  const showDocPreview = shouldRequireDocumentForField(
                    field,
                    value
                  );
                  return (
                    <div
                      key={`review-${field.id}`}
                      className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                    >
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {field.label || field.id}
                      </div>
                      <div className="text-sm text-gray-900 mt-1 break-words">
                        {formatFieldValue(field, value)}
                      </div>

                      {showDocPreview ? (
                        <div className="text-xs mt-2 flex items-center gap-2">
                          <span className="text-emerald-700">📎</span>
                          {file ? (
                            <span className="text-emerald-800 font-medium break-all">
                              {file?.name || "Selected document"}
                            </span>
                          ) : (
                            <span className="text-gray-500">
                              Document not selected
                            </span>
                          )}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setReviewOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-semibold"
              >
                Edit
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={async () => {
                  if (!pendingSubmission) return;
                  await doSubmit(pendingSubmission);
                  setReviewOpen(false);
                  setPendingSubmission(null);
                }}
                className="px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 text-sm font-semibold"
              >
                {submitting ? "Submitting…" : "Confirm & Submit"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/60 bg-gradient-to-r from-white/95 via-sky-50/80 to-emerald-50/70 p-6 shadow-sm backdrop-blur">
        Loading form...
      </div>
    );
  }

  if (blocked) {
    return (
      <div className="rounded-2xl border border-white/60 bg-gradient-to-r from-white/95 via-sky-50/80 to-emerald-50/70 p-6 shadow-sm backdrop-blur">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
          <div className="shrink-0 text-amber-700" aria-hidden="true">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6"
            >
              <path
                fillRule="evenodd"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm.75 5.25a.75.75 0 00-1.5 0v6a.75.75 0 001.5 0v-6zm-1.5 9a.75.75 0 101.5 0 .75.75 0 00-1.5 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-amber-900">
              You’ve already submitted the active application form
            </h3>
            <p className="text-sm text-amber-800 mt-1">
              You can view your submission details in My Applications.
            </p>
            <div className="mt-3">
              <button
                onClick={() => nav("/student/applications", { replace: true })}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 text-sm font-semibold"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedForm) {
    return (
      <div className="rounded-2xl border border-white/60 bg-gradient-to-r from-white/95 via-sky-50/80 to-emerald-50/70 p-6 shadow-sm backdrop-blur">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          No Forms Available
        </h2>
        <p className="text-gray-600">
          {error ||
            "There are currently no active admission forms for your hall. Please check back later or contact your hall administrator."}
        </p>
      </div>
    );
  }

  if (checkingDup) {
    return (
      <div className="rounded-2xl border border-white/60 bg-gradient-to-r from-white/95 via-sky-50/80 to-emerald-50/70 p-6 shadow-sm backdrop-blur">
        Checking your eligibility…
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/60 bg-gradient-to-r from-white/95 via-sky-50/80 to-emerald-50/70 p-6 shadow-sm backdrop-blur space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          {selectedForm?.title || selectedForm?.name || "Hall Admission Form"}
        </h2>
        <p className="text-sm text-gray-600">
          Complete the form below to apply for accommodation in your hall.
        </p>
        {selectedForm?.sessionYears?.length > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            Eligible Sessions: {selectedForm.sessionYears.join(", ")}
          </p>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="font-semibold text-amber-900">Warning</div>
        <div className="text-sm text-amber-800 mt-1">
          Fill up carefully. Any mismatch or false information will reject your
          application.
        </div>
      </div>

      {selectedForm && (
        <DynamicFormRenderer
          schema={selectedForm.schema || []}
          onSubmit={onSubmit}
          submitLabel={submitting ? "Submitting…" : "Submit Application"}
          submitViaButtonOnly
        />
      )}

      {reviewModal}
    </div>
  );
}
