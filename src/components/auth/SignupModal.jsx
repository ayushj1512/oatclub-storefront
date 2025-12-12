"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import GoogleSignInButton from "@/components/auth/GoogleSignIn";
import { useAuthStore } from "@/store/authStore";

const LOCK_ATTR = "data-miray-scroll-lock";

export default function SignupModal({ closeAll }) {
  const router = useRouter();
  const { modalDismissed, setModalDismissed, isAuthenticated } = useAuthStore();

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);

  const modalRef = useRef(null);

  // Scroll-lock state (iOS-safe)
  const scrollYRef = useRef(0);
  const prevStyleRef = useRef({
    overflow: "",
    position: "",
    top: "",
    width: "",
  });

  // ✅ Force-unlock helper (fixes "scroll stuck until modal opens" on mobile)
  const forceUnlockBodyScroll = useCallback(() => {
    const body = document.body;

    // Only act if body looks locked (or our lock attribute exists)
    const isLocked =
      body.getAttribute(LOCK_ATTR) === "signup" ||
      body.style.position === "fixed" ||
      body.style.overflow === "hidden";

    if (!isLocked) return;

    // Try to restore scroll from body.style.top if present
    const top = body.style.top || "";
    const y = top ? Math.abs(parseInt(top, 10)) || 0 : 0;

    body.style.overflow = "";
    body.style.position = "";
    body.style.top = "";
    body.style.width = "";
    body.removeAttribute(LOCK_ATTR);

    // Restore scroll position (best-effort)
    if (y) window.scrollTo(0, y);
  }, []);

  /* ------------------------------------
      AUTO OPEN AFTER 10 SECONDS
  ------------------------------------- */
  useEffect(() => {
    if (isAuthenticated || modalDismissed) return;

    const timer = setTimeout(() => setOpen(true), 10000);
    return () => clearTimeout(timer);
  }, [isAuthenticated, modalDismissed]);

  /* ------------------------------------
      BODY SCROLL LOCK (iOS-safe)
      - Also ensures body is NOT stuck locked before modal opens
  ------------------------------------- */
  const lockBodyScroll = useCallback(() => {
    const body = document.body;

    // If something else already locked scroll, don't fight it
    if (body.getAttribute(LOCK_ATTR) && body.getAttribute(LOCK_ATTR) !== "signup") {
      return;
    }

    scrollYRef.current = window.scrollY || 0;

    prevStyleRef.current = {
      overflow: body.style.overflow || "",
      position: body.style.position || "",
      top: body.style.top || "",
      width: body.style.width || "",
    };

    body.setAttribute(LOCK_ATTR, "signup");

    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollYRef.current}px`;
    body.style.width = "100%";
  }, []);

  const unlockBodyScroll = useCallback(() => {
    const body = document.body;

    // Only unlock if this modal locked it
    if (body.getAttribute(LOCK_ATTR) && body.getAttribute(LOCK_ATTR) !== "signup") {
      return;
    }

    const { overflow, position, top, width } = prevStyleRef.current;

    body.style.overflow = overflow;
    body.style.position = position;
    body.style.top = top;
    body.style.width = width;

    body.removeAttribute(LOCK_ATTR);

    window.scrollTo(0, scrollYRef.current);
  }, []);

  // ✅ On mount: ensure body isn't stuck locked from earlier navigation/modal
  useEffect(() => {
    forceUnlockBodyScroll();
    return () => {
      // ✅ On unmount: cleanup just in case
      forceUnlockBodyScroll();
    };
  }, [forceUnlockBodyScroll]);

  // ✅ Main lock/unlock effect
  useEffect(() => {
    if (!open) {
      // ✅ critical: if modal isn't open, make sure body isn't locked
      forceUnlockBodyScroll();
      return;
    }

    lockBodyScroll();
    return () => unlockBodyScroll();
  }, [open, lockBodyScroll, unlockBodyScroll, forceUnlockBodyScroll]);

  /* ------------------------------------
      CLOSE MODAL
  ------------------------------------- */
  const closeModal = useCallback(() => {
    setModalDismissed();
    setOpen(false);
    closeAll?.();
  }, [setModalDismissed, closeAll]);

  /* ------------------------------------
      CLOSE WHEN CLICKING OUTSIDE
  ------------------------------------- */
  const handlePointerDown = useCallback(
    (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        closeModal();
      }
    },
    [closeModal]
  );

  useEffect(() => {
    if (!open) return;

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open, handlePointerDown]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/25 backdrop-blur-[2px] z-[99999] flex justify-center items-center px-4 animate-fadeIn">
      {/* MODAL */}
      <div
        ref={modalRef}
        className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 animate-fadeIn relative max-h-[90vh] overflow-y-auto [-webkit-overflow-scrolling:touch]"
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={closeModal}
          className="absolute top-3 right-3 p-2 rounded-full bg-gray-100 hover:bg-gray-200"
          aria-label="Close"
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

            <GoogleSignInButton />

            <div className="flex items-center gap-3 my-5">
              <span className="flex-1 h-[1px] bg-gray-300"></span>
              <span className="text-xs text-gray-500">OR</span>
              <span className="flex-1 h-[1px] bg-gray-300"></span>
            </div>

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
