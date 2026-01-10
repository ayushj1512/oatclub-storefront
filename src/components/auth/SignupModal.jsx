"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import GoogleSignInButton from "@/components/auth/GoogleSignIn";
import { useAuthStore } from "@/store/authStore";

const LOCK_ATTR = "data-miray-scroll-lock";
const API = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function SignupModal({
  closeAll,
  forceOpen = false,
  prefillEmail = "",
  onClose,
}) {
  const router = useRouter();
  const { setModalDismissed } = useAuthStore();

  const [open, setOpen] = useState(false);
  const modalRef = useRef(null);

  const [emailCheck, setEmailCheck] = useState("");
  const [checkingEmail, setCheckingEmail] = useState(false);

  const [password, setPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const scrollYRef = useRef(0);
  const prevStyleRef = useRef({
    overflow: "",
    position: "",
    top: "",
    width: "",
  });

  /* ======================================================
     ✅ BODY SCROLL LOCK
  ====================================================== */
  const forceUnlockBodyScroll = useCallback(() => {
    const body = document.body;
    const top = body.style.top || "";
    const y = top ? Math.abs(parseInt(top, 10)) || 0 : 0;

    body.style.overflow = "";
    body.style.position = "";
    body.style.top = "";
    body.style.width = "";
    body.removeAttribute(LOCK_ATTR);

    if (y) window.scrollTo(0, y);
  }, []);

  const lockBodyScroll = useCallback(() => {
    const body = document.body;
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
    const { overflow, position, top, width } = prevStyleRef.current;

    body.style.overflow = overflow;
    body.style.position = position;
    body.style.top = top;
    body.style.width = width;
    body.removeAttribute(LOCK_ATTR);

    window.scrollTo(0, scrollYRef.current);
  }, []);

  /* ======================================================
     ✅ OPEN MODAL
  ====================================================== */
  useEffect(() => {
    if (forceOpen) setOpen(true);
  }, [forceOpen]);

  useEffect(() => {
    const em = String(prefillEmail || "").trim().toLowerCase();
    if (!em) return;

    setEmailCheck(em);
    setOpen(true);
  }, [prefillEmail]);

  useEffect(() => {
    if (!open) return forceUnlockBodyScroll();
    lockBodyScroll();
    return () => unlockBodyScroll();
  }, [open, lockBodyScroll, unlockBodyScroll, forceUnlockBodyScroll]);

  /* ======================================================
     ✅ CLOSE MODAL
  ====================================================== */
  const closeModal = useCallback(() => {
    setModalDismissed?.();
    setOpen(false);
    closeAll?.();
    onClose?.();
  }, [setModalDismissed, closeAll, onClose]);

  /* ======================================================
     ✅ CLICK OUTSIDE
  ====================================================== */
  const handlePointerDown = useCallback(
    (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) closeModal();
    },
    [closeModal]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open, handlePointerDown]);

  /* ======================================================
     ✅ EMAIL CHECK (Loader Only)
  ====================================================== */
  useEffect(() => {
    if (!emailCheck || !emailCheck.includes("@")) return;

    const timer = setTimeout(async () => {
      try {
        if (!API) return;
        setCheckingEmail(true);
        await fetch(
          `${API}/api/customers?search=${encodeURIComponent(emailCheck)}`,
          { cache: "no-store" }
        );
      } catch {
      } finally {
        setCheckingEmail(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [emailCheck]);

  /* ======================================================
     ✅ LOGIN CLICK
  ====================================================== */
  const handleLogin = async () => {
    if (!emailCheck || !password) return;

    setLoggingIn(true);
    try {
      closeModal();
      router.push(`/auth/login?email=${encodeURIComponent(emailCheck)}`);
    } finally {
      setLoggingIn(false);
    }
  };

  if (!open) return null;

  /* ======================================================
     ✅ UI CLASSES (SOFT PREMIUM)
  ====================================================== */
  const inputClass =
    "w-full rounded-2xl bg-gray-50/70 px-4 py-3 text-sm outline-none " +
    "shadow-[inset_0_0_0_1px_rgba(0,0,0,0.10)] transition " +
    "focus:shadow-[inset_0_0_0_2px_rgba(0,0,0,0.18)]";

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/30 backdrop-blur-[2px] px-4">
      <div
        ref={modalRef}
        className="relative w-full max-w-sm overflow-hidden rounded-[22px] bg-white shadow-[0_30px_80px_rgba(0,0,0,0.18)]"
      >
        {/* subtle top gradient */}
        <div className="h-16 bg-gradient-to-b from-black/[0.06] to-transparent" />

        <div className="px-5 pb-6 -mt-10">
          {/* CLOSE */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-white/70 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)] hover:bg-white transition"
          >
            <X size={16} />
          </button>

          {/* TITLE */}
          <h2 className="text-lg font-bold text-center text-black">
            Login / Sign up
          </h2>
          <p className="text-xs text-gray-500 text-center mt-1 mb-5">
            Enter your email to continue.
          </p>

          {/* EMAIL */}
          <div className="mb-4">
            <label className="text-[11px] text-gray-600 block mb-1">
              Email
            </label>
            <div className="relative">
              <input
                value={emailCheck}
                onChange={(e) =>
                  setEmailCheck(e.target.value.trim().toLowerCase())
                }
                placeholder="Enter your email"
                className={inputClass}
              />
              {checkingEmail && (
                <Loader2
                  className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400"
                  size={16}
                />
              )}
            </div>
          </div>

          {/* PASSWORD */}
          <div className="mb-5">
            <label className="text-[11px] text-gray-600 block mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className={inputClass}
            />
          </div>

          {/* LOGIN */}
          <button
            disabled={!emailCheck || !password || loggingIn}
            onClick={handleLogin}
            className={`w-full rounded-2xl py-3 text-sm font-semibold transition shadow-[0_18px_35px_rgba(0,0,0,0.18)] active:scale-[0.99]
              ${
                !emailCheck || !password
                  ? "bg-black/20 text-black/40 cursor-not-allowed shadow-none"
                  : "bg-black text-white hover:opacity-95"
              }`}
          >
            {loggingIn ? "Logging in..." : "Login"}
          </button>

          {/* FORGOT */}
          <button
            onClick={() => {
              closeModal();
              router.push(
                `/auth/forgot-password?email=${encodeURIComponent(emailCheck || "")}`
              );
            }}
            className="mt-4 text-xs text-gray-600 underline underline-offset-4 w-full text-center hover:text-black transition"
          >
            Forgot Password?
          </button>

          {/* OR */}
          <div className="flex items-center gap-3 my-5">
            <span className="flex-1 h-px bg-gray-200" />
            <span className="text-[11px] text-gray-400">OR</span>
            <span className="flex-1 h-px bg-gray-200" />
          </div>

          {/* GOOGLE */}
          <GoogleSignInButton />
        </div>
      </div>
    </div>
  );
}
