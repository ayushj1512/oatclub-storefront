"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Loader2,
  MapPin,
  Package,
  RotateCcw,
  Truck,
} from "lucide-react";

import useNdrStore from "@/store/ndrStore";

const ACTIONS = [
  {
    value: "RE-ATTEMPT",
    label: "Reattempt",
    text: "Deliver again at the same address",
    icon: RotateCcw,
  },
  {
    value: "DEFER_DLV",
    label: "Reschedule",
    text: "Choose another delivery date",
    icon: CalendarDays,
  },
];

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

export default function NdrOrderPage() {
  const params = useParams();
  const token = params?.["order-number"];

  const {
    order,
    result,
    submitting,
    error,
    fetchNdrOrder,
    submitNdrAction,
    clearError,
    reset,
  } = useNdrStore();

  const [action, setAction] =
    useState("RE-ATTEMPT");
  const [deferredDate, setDeferredDate] =
    useState("");

  useEffect(() => {
    if (token) {
      fetchNdrOrder(token).catch(() => { });
    }

    return reset;
  }, [token, fetchNdrOrder, reset]);

  const submit = async () => {
    const payload = { token, action };

    if (action === "DEFER_DLV") {
      if (!deferredDate) {
        alert("Please select a delivery date.");
        return;
      }

      payload.deferredDate = deferredDate;
    }

    await submitNdrAction(payload).catch(() => { });
  };

  if (!order && !error) {
    return <State loading />;
  }

  if (error && !order) {
    return (
      <State
        title="Order unavailable"
        text={error}
      />
    );
  }

  if (result) {
    return (
      <State
        success
        title="Request received"
        text={
          action === "RE-ATTEMPT"
            ? "Your delivery reattempt request has been submitted."
            : "Your preferred delivery date has been submitted."
        }
      />
    );
  }

  const address =
    order?.shippingAddress ||
    order?.shippingAddressSnapshot ||
    {};

  const customer = {
    name:
      order?.customer?.name ||
      address.name ||
      address.fullName ||
      "Customer",
    phone:
      order?.customer?.phone ||
      address.phone ||
      "",
  };

  const items = order?.products || order?.items || [];

  const total =
    order?.pricing?.finalPayable ??
    order?.finalPayable ??
    order?.totalAmount ??
    0;

  const fullAddress = [
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <main className="min-h-[100dvh] bg-[#f5f5f3] p-2.5 sm:p-6">
      <section className="mx-auto max-w-xl overflow-hidden rounded-[24px] bg-white shadow-sm">
        <header className="bg-neutral-950 p-5 text-white">
          <span className="text-[9px] font-bold uppercase tracking-widest text-amber-400">
            Delivery Action Required
          </span>

          <h1 className="mt-3 text-2xl font-black">
            Update your delivery
          </h1>

          <p className="mt-1 text-xs text-white/60">
            Order #{order?.orderNumber || token}
          </p>

          <p className="mt-3 flex items-center gap-2 text-[11px] text-white/50">
            <Truck size={14} />
            AWB:{" "}
            {order?.ndr?.waybill ||
              order?.shipment?.awb ||
              "—"}
          </p>
        </header>

        <div className="space-y-4 p-3 sm:p-5">
          <div className="flex gap-2 rounded-xl bg-amber-50 p-3">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-700" />

            <div>
              <p className="text-xs font-bold">
                Delivery attempt unsuccessful
              </p>

              <p className="mt-0.5 text-[11px] text-neutral-600">
                {order?.ndr?.reason ||
                  order?.ndr?.rawStatus ||
                  "Your confirmation is required."}
              </p>
            </div>
          </div>

          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-bold">
              <Package size={14} />
              Your order
            </p>

            <div className="space-y-2">
              {items.map((item, index) => {
                const product =
                  item.productSnapshot || {};

                return (
                  <div
                    key={
                      item.lineId ||
                      item._id ||
                      index
                    }
                    className="flex gap-3 rounded-xl bg-neutral-50 p-2.5"
                  >
                    <img
                      src={
                        item.image ||
                        product.thumbnail ||
                        "/placeholder.png"
                      }
                      alt=""
                      className="h-16 w-14 rounded-lg object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-xs font-semibold">
                        {item.title ||
                          product.title ||
                          "Product"}
                      </p>

                      <p className="mt-1 text-[10px] text-neutral-500">
                        Qty {item.quantity || 1}
                        {item.selectedSize
                          ? ` · Size ${item.selectedSize}`
                          : ""}
                      </p>

                      <p className="mt-1 text-xs font-bold">
                        {money(
                          item.subtotal ||
                          item.price,
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 p-3">
            <p className="flex items-center gap-2 text-xs font-bold">
              <MapPin size={14} />
              Current delivery details
            </p>

            <p className="mt-3 text-xs font-semibold">
              {customer.name}
            </p>

            <p className="mt-1 text-[11px] text-neutral-600">
              {customer.phone || "—"}
            </p>

            <p className="mt-2 text-[10px] leading-4 text-neutral-500">
              {fullAddress || "—"}
            </p>

            <div className="mt-3 flex justify-between border-t pt-3">
              <span className="text-xs text-neutral-500">
                Amount payable
              </span>

              <strong>{money(total)}</strong>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold">
              Select an option
            </p>

            <div className="grid grid-cols-2 gap-2">
              {ACTIONS.map(
                ({
                  value,
                  label,
                  text,
                  icon: Icon,
                }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      clearError();
                      setAction(value);
                    }}
                    className={`rounded-xl border p-3 text-left ${action === value
                        ? "border-neutral-950 bg-neutral-950 text-white"
                        : "border-neutral-200"
                      }`}
                  >
                    <Icon size={16} />

                    <p className="mt-2 text-xs font-bold">
                      {label}
                    </p>

                    <p
                      className={`mt-1 text-[9px] ${action === value
                          ? "text-white/60"
                          : "text-neutral-400"
                        }`}
                    >
                      {text}
                    </p>
                  </button>
                ),
              )}
            </div>
          </div>

          {action === "DEFER_DLV" && (
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold">
                Preferred delivery date
              </span>

              <input
                type="date"
                value={deferredDate}
                min={
                  new Date()
                    .toISOString()
                    .split("T")[0]
                }
                onChange={(event) => {
                  clearError();
                  setDeferredDate(
                    event.target.value,
                  );
                }}
                className="w-full rounded-xl border border-neutral-200 px-3 py-3 text-sm outline-none focus:border-neutral-950"
              />
            </label>
          )}

          {error && (
            <p className="rounded-xl bg-red-50 p-3 text-xs text-red-700">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 text-sm font-bold text-white disabled:opacity-50"
          >
            {submitting ? (
              <Loader2
                size={17}
                className="animate-spin"
              />
            ) : action === "RE-ATTEMPT" ? (
              <RotateCcw size={17} />
            ) : (
              <CalendarDays size={17} />
            )}

            {submitting
              ? "Submitting..."
              : action === "RE-ATTEMPT"
                ? "Reattempt My Delivery"
                : "Submit Preferred Date"}
          </button>

          <p className="text-center text-[10px] text-neutral-400">
            Please confirm your choice before
            submitting.
          </p>
        </div>
      </section>
    </main>
  );
}

function State({
  loading,
  success,
  title,
  text,
}) {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-[#f5f5f3] p-4">
      <div className="max-w-sm text-center">
        {loading ? (
          <Loader2 className="mx-auto animate-spin" />
        ) : success ? (
          <CheckCircle2 className="mx-auto text-emerald-600" />
        ) : (
          <AlertCircle className="mx-auto text-red-600" />
        )}

        <h1 className="mt-3 text-xl font-black">
          {loading ? "Loading order..." : title}
        </h1>

        {text && (
          <p className="mt-2 text-xs leading-5 text-neutral-500">
            {text}
          </p>
        )}
      </div>
    </main>
  );
}
