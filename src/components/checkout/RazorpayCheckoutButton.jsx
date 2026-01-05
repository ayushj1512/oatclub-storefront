"use client";

import { IndianRupee, Loader2 } from "lucide-react";
import { useRazorpayStore } from "@/store/razorpayStore";
import { notify } from "@/lib/notify";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useRef, useState } from "react";

export default function RazorpayCheckoutButton({
  createOrder,
  disabled = false,
  onRecovery, // optional callback(order) → show retry/cod UI
}) {
  const router = useRouter();
  const clearCart = useCartStore((s) => s.clearCart);
  const { payWithRazorpay, loading } = useRazorpayStore();
  const [preparing, setPreparing] = useState(false);
  const lock = useRef(false);

  const handlePay = async () => {
    if (disabled || loading || preparing || lock.current) return;
    if (typeof createOrder !== "function") return notify.error("Order fn missing");

    lock.current = true;
    setPreparing(true);

    try {
      const order = await createOrder(); // ✅ must throw if invalid
      if (!order?._id) throw new Error("Order creation failed");

      await payWithRazorpay({
        mongoOrderId: order._id,

        onSuccess: (res) => {
          notify.success("Payment successful 🎉");
          clearCart?.();
          router.replace(`/order-success?order=${res?.orderNumber || order?.orderNumber || order._id}`);
        },

        onFailure: (err) => {
          notify.error(err?.response?.data?.message || err?.message || "Payment cancelled");
          onRecovery?.(order); // ✅ lets checkout page open recovery UI
        },
      });
    } catch (e) {
      notify.error(e?.message || "Unable to start payment");
    } finally {
      setPreparing(false);
      lock.current = false;
    }
  };

  const busy = disabled || loading || preparing;

  return (
    <button
      type="button"
      onClick={handlePay}
      disabled={busy}
      aria-busy={busy}
      className="w-full flex items-center justify-center gap-2 rounded-2xl py-3 text-base font-semibold text-white bg-black shadow-[0_16px_34px_rgba(0,0,0,0.28)] hover:bg-black/90 active:scale-[0.99] transition disabled:opacity-60 disabled:pointer-events-none"
    >
      {busy ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Processing…
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
