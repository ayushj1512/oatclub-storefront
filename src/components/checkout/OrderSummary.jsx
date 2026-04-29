"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";
import CheckoutCouponSection from "@/components/checkout/CheckoutCouponSection";
import { useCouponStore } from "@/store/couponStore";

const money = (n) =>
  Number.isFinite(Number(n)) ? Number(n).toLocaleString("en-IN") : "0";

const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const slugify = (s = "") =>
  String(s)
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getImageSrc = (item) => {
  const list = [
    item?.image,
    item?.thumbnail,
    item?.images?.[0]?.src,
    item?.images?.[0],
    item?.productSnapshot?.thumbnail,
    item?.productSnapshot?.images?.[0],
  ];

  return list.find((v) => typeof v === "string" && v.trim()) || null;
};

const getProductHref = (item) => {
  const id = String(item?.productId || item?._id || item?.id || "");
  const category = slugify(
    item?.category?.slug ||
      item?.categorySlug ||
      item?.productSnapshot?.category?.slug ||
      item?.productSnapshot?.categorySlug ||
      item?.productSnapshot?.category ||
      "all"
  );

  const productName = slugify(
    item?.slug || item?.handle || item?.name || "product"
  );

  return id ? `/category/${category}/${productName}/${id}` : "#";
};

const GlassCard = ({ children, className = "" }) => (
  <div
    className={`rounded-[22px] bg-white/75 shadow-[0_18px_45px_rgba(0,0,0,0.08)] backdrop-blur-xl ${className}`}
  >
    {children}
  </div>
);

const Line = ({ label, value, tone = "default", strike = false }) => {
  const toneClass =
    tone === "green"
      ? "text-green-700"
      : tone === "dark"
      ? "text-gray-900"
      : "text-gray-600";

  return (
    <div className="flex items-center justify-between text-sm">
      <span className={toneClass}>{label}</span>
      <span
        className={`font-semibold tabular-nums ${
          tone === "green" ? "text-green-700" : "text-gray-900"
        } ${strike ? "line-through" : ""}`}
      >
        {value}
      </span>
    </div>
  );
};

export default function OrderSummary({
  items = [],
  subtotal = 0,
  payable = 0,
  razorpayExtraDiscount = 0,
  showSummary,
  setShowSummary,
  email,
  phone,
  customerId,
  cartItems = [],
}) {
  const { coupon, discount, eligibleTotal, discountBreakdown } = useCouponStore();

  const safeSubtotal = Math.max(0, toNum(subtotal));
  const safeCouponDiscount = Math.max(0, toNum(discount));
  const safeRazorpayExtra = Math.max(0, toNum(razorpayExtraDiscount));
  const totalDiscount = safeCouponDiscount + safeRazorpayExtra;

  const totalMrp = useMemo(() => {
    return items.reduce((sum, it) => {
      const qty = Math.max(1, toNum(it?.qty ?? it?.quantity ?? 1));
      const price = toNum(it?.price ?? it?.productSnapshot?.price);
      const mrp = toNum(it?.compareAtPrice ?? it?.productSnapshot?.compareAtPrice);
      return sum + (mrp > price ? mrp : price) * qty;
    }, 0);
  }, [items]);

  const totalSavings = useMemo(() => {
    return items.reduce((sum, it) => {
      const qty = Math.max(1, toNum(it?.qty ?? it?.quantity ?? 1));
      const price = toNum(it?.price ?? it?.productSnapshot?.price);
      const mrp = toNum(it?.compareAtPrice ?? it?.productSnapshot?.compareAtPrice);
      return sum + (mrp > price ? (mrp - price) * qty : 0);
    }, 0);
  }, [items]);

  const finalPayable = Number.isFinite(toNum(payable))
    ? toNum(payable)
    : Math.max(0, safeSubtotal - Math.min(totalDiscount, safeSubtotal));

  return (
    <GlassCard className="p-4 sm:p-5">
      <button
        type="button"
        onClick={() => setShowSummary((s) => !s)}
        className="flex w-full items-center justify-between"
      >
        <div className="min-w-0">
          <div className="text-sm text-gray-500">Step 2</div>
          <div className="text-lg font-semibold text-gray-900">
            Order Summary
          </div>
        </div>

        {showSummary ? <ChevronUp /> : <ChevronDown />}
      </button>

      {showSummary && (
        <div className="mt-4 space-y-3">
          {!items.length ? (
            <p className="text-sm text-black/60">Your cart is empty.</p>
          ) : (
            <>
              <div className="space-y-3">
                {items.map((item) => {
                  const src = getImageSrc(item);
                  const href = getProductHref(item);

                  const qty = Math.max(1, toNum(item?.qty ?? item?.quantity ?? 1));
                  const price = toNum(item?.price ?? item?.productSnapshot?.price);
                  const mrp = toNum(
                    item?.compareAtPrice ?? item?.productSnapshot?.compareAtPrice
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

                  const Tile = (
                    <div className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl bg-white/60 px-3 py-2 shadow-[0_10px_25px_rgba(0,0,0,0.06)] transition hover:bg-white/75">
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
                            {item?.name || item?.productSnapshot?.title || "Product"}
                          </p>

                          <div className="mt-0.5 flex flex-wrap items-center gap-2">
                            {item?.selectedSize && (
                              <span className="rounded-xl bg-black/5 px-2 py-0.5 text-[11px] text-black/70">
                                Size: {String(item.selectedSize).toUpperCase()}
                              </span>
                            )}

                            {item?.selectedColor && (
                              <span className="rounded-xl bg-black/5 px-2 py-0.5 text-[11px] text-black/70">
                                Color: {String(item.selectedColor).replace(/-/g, " ")}
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-xs text-black/60">Qty: {qty}</p>

                          {showMrp && (
                            <p className="mt-0.5 text-[12px] text-green-700">
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

                        <div className="text-sm font-semibold tabular-nums text-black">
                          ₹{money(price * qty)}
                        </div>

                        {discountPercent > 0 && (
                          <div className="text-[11px] font-semibold text-green-700">
                            {discountPercent}% OFF
                          </div>
                        )}
                      </div>
                    </div>
                  );

                  return href === "#" ? (
                    <div key={key}>{Tile}</div>
                  ) : (
                    <Link key={key} href={href} className="block" prefetch={false}>
                      {Tile}
                    </Link>
                  );
                })}
              </div>

              <div className="mt-4 space-y-2 rounded-2xl bg-white/70 p-4 shadow-[0_10px_25px_rgba(0,0,0,0.06)]">
                {totalMrp > safeSubtotal && (
                  <Line label="MRP Total" value={`₹${money(totalMrp)}`} strike />
                )}

                <Line label="Subtotal" value={`₹${money(safeSubtotal)}`} />

                {totalSavings > 0 && (
                  <Line
                    label="You Saved"
                    value={`₹${money(totalSavings)}`}
                    tone="green"
                  />
                )}

               <CheckoutCouponSection
  cartTotal={safeSubtotal}
  cartItems={cartItems}
  email={email}
  phone={phone}
  customerId={customerId}
/>

                {coupon?.code && safeCouponDiscount > 0 && (
                  <div className="rounded-2xl bg-green-50 p-3 ring-1 ring-green-100">
                    <div className="flex items-center justify-between text-sm text-green-700">
                      <span>
                        Coupon <b>{coupon.code}</b>
                      </span>
                      <span className="font-semibold tabular-nums">
                        − ₹{money(safeCouponDiscount)}
                      </span>
                    </div>

                    {Number(eligibleTotal || 0) > 0 && (
                      <p className="mt-1 text-[11px] text-green-700/80">
                        Applied on ₹{money(eligibleTotal)} eligible value
                      </p>
                    )}

                    {Array.isArray(discountBreakdown) &&
                      discountBreakdown.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {discountBreakdown.slice(0, 3).map((row, index) => (
                            <div
                              key={`${row.productId || row.productCode || index}`}
                              className="flex items-center justify-between gap-3 text-[11px] text-green-800/80"
                            >
                              <span className="truncate">
                                {row.title || row.productCode || "Item"}
                              </span>
                              <span className="shrink-0 font-medium">
                                − ₹{money(row.discount)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                )}

                {safeRazorpayExtra > 0 && (
                  <Line
                    label={
                      <span>
                        Razorpay Offer <b>(10% extra)</b>
                      </span>
                    }
                    value={`− ₹${money(safeRazorpayExtra)}`}
                    tone="green"
                  />
                )}

                {totalDiscount > 0 && (
                  <>
                    <div className="my-1 h-px bg-black/5" />
                    <Line
                      label="Total Discount"
                      value={`− ₹${money(totalDiscount)}`}
                      tone="green"
                    />
                  </>
                )}

                <div className="my-1 h-px bg-black/5" />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">
                    Payable
                  </span>
                  <span className="text-lg font-semibold tabular-nums text-gray-900">
                    ₹{money(finalPayable)}
                  </span>
                </div>

                <div className="text-[11px] text-gray-500">
                  Shipping:{" "}
                  <span className="font-semibold text-green-700">Free</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </GlassCard>
  );
}