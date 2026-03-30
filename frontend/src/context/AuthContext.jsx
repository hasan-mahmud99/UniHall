import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/apiClient.js";
import { auth } from "../lib/firebaseClient.js";
import {
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const navigate = useNavigate();

  // Removed legacy seed injection (legacyApi.ensureSeedData) to ensure only real backend data is used.

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setIsAuthLoading(false);
      return;
    }

    api
      .get("/auth/me")
      .then((res) => {
        if (res.data?.user) {
          setUser(res.data.user);
        }
      })
      .catch(() => {
        localStorage.removeItem("auth_token");
      })
      .finally(() => setIsAuthLoading(false));
  }, []);

  const login = async (identifier, password) => {
    const trimmed = String(identifier || "").trim();
    const emailCandidate = trimmed.toLowerCase();

    // Students: Firebase Auth + exchange ID token for backend JWT
    if (/^[^@]+@student\.nstu\.edu\.bd$/i.test(emailCandidate)) {
      const cred = await signInWithEmailAndPassword(auth, emailCandidate, password);
      const fbUser = cred.user;
      await fbUser.reload();
      if (!fbUser?.emailVerified) {
        throw new Error("Please verify your email before logging in.");
      }
      const idToken = await fbUser.getIdToken(true);
      const { data } = await api.post("/auth/firebase/login", { idToken });
      if (!data?.token || !data?.user) throw new Error("Login failed");
      localStorage.setItem("auth_token", data.token);
      setUser(data.user);
      return data.user;
    }

    // Admin/Staff/ExamController: existing backend login
    const { data } = await api.post("/auth/login", { identifier: trimmed, password });
    if (!data?.token || !data?.user) throw new Error("Login failed");
    localStorage.setItem("auth_token", data.token);
    setUser(data.user);
    return data.user;
  };
  // Registration is handled in the Register page (Firebase email verification first).
  // This method creates the UniHall DB user after Firebase verification.
  const register = async ({ name, studentId, programLevel }) => {
    const fbUser = auth.currentUser;
    if (!fbUser) throw new Error("Firebase user is not available");
    await fbUser.reload();
    if (!fbUser.emailVerified) {
      throw new Error("Please verify your email before finishing registration.");
    }
    const idToken = await fbUser.getIdToken(true);

    const { data } = await api.post("/auth/firebase/register", {
      idToken,
      name,
      studentId,
      programLevel,
    });
    if (!data?.token || !data?.user) throw new Error("Registration failed");
    localStorage.setItem("auth_token", data.token);
    setUser(data.user);
    return data.user;
  };
  const logout = () => {
    localStorage.removeItem("auth_token");
    setUser(null);
    // Best-effort Firebase logout (only affects student accounts)
    signOut(auth).catch(() => {});
    navigate("/");
  };

  const value = useMemo(
    () => ({ user, login, logout, register, isAuthLoading }),
    [user, isAuthLoading]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
