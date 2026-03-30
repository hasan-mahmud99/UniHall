import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../lib/apiClient.js";
import FormBuilder from "../../components/FormBuilder.jsx";

const DOCUMENT_REQUIREMENT_LABEL = {
  MANDATORY: "Must upload",
  RECOMMENDED: "Optional upload",
};

const normalizeSessionYears = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
  }
  return [];
};

const normalizeField = (field, index) => {
  if (!field) {
    return {
      id: `field-${index}`,
      label: `Field ${index + 1}`,
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
      documentRequirement: "RECOMMENDED",
      displayOrder: index,
    };
  }

  const rawType = field.type || field.fieldType || "text";
  const type = rawType === "select" ? "dropdown" : rawType.toLowerCase();
  const optionSource = field.options || field.optionList || field.optionsText;
  const options = Array.isArray(optionSource)
    ? optionSource
    : typeof optionSource === "string"
    ? optionSource
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean)
    : [];
  const requiresDocument = Boolean(
    field.requiresDocument ?? field.documentRequired
  );
  const requirementRaw = String(
    field.documentRequirement ||
      (requiresDocument ? "MANDATORY" : "RECOMMENDED")
  ).toUpperCase();
  const documentRequirement =
    requirementRaw === "RECOMMENDED" ? "RECOMMENDED" : "MANDATORY";
  const parsedScore = Number(field.score ?? field.weight ?? 0);

  const scoringRules =
    type === "number" &&
    field.scoringRules &&
    typeof field.scoringRules === "object"
      ? field.scoringRules
      : null;

  const fieldConfig = (() => {
    if (type !== "text") return null;
    const raw =
      field.fieldConfig && typeof field.fieldConfig === "object"
        ? field.fieldConfig
        : null;
    if (!raw) return null;
    const kind = String(raw.kind || raw.type || "").toUpperCase();
    if (kind !== "BD_ADDRESS") return null;
    return raw;
  })();

  const optionScores = (() => {
    if (type !== "dropdown" && type !== "checkbox") return null;
    const raw =
      field.optionScores &&
      typeof field.optionScores === "object" &&
      !Array.isArray(field.optionScores)
        ? field.optionScores
        : {};
    const normalized = {};
    options.forEach((opt) => {
      const key = String(opt);
      const val = Number(raw[key] ?? 0);
      normalized[key] = Number.isFinite(val) ? val : 0;
    });
    return normalized;
  })();

  return {
    id: field.id || field.fieldId || `field-${index}`,
    label: field.label || field.fieldName || `Field ${index + 1}`,
    type,
    required: Boolean(field.required ?? field.isRequired),
    options,
    optionsText: options.join(", "),
    optionScores,
    score: Number.isNaN(parsedScore) ? 0 : parsedScore,
    scoringRules,
    fieldConfig,
    requiresDocument,
    documentLabel: field.documentLabel || field.documentUploadLabel || "",
    documentRequirement,
    displayOrder: Number.isFinite(field.displayOrder)
      ? field.displayOrder
      : index,
  };
};

const normalizeForm = (input) => {
  if (!input) return null;

  const schemaSource = Array.isArray(input.schema)
    ? input.schema
    : Array.isArray(input.fields)
    ? input.fields
    : [];

  const sessionYears = normalizeSessionYears(
    input.sessionYears ?? input.sessionYear
  );

  return {
    ...input,
    id: input.id || input.formId,
    name: input.name || input.title || input.formTitle || "Untitled Form",
    title: input.title || input.formTitle || input.name || "Untitled Form",
    active: Boolean(input.active ?? input.isActive),
    isActive: Boolean(input.isActive ?? input.active),
    applicationStartDate: input.applicationStartDate || null,
    applicationDeadline: input.applicationDeadline || null,
    sessionYears,
    schema: schemaSource.map((field, index) => normalizeField(field, index)),
  };
};

const buildApiPayload = (formPayload) => {
  const schema = Array.isArray(formPayload.schema) ? formPayload.schema : [];
  const sessionYears = normalizeSessionYears(
    formPayload.sessionYears ?? formPayload.sessionYear
  );

  return {
    name: formPayload.name?.trim() || "Untitled Form",
    active: Boolean(formPayload.active),
    applicationStartDate: formPayload.applicationStartDate || null,
    applicationDeadline: formPayload.applicationDeadline || null,
    sessionYears,
    schema: schema.map((field, index) => ({
      id: field.id || null,
      label: field.label?.trim() || `Field ${index + 1}`,
      type: field.type || "text",
      required: Boolean(field.required),
      fieldConfig:
        field.type === "text" &&
        field.fieldConfig &&
        typeof field.fieldConfig === "object" &&
        String(
          field.fieldConfig.kind || field.fieldConfig.type || ""
        ).toUpperCase() === "BD_ADDRESS"
          ? field.fieldConfig
          : null,
      options:
        field.type === "dropdown" || field.type === "checkbox"
          ? Array.from(
              new Set(
                (field.options || [])
                  .map((opt) => String(opt).trim())
                  .filter(Boolean)
              )
            )
          : [],
      optionScores:
        field.type === "dropdown" || field.type === "checkbox"
          ? (() => {
              const raw =
                field.optionScores &&
                typeof field.optionScores === "object" &&
                !Array.isArray(field.optionScores)
                  ? field.optionScores
                  : {};
              const normalized = {};
              const opts = Array.from(
                new Set(
                  (field.options || [])
                    .map((opt) => String(opt).trim())
                    .filter(Boolean)
                )
              );
              opts.forEach((opt) => {
                const val = Number(raw[opt] ?? 0);
                normalized[opt] = Number.isFinite(val) ? val : 0;
              });
              return normalized;
            })()
          : null,
      score: Number(field.score ?? 0) || 0,
      scoringRules:
        field.type === "number" &&
        field.scoringRules &&
        typeof field.scoringRules === "object"
          ? field.scoringRules
          : null,
      requiresDocument: Boolean(field.requiresDocument),
      documentLabel: field.requiresDocument
        ? field.documentLabel?.trim() || ""
        : null,
      documentRequirement: field.requiresDocument
        ? String(field.documentRequirement || "MANDATORY").toUpperCase()
        : "RECOMMENDED",
      displayOrder: Number.isFinite(field.displayOrder)
        ? field.displayOrder
        : index,
    })),
  };
};

const getFieldMaxScoreForDisplay = (field) => {
  if (!field) return 0;

  const kind = String(field?.fieldConfig?.kind || "").toUpperCase();
  if (kind === "BD_ADDRESS") {
    const districtScores = field?.fieldConfig?.districtScores;
    const noakhaliUpazilaScores = field?.fieldConfig?.noakhaliUpazilaScores;

    const districtMax = Math.max(
      0,
      ...Object.values(districtScores || {})
        .map((v) => Number(v))
        .filter((v) => Number.isFinite(v))
    );
    const upazilaMax = Math.max(
      0,
      ...Object.values(noakhaliUpazilaScores || {})
        .map((v) => Number(v))
        .filter((v) => Number.isFinite(v))
    );

    return Math.max(districtMax, upazilaMax);
  }

  if (field.type === "dropdown") {
    const scores =
      field.optionScores && typeof field.optionScores === "object"
        ? Object.values(field.optionScores)
        : [];
    const max = Math.max(
      0,
      ...scores.map((v) => Number(v)).filter((v) => Number.isFinite(v))
    );
    return max;
  }

  if (field.type === "checkbox") {
    const scores =
      field.optionScores && typeof field.optionScores === "object"
        ? Object.values(field.optionScores)
        : [];
    const sum = scores
      .map((v) => Number(v))
      .filter((v) => Number.isFinite(v))
      .reduce((a, b) => a + b, 0);
    return sum;
  }

  if (field.type === "number" && field.scoringRules) {
    const base = Number(field.score ?? 0) || 0;
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

  return Number(field.score ?? 0) || 0;
};

const getFormTotalMaxScore = (schema) => {
  const fields = Array.isArray(schema) ? schema : [];
  return fields
    .map((f) => getFieldMaxScoreForDisplay(f))
    .map((v) => (Number.isFinite(Number(v)) ? Number(v) : 0))
    .reduce((a, b) => a + b, 0);
};

const FormCard = ({
  form,
  onEdit,
  onPublish,
  onUnpublish,
  onDelete,
  isDeleting,
}) => {
  const schema = Array.isArray(form.schema) ? form.schema : [];
  const createdAt = form.createdAt
    ? new Date(form.createdAt).toLocaleString()
    : "--";
  const totalMaxScore = getFormTotalMaxScore(schema);

  return (
    <div
      className="border-2 border-gray-200 rounded-lg p-5 shadow-sm"
      style={{ backgroundColor: "#2C7DA0" }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-semibold text-white">
              {form.title || form.name}
            </h3>
            {form.isActive ? (
              <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-semibold">
                Published
              </span>
            ) : (
              <span className="px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs font-semibold">
                Draft
              </span>
            )}
          </div>
          <p className="text-sm text-white font-semibold">
            Created: {createdAt}
          </p>
          {form.sessionYears?.length > 0 && (
            <p className="text-xs text-white">
              Sessions: {form.sessionYears.join(", ")}
            </p>
          )}
          <p className="text-sm text-white font-semibold">
            {schema.length} field(s)
          </p>
          <p className="text-sm text-white font-semibold">
            Total max score:{" "}
            {Number.isInteger(totalMaxScore)
              ? totalMaxScore
              : totalMaxScore.toFixed(2)}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="px-3 py-1.5 bg-amber-500 text-white rounded hover:bg-amber-600 text-sm shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Edit
          </button>
          {form.isActive ? (
            <button
              onClick={onUnpublish}
              className="px-3 py-1.5 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Unpublish
            </button>
          ) : (
            <button
              onClick={onPublish}
              className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Publish
            </button>
          )}
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className={`px-3 py-1.5 rounded text-sm bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 ${
              isDeleting ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {isDeleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>

      {schema.length > 0 && (
        <div className="mt-4 border-t border-gray-200 pt-3 space-y-2">
          {schema.map((field, index) => (
            <div
              key={field.id || index}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded"
            >
              <div className="text-sm text-blue-900 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-medium">{field.label}</span>
                <span className="text-xs text-blue-700">({field.type})</span>
                {field.required && (
                  <span className="text-xs text-red-600">*Required</span>
                )}
                {field.requiresDocument && (
                  <span className="text-xs text-purple-700">
                    Attachment:{" "}
                    {DOCUMENT_REQUIREMENT_LABEL[field.documentRequirement] ||
                      "Document"}
                  </span>
                )}
                {field.options?.length > 0 && (
                  <span className="text-xs text-blue-700">
                    Options: {field.options.join(", ")}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-blue-700">
                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded">
                  Max score: {getFieldMaxScoreForDisplay(field)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function Forms() {
  const { user } = useAuth();
  const [forms, setForms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingForm, setEditingForm] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const builderRef = useRef(null);

  const loadForms = useCallback(async () => {
    if (user?.role !== "admin") return;

    setIsLoading(true);
    setError("");
    try {
      const { data } = await api.get("/forms");
      const list = Array.isArray(data?.data)
        ? data.data.map(normalizeForm).filter(Boolean)
        : [];
      setForms(list);
    } catch (err) {
      const message = err.response?.data?.message || "Failed to load forms";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    loadForms();
  }, [loadForms]);

  const openBuilderForCreate = () => {
    setEditingForm(null);
    setShowBuilder(true);
    requestAnimationFrame(() => {
      builderRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    });
  };

  const openBuilderForEdit = (form) => {
    setEditingForm(normalizeForm(form));
    setShowBuilder(true);
    requestAnimationFrame(() => {
      builderRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    });
  };

  const closeBuilder = () => {
    setEditingForm(null);
    setShowBuilder(false);
  };

  const handleSave = async (payload) => {
    setIsSaving(true);
    setError("");
    try {
      const requestBody = buildApiPayload(payload);
      if (payload.id) {
        await api.put(`/forms/${payload.id}`, requestBody);
      } else {
        await api.post("/forms", requestBody);
      }
      await loadForms();
      closeBuilder();
    } catch (err) {
      const message = err.response?.data?.message || "Failed to save form";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishState = async (formId, active) => {
    setError("");
    try {
      await api.post(`/forms/${formId}/publish`, { active });
      await loadForms();
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to update publish state";
      setError(message);
    }
  };

  const handleDelete = async (form) => {
    if (!form?.id) return;
    const confirmed = window.confirm(
      `Delete form "${form.title || form.name}"? This cannot be undone.`
    );
    if (!confirmed) return;

    setError("");
    setDeletingId(form.id);
    try {
      await api.delete(`/forms/${form.id}`);
      await loadForms();
    } catch (err) {
      const message = err.response?.data?.message || "Failed to delete form";
      setError(message);
    } finally {
      setDeletingId("");
    }
  };

  const sortedForms = useMemo(
    () =>
      forms
        .slice()
        .sort(
          (a, b) =>
            new Date(b.createdAt || b.updatedAt || 0) -
            new Date(a.createdAt || a.updatedAt || 0)
        ),
    [forms]
  );

  return (
    <div
      className="space-y-6 p-4 md:p-6"
      style={{ backgroundColor: "#123456" }}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white inline-block">
            Form Management
          </h1>
          <p className="text-base font-bold text-white">
            Create, update, and publish hall admission forms.
          </p>
        </div>
        {user?.role === "admin" && (
          <button
            onClick={openBuilderForCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Create New Form
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-white mb-4">Existing Forms</h2>

        {showBuilder && (
          <div
            ref={builderRef}
            className="rounded-2xl border border-white/60 bg-gradient-to-r from-white/95 via-sky-50/80 to-emerald-50/70 p-6 mb-4 shadow-sm backdrop-blur"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingForm ? "Edit Form" : "Create Form"}
              </h2>
              <button
                onClick={closeBuilder}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            <FormBuilder
              key={editingForm?.id || "new-form"}
              form={editingForm}
              onSave={handleSave}
              disabled={isSaving}
            />
          </div>
        )}

        {isLoading ? (
          <div className="rounded-2xl border border-white/60 bg-gradient-to-r from-white/95 via-sky-50/80 to-emerald-50/70 p-8 text-center text-gray-700 shadow-sm backdrop-blur">
            Loading forms...
          </div>
        ) : sortedForms.length === 0 ? (
          <div className="rounded-2xl border border-white/60 bg-gradient-to-r from-white/95 via-sky-50/80 to-emerald-50/70 p-8 text-center text-gray-700 shadow-sm backdrop-blur">
            No forms created yet. Use "Create New Form" to add the first one.
          </div>
        ) : (
          <div className="grid gap-4">
            {sortedForms.map((form) => (
              <FormCard
                key={form.id}
                form={form}
                onEdit={() => openBuilderForEdit(form)}
                onPublish={() => handlePublishState(form.id, true)}
                onUnpublish={() => handlePublishState(form.id, false)}
                onDelete={() => handleDelete(form)}
                isDeleting={deletingId === form.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
