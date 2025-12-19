"use client";

import { useState, useMemo } from "react";
import { Tag, X, Loader2 } from "lucide-react";
import { useCouponStore } from "@/store/couponStore";
import { useAuthStore } from "@/store/authStore";

const BRAND = "#800020";

export default function ApplyCoupon({ cartTotal }) {
  const [code, setCode] = useState("");

  const user = useAuthStore((s) => s.user);

  const {
    coupon,
    discount,
    finalTotal,
    isApplying,
    error,
    applyCoupon,
    removeCoupon,
  } = useCouponStore();

  const hasCoupon = Boolean(coupon?.code);

  const onApply = async () => {
    if (!code.trim()) return;

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

  const displayDiscount = useMemo(() => {
    if (!discount) return 0;
    return Math.max(0, Number(discount));
  }, [discount]);

  return (
    <div className="mt-4 rounded-2xl border border-black/10 bg-white/70 p-4 shadow-[0_8px_18px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-2 mb-2">
        <Tag className="w-4 h-4 text-gray-700" />
        <p className="text-sm font-semibold text-gray-900">Apply Coupon</p>
      </div>

      {/* Applied coupon */}
      {hasCoupon ? (
        <div className="flex items-center justify-between rounded-xl bg-green-50 border border-green-200 px-3 py-2">
          <div>
            <p className="text-sm font-semibold text-green-700">
              {coupon.code} applied
            </p>
            <p className="text-xs text-green-600">
              You saved ₹{displayDiscount}
            </p>
          </div>

          <button
            type="button"
            onClick={removeCoupon}
            className="grid place-items-center size-8 rounded-full bg-green-100 hover:bg-green-200"
            aria-label="Remove coupon"
          >
            <X className="w-4 h-4 text-green-700" />
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              className="flex-1 rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
            />

            <button
              type="button"
              disabled={isApplying}
              onClick={onApply}
              className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-60"
              style={{ backgroundColor: BRAND }}
            >
              {isApplying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Apply"
              )}
            </button>
          </div>

          {error && (
            <p className="mt-2 text-xs text-red-600">{error}</p>
          )}
        </>
      )}
    </div>
  );
}
