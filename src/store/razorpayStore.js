"use client";

import { create } from "zustand";
import axios from "axios";

/* ----------------------------------------------------
   ENV
---------------------------------------------------- */
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

if (!BACKEND) {
  console.error("❌ NEXT_PUBLIC_BACKEND_URL is missing");
}

/* ----------------------------------------------------
   Razorpay SDK Loader (OFFICIAL)
---------------------------------------------------- */
const loadRazorpaySDK = () =>
  new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });

/* ----------------------------------------------------
   Zustand Razorpay Store
---------------------------------------------------- */
export const useRazorpayStore = create((set) => ({
  /* ---------- STATE ---------- */
  loading: false,
  error: null,
  paymentSuccess: false,

  /* ---------- RESET ---------- */
  reset: () =>
    set({
      loading: false,
      error: null,
      paymentSuccess: false,
    }),

  /* ------------------------------------------------
     MAIN PAYMENT FLOW
  ------------------------------------------------ */
  payWithRazorpay: async ({
    mongoOrderId,
    onSuccess,
    onFailure,
  }) => {
    try {
      if (!mongoOrderId) {
        throw new Error("mongoOrderId is required");
      }

      set({ loading: true, error: null, paymentSuccess: false });

      /* 1️⃣ Load Razorpay SDK */
      const sdkLoaded = await loadRazorpaySDK();
      if (!sdkLoaded) {
        throw new Error("Razorpay SDK failed to load");
      }

      /* 2️⃣ Create Razorpay Order (BACKEND) */
      const { data } = await axios.post(
        `${BACKEND}/api/razorpay/create-order`,
        { mongoOrderId }
      );

      if (!data?.success) {
        throw new Error(data?.message || "Failed to create Razorpay order");
      }

      /* 3️⃣ Configure Razorpay Checkout */
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // ✅ PUBLIC KEY ONLY
        amount: data.amount,
        currency: data.currency,
        order_id: data.razorpayOrderId,

        name: "Miray Fashion",
        description: `Order ${data.orderNumber}`,

        prefill: {
          name: data.customer?.name || "",
          email: data.customer?.email || "",
          contact: data.customer?.phone || "",
        },

        notes: {
          mongoOrderId: data.mongoOrderId,
          orderNumber: data.orderNumber,
        },

        theme: {
          color: "#800020",
        },

        /* 4️⃣ Payment Success → VERIFY */
        handler: async (response) => {
          try {
            await axios.post(
              `${BACKEND}/api/razorpay/verify`,
              {
                mongoOrderId: data.mongoOrderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }
            );

            set({ loading: false, paymentSuccess: true });

            onSuccess?.({
              orderNumber: data.orderNumber,
              mongoOrderId: data.mongoOrderId,
            });
          } catch (err) {
            set({
              loading: false,
              error:
                err?.response?.data?.message ||
                "Payment verification failed",
            });
            onFailure?.(err);
          }
        },

        /* 5️⃣ Modal Closed */
        modal: {
          ondismiss: () => {
            set({ loading: false });
          },
        },
      };

      /* 6️⃣ Open Razorpay */
      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", (response) => {
        set({ loading: false });
        onFailure?.(
          new Error(
            response?.error?.description ||
              "Payment failed. Please try again."
          )
        );
      });

      rzp.open();
    } catch (err) {
      console.error("❌ Razorpay Error:", err);
      set({
        loading: false,
        error: err?.response?.data?.message || err.message,
      });
      onFailure?.(err);
    }
  },
}));
