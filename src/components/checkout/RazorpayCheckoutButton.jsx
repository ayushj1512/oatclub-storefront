"use client";

import { useRef, useState } from "react";
import { IndianRupee, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/notify";
import { useCartStore } from "@/store/cartStore";
import { useRazorpayStore } from "@/store/razorpayStore";

export default function RazorpayCheckoutButton({
  createOrder,
  disabled = false,
  onRecovery,
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
      const order = await createOrder();
      if (!order?._id) throw new Error("Order creation failed");

      await payWithRazorpay({
        mongoOrderId: order._id,
        onSuccess: (res) => {
          notify.success("Payment successful");
          clearCart?.();
          router.replace(
            `/order-success?order=${res?.orderNumber || order?.orderNumber || order._id}`
          );
        },
        onFailure: (err) => {
          notify.error(err?.response?.data?.message || err?.message || "Payment cancelled");
          onRecovery?.(order);
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
      className="flex h-11 w-full items-center justify-center gap-2 bg-black text-[10px] font-black uppercase tracking-[0.16em] text-white transition hover:bg-neutral-800 disabled:pointer-events-none disabled:bg-black/20 disabled:text-black/40"
    >
      {busy ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <IndianRupee className="h-4 w-4" />
          Pay Securely
        </>
      )}
    </button>
  );
}
