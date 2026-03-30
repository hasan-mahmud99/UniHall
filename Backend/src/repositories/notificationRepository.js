const { initPool } = require("../../config/db");
const fs = require("fs");
const path = require("path");

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

async function getCurrentResidentHallIdForStudent(studentId) {
  if (!studentId) return null;
  const pool = await initPool();
  try {
    const [rows] = await pool.query(
      `SELECT r.hallId
         FROM student_allocations sa
         JOIN rooms r ON r.roomId = sa.roomId
        WHERE sa.studentId = ?
          AND sa.status IN ('ALLOCATED','ACTIVE')
          AND sa.vacatedDate IS NULL
          AND sa.startDate <= NOW()
          AND (sa.endDate IS NULL OR sa.endDate >= NOW())
        ORDER BY COALESCE(sa.updated_at, sa.created_at) DESC
        LIMIT 1`,
      [studentId]
    );
    return rows?.[0]?.hallId || null;
  } catch (_) {
    return null;
  }
}

function extractLegacyInterviewFormId(body) {
  if (!body) return null;
  const text = String(body);
  const match = /Your\s+interview\s+for\s+form\s+([0-9a-fA-F-]{36})\b/.exec(
    text
  );
  return match?.[1] || null;
}

function replaceLegacyInterviewBody(body, formTitle) {
  if (!body || !formTitle) return body;
  const text = String(body);
  return text.replace(
    /Your\s+interview\s+for\s+form\s+[0-9a-fA-F-]{36}\b/,
    `Your interview for "${formTitle}"`
  );
}

async function listNotificationsByUser(
  userId,
  hallId = null,
  { limit = DEFAULT_LIMIT, offset = 0, noticesOnly = false } = {}
) {
  const pool = await initPool();
  try {
    const safeLimit = Math.min(MAX_LIMIT, Math.max(1, Number(limit) || DEFAULT_LIMIT));
    const safeOffset = Math.max(0, Number(offset) || 0);

    const where = noticesOnly
      ? `WHERE (userId IS NULL)
           AND ((? IS NOT NULL AND hallId = ?) OR hallId IS NULL)`
      : `WHERE (userId = ?)
           OR (userId IS NULL AND (? IS NOT NULL AND hallId = ?))
           OR (userId IS NULL AND hallId IS NULL)`;

    const params = noticesOnly
      ? [hallId, hallId]
      : [userId, hallId, hallId];

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total
         FROM notifications
        ${where}`,
      params
    );
    const total = Number(countRows?.[0]?.total || 0);

    const [rows] = await pool.query(
      `SELECT notificationId AS id, title, body, created_at AS createdAt
         FROM notifications
        ${where}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?`,
      [...params, safeLimit, safeOffset]
    );

    const ids = (rows || []).map((r) => r.id).filter(Boolean);
    const attachmentById = new Map();
    if (ids.length) {
      const [attachRows] = await pool.query(
        `SELECT att.entityId AS notificationId, att.fileName, att.fileType, att.fileUrl, att.created_at
           FROM attachments att
          WHERE att.entityType = 'OTHER' AND att.entityId IN (?)
          ORDER BY att.created_at DESC`,
        [ids]
      );
      for (const a of attachRows || []) {
        if (!attachmentById.has(a.notificationId)) {
          attachmentById.set(a.notificationId, {
            name: a.fileName,
            type: a.fileType,
            url: a.fileUrl,
          });
        }
      }
    }

    // Patch legacy Interview Scheduled notifications that embed formId in body.
    const formIds = Array.from(
      new Set(
        rows
          .filter((r) => r?.title === "Interview Scheduled")
          .map((r) => extractLegacyInterviewFormId(r.body))
          .filter(Boolean)
      )
    );

    let titleByFormId = new Map();
    if (formIds.length) {
      const [formRows] = await pool.query(
        `SELECT formId, formTitle FROM application_forms WHERE formId IN (?)`,
        [formIds]
      );
      titleByFormId = new Map(
        (formRows || []).map((r) => [r.formId, r.formTitle])
      );
    }

    const items = rows.map((r) => {
      const legacyFormId =
        r?.title === "Interview Scheduled"
          ? extractLegacyInterviewFormId(r.body)
          : null;
      const formTitle = legacyFormId ? titleByFormId.get(legacyFormId) : null;
      const patchedBody = formTitle
        ? replaceLegacyInterviewBody(r.body, formTitle)
        : r.body;
      return {
        id: r.id,
        title: r.title,
        body: patchedBody,
        createdAt: r.createdAt,
        attachment: attachmentById.get(r.id) || null,
      };
    });

    return { rows: items, total };
  } catch (err) {
    // If table missing, return empty list gracefully
    return { rows: [], total: 0 };
  }
}

async function markNotificationRead(notificationId, userId) {
  const pool = await initPool();
  try {
    await pool.query(
      `UPDATE notifications SET read_at = NOW() WHERE notificationId = ? AND (userId = ? OR userId IS NULL)`,
      [notificationId, userId]
    );
  } catch (err) {
    // ignore if column/table missing
  }
  return { id: notificationId, read: true };
}

module.exports = { listNotificationsByUser, markNotificationRead };

async function createNotification({
  userId = null,
  hallId = null,
  title,
  body,
  attachment = null,
  createdBy = null,
}) {
  const pool = await initPool();
  try {
    const { v4: uuid } = require("uuid");
    const notificationId = uuid();
    await pool.query(
      `INSERT INTO notifications (notificationId, hallId, userId, title, body, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        notificationId,
        hallId || null,
        userId || null,
        String(title || "").trim(),
        String(body || "").trim(),
      ]
    );

    if (attachment && attachment.url) {
      const attachmentId = uuid();
      await pool.query(
        `INSERT INTO attachments (attachmentId, entityType, entityId, fileName, fileType, fileUrl, created_at, created_by)
         VALUES (?, 'OTHER', ?, ?, ?, ?, NOW(), ?)`,
        [
          attachmentId,
          notificationId,
          String(attachment.name || "attachment").trim(),
          String(attachment.type || "application/octet-stream").trim(),
          String(attachment.url || "").trim(),
          createdBy || userId || "system",
        ]
      );
    }
    return { success: true, id: notificationId };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

module.exports.createNotification = createNotification;

module.exports.getCurrentResidentHallIdForStudent =
  getCurrentResidentHallIdForStudent;

async function deleteBroadcastNotification({ notificationId, hallId }) {
  if (!notificationId) return { success: false, error: "Missing notification id" };
  const pool = await initPool();

  try {
    // Find attachment (if any) so we can clean up the file.
    const [attRows] = await pool.query(
      `SELECT fileUrl FROM attachments WHERE entityType = 'OTHER' AND entityId = ? ORDER BY created_at DESC LIMIT 1`,
      [notificationId]
    );
    const fileUrl = attRows?.[0]?.fileUrl || null;

    // Delete attachment row(s)
    await pool.query(
      `DELETE FROM attachments WHERE entityType = 'OTHER' AND entityId = ?`,
      [notificationId]
    );

    // Delete the notification: only broadcast notices for this hall
    const [result] = await pool.query(
      `DELETE FROM notifications
        WHERE notificationId = ?
          AND userId IS NULL
          AND hallId = ?`,
      [notificationId, hallId]
    );

    if (!result?.affectedRows) {
      return { success: false, error: "Notice not found" };
    }

    // Best-effort delete the stored file if it lives under uploads/notices
    try {
      if (fileUrl && String(fileUrl).includes("/uploads/notices/")) {
        const filename = String(fileUrl).split("/uploads/notices/")[1]?.split("?")[0];
        if (filename) {
          const filePath = path.resolve(
            __dirname,
            "..",
            "..",
            "..",
            "uploads",
            "notices",
            filename
          );
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
      }
    } catch (_) {
      // ignore file cleanup errors
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

module.exports.deleteBroadcastNotification = deleteBroadcastNotification;
