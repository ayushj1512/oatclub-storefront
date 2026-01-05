"use client";

import { useMemo } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";
import CheckoutCouponSection from "@/components/checkout/CheckoutCouponSection";

/* ---------- utils ---------- */
const money = (n) =>
  Number.isFinite(Number(n)) ? Number(n).toLocaleString("en-IN") : "0";

const getImageSrc = (item) => {
  const c = [item?.image, item?.thumbnail, item?.images?.[0]?.src, item?.images?.[0]];
  const src = c.find((v) => typeof v === "string" && v.trim());
  return src || null;
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
  coupon,
  discount = 0,
  payable = 0,
  showSummary,
  setShowSummary,
}) {
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
            <div className="text-sm text-gray-500">Step 1</div>
            <div className="text-lg font-semibold text-gray-900">Order Summary</div>
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
                    const qty = Number(item?.qty ?? item?.quantity ?? 1);
                    const price = Number(item?.price ?? 0);

                    const key = `${String(
                      item?.productId || item?._id || item?.id || ""
                    )}__${String(item?.variantId || "")}`;

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
                            <p className="text-xs text-black/60">Qty: {qty}</p>
                          </div>
                        </div>

                        <p className="shrink-0 tabular-nums text-sm font-semibold text-black">
                          ₹{money(price * qty)}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* TOTALS */}
                <div className="mt-4 rounded-2xl bg-white/70 p-4 shadow-[0_10px_25px_rgba(0,0,0,0.06)] space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold tabular-nums text-gray-900">
                      ₹{money(subtotal)}
                    </span>
                  </div>

                  {/* ✅ COUPON SECTION */}
                  {/* <CheckoutCouponSection cartTotal={subtotal} /> */}

                  {/* ✅ COUPON LINE */}
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
