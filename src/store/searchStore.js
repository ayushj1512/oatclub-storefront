"use client";

import { create } from "zustand";

import { useAnalyticsStore } from "@/store/analyticsStore";

import {
  getMetaProductGroupId,
  getMetaUserData,
  trackMeta,
} from "@/lib/meta/track";

import {
  pushToDataLayer,
  pushEcomEvent,
} from "@/components/tracking/gtm";

import { mapItem } from "@/components/tracking/ga4Mapper";

const API_BASE = (
  process.env.NEXT_PUBLIC_BACKEND_URL || ""
).replace(/\/$/, "");

const stableStringify = (object) => {
  try {
    return JSON.stringify(
      object,
      Object.keys(object).sort()
    );
  } catch {
    return "";
  }
};

const getSearchProductId = (product = {}) =>
  getMetaProductGroupId({
    productGroupId:
      product?.productGroupId ||
      product?.groupId,

    productId:
      product?.productId ||
      product?._id ||
      product?.id,
  });

const ga4Item = (product) =>
  mapItem(
    {
      _id:
        product?._id ||
        product?.id,

      id:
        product?._id ||
        product?.id,

      name:
        product?.title ||
        product?.name,

      title:
        product?.title ||
        product?.name,

      price:
        Number(product?.price ?? 0) || 0,

      category:
        (
          Array.isArray(product?.categories)
            ? product.categories[0]
            : ""
        ) ||
        product?.category ||
        "",

      variant:
        product?.variant ||
        "",

      sku:
        product?.sku ||
        "",
    },
    1
  );

export const useSearchStore = create(
  (set, get) => ({
    query: "",
    results: [],
    total: 0,
    page: 1,
    pages: 1,
    limit: 20,

    filters: {
      category: "",
      tags: [],
      color: "",
      sortBy: "relevance",
    },

    searched: false,
    loading: false,
    error: null,
    lastSearchedAt: null,

    _lastMetaSearchKey: null,
    _lastMetaSearchAt: null,

    _lastGA4SearchKey: null,
    _lastGA4SearchAt: null,

    setQuery: (query) => set({ query }),

    setLimit: (limit) =>
      set({
        limit:
          Number(limit) > 0
            ? Number(limit)
            : 20,
      }),

    setFilters: (next = {}) =>
      set((state) => ({
        filters: {
          ...state.filters,
          ...next,
        },
      })),

    resetSearch: () =>
      set({
        query: "",
        results: [],
        total: 0,
        page: 1,
        pages: 1,
        searched: false,
        loading: false,
        error: null,
        lastSearchedAt: null,

        filters: {
          category: "",
          tags: [],
          color: "",
          sortBy: "relevance",
        },

        _lastMetaSearchKey: null,
        _lastMetaSearchAt: null,

        _lastGA4SearchKey: null,
        _lastGA4SearchAt: null,
      }),

    searchProducts: async ({
      page = 1,
      query: forcedQuery,
    } = {}) => {
      const state = get();
      const filters = state.filters || {};
      const limit = state.limit;

      const trimmedQuery = String(
        forcedQuery ??
          state.query ??
          ""
      ).trim();

      const {
        category,
        tags = [],
        color,
        sortBy,
      } = filters;

      if (!API_BASE) {
        set({
          error: "Search API not configured",
          loading: false,
        });

        return;
      }

      if (
        !trimmedQuery &&
        !category &&
        !tags.length &&
        !color
      ) {
        set({
          results: [],
          total: 0,
          page: 1,
          pages: 1,
          searched: false,
          loading: false,
          error: null,
        });

        return;
      }

      set({
        loading: true,
        error: null,
        searched: true,
      });

      try {
        const params = new URLSearchParams();

        params.set("page", String(page));
        params.set("limit", String(limit));
        params.set("activeOnly", "true");
        params.set("excludeDrafts", "true");

        if (trimmedQuery) {
          params.set("q", trimmedQuery);
        }

        if (category) {
          params.set("category", category);
        }

        if (tags.length) {
          params.set("tags", tags.join(","));
        }

        if (color) {
          params.set("color", color);
        }

        if (sortBy) {
          params.set("sortBy", sortBy);
        }

        const response = await fetch(
          `${API_BASE}/api/products/card-search?${params.toString()}`,
          {
            cache: "no-store",
          }
        );

        const data = await response
          .json()
          .catch(() => null);

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Search failed"
          );
        }

        const incoming = Array.isArray(
          data?.products
        )
          ? data.products
          : [];

        const pagination =
          data?.pagination || {};

        const finalResults =
          page === 1
            ? incoming
            : [
                ...(get().results || []),
                ...incoming,
              ];

        set({
          query: trimmedQuery,
          results: finalResults,

          total: Number(
            pagination?.total ||
              incoming.length ||
              0
          ),

          page: Number(
            pagination?.page ||
              page
          ),

          pages: Number(
            pagination?.pages ||
              1
          ),

          loading: false,
          error: null,
          searched: true,
          lastSearchedAt: Date.now(),
        });

        /* ===============================================
           INTERNAL SEARCH APPEARANCE
        =============================================== */

        try {
          const analytics =
            useAnalyticsStore.getState();

          incoming.forEach((product) => {
            analytics.trackSearchAppearance?.(
              product?._id ||
                product?.id
            );
          });
        } catch (error) {
          console.warn(
            "Search analytics failed:",
            error
          );
        }

        const trackingKey =
          stableStringify({
            query: trimmedQuery,
            category,
            tags,
            color,
            sortBy,
          });

        const now = Date.now();

        /* ===============================================
           GA4 SEARCH
        =============================================== */

        try {
          const {
            _lastGA4SearchKey,
            _lastGA4SearchAt,
          } = get();

          const isDuplicate =
            _lastGA4SearchKey ===
              trackingKey &&
            _lastGA4SearchAt &&
            now - _lastGA4SearchAt <
              2500;

          if (
            page === 1 &&
            !isDuplicate
          ) {
            pushToDataLayer({
              event: "search",
              search_term: trimmedQuery,
            });

            pushEcomEvent(
              "view_search_results",
              {
                currency: "INR",

                items: finalResults
                  .slice(0, 20)
                  .map(ga4Item),
              }
            );

            set({
              _lastGA4SearchKey:
                trackingKey,

              _lastGA4SearchAt: now,
            });
          }
        } catch (error) {
          console.warn(
            "GA4 search event failed:",
            error
          );
        }

        /* ===============================================
           META SEARCH
        =============================================== */

        try {
          const {
            _lastMetaSearchKey,
            _lastMetaSearchAt,
          } = get();

          const isDuplicate =
            _lastMetaSearchKey ===
              trackingKey &&
            _lastMetaSearchAt &&
            now - _lastMetaSearchAt <
              2500;

          if (
            page === 1 &&
            !isDuplicate
          ) {
            const contentIds =
              finalResults
                .slice(0, 20)
                .map(getSearchProductId)
                .filter(Boolean);

            await trackMeta(
              "Search",
              {
                search_string:
                  trimmedQuery,

                content_category:
                  category ||
                  undefined,

                content_type:
                  "product_group",

                content_ids:
                  contentIds,

                contents:
                  contentIds.map(
                    (id) => ({
                      id,
                      quantity: 1,
                    })
                  ),
              },
              getMetaUserData()
            );

            set({
              _lastMetaSearchKey:
                trackingKey,

              _lastMetaSearchAt: now,
            });
          }
        } catch (error) {
          console.warn(
            "Meta search event failed:",
            error
          );
        }
      } catch (error) {
        set({
          loading: false,
          searched: true,

          error:
            error?.message ||
            "Search failed",
        });
      }
    },

    loadMore: async () => {
      const {
        page,
        pages,
        loading,
      } = get();

      if (
        loading ||
        page >= pages
      ) {
        return;
      }

      await get().searchProducts({
        page: page + 1,
      });
    },
  })
);