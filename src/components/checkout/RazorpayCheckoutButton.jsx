"use client";

import { IndianRupee, Loader2 } from "lucide-react";
import { useRazorpayStore } from "@/store/razorpayStore";
import { notify } from "@/lib/notify";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useRef, useState } from "react";

export default function RazorpayCheckoutButton({
  createOrder, // 🔥 async fn → creates order (paymentMethod: razorpay) & returns order
  disabled = false,
}) {
  const router = useRouter();
  const clearCart = useCartStore((s) => s.clearCart);

  const { payWithRazorpay, loading } = useRazorpayStore();

  // UI loader (order creation phase)
  const [preparing, setPreparing] = useState(false);

  // 🔒 HARD LOCK (prevents double click + re-render issues)
  const inFlightRef = useRef(false);

  const handlePay = async () => {
    // 🛑 HARD GUARDS
    if (disabled || loading || preparing || inFlightRef.current) return;

    if (typeof createOrder !== "function") {
      notify.error("Order creation function missing");
      return;
    }

    try {
      inFlightRef.current = true;
      setPreparing(true);

      /* 1️⃣ CREATE ORDER (marked for razorpay) */
      const order = await createOrder();

      if (!order?._id) {
        throw new Error("Order creation failed");
      }

      /* 2️⃣ OPEN RAZORPAY */
      await payWithRazorpay({
        mongoOrderId: order._id,

        // ✅ PAYMENT SUCCESS
        onSuccess: (res) => {
          notify.success("Payment successful 🎉");

          // ✅ CLEAR CART ONLY AFTER PAYMENT SUCCESS
          clearCart?.();

          const orderRef =
            res?.orderNumber || order?.orderNumber || order._id;

          router.replace(`/order-success?order=${orderRef}`);
        },

        // ❌ PAYMENT FAILURE
        onFailure: (err) => {
  notify.error(
    err?.response?.data?.message ||
      err?.message ||
      "Payment failed or cancelled"
  );

  setPaymentRecovery({
    open: true,
    orderId: order._id,
    orderNumber: order.orderNumber,
  });
},
      });
    } catch (err) {
      notify.error(err?.message || "Unable to start payment");
    } finally {
      setPreparing(false);
      inFlightRef.current = false;
    }
  };

  const isLocked = disabled || loading || preparing;

 return (
  <button
    type="button"
    onClick={handlePay}
    disabled={isLocked}
    aria-busy={isLocked}
    className="w-full flex items-center justify-center gap-2 rounded-2xl py-3 text-base font-semibold text-white bg-black shadow-[0_16px_34px_rgba(0,0,0,0.28)] hover:bg-black/90 active:scale-[0.99] transition disabled:opacity-60 disabled:pointer-events-none"
  >
    {isLocked ? (
      <>
        <Loader2 className="w-4 h-4 animate-spin" />
        Processing payment…
      </>
    ) : (
      <>
        <IndianRupee className="w-4 h-4" />
        Pay Securely
      </>
    )}
  </button>
);

}
