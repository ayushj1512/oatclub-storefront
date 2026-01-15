"use client";

import { Zap } from "lucide-react";

export default function LepordCollectionAnnouncement({ collections = [] }) {
  if (!Array.isArray(collections) || collections.length === 0) return null;

  const show = collections.some((c) => c?.slug === "leopard-energy");
  if (!show) return null;

  return (
    <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 md:px-4 md:py-3">
      <div className="flex items-center gap-2">
        <Zap size={16} className="text-amber-700 flex-shrink-0" />

        <p className="text-[12px] md:text-sm leading-snug text-amber-900">
          This is a hot-selling item, so dispatch may take <b>5–7 days</b>. Your
          order will be delivered with the quality, care, and reliability that
          define <b>Miray’s promise</b>.
        </p>
      </div>
    </div>
  );
}
