// src/store/addressStore.js
"use client";

/**
 * ✅ Address Store + PINCODE LOOKUP (India Post)
 * ✅ Supports BOTH:
 *    - Logged-in (firebaseUID)
 *    - Guest checkout (customerId Mongo _id)
 * ✅ Meta Pixel + CAPI: AddShippingInfo
 * ✅ GA4: add_shipping_info
 */

import { create } from "zustand";
import { trackMeta } from "@/lib/meta/track";
import { pushEcomEvent } from "@/components/tracking/gtm";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;
const INDIA_POST = "https://api.postalpincode.in/pincode";

/* ---------------- Helpers ---------------- */
const safeJson = async (res) => {
  try {
    return await res.json();
  } catch {
    return {};
  }
};

const shouldSkipEvent = (get, set, key, windowMs = 4000) => {
  const now = Date.now();
  const { _lastEventKey, _lastEventAt } = get();
  if (_lastEventKey === key && now - _lastEventAt < windowMs) return true;
  set({ _lastEventKey: key, _lastEventAt: now });
  return false;
};

export const useAddressStore = create((set, get) => ({
  addresses: [],
  loading: false,
  error: null,

  pinLoading: false,
  pinCache: {},
  _pinReqId: 0,

  // ✅ shared dedupe key for GA4 + Meta
  _lastEventKey: null,
  _lastEventAt: 0,

  /* ======================================================
     ✅ FETCH ADDRESSES (firebaseUID OR customerId)
     - Logged in -> firebaseUID
     - Guest -> customerId (Mongo _id)
  ====================================================== */
  fetchAddresses: async ({ firebaseUID = null, customerId = null } = {}) => {
    if (!BACKEND) return [];
    if (!firebaseUID && !customerId) return [];

    try {
      set({ loading: true, error: null });

      const url = firebaseUID
        ? `${BACKEND}/api/addresses/firebase/${firebaseUID}`
        : `${BACKEND}/api/addresses/customer/${customerId}`;

      const res = await fetch(url, { cache: "no-store" });
      const data = await safeJson(res);

      if (!data?.success) {
        set({ loading: false, error: data?.message || "Failed to load" });
        return [];
      }

      set({ addresses: data.data || [], loading: false });
      return data.data || [];
    } catch (e) {
      console.error("Fetch addresses error:", e);
      set({ loading: false, error: "Unable to load addresses" });
      return [];
    }
  },

  /* ======================================================
     ✅ CREATE ADDRESS (works for guest + login)
     - Requires either firebaseUID OR customerId
  ====================================================== */
  createAddress: async (addressPayload) => {
    if (!BACKEND) return null;
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

      // ✅ refresh addresses
      await get().fetchAddresses({
        firebaseUID: addressPayload.firebaseUID || null,
        customerId: addressPayload.customerId || null,
      });

      set({ loading: false });
      return data.data || null;
    } catch (e) {
      console.error("Create address error:", e);
      set({ loading: false, error: "Unable to save address" });
      return null;
    }
  },

  /* ======================================================
     ✅ UPDATE ADDRESS
     - Requires firebaseUID or customerId in payload
  ====================================================== */
  updateAddress: async (id, payload) => {
    if (!BACKEND) return null;
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

      await get().fetchAddresses({
        firebaseUID: payload.firebaseUID || null,
        customerId: payload.customerId || null,
      });

      set({ loading: false });
      return data.data || null;
    } catch (e) {
      console.error("Update address error:", e);
      set({ loading: false, error: "Unable to update address" });
      return null;
    }
  },

  /* ======================================================
     ✅ DELETE ADDRESS
     - Works for guest + login
  ====================================================== */
  deleteAddress: async ({ id, firebaseUID = null, customerId = null }) => {
    if (!BACKEND) return null;
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

      await get().fetchAddresses({ firebaseUID, customerId });
      set({ loading: false });
      return true;
    } catch (e) {
      console.error("Delete address error:", e);
      set({ loading: false, error: "Unable to delete address" });
      return null;
    }
  },

  /* ======================================================
     ✅ DEFAULT ADDRESS
  ====================================================== */
  setDefaultAddress: async ({ id, firebaseUID = null, customerId = null, type }) => {
    if (!BACKEND) return null;
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
        set({ loading: false, error: data?.message || "Failed to set default" });
        return null;
      }

      await get().fetchAddresses({ firebaseUID, customerId });
      set({ loading: false });
      return data.data || null;
    } catch (e) {
      console.error("Set default error:", e);
      set({ loading: false, error: "Unable to set default address" });
      return null;
    }
  },

  /* -------------------------------------------------------
     ✅ GA4 + META: add_shipping_info / AddShippingInfo
  ------------------------------------------------------- */
  trackAddShippingInfo: async ({
    currency = "INR",
    value = 0,
    addressId = null,
    shippingTier = "standard",
    items = [],
  } = {}) => {
    try {
      const v = Number(value || 0) || 0;
      const tier = String(shippingTier || "standard");

      const key = `ship_${addressId || "na"}_${v}_${tier}`;
      if (shouldSkipEvent(get, set, key, 4000)) return;

      const addr =
        addressId &&
        (get().addresses || []).find((a) => String(a?._id) === String(addressId));

      /* ✅ GA4 */
      try {
        pushEcomEvent("add_shipping_info", {
          currency,
          value: v,
          shipping_tier: tier,
          items: Array.isArray(items) ? items.slice(0, 50) : [],
        });
      } catch (e) {
        console.warn("📈 GA4 add_shipping_info failed", e);
      }

      /* ✅ Meta */
      try {
        await trackMeta("AddShippingInfo", {
          currency,
          value: v,
          shipping_tier: tier,
          ...(addr?.pincode ? { postal_code: String(addr.pincode) } : {}),
          ...(addr?.state ? { state: String(addr.state) } : {}),
          ...(addr?.city ? { city: String(addr.city) } : {}),
        });
      } catch (e) {
        console.warn("🧾 Meta AddShippingInfo failed", e);
      }
    } catch (e) {
      console.warn("ShippingInfo tracking failed", e);
    }
  },

  /* ---------------- PINCODE LOOKUP ---------------- */
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
