const {
  listNotificationsByUser,
  markNotificationRead,
  createNotification,
  getCurrentResidentHallIdForStudent,
  deleteBroadcastNotification,
} = require("../repositories/notificationRepository");
const { findHallByCode } = require("../repositories/userRepository");

async function listMyNotifications(req, res, next) {
  try {
    if (!req.user) {
      const err = new Error("Unauthorized");
      err.status = 401;
      throw err;
    }

    // For students, show hall-wide broadcasts only if they are a CURRENT resident
    // (i.e., have an active/non-vacated/non-expired allocation).
    let hallId = req.user.hallId || null;
    const role = String(req.user.role || "").toUpperCase();
    if (role === "STUDENT") {
      const studentId = req.user.studentId || req.user.userId;
      hallId = await getCurrentResidentHallIdForStudent(studentId);

      // Fallback: if they don't have a current allocation, infer hall from studentId prefix
      // so hall-wide notices still show up for all students of that hall.
      if (!hallId && studentId) {
        const code = String(studentId).slice(0, 3).toUpperCase();
        try {
          hallId = await findHallByCode(code);
        } catch (_) {
          hallId = null;
        }
      }
    } else if (!hallId && req.user.studentId) {
      const code = String(req.user.studentId).slice(0, 3).toUpperCase();
      try {
        hallId = await findHallByCode(code);
      } catch (_) {
        hallId = null;
      }
    }
    const limit = req.query?.limit ? Number(req.query.limit) : undefined;
    const page = req.query?.page ? Number(req.query.page) : undefined;
    const offset = req.query?.offset ? Number(req.query.offset) : undefined;
    const mode = String(req.query?.mode || "").toLowerCase();
    const noticesOnly = mode === "notices" || mode === "notice";

    const resolvedOffset = Number.isFinite(offset)
      ? Math.max(0, offset)
      : Number.isFinite(page) && page > 0 && Number.isFinite(limit)
      ? (page - 1) * limit
      : 0;

    const result = await listNotificationsByUser(req.user.userId, hallId, {
      limit,
      offset: resolvedOffset,
      noticesOnly,
    });

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        total: result.total,
        limit: Number(limit) || undefined,
        offset: resolvedOffset,
        page: Number.isFinite(page) ? page : undefined,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function markRead(req, res, next) {
  try {
    if (!req.user) {
      const err = new Error("Unauthorized");
      err.status = 401;
      throw err;
    }
    const data = await markNotificationRead(req.params.id, req.user.userId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

module.exports = { listMyNotifications, markRead };

async function createBroadcast(req, res, next) {
  try {
    if (!req.user || (req.user.role !== "ADMIN" && req.user.role !== "admin")) {
      const err = new Error("Only admins can publish notifications");
      err.status = 403;
      throw err;
    }
    const hallId = req.user.hallId;
    if (!hallId) {
      const err = new Error("Admin hall not found");
      err.status = 400;
      throw err;
    }
    const { title, body, attachment } = req.body || {};
    if (!title || !String(title).trim() || !body || !String(body).trim()) {
      const err = new Error("Title and body are required");
      err.status = 400;
      throw err;
    }
    const result = await createNotification({
      hallId,
      userId: null,
      title,
      body,
      attachment: attachment && attachment.url ? attachment : null,
      createdBy: req.user.userId,
    });
    if (!result.success) {
      const err = new Error(result.error || "Failed to create notification");
      err.status = 500;
      throw err;
    }
    res.status(201).json({ success: true, id: result.id || null });
  } catch (err) {
    next(err);
  }
}

module.exports.createBroadcast = createBroadcast;

async function deleteBroadcast(req, res, next) {
  try {
    if (!req.user || (req.user.role !== "ADMIN" && req.user.role !== "admin")) {
      const err = new Error("Only admins can delete notices");
      err.status = 403;
      throw err;
    }

    const hallId = req.user.hallId;
    if (!hallId) {
      const err = new Error("Admin hall not found");
      err.status = 400;
      throw err;
    }

    const notificationId = req.params.id;
    const result = await deleteBroadcastNotification({ notificationId, hallId });
    if (!result.success) {
      const err = new Error(result.error || "Failed to delete notice");
      err.status = result.error === "Notice not found" ? 404 : 500;
      throw err;
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

module.exports.deleteBroadcast = deleteBroadcast;
