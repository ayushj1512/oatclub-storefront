"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { Tag, X, Loader2 } from "lucide-react";
import { useCouponStore } from "@/store/couponStore";

const money = (n) =>
  Number.isFinite(Number(n)) ? Number(n).toLocaleString("en-IN") : "0";

const couponLabel = (c) => {
  if (!c) return "";
  if (c.discountType === "percentage") return `${c.discountValue}% OFF`;
  return `₹${money(c.discountValue)} OFF`;
};

export default function CheckoutCouponSection({ cartTotal }) {
  const [code, setCode] = useState("");
  const [clickedCode, setClickedCode] = useState(null);

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
  const customerId = "guest";

  const loadSuggestions = useCallback(() => {
    if (cartTotal == null || cartTotal <= 0 || hasCoupon) return;
    fetchSuggestedCoupons({ customerId, cartTotal });
  }, [cartTotal, fetchSuggestedCoupons, hasCoupon]);

  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  useEffect(() => {
    if (hasCoupon && (!cartTotal || cartTotal <= 0)) {
      clearPersistedCoupon?.();
    }
  }, [hasCoupon, cartTotal, clearPersistedCoupon]);

  useEffect(() => {
    if (hasCoupon && cartTotal > 0 && Number(discount || 0) === 0) {
      rehydrateCoupon?.({ customerId, cartTotal });
    }
  }, [hasCoupon, cartTotal, discount, rehydrateCoupon]);

  const onApply = async (applyCode = code) => {
    const finalCode = String(applyCode || "").trim();
    if (!finalCode || isApplying) return;

    try {
      clearCouponMessages?.();
      const formatted = finalCode.toUpperCase();
      setClickedCode(formatted);

      await applyCoupon({
        code: formatted,
        customerId,
        cartTotal,
      });

      setCode("");
      setClickedCode(null);
    } catch {
      setClickedCode(null);
    }
  };

  const onRemove = async () => {
    clearCouponMessages?.();
    setCode("");
    await clearPersistedCoupon?.();
    setTimeout(() => loadSuggestions(), 50);
  };

  const displayDiscount = useMemo(
    () => Math.max(0, Number(discount || 0)),
    [discount]
  );

  return (
    <div className="mt-3 space-y-2">
      {/* Header - compact */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid place-items-center size-8 rounded-xl bg-black/5 text-gray-800">
            <Tag className="w-4 h-4" />
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
            className="text-[11px] font-semibold text-gray-600 hover:text-black transition"
          >
            Refresh
          </button>
        )}
      </div>

      {/* Applied Coupon - looks like totals row */}
      {hasCoupon ? (
        <div className="flex items-center justify-between rounded-xl bg-green-50 border border-green-200 px-3 py-2">
          <div>
            <p className="text-xs font-semibold text-green-800">
              {coupon.code} applied ✅
            </p>
            <p className="text-[11px] text-green-700">
              Saved <b>₹{money(displayDiscount)}</b>
            </p>
          </div>

          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove coupon"
            className="grid place-items-center w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 transition"
          >
            <X className="w-4 h-4 text-gray-900" />
          </button>
        </div>
      ) : (
        <>
          {/* Input row - matches summary */}
          <div className="flex items-center gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter code"
              className="flex-1 rounded-xl bg-white px-3 py-2 text-xs outline-none shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)] focus:shadow-[inset_0_0_0_2px_rgba(0,0,0,0.18)] transition"
            />

            <button
              type="button"
              disabled={isApplying || !code.trim()}
              onClick={() => onApply()}
              className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-xs font-semibold text-white bg-black hover:opacity-90 transition disabled:bg-black/20 disabled:text-black/40"
            >
              {isApplying && clickedCode === code.trim().toUpperCase() ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Apply"
              )}
            </button>
          </div>

          {/* Suggested Coupons - compact pills */}
          <div className="space-y-2">
            {isLoadingSuggestions ? (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </div>
            ) : suggestionError ? (
              <p className="text-xs text-red-600">{suggestionError}</p>
            ) : suggestedCoupons?.length ? (
              <div className="flex flex-wrap gap-2">
                {suggestedCoupons.map((c) => {
                  const isThisApplying = isApplying && clickedCode === c.code;

                  return (
                    <button
                      key={c._id || c.code}
                      type="button"
                      disabled={isApplying}
                      onClick={() => onApply(c.code)}
                      className="px-3 py-2 rounded-xl bg-white border border-black/10 text-[11px] font-semibold text-gray-900 hover:bg-black hover:text-white transition disabled:opacity-60"
                    >
                      <span className="inline-flex items-center gap-1">
                        {isThisApplying ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : null}
                        {c.code}
                      </span>

                      <span className="ml-1 font-medium opacity-70">
                        {couponLabel(c)}
                      </span>

                      {c.minPurchase > 0 && (
                        <span className="ml-2 opacity-60">
                          Min ₹{money(c.minPurchase)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-[11px] text-gray-500">No coupons available</p>
            )}

            {/* Messages */}
            {error && <p className="text-[11px] text-red-600">{error}</p>}
            {message && <p className="text-[11px] text-green-700">{message}</p>}
          </div>
        </>
      )}
    </div>
  );
}
