"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import GoogleSignInButton from "@/components/auth/GoogleSignIn";
import { useAuthStore } from "@/store/authStore";

const DISMISS_KEY = "signup_modal_dismissed";

export default function SignupModal({ closeAll }) {
  const {
    registerWithEmail,
    loginWithEmail,
    isAuthenticated,
  } = useAuthStore();

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");

  const timerRef = useRef(null);

  // ✅ helper
  const isDismissed = () => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(DISMISS_KEY) === "1";
  };

  // ✅ Open modal only ONCE
  useEffect(() => {
    // If user already logged in -> never show
    if (isAuthenticated) return;

    // If dismissed in localStorage -> never show again
    if (isDismissed()) return;

    // Clear any old timer
    if (timerRef.current) clearTimeout(timerRef.current);

    // Start timer once
    timerRef.current = setTimeout(() => {
      // re-check before opening (important)
      if (!isAuthenticated && !isDismissed()) {
        setOpen(true);
      }
    }, 12000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isAuthenticated]);

  // ✅ Close modal permanently
  const closeModal = () => {
    // persist dismissal
    if (typeof window !== "undefined") {
      localStorage.setItem(DISMISS_KEY, "1");
    }

    setOpen(false);

    if (typeof closeAll === "function") closeAll();
  };

  // ✅ If not open, render nothing
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center px-4
                    bg-black/50 backdrop-blur-sm animate-fadeIn">

      <div className="relative w-full max-w-sm rounded-2xl bg-white
                      border border-black/10 p-6 shadow-xl animate-slideUp">

        {/* CLOSE */}
        <button
          onClick={closeModal}
          className="absolute right-3 top-3 rounded-full p-2
                     text-black/60 hover:bg-black/5 transition"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <h2 className="mb-3 text-center text-2xl font-extrabold tracking-tight">
              Welcome to Miray
            </h2>

            <p className="mb-6 text-center text-sm leading-relaxed text-black/70">
              Discover curated styles and a smoother shopping experience.
            </p>

            <button
              onClick={() => setStep(2)}
              className="w-full rounded-lg bg-black py-3
                         text-sm font-semibold text-white
                         transition hover:opacity-90 active:scale-[0.98]"
            >
              Login or Sign Up
            </button>

            <p className="mt-4 text-center text-xs text-black/50">
              Join to unlock exclusive updates and offers.
            </p>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <h2 className="mb-2 text-center text-xl font-extrabold">
              Continue
            </h2>

            <p className="mb-6 text-center text-xs text-black/50">
              Choose how you’d like to proceed
            </p>

            <GoogleSignInButton />

            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-black/10" />
              <span className="text-[11px] uppercase tracking-widest text-black/40">
                or
              </span>
              <span className="h-px flex-1 bg-black/10" />
            </div>

            <button
              onClick={() => setStep(3)}
              className="w-full rounded-lg border border-black/10 py-3
                         text-sm font-semibold text-black
                         hover:bg-black/5 transition"
            >
              Continue with Email
            </button>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <h2 className="mb-2 text-center text-xl font-extrabold">
              Create your account
            </h2>

            <p className="mb-5 text-center text-sm text-black/60">
              Just a few details to get started
            </p>

            <input
              type="email"
              placeholder="Email address"
              className="mb-3 w-full rounded-lg border border-black/10 p-3
                         text-sm outline-none focus:border-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="text"
              placeholder="Full name"
              className="mb-3 w-full rounded-lg border border-black/10 p-3
                         text-sm outline-none focus:border-black"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              type="password"
              placeholder="Create password"
              className="mb-4 w-full rounded-lg border border-black/10 p-3
                         text-sm outline-none focus:border-black"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
            />

            <button
              onClick={async () => {
                await registerWithEmail(email, pass, name);
                closeModal();
              }}
              className="w-full rounded-lg bg-black py-3
                         text-sm font-semibold text-white
                         hover:opacity-90 transition"
            >
              Create Account
            </button>

            <button
              onClick={async () => {
                await loginWithEmail(email, pass);
                closeModal();
              }}
              className="mt-3 w-full rounded-lg border border-black/10 py-3
                         text-sm font-semibold text-black
                         hover:bg-black/5 transition"
            >
              Already have an account? Login
            </button>

            <p className="mt-4 text-center text-xs text-black/50">
              Your information is kept secure and private.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
