"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Loader2, Tag, X } from "lucide-react";
import { useCouponStore } from "@/store/couponStore";

const money = (n) => (Number.isFinite(+n) ? (+n).toLocaleString("en-IN") : "0");

const couponLabel = (c) => {
  if (!c) return "";
  return c.discountType === "percentage"
    ? `${c.discountValue}% OFF`
    : `₹${money(c.discountValue)} OFF`;
};

const isValidEmail = (v) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());

const isPublic = (c) =>
  String(c?.visibility || "public").toLowerCase() !== "private";

export default function CheckoutCouponSection({
  cartTotal,
  cartItems = [],
  email,
  phone,
  customerId,
}) {
  const pathname = usePathname();

  const [code, setCode] = useState("");
  const [clicked, setClicked] = useState("");
  const [stepError, setStepError] = useState("");

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

  const hasCoupon = Boolean(coupon?.code);
  const saved = useMemo(() => Math.max(0, Number(discount || 0)), [discount]);
  const emailOk = useMemo(() => isValidEmail(email), [email]);

  const loadSuggestions = useCallback(() => {
    if (hasCoupon || !(cartTotal > 0)) return;

    fetchSuggestedCoupons?.({
      cartTotal,
      cartItems,
      email,
      phone,
      customerId,
    });
  }, [
    hasCoupon,
    cartTotal,
    cartItems,
    email,
    phone,
    customerId,
    fetchSuggestedCoupons,
  ]);

  const publicCoupons = useMemo(() => {
    return Array.isArray(suggestedCoupons)
      ? suggestedCoupons.filter(isPublic)
      : [];
  }, [suggestedCoupons]);

  useEffect(() => {
    setCode("");
    setClicked("");
    setStepError("");
    clearCouponMessages?.();

    if (hasCoupon && cartTotal > 0 && emailOk) {
      rehydrateCoupon?.({
        cartTotal,
        cartItems,
        email,
        phone,
        customerId,
      });
      return;
    }

    loadSuggestions();
  }, [
    pathname,
    hasCoupon,
    cartTotal,
    cartItems,
    emailOk,
    email,
    phone,
    customerId,
    rehydrateCoupon,
    loadSuggestions,
    clearCouponMessages,
  ]);

  useEffect(() => {
    if (hasCoupon && !(cartTotal > 0)) {
      clearPersistedCoupon?.();
    }
  }, [hasCoupon, cartTotal, clearPersistedCoupon]);

  const onApply = async (value = code) => {
    const nextCode = String(value || "").trim().toUpperCase();
    if (!nextCode || isApplying) return;

    if (!emailOk) {
      setStepError("Please enter email");
      return;
    }

    try {
      setStepError("");
      clearCouponMessages?.();
      setClicked(nextCode);

      await applyCoupon({
        code: nextCode,
        cartTotal,
        cartItems,
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
    setStepError("");
    setCode("");
    await clearPersistedCoupon?.();
    setTimeout(loadSuggestions, 50);
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
            <p className="text-[11px] text-gray-500">
              Apply code to get discount
            </p>
          </div>
        </div>

        {!hasCoupon && (
          <button
            type="button"
            onClick={loadSuggestions}
            className="text-[11px] font-semibold text-gray-600 transition hover:text-black"
          >
            Refresh
          </button>
        )}
      </div>

      {!emailOk && (
        <p className="text-[11px] text-amber-700">
          Enter email in Step 1 to apply coupon.
        </p>
      )}

      {hasCoupon ? (
        <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-3 py-2">
          <div>
            <p className="text-xs font-semibold text-green-800">
              {coupon.code} applied ✅
            </p>
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
                if (stepError) setStepError("");
              }}
              placeholder="Enter code"
              className="flex-1 rounded-xl bg-white px-3 py-2 text-xs outline-none shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)] transition focus:shadow-[inset_0_0_0_2px_rgba(0,0,0,0.18)]"
            />

            <button
              type="button"
              disabled={isApplying || !code.trim() || !emailOk}
              onClick={() => onApply()}
              className="inline-flex items-center justify-center rounded-xl bg-black px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:bg-black/20 disabled:text-black/40"
            >
              {isApplying && clicked === code.trim().toUpperCase() ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Apply"
              )}
            </button>
          </div>

          <div className="space-y-2">
            {stepError && (
              <p className="text-[11px] text-red-600">{stepError}</p>
            )}

            {isLoadingSuggestions ? (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </div>
            ) : suggestionError ? (
              <p className="text-xs text-red-600">{suggestionError}</p>
            ) : publicCoupons.length ? (
              <div className="flex flex-wrap gap-2">
                {publicCoupons.map((item) => {
                  const couponCode = String(item.code || "").toUpperCase();
                  const spin = isApplying && clicked === couponCode;

                  return (
                    <button
                      key={item._id || couponCode}
                      type="button"
                      disabled={isApplying || !emailOk}
                      onClick={() => onApply(couponCode)}
                      className="rounded-xl border border-black/10 bg-white px-3 py-2 text-[11px] font-semibold text-gray-900 transition hover:bg-black hover:text-white disabled:opacity-60"
                    >
                      <span className="inline-flex items-center gap-1">
                        {spin && (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        )}
                        {couponCode}
                      </span>

                      <span className="ml-1 font-medium opacity-70">
                        {couponLabel(item)}
                      </span>

                      {Number(item.minPurchase || 0) > 0 && (
                        <span className="ml-2 opacity-60">
                          Min ₹{money(item.minPurchase)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-[11px] text-gray-500">
                No public coupons available
              </p>
            )}

            {error && <p className="text-[11px] text-red-600">{error}</p>}
            {message && <p className="text-[11px] text-green-700">{message}</p>}
          </div>
        </>
      )}
    </div>
  );
}