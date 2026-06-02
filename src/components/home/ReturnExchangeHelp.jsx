"use client";

import Link from "next/link";
import { ArrowRight, RotateCcw } from "lucide-react";

export default function ReturnExchangeHelp() {
  return (
    <section className="px-3 py-4 md:px-6 md:py-6">
      <div className="flex flex-col gap-3 rounded-2xl bg-black p-4 text-white sm:flex-row sm:items-center sm:justify-between md:p-5">
        
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15">
            <RotateCcw className="h-4 w-4 md:h-5 md:w-5" />
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-semibold md:text-base">
              Need Assistance?
            </h3>

            <p className="mt-0.5 text-xs text-white/60 md:text-sm">
              Returns, exchanges & order support
            </p>
          </div>
        </div>

        <Link
          href="/returns-exchanges"
          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-semibold uppercase tracking-wide text-black transition hover:bg-white/90 sm:w-auto"
        >
          Get Help
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}