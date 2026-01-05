"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Tag, X, Loader2 } from "lucide-react";
import { useCouponStore } from "@/store/couponStore";

const money = (n) =>
  Number.isFinite(Number(n)) ? Number(n).toLocaleString("en-IN") : "0";

const couponLabel = (c) => {
  if (!c) return "";
  if (c.discountType === "percentage") return `${c.discountValue}% OFF`;
  return `₹${money(c.discountValue)} OFF`;
};

export default function ApplyCoupon({ cartTotal }) {
  const [code, setCode] = useState("");
  const [clickedCode, setClickedCode] = useState(null);

  const {
    coupon,
    discount,
    isApplying,
    error,
    message,
    applyCoupon,
    removeCoupon,
    clearCouponMessages,

    // ✅ Suggestions (now works for guest too)
    suggestedCoupons,
    isLoadingSuggestions,
    suggestionError,
    fetchSuggestedCoupons,
  } = useCouponStore();

  const hasCoupon = Boolean(coupon?.code);

  // ✅ Always treat as guest (no auth dependency)
  const customerId = "guest";

  // ✅ Load suggestions for everyone (guest-friendly)
  const loadSuggestions = useCallback(() => {
    if (cartTotal == null || cartTotal <= 0 || hasCoupon) return;
    fetchSuggestedCoupons({ customerId, cartTotal });
  }, [cartTotal, fetchSuggestedCoupons, hasCoupon]);

  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  const onApply = async (applyCode = code) => {
    const finalCode = String(applyCode || "").trim();
    if (!finalCode || isApplying) return;

    try {
      clearCouponMessages?.();
      setClickedCode(finalCode.toUpperCase());

      await applyCoupon({
        code: finalCode,
        customerId, // ✅ guest
        cartTotal,
      });

      setCode("");
      setClickedCode(null);
    } catch {
      setClickedCode(null);
    }
  };

  const onRemove = () => {
    removeCoupon();
    clearCouponMessages?.();
    setCode("");

    // ✅ refresh suggestions after removing coupon
    setTimeout(() => loadSuggestions(), 50);
  };

  const displayDiscount = useMemo(
    () => Math.max(0, Number(discount || 0)),
    [discount]
  );

  return (
    <div className="mt-4 rounded-2xl border border-black/10 bg-white p-4 shadow-[0_8px_20px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-2 mb-2">
        <Tag className="w-4 h-4 text-gray-700" />
        <p className="text-sm font-semibold text-black">Apply Coupon</p>
      </div>

      {hasCoupon ? (
        <div className="flex items-center justify-between rounded-xl bg-gray-50 border border-gray-200 px-3 py-2">
          <div>
            <p className="text-sm font-semibold text-black">
              {coupon.code} applied
            </p>
            <p className="text-xs text-gray-600">
              You saved ₹{money(displayDiscount)}
            </p>
          </div>

          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove coupon"
            className="grid place-items-center w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 transition"
          >
            <X className="w-4 h-4 text-black" />
          </button>
        </div>
      ) : (
        <>
          {/* ✅ Input + Apply */}
          <div className="flex items-center gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              className="flex-1 rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20 transition"
            />

            <button
              type="button"
              disabled={isApplying || !code.trim()}
              onClick={() => onApply()}
              className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-white bg-black hover:bg-black/90 transition disabled:opacity-60"
            >
              {isApplying && clickedCode === code.trim().toUpperCase() ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Apply"
              )}
            </button>
          </div>

          {/* ✅ Suggested Coupons (Guest + Logged-in) */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-700">
                Suggested Coupons
              </p>

              <button
                type="button"
                onClick={loadSuggestions}
                className="text-[11px] font-semibold text-gray-600 hover:text-black transition"
              >
                Refresh
              </button>
            </div>

            {isLoadingSuggestions ? (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading suggestions...
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
                      className="px-3 py-1.5 rounded-full border border-gray-300 bg-gray-50 text-xs font-semibold text-black hover:bg-black hover:text-white transition disabled:opacity-60"
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
                        <span className="ml-2 text-[11px] opacity-60">
                          Min ₹{money(c.minPurchase)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-500">No coupons available</p>
            )}
          </div>

          {/* ✅ Error / Message */}
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
          {message && <p className="mt-2 text-xs text-green-700">{message}</p>}
        </>
      )}
    </div>
  );
}
