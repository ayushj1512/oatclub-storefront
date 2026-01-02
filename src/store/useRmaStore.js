"use client";

import { create } from "zustand";

const API = process.env.NEXT_PUBLIC_API_URL || "";

export const useRmaStore = create((set, get) => ({
  /* ============================================================
     STATE
  ============================================================ */
  rmas: [],        // list of RMAs for an order
  rma: null,       // single RMA
  loading: false,
  error: null,

  /* ============================================================
     HELPERS
  ============================================================ */
  _start: () => set({ loading: true, error: null }),
  _success: () => set({ loading: false }),
  _error: (err) =>
    set({
      loading: false,
      error: err?.message || "Something went wrong",
    }),

  /* ============================================================
     CREATE RMA (Return / Exchange)
     POST /api/orders/:id/rma
     payload: { type, reason, customerNote, items, exchangeTo? }
  ============================================================ */
  createRma: async (orderId, payload) => {
    if (!orderId) return;
    get()._start();
    try {
      const res = await fetch(`${API}/api/orders/${orderId}/rma`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message);

      // ✅ Add new rma in state
      set({
        rma: data?.rma || null,
        rmas: [...(get().rmas || []), data?.rma].filter(Boolean),
      });

      get()._success();
      return data;
    } catch (e) {
      get()._error(e);
      throw e;
    }
  },

  /* ============================================================
     FETCH ALL RMAs FOR ORDER
     GET /api/orders/:id/rma
  ============================================================ */
  fetchRmasByOrder: async (orderId) => {
    if (!orderId) return;
    get()._start();
    try {
      const res = await fetch(`${API}/api/orders/${orderId}/rma`, {
        cache: "no-store",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message);

      set({
        rmas: Array.isArray(data?.rmas) ? data.rmas : [],
        rma: null,
      });

      get()._success();
      return data?.rmas || [];
    } catch (e) {
      get()._error(e);
    }
  },

  /* ============================================================
     FETCH SINGLE RMA BY NUMBER
     GET /api/orders/:id/rma/:rmaNumber
  ============================================================ */
  fetchRmaByNumber: async (orderId, rmaNumber) => {
    if (!orderId || !rmaNumber) return;
    get()._start();
    try {
      const res = await fetch(
        `${API}/api/orders/${orderId}/rma/${rmaNumber}`,
        { cache: "no-store" }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message);

      set({ rma: data?.rma || null });
      get()._success();
      return data?.rma;
    } catch (e) {
      get()._error(e);
    }
  },

  /* ============================================================
     RESET STATE
  ============================================================ */
  clearRma: () => set({ rma: null }),
  clearRmas: () => set({ rmas: [], rma: null }),
}));
