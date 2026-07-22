"use client";

import { create } from "zustand";
import { useAuthStore } from "@/store/authStore";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL;

/* =========================================================
   HELPERS
========================================================= */

const normalizeEmail = (email = "") =>
  String(email).trim().toLowerCase();

const parseResponse = async (response) => {
  const raw = await response.text();

  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const request = async (endpoint, options = {}) => {
  if (!API_URL) {
    throw new Error("API URL is not configured");
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    const error = new Error(
      data?.message ||
        data?.error?.message ||
        "Something went wrong",
    );

    error.code = data?.code || "OTP_ERROR";
    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
};

const initialState = {
  email: "",
  purpose: "",
  customerExists: null,

  otpSession: null,

  lookingUp: false,
  sending: false,
  verifying: false,

  verified: false,
  error: "",
};

/* =========================================================
   STORE
========================================================= */

export const useOtpStore = create((set, get) => ({
  ...initialState,

  /* Reset complete OTP flow */
  resetOtp: () => set(initialState),

  /* Clear only current error */
  clearError: () => set({ error: "" }),

  /* =======================================================
     LOOKUP CUSTOMER BY EMAIL
  ======================================================= */
  lookupEmail: async (email) => {
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      throw new Error("Email is required");
    }

    set({
      lookingUp: true,
      email: normalizedEmail,
      error: "",
    });

    try {
      const response = await request(
        "/api/customers/auth/email-lookup",
        {
          method: "POST",
          body: JSON.stringify({
            email: normalizedEmail,
          }),
        },
      );

      const exists = Boolean(response?.exists);
      const purpose = exists ? "login" : "signup";

      set({
        email: normalizedEmail,
        customerExists: exists,
        purpose,
      });

      return {
        exists,
        purpose,
      };
    } catch (error) {
      set({
        customerExists: null,
        purpose: "",
        error: error.message,
      });

      throw error;
    } finally {
      set({ lookingUp: false });
    }
  },

  /* =======================================================
     LOOKUP EMAIL + SEND OTP
  ======================================================= */
  startEmailOtp: async ({
    email,
    name = "",
    metadata = {},
  }) => {
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      throw new Error("Email is required");
    }

    set({
      sending: true,
      verified: false,
      error: "",
    });

    try {
      const { exists, purpose } =
        await get().lookupEmail(normalizedEmail);

      const response = await request("/api/otp/send", {
        method: "POST",
        body: JSON.stringify({
          identifier: normalizedEmail,
          channel: "email",
          purpose,
          name: String(name || "").trim(),
          metadata: {
            ...metadata,
            customerExists: exists,
          },
        }),
      });

      const responseData =
        response?.data || response || {};

      set({
        email: normalizedEmail,
        purpose,
        customerExists: exists,

        otpSession: {
          ...responseData,
          identifier: normalizedEmail,
          purpose,
          name: String(name || "").trim(),
        },
      });

      return {
        ...response,
        exists,
        purpose,
      };
    } catch (error) {
      set({
        error: error.message,
      });

      throw error;
    } finally {
      set({
        sending: false,
        lookingUp: false,
      });
    }
  },

  /* =======================================================
     DIRECT SEND OTP
     Use only when purpose is already known
  ======================================================= */
  sendOtp: async ({
    email,
    name = "",
    purpose = "login",
    metadata = {},
  }) => {
    const identifier = normalizeEmail(email);
    const normalizedPurpose =
      purpose === "signup" ? "signup" : "login";

    if (!identifier) {
      throw new Error("Email is required");
    }

    set({
      sending: true,
      verified: false,
      email: identifier,
      purpose: normalizedPurpose,
      error: "",
    });

    try {
      const response = await request("/api/otp/send", {
        method: "POST",
        body: JSON.stringify({
          identifier,
          channel: "email",
          purpose: normalizedPurpose,
          name: String(name || "").trim(),
          metadata,
        }),
      });

      set({
        otpSession: {
          ...(response?.data || response || {}),
          identifier,
          purpose: normalizedPurpose,
          name: String(name || "").trim(),
        },
      });

      return response;
    } catch (error) {
      set({
        error: error.message,
      });

      throw error;
    } finally {
      set({
        sending: false,
      });
    }
  },

  /* =======================================================
     RESEND CURRENT OTP
  ======================================================= */
  resendOtp: async (metadata = {}) => {
    const session = get().otpSession;

    if (!session?.identifier || !session?.purpose) {
      throw new Error("OTP session not found");
    }

    set({
      sending: true,
      verified: false,
      error: "",
    });

    try {
      const response = await request("/api/otp/resend", {
        method: "POST",
        body: JSON.stringify({
          identifier: session.identifier,
          channel: "email",
          purpose: session.purpose,
          name: session.name || "",
          referenceId: session.referenceId || undefined,
          metadata,
        }),
      });

      set({
        otpSession: {
          ...session,
          ...(response?.data || response || {}),
          identifier: session.identifier,
          purpose: session.purpose,
        },
      });

      return response;
    } catch (error) {
      set({
        error: error.message,
      });

      throw error;
    } finally {
      set({
        sending: false,
      });
    }
  },

  /* =======================================================
     VERIFY OTP + CREATE AUTH SESSION
  ======================================================= */
  verifyOtp: async (otp) => {
    const session = get().otpSession;

    if (!session?.identifier || !session?.purpose) {
      throw new Error("OTP session not found");
    }

    const normalizedOtp = String(otp || "")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (normalizedOtp.length !== 6) {
      throw new Error("Enter a valid 6-digit OTP");
    }

    set({
      verifying: true,
      verified: false,
      error: "",
    });

    try {
      const response = await request("/api/otp/verify", {
        method: "POST",
        body: JSON.stringify({
          identifier: session.identifier,
          channel: "email",
          purpose: session.purpose,
          otp: normalizedOtp,
          referenceId:
            session.referenceId || undefined,
        }),
      });

      const responseData =
        response?.data || response || {};

      const token =
        responseData?.token ||
        responseData?.accessToken ||
        responseData?.jwt ||
        null;

      const customer =
        responseData?.customer ||
        responseData?.user?.customer ||
        null;

      if (!token || !customer?._id) {
        throw new Error(
          "OTP verified but authentication session was not returned",
        );
      }

      const authResult =
        useAuthStore
          .getState()
          .loginWithBackendOtp({
            token,
            customer,
            purpose: session.purpose,
          });

      set({
        verified: true,
        otpSession: {
          ...session,
          verifiedAt:
            responseData?.verifiedAt ||
            new Date().toISOString(),
        },
      });

      return {
        ...response,
        token,
        customer,
        auth: authResult,
      };
    } catch (error) {
      set({
        verified: false,
        error: error.message,
      });

      throw error;
    } finally {
      set({
        verifying: false,
      });
    }
  },
}));