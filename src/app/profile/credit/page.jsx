"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  ArrowLeft,
  Wallet,
  ShoppingBag,
  RefreshCcw,
  Gift,
} from "lucide-react";

const money = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

const pretty = (v) =>
  String(v || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

const getIcon = (type) => {
  const t = String(type || "").toLowerCase();

  if (t === "refund") return <RefreshCcw size={15} />;
  if (t === "order_usage") return <ShoppingBag size={15} />;
  return <Gift size={15} />;
};

export default function ProfileCreditPage() {
  const customer = useAuthStore((s) => s.customer);

  const credits = customer?.credits || {};

  const logs = useMemo(() => {
    return Array.isArray(credits?.logs) ? credits.logs : [];
  }, [credits?.logs]);

  return (
    <section className="min-h-screen bg-[#F6F6F8] px-3 py-4 sm:px-5 sm:py-6">
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="overflow-hidden rounded-[28px] bg-black text-white shadow-sm">
          <div className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 text-sm text-white/65">
                  <Wallet size={16} />
                  OATCLUB Credits
                </p>

                <h1 className="mt-2 text-4xl font-semibold tracking-tight">
                  {money(credits?.balance)}
                </h1>

                <p className="mt-1 text-xs text-white/55">
                  Wallet credit balance and ledger history.
                </p>
              </div>

              <Link
                href="/profile"
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/15"
              >
                <ArrowLeft size={14} />
                Back
              </Link>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <div className="rounded-2xl bg-white/10 p-3">
                <p className="text-[10px] uppercase tracking-wide text-white/45">
                  Credited
                </p>

                <p className="mt-1 text-sm font-semibold">
                  {money(credits?.totalCredited)}
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-3">
                <p className="text-[10px] uppercase tracking-wide text-white/45">
                  Debited
                </p>

                <p className="mt-1 text-sm font-semibold">
                  {money(credits?.totalDebited)}
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-3">
                <p className="text-[10px] uppercase tracking-wide text-white/45">
                  Refunds
                </p>

                <p className="mt-1 text-sm font-semibold">
                  {money(credits?.totalRefundCredits)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] bg-white p-3 shadow-sm sm:p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Credit Ledger
              </h2>

              <p className="text-xs text-gray-500">
                Credit and debit activity.
              </p>
            </div>

            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600">
              {logs.length} entries
            </span>
          </div>

          {logs.length ? (
            <div className="divide-y divide-gray-100">
              {logs.map((log, idx) => {
                const isCredit =
                  String(log?.transactionType || "").toLowerCase() === "credit";

                return (
                  <div
                    key={log?.creditId || idx}
                    className="grid grid-cols-[1fr_auto] gap-3 px-1 py-3 sm:grid-cols-[1.4fr_0.6fr_0.6fr_0.7fr]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={`grid size-9 shrink-0 place-items-center rounded-2xl ${
                          isCredit
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {getIcon(log?.type)}
                      </span>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {pretty(log?.type)}
                        </p>

                        <p className="truncate text-xs text-gray-500">
                          {log?.orderNumber ||
                            log?.reason ||
                            "Credit activity"}
                        </p>
                      </div>
                    </div>

                    <div className="text-right sm:text-left">
                      <p className="text-[10px] uppercase tracking-wide text-gray-400">
                        Credit
                      </p>

                      <p className="text-sm font-semibold text-emerald-700">
                        {isCredit ? money(log?.amount) : "—"}
                      </p>
                    </div>

                    <div className="hidden sm:block">
                      <p className="text-[10px] uppercase tracking-wide text-gray-400">
                        Debit
                      </p>

                      <p className="text-sm font-semibold text-rose-700">
                        {!isCredit ? money(log?.amount) : "—"}
                      </p>
                    </div>

                    <div className="hidden sm:block">
                      <p className="text-[10px] uppercase tracking-wide text-gray-400">
                        Balance
                      </p>

                      <p className="text-sm font-semibold text-gray-900">
                        {money(log?.balanceAfterTransaction)}
                      </p>
                    </div>

                    <div className="col-span-2 flex items-center justify-between gap-3 text-[11px] text-gray-400 sm:col-span-4">
                      <span>{formatDate(log?.createdAt)}</span>

                      <span className="truncate font-mono">
                        {log?.creditId}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl bg-gray-50 px-4 py-8 text-center">
              <p className="text-sm font-medium text-gray-700">
                No credit activity yet
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Refunds and wallet usage will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
