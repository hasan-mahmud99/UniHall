const { v4: uuid } = require("uuid");
const { initPool } = require("../../config/db");

function isUnknownColumnError(error, columnName) {
  if (!error) return false;
  if (error.code !== "ER_BAD_FIELD_ERROR") return false;
  const msg = String(error.message || "");
  if (!columnName) return true;
  return msg.toLowerCase().includes(String(columnName).toLowerCase());
}

function isDuplicateKeyError(error) {
  return !!error && (error.code === "ER_DUP_ENTRY" || error.errno === 1062);
}

function parseSessionYears(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }
  return String(value)
    .split(",")
    .map((chunk) => chunk.trim())
    .filter(Boolean);
}

function isMissingSessionTableError(error) {
  if (!error) return false;
  return error.code === "ER_NO_SUCH_TABLE" || error.sqlState === "42S02";
}

function extractFieldIdFromFileUrl(fileUrl) {
  if (!fileUrl) return null;
  try {
    const url = new URL(String(fileUrl), "http://localhost");
    const fieldId = url.searchParams.get("fieldId");
    return fieldId ? String(fieldId) : null;
  } catch (_) {
    return null;
  }
}

function ensureFieldIdInFileUrl(fileUrl, fieldId) {
  if (!fileUrl || !fieldId) return fileUrl;
  try {
    const url = new URL(String(fileUrl), "http://localhost");
    if (!url.searchParams.get("fieldId")) {
      url.searchParams.set("fieldId", String(fieldId));
    }
    // Return original-style relative URL (path + query)
    return `${url.pathname}${url.search}`;
  } catch (_) {
    // Best-effort fallback
    const s = String(fileUrl);
    if (s.includes("fieldId=")) return s;
    const joiner = s.includes("?") ? "&" : "?";
    return `${s}${joiner}fieldId=${encodeURIComponent(String(fieldId))}`;
  }
}

function buildSessionYearMap(rows = []) {
  const map = new Map();
  rows.forEach((row) => {
    const formId = row.formId;
    const value = row.sessionYear && String(row.sessionYear).trim();
    if (!formId || !value) return;
    if (!map.has(formId)) {
      map.set(formId, []);
    }
    map.get(formId).push(value);
  });
  return map;
}

async function fetchSessionYearRows(client, formIds = []) {
  if (!client || !Array.isArray(formIds) || !formIds.length) {
    return [];
  }

  try {
    const [rows] = await client.query(
      `SELECT formId, sessionYear
         FROM form_sessions
        WHERE formId IN (?)
        ORDER BY created_at ASC`,
      [formIds]
    );

    return rows;
  } catch (err) {
    if (isMissingSessionTableError(err)) {
      return [];
    }
    throw err;
  }
}

async function replaceFormSessionYears(client, formId, sessionYears = []) {
  if (!client || !formId) return;

  const normalized = parseSessionYears(sessionYears);
  try {
    await client.query(`DELETE FROM form_sessions WHERE formId = ?`, [formId]);
  } catch (err) {
    if (isMissingSessionTableError(err)) {
      return;
    }
    throw err;
  }

  if (!normalized.length) return;

  const insertSql = `INSERT INTO form_sessions (formSessionId, formId, sessionYear, created_at)
                     VALUES (?, ?, ?, ?)`;
  const now = new Date();

  for (const session of normalized) {
    try {
      await client.query(insertSql, [uuid(), formId, session, now]);
    } catch (err) {
      if (isMissingSessionTableError(err)) {
        break;
      }
      throw err;
    }
  }
}

function mapFieldTypeToDb(type = "") {
  switch ((type || "").toLowerCase()) {
    case "text":
      return "TEXT";
    case "number":
      return "NUMBER";
    case "date":
      return "DATE";
    case "dropdown":
      return "DROPDOWN";
    case "checkbox":
      return "CHECKBOX";
    default:
      return "TEXT";
  }
}

function mapFieldTypeToClient(type = "") {
  switch ((type || "").toUpperCase()) {
    case "NUMBER":
      return "number";
    case "DATE":
      return "date";
    case "DROPDOWN":
      return "dropdown";
    case "CHECKBOX":
      return "checkbox";
    case "TEXT":
    default:
      return "text";
  }
}

async function getPool() {
  return initPool();
}

async function withTransaction(handler) {
  const pool = await getPool();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await handler(connection);
    await connection.commit();
    return result;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

function normalizeField(row, options = []) {
  if (!row) return null;
  let scoringRules = null;
  if (row.scoringRules) {
    try {
      scoringRules = JSON.parse(row.scoringRules);
    } catch (_) {
      scoringRules = null;
    }
  }

  let fieldConfig = null;
  if (row.fieldConfig) {
    try {
      fieldConfig = JSON.parse(row.fieldConfig);
    } catch (_) {
      fieldConfig = null;
    }
  }

  const optionScores = {};
  options.forEach((opt) => {
    const label = opt?.optionLabel;
    if (!label) return;
    const raw = opt.optionScore ?? opt.score ?? 0;
    const parsed = Number(raw);
    optionScores[label] = Number.isFinite(parsed) ? parsed : 0;
  });
  return {
    id: row.fieldId,
    label: row.fieldName,
    type: mapFieldTypeToClient(row.fieldType),
    required: !!row.isRequired,
    score: Number(row.score || 0),
    scoringRules,
    fieldConfig,
    requiresDocument: !!row.requiresDocument,
    documentLabel: row.documentLabel || "",
    documentRequirement: (row.documentRequirement || "MANDATORY").toUpperCase(),
    displayOrder: row.displayOrder || 0,
    options: options.map((opt) => opt.optionLabel),
    optionsText: options.map((opt) => opt.optionLabel).join(", "),
    optionScores: Object.keys(optionScores).length ? optionScores : null,
  };
}

function assembleForms(
  rows,
  versions,
  fields,
  options,
  sessionMap = new Map()
) {
  const versionByForm = new Map();
  versions.forEach((v) => {
    versionByForm.set(v.formId, v);
  });

  const fieldsByForm = new Map();
  const optionsByField = new Map();

  options.forEach((opt) => {
    if (!optionsByField.has(opt.fieldId)) {
      optionsByField.set(opt.fieldId, []);
    }
    optionsByField.get(opt.fieldId).push(opt);
  });

  fields.forEach((field) => {
    const list = fieldsByForm.get(field.formId) || [];
    list.push(field);
    fieldsByForm.set(field.formId, list);
  });

  return rows.map((row) => {
    const sessionYears = sessionMap.get(row.formId) || [];
    const version = versionByForm.get(row.formId);
    const fieldRows = fieldsByForm.get(row.formId) || [];
    const schema = fieldRows
      .sort((a, b) => {
        const orderDiff = (a.displayOrder || 0) - (b.displayOrder || 0);
        if (orderDiff !== 0) return orderDiff;
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
        return aTime - bTime;
      })
      .map((field) =>
        normalizeField(field, optionsByField.get(field.fieldId) || [])
      );

    return {
      id: row.formId,
      hallId: row.hallId,
      sessionYear: sessionYears[0] || null,
      sessionYears,
      name: row.formTitle,
      title: row.formTitle,
      version: version?.versionNumber || row.version || 1,
      versionId: version?.versionId || null,
      isActive: !!row.isActive,
      applicationStartDate: row.applicationStartDate,
      applicationDeadline: row.applicationDeadline,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdBy: row.created_by,
      updatedBy: row.updated_by,
      schema,
    };
  });
}

async function listFormsByHall(hallId) {
  const pool = await getPool();
  const [formRows] = await pool.query(
    `SELECT * FROM application_forms WHERE hallId = ? ORDER BY created_at DESC`,
    [hallId]
  );

  if (!formRows.length) return [];

  const formIds = formRows.map((row) => row.formId);
  const sessionRows = await fetchSessionYearRows(pool, formIds);
  const sessionMap = buildSessionYearMap(sessionRows);

  const [versionRows] = await pool.query(
    `SELECT fv.*
       FROM form_versions fv
       INNER JOIN (
         SELECT formId, MAX(versionNumber) AS versionNumber
         FROM form_versions
         WHERE formId IN (?) AND status <> 'DELETED'
         GROUP BY formId
       ) latest ON latest.formId = fv.formId AND latest.versionNumber = fv.versionNumber`,
    [formIds]
  );

  const versionIds = versionRows.map((v) => v.versionId);
  if (!versionIds.length) {
    return assembleForms(formRows, versionRows, [], [], sessionMap);
  }

  const [fieldRows] = await pool.query(
    `SELECT ff.*
       FROM form_fields ff
       WHERE ff.formId IN (?) AND ff.versionId IN (?) AND ff.status <> 'DELETED'`,
    [formIds, versionIds]
  );

  const fieldIds = fieldRows.map((f) => f.fieldId);
  const [optionRows] = fieldIds.length
    ? await pool.query(
        `SELECT fo.* FROM field_options fo WHERE fo.fieldId IN (?) ORDER BY fo.created_at ASC`,
        [fieldIds]
      )
    : [[]];

  return assembleForms(
    formRows,
    versionRows,
    fieldRows,
    optionRows,
    sessionMap
  );
}

async function getFormById(formId) {
  const pool = await getPool();
  const [rows] = await pool.query(
    `SELECT * FROM application_forms WHERE formId = ? LIMIT 1`,
    [formId]
  );
  if (!rows.length) return null;

  const form = rows[0];
  const sessionRows = await fetchSessionYearRows(pool, [formId]);
  const sessionMap = buildSessionYearMap(sessionRows);
  const [versionRows] = await pool.query(
    `SELECT * FROM form_versions WHERE formId = ? AND status <> 'DELETED' ORDER BY versionNumber DESC LIMIT 1`,
    [formId]
  );
  const version = versionRows[0];
  if (!version) {
    return assembleForms([form], [], [], [], sessionMap)[0];
  }

  const [fieldRows] = await pool.query(
    `SELECT * FROM form_fields WHERE formId = ? AND versionId = ? AND status <> 'DELETED' ORDER BY displayOrder ASC, created_at ASC`,
    [formId, version.versionId]
  );

  const fieldIds = fieldRows.map((f) => f.fieldId);
  const [optionRows] = fieldIds.length
    ? await pool.query(
        `SELECT * FROM field_options WHERE fieldId IN (?) ORDER BY created_at ASC`,
        [fieldIds]
      )
    : [[]];

  return assembleForms([form], [version], fieldRows, optionRows, sessionMap)[0];
}

async function createForm({
  hallId,
  sessionYear = null,
  sessionYears = null,
  title,
  isActive = false,
  applicationStartDate = null,
  applicationDeadline = null,
  schema = [],
  createdBy = null,
}) {
  return withTransaction(async (connection) => {
    const formId = uuid();
    const versionId = uuid();
    const now = new Date();
    const normalizedSessions = parseSessionYears(sessionYears ?? sessionYear);
    if (!normalizedSessions.length) {
      const err = new Error("At least one session year is required");
      err.status = 400;
      throw err;
    }

    await connection.query(
      `INSERT INTO application_forms (formId, hallId, formTitle, version, isActive, applicationStartDate, applicationDeadline, created_at, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        formId,
        hallId,
        title,
        1,
        isActive ? 1 : 0,
        applicationStartDate,
        applicationDeadline,
        now,
        createdBy,
      ]
    );

    await connection.query(
      `INSERT INTO form_versions (versionId, formId, versionNumber, status, created_at, created_by)
       VALUES (?, ?, ?, 'ACTIVE', ?, ?)`,
      [versionId, formId, 1, now, createdBy]
    );

    await replaceFormSessionYears(connection, formId, normalizedSessions);

    await persistFields(connection, {
      formId,
      versionId,
      schema,
      createdAt: now,
      createdBy,
    });

    return getFormById(formId);
  });
}

async function persistFields(
  connection,
  { formId, versionId, schema = [], createdAt = new Date(), createdBy = null }
) {
  const insertFieldSql = `INSERT INTO form_fields (fieldId, formId, versionId, fieldName, fieldType, isRequired, status, created_at, displayOrder, score, scoringRules, fieldConfig, requiresDocument, documentLabel, documentRequirement)
                          VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?, ?, ?, ?, ?, ?, ?)`;
  const insertOptionSql = `INSERT INTO field_options (optionId, fieldId, versionId, optionValue, optionLabel, optionScore, created_at)
                           VALUES (?, ?, ?, ?, ?, ?, ?)`;

  for (let index = 0; index < schema.length; index += 1) {
    const field = schema[index];
    const fieldId =
      field.id && String(field.id).length === 36 ? field.id : uuid();
    const fieldType = mapFieldTypeToDb(field.type);
    const isRequired = field.required ? 1 : 0;
    const displayOrder = field.displayOrder ?? index;
    const score = Number(field.score || 0);
    const scoringRules = field.scoringRules
      ? JSON.stringify(field.scoringRules)
      : null;
    let fieldConfig = null;
    if (field.fieldConfig && typeof field.fieldConfig === "object") {
      try {
        fieldConfig = JSON.stringify(field.fieldConfig);
      } catch (_) {
        fieldConfig = null;
      }
    }
    const requiresDocument = field.requiresDocument ? 1 : 0;
    const documentLabel = field.documentLabel || null;
    const documentRequirement = field.documentRequirement
      ? String(field.documentRequirement).toUpperCase()
      : "MANDATORY";

    await connection.query(insertFieldSql, [
      fieldId,
      formId,
      versionId,
      field.label || `Field ${index + 1}`,
      fieldType,
      isRequired,
      createdAt,
      displayOrder,
      score,
      scoringRules,
      fieldConfig,
      requiresDocument,
      documentLabel,
      documentRequirement === "RECOMMENDED" ? "RECOMMENDED" : "MANDATORY",
    ]);

    const options = Array.isArray(field.options) ? field.options : [];
    const optionScoreMap =
      field && field.optionScores && typeof field.optionScores === "object"
        ? field.optionScores
        : null;
    for (const option of options) {
      const optionLabel = String(option);
      const optScoreRaw = optionScoreMap ? optionScoreMap[optionLabel] : 0;
      const optScore = Number(optScoreRaw);
      await connection.query(insertOptionSql, [
        uuid(),
        fieldId,
        versionId,
        optionLabel,
        optionLabel,
        Number.isFinite(optScore) ? optScore : 0,
        createdAt,
      ]);
    }
  }
}

async function updateForm(
  formId,
  {
    hallId,
    sessionYear = null,
    sessionYears = null,
    title,
    isActive,
    applicationStartDate = null,
    applicationDeadline = null,
    schema = [],
    updatedBy = null,
  }
) {
  return withTransaction(async (connection) => {
    const [forms] = await connection.query(
      `SELECT * FROM application_forms WHERE formId = ? LIMIT 1`,
      [formId]
    );
    if (!forms.length) {
      const err = new Error("Form not found");
      err.status = 404;
      throw err;
    }

    const form = forms[0];
    if (hallId && form.hallId !== hallId) {
      const err = new Error("Form belongs to a different hall");
      err.status = 403;
      throw err;
    }

    const normalizedSessions = parseSessionYears(sessionYears ?? sessionYear);
    if (!normalizedSessions.length) {
      const err = new Error("At least one session year is required");
      err.status = 400;
      throw err;
    }

    await connection.query(
      `UPDATE application_forms
         SET formTitle = ?, applicationStartDate = ?, applicationDeadline = ?, isActive = ?, updated_at = NOW(), updated_by = ?
       WHERE formId = ?`,
      [
        title,
        applicationStartDate,
        applicationDeadline,
        isActive ? 1 : 0,
        updatedBy,
        formId,
      ]
    );

    const [versionRows] = await connection.query(
      `SELECT * FROM form_versions WHERE formId = ? AND status <> 'DELETED' ORDER BY versionNumber DESC LIMIT 1`,
      [formId]
    );
    if (!versionRows.length) {
      const err = new Error("Form version not found");
      err.status = 404;
      throw err;
    }

    const version = versionRows[0];

    const [existingFieldRows] = await connection.query(
      `SELECT fieldId FROM form_fields WHERE formId = ? AND versionId = ?`,
      [formId, version.versionId]
    );

    const existingIds = new Set(existingFieldRows.map((row) => row.fieldId));
    const incomingIds = new Set();

    const updateFieldSql = `UPDATE form_fields
        SET fieldName = ?, fieldType = ?, isRequired = ?, displayOrder = ?, score = ?, scoringRules = ?, fieldConfig = ?, requiresDocument = ?, documentLabel = ?, documentRequirement = ?, updated_at = NOW()
      WHERE fieldId = ?`;

    const insertFieldSql = `INSERT INTO form_fields (fieldId, formId, versionId, fieldName, fieldType, isRequired, status, created_at, displayOrder, score, scoringRules, fieldConfig, requiresDocument, documentLabel, documentRequirement)
        VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', NOW(), ?, ?, ?, ?, ?, ?, ?)`;

    const deleteFieldSql = `DELETE FROM form_fields WHERE fieldId = ?`;
    const deleteOptionsSql = `DELETE FROM field_options WHERE fieldId = ?`;
    const insertOptionSql = `INSERT INTO field_options (optionId, fieldId, versionId, optionValue, optionLabel, optionScore, created_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())`;

    for (let index = 0; index < schema.length; index += 1) {
      const field = schema[index];
      const fieldId =
        field.id && String(field.id).length === 36 ? field.id : uuid();
      const fieldType = mapFieldTypeToDb(field.type);
      const isRequired = field.required ? 1 : 0;
      const displayOrder = field.displayOrder ?? index;
      const score = Number(field.score || 0);
      const scoringRules = field.scoringRules
        ? JSON.stringify(field.scoringRules)
        : null;
      let fieldConfig = null;
      if (field.fieldConfig && typeof field.fieldConfig === "object") {
        try {
          fieldConfig = JSON.stringify(field.fieldConfig);
        } catch (_) {
          fieldConfig = null;
        }
      }
      const requiresDocument = field.requiresDocument ? 1 : 0;
      const documentLabel = field.documentLabel || null;
      const documentRequirement = field.documentRequirement
        ? String(field.documentRequirement).toUpperCase()
        : "MANDATORY";

      incomingIds.add(fieldId);

      if (existingIds.has(fieldId)) {
        await connection.query(updateFieldSql, [
          field.label || `Field ${index + 1}`,
          fieldType,
          isRequired,
          displayOrder,
          score,
          scoringRules,
          fieldConfig,
          requiresDocument,
          documentLabel,
          documentRequirement === "RECOMMENDED" ? "RECOMMENDED" : "MANDATORY",
          fieldId,
        ]);
      } else {
        await connection.query(insertFieldSql, [
          fieldId,
          formId,
          version.versionId,
          field.label || `Field ${index + 1}`,
          fieldType,
          isRequired,
          displayOrder,
          score,
          scoringRules,
          fieldConfig,
          requiresDocument,
          documentLabel,
          documentRequirement === "RECOMMENDED" ? "RECOMMENDED" : "MANDATORY",
        ]);
      }

      await connection.query(deleteOptionsSql, [fieldId]);
      const options = Array.isArray(field.options) ? field.options : [];
      const optionScoreMap =
        field && field.optionScores && typeof field.optionScores === "object"
          ? field.optionScores
          : null;
      for (const option of options) {
        const optionLabel = String(option);
        const optScoreRaw = optionScoreMap ? optionScoreMap[optionLabel] : 0;
        const optScore = Number(optScoreRaw);
        await connection.query(insertOptionSql, [
          uuid(),
          fieldId,
          version.versionId,
          optionLabel,
          optionLabel,
          Number.isFinite(optScore) ? optScore : 0,
        ]);
      }
    }

    for (const existingId of existingIds) {
      if (!incomingIds.has(existingId)) {
        await connection.query(deleteOptionsSql, [existingId]);
        await connection.query(deleteFieldSql, [existingId]);
      }
    }

    await replaceFormSessionYears(connection, formId, normalizedSessions);

    return getFormById(formId);
  });
}

async function deactivateOtherForms(connection, hallId, excludeFormId) {
  await connection.query(
    `UPDATE application_forms SET isActive = 0, updated_at = NOW() WHERE hallId = ? AND formId <> ?`,
    [hallId, excludeFormId]
  );
}

async function setFormActive(formId, hallId, isActive, updatedBy = null) {
  return withTransaction(async (connection) => {
    const [forms] = await connection.query(
      `SELECT * FROM application_forms WHERE formId = ? LIMIT 1`,
      [formId]
    );
    if (!forms.length) {
      const err = new Error("Form not found");
      err.status = 404;
      throw err;
    }
    const form = forms[0];
    if (form.hallId !== hallId) {
      const err = new Error("Form belongs to a different hall");
      err.status = 403;
      throw err;
    }

    if (isActive) {
      await deactivateOtherForms(connection, hallId, formId);
    }

    await connection.query(
      `UPDATE application_forms SET isActive = ?, updated_at = NOW(), updated_by = ? WHERE formId = ?`,
      [isActive ? 1 : 0, updatedBy, formId]
    );

    return getFormById(formId);
  });
}

async function findActiveFormByHall(hallId) {
  const pool = await getPool();
  // Auto-expire active forms whose deadline has passed.
  await pool.query(
    `UPDATE application_forms
        SET isActive = 0,
            updated_at = NOW()
      WHERE hallId = ?
        AND isActive = 1
        AND applicationDeadline IS NOT NULL
        AND applicationDeadline <= NOW()`,
    [hallId]
  );
  const [rows] = await pool.query(
    `SELECT *
       FROM application_forms
      WHERE hallId = ?
        AND isActive = 1
        AND (applicationStartDate IS NULL OR applicationStartDate <= NOW())
        AND (applicationDeadline IS NULL OR applicationDeadline > NOW())
      ORDER BY updated_at DESC
      LIMIT 1`,
    [hallId]
  );
  if (!rows.length) return null;
  return getFormById(rows[0].formId);
}

async function expireExpiredFormsByHall(hallId) {
  if (!hallId) return { expiredCount: 0 };
  const pool = await getPool();
  const [result] = await pool.query(
    `UPDATE application_forms
        SET isActive = 0,
            updated_at = NOW()
      WHERE hallId = ?
        AND isActive = 1
        AND applicationDeadline IS NOT NULL
        AND applicationDeadline <= NOW()`,
    [hallId]
  );
  return { expiredCount: Number(result?.affectedRows || 0) };
}

async function expireAllExpiredForms() {
  const pool = await getPool();
  const [result] = await pool.query(
    `UPDATE application_forms
        SET isActive = 0,
            updated_at = NOW()
      WHERE isActive = 1
        AND applicationDeadline IS NOT NULL
        AND applicationDeadline <= NOW()`
  );
  return { expiredCount: Number(result?.affectedRows || 0) };
}

async function createApplicationWithResponse({
  studentId,
  hallId,
  form,
  answers,
  attachments,
  totalScore,
}) {
  return withTransaction(async (connection) => {
    const applicationId = uuid();
    const responseId = uuid();
    const now = new Date();

    try {
      await connection.query(
        `INSERT INTO applications (applicationId, studentId, hallId, formId, formVersionId, status, submissionDate, created_at, updated_at, totalScore)
         VALUES (?, ?, ?, ?, ?, 'submitted', ?, ?, ?, ?)`,
        [
          applicationId,
          studentId,
          hallId,
          form.id,
          form.versionId,
          now,
          now,
          now,
          totalScore,
        ]
      );
    } catch (err) {
      // If a DB-level unique constraint exists (recommended), concurrent submits
      // should be translated into a clean 400 for the client.
      if (isDuplicateKeyError(err)) {
        const e = new Error(
          "You have already submitted an application for this form"
        );
        e.status = 400;
        throw e;
      }
      throw err;
    }

    await connection.query(
      `INSERT INTO form_responses (responseId, applicationId, submissionDate, created_at)
       VALUES (?, ?, ?, ?)`,
      [responseId, applicationId, now, now]
    );

    const insertValueSql = `INSERT INTO form_response_values (responseId, fieldId, value, created_at)
      VALUES (?, ?, ?, ?)`;

    for (const field of form.schema) {
      const rawValue = answers[field.id];
      if (rawValue === undefined) continue;
      let value;
      if (Array.isArray(rawValue)) {
        value = JSON.stringify(rawValue);
      } else if (rawValue && typeof rawValue === "object") {
        try {
          value = JSON.stringify(rawValue);
        } catch (_) {
          value = String(rawValue);
        }
      } else {
        value = String(rawValue);
      }
      await connection.query(insertValueSql, [
        responseId,
        field.id,
        value,
        now,
      ]);
    }

    const attachmentEntries = [];
    const insertAttachmentSql = `INSERT INTO attachments (attachmentId, entityType, entityId, fileName, fileType, fileUrl, created_at, created_by)
      VALUES (?, 'FORM_RESPONSE', ?, ?, ?, ?, ?, ?)`;

    for (const [fieldId, attachment] of Object.entries(attachments || {})) {
      if (!attachment || !attachment.url) continue;
      const fileName = attachment.name || "attachment";
      const fileType = attachment.type || "application/octet-stream";
      const fileUrl = ensureFieldIdInFileUrl(attachment.url, fieldId);
      await connection.query(insertAttachmentSql, [
        uuid(),
        responseId,
        fileName,
        fileType,
        fileUrl,
        now,
        studentId,
      ]);
      attachmentEntries.push({
        fieldId,
        fileName,
        fileType,
        url: fileUrl,
      });
    }

    return {
      applicationId,
      responseId,
      attachments: attachmentEntries,
    };
  });
}

async function hasActiveAllocation(studentId) {
  if (!studentId) return false;

  const pool = await getPool();
  const [rows] = await pool.query(
    `SELECT allocationId
       FROM student_allocations
      WHERE studentId = ?
        AND status IN ('ALLOCATED', 'ACTIVE')
      LIMIT 1`,
    [studentId]
  );

  return rows.length > 0;
}

async function hasApplicationForStudent(formId, studentId) {
  if (!formId || !studentId) return false;
  const pool = await getPool();
  const [rows] = await pool.query(
    `SELECT applicationId FROM applications WHERE formId = ? AND studentId = ? LIMIT 1`,
    [formId, studentId]
  );
  return rows.length > 0;
}

async function listApplicationsByStudent(studentId) {
  const pool = await getPool();
  let apps;
  try {
    [apps] = await pool.query(
      `SELECT a.applicationId, a.formId, a.status, a.submissionDate, a.totalScore, a.rejectionReason,
              f.formTitle AS formTitle, f.hallId
         FROM applications a
         LEFT JOIN application_forms f ON f.formId = a.formId
        WHERE a.studentId = ?
        ORDER BY a.submissionDate DESC`,
      [studentId]
    );
  } catch (err) {
    // Backwards-compatibility: older DBs don't have applications.rejectionReason.
    if (isUnknownColumnError(err, "rejectionReason")) {
      [apps] = await pool.query(
        `SELECT a.applicationId, a.formId, a.status, a.submissionDate, a.totalScore, NULL AS rejectionReason,
                f.formTitle AS formTitle, f.hallId
           FROM applications a
           LEFT JOIN application_forms f ON f.formId = a.formId
          WHERE a.studentId = ?
          ORDER BY a.submissionDate DESC`,
        [studentId]
      );
    } else {
      throw err;
    }
  }

  if (!apps.length) return [];

  const appIds = apps.map((r) => r.applicationId);
  const [responses] = await pool.query(
    `SELECT fr.responseId, fr.applicationId, fr.submissionDate
       FROM form_responses fr
      WHERE fr.applicationId IN (?)`,
    [appIds]
  );

  const responseByApp = new Map();
  responses.forEach((r) => responseByApp.set(r.applicationId, r.responseId));
  const responseIds = responses.map((r) => r.responseId);

  const [attachRows] = responseIds.length
    ? await pool.query(
        `SELECT att.entityId AS responseId, att.fileName, att.fileType, att.fileUrl
           FROM attachments att
          WHERE att.entityType = 'FORM_RESPONSE' AND att.entityId IN (?)
          ORDER BY att.created_at DESC`,
        [responseIds]
      )
    : [[]];

  const attachmentsByResponse = new Map();
  attachRows.forEach((a) => {
    const list = attachmentsByResponse.get(a.responseId) || [];
    list.push({
      fieldId: extractFieldIdFromFileUrl(a.fileUrl),
      name: a.fileName,
      type: a.fileType,
      url: a.fileUrl,
    });
    attachmentsByResponse.set(a.responseId, list);
  });

  return apps.map((a) => {
    const responseId = responseByApp.get(a.applicationId) || null;
    const lowered = String(a.status || "submitted").toLowerCase();
    const status =
      lowered === "interview scheduled"
        ? "scheduled"
        : lowered === "seat allocated"
        ? "alloted"
        : lowered === "selected"
        ? "scheduled"
        : lowered === "under review"
        ? "submitted"
        : lowered;
    return {
      id: a.applicationId,
      formId: a.formId,
      formTitle: a.formTitle,
      status,
      submittedAt: a.submissionDate,
      score: Number(a.totalScore || 0),
      rejectionReason: a.rejectionReason || null,
      responseId,
      attachments: attachmentsByResponse.get(responseId) || [],
    };
  });
}

async function deleteForm(formId, hallId) {
  if (!formId) {
    const err = new Error("Form identifier is required");
    err.status = 400;
    throw err;
  }

  return withTransaction(async (connection) => {
    const [forms] = await connection.query(
      `SELECT * FROM application_forms WHERE formId = ? LIMIT 1`,
      [formId]
    );

    if (!forms.length) {
      const err = new Error("Form not found");
      err.status = 404;
      throw err;
    }

    const form = forms[0];
    if (hallId && form.hallId !== hallId) {
      const err = new Error("Form belongs to a different hall");
      err.status = 403;
      throw err;
    }

    const [[usage]] = await connection.query(
      `SELECT COUNT(*) AS total FROM applications WHERE formId = ?`,
      [formId]
    );

    if (usage.total > 0) {
      const err = new Error(
        "Forms with submitted applications cannot be deleted"
      );
      err.status = 400;
      throw err;
    }

    const [fieldRows] = await connection.query(
      `SELECT fieldId FROM form_fields WHERE formId = ?`,
      [formId]
    );

    const fieldIds = fieldRows.map((row) => row.fieldId);
    if (fieldIds.length) {
      await connection.query(`DELETE FROM field_options WHERE fieldId IN (?)`, [
        fieldIds,
      ]);
    }

    await connection.query(`DELETE FROM form_fields WHERE formId = ?`, [
      formId,
    ]);
    await connection.query(`DELETE FROM form_sessions WHERE formId = ?`, [
      formId,
    ]);
    await connection.query(`DELETE FROM form_versions WHERE formId = ?`, [
      formId,
    ]);
    await connection.query(`DELETE FROM application_forms WHERE formId = ?`, [
      formId,
    ]);

    return { formId };
  });
}

async function listApplicationsByForm(formId, hallId) {
  const pool = await getPool();
  let apps;
  try {
    [apps] = await pool.query(
      `SELECT a.applicationId, a.studentId, a.hallId, a.formId, a.formVersionId, a.status, a.submissionDate, a.totalScore, a.rejectionReason,
              u.userId AS applicantUserId, u.name AS applicantName, u.email AS applicantEmail,
              sp.universityId AS studentUniversityId, sp.programLevel AS studentProgramLevel, sp.department AS studentDepartment, sp.sessionYear AS studentSession
         FROM applications a
         LEFT JOIN users u ON u.userId = a.studentId
         LEFT JOIN student_profiles sp ON sp.userId = a.studentId
        WHERE a.formId = ? AND a.hallId = ?
        ORDER BY a.submissionDate DESC`,
      [formId, hallId]
    );
  } catch (err) {
    if (isUnknownColumnError(err, "rejectionReason")) {
      [apps] = await pool.query(
        `SELECT a.applicationId, a.studentId, a.hallId, a.formId, a.formVersionId, a.status, a.submissionDate, a.totalScore, NULL AS rejectionReason,
                u.userId AS applicantUserId, u.name AS applicantName, u.email AS applicantEmail,
                sp.universityId AS studentUniversityId, sp.programLevel AS studentProgramLevel, sp.department AS studentDepartment, sp.sessionYear AS studentSession
           FROM applications a
           LEFT JOIN users u ON u.userId = a.studentId
           LEFT JOIN student_profiles sp ON sp.userId = a.studentId
          WHERE a.formId = ? AND a.hallId = ?
          ORDER BY a.submissionDate DESC`,
        [formId, hallId]
      );
    } else {
      throw err;
    }
  }

  if (!apps.length) return [];

  const appIds = apps.map((r) => r.applicationId);
  const [responses] = await pool.query(
    `SELECT fr.responseId, fr.applicationId, fr.submissionDate
       FROM form_responses fr
      WHERE fr.applicationId IN (?)`,
    [appIds]
  );

  const responseByApp = new Map();
  responses.forEach((r) => responseByApp.set(r.applicationId, r.responseId));
  const responseIds = responses.map((r) => r.responseId);

  const [values] = responseIds.length
    ? await pool.query(
        `SELECT frv.responseId, frv.fieldId, frv.value
           FROM form_response_values frv
          WHERE frv.responseId IN (?)`,
        [responseIds]
      )
    : [[]];

  const [attachRows] = responseIds.length
    ? await pool.query(
        `SELECT att.entityId AS responseId, att.fileName, att.fileType, att.fileUrl, att.created_at
           FROM attachments att
          WHERE att.entityType = 'FORM_RESPONSE' AND att.entityId IN (?)
          ORDER BY att.created_at DESC`,
        [responseIds]
      )
    : [[]];

  // Fetch interview details, one per application if exists
  const [interviews] = await pool
    .query(
      `SELECT i.applicationId, i.date, i.time, i.venue
       FROM interviews i
      WHERE i.applicationId IN (?)`,
      [appIds]
    )
    .catch(() => [[]]);

  const interviewByApp = new Map();
  interviews.forEach((i) =>
    interviewByApp.set(i.applicationId, {
      date: i.date,
      time: i.time,
      venue: i.venue,
    })
  );

  const valuesByResponse = new Map();
  values.forEach((v) => {
    const list = valuesByResponse.get(v.responseId) || [];
    list.push({ fieldId: v.fieldId, value: v.value });
    valuesByResponse.set(v.responseId, list);
  });

  const attachmentsByResponse = new Map();
  attachRows.forEach((a) => {
    const list = attachmentsByResponse.get(a.responseId) || [];
    list.push({ name: a.fileName, type: a.fileType, url: a.fileUrl });
    attachmentsByResponse.set(a.responseId, list);
  });

  return apps.map((a) => {
    const responseId = responseByApp.get(a.applicationId);
    const answerPairs = valuesByResponse.get(responseId) || [];
    const data = {};
    for (const pair of answerPairs) {
      let val = pair.value;
      try {
        const parsed = JSON.parse(val);
        val = parsed;
      } catch (_) {
        // keep as string
      }
      data[pair.fieldId] = val;
    }

    return {
      id: a.applicationId,
      formId: a.formId,
      responseId,
      status: a.status,
      submittedAt: a.submissionDate,
      score: Number(a.totalScore || 0),
      rejectionReason: a.rejectionReason || null,
      applicant: {
        userId: a.applicantUserId || a.studentId,
        name: a.applicantName || "Unknown",
        email: a.applicantEmail || "N/A",
        studentId: a.studentUniversityId || a.studentId || "N/A",
        programLevel: a.studentProgramLevel || null,
        department: a.studentDepartment || null,
        session: a.studentSession || null,
      },
      data,
      attachments: attachmentsByResponse.get(responseId) || [],
      interview: interviewByApp.get(a.applicationId) || null,
    };
  });
}

async function getApplicationDetailsById(applicationId, hallId) {
  if (!applicationId) {
    const err = new Error("applicationId is required");
    err.status = 400;
    throw err;
  }

  const pool = await getPool();
  let apps;
  try {
    [apps] = await pool.query(
      `SELECT a.applicationId, a.studentId, a.hallId, a.formId, a.formVersionId, a.status, a.submissionDate, a.totalScore, a.rejectionReason,
              u.userId AS applicantUserId, u.name AS applicantName, u.email AS applicantEmail,
              sp.universityId AS studentUniversityId, sp.programLevel AS studentProgramLevel, sp.department AS studentDepartment, sp.sessionYear AS studentSession
         FROM applications a
         LEFT JOIN users u ON u.userId = a.studentId
         LEFT JOIN student_profiles sp ON sp.userId = a.studentId
        WHERE a.applicationId = ? AND a.hallId = ?
        LIMIT 1`,
      [applicationId, hallId]
    );
  } catch (err) {
    if (isUnknownColumnError(err, "rejectionReason")) {
      [apps] = await pool.query(
        `SELECT a.applicationId, a.studentId, a.hallId, a.formId, a.formVersionId, a.status, a.submissionDate, a.totalScore, NULL AS rejectionReason,
                u.userId AS applicantUserId, u.name AS applicantName, u.email AS applicantEmail,
                sp.universityId AS studentUniversityId, sp.programLevel AS studentProgramLevel, sp.department AS studentDepartment, sp.sessionYear AS studentSession
           FROM applications a
           LEFT JOIN users u ON u.userId = a.studentId
           LEFT JOIN student_profiles sp ON sp.userId = a.studentId
          WHERE a.applicationId = ? AND a.hallId = ?
          LIMIT 1`,
        [applicationId, hallId]
      );
    } else {
      throw err;
    }
  }

  if (!apps.length) {
    const err = new Error("Application not found");
    err.status = 404;
    throw err;
  }

  const a = apps[0];

  const [responses] = await pool.query(
    `SELECT fr.responseId, fr.applicationId, fr.submissionDate
       FROM form_responses fr
      WHERE fr.applicationId = ?
      ORDER BY fr.submissionDate DESC
      LIMIT 1`,
    [applicationId]
  );

  const responseId = responses?.[0]?.responseId || null;

  const [values] = responseId
    ? await pool.query(
        `SELECT frv.responseId, frv.fieldId, frv.value
           FROM form_response_values frv
          WHERE frv.responseId = ?`,
        [responseId]
      )
    : [[]];

  const [attachRows] = responseId
    ? await pool.query(
        `SELECT att.entityId AS responseId, att.fileName, att.fileType, att.fileUrl, att.created_at
           FROM attachments att
          WHERE att.entityType = 'FORM_RESPONSE' AND att.entityId = ?
          ORDER BY att.created_at DESC`,
        [responseId]
      )
    : [[]];

  const [interviews] = await pool
    .query(
      `SELECT i.applicationId, i.date, i.time, i.venue
       FROM interviews i
      WHERE i.applicationId = ?
      LIMIT 1`,
      [applicationId]
    )
    .catch(() => [[]]);

  const data = {};
  for (const pair of values || []) {
    let val = pair.value;
    try {
      val = JSON.parse(val);
    } catch (_) {
      // keep as string
    }
    data[pair.fieldId] = val;
  }

  return {
    id: a.applicationId,
    formId: a.formId,
    responseId,
    status: a.status,
    submittedAt: a.submissionDate,
    score: Number(a.totalScore || 0),
    rejectionReason: a.rejectionReason || null,
    applicant: {
      userId: a.applicantUserId || a.studentId,
      name: a.applicantName || "Unknown",
      email: a.applicantEmail || "N/A",
      studentId: a.studentUniversityId || a.studentId || "N/A",
      programLevel: a.studentProgramLevel || null,
      department: a.studentDepartment || null,
      session: a.studentSession || null,
    },
    data,
    attachments: (attachRows || []).map((att) => ({
      fieldId: extractFieldIdFromFileUrl(att.fileUrl),
      name: att.fileName,
      type: att.fileType,
      url: att.fileUrl,
    })),
    interview: interviews?.[0]
      ? {
          date: interviews[0].date,
          time: interviews[0].time,
          venue: interviews[0].venue,
        }
      : null,
  };
}

async function getApplicationDetailsByIdForStudent(applicationId, studentId) {
  if (!applicationId) {
    const err = new Error("applicationId is required");
    err.status = 400;
    throw err;
  }
  if (!studentId) {
    const err = new Error("studentId is required");
    err.status = 400;
    throw err;
  }

  const pool = await getPool();
  let apps;
  try {
    [apps] = await pool.query(
      `SELECT a.applicationId, a.studentId, a.hallId, a.formId, a.formVersionId, a.status, a.submissionDate, a.totalScore, a.rejectionReason,
              u.userId AS applicantUserId, u.name AS applicantName, u.email AS applicantEmail,
              sp.universityId AS studentUniversityId, sp.programLevel AS studentProgramLevel, sp.department AS studentDepartment, sp.sessionYear AS studentSession
         FROM applications a
         LEFT JOIN users u ON u.userId = a.studentId
         LEFT JOIN student_profiles sp ON sp.userId = a.studentId
        WHERE a.applicationId = ? AND a.studentId = ?
        LIMIT 1`,
      [applicationId, studentId]
    );
  } catch (err) {
    if (isUnknownColumnError(err, "rejectionReason")) {
      [apps] = await pool.query(
        `SELECT a.applicationId, a.studentId, a.hallId, a.formId, a.formVersionId, a.status, a.submissionDate, a.totalScore, NULL AS rejectionReason,
                u.userId AS applicantUserId, u.name AS applicantName, u.email AS applicantEmail,
                sp.universityId AS studentUniversityId, sp.programLevel AS studentProgramLevel, sp.department AS studentDepartment, sp.sessionYear AS studentSession
           FROM applications a
           LEFT JOIN users u ON u.userId = a.studentId
           LEFT JOIN student_profiles sp ON sp.userId = a.studentId
          WHERE a.applicationId = ? AND a.studentId = ?
          LIMIT 1`,
        [applicationId, studentId]
      );
    } else {
      throw err;
    }
  }

  if (!apps.length) {
    const err = new Error("Application not found");
    err.status = 404;
    throw err;
  }

  const a = apps[0];

  const [responses] = await pool.query(
    `SELECT fr.responseId, fr.applicationId, fr.submissionDate
       FROM form_responses fr
      WHERE fr.applicationId = ?
      ORDER BY fr.submissionDate DESC
      LIMIT 1`,
    [applicationId]
  );

  const responseId = responses?.[0]?.responseId || null;

  const [values] = responseId
    ? await pool.query(
        `SELECT frv.responseId, frv.fieldId, frv.value
           FROM form_response_values frv
          WHERE frv.responseId = ?`,
        [responseId]
      )
    : [[]];

  const [attachRows] = responseId
    ? await pool.query(
        `SELECT att.entityId AS responseId, att.fileName, att.fileType, att.fileUrl, att.created_at
           FROM attachments att
          WHERE att.entityType = 'FORM_RESPONSE' AND att.entityId = ?
          ORDER BY att.created_at DESC`,
        [responseId]
      )
    : [[]];

  const [interviews] = await pool
    .query(
      `SELECT i.applicationId, i.date, i.time, i.venue
       FROM interviews i
      WHERE i.applicationId = ?
      LIMIT 1`,
      [applicationId]
    )
    .catch(() => [[]]);

  const data = {};
  for (const pair of values || []) {
    let val = pair.value;
    try {
      val = JSON.parse(val);
    } catch (_) {
      // keep as string
    }
    data[pair.fieldId] = val;
  }

  return {
    id: a.applicationId,
    formId: a.formId,
    responseId,
    status: a.status,
    submittedAt: a.submissionDate,
    score: Number(a.totalScore || 0),
    rejectionReason: a.rejectionReason || null,
    applicant: {
      userId: a.applicantUserId || a.studentId,
      name: a.applicantName || "Unknown",
      email: a.applicantEmail || "N/A",
      studentId: a.studentUniversityId || a.studentId || "N/A",
      programLevel: a.studentProgramLevel || null,
      department: a.studentDepartment || null,
      session: a.studentSession || null,
    },
    data,
    attachments: (attachRows || []).map((att) => ({
      fieldId: extractFieldIdFromFileUrl(att.fileUrl),
      name: att.fileName,
      type: att.fileType,
      url: att.fileUrl,
    })),
    interview: interviews?.[0]
      ? {
          date: interviews[0].date,
          time: interviews[0].time,
          venue: interviews[0].venue,
        }
      : null,
  };
}

async function updateApplicationStatus({
  applicationId,
  hallId,
  status,
  interview = null,
  seat = null,
  rejectionReason = null,
}) {
  if (!applicationId || !status) {
    const err = new Error("Application and status are required");
    err.status = 400;
    throw err;
  }
  const pool = await getPool();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [apps] = await connection.query(
      `SELECT * FROM applications WHERE applicationId = ? LIMIT 1`,
      [applicationId]
    );
    if (!apps.length) {
      const err = new Error("Application not found");
      err.status = 404;
      throw err;
    }
    const app = apps[0];
    if (hallId && app.hallId !== hallId) {
      const err = new Error("Application belongs to a different hall");
      err.status = 403;
      throw err;
    }

    // Determine next status: if seat provided, force 'alloted'; else use provided status or keep existing
    let nextStatus =
      seat && seat.floor && seat.room
        ? "alloted"
        : String(status || "")
            .trim()
            .toLowerCase();
    if (!nextStatus) {
      nextStatus = String(app.status || "submitted").toLowerCase();
    }
    const trimmedReason = String(rejectionReason || "").trim();
    const nextRejectionReason =
      nextStatus === "rejected" ? trimmedReason || "Rejected" : null;

    try {
      await connection.query(
        `UPDATE applications
            SET status = ?,
                rejectionReason = ?,
                updated_at = NOW()
          WHERE applicationId = ?`,
        [nextStatus, nextRejectionReason, applicationId]
      );
    } catch (err) {
      // Backwards-compatibility: older DBs don't have applications.rejectionReason.
      if (isUnknownColumnError(err, "rejectionReason")) {
        await connection.query(
          `UPDATE applications
              SET status = ?,
                  updated_at = NOW()
            WHERE applicationId = ?`,
          [nextStatus, applicationId]
        );
      } else {
        throw err;
      }
    }

    // Optional interview schedule storage (kept in a separate table if exists)
    if (interview && interview.date && interview.time && interview.venue) {
      await connection
        .query(
          `INSERT INTO interviews (interviewId, applicationId, date, time, venue, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE date = VALUES(date), time = VALUES(time), venue = VALUES(venue), updated_at = NOW()`,
          [
            uuid(),
            applicationId,
            interview.date,
            interview.time,
            interview.venue,
          ]
        )
        .catch(() => {
          /* table may not exist; ignore */
        });
    }

    // Optional seat allocation
    if (seat && seat.floor && seat.room) {
      await connection
        .query(
          `INSERT INTO student_allocations (allocationId, studentId, hallId, floor, roomNumber, status, created_at)
         VALUES (?, ?, ?, ?, ?, 'ALLOCATED', NOW())`,
          [uuid(), app.studentId, app.hallId, seat.floor, seat.room]
        )
        .catch(() => {
          /* ignore if table or constraints missing */
        });
      // Ensure final status is 'alloted'
      await connection.query(
        `UPDATE applications SET status = 'alloted', updated_at = NOW() WHERE applicationId = ?`,
        [applicationId]
      );
    }

    await connection.commit();
    return {
      applicationId,
      status,
      studentId: app.studentId,
      hallId: app.hallId,
    };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

async function updateApplicationScore({ applicationId, hallId, totalScore }) {
  if (!applicationId) {
    const err = new Error("applicationId is required");
    err.status = 400;
    throw err;
  }

  const score = Number(totalScore);
  const normalized = Number.isFinite(score) ? score : 0;

  const pool = await getPool();
  const [apps] = await pool.query(
    `SELECT applicationId, hallId FROM applications WHERE applicationId = ? LIMIT 1`,
    [applicationId]
  );
  if (!apps.length) {
    const err = new Error("Application not found");
    err.status = 404;
    throw err;
  }
  if (hallId && apps[0].hallId !== hallId) {
    const err = new Error("Application belongs to a different hall");
    err.status = 403;
    throw err;
  }

  await pool.query(
    `UPDATE applications SET totalScore = ?, updated_at = NOW() WHERE applicationId = ?`,
    [normalized, applicationId]
  );
  return { applicationId, totalScore: normalized };
}

module.exports = {
  listFormsByHall,
  getFormById,
  createForm,
  updateForm,
  setFormActive,
  findActiveFormByHall,
  expireExpiredFormsByHall,
  expireAllExpiredForms,
  createApplicationWithResponse,
  hasActiveAllocation,
  hasApplicationForStudent,
  deleteForm,
  listApplicationsByForm,
  getApplicationDetailsById,
  getApplicationDetailsByIdForStudent,
  listApplicationsByStudent,
  updateApplicationStatus,
  updateApplicationScore,
};
