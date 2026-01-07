"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import GoogleSignInButton from "@/components/auth/GoogleSignIn";
import { useAuthStore } from "@/store/authStore";

const LOCK_ATTR = "data-miray-scroll-lock";
const API = process.env.NEXT_PUBLIC_BACKEND_URL; // ✅ your backend

export default function SignupModal({ closeAll }) {
  const router = useRouter();
  const { modalDismissed, setModalDismissed, isAuthenticated } = useAuthStore();

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);

  const modalRef = useRef(null);

  // ✅ Email check state
  const [emailCheck, setEmailCheck] = useState("");
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [existingCustomer, setExistingCustomer] = useState(false);

  const scrollYRef = useRef(0);
  const prevStyleRef = useRef({
    overflow: "",
    position: "",
    top: "",
    width: "",
  });

  /* ======================================================
     ✅ FORCE UNLOCK SCROLL
  ====================================================== */
  const forceUnlockBodyScroll = useCallback(() => {
    const body = document.body;

    const isLocked =
      body.getAttribute(LOCK_ATTR) === "signup" ||
      body.style.position === "fixed" ||
      body.style.overflow === "hidden";

    if (!isLocked) return;

    const top = body.style.top || "";
    const y = top ? Math.abs(parseInt(top, 10)) || 0 : 0;

    body.style.overflow = "";
    body.style.position = "";
    body.style.top = "";
    body.style.width = "";
    body.removeAttribute(LOCK_ATTR);

    if (y) window.scrollTo(0, y);
  }, []);

  /* ======================================================
     ✅ AUTO OPEN AFTER 10 SEC
  ====================================================== */
  useEffect(() => {
    if (isAuthenticated || modalDismissed) return;

    const timer = setTimeout(() => setOpen(true), 10000);
    return () => clearTimeout(timer);
  }, [isAuthenticated, modalDismissed]);

  /* ======================================================
     ✅ LOCK BODY SCROLL
  ====================================================== */
  const lockBodyScroll = useCallback(() => {
    const body = document.body;

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

  useEffect(() => {
    forceUnlockBodyScroll();
    return () => forceUnlockBodyScroll();
  }, [forceUnlockBodyScroll]);

  useEffect(() => {
    if (!open) {
      forceUnlockBodyScroll();
      return;
    }

    lockBodyScroll();
    return () => unlockBodyScroll();
  }, [open, lockBodyScroll, unlockBodyScroll, forceUnlockBodyScroll]);

  /* ======================================================
     ✅ CLOSE MODAL
  ====================================================== */
  const closeModal = useCallback(() => {
    setModalDismissed();
    setOpen(false);
    closeAll?.();
  }, [setModalDismissed, closeAll]);

  /* ======================================================
     ✅ CLICK OUTSIDE
  ====================================================== */
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

  /* ======================================================
     ✅ EMAIL EXISTENCE CHECK (DEBOUNCED)
  ====================================================== */
  useEffect(() => {
    if (!emailCheck || !emailCheck.includes("@")) {
      setExistingCustomer(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        if (!API) return;

        setCheckingEmail(true);

        const res = await fetch(
          `${API}/api/customers?search=${encodeURIComponent(emailCheck)}`,
          { cache: "no-store" }
        );

        const data = await res.json();

        // ✅ if found any customer
        if (res.ok && data?.items?.length > 0) {
          setExistingCustomer(true);
        } else {
          setExistingCustomer(false);
        }
      } catch (e) {
        console.error("❌ Email check failed:", e);
        setExistingCustomer(false);
      } finally {
        setCheckingEmail(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [emailCheck]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/25 backdrop-blur-[2px] z-[99999] flex justify-center items-center px-4 animate-fadeIn">
      <div
        ref={modalRef}
        className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 animate-fadeIn relative max-h-[90vh] overflow-y-auto [-webkit-overflow-scrolling:touch]"
      >
        {/* CLOSE */}
        <button
          onClick={closeModal}
          aria-label="Close"
          className="absolute top-3 right-3 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
        >
          <X size={20} />
        </button>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <h2 className="text-2xl font-bold text-center text-black">
              Welcome to Miray Fashions
            </h2>

            <p className="text-sm text-gray-600 text-center mt-2 mb-4">
              We’re glad you’re here — let’s get started.
            </p>

            <p className="text-xs text-gray-500 text-center mb-6">
              Already a customer?{" "}
              <button
                onClick={() => {
                  closeModal();
                  router.push("/auth/login");
                }}
                className="text-black font-semibold underline underline-offset-2"
              >
                Login here
              </button>
            </p>

            <button
              onClick={() => setStep(2)}
              className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-black/90 transition"
            >
              Login / Sign Up
            </button>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <h2 className="text-xl font-bold text-center text-black">
              Continue Your Journey
            </h2>

            <p className="text-xs text-gray-500 text-center mt-1 mb-4">
              Choose a sign-in method.
            </p>

            {/* ✅ EMAIL CHECK INPUT */}
            <div className="mb-4">
              <label className="text-xs text-gray-600">Email</label>
              <div className="relative mt-1">
                <input
                  value={emailCheck}
                  onChange={(e) => setEmailCheck(e.target.value.trim().toLowerCase())}
                  placeholder="Enter your email"
                  className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-black"
                />

                {checkingEmail && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-500" size={18} />
                )}
              </div>
            </div>

            {/* ✅ EXISTING CUSTOMER WARNING */}
            {existingCustomer && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center mb-4">
                <p className="text-xs text-red-700 font-semibold">
                  You already have an account.
                </p>
                <p className="text-[11px] text-red-600 mt-1">
                  Please login instead of signing up again.
                </p>

                <button
                  onClick={() => {
                    closeModal();
                    router.push("/auth/login");
                  }}
                  className="mt-3 w-full bg-black text-white py-2 rounded-lg text-sm font-semibold hover:bg-black/90 transition"
                >
                  Login Now
                </button>
              </div>
            )}

            {/* ✅ Google */}
            <div className={existingCustomer ? "opacity-40 pointer-events-none" : ""}>
              <GoogleSignInButton />
            </div>

            <div className="flex items-center gap-3 my-5">
              <span className="flex-1 h-px bg-gray-300"></span>
              <span className="text-xs text-gray-500">OR</span>
              <span className="flex-1 h-px bg-gray-300"></span>
            </div>

            {/* ✅ Continue with Email */}
            <button
              disabled={existingCustomer}
              onClick={() => {
                closeModal();
                router.push("/auth/login");
              }}
              className={`w-full py-3 rounded-lg text-sm font-medium transition ${
                existingCustomer
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              Continue with Email
            </button>
          </>
        )}
      </div>
    </div>
  );
}
