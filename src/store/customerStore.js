import { create } from "zustand";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const cleanError = (err) =>
  err?.response?.data?.message || err?.message || "Something went wrong";

const useCustomerStore = create((set, get) => ({
  loading: false,
  saving: false,
  error: null,

  customer: null,
  payoutDetails: null,

  /* -----------------------------
     Helpers
  ----------------------------- */
  clearError: () => set({ error: null }),

  setCustomer: (customer) =>
    set({
      customer,
      payoutDetails: customer?.payoutDetails || null,
    }),

  /* -----------------------------
     Fetch customer
  ----------------------------- */
  fetchCustomerById: async (customerId) => {
    set({ loading: true, error: null });

    try {
      const { data } = await axios.get(`${API}/api/customers/${customerId}`, {
        withCredentials: true,
      });

      set({
        customer: data || null,
        payoutDetails: data?.payoutDetails || null,
        loading: false,
      });

      return data;
    } catch (err) {
      const message = cleanError(err);
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  /* -----------------------------
     Check if exists (for guest / RMA flow)
  ----------------------------- */
  checkCustomerExists: async ({ email, phone }) => {
    try {
      const { data } = await axios.get(`${API}/api/customers/exists`, {
        params: { email, phone },
      });

      if (data?.exists) {
        set({
          customer: data.customer,
          payoutDetails: data?.customer?.payoutDetails || null,
        });
      }

      return data;
    } catch (err) {
      const message = cleanError(err);
      set({ error: message });
      throw new Error(message);
    }
  },

  /* -----------------------------
     Save / Update payout details
     (bank or upi)
  ----------------------------- */
  savePayoutDetails: async (customerId, payload) => {
    set({ saving: true, error: null });

    try {
      const { data } = await axios.patch(
        `${API}/api/customers/${customerId}/payout-details`,
        payload,
        { withCredentials: true }
      );

      set({
        customer: data?.customer || null,
        payoutDetails: data?.payoutDetails || null,
        saving: false,
      });

      return data;
    } catch (err) {
      const message = cleanError(err);
      set({ error: message, saving: false });
      throw new Error(message);
    }
  },

  /* -----------------------------
     Convenience helpers
  ----------------------------- */

  hasPayoutDetails: () => {
    const payout = get().payoutDetails;

    const hasBank =
      payout?.bank?.accountHolderName &&
      payout?.bank?.accountNumber &&
      payout?.bank?.ifscCode;

    const hasUpi = payout?.upi?.upiId;

    return !!(hasBank || hasUpi);
  },
}));

export default useCustomerStore;