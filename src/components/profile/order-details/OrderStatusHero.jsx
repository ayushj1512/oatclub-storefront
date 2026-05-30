"use client";

import {
  BadgeIndianRupee,
  CreditCard,
  Package,
  ShieldCheck,
  Clock3,
  AlertTriangle,
} from "lucide-react";

import {
  STATUS_BADGE,
  STATUS_ICON,
  money,
  prettyStatus,
} from "./orderDetailsUtils";

function HeroStat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl bg-white/90 p-3 text-black">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-black text-white">
          <Icon size={14} />
        </span>

        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-black/35">
            {label}
          </p>
          <p className="truncate text-sm font-black">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function OrderStatusHero({
  order,
  statusKey,
  safeItems = [],
  rmaEnabled,
  rmaWindow,
}) {
  const badgeClass =
    STATUS_BADGE[statusKey] || "bg-black/5 text-black";

  const StatusIcon =
    STATUS_ICON[statusKey] || Package;

  const finalPayable =
    order?.finalPayable ??
    order?.totalAmount ??
    0;

  const isFailed =
    statusKey === "failed" ||
    order?.paymentStatus === "failed";

  const title = isFailed
    ? "Payment failed"
    : statusKey === "delivered"
    ? "Order delivered"
    : statusKey === "cancelled"
    ? "Order cancelled"
    : statusKey === "shipped" ||
      statusKey === "out_for_delivery"
    ? "Order on the way"
    : "Preparing your order";

  const subtitle = isFailed
    ? "If amount was deducted, support can verify it."
    : statusKey === "delivered"
    ? rmaEnabled
      ? `Return / exchange active for ${
          rmaWindow?.daysLeft || 0
        } day(s).`
      : "Return / exchange window may be closed."
    : "Track payment, delivery and support updates here.";

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#101010] p-3 text-white shadow-sm sm:p-5">
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

      <div className="relative">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-bold ${badgeClass}`}
        >
          <StatusIcon size={13} />
          {prettyStatus(order?.fulfillmentStatus)}
        </span>

        <h2 className="mt-3 text-lg font-black leading-tight sm:text-2xl">
          {title}
        </h2>

        <p className="mt-1 text-xs leading-relaxed text-white/60">
          {subtitle}
        </p>

        <div className="mt-4 space-y-2">
          <HeroStat
            icon={BadgeIndianRupee}
            label="Payable"
            value={`₹${money(finalPayable)}`}
          />

          <div className="grid grid-cols-2 gap-2">
            <HeroStat
              icon={Package}
              label="Items"
              value={safeItems.length}
            />

            <HeroStat
              icon={CreditCard}
              label="Payment"
              value={prettyStatus(order?.paymentMethod)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <HeroStat
              icon={
                isFailed
                  ? AlertTriangle
                  : rmaEnabled
                  ? ShieldCheck
                  : Clock3
              }
              label="RMA"
              value={
                rmaEnabled
                  ? `${rmaWindow?.daysLeft || 0} Days`
                  : statusKey === "delivered"
                  ? "Closed"
                  : "Later"
              }
            />

            <HeroStat
              icon={CreditCard}
              label="Status"
              value={prettyStatus(order?.paymentStatus)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}