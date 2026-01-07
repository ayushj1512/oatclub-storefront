"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Loader2, Mail, Lock, LogIn } from "lucide-react";
import GoogleSignIn from "@/components/auth/GoogleSignIn";
import toast from "react-hot-toast";

// ✅ Firebase reset password
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { user, isAuthenticated, loginWithEmail } = useAuthStore();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState("");
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  const passwordRef = useRef(null);

  /* ============================================================
     ✅ PREFILL EMAIL FROM URL (?email=...)
     + AUTOFOCUS PASSWORD
  ============================================================ */
  useEffect(() => {
    const emailFromUrl = searchParams.get("email");
    if (emailFromUrl) {
      setForm((prev) => ({ ...prev, email: emailFromUrl }));

      setTimeout(() => {
        passwordRef.current?.focus();
      }, 100);
    }
  }, [searchParams]);

  /* ============================================================
     ✅ REDIRECT IF ALREADY LOGGED IN
  ============================================================ */
  useEffect(() => {
    if (isAuthenticated && user) {
      if (!justLoggedIn) toast.success(`Hello, ${user.name || "there"}!`);
      router.replace("/");
    }
  }, [isAuthenticated, user, justLoggedIn, router]);

  /* ============================================================
     ✅ EMAIL LOGIN
  ============================================================ */
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await loginWithEmail(form.email, form.password);
      setJustLoggedIn(true);
      toast.success("Login successful!");
      router.push("/");
    } catch (err) {
      setError(err.message || "Unable to log in. Please try again.");
      toast.error("Login failed!");
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     ✅ FORGOT PASSWORD (Firebase Reset Email)
  ============================================================ */
  const handleForgotPassword = async () => {
    const email = String(form.email || "").trim().toLowerCase();

    if (!email) {
      toast.error("Please enter your email first.");
      return;
    }

    try {
      setResetLoading(true);

      await sendPasswordResetEmail(auth, email);

      toast.success("Password reset link sent to your email ✅");
    } catch (err) {
      console.error("❌ Forgot Password Error:", err);

      // ✅ friendly errors
      if (err?.code === "auth/user-not-found") {
        toast.error("No account found with this email.");
      } else if (err?.code === "auth/invalid-email") {
        toast.error("Invalid email address.");
      } else {
        toast.error("Failed to send reset email.");
      }
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <section className="flex min-h-screen items-center justify-center bg-[#f5f5f5] px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        {/* ================= HEADER ================= */}
        <div className="mb-8 text-center">
          <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-gray-500">
            Miray Fashions
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to continue to your account
          </p>
        </div>

        {/* ================= FORM ================= */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {/* EMAIL */}
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            <input
              type="email"
              required
              placeholder="Email address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl border border-gray-300 bg-white px-11 py-3 text-sm outline-none transition
              focus:border-black focus:ring-2 focus:ring-black/10"
            />
          </div>

          {/* PASSWORD */}
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            <input
              ref={passwordRef}
              type="password"
              required
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-xl border border-gray-300 bg-white px-11 py-3 text-sm outline-none transition
              focus:border-black focus:ring-2 focus:ring-black/10"
            />
          </div>

          {/* ✅ FORGOT PASSWORD */}
          <div className="flex justify-start ml-2">
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={resetLoading}
              className="text-xs font-semibold text-gray-700 hover:text-black transition underline underline-offset-4"
            >
              {resetLoading ? "Sending..." : "Forgot Password?"}
            </button>
          </div>

          {error && (
            <p className="text-center text-sm text-red-600">{error}</p>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-black py-3 text-sm font-semibold text-white
            transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* ================= DIVIDER ================= */}
        <div className="my-7 flex items-center gap-3">
          <span className="h-px flex-1 bg-gray-200" />
          <span className="text-xs uppercase tracking-widest text-gray-400">
            or
          </span>
          <span className="h-px flex-1 bg-gray-200" />
        </div>

        {/* ================= GOOGLE ================= */}
        <div className="flex flex-col gap-3">
          <GoogleSignIn />
        </div>

        {/* ================= FOOTER ================= */}
        <p className="mt-7 text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <a
            href="/auth/register"
            className="font-semibold text-black hover:underline"
          >
            Create one
          </a>
        </p>
      </div>
    </section>
  );
}
