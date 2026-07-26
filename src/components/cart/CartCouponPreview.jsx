"use client";

import { useEffect, useMemo } from "react";
import { TicketPercent, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

import { useCouponStore } from "@/store/couponStore";
import { useAuthStore } from "@/store/authStore";

const money = (value) =>
  Number.isFinite(Number(value))
    ? Number(value).toLocaleString("en-IN")
    : "0";

const couponLabel = (coupon) =>
  coupon?.discountType === "percentage"
    ? `${coupon.discountValue}% OFF`
    : `₹${money(coupon?.discountValue)} OFF`;

const isPublicCoupon = (coupon) =>
  String(coupon?.visibility || "public").toLowerCase() !== "private";

const getCouponMeta = (coupon) => {
  const eligibility = coupon?._eligibility || {};
  const description = String(coupon?.description || "").trim();

  const isEligible =
    eligibility.isEligible !== undefined
      ? Boolean(eligibility.isEligible)
      : eligibility.okDate !== false &&
        eligibility.okMin !== false &&
        eligibility.okQty !== false;

  if (isEligible) {
    return {
      eligible: true,
      text: description || "Eligible on checkout",
    };
  }

  if (eligibility.okDate === false) {
    return {
      eligible: false,
      text: description || "Expired",
    };
  }

  if (eligibility.okMin === false) {
    return {
      eligible: false,
      text:
        description ||
        `Minimum cart ₹${money(coupon?.minPurchase)}`,
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
    text: description || "Not eligible yet",
  };
};

export default function CartCouponPreview({
  cartTotal,
  cartItems = [],
}) {
  const customer = useAuthStore(
    (state) => state.customer || state.user
  );

  const {
    suggestedCoupons,
    isLoadingSuggestions,
    suggestionError,
    fetchSuggestedCoupons,
  } = useCouponStore();

  const customerId =
    customer?._id ||
    customer?.id ||
    customer?.customerId ||
    null;

  const email = customer?.email || null;
  const phone =
    customer?.phone ||
    customer?.phoneNumber ||
    customer?.mobile ||
    null;

  useEffect(() => {
    if (!(Number(cartTotal) > 0)) return;

    fetchSuggestedCoupons?.({
      cartTotal,
      cartItems,
      email,
      phone,
      customerId,
    });
  }, [
    cartTotal,
    cartItems,
    email,
    phone,
    customerId,
    fetchSuggestedCoupons,
  ]);

  const coupons = useMemo(() => {
    const list = Array.isArray(suggestedCoupons)
      ? suggestedCoupons.filter(isPublicCoupon)
      : [];

    return list
      .map((coupon) => ({
        ...coupon,
        _meta: getCouponMeta(coupon),
      }))
      .sort(
        (a, b) =>
          Number(b._meta.eligible) -
          Number(a._meta.eligible)
      )
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
          Checkout
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {isLoadingSuggestions ? (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Checking coupons...
        </div>
      ) : suggestionError ? (
        <p className="text-xs text-red-600">
          {suggestionError}
        </p>
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
                    <span>
                      {String(
                        coupon.code || ""
                      ).toUpperCase()}
                    </span>

                    <span className="font-medium opacity-75">
                      {couponLabel(coupon)}
                    </span>
                  </div>

                  <p
                    className={[
                      "mt-0.5 truncate text-[10px] font-medium",
                      eligible
                        ? "text-green-700/70"
                        : "text-zinc-400",
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