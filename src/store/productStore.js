"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useProductStore = create(
  persist(
    (set, get) => ({
      products: [],
      filteredProducts: [],
      searchQuery: "",
      selectedCategory: "all",
      sortOption: "default",
      isLoading: false,
      error: null,

      // -------------------------------
      // 🔹 Fetch products (from API)
      // -------------------------------
      fetchProducts: async () => {
        try {
          set({ isLoading: true, error: null });
          const res = await fetch("/api/products");
          const data = await res.json();

          set({
            products: data,
            filteredProducts: data,
            isLoading: false,
          });
        } catch (err) {
          console.error("Error fetching products:", err);
          set({ error: "Failed to load products", isLoading: false });
        }
      },

      // -------------------------------
      // 🔹 Search by text
      // -------------------------------
      setSearchQuery: (query) => {
        set({ searchQuery: query });
        get().applyFilters();
      },

      // -------------------------------
      // 🔹 Filter by category
      // -------------------------------
      setCategory: (category) => {
        set({ selectedCategory: category });
        get().applyFilters();
      },

      // -------------------------------
      // 🔹 Sort products
      // -------------------------------
      setSortOption: (option) => {
        set({ sortOption: option });
        get().applyFilters();
      },

      // -------------------------------
      // 🔹 Core Filtering Logic
      // -------------------------------
      applyFilters: () => {
        const { products, searchQuery, selectedCategory, sortOption } = get();
        let filtered = [...products];

        // Text search
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (p) =>
              p.name.toLowerCase().includes(query) ||
              p.description?.toLowerCase().includes(query)
          );
        }

        // Category filter
        if (selectedCategory !== "all") {
          filtered = filtered.filter(
            (p) => p.category?.toLowerCase() === selectedCategory.toLowerCase()
          );
        }

        // Sorting
        switch (sortOption) {
          case "priceLowHigh":
            filtered.sort((a, b) => a.price - b.price);
            break;
          case "priceHighLow":
            filtered.sort((a, b) => b.price - a.price);
            break;
          case "newest":
            filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
          default:
            break;
        }

        set({ filteredProducts: filtered });
      },

      // -------------------------------
      // 🔹 Add or Update Product (Admin)
      // -------------------------------
      upsertProduct: (product) => {
        const { products } = get();
        const index = products.findIndex((p) => p.id === product.id);

        let updatedProducts;
        if (index >= 0) {
          updatedProducts = [...products];
          updatedProducts[index] = product;
        } else {
          updatedProducts = [...products, product];
        }

        set({ products: updatedProducts });
        get().applyFilters();
      },

      // -------------------------------
      // 🔹 Remove Product
      // -------------------------------
      removeProduct: (id) => {
        const updated = get().products.filter((p) => p.id !== id);
        set({ products: updated });
        get().applyFilters();
      },
    }),
    {
      name: "product-store",
      partialize: (state) => ({
        products: state.products,
        selectedCategory: state.selectedCategory,
        sortOption: state.sortOption,
      }),
    }
  )
);
