import React, { useEffect, useState } from "react";
import api from "../lib/apiClient.js";

const fieldTypes = ["text", "number", "date", "dropdown", "checkbox"];

const makeFieldId = () =>
  `fld-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const normalizeFieldType = (type) => {
  switch (type) {
    case "text":
    case "number":
    case "date":
    case "dropdown":
    case "checkbox":
      return type;
    case "select":
      return "dropdown";
    default:
      return "text";
  }
};

const toOptionsArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    return value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
};

const normalizeField = (field, idx) => {
  const type = normalizeFieldType(field.type);
  const options =
    type === "dropdown" || type === "checkbox"
      ? toOptionsArray(field.options)
      : [];
  const optionsText =
    type === "dropdown" || type === "checkbox"
      ? typeof field.optionsText === "string"
        ? field.optionsText
        : options.join(", ")
      : "";
  const normalizeOptionScores = (raw, optionList) => {
    if (type !== "dropdown" && type !== "checkbox") return null;
    const map =
      raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
    const normalized = {};
    (optionList || []).forEach((opt) => {
      const key = String(opt);
      const val = Number(map[key] ?? 0);
      normalized[key] = Number.isFinite(val) ? val : 0;
    });
    return normalized;
  };
  const parsedScore = Number(field.score ?? 0);
  const requiresDocument = Boolean(
    field.requiresDocument ?? field.documentRequired
  );
  const requirementRaw =
    field.documentRequirement ||
    (requiresDocument ? "MANDATORY" : "RECOMMENDED");
  const documentRequirement =
    String(requirementRaw).toUpperCase() === "RECOMMENDED"
      ? "RECOMMENDED"
      : "MANDATORY";

  const normalizeScoringRules = (rawRules) => {
    if (!rawRules || typeof rawRules !== "object") return null;
    const mode = String(rawRules.mode || rawRules.type || "").toUpperCase();
    if (
      mode &&
      mode !== "RANGE_PERCENT" &&
      mode !== "RANGES" &&
      mode !== "PERCENT_RANGES"
    )
      return null;

    const rawRanges = Array.isArray(rawRules.ranges)
      ? rawRules.ranges
      : Array.isArray(rawRules.rules)
      ? rawRules.rules
      : [];

    const ranges = rawRanges
      .map((r) => {
        if (!r || typeof r !== "object") return null;
        const min = r.min ?? r.from;
        const max = r.max ?? r.to;
        const percent = r.percent ?? r.percentage;

        const parsedPercent = Number(percent);
        if (!Number.isFinite(parsedPercent)) return null;

        const parsedMin =
          min === "" || min === null || min === undefined ? null : Number(min);
        const parsedMax =
          max === "" || max === null || max === undefined ? null : Number(max);
        if (parsedMin !== null && !Number.isFinite(parsedMin)) return null;
        if (parsedMax !== null && !Number.isFinite(parsedMax)) return null;

        return {
          min: parsedMin,
          max: parsedMax,
          percent: Math.max(0, Math.min(100, parsedPercent)),
        };
      })
      .filter(Boolean);

    if (!ranges.length) return null;

    const defaultPercent = Number(
      rawRules.defaultPercent ?? rawRules.default ?? 0
    );
    return {
      mode: "RANGE_PERCENT",
      defaultPercent: Number.isFinite(defaultPercent)
        ? Math.max(0, Math.min(100, defaultPercent))
        : 0,
      ranges,
    };
  };

  // Only keep scoring rules for number fields.
  const scoringRules =
    type === "number" ? normalizeScoringRules(field.scoringRules) : null;
  const optionScores = normalizeOptionScores(field.optionScores, options);

  const normalizeScoreMap = (raw) => {
    const map =
      raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
    const built = {};
    Object.entries(map).forEach(([k, v]) => {
      const key = String(k || "").trim();
      if (!key) return;
      const num = Number(v);
      built[key] = Number.isFinite(num) ? Math.max(0, num) : 0;
    });
    return built;
  };

  const fieldConfig = (() => {
    if (type !== "text") return null;
    const raw =
      field.fieldConfig && typeof field.fieldConfig === "object"
        ? field.fieldConfig
        : null;
    if (!raw) return null;
    const kind = String(raw.kind || raw.type || "").toUpperCase();
    if (kind !== "BD_ADDRESS") return null;
    return {
      kind: "BD_ADDRESS",
      districtScores: normalizeScoreMap(raw.districtScores),
      noakhaliUpazilaScores: normalizeScoreMap(raw.noakhaliUpazilaScores),
    };
  })();

  const effectiveScore = (() => {
    if (type === "dropdown" || type === "checkbox") return 0;
    if (
      type === "text" &&
      String(fieldConfig?.kind || "").toUpperCase() === "BD_ADDRESS"
    )
      return 0;
    return Number.isNaN(parsedScore) ? 0 : parsedScore;
  })();

  return {
    id: field.id || makeFieldId(),
    label: field.label || `Field ${idx + 1}`,
    type,
    required: Boolean(field.required),
    options,
    optionsText,
    score: effectiveScore,
    scoringRules,
    optionScores,
    fieldConfig,
    requiresDocument,
    documentLabel: field.documentLabel || field.documentUploadLabel || "",
    documentRequirement,
    displayOrder: Number.isFinite(field.displayOrder)
      ? field.displayOrder
      : idx,
  };
};

const blankField = () =>
  normalizeField(
    {
      label: "New Field",
      type: "text",
      required: false,
      options: [],
      optionsText: "",
      optionScores: null,
      score: 0,
      scoringRules: null,
      fieldConfig: null,
      requiresDocument: false,
      documentLabel: "",
      documentRequirement: "MANDATORY",
    },
    0
  );

const normalizeSchema = (schema) =>
  (Array.isArray(schema) ? schema : []).map(normalizeField);

const normalizeSessionList = (input) => {
  if (Array.isArray(input)) {
    return input.map((item) => String(item || "").trim()).filter(Boolean);
  }
  if (typeof input === "string") {
    return input
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
  }
  return [];
};

const sessionListToText = (list) => normalizeSessionList(list).join(", ");

const RECOMMENDED_FIELDS = [
  {
    label: "CGPA",
    type: "number",
    required: true,
    score: 10,
    requiresDocument: true,
    documentLabel: "Upload your latest marksheet",
    documentRequirement: "MANDATORY",
  },
  {
    label: "Address",
    type: "text",
    required: true,
    score: 0,
    requiresDocument: false,
    fieldConfig: {
      kind: "BD_ADDRESS",
      districtScores: {},
      noakhaliUpazilaScores: {},
    },
  },
  {
    label: "Quota",
    type: "checkbox",
    required: false,
    options: ["None", "FF", "Disabilities", "Backward Districts"],
    optionsText: "None, FF, Disabilities, Backward Districts",
    score: 0,
    requiresDocument: false,
  },
  {
    label: "Family Income (BDT/month)",
    type: "number",
    required: true,
    score: 0,
    requiresDocument: false,
  },
];

const buildRecommendedSchema = () =>
  RECOMMENDED_FIELDS.map((f, idx) =>
    normalizeField({ ...f, id: makeFieldId() }, idx)
  );

const mergeRecommendedSchema = (existingSchema) => {
  const existing = Array.isArray(existingSchema) ? existingSchema : [];
  const seen = new Set(
    existing
      .map((f) =>
        String(f?.label || "")
          .trim()
          .toLowerCase()
      )
      .filter(Boolean)
  );
  const additions = buildRecommendedSchema().filter(
    (f) =>
      !seen.has(
        String(f.label || "")
          .trim()
          .toLowerCase()
      )
  );
  return [...existing, ...additions];
};

export default function FormBuilder({ form, onSave, disabled = false }) {
  const [name, setName] = useState(form?.name || "");
  const [schema, setSchema] = useState(() =>
    normalizeSchema(form?.schema || form?.fields || [])
  );
  const [active, setActive] = useState(form?.active || false);
  const [sessionInput, setSessionInput] = useState(() =>
    sessionListToText(form?.sessionYears || form?.sessionYear || [])
  );
  const [deadlineInput, setDeadlineInput] = useState("");
  const [startInput, setStartInput] = useState("");

  const [bdDistricts, setBdDistricts] = useState([]);
  const [bdNoakhaliUpazilas, setBdNoakhaliUpazilas] = useState([]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await api.get("/forms/address/bd/districts");
        const list = Array.isArray(res?.data?.districts)
          ? res.data.districts
          : [];
        if (!cancelled) setBdDistricts(list);
      } catch (_) {
        if (!cancelled) setBdDistricts([]);
      }

      try {
        const res = await api.get("/forms/address/bd/upazilas", {
          params: { district: "Noakhali" },
        });
        const list = Array.isArray(res?.data?.upazilas)
          ? res.data.upazilas
          : [];
        if (!cancelled) setBdNoakhaliUpazilas(list);
      } catch (_) {
        if (!cancelled) setBdNoakhaliUpazilas([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const isNewForm = !form?.id;

  useEffect(() => {
    setName(form?.name || "");
    const nextSchema = normalizeSchema(form?.schema || form?.fields || []);
    if (!form?.id && nextSchema.length === 0) {
      setSchema(buildRecommendedSchema());
    } else {
      setSchema(nextSchema);
    }
    setActive(form?.active || false);
    const pad2 = (n) => String(n).padStart(2, "0");

    const rawStart = form?.applicationStartDate || form?.startDate || null;
    if (!rawStart) {
      setStartInput("");
    } else {
      const d = new Date(rawStart);
      if (!Number.isFinite(d.getTime())) {
        setStartInput("");
      } else {
        const local = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
        const yyyy = local.getFullYear();
        const mm = pad2(local.getMonth() + 1);
        const dd = pad2(local.getDate());
        const hh = pad2(local.getHours());
        const min = pad2(local.getMinutes());
        setStartInput(`${yyyy}-${mm}-${dd}T${hh}:${min}`);
      }
    }

    const rawDeadline = form?.applicationDeadline || form?.deadline || null;
    if (!rawDeadline) {
      setDeadlineInput("");
    } else {
      const d = new Date(rawDeadline);
      if (!Number.isFinite(d.getTime())) {
        setDeadlineInput("");
      } else {
        const local = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
        const yyyy = local.getFullYear();
        const mm = pad2(local.getMonth() + 1);
        const dd = pad2(local.getDate());
        const hh = pad2(local.getHours());
        const min = pad2(local.getMinutes());
        setDeadlineInput(`${yyyy}-${mm}-${dd}T${hh}:${min}`);
      }
    }
    setSessionInput(
      sessionListToText(form?.sessionYears || form?.sessionYear || [])
    );
  }, [form]);

  const addField = () => setSchema((s) => [...s, blankField()]);
  const updateField = (id, patch) =>
    setSchema((s) => s.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  const removeField = (id) => setSchema((s) => s.filter((f) => f.id !== id));

  const addRecommendedFields = () =>
    setSchema((s) => mergeRecommendedSchema(s));
  const clearFields = () => setSchema([]);

  const save = (e) => {
    e?.preventDefault?.();
    const cleanedSchema = schema.map((field, index) => {
      const next = {
        ...field,
        options:
          field.type === "dropdown" || field.type === "checkbox"
            ? [...(field.options || [])]
            : [],
        optionsText: undefined,
        optionScores: undefined,
        fieldConfig: undefined,
        displayOrder: index,
        documentRequirement: field.requiresDocument
          ? field.documentRequirement === "RECOMMENDED"
            ? "RECOMMENDED"
            : "MANDATORY"
          : "RECOMMENDED",
      };
      if (!field.requiresDocument) {
        next.documentLabel = "";
      }

      // Only persist scoring rules for numeric fields.
      if (field.type !== "number") {
        next.scoringRules = null;
      } else if (field.scoringRules && typeof field.scoringRules === "object") {
        const ranges = Array.isArray(field.scoringRules.ranges)
          ? field.scoringRules.ranges
          : [];
        const cleanedRanges = ranges
          .map((r) => {
            if (!r || typeof r !== "object") return null;
            const percent = Number(r.percent);
            if (!Number.isFinite(percent)) return null;
            const min =
              r.min === "" || r.min === null || r.min === undefined
                ? null
                : Number(r.min);
            const max =
              r.max === "" || r.max === null || r.max === undefined
                ? null
                : Number(r.max);
            if (min !== null && !Number.isFinite(min)) return null;
            if (max !== null && !Number.isFinite(max)) return null;
            return { min, max, percent: Math.max(0, Math.min(100, percent)) };
          })
          .filter(Boolean);

        if (cleanedRanges.length) {
          const defaultPercent = Number(field.scoringRules.defaultPercent ?? 0);
          next.scoringRules = {
            mode: "RANGE_PERCENT",
            defaultPercent: Number.isFinite(defaultPercent)
              ? Math.max(0, Math.min(100, defaultPercent))
              : 0,
            ranges: cleanedRanges,
          };
        } else {
          next.scoringRules = null;
        }
      } else {
        next.scoringRules = null;
      }

      // Dropdown/checkbox scoring comes from optionScores (no max score needed).
      if (field.type === "dropdown" || field.type === "checkbox") {
        next.score = 0;
      }

      // Only persist optionScores for dropdown/checkbox fields.
      if (field.type !== "dropdown" && field.type !== "checkbox") {
        next.optionScores = null;
      } else {
        const optionScores =
          field.optionScores &&
          typeof field.optionScores === "object" &&
          !Array.isArray(field.optionScores)
            ? field.optionScores
            : {};
        const normalized = {};
        (next.options || []).forEach((opt) => {
          const key = String(opt);
          const val = Number(optionScores[key] ?? 0);
          normalized[key] = Number.isFinite(val) ? val : 0;
        });
        next.optionScores = normalized;
      }

      // Only persist fieldConfig for text fields.
      if (field.type !== "text") {
        next.fieldConfig = null;
      } else {
        const rawCfg =
          field.fieldConfig && typeof field.fieldConfig === "object"
            ? field.fieldConfig
            : null;
        const kind = String(rawCfg?.kind || rawCfg?.type || "").toUpperCase();
        if (kind !== "BD_ADDRESS") {
          next.fieldConfig = null;
        } else {
          // BD_ADDRESS scoring comes from district/upazila maps.
          next.score = 0;
          const normalizeScoreMap = (raw) => {
            const map =
              raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
            const built = {};
            Object.entries(map).forEach(([k, v]) => {
              const key = String(k || "").trim();
              if (!key) return;
              const num = Number(v);
              built[key] = Number.isFinite(num) ? Math.max(0, num) : 0;
            });
            return built;
          };
          next.fieldConfig = {
            kind: "BD_ADDRESS",
            districtScores: normalizeScoreMap(rawCfg.districtScores),
            noakhaliUpazilaScores: normalizeScoreMap(
              rawCfg.noakhaliUpazilaScores
            ),
          };
        }
      }

      return next;
    });
    onSave?.({
      id: form?.id,
      name,
      active,
      applicationStartDate: startInput
        ? `${String(startInput).replace("T", " ")}:00`
        : null,
      applicationDeadline: deadlineInput
        ? `${String(deadlineInput).replace("T", " ")}:00`
        : null,
      sessionYears: normalizeSessionList(sessionInput),
      schema: cleanedSchema,
    });
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="grid gap-4">
      <label className="grid gap-1">
        <span className="text-sm text-gray-700">Applicable Sessions</span>
        <input
          className="border rounded px-3 py-2"
          placeholder="2021-2022, 2022-2023"
          value={sessionInput}
          onChange={(e) => setSessionInput(e.target.value)}
          disabled={disabled}
        />
        <span className="text-xs text-gray-500">
          Separate multiple sessions with commas.
        </span>
      </label>
      <label className="grid gap-1">
        <span className="text-sm text-gray-700">Form Name</span>
        <input
          className="border rounded px-3 py-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={disabled}
        />
      </label>
      <label className="inline-flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          disabled={disabled}
        />{" "}
        Active
      </label>

      <label className="grid gap-1">
        <span className="text-sm text-gray-700">Publish from (start date)</span>
        <input
          type="datetime-local"
          className="border rounded px-3 py-2"
          value={startInput}
          onChange={(e) => setStartInput(e.target.value)}
          disabled={disabled}
        />
        <span className="text-xs text-gray-500">
          Leave empty to start immediately when published.
        </span>
      </label>

      <label className="grid gap-1">
        <span className="text-sm text-gray-700">Publish until (end date)</span>
        <input
          type="datetime-local"
          className="border rounded px-3 py-2"
          value={deadlineInput}
          onChange={(e) => setDeadlineInput(e.target.value)}
          disabled={disabled}
        />
        <span className="text-xs text-gray-500">
          After this date/time, the form will be unpublished automatically.
        </span>
      </label>

      <div className="grid gap-3">
        {!disabled && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={addRecommendedFields}
              className="px-3 py-2 rounded text-sm bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
            >
              + Add recommended fields
            </button>
            <button
              type="button"
              onClick={clearFields}
              className="px-3 py-2 rounded text-sm bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
            >
              Clear fields
            </button>
            {isNewForm && (
              <span className="text-xs text-gray-500">
                Recommended fields auto-added for new forms.
              </span>
            )}
          </div>
        )}
        {schema.map((f, idx) => (
          <div key={f.id} className="border rounded p-3 grid gap-3">
            <div className="grid sm:grid-cols-2 gap-2">
              {(() => {
                const labelLower = String(f?.label || "")
                  .trim()
                  .toLowerCase();
                const isBdAddress =
                  String(f?.fieldConfig?.kind || "").toUpperCase() ===
                  "BD_ADDRESS";
                const isFixedAddress = labelLower === "address" || isBdAddress;
                return (
                  <>
                    <input
                      className="border rounded px-3 py-2"
                      placeholder="Field Label"
                      value={f.label}
                      onChange={(e) =>
                        updateField(f.id, { label: e.target.value })
                      }
                      disabled={disabled || isFixedAddress}
                      title={
                        isFixedAddress ? "Address field label is fixed" : ""
                      }
                    />
                    <select
                      className="border rounded px-3 py-2"
                      value={f.type}
                      onChange={(e) => {
                        const nextType = e.target.value;
                        const scoringPatch =
                          nextType === "number" ? {} : { scoringRules: null };
                        const optionScorePatch =
                          nextType === "dropdown" || nextType === "checkbox"
                            ? {}
                            : { optionScores: null };
                        const fieldConfigPatch =
                          nextType === "text" ? {} : { fieldConfig: null };
                        if (
                          nextType === "dropdown" ||
                          nextType === "checkbox"
                        ) {
                          updateField(f.id, {
                            type: nextType,
                            ...scoringPatch,
                            ...optionScorePatch,
                            ...fieldConfigPatch,
                          });
                        } else {
                          updateField(f.id, {
                            type: nextType,
                            options: [],
                            optionsText: "",
                            ...scoringPatch,
                            ...optionScorePatch,
                            ...fieldConfigPatch,
                          });
                        }
                      }}
                      disabled={disabled || isFixedAddress}
                      title={
                        isFixedAddress ? "Address field type is fixed" : ""
                      }
                    >
                      {fieldTypes.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </>
                );
              })()}
            </div>

            {/* Options for dropdown and checkbox */}
            {(f.type === "dropdown" || f.type === "checkbox") && (
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Options (comma-separated)
                </label>
                <input
                  className="border rounded px-3 py-2 w-full"
                  placeholder="e.g., Option 1, Option 2, Option 3"
                  value={f.optionsText ?? ""}
                  onChange={(e) => {
                    const text = e.target.value;
                    const options = text
                      .split(",")
                      .map((x) => x.trim())
                      .filter(Boolean);
                    const scores =
                      f.optionScores &&
                      typeof f.optionScores === "object" &&
                      !Array.isArray(f.optionScores)
                        ? f.optionScores
                        : {};
                    const nextScores = {};
                    options.forEach((opt) => {
                      const key = String(opt);
                      const val = Number(scores[key] ?? 0);
                      nextScores[key] = Number.isFinite(val) ? val : 0;
                    });
                    updateField(f.id, {
                      options,
                      optionsText: text,
                      optionScores: nextScores,
                    });
                  }}
                  onBlur={(e) => {
                    const text = e.target.value;
                    const options = text
                      .split(",")
                      .map((x) => x.trim())
                      .filter(Boolean);
                    const scores =
                      f.optionScores &&
                      typeof f.optionScores === "object" &&
                      !Array.isArray(f.optionScores)
                        ? f.optionScores
                        : {};
                    const nextScores = {};
                    options.forEach((opt) => {
                      const key = String(opt);
                      const val = Number(scores[key] ?? 0);
                      nextScores[key] = Number.isFinite(val) ? val : 0;
                    });
                    updateField(f.id, {
                      options,
                      optionsText: text,
                      optionScores: nextScores,
                    });
                  }}
                  disabled={disabled}
                />

                {Array.isArray(f.options) && f.options.length > 0 && (
                  <div className="mt-3 grid gap-2">
                    <div className="text-xs text-gray-600">
                      Points per option
                    </div>
                    {f.options.map((opt) => (
                      <div key={opt} className="flex items-center gap-2">
                        <div className="flex-1 text-sm text-gray-800">
                          {opt}
                        </div>
                        <input
                          className="border rounded px-3 py-2 w-28 text-sm"
                          type="number"
                          value={
                            f.optionScores &&
                            Object.prototype.hasOwnProperty.call(
                              f.optionScores,
                              opt
                            )
                              ? f.optionScores[opt]
                              : 0
                          }
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const nextScores = { ...(f.optionScores || {}) };
                            nextScores[opt] = Number.isFinite(val) ? val : 0;
                            updateField(f.id, { optionScores: nextScores });
                          }}
                          disabled={disabled}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Fixed Bangladesh Address config (only for Address text field) */}
            {(() => {
              if (f.type !== "text") return null;
              const labelLower = String(f.label || "")
                .trim()
                .toLowerCase();
              const isBdAddress =
                String(f?.fieldConfig?.kind || "").toUpperCase() ===
                "BD_ADDRESS";
              const showEditor = labelLower === "address" || isBdAddress;
              if (!showEditor) return null;
              return (
                <BdAddressConfigEditor
                  field={f}
                  updateField={updateField}
                  disabled={disabled}
                  bdDistricts={bdDistricts}
                  bdNoakhaliUpazilas={bdNoakhaliUpazilas}
                />
              );
            })()}

            <div className="grid sm:grid-cols-2 gap-2">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={f.required}
                  onChange={(e) =>
                    updateField(f.id, { required: e.target.checked })
                  }
                  disabled={disabled}
                />
                Required Field
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={f.requiresDocument}
                  onChange={(e) => {
                    const enabled = e.target.checked;
                    updateField(f.id, {
                      requiresDocument: enabled,
                      documentRequirement: enabled
                        ? f.documentRequirement || "MANDATORY"
                        : "RECOMMENDED",
                    });
                  }}
                  disabled={disabled}
                />
                Enable documents upload
              </label>
            </div>

            <div className="grid sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Document Label (if required)
                </label>
                <input
                  className="border rounded px-3 py-2 w-full"
                  placeholder="e.g., Upload your certificate"
                  value={f.documentLabel || ""}
                  onChange={(e) =>
                    updateField(f.id, { documentLabel: e.target.value })
                  }
                  disabled={!f.requiresDocument || disabled}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Document Requirement
                </label>
                <select
                  className="border rounded px-3 py-2 w-full"
                  value={f.documentRequirement || "MANDATORY"}
                  onChange={(e) =>
                    updateField(f.id, { documentRequirement: e.target.value })
                  }
                  disabled={!f.requiresDocument || disabled}
                >
                  <option value="MANDATORY">Must upload</option>
                  <option value="RECOMMENDED">Optional (recommended)</option>
                </select>
              </div>
              <div>
                {String(f?.fieldConfig?.kind || "").toUpperCase() ===
                "BD_ADDRESS" ? null : f.type === "dropdown" ||
                  f.type === "checkbox" ? null : (
                  <>
                    <label className="block text-sm text-gray-700 mb-1">
                      Max score (points)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        className="border rounded px-3 py-2 w-full"
                        type="number"
                        min="0"
                        max="100"
                        placeholder="0"
                        value={f.score ?? 0}
                        onChange={(e) =>
                          updateField(f.id, {
                            score: Number(e.target.value),
                          })
                        }
                        disabled={disabled}
                      />

                      <label
                        className="inline-flex items-center gap-2 text-sm whitespace-nowrap"
                        title={
                          f.type === "number"
                            ? "Enable range-based scoring for this numeric field"
                            : "Dynamic score is only available for number fields"
                        }
                      >
                        <input
                          type="checkbox"
                          checked={!!f.scoringRules}
                          onChange={(e) => {
                            const enabled = e.target.checked;
                            if (!enabled) {
                              updateField(f.id, { scoringRules: null });
                              return;
                            }
                            if (f.type !== "number") return;
                            updateField(f.id, {
                              scoringRules: {
                                mode: "RANGE_PERCENT",
                                defaultPercent: 0,
                                ranges: [
                                  { min: 4, max: 4, percent: 100 },
                                  { min: 3.5, max: null, percent: 80 },
                                ],
                              },
                            });
                          }}
                          disabled={disabled || f.type !== "number"}
                        />
                        Dynamic score
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {f.type === "number" && f.scoringRules
                        ? "Dynamic scoring is enabled: points depend on the value range."
                        : "If this field is filled, it contributes these points."}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Dynamic scoring range editor (only when enabled) */}
            {f.type === "number" && f.scoringRules && (
              <div className="border rounded bg-gray-50 p-3 grid gap-2">
                <div className="grid sm:grid-cols-3 gap-2">
                  <label className="grid gap-1">
                    <span className="text-xs text-gray-600">
                      Default % (no match)
                    </span>
                    <input
                      className="border rounded px-3 py-2 text-sm"
                      type="number"
                      min="0"
                      max="100"
                      value={f.scoringRules.defaultPercent ?? 0}
                      onChange={(e) =>
                        updateField(f.id, {
                          scoringRules: {
                            ...f.scoringRules,
                            defaultPercent: Number(e.target.value),
                          },
                        })
                      }
                      disabled={disabled}
                    />
                  </label>
                </div>

                <div className="grid gap-2">
                  <div className="text-xs text-gray-600">
                    Rules (value range → % of max points)
                  </div>
                  {(Array.isArray(f.scoringRules.ranges)
                    ? f.scoringRules.ranges
                    : []
                  ).map((r, ridx) => (
                    <div
                      key={ridx}
                      className="grid grid-cols-1 sm:grid-cols-7 gap-2 items-end"
                    >
                      <label className="grid gap-1 sm:col-span-2">
                        <span className="text-xs text-gray-600">Min</span>
                        <input
                          className="border rounded px-3 py-2 text-sm"
                          type="number"
                          value={r.min ?? ""}
                          onChange={(e) => {
                            const ranges = [...(f.scoringRules.ranges || [])];
                            ranges[ridx] = {
                              ...ranges[ridx],
                              min:
                                e.target.value === ""
                                  ? null
                                  : Number(e.target.value),
                            };
                            updateField(f.id, {
                              scoringRules: { ...f.scoringRules, ranges },
                            });
                          }}
                          disabled={disabled}
                        />
                      </label>
                      <label className="grid gap-1 sm:col-span-2">
                        <span className="text-xs text-gray-600">Max</span>
                        <input
                          className="border rounded px-3 py-2 text-sm"
                          type="number"
                          value={r.max ?? ""}
                          onChange={(e) => {
                            const ranges = [...(f.scoringRules.ranges || [])];
                            ranges[ridx] = {
                              ...ranges[ridx],
                              max:
                                e.target.value === ""
                                  ? null
                                  : Number(e.target.value),
                            };
                            updateField(f.id, {
                              scoringRules: { ...f.scoringRules, ranges },
                            });
                          }}
                          disabled={disabled}
                        />
                      </label>
                      <label className="grid gap-1 sm:col-span-2">
                        <span className="text-xs text-gray-600">Percent</span>
                        <input
                          className="border rounded px-3 py-2 text-sm"
                          type="number"
                          min="0"
                          max="100"
                          value={r.percent ?? 0}
                          onChange={(e) => {
                            const ranges = [...(f.scoringRules.ranges || [])];
                            ranges[ridx] = {
                              ...ranges[ridx],
                              percent: Number(e.target.value),
                            };
                            updateField(f.id, {
                              scoringRules: { ...f.scoringRules, ranges },
                            });
                          }}
                          disabled={disabled}
                        />
                      </label>
                      <button
                        type="button"
                        className="sm:col-span-1 px-3 py-2 text-sm border rounded bg-white hover:bg-gray-100"
                        onClick={() => {
                          const ranges = [...(f.scoringRules.ranges || [])];
                          ranges.splice(ridx, 1);
                          updateField(f.id, {
                            scoringRules: { ...f.scoringRules, ranges },
                          });
                        }}
                        disabled={disabled}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="px-3 py-2 text-sm border rounded bg-white hover:bg-gray-100 w-fit"
                    onClick={() => {
                      const ranges = [...(f.scoringRules.ranges || [])];
                      ranges.push({ min: null, max: null, percent: 0 });
                      updateField(f.id, {
                        scoringRules: { ...f.scoringRules, ranges },
                      });
                    }}
                    disabled={disabled}
                  >
                    + Add rule
                  </button>
                  <p className="text-xs text-gray-500">
                    Tip: Use min=4 and max=4 for exact 4.00.
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-xs text-gray-500">Field #{idx + 1}</span>
              <button
                type="button"
                onClick={() => removeField(f.id)}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
                disabled={disabled}
              >
                🗑️ Remove Field
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addField}
          className="px-3 py-2 border-2 border-dashed border-gray-300 rounded text-sm hover:border-blue-400 hover:bg-blue-50 transition-colors"
          disabled={disabled}
        >
          + Add New Field
        </button>
      </div>

      <div>
        <button
          type="button"
          onClick={save}
          className="px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-700 disabled:opacity-60"
          disabled={disabled}
        >
          Save Form
        </button>
      </div>
    </form>
  );
}

function BdAddressConfigEditor({
  field,
  updateField,
  disabled,
  bdDistricts,
  bdNoakhaliUpazilas,
}) {
  const isEnabled =
    String(field?.fieldConfig?.kind || "").toUpperCase() === "BD_ADDRESS";

  const districtOptions = (
    Array.isArray(bdDistricts) ? bdDistricts : []
  ).filter(
    (d) =>
      String(d || "")
        .trim()
        .toLowerCase() !== "noakhali"
  );
  const upazilaOptions = Array.isArray(bdNoakhaliUpazilas)
    ? bdNoakhaliUpazilas
    : [];

  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [districtBulkScore, setDistrictBulkScore] = useState(0);

  const [selectedUpazilas, setSelectedUpazilas] = useState([]);
  const [upazilaBulkScore, setUpazilaBulkScore] = useState(0);

  useEffect(() => {
    if (!districtOptions.length) return;
    // Default: nothing selected. (Auto-selecting all made "Apply" affect everything.)
    setSelectedDistricts((prev) => (Array.isArray(prev) ? prev : []));
  }, [districtOptions.join("|")]);

  useEffect(() => {
    if (!upazilaOptions.length) return;
    // Default: nothing selected.
    setSelectedUpazilas((prev) => (Array.isArray(prev) ? prev : []));
  }, [upazilaOptions.join("|")]);

  const currentDistrictScores =
    field?.fieldConfig?.districtScores &&
    typeof field.fieldConfig.districtScores === "object" &&
    !Array.isArray(field.fieldConfig.districtScores)
      ? field.fieldConfig.districtScores
      : {};

  const currentUpazilaScores =
    field?.fieldConfig?.noakhaliUpazilaScores &&
    typeof field.fieldConfig.noakhaliUpazilaScores === "object" &&
    !Array.isArray(field.fieldConfig.noakhaliUpazilaScores)
      ? field.fieldConfig.noakhaliUpazilaScores
      : {};

  // When a single district/upazila is selected, show its current saved score.
  useEffect(() => {
    if (selectedDistricts.length !== 1) return;
    const key = selectedDistricts[0];
    const val = Number(currentDistrictScores?.[key] ?? 0);
    setDistrictBulkScore(Number.isFinite(val) ? val : 0);
  }, [selectedDistricts.join("|"), field?.fieldConfig?.districtScores]);

  useEffect(() => {
    if (selectedUpazilas.length !== 1) return;
    const key = selectedUpazilas[0];
    const val = Number(currentUpazilaScores?.[key] ?? 0);
    setUpazilaBulkScore(Number.isFinite(val) ? val : 0);
  }, [selectedUpazilas.join("|"), field?.fieldConfig?.noakhaliUpazilaScores]);

  const ensureEnabled = () => {
    if (isEnabled) return;
    updateField(field.id, {
      fieldConfig: {
        kind: "BD_ADDRESS",
        districtScores: {},
        noakhaliUpazilaScores: {},
      },
    });
  };

  const applyDistrictScore = (score) => {
    ensureEnabled();
    const next = { ...currentDistrictScores };
    selectedDistricts.forEach((d) => {
      next[d] = Number.isFinite(score) ? Math.max(0, score) : 0;
    });
    updateField(field.id, {
      fieldConfig: {
        kind: "BD_ADDRESS",
        districtScores: next,
        noakhaliUpazilaScores: currentUpazilaScores,
      },
    });
  };

  const clearDistrictScore = () => applyDistrictScore(0);

  const applyUpazilaScore = (score) => {
    ensureEnabled();
    const next = { ...currentUpazilaScores };
    selectedUpazilas.forEach((u) => {
      next[u] = Number.isFinite(score) ? Math.max(0, score) : 0;
    });
    updateField(field.id, {
      fieldConfig: {
        kind: "BD_ADDRESS",
        districtScores: currentDistrictScores,
        noakhaliUpazilaScores: next,
      },
    });
  };

  const clearUpazilaScore = () => applyUpazilaScore(0);

  return (
    <div className="border rounded bg-gray-50 p-3 grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-medium text-gray-800">
          Address (Bangladesh): District + Upazila
        </div>
        <div className="text-xs text-gray-500">
          District scoring except Noakhali; Noakhali uses upazila scoring.
        </div>
      </div>

      <div className="grid gap-2">
        <div className="text-xs text-gray-600">
          District points (bulk apply)
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="px-3 py-1.5 text-sm border rounded bg-white hover:bg-gray-50"
            onClick={() => setSelectedDistricts(districtOptions)}
            disabled={disabled || !districtOptions.length}
          >
            Select all
          </button>
          <button
            type="button"
            className="px-3 py-1.5 text-sm border rounded bg-white hover:bg-gray-50"
            onClick={() => setSelectedDistricts([])}
            disabled={disabled || !districtOptions.length}
          >
            Clear selection
          </button>

          <div className="text-xs text-gray-500">
            Selected: {selectedDistricts.length}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-2">
          <select
            multiple
            size={10}
            className="border rounded px-3 py-2 w-full text-sm bg-white"
            value={selectedDistricts}
            onChange={(e) => {
              const next = Array.from(e.target.selectedOptions).map(
                (o) => o.value
              );
              setSelectedDistricts(next);
            }}
            disabled={disabled || !districtOptions.length}
          >
            {districtOptions.map((d) => (
              <option key={d} value={d}>
                {d} ({Number(currentDistrictScores?.[d] ?? 0) || 0})
              </option>
            ))}
          </select>

          <div className="grid gap-2">
            <label className="grid gap-1">
              <span className="text-xs text-gray-600">Score for selected</span>
              <input
                className="border rounded px-3 py-2 text-sm"
                type="number"
                value={districtBulkScore}
                onChange={(e) => setDistrictBulkScore(Number(e.target.value))}
                disabled={disabled}
              />
            </label>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="inline-flex items-center justify-center h-10 px-4 text-sm font-semibold text-white rounded-lg shadow-md bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 active:scale-[0.99] transition whitespace-nowrap"
                onClick={() => applyDistrictScore(Number(districtBulkScore))}
                disabled={disabled || !selectedDistricts.length}
              >
                Apply to selected
              </button>
            </div>

            <div className="text-xs text-gray-500">
              Tip: Select districts first, then click “Apply to selected”.
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-2">
        <div className="text-xs text-gray-600">
          Noakhali upazila points (bulk apply)
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="px-3 py-1.5 text-sm border rounded bg-white hover:bg-gray-50"
            onClick={() => setSelectedUpazilas(upazilaOptions)}
            disabled={disabled || !upazilaOptions.length}
          >
            Select all
          </button>
          <button
            type="button"
            className="px-3 py-1.5 text-sm border rounded bg-white hover:bg-gray-50"
            onClick={() => setSelectedUpazilas([])}
            disabled={disabled || !upazilaOptions.length}
          >
            Clear selection
          </button>

          <div className="text-xs text-gray-500">
            Selected: {selectedUpazilas.length}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-2">
          <select
            multiple
            size={10}
            className="border rounded px-3 py-2 w-full text-sm bg-white"
            value={selectedUpazilas}
            onChange={(e) => {
              const next = Array.from(e.target.selectedOptions).map(
                (o) => o.value
              );
              setSelectedUpazilas(next);
            }}
            disabled={disabled || !upazilaOptions.length}
          >
            {upazilaOptions.map((u) => (
              <option key={u} value={u}>
                {u} ({Number(currentUpazilaScores?.[u] ?? 0) || 0})
              </option>
            ))}
          </select>

          <div className="grid gap-2">
            <label className="grid gap-1">
              <span className="text-xs text-gray-600">Score for selected</span>
              <input
                className="border rounded px-3 py-2 text-sm"
                type="number"
                value={upazilaBulkScore}
                onChange={(e) => setUpazilaBulkScore(Number(e.target.value))}
                disabled={disabled}
              />
            </label>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="inline-flex items-center justify-center h-10 px-4 text-sm font-semibold text-white rounded-lg shadow-md bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 active:scale-[0.99] transition whitespace-nowrap"
                onClick={() => applyUpazilaScore(Number(upazilaBulkScore))}
                disabled={disabled || !selectedUpazilas.length}
              >
                Apply to selected
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
