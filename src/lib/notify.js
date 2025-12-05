"use client";

import { toast } from "sonner";

const safeString = (v) => (v == null ? "" : String(v));

const pretty = (product) => {
  const name = safeString(product?.name || product?.title || "Item");
  const size = safeString(product?.selectedSize || product?.size || "");
  return size ? `${name} (${size})` : name;
};

export const notify = {
  success: (msg) => toast.success(safeString(msg)),
  error: (msg) => toast.error(safeString(msg)),
  info: (msg) => toast(safeString(msg)),

  cartAdded: (product) => toast.success(`Added to cart: ${pretty(product)}`),
  cartRemoved: (product) => toast(`Removed from cart: ${pretty(product)}`),
  cartQtyUpdated: (product, qty) => toast(`Cart updated: ${pretty(product)} • Qty: ${qty}`),
  cartCleared: () => toast(`Cart cleared`),

  wishlistAdded: (product) => toast.success(`Wishlisted: ${pretty(product)}`),
  wishlistRemoved: (product) => toast(`Removed from wishlist: ${pretty(product)}`),

  copied: (msg = "Copied ✅") => toast.success(msg),
};
