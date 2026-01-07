"use client";

import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { trackMeta } from "@/lib/meta/track";
import { pushEcomEvent } from "@/components/tracking/gtm";
import { mapItem } from "@/components/tracking/ga4Mapper";

/* ---------- helpers ---------- */

// GA4 item mapper
const ga4CartItem = (it) =>
  mapItem(
    {
      _id: it?.productId || it?.id || it?._id,
      id: it?.productId || it?.id || it?._id,
      name: it?.name,
      title: it?.name,
      price: Number(it?.price ?? 0) || 0,
      category: it?.productSnapshot?.category || "",
      variant: it?.selectedSize || "",
      sku: it?.variant?.sku || it?.productSnapshot?.sku || "",
    },
    Number(it?.quantity || 1)
  );

// find best image source
const getImageSrc = (item) =>
  [
    item?.image,
    item?.thumbnail,
    item?.productSnapshot?.thumbnail,
    item?.variant?.image,
    item?.images?.[0]?.src,
    item?.images?.[0],
    item?.productSnapshot?.images?.[0],
  ].find((v) => typeof v === "string" && v.trim()) || null;

export default function CartButton() {
  const router = useRouter();
  const ref = useRef(null);

  const items = useCartStore((s) => s.items) || [];
  const totalCount = useCartStore((s) => s.totalCount);

  // total cart count
  const cartCount = useMemo(
    () =>
      typeof totalCount === "function"
        ? totalCount()
        : items.reduce((sum, i) => sum + (Number(i?.quantity) || 0), 0),
    [items, totalCount]
  );

  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(false);

  // detect mobile/touch devices (coarse pointer)
  const isMobile = useMemo(
    () =>
      typeof window === "undefined"
        ? false
        : window.matchMedia?.("(pointer: coarse)")?.matches ?? false,
    []
  );

  /* ---------- track ViewCart (GA4 + Meta) with dedupe ---------- */
  const lastRef = useRef({ key: "", at: 0 });

  const fireViewCart = useCallback(async () => {
    const cartItems = useCartStore.getState().items || [];
    if (!cartItems.length) return;

    const contents = cartItems
      .map((it) => {
        const id = it?.productId || it?.id || it?._id;
        if (!id) return null;
        return { id: String(id), quantity: Number(it?.quantity || 1), item_price: Number(it?.price || 0) };
      })
      .filter(Boolean);

    if (!contents.length) return;

    const value = contents.reduce((s, c) => s + c.item_price * c.quantity, 0);
    const key = `${contents.map((c) => c.id).join("_")}_${value}`;
    const now = Date.now();

    // prevent firing multiple times quickly
    if (lastRef.current.key === key && now - lastRef.current.at < 2000) return;
    lastRef.current = { key, at: now };

    // ✅ GA4 view_cart
    try {
      pushEcomEvent("view_cart", { currency: "INR", value, items: cartItems.slice(0, 50).map(ga4CartItem) });
    } catch (e) {
      console.warn("GA4 view_cart failed", e);
    }

    // ✅ Meta ViewCart
    try {
      await trackMeta("ViewCart", {
        currency: "INR",
        value,
        content_type: "product",
        content_ids: contents.map((c) => c.id),
        contents,
        num_items: contents.reduce((s, c) => s + c.quantity, 0),
      });
    } catch (e) {
      console.warn("Meta ViewCart failed", e);
    }
  }, []);

  /* ---------- UI effects ---------- */

  // cart count animation
  useEffect(() => {
    if (!cartCount) return;
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 450);
    return () => clearTimeout(t);
  }, [cartCount]);

  // close dropdown on outside click
  useEffect(() => {
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  /* ---------- actions ---------- */

  const goToCart = () => {
    setOpen(false);
    router.push("/cart");
  };

  // ✅ click: desktop opens dropdown | mobile navigates
  const onCartClick = () => {
    if (isMobile) return goToCart();
    setOpen((s) => !s);
    fireViewCart();
  };

  return (
    <div className="relative" ref={ref}>
      {/* Cart Icon Button */}
      <button
        type="button"
        onClick={onCartClick}
        className="relative p-1"
        aria-label="Cart"
        title="Cart"
      >
        <ShoppingBag
          className={`w-6 h-6 transition-all duration-300 hover:text-black ${
            pulse ? "scale-[1.15] text-black" : "text-gray-700"
          }`}
        />

        {/* Badge */}
        {!!cartCount && (
          <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[10px] font-medium rounded-full min-w-[18px] h-[18px] flex items-center justify-center shadow-sm">
            {cartCount}
          </span>
        )}
      </button>

      {/* Dropdown (Desktop only) */}
      {open && !isMobile && (
        <div className="absolute right-0 mt-3 w-72 bg-white shadow-xl border border-gray-200 rounded-xl p-4 z-50">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Cart Items</h3>

          {!items.length ? (
            <p className="text-gray-500 text-sm py-2">Your cart is empty.</p>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-3">
              {items.map((item, idx) => {
                const src = getImageSrc(item);
                const qty = item?.quantity ?? 1;

                return (
                  <div key={item?.__key || `${idx}`} className="flex items-center gap-3 border-b border-gray-100 pb-2">
                    {/* ✅ next/image */}
                    {src ? (
                      <Image
                        src={src}
                        alt={item?.name || "Product"}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-md object-cover bg-gray-100"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center text-[10px] text-gray-500">
                        No image
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item?.name || "Product"}</p>
                      <p className="text-xs text-gray-500">
                        Qty: {qty} × ₹{item?.price ?? 0}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <button
            type="button"
            onClick={goToCart}
            className="w-full bg-black text-white py-2 mt-4 rounded-lg text-sm font-medium hover:bg-black/90 active:scale-95 transition"
          >
            Go to Cart
          </button>
        </div>
      )}
    </div>
  );
}
