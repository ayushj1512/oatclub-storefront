"use client";

import { create } from "zustand";

const API_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:5000";

const useBdayStore = create((set, get) => ({
  wishes: [],
  loading: false,
  error: null,

  createWish: async ({ name, message }) => {
    set({ loading: true, error: null });

    try {
      const response = await fetch(`${API_URL}/api/bday`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name, message }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to submit birthday wish");
      }

      set({
        wishes: [data.wish, ...get().wishes],
        loading: false,
      });

      return data;
    } catch (error) {
      set({
        loading: false,
        error: error.message,
      });

      throw error;
    }
  },

  fetchWishes: async () => {
    set({ loading: true, error: null });

    try {
      const response = await fetch(`${API_URL}/api/bday`, {
        cache: "no-store",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to fetch birthday wishes");
      }

      set({
        wishes: data.wishes || [],
        loading: false,
      });

      return data.wishes || [];
    } catch (error) {
      set({
        loading: false,
        error: error.message,
      });

      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useBdayStore;
