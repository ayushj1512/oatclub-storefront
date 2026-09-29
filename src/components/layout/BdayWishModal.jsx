"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Gift, Heart, Sparkles, X } from "lucide-react";
import useBdayStore from "@/store/bdaystore";

const COUPON_CODE = "BOSSBDAY20";

export default function BdayWishModal() {
  const { createWish, loading } = useBdayStore();

  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", message: "" });

  useEffect(() => {
    const handleOpenBdayModal = () => {
      setSubmitted(false);
      setCopied(false);
      setError("");
      setOpen(true);
    };

    window.addEventListener("open-bday-wish-modal", handleOpenBdayModal);

    const dismissed = sessionStorage.getItem("bday-wish-dismissed");
    let timer;

    if (!dismissed) {
      timer = window.setTimeout(() => setOpen(true), 1200);
    }

    return () => {
      if (timer) window.clearTimeout(timer);
      window.removeEventListener("open-bday-wish-modal", handleOpenBdayModal);
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const closeModal = () => {
    sessionStorage.setItem("bday-wish-dismissed", "true");
    setOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const name = form.name.trim();
    const message = form.message.trim();

    if (!name || !message) {
      setError("Please enter your name and a birthday wish.");
      return;
    }

    try {
      await createWish({ name, message });
      setSubmitted(true);
    } catch (err) {
      setError(err?.message || "Unable to submit your wish.");
    }
  };

  const copyCoupon = async () => {
    try {
      await navigator.clipboard.writeText(COUPON_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Please copy the coupon code manually.");
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center bg-[#44152c]/60 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-label="Founder's birthday wish"
    >
      <div className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-[30px] border border-pink-100 bg-[#fff9fc] shadow-[0_24px_80px_rgba(100,20,60,0.25)] sm:max-w-[430px] sm:rounded-[30px]">
        <button
          type="button"
          onClick={closeModal}
          className="absolute right-4 top-4 z-20 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-rose-700 shadow-sm transition hover:scale-105 hover:bg-white"
          aria-label="Close birthday modal"
        >
          <X size={18} />
        </button>

        {!submitted ? (
          <>
            <div className="relative overflow-hidden bg-gradient-to-br from-[#ffb8d4] via-[#ff89b7] to-[#e95b96] px-6 pb-9 pt-10 text-center text-[#641b42]">
              <div className="absolute -left-12 -top-12 h-36 w-36 rounded-full bg-white/30 blur-2xl" />
              <div className="absolute -bottom-14 -right-8 h-40 w-40 rounded-full bg-[#ffdeed]/60 blur-2xl" />

              <Sparkles
                size={22}
                className="absolute left-7 top-8 text-white"
              />
              <Heart
                size={18}
                fill="currentColor"
                className="absolute bottom-8 right-8 rotate-12 text-[#ffe3ee]"
              />
              <Sparkles
                size={14}
                className="absolute right-14 top-24 text-[#fff2f8]"
              />

              <div className="relative mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-white text-[#df4d8a] shadow-[0_0_0_8px_rgba(255,255,255,0.23)]">
                <Gift size={30} strokeWidth={1.7} />
              </div>

              <p className="relative text-[10px] font-bold uppercase tracking-[0.3em] text-[#7a2751]/75">
                A special celebration
              </p>

              <h2 className="relative mt-2 text-[28px] font-extrabold leading-tight sm:text-3xl">
                Wish Our Boss <span className="inline-block">🎂</span>
              </h2>

              <p className="relative mx-auto mt-3 max-w-xs text-sm leading-6 text-[#702047]">
                Send a sweet birthday wish and unlock a little gift from us:
                20% off your order!
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 px-5 py-6 sm:px-7">
              <div>
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#8b3a61]">
                  Your name
                </label>
                <input
                  type="text"
                  maxLength={80}
                  autoComplete="name"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="What should we call you?"
                  className="h-12 w-full rounded-2xl border border-pink-100 bg-[#fff0f6] px-4 text-sm text-[#571b38] outline-none transition placeholder:text-[#b9859f] focus:border-pink-300 focus:bg-white focus:ring-2 focus:ring-pink-200"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8b3a61]">
                    Birthday message
                  </label>
                  <span className="text-[10px] text-[#b9859f]">
                    {form.message.length}/500
                  </span>
                </div>

                <textarea
                  rows={4}
                  maxLength={500}
                  value={form.message}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      message: event.target.value,
                    }))
                  }
                  placeholder="Write a sweet birthday wish..."
                  className="w-full resize-none rounded-2xl border border-pink-100 bg-[#fff0f6] px-4 py-3 text-sm leading-6 text-[#571b38] outline-none transition placeholder:text-[#b9859f] focus:border-pink-300 focus:bg-white focus:ring-2 focus:ring-pink-200"
                />
              </div>

              {error && (
                <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#e84f8d] px-5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(232,79,141,0.25)] transition hover:bg-[#cf3977] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Sending your wish...
                  </>
                ) : (
                  <>
                    <Heart size={17} fill="currentColor" />
                    Send Birthday Wish
                  </>
                )}
              </button>

              <p className="text-center text-[11px] leading-5 text-[#aa7892]">
                Your special 20% off coupon unlocks after you send your wish.
              </p>
            </form>
          </>
        ) : (
          <div className="relative overflow-hidden px-5 pb-7 pt-12 text-center sm:px-8 sm:pb-8">
            <div className="absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 rounded-full bg-pink-200/70 blur-3xl" />

            <Sparkles
              size={22}
              className="absolute left-7 top-8 text-[#e45a96]"
            />
            <Heart
              size={18}
              fill="currentColor"
              className="absolute right-8 top-12 rotate-12 text-[#f498bc]"
            />
            <Sparkles
              size={16}
              className="absolute right-14 top-28 text-[#c875ab]"
            />

            <div className="relative mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-[#ff91ba] to-[#e84f8d] text-white shadow-[0_0_0_10px_#ffe9f2]">
              <Gift size={36} strokeWidth={1.6} />
            </div>

            <p className="relative mt-7 text-[10px] font-bold uppercase tracking-[0.28em] text-[#b67999]">
              Wish received
            </p>

            <h2 className="relative mt-2 text-3xl font-extrabold tracking-tight text-[#75264d]">
              You made our day! 🥳
            </h2>

            <p className="relative mx-auto mt-3 max-w-xs text-sm leading-6 text-[#94627c]">
              Thank you,{" "}
              <span className="font-bold text-[#75264d]">
                {form.name.trim()}
              </span>
              ! Your lovely birthday wish has been sent.
            </p>

            <div className="relative mt-7 rounded-[24px] bg-[#ffe8f2] p-2">
              <div className="rounded-[19px] border border-dashed border-[#eb91b7] bg-white px-4 py-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#b67999]">
                  Your 20% off coupon
                </p>

                <p className="mt-2 break-all text-2xl font-black tracking-[0.1em] text-[#c63573] sm:text-[28px]">
                  {COUPON_CODE}
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
                      Copy Coupon
                    </>
                  )}
                </button>
              </div>
            </div>

            <p className="mt-4 text-xs text-[#94627c]">
              Apply this code at checkout to get flat 20% off.
            </p>

            {error && (
              <p className="mt-3 text-xs text-red-600">{error}</p>
            )}

            <button
              type="button"
              onClick={closeModal}
              className="mt-6 min-h-[52px] w-full rounded-full bg-[#e84f8d] px-5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(232,79,141,0.25)] transition hover:bg-[#cf3977] active:scale-[0.98]"
            >
              Start Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
