"use client";

import { create } from "zustand";

const API_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");

const useBdayStore = create((set) => ({
  wishes: [],
  loading: false,
  error: null,

  createWish: async ({ name, email, phone, message }) => {
    set({ loading: true, error: null });

    try {
      const response = await fetch(`${API_URL}/api/bday`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: String(name ?? "").trim(),
          email: String(email ?? "").trim().toLowerCase(),
          phone: String(phone ?? "").trim(),
          message: String(message ?? "").trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.message || "Unable to submit birthday wish"
        );
      }

      set((state) => ({
        wishes: data?.wish
          ? [data.wish, ...state.wishes]
          : state.wishes,
        loading: false,
        error: null,
      }));

      return data;
    } catch (error) {
      set({
        loading: false,
        error:
          error?.message || "Unable to submit birthday wish",
      });

      throw error;
    }
  },

  fetchWishes: async () => {
    set({ loading: true, error: null });

    try {
      const response = await fetch(`${API_URL}/api/bday`, {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.message || "Unable to fetch birthday wishes"
        );
      }

      const wishes = Array.isArray(data?.wishes)
        ? data.wishes
        : [];

      set({
        wishes,
        loading: false,
        error: null,
      });

      return wishes;
    } catch (error) {
      set({
        loading: false,
        error:
          error?.message || "Unable to fetch birthday wishes",
      });

      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useBdayStore;
