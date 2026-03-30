import React, { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../lib/apiClient.js";
import { auth } from "../../lib/firebaseClient.js";
import { confirmDialog } from "../../lib/confirm.js";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  deleteUser,
  signOut,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

// Department code (2 digits) -> Department name
// Update this map to match your university's official department codes.
const DEPARTMENT_CODE_TO_NAME = {
  "01": "CSTE",
  "02": "FIMS",
  "03": "Pharmacy",
  "04": "ACCE",
  "05": "MBG",
  "06": "A. Math",
  "07": "ENG",
  "08": "FTNS",
  "09": "ESDM",
  10: "DBA",
  11: "ICE",
  12: "Economics",
  13: "BGE",
  14: "Agri",
  15: "Stat",
  16: "Political Science",
  17: "EEE",
  18: "OCN",
  19: "Education",
  20: "Sociology",
  21: "THM",
  22: "MIS",
  23: "BMB",
  24: "IIS",
  25: "IIT",
  26: "Bangla",
  27: "Law",
  28: "Zoology",
  29: "Educational Administration",
  30: "Social Work",
  31: "Physics",
  32: "Chemistry",
  33: "SWES",
};

// Hall code -> expected gender suffix (based on halls table)
const HALL_CODE_TO_GENDER_SUFFIX = {
  ASH: "M",
  MUH: "M",
  BKH: "F",
  NFH: "F",
  JSH: "F",
};

// Parse student ID: MUH2225013M -> MUH (hall) + 22 (session) + 25 (dept) + 013 (roll) + M/F (gender)
function parseStudentId(id) {
  if (!id || typeof id !== "string") return null;
  const normalized = id.trim().toUpperCase();
  // Format: HALLSESSIONDEPTROLL (e.g., MUH2225007M = MUH + 22 + 25 + 007 + M)
  const match = normalized.match(/^([A-Z]{3})(\d{2})(\d{2})(\d{3})([MF])$/);
  if (!match) return null;

  const sessionCode = match[2];
  const sessionEnd = Number(sessionCode);
  const sessionYear = Number.isFinite(sessionEnd)
    ? `${2000 + sessionEnd - 1}-${2000 + sessionEnd}`
    : null;

  const suffix = match[5];
  const gender = suffix === "M" ? "Male" : "Female";

  const expectedSuffix = HALL_CODE_TO_GENDER_SUFFIX[match[1]] || null;
  const isGenderMatch = expectedSuffix ? expectedSuffix === suffix : null;

  return {
    hall: match[1], // MUH, ASH, etc.
    session: sessionCode, // 22, 23, etc.
    sessionYear, // 2021-2022 (derived)
    dept: match[3], // 25 (department code)
    deptName: DEPARTMENT_CODE_TO_NAME[match[3]] || null,
    roll: match[4], // 013
    suffix, // M/F
    gender, // Male/Female
    expectedSuffix,
    isGenderMatch,
  };
}

function parseGraduateId(id) {
  if (!id || typeof id !== "string") return null;
  const normalized = id.trim().toUpperCase();
  const match = normalized.match(/^([A-Z]{3})([A-Z0-9]{1,16})([MF])$/);
  if (!match) return null;

  const expectedSuffix = HALL_CODE_TO_GENDER_SUFFIX[match[1]] || null;
  const suffix = match[3];
  const isGenderMatch = expectedSuffix ? expectedSuffix === suffix : null;
  const gender = suffix === "M" ? "Male" : "Female";

  return {
    hall: match[1],
    body: match[2],
    suffix,
    gender,
    expectedSuffix,
    isGenderMatch,
  };
}

// Validate student ID format + hall gender
function validateStudentId(id) {
  const parsed = parseStudentId(id);
  if (!parsed)
    return "Invalid Student ID. Format: HALL(3)+Session(2)+Dept(2)+Roll(3)+Gender(M/F).";
  if (!parsed.expectedSuffix) return "Unknown hall code in Student ID.";
  if (parsed.isGenderMatch === false)
    return `For ${parsed.hall} hall, Student ID must end with ${parsed.expectedSuffix}.`;
  return null;
}

function validateGraduateId(id) {
  const parsed = parseGraduateId(id);
  if (!parsed)
    return "Invalid Student ID. It must start with hall code (3 letters) and end with gender (M/F).";
  if (!parsed.expectedSuffix) return "Unknown hall code in Student ID.";
  if (parsed.isGenderMatch === false)
    return `For ${parsed.hall} hall, Student ID must end with ${parsed.expectedSuffix}.`;
  return null;
}

function getApiErrorMessage(err) {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    "Request failed"
  );
}

function firebaseErrorMessage(err) {
  const code = String(err?.code || "");

  if (code === "auth/operation-not-allowed") {
    return "Firebase Email/Password auth is disabled. Enable it in Firebase Console → Authentication → Sign-in method.";
  }

  if (
    code === "auth/invalid-continue-uri" ||
    code === "auth/unauthorized-continue-uri"
  ) {
    return `Verification redirect URL is not authorized. Add ${window.location.origin} to Firebase Console → Authentication → Settings → Authorized domains.`;
  }

  if (code === "auth/too-many-requests") {
    return "Too many attempts. Please wait a few minutes and try again.";
  }

  if (code === "auth/email-already-in-use") {
    return "Email is already in use.";
  }

  if (code === "auth/network-request-failed") {
    return "Network error while contacting Firebase. Check your internet connection and try again.";
  }

  if (code) {
    return `${err?.message || "Firebase error"} (${code})`;
  }

  return err?.message || "Request failed";
}

function validateStudentEmail(email) {
  const normalized = String(email || "").trim();
  // Don't show "required" while typing; empty means no message.
  if (!normalized) return null;
  if (!/^[^@]+@[^@]+\.[^@]+$/.test(normalized)) return "Invalid email format.";
  if (!/^[^@]+@student\.nstu\.edu\.bd$/i.test(normalized))
    return "Use @student.nstu.edu.bd email.";
  return null;
}

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [step, setStep] = useState(1); // 1: Form, 2: Verify email
  const [programLevel, setProgramLevel] = useState("undergraduate");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [studentId, setStudentId] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [idInfo, setIdInfo] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [verificationEmailSentTo, setVerificationEmailSentTo] = useState("");
  const [showExistingFirebaseHelp, setShowExistingFirebaseHelp] =
    useState(false);

  const [emailCheckStatus, setEmailCheckStatus] = useState({
    checking: false,
    message: "",
    type: "",
  });
  const lastEmailCheckKeyRef = useRef("");

  const [idCheckStatus, setIdCheckStatus] = useState({
    checking: false,
    message: "",
    type: "",
  });
  const lastIdCheckKeyRef = useRef("");

  const isUndergrad =
    String(programLevel || "").toLowerCase() === "undergraduate";

  // Real-time email validation + debounced "already registered" check
  useEffect(() => {
    const emailError = validateStudentEmail(email);

    const trimmed = String(email || "").trim();
    if (!trimmed) {
      setEmailCheckStatus({ checking: false, message: "", type: "" });
      return;
    }

    if (emailError) {
      setEmailCheckStatus({
        checking: false,
        message: "Not valid email",
        type: "error",
      });
      return;
    }

    const normalizedEmail = String(email || "")
      .trim()
      .toLowerCase();
    const key = normalizedEmail;
    if (lastEmailCheckKeyRef.current === key) {
      return;
    }

    // Only show valid/not-valid (no "checking" message)
    setEmailCheckStatus({ checking: true, message: "", type: "" });
    const timer = setTimeout(async () => {
      try {
        const check = await api.post("/auth/check-registration", {
          email: normalizedEmail,
        });

        lastEmailCheckKeyRef.current = key;
        if (check.data?.exists) {
          setEmailCheckStatus({
            checking: false,
            message: "Not valid email",
            type: "error",
          });
          return;
        }

        setEmailCheckStatus({
          checking: false,
          message: "Valid email",
          type: "success",
        });
      } catch (err) {
        // If backend explicitly rejects, surface it; otherwise don't block on connectivity.
        if (err?.response) {
          setEmailCheckStatus({
            checking: false,
            message: "Not valid email",
            type: "error",
          });
          return;
        }

        // Backend unreachable: local validation already passed
        setEmailCheckStatus({
          checking: false,
          message: "Valid email",
          type: "success",
        });
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [email]);

  // Real-time Student/University ID validation + debounced "already registered" check
  useEffect(() => {
    const normalizedId = String(studentId || "")
      .trim()
      .toUpperCase();
    if (!normalizedId) {
      setIdCheckStatus({ checking: false, message: "", type: "" });
      return;
    }

    const isUndergradLocal =
      String(programLevel || "").toLowerCase() === "undergraduate";

    const localError = isUndergradLocal
      ? validateStudentId(normalizedId)
      : validateGraduateId(normalizedId);

    if (localError) {
      setIdCheckStatus({ checking: false, message: localError, type: "error" });
      return;
    }

    const key = normalizedId;
    if (lastIdCheckKeyRef.current === key) {
      // Keep last status; don't spam backend.
      return;
    }

    setIdCheckStatus({ checking: true, message: "Checking...", type: "info" });
    const timer = setTimeout(async () => {
      try {
        const check = await api.post("/auth/check-registration", {
          studentId: normalizedId,
        });

        lastIdCheckKeyRef.current = key;
        if (check.data?.exists) {
          setIdCheckStatus({
            checking: false,
            message: "Student ID already registered.",
            type: "error",
          });
          return;
        }

        setIdCheckStatus({
          checking: false,
          message: "ID looks good.",
          type: "success",
        });
      } catch (err) {
        if (err?.response) {
          setIdCheckStatus({
            checking: false,
            message: getApiErrorMessage(err),
            type: "error",
          });
          return;
        }
        setIdCheckStatus({ checking: false, message: "", type: "" });
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [studentId, programLevel]);

  const handleIdChange = (value) => {
    const normalized = String(value || "").toUpperCase();
    setStudentId(normalized);
    if (String(programLevel || "").toLowerCase() === "undergraduate") {
      setIdInfo(parseStudentId(normalized));
      return;
    }

    // Masters/PhD: only show hall+gender hint (no dept/session)
    setIdInfo(parseGraduateId(normalized));
  };

  const startFirebaseRegistration = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setShowExistingFirebaseHelp(false);

    try {
      setIsSending(true);

      if (password.length < 6)
        throw new Error("Password must be at least 6 characters");
      if (password !== confirm) throw new Error("Passwords do not match");
      if (!/^[^@]+@student\.nstu\.edu\.bd$/i.test(email))
        throw new Error("Use @student.nstu.edu.bd email");

      if (!studentId) throw new Error("Student ID is required");
      const idError = isUndergrad
        ? validateStudentId(studentId)
        : validateGraduateId(studentId);
      if (idError) throw new Error(idError);

      const normalizedEmail = email.trim().toLowerCase();

      // IMPORTANT: "Already registered" is determined by UniHall DB (email/studentId), not by Firebase.
      let existsInDb = false;
      try {
        const check = await api.post("/auth/check-registration", {
          email: normalizedEmail,
          studentId: String(studentId).trim().toUpperCase(),
        });
        existsInDb = Boolean(check.data?.exists);
      } catch (err) {
        // If backend explicitly rejects the ID, block registration.
        if (err?.response) {
          throw new Error(getApiErrorMessage(err));
        }
        // If backend is unreachable, don't block Firebase registration.
      }
      if (existsInDb) {
        throw new Error(
          "Email or Student ID already registered. Please sign in instead."
        );
      }

      const cred = await createUserWithEmailAndPassword(
        auth,
        normalizedEmail,
        password
      );

      if (name.trim()) {
        await updateProfile(cred.user, { displayName: name.trim() }).catch(
          () => {}
        );
      }

      await sendEmailVerification(cred.user, {
        url: `${window.location.origin}/login`,
      });

      setVerificationEmailSentTo(normalizedEmail);
      setInfo(
        "Verification email sent. If you don't see it, check Spam/Junk (university emails sometimes filter external mail)."
      );
      setStep(2);
    } catch (err) {
      const code = String(err?.code || "");
      if (code === "auth/email-already-in-use") {
        setError("Email is already in use.");
        return;
      }
      setError(firebaseErrorMessage(err));
    } finally {
      setIsSending(false);
    }
  };

  const signInAndResendVerification = async () => {
    setError("");
    setInfo("");
    try {
      setIsSending(true);
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedStudentId = String(studentId).trim().toUpperCase();

      // DB check first: DB decides "registered".
      try {
        const check = await api.post("/auth/check-registration", {
          email: normalizedEmail,
          studentId: normalizedStudentId,
        });
        if (check.data?.exists) {
          setError(
            "This email or Student ID is already registered in UniHall. Please sign in instead."
          );
          return;
        }
      } catch (err) {
        // If backend explicitly rejects the ID, block.
        if (err?.response) {
          setError(getApiErrorMessage(err));
          return;
        }
        // ignore unreachable backend and continue
      }

      const signedIn = await signInWithEmailAndPassword(
        auth,
        normalizedEmail,
        password
      );
      await signedIn.user.reload().catch(() => {});

      setVerificationEmailSentTo(normalizedEmail);
      if (signedIn.user.emailVerified) {
        setInfo(
          "Your email is already verified in Firebase. Click Finish Registration to create your UniHall account."
        );
        setStep(2);
        return;
      }

      await sendEmailVerification(signedIn.user, {
        url: `${window.location.origin}/login`,
      });
      setInfo(
        "Verification email resent. Please check your inbox/spam, then click Finish Registration."
      );
      setStep(2);
    } catch (err) {
      const code = String(err?.code || "");
      if (code === "auth/wrong-password") {
        setError(
          "Wrong password for the existing Firebase account. Please enter the correct password and try again."
        );
        return;
      }
      setError(firebaseErrorMessage(err));
    } finally {
      setIsSending(false);
    }
  };

  const deleteFirebaseAccountAndStartOver = async () => {
    setError("");
    setInfo("");
    try {
      setIsSending(true);
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail) throw new Error("Email is required");

      // Safety: don't allow deleting Firebase account if UniHall DB already has registration.
      try {
        const check = await api.post("/auth/check-registration", {
          email: normalizedEmail,
          studentId: String(studentId).trim().toUpperCase(),
        });
        if (check.data?.exists) {
          setError(
            "This email or Student ID is already registered in UniHall. Please sign in instead."
          );
          return;
        }
      } catch (err) {
        // If backend explicitly rejects the ID, block.
        if (err?.response) {
          setError(getApiErrorMessage(err));
          return;
        }
        // ignore unreachable backend and continue
      }

      // Must sign in first (recent login required by Firebase to delete account)
      const signedIn = await signInWithEmailAndPassword(
        auth,
        normalizedEmail,
        password
      );
      await deleteUser(signedIn.user);
      await signOut(auth).catch(() => {});

      setInfo(
        "Firebase account deleted. Now you can register again and receive a new verification email."
      );
      setShowExistingFirebaseHelp(false);
      setStep(1);
    } catch (err) {
      setError(firebaseErrorMessage(err));
    } finally {
      setIsSending(false);
    }
  };

  const confirmDeleteFirebaseAccount = async () => {
    const ok = await confirmDialog(
      "This will permanently delete your Firebase account (email/password login) for this email. Continue?",
      {
        title: "Delete Firebase Account",
        confirmText: "Delete",
        cancelText: "Cancel",
        danger: true,
      }
    );
    if (!ok) return;
    await deleteFirebaseAccountAndStartOver();
  };

  const finalizeRegistration = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    try {
      setIsFinalizing(true);

      await auth.currentUser?.reload();
      if (!auth.currentUser?.emailVerified) {
        throw new Error(
          "Email not verified yet. Please click the verification link in your email, then try again."
        );
      }

      const isUndergrad =
        String(programLevel || "").toLowerCase() === "undergraduate";

      await register({
        name: name.trim(),
        studentId: studentId.trim().toUpperCase(),
        programLevel,
      });
      nav(isUndergrad ? "/student" : "/profile");
    } catch (err) {
      const message =
        err?.response?.data?.message || err.message || "Registration failed";
      setError(message);
    } finally {
      setIsFinalizing(false);
    }
  };

  const resendVerificationEmail = async () => {
    setError("");
    setInfo("");
    try {
      setIsSending(true);
      const u = auth.currentUser;
      if (!u) throw new Error("No pending registration found. Please go back.");
      await sendEmailVerification(u, {
        url: `${window.location.origin}/login`,
      });
      setInfo("Verification email resent. Please check your inbox/spam.");
    } catch (err) {
      setError(firebaseErrorMessage(err));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="card shadow-soft-lg overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500"></div>

          {/* Header */}
          <div className="px-8 pt-10 pb-6 text-center relative">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-brand-600 to-brand-700 rounded-2xl flex items-center justify-center shadow-lg">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create Account
            </h1>
            <p className="text-gray-600">Join NSTU Hall Management System</p>
          </div>

          {/* Progress Indicator */}
          <div className="px-8 pb-6 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold shadow-md transition-all ${
                    step >= 1
                      ? "bg-gradient-to-r from-brand-600 to-brand-700 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  1
                </div>
                <span
                  className={`text-sm font-semibold ${
                    step >= 1 ? "text-brand-700" : "text-gray-400"
                  }`}
                >
                  Information
                </span>
              </div>
              <div className="flex-1 h-2 mx-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r from-brand-600 to-brand-700 rounded-full transition-all duration-500 ${
                    step >= 2 ? "w-full" : "w-0"
                  }`}
                ></div>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold shadow-md transition-all ${
                    step >= 2
                      ? "bg-gradient-to-r from-brand-600 to-brand-700 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  2
                </div>
                <span
                  className={`text-sm font-semibold ${
                    step >= 2 ? "text-brand-700" : "text-gray-400"
                  }`}
                >
                  Verify
                </span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="px-8 pb-8 relative">
            {info && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-4a1 1 0 000 2 1 1 0 000-2zm-1 4a1 1 0 012 0v4a1 1 0 11-2 0v-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-sm text-blue-800 font-medium">{info}</p>
                </div>
              </div>
            )}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={startFirebaseRegistration} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Program Level
                  </label>
                  <select
                    value={programLevel}
                    onChange={(e) => {
                      const next = e.target.value;
                      setProgramLevel(next);
                      if (String(next).toLowerCase() !== "undergraduate") {
                        setStudentId("");
                        setIdInfo(null);
                      }
                    }}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  >
                    <option value="undergraduate">Undergraduate</option>
                    <option value="masters">Master's</option>
                    <option value="phd">PhD</option>
                  </select>
                  <p className="mt-2 text-xs text-gray-500">
                    For Master's/PhD, you can complete student details after
                    registration.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <input
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="Full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {isUndergrad ? "Student ID" : "University ID"}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <input
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                        isUndergrad ? "font-mono" : ""
                      } ${
                        idCheckStatus.type === "error"
                          ? "border-red-300"
                          : idCheckStatus.type === "success"
                          ? "border-green-300"
                          : "border-gray-200"
                      }`}
                      placeholder={
                        isUndergrad ? "MUH2225013M" : "Enter your university ID"
                      }
                      value={studentId}
                      onChange={(e) => handleIdChange(e.target.value)}
                      required
                    />
                  </div>

                  {!!idCheckStatus.message && (
                    <p
                      className={`mt-2 text-xs flex items-center gap-1 ${
                        idCheckStatus.type === "error"
                          ? "text-red-600"
                          : idCheckStatus.type === "success"
                          ? "text-green-700"
                          : "text-gray-600"
                      }`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {idCheckStatus.message}
                    </p>
                  )}
                </div>

                {showExistingFirebaseHelp && (
                  <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                    <div className="text-sm text-indigo-900 font-semibold">
                      Existing Firebase account detected
                    </div>
                    <div className="text-xs text-indigo-800 mt-1">
                      Deleting your UniHall DB record does not remove your
                      Firebase account. To resend verification, you must sign in
                      to the same Firebase account.
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={isSending}
                        onClick={signInAndResendVerification}
                        className="px-4 py-2 rounded-lg bg-indigo-700 text-white text-sm font-semibold hover:bg-indigo-800 disabled:opacity-50"
                      >
                        Sign in & resend verification
                      </button>

                      <button
                        type="button"
                        disabled={isSending}
                        onClick={confirmDeleteFirebaseAccount}
                        className="px-4 py-2 rounded-lg bg-white border border-red-200 text-red-700 text-sm font-semibold hover:bg-red-50 disabled:opacity-50"
                      >
                        Delete Firebase account
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <input
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                        emailCheckStatus.type === "error"
                          ? "border-red-300"
                          : emailCheckStatus.type === "success"
                          ? "border-green-300"
                          : "border-gray-200"
                      }`}
                      placeholder="your_email@student.nstu.edu.bd"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  {!!emailCheckStatus.message && (
                    <p
                      className={`mt-2 text-xs flex items-center gap-1 ${
                        emailCheckStatus.type === "error"
                          ? "text-red-600"
                          : emailCheckStatus.type === "success"
                          ? "text-green-700"
                          : "text-gray-600"
                      }`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {emailCheckStatus.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <input
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="Create a password (min 6 characters)"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <input
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="Re-enter your password"
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {isSending ? "Sending..." : "Send Verification Email"}
                </button>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                    >
                      Sign In
                    </Link>
                  </p>
                </div>
              </form>
            ) : (
              <form onSubmit={finalizeRegistration} className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-blue-600 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-800">
                        Verify your email
                      </p>
                      <p className="text-sm text-blue-700 mt-1">
                        We sent a verification link to{" "}
                        <strong>{verificationEmailSentTo || email}</strong>
                      </p>
                      <p className="text-xs text-blue-600 mt-2">
                        Click the link in your inbox, then return here.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={resendVerificationEmail}
                    disabled={isSending}
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-60"
                  >
                    {isSending ? "Resending..." : "Resend verification email"}
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setError("");
                      setInfo("");
                    }}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors border-2 border-gray-200"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={isFinalizing}
                    className="flex-1 px-4 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    {isFinalizing ? "Checking..." : "I verified → Finish"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
