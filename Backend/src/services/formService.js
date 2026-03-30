const {
  listFormsByHall,
  getFormById,
  createForm,
  updateForm,
  setFormActive,
  findActiveFormByHall,
  expireExpiredFormsByHall,
  createApplicationWithResponse,
  hasActiveAllocation,
  hasApplicationForStudent,
  deleteForm,
  listApplicationsByForm,
  listApplicationsByStudent,
  getApplicationDetailsByIdForStudent,
  updateApplicationStatus,
  updateApplicationScore,
} = require("../repositories/formRepository");
const { initPool } = require("../../config/db");

async function createNotification({ userId, hallId, title, body }) {
  const pool = await initPool();
  try {
    await pool.query(
      `INSERT INTO notifications (notificationId, hallId, userId, title, body, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        require("uuid").v4(),
        hallId || null,
        userId || null,
        title || "Update",
        body || "",
      ]
    );
  } catch (_) {
    // notifications table may not exist; ignore
  }
}
const { deriveSessionYearFromStudentId } = require("./authService");

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || "")
  );
}
const { findHallByCode } = require("../repositories/userRepository");

function ensureAdmin(user) {
  if (!user || (user.role !== "ADMIN" && user.role !== "admin")) {
    const err = new Error("Only hall administrators can manage forms");
    err.status = 403;
    throw err;
  }
}

function ensureStudent(user) {
  if (!user || (user.role !== "STUDENT" && user.role !== "student")) {
    const err = new Error("Only students can submit applications");
    err.status = 403;
    throw err;
  }
}

function normalizeSchemaInput(schema = []) {
  if (!Array.isArray(schema)) return [];
  return schema.map((field, index) => {
    const options = Array.isArray(field.options)
      ? field.options
      : typeof field.optionsText === "string"
      ? field.optionsText
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean)
      : [];

    const requiresDocument = !!field.requiresDocument;
    const documentRequirement = requiresDocument
      ? String(field.documentRequirement || "MANDATORY").toUpperCase()
      : "RECOMMENDED";

    let scoringRules = null;
    if (field && field.scoringRules && typeof field.scoringRules === "object") {
      const raw = field.scoringRules;
      const mode = String(raw.mode || raw.type || "").toUpperCase();

      if (
        mode === "RANGE_PERCENT" ||
        mode === "RANGES" ||
        mode === "PERCENT_RANGES"
      ) {
        const rawRanges = Array.isArray(raw.ranges)
          ? raw.ranges
          : Array.isArray(raw.rules)
          ? raw.rules
          : [];

        const ranges = rawRanges
          .map((r) => {
            if (!r || typeof r !== "object") return null;
            const minRaw = r.min ?? r.from ?? null;
            const maxRaw = r.max ?? r.to ?? null;
            const percentRaw = r.percent ?? r.percentage ?? null;

            const min =
              minRaw === null || minRaw === undefined || minRaw === ""
                ? null
                : Number(minRaw);
            const max =
              maxRaw === null || maxRaw === undefined || maxRaw === ""
                ? null
                : Number(maxRaw);
            const percent = Number(percentRaw);

            if (!Number.isFinite(percent)) return null;
            if (min !== null && !Number.isFinite(min)) return null;
            if (max !== null && !Number.isFinite(max)) return null;
            return {
              min,
              max,
              percent: Math.max(0, Math.min(100, percent)),
            };
          })
          .filter(Boolean);

        if (ranges.length) {
          const defaultPercent = Number(raw.defaultPercent ?? raw.default ?? 0);
          scoringRules = {
            mode: "RANGE_PERCENT",
            defaultPercent: Number.isFinite(defaultPercent)
              ? Math.max(0, Math.min(100, defaultPercent))
              : 0,
            ranges,
          };
        }
      }
    }

    // Dynamic scoring currently only applies to numeric fields.
    const fieldType = field?.type || "text";
    if (String(fieldType).toLowerCase() !== "number") {
      scoringRules = null;
    }

    // Optional field configuration (JSON) for advanced field behaviors.
    // Today: BD_ADDRESS for text fields (District + Upazila).
    const typeLower = String(fieldType || "").toLowerCase();
    let fieldConfig = null;
    if (
      typeLower === "text" &&
      field &&
      field.fieldConfig &&
      typeof field.fieldConfig === "object"
    ) {
      const rawCfg = field.fieldConfig;
      const kind = String(rawCfg.kind || rawCfg.type || "").toUpperCase();
      if (kind === "BD_ADDRESS") {
        const normalizeScoreMap = (raw) => {
          const map =
            raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
          const built = {};
          for (const [k, v] of Object.entries(map)) {
            const key = String(k || "").trim();
            if (!key) continue;
            const num = Number(v);
            built[key] = Number.isFinite(num) ? Math.max(0, num) : 0;
          }
          return built;
        };

        fieldConfig = {
          kind: "BD_ADDRESS",
          districtScores: normalizeScoreMap(rawCfg.districtScores),
          noakhaliUpazilaScores: normalizeScoreMap(
            rawCfg.noakhaliUpazilaScores
          ),
        };
      }
    }

    // Option scoring applies to dropdown / checkbox fields.
    let optionScores = null;
    if ((typeLower === "dropdown" || typeLower === "checkbox") && field) {
      const rawScores = field.optionScores;
      const map =
        rawScores && typeof rawScores === "object" && !Array.isArray(rawScores)
          ? rawScores
          : {};
      const built = {};
      for (const option of options) {
        const key = String(option);
        const raw = map[key];
        const parsed = Number(raw);
        built[key] = Number.isFinite(parsed) ? parsed : 0;
      }
      optionScores = built;
    }

    return {
      id: field.id || null,
      label: field.label ? String(field.label).trim() : `Field ${index + 1}`,
      type: field.type || "text",
      required: !!field.required,
      options,
      optionScores,
      score: Number.isFinite(Number(field.score)) ? Number(field.score) : 0,
      scoringRules,
      fieldConfig,
      requiresDocument,
      documentLabel:
        requiresDocument && field.documentLabel
          ? String(field.documentLabel).trim()
          : null,
      documentRequirement:
        documentRequirement === "RECOMMENDED" ? "RECOMMENDED" : "MANDATORY",
      displayOrder: Number.isFinite(parseInt(field.displayOrder, 10))
        ? parseInt(field.displayOrder, 10)
        : index,
    };
  });
}

function hasFieldValue(field, value) {
  const typeLower = String(field?.type || "").toLowerCase();

  const isNoneSelection = (v) => {
    const s = String(v ?? "").trim();
    if (!s) return true;
    return s.toLowerCase() === "none";
  };

  // Special text subtype: BD_ADDRESS expects { district, upazila }
  const kind = String(field?.fieldConfig?.kind || "").toUpperCase();
  if (typeLower === "text" && kind === "BD_ADDRESS") {
    if (!value || typeof value !== "object" || Array.isArray(value))
      return false;
    const district = String(value.district || "").trim();
    const upazila = String(value.upazila || "").trim();
    return !!district && !!upazila;
  }

  if (typeLower === "checkbox") {
    return Array.isArray(value) ? value.length > 0 : false;
  }

  if (typeLower === "dropdown") {
    return !isNoneSelection(value);
  }

  if (Array.isArray(value)) return value.length > 0;
  return value !== undefined && value !== null && String(value).trim() !== "";
}

function normalizeSessionYearsInput(input) {
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
}

function toEpochMillis(value) {
  if (!value) return null;
  if (value instanceof Date) {
    const ms = value.getTime();
    return Number.isFinite(ms) ? ms : null;
  }

  const raw = String(value || "").trim();
  if (!raw) return null;

  // Accept both ISO strings and MySQL DATETIME strings.
  const isoCandidate = raw.includes("T") ? raw : raw.replace(" ", "T");
  const ms = new Date(isoCandidate).getTime();
  return Number.isFinite(ms) ? ms : null;
}

async function listHallForms(user) {
  ensureAdmin(user);
  await expireExpiredFormsByHall(user.hallId);
  return listFormsByHall(user.hallId);
}

async function createHallForm(user, payload = {}) {
  ensureAdmin(user);
  const title = payload.name || payload.title;
  if (!title || !String(title).trim()) {
    const err = new Error("Form title is required");
    err.status = 400;
    throw err;
  }

  const sessionYears = normalizeSessionYearsInput(
    payload.sessionYears ?? payload.sessionYear
  );
  if (!sessionYears.length) {
    const err = new Error("At least one session year is required");
    err.status = 400;
    throw err;
  }

  const schema = normalizeSchemaInput(payload.schema);
  if (!schema.length) {
    const err = new Error("At least one field is required");
    err.status = 400;
    throw err;
  }

  const applicationStartDate = payload.applicationStartDate || null;
  const applicationDeadline = payload.applicationDeadline || null;
  const startMs = applicationStartDate
    ? toEpochMillis(applicationStartDate)
    : null;
  const endMs = applicationDeadline ? toEpochMillis(applicationDeadline) : null;
  if (applicationStartDate && startMs === null) {
    const err = new Error("Invalid applicationStartDate");
    err.status = 400;
    throw err;
  }
  if (applicationDeadline && endMs === null) {
    const err = new Error("Invalid applicationDeadline");
    err.status = 400;
    throw err;
  }
  if (startMs !== null && endMs !== null && startMs > endMs) {
    const err = new Error(
      "applicationStartDate must be before applicationDeadline"
    );
    err.status = 400;
    throw err;
  }

  const form = await createForm({
    hallId: user.hallId,
    sessionYears,
    title: String(title).trim(),
    isActive: false,
    applicationStartDate,
    applicationDeadline,
    schema,
    createdBy: user.userId,
  });

  if (payload.active) {
    await setHallFormActive(user, form.id, true);
    return getFormById(form.id);
  }

  return form;
}

async function updateHallForm(user, formId, payload = {}) {
  ensureAdmin(user);
  const title = payload.name || payload.title;
  if (!title || !String(title).trim()) {
    const err = new Error("Form title is required");
    err.status = 400;
    throw err;
  }

  const sessionYears = normalizeSessionYearsInput(
    payload.sessionYears ?? payload.sessionYear
  );
  if (!sessionYears.length) {
    const err = new Error("At least one session year is required");
    err.status = 400;
    throw err;
  }

  const schema = normalizeSchemaInput(payload.schema);
  if (!schema.length) {
    const err = new Error("At least one field is required");
    err.status = 400;
    throw err;
  }

  const applicationStartDate = payload.applicationStartDate || null;
  const applicationDeadline = payload.applicationDeadline || null;
  const startMs = applicationStartDate
    ? toEpochMillis(applicationStartDate)
    : null;
  const endMs = applicationDeadline ? toEpochMillis(applicationDeadline) : null;
  if (applicationStartDate && startMs === null) {
    const err = new Error("Invalid applicationStartDate");
    err.status = 400;
    throw err;
  }
  if (applicationDeadline && endMs === null) {
    const err = new Error("Invalid applicationDeadline");
    err.status = 400;
    throw err;
  }
  if (startMs !== null && endMs !== null && startMs > endMs) {
    const err = new Error(
      "applicationStartDate must be before applicationDeadline"
    );
    err.status = 400;
    throw err;
  }

  const form = await updateForm(formId, {
    hallId: user.hallId,
    sessionYears,
    title: String(title).trim(),
    isActive: !!payload.active,
    applicationStartDate,
    applicationDeadline,
    schema,
    updatedBy: user.userId,
  });

  if (payload.active) {
    await setHallFormActive(user, form.id, true);
    return getFormById(form.id);
  }

  return form;
}

async function setHallFormActive(user, formId, isActive) {
  ensureAdmin(user);

  if (isActive) {
    const form = await getFormById(formId);
    if (!form || form.hallId !== user.hallId) {
      const err = new Error("Form not found for your hall");
      err.status = 404;
      throw err;
    }
    if (form.applicationDeadline) {
      const endMs = toEpochMillis(form.applicationDeadline);
      if (endMs !== null && endMs <= Date.now()) {
        const err = new Error(
          "Cannot publish this form because its deadline has already passed"
        );
        err.status = 400;
        throw err;
      }
    }

    if (form.applicationStartDate && form.applicationDeadline) {
      const startMs = toEpochMillis(form.applicationStartDate);
      const endMs = toEpochMillis(form.applicationDeadline);
      if (startMs !== null && endMs !== null && startMs > endMs) {
        const err = new Error(
          "applicationStartDate must be before applicationDeadline"
        );
        err.status = 400;
        throw err;
      }
    }
  }

  return setFormActive(formId, user.hallId, !!isActive, user.userId);
}

async function deleteHallForm(user, formId) {
  ensureAdmin(user);
  await deleteForm(formId, user.hallId);
}

async function listFormApplications(user, formId) {
  ensureAdmin(user);
  const form = await getFormById(formId);
  if (!form || form.hallId !== user.hallId) {
    const err = new Error("Form not found for your hall");
    err.status = 404;
    throw err;
  }
  return listApplicationsByForm(formId, user.hallId);
}

async function recalculateFormApplicationScores(user, formId) {
  ensureAdmin(user);
  const form = await getFormById(formId);
  if (!form || form.hallId !== user.hallId) {
    const err = new Error("Form not found for your hall");
    err.status = 404;
    throw err;
  }

  const apps = await listApplicationsByForm(formId, user.hallId);
  let updated = 0;
  let unchanged = 0;

  for (const app of apps) {
    const nextScore = calculateScore(form, app?.data || {});
    const current = Number(app?.score || 0);
    const normalizedCurrent = Number.isFinite(current) ? current : 0;
    const normalizedNext = Number.isFinite(nextScore) ? nextScore : 0;
    if (normalizedNext === normalizedCurrent) {
      unchanged += 1;
      continue;
    }
    await updateApplicationScore({
      applicationId: app.id,
      hallId: user.hallId,
      totalScore: normalizedNext,
    });
    updated += 1;
  }

  return { formId, total: apps.length, updated, unchanged };
}

function normalizeStatus(input, hasSeat = false) {
  if (hasSeat) return "alloted";
  const raw = String(input || "")
    .trim()
    .toLowerCase();
  if (!raw) return "";
  switch (raw) {
    case "submitted":
      return "submitted";
    case "interview scheduled":
    case "scheduled":
      return "scheduled";
    case "seat allocated":
    case "allocated":
    case "alloted":
    case "allotted":
      return "alloted";
    case "not-alloted":
    case "not allotted":
    case "not_allocated":
    case "not allocated":
      return "not-alloted";
    case "rejected":
      return "rejected";
    case "selected":
      // Not part of final statuses; keep as scheduled until seat is assigned
      return "scheduled";
    default:
      return raw;
  }
}

async function updateFormApplicationStatus(
  user,
  formId,
  applicationId,
  payload = {}
) {
  ensureAdmin(user);
  const form = await getFormById(formId);
  if (!form || form.hallId !== user.hallId) {
    const err = new Error("Form not found for your hall");
    err.status = 404;
    throw err;
  }
  const seat = payload.seat || null;
  const rawStatus = String(payload.status || "")
    .trim()
    .toLowerCase();
  const status = normalizeStatus(rawStatus, !!seat);
  const interview = payload.interview || null;

  const rejectionReason =
    status === "rejected" ? String(payload.rejectionReason || "").trim() : null;
  if (status === "rejected" && !rejectionReason) {
    const err = new Error("Rejection reason is required");
    err.status = 400;
    throw err;
  }

  const result = await updateApplicationStatus({
    applicationId,
    hallId: user.hallId,
    status,
    interview,
    seat,
    rejectionReason,
  });

  // Notify student on interview scheduling
  if (status === "scheduled" && interview) {
    const formLabel = form?.title || form?.name || formId;
    await createNotification({
      userId: result.studentId,
      hallId: user.hallId,
      title: "Interview Scheduled",
      body: `Your interview for "${formLabel}" is scheduled on ${interview.date} at ${interview.time} in ${interview.venue}.`,
    });
  }

  // Notify student on selection (admin may send 'selected' even though DB stores 'scheduled')
  if (rawStatus === "selected") {
    const formLabel = form?.title || form?.name || formId;
    await createNotification({
      userId: result.studentId,
      hallId: user.hallId,
      title: "Selected",
      body: `You have been selected for "${formLabel}". Please check your dashboard for next steps.`,
    });
  }

  if (status === "rejected") {
    const formLabel = form?.title || form?.name || formId;
    const reasonText = rejectionReason ? ` Reason: ${rejectionReason}` : "";
    await createNotification({
      userId: result.studentId,
      hallId: user.hallId,
      title: "Application Rejected",
      body: `Your application for "${formLabel}" was rejected.${reasonText}`,
    });
  }

  return result;
}

function validateSubmission(form, payload) {
  const answers = payload.data || {};
  const attachments = payload.attachments || {};

  if (!form || !Array.isArray(form.schema)) {
    const err = new Error("Form is not configured");
    err.status = 400;
    throw err;
  }

  const missing = [];
  const missingDocuments = [];

  const isNoneSelection = (v) => {
    const s = String(v ?? "").trim();
    if (!s) return true;
    return s.toLowerCase() === "none";
  };

  form.schema.forEach((field) => {
    const value = answers[field.id];
    const hasValue = hasFieldValue(field, value);

    // Enforce fixed BD dataset for BD_ADDRESS fields.
    const kind = String(field?.fieldConfig?.kind || "").toUpperCase();
    if (
      String(field?.type || "").toLowerCase() === "text" &&
      kind === "BD_ADDRESS" &&
      hasValue
    ) {
      const district = String(value?.district || "").trim();
      const upazila = String(value?.upazila || "").trim();
      try {
        const {
          isValidDistrict,
          listUpazilaNamesByDistrict,
        } = require("../utils/bdAddress");
        if (!isValidDistrict(district)) {
          const err = new Error(
            `Invalid district selected for: ${field.label}`
          );
          err.status = 400;
          throw err;
        }
        const upazilas = listUpazilaNamesByDistrict(district);
        const ok = upazilas.some(
          (u) => String(u).toLowerCase() === upazila.toLowerCase()
        );
        if (!ok) {
          const err = new Error(`Invalid upazila selected for: ${field.label}`);
          err.status = 400;
          throw err;
        }
      } catch (e) {
        // If it's our validation error, rethrow; otherwise ignore dataset issues.
        if (e && e.status) throw e;
      }
    }

    if (field.required && !hasValue) {
      missing.push(field.label);
    }

    if (field.requiresDocument) {
      const attachment = attachments[field.id];
      const hasDoc = attachment && attachment.url;
      const requirement = (
        field.documentRequirement || "MANDATORY"
      ).toUpperCase();

      const fieldType = String(field?.type || "").toLowerCase();
      const docRequiredByValue =
        fieldType !== "dropdown" ? true : !isNoneSelection(value);

      if (requirement === "MANDATORY" && docRequiredByValue && !hasDoc) {
        missingDocuments.push(field.documentLabel || field.label || field.id);
      }
    }
  });

  if (missing.length) {
    const err = new Error(`Missing required fields: ${missing.join(", ")}`);
    err.status = 400;
    throw err;
  }

  if (missingDocuments.length) {
    const err = new Error(
      `Missing required documents: ${missingDocuments.join(", ")}`
    );
    err.status = 400;
    throw err;
  }
}

function calculateScore(form, answers) {
  const schema = Array.isArray(form?.schema) ? form.schema : [];

  function isBdAddressField(field) {
    const fieldType = String(field?.type || "").toLowerCase();
    const kind = String(field?.fieldConfig?.kind || "").toUpperCase();
    return fieldType === "text" && kind === "BD_ADDRESS";
  }

  function lookupPoints(map, key) {
    if (!map || typeof map !== "object" || Array.isArray(map)) return 0;
    const direct = Number(map[key] ?? 0);
    if (Number.isFinite(direct)) return direct;

    const wanted = String(key || "")
      .trim()
      .toLowerCase();
    if (!wanted) return 0;

    for (const [k, v] of Object.entries(map)) {
      const candidate = String(k || "")
        .trim()
        .toLowerCase();
      if (candidate === wanted) {
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
      }
    }

    return 0;
  }

  function computeFieldPoints(field, value) {
    const fieldType = String(field?.type || "").toLowerCase();

    // Special text subtype: Bangladesh address selector with direct points.
    const kind = String(field?.fieldConfig?.kind || "").toUpperCase();
    if (fieldType === "text" && kind === "BD_ADDRESS") {
      if (!value || typeof value !== "object" || Array.isArray(value)) return 0;
      const district = String(value.district || "").trim();
      const upazila = String(value.upazila || "").trim();

      // District is the minimum requirement to score.
      // Upazila is only required for Noakhali-specific scoring.
      if (!district) return 0;

      const isNoakhali = district.toLowerCase() === "noakhali";
      if (isNoakhali) {
        const upazilaPoints = upazila
          ? lookupPoints(field?.fieldConfig?.noakhaliUpazilaScores, upazila)
          : 0;
        if (upazilaPoints) return upazilaPoints;
        // Fallback: if admin configured districtScores for Noakhali, use it.
        return lookupPoints(field?.fieldConfig?.districtScores, district);
      }
      return lookupPoints(field?.fieldConfig?.districtScores, district);
    }

    // Dropdown/checkbox can have per-option points. These can be used even when field.score is 0.
    if (fieldType === "dropdown") {
      const selected =
        value === undefined || value === null ? "" : String(value).trim();
      if (!selected) return 0;
      const map = field?.optionScores;
      if (map && typeof map === "object" && !Array.isArray(map)) {
        const pts = Number(map[selected] ?? 0);
        return Number.isFinite(pts) ? pts : 0;
      }
      return 0;
    }

    if (fieldType === "checkbox") {
      const selected = Array.isArray(value)
        ? value
        : value === undefined || value === null
        ? []
        : [value];

      if (!selected.length) return 0;

      const map = field?.optionScores;
      if (map && typeof map === "object" && !Array.isArray(map)) {
        return selected.reduce((sum, opt) => {
          const key = String(opt);
          const pts = Number(map[key] ?? 0);
          return sum + (Number.isFinite(pts) ? pts : 0);
        }, 0);
      }

      return 0;
    }

    const weight = Number(field?.score || 0);
    if (!Number.isFinite(weight) || weight <= 0) return 0;

    const rules = field?.scoringRules;
    if (!rules || String(rules.mode || "").toUpperCase() !== "RANGE_PERCENT") {
      return weight;
    }

    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return 0;

    const ranges = Array.isArray(rules.ranges) ? rules.ranges : [];
    let bestPercent = null;

    for (const r of ranges) {
      if (!r || typeof r !== "object") continue;
      const min = r.min === null || r.min === undefined ? null : Number(r.min);
      const max = r.max === null || r.max === undefined ? null : Number(r.max);
      const percent = Number(r.percent);
      if (!Number.isFinite(percent)) continue;
      if (min !== null && !Number.isFinite(min)) continue;
      if (max !== null && !Number.isFinite(max)) continue;

      if (min !== null && numeric < min) continue;
      if (max !== null && numeric > max) continue;

      if (bestPercent === null || percent > bestPercent) {
        bestPercent = percent;
      }
    }

    if (bestPercent === null) {
      const fallback = Number(rules.defaultPercent ?? 0);
      bestPercent = Number.isFinite(fallback) ? fallback : 0;
    }

    const bounded = Math.max(0, Math.min(100, bestPercent));
    return (weight * bounded) / 100;
  }

  return schema.reduce((total, field) => {
    const value = answers?.[field.id];

    // For BD Address, scoring can be derived from district alone (except Noakhali).
    // So we don't gate it behind hasFieldValue(), which is stricter (district+upazila).
    if (isBdAddressField(field)) {
      return total + computeFieldPoints(field, value);
    }

    const hasValue = hasFieldValue(field, value);
    if (!hasValue) return total;
    return total + computeFieldPoints(field, value);
  }, 0);
}

async function resolveHallId(user) {
  if (user?.hallId) return user.hallId;
  // Masters/PhD accounts should not infer hall from the universityId format.
  if (isUuid(user?.userId)) return null;
  const sid = user?.studentId || user?.userId;
  if (!sid || sid.length < 3) return null;
  const code = String(sid).slice(0, 3).toUpperCase();
  try {
    const hallId = await findHallByCode(code);
    return hallId || null;
  } catch (e) {
    return null;
  }
}

async function getActiveFormForStudent(user) {
  ensureStudent(user);

  console.log("🔍 [DEBUG] Student eligibility check:", {
    userId: user.userId,
    studentId: user.studentId,
    hallId: user.hallId,
  });

  const hallId = await resolveHallId(user);
  if (!hallId) {
    console.log("❌ [DEBUG] No hallId for student (and fallback failed)");
    return null;
  }

  const isGraduateAccount = isUuid(user.userId);
  const studentSession = isGraduateAccount
    ? user.sessionYear || null
    : deriveSessionYearFromStudentId(user.studentId || user.userId);
  console.log("🔍 [DEBUG] Derived student session:", studentSession);

  if (!studentSession) {
    console.log("❌ [DEBUG] Unable to derive session");
    return null;
  }

  const alreadyAllocated = await hasActiveAllocation(user.userId);
  console.log("🔍 [DEBUG] Already allocated:", alreadyAllocated);

  if (alreadyAllocated) {
    console.log("❌ [DEBUG] Student already has active allocation");
    return null;
  }

  const form = await findActiveFormByHall(hallId);
  console.log(
    "🔍 [DEBUG] Found active form:",
    form
      ? {
          id: form.id,
          hallId: form.hallId,
          sessionYears: form.sessionYears,
        }
      : null
  );

  if (!form) {
    console.log("❌ [DEBUG] No active form found for hall:", hallId);
    return null;
  }

  const sessions = Array.isArray(form.sessionYears) ? form.sessionYears : [];
  console.log("🔍 [DEBUG] Form sessions:", sessions);
  console.log("🔍 [DEBUG] Student session:", studentSession);
  console.log("🔍 [DEBUG] Session match:", sessions.includes(studentSession));

  if (sessions.length && !sessions.includes(studentSession)) {
    console.log(
      "❌ [DEBUG] Session mismatch - student session not in form sessions"
    );
    return null;
  }

  // If the student already submitted this form, hide it from the "active form"
  // endpoint so they don't see/fill it again.
  try {
    const alreadyApplied = await hasApplicationForStudent(form.id, user.userId);
    console.log("🔍 [DEBUG] Already applied for active form:", alreadyApplied);
    if (alreadyApplied) {
      console.log("✅ [DEBUG] Hiding active form (already submitted)");
      return null;
    }
  } catch (_) {
    // If this check fails for any reason, don't block the form.
  }

  console.log("✅ [DEBUG] Student is eligible for form");
  return form;
}

async function submitFormResponse(user, formId, payload = {}) {
  ensureStudent(user);
  const form = await getFormById(formId);
  const hallId = await resolveHallId(user);
  if (!form || !hallId || form.hallId !== hallId) {
    const err = new Error("Form not found for your hall");
    err.status = 404;
    throw err;
  }

  if (!form.isActive) {
    const err = new Error("This form is not accepting responses");
    err.status = 400;
    throw err;
  }

  if (form.applicationStartDate) {
    const startMs = toEpochMillis(form.applicationStartDate);
    if (startMs !== null && startMs > Date.now()) {
      const err = new Error(
        "This application form is not open yet. Please try again later."
      );
      err.status = 400;
      throw err;
    }
  }

  if (form.applicationDeadline) {
    const endMs = toEpochMillis(form.applicationDeadline);
    if (endMs !== null && endMs <= Date.now()) {
      await expireExpiredFormsByHall(form.hallId);
      const err = new Error(
        "The application deadline has passed. This form is no longer accepting responses."
      );
      err.status = 400;
      throw err;
    }
  }

  const isGraduateAccount = isUuid(user.userId);
  const studentSession = isGraduateAccount
    ? user.sessionYear || null
    : deriveSessionYearFromStudentId(user.studentId || user.userId);
  if (!studentSession) {
    const err = new Error("Unable to determine your session");
    err.status = 400;
    throw err;
  }

  const formSessions = Array.isArray(form.sessionYears)
    ? form.sessionYears
    : [];
  if (formSessions.length && !formSessions.includes(studentSession)) {
    const err = new Error(
      "This application form is not available for your session"
    );
    err.status = 403;
    throw err;
  }

  if (await hasActiveAllocation(user.userId)) {
    const err = new Error(
      "Seat already assigned. You cannot submit a new application."
    );
    err.status = 400;
    throw err;
  }

  if (await hasApplicationForStudent(form.id, user.userId)) {
    const err = new Error(
      "You have already submitted an application for this form"
    );
    err.status = 400;
    throw err;
  }

  validateSubmission(form, payload);

  const answers = payload.data || {};
  const attachments = payload.attachments || {};
  const totalScore = calculateScore(form, answers);

  return createApplicationWithResponse({
    studentId: user.userId,
    hallId,
    form,
    answers,
    attachments,
    totalScore,
  });
}

async function listStudentApplications(user) {
  ensureStudent(user);
  return listApplicationsByStudent(user.userId);
}

async function getStudentApplicationDetails(user, applicationId) {
  ensureStudent(user);
  const application = await getApplicationDetailsByIdForStudent(
    applicationId,
    user.userId
  );
  const form = application?.formId
    ? await getFormById(application.formId)
    : null;
  return {
    application,
    form: form
      ? {
          id: form.id,
          title: form.title,
          schema: Array.isArray(form.schema) ? form.schema : [],
        }
      : null,
  };
}

module.exports = {
  listHallForms,
  createHallForm,
  updateHallForm,
  setHallFormActive,
  getActiveFormForStudent,
  submitFormResponse,
  deleteHallForm,
  listFormApplications,
  recalculateFormApplicationScores,
  updateFormApplicationStatus,
  listStudentApplications,
  getStudentApplicationDetails,
};
