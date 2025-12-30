"use client";

import { useState, useMemo } from "react";
import { Tag, X, Loader2 } from "lucide-react";
import { useCouponStore } from "@/store/couponStore";
import { useAuthStore } from "@/store/authStore";

export default function ApplyCoupon({ cartTotal }) {
  const [code, setCode] = useState("");

  const user = useAuthStore((s) => s.user);

  const {
    coupon,
    discount,
    isApplying,
    error,
    applyCoupon,
    removeCoupon,
  } = useCouponStore();

  const hasCoupon = Boolean(coupon?.code);

  const onApply = async () => {
    if (!code.trim() || isApplying) return;
    try {
      await applyCoupon({
        code,
        customerId: user?.uid,
        cartTotal,
      });
      setCode("");
    } catch {
      /* handled in store */
    }
  };

  const displayDiscount = useMemo(
    () => Math.max(0, Number(discount || 0)),
    [discount]
  );

  return (
    <div className="mt-4 rounded-2xl border border-black/10 bg-white p-4 shadow-[0_8px_20px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-2 mb-2">
        <Tag className="w-4 h-4 text-gray-700" />
        <p className="text-sm font-semibold text-black">
          Apply Coupon
        </p>
      </div>

      {/* APPLIED */}
      {hasCoupon ? (
        <div className="flex items-center justify-between rounded-xl bg-gray-50 border border-gray-200 px-3 py-2">
          <div>
            <p className="text-sm font-semibold text-black">
              {coupon.code} applied
            </p>
            <p className="text-xs text-gray-600">
              You saved ₹{displayDiscount}
            </p>
          </div>

          <button
            type="button"
            onClick={removeCoupon}
            aria-label="Remove coupon"
            className="grid place-items-center w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 transition"
          >
            <X className="w-4 h-4 text-black" />
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              className="flex-1 rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20 transition"
            />

            <button
              type="button"
              disabled={isApplying}
              onClick={onApply}
              className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-white bg-black hover:bg-black/90 transition disabled:opacity-60"
            >
              {isApplying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Apply"
              )}
            </button>
          </div>

          {error && (
            <p className="mt-2 text-xs text-red-600">
              {error}
            </p>
          )}
        </>
      )}
    </div>
  );
}
