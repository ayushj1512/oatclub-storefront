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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99999] flex justify-center items-center px-4 animate-fadeIn">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 relative animate-fadeIn border border-[#800020]/10">

        {/* CLOSE BUTTON */}
        <button
          onClick={closeModal}
          className="absolute top-3 right-3 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
        >
          <X size={20} />
        </button>

        {/* =================== STEP 1 =================== */}
        {step === 1 && (
          <>
            <h2 className="text-2xl font-extrabold text-center mb-2 text-[#800020]">
              Welcome to Miray Fashions ✨
            </h2>

            <p className="text-sm text-gray-600 text-center mb-6 leading-relaxed">
              We're delighted to have you here ❤️  
              Your personalised fashion journey starts now.
            </p>

            <button
              onClick={() => {
                console.log("[SignupModal] Step 1 → Step 2");
                setStep(2);
              }}
              className="w-full bg-[#800020] text-white py-3 rounded-lg font-semibold hover:bg-[#6a001b] transition"
            >
              Login / Sign Up
            </button>

            <p className="text-center text-xs text-gray-500 mt-4">
              Join the Miray family and enjoy special offers 💕
            </p>
          </>
        )}

        {/* =================== STEP 2 =================== */}
        {step === 2 && (
          <>
            <h2 className="text-xl font-bold text-center mb-2 text-[#800020]">
              Continue Your Journey 💫
            </h2>

            <p className="text-xs text-gray-500 text-center mb-6">
              Choose the way you’d like to come on board.
            </p>

            <GoogleSignInButton />

            <div className="flex items-center gap-3 my-4">
              <span className="flex-1 h-[1px] bg-gray-300"></span>
              <span className="text-xs text-gray-500">OR</span>
              <span className="flex-1 h-[1px] bg-gray-300"></span>
            </div>

            <button
              onClick={() => {
                console.log("[SignupModal] Step 2 → Step 3");
                setStep(3);
              }}
              className="w-full bg-gray-100 text-gray-800 border border-gray-300 py-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
            >
              Continue with Email
            </button>
          </>
        )}

        {/* =================== STEP 3 =================== */}
        {step === 3 && (
          <>
            <h2 className="text-xl font-bold text-center mb-2 text-[#800020]">
              Create Your Account 🌸
            </h2>

            <p className="text-sm text-gray-600 text-center mb-5 leading-relaxed">
              Just a few quick details and you're all set.
            </p>

            {/* EMAIL */}
            <input
              type="email"
              placeholder="Email Address"
              className="w-full border rounded-lg p-3 mb-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {/* NAME */}
            <input
              type="text"
              placeholder="Full Name"
              className="w-full border rounded-lg p-3 mb-3"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            {/* PASSWORD */}
            <input
              type="password"
              placeholder="Create Password"
              className="w-full border rounded-lg p-3 mb-4"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
            />

            {/* CREATE ACCOUNT */}
            <button
              onClick={async () => {
                console.log("[SignupModal] Creating account:", {
                  email,
                  name,
                });
                await registerWithEmail(email, pass, name);
                setModalDismissed();
                closeAll();
              }}
              className="w-full bg-[#800020] text-white py-3 rounded-lg font-semibold hover:bg-[#6a001b] transition"
            >
              Create Account
            </button>

            {/* LOGIN */}
            <button
              onClick={async () => {
                console.log("[SignupModal] Logging in:", { email });
                await loginWithEmail(email, pass);
                setModalDismissed();
                closeAll();
              }}
              className="w-full bg-gray-100 text-gray-800 py-3 rounded-lg border mt-3 hover:bg-gray-200 transition"
            >
              Already Have an Account? Login
            </button>

            <p className="text-center text-xs text-gray-500 mt-4">
              Your privacy & security are our priority 💝
            </p>
          </>
        )}
      </div>
    </div>
  );
}
