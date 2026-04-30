"use client";

import {
  Package,
  Box,
  Truck,
  MapPin,
  CheckCircle2,
  XCircle,
  RotateCcw,
  AlertTriangle,
  Clock,
} from "lucide-react";

const STEPS = [
  { key: "processingAt", status: "processing", label: "Order Placed", icon: Clock },
  { key: "packedAt", status: "packed", label: "Packed", icon: Box },
  { key: "pickedAt", status: "picked", label: "Picked", icon: Package },
  { key: "shippedAt", status: "shipped", label: "Shipped", icon: Truck },
  { key: "outForDeliveryAt", status: "out_for_delivery", label: "Out for Delivery", icon: MapPin },
  { key: "deliveredAt", status: "delivered", label: "Delivered", icon: CheckCircle2 },
  { key: "cancelledAt", status: "cancelled", label: "Cancelled", icon: XCircle },
  { key: "failedAt", status: "failed", label: "Failed", icon: AlertTriangle },
  { key: "rtoAt", status: "rto", label: "RTO", icon: RotateCcw },
  { key: "returnRequestedAt", status: "return_requested", label: "Return Requested", icon: RotateCcw },
  { key: "exchangeRequestedAt", status: "exchange_requested", label: "Exchange Requested", icon: RotateCcw },
  { key: "pickupInitiatedAt", status: "pickup_initiated", label: "Pickup Initiated", icon: Truck },
  { key: "returnedAt", status: "returned", label: "Returned", icon: RotateCcw },
  { key: "refundedAt", status: "refunded", label: "Refunded", icon: CheckCircle2 },
  { key: "exchangedAt", status: "exchanged", label: "Exchanged", icon: Package },
];

const FORWARD = [
  "processing",
  "packed",
  "picked",
  "shipped",
  "out_for_delivery",
  "delivered",
];

const formatIST = (date) => {
  if (!date) return "Pending";

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
};

const dotStyle = (status, active) => {
  if (!active) return "bg-gray-100 text-gray-400 ring-1 ring-gray-200";

  if (status === "delivered") return "bg-green-50 text-green-700 ring-1 ring-green-200";
  if (status === "cancelled") return "bg-red-50 text-red-700 ring-1 ring-red-200";
  if (status === "failed") return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
  if (status === "out_for_delivery") return "bg-purple-50 text-purple-700 ring-1 ring-purple-200";
  if (status === "shipped" || status === "picked") return "bg-blue-50 text-blue-700 ring-1 ring-blue-200";
  if (status === "packed") return "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200";
  if (status === "processing") return "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200";

  return "bg-orange-50 text-orange-700 ring-1 ring-orange-200";
};

const lineStyle = (status, active) => {
  if (!active) return "bg-gray-200";
  if (status === "delivered") return "bg-green-300";
  if (status === "cancelled") return "bg-red-300";
  if (status === "failed") return "bg-rose-300";
  return "bg-black";
};

export default function OrderProductTimeline({ order }) {
  const dates = order?.fulfillmentDates || {};
  const currentStatus = String(order?.fulfillmentStatus || "").toLowerCase();

  const steps = STEPS.filter((step) => {
    const isForward = FORWARD.includes(step.status);
    return isForward || dates?.[step.key] || currentStatus === step.status;
  });

  const currentIndex = steps.findIndex((x) => x.status === currentStatus);

  return (
    <div className="rounded-3xl bg-white p-4 sm:p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
            Product Timeline
          </h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Tracking updates shown in IST
          </p>
        </div>

        <span className="rounded-full bg-black/5 px-3 py-1 text-[11px] font-semibold capitalize text-gray-700">
          {currentStatus.replaceAll("_", " ") || "Processing"}
        </span>
      </div>

      {/* Desktop */}
      <div className="hidden overflow-x-auto pb-1 md:block">
        <div className="flex min-w-max">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const date = dates?.[step.key];
            const active = Boolean(date) || currentStatus === step.status;
            const passed = currentIndex >= 0 && index <= currentIndex;

            return (
              <div key={step.key} className="relative min-w-[130px] flex-1">
                {index !== steps.length - 1 ? (
                  <div
                    className={`absolute left-[calc(50%+18px)] right-[calc(-50%+18px)] top-[18px] h-px ${lineStyle(
                      step.status,
                      passed
                    )}`}
                  />
                ) : null}

                <div className="relative z-10 flex flex-col items-center text-center">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${dotStyle(
                      step.status,
                      active
                    )}`}
                  >
                    <Icon size={16} />
                  </div>

                  <p className="mt-2 text-xs font-semibold text-gray-900">
                    {step.label}
                  </p>
                  <p className="mt-1 max-w-[115px] text-[11px] leading-4 text-gray-500">
                    {formatIST(date)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile */}
      <div className="space-y-3 md:hidden">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const date = dates?.[step.key];
          const active = Boolean(date) || currentStatus === step.status;

          return (
            <div key={step.key} className="relative flex gap-3">
              {index !== steps.length - 1 ? (
                <div
                  className={`absolute left-[17px] top-9 h-full w-px ${lineStyle(
                    step.status,
                    active
                  )}`}
                />
              ) : null}

              <div
                className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${dotStyle(
                  step.status,
                  active
                )}`}
              >
                <Icon size={16} />
              </div>

              <div className="min-w-0 pb-2">
                <p className="text-xs font-semibold text-gray-900">
                  {step.label}
                </p>
                <p className="mt-0.5 text-[11px] text-gray-500">
                  {formatIST(date)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}