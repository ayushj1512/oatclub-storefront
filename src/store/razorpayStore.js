"use client";

import { create } from "zustand";
import axios from "axios";
import { trackMeta } from "@/lib/meta/track"; // ✅ Meta Pixel + CAPI unified tracker

/* ----------------------------------------------------
   ENV
---------------------------------------------------- */
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

if (!BACKEND) {
  console.error("❌ NEXT_PUBLIC_BACKEND_URL is missing");
}

/* ----------------------------------------------------
   Razorpay SDK Loader (OFFICIAL)
   ✅ Prevent duplicate script injection
---------------------------------------------------- */
const loadRazorpaySDK = () =>
  new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);

    // ✅ Prevent multiple loaders
    if (document.getElementById("razorpay-checkout-js")) return resolve(true);

    const script = document.createElement("script");
    script.id = "razorpay-checkout-js";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });

/* ----------------------------------------------------
   Helper: build "contents" payload for Meta
---------------------------------------------------- */
function buildMetaContents(orderData) {
  // If backend returns items details, use them
  const items = orderData?.items || orderData?.order?.items || [];

  const contents = (items || [])
    .map((it) => {
      const id = it?.productId || it?.id;
      const quantity = Number(it?.quantity ?? it?.qty ?? 1) || 1;

      // price may or may not exist here
      const price = Number(it?.price ?? it?.item_price ?? it?.salePrice ?? 0) || 0;

      if (!id) return null;
      return {
        id: String(id),
        quantity,
        item_price: price,
      };
    })
    .filter(Boolean);

  return contents;
}

/* ----------------------------------------------------
   Zustand Razorpay Store
---------------------------------------------------- */
export const useRazorpayStore = create((set, get) => ({
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
     ✅ Fires:
       - AddPaymentInfo (after create-order)
       - Purchase (after verify success)
  ------------------------------------------------ */
  payWithRazorpay: async ({ mongoOrderId, onSuccess, onFailure }) => {
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
      const { data } = await axios.post(`${BACKEND}/api/razorpay/create-order`, {
        mongoOrderId,
      });

      if (!data?.success) {
        throw new Error(data?.message || "Failed to create Razorpay order");
      }

      /* ------------------------------------------------
         ✅ META: AddPaymentInfo
         Fire once payment method is engaged (Razorpay)
      ------------------------------------------------- */
      try {
        const value = Number(data?.amount || 0) / 100 || 0; // Razorpay amount = paise
        const currency = data?.currency || "INR";
        const contents = buildMetaContents(data);

        await trackMeta("AddPaymentInfo", {
          currency,
          value,
          payment_method: "razorpay",
          content_type: "product",
          content_ids: contents.map((c) => c.id),
          contents,
        });
      } catch (e) {
        console.warn("🧾 Meta AddPaymentInfo failed (razorpay)", e);
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
            /* ---------------- VERIFY PAYMENT ---------------- */
            await axios.post(`${BACKEND}/api/razorpay/verify`, {
              mongoOrderId: data.mongoOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            /* ------------------------------------------------
               ✅ META: PURCHASE (MOST IMPORTANT)
               Fire ONLY after successful verification
            ------------------------------------------------- */
            try {
              const value = Number(data?.amount || 0) / 100 || 0;
              const currency = data?.currency || "INR";
              const contents = buildMetaContents(data);

              await trackMeta("Purchase", {
                currency,
                value,
                order_id: data.mongoOrderId || data.orderNumber || mongoOrderId,
                content_type: "product",
                content_ids: contents.map((c) => c.id),
                contents,
              });
            } catch (e) {
              console.warn("🧾 Meta Purchase failed (razorpay)", e);
            }

            /* ------------------------------------------------
               🔥 ABANDONED CART → RECOVERED
            ------------------------------------------------ */
            try {
              const { useAbandonedCartStore } = await import(
                "@/store/abandonedCartStore"
              );

              const abandoned = useAbandonedCartStore.getState();
              const cart = abandoned.cart;

              if (cart?._id) {
                await abandoned.markRecovered(cart._id, data.mongoOrderId);
              }
            } catch (e) {
              console.warn("⚠️ Abandoned cart recovery failed (Razorpay)", e);
            }

            /* ---------------- SUCCESS STATE ---------------- */
            set({ loading: false, paymentSuccess: true });

            onSuccess?.({
              orderNumber: data.orderNumber,
              mongoOrderId: data.mongoOrderId,
              razorpay_payment_id: response.razorpay_payment_id,
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
