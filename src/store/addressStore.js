"use client";

import { create } from "zustand";

// ✅ FIXED: Correct backend URL
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

export const useAddressStore = create((set, get) => ({
  addresses: [],
  loading: false,
  error: null,

  // -------------------------------------------------------
  // 🔁 FETCH ADDRESSES (firebaseUID)
  // -------------------------------------------------------
  fetchAddresses: async (firebaseUID) => {
    if (!firebaseUID) return;

    try {
      set({ loading: true });

      const res = await fetch(`${BACKEND}/api/addresses/firebase/${firebaseUID}`);
      const data = await res.json();

      if (!data?.success) {
        set({ loading: false, error: data?.message || "Failed to load" });
        return [];
      }

      set({
        addresses: data.data,
        loading: false,
        error: null,
      });

      return data.data;
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
      set({ loading: true });

      const res = await fetch(`${BACKEND}/api/addresses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressPayload),
      });

      const data = await res.json();

      if (!data?.success) {
        set({ loading: false, error: data?.message || "Unable to save address" });
        return null;
      }

      // Refresh
      await get().fetchAddresses(addressPayload.firebaseUID);

      set({ loading: false, error: null });
      return data.data;
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
      set({ loading: true });

      const res = await fetch(`${BACKEND}/api/addresses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!data?.success) {
        set({ loading: false, error: data?.message || "Update failed" });
        return null;
      }

      // Reload addresses for the same firebaseUID
      await get().fetchAddresses(payload.firebaseUID);

      set({ loading: false, error: null });
      return data.data;
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
      set({ loading: true });

      const res = await fetch(`${BACKEND}/api/addresses/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!data?.success) {
        set({ loading: false, error: data?.message || "Delete failed" });
        return null;
      }

      // Reload addresses
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
      set({ loading: true });

      const payload =
        type === "shipping"
          ? { isDefaultShipping: true }
          : { isDefaultBilling: true };

      const res = await fetch(`${BACKEND}/api/addresses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!data?.success) {
        set({ loading: false, error: data?.message || "Failed to set default" });
        return null;
      }

      // Refresh addresses
      await get().fetchAddresses(firebaseUID);

      set({ loading: false, error: null });
      return data.data;
    } catch (error) {
      console.error("Set default error:", error);
      set({ loading: false, error: "Unable to set default address" });
      return null;
    }
  },
}));
