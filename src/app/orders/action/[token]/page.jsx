"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  IndianRupee,
  Loader2,
  PackageCheck,
  PackageX,
  Phone,
  User,
  XCircle,
} from "lucide-react";
import { useOrderStore } from "@/store/orderStore";
import CancelOrderModal from "@/components/orders/CancelOrderModal";

const money = (v) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(v || 0));

export default function OrderActionPage() {
  const { token } = useParams();

  const runningRef = useRef(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [justCompleted, setJustCompleted] = useState(null);
  const [localError, setLocalError] = useState("");

  const {
    actionOrder: order,
    actionLoading,
    actionError,
    fetchOrderByActionToken,
    confirmOrderByActionToken,
    cancelOrder,
    clearActionOrder,
  } = useOrderStore();

  useEffect(() => {
    if (!token) return;
    fetchOrderByActionToken(token);
    return () => clearActionOrder?.();
  }, [token, fetchOrderByActionToken, clearActionOrder]);

  const status = String(order?.fulfillmentStatus || "").toLowerCase();
  const isConfirmed = Boolean(order?.isConfirmed);
  const isCancelled = status === "cancelled";
  const canCancel = ["processing", "packed"].includes(status);

  const view = useMemo(() => {
    if (justCompleted) return justCompleted;
    if (isConfirmed || isCancelled) return "expired";
    return "pending";
  }, [justCompleted, isConfirmed, isCancelled]);

  const refetch = async () => {
    if (token) await fetchOrderByActionToken(token);
  };

  const handleConfirm = async () => {
    if (runningRef.current) return;

    try {
      runningRef.current = true;
      setSubmitting(true);
      setLocalError("");

      await confirmOrderByActionToken();
      setJustCompleted("confirmed");
    } catch (e) {
      setLocalError(e?.message || "Unable to confirm order");
      await refetch();
    } finally {
      runningRef.current = false;
      setSubmitting(false);
    }
  };

  const handleCancelConfirm = async (reasonText = "") => {
    if (runningRef.current) return;

    try {
      if (!order?._id) throw new Error("Order not found");

      runningRef.current = true;
      setSubmitting(true);
      setLocalError("");

      await cancelOrder(order._id, reasonText);

      setCancelOpen(false);
      setJustCompleted("cancelled");
    } catch (e) {
      setLocalError(e?.message || "Cancel failed. Please try again.");
      await refetch();
    } finally {
      runningRef.current = false;
      setSubmitting(false);
    }
  };

  if (actionLoading && !order) {
    return (
      <main className="grid min-h-screen place-items-center bg-white">
        <Loader2 className="h-5 w-5 animate-spin text-neutral-700" />
      </main>
    );
  }

  if (actionError && !order) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f7f7] px-4">
        <div className="w-full max-w-sm rounded-[28px] bg-white p-6 text-center shadow-sm">
          <XCircle className="mx-auto h-10 w-10 text-red-500" />
          <h1 className="mt-4 text-lg font-semibold text-neutral-950">
            Order not found
          </h1>
          <p className="mt-2 text-sm text-neutral-500">{actionError}</p>
          <a
            href="/support"
            className="mt-5 inline-flex rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Contact Support
          </a>
        </div>
      </main>
    );
  }

  if (view === "expired") {
    return <ExpiredPage orderNumber={order?.orderNumber} />;
  }

  if (view === "confirmed") {
    return (
      <SuccessPage
        good
        orderNumber={order?.orderNumber}
        title="Thanks for confirming your order."
        desc="Your order has been confirmed and will be processed shortly."
      />
    );
  }

  if (view === "cancelled") {
    return (
      <SuccessPage
        orderNumber={order?.orderNumber}
        title="Order cancelled."
        desc="We regret to inform you that your order has been cancelled."
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f6f6] px-4 py-5">
      <section className="mx-auto w-full max-w-sm">
        <div className="rounded-[28px] bg-white p-5 shadow-[0_16px_50px_rgba(0,0,0,0.06)]">
          <TopState orderNumber={order?.orderNumber} />

          {localError ? (
            <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {localError}
            </div>
          ) : null}

          <div className="mt-5 space-y-3">
            {(order?.items || []).map((item) => (
              <div
                key={item?.lineId || item?._id}
                className="flex gap-3 rounded-2xl bg-neutral-50 p-3"
              >
                <img
                  src={item?.productSnapshot?.thumbnail || "/placeholder.png"}
                  alt={item?.productSnapshot?.title || "Product"}
                  className="h-16 w-16 rounded-xl bg-white object-cover"
                />

                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-medium leading-5 text-neutral-950">
                    {item?.productSnapshot?.title || "Product"}
                  </p>

                  <p className="mt-1 text-xs text-neutral-500">
                    Qty {item?.quantity || 1}
                    {item?.selectedSize ? ` • Size ${item.selectedSize}` : ""}
                  </p>

                  <p className="mt-1 text-sm font-semibold text-neutral-950">
                    {money(item?.subtotal)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl bg-neutral-50 p-4">
            <Info
              icon={User}
              label="Customer"
              value={order?.shippingAddressSnapshot?.fullName}
            />
            <Info
              icon={Phone}
              label="Phone"
              value={order?.shippingAddressSnapshot?.phone}
            />
            <div className="my-3 h-px bg-neutral-200/70" />
            <Info
              icon={IndianRupee}
              label="Payable Amount"
              value={money(order?.finalPayable)}
              strong
            />
          </div>

          <div className="mt-5 space-y-2.5">
            <button
              onClick={handleConfirm}
              disabled={actionLoading || submitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 py-3.5 text-sm font-semibold text-white transition active:scale-[0.99] disabled:opacity-60"
            >
              {actionLoading || submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PackageCheck className="h-4 w-4" />
              )}
              Confirm Order
            </button>

            <button
              onClick={() => setCancelOpen(true)}
              disabled={!canCancel || actionLoading || submitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 py-3.5 text-sm font-semibold text-white transition active:scale-[0.99] disabled:opacity-50"
            >
              <PackageX className="h-4 w-4" />
              Cancel Order
            </button>

            {!canCancel && (
              <p className="pt-1 text-center text-xs text-neutral-500">
                Cancellation is available before shipping only.
              </p>
            )}
          </div>
        </div>
      </section>

      <CancelOrderModal
        open={cancelOpen}
        order={order}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancelConfirm}
        loading={submitting}
      />
    </main>
  );
}

function TopState({ orderNumber }) {
  return (
    <div className="rounded-3xl bg-neutral-950 p-5 text-white">
      <p className="text-xs opacity-70">#{orderNumber || "—"}</p>
      <h1 className="mt-2 text-xl font-semibold tracking-tight">
        Action Required
      </h1>
      <p className="mt-1 text-sm opacity-75">
        Confirm or cancel your order below.
      </p>
    </div>
  );
}

function SuccessPage({ title, desc, orderNumber, good }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f7f7] px-4">
      <section className="w-full max-w-sm rounded-[28px] bg-white p-6 text-center shadow-[0_16px_50px_rgba(0,0,0,0.06)]">
        <div
          className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl ${
            good ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
          }`}
        >
          {good ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
        </div>

        <p className="mt-4 text-xs font-medium text-neutral-400">
          #{orderNumber || "Order"}
        </p>

        <h1 className="mt-2 text-xl font-semibold text-neutral-950">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-neutral-500">{desc}</p>

        <a
          href="/"
          className={`mt-6 inline-flex w-full items-center justify-center rounded-2xl py-3 text-sm font-semibold text-white ${
            good ? "bg-green-600" : "bg-red-600"
          }`}
        >
          Continue Shopping
        </a>
      </section>
    </main>
  );
}

function ExpiredPage({ orderNumber }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f7f7] px-4">
      <section className="w-full max-w-sm rounded-[28px] bg-white p-6 text-center shadow-[0_16px_50px_rgba(0,0,0,0.06)]">
        <XCircle className="mx-auto h-10 w-10 text-neutral-600" />

        <p className="mt-4 text-xs font-medium text-neutral-400">
          #{orderNumber || "Order"}
        </p>

        <h1 className="mt-2 text-xl font-semibold text-neutral-950">
          This link has expired
        </h1>

        <p className="mt-2 text-sm leading-6 text-neutral-500">
          This order has already been confirmed or cancelled. Please contact
          support if you need any help.
        </p>

        <a
          href="/support"
          className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-neutral-950 py-3 text-sm font-semibold text-white"
        >
          Contact Support
        </a>
      </section>
    </main>
  );
}

function Info({ icon: Icon, label, value, strong }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <div className="flex items-center gap-2 text-xs text-neutral-500">
        {Icon && <Icon className="h-4 w-4" />}
        {label}
      </div>

      <p
        className={`max-w-[58%] truncate text-right text-sm ${
          strong ? "font-semibold text-neutral-950" : "font-medium text-neutral-800"
        }`}
      >
        {value || "—"}
      </p>
    </div>
  );
}