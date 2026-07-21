"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const buildQuery = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();

  return query ? `?${query}` : "";
};

const parseResponse = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data?.message || "Affiliate request failed"
    );
  }

  return data;
};

const defaultOrderFilters = {
  q: "",
  paymentStatus: "",
  paymentMethod: "",
  fulfillmentStatus: "",
  commissionStatus: "",
  isConfirmed: "",
  orderType: "",
  from: "",
  to: "",
  sortBy: "createdAt",
  sortOrder: "desc",
  page: 1,
  limit: 20,
};

export const useAffiliateStore = create(
  persist(
    (set, get) => ({
      token: "",
      affiliate: null,
      dashboard: null,
      orders: [],

      loading: false,
      authLoading: false,
      profileLoading: false,
      dashboardLoading: false,
      ordersLoading: false,
      mutationLoading: false,

      error: "",
      message: "",

      orderFilters: {
        ...defaultOrderFilters,
      },

      orderPagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },

      isAuthenticated: () => {
        return Boolean(
          get().token && get().affiliate?._id
        );
      },

      getAuthHeaders: (hasBody = false) => {
        const token = get().token;

        return {
          ...(hasBody
            ? { "Content-Type": "application/json" }
            : {}),
          ...(token
            ? { Authorization: `Bearer ${token}` }
            : {}),
        };
      },

      clearFeedback: () =>
        set({
          error: "",
          message: "",
        }),

      setOrderFilters: (values = {}) =>
        set((state) => {
          const filterKeys = [
            "q",
            "paymentStatus",
            "paymentMethod",
            "fulfillmentStatus",
            "commissionStatus",
            "isConfirmed",
            "orderType",
            "from",
            "to",
          ];

          const shouldResetPage = Object.keys(
            values
          ).some((key) => filterKeys.includes(key));

          return {
            orderFilters: {
              ...state.orderFilters,
              ...values,
              page:
                values.page !== undefined
                  ? values.page
                  : shouldResetPage
                    ? 1
                    : state.orderFilters.page,
            },
          };
        }),

      resetOrderFilters: () =>
        set({
          orderFilters: {
            ...defaultOrderFilters,
          },
        }),

      login: async ({
        username,
        password,
      }) => {
        set({
          authLoading: true,
          error: "",
          message: "",
        });

        try {
          const response = await fetch(
            `${API_URL}/api/affiliates/login`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                username,
                password,
              }),
            }
          );

          const data = await parseResponse(response);

          set({
            token: data?.token || "",
            affiliate: data?.affiliate || null,
            authLoading: false,
            message:
              data?.message ||
              "Login successful",
          });

          return data;
        } catch (error) {
          set({
            authLoading: false,
            error: error.message,
          });

          throw error;
        }
      },

      logout: () => {
        set({
          token: "",
          affiliate: null,
          dashboard: null,
          orders: [],
          error: "",
          message: "",
          orderFilters: {
            ...defaultOrderFilters,
          },
          orderPagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        });
      },

      fetchProfile: async () => {
        const { token, getAuthHeaders } = get();

        if (!token) {
          throw new Error(
            "Affiliate login required"
          );
        }

        set({
          profileLoading: true,
          error: "",
        });

        try {
          const response = await fetch(
            `${API_URL}/api/affiliates/profile`,
            {
              headers: getAuthHeaders(),
              cache: "no-store",
            }
          );

          const data = await parseResponse(response);

          set({
            affiliate:
              data?.affiliate || null,
            profileLoading: false,
          });

          return data?.affiliate;
        } catch (error) {
          set({
            profileLoading: false,
            error: error.message,
          });

          if (
            error.message
              .toLowerCase()
              .includes("token") ||
            error.message
              .toLowerCase()
              .includes("authentication")
          ) {
            get().logout();
          }

          throw error;
        }
      },

      fetchDashboard: async (
        params = {}
      ) => {
        const {
          token,
          getAuthHeaders,
        } = get();

        if (!token) {
          throw new Error(
            "Affiliate login required"
          );
        }

        set({
          dashboardLoading: true,
          error: "",
        });

        try {
          const response = await fetch(
            `${API_URL}/api/affiliates/profile/dashboard${buildQuery(
              params
            )}`,
            {
              headers: getAuthHeaders(),
              cache: "no-store",
            }
          );

          const data = await parseResponse(response);

          set({
            dashboard: data,
            affiliate:
              data?.affiliate ||
              get().affiliate,
            dashboardLoading: false,
          });

          return data;
        } catch (error) {
          set({
            dashboardLoading: false,
            error: error.message,
          });

          throw error;
        }
      },

      fetchOrders: async (
        customFilters = {}
      ) => {
        const {
          token,
          getAuthHeaders,
          orderFilters,
        } = get();

        if (!token) {
          throw new Error(
            "Affiliate login required"
          );
        }

        const filters = {
          ...orderFilters,
          ...customFilters,
        };

        set({
          ordersLoading: true,
          error: "",
        });

        try {
          const response = await fetch(
            `${API_URL}/api/affiliates/profile/orders${buildQuery(
              filters
            )}`,
            {
              headers: getAuthHeaders(),
              cache: "no-store",
            }
          );

          const data = await parseResponse(response);

          set({
            orders: data?.data || [],
            orderFilters: filters,
            orderPagination: {
              ...get().orderPagination,
              ...(data?.pagination || {}),
            },
            ordersLoading: false,
          });

          return data;
        } catch (error) {
          set({
            ordersLoading: false,
            error: error.message,
          });

          throw error;
        }
      },

      changePassword: async ({
        currentPassword,
        newPassword,
      }) => {
        const {
          token,
          getAuthHeaders,
        } = get();

        if (!token) {
          throw new Error(
            "Affiliate login required"
          );
        }

        if (
          !newPassword ||
          newPassword.length < 6
        ) {
          throw new Error(
            "New password must contain at least 6 characters"
          );
        }

        set({
          mutationLoading: true,
          error: "",
          message: "",
        });

        try {
          const response = await fetch(
            `${API_URL}/api/affiliates/profile/password`,
            {
              method: "PATCH",
              headers:
                getAuthHeaders(true),
              body: JSON.stringify({
                currentPassword,
                newPassword,
              }),
            }
          );

          const data = await parseResponse(response);

          set({
            mutationLoading: false,
            message:
              data?.message ||
              "Password updated successfully",
          });

          return data;
        } catch (error) {
          set({
            mutationLoading: false,
            error: error.message,
          });

          throw error;
        }
      },

      refreshAffiliateData: async () => {
        set({
          loading: true,
          error: "",
        });

        try {
          const [profile, dashboard] =
            await Promise.all([
              get().fetchProfile(),
              get().fetchDashboard(),
            ]);

          set({
            loading: false,
          });

          return {
            profile,
            dashboard,
          };
        } catch (error) {
          set({
            loading: false,
            error: error.message,
          });

          throw error;
        }
      },

      resetStore: () => {
        set({
          token: "",
          affiliate: null,
          dashboard: null,
          orders: [],
          loading: false,
          authLoading: false,
          profileLoading: false,
          dashboardLoading: false,
          ordersLoading: false,
          mutationLoading: false,
          error: "",
          message: "",
          orderFilters: {
            ...defaultOrderFilters,
          },
          orderPagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        });
      },
    }),
    {
      name: "oatclub-affiliate-auth",

      partialize: (state) => ({
        token: state.token,
        affiliate: state.affiliate,
      }),
    }
  )
);

export {
  defaultOrderFilters,
};