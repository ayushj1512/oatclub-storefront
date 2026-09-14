"use client";

import { create } from "zustand";

const API_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:6001"
).replace(/\/+$/, "");

const request = async (
  provider,
  url,
  options = {},
) => {
  const response = await fetch(
    `${API_URL}/api/${provider}/ndr${url}`,
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
    const error = new Error(
      result?.message ||
      result?.error ||
      "NDR request failed",
    );

    error.status = response.status;
    throw error;
  }

  return result?.data ?? result;
};

const clean = (value) =>
  String(value || "").trim();

const normalizePhone = (value) =>
  clean(value)
    .replace(/\D/g, "")
    .slice(-10);

const findNdrOrder = async (orderNumber) => {
  let lastError;

  for (const provider of [
    "delhivery",
    "shiprocket",
  ]) {
    try {
      const data = await request(
        provider,
        `/customer/${encodeURIComponent(
          orderNumber,
        )}`,
      );

      return {
        ...data,
        provider:
          data?.provider || provider,
      };
    } catch (error) {
      lastError = error;

      if (error.status !== 404) {
        throw error;
      }
    }
  }

  throw (
    lastError ||
    new Error("NDR order not found")
  );
};

const buildDelhiveryPayload = ({
  action,
  deferredDate,
  consignee,
}) => {
  const normalizedAction = clean(action)
    .toUpperCase();

  if (
    ![
      "RE-ATTEMPT",
      "DEFER_DLV",
      "EDIT_DETAILS",
    ].includes(normalizedAction)
  ) {
    throw new Error(
      "Invalid Delhivery NDR action",
    );
  }

  const payload = {
    action: normalizedAction,
  };

  if (normalizedAction === "DEFER_DLV") {
    if (!deferredDate) {
      throw new Error(
        "Preferred delivery date is required",
      );
    }

    payload.deferredDate =
      clean(deferredDate);
  }

  if (
    normalizedAction === "EDIT_DETAILS"
  ) {
    const phone = normalizePhone(
      consignee.phone,
    );

    const pincode = clean(
      consignee.pincode,
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
      name: clean(consignee.name),
      phone,
      address: clean(
        consignee.address,
      ),
      address2: clean(
        consignee.address2,
      ),
      landmark: clean(
        consignee.landmark,
      ),
      city: clean(consignee.city),
      state: clean(consignee.state),
      pincode,
      country:
        clean(consignee.country) ||
        "India",
    };
  }

  return payload;
};

const buildShiprocketPayload = ({
  action,
  deferredDate,
  consignee,
}) => {
  const selectedAction = clean(action)
    .toUpperCase();

  if (
    ![
      "RE-ATTEMPT",
      "DEFER_DLV",
      "EDIT_DETAILS",
      "RETURN",
    ].includes(selectedAction)
  ) {
    throw new Error(
      "Invalid Shiprocket NDR action",
    );
  }

  if (
    selectedAction === "DEFER_DLV" &&
    !deferredDate
  ) {
    throw new Error(
      "Preferred delivery date is required",
    );
  }

  if (
    selectedAction === "EDIT_DETAILS"
  ) {
    const phone = normalizePhone(
      consignee.phone,
    );

    if (
      !consignee.address ||
      phone.length !== 10
    ) {
      throw new Error(
        "Valid phone and address are required",
      );
    }
  }

  const address2 = [
    consignee.address2,
    consignee.landmark,
    consignee.city,
    consignee.state,
    consignee.pincode,
  ]
    .map(clean)
    .filter(Boolean)
    .join(", ");

  return {
    action:
      selectedAction === "RETURN"
        ? "return"
        : "re-attempt",

    comments:
      selectedAction === "RETURN"
        ? "Customer requested return to origin"
        : "Customer confirmed delivery reattempt",

    ...(selectedAction ===
      "DEFER_DLV" && {
      deferredDate:
        clean(deferredDate),
    }),

    ...(selectedAction ===
      "EDIT_DETAILS" && {
      phone: normalizePhone(
        consignee.phone,
      ),
      address1: clean(
        consignee.address,
      ),
      address2,
    }),
  };
};

const useNdrStore = create(
  (set, get) => ({
    order: null,
    provider: null,
    result: null,
    loading: false,
    submitting: false,
    error: null,

    clearError: () =>
      set({ error: null }),

    reset: () =>
      set({
        order: null,
        provider: null,
        result: null,
        loading: false,
        submitting: false,
        error: null,
      }),

    fetchNdrOrder: async (token) => {
      const orderNumber = clean(token);

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
        const data =
          await findNdrOrder(
            orderNumber,
          );

        const provider =
          clean(data.provider)
            .toLowerCase();

        set({
          order: data,
          provider,
        });

        return data;
      } catch (error) {
        set({
          order: null,
          provider: null,
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
      const orderNumber = clean(token);
      const provider =
        get().provider ||
        get().order?.provider;

      if (!orderNumber) {
        throw new Error(
          "Invalid order link",
        );
      }

      if (
        ![
          "delhivery",
          "shiprocket",
        ].includes(provider)
      ) {
        throw new Error(
          "Courier provider not found",
        );
      }

      const payload =
        provider === "shiprocket"
          ? buildShiprocketPayload({
            action,
            deferredDate,
            consignee,
          })
          : buildDelhiveryPayload({
            action,
            deferredDate,
            consignee,
          });

      set({
        submitting: true,
        error: null,
        result: null,
      });

      try {
        const data = await request(
          provider,
          `/customer/${encodeURIComponent(
            orderNumber,
          )}/action`,
          {
            method: "POST",
            body: JSON.stringify(
              payload,
            ),
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
  }),
);

export default useNdrStore;
