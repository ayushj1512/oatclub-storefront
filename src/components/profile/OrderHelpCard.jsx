"use client";

import Link from "next/link";
import { PackageSearch, ChevronRight } from "lucide-react";

export default function OrderHelpCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm">
      
      {/* HEADER (same as recent orders) */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <PackageSearch size={18} />
          Order Help
        </h3>

        <Link
          href="/profile/orders"
          className="text-sm text-black hover:underline flex items-center gap-1"
        >
          View all <ChevronRight size={14} />
        </Link>
      </div>

      {/* ROW STYLE (same as order row) */}
      <Link
        href="/profile/orders"
        className="p-3 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between hover:bg-white transition"
      >
        <div>
          <p className="font-medium text-gray-900 text-sm">
            Track or manage your orders
          </p>
          <p className="text-xs text-gray-500">
            View history, track deliveries, or request returns
          </p>
        </div>

        <ChevronRight size={16} className="text-gray-600" />
      </Link>
    </div>
  );
}