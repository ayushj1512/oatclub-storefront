// src/store/addressStore.js
"use client";

/**
 * ✅ Address Store + PINCODE LOOKUP (India Post)
 * - `lookupPincode(pincode)` will auto fetch city/state/district
 * - If no data -> returns null (no error UI needed on frontend)
 * - Has caching + debounced-safe behavior (ignores stale responses)
 *
 * ✅ NEW:
 * - Meta Pixel + CAPI: AddShippingInfo event helper
 */

import { create } from "zustand";
import { trackMeta } from "@/lib/meta/track"; // ✅ NEW (Meta tracking)

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;
const INDIA_POST = "https://api.postalpincode.in/pincode";

/* -------------------------------------------------------
   Helpers
------------------------------------------------------- */
const safeJson = async (res) => {
  try {
    return await res.json();
  } catch {
    return {};
  }
};

// ✅ small dedupe for shipping event
const shouldSkipMetaEvent = (get, set, key, windowMs = 4000) => {
  const now = Date.now();
  const { _lastMetaEvent, _lastMetaEventAt } = get();
  if (_lastMetaEvent === key && now - _lastMetaEventAt < windowMs) return true;
  set({ _lastMetaEvent: key, _lastMetaEventAt: now });
  return false;
};

export const useAddressStore = create((set, get) => ({
  // ---------------- state ----------------
  addresses: [],
  loading: false,
  error: null,

  // pincode lookup state (optional to show loader in UI)
  pinLoading: false,
  pinCache: {}, // { "110001": { city,state,district,pincode } }
  _pinReqId: 0, // internal: avoid race conditions

  // ✅ Meta dedupe storage
  _lastMetaEvent: null,
  _lastMetaEventAt: 0,

  // -------------------------------------------------------
  // 🔁 FETCH ADDRESSES (firebaseUID)
  // -------------------------------------------------------
  fetchAddresses: async (firebaseUID) => {
    if (!firebaseUID) return [];
    try {
      set({ loading: true, error: null });

      const res = await fetch(
        `${BACKEND}/api/addresses/firebase/${firebaseUID}`,
        { cache: "no-store" }
      );
      const data = await safeJson(res);

      if (!data?.success) {
        set({ loading: false, error: data?.message || "Failed to load" });
        return [];
      }

      set({ addresses: data.data || [], loading: false, error: null });
      return data.data || [];
    } catch (error) {
      console.error("Fetch addresses error:", error);
      set({ loading: false, error: "Unable to load addresses" });
      return [];
    }
  },

  // -------------------------------------------------------
  // ➕ CREATE ADDRESS
  // -------------------------------------------------------
  createAddress: async (addressPayload) => {
    try {
      set({ loading: true, error: null });

      const res = await fetch(`${BACKEND}/api/addresses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressPayload),
      });

      const data = await safeJson(res);
      if (!data?.success) {
        set({
          loading: false,
          error: data?.message || "Unable to save address",
        });
        return null;
      }

      // refresh list
      await get().fetchAddresses(addressPayload.firebaseUID);

      set({ loading: false, error: null });
      return data.data || null;
    } catch (error) {
      console.error("Create address error:", error);
      set({ loading: false, error: "Unable to save address" });
      return null;
    }
  },

  // -------------------------------------------------------
  // ✏️ UPDATE ADDRESS
  // -------------------------------------------------------
  updateAddress: async (id, payload) => {
    try {
      set({ loading: true, error: null });

      const res = await fetch(`${BACKEND}/api/addresses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await safeJson(res);
      if (!data?.success) {
        set({ loading: false, error: data?.message || "Update failed" });
        return null;
      }

      await get().fetchAddresses(payload.firebaseUID);

      set({ loading: false, error: null });
      return data.data || null;
    } catch (error) {
      console.error("Update address error:", error);
      set({ loading: false, error: "Unable to update address" });
      return null;
    }
  },

  // -------------------------------------------------------
  // ❌ DELETE ADDRESS
  // -------------------------------------------------------
  deleteAddress: async (id, firebaseUID) => {
    try {
      set({ loading: true, error: null });

      const res = await fetch(`${BACKEND}/api/addresses/${id}`, {
        method: "DELETE",
      });
      const data = await safeJson(res);

      if (!data?.success) {
        set({ loading: false, error: data?.message || "Delete failed" });
        return null;
      }

      await get().fetchAddresses(firebaseUID);

      set({ loading: false, error: null });
      return true;
    } catch (error) {
      console.error("Delete address error:", error);
      set({ loading: false, error: "Unable to delete address" });
      return null;
    }
  },

  // -------------------------------------------------------
  // ⭐ SET DEFAULT SHIPPING/BILLING
  // -------------------------------------------------------
  setDefaultAddress: async (id, firebaseUID, type) => {
    try {
      set({ loading: true, error: null });

      const payload =
        type === "shipping"
          ? { isDefaultShipping: true }
          : { isDefaultBilling: true };

      const res = await fetch(`${BACKEND}/api/addresses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await safeJson(res);
      if (!data?.success) {
        set({
          loading: false,
          error: data?.message || "Failed to set default",
        });
        return null;
      }

      await get().fetchAddresses(firebaseUID);

      set({ loading: false, error: null });
      return data.data || null;
    } catch (error) {
      console.error("Set default error:", error);
      set({ loading: false, error: "Unable to set default address" });
      return null;
    }
  },

  // -------------------------------------------------------
  // ✅ META: AddShippingInfo (Pixel + CAPI)
  // Call this when user selects shipping address or continues checkout
  // -------------------------------------------------------
  trackAddShippingInfo: async ({
    currency = "INR",
    value = 0,
    addressId = null,
    shippingTier = "standard",
  } = {}) => {
    try {
      const key = `add_shipping_${addressId || "na"}_${value}_${shippingTier}`;
      const skip = shouldSkipMetaEvent(get, set, key, 4000);
      if (skip) return;

      // try to find address object
      const addr =
        addressId &&
        (get().addresses || []).find((a) => String(a?._id) === String(addressId));

      await trackMeta("AddShippingInfo", {
        currency,
        value: Number(value || 0),

        shipping_tier: shippingTier,

        // optional metadata
        ...(addr?.pincode ? { postal_code: String(addr.pincode) } : {}),
        ...(addr?.state ? { state: String(addr.state) } : {}),
        ...(addr?.city ? { city: String(addr.city) } : {}),
      });
    } catch (e) {
      console.warn("🧾 Meta AddShippingInfo failed", e);
    }
  },

  // -------------------------------------------------------
  // 📮 PINCODE LOOKUP (India Post)
  // -------------------------------------------------------
  lookupPincode: async (pincode) => {
    const pin = String(pincode || "").replace(/\D/g, "").slice(0, 6);
    if (!/^\d{6}$/.test(pin)) return null;

    const cached = get().pinCache?.[pin];
    if (cached) return cached;

    const reqId = (get()._pinReqId || 0) + 1;
    set({ pinLoading: true, _pinReqId: reqId });

    try {
      const res = await fetch(`${INDIA_POST}/${pin}`, { cache: "no-store" });
      const json = await res.json().catch(() => null);

      if (get()._pinReqId !== reqId) return null;

      const first = Array.isArray(json) ? json[0] : null;
      const po = first?.PostOffice?.[0];

      if (first?.Status !== "Success" || !po) {
        set({ pinLoading: false });
        return null;
      }

      const mapped = {
        pincode: pin,
        city: po?.District || "",
        district: po?.District || "",
        state: po?.State || "",
        country: po?.Country || "India",
      };

      set((s) => ({
        pinLoading: false,
        pinCache: { ...(s.pinCache || {}), [pin]: mapped },
      }));

      return mapped;
    } catch (e) {
      console.error("Pincode lookup error:", e);
      if (get()._pinReqId === reqId) set({ pinLoading: false });
      return null;
    }
  },
}));
