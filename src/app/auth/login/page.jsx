"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Loader2, Mail, Lock, LogIn } from "lucide-react";
import GoogleSignIn from "@/components/auth/GoogleSignIn";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const { user, isAuthenticated, loginWithEmail } = useAuthStore();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [justLoggedIn, setJustLoggedIn] = useState(false); // ⭐ Prevent duplicate toast

  // --------------------------------------------
  // 🔥 Redirect when session already exists
  // --------------------------------------------
  useEffect(() => {
    if (isAuthenticated && user) {
      if (!justLoggedIn) {
        toast.success(`Hello, ${user.name || "there"}!`);
      }
      router.replace("/");
    }
  }, [isAuthenticated, user, justLoggedIn, router]);

  // --------------------------------------------
  // 📧 EMAIL LOGIN
  // --------------------------------------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await loginWithEmail(form.email, form.password);

      // ⭐ Mark login as fresh → no extra toast from useEffect
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

  return (
    <section className="flex flex-col items-center justify-center min-h-screen px-6 py-10 bg-white">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-200">

        <h1 className="text-3xl font-semibold text-center mb-2 text-gray-800">Welcome to Miray Fashions</h1>
        <p className="text-center text-gray-500 mb-6 text-sm">Please sign in to continue to your account.</p>

        {/* EMAIL LOGIN */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
            <input
              type="email"
              required
              placeholder="Enter your email"
              className="border rounded-xl px-10 py-3 w-full bg-gray-50 text-gray-800 outline-none transition focus:ring-2 focus:ring-[#800020] focus:border-[#800020]"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
            <input
              type="password"
              required
              placeholder="Enter your password"
              className="border rounded-xl px-10 py-3 w-full bg-gray-50 text-gray-800 outline-none transition focus:ring-2 focus:ring-[#800020] focus:border-[#800020]"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          {error && <p className="text-red-600 text-sm text-center mt-1">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 text-white py-3 rounded-xl hover:opacity-90 active:scale-[0.98] transition shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#800020" }}
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (<><LogIn className="w-5 h-5" />Sign In</>)}
          </button>
        </form>

        {/* DIVIDER */}
        <div className="flex items-center my-6">
          <span className="flex-1 h-px bg-gray-300"></span>
          <span className="px-3 text-gray-500 text-sm">or</span>
          <span className="flex-1 h-px bg-gray-300"></span>
        </div>

        {/* GOOGLE LOGIN */}
        <div className="flex flex-col gap-3">
          <GoogleSignIn />
        </div>

        <p className="text-sm text-center mt-6 text-gray-600">
          Don’t have an account?{" "}
          <a href="/auth/register" className="font-medium hover:underline" style={{ color: "#800020" }}>
            Create an account
          </a>
        </p>

      </div>
    </section>
  );
}
