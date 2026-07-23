// components/productDetail/DispatchTimeline.jsx

import { Clock3, Sparkles } from "lucide-react";

export default function DispatchTimeline({ isDispatchReady = false }) {
  if (isDispatchReady) {
    return (
      <div className="mt-3 flex items-start gap-2 border border-emerald-200 bg-emerald-50 px-3 py-2.5">
        <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />

        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-emerald-900">
            Dispatch within 24–48 hours
          </p>

          <p className="mt-0.5 text-[10px] leading-4 text-emerald-800/75">
            This piece is ready and will be packed for priority dispatch.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 flex items-start gap-2 border border-black/10 bg-neutral-50 px-3 py-2.5">
      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-black/60" />

      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-black">
          Specially curated for you
        </p>

        <p className="mt-0.5 text-[10px] leading-4 text-black/60">
          We will dispatch this piece within 7 days.
        </p>
      </div>
    </div>
  );
}