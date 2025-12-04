"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL; // ← Your backend

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

      /* =====================================================
         🔥 FETCH FROM BOTH BACKEND + WOOCOMMERCE
      ===================================================== */
      fetchProducts: async () => {
        try {
          set({ isLoading: true, error: null });

          /* ---------------- GET BACKEND PRODUCTS ---------------- */
          const backendRes = await fetch(`${BACKEND}/api/products`, {
            cache: "no-store",
          });
          const backendData = await backendRes.json();

          const backendMapped = backendData.products?.map((p) => ({
            id: p._id,
            name: p.title || "",
            slug: p.slug,
            price: Number(p.price || 0),
            description: p.shortDescription || "",
            category: p.category?.slug || "uncategorized",
            image: p.thumbnail || "/placeholder.png",
            images: p.images || [],
            dateCreated: p.createdAt,
            source: "backend",
          })) || [];

          /* ---------------- GET WOOCOMMERCE PRODUCTS ---------------- */
          const wcRes = await fetch("/api/wc/products", {
            cache: "no-store",
          });
          let wcRaw = await wcRes.json();
          if (!Array.isArray(wcRaw)) wcRaw = [];

          const wcMapped = wcRaw.map((p) => ({
            id: "wc-" + p.id,
            name: p.name,
            slug: p.slug,
            price: Number(p.price || 0),
            description: p.short_description?.replace(/<[^>]+>/g, "") || "",
            category: p.categories?.[0]?.slug || "uncategorized",
            image: p.images?.[0]?.src || "/placeholder.png",
            images: p.images || [],
            dateCreated: p.date_created,
            source: "woocommerce",
          }));

          /* ---------------- MERGE BOTH LISTS ---------------- */
          const merged = [...backendMapped, ...wcMapped];

          /* ---------------- UNIQUE PRODUCTS BY SLUG ---------------- */
          const unique = merged.reduce((acc, item) => {
            if (!acc.find((i) => i.slug === item.slug)) acc.push(item);
            return acc;
          }, []);

          /* ---------------- INITIAL VISIBLE SET ---------------- */
          const initialChunk = unique.slice(0, get().LOAD_STEP);

          set({
            allProducts: unique,
            visibleProducts: initialChunk,
            filteredProducts: initialChunk,
            visibleCount: initialChunk.length,
            isLoading: false,
          });

        } catch (err) {
          console.error("❌ Error loading products:", err);
          set({ error: "Failed to load products", isLoading: false });
        }
      },

      /* =====================================================
         LOAD MORE
      ===================================================== */
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

      /* =====================================================
         SEARCH / CATEGORY / SORT
      ===================================================== */
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

      /* =====================================================
         FILTER + SORT (works from visible products)
      ===================================================== */
      applyFilters: () => {
        const {
          visibleProducts,
          searchQuery,
          selectedCategory,
          sortOption,
        } = get();

        let filtered = [...visibleProducts];

        /* --- Search Query --- */
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (p) =>
              p.name?.toLowerCase().includes(q) ||
              p.description?.toLowerCase().includes(q)
          );
        }

        /* --- Category --- */
        if (selectedCategory !== "all") {
          filtered = filtered.filter(
            (p) => p.category?.toLowerCase() === selectedCategory.toLowerCase()
          );
        }

        /* --- Sorting --- */
        switch (sortOption) {
          case "priceLowHigh":
            filtered.sort((a, b) => a.price - b.price);
            break;

          case "priceHighLow":
            filtered.sort((a, b) => b.price - a.price);
            break;

          case "newest":
            filtered.sort(
              (a, b) => new Date(b.dateCreated) - new Date(a.dateCreated)
            );
            break;

          default:
            break;
        }

        set({ filteredProducts: filtered });
      },

      /* =====================================================
         UPSERT PRODUCT
      ===================================================== */
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

      /* =====================================================
         REMOVE PRODUCT
      ===================================================== */
      removeProduct: (id) => {
        const updated = get().allProducts.filter((p) => p.id !== id);

        set({ allProducts: updated });

        const newVisible = updated.slice(0, get().visibleCount);
        set({ visibleProducts: newVisible });

        get().applyFilters();
      },
    }),

    /* =====================================================
       PERSISTENCE
    ===================================================== */
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
