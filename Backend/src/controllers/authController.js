const {
  login,
  registerStudent,
  registerGraduateStudent,
  normalizeProgramLevel,
  fetchCurrentUser,
  validateStudentIdAgainstHall,
} = require("../services/authService");
const {
  verifyFirebaseIdToken,
  getFirebaseUserByUid,
  generateFirebasePasswordResetLink,
} = require("../services/firebaseAdmin");
const { generateToken } = require("../utils/token");
const {
  findUserByEmail,
  findUserByEmailOrStudentId,
  updateUserPassword,
} = require("../repositories/userRepository");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const {
  createPasswordResetToken,
  findValidPasswordResetTokenByHash,
  markPasswordResetTokenUsed,
} = require("../repositories/passwordResetRepository");
const { sendMail } = require("../services/mailService");

function isStudentEmail(email) {
  return /^[^@]+@student\.nstu\.edu\.bd$/i.test(String(email || ""));
}

function getFrontendBaseUrl() {
  return (
    process.env.FRONTEND_BASE_URL ||
    process.env.CLIENT_BASE_URL ||
    "http://localhost:5173/UniHall"
  ).replace(/\/$/, "");
}

async function handleLogin(req, res, next) {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Identifier and password are required",
      });
    }
    const result = await login(identifier.trim(), password);
    res.json({ success: true, ...result });
  } catch (err) {
    if (err.message === "Invalid credentials") {
      return res.status(401).json({ success: false, message: err.message });
    }
    next(err);
  }
}

async function handleRegister(req, res, next) {
  try {
    const { name, email, password, studentId, programLevel } = req.body;
    const level = normalizeProgramLevel(programLevel);
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }
    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
    }
    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    const result =
      level === "undergraduate"
        ? await registerStudent({
            name: normalizedName,
            email: normalizedEmail,
            password,
            studentId: String(studentId).trim().toUpperCase(),
          })
        : await registerGraduateStudent({
            name: normalizedName,
            email: normalizedEmail,
            password,
            studentId: String(studentId).trim().toUpperCase(),
            programLevel: level,
          });

    res.status(201).json({ success: true, ...result });
  } catch (err) {
    if (
      err.message === "Email already registered" ||
      err.message.includes("Student ID")
    ) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next(err);
  }
}

async function handleMe(req, res, next) {
  try {
    res.json({ success: true, user: req.user });
  } catch (err) {
    next(err);
  }
}

// Checks DB only (does NOT consult Firebase).
async function handleCheckRegistration(req, res, next) {
  try {
    const rawEmail = String(req.body?.email || "")
      .trim()
      .toLowerCase();
    const rawStudentId = String(req.body?.studentId || "")
      .trim()
      .toUpperCase();

    if (!rawEmail && !rawStudentId) {
      return res.status(400).json({
        success: false,
        message: "Email or Student ID is required",
      });
    }

    if (rawStudentId) {
      try {
        await validateStudentIdAgainstHall(rawStudentId);
      } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
    }

    // findUserByEmailOrStudentId checks email OR studentId.
    const user = await findUserByEmailOrStudentId(
      rawEmail || "__none__",
      rawStudentId || "__none__"
    );
    return res.json({ success: true, exists: Boolean(user) });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  handleLogin,
  handleRegister,
  handleCheckRegistration,
  handleMe,
  handleFirebaseLogin,
  handleFirebaseRegister,
  handleForgotPassword,
  handleResetPassword,
};

async function handleForgotPassword(req, res, next) {
  try {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    // Always respond success to avoid account enumeration.
    const okResponse = () =>
      res.json({
        success: true,
        message:
          "If an account exists for this email, a password reset link has been sent.",
      });

    // Student emails: use Firebase Auth reset link.
    if (isStudentEmail(email)) {
      try {
        const link = await generateFirebasePasswordResetLink(email);
        await sendMail({
          to: email,
          subject: "Reset your UniHall password",
          text: `A password reset was requested for your UniHall account.\n\nReset link: ${link}\n\nIf you did not request this, you can ignore this email.`,
          html: `<p>A password reset was requested for your UniHall account.</p><p><a href="${link}">Reset password</a></p><p>If you did not request this, you can ignore this email.</p>`,
        });
      } catch (_) {
        // Intentionally swallow errors here to avoid leaking existence/config.
      }
      return okResponse();
    }

    const user = await findUserByEmail(email);
    if (!user || !user.isActive) {
      return okResponse();
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    try {
      await createPasswordResetToken({ userId: user.userId, tokenHash, expiresAt });
    } catch (_) {
      // If insert fails, still return generic success.
      return okResponse();
    }

    const resetUrl = `${getFrontendBaseUrl()}/reset-password?token=${encodeURIComponent(
      rawToken
    )}`;
    await sendMail({
      to: email,
      subject: "Reset your UniHall password",
      text: `A password reset was requested for your UniHall account.\n\nReset link: ${resetUrl}\n\nThis link will expire in 1 hour. If you did not request this, you can ignore this email.`,
      html: `<p>A password reset was requested for your UniHall account.</p><p><a href="${resetUrl}">Reset password</a></p><p>This link will expire in 1 hour. If you did not request this, you can ignore this email.</p>`,
    });

    return okResponse();
  } catch (err) {
    next(err);
  }
}

async function handleResetPassword(req, res, next) {
  try {
    const token = String(req.body?.token || "").trim();
    const password = String(req.body?.password || "");
    if (!token) {
      return res
        .status(400)
        .json({ success: false, message: "Reset token is required" });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    const row = await findValidPasswordResetTokenByHash(tokenHash);
    if (!row) {
      return res
        .status(400)
        .json({ success: false, message: "Token is invalid or expired" });
    }

    const hashed = await bcrypt.hash(password, 10);
    await updateUserPassword(row.userId, hashed);
    await markPasswordResetTokenUsed(row.id);

    return res.json({ success: true, message: "Password has been reset" });
  } catch (err) {
    next(err);
  }
}

async function handleFirebaseRegister(req, res, next) {
  try {
    const { idToken, studentId, programLevel, name } = req.body;
    const decoded = await verifyFirebaseIdToken(idToken);
    const email = String(decoded?.email || "").toLowerCase();
    const fbUser = await getFirebaseUserByUid(decoded?.uid);
    const emailVerified = !!fbUser?.emailVerified;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Firebase token has no email" });
    }
    if (!/^[^@]+@student\.nstu\.edu\.bd$/i.test(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Use @student.nstu.edu.bd email" });
    }
    if (!emailVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Email is not verified" });
    }

    const level = normalizeProgramLevel(programLevel);
    if (!name || !studentId) {
      return res.status(400).json({
        success: false,
        message: "Name and Student ID are required",
      });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    // Create DB user (password is irrelevant for Firebase-based login)
    const randomPassword = `fb:${decoded.uid}:${Date.now()}`;
    const result =
      level === "undergraduate"
        ? await registerStudent({
            name: String(name).trim(),
            email,
            password: randomPassword,
            studentId: String(studentId).trim().toUpperCase(),
            isEmailVerified: true,
          })
        : await registerGraduateStudent({
            name: String(name).trim(),
            email,
            password: randomPassword,
            studentId: String(studentId).trim().toUpperCase(),
            programLevel: level,
            isEmailVerified: true,
          });

    return res.status(201).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

async function handleFirebaseLogin(req, res, next) {
  try {
    const { idToken } = req.body;
    const decoded = await verifyFirebaseIdToken(idToken);
    const email = String(decoded?.email || "").toLowerCase();
    const fbUser = await getFirebaseUserByUid(decoded?.uid);
    const emailVerified = !!fbUser?.emailVerified;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Firebase token has no email" });
    }
    if (!emailVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Email is not verified" });
    }

    const user = await findUserByEmail(email);
    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message:
          "No UniHall account found for this email. Please register first.",
      });
    }

    const token = generateToken(user.userId);
    const clientUser = await fetchCurrentUser(user.userId);
    return res.json({ success: true, token, user: clientUser });
  } catch (err) {
    next(err);
  }
}
