"use client";

import { create } from "zustand";
import Cookies from "js-cookie";
import { notify } from "@/lib/notify";
import { useAnalyticsStore } from "@/store/analyticsStore";
import { useAbandonedCartStore } from "@/store/abandonedCartStore";
import { useAuthStore } from "@/store/authStore";

const KEY = "cart_products";

/* ---------------- helpers ---------------- */
const str = (v) => (v == null ? "" : String(v));
const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const extractSize = (variant) => {
  const attrs = Array.isArray(variant?.attributes) ? variant.attributes : [];
  const size = attrs.find((a) => str(a?.key).toLowerCase() === "size")?.value;
  return size ? str(size) : "";
};

const cartKey = (item) => {
  const pid = str(item?.productId || item?.id || item?._id);
  const vid = str(item?.variantId || item?.variant?._id || "");
  return `${pid}__${vid}`; // ✅ variants separate in cart automatically
};

const getDisplayName = (p) => p?.name || p?.title || "Item";

const toAbandonedItems = (items = []) =>
  items.map((it) => ({
    productId: it.productId,
    variantId: it.variantId || null,
    qty: it.quantity,
  }));

/**
 * ✅ Build a stable cart item from backend product + selected variantId/size
 * Input `product` should be the normalized product from productStore.
 */
const buildCartItem = ({ product, qty = 1, variantId = null, selectedSize = null }) => {
  if (!product) return null;

  const productId = str(product.productId || product.id || product._id);
  if (!productId) return null;

  const productType = product.productType || (Array.isArray(product.variants) && product.variants.length ? "variable" : "simple");

  // find variant (by id OR by selectedSize)
  let variant = null;
  const variants = Array.isArray(product.variants) ? product.variants : [];

  if (variantId) {
    variant = variants.find((v) => str(v?._id) === str(variantId)) || null;
  } else if (selectedSize) {
    const s = str(selectedSize).toLowerCase();
    variant = variants.find((v) => extractSize(v).toLowerCase() === s) || null;
    variantId = variant?._id ? str(variant._id) : null;
  }

  // enforce: variable => must have variantId
  if (productType === "variable" && !variantId) return { __error: "variant_required" };

  const unitPrice = variant && toNum(variant.price) > 0 ? toNum(variant.price) : toNum(product.price);
  const compareAtPrice =
    variant?.compareAtPrice != null ? toNum(variant.compareAtPrice) : product.compareAtPrice != null ? toNum(product.compareAtPrice) : null;

  const safeQty = Math.max(1, toNum(qty) || 1);

  // ✅ snapshot fields to send in createOrder (optional but helpful)
  const snapshot = {
    productCode: str(product.productCode),
    title: str(product.name || product.title),
    slug: str(product.slug),
    thumbnail: str(product.thumbnail || product.image || ""),
    images: Array.isArray(product.images) ? product.images : [],
    category: str(product.categoryId || ""),
    subcategory: str(product.subcategoryId || ""),
    productType,
    sku: str(product.sku || ""),
    tags: Array.isArray(product.tags) ? product.tags : [],
    weight: toNum(product.weight),
    currency: str(product.currency || "INR"),
  };

  const variantSnapshot = variantId
    ? {
        variantId: str(variantId),
        sku: str(variant?.sku || ""),
        attributes: Array.isArray(variant?.attributes)
          ? variant.attributes
              .filter((a) => a?.key != null && a?.value != null)
              .map((a) => ({ key: str(a.key), value: str(a.value) }))
          : [],
        image: str(variant?.image || snapshot.thumbnail || ""),
        weight: toNum(variant?.weight),
      }
    : null;

 const item = {
  // ✅ REQUIRED FOR BACKEND ORDER
  productId,
  productType, // 🔥 IMPORTANT: used to validate variable products at checkout
  variantId: variantSnapshot?.variantId || null,
  quantity: safeQty,

  // ✅ UI convenience
  name: snapshot.title,
  slug: snapshot.slug,
  image: snapshot.thumbnail,
  price: unitPrice,
  compareAtPrice,

  // ✅ selection info (used in UI + debug)
  selectedSize: selectedSize
    ? str(selectedSize)
    : variant
    ? extractSize(variant)
    : "",

  // ✅ snapshots (used by backend Order schema)
  productSnapshot: snapshot,
  variant: variantSnapshot,

  __key: "", // filled below
};


  item.__key = cartKey(item);
  return item;
};

export const useCartStore = create((set, get) => ({
  items: [],

  /* ---------------- INIT ---------------- */
  initialize: () => {
    if (typeof window === "undefined") return;

    const stored = Cookies.get(KEY);
    if (!stored) return;

    try {
      const data = JSON.parse(stored);
      if (!Array.isArray(data)) return;

      const normalized = data
        .map((it) => ({
          ...it,
          productId: str(it.productId || it.id || it._id),
          variantId: it.variantId ? str(it.variantId) : null,
          quantity: Math.max(1, toNum(it.quantity || it.qty || 1)),
        }))
        .map((it) => ({
          ...it,
          qty: undefined, // remove old field
          __key: it.__key || cartKey(it),
        }));

      set({ items: normalized });
    } catch (e) {
      console.error("❌ Cart cookie parse error:", e);
    }
  },

  /* ---------------- ADD ----------------
     Call like:
     addToCart({ product, qty: 1, variantId, selectedSize })
  */
  addToCart: ({ product, qty = 1, variantId = null, selectedSize = null }) => {
  const built = buildCartItem({ product, qty, variantId, selectedSize });

  if (!built) return;
  if (built.__error === "variant_required") {
    notify?.error?.("Please select a size first");
    return;
  }

  const key = built.__key;
  const curr = get().items || [];

  const exists = curr.find((p) => (p.__key || cartKey(p)) === key);

  const updated = exists
    ? curr.map((p) => {
        const pk = p.__key || cartKey(p);
        if (pk !== key) return p;
        const nextQty = Math.max(
          1,
          toNum(p.quantity || 1) + toNum(built.quantity || 1)
        );
        return { ...p, ...built, quantity: nextQty, __key: pk };
      })
    : [{ ...built }, ...curr];

  /* ---------------- SAVE CART ---------------- */
  set({ items: updated });
  Cookies.set(KEY, JSON.stringify(updated), { expires: 7 });

  const newQty =
    updated.find((p) => (p.__key || cartKey(p)) === key)?.quantity ||
    built.quantity;

  /* ---------------- UI FEEDBACK ---------------- */
  if (exists) {
    notify.cartQtyUpdated?.(built, newQty);
  } else {
    notify.cartAdded?.(built);

    /* ---------------- ANALYTICS ---------------- */
    try {
      useAnalyticsStore.getState().trackAddToCart(product?._id);
    } catch (e) {
      console.warn("📊 Analytics cart_add failed", e);
    }
  }

  /* ------------------------------------------------
     🛒 ABANDONED CART SNAPSHOT (🔥 IMPORTANT)
  ------------------------------------------------- */
  try {
    const abandoned = useAbandonedCartStore.getState();
    const auth = useAuthStore.getState();

    abandoned.upsertCart({
      cartId: auth.activeCartId || "", // optional but helps linking
      items: updated.map((it) => ({
        productId: it.productId,
        variantId: it.variantId || null,
        qty: it.quantity,
      })),
      context: {
        lastPageUrl: window.location.href,
        device: window.innerWidth < 768 ? "mobile" : "desktop",
      },
    });
  } catch (e) {
    console.warn("🛒 Abandoned cart snapshot failed (addToCart)", e);
  }
},



  /* ---------------- REMOVE ---------------- */
  removeFromCart: (idOrKey, variantId = null) => {
  const curr = get().items || [];
  const key = str(idOrKey).includes("__")
    ? str(idOrKey)
    : `${str(idOrKey)}__${str(variantId || "")}`;

  const removed = curr.find((p) => (p.__key || cartKey(p)) === key);
  const updated = curr.filter((p) => (p.__key || cartKey(p)) !== key);

  set({ items: updated });
  Cookies.set(KEY, JSON.stringify(updated), { expires: 7 });

  if (removed) notify.cartRemoved?.(removed);
  else notify.info?.(`Removed: ${getDisplayName({ id: idOrKey })}`);

  /* 🔥 Abandoned cart snapshot */
  try {
    const abandoned = useAbandonedCartStore.getState();
    const auth = useAuthStore.getState();

    abandoned.upsertCart({
      cartId: auth.activeCartId || "",
      items: updated.map((it) => ({
        productId: it.productId,
        variantId: it.variantId || null,
        qty: it.quantity,
      })),
      context: {
        lastPageUrl: window.location.href,
        device: window.innerWidth < 768 ? "mobile" : "desktop",
      },
    });
  } catch (e) {
    console.warn("🛒 Abandoned snapshot failed (removeFromCart)", e);
  }
},


  /* ---------------- UPDATE QTY ---------------- */
  updateQty: (idOrKey, qty, variantId = null) => {
  let nextQty = toNum(qty);
  const curr = get().items || [];

  const key = str(idOrKey).includes("__")
    ? str(idOrKey)
    : `${str(idOrKey)}__${str(variantId || "")}`;

  const item = curr.find((p) => (p.__key || cartKey(p)) === key);
  if (!item) return;

  /* ---------------- REMOVE IF ZERO ---------------- */
  if (nextQty <= 0) {
    const updated = curr.filter((p) => (p.__key || cartKey(p)) !== key);

    set({ items: updated });
    Cookies.set(KEY, JSON.stringify(updated), { expires: 7 });

    notify.cartRemoved?.(item);

    /* 🔥 Abandoned cart snapshot */
    try {
      const abandoned = useAbandonedCartStore.getState();
      const auth = useAuthStore.getState();

      abandoned.upsertCart({
        cartId: auth.activeCartId || "",
        items: updated.map((it) => ({
          productId: it.productId,
          variantId: it.variantId || null,
          qty: it.quantity,
        })),
        context: {
          lastPageUrl: window.location.href,
          device: window.innerWidth < 768 ? "mobile" : "desktop",
        },
      });
    } catch (e) {
      console.warn("🛒 Abandoned snapshot failed (qty->remove)", e);
    }

    return;
  }

  if (nextQty < 1) nextQty = 1;

  /* ---------------- UPDATE QTY ---------------- */
  const updated = curr.map((p) => {
    const pk = p.__key || cartKey(p);
    return pk === key ? { ...p, quantity: nextQty, __key: pk } : p;
  });

  set({ items: updated });
  Cookies.set(KEY, JSON.stringify(updated), { expires: 7 });

  notify.cartQtyUpdated?.(item, nextQty);

  /* 🔥 Abandoned cart snapshot */
  try {
    const abandoned = useAbandonedCartStore.getState();
    const auth = useAuthStore.getState();

    abandoned.upsertCart({
      cartId: auth.activeCartId || "",
      items: updated.map((it) => ({
        productId: it.productId,
        variantId: it.variantId || null,
        qty: it.quantity,
      })),
      context: {
        lastPageUrl: window.location.href,
        device: window.innerWidth < 768 ? "mobile" : "desktop",
      },
    });
  } catch (e) {
    console.warn("🛒 Abandoned snapshot failed (updateQty)", e);
  }
},


  /* ---------------- CLEAR ---------------- */
  clearCart: () => {
    set({ items: [] });
    Cookies.remove(KEY);
    notify.cartCleared?.();
  },

  /* ---------------- TOTALS ---------------- */
  totalCount: () => (get().items || []).reduce((s, i) => s + toNum(i.quantity || 0), 0),

  totalPrice: () =>
    (get().items || []).reduce((sum, it) => sum + toNum(it.price) * toNum(it.quantity || 0), 0),

  /* ---------------- ORDER PAYLOAD ----------------
     ✅ use this in checkout when hitting POST /api/orders
  */
  toOrderItems: () =>
    (get().items || []).map((it) => ({
      productId: it.productId,
      quantity: toNum(it.quantity || 1),
      ...(it.variantId ? { variantId: it.variantId } : {}),
    })),
}));
