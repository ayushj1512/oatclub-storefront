"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { Tag, X, Loader2 } from "lucide-react";
import { useCouponStore } from "@/store/couponStore";
import { useAuthStore } from "@/store/authStore";

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

  const user = useAuthStore((s) => s.user);

  const {
    coupon,
    discount,
    isApplying,
    error,
    message,
    applyCoupon,
    removeCoupon,
    clearCouponMessages,

    // ✅ Suggestions
    suggestedCoupons,
    isLoadingSuggestions,
    suggestionError,
    fetchSuggestedCoupons,
  } = useCouponStore();

  const hasCoupon = Boolean(coupon?.code);

  // ✅ Stable function to fetch suggestions (prevents useEffect re-run loops)
  const loadSuggestions = useCallback(() => {
    if (!user?.uid || cartTotal == null || cartTotal <= 0 || hasCoupon) return;
    fetchSuggestedCoupons({ customerId: user.uid, cartTotal });
  }, [user?.uid, cartTotal, fetchSuggestedCoupons, hasCoupon]);

  // ✅ Fetch suggestions when user/cartTotal changes
  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  const onApply = async (applyCode = code) => {
    const finalCode = String(applyCode || "").trim();
    if (!finalCode || isApplying) return;
    if (!user?.uid) return;

    try {
      clearCouponMessages?.();
      const formatted = finalCode.toUpperCase();
      setClickedCode(formatted);

      await applyCoupon({
        code: formatted,
        customerId: user.uid,
        cartTotal,
      });

      setCode("");
      setClickedCode(null);

      // ✅ Optional: refresh suggestions after applying
      // loadSuggestions();
    } catch {
      setClickedCode(null);
      /* handled in store */
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
    <div className="mt-4 rounded-[22px] bg-white/75 backdrop-blur-xl shadow-[0_18px_45px_rgba(0,0,0,0.08)] p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="grid place-items-center size-9 rounded-2xl bg-black/4 text-gray-800">
          <Tag className="w-4 h-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-gray-900">Apply Coupon</p>
          <p className="text-xs text-gray-500">Use a valid code to get discount</p>
        </div>
      </div>

      {!user?.uid && (
        <div className="text-xs text-amber-700 bg-amber-50 rounded-2xl px-4 py-3">
          Login required to apply coupon
        </div>
      )}

      {/* Applied Coupon */}
      {hasCoupon ? (
        <div className="flex items-center justify-between rounded-2xl bg-white/70 border border-black/10 px-4 py-3 shadow-[0_10px_25px_rgba(0,0,0,0.06)]">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {coupon.code} applied ✅
            </p>
            <p className="text-xs text-gray-600">
              You saved <b>₹{money(displayDiscount)}</b>
            </p>
          </div>

          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove coupon"
            className="grid place-items-center w-9 h-9 rounded-full bg-black/5 hover:bg-black/10 transition"
          >
            <X className="w-4 h-4 text-gray-900" />
          </button>
        </div>
      ) : (
        <>
          {/* Input + Apply */}
          <div className="flex items-center gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              className="flex-1 rounded-2xl bg-white/80 px-4 py-3 text-sm outline-none shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)] focus:shadow-[inset_0_0_0_2px_rgba(0,0,0,0.22)] transition"
            />

            <button
              type="button"
              disabled={isApplying || !user?.uid || !code.trim()}
              onClick={() => onApply()}
              className="inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold text-white bg-black hover:opacity-90 transition disabled:bg-black/20 disabled:text-black/40"
            >
              {isApplying && clickedCode === code.trim().toUpperCase() ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Apply"
              )}
            </button>
          </div>

          {/* ✅ Coupon Suggestions */}
          {user?.uid && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-800">
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
                    const isThisApplying =
                      isApplying && clickedCode === c.code;

                    return (
                      <button
                        key={c._id || c.code}
                        type="button"
                        disabled={isApplying}
                        onClick={() => onApply(c.code)}
                        className="px-3 py-2 rounded-2xl bg-white/70 border border-black/10 shadow-[0_8px_22px_rgba(0,0,0,0.06)] text-xs font-semibold text-gray-900 hover:bg-black hover:text-white transition disabled:opacity-60"
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
          )}

          {/* Message */}
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
          {message && <p className="mt-2 text-xs text-green-700">{message}</p>}
        </>
      )}
    </div>
  );
}
