"use client";

import { create } from "zustand";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const API_URL = `${BASE_URL}/api/size-charts`;

/* ================= tiny helpers ================= */
const str = (v) => String(v ?? "");
const isArr = (v) => Array.isArray(v);

const normalizeId = (v) => str(v?._id || v).trim();
const hasCategory = (chart, categoryId) => {
  const cats = isArr(chart?.categories) ? chart.categories : [];
  const target = normalizeId(categoryId);
  return cats.some((c) => normalizeId(c) === target);
};

// Universal = categories empty OR missing
const isUniversal = (chart) => {
  const cats = isArr(chart?.categories) ? chart.categories : [];
  return cats.length === 0;
};

export const useSizeChartStore = create((set, get) => ({
  /* ================= STATE ================= */
  items: [],
  active: null,
  loading: false,
  error: null,

  /* ================= HELPERS ================= */
  setLoading: (val) => set({ loading: !!val }),
  setError: (err) => set({ error: err ? String(err) : null }),

  /* =========================================================
     FETCH ALL SIZE CHARTS
  ========================================================= */
  fetchAll: async () => {
    try {
      set({ loading: true, error: null });

      const res = await fetch(API_URL, { cache: "no-store" });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.message || "Failed to fetch charts");

      const items = isArr(data) ? data : [];
      set({ items, loading: false });
      return items;
    } catch (err) {
      set({ error: err?.message || "Failed to fetch charts", loading: false });
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
      set({ error: err?.message || "Failed to fetch chart", loading: false });
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
        body: JSON.stringify(payload || {}),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to create chart");

      set((state) => ({
        items: [data, ...(isArr(state.items) ? state.items : [])],
        loading: false,
      }));

      return data;
    } catch (err) {
      set({ error: err?.message || "Failed to create chart", loading: false });
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
        body: JSON.stringify(payload || {}),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to update chart");

      set((state) => ({
        items: (isArr(state.items) ? state.items : []).map((c) =>
          str(c?._id) === str(id) ? data : c
        ),
        active: str(state.active?._id) === str(id) ? data : state.active,
        loading: false,
      }));

      return data;
    } catch (err) {
      set({ error: err?.message || "Failed to update chart", loading: false });
      return null;
    }
  },

  /* =========================================================
     FETCH BY CATEGORY (category-specific first, else universal)
     - Avoids refetch if items already loaded
  ========================================================= */
  fetchByCategory: async (categoryId) => {
    try {
      set({ loading: true, error: null });

      // 1) Use cached items if available
      let charts = isArr(get().items) ? get().items : [];

      // 2) If not loaded yet, fetch once
      if (charts.length === 0) {
        const res = await fetch(API_URL, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Failed to fetch charts");
        charts = isArr(data) ? data : [];
        set({ items: charts }); // cache it
      }

      // 3) Pick category chart first (if categoryId provided)
      const catId = categoryId ? str(categoryId) : "";
      const categoryChart = catId
        ? charts.find((c) => hasCategory(c, catId))
        : null;

      // 4) Fallback to universal chart (categories empty)
      const universalChart = charts.find((c) => isUniversal(c)) || null;

      const picked = categoryChart || universalChart || null;

      set({ active: picked, loading: false });
      return picked;
    } catch (err) {
      set({ error: err?.message || "Failed to fetch chart", loading: false });
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

      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to delete chart");

      set((state) => ({
        items: (isArr(state.items) ? state.items : []).filter(
          (c) => str(c?._id) !== str(id)
        ),
        active: str(state.active?._id) === str(id) ? null : state.active,
        loading: false,
      }));

      return true;
    } catch (err) {
      set({ error: err?.message || "Failed to delete chart", loading: false });
      return false;
    }
  },

  /* =========================================================
     CLEAR
  ========================================================= */
  clearActive: () => set({ active: null }),
  clearError: () => set({ error: null }),
}));
