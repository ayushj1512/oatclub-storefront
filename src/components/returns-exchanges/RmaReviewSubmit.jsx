"use client";

import { ArrowLeft, Loader2, Send } from "lucide-react";

export default function RmaReviewSubmit({
  order,
  requestType,
  selectedItems,
  reason,
  customerNote,
  exchangeSize,
  loading,
  onBack,
  onSubmit,
}) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100 sm:p-6">
      <h2 className="text-xl font-semibold">Review request</h2>
      <p className="mt-1 text-sm text-gray-500">
        Confirm your details before submitting.
      </p>

      <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-2xl bg-gray-50 p-4">
          <p className="text-gray-400">Order</p>
          <p className="mt-1 font-semibold">{order?.orderNumber}</p>
        </div>

        <div className="rounded-2xl bg-gray-50 p-4">
          <p className="text-gray-400">Request type</p>
          <p className="mt-1 font-semibold capitalize">{requestType}</p>
        </div>

        <div className="rounded-2xl bg-gray-50 p-4">
          <p className="text-gray-400">Reason</p>
          <p className="mt-1 font-semibold">{reason}</p>
        </div>

        {requestType === "exchange" ? (
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-gray-400">New size</p>
            <p className="mt-1 font-semibold">{exchangeSize}</p>
          </div>
        ) : null}
      </div>

      <div className="mt-5 rounded-3xl bg-gray-50 p-4">
        <p className="mb-3 text-sm font-semibold">Selected products</p>

        <div className="space-y-2">
          {selectedItems.map((item) => (
            <div
              key={item.lineId}
              className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {item?.productSnapshot?.title || "Product"}
                </p>
                <p className="text-xs text-gray-400">
                  Code: {item?.productSnapshot?.productCode || "-"} · Qty:{" "}
                  {item.rmaQuantity || 1}
                </p>
              </div>

              <p className="text-xs text-gray-500">
                Size: {item?.selectedSize || "-"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {customerNote ? (
        <div className="mt-5 rounded-2xl bg-gray-50 p-4 text-sm text-gray-600">
          {customerNote}
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={onBack}
          disabled={loading}
          className="h-11 rounded-2xl bg-gray-100 px-4 text-sm font-medium disabled:opacity-50"
        >
          <span className="inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </span>
        </button>

        <button
          onClick={onSubmit}
          disabled={loading}
          className="h-11 rounded-2xl bg-gray-950 px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="inline-flex items-center gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Submit Request
          </span>
        </button>
      </div>
    </section>
  );
}