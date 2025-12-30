"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import GoogleSignInButton from "@/components/auth/GoogleSignIn";
import { useAuthStore } from "@/store/authStore";

export default function SignupModal({ closeAll }) {
  const {
    registerWithEmail,
    loginWithEmail,
    modalDismissed,
    setModalDismissed,
    isAuthenticated,
  } = useAuthStore();

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");

  /* ------------------------------------------------------------------
      DEBUG EACH RENDER
  ------------------------------------------------------------------ */
  console.log(
    "%c[SignupModal] Render → open:",
    "color:#2962ff; font-weight:bold;",
    open,
    " | step:",
    step
  );

  /* ------------------------------------------------------------------
      AUTO OPEN AFTER 12 SECONDS
  ------------------------------------------------------------------ */
  useEffect(() => {
    console.log(
      "%c[SignupModal] useEffect fired",
      "color:#7b1fa2; font-weight:bold;"
    );
    console.log("isAuthenticated:", isAuthenticated);
    console.log("modalDismissed:", modalDismissed);

    if (isAuthenticated) {
      console.log(
        "%c[SignupModal] STOP → User is authenticated",
        "color:orange"
      );
      return;
    }

    if (modalDismissed) {
      console.log(
        "%c[SignupModal] STOP → modalDismissed = true",
        "color:orange"
      );
      return;
    }

    console.log(
      "%c[SignupModal] Timer STARTED → 12 seconds",
      "color:green; font-weight:bold"
    );

    // MAIN TIMER
    const timer = setTimeout(() => {
      console.log(
        "%c[SignupModal] TIMER FIRED → Opening modal",
        "color:#00c853; font-size:14px"
      );
      setOpen(true);
    }, 12000);

    // FAILSAFE TIMER (StrictMode double-call protection)
    const failsafe = setTimeout(() => {
      if (!open) {
        console.log(
          "%c[SignupModal] FAILSAFE TIMER FIRED → Forcing modal open",
          "color:#d50000; font-weight:bold"
        );
        setOpen(true);
      }
    }, 15000);

    return () => {
      console.log("%c[SignupModal] Timer cleaned", "color:red");
      clearTimeout(timer);
      clearTimeout(failsafe);
    };
  }, [modalDismissed, isAuthenticated]);

  /* ------------------------------------------------------------------
      CLOSE MODAL
  ------------------------------------------------------------------ */
  const closeModal = () => {
    console.log("%c[SignupModal] Closing modal...", "color:red; font-weight:bold");

    setModalDismissed();
    console.log("%c[SignupModal] modalDismissed set → true", "color:orange");

    setOpen(false);
    console.log("%c[SignupModal] open set → false", "color:orange");

    if (typeof closeAll === "function") {
      console.log("%c[SignupModal] Calling closeAll()", "color:#2962ff");
      closeAll();
    }
  };

  /* ------------------------------------------------------------------
      IF NOT OPEN → STOP HERE
  ------------------------------------------------------------------ */
  if (!open) {
    console.log(
      "%c[SignupModal] Not open → returning null",
      "color:#9e9e9e; font-style:italic"
    );
    return null;
  }

  /* ------------------------------------------------------------------
      UI BELOW
  ------------------------------------------------------------------ */
  console.log(
    `%c[SignupModal] Rendering UI → STEP ${step}`,
    "color:#1e88e5; font-weight:bold"
  );

 return (
  <div className="fixed inset-0 z-[99999] flex items-center justify-center px-4
                  bg-black/50 backdrop-blur-sm animate-fadeIn">

    <div className="relative w-full max-w-sm rounded-2xl bg-white
                    border border-black/10 p-6 shadow-xl animate-slideUp">

      {/* ================= CLOSE ================= */}
      <button
        onClick={closeModal}
        className="absolute right-3 top-3 rounded-full p-2
                   text-black/60 hover:bg-black/5 transition"
        aria-label="Close"
      >
        <X size={18} />
      </button>

      {/* ================= STEP 1 ================= */}
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

      {/* ================= STEP 2 ================= */}
      {step === 2 && (
        <>
          <h2 className="mb-2 text-center text-xl font-extrabold">
            Continue
          </h2>

          <p className="mb-6 text-center text-xs text-black/50">
            Choose how you’d like to proceed
          </p>

          {/* Google */}
          <GoogleSignInButton />

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-black/10" />
            <span className="text-[11px] uppercase tracking-widest text-black/40">
              or
            </span>
            <span className="h-px flex-1 bg-black/10" />
          </div>

          {/* Email */}
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

      {/* ================= STEP 3 ================= */}
      {step === 3 && (
        <>
          <h2 className="mb-2 text-center text-xl font-extrabold">
            Create your account
          </h2>

          <p className="mb-5 text-center text-sm text-black/60">
            Just a few details to get started
          </p>

          {/* Email */}
          <input
            type="email"
            placeholder="Email address"
            className="mb-3 w-full rounded-lg border border-black/10 p-3
                       text-sm outline-none focus:border-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Name */}
          <input
            type="text"
            placeholder="Full name"
            className="mb-3 w-full rounded-lg border border-black/10 p-3
                       text-sm outline-none focus:border-black"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* Password */}
          <input
            type="password"
            placeholder="Create password"
            className="mb-4 w-full rounded-lg border border-black/10 p-3
                       text-sm outline-none focus:border-black"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />

          {/* Create */}
          <button
            onClick={async () => {
              await registerWithEmail(email, pass, name);
              setModalDismissed();
              closeAll();
            }}
            className="w-full rounded-lg bg-black py-3
                       text-sm font-semibold text-white
                       hover:opacity-90 transition"
          >
            Create Account
          </button>

          {/* Login */}
          <button
            onClick={async () => {
              await loginWithEmail(email, pass);
              setModalDismissed();
              closeAll();
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
