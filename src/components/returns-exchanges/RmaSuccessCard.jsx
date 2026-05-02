"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function RmaSuccessCard({ rma }) {
  return (
    <section className="rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-gray-100 sm:p-8">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-green-50 text-green-600">
        <CheckCircle2 className="h-7 w-7" />
      </div>

      <h2 className="mt-5 text-2xl font-semibold">Request submitted</h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
        Your return/exchange request has been created successfully. Our team will
        review it and update you soon.
      </p>

      {rma?.rmaNumber ? (
        <div className="mx-auto mt-5 max-w-sm rounded-2xl bg-gray-50 p-4">
          <p className="text-xs text-gray-400">RMA Number</p>
          <p className="mt-1 text-lg font-semibold">{rma.rmaNumber}</p>
        </div>
      ) : null}

      <Link
        href="/"
        className="mt-6 inline-flex h-11 items-center justify-center rounded-2xl bg-gray-950 px-5 text-sm font-medium text-white"
      >
        Back to Home
      </Link>
    </section>
  );
}