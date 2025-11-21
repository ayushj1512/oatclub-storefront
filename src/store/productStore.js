"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useProductStore = create(
  persist(
    (set, get) => ({
      allProducts: [],
      visibleProducts: [],
      filteredProducts: [],

      searchQuery: "",
      selectedCategory: "all",
      sortOption: "default",

      visibleCount: 20,
      LOAD_STEP: 20,

      isLoading: false,
      error: null,

      // =========================================================
      // 🔥 FIXED — FETCH PRODUCTS FROM THE RIGHT ENDPOINT
      // =========================================================
    fetchProducts: async () => {
  try {
    set({ isLoading: true, error: null });

    const res = await fetch("/api/wc/products", {
      cache: "no-store",
    });

    let data = await res.json();

    if (!Array.isArray(data)) {
      console.error("Invalid WooCommerce response:", data);
      data = [];
    }

    // ⭐ NORMALIZE ALL PRODUCTS FOR YOUR UI
    const mapped = data.map((p) => ({
      id: p.id,
      name: p.name || "",
      slug: p.slug || p.id,
      price: Number(p.price || 0),
      description: p.short_description?.replace(/<[^>]+>/g, "") || "",
      category: p.categories?.[0]?.slug || "uncategorized",
      image: p.images?.[0]?.src || "/placeholder.png",
      images: p.images || [],
      onSale: p.on_sale,
      regularPrice: Number(p.regular_price || p.price),
      dateCreated: p.date_created,
    }));

    const initialChunk = mapped.slice(0, get().LOAD_STEP);

    set({
      allProducts: mapped,
      visibleProducts: initialChunk,
      filteredProducts: initialChunk,
      visibleCount: initialChunk.length,
      isLoading: false,
    });

  } catch (err) {
    console.error("❌ Error fetching products:", err);
    set({ error: "Failed to load products", isLoading: false });
  }
},


      // =========================================================
      // LOAD MORE
      // =========================================================
      loadMore: () => {
        const { visibleCount, LOAD_STEP, allProducts } = get();
        const newCount = visibleCount + LOAD_STEP;
        const newVisible = allProducts.slice(0, newCount);

        set({
          visibleCount: newCount,
          visibleProducts: newVisible,
        });

        get().applyFilters();
      },

      hasMore: () => {
        const { visibleCount, allProducts } = get();
        return visibleCount < allProducts.length;
      },

      // =========================================================
      // SEARCH / CATEGORY / SORT
      // =========================================================
      setSearchQuery: (query) => {
        set({ searchQuery: query });
        get().applyFilters();
      },

      setCategory: (category) => {
        set({ selectedCategory: category });
        get().applyFilters();
      },

      setSortOption: (option) => {
        set({ sortOption: option });
        get().applyFilters();
      },

      // =========================================================
      // FILTER + SORT (ALWAYS RUNS ON visibleProducts)
      // =========================================================
      applyFilters: () => {
        const {
          visibleProducts,
          searchQuery,
          selectedCategory,
          sortOption,
        } = get();

        let filtered = [...visibleProducts];

        // Search
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (p) =>
              p.name?.toLowerCase().includes(q) ||
              p.description?.toLowerCase().includes(q)
          );
        }

        // Category
        if (selectedCategory !== "all") {
          filtered = filtered.filter(
            (p) =>
              p.categories?.[0]?.slug?.toLowerCase() ===
              selectedCategory.toLowerCase()
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
            filtered.sort(
              (a, b) => new Date(b.date_created) - new Date(a.date_created)
            );
            break;

          default:
            break;
        }

        set({ filteredProducts: filtered });
      },

      // UPSERT PRODUCT
      upsertProduct: (product) => {
        const current = get().allProducts;
        const index = current.findIndex((p) => p.id === product.id);

        let updated;
        if (index >= 0) {
          updated = [...current];
          updated[index] = product;
        } else {
          updated = [...current, product];
        }

        set({ allProducts: updated });

        const newVisible = updated.slice(0, get().visibleCount);
        set({ visibleProducts: newVisible });

        get().applyFilters();
      },

      // REMOVE PRODUCT
      removeProduct: (id) => {
        const updated = get().allProducts.filter((p) => p.id !== id);

        set({ allProducts: updated });

        const newVisible = updated.slice(0, get().visibleCount);
        set({ visibleProducts: newVisible });

        get().applyFilters();
      },
    }),

    {
      name: "product-store",
      partialize: (state) => ({
        allProducts: state.allProducts,
        selectedCategory: state.selectedCategory,
        sortOption: state.sortOption,
      }),
    }
  )
);
