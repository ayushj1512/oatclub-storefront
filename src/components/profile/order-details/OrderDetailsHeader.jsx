"use client";

import { ChevronLeft, Copy } from "lucide-react";

import {
  STATUS_BADGE,
  STATUS_ICON,
  prettyStatus,
  formatDateIST,
  getOrderLabel,
} from "./orderDetailsUtils";

export default function OrderDetailsHeader({
  order,
  router,
  statusKey,
  deliveredDateText,
  canCancel,
  onCancel,
}) {
  const orderLabel = getOrderLabel(order);

  const placedOn = formatDateIST(
    order?.orderDate || order?.createdAt
  );

  const badgeClass =
    STATUS_BADGE[statusKey] || "bg-black/5 text-black";

  const StatusIcon =
    STATUS_ICON[statusKey] || STATUS_ICON.processing;

  const copyOrderNumber = async () => {
    try {
      await navigator.clipboard.writeText(
        order?.orderNumber || order?._id || ""
      );
    } catch {}
  };

  return (
    <div className="space-y-3">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-gray-600 transition hover:text-black"
      >
        <ChevronLeft size={17} />
        Back
      </button>

      <div className="rounded-3xl bg-white px-4 py-4 shadow-sm ring-1 ring-black/[0.04] sm:px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/35">
              Order Details
            </p>

            <div className="mt-1.5 flex items-center gap-2">
              <h1 className="truncate text-xl font-black tracking-tight text-gray-950 sm:text-2xl">
                {orderLabel}
              </h1>

              <button
                onClick={copyOrderNumber}
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-black/[0.04] text-gray-500 transition hover:bg-black hover:text-white"
                title="Copy order number"
              >
                <Copy size={13} />
              </button>
            </div>

            <p className="mt-1 text-xs leading-relaxed text-gray-500">
              Placed {placedOn || "-"}
              {statusKey === "delivered" && deliveredDateText
                ? ` • Delivered ${deliveredDateText}`
                : ""}
            </p>
          </div>

          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-bold ${badgeClass}`}
          >
            <StatusIcon size={13} />
            {prettyStatus(order?.fulfillmentStatus)}
          </span>
        </div>

        {canCancel ? (
          <button
            onClick={onCancel}
            className="mt-3 w-full rounded-2xl bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100"
          >
            Cancel Order
          </button>
        ) : null}
      </div>
    </div>
  );
}