"use client";

import {
  RotateCcw,
  Repeat2,
  BadgeIndianRupee,
  Clock3,
} from "lucide-react";

import {
  money,
  prettyStatus,
  formatDateIST,
} from "./orderDetailsUtils";

export default function OrderRmaRequests({
  rmas = [],
}) {
  if (!Array.isArray(rmas) || rmas.length === 0) {
    return null;
  }

  return (
    <div className="rounded-[1.7rem] bg-white p-4 shadow-sm ring-1 ring-black/[0.04] sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-black/35">
            Requests
          </p>

          <h2 className="mt-1 text-lg font-black text-gray-950">
            Return / Exchange Requests
          </h2>
        </div>

        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-black text-white">
          <RotateCcw size={17} />
        </span>
      </div>

      <div className="space-y-3">
        {rmas.map((rma) => {
          const isExchange =
            rma?.type === "exchange";

          const Icon = isExchange
            ? Repeat2
            : RotateCcw;

          const feeAmount =
            rma?.fee?.amount || 0;

          return (
            <div
              key={rma?.rmaNumber || rma?._id}
              className="rounded-3xl bg-gray-50 p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-gray-900 shadow-sm">
                    <Icon size={17} />
                  </span>

                  <div>
                    <p className="text-sm font-black text-gray-950">
                      {rma?.rmaNumber || "RMA Request"}
                    </p>

                    <p className="mt-0.5 text-xs font-semibold text-gray-500">
                      {prettyStatus(rma?.type)} •{" "}
                      {prettyStatus(rma?.status)}
                    </p>

                    {rma?.createdAt ? (
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                        <Clock3 size={13} />
                        Requested on{" "}
                        {formatDateIST(rma.createdAt)}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-gray-700 shadow-sm">
                    <BadgeIndianRupee size={13} />
                    {feeAmount > 0
                      ? `Fee ₹${money(feeAmount)}`
                      : "No Fee"}
                  </span>

                  <span className="rounded-full bg-black px-3 py-1.5 text-xs font-bold text-white">
                    {prettyStatus(
                      rma?.fee?.status || rma?.status
                    )}
                  </span>
                </div>
              </div>

              {rma?.customerNote ? (
                <div className="mt-3 rounded-2xl bg-white p-3">
                  <p className="text-xs font-bold text-gray-500">
                    Customer Note
                  </p>

                  <p className="mt-1 text-sm leading-relaxed text-gray-700">
                    {rma.customerNote}
                  </p>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}