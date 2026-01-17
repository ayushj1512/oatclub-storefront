"use client";

import { create } from "zustand";
import Cookies from "js-cookie";
import { notify } from "@/lib/notify";
import { useAnalyticsStore } from "@/store/analyticsStore";
import { useAbandonedCartStore } from "@/store/abandonedCartStore";
import { useAuthStore } from "@/store/authStore";
import { trackMeta } from "@/lib/meta/track.js"; // adjust path based on your project
import { pushEcomEvent } from "@/components/tracking/gtm";
import { mapItem } from "@/components/tracking/ga4Mapper";
import { useCouponStore } from "@/store/couponStore"; // ✅ adjust path

const KEY = "cart_products";

/* ---------------- helpers ---------------- */
const str = (v) => (v == null ? "" : String(v));
const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const pickAttr = (variant, keys = []) => {
  const attrs = Array.isArray(variant?.attributes) ? variant.attributes : [];
  const keySet = keys.map((k) => str(k).trim().toLowerCase());

  const found = attrs.find((a) =>
    keySet.includes(str(a?.key).trim().toLowerCase())
  );

  return found?.value ? str(found.value) : "";
};

const extractSize = (variant) =>
  pickAttr(variant, ["size", "sizes", "shirt_size"]);

const extractColor = (variant) =>
  pickAttr(variant, ["color", "colour", "color_name"]);


const cartKey = (item) => {
  const pid = str(item?.productId || item?.id || item?._id);

  const vid = str(
    item?.variantId ||
    item?.variant?.variantId ||     // ✅ ADD THIS
    item?.variant?._id || 
    ""
  );

  return `${pid}__${vid}`;
};

const handleCouponOnCartUpdate = async () => {
  try {
    const couponStore = useCouponStore.getState();
    if (couponStore?.isApplied?.()) {
      await couponStore.clearPersistedCoupon(); 
      // ✅ removes coupon + clears localStorage so reload pe rehydrate bhi nahi hoga
    }
  } catch (e) {
    console.warn("⚠️ Failed to clear coupon after cart update", e);
  }
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
const buildCartItem = ({
  product,
  qty = 1,
  variantId = null,
  selectedSize = null,
  selectedColor = null,
}) => {
  if (!product) return null;

  const productId = str(product.productId || product.id || product._id);
  if (!productId) return null;

  const productType =
    product.productType ||
    (Array.isArray(product.variants) && product.variants.length ? "variable" : "simple");

  let variant = null;
  const variants = Array.isArray(product.variants) ? product.variants : [];

  /* ---------------- SANITIZE INPUTS ---------------- */
  const rawSize = str(selectedSize).trim();
  const rawColor = str(selectedColor).trim();

  // ✅ If "color" looks like numeric productCode (e.g. 00131 / 00218) => treat as NO color
  const safeSelectedColor =
    rawColor && /^[0-9]+$/.test(rawColor) ? "" : rawColor;

  const safeSelectedSize = rawSize; // keep as-is (string)

  /* ---------------- FIND VARIANT ---------------- */

  // ✅ 1) If variantId passed → direct match
  if (variantId) {
    variant = variants.find((v) => str(v?._id) === str(variantId)) || null;

    // ✅ normalize variantId if variant found
    variantId = variant?._id ? str(variant._id) : str(variantId);
  }

  // ✅ 2) Else match using size + color (using sanitized color)
  else if (safeSelectedSize || safeSelectedColor) {
    const s = safeSelectedSize.toLowerCase();
    const c = safeSelectedColor.toLowerCase();

    variant =
      variants.find((v) => {
        const vs = extractSize(v).trim().toLowerCase();
        const vc = extractColor(v).trim().toLowerCase();

        if (safeSelectedSize && vs !== s) return false;
        if (safeSelectedColor && vc !== c) return false;

        return true;
      }) || null;

    variantId = variant?._id ? str(variant._id) : null;
  }

  /* ---------------- ENFORCE RULES ---------------- */

  // ✅ enforce: variable must match a real variant
  if (productType === "variable" && !variant) {
    return { __error: "variant_not_found" };
  }

  // ✅ enforce: variable must have variantId
  if (productType === "variable" && !variantId) {
    return { __error: "variant_required" };
  }

  /* ---------------- PRICING ---------------- */

  const unitPrice =
    variant && toNum(variant.price) > 0 ? toNum(variant.price) : toNum(product.price);

  const compareAtPrice =
    variant?.compareAtPrice != null
      ? toNum(variant.compareAtPrice)
      : variant?.mrp != null
      ? toNum(variant.mrp)
      : variant?.regularPrice != null
      ? toNum(variant.regularPrice)
      : product?.compareAtPrice != null
      ? toNum(product.compareAtPrice)
      : product?.mrp != null
      ? toNum(product.mrp)
      : product?.regularPrice != null
      ? toNum(product.regularPrice)
      : null;

  const safeQty = Math.max(1, toNum(qty) || 1);

  /* ---------------- SNAPSHOT ---------------- */

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
    price: unitPrice,
    compareAtPrice,
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
        price: variant?.price != null ? toNum(variant.price) : null,
        compareAtPrice:
          variant?.compareAtPrice != null
            ? toNum(variant.compareAtPrice)
            : variant?.mrp != null
            ? toNum(variant.mrp)
            : null,
      }
    : null;

  /* ---------------- FINAL ITEM ---------------- */

  const item = {
    productId,
    productType,
    variantId: variantSnapshot?.variantId || null,
    quantity: safeQty,

    name: snapshot.title,
    slug: snapshot.slug,
    image: snapshot.thumbnail,

    price: unitPrice,
    compareAtPrice,

    selectedSize: safeSelectedSize
      ? str(safeSelectedSize)
      : variant
      ? extractSize(variant)
      : "",

    // ✅ use sanitized color (never productCode)
    selectedColor: safeSelectedColor
      ? str(safeSelectedColor)
      : variant
      ? extractColor(variant)
      : "",

    productSnapshot: snapshot,
    variant: variantSnapshot,

    __key: "",
  };

  item.__key = `${productId}__${str(item.variantId || "")}`;
  return item;
};




const getCartCurrency = (item, fallback = "INR") =>
  str(item?.productSnapshot?.currency || item?.currency || fallback) || "INR";

const getItemPrice = (item) => toNum(item?.price || item?.productSnapshot?.price || 0);

const toGa4Item = (item, qtyOverride = null) => {
  const variantText = [item?.selectedSize, item?.selectedColor]
    .filter(Boolean)
    .join(" / ");

  const p = {
    _id: item?.productId,
    id: item?.productId,
    name: item?.name,
    title: item?.name,
    price: item?.price,
    sku: item?.variant?.sku || item?.productSnapshot?.sku || "",
    category: item?.productSnapshot?.category || "",
    variant: variantText, // ✅ "M / black"
  };

  return mapItem(p, qtyOverride ?? toNum(item?.quantity || 1));
};
const toGA4ItemFromBuilt = (built, _snapshot, qtyOverride = null) =>
  toGa4Item(built, qtyOverride);

export const useCartStore = create((set, get) => ({
  items: [],
  buyNowItem: null,   // ✅ NEW

  /* ---------------- INIT ---------------- */
initialize: () => {
  if (typeof window === "undefined") return;

  // ✅ helper: remove numeric-only "color" like 00131 / 00218
  const sanitizeColor = (v) => {
    const c = str(v).trim();
    if (!c) return "";
    return /^[0-9]+$/.test(c) ? "" : c;
  };

  /* ---------------- RESTORE CART ITEMS ---------------- */
  const stored = Cookies.get(KEY);

  if (stored) {
    try {
      const data = JSON.parse(stored);

      if (Array.isArray(data)) {
        const normalized = data
          .map((it) => {
            const productId = str(it.productId || it.id || it._id);

            // ✅ normalize variantId with more fallbacks
            const variantId = it.variantId
              ? str(it.variantId)
              : it?.variant?.variantId
              ? str(it.variant.variantId)
              : it?.variant?._id
              ? str(it.variant._id)
              : null;

            const quantity = Math.max(1, toNum(it.quantity || it.qty || 1));

            // ✅ normalize prices (fallbacks)
            const price = toNum(
              it.price ??
                it?.productSnapshot?.price ??
                it?.variant?.price ??
                it?.product?.price ??
                0
            );

            const compareAtPrice =
              it.compareAtPrice != null
                ? toNum(it.compareAtPrice)
                : it?.productSnapshot?.compareAtPrice != null
                ? toNum(it.productSnapshot.compareAtPrice)
                : it?.variant?.compareAtPrice != null
                ? toNum(it.variant.compareAtPrice)
                : it?.variant?.mrp != null
                ? toNum(it.variant.mrp)
                : it?.product?.compareAtPrice != null
                ? toNum(it.product.compareAtPrice)
                : it?.product?.mrp != null
                ? toNum(it.product.mrp)
                : null;

            // ✅ always regenerate correct key
            const __key = `${productId}__${variantId || ""}`;

            // ✅ sanitize selections
            const selectedSize = str(it.selectedSize || "").trim();
            const selectedColor = sanitizeColor(it.selectedColor);

            return {
              ...it,

              productId,
              variantId,
              quantity,

              price,
              compareAtPrice,

              selectedSize,
              selectedColor,

              __key,
            };
          })
          .map((it) => ({
            ...it,
            qty: undefined, // ✅ remove old field
          }));

        set({ items: normalized });
        Cookies.set(KEY, JSON.stringify(normalized), { expires: 7 }); // ✅ rewrite clean cookie
      }
    } catch (e) {
      console.error("❌ Cart cookie parse error:", e);
    }
  }

  /* ---------------- RESTORE BUY NOW ITEM ---------------- */
  const buyNowStored = Cookies.get("buy_now_item");

  if (buyNowStored) {
    try {
      const buyNowItem = JSON.parse(buyNowStored);

      if (buyNowItem && typeof buyNowItem === "object") {
        const productId = str(buyNowItem.productId || buyNowItem.id || buyNowItem._id);

        const variantId = buyNowItem.variantId
          ? str(buyNowItem.variantId)
          : buyNowItem?.variant?.variantId
          ? str(buyNowItem.variant.variantId)
          : buyNowItem?.variant?._id
          ? str(buyNowItem.variant._id)
          : null;

        const quantity = Math.max(1, toNum(buyNowItem.quantity || buyNowItem.qty || 1));

        const price = toNum(
          buyNowItem.price ??
            buyNowItem?.productSnapshot?.price ??
            buyNowItem?.variant?.price ??
            0
        );

        const compareAtPrice =
          buyNowItem.compareAtPrice != null
            ? toNum(buyNowItem.compareAtPrice)
            : buyNowItem?.productSnapshot?.compareAtPrice != null
            ? toNum(buyNowItem.productSnapshot.compareAtPrice)
            : buyNowItem?.variant?.compareAtPrice != null
            ? toNum(buyNowItem.variant.compareAtPrice)
            : buyNowItem?.variant?.mrp != null
            ? toNum(buyNowItem.variant.mrp)
            : null;

        const normalizedBuyNow = {
          ...buyNowItem,

          productId,
          variantId,
          quantity,

          price,
          compareAtPrice,

          selectedSize: str(buyNowItem.selectedSize || "").trim(),
          selectedColor: sanitizeColor(buyNowItem.selectedColor),

          __key: `${productId}__${variantId || ""}`,
        };

        set({ buyNowItem: normalizedBuyNow });
        Cookies.set("buy_now_item", JSON.stringify(normalizedBuyNow), { expires: 1 }); // ✅ rewrite clean cookie
      }
    } catch (e) {
      console.error("❌ BuyNow cookie parse error:", e);
      Cookies.remove("buy_now_item");
    }
  }
},


ensureInCartNoDuplicate: async (builtItem, originalProduct = null) => {
  try {
    const curr = get().items || [];
    const key = builtItem?.__key || cartKey(builtItem);

    const exists = curr.find((p) => (p.__key || cartKey(p)) === key);

    // ✅ already cart me hai -> kuch mat karo (NO qty increment)
    if (exists) return { added: false, item: exists };

    const updated = [{ ...builtItem }, ...curr];

    // ✅ SAVE CART
    set({ items: updated });
    Cookies.set(KEY, JSON.stringify(updated), { expires: 7 });

    // ✅ COUPON CLEAR ON CART UPDATE
    await handleCouponOnCartUpdate();

    // ✅ UI feedback (optional but recommended)
    notify.cartAdded?.(builtItem);

    /* ---------------- ANALYTICS ---------------- */
    try {
      const pid =
        originalProduct?._id ||
        originalProduct?.id ||
        originalProduct?.productId ||
        builtItem?.productId;

      if (pid) useAnalyticsStore.getState().trackAddToCart(pid);
    } catch (e) {
      console.warn("📊 Analytics cart_add failed (buyNow ensure)", e);
    }

    /* ---------------- META (PIXEL + CAPI) ---------------- */
    try {
      const pid =
        originalProduct?.sku ||
        originalProduct?._id ||
        originalProduct?.id ||
        builtItem?.productId;

      const price = Number(builtItem?.price ?? originalProduct?.price ?? 0) || 0;
      const quantity = Number(builtItem?.quantity ?? 1) || 1;

      await trackMeta("AddToCart", {
        content_type: "product",
        content_ids: pid ? [String(pid)] : [],
        contents: pid
          ? [{ id: String(pid), quantity, item_price: price }]
          : [],
        value: price * quantity,
        currency: getCartCurrency(builtItem, originalProduct?.currency || "INR"),
      });
    } catch (e) {
      console.warn("🧾 Meta AddToCart failed (buyNow ensure)", e);
    }

    /* ---------------- GA4: add_to_cart ---------------- */
    try {
      const addQty = Number(builtItem?.quantity ?? 1) || 1;
      const price = Number(builtItem?.price ?? 0) || 0;
      const currency = getCartCurrency(builtItem, originalProduct?.currency || "INR");

      pushEcomEvent("add_to_cart", {
        currency,
        value: price * addQty,
        items: [toGa4Item(builtItem, addQty)],
      });
    } catch (e) {
      console.warn("📈 GA4 add_to_cart failed (buyNow ensure)", e);
    }

    /* ---------------- ABANDONED CART SNAPSHOT ---------------- */
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
      console.warn("🛒 Abandoned cart snapshot failed (buyNow ensure)", e);
    }

    return { added: true, item: builtItem };
  } catch (e) {
    console.warn("❌ ensureInCartNoDuplicate failed", e);
    return { added: false, error: e };
  }
},




setBuyNow: async ({
  product,
  qty = 1,
  variantId = null,
  selectedSize = null,
  selectedColor = null,
}) => {
  const built = buildCartItem({ product, qty, variantId, selectedSize, selectedColor });

  if (!built) return;

  if (built.__error === "variant_required") {
    notify?.error?.("Please select size & color");
    return;
  }

  if (built.__error === "variant_not_found") {
    notify?.error?.("Selected variant not available");
    return;
  }

  // ✅ Buy Now state set
  set({ buyNowItem: { ...built, __originalProduct: product } });
  Cookies.set("buy_now_item", JSON.stringify(built), { expires: 1 });

  // ✅ IMPORTANT: cart me bhi add ho jaye (but duplicate/qty increment nahi)
  await get().ensureInCartNoDuplicate(built, product);
},



clearBuyNow: () => {
  set({ buyNowItem: null });
  Cookies.remove("buy_now_item");
},

  /* ---------------- ADD ----------------
     Call like:
     addToCart({ product, qty: 1, variantId, selectedSize })
  */
addToCart: async ({
  product,
  qty = 1,
  variantId = null,
  selectedSize = null,
  selectedColor = null,
}) => {
  const built = buildCartItem({ product, qty, variantId, selectedSize, selectedColor });

if (!built) return;

if (built.__error === "variant_required") {
  notify?.error?.("Please select size & color");
  return;
}

if (built.__error === "variant_not_found") {
  notify?.error?.("Selected variant not available");
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

        return {
  ...p,
  ...built,

  // ✅ preserve old compareAtPrice if new one missing
  compareAtPrice:
    built.compareAtPrice != null ? built.compareAtPrice : p.compareAtPrice,

  // ✅ preserve old price if new one missing
  price: built.price != null ? built.price : p.price,

  quantity: nextQty,
  __key: pk,
};

      })
    : [{ ...built }, ...curr];

  /* ---------------- SAVE CART ---------------- */
  set({ items: updated });
Cookies.set(KEY, JSON.stringify(updated), { expires: 7 });

await handleCouponOnCartUpdate();


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
  const pid =
    product?._id ||
    product?.id ||
    product?.productId ||
    built?.productId;

  if (pid) useAnalyticsStore.getState().trackAddToCart(pid);
} catch (e) {
  console.warn("📊 Analytics cart_add failed", e);
}


    /* ---------------- META (PIXEL + CAPI) ---------------- */
    try {
      // Safely determine product identifier
      const pid = product?.sku || product?._id || product?.id || built?.productId;

      // Price fallback: built.price > product.price > 0
      const price =
        Number(built?.price ?? product?.price ?? product?.salePrice ?? 0) || 0;

      const quantity = Number(built?.quantity ?? qty ?? 1) || 1;

      const value = price * quantity;

      await trackMeta("AddToCart", {
        content_type: "product",
        content_ids: pid ? [String(pid)] : [],
        contents: pid
          ? [
              {
                id: String(pid),
                quantity,
                item_price: price,
              },
            ]
          : [],
        value,
        currency: "INR", // change if needed
      });
    } catch (e) {
      console.warn("🧾 Meta AddToCart failed", e);
    }
  }

  /* ---------------- GA4: ADD TO CART (🔥 NEW) ---------------- */
  try {
    // Track the quantity that was ADDED this time (delta), not full cart qty
    const addQty = Number(built?.quantity ?? qty ?? 1) || 1;
    const price = Number(built?.price ?? product?.price ?? 0) || 0;
    const value = price * addQty;

   const currency = getCartCurrency(built, product?.currency || "INR");


    pushEcomEvent("add_to_cart", {
      currency,
      value,
      items: [toGa4Item(built, addQty)],

    });
  } catch (e) {
    console.warn("📈 GA4 add_to_cart failed", e);
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


// tocheckout items for buy now,

getCheckoutPayload: () => {
  const buyNow = get().buyNowItem;

  // ✅ if buyNow exists → checkout only that
  if (buyNow) {
    return [
      {
        productId: buyNow.productId,
        quantity: toNum(buyNow.quantity || 1),
        ...(buyNow.variantId ? { variantId: buyNow.variantId } : {}),
      },
    ];
  }

  // ✅ else normal cart items
  return (get().items || []).map((it) => ({
    productId: it.productId,
    quantity: toNum(it.quantity || 1),
    ...(it.variantId ? { variantId: it.variantId } : {}),
  }));
},




  /* =====================================================
     ✅ UPDATED REMOVE FROM CART (FULL)
  ===================================================== */
 removeFromCart: async (idOrKey, variantId = null) => {
  const curr = get().items || [];
  const key = str(idOrKey).includes("__")
    ? str(idOrKey)
    : `${str(idOrKey)}__${str(variantId || "")}`;

  const removed = curr.find((p) => (p.__key || cartKey(p)) === key);
  const updated = curr.filter((p) => (p.__key || cartKey(p)) !== key);

  set({ items: updated });
  Cookies.set(KEY, JSON.stringify(updated), { expires: 7 });
await handleCouponOnCartUpdate();

  removed ? notify.cartRemoved?.(removed) : notify.info?.(`Removed item`);

  /* ---------- GA4: remove_from_cart (NEW) ---------- */
  try {
    if (removed) {
      const rmQty = Number(removed?.quantity ?? 1) || 1;
      const price = Number(removed?.price ?? 0) || 0;
      const currency = str(removed?.productSnapshot?.currency || "INR") || "INR";

      pushEcomEvent("remove_from_cart", {
        currency,
        value: price * rmQty,
        items: [toGA4ItemFromBuilt(removed, removed?.productSnapshot, rmQty)],
      });
    }
  } catch (e) {
    console.warn("📈 GA4 remove_from_cart failed", e);
  }

  /* ---------- Analytics ---------- */
  try {
  const a = useAnalyticsStore.getState();

  const productId = removed?.productId || str(idOrKey).split("__")[0];

  a.trackRemoveFromCart
    ? a.trackRemoveFromCart(productId)
    : a.trackProductEvent?.({ productId, event: "cart_remove" });

} catch (e) {
  console.warn("📊 Analytics cart_remove failed", e);
}


  /* ---------- Meta ---------- */
  try {
    if (removed) {
      const pid = removed?.productSnapshot?.sku || removed?.productId;
      const quantity = Number(removed?.quantity ?? 1) || 1;
      const price = Number(removed?.price ?? 0) || 0;

      await trackMeta("RemoveFromCart", {
        content_type: "product",
        content_ids: pid ? [String(pid)] : [],
        contents: pid ? [{ id: String(pid), quantity, item_price: price }] : [],
        value: price * quantity,
        currency: "INR",
      });
    }
  } catch (e) {
    console.warn("🧾 Meta RemoveFromCart failed", e);
  }

  /* ---------- Abandoned Snapshot ---------- */
  try {
    const abandoned = useAbandonedCartStore.getState();
    const auth = useAuthStore.getState();
    abandoned.upsertCart({
      cartId: auth.activeCartId || "",
      items: updated.map((it) => ({ productId: it.productId, variantId: it.variantId || null, qty: it.quantity })),
      context: { lastPageUrl: window.location.href, device: window.innerWidth < 768 ? "mobile" : "desktop" },
    });
  } catch (e) {
    console.warn("🛒 Abandoned snapshot failed (removeFromCart)", e);
  }
},

decreaseQty: (idOrKey, variantId = null) => {
  const curr = get().items || [];

  const key = str(idOrKey).includes("__")
    ? str(idOrKey)
    : `${str(idOrKey)}__${str(variantId || "")}`;

  const item = curr.find((p) => (p.__key || cartKey(p)) === key);
  if (!item) return;

  const prevQty = toNum(item.quantity || 1);
  const nextQty = prevQty - 1;

  // ✅ qty 1 -> remove
  if (nextQty <= 0) {
    get().removeFromCart(key);
    return;
  }

  // ✅ otherwise update
  get().updateQty(key, nextQty);
},



  /* ---------------- UPDATE QTY ---------------- */
  updateQty: async (idOrKey, qty, variantId = null) => {
  let nextQty = toNum(qty);
  const curr = get().items || [];

  const key = str(idOrKey).includes("__")
    ? str(idOrKey)
    : `${str(idOrKey)}__${str(variantId || "")}`;

  const item = curr.find((p) => (p.__key || cartKey(p)) === key);
  if (!item) return;

  const prevQty = toNum(item.quantity || 1);

  /* -------- REMOVE IF ZERO -------- */
  if (nextQty <= 0) {
    const updated = curr.filter((p) => (p.__key || cartKey(p)) !== key);

    set({ items: updated });
    Cookies.set(KEY, JSON.stringify(updated), { expires: 7 });

    // ✅ cart updated -> coupon clear
    await handleCouponOnCartUpdate();

    notify.cartRemoved?.(item);

    // ✅ GA4 remove_from_cart (full qty removed)
    try {
      const price = toNum(item.price);
      const currency = str(item?.productSnapshot?.currency || "INR") || "INR";

      pushEcomEvent("remove_from_cart", {
        currency,
        value: price * prevQty,
        items: [toGA4ItemFromBuilt(item, item?.productSnapshot, prevQty)],
      });
    } catch (e) {
      console.warn("📈 GA4 qty->remove failed", e);
    }

    // ✅ Abandoned snapshot
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

  /* -------- UPDATE -------- */
  const updated = curr.map((p) => {
    const pk = p.__key || cartKey(p);
    return pk === key ? { ...p, quantity: nextQty, __key: pk } : p;
  });

  set({ items: updated });
  Cookies.set(KEY, JSON.stringify(updated), { expires: 7 });

  // ✅ cart updated -> coupon clear (IMPORTANT ✅)
  await handleCouponOnCartUpdate();

  notify.cartQtyUpdated?.(item, nextQty);

  /* ✅ GA4 delta tracking */
  try {
    const delta = nextQty - prevQty;

    if (delta !== 0) {
      const price = toNum(item.price);
      const currency = str(item?.productSnapshot?.currency || "INR") || "INR";
      const ev = delta > 0 ? "add_to_cart" : "remove_from_cart";
      const dQty = Math.abs(delta);

      pushEcomEvent(ev, {
        currency,
        value: price * dQty,
        items: [toGA4ItemFromBuilt(item, item?.productSnapshot, dQty)],
      });
    }
  } catch (e) {
    console.warn("📈 GA4 updateQty delta failed", e);
  }

  // ✅ Abandoned snapshot
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

/* ---------------- Reset Cart on Logout ---------------- */
resetCartOnLogout: async () => {
  set({ items: [], buyNowItem: null });

  Cookies.remove(KEY); // cart_products
  Cookies.remove("buy_now_item"); // buy now cookie

  try {
    // ✅ coupon clear if applied
    const couponStore = useCouponStore.getState();
    if (couponStore?.isApplied?.()) {
      await couponStore.clearPersistedCoupon();
    }
  } catch (e) {
    console.warn("⚠️ Coupon clear failed on logout", e);
  }

  try {
    // ✅ abandoned cart local clear (only if you have such a method)
    const abandoned = useAbandonedCartStore.getState();
    abandoned.clear?.(); 
  } catch (e) {
    console.warn("⚠️ Abandoned cart clear failed on logout", e);
  }
},



  /* ---------------- CLEAR ---------------- */
  clearCart: async () => {
  set({ items: [] });
  Cookies.remove(KEY);

  // ✅ coupon remove + clear persisted
  await handleCouponOnCartUpdate();

  notify.cartCleared?.();

  // ✅ DON'T touch buyNowItem here
},


completeCheckout: () => {
  set({ buyNowItem: null });
  Cookies.remove("buy_now_item");
},

  /* ---------------- TOTALS ---------------- */
  totalCount: () => (get().items || []).reduce((s, i) => s + toNum(i.quantity || 0), 0),

  totalPrice: () =>
    (get().items || []).reduce((sum, it) => sum + toNum(it.price) * toNum(it.quantity || 0), 0),

  /* ---------------- ORDER PAYLOAD ----------------
     ✅ use this in checkout when hitting POST /api/orders
  */

     totalCompareAtPrice: () =>
  (get().items || []).reduce((sum, it) => {
    const cap = toNum(it.compareAtPrice);
    const p = toNum(it.price);
    const qty = toNum(it.quantity || 0);

    const use = cap > p ? cap : p; // fallback if compareAtPrice missing
    return sum + use * qty;
  }, 0),

totalSavings: () =>
  (get().items || []).reduce((sum, it) => {
    const cap = toNum(it.compareAtPrice);
    const p = toNum(it.price);
    const qty = toNum(it.quantity || 0);

    return sum + (cap > p ? (cap - p) * qty : 0);
  }, 0),

  
  toOrderItems: () =>
    (get().items || []).map((it) => ({
      productId: it.productId,
      quantity: toNum(it.quantity || 1),
      ...(it.variantId ? { variantId: it.variantId } : {}),
    })),
}));
