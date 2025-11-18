"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { UserPlus, Mail, Lock, User, Loader2 } from "lucide-react";

// Google Button
import GoogleSignInButton from "@/components/auth/GoogleSignIn";

export default function RegisterPage() {
  const router = useRouter();
  const { registerWithEmail } = useAuthStore();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");

  // Shimmer loading effect
  useEffect(() => {
    const t = setTimeout(() => setPageLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const Shimmer = () => (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-2/3 mx-auto mb-6"></div>
      <div className="flex flex-col gap-4">
        {[1, 2, 3, 4].map((x) => (
          <div key={x} className="h-12 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  );

  // Register handler
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await registerWithEmail(form.email, form.password, form.name);
      router.push("/profile");
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex flex-col items-center justify-center min-h-[90vh] px-6 py-10 bg-gray-100">

      {pageLoading ? (
        <Shimmer />
      ) : (
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-gray-200">

          <h1 className="text-3xl font-bold text-center mb-6 text-gray-900">
            Create Your Account
          </h1>

          <form onSubmit={handleRegister} className="flex flex-col gap-4">

            {/* Name */}
            <InputField
              icon={<User className="w-5 h-5 text-gray-500" />}
              placeholder="Full Name"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
            />

            {/* Email */}
            <InputField
              icon={<Mail className="w-5 h-5 text-gray-500" />}
              placeholder="Email Address"
              type="email"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
            />

            {/* Password */}
            <InputField
              icon={<Lock className="w-5 h-5 text-gray-500" />}
              placeholder="Password"
              type="password"
              value={form.password}
              onChange={(v) => setForm({ ...form, password: v })}
            />

            {/* Confirm Password */}
            <InputField
              icon={<Lock className="w-5 h-5 text-gray-500" />}
              placeholder="Confirm Password"
              type="password"
              value={form.confirmPassword}
              onChange={(v) =>
                setForm({ ...form, confirmPassword: v })
              }
            />

            {error && (
              <p className="text-red-600 text-sm text-center">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 
              bg-[#5a001f] text-white py-3 rounded-xl 
              hover:bg-[#4a001a] transition active:scale-[0.97]
              disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <span className="flex-1 h-px bg-gray-300"></span>
            <span className="px-3 text-gray-500">or</span>
            <span className="flex-1 h-px bg-gray-300"></span>
          </div>

          {/* Google Login */}
          <div className="flex flex-col gap-3">
            <GoogleSignInButton />
          </div>

          <p className="text-center text-sm mt-6 text-gray-700">
            Already have an account?{" "}
            <a
              href="/auth/login"
              className="text-[#5a001f] font-medium hover:underline"
            >
              Login
            </a>
          </p>
        </div>
      )}
    </section>
  );
}

/* Reusable Input Component */
function InputField({ icon, placeholder, value, onChange, type = "text" }) {
  return (
    <div className="relative">
      <div className="absolute left-3 top-3.5">{icon}</div>
      <input
        type={type}
        placeholder={placeholder}
        className="border rounded-lg px-10 py-3 w-full 
        bg-gray-50 placeholder-gray-600 text-gray-900 
        focus:ring-2 focus:ring-[#5a001f] outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
