import { create } from "zustand";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const cleanError = (err) =>
  err?.response?.data?.message || err?.message || "Something went wrong";

const useRmaOrderStore = create((set, get) => ({
  loading: false,
  submitting: false,
  error: null,

  rmas: [],
  rma: null,
  policy: null,

  clearError: () => set({ error: null }),
  clearRma: () => set({ rma: null }),

  /* ---------------------------------------------
     Create return / exchange request
     POST /api/orders/:id/rma
  --------------------------------------------- */
  createRma: async (orderId, payload) => {
    set({ submitting: true, error: null });

    try {
      const { data } = await axios.post(`${API}/api/orders/${orderId}/rma`, payload, {
        withCredentials: true,
      });

      set({
        rma: data?.rma || null,
        policy: data?.policy || null,
        submitting: false,
      });

      return data;
    } catch (err) {
      const message = cleanError(err);
      set({ error: message, submitting: false });
      throw new Error(message);
    }
  },

  /* ---------------------------------------------
     Get all RMA requests for one order
     GET /api/orders/:id/rma
  --------------------------------------------- */
  fetchRmasByOrder: async (orderId) => {
    set({ loading: true, error: null });

    try {
      const { data } = await axios.get(`${API}/api/orders/${orderId}/rma`, {
        withCredentials: true,
      });

      set({
        rmas: data?.rmas || [],
        policy: data?.policy || null,
        loading: false,
      });

      return data;
    } catch (err) {
      const message = cleanError(err);
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  /* ---------------------------------------------
     Get single RMA by rmaNumber
     GET /api/orders/:id/rma/:rmaNumber
  --------------------------------------------- */
  fetchRmaByNumber: async (orderId, rmaNumber) => {
    set({ loading: true, error: null });

    try {
      const { data } = await axios.get(
        `${API}/api/orders/${orderId}/rma/${rmaNumber}`,
        { withCredentials: true }
      );

      set({
        rma: data?.rma || null,
        policy: data?.policy || null,
        loading: false,
      });

      return data;
    } catch (err) {
      const message = cleanError(err);
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  /* ---------------------------------------------
     Helpers
  --------------------------------------------- */
  buildReturnPayload: ({ items, reason = "other", customerNote = "" }) => ({
    type: "return",
    reason,
    customerNote,
    items,
  }),

  buildExchangePayload: ({
    items,
    reason = "other",
    customerNote = "",
    exchangeTo,
  }) => ({
    type: "exchange",
    reason,
    customerNote,
    items,
    exchangeTo,
  }),
}));

export default useRmaOrderStore;