"use client";

import { Heart, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

const items = [
  "IT'S OUR FOUNDER'S BIRTHDAY SALE! 🎀",
  "WISH OUR FOUNDER & GET 20% OFF 💌",
  "BIRTHDAY TREATS ARE LIVE TILL 4 OCTOBER ✨",
];

export default function TopbarHeadline({ interval = 3200 }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setActive((current) => (current + 1) % items.length),
      interval
    );

    return () => clearInterval(timer);
  }, [interval]);

  return (
    <div className="relative w-full overflow-hidden border-b border-white/10 bg-black text-pink-300">
      <div className="pointer-events-none absolute -left-8 top-0 h-16 w-16 rounded-full bg-pink-500/10 blur-xl" />
      <div className="pointer-events-none absolute -right-8 top-0 h-16 w-16 rounded-full bg-pink-500/10 blur-xl" />

      <div className="relative flex h-9 items-center justify-center gap-2 px-3 md:h-10">
        <Heart className="h-3 w-3 shrink-0 fill-pink-400 text-pink-400" />

        <span
          key={active}
          className="topbar-copy max-w-[78vw] truncate text-center text-[10px] font-bold uppercase tracking-[0.09em] sm:text-[11px] md:max-w-none md:tracking-[0.16em]"
        >
          {items[active]}
        </span>

        <Sparkles className="h-3 w-3 shrink-0 text-pink-400" />
      </div>

      <span
        key={`bar-${active}`}
        className="topbar-progress absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-pink-300 via-fuchsia-500 to-rose-400"
        style={{ animationDuration: `${interval}ms` }}
      />

      <style jsx>{`
        .topbar-copy {
          animation: topbar-copy 400ms ease both;
        }

        .topbar-progress {
          animation-name: topbar-progress;
          animation-timing-function: linear;
          animation-fill-mode: both;
        }

        @keyframes topbar-copy {
          from {
            opacity: 0;
            transform: translateY(6px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
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

        @media (prefers-reduced-motion: reduce) {
          .topbar-copy,
          .topbar-progress {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
