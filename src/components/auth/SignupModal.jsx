"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import GoogleSignInButton from "@/components/auth/GoogleSignIn";
import { useAuthStore } from "@/store/authStore";

export default function SignupModal({ closeAll }) {
  const router = useRouter();

  const { modalDismissed, setModalDismissed, isAuthenticated } = useAuthStore();

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);

  const modalRef = useRef(null);

  /* ------------------------------------
      AUTO OPEN AFTER 12 SECONDS
  ------------------------------------- */
  useEffect(() => {
    if (isAuthenticated || modalDismissed) return;

    const timer = setTimeout(() => setOpen(true), 12000);
    return () => clearTimeout(timer);
  }, [isAuthenticated, modalDismissed]);

  /* ------------------------------------
      CLOSE MODAL
  ------------------------------------- */
  const closeModal = () => {
    setModalDismissed();
    setOpen(false);
    closeAll?.();
  };

  /* ------------------------------------
      CLOSE WHEN CLICKING OUTSIDE
  ------------------------------------- */
  const handleClickOutside = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      closeModal();
    }
  };

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  if (!open) return null;

  /* ------------------------------------
      UI
  ------------------------------------- */
  return (
    <div className="fixed inset-0 bg-black/25 backdrop-blur-[2px] z-[99999] flex justify-center items-center px-4 animate-fadeIn">
      
      {/* MODAL */}
      <div
        ref={modalRef}
        className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 animate-fadeIn relative"
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={closeModal}
          className="absolute top-3 right-3 p-2 rounded-full bg-gray-100 hover:bg-gray-200"
        >
          <X size={20} />
        </button>

        {/* STEP 1 — WELCOME */}
        {step === 1 && (
          <>
            <h2 className="text-2xl font-bold text-center text-[#800020]">
              Welcome to Miray Fashions ✨
            </h2>

            <p className="text-sm text-gray-600 text-center mt-2 mb-6">
              We're glad you're here — let’s get started.
            </p>

            <button
              onClick={() => setStep(2)}
              className="w-full bg-[#800020] text-white py-3 rounded-lg font-semibold hover:bg-[#6a001b] transition"
            >
              Login / Sign Up
            </button>
          </>
        )}

        {/* STEP 2 — OPTIONS */}
        {step === 2 && (
          <>
            <h2 className="text-xl font-bold text-center text-[#800020]">
              Continue Your Journey 💫
            </h2>

            <p className="text-xs text-gray-500 text-center mt-1 mb-6">
              Choose a sign-in method.
            </p>

            {/* GOOGLE LOGIN */}
            <GoogleSignInButton />

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <span className="flex-1 h-[1px] bg-gray-300"></span>
              <span className="text-xs text-gray-500">OR</span>
              <span className="flex-1 h-[1px] bg-gray-300"></span>
            </div>

            {/* EMAIL LOGIN */}
            <button
              onClick={() => {
                closeModal();
                router.push("/auth/login");
              }}
              className="w-full bg-gray-100 py-3 rounded-lg text-sm font-medium text-gray-800 hover:bg-gray-200 transition"
            >
              Continue with Email
            </button>
          </>
        )}
      </div>
    </div>
  );
}
