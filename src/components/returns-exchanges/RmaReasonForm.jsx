"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";

const reasons = [
  { value: "wrong_size", label: "Wrong size / size issue" },
  { value: "wrong_item", label: "Wrong item received" },
  { value: "damaged", label: "Damaged product" },
  { value: "defective", label: "Defective product" },
  { value: "quality_issue", label: "Quality issue" },
  { value: "changed_mind", label: "Changed mind" },
  { value: "other", label: "Other" },
];

const sizes = ["XS", "S", "M", "L", "XL",];

export default function RmaReasonForm({
  requestType,
  reason,
  customerNote,
  exchangeSize,
  selectedItems,
  onReasonChange,
  onNoteChange,
  onExchangeSizeChange,
  onBack,
  onContinue,
}) {
  const canContinue =
    reason && (requestType === "return" || exchangeSize.trim());

  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100 sm:p-6">
      <h2 className="text-xl font-semibold">Tell us the reason</h2>
      <p className="mt-1 text-sm text-gray-500">
        This helps us process your request faster.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {reasons.map((item) => (
          <button
            key={item.value}
            onClick={() => onReasonChange(item.value)}
            className={`rounded-2xl px-4 py-3 text-left text-sm ring-1 transition ${
              reason === item.value
                ? "bg-gray-950 text-white ring-gray-950"
                : "bg-gray-50 text-gray-700 ring-gray-100"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {requestType === "exchange" ? (
        <div className="mt-5">
          <label className="text-sm font-medium">Select new size</label>
          <div className="mt-3 flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => onExchangeSizeChange(size)}
                className={`h-10 min-w-12 rounded-2xl px-4 text-sm font-medium ring-1 ${
                  exchangeSize === size
                    ? "bg-gray-950 text-white ring-gray-950"
                    : "bg-gray-50 text-gray-700 ring-gray-100"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <textarea
        value={customerNote}
        onChange={(e) => onNoteChange(e.target.value)}
        placeholder="Add a note for our support team..."
        rows={4}
        className="mt-5 w-full rounded-3xl bg-gray-50 p-4 text-sm outline-none ring-1 ring-gray-100 transition focus:bg-white focus:ring-gray-300"
      />

      <p className="mt-3 text-xs text-gray-400">
        Selected product{selectedItems.length > 1 ? "s" : ""}: {selectedItems.length}
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button onClick={onBack} className="h-11 rounded-2xl bg-gray-100 px-4 text-sm font-medium">
          <span className="inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </span>
        </button>

        <button
          disabled={!canContinue}
          onClick={onContinue}
          className="h-11 rounded-2xl bg-gray-950 px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="inline-flex items-center gap-2">
            Review <ArrowRight className="h-4 w-4" />
          </span>
        </button>
      </div>
    </section>
  );
}