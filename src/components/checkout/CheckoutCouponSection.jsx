"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Loader2, RefreshCw, Tag, X } from "lucide-react";

import { useCouponStore } from "@/store/couponStore";
import useGtmStore from "@/store/gtmStore";

/* =========================================================
   HELPERS
========================================================= */

const money = (value) =>
  Number.isFinite(Number(value))
    ? Number(value).toLocaleString("en-IN")
    : "0";

const couponLabel = (coupon) =>
  coupon?.discountType === "percentage"
    ? `${coupon.discountValue}% OFF`
    : `₹${money(coupon?.discountValue)} OFF`;

const isValidEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    String(value || "").trim()
  );

const isPublic = (coupon) =>
  String(coupon?.visibility || "public").toLowerCase() !==
  "private";

const getCouponMeta = (coupon) => {
  const eligibility = coupon?._eligibility || {};
  const description = String(
    coupon?.description || ""
  ).trim();

  const eligible =
    eligibility.isEligible !== undefined
      ? Boolean(eligibility.isEligible)
      : eligibility.okDate !== false &&
        eligibility.okMin !== false &&
        eligibility.okQty !== false;

  if (eligible) {
    return {
      eligible: true,
      text: description || "Tap to apply this coupon",
    };
  }

  if (eligibility.okDate === false) {
    return {
      eligible: false,
      text: description || "Coupon expired",
    };
  }

  if (eligibility.okMin === false) {
    return {
      eligible: false,
      text:
        description ||
        `Minimum order ₹${money(coupon?.minPurchase)}`,
    };
  }

  if (
    eligibility.okQty === false &&
    Number(eligibility.remainingQty || 0) > 0
  ) {
    const remainingQty = Number(
      eligibility.remainingQty || 0
    );

    return {
      eligible: false,
      text:
        description ||
        `Add ${remainingQty} more item${
          remainingQty > 1 ? "s" : ""
        }`,
    };
  }

  return {
    eligible: false,
    text: description || "Coupon locked",
  };
};

/* =========================================================
   COMPONENT
========================================================= */

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

  const saved = useMemo(
    () => Math.max(0, Number(discount || 0)),
    [discount]
  );

  const emailOk = useMemo(
    () => isValidEmail(email),
    [email]
  );

  const publicCoupons = useMemo(() => {
    if (!Array.isArray(suggestedCoupons)) {
      return [];
    }

    return suggestedCoupons.filter(isPublic);
  }, [suggestedCoupons]);

  /* =========================================================
     LOAD SUGGESTIONS
  ========================================================= */

  const loadSuggestions = useCallback(() => {
    if (hasCoupon || !(cartTotal > 0)) {
      return;
    }

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

  /* =========================================================
     INITIALIZE
  ========================================================= */

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
  }, [
    hasCoupon,
    cartTotal,
    clearPersistedCoupon,
  ]);

  /* =========================================================
     APPLY COUPON
  ========================================================= */

  const onApply = async (value = code) => {
    const nextCode = String(value || "")
      .trim()
      .toUpperCase();

    if (!nextCode || isApplying) {
      return;
    }

    if (!emailOk) {
      setStepError("Enter email to apply coupon");
      return;
    }

    try {
      setStepError("");
      setClicked(nextCode);

      clearCouponMessages?.();

      const response = await applyCoupon({
        code: nextCode,
        cartTotal,
        cartItems,
        email,
        phone,
        customerId,
      });

      const state = useCouponStore.getState();

      const appliedCoupon =
        state.coupon || response?.coupon || null;

      const appliedDiscount =
        Number(
          state.discount ?? response?.discount ?? 0
        ) || 0;

      if (
        appliedCoupon?.code ||
        appliedDiscount > 0
      ) {
        useGtmStore.getState().couponApplied({
          code: appliedCoupon?.code || nextCode,
          discount: appliedDiscount,
        });
      }

      setCode("");
    } catch (applyError) {
      console.warn(
        "Coupon apply failed:",
        applyError
      );
    } finally {
      setClicked("");
    }
  };

  /* =========================================================
     REMOVE COUPON
  ========================================================= */

  const onRemove = async () => {
    clearCouponMessages?.();

    setStepError("");
    setCode("");

    await clearPersistedCoupon?.();

    setTimeout(loadSuggestions, 50);
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <section className="mt-3 space-y-2.5">
      <style jsx>{`
        .coupon-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .coupon-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
            <Tag className="size-3.5" />
          </span>

          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase leading-none tracking-[0.08em] text-black">
              Coupons
            </p>

            <p className="mt-1 text-[10px] font-medium leading-none text-neutral-500">
              Pick an eligible offer
            </p>
          </div>
        </div>

        {!hasCoupon && (
          <button
            type="button"
            onClick={loadSuggestions}
            disabled={isLoadingSuggestions}
            className="inline-flex shrink-0 items-center gap-1 text-[9px] font-bold uppercase tracking-wide text-emerald-700 transition hover:text-emerald-900 disabled:opacity-40"
          >
            <RefreshCw
              className={`size-3 ${
                isLoadingSuggestions
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh
          </button>
        )}
      </div>

      {!emailOk && !hasCoupon && (
        <p className="rounded-lg bg-neutral-100 px-2.5 py-1.5 text-[10px] font-semibold text-neutral-600">
          Enter your email to apply a coupon.
        </p>
      )}

      {hasCoupon ? (
        /* Applied Coupon */
        <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
              <Tag className="size-3.5" />
            </span>

            <div className="min-w-0">
              <p className="truncate text-[12px] font-black uppercase tracking-wide text-emerald-950">
                {coupon.code} Applied
              </p>

              <p className="mt-0.5 text-[10px] font-semibold text-emerald-700">
                You saved ₹{money(saved)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove coupon"
            className="grid size-7 shrink-0 place-items-center rounded-lg border border-emerald-200 bg-white text-emerald-800 transition hover:border-emerald-400"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ) : (
        <>
          {/* Manual Code */}
          <div className="flex items-center gap-2">
            <input
              value={code}
              onChange={(event) => {
                setCode(
                  event.target.value.toUpperCase()
                );

                if (stepError) {
                  setStepError("");
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  onApply();
                }
              }}
              placeholder="ENTER CODE"
              className="h-9 min-w-0 flex-1 rounded-lg border border-neutral-200 bg-white px-3 text-[11px] font-bold uppercase tracking-wide outline-none transition placeholder:text-neutral-300 focus:border-emerald-500"
            />

            <button
              type="button"
              disabled={
                isApplying ||
                !code.trim() ||
                !emailOk
              }
              onClick={() => onApply()}
              className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg bg-emerald-700 px-3.5 text-[9px] font-black uppercase tracking-[0.1em] text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
            >
              {isApplying &&
              clicked ===
                code.trim().toUpperCase() ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                "Apply"
              )}
            </button>
          </div>

          {stepError && (
            <p className="text-[10px] font-semibold text-red-600">
              {stepError}
            </p>
          )}

          {isLoadingSuggestions ? (
            <div className="flex items-center gap-1.5 py-1 text-[10px] font-semibold text-neutral-500">
              <Loader2 className="size-3.5 animate-spin" />
              Loading coupons...
            </div>
          ) : suggestionError ? (
            <p className="text-[10px] font-semibold text-red-600">
              {suggestionError}
            </p>
          ) : publicCoupons.length > 0 ? (
            /* Coupon Cards */
            <div className="coupon-scroll -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {publicCoupons.map((item) => {
                const couponCode = String(
                  item?.code || ""
                ).toUpperCase();

                const loading =
                  isApplying &&
                  clicked === couponCode;

                const { eligible, text } =
                  getCouponMeta(item);

                return (
                  <button
                    key={
                      item?._id || couponCode
                    }
                    type="button"
                    disabled={
                      isApplying ||
                      !emailOk ||
                      !eligible
                    }
                    onClick={() =>
                      onApply(couponCode)
                    }
                    className={[
                      "w-[142px] shrink-0 rounded-xl border p-2.5 text-left transition duration-200",
                      eligible
                        ? "border-emerald-200 bg-emerald-50 text-emerald-950 hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-sm"
                        : "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400 opacity-75",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="min-w-0 truncate text-[12px] font-black uppercase tracking-[0.06em]">
                        {couponCode}
                      </span>

                      <span
                        className={[
                          "grid size-5 shrink-0 place-items-center rounded-md",
                          eligible
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-neutral-200 text-neutral-400",
                        ].join(" ")}
                      >
                        {loading ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <Tag className="size-3" />
                        )}
                      </span>
                    </div>

                    <p className="mt-1.5 truncate text-[12px] font-extrabold uppercase leading-tight">
                      {couponLabel(item)}
                    </p>

                    <p className="mt-1 line-clamp-2 text-[10px] font-semibold leading-[1.35] opacity-75">
                      {text}
                    </p>

                    {eligible && (
                      <p className="mt-1.5 text-[9px] font-black uppercase tracking-wide text-emerald-700">
                        Tap to apply
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="py-1 text-[10px] font-medium text-neutral-500">
              No coupons available.
            </p>
          )}

          {error && (
            <p className="rounded-lg bg-red-50 px-2.5 py-1.5 text-[10px] font-semibold text-red-600">
              {error}
            </p>
          )}

          {message && (
            <p className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[10px] font-semibold text-emerald-700">
              {message}
            </p>
          )}
        </>
      )}
    </section>
  );
}