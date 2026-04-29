"use client";

import { useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ArrowRight, Sparkles } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { pushEcomEvent } from "@/components/tracking/gtm";
import { mapItem } from "@/components/tracking/ga4Mapper";
import { trackMeta } from "@/lib/meta/track";
import { useCouponStore } from "@/store/couponStore";

const BRAND = "#111111";

const money = (n) => {
  const num = Number(n);
  if (!Number.isFinite(num)) return "0";
  return num.toLocaleString("en-IN");
};

const isNumericLike = (v) => {
  const s = String(v ?? "").trim();
  return s.length > 0 && /^[0-9]+$/.test(s);
};

const safeColorLabel = (v) => {
  const s = String(v ?? "").trim();
  if (!s || isNumericLike(s)) return ""; // ✅ treat productCode as no-color
  return s;
};

// optional: only apply dot background if looks like a css color
const looksLikeCssColor = (v) => {
  const s = String(v ?? "").trim();
  if (!s) return false;
  return (
    s.startsWith("#") ||
    s.startsWith("rgb") ||
    s.startsWith("hsl") ||
    ["black","white","red","blue","green","yellow","pink","purple","orange","brown","grey","gray","beige","navy","maroon"].includes(s.toLowerCase())
  );
};


const getImageSrc = (item) => {
  const candidates = [item?.image, item?.thumbnail, item?.images?.[0]?.src, item?.images?.[0], item?.productSnapshot?.thumbnail, item?.productSnapshot?.images?.[0]];
  const src = candidates.find((v) => typeof v === "string" && v.trim().length > 0);
  return src || null;
};

const ga4CartItem = (it) =>
  mapItem(
    {
      _id: it?.productId || it?.id || it?._id,
      id: it?.productId || it?.id || it?._id,
      name: it?.name,
      title: it?.name,
      price: Number(it?.price ?? 0) || 0,
      category: it?.productSnapshot?.category || "",
variant: [it?.selectedSize, safeColorLabel(it?.selectedColor)]
  .filter(Boolean)
  .join(" / "),
      sku: it?.variant?.sku || it?.productSnapshot?.sku || "",
    },
    Number(it?.qty ?? it?.quantity ?? 1)
  );

function GlassCard({ children, className = "" }) {
  return <div className={`bg-white/75 backdrop-blur-xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.06)] ${className}`}>{children}</div>;
}

function QtyStepper({ value, onDec, onInc }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white/70 px-2 py-1 shadow-[0_8px_18px_rgba(0,0,0,0.06)]">
      <button type="button" onClick={onDec} className="grid place-items-center size-9 rounded-xl bg-black/4 hover:bg-black/6 active:scale-[0.98] transition" aria-label="Decrease quantity">
        <Minus className="w-4 h-4 text-gray-900" />
      </button>
      <div className="min-w-10 text-center text-sm font-semibold tabular-nums text-gray-900">{value}</div>
      <button type="button" onClick={onInc} className="grid place-items-center size-9 rounded-xl bg-black/4 hover:bg-black/6 active:scale-[0.98] transition" aria-label="Increase quantity">
        <Plus className="w-4 h-4 text-gray-900" />
      </button>
    </div>
  );
}

export default function CartPage() {
  const router = useRouter();
  const pathname = usePathname();
  const lastViewCartRef = useRef({ key: null, at: 0 });
  const skipAbandonRef = useRef(false);
  const { decreaseQty, updateQty, removeFromCart } = useCartStore();

  const items = useCartStore((s) => s.items) || [];

  useEffect(() => {
  try {
    const cartItems = useCartStore.getState().getCouponCartItems?.();

    console.log("🧪 ================================");
    console.log("🧪 RAW CART ITEMS:", items);
    console.log("🧪 COUPON CART ITEMS:", cartItems);

    if (Array.isArray(cartItems)) {
      cartItems.forEach((it, idx) => {
        console.log(`🧪 ITEM ${idx + 1}`, {
          title: it.title,
          productCode: it.productCode,
          isPrimaryProduct: it.isPrimaryProduct,
          categories: it.categories,
          collections: it.collections,
        });
      });
    }

    console.log("🧪 ================================");
  } catch (e) {
    console.warn("❌ COUPON DEBUG FAILED", e);
  }
}, [items]);

  const initialize = useCartStore((s) => s.initialize);
  const totalPriceFn = useCartStore((s) => s.totalPrice);
  const totalCompareAtPriceFn = useCartStore((s) => s.totalCompareAtPrice);
  const totalSavingsFn = useCartStore((s) => s.totalSavings);

  const updateQtyFn = useCartStore((s) => s.updateQty);
  const removeFn = useCartStore((s) => s.removeFromCart);

  const user = useAuthStore((s) => s.user);
  const customer = useAuthStore((s) => s.customer);
  const initAuth = useAuthStore((s) => s.initialize);

  const coupon = useCouponStore((s) => s.coupon);
const couponFinalTotal = useCouponStore((s) => s.finalTotal);
const couponDiscount = useCouponStore((s) => s.discount);
const couponEligibleTotal = useCouponStore((s) => s.eligibleTotal);
const couponBreakdown = useCouponStore((s) => s.discountBreakdown);
const removeCoupon = useCouponStore((s) => s.removeCoupon);

  const hasCoupon = Boolean(coupon?.code);

  useEffect(() => {
    // ✅ only hydrate if items are empty (avoid overwrite after addToCart)
    if (!items?.length) initialize?.();
    initAuth?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subtotal = useMemo(() => (typeof totalPriceFn === "function" ? totalPriceFn() : 0), [totalPriceFn, items?.length]);
  const totalCompareAt = useMemo(
    () => (typeof totalCompareAtPriceFn === "function" ? totalCompareAtPriceFn() : 0),
    [totalCompareAtPriceFn, items?.length]
  );

  const totalSavings = useMemo(
    () => (typeof totalSavingsFn === "function" ? totalSavingsFn() : 0),
    [totalSavingsFn, items?.length]
  );

  const payableTotal = useMemo(() => {
    if (hasCoupon && couponFinalTotal != null) return Number(couponFinalTotal) || 0;
    return Number(subtotal) || 0;
  }, [hasCoupon, couponFinalTotal, subtotal]);

  const itemCount = useMemo(() => (items || []).reduce((sum, it) => sum + Number(it?.qty || it?.quantity || 0), 0), [items]);

  const isLoggedIn = Boolean(user?.uid && customer?._id);

  const itemKey = (item) =>
    String(
      item?.__key ||
      `${String(item?.productId || item?.id || "")}__${String(item?.variantId || "")}`
    );

  const updateQtySafe = (item, nextQty) => {
    const qty = Math.max(1, Number(nextQty || 1));
    const key = itemKey(item); // ✅ always correct key

    try {
      updateQtyFn?.(key, qty);
    } catch {
      updateQtyFn?.(item?.productId || item?.id, qty, item?.variantId);
    }
  };


  const removeSafe = (item) => {
    const key = itemKey(item);

    try {
      removeFn?.(key);
    } catch {
      removeFn?.(item?.productId || item?.id, item?.variantId);
    }
  };


  const getLineUnitPrice = (item) => {
    const p = item?.price ?? item?.productSnapshot?.price;
    const n = typeof p === "string" ? Number(String(p).replace(/[₹,]/g, "")) : Number(p);
    return Number.isFinite(n) ? n : 0;
  };

  const getItemName = (item) => item?.name || item?.productSnapshot?.title || item?.productSnapshot?.name || "Product";

  const goCheckout = () => {
    if (!items.length) return;
    skipAbandonRef.current = true;
    router.push("/checkout");
  };

 

 

  useEffect(() => {
    try {
      if (!items?.length) return;

      const contents = items
        .map((it) => {
          const id = it?.productId || it?.productSnapshot?.sku;
          if (!id) return null;
          const quantity = Number(it?.qty ?? it?.quantity ?? 1) || 1;
          const item_price = Number(it?.price ?? 0) || 0;
          return { id: String(id), quantity, item_price };
        })
        .filter(Boolean);

      if (!contents.length) return;

      const value = contents.reduce((s, c) => s + c.item_price * c.quantity, 0);
      const key = `cart_${contents.slice(0, 20).map((c) => c.id).join("_")}_${value}`;
      const now = Date.now();

      if (lastViewCartRef.current.key === key && now - (lastViewCartRef.current.at || 0) < 2000) return;
      lastViewCartRef.current = { key, at: now };

      pushEcomEvent("view_cart", { currency: "INR", value, items: items.slice(0, 50).map(ga4CartItem) });

      Promise.resolve(trackMeta("ViewCart", { currency: "INR", value, content_type: "product", content_ids: contents.map((c) => c.id), contents, num_items: contents.reduce((s, c) => s + (c.quantity || 0), 0) })).catch(() => { });
    } catch (e) {
      console.warn("view_cart failed", e);
    }
  }, [items]);

  useEffect(() => {
    if (!hasCoupon) return;
    if (couponFinalTotal == null) return;
    if (Number(couponFinalTotal) > Number(subtotal)) removeCoupon?.();
  }, [subtotal, hasCoupon, couponFinalTotal, removeCoupon]);

  return (
    <section className="min-h-[80vh] bg-[#F6F6F8]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-linear-to-b from-black/6 to-transparent" />

      <div className="relative w-full px-4 sm:px-6 lg:px-10 py-8 sm:py-10">
        <GlassCard className="rounded-[22px] p-4 sm:p-5 mb-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs tracking-wide text-gray-500">Shopping Bag</p>
              <div className="flex flex-wrap items-end gap-x-3 gap-y-1 mt-1">
                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">Your Cart</h1>
                <span className="text-gray-400 font-medium text-sm sm:text-base">({itemCount} {itemCount === 1 ? "item" : "items"})</span>
              </div>
              <p className="mt-1 text-sm text-gray-500">Review items and proceed to a secure checkout.</p>
<p className="mt-1 text-sm text-gray-500">
  You can apply coupons during checkout.
</p>            </div>

            <div className="flex items-center gap-2">
              <Link href="/shop" className="inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold border border-black/10 bg-white/70 hover:bg-white transition">
                Continue shopping <ArrowRight className="w-4 h-4 ml-2" />
              </Link>

              <button
                type="button"
                disabled={!items.length}
                onClick={goCheckout}
                className="inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(34,197,94,0.35)] active:scale-[0.99] transition disabled:opacity-50 disabled:shadow-none"
                style={{ backgroundColor: BRAND }}
              >
                Checkout
              </button>

            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
          <div className="lg:col-span-8">
            <GlassCard className="rounded-[22px] overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-black/5 flex items-center justify-between">
                <div className="text-sm font-semibold text-gray-900">Items</div>
                <div className="text-xs text-gray-500">Tap + / − to update quantity</div>
              </div>

              {items.length === 0 ? (
                <div className="p-8 sm:p-10 text-center">
                  <div className="mx-auto mb-3 grid place-items-center size-14 rounded-2xl bg-black/4">
                    <Sparkles className="w-6 h-6 text-gray-700" />
                  </div>
                  <p className="text-gray-900 font-semibold">Your cart is empty</p>
                  <p className="text-sm text-gray-500 mt-1">Add something you love — it’ll show up here.</p>
                  <Link href="/shop" className="mt-5 inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(128,0,32,0.25)] active:scale-[0.99] transition" style={{ backgroundColor: BRAND }}>
                    Browse products
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-black/5">
                  {items.map((item) => {
  const src = getImageSrc(item);
  const qty = Math.max(1, Number(item?.qty ?? item?.quantity ?? 1));
  const price = getLineUnitPrice(item);

  const mrp =
    Number(item?.compareAtPrice ?? item?.productSnapshot?.compareAtPrice ?? 0) ||
    0;
  const showMrp = mrp > price;
  const discountPercent = showMrp
    ? Math.round(((mrp - price) / mrp) * 100)
    : 0;

  const name = getItemName(item);

  // ✅ helper for slug
  const slugify = (str = "") =>
    String(str)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  // ✅ product routing details
  const productId = item?.productId || item?.id || item?._id;
  const category = item?.productSnapshot?.category || "all";
  const productName = slugify(name);

  const goToProduct = () => {
    if (!productId) return;
    router.push(`/category/${slugify(category)}/${productName}/${productId}`);
  };

  return (
    <div
      key={itemKey(item)}
      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4"
    >
      {/* ✅ CLICKABLE AREA */}
      <div
        onClick={goToProduct}
        className="cursor-pointer flex items-center gap-4 min-w-0 flex-1"
      >
        <div className="relative w-[84px] h-[104px] sm:w-[92px] sm:h-28 overflow-hidden rounded-[18px] bg-black/4 border border-black/5 shadow-[0_10px_18px_rgba(0,0,0,0.05)]">
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
                {(item?.selectedSize || item?.variant?.size) && (
                  <span className="text-[11px] px-2 py-1 rounded-xl bg-black/4 border border-black/5 text-gray-700">
                    Size:{" "}
                    {String(item?.selectedSize || item?.variant?.size).toUpperCase()}
                  </span>
                )}

                {(() => {
  const color = safeColorLabel(item?.selectedColor);
  if (!color) return null;

  const dotColor = looksLikeCssColor(color) ? color : null;

  return (
    <span className="text-[11px] px-2 py-1 rounded-xl bg-black/4 border border-black/5 text-gray-700 flex items-center gap-1">
      {dotColor ? (
        <span
          className="h-3 w-3 rounded-full border border-black/10"
          style={{ backgroundColor: dotColor }}
        />
      ) : null}
      Color: {color.replace(/-/g, " ")}
    </span>
  );
})()}


                <div className="flex flex-wrap items-center gap-2">
                  {showMrp && (
                    <span className="text-[11px] px-2 py-1 rounded-xl bg-black/4 border border-black/5 text-gray-700 line-through">
                      ₹{money(mrp)}
                    </span>
                  )}

                  <span className="text-[11px] px-2 py-1 rounded-xl bg-black/4 border border-black/5 text-gray-700">
                    ₹{money(price)} each
                  </span>

                  {discountPercent > 0 && (
                    <span className="text-[11px] px-2 py-1 rounded-xl bg-green-50 border border-green-200 text-green-700 font-semibold">
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>

                {showMrp && (
                  <p className="text-[12px] text-green-700 mt-1">
                    You save ₹{money((mrp - price) * qty)}
                  </p>
                )}
              </div>
            </div>

            {/* ✅ REMOVE BUTTON (mobile) with stopPropagation */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeSafe(item);
              }}
              className="sm:hidden grid place-items-center size-9 rounded-2xl border border-black/10 bg-white/70 hover:bg-white active:scale-[0.98] transition"
              aria-label="Remove from cart"
              title="Remove"
            >
              <Trash2 className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* ✅ MOBILE QTY STEPPER with stopPropagation */}
          <div className="mt-3 sm:hidden flex items-center justify-between">
            <div onClick={(e) => e.stopPropagation()}>
              <QtyStepper
                value={qty}
                onDec={() => decreaseQty(itemKey(item))}
                onInc={() => updateQtySafe(item, qty + 1)}
              />
            </div>

            <div className="text-right">
              <div className="text-[11px] text-gray-500">Total</div>
              <div
                className="text-base font-semibold tabular-nums"
                style={{ color: BRAND }}
              >
                ₹{money(price * qty)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ DESKTOP QTY + REMOVE (NOT CLICKABLE) */}
      <div className="hidden sm:flex items-center justify-end gap-4 ml-auto">
        <div onClick={(e) => e.stopPropagation()}>
          <QtyStepper
            value={qty}
            onDec={() => decreaseQty(itemKey(item))}
            onInc={() => updateQtySafe(item, qty + 1)}
          />
        </div>

        <div className="text-right min-w-[120px]">
          <div className="text-xs text-gray-500">Total</div>
          <div
            className="text-lg font-semibold tabular-nums"
            style={{ color: BRAND }}
          >
            ₹{money(price * qty)}
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            removeSafe(item);
          }}
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

          <div className="lg:col-span-4">
            {/* <div className="mb-4 md:mb-6"><ApplyCoupon cartTotal={subtotal} /></div> */}

            <div className="lg:sticky lg:top-6">
              <GlassCard className="rounded-[22px] overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-black/5">
                  <h2 className="text-base font-semibold text-gray-900">Order Summary</h2>
                  <p className="text-xs text-gray-500 mt-1">Taxes calculated at checkout (if applicable).</p>
                </div>

                <div className="p-4 sm:p-5 space-y-3">
                  {totalCompareAt > subtotal && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">MRP Total</span>
                      <span className="font-semibold tabular-nums text-gray-900 line-through">
                        ₹{money(totalCompareAt)}
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


                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold text-green-600">Free</span>
                  </div>

                {hasCoupon && Number(couponDiscount || 0) > 0 && (
  <div className="rounded-2xl bg-green-50 p-3 ring-1 ring-green-100">
    <div className="flex items-center justify-between text-sm">
      <span className="text-green-800">
        Coupon {coupon?.code ? `(${coupon.code})` : ""}
      </span>
      <span className="font-semibold tabular-nums text-green-700">
        -₹{money(couponDiscount)}
      </span>
    </div>

    {Number(couponEligibleTotal || 0) > 0 && (
      <p className="mt-1 text-[11px] text-green-700/80">
        Applied on eligible items worth ₹{money(couponEligibleTotal)}
      </p>
    )}

    {Array.isArray(couponBreakdown) && couponBreakdown.length > 0 && (
      <div className="mt-2 space-y-1">
        {couponBreakdown.slice(0, 3).map((row, idx) => (
          <div
            key={`${row.productId || row.productCode || idx}`}
            className="flex items-center justify-between gap-3 text-[11px] text-green-800/80"
          >
            <span className="truncate">
              {row.title || row.productCode || "Item"}
            </span>
            <span className="shrink-0 font-medium">
              -₹{money(row.discount)}
            </span>
          </div>
        ))}

        {couponBreakdown.length > 3 && (
          <p className="text-[11px] text-green-700/70">
            +{couponBreakdown.length - 3} more eligible item(s)
          </p>
        )}
      </div>
    )}

    <button
      type="button"
      onClick={() => removeCoupon?.()}
      className="mt-2 text-[11px] font-semibold text-green-900 underline underline-offset-4"
    >
      Remove coupon
    </button>
  </div>
)}

                  <div className="h-px bg-black/5 my-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">Total</span>
                    <span className="text-xl font-semibold tabular-nums" style={{ color: BRAND }}>₹{money(payableTotal)}</span>
                  </div>


                  <button
                    type="button"
                    disabled={!items.length}
                    onClick={goCheckout}
                    className="mt-3 w-full rounded-2xl px-4 py-3 text-sm sm:text-base font-semibold text-white shadow-[0_14px_28px_rgba(34,197,94,0.35)] active:scale-[0.99] transition disabled:opacity-50 disabled:shadow-none"
                    style={{ backgroundColor: BRAND }}
                  >
                    Proceed to Checkout
                  </button>


                  <div className="text-[11px] text-gray-500 leading-relaxed">
                    By placing your order, you agree to our <Link href="/terms-and-conditions" className="text-gray-900 underline underline-offset-4">Terms</Link> & <Link href="/privacy-policy" className="text-gray-900 underline underline-offset-4">Privacy Policy</Link>.
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
