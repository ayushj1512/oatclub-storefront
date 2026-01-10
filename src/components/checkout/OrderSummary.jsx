"use client";

import { useMemo } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";
import CheckoutCouponSection from "@/components/checkout/CheckoutCouponSection";
import { useCouponStore } from "@/store/couponStore";

/* ---------- utils ---------- */
const money = (n) =>
  Number.isFinite(Number(n)) ? Number(n).toLocaleString("en-IN") : "0";

const getImageSrc = (item) => {
  const c = [
    item?.image,
    item?.thumbnail,
    item?.images?.[0]?.src,
    item?.images?.[0],
    item?.productSnapshot?.thumbnail,
    item?.productSnapshot?.images?.[0],
  ];
  const src = c.find((v) => typeof v === "string" && v.trim());
  return src || null;
};

const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/* ---------- UI bits ---------- */
const GlassCard = ({ children, className = "" }) => (
  <div
    className={`rounded-[22px] bg-white/75 backdrop-blur-xl shadow-[0_18px_45px_rgba(0,0,0,0.08)] ${className}`}
  >
    {children}
  </div>
);

export default function OrderSummary({
  items = [],
  subtotal = 0,
  showSummary,
  setShowSummary,
}) {
  // ✅ pull coupon state inside OrderSummary
  const { coupon, discount } = useCouponStore();

  /* ---------- totals (MRP + savings) ---------- */
  const totalMrp = useMemo(() => {
    return (items || []).reduce((sum, it) => {
      const qty = Math.max(1, toNum(it?.qty ?? it?.quantity ?? 1));
      const price = toNum(it?.price ?? it?.productSnapshot?.price ?? 0);
      const mrp = toNum(
        it?.compareAtPrice ?? it?.productSnapshot?.compareAtPrice ?? 0
      );

      const use = mrp > price ? mrp : price;
      return sum + use * qty;
    }, 0);
  }, [items]);

  const totalSavings = useMemo(() => {
    return (items || []).reduce((sum, it) => {
      const qty = Math.max(1, toNum(it?.qty ?? it?.quantity ?? 1));
      const price = toNum(it?.price ?? it?.productSnapshot?.price ?? 0);
      const mrp = toNum(
        it?.compareAtPrice ?? it?.productSnapshot?.compareAtPrice ?? 0
      );

      return sum + (mrp > price ? (mrp - price) * qty : 0);
    }, 0);
  }, [items]);

  // ✅ payable derived automatically
  const payable = useMemo(() => {
    return Math.max(0, Number(subtotal || 0) - Number(discount || 0));
  }, [subtotal, discount]);

  return (
    <>
      <GlassCard className="p-4 sm:p-5">
        {/* HEADER */}
        <button
          type="button"
          onClick={() => setShowSummary((s) => !s)}
          className="w-full flex items-center justify-between"
        >
          <div className="min-w-0">
            <div className="text-sm text-gray-500">Step 2</div>
            <div className="text-lg font-semibold text-gray-900">
              Order Summary
            </div>
          </div>
          {showSummary ? <ChevronUp /> : <ChevronDown />}
        </button>

        {/* BODY */}
        {showSummary && (
          <div className="mt-4 space-y-3">
            {items.length ? (
              <>
                {/* ITEMS */}
                <div className="space-y-3">
                  {items.map((item) => {
                    const src = getImageSrc(item);

                    const qty = Math.max(
                      1,
                      toNum(item?.qty ?? item?.quantity ?? 1)
                    );
                    const price = toNum(
                      item?.price ?? item?.productSnapshot?.price ?? 0
                    );

                    const mrp = toNum(
                      item?.compareAtPrice ??
                        item?.productSnapshot?.compareAtPrice ??
                        0
                    );

                    const showMrp = mrp > price;
                    const discountPercent = showMrp
                      ? Math.round(((mrp - price) / mrp) * 100)
                      : 0;

                    const key = String(
                      item?.__key ||
                        `${String(item?.productId || item?._id || item?.id || "")}__${String(
                          item?.variantId || ""
                        )}`
                    );

                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between gap-3 rounded-2xl bg-white/60 px-3 py-2 shadow-[0_10px_25px_rgba(0,0,0,0.06)]"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="relative h-[64px] w-[56px] shrink-0 overflow-hidden rounded-xl bg-black/4">
                            {src ? (
                              <Image
                                src={src}
                                alt={item?.name || "Product"}
                                fill
                                className="object-cover"
                                sizes="56px"
                              />
                            ) : (
                              <div className="grid h-full w-full place-items-center text-[10px] text-black/50">
                                No image
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-black">
                              {item?.name || "Product"}
                            </p>

                            <div className="mt-0.5 flex flex-wrap items-center gap-2">
                              {item?.selectedSize && (
                                <span className="text-[11px] rounded-xl bg-black/5 px-2 py-0.5 text-black/70">
                                  Size: {String(item.selectedSize).toUpperCase()}
                                </span>
                              )}
                              {item?.selectedColor && (
                                <span className="text-[11px] rounded-xl bg-black/5 px-2 py-0.5 text-black/70">
                                  Color:{" "}
                                  {String(item.selectedColor).replace(/-/g, " ")}
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-black/60 mt-1">
                              Qty: {qty}
                            </p>

                            {showMrp && (
                              <p className="text-[12px] text-green-700 mt-0.5">
                                You save ₹{money((mrp - price) * qty)}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          {showMrp && (
                            <div className="text-[11px] text-black/50 line-through tabular-nums">
                              ₹{money(mrp * qty)}
                            </div>
                          )}

                          <div className="tabular-nums text-sm font-semibold text-black">
                            ₹{money(price * qty)}
                          </div>

                          {discountPercent > 0 && (
                            <div className="text-[11px] text-green-700 font-semibold">
                              {discountPercent}% OFF
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* TOTALS */}
                <div className="mt-4 rounded-2xl bg-white/70 p-4 shadow-[0_10px_25px_rgba(0,0,0,0.06)] space-y-2">
                  {totalMrp > subtotal && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">MRP Total</span>
                      <span className="font-semibold tabular-nums text-gray-900 line-through">
                        ₹{money(totalMrp)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold tabular-nums text-gray-900">
                      ₹{money(subtotal)}
                    </span>
                  </div>

                  {totalSavings > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">You Saved</span>
                      <span className="font-semibold tabular-nums text-green-700">
                        ₹{money(totalSavings)}
                      </span>
                    </div>
                  )}

                  {/* ✅ COUPON SECTION INSIDE SUMMARY */}
                  <CheckoutCouponSection cartTotal={subtotal} />

                  {/* ✅ COUPON LINE (from store) */}
                  {coupon?.code && Number(discount || 0) > 0 && (
                    <div className="flex items-center justify-between text-sm text-green-700">
                      <span>
                        Coupon <b>{coupon.code}</b>
                      </span>
                      <span className="font-semibold tabular-nums">
                        − ₹{money(discount)}
                      </span>
                    </div>
                  )}

                  <div className="h-px bg-black/5 my-1" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">
                      Payable
                    </span>
                    <span className="text-lg font-semibold tabular-nums text-gray-900">
                      ₹{money(payable)}
                    </span>
                  </div>

                  <div className="text-[11px] text-gray-500">
                    Shipping:{" "}
                    <span className="text-green-700 font-semibold">Free</span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-black/60">Your cart is empty.</p>
            )}
          </div>
        )}
      </GlassCard>
    </>
  );
}
