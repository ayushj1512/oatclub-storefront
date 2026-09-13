"use client";

import { create } from "zustand";

const API_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:6001";

const request = async (
  url,
  options = {},
) => {
  const response = await fetch(
    `${API_URL}/api/delhivery/ndr${url}`,
    {
      cache: "no-store",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    },
  );

  const result = await response
    .json()
    .catch(() => ({}));

  if (
    !response.ok ||
    result?.success === false
  ) {
    throw new Error(
      result?.message ||
      result?.error ||
      "NDR request failed",
    );
  }

  return result?.data ?? result;
};

const useNdrStore = create((set) => ({
  order: null,
  result: null,
  loading: false,
  submitting: false,
  error: null,

  clearError: () =>
    set({ error: null }),

  reset: () =>
    set({
      order: null,
      result: null,
      loading: false,
      submitting: false,
      error: null,
    }),

  fetchNdrOrder: async (token) => {
    const orderNumber = String(
      token || "",
    ).trim();

    if (!orderNumber) {
      set({
        error: "Invalid order link",
      });

      return null;
    }

    set({
      loading: true,
      error: null,
      result: null,
    });

    try {
      const data = await request(
        `/customer/${encodeURIComponent(
          orderNumber,
        )}`,
      );

      set({ order: data });
      return data;
    } catch (error) {
      set({
        order: null,
        error:
          error?.message ||
          "Unable to fetch order",
      });

      throw error;
    } finally {
      set({ loading: false });
    }
  },

  submitNdrAction: async ({
    token,
    action = "RE-ATTEMPT",
    deferredDate = "",
    consignee = {},
  }) => {
    const orderNumber = String(
      token || "",
    ).trim();

    const normalizedAction = String(
      action || "",
    )
      .trim()
      .toUpperCase();

    if (!orderNumber) {
      throw new Error(
        "Invalid order link",
      );
    }

    if (
      ![
        "RE-ATTEMPT",
        "DEFER_DLV",
        "EDIT_DETAILS",
      ].includes(normalizedAction)
    ) {
      throw new Error(
        "Invalid NDR action",
      );
    }

    const payload = {
      action: normalizedAction,
    };

    if (
      normalizedAction ===
      "DEFER_DLV"
    ) {
      if (!deferredDate) {
        throw new Error(
          "Preferred delivery date is required",
        );
      }

      payload.deferredDate =
        String(deferredDate).trim();
    }

    if (
      normalizedAction ===
      "EDIT_DETAILS"
    ) {
      const phone = String(
        consignee.phone || "",
      )
        .replace(/\D/g, "")
        .slice(-10);

      const pincode = String(
        consignee.pincode || "",
      )
        .replace(/\D/g, "")
        .slice(0, 6);

      if (
        !consignee.name ||
        !consignee.address ||
        !consignee.city ||
        !consignee.state ||
        phone.length !== 10 ||
        pincode.length !== 6
      ) {
        throw new Error(
          "Valid customer and address details are required",
        );
      }

      payload.consignee = {
        name: String(
          consignee.name,
        ).trim(),

        phone,

        address: String(
          consignee.address,
        ).trim(),

        address2: String(
          consignee.address2 || "",
        ).trim(),

        landmark: String(
          consignee.landmark || "",
        ).trim(),

        city: String(
          consignee.city,
        ).trim(),

        state: String(
          consignee.state,
        ).trim(),

        pincode,

        country: String(
          consignee.country ||
          "India",
        ).trim(),
      };
    }

    set({
      submitting: true,
      error: null,
      result: null,
    });

    try {
      const data = await request(
        `/customer/${encodeURIComponent(
          orderNumber,
        )}/action`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );

      set((state) => ({
        result: data,
        order:
          data?.order ||
          state.order,
      }));

      return data;
    } catch (error) {
      set({
        error:
          error?.message ||
          "Unable to submit delivery request",
      });

      throw error;
    } finally {
      set({
        submitting: false,
      });
    }
  },
}));

export default useNdrStore;
