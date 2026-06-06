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
    className={`border border-neutral-200 bg-white shadow-[0_14px_38px_rgba(30,25,18,0.04)] ${className}`}
  >
    {children}
  </div>
);

const Line = ({ label, value, tone = "default", strike = false }) => {
  const toneClass =
    tone === "green"
      ? "text-black"
      : tone === "dark"
      ? "text-black"
      : "text-black/55";

  return (
    <div className="flex items-center justify-between text-[13px]">
      <span className={toneClass}>{label}</span>
      <span
        className={`font-semibold tabular-nums ${
          tone === "green" ? "text-black" : "text-black"
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
    <GlassCard className="p-3.5 sm:p-4">
      <button
        type="button"
        onClick={() => setShowSummary((s) => !s)}
        className="flex w-full items-center justify-between"
      >
        <div className="min-w-0">
          <div className="text-[9px] font-black uppercase tracking-[0.18em] text-black/36">Step 2</div>
          <div className="text-sm font-black uppercase tracking-[0.08em] text-black">
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
                    <div className="flex cursor-pointer items-center justify-between gap-3 border border-neutral-200 bg-[#fbfaf7] px-3 py-2 transition hover:border-black hover:bg-white">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="relative h-[72px] w-[58px] shrink-0 overflow-hidden bg-white">
                          {src ? (
                            <Image
                              src={src}
                              alt={item?.name || "Product"}
                              fill
                              className="object-contain p-1"
                              sizes="56px"
                            />
                          ) : (
                            <div className="grid h-full w-full place-items-center text-[10px] text-black/50">
                              No image
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-[11px] font-black uppercase tracking-[0.06em] text-black">
                            {item?.name || item?.productSnapshot?.title || "Product"}
                          </p>

                          <div className="mt-0.5 flex flex-wrap items-center gap-2">
                            {item?.selectedSize && (
                              <span className="border border-neutral-200 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-black/55">
                                Size: {String(item.selectedSize).toUpperCase()}
                              </span>
                            )}

                            {item?.selectedColor && (
                              <span className="border border-neutral-200 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-black/55">
                                Color: {String(item.selectedColor).replace(/-/g, " ")}
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.08em] text-black/45">Qty: {qty}</p>

                          {showMrp && (
                            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-black/45">
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
                          <div className="text-[10px] font-black uppercase tracking-[0.08em] text-black/45">
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

              <div className="mt-3 space-y-2 border border-neutral-200 bg-[#fbfaf7] p-3">
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
                  <div className="border border-neutral-200 bg-white p-3">
                    <div className="flex items-center justify-between text-sm text-black">
                      <span>
                        Coupon <b>{coupon.code}</b>
                      </span>
                      <span className="font-semibold tabular-nums">
                        − ₹{money(safeCouponDiscount)}
                      </span>
                    </div>

                    {Number(eligibleTotal || 0) > 0 && (
                      <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.08em] text-black/45">
                        Applied on ₹{money(eligibleTotal)} eligible value
                      </p>
                    )}

                    {Array.isArray(discountBreakdown) &&
                      discountBreakdown.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {discountBreakdown.slice(0, 3).map((row, index) => (
                            <div
                              key={`${row.productId || row.productCode || index}`}
                              className="flex items-center justify-between gap-3 text-[11px] font-bold uppercase tracking-[0.06em] text-black/55"
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
                    <span className="font-black text-black">Free</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </GlassCard>
  );
}
