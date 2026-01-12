"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Tag, X, Loader2 } from "lucide-react";
import { useCouponStore } from "@/store/couponStore";

const money = (n) => (Number.isFinite(+n) ? (+n).toLocaleString("en-IN") : "0");
const couponLabel = (c) =>
  !c ? "" : c.discountType === "percentage" ? `${c.discountValue}% OFF` : `₹${money(c.discountValue)} OFF`;
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim().toLowerCase());
const isPhone = (v) => {
  const p = String(v || "").replace(/[^\d+]/g, "").trim().replace(/^\+/, "");
  return p.length >= 10 && p.length <= 15;
};

export default function ApplyCoupon({ cartTotal, email, phone, customerId }) {
  const [code, setCode] = useState("");
  const [clicked, setClicked] = useState("");

  const {
    coupon,
    discount,
    isApplying,
    error,
    message,
    applyCoupon,
    removeCoupon,
    clearCouponMessages,
    rehydrateCoupon,
    suggestedCoupons,
    isLoadingSuggestions,
    suggestionError,
    fetchSuggestedCoupons,
  } = useCouponStore();

  const hasCoupon = !!coupon?.code;
  const saved = useMemo(() => Math.max(0, +discount || 0), [discount]);
  const canIdentify = isEmail(email) || isPhone(phone) || (customerId && String(customerId).toLowerCase() !== "guest");

  const load = useCallback(() => {
    if (!hasCoupon && cartTotal > 0) fetchSuggestedCoupons({ cartTotal });
  }, [hasCoupon, cartTotal, fetchSuggestedCoupons]);

  useEffect(() => {
    load();
    if (hasCoupon && !(cartTotal > 0)) removeCoupon();
    if (hasCoupon && cartTotal > 0 && saved === 0)
      rehydrateCoupon?.({ cartTotal, email, phone, customerId });
  }, [load, hasCoupon, cartTotal, saved, removeCoupon, rehydrateCoupon, email, phone, customerId]);

  const onApply = async (v = code) => {
    const c = String(v || "").trim().toUpperCase();
    if (!c || isApplying) return;

    try {
      clearCouponMessages?.();
      setClicked(c);
      await applyCoupon({ code: c, cartTotal, email, phone, customerId });
      setCode("");
    } finally {
      setClicked("");
    }
  };

  const onRemove = async () => {
    await removeCoupon();
    clearCouponMessages?.();
    setCode("");
    setTimeout(load, 50);
  };

  return (
    <div className="mt-4 rounded-2xl border border-black/10 bg-white p-4 shadow-[0_8px_20px_rgba(0,0,0,0.06)]">
      <div className="mb-2 flex items-center gap-2">
        <Tag className="h-4 w-4 text-gray-700" />
        <p className="text-sm font-semibold text-black">Apply Coupon</p>
      </div>

      {hasCoupon ? (
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
          <div>
            <p className="text-sm font-semibold text-black">{coupon.code} applied</p>
            <p className="text-xs text-gray-600">You saved ₹{money(saved)}</p>
          </div>
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove coupon"
            className="grid h-8 w-8 place-items-center rounded-full bg-gray-200 transition hover:bg-gray-300"
          >
            <X className="h-4 w-4 text-black" />
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              className="flex-1 rounded-xl border border-black/10 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-black/20"
            />

            <button
              type="button"
              disabled={isApplying || !code.trim() || !canIdentify}
              onClick={() => onApply()}
              className="inline-flex items-center justify-center rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-black/90 disabled:opacity-60"
              title={!canIdentify ? "Enter email or phone to apply coupon" : ""}
            >
              {isApplying && clicked === code.trim().toUpperCase() ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Apply"
              )}
            </button>
          </div>

          {!canIdentify && (
            <p className="mt-2 text-xs text-gray-600">
              Enter email or phone number to apply coupon.
            </p>
          )}

          <div className="mt-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-700">Suggested Coupons</p>
              <button
                type="button"
                onClick={load}
                className="text-[11px] font-semibold text-gray-600 transition hover:text-black"
              >
                Refresh
              </button>
            </div>

            {isLoadingSuggestions ? (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading suggestions...
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
                      disabled={isApplying || !canIdentify}
                      onClick={() => onApply(cc)}
                      className="rounded-full border border-gray-300 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-black hover:text-white disabled:opacity-60"
                      title={!canIdentify ? "Enter email or phone to apply coupon" : ""}
                    >
                      <span className="inline-flex items-center gap-1">
                        {spin ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                        {cc}
                      </span>
                      <span className="ml-1 font-medium opacity-70">{couponLabel(c)}</span>
                      {+c.minPurchase > 0 && (
                        <span className="ml-2 text-[11px] opacity-60">Min ₹{money(c.minPurchase)}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-500">No coupons available</p>
            )}
          </div>

          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
          {message && <p className="mt-2 text-xs text-green-700">{message}</p>}
        </>
      )}
    </div>
  );
}
