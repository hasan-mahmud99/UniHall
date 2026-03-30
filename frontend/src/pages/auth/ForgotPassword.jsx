import React, { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../../lib/apiClient.js";
import { auth } from "../../lib/firebaseClient.js";
import { sendPasswordResetEmail } from "firebase/auth";

function isStudentEmail(email) {
  return /^[^@]+@student\.nstu\.edu\.bd$/i.test(String(email || ""));
}

export default function ForgotPassword() {
  const location = useLocation();
  const search = new URLSearchParams(location.search);
  const initialEmail = search.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [status, setStatus] = useState("idle"); // idle | loading | sent | error
  const [message, setMessage] = useState("");

  const isStudent = useMemo(() => isStudentEmail(email.trim()), [email]);

  const submit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    const normalized = String(email || "").trim().toLowerCase();
    if (!normalized) {
      setStatus("error");
      setMessage("Email is required");
      return;
    }

    try {
      if (isStudentEmail(normalized)) {
        await sendPasswordResetEmail(auth, normalized);
        setStatus("sent");
        setMessage(
          "Password reset email sent. Please check your inbox (and spam/junk)."
        );
      } else {
        const { data } = await api.post("/auth/forgot-password", { email: normalized });
        setStatus("sent");
        setMessage(
          data?.message ||
            "If an account exists for this email, a password reset link has been sent."
        );
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to send password reset email";
      setStatus("error");
      setMessage(msg);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="card shadow-soft-lg overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500"></div>

          <div className="px-8 pt-10 pb-6 text-center relative">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Forgot password
            </h1>
            <p className="text-gray-600">
              Enter your email and we’ll send a reset link.
            </p>
          </div>

          <div className="px-8 pb-8 relative">
            {message && (
              <div
                className={`mb-6 p-4 rounded-xl border ${
                  status === "error"
                    ? "bg-red-50 border-red-200"
                    : "bg-green-50 border-green-200"
                }`}
              >
                <p
                  className={`text-sm font-medium ${
                    status === "error" ? "text-red-700" : "text-green-700"
                  }`}
                >
                  {message}
                </p>
              </div>
            )}

            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Email
                </label>
                <input
                  className="input-field"
                  placeholder="name@nstu.edu.bd"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                />
                <p className="mt-2 text-xs text-gray-500">
                  {isStudent
                    ? "Student accounts use Firebase email reset."
                    : "Admin/Staff accounts will receive a UniHall reset link."}
                </p>
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className="btn-primary w-full py-3.5 text-base font-bold shadow-lg hover:shadow-xl disabled:opacity-60"
              >
                {status === "loading" ? "Sending…" : "Send reset email"}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                Remembered your password?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                >
                  Back to login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
