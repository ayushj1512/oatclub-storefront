// src/app/cart/page.jsx  (or wherever your CartPage lives)
"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ArrowRight, Sparkles } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useRouter } from "next/navigation";

const BRAND = "#800020";

const money = (n) => {
  const num = Number(n);
  if (!Number.isFinite(num)) return "0";
  return num.toLocaleString("en-IN");
};

const getImageSrc = (item) => {
  const candidates = [
    item?.image,
    item?.thumbnail,
    item?.images?.[0]?.src,
    item?.images?.[0],
    item?.productSnapshot?.thumbnail,
    item?.productSnapshot?.images?.[0],
  ];
  const src = candidates.find((v) => typeof v === "string" && v.trim().length > 0);
  return src || null;
};

function GlassCard({ children, className = "" }) {
  return (
    <div
      className={[
        "bg-white/75 backdrop-blur-xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.06)]",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function QtyStepper({ value, onDec, onInc }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white/70 px-2 py-1 shadow-[0_8px_18px_rgba(0,0,0,0.06)]">
      <button
        type="button"
        onClick={onDec}
        className="grid place-items-center size-9 rounded-xl bg-black/[0.04] hover:bg-black/[0.06] active:scale-[0.98] transition"
        aria-label="Decrease quantity"
      >
        <Minus className="w-4 h-4 text-gray-900" />
      </button>

      <div className="min-w-10 text-center text-sm font-semibold tabular-nums text-gray-900">
        {value}
      </div>

      <button
        type="button"
        onClick={onInc}
        className="grid place-items-center size-9 rounded-xl bg-black/[0.04] hover:bg-black/[0.06] active:scale-[0.98] transition"
        aria-label="Increase quantity"
      >
        <Plus className="w-4 h-4 text-gray-900" />
      </button>
    </div>
  );
}

export default function CartPage() {
  const router = useRouter();

  const items = useCartStore((s) => s.items) || [];
  const initialize = useCartStore((s) => s.initialize);
  const totalPriceFn = useCartStore((s) => s.totalPrice);
  const updateQtyFn = useCartStore((s) => s.updateQty);
  const removeFn = useCartStore((s) => s.removeFromCart);

  useEffect(() => {
    initialize?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subtotal = useMemo(() => (typeof totalPriceFn === "function" ? totalPriceFn() : 0), [items, totalPriceFn]);

  const itemCount = useMemo(
    () => (items || []).reduce((sum, it) => sum + Number(it?.qty || it?.quantity || 0), 0),
    [items]
  );

  const goCheckout = () => {
    if (!items.length) return;
    router.push("/checkout");
  };

  // ✅ New cart store uses stable unique __key; fallback to old key style
  const itemKey = (item) =>
    String(item?.__key || `${String(item?.productId || item?.id || "")}__${String(item?.selectedSize || "")}`);

  const updateQtySafe = (item, nextQty) => {
    const qty = Math.max(1, Number(nextQty || 1));
    // ✅ Support both: updateQty(__key, qty) OR updateQty(productId, qty, selectedSize)
    try {
      updateQtyFn?.(item?.__key, qty);
    } catch {
      updateQtyFn?.(item?.productId || item?.id, qty, item?.selectedSize);
    }
  };

  const removeSafe = (item) => {
    // ✅ Support both: removeFromCart(__key) OR removeFromCart(productId, selectedSize)
    try {
      removeFn?.(item?.__key);
    } catch {
      removeFn?.(item?.productId || item?.id, item?.selectedSize);
    }
  };

  const getLineUnitPrice = (item) => {
    // New cart store should store numeric price
    const p = item?.price ?? item?.productSnapshot?.price;
    const n = typeof p === "string" ? Number(String(p).replace(/[₹,]/g, "")) : Number(p);
    return Number.isFinite(n) ? n : 0;
  };

  const getItemName = (item) =>
    item?.name ||
    item?.productSnapshot?.title ||
    item?.productSnapshot?.name ||
    "Product";

  return (
    <section className="min-h-[80vh] bg-[#F6F6F8]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-black/[0.06] to-transparent" />

      <div className="relative w-full px-4 sm:px-6 lg:px-10 py-8 sm:py-10">
        {/* Header */}
        <GlassCard className="rounded-[22px] p-4 sm:p-5 mb-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs tracking-wide text-gray-500">Shopping Bag</p>

              <div className="flex flex-wrap items-end gap-x-3 gap-y-1 mt-1">
                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">Your Cart</h1>
                <span className="text-gray-400 font-medium text-sm sm:text-base">
                  ({itemCount} {itemCount === 1 ? "item" : "items"})
                </span>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Review items and proceed to a secure checkout.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold border border-black/10 bg-white/70 hover:bg-white transition"
              >
                Continue shopping <ArrowRight className="w-4 h-4 ml-2" />
              </Link>

              <button
                type="button"
                disabled={!items.length}
                onClick={goCheckout}
                className="inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(128,0,32,0.28)] active:scale-[0.99] transition disabled:opacity-50 disabled:shadow-none"
                style={{ backgroundColor: BRAND }}
              >
                Checkout
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
          {/* Items */}
          <div className="lg:col-span-8">
            <GlassCard className="rounded-[22px] overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-black/5 flex items-center justify-between">
                <div className="text-sm font-semibold text-gray-900">Items</div>
                <div className="text-xs text-gray-500">Tap + / − to update quantity</div>
              </div>

              {items.length === 0 ? (
                <div className="p-8 sm:p-10 text-center">
                  <div className="mx-auto mb-3 grid place-items-center size-14 rounded-2xl bg-black/[0.04]">
                    <Sparkles className="w-6 h-6 text-gray-700" />
                  </div>
                  <p className="text-gray-900 font-semibold">Your cart is empty</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Add something you love — it’ll show up here.
                  </p>
                  <Link
                    href="/shop"
                    className="mt-5 inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(128,0,32,0.25)] active:scale-[0.99] transition"
                    style={{ backgroundColor: BRAND }}
                  >
                    Browse products
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-black/5">
                  {items.map((item) => {
                    const src = getImageSrc(item);
                    const qty = Math.max(1, Number(item?.qty ?? item?.quantity ?? 1));
                    const price = getLineUnitPrice(item);
                    const name = getItemName(item);

                    return (
                      <div
                        key={itemKey(item)}
                        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="relative w-[84px] h-[104px] sm:w-[92px] sm:h-[112px] overflow-hidden rounded-[18px] bg-black/[0.04] border border-black/5 shadow-[0_10px_18px_rgba(0,0,0,0.05)]">
                            {src ? (
                              <Image
                                src={src}
                                alt={name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 84px, 92px"
                              />
                            ) : (
                              <div className="w-full h-full grid place-items-center text-[11px] text-gray-500">
                                No image
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-sm sm:text-[15px] font-semibold text-gray-900 truncate">
                                  {name}
                                </p>

                                <div className="mt-1 flex flex-wrap items-center gap-2">
                                  {!!item?.selectedSize && (
                                    <span className="text-[11px] px-2 py-1 rounded-xl bg-black/[0.04] border border-black/5 text-gray-700">
                                      Size: {String(item.selectedSize).toUpperCase()}
                                    </span>
                                  )}

                                  {!!item?.variantId && (
                                    <span className="text-[11px] px-2 py-1 rounded-xl bg-black/[0.04] border border-black/5 text-gray-700">
                                      Variant: {String(item.variantId).slice(-6)}
                                    </span>
                                  )}

                                  <span className="text-[11px] px-2 py-1 rounded-xl bg-black/[0.04] border border-black/5 text-gray-700">
                                    ₹{money(price)} each
                                  </span>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => removeSafe(item)}
                                className="sm:hidden grid place-items-center size-9 rounded-2xl border border-black/10 bg-white/70 hover:bg-white active:scale-[0.98] transition"
                                aria-label="Remove from cart"
                                title="Remove"
                              >
                                <Trash2 className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>

                            <div className="mt-3 sm:hidden flex items-center justify-between">
                              <QtyStepper
                                value={qty}
                                onDec={() => updateQtySafe(item, qty - 1)}
                                onInc={() => updateQtySafe(item, qty + 1)}
                              />

                              <div className="text-right">
                                <div className="text-[11px] text-gray-500">Total</div>
                                <div className="text-base font-semibold tabular-nums" style={{ color: BRAND }}>
                                  ₹{money(price * qty)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="hidden sm:flex items-center justify-end gap-4 ml-auto">
                          <QtyStepper
                            value={qty}
                            onDec={() => updateQtySafe(item, qty - 1)}
                            onInc={() => updateQtySafe(item, qty + 1)}
                          />

                          <div className="text-right min-w-[120px]">
                            <div className="text-xs text-gray-500">Total</div>
                            <div className="text-lg font-semibold tabular-nums" style={{ color: BRAND }}>
                              ₹{money(price * qty)}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeSafe(item)}
                            className="grid place-items-center size-10 rounded-2xl border border-black/10 bg-white/70 hover:bg-white active:scale-[0.98] transition"
                            aria-label="Remove from cart"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </GlassCard>
          </div>

          {/* Summary */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-6">
              <GlassCard className="rounded-[22px] overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-black/5">
                  <h2 className="text-base font-semibold text-gray-900">Order Summary</h2>
                  <p className="text-xs text-gray-500 mt-1">Taxes calculated at checkout (if applicable).</p>
                </div>

                <div className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold tabular-nums text-gray-900">₹{money(subtotal)}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold text-green-600">Free</span>
                  </div>

                  <div className="h-px bg-black/5 my-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">Total</span>
                    <span className="text-xl font-semibold tabular-nums" style={{ color: BRAND }}>
                      ₹{money(subtotal)}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={items.length === 0}
                    onClick={goCheckout}
                    className="mt-3 w-full rounded-2xl px-4 py-3 text-sm sm:text-base font-semibold text-white shadow-[0_14px_28px_rgba(128,0,32,0.28)] active:scale-[0.99] transition disabled:opacity-50 disabled:shadow-none"
                    style={{ backgroundColor: BRAND }}
                  >
                    Proceed to Checkout
                  </button>

                  <div className="text-[11px] text-gray-500 leading-relaxed">
                    By placing your order, you agree to our{" "}
                    <Link href="/terms" className="text-gray-900 underline underline-offset-4">
                      Terms
                    </Link>{" "}
                    &{" "}
                    <Link href="/privacy" className="text-gray-900 underline underline-offset-4">
                      Privacy Policy
                    </Link>
                    .
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
