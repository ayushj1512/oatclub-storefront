"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { FcGoogle } from "react-icons/fc";

export default function GoogleSignInButton() {
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
    } catch (err) {
      console.error("Google Login Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={loading}
      className="
        w-full max-w-full
        flex items-center justify-center gap-3
        bg-white dark:bg-neutral-900
        border border-gray-300 dark:border-neutral-700
        rounded-xl py-3 px-5
        font-medium text-gray-700 dark:text-gray-200
        shadow-sm 
        hover:shadow-md hover:bg-gray-50 dark:hover:bg-neutral-800
        active:scale-[0.98]
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
      "
    >
      <FcGoogle size={24} />

      {/* Text Auto-Shrinks on Smaller Screens */}
      <span className="truncate">
        {loading ? "Signing in..." : "Sign in with Google"}
      </span>

      {/* Optional Loading Spinner */}
      {loading && (
        <span className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full"></span>
      )}
    </button>
  );
}
