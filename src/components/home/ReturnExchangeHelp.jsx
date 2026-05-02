"use client";

import Link from "next/link";
import { ArrowRight, RotateCcw } from "lucide-react";

export default function ReturnExchangeHelp() {
  return (
    <section className="px-4 py-5 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 rounded-3xl bg-[#fafafa] p-5 ring-1 ring-gray-100 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
            <RotateCcw className="h-5 w-5 text-gray-900" />
          </div>

          <div>
            <h2 className="text-base font-semibold text-gray-950">
              Need help with your order?
            </h2>
            <p className="mt-1 max-w-xl text-sm leading-6 text-gray-500">
              Check your order eligibility and request a return or size exchange.
            </p>
          </div>
        </div>

        <Link
          href="/returns-exchanges"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-gray-950 px-5 text-sm font-medium text-white transition hover:bg-black"
        >
          Start request
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}