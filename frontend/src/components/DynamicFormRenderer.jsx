import React, { useEffect, useState } from "react";
import api from "../lib/apiClient.js";

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

const getCurrentValueScore = (field, value) => {
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
    const selected = String(value || "").trim();
    if (!selected) return 0;
    if (selected.toLowerCase() === "none") return 0;
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

  // text/date: treat as fixed points if non-empty
  const s = String(value ?? "").trim();
  return s ? asNumber(field.score) : 0;
};

export default function DynamicFormRenderer({
  schema = [],
  onSubmit,
  submitLabel = "Submit",
  submitViaButtonOnly = false,
}) {
  const [form, setForm] = useState({});
  const [files, setFiles] = useState({});

  const update = (id, value) => {
    setForm((f) => ({ ...f, [id]: value }));
  };

  const updateFile = (id, file) => {
    setFiles((prev) => ({ ...prev, [id]: file }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({ data: form, attachments: files });
  };

  return (
    <form
      onSubmit={submitViaButtonOnly ? (e) => e.preventDefault() : handleSubmit}
      className="grid gap-4"
    >
      {schema.map((field) => (
        <Field
          key={field.id}
          field={field}
          value={form[field.id]}
          fileValue={files[field.id]}
          onChange={(v) => update(field.id, v)}
          onFileChange={(file) => updateFile(field.id, file)}
        />
      ))}
      <div>
        <button
          type={submitViaButtonOnly ? "button" : "submit"}
          onClick={submitViaButtonOnly ? handleSubmit : undefined}
          className="btn-primary w-full sm:w-auto"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

function Field({ field, value, fileValue, onChange, onFileChange }) {
  const base = "input-field text-sm";

  const isOptional = !field.required;
  const kind = String(field?.fieldConfig?.kind || "").toUpperCase();
  const accent = (() => {
    if (isOptional) return "border-l-4 border-l-slate-300";
    if (kind === "BD_ADDRESS") return "border-l-4 border-l-emerald-500";
    return "border-l-4 border-l-brand-600";
  })();

  return (
    <div
      className={`rounded-xl border border-white/60 bg-gradient-to-r from-white/95 via-sky-50/80 to-emerald-50/70 p-4 shadow-sm backdrop-blur grid gap-2 ${accent}`}
    >
      <FieldInner
        field={field}
        value={value}
        fileValue={fileValue}
        onChange={onChange}
        onFileChange={onFileChange}
        base={base}
      />
    </div>
  );
}

function FieldInner({ field, value, fileValue, onChange, onFileChange, base }) {
  const kind = String(field?.fieldConfig?.kind || "").toUpperCase();
  const docRequirement = String(field?.documentRequirement || "MANDATORY")
    .trim()
    .toUpperCase();

  const isNoneSelection = (v) => {
    const s = String(v ?? "").trim();
    if (!s) return true;
    return s.toLowerCase() === "none";
  };

  const dropdownNoSelection =
    String(field?.type || "").toLowerCase() === "dropdown" &&
    isNoneSelection(value);

  const docMandatory =
    field.requiresDocument &&
    docRequirement === "MANDATORY" &&
    !dropdownNoSelection;

  const maxScore = getFieldMaxScore(field);
  const currentScore = getCurrentValueScore(field, value);

  const ScoreBadges = () => {
    if (maxScore <= 0) return null;
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-xs font-semibold">
          Max: {maxScore}
        </span>
        <span className="inline-flex items-center px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 text-xs font-semibold">
          Current:{" "}
          {Number.isInteger(currentScore)
            ? currentScore
            : Number(currentScore).toFixed(2)}
        </span>
      </div>
    );
  };

  const requiredMark = field.required ? (
    <span className="text-red-600"> *</span>
  ) : (
    <span className="text-xs text-gray-400 ml-1">(optional)</span>
  );

  if (field.type === "text" && kind === "BD_ADDRESS") {
    return (
      <div className="grid gap-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-gray-800">
              {field.label}
              {requiredMark}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              Pick district and upazila (Bangladesh fixed list).
            </div>
          </div>
          <ScoreBadges />
        </div>

        <BdAddressField
          idPrefix={field.id}
          value={value}
          onChange={onChange}
          required={field.required}
          base={base}
        />

        {field.requiresDocument && (
          <div className="mt-2">
            <label className="text-xs text-gray-600 block mb-1">
              {field.documentLabel || "Upload Document"}
              {docMandatory && <span className="text-red-600"> *</span>}
            </label>
            <input
              type="file"
              className="text-sm w-full file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              required={docMandatory}
              onChange={(e) => onFileChange?.(e.target.files?.[0] || null)}
            />
            {fileValue && (
              <p className="text-xs text-green-600 mt-1">✓ {fileValue.name}</p>
            )}
          </div>
        )}
      </div>
    );
  }

  if (
    field.type === "text" ||
    field.type === "number" ||
    field.type === "date"
  ) {
    return (
      <label className="grid gap-1">
        <span className="flex items-start justify-between gap-3">
          <span className="text-sm font-medium text-gray-700">
            {field.label}
            {requiredMark}
          </span>
          <ScoreBadges />
        </span>
        <input
          type={field.type === "number" ? "number" : field.type}
          className={base}
          required={field.required}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
        {field.requiresDocument && (
          <div className="mt-2">
            <label className="text-xs text-gray-600 block mb-1">
              {field.documentLabel || "Upload Document"}
              {docMandatory && <span className="text-red-600"> *</span>}
            </label>
            <input
              type="file"
              className="text-sm w-full file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              required={docMandatory}
              onChange={(e) => onFileChange?.(e.target.files?.[0] || null)}
            />
            {fileValue && (
              <p className="text-xs text-green-600 mt-1">✓ {fileValue.name}</p>
            )}
          </div>
        )}
      </label>
    );
  }

  if (field.type === "dropdown") {
    const optionScores = getOptionScoreMap(field);

    const cleanOptions = (field.options || [])
      .map((o) => String(o ?? "").trim())
      .filter(Boolean)
      .filter((o) => o.toLowerCase() !== "none");

    const selectValue = isNoneSelection(value) ? "" : String(value ?? "");

    return (
      <label className="grid gap-1">
        <span className="flex items-start justify-between gap-3">
          <span className="text-sm font-medium text-gray-700">
            {field.label}
            {requiredMark}
          </span>
          <ScoreBadges />
        </span>
        <select
          className={base}
          required={field.required}
          value={selectValue}
          onChange={(e) => {
            const next = e.target.value;
            onChange(next);
            if (isNoneSelection(next)) {
              onFileChange?.(null);
            }
          }}
        >
          <option value="">None</option>
          {cleanOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
              {Number.isFinite(Number(optionScores[opt]))
                ? ` (+${asNumber(optionScores[opt])})`
                : ""}
            </option>
          ))}
        </select>
        {field.requiresDocument ? (
          dropdownNoSelection ? (
            <div className="mt-2 text-xs text-gray-500">
              No document needed when “None” is selected.
            </div>
          ) : (
            <div className="mt-2">
              <label className="text-xs text-gray-600 block mb-1">
                {field.documentLabel || "Upload Document"}
                {docMandatory && <span className="text-red-600"> *</span>}
              </label>
              <input
                type="file"
                className="text-sm w-full file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required={docMandatory}
                onChange={(e) => onFileChange?.(e.target.files?.[0] || null)}
              />
              {fileValue && (
                <p className="text-xs text-green-600 mt-1">
                  ✓ {fileValue.name}
                </p>
              )}
            </div>
          )
        ) : null}
      </label>
    );
  }

  if (field.type === "checkbox") {
    const arr = Array.isArray(value) ? value : [];
    const toggle = (opt) => {
      if (arr.includes(opt)) {
        onChange(arr.filter((o) => o !== opt));
      } else {
        onChange([...arr, opt]);
      }
    };
    const optionScores = getOptionScoreMap(field);
    return (
      <fieldset className="grid gap-2">
        <div className="flex items-start justify-between gap-3">
          <legend className="text-sm font-medium text-gray-700">
            {field.label}
            {requiredMark}
          </legend>
          <ScoreBadges />
        </div>
        <div className="flex flex-wrap gap-3">
          {(field.options || []).map((opt) => (
            <label key={opt} className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={arr.includes(opt)}
                onChange={() => toggle(opt)}
              />
              <span>
                {opt}
                {Number.isFinite(Number(optionScores[opt])) ? (
                  <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                    +{asNumber(optionScores[opt])}
                  </span>
                ) : null}
              </span>
            </label>
          ))}
        </div>
        {field.requiresDocument && (
          <div className="mt-2">
            <label className="text-xs text-gray-600 block mb-1">
              {field.documentLabel || "Upload Document"}
              {docMandatory && <span className="text-red-600"> *</span>}
            </label>
            <input
              type="file"
              className="text-sm w-full file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              required={docMandatory}
              onChange={(e) => onFileChange?.(e.target.files?.[0] || null)}
            />
            {fileValue && (
              <p className="text-xs text-green-600 mt-1">✓ {fileValue.name}</p>
            )}
          </div>
        )}
      </fieldset>
    );
  }

  return null;
}

function BdAddressField({ idPrefix, value, onChange, required, base }) {
  const [districts, setDistricts] = useState([]);
  const [upazilas, setUpazilas] = useState([]);

  const current =
    value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const district = String(current.district || "");
  const upazila = String(current.upazila || "");

  const isSpecialDistrict = ["abroad"].includes(
    String(district || "")
      .trim()
      .toLowerCase()
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get("/forms/address/bd/districts");
        const list = Array.isArray(res?.data?.districts)
          ? res.data.districts
          : [];
        if (!cancelled) setDistricts(list);
      } catch (_) {
        if (!cancelled) setDistricts([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const d = String(district || "").trim();
    if (!d) {
      setUpazilas([]);
      return undefined;
    }

    if (isSpecialDistrict) {
      setUpazilas(["N/A"]);
      // Ensure upazila is always valid for special districts.
      if (String(upazila || "").trim() !== "N/A") {
        onChange?.({ district: d, upazila: "N/A" });
      }
      return undefined;
    }

    (async () => {
      try {
        const res = await api.get("/forms/address/bd/upazilas", {
          params: { district: d },
        });
        const list = Array.isArray(res?.data?.upazilas)
          ? res.data.upazilas
          : [];
        if (!cancelled) setUpazilas(list);
      } catch (_) {
        if (!cancelled) setUpazilas([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [district]);

  const clearAll = () => {
    onChange?.({ district: "", upazila: "" });
  };

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-gray-500">
          Use search to select from the list.
        </div>
        <button
          type="button"
          onClick={clearAll}
          className="btn-secondary px-3 py-1.5 text-xs"
        >
          Clear
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-2">
        <div className="grid gap-1">
          <span className="text-xs font-semibold text-gray-600">District</span>
          <input
            list={`bd-districts-${idPrefix || "x"}`}
            className={base}
            value={district}
            required={required}
            onChange={(e) => {
              const nextDistrict = e.target.value;
              onChange?.({ district: nextDistrict, upazila: "" });
            }}
            placeholder="Search district..."
          />
          <datalist id={`bd-districts-${idPrefix || "x"}`}>
            {(districts || []).map((d) => (
              <option key={d} value={d} />
            ))}
          </datalist>
        </div>

        <div className="grid gap-1">
          <span className="text-xs font-semibold text-gray-600">Upazila</span>
          <input
            list={`bd-upazilas-${idPrefix || "x"}`}
            className={base}
            value={upazila}
            required={required}
            onChange={(e) => {
              const nextUpazila = e.target.value;
              onChange?.({ district, upazila: nextUpazila });
            }}
            placeholder={
              district ? "Search upazila..." : "Select district first"
            }
            disabled={!String(district || "").trim() || isSpecialDistrict}
          />
          <datalist id={`bd-upazilas-${idPrefix || "x"}`}>
            {(upazilas || []).map((u) => (
              <option key={u} value={u} />
            ))}
          </datalist>
        </div>
      </div>
    </div>
  );
}
