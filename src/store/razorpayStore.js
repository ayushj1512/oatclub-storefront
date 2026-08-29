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

/**
 * ✅ Build tracking contents from backend order response.
 * Prefer variantId/sku when possible, but always ensure an id exists.
 */
const buildContents = (orderData) => {
  const items =
    orderData?.items ||
    orderData?.order?.items ||
    [];

  return items
    .map((it) => {
      const id =
        it?.catalogId ||
        it?.variantSku ||
        it?.productSnapshot?.sku ||
        it?.productSnapshot?.productCode ||
        it?.productCode ||
        it?.productId ||
        it?.id;

      if (!id) return null;

      return {
        id: String(id),

        variantId: it?.variantId
          ? String(it.variantId)
          : null,

        name:
          it?.productSnapshot?.title ||
          it?.title ||
          it?.name ||
          "",

        variant:
          it?.selectedSize ||
          it?.size ||
          "",

        quantity: Math.max(
          1,
          Number(it?.quantity ?? it?.qty ?? 1)
        ),

        item_price:
          Number(
            it?.price ??
            it?.item_price ??
            it?.itemPrice ??
            it?.salePrice ??
            it?.unitPrice ??
            it?.productSnapshot?.price ??
            0
          ) || 0,
      };
    })
    .filter(Boolean);
};

/**
 * ✅ Razorpay API returns amount in paise.
 * We convert to rupees for analytics.
 */
const paiseToRupees = (paise) => {
  const n = Number(paise);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return n / 100;
};

export const useRazorpayStore = create((set, get) => ({
  loading: false,
  error: null,
  paymentSuccess: false,

  reset: () => set({ loading: false, error: null, paymentSuccess: false }),

  /**
   * payWithRazorpay
   * - takes mongoOrderId (created via /api/orders)
   * - creates Razorpay order
   * - opens checkout
   * - verifies payment
   * - fires Purchase tracking centrally via orderStore.trackPurchaseSuccess
   */
  payWithRazorpay: async ({ mongoOrderId, onSuccess, onFailure }) => {
    try {
      if (!mongoOrderId) throw new Error("mongoOrderId is required");

      set({ loading: true, error: null, paymentSuccess: false });

      const sdkLoaded = await loadRazorpaySDK();
      if (!sdkLoaded) throw new Error("Razorpay SDK failed to load");

      if (!BACKEND) throw new Error("Backend not configured");

      // 1️⃣ Create Razorpay order from backend (uses the backend final amount)
      const { data } = await axios.post(`${BACKEND}/api/razorpay/create-order`, {
        mongoOrderId,
      });

      if (!data?.success) {
        throw new Error(data?.message || "Failed to create Razorpay order");
      }

      // ✅ Use backend amount (already includes coupon + 5% online off if applied in createOrder/backend)
      const value = paiseToRupees(data?.amount);
      const currency = data?.currency || "INR";
      const contents = buildContents(data);

      // ✅ Dedup: avoid double-open / double-verify if user clicks fast
      const guardKey = `rzp_${String(mongoOrderId)}`;
      if (get()._activeKey === guardKey) return;
      set({ _activeKey: guardKey });

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount, // paise
        currency,
        order_id: data.razorpayOrderId,
        name: "OATCLUB",
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
        theme: { color: "#800020" },

        // ✅ 2️⃣ Success → Verify → Purchase
        handler: async (response) => {
          try {
            const { data: verifyData } = await axios.post(
              `${BACKEND}/api/razorpay/verify`,
              {
                mongoOrderId: data.mongoOrderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }
            );

            if (!verifyData?.success) {
              throw new Error(
                verifyData?.message || "Payment verification failed"
              );
            }

            const verifiedOrder = verifyData?.order || {};

            const paymentMethod = String(
              verifyData?.paymentMethod ||
              verifiedOrder?.paymentMethod ||
              data?.paymentMethod ||
              "razorpay"
            )
              .trim()
              .toLowerCase();

            const orderId = String(
              verifiedOrder?._id ||
              data?.mongoOrderId ||
              mongoOrderId ||
              ""
            ).trim();

            const transactionId = String(
              verifiedOrder?.orderNumber ||
              data?.orderNumber ||
              orderId
            ).trim();

            const purchaseValue =
              Number(
                verifiedOrder?.finalPayable ??
                verifiedOrder?.totalAmount ??
                verifiedOrder?.grandTotal ??
                verifiedOrder?.finalTotal ??
                0
              ) || paiseToRupees(data?.amount);

            const contents = buildContents(verifiedOrder);

            if (orderId) {
              const metaResult =
                await useOrderStore
                  .getState()
                  .trackPurchaseSuccess({
                    orderId,
                    transactionId,

                    currency:
                      verifiedOrder?.currency ||
                      data?.currency ||
                      "INR",

                    value: purchaseValue,
                    contents,

                    coupon:
                      verifiedOrder?.coupon?.code ||
                      verifiedOrder?.coupon ||
                      null,

                    paymentMethod,

                    event_source_url:
                      typeof window !== "undefined"
                        ? `${window.location.origin}/order-success?order=${encodeURIComponent(
                          transactionId
                        )}`
                        : undefined,

                    customer: {
                      ...(verifiedOrder?.customerId &&
                        typeof verifiedOrder.customerId === "object"
                        ? verifiedOrder.customerId
                        : {}),

                      email:
                        verifiedOrder
                          ?.shippingAddressSnapshot
                          ?.email ||
                        data?.customer?.email ||
                        "",

                      phone:
                        verifiedOrder
                          ?.shippingAddressSnapshot
                          ?.phone ||
                        data?.customer?.phone ||
                        "",

                      shippingAddressSnapshot:
                        verifiedOrder
                          ?.shippingAddressSnapshot ||
                        {},
                    },
                  });

              console.log("🟢 META PURCHASE RESULT", {
                orderId,
                transactionId,
                paymentMethod,
                paymentStatus:
                  verifyData?.paymentStatus ||
                  verifiedOrder?.paymentStatus,
                value: purchaseValue,
                items: contents.length,
                pixelSent: metaResult?.pixelSent,
                capiSent: metaResult?.capiSent,
                eventId: metaResult?.eventId,
              });
            }

            try {
              const { useAbandonedCartStore } =
                await import("@/store/abandonedCartStore");

              const abandoned =
                useAbandonedCartStore.getState();

              if (abandoned?.cart?._id) {
                await abandoned.markRecovered(
                  abandoned.cart._id,
                  data.mongoOrderId
                );
              }
            } catch { }

            set({
              loading: false,
              paymentSuccess: true,
              _activeKey: null,
            });

            onSuccess?.({
              orderNumber:
                verifiedOrder?.orderNumber ||
                data.orderNumber,

              mongoOrderId:
                verifiedOrder?._id ||
                data.mongoOrderId,

              paymentMethod,

              paymentStatus:
                verifyData?.paymentStatus ||
                verifiedOrder?.paymentStatus,

              razorpay_payment_id:
                response.razorpay_payment_id,
            });
          } catch (err) {
            console.error(
              "❌ Razorpay verify / Meta purchase error:",
              err
            );

            set({
              loading: false,
              error:
                err?.response?.data?.message ||
                err?.message ||
                "Payment verification failed",
              _activeKey: null,
            });

            onFailure?.(err);
          }
        },

        modal: {
          ondismiss: async () => {
            set({ loading: false, _activeKey: null });

            // ✅ Optional: payment_failed event (dismiss = likely fail)
            try {
              pushEcomEvent("payment_failed", {
                transaction_id: String(mongoOrderId),
                payment_method: "razorpay",
              });
              await trackMeta("PaymentFailed", {
                order_id: String(mongoOrderId),
                payment_method: "razorpay",
              });
            } catch {}
          },
        },
      };

      const rzp = new window.Razorpay(options);

      // ✅ 3️⃣ Payment failed
      rzp.on("payment.failed", async (resp) => {
        set({ loading: false, _activeKey: null });

        try {
          pushEcomEvent("payment_failed", {
            transaction_id: String(mongoOrderId),
            payment_method: "razorpay",
          });
          await trackMeta("PaymentFailed", {
            order_id: String(mongoOrderId),
            payment_method: "razorpay",
          });
        } catch {}

        onFailure?.(
          new Error(resp?.error?.description || "Payment failed. Please try again.")
        );
      });

      rzp.open();
    } catch (err) {
      console.error("❌ Razorpay Error:", err);
      set({
        loading: false,
        error: err?.response?.data?.message || err.message,
        _activeKey: null,
      });
      onFailure?.(err);
    }
  },

  // internal guard
  _activeKey: null,
}));

