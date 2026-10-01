"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Gift, Heart, Sparkles, X } from "lucide-react";
import useBdayStore from "@/store/bdaystore";

const COUPON_CODE = "BOSSBDAY20";

const normalizePhone = (value) => {
  const digits = String(value ?? "").replace(/[\s()+-]/g, "");

  if (/^91[6-9]\d{9}$/.test(digits)) return digits.slice(2);
  if (/^0[6-9]\d{9}$/.test(digits)) return digits.slice(1);

  return digits;
};

const inputClassName =
  "h-11 w-full min-w-0 rounded-xl border border-pink-100 bg-[#fff0f6] px-3.5 text-base text-[#571b38] outline-none transition placeholder:text-[12px] placeholder:text-[#b9859f] focus:border-pink-300 focus:bg-white focus:ring-2 focus:ring-pink-200 sm:text-sm";

const labelClassName =
  "mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#8b3a61]";

export default function BdayWishModal() {
  const createWish = useBdayStore((state) => state.createWish);
  const loading = useBdayStore((state) => state.loading);

  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [couponCode, setCouponCode] = useState(COUPON_CODE);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const copyTimerRef = useRef(null);
  const submittingRef = useRef(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    let timer;

    const handleOpenBdayModal = () => {
      if (timer) window.clearTimeout(timer);

      if (copyTimerRef.current) {
        window.clearTimeout(copyTimerRef.current);
      }

      setSubmitted(false);
      setCopied(false);
      setError("");
      setOpen(true);
    };

    window.addEventListener(
      "open-bday-wish-modal",
      handleOpenBdayModal
    );

    let dismissed = false;

    try {
      dismissed = Boolean(
        sessionStorage.getItem("bday-wish-dismissed")
      );
    } catch { }

    if (!dismissed) {
      timer = window.setTimeout(() => setOpen(true), 1200);
    }

    return () => {
      if (timer) window.clearTimeout(timer);

      if (copyTimerRef.current) {
        window.clearTimeout(copyTimerRef.current);
      }

      window.removeEventListener(
        "open-bday-wish-modal",
        handleOpenBdayModal
      );
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow =
      document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow =
        previousHtmlOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [open, submitted]);

  const closeModal = () => {
    try {
      sessionStorage.setItem("bday-wish-dismissed", "true");
    } catch { }

    setOpen(false);
  };

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading || submittingRef.current) return;

    setError("");

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const phone = normalizePhone(form.phone);
    const message = form.message.trim();

    if (!name || !email || !phone || !message) {
      setError("A few little details are missing — fill them in 💕");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Your email needs a tiny check — enter a valid address.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    submittingRef.current = true;

    try {
      const data = await createWish({
        name,
        email,
        phone,
        message,
      });

      setCouponCode(data?.couponCode || COUPON_CODE);
      setSubmitted(true);
    } catch (err) {
      setError(err?.message || "Unable to submit your wish.");
    } finally {
      submittingRef.current = false;
    }
  };

  const copyCoupon = async () => {
    setError("");

    try {
      await navigator.clipboard.writeText(couponCode);
      setCopied(true);

      if (copyTimerRef.current) {
        window.clearTimeout(copyTimerRef.current);
      }

      copyTimerRef.current = window.setTimeout(
        () => setCopied(false),
        2000
      );
    } catch {
      setError("Please copy the coupon code manually.");
    }
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[9999] flex items-end justify-center bg-[#44152c]/60 backdrop-blur-sm sm:items-center sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Founder's birthday wish"
      >
        <div className="relative w-full overflow-hidden rounded-t-[28px] border border-pink-100 bg-[#fff9fc] shadow-[0_24px_80px_rgba(100,20,60,0.25)] sm:max-w-[430px] sm:rounded-[28px]">
          <button
            type="button"
            onClick={closeModal}
            className="absolute right-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-rose-700 shadow-sm transition hover:scale-105 hover:bg-white"
            aria-label="Close birthday modal"
          >
            <X size={18} />
          </button>

          <div
            ref={scrollRef}
            className="bday-scroll max-h-[92dvh] overflow-y-auto overscroll-contain sm:max-h-[calc(100dvh-2rem)]"
          >
            {!submitted ? (
              <>
                <div className="relative overflow-hidden bg-gradient-to-br from-[#ffb8d4] via-[#ff89b7] to-[#e95b96] px-5 pb-5 pt-6 text-center text-[#641b42]">
                  <div className="absolute -left-12 -top-12 h-36 w-36 rounded-full bg-white/30 blur-2xl" />
                  <div className="absolute -bottom-14 -right-8 h-40 w-40 rounded-full bg-[#ffdeed]/60 blur-2xl" />

                  <Sparkles
                    size={19}
                    className="absolute left-6 top-7 text-white"
                  />

                  <Heart
                    size={16}
                    fill="currentColor"
                    className="absolute bottom-6 right-7 rotate-12 text-[#ffe3ee]"
                  />

                  <div className="relative mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-white text-[#df4d8a] shadow-[0_0_0_6px_rgba(255,255,255,0.23)]">
                    <Gift size={25} strokeWidth={1.7} />
                  </div>

                  <p className="relative text-[9px] font-bold uppercase tracking-[0.25em] text-[#7a2751]/75">
                    A little wish, a lovely gift
                  </p>

                  <h2 className="relative mt-1.5 text-[26px] font-extrabold leading-tight">
                    Wish Our Boss 🎂
                  </h2>

                  <p className="relative mx-auto mt-2 max-w-[290px] text-xs leading-5 text-[#702047]">
                    Send some birthday love and unwrap
                    <span className="font-bold"> 20% off</span> your order!
                  </p>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-3 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:px-6"
                >
                  <div>
                    <label
                      htmlFor="bday-name"
                      className={labelClassName}
                    >
                      Your name
                    </label>

                    <input
                      id="bday-name"
                      name="name"
                      type="text"
                      required
                      maxLength={80}
                      autoComplete="name"
                      value={form.name}
                      onChange={updateField}
                      placeholder="Your lovely name ✨"
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="bday-email"
                      className={labelClassName}
                    >
                      Email address
                    </label>

                    <input
                      id="bday-email"
                      name="email"
                      type="email"
                      required
                      maxLength={254}
                      autoComplete="email"
                      autoCapitalize="none"
                      spellCheck={false}
                      value={form.email}
                      onChange={updateField}
                      placeholder="Your little inbox 💌"
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="bday-phone"
                      className={labelClassName}
                    >
                      Phone number
                    </label>

                    <input
                      id="bday-phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      required
                      maxLength={20}
                      autoComplete="tel"
                      value={form.phone}
                      onChange={updateField}
                      placeholder="Your 10 digits, cutie 📱"
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label
                        htmlFor="bday-message"
                        className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8b3a61]"
                      >
                        Birthday message
                      </label>

                      <span className="text-[10px] text-[#b9859f]">
                        {form.message.length}/500
                      </span>
                    </div>

                    <textarea
                      id="bday-message"
                      name="message"
                      rows={3}
                      required
                      maxLength={500}
                      value={form.message}
                      onChange={updateField}
                      placeholder="A little birthday love for our boss... 🎂💕"
                      className="bday-scroll block w-full resize-none rounded-xl border border-pink-100 bg-[#fff0f6] px-3.5 py-2.5 text-base leading-6 text-[#571b38] outline-none transition placeholder:text-[12px] placeholder:text-[#b9859f] focus:border-pink-300 focus:bg-white focus:ring-2 focus:ring-pink-200 sm:text-sm"
                    />
                  </div>

                  {error && (
                    <p
                      role="alert"
                      className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600"
                    >
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#e84f8d] px-5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(232,79,141,0.25)] transition hover:bg-[#cf3977] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Sending your love...
                      </>
                    ) : (
                      <>
                        <Heart size={16} fill="currentColor" />
                        Send Love & Unlock 20% Off
                      </>
                    )}
                  </button>

                  <p className="text-center text-[10px] leading-4 text-[#aa7892]">
                    A sweet wish from you. A little treat from us. 💕
                  </p>
                </form>
              </>
            ) : (
              <div className="relative overflow-hidden px-5 pb-6 pt-10 text-center sm:px-7">
                <div className="absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 rounded-full bg-pink-200/70 blur-3xl" />

                <Sparkles
                  size={22}
                  className="absolute left-7 top-8 text-[#e45a96]"
                />

                <Heart
                  size={18}
                  fill="currentColor"
                  className="absolute right-8 top-14 rotate-12 text-[#f498bc]"
                />

                <div className="relative mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-[#ff91ba] to-[#e84f8d] text-white shadow-[0_0_0_8px_#ffe9f2]">
                  <Gift size={30} strokeWidth={1.6} />
                </div>

                <p className="relative mt-6 text-[10px] font-bold uppercase tracking-[0.28em] text-[#b67999]">
                  Wish received
                </p>

                <h2 className="relative mt-2 text-[28px] font-extrabold tracking-tight text-[#75264d]">
                  You made our day! 🥳
                </h2>

                <p className="relative mx-auto mt-3 max-w-xs text-sm leading-6 text-[#94627c]">
                  Thank you,{" "}
                  <span className="break-words font-bold text-[#75264d]">
                    {form.name.trim()}
                  </span>
                  ! Your lovely birthday wish has been sent.
                </p>

                <div className="relative mt-5 rounded-[24px] bg-[#ffe8f2] p-2">
                  <div className="rounded-[19px] border border-dashed border-[#eb91b7] bg-white px-4 py-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#b67999]">
                      Your 20% off coupon
                    </p>

                    <p className="mt-2 break-all text-2xl font-black tracking-[0.1em] text-[#c63573]">
                      {couponCode}
                    </p>

                    <button
                      type="button"
                      onClick={copyCoupon}
                      className={`mx-auto mt-4 flex h-10 items-center justify-center gap-2 rounded-full px-5 text-xs font-semibold text-white transition ${copied
                          ? "bg-emerald-600"
                          : "bg-[#e84f8d] hover:bg-[#cf3977]"
                        }`}
                    >
                      {copied ? (
                        <>
                          <Check size={15} />
                          Coupon Copied
                        </>
                      ) : (
                        <>
                          <Copy size={15} />
                          Copy My Little Gift
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <p className="relative mt-4 text-xs text-[#94627c]">
                  Apply this code at checkout to get flat 20% off.
                </p>

                {error && (
                  <p
                    role="alert"
                    className="relative mt-3 text-xs text-red-600"
                  >
                    {error}
                  </p>
                )}

                <button
                  type="button"
                  onClick={closeModal}
                  className="relative mt-5 min-h-12 w-full rounded-full bg-[#e84f8d] px-5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(232,79,141,0.25)] transition hover:bg-[#cf3977] active:scale-[0.98]"
                >
                  Let’s Go Shopping 💕
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .bday-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .bday-scroll::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
      `}</style>
    </>
  );
}
