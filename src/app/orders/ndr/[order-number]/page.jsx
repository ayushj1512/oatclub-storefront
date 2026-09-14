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
  Undo2,
} from "lucide-react";
import useNdrStore from "@/store/ndrStore";

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const BASE_ACTIONS = [
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

export default function NdrOrderPage() {
  const params = useParams();
  const token = params?.["order-number"];

  const {
    order,
    provider,
    result,
    loading,
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
  }, [token]);

  const actions =
    provider === "shiprocket"
      ? [
        ...BASE_ACTIONS,
        {
          value: "RETURN",
          label: "Return",
          text: "Return the order to OATCLUB",
          icon: Undo2,
        },
      ]
      : BASE_ACTIONS;

  const submit = async () => {
    if (
      action === "DEFER_DLV" &&
      !deferredDate
    ) {
      alert(
        "Please select a preferred delivery date.",
      );
      return;
    }

    if (
      action === "RETURN" &&
      !window.confirm(
        "Are you sure you want to return this order?",
      )
    ) {
      return;
    }

    await submitNdrAction({
      token,
      action,
      deferredDate,
    }).catch(() => { });
  };

  if (loading || (!order && !error)) {
    return <State loading />;
  }

  if (!order) {
    return (
      <State
        title="Order unavailable"
        text={error}
      />
    );
  }

  if (result) {
    const text =
      action === "RETURN"
        ? "Your return request has been submitted."
        : action === "DEFER_DLV"
          ? "Your preferred delivery date has been submitted."
          : "Your delivery reattempt request has been submitted.";

    return (
      <State
        success
        title="Request received"
        text={text}
      />
    );
  }

  const address =
    order.shippingAddress ||
    order.shippingAddressSnapshot ||
    {};

  const customer = {
    name:
      order.customer?.name ||
      address.name ||
      address.fullName ||
      "Customer",
    phone:
      order.customer?.phone ||
      address.phone ||
      "",
  };

  const items =
    order.products || order.items || [];

  const total =
    order.pricing?.finalPayable ??
    order.finalPayable ??
    order.totalAmount ??
    0;

  const awb =
    order.ndr?.awb ||
    order.ndr?.waybill ||
    order.shipment?.awb ||
    "";

  const fullAddress = [
    address.line1,
    address.line2,
    address.landmark,
    address.city,
    address.state,
    address.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <main className="min-h-dvh bg-zinc-100 p-3 sm:p-6">
      <section className="mx-auto max-w-xl overflow-hidden rounded-3xl bg-white shadow-sm">
        <header className="bg-zinc-950 p-5 text-white">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
            Delivery Action Required
          </p>

          <h1 className="mt-2 text-2xl font-black">
            Update your delivery
          </h1>

          <p className="mt-1 text-xs text-white/60">
            Order #{order.orderNumber || token}
          </p>

          <p className="mt-3 flex items-center gap-2 text-xs text-white/50">
            <Truck size={14} />
            {provider === "shiprocket"
              ? "Shiprocket"
              : "Delhivery"}{" "}
            · AWB {awb || "Unavailable"}
          </p>
        </header>

        <div className="space-y-4 p-4 sm:p-5">
          <div className="flex gap-2 rounded-xl bg-amber-50 p-3">
            <AlertCircle
              size={17}
              className="shrink-0 text-amber-700"
            />

            <div>
              <p className="text-xs font-bold">
                Delivery attempt unsuccessful
              </p>
              <p className="mt-1 text-xs text-zinc-600">
                {order.ndr?.reason ||
                  order.ndr?.rawStatus ||
                  "Your confirmation is required."}
              </p>
            </div>
          </div>

          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-bold">
              <Package size={15} />
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
                    className="flex gap-3 rounded-xl bg-zinc-50 p-3"
                  >
                    <img
                      src={
                        item.image ||
                        product.thumbnail ||
                        "/placeholder.png"
                      }
                      alt={
                        item.title ||
                        product.title ||
                        "Product"
                      }
                      className="h-16 w-14 rounded-lg object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-xs font-semibold">
                        {item.title ||
                          product.title ||
                          "Product"}
                      </p>

                      <p className="mt-1 text-[11px] text-zinc-500">
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

          <div className="rounded-xl border border-zinc-200 p-3">
            <p className="flex items-center gap-2 text-xs font-bold">
              <MapPin size={15} />
              Delivery details
            </p>

            <p className="mt-3 text-xs font-semibold">
              {customer.name}
            </p>

            <p className="mt-1 text-xs text-zinc-600">
              {customer.phone || "Unavailable"}
            </p>

            <p className="mt-2 text-xs leading-5 text-zinc-500">
              {fullAddress || "Unavailable"}
            </p>

            <div className="mt-3 flex justify-between border-t border-zinc-100 pt-3">
              <span className="text-xs text-zinc-500">
                Amount payable
              </span>
              <strong>{money(total)}</strong>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold">
              Select an option
            </p>

            <div
              className={`grid gap-2 ${actions.length === 3
                  ? "grid-cols-3"
                  : "grid-cols-2"
                }`}
            >
              {actions.map(
                ({
                  value,
                  label,
                  text,
                  icon: Icon,
                }) => {
                  const active =
                    action === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        clearError();
                        setAction(value);
                      }}
                      className={`rounded-xl border p-3 text-left ${active
                          ? "border-zinc-950 bg-zinc-950 text-white"
                          : "border-zinc-200"
                        }`}
                    >
                      <Icon size={16} />
                      <p className="mt-2 text-xs font-bold">
                        {label}
                      </p>
                      <p
                        className={`mt-1 text-[9px] ${active
                            ? "text-white/60"
                            : "text-zinc-400"
                          }`}
                      >
                        {text}
                      </p>
                    </button>
                  );
                },
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
                className="w-full rounded-xl border border-zinc-200 px-3 py-3 text-sm outline-none focus:border-zinc-950"
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
            className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white disabled:opacity-50 ${action === "RETURN"
                ? "bg-red-600"
                : "bg-zinc-950"
              }`}
          >
            {submitting ? (
              <Loader2
                size={17}
                className="animate-spin"
              />
            ) : action === "RETURN" ? (
              <Undo2 size={17} />
            ) : action === "DEFER_DLV" ? (
              <CalendarDays size={17} />
            ) : (
              <RotateCcw size={17} />
            )}

            {submitting
              ? "Submitting..."
              : action === "RETURN"
                ? "Return My Order"
                : action === "DEFER_DLV"
                  ? "Submit Preferred Date"
                  : "Reattempt My Delivery"}
          </button>

          <p className="text-center text-[10px] text-zinc-400">
            Submit only after confirming your
            selection.
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
    <main className="grid min-h-dvh place-items-center bg-zinc-100 p-4">
      <div className="max-w-sm text-center">
        {loading ? (
          <Loader2 className="mx-auto animate-spin" />
        ) : success ? (
          <CheckCircle2 className="mx-auto text-emerald-600" />
        ) : (
          <AlertCircle className="mx-auto text-red-600" />
        )}

        <h1 className="mt-3 text-xl font-black">
          {loading
            ? "Loading order..."
            : title}
        </h1>

        {text && (
          <p className="mt-2 text-xs leading-5 text-zinc-500">
            {text}
          </p>
        )}
      </div>
    </main>
  );
}
