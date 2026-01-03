"use client";

import { create } from "zustand";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL; 
const API_URL = `${BASE_URL}/api/size-charts`;

export const useSizeChartStore = create((set, get) => ({
  /* ================= STATE ================= */
  items: [],
  active: null,
  loading: false,
  error: null,

  /* ================= HELPERS ================= */
  setLoading: (val) => set({ loading: val }),
  setError: (err) => set({ error: err }),

  /* =========================================================
     FETCH ALL SIZE CHARTS
  ========================================================= */
  fetchAll: async () => {
    try {
      set({ loading: true, error: null });

      const res = await fetch(API_URL, { cache: "no-store" });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.message || "Failed to fetch charts");

      set({ items: data, loading: false });
      return data;
    } catch (err) {
      set({ error: err.message, loading: false });
      return null;
    }
  },

  /* =========================================================
     FETCH CHART BY ID
  ========================================================= */
  fetchById: async (id) => {
    if (!id) return null;

    try {
      set({ loading: true, error: null });

      const res = await fetch(`${API_URL}/${id}`, { cache: "no-store" });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.message || "Failed to fetch chart");

      set({ active: data, loading: false });
      return data;
    } catch (err) {
      set({ error: err.message, loading: false });
      return null;
    }
  },

  /* =========================================================
     CREATE SIZE CHART
  ========================================================= */
  createChart: async (payload) => {
    try {
      set({ loading: true, error: null });

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to create chart");

      set((state) => ({
        items: [data, ...state.items],
        loading: false,
      }));

      return data;
    } catch (err) {
      set({ error: err.message, loading: false });
      return null;
    }
  },

  /* =========================================================
     UPDATE SIZE CHART
  ========================================================= */
  updateChart: async (id, payload) => {
    if (!id) return null;

    try {
      set({ loading: true, error: null });

      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to update chart");

      set((state) => ({
        items: state.items.map((c) => (c?._id === id ? data : c)),
        active: state.active?._id === id ? data : state.active,
        loading: false,
      }));

      return data;
    } catch (err) {
      set({ error: err.message, loading: false });
      return null;
    }
  },

  fetchByCategory: async (categoryId) => {
  if (!categoryId) return null;

  try {
    set({ loading: true, error: null });

    const res = await fetch(API_URL, { cache: "no-store" });
    const data = await res.json();

    if (!res.ok) throw new Error(data?.message || "Failed to fetch charts");

    const chart = (Array.isArray(data) ? data : []).find((c) =>
      (c?.categories || []).some((cat) => String(cat?._id || cat) === String(categoryId))
    );

    set({ active: chart || null, loading: false });
    return chart || null;
  } catch (err) {
    set({ error: err.message, loading: false });
    return null;
  }
},


  /* =========================================================
     DELETE SIZE CHART
  ========================================================= */
  deleteChart: async (id) => {
    if (!id) return false;

    try {
      set({ loading: true, error: null });

      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to delete chart");

      set((state) => ({
        items: state.items.filter((c) => c?._id !== id),
        active: state.active?._id === id ? null : state.active,
        loading: false,
      }));

      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  /* =========================================================
     CLEAR
  ========================================================= */
  clearActive: () => set({ active: null }),
  clearError: () => set({ error: null }),
}));
