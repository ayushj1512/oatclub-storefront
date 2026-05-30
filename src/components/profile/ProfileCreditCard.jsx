"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Wallet,
  ChevronRight,
  Gift,
  ShoppingBag,
  RefreshCcw,
  Loader2,
} from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "";

const money = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

const pretty = (v) =>
  String(v || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const getLogIcon = (type) => {
  const t = String(type || "").toLowerCase();

  if (t === "refund") return <RefreshCcw size={14} />;
  if (t === "order_usage") return <ShoppingBag size={14} />;
  return <Gift size={14} />;
};

const normalizeCredits = (data) => {
  const raw =
    data?.credits ||
    data?.customer?.credits ||
    data?.data?.credits ||
    data?.data?.customer?.credits ||
    data ||
    {};

  return {
    balance: Number(raw?.balance || 0),
    totalCredited: Number(raw?.totalCredited || 0),
    totalDebited: Number(raw?.totalDebited || 0),
    totalRefundCredits: Number(raw?.totalRefundCredits || 0),
    logs: Array.isArray(raw?.logs) ? raw.logs : [],
  };
};

export default function ProfileCreditCard({ customer }) {
  const initialCredits = useMemo(
    () => normalizeCredits(customer?.credits || {}),
    [customer?.credits]
  );

  const customerId =
    customer?._id ||
    customer?.id ||
    customer?.customerId ||
    customer?.customerCode ||
    "";

  const [credits, setCredits] = useState(initialCredits);
  const [loading, setLoading] = useState(false);

  const logs = Array.isArray(credits?.logs) ? credits.logs.slice(0, 3) : [];

  const fetchFreshCredits = useCallback(async () => {
    if (!customerId || !API_BASE) return;

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/customers/${customerId}/credits`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (!res.ok) return;

      const data = await res.json();
      setCredits(normalizeCredits(data));
    } catch (err) {
      console.error("Credit refresh failed:", err);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    setCredits(initialCredits);
  }, [initialCredits]);

  useEffect(() => {
    fetchFreshCredits();

    const onFocus = () => fetchFreshCredits();
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") fetchFreshCredits();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [fetchFreshCredits]);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="bg-black p-5 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-sm text-white/70">
              <Wallet size={16} />
              Miray Credits
              {loading ? <Loader2 size={13} className="animate-spin" /> : null}
            </p>

            <h3 className="mt-2 text-3xl font-semibold tracking-tight">
              {money(credits?.balance)}
            </h3>

            <p className="mt-1 text-xs text-white/60">
              Use credits during checkout to reduce your payable amount.
            </p>
          </div>

          <Link
            href="/profile/credit"
            className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-gray-100"
          >
            View
          </Link>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-[11px] text-gray-500">Credited</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {money(credits?.totalCredited)}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-[11px] text-gray-500">Used</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {money(credits?.totalDebited)}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-[11px] text-gray-500">Refunds</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {money(credits?.totalRefundCredits)}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-900">
            Recent Credit Activity
          </h4>

          <Link
            href="/profile/credit"
            className="flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-black"
          >
            See all <ChevronRight size={14} />
          </Link>
        </div>

        {logs.length ? (
          <div className="mt-3 space-y-2">
            {logs.map((log, idx) => {
              const isCredit = log?.transactionType === "credit";

              return (
                <div
                  key={log?.creditId || idx}
                  className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className={`grid size-8 shrink-0 place-items-center rounded-full ${
                        isCredit
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {getLogIcon(log?.type)}
                    </span>

                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-gray-900">
                        {pretty(log?.type)}
                      </p>
                      <p className="truncate text-[11px] text-gray-500">
                        {log?.orderNumber || log?.reason || "Credit activity"}
                      </p>
                    </div>
                  </div>

                  <p
                    className={`text-sm font-semibold ${
                      isCredit ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {isCredit ? "+" : "-"} {money(log?.amount)}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-3 rounded-xl bg-gray-50 px-3 py-3 text-xs text-gray-500">
            No credit activity yet.
          </p>
        )}
      </div>
    </div>
  );
}