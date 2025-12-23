"use client";

import { create } from "zustand";
import Cookies from "js-cookie";
import { useAuthStore } from "./authStore";
import { notify } from "@/lib/notify";
import { useAnalyticsStore } from "@/store/analyticsStore";

const COOKIE_KEY = "wishlist_cache";
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

// ✅ prevent request spam on route changes / multiple mounts
const FETCH_TTL_MS = 15_000; // 15 seconds


const normalizeId = (id) => String(id);

const dedupeById = (items) => {
  const map = new Map();
  for (const item of items) {
    if (!item?.id) continue; // ✅ guard
    map.set(String(item.id), { ...item, id: String(item.id) });
  }
  return Array.from(map.values());
};


const getDisplayName = (p) => p?.name || p?.title || "Item";

const safeJson = async (r) => {
  try {
    return await r.json();
  } catch {
    return {};
  }
};

export const useWishlistStore = create((set, get) => ({
  items: [],
  initialized: false,
  initializing: false,
  loading: false,

  // ✅ internal locks
  _initPromise: null,
  _fetchPromise: null,
  _fetchAbort: null,
  _lastFetchAt: 0,
  _lastFetchUid: "",

  /* ----------------------------------------------------
     ⭐ INIT — safe (no multiple requests)
     Call from ONE place only (layout/header), but this also dedupes.
  ---------------------------------------------------- */
  initialize: async () => {
    if (typeof window === "undefined") return;
    if (get().initialized) return;

    // ✅ if init already running, return same promise
    if (get()._initPromise) return get()._initPromise;

    // ✅ lock immediately so other callers don't start another init
    set({ initializing: true });

    const p = (async () => {
      const { user } = useAuthStore.getState();

      if (user?.uid) {
        await get().fetchFromBackend(user.uid, { force: true }); // first time force
      } else {
        // guest -> cookie cache
        const stored = Cookies.get(COOKIE_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) set({ items: dedupeById(parsed) });

          } catch (e) {
            console.error("Wishlist cookie error:", e);
          }
        }
      }

      set({ initialized: true });
    })()
      .catch((e) => {
        console.error("Wishlist init error:", e);
      })
      .finally(() => {
        set({ initializing: false, _initPromise: null });
      });

    set({ _initPromise: p });
    return p;
  },

  /* ----------------------------------------------------
     ⭐ FETCH FROM BACKEND (deduped + TTL + abort)
     GET /api/wishlist/firebase/:uid
  ---------------------------------------------------- */
  fetchFromBackend: async (firebaseUID, opts = {}) => {
  const { force = false } = opts;

  if (!BACKEND) {
    console.error("Missing NEXT_PUBLIC_BACKEND_URL");
    return;
  }
  if (!firebaseUID) return;

  const now = Date.now();

  // ✅ TTL: prevent refetch spam
  if (
    !force &&
    get()._lastFetchUid === firebaseUID &&
    now - get()._lastFetchAt < FETCH_TTL_MS
  ) {
    return;
  }

  // ✅ Dedup concurrent fetches for same user
  if (get()._fetchPromise && get()._lastFetchUid === firebaseUID) {
    return get()._fetchPromise;
  }

  // ✅ Abort previous fetch if UID switches
  try {
    get()._fetchAbort?.abort?.();
  } catch {}

  const controller = new AbortController();
  set({ _fetchAbort: controller, _lastFetchUid: firebaseUID });

  const p = (async () => {
    try {
      set({ loading: true });

      const res = await fetch(
        `${BACKEND}/api/wishlist/firebase/${firebaseUID}`,
        {
          cache: "no-store",
          signal: controller.signal,
        }
      );

      const data = await safeJson(res);

      if (!res.ok) {
        console.error("Wishlist fetch failed:", data);
        notify.error(data?.message || "Failed to load wishlist");
        return;
      }

      if (data?.success && data?.wishlist) {
        const mapped = (data.wishlist.productIds || []).map((p) => ({
          id: normalizeId(p?._id),
          name: p?.name || p?.title || "",
          price: p?.price ?? 0,
          image: p?.images?.[0]?.src || p?.thumbnail || "",
          categories: p?.categories || [],
          tags: p?.tags || [],
        }));

        const deduped = dedupeById(mapped);

        set({
          items: deduped,
          _lastFetchAt: Date.now(),
          _lastFetchUid: firebaseUID,
        });

        Cookies.set(COOKIE_KEY, JSON.stringify(deduped), { expires: 7 });
      } else {
        set({ _lastFetchAt: Date.now(), _lastFetchUid: firebaseUID });
      }
    } catch (e) {
      if (e?.name !== "AbortError") {
        console.error("Wishlist fetch error:", e);
        notify.error("Failed to load wishlist");
      }
    } finally {
      set({
        loading: false,
        _fetchPromise: null,
        _fetchAbort: null,
      });
    }
  })();

  set({ _fetchPromise: p });
  return p;
},


  /* ----------------------------------------------------
     ⭐ ADD TO WISHLIST (single request; no extra GET)
  ---------------------------------------------------- */
addToWishlist: async (product) => {
  const { user } = useAuthStore.getState();
  if (!user?.uid) return notify.info("Please login first");

  // ✅ normalize ID once and forever
  const pid = normalizeId(product?.id ?? product?._id);
  if (!pid) return;

  const prev = get().items || [];

  // ✅ hard guard (prevents race duplicates)
  if (prev.some((i) => String(i.id) === pid)) {
    return notify.info("Already in wishlist");
  }

  const optimisticItem = {
    id: pid,
    name: product?.name || product?.title || "",
    price: product?.price ?? 0,
    image:
      product?.image ||
      product?.images?.[0]?.src ||
      product?.images?.[0] ||
      product?.thumbnail ||
      "",
    categories: product?.categories || [],
    tags: product?.tags || [],
  };

  // ✅ optimistic update WITH dedupe
  const next = dedupeById([optimisticItem, ...prev]);

  set({ items: next, loading: true });
  Cookies.set(COOKIE_KEY, JSON.stringify(next), { expires: 7 });

  notify.wishlistAdded(optimisticItem);

  /* ---------------------------------------
     📊 ANALYTICS: WISHLIST ADD (ONCE)
  ---------------------------------------- */
  try {
    useAnalyticsStore
      .getState()
      .trackWishlistAdd(pid);
  } catch (e) {
    console.warn("📊 Analytics wishlist_add failed", e);
  }

  try {
    if (!BACKEND) throw new Error("Missing NEXT_PUBLIC_BACKEND_URL");

    const res = await fetch(
      `${BACKEND}/api/wishlist/firebase/${user.uid}/add`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: pid }),
      }
    );

    const data = await safeJson(res);

    if (!res.ok) {
      // 🔁 rollback on failure
      set({ items: prev, loading: false });
      Cookies.set(COOKIE_KEY, JSON.stringify(prev), { expires: 7 });
      return notify.error(data?.message || "Failed to add to wishlist");
    }

    // ✅ mark fetch state so TTL logic stays correct
    set({
      loading: false,
      _lastFetchAt: Date.now(),
      _lastFetchUid: user.uid,
    });
  } catch (e) {
    console.error("Add to wishlist error:", e);

    // 🔁 rollback on exception
    set({ items: prev, loading: false });
    Cookies.set(COOKIE_KEY, JSON.stringify(prev), { expires: 7 });
    notify.error("Failed to add to wishlist");
  }
},



  /* ----------------------------------------------------
     ⭐ REMOVE FROM WISHLIST (single request; no extra GET)
  ---------------------------------------------------- */
  removeFromWishlist: async (productId) => {
    const { user } = useAuthStore.getState();
    if (!user?.uid) return notify.info("Please login first");

    const prev = get().items;
    const removedItem = prev.find((i) => String(i.id) === String(productId));
    const next = prev.filter((i) => String(i.id) !== String(productId));

    set({ items: next, loading: true });
    Cookies.set(COOKIE_KEY, JSON.stringify(next), { expires: 7 });

    if (removedItem) notify.wishlistRemoved(removedItem);
    else notify.info(`Removed: ${getDisplayName({ id: productId })}`);

    try {
      if (!BACKEND) throw new Error("Missing NEXT_PUBLIC_BACKEND_URL");

      const res = await fetch(`${BACKEND}/api/wishlist/firebase/${user.uid}/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      const data = await safeJson(res);

      if (!res.ok) {
        // rollback
        set({ items: prev, loading: false });
        Cookies.set(COOKIE_KEY, JSON.stringify(prev), { expires: 7 });
        return notify.error(data?.message || "Failed to remove from wishlist");
      }

      set({ loading: false, _lastFetchAt: Date.now(), _lastFetchUid: user.uid });
    } catch (e) {
      console.error("Remove wishlist error:", e);
      set({ items: prev, loading: false });
      Cookies.set(COOKIE_KEY, JSON.stringify(prev), { expires: 7 });
      notify.error("Failed to remove from wishlist");
    }
  },

  /* ----------------------------------------------------
     ⭐ CLEAR WISHLIST
  ---------------------------------------------------- */
  clearWishlist: async () => {
    const { user } = useAuthStore.getState();
    if (!user?.uid) return;

    const prev = get().items;

    set({ items: [], loading: true });
    Cookies.remove(COOKIE_KEY);
    notify.wishlistCleared();

    try {
      if (!BACKEND) throw new Error("Missing NEXT_PUBLIC_BACKEND_URL");

      const res = await fetch(`${BACKEND}/api/wishlist/firebase/${user.uid}`, {
        method: "DELETE",
      });

      const data = await safeJson(res);

      if (!res.ok) {
        // rollback
        set({ items: prev, loading: false });
        Cookies.set(COOKIE_KEY, JSON.stringify(prev), { expires: 7 });
        return notify.error(data?.message || "Failed to clear wishlist");
      }

      set({ loading: false, _lastFetchAt: Date.now(), _lastFetchUid: user.uid });
    } catch (e) {
      console.error("Clear wishlist error:", e);
      set({ items: prev, loading: false });
      Cookies.set(COOKIE_KEY, JSON.stringify(prev), { expires: 7 });
      notify.error("Failed to clear wishlist");
    }
  },

  /* ----------------------------------------------------
     ⭐ OPTIONAL: manual sync button
  ---------------------------------------------------- */
  syncWishlist: async (force = false) => {
    const { user } = useAuthStore.getState();
    if (!user?.uid) return;
    return get().fetchFromBackend(user.uid, { force });
  },

  /* ----------------------------------------------------
     ⭐ CHECK
  ---------------------------------------------------- */
  isInWishlist: (id) =>
    (get().items || []).some((item) => String(item.id) === String(id)),
}));
