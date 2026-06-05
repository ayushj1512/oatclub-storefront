"use client";

import { ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function TopbarHeadline({ interval = 3200 }) {
  const items = useMemo(
    () => [
      "CURATED DROPS. LIMITED RUNS. EVERYDAY LUXE.",
      "FIRST ORDER PRIVILEGE: 10% OFF WITH FIRST10",
      "PRIVATE EDIT: RS. 500 OFF ABOVE RS. 2499",
      "QUALITY CHECKED PIECES, PACKED WITH CARE",
    ],
    []
  );

  const [active, setActive] = useState(0);

  useEffect(() => {
    if (items.length < 2) return;
    const timer = setInterval(
      () => setActive((current) => (current + 1) % items.length),
      interval
    );
    return () => clearInterval(timer);
  }, [items.length, interval]);

  return (
    <div className="relative w-full overflow-hidden border-b border-white/10 bg-black text-white">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black to-transparent" />

      <div className="relative flex h-8 items-center justify-center gap-3 px-3 md:h-9">
        <div className="flex min-w-0 items-center gap-2">
          <span className="h-px w-4 bg-white/30 md:w-6" />
          <span
            key={active}
            className="topbar-copy max-w-[76vw] truncate text-center text-[9px] font-black uppercase tracking-[0.18em] md:max-w-none md:text-[10px] md:tracking-[0.24em]"
          >
            {items[active]}
          </span>
          <ArrowRight className="h-3 w-3 shrink-0 text-white/60" />
        </div>
      </div>

      <span key={`bar-${active}`} className="topbar-progress absolute bottom-0 left-0 h-px bg-white" />

      <style jsx>{`
        .topbar-copy {
          animation: topbar-copy 360ms ease both;
        }

        .topbar-progress {
          animation: topbar-progress ${interval}ms linear both;
        }

        @keyframes topbar-copy {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes topbar-progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
