"use client";

import {
  Package,
  CreditCard,
  ShieldCheck,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

import {
  money,
  prettyStatus,
} from "./orderDetailsUtils";

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "dark",
}) {
  const iconClass =
    tone === "success"
      ? "bg-green-50 text-green-700"
      : tone === "danger"
      ? "bg-red-50 text-red-700"
      : tone === "warning"
      ? "bg-yellow-50 text-yellow-700"
      : "bg-black text-white";

  return (
    <div className="rounded-[1.5rem] bg-white p-4 shadow-sm ring-1 ring-black/[0.04]">
      <div className="flex items-start gap-3">
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${iconClass}`}
        >
          <Icon size={17} />
        </span>

        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/35">
            {label}
          </p>

          <p className="mt-1 truncate text-base font-black text-gray-950">
            {value}
          </p>

          {hint ? (
            <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
              {hint}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function OrderQuickStats({
  order,
  safeItems = [],
  statusKey,
  rmaEnabled,
  rmaWindow,
}) {
  const finalPayable =
    order?.finalPayable ??
    order?.totalAmount ??
    0;

  const paymentFailed =
    order?.paymentStatus === "failed" ||
    statusKey === "failed";

  const paymentTone = paymentFailed
    ? "danger"
    : order?.paymentStatus === "paid"
    ? "success"
    : "warning";

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={Package}
        label="Total Items"
        value={safeItems.length}
        hint="Products in order"
      />

      <StatCard
        icon={CreditCard}
        label="Payment"
        value={prettyStatus(order?.paymentMethod)}
        hint={prettyStatus(order?.paymentStatus)}
        tone={paymentTone}
      />

      <StatCard
        icon={CheckCircle2}
        label="Payable"
        value={`₹${money(finalPayable)}`}
        hint="Final order amount"
        tone="dark"
      />

      <StatCard
        icon={rmaEnabled ? ShieldCheck : RotateCcw}
        label="Return / Exchange"
        value={
          rmaEnabled
            ? `${rmaWindow?.daysLeft || 0} day(s) left`
            : statusKey === "delivered"
            ? "Closed"
            : "After delivery"
        }
        hint={
          rmaEnabled
            ? "Window is active"
            : "Available only after delivery"
        }
        tone={
          rmaEnabled
            ? "success"
            : statusKey === "failed" ||
              statusKey === "cancelled"
            ? "danger"
            : "warning"
        }
      />
    </div>
  );
}