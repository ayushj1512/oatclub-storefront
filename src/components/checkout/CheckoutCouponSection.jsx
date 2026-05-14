"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Loader2, Tag, X } from "lucide-react";
import { useCouponStore } from "@/store/couponStore";
import useGtmStore from "@/store/gtmStore";

const money = (n) => (Number.isFinite(+n) ? (+n).toLocaleString("en-IN") : "0");

const couponLabel = (c) =>
  c?.discountType === "percentage"
    ? `${c.discountValue}% OFF`
    : `₹${money(c?.discountValue)} OFF`;

const isValidEmail = (v) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());

const isPublic = (c) =>
  String(c?.visibility || "public").toLowerCase() !== "private";

const getCouponMeta = (coupon) => {
  const e = coupon?._eligibility || {};
  const desc = String(coupon?.description || "").trim();

  const eligible =
    e.isEligible !== undefined
      ? Boolean(e.isEligible)
      : e.okDate !== false && e.okMin !== false && e.okQty !== false;

  if (eligible) {
    return {
      eligible: true,
      text: desc || "Tap to apply",
    };
  }

  if (e.okDate === false) {
    return {
      eligible: false,
      text: desc || "Expired",
    };
  }

  if (e.okMin === false) {
    return {
      eligible: false,
      text: desc || `Min ₹${money(coupon.minPurchase)}`,
    };
  }

  if (e.okQty === false && Number(e.remainingQty || 0) > 0) {
    const qty = Number(e.remainingQty || 0);
    return {
      eligible: false,
      text:
        desc ||
        `Add ${qty} more item${qty > 1 ? "s" : ""} to unlock ${couponLabel(
          coupon
        ).toLowerCase()}`,
    };
  }

  return {
    eligible: false,
    text: desc || "Locked",
  };
};

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

  const publicCoupons = useMemo(
    () =>
      Array.isArray(suggestedCoupons)
        ? suggestedCoupons.filter(isPublic)
        : [],
    [suggestedCoupons]
  );

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
    if (hasCoupon && !(cartTotal > 0)) clearPersistedCoupon?.();
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

      const res = await applyCoupon({
        code: nextCode,
        cartTotal,
        cartItems,
        email,
        phone,
        customerId,
      });

      const state = useCouponStore.getState();
      const appliedCoupon = state.coupon || res?.coupon || null;
      const appliedDiscount = Number(state.discount ?? res?.discount ?? 0) || 0;

      if (appliedCoupon?.code || appliedDiscount > 0) {
        useGtmStore.getState().couponApplied({
          code: appliedCoupon?.code || nextCode,
          discount: appliedDiscount,
        });
      }

      setCode("");
    } catch (e) {
      console.warn("coupon apply failed", e);
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
            {stepError && <p className="text-[11px] text-red-600">{stepError}</p>}

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
                  const { eligible, text } = getCouponMeta(item);

                  return (
                    <button
                      key={item._id || couponCode}
                      type="button"
                      disabled={isApplying || !emailOk || !eligible}
                      onClick={() => onApply(couponCode)}
                      className={[
                        "rounded-xl px-3 py-2 text-left text-[11px] font-semibold transition",
                        "max-w-[210px]",
                        eligible
                          ? "bg-green-50 text-green-800 shadow-[inset_0_0_0_1px_rgba(22,163,74,0.22)] hover:bg-green-600 hover:text-white"
                          : "cursor-not-allowed bg-zinc-100 text-zinc-500 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]",
                      ].join(" ")}
                    >
                      <span className="flex items-center gap-1">
                        {spin && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        <span>{couponCode}</span>
                        <span className="font-medium opacity-75">
                          {couponLabel(item)}
                        </span>
                      </span>

                      <span
                        className={[
                          "mt-0.5 block truncate text-[10px] font-medium",
                          eligible ? "opacity-60" : "text-zinc-400",
                        ].join(" ")}
                      >
                        {text}
                      </span>
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