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
      className="flex h-11 w-full max-w-full items-center justify-center gap-2.5 border border-black/15 bg-white px-4 text-[10px] font-black uppercase tracking-[0.14em] text-black transition hover:border-black hover:bg-neutral-50 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <FcGoogle size={19} />

      <span className="truncate">
        {loading ? "SIGNING IN" : "CONTINUE WITH GOOGLE"}
      </span>

      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black/25 border-t-black" />
      )}
    </button>
  );
}
