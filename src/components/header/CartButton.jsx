"use client";

import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { trackMeta } from "@/lib/meta/track";
import { pushEcomEvent } from "@/components/tracking/gtm";
import { mapItem } from "@/components/tracking/ga4Mapper";

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

function getImageSrc(item) {
  const src = [item?.image, item?.thumbnail, item?.productSnapshot?.thumbnail, item?.variant?.image, item?.images?.[0]?.src, item?.images?.[0], item?.productSnapshot?.images?.[0]].find((v) => typeof v === "string" && v.trim());
  return src || null;
}

const cartItemKey = (item, index) => item?.__key || `${String(item?.productId || item?.id || item?._id || "p")}__${String(item?.variantId || "")}` || `idx-${index}`;

export default function CartButton() {
  const router = useRouter();
  const dropdownRef = useRef(null);

  const items = useCartStore((s) => s.items) || [];
  const totalCount = useCartStore((s) => s.totalCount);

  const cartCount = useMemo(() => (typeof totalCount === "function" ? totalCount() : items.reduce((sum, i) => sum + (Number(i?.quantity) || 0), 0)), [items, totalCount]);

  const [open, setOpen] = useState(false);
  const [animate, setAnimate] = useState(false);

  const lastViewCartRef = useRef({ key: null, at: 0 });

  const fireViewCart = useCallback(async () => {
    try {
      const cartItems = useCartStore.getState().items || [];
      if (!cartItems.length) return;

      const metaContents = cartItems
        .map((it) => {
          const id = it?.productId || it?.id || it?._id;
          if (!id) return null;
          return { id: String(id), quantity: Number(it?.quantity || 1), item_price: Number(it?.price || 0) };
        })
        .filter(Boolean);

      if (!metaContents.length) return;

      const value = metaContents.reduce((sum, c) => sum + (Number(c.item_price) || 0) * (Number(c.quantity) || 1), 0);
      const key = `viewcart_${metaContents.map((c) => c.id).join("_")}_${value}`;
      const now = Date.now();
      if (lastViewCartRef.current.key === key && now - (lastViewCartRef.current.at || 0) < 2000) return;
      lastViewCartRef.current = { key, at: now };

      // ✅ GA4: view_cart
      try {
        pushEcomEvent("view_cart", { currency: "INR", value, items: cartItems.slice(0, 50).map(ga4CartItem) });
      } catch (e) {
        console.warn("📈 GA4 view_cart failed", e);
      }

      // ✅ Meta: ViewCart
      await trackMeta("ViewCart", { currency: "INR", value, content_type: "product", content_ids: metaContents.map((c) => c.id), contents: metaContents, num_items: metaContents.reduce((s, c) => s + (c.quantity || 0), 0) });
    } catch (e) {
      console.warn("🧾 ViewCart tracking failed", e);
    }
  }, []);

  useEffect(() => {
    if (!cartCount) return;
    setAnimate(true);
    const t = window.setTimeout(() => setAnimate(false), 450);
    return () => window.clearTimeout(t);
  }, [cartCount]);

  useEffect(() => {
    const onClick = (e) => dropdownRef.current && !dropdownRef.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const isCoarsePointer = useMemo(() => (typeof window === "undefined" ? false : window.matchMedia?.("(pointer: coarse)")?.matches ?? false), []);

  const goToCart = useCallback(() => {
    setOpen(false);
    router.push("/cart");
  }, [router]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button type="button" onClick={goToCart} onMouseEnter={!isCoarsePointer ? () => { setOpen(true); fireViewCart(); } : undefined} className="relative p-1" aria-label="Cart" title="Cart">
        <ShoppingBag className={`w-6 h-6 transition-all duration-300 hover:text-black ${animate ? "scale-[1.15] text-black" : "text-gray-700"}`} />
        {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[10px] font-medium rounded-full min-w-[18px] h-[18px] flex items-center justify-center shadow-sm">{cartCount}</span>}
      </button>

      {open && !isCoarsePointer && (
        <div onMouseLeave={() => setOpen(false)} onMouseEnter={() => { setOpen(true); fireViewCart(); }} className="absolute right-0 mt-3 w-72 bg-white shadow-xl border border-gray-200 rounded-xl p-4 z-50 animate-[fadeIn_.25s_ease-out]">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Cart Items</h3>

          {items.length === 0 ? (
            <p className="text-gray-500 text-sm py-2">Your cart is empty.</p>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-3">
              {items.map((item, idx) => {
                const src = getImageSrc(item);
                const qty = item?.quantity ?? 1;
                return (
                  <div key={cartItemKey(item, idx)} className="flex items-center gap-3 border-b border-gray-100 pb-2">
                    {src ? <img src={src} alt={item?.name || "Product"} className="w-12 h-12 rounded-md object-cover bg-gray-100" loading="lazy" /> : <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center text-[10px] text-gray-500">No image</div>}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item?.name || "Product"}</p>
                      <p className="text-xs text-gray-500">Qty: {qty} × ₹{item?.price ?? 0}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <button type="button" onClick={goToCart} className="w-full bg-black text-white py-2 mt-4 rounded-lg text-sm font-medium hover:bg-black/90 active:scale-95 transition">
            Go to Cart
          </button>
        </div>
      )}
    </div>
  );
}
