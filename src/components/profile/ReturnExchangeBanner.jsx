"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Clock, AlertCircle } from "lucide-react";

const DAY_MS = 24 * 60 * 60 * 1000;

const toDate = (v) => {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

/**
 * Local utils (no external import)
 * - Finds deliveredAt from common order paths
 * - Computes daysLeft + expiresAt for return/exchange window
 * - Hydration safe: uses nowMs from state (set in useEffect)
 */
const getReturnExchangeWindow = (order, nowMs, windowDays = 7) => {
  const deliveredAt =
    toDate(order?.trackingDetails?.deliveredAt) ||
    toDate(order?.shipment?.deliveredAt) ||
    toDate(order?.shipment?.shiprocket?.deliveredAt) ||
    toDate(order?.shipment?.shiprocket?.delivered_date) ||
    toDate(order?.statusTimestamps?.deliveredAt) ||
    toDate(order?.deliveredAt);

  if (!deliveredAt) return { deliveredAt: null, isDelivered: false, daysLeft: 0, isAllowed: false, expiresAt: null };

  if (!nowMs) return { deliveredAt, isDelivered: true, daysLeft: 0, isAllowed: false, expiresAt: null };

  const expiresAt = new Date(deliveredAt.getTime() + windowDays * DAY_MS);
  const diffMs = expiresAt.getTime() - nowMs;
  const daysLeft = diffMs > 0 ? Math.ceil(diffMs / DAY_MS) : 0;

  return { deliveredAt, isDelivered: true, daysLeft, isAllowed: daysLeft > 0, expiresAt };
};

export default function ReturnExchangeBanner({ order, windowDays = 7, showWhenDaysLeftAtMost = 3, showExpired = true }) {
  const [nowMs, setNowMs] = useState(null);
  useEffect(() => {
    setNowMs(Date.now());
  }, []);

  const info = useMemo(() => getReturnExchangeWindow(order, nowMs, windowDays), [order, nowMs, windowDays]);

  if (!info.isDelivered) return null;

  const shouldShowLeft = info.daysLeft > 0 && info.daysLeft <= showWhenDaysLeftAtMost;
  const shouldShowExpired = showExpired && info.daysLeft === 0;
  if (!shouldShowLeft && !shouldShowExpired) return null;

  const isClosed = info.daysLeft === 0;
  const days = info.daysLeft;

  const title = isClosed ? "Return & Exchange window closed" : `Return/Exchange ends in ${days} day${days === 1 ? "" : "s"}`;
  const subtitle = !isClosed && info.expiresAt ? `Eligible till ${info.expiresAt.toLocaleDateString("en-IN")}` : "You can request return/exchange within 7 days of delivery.";

  const tone = isClosed
    ? { wrap: "bg-rose-50 border-rose-200 text-rose-900", chip: "bg-rose-600/10 text-rose-700", dot: "bg-rose-500", icon: AlertCircle }
    : { wrap: "bg-amber-50 border-amber-200 text-amber-950", chip: "bg-amber-600/10 text-amber-800", dot: "bg-amber-500", icon: Clock };

  const Icon = tone.icon;

  return (
    <div className="w-full">
      <div className={`rounded-2xl px-3 py-3 border shadow-sm ${tone.wrap}`}>
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl ${tone.chip}`}>
            <Icon size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`inline-flex h-2 w-2 rounded-full ${tone.dot}`} />
              <div className="text-[13px] sm:text-sm font-semibold leading-snug truncate">{title}</div>
            </div>
            <div className="text-[12px] sm:text-[13px] opacity-80 mt-1 leading-snug">{subtitle}</div>
            {!isClosed && typeof days === "number" ? (
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="h-1.5 w-full rounded-full bg-black/10 overflow-hidden">
                  <div className="h-full rounded-full bg-black/35" style={{ width: `${Math.max(0, Math.min(100, ((windowDays - days) / windowDays) * 100))}%` }} />
                </div>
                <span className="text-[11px] font-semibold opacity-70 whitespace-nowrap">{days}d left</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}