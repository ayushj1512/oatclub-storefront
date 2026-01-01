"use client";

import { create } from "zustand";
import axios from "axios";
import { pushEcomEvent } from "@/components/tracking/gtm";
import { trackMeta } from "@/lib/meta/track";
import { useOrderStore } from "@/store/orderStore";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

const loadRazorpaySDK = () =>
  new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    if (document.getElementById("razorpay-checkout-js")) return resolve(true);

    const script = document.createElement("script");
    script.id = "razorpay-checkout-js";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const buildContents = (orderData) => {
  const items = orderData?.items || orderData?.order?.items || [];
  return (items || [])
    .map((it) => {
      const id = it?.productId || it?.id;
      if (!id) return null;
      return {
        id: String(id),
        quantity: Number(it?.quantity ?? it?.qty ?? 1) || 1,
        item_price: Number(it?.price ?? it?.item_price ?? it?.salePrice ?? 0) || 0,
      };
    })
    .filter(Boolean);
};

export const useRazorpayStore = create((set) => ({
  loading: false,
  error: null,
  paymentSuccess: false,

  reset: () => set({ loading: false, error: null, paymentSuccess: false }),

  payWithRazorpay: async ({ mongoOrderId, onSuccess, onFailure }) => {
    try {
      if (!mongoOrderId) throw new Error("mongoOrderId is required");
      set({ loading: true, error: null, paymentSuccess: false });

      const sdkLoaded = await loadRazorpaySDK();
      if (!sdkLoaded) throw new Error("Razorpay SDK failed to load");

      // 1️⃣ create Razorpay order from backend
      const { data } = await axios.post(`${BACKEND}/api/razorpay/create-order`, { mongoOrderId });
      if (!data?.success) throw new Error(data?.message || "Failed to create Razorpay order");

      const value = Number(data?.amount || 0) / 100 || 0;
      const currency = data?.currency || "INR";
      const contents = buildContents(data);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency,
        order_id: data.razorpayOrderId,
        name: "Miray Fashion",
        description: `Order ${data.orderNumber}`,
        prefill: {
          name: data.customer?.name || "",
          email: data.customer?.email || "",
          contact: data.customer?.phone || "",
        },
        notes: { mongoOrderId: data.mongoOrderId, orderNumber: data.orderNumber },
        theme: { color: "#800020" },

        // ✅ 2️⃣ Success → Verify → Purchase
        handler: async (response) => {
          try {
            await axios.post(`${BACKEND}/api/razorpay/verify`, {
              mongoOrderId: data.mongoOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            // ✅ CENTRAL: Purchase tracking (Meta + GA4 + internal analytics)
            await useOrderStore.getState().trackPurchaseSuccess({
              orderId: data.mongoOrderId || data.orderNumber || mongoOrderId,
              currency,
              value,
              contents,
              coupon: data?.coupon || null,
              paymentMethod: "razorpay",
            });

            // ✅ Abandoned cart recovered
            try {
              const { useAbandonedCartStore } = await import("@/store/abandonedCartStore");
              const abandoned = useAbandonedCartStore.getState();
              if (abandoned?.cart?._id) await abandoned.markRecovered(abandoned.cart._id, data.mongoOrderId);
            } catch {}

            set({ loading: false, paymentSuccess: true });

            onSuccess?.({
              orderNumber: data.orderNumber,
              mongoOrderId: data.mongoOrderId,
              razorpay_payment_id: response.razorpay_payment_id,
            });
          } catch (err) {
            set({ loading: false, error: err?.response?.data?.message || "Payment verification failed" });
            onFailure?.(err);
          }
        },

        modal: {
          ondismiss: async () => {
            set({ loading: false });

            // ✅ Optional: payment_failed event (dismiss = likely fail)
            try {
              pushEcomEvent("payment_failed", { transaction_id: String(mongoOrderId), payment_method: "razorpay" });
              await trackMeta("PaymentFailed", { order_id: String(mongoOrderId), payment_method: "razorpay" });
            } catch {}
          },
        },
      };

      const rzp = new window.Razorpay(options);

      // ✅ 3️⃣ Payment failed
      rzp.on("payment.failed", async (resp) => {
        set({ loading: false });

        try {
          pushEcomEvent("payment_failed", { transaction_id: String(mongoOrderId), payment_method: "razorpay" });
          await trackMeta("PaymentFailed", { order_id: String(mongoOrderId), payment_method: "razorpay" });
        } catch {}

        onFailure?.(new Error(resp?.error?.description || "Payment failed. Please try again."));
      });

      rzp.open();
    } catch (err) {
      console.error("❌ Razorpay Error:", err);
      set({ loading: false, error: err?.response?.data?.message || err.message });
      onFailure?.(err);
    }
  },
}));
