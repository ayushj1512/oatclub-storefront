"use client";

import { useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useCouponStore } from "@/store/couponStore";
import useGtmStore from "@/store/gtmStore";
import { trackMeta } from "@/lib/meta/track";
import CartCouponPreview from "@/components/cart/CartCouponPreview";

const money = (n) => {
  const num = Number(n);
  return Number.isFinite(num) ? num.toLocaleString("en-IN") : "0";
};

const itemKey = (item) =>
  String(
    item?.__key ||
      `${String(item?.productId || item?.id || "")}__${String(item?.variantId || "")}`
  );

const slugify = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const getImageSrc = (item) => {
  const candidates = [
    item?.image,
    item?.thumbnail,
    item?.images?.[0]?.src,
    item?.images?.[0],
    item?.productSnapshot?.thumbnail,
    item?.productSnapshot?.images?.[0],
  ];
  return candidates.find((src) => typeof src === "string" && src.trim()) || null;
};

const getItemName = (item) =>
  item?.name || item?.productSnapshot?.title || item?.productSnapshot?.name || "PRODUCT";

const linePrice = (item) => {
  const value = item?.price ?? item?.productSnapshot?.price;
  const num = typeof value === "string" ? Number(value.replace(/[₹,]/g, "")) : Number(value);
  return Number.isFinite(num) ? num : 0;
};

function QtyButton({ children, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-9 w-9 place-items-center border border-black/15 bg-white text-black transition hover:bg-black hover:text-white"
    >
      {children}
    </button>
  );
}

function QuantityControl({ qty, onDec, onInc }) {
  return (
    <div className="inline-flex items-center border border-black/15 bg-white">
      <QtyButton onClick={onDec} label="DECREASE QUANTITY">
        <Minus className="h-4 w-4" />
      </QtyButton>
      <span className="grid h-9 min-w-10 place-items-center border-x border-black/15 text-xs font-black tabular-nums">
        {qty}
      </span>
      <QtyButton onClick={onInc} label="INCREASE QUANTITY">
        <Plus className="h-4 w-4" />
      </QtyButton>
    </div>
  );
}

export default function CartPage() {
  const router = useRouter();
  const lastViewCartRef = useRef({ key: null, at: 0 });

  const items = useCartStore((s) => s.items) || [];
  const initialize = useCartStore((s) => s.initialize);
  const decreaseQty = useCartStore((s) => s.decreaseQty);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const totalPrice = useCartStore((s) => s.totalPrice);
  const totalCompareAtPrice = useCartStore((s) => s.totalCompareAtPrice);
  const totalSavings = useCartStore((s) => s.totalSavings);
  const initAuth = useAuthStore((s) => s.initialize);

  const coupon = useCouponStore((s) => s.coupon);
  const couponFinalTotal = useCouponStore((s) => s.finalTotal);
  const couponDiscount = useCouponStore((s) => s.discount);
  const removeCoupon = useCouponStore((s) => s.removeCoupon);

  useEffect(() => {
    if (!items.length) initialize?.();
    initAuth?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subtotal = useMemo(
    () => (typeof totalPrice === "function" ? totalPrice() : 0),
    [totalPrice, items.length]
  );
  const mrpTotal = useMemo(
    () => (typeof totalCompareAtPrice === "function" ? totalCompareAtPrice() : 0),
    [totalCompareAtPrice, items.length]
  );
  const savings = useMemo(
    () => (typeof totalSavings === "function" ? totalSavings() : 0),
    [totalSavings, items.length]
  );
  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + Number(item?.qty || item?.quantity || 0), 0),
    [items]
  );
  const payable = coupon?.code && couponFinalTotal != null ? Number(couponFinalTotal) || 0 : subtotal;

  useEffect(() => {
    try {
      if (!items.length) return;
      const contents = items
        .map((item) => ({
          id: String(item?.productId || item?.productSnapshot?.sku || ""),
          quantity: Number(item?.qty ?? item?.quantity ?? 1) || 1,
          item_price: Number(item?.price ?? 0) || 0,
        }))
        .filter((item) => item.id);

      if (!contents.length) return;
      const value = contents.reduce((sum, item) => sum + item.item_price * item.quantity, 0);
      const key = `cart_${contents.map((item) => item.id).join("_")}_${value}`;
      const now = Date.now();
      if (lastViewCartRef.current.key === key && now - lastViewCartRef.current.at < 2000) return;
      lastViewCartRef.current = { key, at: now };

      useGtmStore.getState().viewCart({ items: items.slice(0, 50), total: value });
      Promise.resolve(
        trackMeta("ViewCart", {
          currency: "INR",
          value,
          content_type: "product",
          content_ids: contents.map((item) => item.id),
          contents,
          num_items: contents.reduce((sum, item) => sum + item.quantity, 0),
        })
      ).catch(() => {});
    } catch {}
  }, [items]);

  const updateQtySafe = (item, nextQty) => {
    const qty = Math.max(1, Number(nextQty || 1));
    try {
      updateQty?.(itemKey(item), qty);
    } catch {
      updateQty?.(item?.productId || item?.id, qty, item?.variantId);
    }
  };

  const removeSafe = (item) => {
    try {
      removeFromCart?.(itemKey(item));
    } catch {
      removeFromCart?.(item?.productId || item?.id, item?.variantId);
    }
  };

  const openProduct = (item) => {
    const name = getItemName(item);
    const category = item?.productSnapshot?.category || "all";
    const productId = item?.productCode || item?.productSnapshot?.productCode || item?.productId || item?.id;
    if (!productId) return;
    router.push(`/category/${slugify(category)}/${slugify(name)}/${productId}`);
  };

  const goCheckout = () => {
    if (items.length) router.push("/checkout");
  };

  return (
    <main className="min-h-screen bg-[#fafafa] px-3 py-7 text-black md:px-8 md:py-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-7 flex flex-col gap-4 border-b border-neutral-200 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.34em] text-black/45">
              OATCLUB BAG
            </p>
            <h1 className="mt-2 text-2xl font-black uppercase leading-tight md:text-4xl">
              SHOPPING BAG
            </h1>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.1em] text-black/45">
              {itemCount} {itemCount === 1 ? "ITEM" : "ITEMS"} READY FOR CHECKOUT
            </p>
          </div>

          <Link
            href="/all-clothing"
            className="inline-flex w-fit items-center gap-2 border border-black px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition hover:bg-black hover:text-white"
          >
            CONTINUE SHOPPING
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </header>

        <CartCouponPreview
          cartTotal={subtotal}
          cartItems={useCartStore.getState().getCouponCartItems?.() || []}
        />

        <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section className="bg-white">
            <div className="border-b border-neutral-200 px-4 py-3 text-[10px] font-black uppercase tracking-[0.24em] text-black/45">
              SELECTED PIECES
            </div>

            {!items.length ? (
              <div className="grid min-h-[340px] place-items-center px-4 py-12 text-center">
                <div>
                  <div className="mx-auto grid h-14 w-14 place-items-center border border-black/10">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <h2 className="mt-5 text-xl font-black uppercase">YOUR BAG IS EMPTY</h2>
                  <p className="mt-2 text-xs font-bold uppercase tracking-[0.1em] text-black/45">
                    ADD YOUR NEXT OATCLUB EDIT HERE.
                  </p>
                  <Link
                    href="/all-clothing"
                    className="mt-6 inline-flex bg-black px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white"
                  >
                    START SHOPPING
                  </Link>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-neutral-200">
                {items.map((item) => {
                  const qty = Math.max(1, Number(item?.qty ?? item?.quantity ?? 1));
                  const price = linePrice(item);
                  const mrp = Number(item?.compareAtPrice ?? item?.productSnapshot?.compareAtPrice ?? 0) || 0;
                  const src = getImageSrc(item);
                  const name = getItemName(item);
                  const size = item?.selectedSize || item?.variant?.size;
                  const color = item?.selectedColor;

                  return (
                    <article key={itemKey(item)} className="grid gap-4 p-4 sm:grid-cols-[112px_minmax(0,1fr)] md:p-5">
                      <button
                        type="button"
                        onClick={() => openProduct(item)}
                        className="relative aspect-[4/5] w-28 overflow-hidden bg-neutral-100 text-left"
                      >
                        {src ? (
                          <Image src={src} alt={name} fill sizes="112px" className="object-contain p-1" />
                        ) : (
                          <span className="grid h-full place-items-center text-[10px] font-bold text-black/35">
                            NO IMAGE
                          </span>
                        )}
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <button type="button" onClick={() => openProduct(item)} className="min-w-0 text-left">
                            <h3 className="line-clamp-2 text-sm font-black uppercase leading-5 tracking-[0.08em] text-black">
                              {name}
                            </h3>
                            <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-black/50">
                              {size ? <span>SIZE: {String(size).toUpperCase()}</span> : null}
                              {color ? <span>COLOR: {String(color).replace(/-/g, " ").toUpperCase()}</span> : null}
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => removeSafe(item)}
                            className="grid h-9 w-9 shrink-0 place-items-center border border-black/10 transition hover:bg-black hover:text-white"
                            aria-label="REMOVE ITEM"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-sm font-black uppercase tracking-[0.1em]">
                                RS. {money(price)}
                              </span>
                              {mrp > price ? (
                                <span className="text-xs font-bold uppercase tracking-[0.1em] text-black/35 line-through">
                                  RS. {money(mrp)}
                                </span>
                              ) : null}
                            </div>
                            {mrp > price ? (
                              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-black/45">
                                SAVED RS. {money((mrp - price) * qty)}
                              </p>
                            ) : null}
                          </div>

                          <div className="flex items-center justify-between gap-4">
                            <QuantityControl
                              qty={qty}
                              onDec={() => decreaseQty?.(itemKey(item))}
                              onInc={() => updateQtySafe(item, qty + 1)}
                            />
                            <div className="min-w-24 text-right">
                              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-black/40">
                                LINE TOTAL
                              </p>
                              <p className="mt-1 text-sm font-black">RS. {money(price * qty)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="bg-white p-5">
              <h2 className="text-sm font-black uppercase tracking-[0.2em]">ORDER SUMMARY</h2>
              <div className="mt-5 space-y-3 text-sm font-bold uppercase tracking-[0.08em]">
                {mrpTotal > subtotal ? (
                  <Row label="MRP TOTAL" value={`RS. ${money(mrpTotal)}`} muted strike />
                ) : null}
                <Row label="SUBTOTAL" value={`RS. ${money(subtotal)}`} />
                {savings > 0 ? <Row label="SAVINGS" value={`RS. ${money(savings)}`} /> : null}
                <Row label="SHIPPING" value="FREE" />
                {coupon?.code && Number(couponDiscount || 0) > 0 ? (
                  <div className="border border-black/10 bg-neutral-50 p-3">
                    <Row label={`COUPON ${coupon.code}`} value={`- RS. ${money(couponDiscount)}`} />
                    <button
                      type="button"
                      onClick={() => removeCoupon?.()}
                      className="mt-2 text-[10px] font-black uppercase tracking-[0.16em] underline underline-offset-4"
                    >
                      REMOVE COUPON
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="my-5 h-px bg-neutral-200" />

              <div className="flex items-end justify-between">
                <span className="text-sm font-black uppercase tracking-[0.2em]">TOTAL</span>
                <span className="text-2xl font-black">RS. {money(payable)}</span>
              </div>

              <button
                type="button"
                disabled={!items.length}
                onClick={goCheckout}
                className="mt-5 flex h-12 w-full items-center justify-center bg-black text-xs font-black uppercase tracking-[0.24em] text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
              >
                CHECKOUT
              </button>

              <p className="mt-4 text-[10px] font-bold uppercase leading-5 tracking-[0.12em] text-black/45">
                SECURE CHECKOUT. EASY EXCHANGE SUPPORT. CURATED BY OATCLUB.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Row({ label, value, muted = false, strike = false }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className={muted ? "text-black/45" : "text-black/60"}>{label}</span>
      <span className={`${strike ? "line-through" : ""} text-right text-black`}>{value}</span>
    </div>
  );
}
