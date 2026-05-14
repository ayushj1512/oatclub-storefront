"use client";

import { useEffect, useMemo } from "react";
import { TicketPercent, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCouponStore } from "@/store/couponStore";

const money = (n) => (Number.isFinite(+n) ? (+n).toLocaleString("en-IN") : "0");

const couponLabel = (c) =>
  c?.discountType === "percentage"
    ? `${c.discountValue}% OFF`
    : `₹${money(c?.discountValue)} OFF`;

const isPublic = (c) =>
  String(c?.visibility || "public").toLowerCase() !== "private";

const getMeta = (coupon) => {
  const e = coupon?._eligibility || {};
  const desc = String(coupon?.description || "").trim();

  const eligible =
    e.isEligible !== undefined
      ? Boolean(e.isEligible)
      : e.okDate !== false && e.okMin !== false && e.okQty !== false;

  if (eligible) return { eligible: true, text: desc || "Eligible on checkout" };
  if (e.okDate === false) return { eligible: false, text: desc || "Expired" };

  if (e.okMin === false) {
    return {
      eligible: false,
      text: desc || `Min cart ₹${money(coupon.minPurchase)}`,
    };
  }

  if (e.okQty === false && Number(e.remainingQty || 0) > 0) {
    const qty = Number(e.remainingQty || 0);
    return {
      eligible: false,
      text: desc || `Add ${qty} more item${qty > 1 ? "s" : ""}`,
    };
  }

  return { eligible: false, text: desc || "Not eligible yet" };
};

export default function CartCouponPreview({ cartTotal, cartItems = [] }) {
  const {
    suggestedCoupons,
    isLoadingSuggestions,
    suggestionError,
    fetchSuggestedCoupons,
  } = useCouponStore();

  useEffect(() => {
    if (!(Number(cartTotal) > 0)) return;
    fetchSuggestedCoupons?.({ cartTotal, cartItems });
  }, [cartTotal, cartItems, fetchSuggestedCoupons]);

  const coupons = useMemo(() => {
    const list = Array.isArray(suggestedCoupons)
      ? suggestedCoupons.filter(isPublic)
      : [];

    return list
      .map((coupon) => {
        const meta = getMeta(coupon);
        return { ...coupon, _meta: meta };
      })
      .sort((a, b) => Number(b._meta.eligible) - Number(a._meta.eligible))
      .slice(0, 6);
  }, [suggestedCoupons]);

  if (!(Number(cartTotal) > 0)) return null;

  return (
    <div className="mb-4 rounded-[22px] bg-white/75 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.06)] ring-1 ring-black/5 backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-xl bg-black/5 text-gray-800">
            <TicketPercent className="h-4 w-4" />
          </span>

          <div>
            <p className="text-sm font-semibold text-gray-900">
              Available coupons
            </p>
            <p className="text-[11px] text-gray-500">
              Apply eligible coupons on checkout
            </p>
          </div>
        </div>

        <Link
          href="/checkout"
          className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-gray-700 transition hover:text-black"
        >
          Checkout <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {isLoadingSuggestions ? (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Checking coupons...
        </div>
      ) : suggestionError ? (
        <p className="text-xs text-red-600">{suggestionError}</p>
      ) : coupons.length ? (
        <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:overflow-visible sm:px-0">
          <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
            {coupons.map((coupon) => {
              const { eligible, text } = coupon._meta;

              return (
                <div
                  key={coupon._id || coupon.code}
                  className={[
                    "w-[190px] shrink-0 rounded-xl px-3 py-2 text-left text-[11px] font-semibold sm:w-auto",
                    eligible
                      ? "bg-green-50 text-green-800 shadow-[inset_0_0_0_1px_rgba(22,163,74,0.22)]"
                      : "bg-zinc-100 text-zinc-500 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-1">
                    <span>{String(coupon.code || "").toUpperCase()}</span>
                    <span className="font-medium opacity-75">
                      {couponLabel(coupon)}
                    </span>
                  </div>

                  <p
                    className={[
                      "mt-0.5 truncate text-[10px] font-medium",
                      eligible ? "text-green-700/70" : "text-zinc-400",
                    ].join(" ")}
                  >
                    {text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="text-[11px] text-gray-500">
          No public coupons available right now.
        </p>
      )}
    </div>
  );
}