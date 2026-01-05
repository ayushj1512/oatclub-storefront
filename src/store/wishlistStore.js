"use client";

import { create } from "zustand";
import { useAuthStore } from "./authStore";
import { notify } from "@/lib/notify";
import { useAnalyticsStore } from "@/store/analyticsStore";
import { trackMeta } from "@/lib/meta/track";
import { pushEcomEvent } from "@/components/tracking/gtm";
import { mapItem } from "@/components/tracking/ga4Mapper";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;
const FETCH_TTL_MS = 15_000;

const normalizeId = (id) => (id ? String(id) : "");

const safeJson = async (r) => {
  try {
    return await r.json();
  } catch {
    return {};
  }
};

const dedupeById = (items = []) => {
  const m = new Map();
  for (const it of items) {
    const id = normalizeId(it?.id ?? it?._id);
    if (!id) continue;
    m.set(id, { ...it, id });
  }
  return Array.from(m.values());
};

const ga4WishItem = (p) =>
  mapItem(
    {
      _id: p?.id ?? p?._id,
      id: p?.id ?? p?._id,
      name: p?.name || p?.title,
      title: p?.name || p?.title,
      price: Number(p?.price ?? 0) || 0,
      category: p?.categories?.[0]?.name || p?.categories?.[0] || "",
      variant: p?.variant || "",
      sku: p?.sku || "",
    },
    1
  );

/* ✅ backend -> UI normalize (supports populated objects + string ids) */
const mapBackendProduct = (p) => {
  if (typeof p === "string") {
    return { id: normalizeId(p), name: "", price: 0, image: "", categories: [], tags: [] };
  }

  return {
    id: normalizeId(p?._id ?? p?.id),
    name: p?.name || p?.title || "",
    price: p?.price ?? 0,
    sale_price: p?.sale_price ?? p?.salePrice,
    images: p?.images ?? [],
    image: p?.images?.[0]?.src || p?.thumbnail || p?.image || "",
    categories: p?.categories || [],
    tags: p?.tags || [],
  };
};

export const useWishlistStore = create((set, get) => ({
  items: [],
  initialized: false,
  initializing: false,
  loading: false,
  error: null,

  _initPromise: null,
  _fetchPromise: null,
  _fetchAbort: null,
  _lastFetchAt: 0,
  _lastFetchUid: "",
  _pending: {}, // { [pid]: true } => spam click prevent

  /* -----------------------
     ✅ INIT
  ------------------------ */
  initialize: async () => {
    if (typeof window === "undefined") return;
    if (get().initialized) return;
    if (get()._initPromise) return get()._initPromise;

    set({ initializing: true, error: null });

    const p = (async () => {
      const { user } = useAuthStore.getState();
      if (user?.uid) await get().fetchFromBackend(user.uid, { force: true });
      else set({ items: [] });
      set({ initialized: true });
    })()
      .catch((e) => {
        console.error("Wishlist init error:", e);
        set({ error: "Wishlist init failed" });
      })
      .finally(() => set({ initializing: false, _initPromise: null }));

    set({ _initPromise: p });
    return p;
  },

  /* -----------------------
     ✅ FETCH
  ------------------------ */
  fetchFromBackend: async (firebaseUID, { force = false } = {}) => {
    if (!BACKEND) return console.error("Missing NEXT_PUBLIC_BACKEND_URL");
    if (!firebaseUID) return;

    const now = Date.now();

    if (!force && get()._lastFetchUid === firebaseUID && now - get()._lastFetchAt < FETCH_TTL_MS) {
      return;
    }

    if (get()._fetchPromise && get()._lastFetchUid === firebaseUID) {
      return get()._fetchPromise;
    }

    try { get()._fetchAbort?.abort?.(); } catch {}
    const controller = new AbortController();

    set({ _fetchAbort: controller, _lastFetchUid: firebaseUID, error: null });

    const p = (async () => {
      try {
        set({ loading: true });

        const res = await fetch(`${BACKEND}/api/wishlist/firebase/${firebaseUID}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        const data = await safeJson(res);

        if (!res.ok) {
          notify.error(data?.message || "Failed to load wishlist");
          set({ error: data?.message || "Failed to load wishlist" });
          return;
        }

        const wishlist = data?.wishlist || data?.data?.wishlist || null;
        const raw = wishlist?.products || wishlist?.productIds || data?.products || [];

        set({
          items: dedupeById((Array.isArray(raw) ? raw : []).map(mapBackendProduct)),
          _lastFetchAt: Date.now(),
          _lastFetchUid: firebaseUID,
        });
      } catch (e) {
        if (e?.name !== "AbortError") {
          console.error("Wishlist fetch error:", e);
          notify.error("Failed to load wishlist");
          set({ error: "Failed to load wishlist" });
        }
      } finally {
        set({ loading: false, _fetchPromise: null, _fetchAbort: null });
      }
    })();

    set({ _fetchPromise: p });
    return p;
  },

  /* -----------------------
     ✅ ADD (optimistic + backend sync)
  ------------------------ */
  addToWishlist: async (product) => {
    const { user } = useAuthStore.getState();
    if (!user?.uid) return notify.info("Please login first");
    if (!BACKEND) return console.error("Missing NEXT_PUBLIC_BACKEND_URL");

    const pid = normalizeId(product?.id ?? product?._id);
    if (!pid) return;

    if (get()._pending[pid]) return;
    set((s) => ({ _pending: { ...s._pending, [pid]: true } }));

    const prev = get().items || [];
    if (prev.some((i) => String(i.id) === pid)) {
      set((s) => ({ _pending: { ...s._pending, [pid]: false } }));
      return notify.info("Already in wishlist");
    }

    const optimisticItem = mapBackendProduct({ ...product, id: pid });
    set({ items: dedupeById([optimisticItem, ...prev]), loading: true });
    notify.wishlistAdded(optimisticItem);

    // analytics
    try { useAnalyticsStore.getState().trackWishlistAdd(pid); } catch {}

    // meta
    try {
      const price = Number(optimisticItem?.price ?? 0) || 0;
      await trackMeta("AddToWishlist", {
        content_type: "product",
        content_ids: [pid],
        contents: [{ id: pid, quantity: 1, item_price: price }],
        value: price,
        currency: "INR",
        content_name: optimisticItem.name,
      });
    } catch {}

    // GA4
    try {
      const price = Number(optimisticItem?.price ?? 0) || 0;
      pushEcomEvent("add_to_wishlist", { currency: "INR", value: price, items: [ga4WishItem(product)] });
    } catch {}

    try {
      const res = await fetch(`${BACKEND}/api/wishlist/firebase/${user.uid}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: pid }),
      });

      const data = await safeJson(res);

      if (!res.ok) {
        set({ items: prev, loading: false });
        notify.error(data?.message || "Failed to add to wishlist");
      } else {
        // ✅ sync from backend response
        const wishlist = data?.wishlist;
        const raw = wishlist?.products || wishlist?.productIds || [];
        if (Array.isArray(raw)) set({ items: dedupeById(raw.map(mapBackendProduct)) });

        set({ loading: false, _lastFetchAt: Date.now(), _lastFetchUid: user.uid });
      }
    } catch (e) {
      console.error("Add wishlist error:", e);
      set({ items: prev, loading: false });
      notify.error("Failed to add to wishlist");
    } finally {
      set((s) => ({ _pending: { ...s._pending, [pid]: false } }));
    }
  },

  /* -----------------------
     ✅ REMOVE (optimistic + backend sync)
  ------------------------ */
  removeFromWishlist: async (productId) => {
    const { user } = useAuthStore.getState();
    if (!user?.uid) return notify.info("Please login first");
    if (!BACKEND) return console.error("Missing NEXT_PUBLIC_BACKEND_URL");

    const pid = normalizeId(productId);
    if (!pid) return;

    if (get()._pending[pid]) return;
    set((s) => ({ _pending: { ...s._pending, [pid]: true } }));

    const prev = get().items || [];
    set({ items: prev.filter((i) => String(i.id) !== pid), loading: true });

    try {
      const res = await fetch(`${BACKEND}/api/wishlist/firebase/${user.uid}/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: pid }),
      });

      const data = await safeJson(res);

      if (!res.ok) {
        set({ items: prev, loading: false });
        notify.error(data?.message || "Failed to remove from wishlist");
      } else {
        const wishlist = data?.wishlist;
        const raw = wishlist?.products || wishlist?.productIds || [];
        if (Array.isArray(raw)) set({ items: dedupeById(raw.map(mapBackendProduct)) });

        set({ loading: false, _lastFetchAt: Date.now(), _lastFetchUid: user.uid });
      }
    } catch (e) {
      console.error("Remove wishlist error:", e);
      set({ items: prev, loading: false });
      notify.error("Failed to remove from wishlist");
    } finally {
      set((s) => ({ _pending: { ...s._pending, [pid]: false } }));
    }
  },

  /* -----------------------
     ✅ CLEAR
  ------------------------ */
  clearWishlist: async () => {
    const { user } = useAuthStore.getState();
    if (!user?.uid) return;
    if (!BACKEND) return console.error("Missing NEXT_PUBLIC_BACKEND_URL");

    const prev = get().items;
    set({ items: [], loading: true });
    notify.wishlistCleared();

    try {
      const res = await fetch(`${BACKEND}/api/wishlist/firebase/${user.uid}`, { method: "DELETE" });
      const data = await safeJson(res);

      if (!res.ok) {
        set({ items: prev, loading: false });
        notify.error(data?.message || "Failed to clear wishlist");
      } else {
        set({ loading: false, _lastFetchAt: Date.now(), _lastFetchUid: user.uid });
      }
    } catch (e) {
      console.error("Clear wishlist error:", e);
      set({ items: prev, loading: false });
      notify.error("Failed to clear wishlist");
    }
  },

  /* -----------------------
     ✅ HELPERS
  ------------------------ */
  syncWishlist: async (force = false) => {
    const { user } = useAuthStore.getState();
    if (!user?.uid) return;
    return get().fetchFromBackend(user.uid, { force });
  },

  isInWishlist: (id) =>
    (get().items || []).some((item) => String(item.id) === String(id)),
}));
