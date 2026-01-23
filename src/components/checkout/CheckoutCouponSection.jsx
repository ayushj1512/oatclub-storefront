"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Tag, X, Loader2 } from "lucide-react";
import { useCouponStore } from "@/store/couponStore";

const money = (n) => (Number.isFinite(+n) ? (+n).toLocaleString("en-IN") : "0");
const couponLabel = (c) =>
  !c
    ? ""
    : c.discountType === "percentage"
    ? `${c.discountValue}% OFF`
    : `₹${money(c.discountValue)} OFF`;

const isValidEmail = (v) => {
  const s = String(v || "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
};

export default function CheckoutCouponSection({ cartTotal, email, phone, customerId }) {
  const pathname = usePathname();

  const [code, setCode] = useState("");
  const [clicked, setClicked] = useState("");
  const [step1Error, setStep1Error] = useState("");

  const {
    coupon,
    discount,
    isApplying,
    error,
    message,
    applyCoupon,
    clearCouponMessages,
    rehydrateCoupon,
    clearPersistedCoupon,
    suggestedCoupons,
    isLoadingSuggestions,
    suggestionError,
    fetchSuggestedCoupons,
  } = useCouponStore();

  const hasCoupon = !!coupon?.code;
  const saved = useMemo(() => Math.max(0, +discount || 0), [discount]);
  const emailOk = useMemo(() => isValidEmail(email), [email]);

  const load = useCallback(() => {
    if (!hasCoupon && cartTotal > 0) fetchSuggestedCoupons({ cartTotal });
  }, [hasCoupon, cartTotal, fetchSuggestedCoupons]);

  // ✅ Refresh UI + rehydrate + refresh suggestions when route/page changes
  useEffect(() => {
    // reset local UI states (so stale error/code doesn't carry to next step)
    setCode("");
    setClicked("");
    setStep1Error("");

    // clear store messages too (success/error banners)
    clearCouponMessages?.();

    // if coupon exists & cart total is valid and email ok => revalidate it
    if (hasCoupon && cartTotal > 0 && emailOk) {
      rehydrateCoupon?.({ cartTotal, email, phone, customerId });
      return;
    }

    // else: load suggestions for current cart total
    load();
  }, [
    pathname, // ✅ key: page change trigger
    hasCoupon,
    cartTotal,
    emailOk,
    email,
    phone,
    customerId,
    rehydrateCoupon,
    load,
    clearCouponMessages,
  ]);

  // ✅ keep earlier behavior: if coupon is applied but cart becomes empty -> clear
  useEffect(() => {
    if (hasCoupon && !(cartTotal > 0)) clearPersistedCoupon?.();
  }, [hasCoupon, cartTotal, clearPersistedCoupon]);

  // ✅ Auto-validate/rehydrate when email/phone/customerId changes (after user types email)
  useEffect(() => {
    if (step1Error && emailOk) setStep1Error("");
    if (!hasCoupon || !(cartTotal > 0) || !emailOk) return;
    rehydrateCoupon?.({ cartTotal, email, phone, customerId });
  }, [hasCoupon, cartTotal, email, phone, customerId, rehydrateCoupon, emailOk, step1Error]);

  const onApply = async (v = code) => {
    const c = String(v || "").trim().toUpperCase();
    if (!c || isApplying) return;

    if (!emailOk) {
      setStep1Error("Please enter email");
      return;
    }

    try {
      setStep1Error("");
      clearCouponMessages?.();
      setClicked(c);

      await applyCoupon({
        code: c,
        cartTotal,
        email,
        phone,
        customerId,
      });

      setCode("");
    } finally {
      setClicked("");
    }
  };

  const onRemove = async () => {
    clearCouponMessages?.();
    setStep1Error("");
    setCode("");
    await clearPersistedCoupon?.();
    setTimeout(load, 50);
  };

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-xl bg-black/5 text-gray-800">
            <Tag className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-semibold text-gray-900">Coupons</p>
            <p className="text-[11px] text-gray-500">Apply code to get discount</p>
          </div>
        </div>

        {!hasCoupon && (
          <button
            type="button"
            onClick={load}
            className="text-[11px] font-semibold text-gray-600 transition hover:text-black"
          >
            Refresh
          </button>
        )}
      </div>

      {/* ✅ Step-1 Email warning */}
      {!emailOk ? (
        <p className="text-[11px] text-amber-700">Enter email in Step 1 to apply coupon.</p>
      ) : null}

      {hasCoupon ? (
        <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-3 py-2">
          <div>
            <p className="text-xs font-semibold text-green-800">{coupon.code} applied ✅</p>
            <p className="text-[11px] text-green-700">
              Saved <b>₹{money(saved)}</b>
            </p>
          </div>

          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove coupon"
            className="grid h-8 w-8 place-items-center rounded-full bg-black/5 transition hover:bg-black/10"
          >
            <X className="h-4 w-4 text-gray-900" />
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <input
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                if (step1Error) setStep1Error("");
              }}
              placeholder="Enter code"
              className="flex-1 rounded-xl bg-white px-3 py-2 text-xs outline-none shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)] transition focus:shadow-[inset_0_0_0_2px_rgba(0,0,0,0.18)]"
            />

            <button
              type="button"
              disabled={isApplying || !code.trim() || !emailOk}
              onClick={() => onApply()}
              className="inline-flex items-center justify-center rounded-xl bg-black px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:bg-black/20 disabled:text-black/40"
              title={!emailOk ? "Please enter email" : undefined}
            >
              {isApplying && clicked === code.trim().toUpperCase() ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Apply"
              )}
            </button>
          </div>

          <div className="space-y-2">
            {step1Error ? <p className="text-[11px] text-red-600">{step1Error}</p> : null}

            {isLoadingSuggestions ? (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </div>
            ) : suggestionError ? (
              <p className="text-xs text-red-600">{suggestionError}</p>
            ) : suggestedCoupons?.length ? (
              <div className="flex flex-wrap gap-2">
                {suggestedCoupons.map((c) => {
                  const cc = String(c.code || "").toUpperCase();
                  const spin = isApplying && clicked === cc;

                  return (
                    <button
                      key={c._id || cc}
                      type="button"
                      disabled={isApplying || !emailOk}
                      onClick={() => onApply(cc)}
                      className="rounded-xl border border-black/10 bg-white px-3 py-2 text-[11px] font-semibold text-gray-900 transition hover:bg-black hover:text-white disabled:opacity-60"
                      title={!emailOk ? "Please enter email" : undefined}
                    >
                      <span className="inline-flex items-center gap-1">
                        {spin ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                        {cc}
                      </span>
                      <span className="ml-1 font-medium opacity-70">{couponLabel(c)}</span>
                      {+c.minPurchase > 0 && (
                        <span className="ml-2 opacity-60">Min ₹{money(c.minPurchase)}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-[11px] text-gray-500">No coupons available</p>
            )}

            {error && <p className="text-[11px] text-red-600">{error}</p>}
            {message && <p className="text-[11px] text-green-700">{message}</p>}
          </div>
        </>
      )}
    </div>
  );
}
