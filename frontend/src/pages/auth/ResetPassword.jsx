import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../../lib/apiClient.js";

export default function ResetPassword() {
  const nav = useNavigate();
  const location = useLocation();
  const search = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const token = search.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!token) {
      setStatus("error");
      setMessage("Missing reset token. Please use the link from your email.");
      return;
    }

    if (!password || password.length < 6) {
      setStatus("error");
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirm) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    setStatus("loading");
    try {
      const { data } = await api.post("/auth/reset-password", { token, password });
      setStatus("success");
      setMessage(data?.message || "Password updated. You can now sign in.");
      setTimeout(() => nav("/login"), 1200);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to reset password";
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
              Reset password
            </h1>
            <p className="text-gray-600">Choose a new password.</p>
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

            {!token && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="text-sm text-yellow-800">
                  This reset page is for Admin/Staff accounts. Student accounts
                  should use the reset link sent by Firebase.
                </p>
              </div>
            )}

            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  New password
                </label>
                <input
                  className="input-field"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Confirm password
                </label>
                <input
                  className="input-field"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className="btn-primary w-full py-3.5 text-base font-bold shadow-lg hover:shadow-xl disabled:opacity-60"
              >
                {status === "loading" ? "Updating…" : "Update password"}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
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
