"use client";

import { ArrowLeft, ArrowRight, CheckCircle2, PackageCheck, XCircle } from "lucide-react";

export default function EligibilityCard({ order, isDelivered, onBack, onContinue }) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400">Verified Order</p>
          <h2 className="mt-1 text-xl font-semibold">{order?.orderNumber}</h2>
          <p className="mt-1 text-sm text-gray-500">
            Status: <span className="font-medium text-gray-900">{order?.fulfillmentStatus}</span>
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">
          <PackageCheck className="h-5 w-5" />
        </div>
      </div>

      <div
        className={`mt-6 rounded-2xl p-4 ${
          isDelivered ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
        }`}
      >
        <div className="flex items-center gap-2 text-sm font-medium">
          {isDelivered ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          {isDelivered
            ? "This order is delivered and eligible to start a return/exchange request."
            : "Return or exchange is available only after the order is delivered."}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={onBack}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-gray-100 px-4 text-sm font-medium text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <button
          disabled={!isDelivered}
          onClick={onContinue}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-gray-950 px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}